"""Research API routes — autonomous information gathering.

Provides an endpoint to trigger autoresearch on a topic and receive
a synthesised summary with key findings and confidence scores.

Routes:
    POST   /api/research         — Run autoresearch on a topic
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from src.agents.autoresearch import AutoresearchRuntime, ResearchStrategy, ResearchSynthesis
from src.utils import get_logger

router = APIRouter(prefix="/api/research", tags=["research"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ResearchRequest(BaseModel):
    """Request body for an autoresearch run."""

    topic: str = Field(..., min_length=3, description="Subject to research.")
    objective: str | None = Field(default=None, description="Specific question to answer.")
    strategies: list[str] | None = Field(
        default=None,
        description="Research strategies: web_search, rag_retrieval, code_search, document_scan.",
    )
    project_root: str = Field(
        default=".",
        description="Project root for code_search strategy.",
    )


class ResearchResponse(BaseModel):
    """Response from an autoresearch run."""

    topic: str
    objective: str
    key_findings: list[str]
    sources: list[str]
    confidence: float
    gaps: list[str]
    tasks_completed: int
    tasks_failed: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/", response_model=ResearchResponse)
async def run_research(request: ResearchRequest) -> ResearchResponse:
    """Conduct autonomous research and return synthesised findings.

    Args:
        request: Research topic, objective, and configuration.

    Returns:
        ResearchResponse with key findings, sources, and confidence score.
    """
    logger.info("Autoresearch started", topic=request.topic)

    strategies = None
    if request.strategies:
        strategies = [ResearchStrategy(s) for s in request.strategies]

    runtime = AutoresearchRuntime()
    synthesis: ResearchSynthesis = await runtime.research(
        request.topic,
        objective=request.objective,
        strategies=strategies,
        context={"project_root": request.project_root},
    )

    tasks_completed = sum(1 for r in synthesis.raw_results if r.success)
    tasks_failed = len(synthesis.raw_results) - tasks_completed

    return ResearchResponse(
        topic=synthesis.topic,
        objective=synthesis.objective,
        key_findings=synthesis.key_findings,
        sources=synthesis.sources,
        confidence=synthesis.confidence,
        gaps=synthesis.gaps,
        tasks_completed=tasks_completed,
        tasks_failed=tasks_failed,
    )
