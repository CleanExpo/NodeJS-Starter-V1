"""Shared helpers for the PRD agents' direct Anthropic SDK calls."""

from __future__ import annotations

from anthropic.types import Message, TextBlock


def first_text(response: Message) -> str:
    """Return the text of the first content block, or '' if it isn't text.

    ``Message.content`` is a union of block types and only ``TextBlock``
    exposes ``.text``; the PRD agents always prompt for a text/JSON reply,
    so a non-text first block means an empty response to parse.
    """
    if response.content:
        block = response.content[0]
        if isinstance(block, TextBlock):
            return block.text
    return ""
