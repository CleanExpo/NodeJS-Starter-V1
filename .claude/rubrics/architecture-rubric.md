---
name: architecture-rubric
type: rubric
scored_by: qa-validator
pass_threshold: 70
version: 1.1.0
---

# Architecture Quality Rubric

Scored by `qa-validator` during Phase 3 (Decomposition) and Phase 6 (Verification).

## Dimensions (100 points total)

### 1. Pattern Adherence (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Follows documented architecture layers. No cross-layer imports. Respects monorepo boundaries. |
| 15 | Mostly adherent with minor boundary violations. |
| 10 | New patterns introduced without justification. |
| 5 | Significant architectural drift from documented patterns. |
| 0 | Ignores existing architecture entirely. |

### 2. Blast Radius (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Changes isolated to affected modules. No unrelated side effects. Clear dependency graph. |
| 15 | Mostly isolated with minor cross-module impact documented. |
| 10 | Moderate cross-module impact, partially documented. |
| 5 | Wide blast radius with undocumented side effects. |
| 0 | Changes affect the entire system unpredictably. |

### 3. Migration Safety (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Backward compatible. Rollback plan documented. Data integrity verified. No breaking changes. |
| 15 | Backward compatible with minor rollback gaps. |
| 10 | Breaking changes documented but rollback plan incomplete. |
| 5 | Breaking changes without rollback plan. |
| 0 | Destructive changes with no safety net. |

### 4. Dependency Management (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Minimal new dependencies. All justified. No circular deps. Version pinned. |
| 15 | New dependencies justified but not all version-pinned. |
| 10 | Unnecessary dependencies added. |
| 5 | Circular dependencies introduced or major version conflicts. |
| 0 | Dependency chaos — unpinned, conflicting, or abandoned packages. |

### 5. Rollback Strategy (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Step-by-step rollback procedure tested. Database migrations reversible. Feature flags in place. |
| 15 | Rollback procedure documented but not tested. |
| 10 | Partial rollback possible with manual intervention. |
| 5 | Rollback theoretically possible but undocumented. |
| 0 | No rollback path — changes are irreversible. |

## Scoring

- **90-100**: Architecture approved. Proceed to Phase 4.
- **70-89**: Minor revisions. One iteration cycle with technical-architect.
- **50-69**: Significant concerns. Return to technical-architect for redesign.
- **Below 50**: Reject. Architecture does not meet safety requirements.

## Calibration

Refer to code and UI calibration examples for analogous patterns. Architecture scoring follows the same principle: concrete evidence over subjective assessment.

## Quantified Thresholds

| Dimension | Threshold | Automatic Score Impact |
|-----------|-----------|----------------------|
| Blast Radius | > 10 files modified outside target module | -10 |
| Blast Radius | > 5 cross-module files changed without rollback plan | Automatic cap at 69 |
| Pattern Adherence | Cross-layer import introduced | -5 per violation |
| Pattern Adherence | New pattern without documented justification | -10 |
| Migration Safety | Breaking change without rollback plan | Automatic 0 for dimension |
| Dependency Management | Unpinned dependency version | -3 per instance |
| Dependency Management | Circular dependency introduced | Automatic -10 |

## Sprint Contract Integration

When a sprint contract exists (Phase 3.5), architecture scoring includes contract-specific criteria.
