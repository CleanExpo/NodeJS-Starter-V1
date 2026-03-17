# Framework Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7 root causes of context bloat, memory loss, mid-build stopping, and missing idea-to-production pipeline.

**Architecture:** Configuration-only changes — no production code touched. Slim CLAUDE.md + consolidate rules + fix settings.json + add PostCompact hook + create idea-to-production skill.

**Tech Stack:** Claude Code settings.json, CLAUDE.md, PowerShell hooks, Markdown skill files.

---

## Root Causes Being Fixed

| Problem                                  | Root Cause                                                 | Fix                                |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| Context bloat / compaction not at 45-50% | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` not set                  | Add to `settings.json` env         |
| Rules ignored                            | 12 rule files (1,127 lines) all load unconditionally       | Consolidate to 3 path-scoped files |
| CLAUDE.md instructions lost              | 325 lines — exceeds ~150-200 instruction adherence limit   | Slim to ~100 lines                 |
| Work not committed                       | No commit step in workflow                                 | Add to skill + agents              |
| Mid-build stops                          | Iteration cap at 3, missing permissions (pnpm, uv, python) | Remove cap, expand permissions     |
| Context lost after compaction            | PostCompact hook didn't exist (now it does)                | Add PostCompact hook               |
| Repeat workflow explanation              | No idea-to-production skill                                | Create it                          |

---

## Files Being Changed

| File                                             | Action                 | Purpose                                                                           |
| ------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------- |
| `.claude/settings.json`                          | Modify                 | Add env vars, fix model, PostCompact hook, expand permissions, remove dead weight |
| `CLAUDE.md`                                      | Modify (slim)          | 325 → ~100 lines                                                                  |
| `.claude/rules/core.md`                          | Create                 | Essential rules, always loaded (~100 lines)                                       |
| `.claude/rules/frontend.md`                      | Create                 | Frontend rules, path-scoped to `apps/web/**`                                      |
| `.claude/rules/backend.md`                       | Create                 | Backend rules, path-scoped to `apps/backend/**`                                   |
| `.claude/rules/cli-control-plane.md`             | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/council-of-logic.md`              | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/genesis-hive-mind.md`             | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/human-outcome-translation.md`     | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/context-drift.md`                 | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/retrieval-first.md`               | Archive → delete       | Consolidated into core.md                                                         |
| `.claude/rules/skills/minions-protocol.md`       | Keep                   | Already scoped to minion contexts                                                 |
| `.claude/rules/skills/orchestration.md`          | Keep                   | Already scoped                                                                    |
| `.claude/rules/development/workflow.md`          | Keep                   | Already scoped                                                                    |
| `.claude/rules/frontend/nextjs.md`               | Merge into frontend.md | Path-scoped                                                                       |
| `.claude/rules/backend/fastapi-agents.md`        | Merge into backend.md  | Path-scoped                                                                       |
| `.claude/hooks/scripts/post-compact-restore.ps1` | Create                 | PostCompact hook script                                                           |
| `.skills/custom/idea-to-production/SKILL.md`     | Create                 | Idea-to-production pipeline                                                       |

---

## Task 1: Clean Up settings.json

**Files:**

- Modify: `.claude/settings.json`

- [ ] **Step 1: Backup current settings.json**

  ```bash
  cp .claude/settings.json .claude/settings.json.bak
  ```

- [ ] **Step 2: Rewrite settings.json** — Remove dead-weight keys (commands, templates, rules, memory, init), fix model, add env vars, add PostCompact hook, expand permissions. See exact content in Task 1 output below.

- [ ] **Step 3: Verify settings.json is valid JSON**

  ```bash
  python -c "import json; json.load(open('.claude/settings.json')); print('Valid JSON')"
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add .claude/settings.json
  git commit -m "chore(claude): slim settings.json, add env vars, PostCompact hook, expand permissions"
  ```

---

## Task 2: Slim CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Backup**

  ```bash
  cp CLAUDE.md CLAUDE.md.bak
  ```

- [ ] **Step 2: Rewrite CLAUDE.md** — Keep Quick Commands table, Architecture Routing table, Key Principles (5 bullets), Design tokens (colours only). Remove: verbose auth flow, env vars list, DB migrations steps, multi-agent harness detail (now lives in AGENT_HARNESS.md). Target: ~100 lines.

- [ ] **Step 3: Verify line count**

  ```bash
  wc -l CLAUDE.md
  ```

  Expected: < 120 lines

- [ ] **Step 4: Commit**
  ```bash
  git add CLAUDE.md
  git commit -m "chore(claude): slim CLAUDE.md from 325 to ~100 lines"
  ```

---

## Task 3: Consolidate Rule Files

**Files:**

- Create: `.claude/rules/core.md`
- Create: `.claude/rules/frontend.md`
- Create: `.claude/rules/backend.md`
- Delete/Archive: 6 rules files being consolidated

- [ ] **Step 1: Create `.claude/rules/core.md`** — Always-loaded essentials: critical rules, intent routing, context management, retrieval order, locale. ~100 lines.

- [ ] **Step 2: Create `.claude/rules/frontend.md`** — Path-scoped to `apps/web/**`. Merge content from `frontend/nextjs.md`.

- [ ] **Step 3: Create `.claude/rules/backend.md`** — Path-scoped to `apps/backend/**`. Merge content from `backend/fastapi-agents.md`.

- [ ] **Step 4: Archive old files**

  ```bash
  mkdir -p .claude/rules/archive
  mv .claude/rules/cli-control-plane.md .claude/rules/archive/
  mv .claude/rules/council-of-logic.md .claude/rules/archive/
  mv .claude/rules/genesis-hive-mind.md .claude/rules/archive/
  mv .claude/rules/human-outcome-translation.md .claude/rules/archive/
  mv .claude/rules/context-drift.md .claude/rules/archive/
  mv .claude/rules/retrieval-first.md .claude/rules/archive/
  mv .claude/rules/frontend/nextjs.md .claude/rules/archive/
  mv .claude/rules/backend/fastapi-agents.md .claude/rules/archive/
  ```

- [ ] **Step 5: Verify total line count**

  ```bash
  wc -l .claude/rules/core.md .claude/rules/frontend.md .claude/rules/backend.md
  ```

  Expected: < 300 lines total

- [ ] **Step 6: Commit**
  ```bash
  git add .claude/rules/
  git commit -m "chore(claude): consolidate 12 rule files to 3 path-scoped files"
  ```

---

## Task 4: Add PostCompact Hook Script

**Files:**

- Create: `.claude/hooks/scripts/post-compact-restore.ps1`

- [ ] **Step 1: Create post-compact-restore.ps1** — Script reads `.claude/memory/current-state.md` and outputs a JSON context injection block with current task, blockers, and next action.

- [ ] **Step 2: Test script manually**

  ```bash
  powershell -ExecutionPolicy Bypass -File ".claude/hooks/scripts/post-compact-restore.ps1"
  ```

  Expected: JSON output with context block

- [ ] **Step 3: Commit**
  ```bash
  git add .claude/hooks/scripts/post-compact-restore.ps1
  git commit -m "chore(claude): add PostCompact hook to re-inject context after compaction"
  ```

---

## Task 5: Create Idea-to-Production Skill

**Files:**

- Create: `.skills/custom/idea-to-production/SKILL.md`
- Update: `.skills/AGENTS.md` (add entry)

- [ ] **Step 1: Create `.skills/custom/idea-to-production/SKILL.md`** — Plain-English pipeline: Intake → Plan → Build → Test → Commit → Verify. Includes decision tree for task type, phase timing estimates, and explicit commit step.

- [ ] **Step 2: Add to `.skills/AGENTS.md`** registry.

- [ ] **Step 3: Commit**
  ```bash
  git add .skills/
  git commit -m "feat(skills): add idea-to-production skill with plain-English pipeline"
  ```

---

## Verification (After All Tasks)

- [ ] **Check total always-loaded instruction count**

  ```bash
  wc -l CLAUDE.md .claude/rules/core.md .claude/memory/CONSTITUTION.md
  ```

  Expected: < 300 lines total (was ~1,900)

- [ ] **Verify JSON validity**

  ```bash
  python -c "import json; json.load(open('.claude/settings.json')); print('OK')"
  ```

- [ ] **Run project health check**

  ```bash
  cd D:/NodeJS-Starter-V1 && npx tsc --noEmit 2>&1 | tail -5
  ```

  Expected: no errors

- [ ] **Final commit**
  ```bash
  git log --oneline -5
  ```
