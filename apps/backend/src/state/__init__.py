"""State management module."""

from .events import AgentEventPublisher
from .manager import StateManager
from .null_store import NullStateStore

# Backwards compatibility alias
SupabaseStateStore = NullStateStore


def get_state_store() -> SupabaseStateStore:
    """Factory function for the active state store."""
    from src.state.supabase import SupabaseStateStore
    return SupabaseStateStore()


__all__ = [
    "AgentEventPublisher",
    "NullStateStore",
    "StateManager",
    "SupabaseStateStore",
    "get_state_store",
]
