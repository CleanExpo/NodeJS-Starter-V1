"""Team execution package — parallel agent coordination.

Provides claim-safe task distribution, heartbeat monitoring, and
worker-to-worker messaging for parallel multi-agent workflows.

Usage:
    from src.agents.team import TeamRuntime, TeamOrchestrator, TeamTask, TeamState

    orchestrator = TeamOrchestrator(max_parallel=3)
    result = await orchestrator.run_team(["Task A", "Task B", "Task C"])
"""

from .orchestrator import TeamOrchestrator
from .runtime import TeamRuntime
from .state import (
    TaskLifecycle,
    TeamState,
    TeamTask,
    Worker,
    WorkerStatus,
)

__all__ = [
    "TaskLifecycle",
    "TeamOrchestrator",
    "TeamRuntime",
    "TeamState",
    "TeamTask",
    "Worker",
    "WorkerStatus",
]
