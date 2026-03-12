---
name: release-rubric
type: rubric
scored_by: qa-validator
pass_threshold: 70
version: 1.0.0
---

# Release Quality Rubric

Scored by `qa-validator` during Phase 8 (Production) before PR creation.

## Dimensions (100 points total)

### 1. Evidence Completeness (20 points)

| Score | Criteria |
|-------|----------|
| 20 | All verification gates passed with evidence. Test output captured. Rubric scores recorded. Screenshots where applicable. |
| 15 | Most evidence present but missing screenshots or one verification output. |
| 10 | Partial evidence — claims without supporting output. |
| 5 | Minimal evidence — "tests pass" without output. |
| 0 | No evidence provided. |

### 2. PR Quality (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Clear title. Summary describes what and why. Test plan with checkboxes. Breaking changes noted. Linked to task/spec. |
| 15 | Good PR but missing test plan or task linkage. |
| 10 | Basic PR — title and minimal description. |
| 5 | PR title only, no description. |
| 0 | No PR created or PR is incomprehensible. |

### 3. Regression Risk (20 points)

| Score | Criteria |
|-------|----------|
| 20 | No existing tests broken. No new warnings. Backward compatible. Existing features verified. |
| 15 | All tests pass but new warnings introduced. |
| 10 | Minor test modifications required for compatibility. |
| 5 | Existing tests modified to pass — potential regression masked. |
| 0 | Existing tests broken or deleted. |

### 4. Rollback Plan (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Documented rollback steps. Database migrations reversible. Feature can be disabled without deploy. |
| 15 | Rollback documented but not all migrations are reversible. |
| 10 | Rollback possible via `git revert` only. |
| 5 | Rollback possible but requires manual data intervention. |
| 0 | No rollback path — changes are irreversible. |

### 5. Documentation Updates (20 points)

| Score | Criteria |
|-------|----------|
| 20 | CLAUDE.md updated if architecture changed. API docs updated. PROGRESS.md reflects new state. |
| 15 | Key docs updated but minor references stale. |
| 10 | Code comments updated but project docs unchanged. |
| 5 | No documentation updates despite interface changes. |
| 0 | Documentation contradicts implementation. |

## Scoring

- **90-100**: Release approved. Create PR.
- **70-89**: Minor gaps. One iteration to complete evidence/docs.
- **50-69**: Significant gaps. Return to delivery-manager for preparation.
- **Below 50**: Reject. Release not ready.

## Pre-Release Checklist

Before scoring, confirm all of the following:

```
[ ] All Phase 6 rubric scores ≥ 70 (PRD, architecture, UI, code as applicable)
[ ] Verification agent reports PASS on all gates
[ ] No HIGH-risk items unresolved
[ ] Commit messages follow convention: <type>(<scope>): <description>
[ ] Branch naming follows convention: feature/<name> or fix/<name>
[ ] en-AU locale enforced in all user-facing strings
```
