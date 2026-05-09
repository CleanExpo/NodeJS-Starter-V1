"""Session Context Overlay — dynamic prompt enrichment with live project state.

Inspired by oh-my-codex hooks/agents-overlay.ts. Injects session-specific
context into agent system prompts to make them aware of:

- Current git branch and recent changes
- Active tasks from the team runtime
- Project memory summaries
- Environment configuration

Context is capped at MAX_CHARS to prevent token bloat.

Usage:
    overlay = SessionContextOverlay(project_root=".")
    context = await overlay.build(active_task_ids=["abc123"])
    system_prompt = overlay.inject(base_system_prompt, context)
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

from src.utils import get_logger

logger = get_logger(__name__)

# Maximum characters injected into the system prompt
MAX_CHARS = 3_500

_MARKER_START = "<!-- OVERLAY:START -->"
_MARKER_END = "<!-- OVERLAY:END -->"


class ContextSnapshot(dict):
    """Typed alias for the context snapshot dict."""


class SessionContextOverlay:
    """Builds and injects live project context into agent system prompts.

    Attributes:
        project_root: Path to the repository root.
    """

    def __init__(self, project_root: str | Path = ".") -> None:
        """Initialise the overlay.

        Args:
            project_root: Root of the repository.
        """
        self.project_root = Path(project_root).resolve()

    async def build(
        self,
        *,
        active_task_ids: list[str] | None = None,
        memory_summary: str | None = None,
        extra: dict[str, Any] | None = None,
    ) -> ContextSnapshot:
        """Build a context snapshot from the current project state.

        Args:
            active_task_ids: IDs of currently active tasks to include.
            memory_summary: Optional pre-built memory summary string.
            extra: Additional key/value pairs to include.

        Returns:
            A ContextSnapshot dict.
        """
        snapshot: dict[str, Any] = {}

        snapshot["git_branch"] = self._git_branch()
        snapshot["recent_changes"] = self._recent_changes()
        if active_task_ids:
            snapshot["active_task_ids"] = active_task_ids
        if memory_summary:
            snapshot["memory_summary"] = memory_summary[:500]
        if extra:
            snapshot.update(extra)

        return ContextSnapshot(snapshot)

    def inject(self, base_prompt: str, snapshot: ContextSnapshot) -> str:
        """Inject the context snapshot into a system prompt.

        If the prompt already contains overlay markers, replaces the existing
        overlay section (idempotent). Otherwise appends the overlay.

        Args:
            base_prompt: The original system prompt.
            snapshot: Context snapshot from build().

        Returns:
            System prompt with overlay injected, capped at MAX_CHARS overhead.
        """
        overlay_text = self._render(snapshot)

        # Replace existing overlay if present
        if _MARKER_START in base_prompt:
            start = base_prompt.index(_MARKER_START)
            end = base_prompt.index(_MARKER_END) + len(_MARKER_END)
            return base_prompt[:start] + overlay_text + base_prompt[end:]

        return base_prompt + "\n\n" + overlay_text

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _render(self, snapshot: ContextSnapshot) -> str:
        """Render snapshot to a markdown block within overlay markers.

        Args:
            snapshot: Context snapshot.

        Returns:
            Marker-bounded context block, truncated to MAX_CHARS.
        """
        lines = [_MARKER_START, "## Session Context"]

        if branch := snapshot.get("git_branch"):
            lines.append(f"**Branch:** `{branch}`")

        if changes := snapshot.get("recent_changes"):
            lines.append(f"**Recent changes:**\n```\n{changes}\n```")

        if tasks := snapshot.get("active_task_ids"):
            lines.append(f"**Active tasks:** {', '.join(tasks)}")

        if memory := snapshot.get("memory_summary"):
            lines.append(f"**Memory:** {memory}")

        # Any extra keys
        for key, value in snapshot.items():
            if key not in ("git_branch", "recent_changes", "active_task_ids", "memory_summary"):
                lines.append(f"**{key}:** {value}")

        lines.append(_MARKER_END)
        text = "\n".join(lines)

        # Truncate if over cap (deterministic overflow policy)
        if len(text) > MAX_CHARS:
            truncation_note = "\n...[truncated]" + _MARKER_END
            text = text[: MAX_CHARS - len(truncation_note)] + truncation_note

        return text

    def _git_branch(self) -> str:
        """Return the current git branch name."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.stdout.strip() if result.returncode == 0 else "unknown"
        except Exception:
            return "unknown"

    def _recent_changes(self, max_lines: int = 10) -> str:
        """Return a short summary of recent git changes.

        Args:
            max_lines: Maximum log lines to include.

        Returns:
            Formatted git log summary.
        """
        try:
            result = subprocess.run(
                ["git", "log", "--oneline", f"-{max_lines}"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=5,
            )
            return result.stdout.strip() if result.returncode == 0 else ""
        except Exception:
            return ""
