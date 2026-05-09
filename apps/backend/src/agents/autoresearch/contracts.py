"""Autoresearch contracts — interfaces for the research planning and execution pipeline.

Defines the data models that flow through the autoresearch runtime:
    ResearchPlan → ResearchTask → ResearchResult → ResearchSynthesis
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ResearchStrategy(str, Enum):
    """Strategy for conducting research."""

    WEB_SEARCH = "web_search"
    RAG_RETRIEVAL = "rag_retrieval"
    CODE_SEARCH = "code_search"
    DOCUMENT_SCAN = "document_scan"
    COMBINED = "combined"


class ResearchTask(BaseModel):
    """A single atomic research sub-task.

    Produced during the planning phase and executed in parallel.
    """

    id: str
    query: str
    strategy: ResearchStrategy
    priority: int = 5
    max_results: int = 10
    metadata: dict[str, Any] = Field(default_factory=dict)


class ResearchPlan(BaseModel):
    """A plan decomposing a research question into parallel sub-tasks.

    Created by the planner before execution begins.
    """

    topic: str
    objective: str
    tasks: list[ResearchTask]
    estimated_duration_seconds: float = 60.0
    requires_synthesis: bool = True


class ResearchResult(BaseModel):
    """The result of a single research task."""

    task_id: str
    query: str
    strategy: ResearchStrategy
    success: bool
    findings: list[dict[str, Any]] = Field(default_factory=list)
    error: str | None = None
    sources: list[str] = Field(default_factory=list)
    confidence: float = 0.0  # 0–1


class ResearchSynthesis(BaseModel):
    """Aggregated synthesis of all research results.

    Produced by the synthesis phase after all tasks complete.
    """

    topic: str
    objective: str
    key_findings: list[str]
    sources: list[str]
    confidence: float  # overall confidence 0–1
    gaps: list[str] = Field(default_factory=list)  # areas with insufficient data
    raw_results: list[ResearchResult] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
