# CLAUDE.md

> **⚡ NEW: This project now uses Claude's modular memory system!**
> 
> **Main project memory**: `.claude/CLAUDE.md`
> **Path-specific rules**: `.claude/rules/` (auto-load based on files you're working on)
> **Documentation**: `docs/claude-memory-system.md`

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo: Next.js 15 frontend + FastAPI/LangGraph backend + Supabase. Dual orchestration via SKILL.md files and Python agents.

## Commands

```bash
# Development
pnpm dev                          # All services
pnpm dev --filter=web             # Frontend only
cd apps/backend && uv run uvicorn src.api.main:app --reload  # Backend only

# Database
supabase start                    # Start local Supabase
supabase db push                  # Apply migrations
supabase db reset                 # Reset database (destructive)
.\scripts\init-database.ps1       # Initialize database with validation
.\scripts\validate-database.ps1   # Validate database setup

# Testing
pnpm turbo run test               # All tests
pnpm test --filter=web            # Frontend unit tests
pnpm test:coverage --filter=web   # Frontend with coverage (75% lines, 70% branches/functions)
pnpm test:e2e --filter=web        # Playwright E2E tests
cd apps/backend && uv run pytest  # Backend unit tests
cd apps/backend && uv run pytest -k "name"  # Single Python test
cd apps/backend && uv run pytest tests/integration/ -m integration  # Integration tests

# Quality Checks
pnpm turbo run type-check lint    # All checks
.\scripts\health-check.ps1        # Comprehensive system health check
.\scripts\health-check.ps1 -Quick # Fast health check (skip build/E2E)

# Backend Quality
cd apps/backend && uv run mypy src --strict    # Type checking
cd apps/backend && uv run ruff check src       # Linting
cd apps/backend && uv run python scripts/setup-memory.py  # Memory system validation
```

## Architecture

| Layer | Path | Stack |
|-------|------|-------|
| Frontend | `apps/web/` | Next.js 15, React 19, Tailwind v4, shadcn/ui |
| Backend | `apps/backend/src/` | FastAPI, LangGraph, Pydantic |
| Database | `supabase/` | PostgreSQL, pgvector, RLS |

**Backend modules:** `agents/` (orchestrator, long_running/, base_agent), `tools/` (registry, search, programmatic), `verification/`, `graphs/`, `skills/`, `memory/` (store, models, embeddings), `state/` (supabase)

**Frontend health endpoints:**
- `/api/health` - Basic status (uptime, version, environment)
- `/api/health/deep` - Full dependency checks (database, backend, verification system) with latency
- `/api/health/routes?verify=true` - API route discovery and validation

**Backend health endpoints:**
- `/health` - Basic health check
- `/ready` - Readiness probe (k8s/load balancer)

## Key Systems

- **Orchestrator** (`agents/orchestrator.py`): Routes tasks, enforces independent verification, integrates tool use + long-running harness
- **Advanced Tools** (`tools/`): Tool Search (85% context reduction), Programmatic Calling, defer_loading
- **Long-Running** (`agents/long_running/`): InitializerAgent + CodingAgent for multi-session work via `claude-progress.txt` and `feature_list.json`
- **Verification** (`verification/`): No self-attestation, evidence collection, human escalation
- **Domain Memory** (`memory/`): Vector-based persistent memory across sessions with embeddings (1536-dim). Tables: `domain_memories`, `domain_knowledge`, `user_preferences`, `test_failure_patterns`, `test_results`, `debugging_sessions`
- **Health Checks** (`scripts/health-check.ps1`): 6-phase comprehensive validation (prerequisites, database, backend, frontend, integration, summary)

## Rules

**Frontend layers:** Components → Hooks → API Routes → Services → Repositories → DB. No cross-imports. Explicit return types. No `any`.

**Patterns:** API routes use try/catch + validate + service. Components handle loading/error/empty states.

**Naming:** React `PascalCase.tsx`, utils `kebab-case.ts`, Python `snake_case.py`, skills `SCREAMING-KEBAB.md`

**Python:** Type hints, Pydantic, async/await, PEP 8

## Skills

`/skills/*.md` define agent behaviors with YAML frontmatter (name, triggers, priority). Key: `ORCHESTRATOR.md`, `core/VERIFICATION.md`, `backend/ADVANCED-TOOL-USE.md`, `backend/LONG-RUNNING-AGENTS.md`

## Database Schema

8 migrations in `supabase/migrations/`:
1. **init** - UUID extension, `update_updated_at_column()` trigger
2. **auth_schema** - `profiles` table (extends auth.users), RLS policies, auto-profile trigger
3. **enable_pgvector** - Vector extension, `documents` table (1536-dim embeddings), `match_documents()`, IVFFlat index
4. **state_tables** - `conversations`, `tasks` (status: pending/in_progress/completed/failed/blocked)
5. **audit_evidence** - `audit_evidence`, `verification_results`, `audit_runs`, `audit_alerts`, `audit_schedules`, `friction_analyses`, `route_audit_results`
6. **copywriting_consistency** - `businesses`, `platform_listings`, `consistency_audits`, `schema_markup`, `audience_research`, `competitor_analyses`, `content_pieces`, `brand_guidelines`
7. **agent_runs_realtime** - `agent_runs` with real-time subscription, status tracking (pending → in_progress → awaiting_verification → verification_passed/failed → completed/failed/blocked/escalated_to_human)
8. **domain_memory** - `domain_memories`, `domain_knowledge`, `user_preferences`, `test_failure_patterns`, `test_results`, `debugging_sessions` with vector search

## Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=              # Preferred for embeddings
BACKEND_URL=http://localhost:8000
```

## New Agent

Extend `BaseAgent` in `agents/`, register in `AgentRegistry`, add SKILL.md. Use `start_task()`, `report_output()`, `get_task_output()`.

---

## AGENTS.md Hierarchy

This repo uses a hierarchical AGENTS.md system (nearest-wins):

| Package | AGENTS.md | Purpose |
|---------|-----------|---------|
| Root | `AGENTS.md` | Universal commands, JIT index |
| Frontend | `apps/web/AGENTS.md` | Components, design system, patterns |
| Backend | `apps/backend/AGENTS.md` | FastAPI, agents, verification |
| Database | `supabase/AGENTS.md` | Migrations, RLS, pgvector |
| Skills | `skills/AGENTS.md` | Skill format, routing, priorities |

---

## Best Practices (Anthropic Recommended)

### Explore, Plan, Code, Commit

1. **Explore**: Read relevant files, understand patterns. Use subagents for complex investigation.
2. **Plan**: Use "think" / "think hard" / "ultrathink" for deeper reasoning. Document plan before coding.
3. **Code**: Implement solution, verify as you go.
4. **Commit**: Create descriptive commit message, update docs if needed.

### Test-Driven Development

1. Write tests based on expected input/output (don't mock implementations)
2. Confirm tests fail (no implementation code yet)
3. Commit tests
4. Write code to pass tests (don't modify tests)
5. Iterate until all tests pass
6. Commit code

### Effective Prompting

**Be specific** - reduces course corrections:
```
❌ "add tests for foo.py"
✅ "write a new test case for foo.py, covering the edge case where the user is logged out. avoid mocks"

❌ "add a calendar widget"
✅ "look at how existing widgets are implemented (see HotDogWidget.php). follow the pattern to implement a calendar widget with month selection and year pagination. build from scratch without new libraries."
```

### Working with Claude Code

- **Images**: Drag-drop, paste screenshots, or provide file paths
- **URLs**: Paste URLs directly in prompts; add domains to allowlist with `/permissions`
- **Course correct**: Press `Escape` to interrupt; double-tap to edit previous prompt
- **Use `/clear`**: Reset context between tasks to maintain focus
- **Checklists**: For large tasks, have Claude use a Markdown file as a working scratchpad

### Extended Thinking Triggers

| Phrase | Budget Level |
|--------|--------------|
| "think" | Low |
| "think hard" | Medium |
| "think harder" | High |
| "ultrathink" | Maximum |

### Verification First

IMPORTANT: Always verify before marking complete:
- Run the actual build/tests
- Check actual output
- Confirm expected behavior
- Never assume - VERIFY EVERYTHING

### Multi-Claude Workflows

- **Review Pattern**: One Claude writes code, another reviews
- **Git Worktrees**: Multiple checkouts for parallel independent tasks
- **Headless Mode**: `claude -p "prompt"` for CI/automation

### Common Slash Commands

```bash
/init              # Generate CLAUDE.md
/permissions       # Manage tool allowlist
/clear             # Reset context
#                  # Add instruction to CLAUDE.md
```

### Pre-PR Checklist

```bash
# Single command - all checks
pnpm turbo run type-check lint test && echo "✅ Ready for PR"
```
