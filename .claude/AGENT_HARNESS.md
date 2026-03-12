---
name: agent-harness
type: protocol
version: 1.0.0
---

# Multi-Agent Coordination Harness

> **Protocol**: 8-phase convergence loop for coordinating agent work from idea to production.
> **Engine**: The orchestrator executes this protocol using its existing 3 patterns.
> **Principle**: Additive only — no existing files, hooks, or commands are modified.

---

## The 8-Phase Convergence Loop

```
Phase 1: INTAKE          → orchestrator classifies intent, scope, risk
Phase 2: DISCOVERY        → product-strategist creates PRD
Phase 3: DECOMPOSITION    → technical-architect maps architecture delta
Phase 4: EXECUTION        → senior-engineer plans, specialists implement in parallel
Phase 5: AGGREGATION      → orchestrator merges results, resolves conflicts
Phase 6: VERIFICATION     → verification (code) + qa-validator (acceptance) + design-reviewer (UX)
Phase 7: ITERATION        → remediate failures (max 2 cycles, then escalate)
Phase 8: PRODUCTION       → delivery-manager creates PR, status, hand-off
```

---

## Phase Detail

### Phase 1: Intake

**Owner**: orchestrator

| Step | Action |
|------|--------|
| 1 | Classify intent via CLI Control Plane (BUILD, FIX, REFACTOR, etc.) |
| 2 | Assess scope: trivial / standard / complex |
| 3 | Assess risk: LOW / MEDIUM / HIGH |
| 4 | Decide phase range — trivial tasks skip to Phase 4 |

**Scope matrix**:
- **Trivial** (copy change, config tweak): Phases 4 → 6 → 8
- **Standard** (new component, endpoint, feature): Phases 1 → 8
- **Complex** (cross-cutting, migration, new system): Phases 1 → 8 with extended discovery

### Phase 2: Discovery

**Owner**: product-strategist

| Step | Action |
|------|--------|
| 1 | If insufficient context → invoke spec-builder interview mode |
| 2 | Draft PRD (problem, users, scope, non-goals, metrics) |
| 3 | Score PRD against `prd-rubric.md` via qa-validator |
| 4 | ≥ 70 → proceed · 50-69 → iterate · < 50 → escalate |

**Workflow**: `.claude/workflows/idea-to-prd.md`

### Phase 3: Decomposition

**Owner**: technical-architect → senior-engineer

| Step | Action |
|------|--------|
| 1 | Technical-architect produces architecture delta |
| 2 | Score against `architecture-rubric.md` via qa-validator |
| 3 | Senior-engineer decomposes into implementation tasks |
| 4 | Orchestrator assigns tasks to specialist agents |

**Workflow**: `.claude/workflows/prd-to-spec.md`

### Phase 4: Execution

**Owner**: orchestrator (coordination), specialists (implementation)

| Step | Action |
|------|--------|
| 1 | Orchestrator selects pattern (parallel, sequential, or single specialist) |
| 2 | Specialists execute tasks following TDD (failing test → implement → verify) |
| 3 | Each specialist reports completion with evidence |

**Workflow**: `.claude/workflows/spec-to-build.md`

### Phase 5: Aggregation

**Owner**: orchestrator

| Step | Action |
|------|--------|
| 1 | Collect all specialist outputs |
| 2 | Verify interface contracts match |
| 3 | Resolve integration conflicts |
| 4 | Run `pnpm turbo run type-check lint test` |

**Workflow**: `.claude/workflows/spec-to-build.md`

### Phase 6: Verification

**Owners**: verification + qa-validator + design-reviewer

Three parallel tracks:

| Track | Agent | Output |
|-------|-------|--------|
| A: Code | verification | PASS / FAIL (type-check, lint, test) |
| B: Acceptance | qa-validator | 0-100 rubric score (code, UI, architecture) |
| C: Design | design-reviewer | UX audit report (if frontend changes) |

All tracks must clear thresholds. Any failure → Phase 7.

**Workflow**: `.claude/workflows/build-to-release.md`

### Phase 7: Iteration

**Owner**: orchestrator

| Step | Action |
|------|--------|
| 1 | Collect failure reports from Phase 6 |
| 2 | Route each failure to responsible agent |
| 3 | Specialists remediate |
| 4 | Re-run Phase 6 |

**Iteration cap**: Maximum 2 cycles. If exceeded → **ESCALATE** to user.

**Workflow**: `.claude/workflows/build-to-release.md`

### Phase 8: Production

**Owner**: delivery-manager

| Step | Action |
|------|--------|
| 1 | Score release against `release-rubric.md` |
| 2 | Create PR with full evidence trail |
| 3 | Produce hand-off documentation |
| 4 | **STOP** — human review gate |

**Workflow**: `.claude/workflows/build-to-release.md`

---

## Agent Roster (Harness-Specific)

| Agent | Role | Token Budget | Phase(s) |
|-------|------|-------------|----------|
| product-strategist | PRD, scope, non-goals, priorities | 40K | 2 |
| technical-architect | Architecture delta, rollout strategy | 50K | 3 |
| design-reviewer | UX review, design consistency audit | 40K | 6 |
| senior-engineer | Implementation planning (plans, doesn't code) | 60K | 3, 4 |
| qa-validator | Rubric scoring (0-100), acceptance validation | 50K | 2, 3, 6, 8 |
| delivery-manager | Sprint slices, tickets, hand-offs, PR bodies | 30K | 8 |

These agents are additive to the existing 23 agents. They do not replace or modify any existing agent.

---

## Rubrics

| Rubric | Scored By | Used In |
|--------|-----------|---------|
| `prd-rubric.md` | qa-validator | Phase 2, 6 |
| `architecture-rubric.md` | qa-validator | Phase 3, 6 |
| `ui-rubric.md` | qa-validator + design-reviewer | Phase 6 |
| `code-rubric.md` | qa-validator + verification | Phase 6 |
| `release-rubric.md` | qa-validator | Phase 8 |

All rubrics: `.claude/rubrics/`

---

## Workflows

| Workflow | Phases | File |
|----------|--------|------|
| Idea → PRD | 1-2 | `.claude/workflows/idea-to-prd.md` |
| PRD → Spec | 3 | `.claude/workflows/prd-to-spec.md` |
| Spec → Build | 4-5 | `.claude/workflows/spec-to-build.md` |
| Build → Release | 6-8 | `.claude/workflows/build-to-release.md` |

---

## Phase Skipping

The orchestrator retains authority to skip phases based on scope:

| Scope | Phases Skipped | Rationale |
|-------|---------------|-----------|
| Trivial | 1-3 | Copy changes don't need PRD or architecture review |
| Standard | None | Full loop for normal features |
| Complex | None | Full loop with extended Phase 2 |
| `/minion` | Compressed | Blueprint DAG compresses phases into bounded iteration |

---

## Escalation Rules

| Condition | Action |
|-----------|--------|
| Rubric score < 50 after iteration | Escalate to user |
| Phase 7 iteration cap (2) exceeded | Escalate to user |
| HIGH-risk change without rollback plan | Escalate to user |
| Multiple agent failures | Escalate to user |
| Ambiguous requirements after interview | Escalate to user |

---

## Integration with Existing Systems

| System | Relationship |
|--------|-------------|
| Orchestrator patterns | Harness defines WHAT phases to run; orchestrator decides HOW (parallel, sequential, delegation) |
| `/new-feature` command | Maps to Phases 1-2 (discovery + PRD) |
| `/minion` command | Compresses all phases into bounded blueprint DAG |
| `/verify` command | Maps to Phase 6 (verification) standalone |
| Verification agent | Binary PASS/FAIL on code — complementary to qa-validator's 0-100 scoring |
| Council of Logic | Applied during Phase 4 (execution) for complexity validation |
| Standards agent | Applied during Phase 6 (verification) for design token enforcement |

---

## Never

- Skip Phase 6 (Verification) — every deliverable must be verified
- Allow agents to verify their own work
- Exceed 2 iteration cycles in Phase 7 without escalation
- Merge PRs automatically — Phase 8 always stops at human review gate
- Break existing hooks, commands, or agent definitions
