"""Example background worker for agent task processing."""

import logging

logger = logging.getLogger(__name__)


async def process_agent_task(ctx: dict, task_id: str, agent_type: str) -> dict:
    """Process an agent task in the background.

    Args:
        ctx: Worker context (includes Redis connection).
        task_id: Unique identifier for the task.
        agent_type: Type of agent to process the task.

    Returns:
        Dict with task result.
    """
    logger.info("Processing agent task", extra={"task_id": task_id, "agent_type": agent_type})

    # TODO: Implement actual agent task processing
    # This is a scaffold — replace with real agent invocation

    return {"task_id": task_id, "status": "completed", "agent_type": agent_type}


class WorkerSettings:
    """arq worker settings."""

    functions = [process_agent_task]

    # Optional: scheduled tasks
    # cron_jobs = [cron(cleanup_old_tasks, hour=2, minute=0)]

    # Redis connection
    redis_settings = None  # Set from REDIS_SETTINGS at runtime
