"""Notification Dispatcher — multi-channel alert delivery with cooldown management.

Inspired by oh-my-codex notifications/dispatcher.ts. Sends notifications
across multiple channels (WebSocket, email, webhook) with built-in cooldown
enforcement to prevent alert fatigue.

Channels:
    - websocket: Real-time browser updates via FastAPI WebSocket connections
    - email: Transactional email via Resend (existing integration)
    - webhook: HTTP POST to an external URL

Usage:
    dispatcher = NotificationDispatcher()
    dispatcher.register_websocket_channel(connection_manager)

    await dispatcher.notify(
        "agent.failed",
        agent_name="BackendAgent",
        error="Timeout after 300s",
        channels=["websocket", "email"],
    )
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

from src.utils import get_logger

from .cooldown import CooldownManager
from .templates import NotificationMessage, TemplateEngine

logger = get_logger(__name__)


class NotificationDispatcher:
    """Dispatches notifications across WebSocket, email, and webhook channels.

    Enforces cooldown policies so that repeated events do not flood receivers.
    Each channel can be enabled/disabled independently.

    Attributes:
        cooldown: CooldownManager controlling dispatch frequency.
        template_engine: TemplateEngine for rendering messages.
    """

    def __init__(
        self,
        cooldown: CooldownManager | None = None,
        default_channels: list[str] | None = None,
    ) -> None:
        """Initialise the dispatcher.

        Args:
            cooldown: Optional custom CooldownManager.
            default_channels: Channels to use when none are specified in notify().
        """
        self.cooldown = cooldown or CooldownManager(default_interval=30.0)
        self.template_engine = TemplateEngine()
        self._default_channels = default_channels or ["websocket"]

        # Channel registrations
        self._websocket_manager: Any | None = None
        self._webhook_url: str | None = None
        self._email_sender: Any | None = None

        # Sent history for debugging
        self._sent_log: list[dict[str, Any]] = []

    # ------------------------------------------------------------------
    # Channel registration
    # ------------------------------------------------------------------

    def register_websocket_channel(self, connection_manager: Any) -> None:
        """Register a WebSocket connection manager for real-time delivery.

        The manager must expose:
            async def broadcast(data: dict) -> None

        Args:
            connection_manager: WebSocket connection manager.
        """
        self._websocket_manager = connection_manager
        logger.info("WebSocket notification channel registered")

    def register_webhook_channel(self, url: str) -> None:
        """Register an HTTP webhook endpoint.

        Args:
            url: POST endpoint that receives notification payloads.
        """
        self._webhook_url = url
        logger.info("Webhook notification channel registered", url=url)

    def register_email_channel(self, email_sender: Any) -> None:
        """Register an email sender (e.g. Resend client).

        The sender must expose:
            async def send(to: str, subject: str, body: str) -> None

        Args:
            email_sender: Email sender instance.
        """
        self._email_sender = email_sender
        logger.info("Email notification channel registered")

    # ------------------------------------------------------------------
    # Dispatch
    # ------------------------------------------------------------------

    async def notify(
        self,
        event_type: str,
        *,
        entity_key: str = "",
        channels: list[str] | None = None,
        force: bool = False,
        **variables: Any,
    ) -> NotificationMessage | None:
        """Send a notification across configured channels.

        Args:
            event_type: Event type key (e.g. "agent.failed").
            entity_key: Optional entity identifier for per-entity cooldowns.
            channels: Channels to use. Defaults to self._default_channels.
            force: If True, bypass cooldown checks.
            **variables: Template variables for message rendering.

        Returns:
            The rendered NotificationMessage if sent, or None if cooldown suppressed it.
        """
        if not force and not self.cooldown.allowed(event_type, entity_key):
            logger.debug(
                "Notification suppressed by cooldown",
                event_type=event_type,
                entity_key=entity_key,
            )
            return None

        message = self.template_engine.render(event_type, **variables)
        selected_channels = channels or self._default_channels

        tasks = []
        for channel in selected_channels:
            if channel == "websocket":
                tasks.append(self._send_websocket(message))
            elif channel == "email":
                tasks.append(self._send_email(message, variables))
            elif channel == "webhook":
                tasks.append(self._send_webhook(message))
            else:
                logger.warning("Unknown notification channel", channel=channel)

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for channel, result in zip(selected_channels, results):
                if isinstance(result, Exception):
                    logger.error(
                        "Notification channel failed",
                        channel=channel,
                        error=str(result),
                    )

        # Record cooldown and log
        self.cooldown.record(event_type, entity_key)
        self._sent_log.append(
            {
                "event_type": event_type,
                "entity_key": entity_key,
                "channels": selected_channels,
                "sent_at": time.time(),
                "title": message.title,
            }
        )

        logger.info(
            "Notification sent",
            event_type=event_type,
            channels=selected_channels,
            title=message.title,
        )
        return message

    def get_sent_log(self, limit: int = 50) -> list[dict[str, Any]]:
        """Return the most recent sent notifications.

        Args:
            limit: Maximum entries to return.

        Returns:
            List of sent notification records.
        """
        return self._sent_log[-limit:]

    # ------------------------------------------------------------------
    # Channel implementations
    # ------------------------------------------------------------------

    async def _send_websocket(self, message: NotificationMessage) -> None:
        """Broadcast notification via WebSocket.

        Args:
            message: Rendered notification message.
        """
        if self._websocket_manager is None:
            return
        payload = {
            "type": "notification",
            "event_type": message.event_type,
            "title": message.title,
            "body": message.body,
            "severity": message.severity,
            "metadata": message.metadata,
        }
        await self._websocket_manager.broadcast(payload)

    async def _send_email(
        self,
        message: NotificationMessage,
        variables: dict[str, Any],
    ) -> None:
        """Send notification via email.

        Args:
            message: Rendered notification message.
            variables: Original template variables (may contain 'to_email').
        """
        if self._email_sender is None:
            return
        to_email = variables.get("to_email")
        if not to_email:
            logger.debug("Email notification skipped — no to_email in variables")
            return
        await self._email_sender.send(
            to=to_email,
            subject=message.title,
            body=message.body,
        )

    async def _send_webhook(self, message: NotificationMessage) -> None:
        """POST notification to the registered webhook URL.

        Args:
            message: Rendered notification message.
        """
        if not self._webhook_url:
            return
        try:
            import httpx  # httpx is available in the backend deps

            payload = {
                "event_type": message.event_type,
                "title": message.title,
                "body": message.body,
                "severity": message.severity,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(self._webhook_url, json=payload)
        except Exception as exc:
            logger.error("Webhook delivery failed", error=str(exc))
