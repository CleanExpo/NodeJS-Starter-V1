---
name: code-rubric
type: rubric
scored_by:
  - qa-validator
  - verification
pass_threshold: 70
version: 1.1.0
---

# Code Quality Rubric

Scored by `qa-validator` (acceptance criteria) and `verification` (test/lint/build pass) during Phase 6.

## Dimensions (100 points total)

### 1. Test Coverage (20 points)

| Score | Criteria |
|-------|----------|
| 20 | TDD followed. Failing test written first. All acceptance criteria have corresponding tests. Edge cases covered. |
| 15 | Good coverage but TDD order not strictly followed. |
| 10 | Tests exist but miss key acceptance criteria or edge cases. |
| 5 | Minimal tests — happy path only. |
| 0 | No tests written. |

### 2. Type Safety (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Full type coverage. No `any` types. Strict mode passing. Python type hints on all public APIs. |
| 15 | Minor type gaps — 1-2 `any` usages justified in comments. |
| 10 | Moderate `any` usage or missing Python type hints. |
| 5 | Types present but incomplete — many `any` or untyped functions. |
| 0 | No type safety. `any` everywhere or type checking disabled. |

### 3. Error Handling (20 points)

| Score | Criteria |
|-------|----------|
| 20 | All error paths handled. No swallowed errors. User-facing errors are informative. Logging in place. |
| 15 | Most errors handled but logging incomplete. |
| 10 | Happy path solid but error paths partially handled. |
| 5 | Empty catch blocks or generic error messages. |
| 0 | No error handling — unhandled rejections or bare exceptions. |

### 4. Module Isolation (20 points)

| Score | Criteria |
|-------|----------|
| 20 | No cross-layer imports. Clean module boundaries. Single responsibility. No circular dependencies. |
| 15 | Clean boundaries with minor coupling. |
| 10 | Some cross-layer imports or tight coupling. |
| 5 | Significant coupling — changes ripple across modules. |
| 0 | Spaghetti — no discernible module boundaries. |

### 5. Performance & Locale (20 points)

| Score | Criteria |
|-------|----------|
| 20 | O(n) or better algorithms (Turing check). No N+1 queries. en-AU strings. Lazy loading where appropriate. |
| 15 | Good performance with minor optimisation opportunities. |
| 10 | Acceptable performance but O(n²) patterns present. |
| 5 | Performance issues — N+1 queries, unnecessary re-renders, blocking operations. |
| 0 | Severe performance issues. American English in user-facing strings. |

## Scoring

- **90-100**: Code approved. Merge-ready.
- **70-89**: Minor fixes needed. One iteration cycle.
- **50-69**: Significant issues. Return to implementing specialist.
- **Below 50**: Reject. Major rework required.

## Verification Integration

The `verification` agent provides binary PASS/FAIL on:
- `pnpm turbo run type-check` — TypeScript compilation
- `pnpm turbo run lint` — Linting rules
- `pnpm turbo run test` — Test suite
- `pnpm build` — Production build (when applicable)

Both scores (rubric 0-100 + verification PASS/FAIL) must clear thresholds for Phase 6 to pass.

## Calibration

See `.claude/rubrics/calibration/code-examples.md` for scored examples at each level (20, 10, 0) for every dimension. Use these to anchor scoring consistency.

## Quantified Thresholds

These explicit thresholds eliminate subjective scoring:

| Dimension | Threshold | Automatic Score Impact |
|-----------|-----------|----------------------|
| Module Isolation | > 3 imports from outside module directory | -5 per violation |
| Module Isolation | Any circular dependency | Automatic 0 for dimension |
| Module Isolation | Function > 50 lines without decomposition | -5 per instance |
| Type Safety | Each `any` type without justification comment | -3 per instance |
| Test Coverage | Missing test for an acceptance criterion | -5 per missing test |
| Performance | O(n²) algorithm without justification | -10 |
| Performance | N+1 query pattern | -10 |
| Locale | American English in user-facing string | -5 per instance |

## Sprint Contract Integration

When a sprint contract exists (Phase 3.5), qa-validator ALSO scores against contract criteria:
- Each contract criterion is PASS/FAIL
- Any FAIL criterion caps the overall rubric score at 69 (forcing iteration)
- Contract results appear in the score report under "Sprint Contract Results"
