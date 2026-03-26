---
id: harness
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# Harness Command

Entry point for the 8-phase convergence loop defined in `.claude/AGENT_HARNESS.md`. Routes a task through the full idea-to-production pipeline with multi-agent coordination, rubric-scored quality gates, and mandatory human review.

## Usage

```
/harness "task description"
/harness "build a user profile page with avatar upload"
/harness "add real-time notifications to the dashboard"
```

## What It Does

Routes the task through the 8-phase convergence loop:

```
Phase 1: INTAKE          -> Classify intent, scope, risk
Phase 2: DISCOVERY        -> Product strategist creates PRD (scored >= 70)
Phase 3: DECOMPOSITION    -> Technical architect + senior engineer plan
Phase 3.5: CONTRACT       -> Negotiate acceptance criteria with qa-validator
Phase 4: EXECUTION        -> Specialists implement in parallel (TDD)
Phase 5: AGGREGATION      -> Merge results, verify integration
Phase 6: VERIFICATION     -> Code + acceptance + design review (parallel)
Phase 7: ITERATION        -> Fix failures (max 2 cycles, then escalate)
Phase 8: PRODUCTION       -> Create PR with evidence trail
```

## Phase Execution Protocol

### Phase 1 — Intake

**Owner**: orchestrator

1. Classify intent via CLI Control Plane (BUILD / FIX / REFACTOR / MIGRATE / DEPLOY / PLAN / AUDIT / EXPLORE).
2. Assess scope using the scope matrix below:
   - **Trivial** (copy change, config tweak, typo, rename, comment): Skip to Phase 4.
   - **Standard** (new component, endpoint, feature): Full loop, contract required.
   - **Complex** (migration, new system, cross-cutting, authentication, database schema): Full loop with extended Phase 2.
3. Assess risk: LOW / MEDIUM / HIGH. HIGH-risk tasks require user confirmation before proceeding.
4. Output: Scope classification + risk assessment + phase range decision.

### Phase 2 — Discovery

**Owner**: product-strategist

1. Dispatch product-strategist agent with the task description.
2. Product-strategist creates PRD using template at `.claude/templates/spec-feature.md`.
3. Dispatch qa-validator to score PRD against `.claude/rubrics/prd-rubric.md`.
4. Score >= 70: Proceed to Phase 3. Score 50-69: Iterate once, re-score. Score < 50: Escalate to user.
5. Output: Approved PRD document.

### Phase 3 — Decomposition

**Owner**: technical-architect, then senior-engineer

1. Dispatch technical-architect with the approved PRD.
2. Technical-architect produces architecture delta (what changes, what stays, blast radius).
3. Score architecture delta against `.claude/rubrics/architecture-rubric.md` via qa-validator.
4. Score >= 70: Proceed. Score < 70: Iterate once.
5. Dispatch senior-engineer to decompose architecture delta into implementation tasks.
6. Senior-engineer assigns each task to the appropriate specialist agent.
7. Output: Task breakdown with specialist assignments.

### Phase 3.5 — Contract

**Owner**: senior-engineer + qa-validator

1. Senior-engineer drafts sprint contract using `.claude/templates/sprint-contract.md`, listing deliverables with testable acceptance criteria.
2. Qa-validator reviews criteria for testability and completeness. Counter-proposes if vague.
3. Maximum 2 negotiation rounds. Agreement: Write contract to `.claude/data/active-contract.json`. No agreement after 2 rounds: Escalate to user.
4. Output: Signed sprint contract in `.claude/data/active-contract.json`.

### Phase 4 — Execution

**Owner**: orchestrator (coordination), specialist agents (implementation)

1. Orchestrator selects execution pattern based on task decomposition:
   - **Pattern 1** (Plan -> Parallelise -> Integrate): Independent tasks dispatched in parallel via Agent tool.
   - **Pattern 2** (Sequential with Feedback): Dependent tasks executed in order, each verified before the next.
   - **Pattern 3** (Specialist Delegation): Single-domain tasks delegated to one specialist.
2. Each specialist follows TDD discipline: write failing test -> implement minimal code -> verify pass -> refactor.
3. Each specialist reports completion with evidence (test output, type-check pass).
4. Output: Implemented code with passing test results.

### Phase 5 — Aggregation

**Owner**: orchestrator

1. Collect all specialist outputs.
2. Verify interface contracts match (types align, API shapes match, imports resolve).
3. Resolve any integration conflicts between specialist outputs.
4. Run integration checks: `pnpm turbo run type-check lint test`.
5. Output: Integrated codebase passing all checks.

### Phase 6 — Verification (3 Parallel Tracks)

**Owners**: verification + qa-validator + design-reviewer

| Track | Agent | What It Checks | Output |
|-------|-------|----------------|--------|
| A: Code | verification | type-check, lint, test, build | Binary PASS / FAIL |
| B: Acceptance | qa-validator | `.claude/rubrics/code-rubric.md` + sprint contract criteria | 0-100 rubric score |
| C: Design | design-reviewer | UX audit against design system (if frontend changes) | UX audit report |

All tracks must clear thresholds. Any single failure routes to Phase 7.

Output: Verification report with all track results.

### Phase 7 — Iteration

**Owner**: orchestrator

1. Collect failure reports from Phase 6.
2. Route each failure to the responsible specialist agent.
3. Specialist remediates the specific failure.
4. Re-run Phase 6 verification (all three tracks).
5. **Maximum 2 iteration cycles.** If still failing after 2 cycles: ESCALATE to user with a full failure report detailing what passed, what failed, and what was attempted.
6. Output: All verifications passing, or escalation with failure report.

### Phase 8 — Production

**Owner**: delivery-manager

1. Dispatch delivery-manager agent.
2. Score release against `.claude/rubrics/release-rubric.md`.
3. Create PR with:
   - Summary of changes
   - Test plan
   - Rubric scores from all phases
   - Sprint contract results (criteria met / not met)
   - Full evidence trail (test output, type-check results, lint results)
4. Delete `.claude/data/active-contract.json` (contract lifecycle complete).
5. **STOP** — human review gate. Never auto-merge. The PR is the final deliverable.
6. Output: PR URL ready for human review.

## Scope Matrix

| Scope | Phases Executed | Contract Required | When |
|-------|----------------|-------------------|------|
| Trivial | 4 -> 6 -> 8 | No | Copy changes, config tweaks, typos, renames |
| Standard | 1 -> 2 -> 3 -> 3.5 -> 4 -> 5 -> 6 -> 7 -> 8 | Yes | New components, endpoints, features |
| Complex | 1 -> 2 -> 3 -> 3.5 -> 4 -> 5 -> 6 -> 7 -> 8 | Yes | Migrations, new systems, cross-cutting concerns |

Complex scope uses extended Phase 2 (deeper discovery, more stakeholder questions) and extended Phase 3.5 (additional risk criteria in contract).

## Escalation Rules

| Condition | Action |
|-----------|--------|
| Rubric score < 50 after one iteration | Escalate to user with score breakdown |
| Phase 7 iteration cap (2 cycles) exceeded | Escalate with full failure report |
| HIGH-risk change without rollback plan | Escalate for confirmation before proceeding |
| Multiple agent failures in same phase | Escalate with diagnostic information |
| Ambiguous requirements after Phase 2 | Escalate for clarification |

Escalation always includes: what was attempted, what failed, what the agent recommends, and what the user needs to decide.

## When to Use

- Building a new feature end-to-end (frontend + backend + database)
- Implementing a spec or PRD that spans multiple domains
- Any task that requires multi-agent coordination with quality gates
- Features where acceptance criteria must be negotiated and tracked

## When NOT to Use

- Quick one-shot tasks -> use `/minion` instead
- Exploration or questions -> just ask directly
- Single-file fixes -> use `/build` or implement directly
- Strategic decisions -> use `/ceo-begin`
- Verification only -> use `/verify`
- UI review only -> use `/ui-review`

## Integration

| System | Relationship |
|--------|-------------|
| `/minion` | Compresses all 8 phases into a bounded blueprint DAG. Use for small, well-defined tasks. |
| `/new-feature` | Maps to Phases 1-2 only (discovery + PRD). Use when you only need a PRD, not full implementation. |
| `/verify` | Maps to Phase 6 standalone. Use for verification without the full loop. |
| Council of Logic | Applied during Phase 4 for complexity validation (Turing, Von Neumann, Shannon, Bezier). |
| Standards agent | Applied during Phase 6 for design token and locale enforcement. |
| CLI Control Plane | Phase 1 uses its intent classification. Risk assessment feeds into governance routing. |
