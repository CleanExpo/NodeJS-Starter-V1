"""Team API routes — parallel agent execution via TeamRuntime.

Provides endpoints to submit, monitor, and collect results from
team-based parallel task execution.

Routes:
    POST   /api/team/run         — Submit a set of tasks for parallel execution
    GET    /api/team/status      — Get current runtime status
    GET    /api/team/results     — Collect completed task results
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.agents.team import TeamOrchestrator
from src.utils import get_logger

router = APIRouter(prefix="/api/team", tags=["team"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class TeamRunRequest(BaseModel):
    """Request body for running a set of tasks in parallel."""

    tasks: list[str] = Field(..., min_length=1, description="Task descriptions to execute in parallel.")
    max_parallel: int = Field(default=3, ge=1, le=10, description="Maximum concurrent task executions.")
    task_timeout: float = Field(default=120.0, ge=5.0, description="Per-task timeout in seconds.")
    context: dict[str, Any] = Field(default_factory=dict, description="Shared context passed to each task.")


class TeamRunResponse(BaseModel):
    """Response from a team run."""

    results: list[dict[str, Any]]
    summary: dict[str, int]
    total_tasks: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/run", response_model=TeamRunResponse)
async def run_team(request: TeamRunRequest) -> TeamRunResponse:
    """Execute multiple tasks in parallel using the team runtime.

    Args:
        request: Tasks and execution configuration.

    Returns:
        TeamRunResponse with per-task results and summary statistics.
    """
    if not request.tasks:
        raise HTTPException(status_code=400, detail="At least one task is required.")

    logger.info(
        "Team run started",
        task_count=len(request.tasks),
        max_parallel=request.max_parallel,
    )

    orchestrator = TeamOrchestrator(
        max_parallel=request.max_parallel,
        task_timeout=request.task_timeout,
    )

    outcome = await orchestrator.run_team(
        request.tasks,
        context=request.context,
    )

    return TeamRunResponse(
        results=outcome["results"],
        summary=outcome["summary"],
        total_tasks=len(request.tasks),
    )
