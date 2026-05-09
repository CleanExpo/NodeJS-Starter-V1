"""Notification Templates — consistent message formatting for agent events.

Provides a lightweight template engine that renders notification messages
for common agent lifecycle events.

Usage:
    engine = TemplateEngine()
    message = engine.render("agent.completed", agent_name="BackendAgent", result="success")
    print(message.title)   # "✓ BackendAgent completed"
    print(message.body)    # "Task completed successfully with result: success"
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class NotificationMessage:
    """A rendered notification message."""

    event_type: str
    title: str
    body: str
    severity: str  # "info" | "warning" | "error" | "success"
    metadata: dict[str, Any]


# Template registry: event_type → (title_template, body_template, severity)
_TEMPLATES: dict[str, tuple[str, str, str]] = {
    "agent.started": (
        "Agent started: {agent_name}",
        "Agent '{agent_name}' has started working on: {task_description}",
        "info",
    ),
    "agent.completed": (
        "Agent completed: {agent_name}",
        "Task completed successfully.\nResult: {result}",
        "success",
    ),
    "agent.failed": (
        "Agent failed: {agent_name}",
        "Agent '{agent_name}' encountered an error:\n{error}",
        "error",
    ),
    "agent.escalated": (
        "Escalation required: {agent_name}",
        "Agent '{agent_name}' has escalated after {attempts} attempt(s).\nReason: {reason}",
        "warning",
    ),
    "task.claimed": (
        "Task claimed by {worker_name}",
        "Worker '{worker_name}' claimed task: {task_description}",
        "info",
    ),
    "task.reclaimed": (
        "Task reclaimed from dead worker",
        "Task '{task_id}' was reclaimed after worker '{worker_name}' stopped responding.",
        "warning",
    ),
    "team.run.complete": (
        "Team run complete",
        "Team completed {completed}/{total} tasks.\nFailed: {failed}",
        "success",
    ),
    "research.complete": (
        "Research complete: {topic}",
        "Autoresearch on '{topic}' finished with confidence {confidence:.0%}.\n"
        "Key findings: {finding_count} found.",
        "success",
    ),
    "system.health": (
        "System health check",
        "Active agents: {active_agents} | Pending tasks: {pending_tasks} | "
        "Completed today: {completed_today}",
        "info",
    ),
}


class TemplateEngine:
    """Renders notification messages from event type and variables.

    Falls back to a generic template if the event type is not registered.
    """

    def render(
        self,
        event_type: str,
        **variables: Any,
    ) -> NotificationMessage:
        """Render a notification message.

        Args:
            event_type: Event type key (e.g. "agent.failed").
            **variables: Template variables to substitute.

        Returns:
            Rendered NotificationMessage.
        """
        if event_type in _TEMPLATES:
            title_tpl, body_tpl, severity = _TEMPLATES[event_type]
            try:
                title = title_tpl.format(**variables)
                body = body_tpl.format(**variables)
            except KeyError as exc:
                title = f"[{event_type}]"
                body = f"(Template rendering failed — missing variable: {exc})\nRaw: {variables}"
        else:
            title = f"[{event_type}]"
            body = str(variables)
            severity = "info"

        return NotificationMessage(
            event_type=event_type,
            title=title,
            body=body,
            severity=severity,
            metadata=dict(variables),
        )

    def register(
        self,
        event_type: str,
        title_template: str,
        body_template: str,
        severity: str = "info",
    ) -> None:
        """Register a custom notification template.

        Args:
            event_type: Unique event type key.
            title_template: Python format string for the title.
            body_template: Python format string for the body.
            severity: One of "info", "warning", "error", "success".
        """
        _TEMPLATES[event_type] = (title_template, body_template, severity)
