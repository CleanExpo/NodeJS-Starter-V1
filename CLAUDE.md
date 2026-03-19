# CLAUDE.md — NodeJS-Starter-V1

> Self-contained AI starter template: Next.js 15 + FastAPI/LangGraph + PostgreSQL. Everything runs locally in Docker.

## Operational Constitution

> **REQUIRED**: Load `memory.md` before any planning, delegation, execution, or completion claim.
> This is the permanent governance layer for all reasoning in this repository.

```bash
cat memory.md   # Load before every reasoning session
```

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

# Vault Index System
pnpm vault:index            # Regenerate all indexes
pnpm vault:validate         # Check for broken wiki-links
pnpm vault:adopt            # Add frontmatter to files
/vault-init                 # Full vault initialisation
```

## Architecture Routing

| What                                         | Where                                 |
| -------------------------------------------- | ------------------------------------- |
| Frontend (Next.js 15, React 19, Tailwind v4) | `apps/web/`                           |
| Backend (FastAPI, LangGraph, SQLAlchemy 2.0) | `apps/backend/`                       |
| API client (fetch wrapper)                   | `apps/web/lib/api/client.ts`          |
| Auth API                                     | `apps/web/lib/api/auth.ts`            |
| JWT middleware                               | `apps/web/middleware.ts`              |
| AI agents                                    | `apps/backend/src/agents/`            |
| FastAPI routes                               | `apps/backend/src/api/`               |
| JWT auth                                     | `apps/backend/src/auth/jwt.py`        |
| Database config                              | `apps/backend/src/config/database.py` |
| SQLAlchemy models                            | `apps/backend/src/db/`                |
| AI provider abstraction                      | `apps/backend/src/models/`            |
| State store (NullStateStore)                 | `apps/backend/src/state/`             |
| Database schema                              | `scripts/init-db.sql`                 |
| Design tokens                                | `apps/web/lib/design-tokens.ts`       |
| Playwright config                            | `apps/web/playwright.config.ts`       |

## Knowledge Retrieval

Query knowledge sources before loading docs into context. See `.claude/rules/retrieval-first.md`.

| Priority | Source                    | Use For                                           | Access                                    |
| -------- | ------------------------- | ------------------------------------------------- | ----------------------------------------- |
| **0**    | **Vault Index**           | Agent/skill/rule discovery via wiki-links         | `[[id]]` → `.claude/VAULT-INDEX.md`       |
| 1        | **NotebookLM**            | Architecture, debugging, security, onboarding     | `nlm notebook query <id>`                 |
| 2        | **Context7 MCP**          | Library docs (Next.js, FastAPI, Playwright, etc.) | `resolve-library-id` → `get-library-docs` |
| 3        | **Skills** (70 installed) | Pattern libraries                                 | `.skills/custom/*/SKILL.md`               |
| 4        | **Jina Reader**           | Web content extraction                            | `https://r.jina.ai/{url}`                 |

NotebookLM config: `.claude/notebooklm/notebooks.json`
Full skill registry: `.skills/AGENTS.md`

## Vault Index System

Obsidian-style wiki-linking for O(1) discovery of agents, skills, rules, blueprints, and commands.

| File                                      | Purpose                        |
| ----------------------------------------- | ------------------------------ |
| `.claude/VAULT-INDEX.md`                  | Master lookup (auto-generated) |
| `.claude/schemas/frontmatter-schema.yaml` | Frontmatter schema definition  |
| `.claude/mcp/obsidian.json`               | MCP config for semantic search |

**Wiki-Link Syntax**:

- `[[id]]` — lookup by ID in vault index
- `[[type/id]]` — direct path (e.g., `[[agent/frontend-specialist]]`)
- `[[id#section]]` — link to heading anchor
- `[[id|display]]` — custom display text

**Commands**: `pnpm vault:index`, `pnpm vault:validate`, `pnpm vault:adopt`
**Docs**: `docs/VAULT_INDEX_SYSTEM.md`

## Authentication Flow

1. **Login**: `POST /api/auth/login` → bcrypt verify → JWT token → cookie
2. **Protected Routes**: Frontend middleware checks cookie; backend validates JWT
3. **Logout**: `POST /api/auth/logout` → clear cookie

Files: `apps/backend/src/auth/jwt.py`, `apps/web/lib/api/auth.ts`, `apps/web/middleware.ts`
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
```

Optional env vars: see `.env.example`

## State Store

Supabase removed. Backend uses **NullStateStore** for graceful degradation.

| File                           | Purpose                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `src/state/null_store.py`      | NullStateStore + `_NullTableClient` chain               |
| `src/state/supabase.py`        | Re-export shim (`NullStateStore as SupabaseStateStore`) |
| `src/state/__init__.py`        | `get_state_store()` factory                             |
| `src/utils/supabase_client.py` | Safe `_NullClient` shim                                 |

Degraded: `/api/analytics/*` (empty), `/api/contractors/*` (503)

## Design System — Scientific Luxury

| Element    | Implementation                           |
| ---------- | ---------------------------------------- |
| Background | OLED Black (`#050505`)                   |
| Borders    | `border-[0.5px] border-white/[0.06]`     |
| Corners    | Sharp only (`rounded-sm`)                |
| Typography | JetBrains Mono (data), Editorial (names) |
| Animations | Framer Motion only                       |
| Layout     | Timeline/orbital                         |

**Spectral colours**: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)

Full system + banned elements: `docs/DESIGN_SYSTEM.md` | Skill: `.skills/custom/scientific-luxury/SKILL.md`

## Key Principles

1. **Local-First** — Everything runs locally. No cloud required for development.
2. **Zero Barriers** — No API keys, accounts, or configuration needed to start.
3. **Production Ready** — Real authentication, testing, CI/CD included.
4. **Retrieval-First** — Query Context7/NotebookLM/Skills before loading docs into context.

## Context Drift Prevention

Context drift occurs when project rules are lost during automatic context compaction.
This project has a 4-pillar defence built in:

| Pillar              | Mechanism               | File                             |
| ------------------- | ----------------------- | -------------------------------- |
| Immutable rules     | CONSTITUTION.md on disk | `.claude/memory/CONSTITUTION.md` |
| Session injection   | SessionStart hook       | `session-start-context.ps1`      |
| Per-message compass | UserPromptSubmit hook   | `user-prompt-compass.ps1`        |
| Pre-compaction save | PreCompact hook         | `pre-compact-save.py`            |

If you notice drift (wrong patterns, ignored rules), run:

```bash
cat .claude/memory/CONSTITUTION.md   # Re-read immutable rules
cat .claude/memory/current-state.md  # Check saved state
```

Full documentation: `.claude/rules/context-drift.md`

## Human Goal Translation

The system assumes users may speak in **outcome language** rather than engineering language.
When this occurs, the system automatically translates the phrase into a full engineering plan.

| Outcome Phrase               | Interpreted As                                          |
| ---------------------------- | ------------------------------------------------------- |
| "Finished" / "Done"          | All production readiness gates passed, with proof       |
| "Ready" / "Production ready" | All gates passed + monitoring + rollback path           |
| "Launch it" / "Ship it"      | Production deployed + DNS confirmed + health check      |
| "Make it work"               | Root cause identified + fix applied + regression check  |
| "Ready for clients"          | User journey verified + legal pages + support reachable |

**Translation produces**:

1. **Definition of Done** — measurable criteria, not feelings
2. **Gap Analysis** — Proven / Unknown / Missing for each criterion
3. **Gated Execution Plan** — phases with verification gates and rollback paths
4. **Proof Required** — specific artifacts before completion can be claimed

Never claim completion without proof. `Unknown` items must be resolved, not ignored.

Rule: `.claude/rules/human-outcome-translation.md`
Skill: `.skills/custom/outcome-translator/SKILL.md`
Docs: `docs/OUTCOME_LANGUAGE_AND_DONE_GATES.md`

## Blueprint First

Before writing any code for UI, dashboards, landing pages, architecture, or database schemas,
the system generates an **ASCII wireframe or architecture diagram** first.

```
Step 1: GENERATE → ASCII blueprint (no code)
Step 2: ITERATE  → Revise until approved
Step 3: CONVERT  → Blueprint → implementation spec
Step 4: BUILD    → Code from the spec
```

This eliminates dead code and layout disagreements before they reach code review.

Skill: `.skills/custom/blueprint-first/SKILL.md`
Docs: `docs/BLUEPRINT_FIRST_PROTOCOL.md`

## Agents & Skills

- **23 subagents**: `.claude/agents/*/agent.md`
- **61 skills**: `.skills/AGENTS.md` (full registry)
- **10 commands**: `.claude/commands/*.md`
- **Orchestrator**: `.claude/agents/orchestrator/agent.md`

## Documentation

| Document                                                                             | Purpose                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------- |
| [`memory.md`](memory.md)                                                             | Operational constitution — load first   |
| [`PROGRESS.md`](PROGRESS.md)                                                         | Project status                          |
| [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)                                         | Setup guide                             |
| [`docs/AI_PROVIDERS.md`](docs/AI_PROVIDERS.md)                                       | Ollama vs Claude                        |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)                                     | Design system                           |
| [`docs/BEADS.md`](docs/BEADS.md)                                                     | AI agent memory                         |
| [`docs/SPEC_GENERATION.md`](docs/SPEC_GENERATION.md)                                 | Spec workflows                          |
| [`docs/OPTIONAL_SERVICES.md`](docs/OPTIONAL_SERVICES.md)                             | Cloud upgrades                          |
| [`docs/MULTI_AGENT_ARCHITECTURE.md`](docs/MULTI_AGENT_ARCHITECTURE.md)               | Agent workflow                          |
| [`docs/OUTCOME_LANGUAGE_AND_DONE_GATES.md`](docs/OUTCOME_LANGUAGE_AND_DONE_GATES.md) | Human language → engineering completion |
| [`docs/BLUEPRINT_FIRST_PROTOCOL.md`](docs/BLUEPRINT_FIRST_PROTOCOL.md)               | ASCII diagram planning before code      |
| [`docs/VAULT_INDEX_SYSTEM.md`](docs/VAULT_INDEX_SYSTEM.md)                           | Wiki-link vault and O(1) lookup         |
