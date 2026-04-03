"""Team Orchestrator — coordinates parallel execution via TeamRuntime.

Wraps the OrchestratorAgent to fan-out independent tasks to the team runtime,
collect results, and merge them into a unified response.

Usage:
    orchestrator = TeamOrchestrator()
    result = await orchestrator.run_team(
        tasks=["Analyse API routes", "Check type coverage", "Review database schema"],
        context={"project": "node-js-starter"},
    )
"""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from src.utils import get_logger

from .runtime import TeamRuntime
from .state import TaskLifecycle

logger = get_logger(__name__)

_DEFAULT_WORKER_NAMES = [
    "alpha",
    "beta",
    "gamma",
    "delta",
    "epsilon",
]


class TeamOrchestrator:
    """Runs a set of independent tasks in parallel via the TeamRuntime.

    Each task is submitted to the runtime queue and dispatched to a simulated
    worker that executes it asynchronously. Results are aggregated once all
    tasks complete or the timeout expires.
    """

    def __init__(
        self,
        max_parallel: int = 3,
        heartbeat_timeout: float = 30.0,
        task_timeout: float = 300.0,
    ) -> None:
        """Initialise the team orchestrator.

        Args:
            max_parallel: Maximum tasks running concurrently.
            heartbeat_timeout: Seconds before a worker is considered dead.
            task_timeout: Maximum seconds per individual task.
        """
        self.max_parallel = max_parallel
        self.heartbeat_timeout = heartbeat_timeout
        self.task_timeout = task_timeout

    async def run_team(
        self,
        tasks: list[str],
        *,
        context: dict[str, Any] | None = None,
        executor: Any | None = None,
    ) -> dict[str, Any]:
        """Execute multiple tasks in parallel and return merged results.

        Args:
            tasks: List of task descriptions to execute concurrently.
            context: Shared context passed to each task executor.
            executor: Optional callable ``async (description, context) -> Any``.
                      Defaults to a pass-through stub if not provided.

        Returns:
            Dict with ``results`` (list of per-task outcomes) and ``summary``.
        """
        runtime = TeamRuntime(
            heartbeat_timeout=self.heartbeat_timeout,
            max_parallel=self.max_parallel,
        )

        # Register workers
        workers = []
        for i, name in enumerate(_DEFAULT_WORKER_NAMES[: self.max_parallel]):
            w = runtime.register_worker(name, capabilities=["general"])
            workers.append(w)

        # Submit tasks
        task_ids = []
        for description in tasks:
            tid = runtime.submit_task(description, priority=5)
            task_ids.append(tid)

        # Run executor coroutines in parallel
        exec_fn = executor or _default_executor
        coros = [
            self._execute_task(runtime, task_id, exec_fn, context or {}, worker)
            for task_id, worker in zip(task_ids, workers * len(task_ids))
        ]

        await asyncio.gather(*coros, return_exceptions=True)

        # Collect results
        results = []
        for tid in task_ids:
            task = runtime.state.tasks.get(tid)
            if task is None:
                continue
            results.append(
                {
                    "task_id": tid,
                    "description": task.description,
                    "status": task.lifecycle.value,
                    "result": task.result,
                    "error": task.error,
                }
            )

        status = runtime.get_status()
        logger.info(
            "Team run complete",
            total=len(tasks),
            completed=status["tasks"]["completed"],
            failed=status["tasks"]["failed"],
        )

        return {
            "results": results,
            "summary": status["tasks"],
        }

    async def _execute_task(
        self,
        runtime: TeamRuntime,
        task_id: str,
        executor: Any,
        context: dict[str, Any],
        worker: Any,
    ) -> None:
        """Claim, start, execute and complete/fail a single task.

        Args:
            runtime: The team runtime.
            task_id: ID of the task to execute.
            executor: Async callable to run the task.
            context: Shared context dict.
            worker: Worker that will claim the task.
        """
        claim_result = runtime.claim_task(worker.id)
        if claim_result is None:
            logger.warning("No task to claim", worker_id=worker.id)
            return

        task, token = claim_result
        if task.id != task_id:
            # Another task was claimed — not ideal in this simple impl
            logger.debug("Worker claimed different task", claimed=task.id, expected=task_id)
            return

        runtime.start_task(task_id, token)

        try:
            result = await asyncio.wait_for(
                executor(task.description, context),
                timeout=self.task_timeout,
            )
            runtime.complete_task(task_id, token, result)
        except asyncio.TimeoutError:
            runtime.fail_task(task_id, token, f"Task timed out after {self.task_timeout}s")
        except Exception as exc:
            runtime.fail_task(task_id, token, str(exc))


async def _default_executor(description: str, context: dict[str, Any]) -> dict[str, Any]:
    """Stub executor — returns the task description as its result.

    Replace with a real agent executor in production.

    Args:
        description: Task description.
        context: Shared context.

    Returns:
        Simple echo result.
    """
    await asyncio.sleep(0)  # yield to event loop
    return {"description": description, "status": "stub_complete"}
