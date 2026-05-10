"""Unit tests for scripts/autoresearch/orchestrator.py.

Covers RA-2212 — the autoresearch quality loop must not crash CI red when
the optional ANTHROPIC_API_KEY secret is missing or empty. Metrics are still
valuable on their own; the Claude hypothesis is the optional enrichment.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

# Load orchestrator.py directly from scripts/ since it is not a package.
_REPO_ROOT = Path(__file__).resolve().parents[3]
_ORCHESTRATOR_PATH = _REPO_ROOT / "scripts" / "autoresearch" / "orchestrator.py"

_spec = importlib.util.spec_from_file_location(
    "autoresearch_orchestrator",
    _ORCHESTRATOR_PATH,
)
assert _spec is not None and _spec.loader is not None
orchestrator = importlib.util.module_from_spec(_spec)
sys.modules["autoresearch_orchestrator"] = orchestrator
_spec.loader.exec_module(orchestrator)


_PLACEHOLDER_KEYS = {
    "HYPOTHESIS",
    "TARGET_FILE",
    "EXPECTED_IMPROVEMENT",
    "CONFIDENCE",
    "RATIONALE",
}


def test_missing_anthropic_key_returns_placeholder(monkeypatch: pytest.MonkeyPatch) -> None:
    """When the env var is unset, the loop should not raise."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    result = orchestrator.get_hypothesis(0, 0, 0, 0, 100)

    assert set(result.keys()) == _PLACEHOLDER_KEYS
    assert result["HYPOTHESIS"] == orchestrator.SKIPPED_HYPOTHESIS_REASON
    assert result["TARGET_FILE"] == "N/A"


def test_empty_anthropic_key_returns_placeholder(monkeypatch: pytest.MonkeyPatch) -> None:
    """An empty-string secret (the GitHub Actions default for unset secrets) is treated as missing."""
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")

    result = orchestrator.get_hypothesis(1, 2, 3, 4, 50)

    assert result["HYPOTHESIS"] == orchestrator.SKIPPED_HYPOTHESIS_REASON


def test_whitespace_only_anthropic_key_returns_placeholder(monkeypatch: pytest.MonkeyPatch) -> None:
    """Whitespace-only secrets (common when a value is pasted with a trailing newline) skip cleanly."""
    monkeypatch.setenv("ANTHROPIC_API_KEY", "   \n  ")

    result = orchestrator.get_hypothesis(0, 0, 0, 0, 100)

    assert result["HYPOTHESIS"] == orchestrator.SKIPPED_HYPOTHESIS_REASON
