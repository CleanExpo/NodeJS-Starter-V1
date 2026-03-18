# Core Rules — NodeJS-Starter-V1

> Always loaded. Locale: en-AU (colour, behaviour, optimisation, organised, licence). Dates: DD/MM/YYYY. Currency: AUD. Timezone: AEST/AEDT.

---

## Intent Classification

| Mode        | Signals                                             | Governance                       |
| ----------- | --------------------------------------------------- | -------------------------------- |
| **BUILD**   | implement, create, fix, add, write, update          | Standard — all systems active    |
| **FIX**     | bug, error, broken, failing, crash, debug           | Standard — root-cause first      |
| **PLAN**    | plan, architecture, compare, evaluate, design, spec | Light — no execution gates       |
| **AUDIT**   | audit, review, check, scan, verify, drift           | Light — read-only                |
| **EXPLORE** | what is, explain, show me, how does, describe       | Minimal — no governance overhead |

Default to lower governance when ambiguous. Never interrupt productive BUILD flow with unsolicited audits.

---

## Validation Gates

**Never proceed without confirming:**

- Referenced files/schemas/endpoints exist (use Glob/Grep/Read)
- Import paths verified against actual file locations
- Database tables confirmed in schema before querying
- Environment variables confirmed in `.env.example`

---

## Execution Safety

| Risk       | Examples                                                  | Action                    |
| ---------- | --------------------------------------------------------- | ------------------------- |
| **LOW**    | Read files, add comments, create new files                | Execute freely            |
| **MEDIUM** | Edit existing code, add dependencies                      | Proceed with verification |
| **HIGH**   | Delete files, schema migrations, auth changes, force-push | Pause and confirm         |

---

## Retrieval Order

1. **NotebookLM** — project-specific knowledge (`nlm notebook query <id>`)
2. **Context7 MCP** — library docs (`resolve-library-id` → `get-library-docs`)
3. **Skills** — pattern libraries (`.skills/custom/*/SKILL.md`)
4. **Codebase** — Grep/Glob for implementation details
5. **Web search** — last resort

Never paste full library docs inline. Never load a full SKILL.md when one section suffices.

---

## Three Mandatory Skills

All coding tasks must use these skills:

- **`tdd`** — failing test → watch fail → minimal code → watch pass → refactor
- **`systematic-debugging`** — 4-phase root-cause with 3-attempt circuit breaker
- **`verification-before-completion`** — run commands, read output, before any "Done" claim

---

## Anti-Hallucination

Classify every factual claim:

- **Confirmed**: Read from file, verified by tool output, user-provided
- **Inferred**: Logical deduction from confirmed facts
- **Assumed**: Not verified — **pause and verify before acting**

Never invent: API endpoints, database schemas, file paths, env var names, package versions.

---

## Context Drift Recovery

If rules feel wrong after compaction:

```bash
cat .claude/memory/CONSTITUTION.md          # Re-read immutable rules
cat .claude/memory/current-state.md         # Check last saved state
```

---

## Mathematical Quality Signals (Council of Logic)

Before writing implementation code, assess:

- **Turing**: Time complexity O(?) — O(n²) warrants redesign
- **Von Neumann**: Architecture pattern — optimal data structure chosen?
- **Shannon**: Is output compressed? No redundant context loaded?

CSS easings: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth), `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (spring)

---

## Outcome Translation

When user says "finished", "ready", "ship it", "done", "go live" — produce a Definition of Done checklist before acting. See `.claude/rules/archive/human-outcome-translation.md` for full protocol.

---

## Repo Conventions

- React: `PascalCase.tsx` | Utils: `kebab-case.ts` | Python: `snake_case.py` | Skills: `SCREAMING-KEBAB.md`
- Commits: `<type>(<scope>): <description>` (feat, fix, docs, chore, refactor)
- Branches: `feature/<name>` | `fix/<name>`
- No cross-layer imports. Each layer imports only from the layer directly below.
- Anti-duplication: search for existing implementations before creating new ones.

## Architecture Layers

```
Frontend: Components → Hooks → API Routes → Services
Backend:  API → Agents → Tools → Graphs → State
Database: Tables → Functions → Triggers
```

Backend dev server: `cd apps/backend && uv run uvicorn src.api.main:app --reload`

## Pre-PR

```bash
pnpm turbo run type-check lint test && echo "Ready for PR"
```
