"""Notifications package — multi-channel alert delivery with cooldown management.

Usage:
    from src.notifications import NotificationDispatcher, CooldownManager, TemplateEngine

    dispatcher = NotificationDispatcher()
    await dispatcher.notify("agent.failed", agent_name="BackendAgent", error="Timeout")
"""

from .cooldown import CooldownEntry, CooldownManager
from .dispatcher import NotificationDispatcher
from .templates import NotificationMessage, TemplateEngine

__all__ = [
    "CooldownEntry",
    "CooldownManager",
    "NotificationDispatcher",
    "NotificationMessage",
    "TemplateEngine",
]
