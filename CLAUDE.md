# CLAUDE.md — NodeJS-Starter-V1

> Self-contained AI starter template: Next.js 15 + FastAPI/LangGraph + PostgreSQL. Everything runs locally in Docker.

## Quick Commands

```bash
# Setup
pnpm run setup              # Unix/macOS
pnpm run setup:windows      # Windows

# Development
pnpm dev                    # Start all services
pnpm run verify             # Health check
just --list                 # View all task runner commands

# Docker
pnpm run docker:up          # Start PostgreSQL + Redis
pnpm run docker:down        # Stop services
pnpm run docker:reset       # Reset database

# Quality
pnpm turbo run test         # All tests
pnpm turbo run lint         # Linting
pnpm turbo run type-check   # Type checking

# Beads (AI Agent Memory)
.bin/bd.exe ready           # Show unblocked tasks
.bin/bd.exe create "Title"  # Create new task
.bin/bd.exe sync            # Sync to git
```

## Architecture Routing

| What                                         | Where                           |
| -------------------------------------------- | ------------------------------- |
| Frontend (Next.js 15, React 19, Tailwind v4) | `apps/web/`                     |
| Backend (FastAPI, LangGraph, SQLAlchemy 2.0) | `apps/backend/`                 |
| API client                                   | `apps/web/lib/api/client.ts`    |
| JWT middleware                               | `apps/web/middleware.ts`        |
| AI agents                                    | `apps/backend/src/agents/`      |
| FastAPI routes                               | `apps/backend/src/api/`         |
| JWT auth                                     | `apps/backend/src/auth/jwt.py`  |
| SQLAlchemy models                            | `apps/backend/src/db/`          |
| Database schema                              | `scripts/init-db.sql`           |
| Design tokens                                | `apps/web/lib/design-tokens.ts` |

## Knowledge Retrieval

Query before loading docs into context. Priority: NotebookLM → Context7 MCP → Skills → Codebase → Web.

| Source       | Use For                                     | Access                                    |
| ------------ | ------------------------------------------- | ----------------------------------------- |
| NotebookLM   | Architecture, debugging, security           | `nlm notebook query <id>`                 |
| Context7 MCP | Library docs (Next.js, FastAPI, Playwright) | `resolve-library-id` → `get-library-docs` |
| Skills       | Pattern libraries (65 installed)            | `.skills/custom/*/SKILL.md`               |

Config: `.claude/notebooklm/notebooks.json` | Registry: `.skills/AGENTS.md`

## Design System — Scientific Luxury

**Background**: OLED Black `#050505` | **Corners**: `rounded-sm` only | **Animations**: Framer Motion only

**Spectral colours**: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)

Full system: `docs/DESIGN_SYSTEM.md` | Skill: `.skills/custom/scientific-luxury/SKILL.md`

## Testing Discipline

**Iron Law**: No production code without a failing test first. See `.skills/custom/tdd/SKILL.md`.

| Layer    | Runner | Location              | Command                               |
| -------- | ------ | --------------------- | ------------------------------------- |
| Frontend | vitest | `apps/web/__tests__/` | `pnpm test --filter=web`              |
| Backend  | pytest | `apps/backend/tests/` | `cd apps/backend && uv run pytest -v` |
| All      | turbo  | Both                  | `pnpm turbo run test`                 |

**Three mandatory skills**: `tdd` | `systematic-debugging` | `verification-before-completion`

**Banned phrases** (run the command instead): "should work", "probably passes", "seems correct", "likely fixed"

## Key Principles

1. **Local-First** — Everything runs locally. No cloud required for development.
2. **Zero Barriers** — No API keys, accounts, or configuration needed to start.
3. **Production Ready** — Real authentication, testing, CI/CD included.
4. **Retrieval-First** — Query Context7/NotebookLM/Skills before loading docs into context.
5. **Test-First** — TDD enforced. No production code without a failing test.

## Agents & Multi-Agent Harness

- **29 subagents**: `.claude/agents/*/agent.md` | **65 skills**: `.skills/AGENTS.md` | **10 commands**: `.claude/commands/*.md`
- **8-phase idea-to-production harness**: `.claude/AGENT_HARNESS.md`
- **Orchestrator**: `.claude/agents/orchestrator/agent.md`

## Context Drift Defence

If rules feel ignored after compaction: `cat .claude/memory/CONSTITUTION.md`
Full docs: `.claude/rules/context-drift.md` | Saved state: `.claude/memory/current-state.md`

## Default Credentials (Dev Only)

`admin@local.dev` / `admin123` | Auth routes: `apps/backend/src/api/routes/auth.py`
DB migrations: `apps/backend/alembic/versions/` | Env vars: `.env.example`

## Solution Library

This repo is the **authoritative source** for reusable Claude dev assets (agents, skills, workflows).
Commands: `/lib add`, `/lib use`, `/lib push`, `/lib list`, `/lib search`, `/lib audit`
Registry: `solution-library/registry/` | Install in other projects: `solution-library/INSTALL.md`

## Documentation

| Document                           | Purpose          |
| ---------------------------------- | ---------------- |
| `PROGRESS.md`                      | Project status   |
| `docs/LOCAL_SETUP.md`              | Setup guide      |
| `docs/DESIGN_SYSTEM.md`            | Design system    |
| `docs/MULTI_AGENT_ARCHITECTURE.md` | Agent workflow   |
| `docs/production-deployment.md`    | Deployment guide |
