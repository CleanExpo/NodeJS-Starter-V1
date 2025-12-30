# Project Memory

> **Monorepo**: Next.js 15 frontend + FastAPI/LangGraph backend + Supabase database with AI agent orchestration

## Quick Commands

```bash
# Development (choose one)
pnpm dev                          # All services
pnpm dev --filter=web             # Frontend only  
cd apps/backend && uv run uvicorn src.api.main:app --reload  # Backend only

# Database
supabase start && supabase db push   # Start and apply migrations

# Testing & Quality
pnpm turbo run type-check lint test  # All checks
.\scripts\health-check.ps1            # System health check

# Pre-PR Check
pnmp turbo run type-check lint test && echo "✅ Ready for PR"
```

## Architecture Overview

| Layer | Path | Stack |
|-------|------|-------|
| Frontend | `apps/web/` | Next.js 15, React 19, Tailwind v4, shadcn/ui |
| Backend | `apps/backend/src/` | FastAPI, LangGraph, Pydantic |
| Database | `supabase/` | PostgreSQL, pgvector, RLS |

## Key Systems

- **Orchestrator** (`apps/backend/src/agents/orchestrator.py`): Routes tasks, enforces independent verification
- **Advanced Tools** (`apps/backend/src/tools/`): Tool Search, Programmatic Calling, defer_loading
- **Long-Running** (`apps/backend/src/agents/long_running/`): Multi-session agents via progress files
- **Verification** (`apps/backend/src/verification/`): Independent verification, no self-attestation
- **Domain Memory** (`apps/backend/src/memory/`): Vector-based persistent memory with embeddings
- **Health Checks** (`scripts/health-check.ps1`): 6-phase comprehensive validation

## Environment Setup

Required `.env` variables:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
BACKEND_URL=http://localhost:8000
```

## Rules Structure

Path-specific rules automatically load based on files being worked on:

- **Frontend Rules**: Load when working in `apps/web/**/*.{ts,tsx}`
- **Backend Rules**: Load when working in `apps/backend/src/**/*.py`  
- **Database Rules**: Load when working in `supabase/**/*.sql`
- **Skills Rules**: Load when working in `skills/**/*.md`
- **Development Rules**: General workflow and conventions

## Memory Hierarchy

1. **Enterprise Policy**: Organization-wide (if exists)
2. **Project Memory**: This file (`.claude/CLAUDE.md`)
3. **Project Rules**: Path-specific rules (`.claude/rules/*.md`)
4. **User Memory**: Personal preferences (`~/.claude/CLAUDE.md`)
5. **Project Local**: Personal project settings (`./CLAUDE.local.md`)

## Important Notes

- **Verification First**: Always verify before marking complete - run actual tests
- **No Self-Attestation**: Agents cannot verify their own work
- **Type Safety**: Explicit return types, no `any`, strict mode
- **Layer Separation**: No cross-layer imports in architecture
- **Path-Specific Loading**: Rules only load when relevant to reduce context bloat

---

For detailed patterns and examples, see the path-specific rules that load automatically based on your current work context.
