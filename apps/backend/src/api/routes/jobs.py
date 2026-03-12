"""Background job queue API routes."""

from fastapi import APIRouter
from pydantic import BaseModel

from src.utils import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobRequest(BaseModel):
    """Request to enqueue a background job."""

    task_id: str
    agent_type: str
    priority: int = 0


class JobResponse(BaseModel):
    """Response after enqueueing a job."""

    job_id: str
    status: str = "queued"


@router.post("/enqueue", response_model=JobResponse)
async def enqueue_job(request: JobRequest) -> JobResponse:
    """Enqueue a background job for processing.

    Note: This is a scaffold endpoint. In production, connect to
    the arq Redis pool to actually enqueue jobs.
    """
    logger.info(
        "Job enqueue requested",
        task_id=request.task_id,
        agent_type=request.agent_type,
    )

    # TODO: Connect to arq pool and enqueue
    # pool = await get_redis_pool()
    # job = await pool.enqueue_job('process_agent_task', request.task_id, request.agent_type)

    return JobResponse(
        job_id=f"job_{request.task_id}",
        status="queued",
    )


@router.get("/status/{job_id}")
async def get_job_status(job_id: str) -> dict:
    """Get the status of a background job.

    Note: This is a scaffold endpoint. In production, query arq
    for actual job status.
    """
    # TODO: Query arq for real job status
    return {"job_id": job_id, "status": "unknown", "message": "Job status tracking not yet implemented"}
