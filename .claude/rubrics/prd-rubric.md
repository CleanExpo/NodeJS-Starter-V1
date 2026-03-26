---
name: prd-rubric
type: rubric
scored_by: qa-validator
pass_threshold: 70
version: 1.1.0
---

# PRD Quality Rubric

Scored by `qa-validator` during Phase 2 (Discovery) and Phase 6 (Verification).

## Dimensions (100 points total)

### 1. Problem Clarity (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Problem is specific, measurable, and tied to user pain. Root cause identified. |
| 15 | Problem is clear but lacks measurability or root cause analysis. |
| 10 | Problem is vague or describes a solution rather than a problem. |
| 5 | Problem statement is missing or contradictory. |
| 0 | No problem defined. |

### 2. User Definition (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Primary and secondary users defined with personas, technical level, and workflows. |
| 15 | Users defined but missing personas or workflow context. |
| 10 | Generic user description ("users want...") without segmentation. |
| 5 | User definition is implicit only. |
| 0 | No user definition. |

### 3. Scope Definition (20 points)

| Score | Criteria |
|-------|----------|
| 20 | Clear in-scope items, explicit non-goals, phased delivery plan. |
| 15 | Scope defined but non-goals missing or incomplete. |
| 10 | Scope is ambiguous — could be interpreted multiple ways. |
| 5 | Scope is unbounded ("build everything"). |
| 0 | No scope definition. |

### 4. Non-Goals (15 points)

| Score | Criteria |
|-------|----------|
| 15 | Explicit non-goals that prevent scope creep. Each justified. |
| 10 | Non-goals listed but not justified or incomplete. |
| 5 | Non-goals section exists but is generic. |
| 0 | No non-goals defined. |

### 5. Success Metrics (15 points)

| Score | Criteria |
|-------|----------|
| 15 | Quantifiable metrics with baselines, targets, and measurement method. |
| 10 | Metrics defined but missing baselines or measurement method. |
| 5 | Vague metrics ("improve performance"). |
| 0 | No success metrics. |

### 6. Locale Compliance (10 points)

| Score | Criteria |
|-------|----------|
| 10 | en-AU spelling throughout. DD/MM/YYYY dates. AUD currency. AEST/AEDT times. |
| 5 | Mostly compliant with minor deviations. |
| 0 | American English or mixed locale. |

## Scoring

- **90-100**: Ship-ready PRD. Proceed to Phase 3.
- **70-89**: Minor revisions needed. One iteration cycle.
- **50-69**: Significant gaps. Return to product-strategist.
- **Below 50**: Reject. Restart discovery phase.

## Calibration

PRD scoring anchors:
- **Score 20 (Problem Clarity)**: "Users on mobile devices experience 3-5 second load times on the dashboard due to unoptimised image assets, causing 40% bounce rate increase (measured via analytics)."
- **Score 5 (Problem Clarity)**: "The dashboard needs to be faster."
- **Score 20 (Success Metrics)**: "Dashboard LCP < 2.5s (baseline: 4.2s), measured via Lighthouse CI on each PR."
- **Score 5 (Success Metrics)**: "Improve performance."
