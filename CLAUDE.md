# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo: Next.js 15 frontend + FastAPI/LangGraph backend + Supabase. Dual orchestration via SKILL.md files and Python agents.

## Commands

```bash
pnpm dev                          # All services
pnpm dev --filter=web             # Frontend
cd apps/backend && uv run uvicorn src.api.main:app --reload  # Backend
pnpm turbo run test               # All tests
cd apps/backend && uv run pytest -k "name"  # Single Python test
pnpm turbo run type-check lint    # Checks
supabase db push                  # Apply migrations
```

## Architecture

| Layer | Path | Stack |
|-------|------|-------|
| Frontend | `apps/web/` | Next.js 15, React 19, Tailwind v4, shadcn/ui |
| Backend | `apps/backend/src/` | FastAPI, LangGraph, Pydantic |
| Database | `supabase/` | PostgreSQL, pgvector, RLS |

**Backend modules:** `agents/` (orchestrator, long_running/, base_agent), `tools/` (registry, search, programmatic), `verification/`, `graphs/`, `skills/`

## Key Systems

- **Orchestrator** (`agents/orchestrator.py`): Routes tasks, enforces independent verification, integrates tool use + long-running harness
- **Advanced Tools** (`tools/`): Tool Search (85% context reduction), Programmatic Calling, defer_loading
- **Long-Running** (`agents/long_running/`): InitializerAgent + CodingAgent for multi-session work via `claude-progress.txt` and `feature_list.json`
- **Verification** (`verification/`): No self-attestation, evidence collection, human escalation

## Rules

**Frontend layers:** Components → Hooks → API Routes → Services → Repositories → DB. No cross-imports. Explicit return types. No `any`.

**Patterns:** API routes use try/catch + validate + service. Components handle loading/error/empty states.

**Naming:** React `PascalCase.tsx`, utils `kebab-case.ts`, Python `snake_case.py`, skills `SCREAMING-KEBAB.md`

**Python:** Type hints, Pydantic, async/await, PEP 8

## Skills

`/skills/*.md` define agent behaviors with YAML frontmatter (name, triggers, priority). Key: `ORCHESTRATOR.md`, `core/VERIFICATION.md`, `backend/ADVANCED-TOOL-USE.md`, `backend/LONG-RUNNING-AGENTS.md`

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
BACKEND_URL=http://localhost:8000
```

## New Agent

Extend `BaseAgent` in `agents/`, register in `AgentRegistry`, add SKILL.md. Use `start_task()`, `report_output()`, `get_task_output()`.
