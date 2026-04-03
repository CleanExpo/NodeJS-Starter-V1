"""Autoresearch package — autonomous information gathering for agents.

Usage:
    from src.agents.autoresearch import AutoresearchRuntime, ResearchSynthesis

    runtime = AutoresearchRuntime()
    synthesis = await runtime.research("FastAPI streaming", objective="How to implement SSE?")
"""

from .contracts import (
    ResearchPlan,
    ResearchResult,
    ResearchStrategy,
    ResearchSynthesis,
    ResearchTask,
)
from .runtime import AutoresearchRuntime

__all__ = [
    "AutoresearchRuntime",
    "ResearchPlan",
    "ResearchResult",
    "ResearchStrategy",
    "ResearchSynthesis",
    "ResearchTask",
]
