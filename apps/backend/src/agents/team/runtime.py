"""Team Runtime — parallel agent execution with claim-safe task coordination.

Inspired by oh-my-codex team/runtime.ts. Enables multiple agents to work on
independent tasks concurrently with:

- Claim-safe task lifecycle (pending → claimed → running → completed/failed)
- Heartbeat monitoring with automatic reclamation of stalled tasks
- Worker-to-worker messaging via per-task mailboxes
- Priority-ordered task dispatch
- Graceful shutdown with configurable drain period

Usage:
    runtime = TeamRuntime()
    runtime.register_worker("worker-1", capabilities=["backend", "api"])
    task_id = runtime.submit_task("Implement /api/users endpoint", priority=3)
    await runtime.run()
    results = runtime.collect_results()
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

from src.utils import get_logger

from .state import TaskLifecycle, TeamState, TeamTask, Worker

logger = get_logger(__name__)

# How long a task can stay CLAIMED without moving to RUNNING before reclaim
_CLAIM_TIMEOUT_SECONDS = 60.0
# How long a task can stay RUNNING without a heartbeat before reclaim
_RUN_TIMEOUT_SECONDS = 300.0
# Interval between reclaim sweeps
_RECLAIM_INTERVAL_SECONDS = 15.0


class TeamRuntime:
    """Coordinates parallel execution of tasks across multiple workers.

    Workers call claim_task() to atomically claim the next available task,
    then use the returned claim_token to update progress and report completion.

    The runtime periodically sweeps for dead workers and reclaims their tasks
    so work is never permanently blocked by a crashed agent.
    """

    def __init__(
        self,
        heartbeat_timeout: float = 30.0,
        reclaim_interval: float = _RECLAIM_INTERVAL_SECONDS,
        max_parallel: int = 5,
    ) -> None:
        """Initialise the team runtime.

        Args:
            heartbeat_timeout: Seconds without heartbeat before a worker is dead.
            reclaim_interval: How often to sweep for dead workers (seconds).
            max_parallel: Maximum concurrent task executions.
        """
        self.state = TeamState()
        self.heartbeat_timeout = heartbeat_timeout
        self.reclaim_interval = reclaim_interval
        self.max_parallel = max_parallel
        self._shutdown = False
        self._semaphore = asyncio.Semaphore(max_parallel)

    # ------------------------------------------------------------------
    # Worker registration
    # ------------------------------------------------------------------

    def register_worker(
        self,
        name: str,
        *,
        capabilities: list[str] | None = None,
    ) -> Worker:
        """Register a new worker with the runtime.

        Args:
            name: Human-readable worker name.
            capabilities: Capability tags (e.g. ["backend", "database"]).

        Returns:
            The registered Worker instance.
        """
        worker = Worker(name=name, capabilities=capabilities or [])
        self.state.workers[worker.id] = worker
        logger.info("Worker registered", worker_id=worker.id, name=name)
        return worker

    def heartbeat(self, worker_id: str) -> bool:
        """Record a heartbeat for a worker.

        Args:
            worker_id: ID of the worker sending the heartbeat.

        Returns:
            True if the worker was found, False otherwise.
        """
        worker = self.state.workers.get(worker_id)
        if worker is None:
            return False
        worker.beat()
        return True

    # ------------------------------------------------------------------
    # Task submission
    # ------------------------------------------------------------------

    def submit_task(
        self,
        description: str,
        *,
        priority: int = 5,
        depends_on: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Submit a task to the queue.

        Args:
            description: Human-readable task description.
            priority: Priority (1 = highest, 10 = lowest).
            depends_on: Task IDs that must complete before this one starts.
            metadata: Arbitrary metadata attached to the task.

        Returns:
            Task ID.
        """
        task = TeamTask(
            description=description,
            priority=priority,
            depends_on=depends_on or [],
            metadata=metadata or {},
        )
        self.state.add_task(task)
        logger.info("Task submitted", task_id=task.id, priority=priority)
        return task.id

    # ------------------------------------------------------------------
    # Claim-safe task dispatch
    # ------------------------------------------------------------------

    def claim_task(self, worker_id: str) -> tuple[TeamTask, str] | None:
        """Atomically claim the next available task for a worker.

        Args:
            worker_id: ID of the requesting worker.

        Returns:
            Tuple of (task, claim_token) or None if no task is available.
        """
        worker = self.state.workers.get(worker_id)
        if worker is None:
            logger.warning("Unknown worker attempted task claim", worker_id=worker_id)
            return None

        task = self.state.next_pending(worker.capabilities)
        if task is None:
            return None

        token = task.claim(worker_id)
        logger.info(
            "Task claimed",
            task_id=task.id,
            worker_id=worker_id,
        )
        return task, token

    def start_task(self, task_id: str, claim_token: str) -> bool:
        """Transition a claimed task to running.

        Args:
            task_id: ID of the task.
            claim_token: Token from claim_task().

        Returns:
            True on success, False if the token was invalid.
        """
        task = self.state.tasks.get(task_id)
        if task is None:
            return False
        return task.start(claim_token)

    def complete_task(self, task_id: str, claim_token: str, result: Any) -> bool:
        """Mark a task as completed.

        Args:
            task_id: ID of the task.
            claim_token: Token from claim_task().
            result: Result payload.

        Returns:
            True on success.
        """
        task = self.state.tasks.get(task_id)
        if task is None:
            return False
        success = task.complete(claim_token, result)
        if success:
            worker = self.state.workers.get(task.claimed_by or "")
            if worker:
                worker.tasks_completed += 1
                worker.status = __import__("src.agents.team.state", fromlist=["WorkerStatus"]).WorkerStatus.IDLE
                worker.current_task_id = None
            self.state.completed_results.append(
                {"task_id": task_id, "result": result}
            )
            logger.info("Task completed", task_id=task_id)
        return success

    def fail_task(self, task_id: str, claim_token: str, error: str) -> bool:
        """Mark a task as failed.

        Args:
            task_id: ID of the task.
            claim_token: Token from claim_task().
            error: Error description.

        Returns:
            True on success.
        """
        task = self.state.tasks.get(task_id)
        if task is None:
            return False
        success = task.fail(claim_token, error)
        if success:
            worker = self.state.workers.get(task.claimed_by or "")
            if worker:
                worker.tasks_failed += 1
            logger.warning("Task failed", task_id=task_id, error=error)
        return success

    # ------------------------------------------------------------------
    # Mailbox (worker-to-worker messaging)
    # ------------------------------------------------------------------

    def send_message(self, task_id: str, message: dict[str, Any]) -> bool:
        """Post a message to a task's mailbox.

        Args:
            task_id: Target task ID.
            message: Message payload.

        Returns:
            True if the task was found.
        """
        task = self.state.tasks.get(task_id)
        if task is None:
            return False
        message.setdefault("sent_at", time.time())
        task.mailbox.append(message)
        return True

    def read_mailbox(self, task_id: str) -> list[dict[str, Any]]:
        """Read and drain the mailbox for a task.

        Args:
            task_id: Task whose mailbox to drain.

        Returns:
            Messages that were in the mailbox.
        """
        task = self.state.tasks.get(task_id)
        if task is None:
            return []
        messages = list(task.mailbox)
        task.mailbox.clear()
        return messages

    # ------------------------------------------------------------------
    # Runtime loop
    # ------------------------------------------------------------------

    async def run(self, timeout: float | None = None) -> None:
        """Run the reclaim sweep loop until shutdown or timeout.

        Args:
            timeout: Optional max runtime in seconds.
        """
        logger.info("TeamRuntime started", max_parallel=self.max_parallel)
        start = time.monotonic()
        while not self._shutdown:
            await self._reclaim_sweep()
            if timeout and (time.monotonic() - start) >= timeout:
                break
            await asyncio.sleep(self.reclaim_interval)
        logger.info("TeamRuntime stopped")

    def shutdown(self) -> None:
        """Signal the runtime to stop accepting new tasks."""
        self._shutdown = True

    # ------------------------------------------------------------------
    # Status & results
    # ------------------------------------------------------------------

    def get_status(self) -> dict[str, Any]:
        """Return a summary of current runtime state."""
        tasks = list(self.state.tasks.values())
        return {
            "tasks": {
                "total": len(tasks),
                "pending": sum(1 for t in tasks if t.lifecycle == TaskLifecycle.PENDING),
                "running": sum(1 for t in tasks if t.lifecycle == TaskLifecycle.RUNNING),
                "completed": sum(1 for t in tasks if t.lifecycle == TaskLifecycle.COMPLETED),
                "failed": sum(1 for t in tasks if t.lifecycle == TaskLifecycle.FAILED),
            },
            "workers": {
                wid: {
                    "name": w.name,
                    "status": w.status,
                    "alive": w.is_alive(self.heartbeat_timeout),
                    "tasks_completed": w.tasks_completed,
                    "tasks_failed": w.tasks_failed,
                }
                for wid, w in self.state.workers.items()
            },
        }

    def collect_results(self) -> list[dict[str, Any]]:
        """Return all completed task results."""
        return list(self.state.completed_results)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    async def _reclaim_sweep(self) -> None:
        """Reclaim tasks from dead workers."""
        reclaimed = self.state.reclaim_stale_tasks(self.heartbeat_timeout)
        if reclaimed:
            logger.warning(
                "Tasks reclaimed from dead workers",
                count=len(reclaimed),
                task_ids=reclaimed,
            )
