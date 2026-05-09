# Adaptive Project Control System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/bootstrap` command that discovers any project, classifies its maturity, and generates the right level of Claude Code project control across three tiers (Foundation, Governance, Production).

**Architecture:** A skill at `.skills/custom/bootstrap/` with template assets, a command at `.claude/commands/bootstrap.md` that invokes it, and reference files for tier classification and hook generation. The LLM reads templates as guidance and generates context-appropriate content from discovery data.

**Tech Stack:** Markdown skill definitions, YAML frontmatter, PowerShell/Python hooks, JSON settings.

**Spec:** `docs/superpowers/specs/2026-04-02-adaptive-project-control-system-design.md`

---

## File Structure

### New files to create:

```
.skills/custom/bootstrap/
  ├── SKILL.md                              # Main skill definition (the generator brain)
  ├── references/
  │   ├── tier-criteria.md                  # Classification thresholds + signal weights
  │   ├── hook-templates.md                 # Platform-specific hook templates
  │   └── harden-checklist.md               # Phase 3 self-review checklist
  └── assets/
      ├── claude-md.template.md             # CLAUDE.md template
      ├── architecture.template.md          # .claude/ARCHITECTURE.md template
      ├── standards.template.md             # .claude/STANDARDS.md template
      ├── testing.template.md               # .claude/TESTING.md template
      ├── workflows.template.md             # .claude/WORKFLOWS.md template
      ├── progress.template.md              # .claude/PROGRESS.md template
      ├── constitution.template.md          # .claude/memory/CONSTITUTION.md template
      ├── compass.template.md               # .claude/memory/compass.md template
      ├── verification-gate.template.md     # .claude/rules/verification-gate.md template
      ├── deploy-pipeline.template.md       # .claude/workflows/deploy-pipeline.md template
      ├── bugfix.blueprint.template.md      # Blueprint template
      ├── feature.blueprint.template.md     # Blueprint template
      ├── refactor.blueprint.template.md    # Blueprint template
      ├── migration.blueprint.template.md   # Blueprint template
      ├── code-rubric.template.md           # Rubric template
      └── architecture-rubric.template.md   # Rubric template
```

### Files to modify:

```
.claude/commands/bootstrap.md               # Replace with new adaptive bootstrap command
.claude/settings.json                       # Add/update bootstrap command definition
```

---

## Task 1: Create Tier Classification Reference

**Files:**
- Create: `.skills/custom/bootstrap/references/tier-criteria.md`

- [ ] **Step 1: Create the references directory**

```bash
mkdir -p ".skills/custom/bootstrap/references"
```

- [ ] **Step 2: Write the tier classification reference**

Create `.skills/custom/bootstrap/references/tier-criteria.md` with the complete classification logic:

```markdown
---
name: tier-criteria
type: reference
version: 1.0.0
---

# Tier Classification Criteria

## Discovery Signals

### Stack Detection

| File | Stack | Package Manager |
|------|-------|-----------------|
| `package.json` + `next.config.*` | Next.js | Check for pnpm-lock.yaml, yarn.lock, package-lock.json, bun.lockb |
| `package.json` + `vite.config.*` | Vite/React | Same as above |
| `pyproject.toml` | Python | uv (if uv.lock), pip, poetry |
| `Cargo.toml` | Rust | cargo |
| `go.mod` | Go | go modules |
| `package.json` (plain) | Node.js | Check lock files |

### Test Runner Detection

| Config File | Runner | Commands |
|-------------|--------|----------|
| `vitest.config.*` | Vitest | `npx vitest`, `npx vitest run` |
| `jest.config.*` or `"jest"` in package.json | Jest | `npx jest`, `npm test` |
| `pytest.ini` or `pyproject.toml [tool.pytest]` | Pytest | `pytest`, `uv run pytest` |
| `Cargo.toml` | cargo test | `cargo test` |
| `*_test.go` files | go test | `go test ./...` |

### Formatter Detection

| Config File | Formatter | Hook Command |
|-------------|-----------|-------------|
| `.prettierrc*` or `"prettier"` in package.json | Prettier | `npx prettier --write` |
| `biome.json` | Biome | `npx biome check --write` |
| `pyproject.toml [tool.black]` or `[tool.ruff]` | Black/Ruff | `black` or `ruff format` |
| `rustfmt.toml` or `.rustfmt.toml` | rustfmt | `cargo fmt` |
| `gofmt` (built-in) | gofmt | `gofmt -w` |

### Database Detection

| Signal | Database | Migration Pattern |
|--------|----------|-------------------|
| `supabase/` dir or `supabase` in deps | Supabase/PostgreSQL | `supabase db push` |
| `prisma/schema.prisma` | Prisma | `npx prisma migrate` |
| `drizzle.config.*` | Drizzle | `npx drizzle-kit push` |
| `alembic/` dir or `alembic.ini` | Alembic/SQLAlchemy | `alembic upgrade head` |
| `migrations/` with `.sql` files | Raw SQL | Manual |

### Deploy Target Detection

| Signal | Target | Deploy Command | Rollback Command |
|--------|--------|---------------|-----------------|
| `vercel.json` or `.vercel/` | Vercel | `vercel deploy --prod` | `vercel rollback` |
| `Dockerfile` | Docker | `docker build && docker push` | Revert to previous image tag |
| `fly.toml` | Fly.io | `fly deploy` | `fly releases rollback` |
| `render.yaml` | Render | Git push (auto-deploy) | Revert commit |
| `.github/workflows/*deploy*` | GitHub Actions | Push to deploy branch | Revert commit |
| `netlify.toml` | Netlify | `netlify deploy --prod` | `netlify rollback` |
| `railway.json` or `railway.toml` | Railway | `railway up` | Previous deployment in dashboard |

### Monorepo Detection

| Signal | Type |
|--------|------|
| `turbo.json` | Turborepo |
| `nx.json` | Nx |
| `pnpm-workspace.yaml` | pnpm workspaces |
| `lerna.json` | Lerna |
| `"workspaces"` in package.json | Yarn/npm workspaces |

## Build Stage Classification

Count source files (exclude node_modules, .git, dist, build, __pycache__, .next, target):

```
Source files = files matching *.ts, *.tsx, *.py, *.rs, *.go (excluding test files)
Test files = files matching *.test.*, *.spec.*, test_*, *_test.*
Test ratio = test files / source files
CI present = .github/workflows/ OR .gitlab-ci.yml OR Jenkinsfile exists
Deploy config = any deploy target detected above
```

| Stage | Source Files | Test Ratio | CI | Deploy | Tier |
|-------|-------------|------------|-----|--------|------|
| Greenfield | <20 | any | any | any | Foundation |
| Active Build | 20-100 | <0.3 | any | no | Foundation + Governance |
| Active Build | 20-100 | <0.3 | any | yes | Foundation + Governance + Production |
| Stabilisation | any | 0.3-0.6 | yes | no | Foundation + Governance |
| Stabilisation | any | 0.3-0.6 | yes | yes | Foundation + Governance + Production |
| Production | any | >0.6 | yes | yes | Foundation + Governance + Production |

## Existing File Detection

| Check | Result |
|-------|--------|
| CLAUDE.md exists at root | Audit mode — compare, don't overwrite |
| `.claude/` directory exists | Audit mode — compare, propose upgrades |
| `.claude/settings.json` exists | Merge hooks — don't clobber existing |
| `.claude/memory/` exists | Skip memory generation — already initialised |
```

- [ ] **Step 3: Commit**

```bash
git add .skills/custom/bootstrap/references/tier-criteria.md
git commit -m "feat(bootstrap): add tier classification reference"
```

---

## Task 2: Create Hook Templates Reference

**Files:**
- Create: `.skills/custom/bootstrap/references/hook-templates.md`

- [ ] **Step 1: Write the hook templates reference**

Create `.skills/custom/bootstrap/references/hook-templates.md`:

```markdown
---
name: hook-templates
type: reference
version: 1.0.0
---

# Hook Templates by Platform

## Foundation Hooks (All Projects)

### PreToolUse(Bash) — Destructive Command Blocker

**Type:** command

**PowerShell (Windows):**
```powershell
$input_json = $args[0] | ConvertFrom-Json
$cmd = $input_json.tool_input.command
$blocked = @('rm -rf', '--force', '--no-verify', 'DROP TABLE', 'DROP DATABASE', 'TRUNCATE', 'git push --force', 'git reset --hard')
foreach ($pattern in $blocked) {
    if ($cmd -match [regex]::Escape($pattern)) {
        Write-Output "BLOCKED: Command contains '$pattern'. Use with caution."
        exit 2
    }
}
exit 0
```

**Bash (Unix/Mac):**
```bash
#!/bin/bash
CMD=$(echo "$1" | jq -r '.tool_input.command // empty')
BLOCKED=("rm -rf" "--force" "--no-verify" "DROP TABLE" "DROP DATABASE" "TRUNCATE" "git push --force" "git reset --hard")
for pattern in "${BLOCKED[@]}"; do
    if echo "$CMD" | grep -qF "$pattern"; then
        echo "BLOCKED: Command contains '$pattern'"
        exit 2
    fi
done
exit 0
```

### PostToolUse(Write|Edit) — Auto-Format

**Template (adapt formatter per project):**

**Prettier (JS/TS):**
```
npx prettier --write "$TOOL_INPUT_FILE_PATH" || true
```

**Black (Python):**
```
black "$TOOL_INPUT_FILE_PATH" || true
```

**Ruff (Python):**
```
ruff format "$TOOL_INPUT_FILE_PATH" || true
```

**cargo fmt (Rust):**
```
cargo fmt || true
```

**gofmt (Go):**
```
gofmt -w "$TOOL_INPUT_FILE_PATH" || true
```

### Stop — Update PROGRESS.md

**PowerShell:**
```powershell
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$diff = git diff --name-only 2>$null
$entry = "`n---`n## Session: $date`n`nFiles changed:`n$diff"
Add-Content -Path ".claude/PROGRESS.md" -Value $entry
```

**Bash:**
```bash
DATE=$(date "+%Y-%m-%d %H:%M")
DIFF=$(git diff --name-only 2>/dev/null)
echo -e "\n---\n## Session: $DATE\n\nFiles changed:\n$DIFF" >> .claude/PROGRESS.md
```

### PreCompact — Backup PROGRESS.md

**PowerShell:**
```powershell
if (Test-Path ".claude/PROGRESS.md") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    Copy-Item ".claude/PROGRESS.md" ".claude/backups/PROGRESS-$timestamp.md"
}
```

**Bash:**
```bash
if [ -f ".claude/PROGRESS.md" ]; then
    TIMESTAMP=$(date "+%Y%m%d-%H%M")
    mkdir -p .claude/backups
    cp .claude/PROGRESS.md ".claude/backups/PROGRESS-$TIMESTAMP.md"
fi
```

## Stabilisation/Production Hooks

### PreToolUse(Edit|Write) — Protect Sensitive Files

**PowerShell:**
```powershell
$input_json = $args[0] | ConvertFrom-Json
$file = $input_json.tool_input.file_path
$protected = @('.env', '.secret', '.key', '.pem', 'credentials')
foreach ($pattern in $protected) {
    if ($file -match [regex]::Escape($pattern)) {
        Write-Output "BLOCKED: Cannot edit sensitive file '$file'"
        exit 2
    }
}
exit 0
```

### Stop (prompt) — Test Verification

**Type:** prompt

**Prompt text:**
```
Check if any source code files were modified in this session (not just docs/config).
If yes, verify that relevant tests were run. If tests were not run, remind the user
to run the test suite before considering the work complete.
```

## Governance Hooks

### UserPromptSubmit — Compass Injection

**PowerShell:**
```powershell
if (Test-Path ".claude/memory/compass.md") {
    $compass = Get-Content ".claude/memory/compass.md" -Raw
    Write-Output "COMPASS: $compass"
}
```

### SessionStart — Context Loading

**PowerShell:**
```powershell
$output = @()
if (Test-Path ".claude/memory/CONSTITUTION.md") {
    $output += "CONSTITUTION: " + (Get-Content ".claude/memory/CONSTITUTION.md" -Raw)
}
$gitStatus = git status --short 2>$null
$output += "GIT: $gitStatus"
if (Test-Path ".claude/memory/current-state.md") {
    $output += "STATE: " + (Get-Content ".claude/memory/current-state.md" -Raw)
}
$output -join "`n"
```

### PreCompact — State Save (Governance)

**PowerShell:**
```powershell
# Backup PROGRESS.md
if (Test-Path ".claude/PROGRESS.md") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    Copy-Item ".claude/PROGRESS.md" ".claude/backups/PROGRESS-$timestamp.md"
}
# Save current state
$state = "Last compaction: $(Get-Date -Format 'dd/MM/yyyy HH:mm')`n"
$state += "Git branch: $(git branch --show-current 2>$null)`n"
$state += "Modified files:`n$(git diff --name-only 2>$null)"
Set-Content ".claude/memory/current-state.md" $state
```

## Permissions Template

```json
{
  "permissions": {
    "deny": [
      "rm -rf *",
      "git push --force*",
      "git reset --hard*"
    ],
    "allow": [
      "{{package_manager}} *",
      "git *",
      "npx *"
    ]
  }
}
```

Replace `{{package_manager}}` with detected package manager (npm, pnpm, yarn, bun, uv, cargo, go).
```

- [ ] **Step 2: Commit**

```bash
git add .skills/custom/bootstrap/references/hook-templates.md
git commit -m "feat(bootstrap): add platform-specific hook templates reference"
```

---

## Task 3: Create Harden Checklist Reference

**Files:**
- Create: `.skills/custom/bootstrap/references/harden-checklist.md`

- [ ] **Step 1: Write the harden checklist**

Create `.skills/custom/bootstrap/references/harden-checklist.md`:

```markdown
---
name: harden-checklist
type: reference
version: 1.0.0
---

# Phase 3: Harden Checklist

Run this checklist against all generated files before reporting.

## CLAUDE.md Checks

- [ ] **Instruction count**: <20 discrete instructions. If more, merge related rules or move detail to companion files.
- [ ] **Peripheral loading**: Most critical rules appear at BOTH the top and bottom of the Rules section.
- [ ] **Positive framing**: No "don't" / "never" / "avoid" unless genuinely dangerous. Rewrite as "Use X" / "Prefer Y".
- [ ] **No linter territory**: If prettier/eslint/black/ruff handles it, remove the instruction. The PostToolUse hook enforces it.
- [ ] **Line count**: <150 lines total.
- [ ] **Commands section**: Every command has an exact, runnable command string (not "run your tests").
- [ ] **Pointers present**: Architecture, Standards, Testing, Progress sections point to companion files.
- [ ] **Context management**: Compaction survival + recovery instructions present.
- [ ] **Investigation rule**: "Read before claiming" rule present.

## Companion File Checks

- [ ] **Each file <200 lines**.
- [ ] **No duplication**: Each fact appears in exactly one file. Not in both CLAUDE.md and STANDARDS.md.
- [ ] **ARCHITECTURE.md**: Has system overview, component map, module boundaries, data model.
- [ ] **STANDARDS.md**: Only patterns linters can't catch. References actual canonical files.
- [ ] **TESTING.md**: Has exact commands. Has "before you're done" checklist.
- [ ] **WORKFLOWS.md**: Has branch naming, commit format, PR checklist.
- [ ] **PROGRESS.md**: Has current phase, date, empty tasks/decisions tables, "notes for next context" section.

## settings.json Checks

- [ ] **PreToolUse(Bash)**: Blocks rm -rf, --force, --no-verify, DROP, TRUNCATE.
- [ ] **PostToolUse(Write|Edit)**: Auto-formats with project's actual formatter. Has `|| true`.
- [ ] **Stop**: Updates PROGRESS.md with timestamp + changed files.
- [ ] **PreCompact**: Backs up PROGRESS.md to .claude/backups/.
- [ ] **Permissions**: Denies dangerous commands. Allows project commands.
- [ ] **No orphan hooks**: Every hook references a script or command that will exist.

## Governance Checks (if tier includes Governance)

- [ ] **CONSTITUTION.md**: Contains the 5 most critical rules from CLAUDE.md. Read-only for agents.
- [ ] **compass.md**: <100 tokens. Contains stack, critical rule, state pointers.
- [ ] **SessionStart hook**: Loads CONSTITUTION + state.
- [ ] **UserPromptSubmit hook**: Injects compass.
- [ ] **PreCompact hook**: Saves state to current-state.md.
- [ ] **Blueprints**: Have iteration caps, gates, skip conditions.
- [ ] **Rubrics**: Have scoring dimensions, thresholds (>=70 pass, 50-69 iterate, <50 escalate).

## Production Checks (if tier includes Production)

- [ ] **Deploy pipeline**: Has all 6 stages (pre-flight, build, migrate, deploy, canary, confirm).
- [ ] **Approval gates**: Stages 3 and 4 HALT until explicit approval.
- [ ] **Rollback commands**: Every state-changing stage has a rollback command.
- [ ] **State persistence**: Pipeline writes to .claude/data/deploy-state.json.
- [ ] **Deploy commands**: Match the detected deploy target (Vercel, Docker, Fly, etc.).
```

- [ ] **Step 2: Commit**

```bash
git add .skills/custom/bootstrap/references/harden-checklist.md
git commit -m "feat(bootstrap): add harden checklist reference"
```

---

## Task 4: Create Foundation Template Assets

**Files:**
- Create: `.skills/custom/bootstrap/assets/claude-md.template.md`
- Create: `.skills/custom/bootstrap/assets/architecture.template.md`
- Create: `.skills/custom/bootstrap/assets/standards.template.md`
- Create: `.skills/custom/bootstrap/assets/testing.template.md`
- Create: `.skills/custom/bootstrap/assets/workflows.template.md`
- Create: `.skills/custom/bootstrap/assets/progress.template.md`

- [ ] **Step 1: Create the assets directory**

```bash
mkdir -p ".skills/custom/bootstrap/assets"
```

- [ ] **Step 2: Create CLAUDE.md template**

Create `.skills/custom/bootstrap/assets/claude-md.template.md`:

```markdown
# {{project_name}}

{{one_line_description}}

## Commands

- **Dev**: `{{dev_command}}`
- **Test**: `{{test_command}}` (single: `{{test_single_command}}`)
- **Lint**: `{{lint_command}}`
- **Build**: `{{build_command}}`

## Rules

{{rules_section}}

<!-- IMPORTANT: Most critical rule MUST appear as rule #1 AND as the final rule.
     5-15 rules total. Positively framed. No linter-enforceable rules. -->

## Architecture

Read `.claude/ARCHITECTURE.md` before structural changes or new features.

## Standards

Read `.claude/STANDARDS.md` before writing new modules or refactoring.

## Testing

Read `.claude/TESTING.md` for verification. After any task, run the relevant
test scope and verify output before reporting completion.

## Current State

Read `.claude/PROGRESS.md` at the start of every new context window.
Update it when completing tasks or making significant decisions.

## Context Management

Context will be compacted automatically. Do not stop tasks early due to
context concerns. When compacting, preserve: modified file list, test
commands, active task state from PROGRESS.md, and uncommitted decisions.

When starting a fresh context window:
1. Read .claude/PROGRESS.md for current state
2. Read git log for recent changes
3. Run `{{test_command}}` to verify environment
4. Continue from the next task in PROGRESS.md

## Investigation Rule

Read relevant source files before making claims about this codebase.
Never speculate about code, APIs, or data structures you haven't opened.
```

- [ ] **Step 3: Create ARCHITECTURE.md template**

Create `.skills/custom/bootstrap/assets/architecture.template.md`:

```markdown
# Architecture — {{project_name}}

## Overview

{{system_overview_2_3_paragraphs}}

## Component Map

```
{{ascii_component_diagram}}
```

## Module Boundaries

### {{module_1_name}}
- **Purpose**: {{purpose}}
- **Owns**: {{what_it_owns}}
- **Depends on**: {{dependencies}}
- **Public API**: {{exports}}

### {{module_2_name}}
<!-- Repeat for each major module -->

## Data Model

{{key_entities_and_storage}}

## Third-Party Integrations

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| {{service}} | {{purpose}} | {{config_path}} |

## Design Decisions

| Decision | Date | Rationale |
|----------|------|-----------|
| {{decision}} | {{date}} | {{rationale}} |
```

- [ ] **Step 4: Create STANDARDS.md template**

Create `.skills/custom/bootstrap/assets/standards.template.md`:

```markdown
# Standards — {{project_name}}

> Only patterns that linters and formatters cannot catch.

## Error Handling

{{error_handling_conventions}}

Canonical example: see `{{canonical_error_handling_file}}`

## Naming Conventions

{{domain_specific_naming_rules}}

## API Patterns

{{api_request_response_patterns}}

Canonical example: see `{{canonical_api_file}}`

## State Management

{{state_management_conventions}}

## File Organisation

{{file_organisation_rules}}

## Patterns to Avoid

| Pattern | Why | Instead |
|---------|-----|---------|
| {{antipattern}} | {{reason}} | {{alternative}} |
```

- [ ] **Step 5: Create TESTING.md template**

Create `.skills/custom/bootstrap/assets/testing.template.md`:

```markdown
# Testing — {{project_name}}

## Quick Reference

```bash
# All tests
{{test_all_command}}

# Single file
{{test_single_command}}

# With coverage
{{test_coverage_command}}
```

## Before You Say You're Done

- [ ] Run the test suite — all tests pass
- [ ] If you changed business logic, there's a test for it
- [ ] If you fixed a bug, there's a regression test
- [ ] No skipped or commented-out tests without explanation
- [ ] Test names describe the behaviour, not the implementation

## Test Data Setup

{{test_data_conventions}}

## Mocking Conventions

{{mocking_patterns}}

## Critical Areas (Regression)

| Area | Test Command | What to Watch |
|------|-------------|---------------|
| {{area}} | {{command}} | {{what_to_watch}} |
```

- [ ] **Step 6: Create WORKFLOWS.md template**

Create `.skills/custom/bootstrap/assets/workflows.template.md`:

```markdown
# Workflows — {{project_name}}

## Branch Naming

- `main` — production ready
- `feature/{{name}}` — new features
- `fix/{{name}}` — bug fixes
- `chore/{{name}}` — maintenance

## Commit Messages

Format: `<type>(<scope>): <description>`

Types: feat, fix, docs, chore, refactor, test, style, perf

## Pull Request Checklist

- [ ] Tests pass (`{{test_command}}`)
- [ ] Types check (`{{typecheck_command}}`)
- [ ] Lint clean (`{{lint_command}}`)
- [ ] PROGRESS.md updated if significant
- [ ] No secrets committed

## Deployment

{{deployment_steps_or_not_configured}}

## Rollback

{{rollback_procedure_or_not_configured}}
```

- [ ] **Step 7: Create PROGRESS.md template**

Create `.skills/custom/bootstrap/assets/progress.template.md`:

```markdown
# Progress — {{project_name}}

> Living state document. Updated by Stop hook and agents.
> Read this at the start of every new context window.

## Current Phase

**Stage**: {{build_stage}}
**Date**: {{current_date}}
**Tier**: {{assigned_tier}}

## Active Tasks

<!-- Updated during sessions -->

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|

## Notes for Next Context Window

<!-- Agents write here before session ends -->
```

- [ ] **Step 8: Commit all foundation templates**

```bash
git add .skills/custom/bootstrap/assets/claude-md.template.md
git add .skills/custom/bootstrap/assets/architecture.template.md
git add .skills/custom/bootstrap/assets/standards.template.md
git add .skills/custom/bootstrap/assets/testing.template.md
git add .skills/custom/bootstrap/assets/workflows.template.md
git add .skills/custom/bootstrap/assets/progress.template.md
git commit -m "feat(bootstrap): add foundation tier template assets"
```

---

## Task 5: Create Governance Template Assets

**Files:**
- Create: `.skills/custom/bootstrap/assets/constitution.template.md`
- Create: `.skills/custom/bootstrap/assets/compass.template.md`
- Create: `.skills/custom/bootstrap/assets/verification-gate.template.md`
- Create: `.skills/custom/bootstrap/assets/bugfix.blueprint.template.md`
- Create: `.skills/custom/bootstrap/assets/feature.blueprint.template.md`
- Create: `.skills/custom/bootstrap/assets/refactor.blueprint.template.md`
- Create: `.skills/custom/bootstrap/assets/migration.blueprint.template.md`
- Create: `.skills/custom/bootstrap/assets/code-rubric.template.md`
- Create: `.skills/custom/bootstrap/assets/architecture-rubric.template.md`

- [ ] **Step 1: Create CONSTITUTION.md template**

Create `.skills/custom/bootstrap/assets/constitution.template.md`:

```markdown
---
id: constitution
type: memory
version: 1.0.0
created: {{current_date}}
status: active
---

# CONSTITUTION — {{project_name}}

> Immutable rules. Survives compaction. Re-read if context feels wrong.

## Project Identity

- **Stack**: {{stack_description}}
- **Locale**: {{locale}}

## Critical Rules

1. {{most_critical_rule}}
2. {{rule_2}}
3. {{rule_3}}
4. {{rule_4}}
5. {{rule_5}}

## Drift Recovery

If rules feel wrong after compaction:
1. Re-read this file
2. Read .claude/PROGRESS.md for session state
3. Run `{{test_command}}` to verify environment
```

- [ ] **Step 2: Create compass.md template**

Create `.skills/custom/bootstrap/assets/compass.template.md`:

```markdown
---
id: compass
type: memory
version: 1.0.0
created: {{current_date}}
status: active
---

STACK: {{stack_one_liner}}
RULE: {{single_most_critical_rule}}
STATE: .claude/PROGRESS.md | Decisions: .claude/memory/architectural-decisions.md
```

- [ ] **Step 3: Create verification-gate.md template**

Create `.skills/custom/bootstrap/assets/verification-gate.template.md`:

```markdown
# Verification Gate — Always-On Rule

> Before claiming any task is done, produce a VERIFICATION CHECKLIST.

## Required Before Completion

1. **Where to check** — the URL or location in the app
2. **How to get there** — navigation steps from the starting point
3. **What to see** — specific, observable outcomes
4. **What NOT to see** — error states, blank areas, missing elements
5. **Confirmation prompt** — ask the user to reply "looks good" or describe what's different

## Checklist Format

```
VERIFICATION CHECKLIST — [Feature/Task Name]

Before this is done, please check:
[ ] Go to: [URL or location]
[ ] [Step-by-step action]
[ ] You should see: [observable result]
[ ] You should NOT see: [what should be absent]

Reply "looks good" to close this, or describe what's different.
```

## Exceptions

Does NOT apply to: documentation-only changes, config changes, test-only changes, git operations.
```

- [ ] **Step 4: Create bugfix blueprint template**

Create `.skills/custom/bootstrap/assets/bugfix.blueprint.template.md`:

```markdown
---
id: bugfix.blueprint
type: blueprint
version: 1.0.0
created: {{current_date}}
status: active
---

# Bugfix Blueprint

## DAG

```
reproduce --> fix --> test --> pr
```

## Nodes

### reproduce
- **Owner**: engineer
- **Action**: Write a failing test that demonstrates the bug
- **Gate**: Test fails with expected error
- **Cap**: 1 iteration

### fix
- **Owner**: engineer
- **Action**: Write minimal code to make the failing test pass
- **Gate**: All tests pass (not just the new one)
- **Cap**: 1 iteration

### test
- **Owner**: engineer
- **Action**: Run full test suite, type-check, lint
- **Commands**: `{{test_command}}`, `{{typecheck_command}}`, `{{lint_command}}`
- **Gate**: All pass
- **Cap**: 2 iterations (fix-lint, fix-ci)

### pr
- **Owner**: engineer
- **Action**: Commit and create PR
- **Gate**: PR created with test evidence
- **Cap**: 1 iteration

## Iteration Caps

| Node | Cap |
|------|-----|
| reproduce | 1 |
| fix | 1 |
| test | 2 |
| pr | 1 |
| **Total** | **5** |

## Escalation

If any node exceeds its cap, halt and report to user with:
- What was attempted
- What failed
- Suggested next steps
```

- [ ] **Step 5: Create feature blueprint template**

Create `.skills/custom/bootstrap/assets/feature.blueprint.template.md`:

```markdown
---
id: feature.blueprint
type: blueprint
version: 1.0.0
created: {{current_date}}
status: active
---

# Feature Blueprint

## DAG

```
spec --> implement --> test --> review --> pr
```

## Nodes

### spec
- **Owner**: engineer
- **Action**: Define acceptance criteria, identify files to create/modify
- **Gate**: Clear criteria documented
- **Cap**: 1 iteration

### implement
- **Owner**: engineer
- **Action**: TDD cycle — failing test, minimal code, pass, refactor
- **Gate**: All acceptance criteria have passing tests
- **Cap**: 1 iteration

### test
- **Owner**: engineer
- **Action**: Run full test suite, type-check, lint
- **Commands**: `{{test_command}}`, `{{typecheck_command}}`, `{{lint_command}}`
- **Gate**: All pass
- **Cap**: 2 iterations

### review
- **Owner**: engineer
- **Action**: Self-review against acceptance criteria
- **Gate**: All criteria met with evidence
- **Cap**: 1 iteration

### pr
- **Owner**: engineer
- **Action**: Commit and create PR
- **Gate**: PR created with evidence trail
- **Cap**: 1 iteration

## Iteration Caps

| Node | Cap |
|------|-----|
| spec | 1 |
| implement | 1 |
| test | 2 |
| review | 1 |
| pr | 1 |
| **Total** | **6** |
```

- [ ] **Step 6: Create refactor blueprint template**

Create `.skills/custom/bootstrap/assets/refactor.blueprint.template.md`:

```markdown
---
id: refactor.blueprint
type: blueprint
version: 1.0.0
created: {{current_date}}
status: active
---

# Refactor Blueprint

## DAG

```
scope --> implement --> verify-no-regression --> pr
```

## Nodes

### scope
- **Owner**: engineer
- **Action**: Define refactor boundaries, list files affected, confirm no behaviour change
- **Gate**: Scope documented, existing tests identified
- **Cap**: 1 iteration

### implement
- **Owner**: engineer
- **Action**: Refactor code. Run existing tests after each change.
- **Gate**: All existing tests still pass
- **Cap**: 1 iteration

### verify-no-regression
- **Owner**: engineer
- **Action**: Full test suite, type-check, lint. Compare test count before/after (must not decrease).
- **Commands**: `{{test_command}}`, `{{typecheck_command}}`, `{{lint_command}}`
- **Gate**: All pass, test count unchanged or increased
- **Cap**: 2 iterations

### pr
- **Owner**: engineer
- **Action**: Commit and create PR
- **Gate**: PR shows no behaviour change, only structural improvement
- **Cap**: 1 iteration

## Iteration Caps

| Node | Cap |
|------|-----|
| scope | 1 |
| implement | 1 |
| verify-no-regression | 2 |
| pr | 1 |
| **Total** | **5** |
```

- [ ] **Step 7: Create migration blueprint template**

Create `.skills/custom/bootstrap/assets/migration.blueprint.template.md`:

```markdown
---
id: migration.blueprint
type: blueprint
version: 1.0.0
created: {{current_date}}
status: active
skip_condition: "No database detected"
---

# Migration Blueprint

## DAG

```
backup --> migrate --> verify --> rollback-test --> pr
```

## Nodes

### backup
- **Owner**: engineer
- **Action**: Document current schema state, ensure backup exists
- **Gate**: Schema snapshot recorded
- **Cap**: 1 iteration

### migrate
- **Owner**: engineer
- **Action**: Write and apply migration
- **Command**: `{{migration_command}}`
- **Gate**: Migration applies without errors
- **Cap**: 1 iteration

### verify
- **Owner**: engineer
- **Action**: Run full test suite against migrated database
- **Commands**: `{{test_command}}`
- **Gate**: All tests pass
- **Cap**: 2 iterations

### rollback-test
- **Owner**: engineer
- **Action**: Verify rollback procedure works (if applicable)
- **Gate**: Database returns to pre-migration state cleanly
- **Cap**: 1 iteration

### pr
- **Owner**: engineer
- **Action**: Commit migration + tests, create PR
- **Gate**: PR includes migration SQL and test evidence
- **Cap**: 1 iteration

## Iteration Caps

| Node | Cap |
|------|-----|
| backup | 1 |
| migrate | 1 |
| verify | 2 |
| rollback-test | 1 |
| pr | 1 |
| **Total** | **6** |
```

- [ ] **Step 8: Create code rubric template**

Create `.skills/custom/bootstrap/assets/code-rubric.template.md`:

```markdown
---
name: code-rubric
type: rubric
pass_threshold: 70
version: 1.0.0
---

# Code Quality Rubric

## Scoring (100 points)

### Test Coverage (25 pts)
- 25: TDD approach, all acceptance criteria covered
- 20: Tests exist for main paths
- 10: Some tests, gaps in coverage
- 0: No tests

### Type Safety (25 pts)
- 25: Strict types throughout, no `any`/unsafe casts
- 20: Minor type gaps
- 10: Significant type gaps
- 0: No type safety

### Error Handling (25 pts)
- 25: All error paths handled, user-facing messages clear
- 20: Most paths handled
- 10: Happy path only
- 0: No error handling

### Code Organisation (25 pts)
- 25: Clear module boundaries, no circular deps, DRY
- 20: Minor organisation issues
- 10: Mixed responsibilities, some duplication
- 0: Tangled, no clear structure

## Thresholds

| Score | Action |
|-------|--------|
| 90-100 | Approved |
| 70-89 | Minor fixes, then approved |
| 50-69 | Return to engineer — one iteration |
| <50 | Reject — escalate to user |

## Verification Commands

```bash
{{typecheck_command}}
{{lint_command}}
{{test_command}}
```
```

- [ ] **Step 9: Create architecture rubric template**

Create `.skills/custom/bootstrap/assets/architecture-rubric.template.md`:

```markdown
---
name: architecture-rubric
type: rubric
pass_threshold: 70
version: 1.0.0
---

# Architecture Rubric

## Scoring (100 points)

### Boundary Respect (25 pts)
- 25: No cross-layer imports, clear module boundaries
- 20: Minor boundary violations
- 10: Several cross-layer imports
- 0: No clear boundaries

### Dependency Direction (25 pts)
- 25: Dependencies flow one direction (inward/downward)
- 20: Mostly correct, one exception
- 10: Mixed dependency directions
- 0: Circular or inverted dependencies

### Interface Design (25 pts)
- 25: Clear public APIs, minimal surface area
- 20: Mostly clear, some leaky abstractions
- 10: Unclear boundaries between modules
- 0: Everything is public

### Change Impact (25 pts)
- 25: Change is isolated, minimal blast radius
- 20: Change touches 2-3 modules with clear reason
- 10: Change ripples across many modules
- 0: Change requires modifying unrelated code

## Thresholds

| Score | Action |
|-------|--------|
| 90-100 | Approved |
| 70-89 | Minor adjustments |
| 50-69 | Redesign required — one iteration |
| <50 | Reject — escalate to user |
```

- [ ] **Step 10: Commit all governance templates**

```bash
git add .skills/custom/bootstrap/assets/constitution.template.md
git add .skills/custom/bootstrap/assets/compass.template.md
git add .skills/custom/bootstrap/assets/verification-gate.template.md
git add .skills/custom/bootstrap/assets/bugfix.blueprint.template.md
git add .skills/custom/bootstrap/assets/feature.blueprint.template.md
git add .skills/custom/bootstrap/assets/refactor.blueprint.template.md
git add .skills/custom/bootstrap/assets/migration.blueprint.template.md
git add .skills/custom/bootstrap/assets/code-rubric.template.md
git add .skills/custom/bootstrap/assets/architecture-rubric.template.md
git commit -m "feat(bootstrap): add governance tier template assets"
```

---

## Task 6: Create Production Template Asset

**Files:**
- Create: `.skills/custom/bootstrap/assets/deploy-pipeline.template.md`

- [ ] **Step 1: Create the deploy pipeline template**

Create `.skills/custom/bootstrap/assets/deploy-pipeline.template.md`:

```markdown
---
id: deploy-pipeline
type: workflow
version: 1.0.0
created: {{current_date}}
status: active
---

# Deploy Pipeline — {{project_name}}

> Deterministic, stage-gated deployment. Halts at approval gates.
> State persists to `.claude/data/deploy-state.json`.

## Stage 1: PRE-FLIGHT

**Type**: automatic gate

**Checks:**
- [ ] Test suite passes: `{{test_command}}`
- [ ] Types clean: `{{typecheck_command}}`
- [ ] Lint clean: `{{lint_command}}`
- [ ] Git working tree is clean: `git status --porcelain`
- [ ] Environment variables match .env.example (if applicable)

**Gate**: ALL checks must pass. Any failure → HALT with structured report.

**Envelope output:**
```json
{
  "stage": "pre-flight",
  "status": "passed | failed",
  "output": {
    "tests": "{{result}}",
    "types": "{{result}}",
    "lint": "{{result}}",
    "git": "{{result}}"
  },
  "gate": { "type": "automatic", "passed": true },
  "next": "build"
}
```

## Stage 2: BUILD

**Type**: automatic gate

**Actions:**
- [ ] Run production build: `{{build_command}}`
- [ ] Record build artifacts/hash

**Gate**: Build succeeds → proceed. Fails → HALT.

**Envelope output:**
```json
{
  "stage": "build",
  "status": "passed | failed",
  "output": { "build": "{{result}}", "hash": "{{build_hash}}" },
  "gate": { "type": "automatic", "passed": true },
  "next": "migrate"
}
```

## Stage 3: MIGRATE

**Type**: approval gate
**Skip condition**: No database detected

**Actions:**
- [ ] Generate migration diff
- [ ] Show exact changes to user

**APPROVAL GATE:**
```
MIGRATION APPROVAL REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━
Changes:
{{migration_diff}}

Affected tables: {{tables}}

Apply these migrations to production? (yes/no)
```

**HALT until explicit "yes".** Do not proceed automatically.

- [ ] Apply migration on approval: `{{migration_command}}`

**Rollback**: `{{migration_rollback_command}}`

## Stage 4: DEPLOY

**Type**: approval gate

**APPROVAL GATE:**
```
DEPLOY APPROVAL REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━
Build: {{build_hash}}
Target: {{deploy_target}}
Branch: {{branch}}

Deploy to production? (yes/no)
```

**HALT until explicit "yes".**

- [ ] Execute deploy: `{{deploy_command}}`

**Rollback**: `{{rollback_command}}`

## Stage 5: CANARY

**Type**: automatic gate (post-deploy)

**Checks:**
- [ ] Health check: `curl -sf {{production_url}}/api/health || curl -sf {{production_url}}`
- [ ] No new errors in monitoring (if configured)

**Gate**: All healthy → proceed. Any failure → present rollback options.

**On failure:**
```
CANARY FAILURE — Production health check failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error: {{error_description}}

ROLLBACK OPTIONS:
  1. {{rollback_command}} (instant)
  2. git revert HEAD && git push (code-level revert)
  3. Manual investigation (keep deployment, debug)

Which option?
```

## Stage 6: CONFIRM

**Type**: informational

```
DEPLOY COMPLETE
━━━━━━━━━━━━━━━
Build: {{build_hash}}
Target: {{deploy_target}}
Deployed at: {{timestamp}}

Monitor for 24 hours.
Rollback if needed: {{rollback_command}}
```

## State Persistence

Pipeline state is written to `.claude/data/deploy-state.json` after each stage.
If session ends mid-deploy, next session reads state and resumes from the last completed stage.

```json
{
  "pipelineId": "deploy-{{date}}-{{sequence}}",
  "startedAt": "{{iso_timestamp}}",
  "currentStage": "{{stage_name}}",
  "stageResults": {},
  "pendingApproval": null
}
```
```

- [ ] **Step 2: Commit**

```bash
git add .skills/custom/bootstrap/assets/deploy-pipeline.template.md
git commit -m "feat(bootstrap): add production tier deploy pipeline template"
```

---

## Task 7: Create the Main SKILL.md

This is the brain of the generator — the skill definition that orchestrates discovery, generation, hardening, and reporting.

**Files:**
- Create: `.skills/custom/bootstrap/SKILL.md`

- [ ] **Step 1: Write the main skill file**

Create `.skills/custom/bootstrap/SKILL.md`:

```markdown
---
name: bootstrap
description: Adaptive Project Control System generator. Discovers project, classifies maturity, generates CLAUDE.md + companion files + hooks across three tiers (Foundation, Governance, Production). Use when bootstrapping a new project or auditing an existing one.
version: 2.0.0
context: fork
triggers:
  - /bootstrap
  - bootstrap
  - project control
  - initialise project
  - set up claude
---

# Adaptive Project Control System — Bootstrap

You are the Project Control System generator. Your job is to discover a project, classify its maturity, and generate the right level of Claude Code project control.

## Invocation

```
/bootstrap                    # Auto-discover, generate all applicable tiers
/bootstrap --tier foundation  # Force foundation only
/bootstrap --audit            # Compare existing files, propose upgrades
```

## Phase 1: DISCOVER

Read-only. Collect signals. Classify the project.

### Step 1: Detect Stack

Run these commands and read the output:

```bash
# Map structure (first 80 files, 3 levels deep)
find . -maxdepth 3 -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/target/*' -not -path '*/__pycache__/*' | head -80

# Detect stack
cat package.json 2>/dev/null || cat pyproject.toml 2>/dev/null || cat Cargo.toml 2>/dev/null || cat go.mod 2>/dev/null

# Check existing Claude files
cat CLAUDE.md 2>/dev/null
ls .claude/ 2>/dev/null
cat .claude/settings.json 2>/dev/null

# Detect build stage from git activity
git log --oneline -10 2>/dev/null

# Detect env patterns
cat .env.example 2>/dev/null || cat .env.local 2>/dev/null
```

### Step 2: Classify

Read `.skills/custom/bootstrap/references/tier-criteria.md` for the full classification logic.

From the discovery data, determine:
- **Language/Framework**
- **Package manager**
- **Test runner** and exact commands
- **Formatter** and exact command
- **Build stage**: Greenfield (<20 src files), Active Build, Stabilisation, Production
- **Database/ORM** if any
- **Deploy target** if any
- **Monorepo** structure if any

### Step 3: Check for Existing Files

If CLAUDE.md or `.claude/` exists → enter **audit mode** (see Phase 2b below).

### Step 4: Output Discovery Report (internal)

Do NOT write this to a file. Hold it in context for Phase 2.

```
DISCOVERY REPORT
━━━━━━━━━━━━━━━━
Project: {{name}}
Stack: {{language}} / {{framework}}
Package Manager: {{pm}}
Test Runner: {{runner}} — {{test_command}}
Formatter: {{formatter}} — {{format_command}}
Build Stage: {{stage}}
Database: {{db}} — {{migration_command}}
Deploy Target: {{target}} — {{deploy_command}} / {{rollback_command}}
Monorepo: {{yes/no}} — {{type}}
Existing Claude Files: {{list or "none"}}

TIER ASSIGNMENT: {{Foundation | Foundation + Governance | Foundation + Governance + Production}}
```

## Phase 2: GENERATE

Generate all files for the assigned tier(s). Read the template assets from `.skills/custom/bootstrap/assets/` as guidance — do NOT copy them verbatim. Understand the project from discovery data and generate context-appropriate content.

### Foundation Tier (always generated)

Read each template, then generate the file with project-specific content:

1. **CLAUDE.md** (root) — read `assets/claude-md.template.md`
   - Fill commands from discovery
   - Generate 5-15 rules specific to this project (not generic)
   - Critical rules at TOP and BOTTOM
   - Positively framed
   - <150 lines

2. **.claude/ARCHITECTURE.md** — read `assets/architecture.template.md`
   - Generate from actual project structure discovered in Phase 1
   - <200 lines

3. **.claude/STANDARDS.md** — read `assets/standards.template.md`
   - Read 3-5 source files to understand actual patterns
   - Reference real canonical files (not placeholders)
   - <200 lines

4. **.claude/TESTING.md** — read `assets/testing.template.md`
   - Use exact test commands from discovery
   - <200 lines

5. **.claude/WORKFLOWS.md** — read `assets/workflows.template.md`
   - Include deploy/rollback if Production tier
   - <200 lines

6. **.claude/PROGRESS.md** — read `assets/progress.template.md`
   - Initialise with current date and build stage

7. **.claude/settings.json** — read `references/hook-templates.md`
   - Generate hooks appropriate to tier and platform (Windows: PowerShell, Unix: Bash)
   - If settings.json already exists, MERGE hooks — do not clobber existing ones
   - Include permissions section

### Governance Tier (Active Build+)

8. **.claude/memory/CONSTITUTION.md** — read `assets/constitution.template.md`
   - Extract the 5 most critical rules from the CLAUDE.md you just generated

9. **.claude/memory/compass.md** — read `assets/compass.template.md`
   - ~100 tokens maximum

10. **.claude/memory/current-state.md** — initialise with:
    ```
    Bootstrapped: {{current_date}}
    Stage: {{build_stage}}
    Tier: {{assigned_tier}}
    ```

11. **.claude/memory/architectural-decisions.md** — initialise with:
    ```
    # Architectural Decisions
    [{{current_date}}] DECISION: Bootstrapped PCS at {{tier}} tier | REASON: Build stage classified as {{stage}} | ALTERNATIVES REJECTED: none
    ```

12. **.claude/blueprints/** — read blueprint templates, generate for this project
    - Always: bugfix, feature, refactor
    - If database detected: migration

13. **.claude/rubrics/** — read rubric templates, generate with project-specific criteria

14. **.claude/rules/verification-gate.md** — read `assets/verification-gate.template.md`

15. **Update settings.json** — add Governance hooks (SessionStart, UserPromptSubmit, PreCompact)

### Production Tier (deploy config detected)

16. **.claude/workflows/deploy-pipeline.md** — read `assets/deploy-pipeline.template.md`
    - Fill with detected deploy target commands
    - Fill with detected rollback commands

17. **Ensure `.claude/data/` exists** — `mkdir -p .claude/data`

18. **Ensure `.claude/backups/` exists** — `mkdir -p .claude/backups`

## Phase 2b: AUDIT MODE (existing projects)

If CLAUDE.md or `.claude/` already exists:

1. Read all existing files
2. Compare against the standard (templates + tier criteria)
3. Generate an audit report:

```
AUDIT REPORT — Project Control System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current tier: {{detected_tier}}
Recommended tier: {{recommended_tier}}

CLAUDE.md
  {{check_or_cross}} Commands section
  {{check_or_cross}} Rules section ({{count}} instructions, target: <20)
  {{check_or_cross}} Peripheral loading
  {{check_or_cross}} Architecture pointer
  ...

settings.json
  {{check_or_cross}} PreToolUse(Bash) destructive blocking
  {{check_or_cross}} PostToolUse format hook
  {{check_or_cross}} Stop hook (PROGRESS.md)
  {{check_or_cross}} PreCompact backup hook
  ...

RECOMMENDED UPGRADES:
  1. {{upgrade}}
  2. {{upgrade}}

Apply upgrades? (y/n)
```

Wait for user confirmation before applying changes.

## Phase 3: HARDEN

Read `.skills/custom/bootstrap/references/harden-checklist.md` and run every check against the generated files.

Fix any issues found. Common fixes:
- Merge rules if instruction count > 20
- Move linter-enforceable rules to hooks
- Add peripheral loading (copy critical rule to bottom)
- Remove duplication between files

## Phase 4: REPORT

Output a summary:

```
PROJECT CONTROL SYSTEM GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: {{name}} | Stage: {{stage}} | Stack: {{stack}}
Tier: {{tier}}

FILES CREATED
─────────────
  CLAUDE.md                          ({{N}} lines, {{N}} instructions)
  .claude/ARCHITECTURE.md            ({{N}} lines)
  .claude/STANDARDS.md               ({{N}} lines)
  .claude/TESTING.md                 ({{N}} lines)
  .claude/WORKFLOWS.md               ({{N}} lines)
  .claude/PROGRESS.md                ({{N}} lines)
  .claude/settings.json              ({{N}} hooks)
  {{governance files if applicable}}
  {{production files if applicable}}

HOOKS CONFIGURED
─────────────
  PreToolUse(Bash): Destructive command blocking
  PostToolUse(Write|Edit): Auto-format with {{formatter}}
  Stop: PROGRESS.md auto-update
  PreCompact: PROGRESS.md backup
  {{governance hooks if applicable}}

AUTO-ACTIVATION
─────────────
  All hooks fire automatically. No manual steps required.
  Next session will load context via SessionStart hook.

RECOMMENDED NEXT STEPS
─────────────
  1. Review generated CLAUDE.md — adjust rules to your preferences
  2. Review .claude/ARCHITECTURE.md — fill in any gaps
  3. Run {{test_command}} to verify environment
  {{tier-specific recommendations}}
```

## Important Rules

1. **Never overwrite existing files without audit mode confirmation**
2. **Templates are guidance, not copy-paste** — generate content appropriate to the actual project
3. **Read real source files** during generation to understand actual patterns (for STANDARDS.md)
4. **All hooks must reference scripts/commands that will exist** after generation
5. **Platform detection**: Use PowerShell hooks on Windows, Bash on Unix/Mac
6. **Merge, don't clobber**: If settings.json exists, merge new hooks into existing structure
7. **Every generated CLAUDE.md must have the Context Management section** — this is the compaction survival bridge
```

- [ ] **Step 2: Commit**

```bash
git add .skills/custom/bootstrap/SKILL.md
git commit -m "feat(bootstrap): add main SKILL.md — the generator brain"
```

---

## Task 8: Update the Bootstrap Command

Replace the existing project-specific bootstrap command with the new adaptive one.

**Files:**
- Modify: `.claude/commands/bootstrap.md`

- [ ] **Step 1: Read the existing command**

```bash
cat .claude/commands/bootstrap.md
```

Confirm you see the existing 10-step foundation setup (already read above).

- [ ] **Step 2: Replace with the new adaptive command**

Overwrite `.claude/commands/bootstrap.md` with:

```markdown
---
id: bootstrap
type: command
version: 2.0.0
created: 20/03/2026
modified: 02/04/2026
status: active
---

# Bootstrap Command

Adaptive Project Control System generator.

Discovers the project, classifies its maturity (Greenfield, Active Build, Stabilisation, Production), and generates the right level of Claude Code project control across three tiers.

## Usage

```
/bootstrap                    # Auto-discover, generate all applicable tiers
/bootstrap --tier foundation  # Force foundation only
/bootstrap --audit            # Compare existing files, propose upgrades
```

## Execution

Load and follow the skill at `.skills/custom/bootstrap/SKILL.md`.

The skill will:
1. **Discover** — detect stack, classify build stage, check for existing files
2. **Generate** — create CLAUDE.md + companion files + hooks for the assigned tier
3. **Harden** — self-review all generated files against quality checklist
4. **Report** — summary of what was created and recommended next steps

## Tiers

| Tier | When | What |
|------|------|------|
| **Foundation** | All projects | CLAUDE.md, ARCHITECTURE, STANDARDS, TESTING, WORKFLOWS, PROGRESS, settings.json hooks |
| **Governance** | Active Build+ | CONSTITUTION, compass, blueprints, rubrics, verification gate, memory system, drift-prevention hooks |
| **Production** | Deploy config detected | Deterministic deploy pipeline with approval gates, state persistence, rollback commands |

## After Bootstrap

Everything self-activates. Hooks fire automatically every session. No manual steps required.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/bootstrap.md
git commit -m "feat(bootstrap): replace static bootstrap with adaptive PCS generator"
```

---

## Task 9: Integration Test — Run Bootstrap in This Repo (Audit Mode)

Verify the skill works by running it against this repo in audit mode.

**Files:**
- No new files — this is a verification task

- [ ] **Step 1: Verify all skill files exist**

```bash
ls -la .skills/custom/bootstrap/SKILL.md
ls -la .skills/custom/bootstrap/references/
ls -la .skills/custom/bootstrap/assets/
```

Expected: SKILL.md exists, references/ has 3 files, assets/ has 16 files.

- [ ] **Step 2: Verify the command file**

```bash
head -20 .claude/commands/bootstrap.md
```

Expected: Version 2.0.0, adaptive description.

- [ ] **Step 3: Run a dry audit**

Read the SKILL.md and mentally walk through the discovery phase against this repo:
- Stack: Next.js 15 + FastAPI (detected from package.json + pyproject.toml)
- Build stage: Active Build (20+ files, moderate tests)
- Existing files: CLAUDE.md exists, .claude/ exists → audit mode
- Expected tier: Foundation + Governance (already have this), Production (Vercel detected? Check.)

```bash
ls vercel.json 2>/dev/null || ls Dockerfile 2>/dev/null || ls fly.toml 2>/dev/null || echo "No deploy config detected"
```

- [ ] **Step 4: Verify template completeness**

```bash
# Count templates
ls .skills/custom/bootstrap/assets/*.template.md | wc -l
```

Expected: 16 template files.

- [ ] **Step 5: Commit verification results**

If any issues found during verification, fix them and commit:

```bash
git add -A .skills/custom/bootstrap/
git commit -m "fix(bootstrap): address integration test findings"
```

If no issues:

```bash
echo "Bootstrap PCS verified — all files present, structure correct"
```

---

## Task 10: Final Commit and Summary

- [ ] **Step 1: Verify git status**

```bash
git status
git log --oneline -10
```

- [ ] **Step 2: Create a summary commit if any loose changes remain**

```bash
git add -A .skills/custom/bootstrap/
git status
# Only commit if there are staged changes
git diff --cached --quiet || git commit -m "chore(bootstrap): finalise adaptive PCS skill"
```

- [ ] **Step 3: Verify final file count**

```bash
echo "=== Skill Structure ==="
find .skills/custom/bootstrap -type f | sort

echo ""
echo "=== File Counts ==="
echo "References: $(ls .skills/custom/bootstrap/references/*.md | wc -l)"
echo "Assets: $(ls .skills/custom/bootstrap/assets/*.template.md | wc -l)"
echo "Total files: $(find .skills/custom/bootstrap -type f | wc -l)"
```

Expected output:
```
References: 3
Assets: 16
Total files: 20 (SKILL.md + 3 refs + 16 assets)
```
