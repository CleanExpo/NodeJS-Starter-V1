"""Supabase state store — real persistence when credentials are available.

Falls back to NullStateStore when SUPABASE_URL / SUPABASE_ANON_KEY are not set,
preserving the zero-config local development experience.

Import pattern (12+ modules keep this import path):
    from src.state.supabase import SupabaseStateStore
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from src.utils import get_logger

logger = get_logger(__name__)


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
        self._sb.table("conversations").upsert({
            "id": conversation_id,
            "user_id": user_id,
            "messages": messages,
            "context": context or {},
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()

    async def load_conversation(self, conversation_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.load_conversation(conversation_id)
        result = self._sb.table("conversations").select("*").eq("id", conversation_id).execute()
        return result.data[0] if result.data else None

    async def get_user_conversations(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_user_conversations(user_id, limit)
        result = (
            self._sb.table("conversations")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []

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
        self._sb.table("tasks").upsert({
            "id": task_id,
            "conversation_id": conversation_id,
            "description": description,
            "status": status,
            "result": result,
            "error": error,
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()

    async def load_task(self, task_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.load_task(task_id)
        result = self._sb.table("tasks").select("*").eq("id", task_id).execute()
        return result.data[0] if result.data else None

    async def get_conversation_tasks(self, conversation_id: str) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_conversation_tasks(conversation_id)
        result = (
            self._sb.table("tasks")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []

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
        return res.data[0] if res.data else None

    async def get_agent_run(self, run_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.get_agent_run(run_id)
        result = self._sb.table("agent_runs").select("*").eq("id", run_id).execute()
        return result.data[0] if result.data else None

    async def get_task_agent_runs(self, task_id: str, limit: int = 10) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_task_agent_runs(task_id, limit)
        result = (
            self._sb.table("agent_runs")
            .select("*")
            .eq("task_id", task_id)
            .order("started_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []

    async def get_active_agent_runs(self, user_id: str) -> list[dict[str, Any]]:
        if not self._real:
            return await self._delegate.get_active_agent_runs(user_id)
        result = (
            self._sb.table("agent_runs")
            .select("*")
            .eq("user_id", user_id)
            .in_("status", ["pending", "in_progress"])
            .execute()
        )
        return result.data or []

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
        return res.data[0] if res.data else row

    async def get_memory(self, memory_id: str) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.get_memory(memory_id)
        result = self._sb.table("domain_memories").select("*").eq("id", memory_id).execute()
        return result.data[0] if result.data else None

    async def update_memory(self, memory_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        if not self._real:
            return await self._delegate.update_memory(memory_id, updates)
        res = self._sb.table("domain_memories").update(updates).eq("id", memory_id).execute()
        return res.data[0] if res.data else None

    async def delete_memory(self, memory_id: str) -> bool:
        if not self._real:
            return await self._delegate.delete_memory(memory_id)
        self._sb.table("domain_memories").delete().eq("id", memory_id).execute()
        return True

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
        q = self._sb.table("domain_memories").select("*")
        if domain:
            q = q.eq("domain", domain)
        if category:
            q = q.eq("category", category)
        if user_id:
            q = q.eq("user_id", user_id)
        result = q.range(offset, offset + limit - 1).execute()
        return result.data or []

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
        return result.data or []
