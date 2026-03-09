# CONSTITUTION — NodeJS-Starter-V1
> Immutable rules. Survives compaction. Re-read if context feels wrong.

## Project Identity
- **Stack**: Next.js 15 (`apps/web/`) + FastAPI/LangGraph (`apps/backend/`) + PostgreSQL
- **Locale**: en-AU | Dates: DD/MM/YYYY | Currency: AUD | Timezone: AEST/AEDT
- **Design**: OLED Black `#050505` | Scientific Luxury | Framer Motion only | `rounded-sm`

## Architecture Routing
| Domain | Location | Agent |
|--------|----------|-------|
| Frontend (React 19, Tailwind v4) | `apps/web/` | frontend-specialist |
| Backend (FastAPI, SQLAlchemy 2.0) | `apps/backend/` | backend-specialist |
| AI agents (LangGraph) | `apps/backend/src/agents/` | backend-specialist |
| Database (PostgreSQL) | `scripts/init-db.sql` | database-specialist |
| Auth (JWT) | `apps/backend/src/auth/jwt.py` + `apps/web/middleware.ts` | backend-specialist |
| State (NullStateStore) | `apps/backend/src/state/` | backend-specialist |
| Tests | `apps/web/playwright.config.ts` | test-engineer |

## 7 Critical Rules

1. **Retrieval-First** — Query NotebookLM → Context7 → Skills → Grep BEFORE loading docs inline.
2. **No cross-layer imports** — Components never import from `server/`. API routes use services, not repos directly.
3. **Subagent isolation** — All heavy implementation dispatched to subagents. Orchestrator stays lean.
4. **State on disk** — Decisions written to `.claude/memory/architectural-decisions.md`. Never assume from training data.
5. **Design system** — Scientific Luxury enforced. No generic Tailwind defaults. No `rounded-lg`. No linear easing.
6. **Test-Driven Development (IMMUTABLE)** — NO production code without a failing test first. Write test → watch fail → implement → watch pass → refactor. Vitest for `apps/web/`, pytest for `apps/backend/`. Rationalising "just this once" = violation. Skill: `.skills/custom/tdd/SKILL.md`.
7. **Verification before completion (IMMUTABLE)** — NO "Done", "✅", or completion claims without running the actual commands and reading the full output. Banned: "should work", "probably passes", "seems correct", "likely fixed". Evidence only. Skill: `.skills/custom/verification-before-completion/SKILL.md`.

## Orchestrator Token Budget
- **Orchestrator**: Hard cap 80,000 tokens. Delegate file reads to subagents.
- **Subagents**: Fresh context per invocation. Load only relevant files/skills.
- **Compass**: 100 tokens injected before every message (UserPromptSubmit hook).

## Drift Recovery Procedure
If context feels wrong or rules are being violated:
```bash
cat .claude/memory/CONSTITUTION.md          # Re-read immutable rules
cat .claude/memory/current-state.md         # Check last saved state
cat .claude/memory/architectural-decisions.md  # Review logged decisions
```
Then re-read `.claude/rules/retrieval-first.md` and resume.

## Spectral Colours (Design)
- Cyan `#00F5FF` (active) | Emerald `#00FF88` (success) | Amber `#FFB800` (warning)
- Red `#FF4444` (error) | Magenta `#FF00FF` (escalation)

## Default Auth Credentials (Dev Only)
`admin@local.dev` / `admin123` — Never use in production.
