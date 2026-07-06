"""
Supabase state store — real persistence when credentials are available.

Falls back to NullStateStore when SUPABASE_URL / SUPABASE_ANON_KEY are not set,
preserving the zero-config local development experience.

Import pattern (12+ modules keep this import path):
    from src.state.supabase import SupabaseStateStore
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, cast
from uuid import uuid4

from src.db.errors import ConnectionError
from src.utils import get_logger

logger = get_logger(__name__)


def _as_row(data: Any) -> dict[str, Any] | None:
    """First row of a Supabase result, narrowed from the client's JSON union."""
    return cast("dict[str, Any]", data[0]) if data else None


def _as_rows(data: Any) -> list[dict[str, Any]]:
    """All rows of a Supabase result, narrowed from the client's JSON union."""
    return cast("list[dict[str, Any]]", data) if data else []


class SupabaseStateStore:
    """Supabase-backed state store.

    Implements the same interface as NullStateStore so it's a drop-in
    replacement. Initialise once, reuse; the underlying supabase client
    is synchronous but wrapped in async def for API compatibility.

    When SUPABASE_URL is not configured the constructor falls back to the
    NullStateStore — callers never need to care which is active.
    """

    def __init__(self) -> None:
        from src.config.settings import get_settings

        settings = get_settings()

        if not settings.supabase_url or not settings.supabase_anon_key:
            logger.info("Supabase credentials not set — using NullStateStore")
            from src.state.null_store import NullStateStore

            self._delegate: Any = NullStateStore()
            self._real = False
            return

        try:
            from supabase import Client, create_client  # type: ignore[import-untyped]

            self._sb: Client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key or settings.supabase_anon_key,
            )
            self._real = True
            logger.info("SupabaseStateStore connected", url=settings.supabase_url)
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to initialise Supabase — falling back to NullStateStore", error=str(exc))
            from src.state.null_store import NullStateStore

            self._delegate = NullStateStore()
            self._real = False

    # ── Passthrough to delegate when not real ─────────────────────

    def __getattr__(self, name: str) -> Any:
        """Delegate to NullStateStore when real Supabase is not configured."""
        if not object.__getattribute__(self, "_real"):
            return getattr(object.__getattribute__(self, "_delegate"), name)
        raise AttributeError(name)

    @property
    def client(self) -> Any:  # noqa: ANN401
        """Expose raw supabase client for routes that call it directly."""
        if self._real:
            return self._sb
        return self._delegate.client

    # ── Conversations ──────────────────────────────────────────────

    async def save_conversation(
        self,
        conversation_id: str,
        user_id: str | None,
        messages: list[dict[str, Any]],
        context: dict[str, Any] | None = None,
    ) -> None:
        if not self._real:
            return await self._delegate.save_conversation(conversation_id, user_id, messages, context)
        try:
            self._sb.table("conversations").upsert({
                "id": conversation_id,
                "user_id": user_id,
                "messages": messages,
                "context": context or {},
                "updated_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error saving conversation",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="save_conversation",
                )
                raise ConnectionError(
                    f"Failed to save conversation: {str(e)}",
                    "save_conversation",
                    {"conversation_id": conversation_id}
                )
            else:
                logger.error(
                    "Supabase error saving conversation",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="save_conversation",
                )
                raise

    async def load_conversation(self, conversation_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.load_conversation(conversation_id)
        try:
            result = self._sb.table("conversations").select("*").eq("id", conversation_id).execute()
            return _as_row(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error loading conversation",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="load_conversation",
                )
                raise ConnectionError(
                    f"Failed to load conversation: {str(e)}",
                    "load_conversation",
                    {"conversation_id": conversation_id}
                )
            else:
                logger.error(
                    "Supabase error loading conversation",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="load_conversation",
                )
                raise

    async def get_user_conversations(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_user_conversations(user_id, limit)
        try:
            result = (
                self._sb.table("conversations")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .limit(limit)
                .execute()
            )
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting user conversations",
                    user_id=user_id,
                    error=str(e),
                    operation="get_user_conversations",
                )
                raise ConnectionError(
                    f"Failed to get user conversations: {str(e)}",
                    "get_user_conversations",
                    {"user_id": user_id}
                )
            else:
                logger.error(
                    "Supabase error getting user conversations",
                    user_id=user_id,
                    error=str(e),
                    operation="get_user_conversations",
                )
                raise

    # ── Tasks ──────────────────────────────────────────────────────

    async def save_task(
        self,
        task_id: str,
        conversation_id: str | None,
        description: str,
        status: str,
        result: Any = None,
        error: str | None = None,
    ) -> None:
        if not self._real:
            return await self._delegate.save_task(task_id, conversation_id, description, status, result, error)
        try:
            self._sb.table("tasks").upsert({
                "id": task_id,
                "conversation_id": conversation_id,
                "description": description,
                "status": status,
                "result": result,
                "error": error,
                "updated_at": datetime.utcnow().isoformat(),
            }).execute()
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error saving task",
                    task_id=task_id,
                    error=str(e),
                    operation="save_task",
                )
                raise ConnectionError(
                    f"Failed to save task: {str(e)}",
                    "save_task",
                    {"task_id": task_id}
                )
            else:
                logger.error(
                    "Supabase error saving task",
                    task_id=task_id,
                    error=str(e),
                    operation="save_task",
                )
                raise

    async def load_task(self, task_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.load_task(task_id)
        try:
            result = self._sb.table("tasks").select("*").eq("id", task_id).execute()
            return _as_row(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error loading task",
                    task_id=task_id,
                    error=str(e),
                    operation="load_task",
                )
                raise ConnectionError(
                    f"Failed to load task: {str(e)}",
                    "load_task",
                    {"task_id": task_id}
                )
            else:
                logger.error(
                    "Supabase error loading task",
                    task_id=task_id,
                    error=str(e),
                    operation="load_task",
                )
                raise

    async def get_conversation_tasks(self, conversation_id: str) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_conversation_tasks(conversation_id)
        try:
            result = (
                self._sb.table("tasks")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=True)
                .execute()
            )
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting conversation tasks",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="get_conversation_tasks",
                )
                raise ConnectionError(
                    f"Failed to get conversation tasks: {str(e)}",
                    "get_conversation_tasks",
                    {"conversation_id": conversation_id}
                )
            else:
                logger.error(
                    "Supabase error getting conversation tasks",
                    conversation_id=conversation_id,
                    error=str(e),
                    operation="get_conversation_tasks",
                )
                raise

    # ── Agent Runs ─────────────────────────────────────────────────

    async def create_agent_run(
        self,
        task_id: str,
        user_id: str | None,
        agent_name: str,
        agent_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not self._real:
            return await self._delegate.create_agent_run(task_id, user_id, agent_name, agent_id, metadata)
        try:
            run_id = str(uuid4())
            now = datetime.utcnow().isoformat()
            row = {
                "id": run_id,
                "task_id": task_id,
                "user_id": user_id,
                "agent_name": agent_name,
                "agent_id": agent_id,
                "status": "pending",
                "metadata": metadata or {},
                "started_at": now,
            }
            self._sb.table("agent_runs").insert(row).execute()
            return {**row, "completed_at": None}
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error creating agent run",
                    task_id=task_id,
                    agent_name=agent_name,
                    error=str(e),
                    operation="create_agent_run",
                )
                raise ConnectionError(
                    f"Failed to create agent run: {str(e)}",
                    "create_agent_run",
                    {"task_id": task_id, "agent_name": agent_name}
                )
            else:
                logger.error(
                    "Supabase error creating agent run",
                    task_id=task_id,
                    agent_name=agent_name,
                    error=str(e),
                    operation="create_agent_run",
                )
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
        if not self._real:
            return await self._delegate.update_agent_run(
                run_id, status, current_step, progress_percent,
                result, error, verification_attempts, verification_evidence, metadata,
            )
        try:
            updates: dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}
            if status is not None:
                updates["status"] = status
                if status in ("completed", "failed"):
                    updates["completed_at"] = datetime.utcnow().isoformat()
            if current_step is not None:
                updates["current_step"] = current_step
            if progress_percent is not None:
                updates["progress_percent"] = progress_percent
            if result is not None:
                updates["result"] = result
            if error is not None:
                updates["error"] = error
            if verification_attempts is not None:
                updates["verification_attempts"] = verification_attempts
            if verification_evidence is not None:
                updates["verification_evidence"] = verification_evidence
            if metadata is not None:
                updates["metadata"] = metadata
            res = self._sb.table("agent_runs").update(updates).eq("id", run_id).execute()
            return _as_row(res.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error updating agent run",
                    run_id=run_id,
                    error=str(e),
                    operation="update_agent_run",
                )
                raise ConnectionError(
                    f"Failed to update agent run: {str(e)}",
                    "update_agent_run",
                    {"run_id": run_id}
                )
            else:
                logger.error(
                    "Supabase error updating agent run",
                    run_id=run_id,
                    error=str(e),
                    operation="update_agent_run",
                )
                raise

    async def get_agent_run(self, run_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.get_agent_run(run_id)
        try:
            result = self._sb.table("agent_runs").select("*").eq("id", run_id).execute()
            return _as_row(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting agent run",
                    run_id=run_id,
                    error=str(e),
                    operation="get_agent_run",
                )
                raise ConnectionError(
                    f"Failed to get agent run: {str(e)}",
                    "get_agent_run",
                    {"run_id": run_id}
                )
            else:
                logger.error(
                    "Supabase error getting agent run",
                    run_id=run_id,
                    error=str(e),
                    operation="get_agent_run",
                )
                raise

    async def get_task_agent_runs(self, task_id: str, limit: int = 10) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_task_agent_runs(task_id, limit)
        try:
            result = (
                self._sb.table("agent_runs")
                .select("*")
                .eq("task_id", task_id)
                .order("started_at", desc=True)
                .limit(limit)
                .execute()
            )
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting task agent runs",
                    task_id=task_id,
                    error=str(e),
                    operation="get_task_agent_runs",
                )
                raise ConnectionError(
                    f"Failed to get task agent runs: {str(e)}",
                    "get_task_agent_runs",
                    {"task_id": task_id}
                )
            else:
                logger.error(
                    "Supabase error getting task agent runs",
                    task_id=task_id,
                    error=str(e),
                    operation="get_task_agent_runs",
                )
                raise

    async def get_active_agent_runs(self, user_id: str) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_active_agent_runs(user_id)
        try:
            result = (
                self._sb.table("agent_runs")
                .select("*")
                .eq("user_id", user_id)
                .in_("status", ["pending", "in_progress"])
                .execute()
            )
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting active agent runs",
                    user_id=user_id,
                    error=str(e),
                    operation="get_active_agent_runs",
                )
                raise ConnectionError(
                    f"Failed to get active agent runs: {str(e)}",
                    "get_active_agent_runs",
                    {"user_id": user_id}
                )
            else:
                logger.error(
                    "Supabase error getting active agent runs",
                    user_id=user_id,
                    error=str(e),
                    operation="get_active_agent_runs",
                )
                raise

    # ── Domain Memory ──────────────────────────────────────────────

    async def create_memory(
        self,
        domain: str,
        category: str,
        key: str,
        value: dict[str, Any],
        user_id: str | None = None,
        embedding: list[float] | None = None,
        source: str | None = None,
        tags: list[str] | None = None,
    ) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.create_memory(domain, category, key, value, user_id, embedding, source, tags)
        try:
            row: dict[str, Any] = {
                "id": str(uuid4()),
                "domain": domain,
                "category": category,
                "key": key,
                "value": value,
                "user_id": user_id,
                "source": source,
                "tags": tags or [],
            }
            if embedding:
                row["embedding"] = embedding
            res = self._sb.table("domain_memories").insert(row).execute()
            return _as_row(res.data) or row
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error creating memory",
                    domain=domain,
                    category=category,
                    key=key,
                    error=str(e),
                    operation="create_memory",
                )
                raise ConnectionError(
                    f"Failed to create memory: {str(e)}",
                    "create_memory",
                    {"domain": domain, "category": category, "key": key}
                )
            else:
                logger.error(
                    "Supabase error creating memory",
                    domain=domain,
                    category=category,
                    key=key,
                    error=str(e),
                    operation="create_memory",
                )
                raise

    async def get_memory(self, memory_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.get_memory(memory_id)
        try:
            result = self._sb.table("domain_memories").select("*").eq("id", memory_id).execute()
            return _as_row(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error getting memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="get_memory",
                )
                raise ConnectionError(
                    f"Failed to get memory: {str(e)}",
                    "get_memory",
                    {"memory_id": memory_id}
                )
            else:
                logger.error(
                    "Supabase error getting memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="get_memory",
                )
                raise

    async def update_memory(self, memory_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.update_memory(memory_id, updates)
        try:
            res = self._sb.table("domain_memories").update(updates).eq("id", memory_id).execute()
            return _as_row(res.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error updating memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="update_memory",
                )
                raise ConnectionError(
                    f"Failed to update memory: {str(e)}",
                    "update_memory",
                    {"memory_id": memory_id}
                )
            else:
                logger.error(
                    "Supabase error updating memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="update_memory",
                )
                raise

    async def delete_memory(self, memory_id: str) -> bool:
        if not self._real:
            return await self._delegate.delete_memory(memory_id)
        try:
            self._sb.table("domain_memories").delete().eq("id", memory_id).execute()
            return True
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error deleting memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="delete_memory",
                )
                raise ConnectionError(
                    f"Failed to delete memory: {str(e)}",
                    "delete_memory",
                    {"memory_id": memory_id}
                )
            else:
                logger.error(
                    "Supabase error deleting memory",
                    memory_id=memory_id,
                    error=str(e),
                    operation="delete_memory",
                )
                raise

    async def query_memories(
        self,
        domain: str | None = None,
        category: str | None = None,
        user_id: str | None = None,
        tags: list[str] | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.query_memories(domain, category, user_id, tags, limit, offset)
        try:
            q = self._sb.table("domain_memories").select("*")
            if domain:
                q = q.eq("domain", domain)
            if category:
                q = q.eq("category", category)
            if user_id:
                q = q.eq("user_id", user_id)
            result = q.range(offset, offset + limit - 1).execute()
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error querying memories",
                    domain=domain,
                    category=category,
                    user_id=user_id,
                    error=str(e),
                    operation="query_memories",
                )
                raise ConnectionError(
                    f"Failed to query memories: {str(e)}",
                    "query_memories",
                    {"domain": domain, "category": category, "user_id": user_id}
                )
            else:
                logger.error(
                    "Supabase error querying memories",
                    domain=domain,
                    category=category,
                    user_id=user_id,
                    error=str(e),
                    operation="query_memories",
                )
                raise

    async def find_similar_memories(
        self,
        query_embedding: list[float],
        domain: str | None = None,
        user_id: str | None = None,
        match_threshold: float = 0.7,
        match_count: int = 10,
    ) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.find_similar_memories(
                query_embedding, domain, user_id, match_threshold, match_count
            )
        # Uses pgvector RPC function expected in Supabase schema
        try:
            params: dict[str, Any] = {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
            }
            if domain:
                params["filter_domain"] = domain
            if user_id:
                params["filter_user_id"] = user_id
            result = self._sb.rpc("match_domain_memories", params).execute()
            return _as_rows(result.data)
        except Exception as e:
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                logger.error(
                    "Supabase connection error finding similar memories",
                    domain=domain,
                    user_id=user_id,
                    error=str(e),
                    operation="find_similar_memories",
                )
                raise ConnectionError(
                    f"Failed to find similar memories: {str(e)}",
                    "find_similar_memories",
                    {"domain": domain, "user_id": user_id}
                )
            else:
                logger.error(
                    "Supabase error finding similar memories",
                    domain=domain,
                    user_id=user_id,
                    error=str(e),
                    operation="find_similar_memories",
                )
                raise
