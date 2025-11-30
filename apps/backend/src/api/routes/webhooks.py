"""Webhook routes for external integrations."""

from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from src.utils import get_logger

router = APIRouter()
logger = get_logger(__name__)


class WebhookPayload(BaseModel):
    """Webhook payload model."""

    event: str
    data: dict[str, Any]


class WebhookResponse(BaseModel):
    """Webhook response model."""

    received: bool
    event: str


@router.post("/webhooks", response_model=WebhookResponse)
async def handle_webhook(
    request: Request,
    payload: WebhookPayload,
) -> WebhookResponse:
    """Handle incoming webhooks."""
    try:
        logger.info("Received webhook", event=payload.event)

        # Process different webhook events
        match payload.event:
            case "task.completed":
                await _handle_task_completed(payload.data)
            case "task.failed":
                await _handle_task_failed(payload.data)
            case "agent.status":
                await _handle_agent_status(payload.data)
            case _:
                logger.warning("Unknown webhook event", event=payload.event)

        return WebhookResponse(received=True, event=payload.event)

    except Exception as e:
        logger.error("Webhook processing error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


async def _handle_task_completed(data: dict[str, Any]) -> None:
    """Handle task completed event."""
    logger.info("Task completed", task_id=data.get("task_id"))


async def _handle_task_failed(data: dict[str, Any]) -> None:
    """Handle task failed event."""
    logger.warning("Task failed", task_id=data.get("task_id"), error=data.get("error"))


async def _handle_agent_status(data: dict[str, Any]) -> None:
    """Handle agent status update."""
    logger.info("Agent status update", agent_id=data.get("agent_id"), status=data.get("status"))
