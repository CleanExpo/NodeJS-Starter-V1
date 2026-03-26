# Autoresearch Program — Quality Improvement Loop

> Mirrors Karpathy's autoresearch `program.md` pattern, adapted for code quality optimisation.

## Goal

Maximise the composite quality score for NodeJS-Starter-V1.

## Metric Formula

```
score = 100 - (lint_errors × 3 + ts_errors × 5 + ruff_violations × 2 + mypy_errors × 4)
```

Score is capped at 0 (cannot go negative).

## Weights Rationale

| Tool | Weight | Reason |
|------|--------|--------|
| TypeScript errors (`ts_errors`) | ×5 | Correctness-critical; will break builds |
| Mypy errors (`mypy_errors`) | ×4 | Python type safety; affects runtime behaviour |
| ESLint errors (`lint_errors`) | ×3 | Code quality; often auto-fixable |
| Ruff violations (`ruff_violations`) | ×2 | Style/imports; lowest blast radius |

## Task

Given the current metrics and prior learnings, identify the **single highest-value improvement
hypothesis** that would most increase the composite score on the next loop iteration.

Prioritise:
1. Fixes with the highest weight × count product (TypeScript errors first, then mypy)
2. Fixes that are isolated to one file (lower blast radius)
3. Fixes that do not require understanding complex domain logic

## Safety Constraints

Never suggest changes to:
- Database schemas or Alembic migration files
- Authentication or authorisation logic (`src/auth/`, `middleware.ts`)
- Environment variable configuration (`.env`, `.env.example`)
- CI/CD pipeline definitions (`.github/workflows/`)
- This autoresearch system itself (`scripts/autoresearch/`)

Prefer targeted, isolated fixes over broad refactors.

## Output Format

Return **only** these five fields — no preamble, no markdown, no extra text:

```
HYPOTHESIS: <single actionable improvement statement>
TARGET_FILE: <file path relative to repo root, or "multiple">
EXPECTED_IMPROVEMENT: <estimated score increase, e.g. "+5">
CONFIDENCE: <percentage, e.g. "87%">
RATIONALE: <one to two sentences explaining why this is the highest-value fix>
```
