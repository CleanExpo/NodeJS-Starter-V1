# 0001 — Starter-pack engineering standard

- Status: accepted
- Date: 2026-07-15

## Context

This repository is the template every new project starts from. A template's defaults
propagate into every downstream project, so the engineering discipline must be wired in
here — not re-learned per project. The standard below distills the estate's engineering
doctrine (2nd Brain wiki: agentic-engineering-harness, Anthropic engineering course notes,
estate PR-merge standard, second-brain standard) into the defaults this repo enforces.

## Decision

A project started from this template ships with, on day one:

1. **Typed surface, no exemptions.** `strict: true` TypeScript and no source files carved
   out of `tsc` via `exclude`. Untyped-through-exclusion is forbidden; if a file can't
   type-check it isn't done.
2. **Gates before merge, not after.** CI gates every PR: type-check, lint, format check,
   tests (frontend + backend with coverage floors), build, accessibility, secret scan
   (gitleaks), Conventional-Commit PR title. Local `pnpm verify` mirrors CI.
3. **Merge rails for a single-account org.** Branch protection with required status
   checks, `strict=false`, auto-merge and delete-branch-on-merge enabled, linear history.
   NO required-review rule — with one account it permanently blocks all merges; add it
   only when a second reviewer account exists. Dependabot PRs auto-merge on green.
4. **No live credentials anywhere.** `.env.example` holds placeholders only; code never
   falls back to a real project URL or key (fail fast with a named error instead);
   gitleaks enforces this in CI. Env access is schema-validated (zod frontend,
   pydantic-settings backend).
5. **Agent harness is part of the product.** `CLAUDE.md` stays short, current, and
   architectural; task-conditional guidance lives in skills pulled on demand; hooks and
   permission allowlists are checked in; verification environments (Playwright + a11y +
   headless CI) are the highest-leverage investment and every agent-built change is
   verified where the user meets it.
6. **Tickets are agent-briefs.** Issues carry expected-vs-actual and verification
   commands; only tickets meeting the agent-brief bar are agent-pullable.
7. **Decisions are recorded.** ADRs in this directory from day one; a PR that
   contradicts an accepted ADR must supersede it explicitly.

## Consequences

- New projects inherit the full gate set by cloning + running
  `scripts/bootstrap-new-project.sh` (renames, resets env, applies repo settings).
- The gates cost CI minutes on every PR; that is the accepted price of merge-on-green.
- Anything this standard forbids (excluded source, committed credentials, required-review
  on a single-account org) is a PR-blocking defect, not a style preference.
