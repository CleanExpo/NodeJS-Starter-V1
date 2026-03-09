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

# Skill Manager
/skill-manager analyse      # Analyse skill gaps
/skill-manager generate X   # Generate new skill

# Browser Automation
/ui-review run              # Execute UI stories via Playwright
/automate-browser <task>    # Ad-hoc browser automation
```

## Architecture Routing

| What | Where |
|------|-------|
| Frontend (Next.js 15, React 19, Tailwind v4) | `apps/web/` |
| Backend (FastAPI, LangGraph, SQLAlchemy 2.0) | `apps/backend/` |
| API client (fetch wrapper) | `apps/web/lib/api/client.ts` |
| Auth API | `apps/web/lib/api/auth.ts` |
| JWT middleware | `apps/web/middleware.ts` |
| AI agents | `apps/backend/src/agents/` |
| FastAPI routes | `apps/backend/src/api/` |
| JWT auth | `apps/backend/src/auth/jwt.py` |
| Database config | `apps/backend/src/config/database.py` |
| SQLAlchemy models | `apps/backend/src/db/` |
| AI provider abstraction | `apps/backend/src/models/` |
| State store (NullStateStore) | `apps/backend/src/state/` |
| Database schema | `scripts/init-db.sql` |
| Design tokens | `apps/web/lib/design-tokens.ts` |
| Playwright config | `apps/web/playwright.config.ts` |

## Knowledge Retrieval

Query knowledge sources before loading docs into context. See `.claude/rules/retrieval-first.md`.

| Source | Use For | Access |
|--------|---------|--------|
| **NotebookLM** | Architecture, debugging, security, onboarding | `nlm notebook query <id>` |
| **Context7 MCP** | Library docs (Next.js, FastAPI, Playwright, etc.) | `resolve-library-id` → `get-library-docs` |
| **Skills** (65 installed) | Pattern libraries | `.skills/custom/*/SKILL.md` |
| **Jina Reader** | Web content extraction | `https://r.jina.ai/{url}` |

NotebookLM config: `.claude/notebooklm/notebooks.json`
Full skill registry: `.skills/AGENTS.md`

## Authentication Flow

1. **Login**: `POST /api/auth/login` → bcrypt verify → account lockout check → JWT cookie
2. **Protected Routes**: Frontend middleware checks cookie; backend `AuthMiddleware` validates JWT
3. **Logout**: `POST /api/auth/logout` → clear cookie

### Auth Endpoints (`/api/auth/*`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Authenticate + set JWT cookie |
| POST | `/api/auth/logout` | Clear cookie (stateless) |
| GET | `/api/auth/me` | Current user profile |
| PATCH | `/api/auth/me` | Update display name |
| POST | `/api/auth/change-password` | Change password (current required) |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password` | Consume token + set new password |

**Security**: 5 failed logins → 15-min lockout. Reset tokens are SHA-256 hashed, single-use, 60-min TTL.

Files: `apps/backend/src/api/routes/auth.py`, `apps/backend/src/auth/jwt.py`, `apps/web/middleware.ts`
Default credentials: `admin@local.dev` / `admin123`

## AI Provider System

```bash
# Default: Ollama (local, free)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Optional: Claude (cloud, paid)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
```

Provider interface: `complete()`, `chat()`, `generate_embeddings()`
Selector: `apps/backend/src/models/selector.py`

## Environment Variables (Required — All Have Defaults)

```bash
DATABASE_URL=postgresql://starter_user:local_dev_password@localhost:5432/starter_db
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRE_MINUTES=60
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
```

Full list with production notes: `.env.example` | Deployment guide: `docs/production-deployment.md`

## Database Migrations

Alembic manages schema changes. Run migrations after `docker:up`:

```bash
cd apps/backend
uv run alembic upgrade head      # Apply all pending migrations
uv run alembic revision --autogenerate -m "description"  # Generate new migration
uv run alembic downgrade -1      # Roll back one step
```

Migration files: `apps/backend/alembic/versions/`

## State Store

Supabase removed. Backend uses **NullStateStore** — no external dependency required.

| File | Purpose |
|------|---------|
| `src/state/null_store.py` | NullStateStore + `_NullTableClient` chain |
| `src/state/supabase.py` | Re-export shim (`NullStateStore as SupabaseStateStore`) |
| `src/state/__init__.py` | `get_state_store()` factory |
| `src/utils/supabase_client.py` | Safe `_NullClient` shim |

## Design System — Scientific Luxury

| Element | Implementation |
|---------|---------------|
| Background | OLED Black (`#050505`) |
| Borders | `border-[0.5px] border-white/[0.06]` |
| Corners | Sharp only (`rounded-sm`) |
| Typography | JetBrains Mono (data), Editorial (names) |
| Animations | Framer Motion only |
| Layout | Timeline/orbital |

**Spectral colours**: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)

Full system + banned elements: `docs/DESIGN_SYSTEM.md` | Skill: `.skills/custom/scientific-luxury/SKILL.md`

## Testing Discipline

**Iron Law**: No production code without a failing test first. See `.skills/custom/tdd/SKILL.md`.

| Layer | Runner | Test Location | Command |
|-------|--------|---------------|---------|
| Frontend (React/Next.js) | vitest | `apps/web/__tests__/` | `pnpm test --filter=web` |
| Backend (FastAPI/Python) | pytest | `apps/backend/tests/` | `cd apps/backend && uv run pytest -v` |
| All | turbo | Both | `pnpm turbo run test` |

**Three mandatory skills** for all coding tasks:
- **`tdd`** — Write failing test → watch fail → write minimal code → watch pass → refactor
- **`systematic-debugging`** — 4-phase root-cause protocol with 3-attempt circuit breaker
- **`verification-before-completion`** — Run commands and read output before any "Done" claim

**Banned phrases** (run the command instead): "should work", "probably passes", "seems correct", "likely fixed"

## Key Principles

1. **Local-First** — Everything runs locally. No cloud required for development.
2. **Zero Barriers** — No API keys, accounts, or configuration needed to start.
3. **Production Ready** — Real authentication, testing, CI/CD included.
4. **Retrieval-First** — Query Context7/NotebookLM/Skills before loading docs into context.
5. **Test-First** — TDD enforced. No production code without a failing test. See Testing Discipline above.

## Context Drift Prevention

Context drift occurs when project rules are lost during automatic context compaction.
This project has a 4-pillar defence built in:

| Pillar | Mechanism | File |
|--------|-----------|------|
| Immutable rules | CONSTITUTION.md on disk | `.claude/memory/CONSTITUTION.md` |
| Session injection | SessionStart hook | `session-start-context.ps1` |
| Per-message compass | UserPromptSubmit hook | `user-prompt-compass.ps1` |
| Pre-compaction save | PreCompact hook | `pre-compact-save.py` |

If you notice drift (wrong patterns, ignored rules), run:

```bash
cat .claude/memory/CONSTITUTION.md   # Re-read immutable rules
cat .claude/memory/current-state.md  # Check saved state
```

Full documentation: `.claude/rules/context-drift.md`

## Agents & Skills

- **23 subagents**: `.claude/agents/*/agent.md`
- **65 skills**: `.skills/AGENTS.md` (full registry)
- **10 commands**: `.claude/commands/*.md`
- **Orchestrator**: `.claude/agents/orchestrator/agent.md`

## Documentation

| Document | Purpose |
|----------|---------|
| [`PROGRESS.md`](PROGRESS.md) | Project status |
| [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md) | Setup guide |
| [`docs/AI_PROVIDERS.md`](docs/AI_PROVIDERS.md) | Ollama vs Claude |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Design system |
| [`docs/BEADS.md`](docs/BEADS.md) | AI agent memory |
| [`docs/SPEC_GENERATION.md`](docs/SPEC_GENERATION.md) | Spec workflows |
| [`docs/OPTIONAL_SERVICES.md`](docs/OPTIONAL_SERVICES.md) | Cloud upgrades |
| [`docs/MULTI_AGENT_ARCHITECTURE.md`](docs/MULTI_AGENT_ARCHITECTURE.md) | Agent workflow |
