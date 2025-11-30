"""Supabase state persistence."""

from typing import Any
from datetime import datetime

from supabase import create_client, Client

from src.config import get_settings
from src.utils import get_logger

settings = get_settings()
logger = get_logger(__name__)


class SupabaseStateStore:
    """Persistent state storage using Supabase."""

    def __init__(self) -> None:
        self._client: Client | None = None

    @property
    def client(self) -> Client:
        """Lazy-initialize Supabase client."""
        if self._client is None:
            if not settings.supabase_url or not settings.supabase_service_role_key:
                raise ValueError("Supabase credentials not configured")

            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key,
            )
        return self._client

    async def save_conversation(
        self,
        conversation_id: str,
        user_id: str | None,
        messages: list[dict[str, Any]],
        context: dict[str, Any] | None = None,
    ) -> None:
        """Save conversation to Supabase."""
        try:
            self.client.table("conversations").upsert({
                "id": conversation_id,
                "user_id": user_id,
                "messages": messages,
                "context": context or {},
                "updated_at": datetime.now().isoformat(),
            }).execute()

            logger.info("Saved conversation", id=conversation_id)

        except Exception as e:
            logger.error("Failed to save conversation", error=str(e))
            raise

    async def load_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any] | None:
        """Load conversation from Supabase."""
        try:
            result = self.client.table("conversations").select("*").eq(
                "id", conversation_id
            ).single().execute()

            return result.data

        except Exception as e:
            logger.error("Failed to load conversation", error=str(e))
            return None

    async def save_task(
        self,
        task_id: str,
        conversation_id: str | None,
        description: str,
        status: str,
        result: Any = None,
        error: str | None = None,
    ) -> None:
        """Save task to Supabase."""
        try:
            self.client.table("tasks").upsert({
                "id": task_id,
                "conversation_id": conversation_id,
                "description": description,
                "status": status,
                "result": result,
                "error": error,
                "updated_at": datetime.now().isoformat(),
            }).execute()

            logger.info("Saved task", id=task_id, status=status)

        except Exception as e:
            logger.error("Failed to save task", error=str(e))
            raise

    async def load_task(self, task_id: str) -> dict[str, Any] | None:
        """Load task from Supabase."""
        try:
            result = self.client.table("tasks").select("*").eq(
                "id", task_id
            ).single().execute()

            return result.data

        except Exception as e:
            logger.error("Failed to load task", error=str(e))
            return None

    async def get_user_conversations(
        self,
        user_id: str,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Get all conversations for a user."""
        try:
            result = self.client.table("conversations").select("*").eq(
                "user_id", user_id
            ).order("updated_at", desc=True).limit(limit).execute()

            return result.data

        except Exception as e:
            logger.error("Failed to get user conversations", error=str(e))
            return []

    async def get_conversation_tasks(
        self,
        conversation_id: str,
    ) -> list[dict[str, Any]]:
        """Get all tasks for a conversation."""
        try:
            result = self.client.table("tasks").select("*").eq(
                "conversation_id", conversation_id
            ).order("created_at", desc=True).execute()

            return result.data

        except Exception as e:
            logger.error("Failed to get conversation tasks", error=str(e))
            return []
