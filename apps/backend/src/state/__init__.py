"""State management module."""

from typing import TYPE_CHECKING

from .events import AgentEventPublisher
from .manager import StateManager
from .null_store import NullStateStore

if TYPE_CHECKING:
    from src.state.supabase import SupabaseStateStore as _RealSupabaseStateStore

# Backwards compatibility alias
SupabaseStateStore = NullStateStore


def get_state_store() -> "_RealSupabaseStateStore":
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
