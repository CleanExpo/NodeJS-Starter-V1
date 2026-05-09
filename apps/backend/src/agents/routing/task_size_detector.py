"""Task Size Detector — classify tasks as simple, moderate, or complex.

Inspired by oh-my-codex hooks/task-size-detector.ts. Analyses task descriptions
to estimate scope and recommend single-agent vs multi-agent team execution.

Usage:
    detector = TaskSizeDetector()
    assessment = detector.assess("Refactor the entire authentication module")
    print(assessment.size)          # "complex"
    print(assessment.use_team)      # True
    print(assessment.estimated_agents)  # 3
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


class TaskSize:
    """Task size constants."""

    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"


@dataclass
class SizeAssessment:
    """Result of task size analysis."""

    size: str
    """One of: simple, moderate, complex."""

    use_team: bool
    """True if a multi-agent team should be used."""

    estimated_agents: int
    """Suggested number of agents for parallel execution."""

    reasoning: list[str] = field(default_factory=list)
    """Factors that influenced the size decision."""

    estimated_files: int = 1
    """Rough estimate of files that will be touched."""


# ---------------------------------------------------------------------------
# Complexity signals
# ---------------------------------------------------------------------------

# Phrases indicating a large/complex task
_COMPLEX_PATTERNS = [
    r"\brefactor\b",
    r"\brewrite\b",
    r"\bmigrate\b",
    r"\boverhaul\b",
    r"\bentire\b",
    r"\ball\s+\w+\b",
    r"\barchitecture\b",
    r"\bmulti(?:-|\s)(?:step|phase|service|agent)\b",
    r"\bend.to.end\b",
    r"\bfull.?stack\b",
    r"\bbreaking.?change\b",
]

# Phrases indicating a small/simple task
_SIMPLE_PATTERNS = [
    r"\bfix\s+(?:a\s+)?(?:typo|bug|error|issue)\b",
    r"\badd\s+(?:a\s+)?(?:field|column|comment|log)\b",
    r"\brename\b",
    r"\bupdate\s+(?:a\s+)?(?:string|message|label|text)\b",
    r"\bsmall\b",
    r"\bminor\b",
    r"\bquick\b",
    r"\bsimple\b",
    r"\btrivial\b",
]

# File scope indicators → each adds to estimated file count
_FILE_SCOPE_PATTERNS = [
    (r"\bmultiple\s+files?\b", 5),
    (r"\ball\s+routes?\b", 10),
    (r"\ball\s+agents?\b", 8),
    (r"\ball\s+components?\b", 8),
    (r"\bmodule\b", 3),
    (r"\bpackage\b", 4),
    (r"\bservice\b", 3),
    (r"\blibrary\b", 5),
]


class TaskSizeDetector:
    """Classifies tasks by scope and recommends execution strategy.

    Combines keyword analysis with structural signals (number of mentioned
    files, scope words, action verbs) to estimate task complexity.
    """

    def __init__(self) -> None:
        """Compile patterns on initialisation."""
        self._complex = [re.compile(p, re.IGNORECASE) for p in _COMPLEX_PATTERNS]
        self._simple = [re.compile(p, re.IGNORECASE) for p in _SIMPLE_PATTERNS]
        self._scope = [
            (re.compile(p, re.IGNORECASE), weight)
            for p, weight in _FILE_SCOPE_PATTERNS
        ]

    def assess(self, text: str) -> SizeAssessment:
        """Assess the size of a task from its description.

        Args:
            text: Task description to analyse.

        Returns:
            SizeAssessment with size, team recommendation, and reasoning.
        """
        reasoning: list[str] = []
        complex_hits = sum(1 for p in self._complex if p.search(text))
        simple_hits = sum(1 for p in self._simple if p.search(text))

        # Estimate files touched
        estimated_files = 1
        for pattern, weight in self._scope:
            if pattern.search(text):
                estimated_files = max(estimated_files, weight)

        # Word count as proxy for description length
        word_count = len(text.split())
        if word_count > 50:
            reasoning.append(f"Long description ({word_count} words)")

        # Determine size
        if complex_hits >= 2 or estimated_files >= 5:
            size = TaskSize.COMPLEX
            reasoning.append(f"Complex signals: {complex_hits} keyword(s), ~{estimated_files} files")
        elif complex_hits == 1 or estimated_files >= 3 or word_count > 40:
            size = TaskSize.MODERATE
            reasoning.append(f"Moderate signals: {complex_hits} keyword(s), ~{estimated_files} files")
        elif simple_hits >= 1:
            size = TaskSize.SIMPLE
            reasoning.append(f"Simple signals: {simple_hits} keyword(s)")
        else:
            size = TaskSize.SIMPLE
            reasoning.append("No strong size signals detected — defaulting to simple")

        # Team recommendation
        if size == TaskSize.COMPLEX:
            use_team = True
            estimated_agents = min(5, max(2, estimated_files // 2))
        elif size == TaskSize.MODERATE:
            use_team = estimated_files >= 4
            estimated_agents = 2 if use_team else 1
        else:
            use_team = False
            estimated_agents = 1

        return SizeAssessment(
            size=size,
            use_team=use_team,
            estimated_agents=estimated_agents,
            reasoning=reasoning,
            estimated_files=estimated_files,
        )
