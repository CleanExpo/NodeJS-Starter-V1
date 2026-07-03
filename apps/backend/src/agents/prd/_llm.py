"""Shared helpers for the PRD agents' direct Anthropic SDK calls."""

from __future__ import annotations

from anthropic.types import Message


def first_text(response: Message) -> str:
    """Return the text of the first content block, or '' if it has none.

    ``Message.content`` is a union of block types and only ``TextBlock``
    exposes ``.text``; read it defensively so a non-text first block (or a
    test double) yields an empty string for the caller to parse.
    """
    if not response.content:
        return ""
    text = getattr(response.content[0], "text", "")
    return text if isinstance(text, str) else ""
