# Execution Guardian - Standards Reference

Risk scoring formulas, confidence calculation, and gate generation standards for pre-execution governance.

---

## Risk Scoring Dimensions

Each operation is scored across three independent dimensions on a 1-10 scale.

### Blast Radius (1-10)

Measures how many components are affected if the operation fails.

| Score | Scope | Examples |
|-------|-------|---------|
| 1-2 | Single function or file | Renaming a variable, fixing a typo |
| 3-4 | Single module or component | Refactoring a React component, updating a utility |
| 5-6 | Single service or layer | Changing all API route handlers, updating middleware |
| 7-8 | Multiple services | Frontend + Backend change, API contract modification |
| 9-10 | Entire infrastructure | Database migration, auth system overhaul, deployment |

### Reversibility (1-10)

Measures the cost and effort to undo the operation.

| Score | Reversibility | Examples |
|-------|--------------|---------|
| 1-2 | Trivially reversible | `git revert`, config rollback, feature flag toggle |
| 3-4 | Easily reversible with known steps | Database migration with `downgrade()`, dependency rollback |
| 5-6 | Reversible with manual effort | Data restore from backup, partial migration rollback |
| 7-8 | Difficult to reverse | Schema change with data transformation, secret rotation |
| 9-10 | Irreversible or prohibitively costly | `DROP TABLE` without backup, force-push to shared branch |

### Confidence (1-10)

Inverse confidence score — higher means less confident (more risk).

| Score | Confidence Level | Examples |
|-------|-----------------|---------|
| 1-2 | Very high confidence | Well-tested pattern, comprehensive coverage, familiar domain |
| 3-4 | High confidence | Known pattern with minor variations, good test coverage |
| 5-6 | Moderate confidence | Partially tested, some unknowns in the domain |
| 7-8 | Low confidence | Novel pattern, minimal test coverage, complex domain |
| 9-10 | Very low confidence | First-time pattern, no tests, high domain complexity |

---

## Confidence Percentage Calculation

Confidence is scored 0-100% based on four weighted factors:

```
confidence_pct = (pattern_novelty * 0.30)
              + (test_coverage  * 0.30)
              + (domain_complexity * 0.20)
              + (change_scope * 0.20)
```

### Factor Scoring

| Factor | Weight | 100% (High Confidence) | 0% (Low Confidence) |
|--------|--------|----------------------|---------------------|
| **Pattern Novelty** | 30% | Well-known pattern used elsewhere in codebase | First-time pattern, no precedent in project |
| **Test Coverage** | 30% | Relevant tests exist and pass for affected paths | No tests cover the affected code paths |
| **Domain Complexity** | 20% | Simple CRUD, config change, static content | Auth, payment, distributed state, concurrency |
| **Change Scope** | 20% | Single file, < 50 lines changed | 5+ files, 200+ lines changed |

### Confidence Thresholds

| Range | Label | Required Action |
|-------|-------|----------------|
| 80-100% | **High** | Proceed with standard validation gates |
| 50-79% | **Moderate** | Require explicit user approval before execution |
| 0-49% | **Low** | Recommend spike/prototype first; request additional review |

---

## Composite Risk Calculation

```
composite_risk = max(blast_radius, reversibility, inverse_confidence)
```

Where `inverse_confidence` maps confidence percentage to the 1-10 scale:
- 80-100% confidence = 1-2 inverse
- 50-79% confidence = 3-6 inverse
- 0-49% confidence = 7-10 inverse

### Risk Level Thresholds

| Composite Score | Risk Level | Required Response |
|----------------|-----------|-------------------|
| 1-3 | **LOW** | Proceed. Log the operation. |
| 4-6 | **MEDIUM** | Require user approval. State the risk clearly. |
| 7-10 | **HIGH** | Mandatory review. Require rollback plan. Block until approval. |

---

## Gate Generation Standards

### Gate Structure

Every validation gate follows this format:

```
GATE: {Human-readable gate name}
  CHECK: {Specific command or verification step}
  BLOCKING: {YES | NO}
  RISK_LEVEL: {LOW | MEDIUM | HIGH}
```

### Gate Ordering

Gates are executed in this priority order:

1. **Security gates** — secrets, auth, CORS (always first)
2. **Data integrity gates** — migrations, schema changes
3. **Contract gates** — API shape, Zod schema alignment
4. **Quality gates** — tests, type-check, lint
5. **Documentation gates** — changelog, env docs (advisory only)

### Gate Aggregation

When multiple operation types are detected:

- Generate gates for **all** detected types
- Overall BLOCKING = YES if **any** gate is BLOCKING: YES
- Overall RISK = **highest** individual gate risk
- Execute gates in priority order; stop at first BLOCKING failure

---

## Self-Healing Eligibility

Self-healing (automatic fix + re-run) is permitted only when ALL conditions are met:

| Condition | Required Value |
|-----------|---------------|
| Gate BLOCKING status | NO |
| Risk level | LOW |
| Security-related | NO |
| Database-related | NO |
| Attempt count | First attempt only |

If self-healing fails on re-run, escalate to BLOCKING: YES.

---

## Mode-Specific Governance Intensity

| Mode | LOW Risk | MEDIUM Risk | HIGH Risk |
|------|----------|-------------|-----------|
| **EXPLORATION** | No gates | No gates | No gates (read-only mode) |
| **BUILD** | Proceed + log | Approval required | Block + rollback plan |
| **SCALE** | Proceed + log | Approval + rollback plan | Block + rollback plan + review |
| **STRATEGY** | No gates | No gates | Advisory only |
