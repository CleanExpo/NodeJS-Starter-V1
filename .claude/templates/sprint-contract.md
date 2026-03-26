---
name: sprint-contract
type: template
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# Sprint Contract: [Feature Name]

> Negotiated between senior-engineer (generator) and qa-validator (evaluator) before Phase 4 execution.
> Both parties must agree on all criteria before implementation begins.

## Deliverables

| # | Deliverable | Assignee | Verification Method |
|---|------------|----------|---------------------|
| 1 | [Specific deliverable] | [specialist agent] | [How to verify: test, visual check, API call, etc.] |
| 2 | | | |
| 3 | | | |

## Testable Success Criteria

Each criterion must be binary (PASS or FAIL) with no ambiguity.

| # | Criterion | PASS Example | FAIL Example | Verification Command |
|---|-----------|-------------|-------------|---------------------|
| 1 | [Specific, observable outcome] | [What PASS looks like] | [What FAIL looks like] | [Command or check to run] |
| 2 | | | | |
| 3 | | | | |

## Scope Boundaries

### In Scope
- [Explicit list of what will be built]

### Out of Scope
- [Explicit list of what will NOT be built in this sprint]

### Risk Items
| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| | | | |

## Contract Agreement

- **Generator** (senior-engineer): Proposes deliverables and implementation approach
- **Evaluator** (qa-validator): Proposes testable criteria and verification methods
- **Negotiation**: Either party may counter-propose. Max 2 rounds before escalation.
- **Binding**: Once agreed, Phase 6 scoring includes these criteria IN ADDITION to generic rubrics.

## Phase 6 Integration

During verification, qa-validator scores against:
1. Generic rubric dimensions (code-rubric.md, ui-rubric.md, etc.)
2. Sprint contract criteria (this document) — each criterion is PASS/FAIL
3. A contract criterion FAIL automatically caps the rubric score at 69 (forcing iteration)
