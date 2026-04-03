"""Monitor API — real-time agent status via WebSocket HUD.

Provides a WebSocket endpoint that pushes live agent metrics to the
frontend HUD dashboard at a configurable refresh interval.

Routes:
    GET    /api/monitor/status   — Current agent status snapshot (HTTP)
    WS     /api/monitor/live     — Live agent metrics stream (WebSocket)
"""

import asyncio
import time
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from src.utils import get_logger

router = APIRouter(prefix="/api/monitor", tags=["Monitor"])
logger = get_logger(__name__)

# In-memory metrics store (replace with Redis for multi-instance deployments)
_agent_metrics: dict[str, dict[str, Any]] = {}
_active_connections: list[WebSocket] = []


# ---------------------------------------------------------------------------
# Metrics models
# ---------------------------------------------------------------------------


class AgentMetrics(BaseModel):
    """Snapshot of agent activity metrics."""

    agent_id: str
    agent_name: str
    status: str  # "idle" | "working" | "completed" | "failed"
    current_task: str | None = None
    tasks_completed: int = 0
    tasks_failed: int = 0
    token_usage: int = 0
    last_activity: float = 0.0


class SystemSnapshot(BaseModel):
    """Full system snapshot for the HUD."""

    agents: list[AgentMetrics]
    pending_tasks: int
    active_tasks: int
    completed_tasks: int
    uptime_seconds: float
    timestamp: float


_start_time = time.monotonic()


# ---------------------------------------------------------------------------
# Metrics API
# ---------------------------------------------------------------------------


def record_agent_metric(
    agent_id: str,
    *,
    agent_name: str,
    status: str,
    current_task: str | None = None,
    token_delta: int = 0,
    increment_completed: bool = False,
    increment_failed: bool = False,
) -> None:
    """Record or update metrics for an agent.

    Call this from agent execution code to feed the HUD dashboard.

    Args:
        agent_id: Unique agent identifier.
        agent_name: Human-readable agent name.
        status: Current status ("idle", "working", "completed", "failed").
        current_task: Description of the current task, if any.
        token_delta: Tokens consumed since last update.
        increment_completed: Increment the completed counter.
        increment_failed: Increment the failed counter.
    """
    existing = _agent_metrics.get(agent_id, {})
    _agent_metrics[agent_id] = {
        "agent_id": agent_id,
        "agent_name": agent_name,
        "status": status,
        "current_task": current_task,
        "tasks_completed": existing.get("tasks_completed", 0) + (1 if increment_completed else 0),
        "tasks_failed": existing.get("tasks_failed", 0) + (1 if increment_failed else 0),
        "token_usage": existing.get("token_usage", 0) + token_delta,
        "last_activity": time.time(),
    }


def _build_snapshot() -> SystemSnapshot:
    """Build the current system snapshot."""
    agents = [AgentMetrics(**m) for m in _agent_metrics.values()]
    active = sum(1 for a in agents if a.status == "working")
    completed = sum(a.tasks_completed for a in agents)

    return SystemSnapshot(
        agents=agents,
        pending_tasks=0,  # Integrate with TeamRuntime for real counts
        active_tasks=active,
        completed_tasks=completed,
        uptime_seconds=time.monotonic() - _start_time,
        timestamp=time.time(),
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get("/status", response_model=SystemSnapshot)
async def get_status() -> SystemSnapshot:
    """Return the current agent status snapshot.

    Returns:
        SystemSnapshot with all agent metrics.
    """
    return _build_snapshot()


@router.websocket("/live")
async def live_monitor(websocket: WebSocket) -> None:
    """Stream live agent metrics over WebSocket.

    Pushes a SystemSnapshot every second. Clients receive JSON messages
    of shape: {"type": "snapshot", "data": SystemSnapshot}.

    Args:
        websocket: WebSocket connection.
    """
    await websocket.accept()
    _active_connections.append(websocket)
    logger.info("HUD client connected", total_clients=len(_active_connections))

    try:
        while True:
            snapshot = _build_snapshot()
            await websocket.send_json(
                {"type": "snapshot", "data": snapshot.model_dump()}
            )
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.warning("HUD WebSocket error", error=str(exc))
    finally:
        _active_connections.remove(websocket)
        logger.info("HUD client disconnected", remaining=len(_active_connections))
