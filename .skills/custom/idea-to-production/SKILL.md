---
name: idea-to-production
description: Plain-English idea-to-production pipeline. Use when starting any new feature, fix, or task. Routes through intake, plan, build, test, commit, verify phases.
triggers:
  - "let's build"
  - 'I want to add'
  - 'can we create'
  - 'implement'
  - 'new feature'
  - "let's work on"
---

# Idea-to-Production Pipeline

A plain-English pipeline that takes any idea from description to committed, verified code.

## Decision Tree — Where to Start

```
What are you describing?

A) New feature or capability → Phase 1: Intake
B) Broken/buggy behaviour → Phase 1: Intake (FIX mode)
C) Health check / "is this working?" → Phase 6: Verify only
D) Design or architecture discussion → Phase 2: Plan only
```

---

## Phase 1: Intake

**Who runs this**: Claude (you) at the start of every task.

1. Read `.claude/memory/current-state.md` — what's in progress?
2. Read `.claude/memory/CONSTITUTION.md` — what are the immutable rules?
3. Classify intent: BUILD / FIX / PLAN / AUDIT / EXPLORE (see `core.md`)
4. Search codebase for existing implementations before proposing anything new
   - `grep -r "feature-name" apps/` — find existing patterns
   - `ls apps/web/components/` — see what components exist
5. Output a one-paragraph summary: what we're building, what exists already, what's new

**Gate**: No code written until intake is complete.

---

## Phase 2: Plan

**Who runs this**: Claude, using `superpowers:writing-plans` skill.

1. Define the feature in plain English (2-3 sentences max)
2. List the files that will be created or modified (with exact paths)
3. Write bite-sized tasks with checkbox syntax:
   ```markdown
   - [ ] Write the failing test
   - [ ] Run test — confirm it fails
   - [ ] Write minimal code to pass
   - [ ] Run test — confirm it passes
   - [ ] Commit
   ```
4. Save plan to `docs/superpowers/plans/YYYY-MM-DD-<name>.md`
5. State the Definition of Done explicitly

**Gate**: Plan approved (explicitly or implicitly) before building starts.

---

## Phase 3: Build

**Who runs this**: Claude, using `superpowers:subagent-driven-development` skill.

1. Fresh subagent per task (no context pollution)
2. Each subagent follows TDD: failing test → minimal code → passing test
3. After each task: spec compliance review, then code quality review
4. Subagent reports one of: `DONE` | `DONE_WITH_CONCERNS` | `NEEDS_CONTEXT` | `BLOCKED`
5. Never write production code without a failing test first

**Gate**: Both review stages pass before moving to next task.

---

## Phase 4: Test

**Who runs this**: Claude, after each build task.

```bash
# Frontend
pnpm test --filter=web

# Backend
cd apps/backend && uv run pytest -v

# All
pnpm turbo run test
```

**Gate**: Tests pass. No "should work" claims — run the commands.

---

## Phase 5: Commit

**Who runs this**: Claude, after tests pass.

```bash
# Stage specific files (never git add -A)
git add apps/web/components/FeatureName.tsx apps/web/__tests__/FeatureName.test.tsx

# Commit with conventional message
git commit -m "feat(web): add FeatureName component with tests"

# Verify commit landed
git log --oneline -3
```

**Rules**:

- Commit after EVERY completed task — not at the end of everything
- Never commit `.env`, credentials, or large binaries
- Use conventional commits: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

**Gate**: `git log` confirms the commit exists.

---

## Phase 6: Verify

**Who runs this**: Claude, using `superpowers:verification-before-completion` skill.

```bash
# Full quality check
pnpm turbo run type-check lint test

# Or shorthand
pnpm run verify
```

Produce evidence:

- Test output (pass/fail counts)
- Type-check output (0 errors)
- Lint output (0 warnings)
- Build output (if applicable)

**Banned phrases**: "should work", "probably passes", "seems correct", "likely fixed"

**Gate**: All checks green with evidence shown.

---

## Phase 7: Production Gate

**Who runs this**: Human review.

1. Claude creates PR: `gh pr create --title "..." --body "..."`
2. PR body includes: what was built, test results, Definition of Done checklist
3. Claude labels PR `ready-for-review`
4. **Claude never merges** — human reviews and merges

---

## Parallel Execution (Worktrees)

For multiple independent features being built at the same time:

```bash
# Create isolated workspace
claude --worktree feature-name

# Or via skill
# Use superpowers:using-git-worktrees
```

Each worktree is an isolated branch + directory. No shared state between parallel builds.

---

## Context Management

- Main Claude session manages coordination only
- Delegate file reads and implementations to subagents
- Keep main context under 50% (set via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50`)
- Before long tasks: `cat .claude/memory/current-state.md` to restore context

---

## Quick Reference

| Situation                 | Action                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Starting anything new     | Phase 1: Intake first                                                   |
| Something is broken       | Phase 1: Intake → FIX mode                                              |
| Tests failing             | `superpowers:systematic-debugging`                                      |
| About to say "done"       | Phase 6: Verify first                                                   |
| Multiple features at once | `superpowers:using-git-worktrees`                                       |
| Task is very large        | `superpowers:writing-plans` → `superpowers:subagent-driven-development` |
| Context feels wrong       | `cat .claude/memory/CONSTITUTION.md`                                    |
