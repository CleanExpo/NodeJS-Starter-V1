"""Team state models — claim-safe task lifecycle and worker tracking.

Implements the OMX-inspired claim-safe task lifecycle:
    pending → claimed → running → completed | failed | reclaimed

Workers register heartbeats and the runtime reclaims tasks from dead workers.
"""

from __future__ import annotations

import time
import uuid
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TaskLifecycle(str, Enum):
    """Lifecycle states for a team task."""

    PENDING = "pending"
    CLAIMED = "claimed"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RECLAIMED = "reclaimed"


class WorkerStatus(str, Enum):
    """Status of a team worker."""

    IDLE = "idle"
    BUSY = "busy"
    DEAD = "dead"


class TeamTask(BaseModel):
    """A task within the team execution runtime.

    Claim tokens prevent race conditions: a worker must present its
    assigned claim_token when updating task status.
    """

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    lifecycle: TaskLifecycle = TaskLifecycle.PENDING
    claim_token: str | None = None
    claimed_by: str | None = None
    claimed_at: float | None = None
    started_at: float | None = None
    completed_at: float | None = None
    result: Any = None
    error: str | None = None
    priority: int = 5  # 1 = highest, 10 = lowest
    depends_on: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Mailbox: messages from other workers
    mailbox: list[dict[str, Any]] = Field(default_factory=list)

    def claim(self, worker_id: str) -> str:
        """Mark this task as claimed by a worker.

        Args:
            worker_id: ID of the claiming worker.

        Returns:
            Unique claim token the worker must present to update status.
        """
        token = str(uuid.uuid4())
        self.lifecycle = TaskLifecycle.CLAIMED
        self.claim_token = token
        self.claimed_by = worker_id
        self.claimed_at = time.monotonic()
        return token

    def start(self, claim_token: str) -> bool:
        """Transition from claimed to running.

        Args:
            claim_token: Token issued during claim().

        Returns:
            True if the transition succeeded, False if the token was invalid.
        """
        if self.claim_token != claim_token:
            return False
        self.lifecycle = TaskLifecycle.RUNNING
        self.started_at = time.monotonic()
        return True

    def complete(self, claim_token: str, result: Any) -> bool:
        """Mark the task as completed.

        Args:
            claim_token: Token issued during claim().
            result: Task result payload.

        Returns:
            True if the transition succeeded.
        """
        if self.claim_token != claim_token:
            return False
        self.lifecycle = TaskLifecycle.COMPLETED
        self.result = result
        self.completed_at = time.monotonic()
        self.claim_token = None
        return True

    def fail(self, claim_token: str, error: str) -> bool:
        """Mark the task as failed.

        Args:
            claim_token: Token issued during claim().
            error: Error description.

        Returns:
            True if the transition succeeded.
        """
        if self.claim_token != claim_token:
            return False
        self.lifecycle = TaskLifecycle.FAILED
        self.error = error
        self.completed_at = time.monotonic()
        self.claim_token = None
        return True

    def reclaim(self) -> None:
        """Reset to pending after worker death so another worker can claim it."""
        self.lifecycle = TaskLifecycle.RECLAIMED
        self.claim_token = None
        self.claimed_by = None
        self.claimed_at = None
        self.started_at = None
        self.error = "reclaimed after worker heartbeat timeout"


class Worker(BaseModel):
    """A registered worker in the team runtime."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    capabilities: list[str] = Field(default_factory=list)
    status: WorkerStatus = WorkerStatus.IDLE
    current_task_id: str | None = None
    last_heartbeat: float = Field(default_factory=time.monotonic)
    tasks_completed: int = 0
    tasks_failed: int = 0

    def beat(self) -> None:
        """Record a heartbeat."""
        self.last_heartbeat = time.monotonic()

    def is_alive(self, timeout_seconds: float = 30.0) -> bool:
        """Return True if this worker sent a heartbeat within the timeout.

        Args:
            timeout_seconds: Maximum seconds since last heartbeat.
        """
        return (time.monotonic() - self.last_heartbeat) < timeout_seconds


class TeamState(BaseModel):
    """Full state of the team runtime.

    Persisted in-memory; can be serialised for checkpointing.
    """

    tasks: dict[str, TeamTask] = Field(default_factory=dict)
    workers: dict[str, Worker] = Field(default_factory=dict)
    completed_results: list[dict[str, Any]] = Field(default_factory=list)

    def add_task(self, task: TeamTask) -> None:
        """Register a new task."""
        self.tasks[task.id] = task

    def next_pending(self, worker_capabilities: list[str]) -> TeamTask | None:
        """Find the highest-priority pending task the worker can handle.

        Args:
            worker_capabilities: Capability tags of the requesting worker.

        Returns:
            The best matching pending task, or None.
        """
        candidates = [
            t for t in self.tasks.values()
            if t.lifecycle == TaskLifecycle.PENDING
            and all(dep in self._completed_ids() for dep in t.depends_on)
        ]
        if not candidates:
            return None
        return min(candidates, key=lambda t: t.priority)

    def _completed_ids(self) -> set[str]:
        return {
            tid for tid, t in self.tasks.items()
            if t.lifecycle == TaskLifecycle.COMPLETED
        }

    def reclaim_stale_tasks(self, heartbeat_timeout: float = 30.0) -> list[str]:
        """Reclaim tasks held by dead workers.

        Args:
            heartbeat_timeout: Seconds without heartbeat before a worker is considered dead.

        Returns:
            IDs of tasks that were reclaimed.
        """
        dead_workers = {
            wid for wid, w in self.workers.items()
            if not w.is_alive(heartbeat_timeout)
        }
        reclaimed: list[str] = []
        for task in self.tasks.values():
            if (
                task.lifecycle in (TaskLifecycle.CLAIMED, TaskLifecycle.RUNNING)
                and task.claimed_by in dead_workers
            ):
                task.reclaim()
                reclaimed.append(task.id)
        return reclaimed
