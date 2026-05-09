"""Keyword Detector — content-based task routing via pattern analysis.

Inspired by oh-my-codex hooks/keyword-detector.ts. Analyses task descriptions
and code snippets to determine the most appropriate specialist agent and
whether escalation is required.

Usage:
    detector = KeywordDetector()
    signal = detector.detect("Fix the SQL injection vulnerability in the auth route")
    print(signal.primary_domain)   # "security"
    print(signal.escalate)         # True
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class DetectionSignal:
    """Result of keyword detection on a task description."""

    primary_domain: str
    """The dominant domain detected (e.g. "security", "database", "frontend")."""

    agent_type: str
    """Recommended agent type to handle this task."""

    confidence: float
    """Confidence score 0–1 for the primary domain detection."""

    escalate: bool
    """True if the task should be escalated to a specialist or team lead."""

    matched_keywords: list[str] = field(default_factory=list)
    """Keywords that triggered this detection."""

    secondary_domains: list[str] = field(default_factory=list)
    """Additional domains detected in the task."""


# ---------------------------------------------------------------------------
# Keyword registry
# ---------------------------------------------------------------------------

_DOMAIN_PATTERNS: dict[str, list[str]] = {
    "security": [
        r"\bsql injection\b",
        r"\bxss\b",
        r"\bcsrf\b",
        r"\bauth(?:entication|orisation|orization)\b",
        r"\bjwt\b",
        r"\bpassword\b",
        r"\bvulnerabilit(?:y|ies)\b",
        r"\bexploit\b",
        r"\bsanitise?\b",
        r"\bsecret\b",
        r"\bcors\b",
        r"\brate.?limit\b",
        r"\bowasp\b",
    ],
    "database": [
        r"\bmigration\b",
        r"\bschema\b",
        r"\bsql\b",
        r"\bquery\b",
        r"\bsupabase\b",
        r"\bpostgres(?:ql)?\b",
        r"\bindex(?:ing)?\b",
        r"\btransaction\b",
        r"\bforeign.?key\b",
        r"\borm\b",
        r"\balembic\b",
        r"\bsqlalchemy\b",
    ],
    "frontend": [
        r"\bcomponent\b",
        r"\breact\b",
        r"\bnext(?:\.js)?\b",
        r"\btailwind\b",
        r"\bui\b",
        r"\bstyle[sd]?\b",
        r"\banimation\b",
        r"\bframer\b",
        r"\bresponsive\b",
        r"\baccessib(?:le|ility)\b",
        r"\bpage\b",
        r"\blayout\b",
        r"\bhook\b",
    ],
    "backend": [
        r"\bendpoint\b",
        r"\bfastapi\b",
        r"\bapi\b",
        r"\bservice\b",
        r"\bagent\b",
        r"\bpython\b",
        r"\basync\b",
        r"\bpydantic\b",
        r"\blanggraph\b",
        r"\bwebhook\b",
        r"\bbackground.?task\b",
    ],
    "performance": [
        r"\boptimis(?:e|ation)\b",
        r"\bperformance\b",
        r"\bslow\b",
        r"\blatency\b",
        r"\bthroughput\b",
        r"\bcach(?:e|ing)\b",
        r"\bN\+1\b",
        r"\bcomplexity\b",
        r"\bprofile?\b",
        r"\bbottleneck\b",
    ],
    "testing": [
        r"\btest(?:ing|s)?\b",
        r"\bunit.?test\b",
        r"\bintegration.?test\b",
        r"\be2e\b",
        r"\bvitest\b",
        r"\bpytest\b",
        r"\bplaywright\b",
        r"\bcoverage\b",
        r"\bmock\b",
        r"\bfixture\b",
    ],
    "devops": [
        r"\bdeploy(?:ment)?\b",
        r"\bdocker\b",
        r"\bci(?:\/cd)?\b",
        r"\bpipeline\b",
        r"\bvercel\b",
        r"\binfrastructure\b",
        r"\benv(?:ironment)?\b",
        r"\bsecret[s]?\b",
        r"\bcontainer\b",
    ],
}

# Domain → recommended agent type
_AGENT_MAP: dict[str, str] = {
    "security": "SecurityAgent",
    "database": "DatabaseAgent",
    "frontend": "FrontendAgent",
    "backend": "BackendAgent",
    "performance": "BackendAgent",
    "testing": "GeneralAgent",
    "devops": "DevOpsAgent",
    "general": "GeneralAgent",
}

# Domains that always trigger escalation
_ESCALATION_DOMAINS = {"security", "devops"}


class KeywordDetector:
    """Analyses task descriptions to route to the correct specialist agent.

    Uses a compiled regex registry for efficient multi-domain matching.
    """

    def __init__(self) -> None:
        """Compile keyword patterns on initialisation."""
        self._compiled: dict[str, list[re.Pattern[str]]] = {
            domain: [re.compile(pat, re.IGNORECASE) for pat in patterns]
            for domain, patterns in _DOMAIN_PATTERNS.items()
        }

    def detect(self, text: str) -> DetectionSignal:
        """Analyse text and return a routing signal.

        Args:
            text: Task description or code snippet to analyse.

        Returns:
            DetectionSignal with primary domain, agent type, and escalation flag.
        """
        domain_scores: dict[str, int] = {}
        matched_keywords: dict[str, list[str]] = {}

        for domain, patterns in self._compiled.items():
            hits = []
            for pattern in patterns:
                m = pattern.search(text)
                if m:
                    hits.append(m.group(0))
            if hits:
                domain_scores[domain] = len(hits)
                matched_keywords[domain] = hits

        if not domain_scores:
            return DetectionSignal(
                primary_domain="general",
                agent_type="GeneralAgent",
                confidence=0.0,
                escalate=False,
            )

        # Primary domain = highest score
        primary = max(domain_scores, key=lambda d: domain_scores[d])
        total_hits = sum(domain_scores.values())
        confidence = domain_scores[primary] / max(total_hits, 1)

        secondary = [d for d in domain_scores if d != primary]
        escalate = primary in _ESCALATION_DOMAINS or "security" in domain_scores

        return DetectionSignal(
            primary_domain=primary,
            agent_type=_AGENT_MAP.get(primary, "GeneralAgent"),
            confidence=min(1.0, confidence),
            escalate=escalate,
            matched_keywords=matched_keywords.get(primary, []),
            secondary_domains=secondary,
        )

    def domains_present(self, text: str) -> list[str]:
        """Return all domains detected in the text, ordered by score.

        Args:
            text: Text to analyse.

        Returns:
            Ordered list of domain names.
        """
        signal = self.detect(text)
        return [signal.primary_domain] + signal.secondary_domains
