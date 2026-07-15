# Adaptive Project Control System (PCS)

> **Date**: 02/04/2026
> **Status**: Design approved
> **Author**: Phill McGurk + Claude Opus 4.6
> **Approach**: B — Adaptive generator with three auto-classified tiers

## Purpose

A single `/bootstrap` command that discovers any project, classifies its maturity, and generates the right level of Claude Code project control — from lightweight CLAUDE.md for greenfield repos through to deterministic deploy pipelines for production systems.

**Core principle**: Run once, self-activates forever. Zero ongoing human maintenance for the control system itself.

**Lobster inspiration**: Deterministic pipelines with real approval halting, structured envelope output, state persistence, and resume capability — built natively in Claude Code's skill/command system (no external dependency).

---

## Section 1: Discovery Engine

### Signals Collected

| Signal                | Detection Method                                            | Informs                                |
| --------------------- | ----------------------------------------------------------- | -------------------------------------- |
| Language/Framework    | `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`    | Commands, formatter hooks, test runner |
| Package manager       | Lock files (`pnpm-lock.yaml`, `uv.lock`, `Cargo.lock`)      | Dev/build/test commands                |
| Test runner           | Config files (`vitest.config`, `pytest.ini`, `jest.config`) | TESTING.md, stop hook                  |
| Build stage           | Source file count + test ratio + CI presence + git history  | Tier classification                    |
| Database/ORM          | Schema files, migration dirs, connection configs            | ARCHITECTURE.md, migration hooks       |
| MCP servers           | `.claude/settings.json` MCP section, env vars               | ARCHITECTURE.md integrations           |
| Existing Claude files | CLAUDE.md, `.claude/` directory, AGENTS.md                  | Audit mode (upgrade vs fresh)          |
| Monorepo structure    | `turbo.json`, workspace configs, `apps/` dir                | Architecture boundaries                |
| Deploy targets        | `vercel.json`, `Dockerfile`, `fly.toml`, CI deploy steps    | Production tier eligibility            |

### Build Stage Classification

| Stage             | Criteria                            | Tier Assigned                        |
| ----------------- | ----------------------------------- | ------------------------------------ |
| **Greenfield**    | <20 source files, no tests          | Foundation only                      |
| **Active Build**  | 20+ files, test ratio < 30%         | Foundation + Governance              |
| **Stabilisation** | Moderate tests, some CI             | Foundation + Governance              |
| **Production**    | High coverage, CI/CD, deploy config | Foundation + Governance + Production |

### Existing File Handling

If CLAUDE.md or `.claude/` already exists, the generator enters **audit mode** — reads what's there, compares against the standard, proposes improvements rather than overwriting. User approves upgrades explicitly.

---

## Section 2: Foundation Tier (All Projects)

### CLAUDE.md (root, <150 lines)

```
# [Project Name]
[One line: language, framework, purpose]

## Commands        — Dev, Test, Lint, Build (exact discovered commands)
## Rules           — 5-15 rules, critical at TOP and BOTTOM (peripheral attention bias)
## Architecture    — pointer to .claude/ARCHITECTURE.md
## Standards       — pointer to .claude/STANDARDS.md
## Testing         — pointer to .claude/TESTING.md
## Current State   — pointer to .claude/PROGRESS.md
## Context Management — compaction survival + recovery instructions
## Investigation Rule — "read before claiming"
```

**Design rules for CLAUDE.md generation:**

- Positively framed ("Use X" not "Don't use Y") — "never" only for dangerous operations
- Exclude anything a linter/formatter handles (PostToolUse hook enforces those)
- Critical rules at top AND bottom (peripheral attention bias)
- <20 discrete instructions
- Each fact in exactly one place (no duplication with companion files)

### Companion Files (each <200 lines)

| File                      | Content                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `.claude/ARCHITECTURE.md` | System overview, component map (ASCII), module boundaries, data model, integrations, design decisions |
| `.claude/STANDARDS.md`    | Patterns linters can't catch: error handling, domain naming, API patterns, canonical file references  |
| `.claude/TESTING.md`      | Quick commands, "before you're done" checklist, test data setup, mocking conventions                  |
| `.claude/WORKFLOWS.md`    | Branch naming, commit format, PR checklist, deploy steps, rollback procedure                          |
| `.claude/PROGRESS.md`     | Living state: current phase, date, active tasks, decisions table, "notes for next context window"     |

### settings.json Hooks (Foundation)

**All stages:**

| Hook                     | Trigger               | Type    | Purpose                                                                   |
| ------------------------ | --------------------- | ------- | ------------------------------------------------------------------------- |
| PreToolUse(Bash)         | Before shell commands | command | Block destructive: `rm -rf`, `--force`, `--no-verify`, `DROP`, `TRUNCATE` |
| PostToolUse(Write\|Edit) | After file changes    | command | Auto-format with project's formatter + `\|\| true`                        |
| Stop                     | Session end           | command | Append timestamp + `git diff --name-only` to PROGRESS.md                  |
| PreCompact               | Before compaction     | command | Backup PROGRESS.md to `.claude/backups/`                                  |

**Stabilisation/Production add:**

| Hook                    | Trigger             | Type    | Purpose                                             |
| ----------------------- | ------------------- | ------- | --------------------------------------------------- |
| PreToolUse(Edit\|Write) | Before file changes | command | Protect `.env`, `.secret`, `.key`, `.pem` files     |
| Stop                    | Session end         | prompt  | "Were tests run after code changes?" semantic check |

**Permissions:** Deny `rm -rf *`, `git push --force*`, `git reset --hard*`. Allow common project commands.

---

## Section 3: Governance Tier (Active Build+)

Generated when build stage is Active Build or higher.

### Memory System

| File                                        | Purpose                                                                                                       | Who Updates              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `.claude/memory/CONSTITUTION.md`            | Immutable rules (5 most critical from CLAUDE.md). Survives compaction.                                        | Human only               |
| `.claude/memory/compass.md`                 | ~100-token summary injected before every message. Stack, critical rule, agent roster, budget, state pointers. | Human only               |
| `.claude/memory/current-state.md`           | Session state snapshot. Active task, in-progress work, next steps.                                            | PreCompact hook + agents |
| `.claude/memory/architectural-decisions.md` | Append-only log. `[DD/MM/YYYY] DECISION: X \| REASON: Y \| ALTERNATIVES REJECTED: Z`                          | Agents (append only)     |

### Auto-Activation Chain

```
/bootstrap runs once
    |
    v
Generates settings.json with hooks
    |
    v
SessionStart hook (every new session) --> loads CONSTITUTION + state
    |
    v
UserPromptSubmit hook (every message) --> injects compass
    |
    v
PreCompact hook (before compaction) --> saves state
    |
    v
Stop hook (session end) --> updates PROGRESS.md
    |
    v
PostToolUse hook (after every edit) --> auto-formats
    |
    v
PreToolUse hook (before bash) --> blocks dangerous commands
```

**Zero ongoing human maintenance.** Run `/bootstrap` once, everything self-sustains.

### Blueprints

| Blueprint                | When Generated       | DAG Shape                                          |
| ------------------------ | -------------------- | -------------------------------------------------- |
| `bugfix.blueprint.md`    | Always               | reproduce -> fix -> test -> PR                     |
| `feature.blueprint.md`   | Always               | spec -> implement -> test -> review -> PR          |
| `refactor.blueprint.md`  | Always               | scope -> implement -> verify-no-regression -> PR   |
| `migration.blueprint.md` | If database detected | backup -> migrate -> verify -> rollback-test -> PR |

Each blueprint defines: nodes with owners, iteration caps (hard limits), skip conditions, gates with pass/fail thresholds, escalation rules.

### Rubrics

| Rubric                   | Threshold                              | Purpose                |
| ------------------------ | -------------------------------------- | ---------------------- |
| `code-rubric.md`         | >=70 pass, 50-69 iterate, <50 escalate | Code quality gate      |
| `architecture-rubric.md` | >=70                                   | Structural change gate |

Criteria are generated from the project's actual patterns, not generic checklists.

### Additional Hooks (Governance)

| Hook             | Trigger           | Type    | Purpose                                             |
| ---------------- | ----------------- | ------- | --------------------------------------------------- |
| UserPromptSubmit | Every message     | command | Compass injection (reads compass.md)                |
| SessionStart     | New session       | command | Load CONSTITUTION + git status + current-state      |
| PreCompact       | Before compaction | command | Save state to current-state.md + backup PROGRESS.md |

### Verification Gate Rule

`.claude/rules/verification-gate.md` — semantic rule (not a hook) requiring proof before any completion claim:

1. Where to check
2. How to get there
3. What to see
4. What NOT to see
5. Confirmation prompt

---

## Section 4: Production Tier (Lobster-Inspired Patterns)

Generated when deploy config is detected OR user explicitly requests it.

### Deterministic Deploy Pipeline

`.claude/workflows/deploy-pipeline.md` — staged pipeline with real halting gates:

```
Stage 1: PRE-FLIGHT
  - Run test suite (must pass 100%)
  - Run type-check + lint
  - Check git status (clean working tree?)
  - Verify env vars match .env.example
  - GATE: All green -> proceed. Any red -> HALT with structured report.

Stage 2: BUILD
  - Production build (frontend + backend)
  - Bundle size check (warn if > threshold)
  - GATE: Build succeeds -> proceed. Fails -> HALT.

Stage 3: MIGRATE (if database detected)
  - Generate migration diff
  - Dry-run migration against staging
  - APPROVAL GATE: "Apply these migrations to production?"
    - Show exact SQL changes
    - Show affected tables + row estimates
    - HALT until explicit "yes"
  - Apply migration on approval

Stage 4: DEPLOY
  - Push to production target
  - APPROVAL GATE: "Deploy build [hash] to [target]?"
    - HALT until explicit "yes"
  - Execute deploy on approval

Stage 5: CANARY (post-deploy)
  - Health check (HTTP 200 on production URL)
  - Smoke test critical paths
  - Check error monitoring
  - GATE: All healthy -> proceed. Any failure -> trigger rollback prompt.

Stage 6: CONFIRM
  - Summary of what was deployed
  - Rollback command ready
  - "Deploy complete. Monitor for 24h. Rollback: [command]"
```

### Structured Envelope Output

Every stage produces:

```json
{
  "stage": "pre-flight",
  "status": "passed | failed | needs_approval",
  "output": { "tests": "47/47 passed", "types": "clean", "lint": "clean" },
  "gate": { "type": "automatic | approval", "passed": true },
  "next": "build",
  "rollback": "git revert HEAD && vercel rollback"
}
```

Machine-readable. Future CI integrations, dashboards, or agents can consume this.

### State Persistence

Pipeline state written to `.claude/data/deploy-state.json`:

```json
{
  "pipelineId": "deploy-2026-04-02-1",
  "startedAt": "2026-04-02T14:30:00+10:00",
  "currentStage": "migrate",
  "stageResults": {
    "pre-flight": { "status": "passed", "completedAt": "..." },
    "build": { "status": "passed", "completedAt": "..." }
  },
  "pendingApproval": {
    "stage": "migrate",
    "prompt": "Apply 2 migrations to production?",
    "details": ["ALTER TABLE users ADD COLUMN...", "CREATE INDEX..."]
  }
}
```

If session ends mid-deploy, next session reads state and resumes from where it stopped. No re-running passed stages.

### Rollback as First-Class

Every stage that changes external state records its rollback command. On canary failure:

```
CANARY FAILURE -- Production health check failed
Error: /api/health returned 503

ROLLBACK OPTIONS:
  1. [platform-specific instant rollback]
  2. git revert HEAD && git push (code-level revert)
  3. Manual investigation (keep deployment, debug)
```

### Deploy Target Detection

| Detected               | Commands Generated                                |
| ---------------------- | ------------------------------------------------- |
| Vercel (`vercel.json`) | `vercel deploy --prod`, `vercel rollback`         |
| Docker (`Dockerfile`)  | `docker build && docker push`, container rollback |
| Fly.io (`fly.toml`)    | `fly deploy`, `fly releases rollback`             |
| No deploy config       | Skip Production tier, note in PROGRESS.md         |

---

## Section 5: The Generator — `/bootstrap` Command

### Invocation

```
/bootstrap                    # Auto-discover, generate all applicable tiers
/bootstrap --tier foundation  # Force foundation only
/bootstrap --audit            # Compare existing files against standard, propose upgrades
```

### Execution Flow (single pass, no confirmation prompts)

```
Phase 1: DISCOVER (read-only)
  - Detect stack, package manager, test runner, DB, deploy targets
  - Classify build stage
  - Check for existing .claude/ files (fresh vs audit mode)
  - Detect monorepo boundaries
  - Output: discovery-report (internal)

Phase 2: GENERATE
  - Foundation tier (always)
  - Governance tier (if Active Build+)
  - Production tier (if deploy config detected)
  - settings.json (hooks appropriate to tier)

Phase 3: HARDEN (self-review)
  - Instruction count: CLAUDE.md < 20 discrete instructions?
  - Peripheral loading: critical rules at TOP and BOTTOM?
  - Positive framing: rewrite "don't/never" as positive?
  - No linter territory: remove anything formatter handles?
  - No duplication: each fact in exactly one place?
  - Compaction survival: recovery instructions present?
  - Token budget: CLAUDE.md < 150 lines, companions < 200 each?

Phase 4: REPORT
  - Summary: files created, line counts, hooks configured
  - Tier assigned, key decisions, recommended next steps
```

### Audit Mode (Existing Projects)

When `.claude/` already exists, outputs comparison report with specific upgrade recommendations. User approves before changes are applied.

### Skill File Structure

```
.skills/custom/bootstrap/
  +-- SKILL.md                      # Full skill definition
  +-- references/
  |   +-- tier-criteria.md          # Classification thresholds
  |   +-- hook-templates.md         # Platform-specific hook templates
  +-- assets/
      +-- claude-md.template.md
      +-- architecture.template.md
      +-- standards.template.md
      +-- testing.template.md
      +-- workflows.template.md
      +-- progress.template.md
      +-- constitution.template.md
      +-- compass.template.md
      +-- deploy-pipeline.template.md
```

Templates use `{{placeholder}}` syntax. The LLM reads them as guidance and generates context-appropriate content — not string-replace.

### Distribution

**Option 1 (manual):** Copy `.skills/custom/bootstrap/` into target project, run `/bootstrap`.

**Option 2 (superpowers):** Package as an Anthropic superpowers skill, available to any project without copying.

---

## Token Budget Summary

| File                    | Target      | Purpose                             |
| ----------------------- | ----------- | ----------------------------------- |
| CLAUDE.md               | <150 lines  | Always loaded — every token costs   |
| Each companion file     | <200 lines  | Loaded on demand                    |
| compass.md              | ~100 tokens | Injected every message              |
| CONSTITUTION.md         | ~500 tokens | Loaded at session start             |
| Auto memory (MEMORY.md) | <200 lines  | Always loaded — cleanup if exceeded |

---

## Key Design Decisions

| Decision                                    | Rationale                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Native Claude Code, no Lobster dependency   | We adopt the patterns (approval halting, envelopes, state persistence) but build them in the skill/command system we already control |
| LLM generates content, not string-replace   | Templates are guidance, not fill-in-the-blank. The LLM understands the project and writes appropriate content                        |
| Auto-classification, not user choice        | The user runs `/bootstrap` and the system decides the tier. Reduces cognitive load for non-developer users                           |
| Audit mode for existing projects            | Never overwrites existing work. Proposes upgrades with diff-style comparison                                                         |
| Zero maintenance after bootstrap            | Hooks are the autonomous nervous system. Everything self-activates from settings.json                                                |
| Peripheral attention bias                   | Critical rules at top AND bottom of CLAUDE.md. Research shows middle content gets lowest model attention                             |
| Positive framing                            | "Use X" not "Don't use Y" — positive instructions have higher compliance rates                                                       |
| Deterministic hooks for deterministic rules | If a rule can be a shell command, it's a hook (100% enforcement) not an instruction (~90-95%)                                        |

---

## Success Criteria

1. Run `/bootstrap` in any project (TypeScript, Python, Rust, Go) and get a working control system
2. Generated CLAUDE.md is under 150 lines with <20 instructions
3. All hooks fire correctly after generation (no manual setup)
4. Audit mode correctly identifies gaps in existing projects
5. Deploy pipeline halts at approval gates (does not auto-proceed)
6. Pipeline state survives session boundaries (resume works)
7. Non-developer user never needs to remember to run anything after initial bootstrap
