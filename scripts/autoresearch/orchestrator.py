#!/usr/bin/env python3
"""
Autoresearch Quality Improvement Loop
Karpathy's autoresearch pattern adapted for code quality on NodeJS-Starter-V1.

Run via: cd apps/backend && uv run python ../../scripts/autoresearch/orchestrator.py
"""

import json
import os
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import anthropic
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
BACKEND_DIR = REPO_ROOT / "apps" / "backend"

RESULTS_TSV = SCRIPT_DIR / "results.tsv"
IMPROVEMENTS_QUEUE = SCRIPT_DIR / "improvements-queue.md"
RESOURCES_MD = SCRIPT_DIR / "resources.md"
PROGRAM_MD = SCRIPT_DIR / "program.md"

# Load .env from repo root (no-op if already set in environment, e.g. in CI)
load_dotenv(REPO_ROOT / ".env", override=False)

# ---------------------------------------------------------------------------
# AEST timezone (graceful fallback for environments without tzdata)
# ---------------------------------------------------------------------------

try:
    from zoneinfo import ZoneInfo
    AEST = ZoneInfo("Australia/Sydney")
except (ImportError, KeyError):
    # Fixed +10 offset as fallback (does not account for AEDT daylight saving)
    AEST = timezone(timedelta(hours=10), "AEST")


# ---------------------------------------------------------------------------
# Subprocess helper
# ---------------------------------------------------------------------------

def run_cmd(cmd: list[str], cwd: Path) -> tuple[str, str, int]:
    """Run a command and return (stdout, stderr, returncode)."""
    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    return result.stdout, result.stderr, result.returncode


# ---------------------------------------------------------------------------
# Metric collection
# ---------------------------------------------------------------------------

def count_lint_errors() -> int:
    """Run pnpm turbo lint and count ESLint error lines."""
    print("  [lint] running pnpm turbo run lint --no-cache ...", flush=True)
    stdout, stderr, _ = run_cmd(
        ["pnpm", "turbo", "run", "lint", "--no-cache"],
        cwd=REPO_ROOT,
    )
    combined = stdout + stderr
    # ESLint error lines: "  5:10  error  message  rule-name"
    # In turbo output these appear as: "web:lint:   5:10  error  ..."
    count = sum(
        1 for line in combined.splitlines()
        if re.search(r"\d+:\d+\s+error\b", line)
    )
    print(f"  [lint] {count} error(s)", flush=True)
    return count


def count_ts_errors() -> int:
    """Run pnpm turbo type-check and count TypeScript error lines."""
    print("  [ts] running pnpm turbo run type-check --no-cache ...", flush=True)
    stdout, stderr, _ = run_cmd(
        ["pnpm", "turbo", "run", "type-check", "--no-cache"],
        cwd=REPO_ROOT,
    )
    combined = stdout + stderr
    # tsc error lines contain "error TS" followed by the error code
    count = sum(1 for line in combined.splitlines() if "error TS" in line)
    print(f"  [ts] {count} error(s)", flush=True)
    return count


def count_ruff_violations() -> int:
    """Run ruff with JSON output and count violations."""
    print("  [ruff] running uv run ruff check src/ --output-format=json ...", flush=True)
    stdout, stderr, _ = run_cmd(
        ["uv", "run", "ruff", "check", "src/", "--output-format=json"],
        cwd=BACKEND_DIR,
    )
    try:
        violations = json.loads(stdout) if stdout.strip() else []
        count = len(violations)
    except (json.JSONDecodeError, TypeError):
        count = 0
    print(f"  [ruff] {count} violation(s)", flush=True)
    return count


def count_mypy_errors() -> int:
    """Run mypy and count error lines."""
    print("  [mypy] running uv run mypy src/ --no-error-summary ...", flush=True)
    stdout, stderr, _ = run_cmd(
        ["uv", "run", "mypy", "src/", "--no-error-summary"],
        cwd=BACKEND_DIR,
    )
    combined = stdout + stderr
    # mypy error lines: "src/file.py:10: error: Message  [error-code]"
    count = sum(1 for line in combined.splitlines() if ": error:" in line)
    print(f"  [mypy] {count} error(s)", flush=True)
    return count


def calculate_score(lint: int, ts: int, ruff: int, mypy: int) -> int:
    """Calculate composite quality score, capped at [0, 100]."""
    raw = 100 - (lint * 3 + ts * 5 + ruff * 2 + mypy * 4)
    return max(0, min(100, raw))


# ---------------------------------------------------------------------------
# Claude hypothesis
# ---------------------------------------------------------------------------

SKIPPED_HYPOTHESIS_REASON = (
    "skipped — ANTHROPIC_API_KEY not configured (set the secret to enable Claude hypotheses)"
)


def _placeholder_hypothesis() -> dict[str, str]:
    """Return the placeholder hypothesis used when Claude cannot be called.

    Metrics are still valuable on their own — the loop should record the row,
    persist learnings, and exit cleanly so the scheduled CI job stays green
    while the absence of the API key remains visible in logs and the queue.
    """
    return {
        "HYPOTHESIS": SKIPPED_HYPOTHESIS_REASON,
        "TARGET_FILE": "N/A",
        "EXPECTED_IMPROVEMENT": "N/A",
        "CONFIDENCE": "N/A",
        "RATIONALE": "N/A",
    }


def get_hypothesis(lint: int, ts: int, ruff: int, mypy: int, score: int) -> dict[str, str]:
    """Call claude-sonnet-4-6 and return a structured improvement hypothesis.

    When ``ANTHROPIC_API_KEY`` is missing or empty, return a placeholder so
    metric collection still completes and CI does not fail on a missing
    optional secret.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        print(
            "  WARNING: ANTHROPIC_API_KEY not set — skipping Claude hypothesis. "
            "Metrics will still be recorded.",
            flush=True,
        )
        return _placeholder_hypothesis()

    client = anthropic.Anthropic(api_key=api_key)

    program_content = PROGRAM_MD.read_text(encoding="utf-8").strip()
    resources_content = RESOURCES_MD.read_text(encoding="utf-8").strip()

    prompt = f"""{program_content}

---

Current metrics:
- lint_errors={lint}
- ts_errors={ts}
- ruff_violations={ruff}
- mypy_errors={mypy}
- composite_score={score}/100

Prior learnings (accumulated from previous loop runs):
{resources_content if resources_content else "(none yet — this is the first run)"}

---

Analyse the metrics above. Identify the single highest-value improvement.
Return ONLY the five structured fields — no extra text, no markdown formatting.

HYPOTHESIS:
TARGET_FILE:
EXPECTED_IMPROVEMENT:
CONFIDENCE:
RATIONALE: """

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()

    # Parse key: value pairs
    result: dict[str, str] = {}
    for line in text.splitlines():
        if ": " in line:
            key, _, value = line.partition(": ")
            key = key.strip()
            if key in {"HYPOTHESIS", "TARGET_FILE", "EXPECTED_IMPROVEMENT", "CONFIDENCE", "RATIONALE"}:
                result[key] = value.strip()

    return result


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------

def append_tsv_row(
    ts_str: str,
    score: int,
    lint: int,
    ts_errors: int,
    ruff: int,
    mypy: int,
    hypothesis: str,
) -> None:
    row = f"{ts_str}\t{score}\t{lint}\t{ts_errors}\t{ruff}\t{mypy}\t{hypothesis}\n"
    with RESULTS_TSV.open("a", encoding="utf-8") as f:
        f.write(row)


def format_date(dt: datetime) -> str:
    return dt.strftime("%d/%m/%Y %H:%M AEST")


def append_queue_entry(
    dt: datetime,
    score: int,
    lint: int,
    ts_errors: int,
    ruff: int,
    mypy: int,
    hyp: dict[str, str],
) -> None:
    entry = (
        f"\n## [{format_date(dt)}] Score: {score}/100\n"
        f"**Metrics**: lint={lint} ts={ts_errors} ruff={ruff} mypy={mypy}\n\n"
        f"HYPOTHESIS: {hyp.get('HYPOTHESIS', 'N/A')}\n"
        f"TARGET_FILE: {hyp.get('TARGET_FILE', 'N/A')}\n"
        f"EXPECTED_IMPROVEMENT: {hyp.get('EXPECTED_IMPROVEMENT', 'N/A')}\n"
        f"CONFIDENCE: {hyp.get('CONFIDENCE', 'N/A')}\n"
        f"RATIONALE: {hyp.get('RATIONALE', 'N/A')}\n"
        f"\n---\n"
    )
    with IMPROVEMENTS_QUEUE.open("a", encoding="utf-8") as f:
        f.write(entry)


def append_learning(dt: datetime, score: int, hyp: dict[str, str]) -> None:
    entry = (
        f"[{dt.strftime('%d/%m/%Y')}] score={score} — "
        f"{hyp.get('HYPOTHESIS', 'N/A')} "
        f"(confidence: {hyp.get('CONFIDENCE', 'N/A')})\n"
    )
    with RESOURCES_MD.open("a", encoding="utf-8") as f:
        f.write(entry)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("Autoresearch — Quality Improvement Loop")
    print(f"Repo root: {REPO_ROOT}")
    print("=" * 60)

    print("\n[1/4] Collecting quality metrics...")
    lint = count_lint_errors()
    ts_errors = count_ts_errors()
    ruff = count_ruff_violations()
    mypy = count_mypy_errors()
    score = calculate_score(lint, ts_errors, ruff, mypy)

    print(f"\n  Composite score: {score}/100")
    print(f"  Formula: 100 - ({lint}×3 + {ts_errors}×5 + {ruff}×2 + {mypy}×4) = {score}")

    print("\n[2/4] Calling Claude for improvement hypothesis...")
    hyp = get_hypothesis(lint, ts_errors, ruff, mypy, score)
    print(f"  HYPOTHESIS:           {hyp.get('HYPOTHESIS', 'N/A')}")
    print(f"  TARGET_FILE:          {hyp.get('TARGET_FILE', 'N/A')}")
    print(f"  EXPECTED_IMPROVEMENT: {hyp.get('EXPECTED_IMPROVEMENT', 'N/A')}")
    print(f"  CONFIDENCE:           {hyp.get('CONFIDENCE', 'N/A')}")

    now = datetime.now(tz=AEST)
    ts_str = now.strftime("%Y-%m-%dT%H:%M")

    print("\n[3/4] Appending to results.tsv...")
    append_tsv_row(ts_str, score, lint, ts_errors, ruff, mypy, hyp.get("HYPOTHESIS", "N/A"))
    print("  Done.")

    print("\n[4/4] Appending to improvements-queue.md and resources.md...")
    append_queue_entry(now, score, lint, ts_errors, ruff, mypy, hyp)
    append_learning(now, score, hyp)
    print("  Done.")

    print(f"\n{'=' * 60}")
    print(f"Loop complete. Score: {score}/100")
    print(f"Review suggestions in: scripts/autoresearch/improvements-queue.md")
    print("=" * 60)


if __name__ == "__main__":
    main()
