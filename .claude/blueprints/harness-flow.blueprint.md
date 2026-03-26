---
id: harness-flow
type: blueprint
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
scope: standard|complex
---

# Harness Flow Blueprint

> Full 8-phase convergence loop from idea to production PR. Used by `/harness` command for standard and complex scope tasks.

## DAG

```
intake → discovery → decomposition → contract → execution → aggregation → verification → [iteration] → production
```

## Phase Nodes

### intake (deterministic)
**Owner**: orchestrator
**Input**: Task description (string)
**Output**: Scope classification (trivial/standard/complex), risk assessment (LOW/MEDIUM/HIGH), phase range
**Iteration cap**: 0 (single pass)
**Gate**: Risk assessment complete. HIGH risk requires user confirmation before proceeding.

### discovery (agentic)
**Owner**: product-strategist
**Input**: Task description + scope classification
**Output**: PRD document
**Iteration cap**: 1 (one revision if score 50-69)
**Gate**: PRD scored ≥70 by qa-validator against prd-rubric.md
**Skip condition**: Scope is trivial

### decomposition (agentic)
**Owner**: technical-architect → senior-engineer
**Input**: Approved PRD
**Output**: Architecture delta + implementation plan with task assignments
**Iteration cap**: 1
**Gate**: Architecture scored ≥70 by qa-validator against architecture-rubric.md
**Skip condition**: Scope is trivial

### contract (agentic)
**Owner**: senior-engineer ↔ qa-validator
**Input**: Implementation plan
**Output**: Signed sprint contract (`.claude/data/active-contract.json`)
**Iteration cap**: 2 (negotiation rounds)
**Gate**: Both parties agree on testable acceptance criteria
**Skip condition**: Scope is trivial
**Escalation**: No agreement after 2 rounds → user review

### execution (agentic)
**Owner**: orchestrator → specialists (frontend, backend, database, test-engineer)
**Input**: Task assignments + sprint contract
**Output**: Implemented code with test results
**Iteration cap**: per-task (TDD cycle)
**Gate**: Each specialist reports completion with evidence
**Pattern selection**:
  - Independent tasks → parallel dispatch
  - Dependent tasks → sequential with feedback
  - Single domain → specialist delegation

### aggregation (deterministic)
**Owner**: orchestrator
**Input**: All specialist outputs
**Output**: Integrated codebase
**Iteration cap**: 0
**Gate**: `pnpm turbo run type-check lint test` passes
**Recovery**: If integration fails, route conflicts back to responsible specialists

### verification (agentic, 3 parallel tracks)
**Owner**: verification + qa-validator + design-reviewer
**Track A**: verification → binary PASS/FAIL (type-check, lint, test, build)
**Track B**: qa-validator → 0-100 score against code-rubric.md + sprint contract criteria
**Track C**: design-reviewer → UX audit report (if frontend changes)
**Gate**: All tracks clear thresholds. Track B contract FAIL caps score at 69.

### iteration (agentic, conditional)
**Owner**: orchestrator
**Input**: Failure reports from verification
**Output**: Remediated code
**Iteration cap**: 2 cycles total
**Gate**: All verification tracks pass after remediation
**Escalation**: Cap exceeded → user review with failure report
**Skip condition**: All verification tracks passed (no iteration needed)

### production (deterministic + agentic)
**Owner**: delivery-manager
**Input**: Verified code + all rubric scores + contract results
**Output**: Pull request with evidence trail
**Iteration cap**: 0
**Gate**: Release scored ≥70 by qa-validator against release-rubric.md
**Terminal**: STOP — human review gate. Never auto-merge.
**Cleanup**: Delete `.claude/data/active-contract.json`

## Escalation Conditions

| Condition | Action |
|-----------|--------|
| Rubric score <50 after iteration | ESCALATE to user |
| Phase 7 iteration cap (2) exceeded | ESCALATE to user |
| HIGH-risk change without rollback plan | ESCALATE to user |
| Multiple agent failures in same phase | ESCALATE to user |
| Ambiguous requirements after interview | ESCALATE to user |
| Contract negotiation fails (2 rounds) | ESCALATE to user |

## vs Feature Blueprint (Minion)

| Aspect | harness-flow | feature (minion) |
|--------|-------------|------------------|
| Entry | `/harness` | `/minion` |
| Phases | 8 (full loop) | Compressed (implement → verify → PR) |
| Iteration cap | 2 cycles in Phase 7 | 3 total across all nodes |
| Discovery | Full PRD + architecture | None (task must be clear) |
| Contract | Negotiated acceptance criteria | None |
| Human interaction | Allowed between phases | Zero (one-shot) |
| Use case | New features, complex work | Quick tasks, bug fixes |
