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

    # =========================================================================
    # Agent Runs - Realtime Event Bridge
    # =========================================================================

    async def create_agent_run(
        self,
        task_id: str,
        user_id: str | None,
        agent_name: str,
        agent_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """Create a new agent run.

        This will trigger a Realtime event that frontend can subscribe to.

        Args:
            task_id: ID of the task being executed
            user_id: ID of the user who owns this run
            agent_name: Name of the agent (e.g., 'orchestrator', 'coding_agent')
            agent_id: Unique agent instance ID
            metadata: Additional metadata

        Returns:
            Created agent run record
        """
        try:
            result = self.client.table("agent_runs").insert({
                "task_id": task_id,
                "user_id": user_id,
                "agent_name": agent_name,
                "agent_id": agent_id,
                "status": "pending",
                "metadata": metadata or {},
            }).execute()

            run = result.data[0] if result.data else None
            if run:
                logger.info(
                    "Created agent run",
                    run_id=run["id"],
                    agent=agent_name,
                    task_id=task_id,
                )
            return run

        except Exception as e:
            logger.error("Failed to create agent run", error=str(e))
            raise

    async def update_agent_run(
        self,
        run_id: str,
        status: str | None = None,
        current_step: str | None = None,
        progress_percent: float | None = None,
        result: Any = None,
        error: str | None = None,
        verification_attempts: int | None = None,
        verification_evidence: list[dict[str, Any]] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """Update an agent run.

        This will trigger a Realtime event that frontend subscribers will receive.

        Args:
            run_id: ID of the agent run
            status: New status
            current_step: Current step description
            progress_percent: Progress percentage (0-100)
            result: Result data
            error: Error message if failed
            verification_attempts: Number of verification attempts
            verification_evidence: Verification evidence array
            metadata: Additional metadata to merge

        Returns:
            Updated agent run record
        """
        try:
            update_data: dict[str, Any] = {}

            if status is not None:
                update_data["status"] = status

                # Auto-set completed_at when reaching terminal states
                if status in ["completed", "failed", "escalated_to_human"]:
                    update_data["completed_at"] = datetime.now().isoformat()

            if current_step is not None:
                update_data["current_step"] = current_step

            if progress_percent is not None:
                update_data["progress_percent"] = max(0.0, min(100.0, progress_percent))

            if result is not None:
                update_data["result"] = result

            if error is not None:
                update_data["error"] = error

            if verification_attempts is not None:
                update_data["verification_attempts"] = verification_attempts

            if verification_evidence is not None:
                update_data["verification_evidence"] = verification_evidence

            if metadata is not None:
                # Fetch current metadata and merge
                current = self.client.table("agent_runs").select("metadata").eq(
                    "id", run_id
                ).single().execute()

                current_metadata = current.data.get("metadata", {}) if current.data else {}
                update_data["metadata"] = {**current_metadata, **metadata}

            if update_data:
                result = self.client.table("agent_runs").update(update_data).eq(
                    "id", run_id
                ).execute()

                run = result.data[0] if result.data else None
                if run:
                    logger.info(
                        "Updated agent run",
                        run_id=run_id,
                        status=status,
                        step=current_step,
                    )
                return run

            return None

        except Exception as e:
            logger.error("Failed to update agent run", run_id=run_id, error=str(e))
            raise

    async def get_agent_run(self, run_id: str) -> dict[str, Any] | None:
        """Get agent run by ID."""
        try:
            result = self.client.table("agent_runs").select("*").eq(
                "id", run_id
            ).single().execute()

            return result.data

        except Exception as e:
            logger.error("Failed to get agent run", run_id=run_id, error=str(e))
            return None

    async def get_task_agent_runs(
        self,
        task_id: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Get all agent runs for a task."""
        try:
            result = self.client.table("agent_runs").select("*").eq(
                "task_id", task_id
            ).order("started_at", desc=True).limit(limit).execute()

            return result.data

        except Exception as e:
            logger.error("Failed to get task agent runs", task_id=task_id, error=str(e))
            return []

    async def get_active_agent_runs(
        self,
        user_id: str,
    ) -> list[dict[str, Any]]:
        """Get all active (in-progress) agent runs for a user."""
        try:
            result = self.client.table("agent_runs").select("*").eq(
                "user_id", user_id
            ).in_(
                "status",
                ["pending", "in_progress", "awaiting_verification", "verification_in_progress"]
            ).order("started_at", desc=True).execute()

            return result.data

        except Exception as e:
            logger.error("Failed to get active agent runs", user_id=user_id, error=str(e))
            return []
