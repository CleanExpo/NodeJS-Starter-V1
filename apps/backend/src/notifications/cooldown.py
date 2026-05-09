"""Notification Cooldown Manager — rate limiting to prevent alert fatigue.

Tracks when notifications were last sent per channel/key combination and
enforces minimum intervals between repeat notifications.

Usage:
    cooldown = CooldownManager(default_interval=60.0)
    if cooldown.allowed("agent.failed", "agent-123"):
        dispatcher.send(...)
        cooldown.record("agent.failed", "agent-123")
"""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class CooldownEntry:
    """A single cooldown tracking entry."""

    last_sent: float
    """Monotonic timestamp of the last notification."""

    count: int = 0
    """Total notifications sent under this key."""


class CooldownManager:
    """Tracks notification send times and enforces minimum intervals.

    Provides per-event-type and per-key cooldowns, preventing the same
    alert from flooding channels during high-activity periods.

    Attributes:
        default_interval: Default minimum seconds between repeat notifications.
    """

    def __init__(
        self,
        default_interval: float = 60.0,
        overrides: dict[str, float] | None = None,
    ) -> None:
        """Initialise the cooldown manager.

        Args:
            default_interval: Minimum seconds between repeat notifications.
            overrides: Per-event-type interval overrides
                       e.g. {"agent.failed": 30.0, "task.completed": 5.0}.
        """
        self.default_interval = default_interval
        self._overrides: dict[str, float] = overrides or {}
        # key = f"{event_type}:{entity_key}" → CooldownEntry
        self._entries: dict[str, CooldownEntry] = defaultdict(
            lambda: CooldownEntry(last_sent=0.0)
        )

    def allowed(self, event_type: str, entity_key: str = "") -> bool:
        """Check whether a notification is permitted under the cooldown.

        Args:
            event_type: Category of the notification (e.g. "agent.failed").
            entity_key: Optional entity identifier (e.g. agent ID, task ID).

        Returns:
            True if enough time has passed since the last notification.
        """
        interval = self._overrides.get(event_type, self.default_interval)
        key = f"{event_type}:{entity_key}"
        entry = self._entries[key]
        elapsed = time.monotonic() - entry.last_sent
        return elapsed >= interval

    def record(self, event_type: str, entity_key: str = "") -> None:
        """Record that a notification was sent now.

        Args:
            event_type: Category of the notification.
            entity_key: Optional entity identifier.
        """
        key = f"{event_type}:{entity_key}"
        entry = self._entries[key]
        entry.last_sent = time.monotonic()
        entry.count += 1

    def reset(self, event_type: str, entity_key: str = "") -> None:
        """Reset the cooldown for a specific event/entity combination.

        Args:
            event_type: Category of the notification.
            entity_key: Optional entity identifier.
        """
        key = f"{event_type}:{entity_key}"
        self._entries[key] = CooldownEntry(last_sent=0.0)

    def stats(self) -> dict[str, int]:
        """Return total notification counts per event key.

        Returns:
            Dict mapping event keys to total send counts.
        """
        return {key: entry.count for key, entry in self._entries.items()}
