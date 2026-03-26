---
id: harness-refinement
type: rule
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# Harness Refinement Rule

> "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing." — Anthropic Engineering

## Principle

Framework complexity must be periodically justified. Components that the model handles natively should be candidates for removal or simplification.

## Triggers

Run `/harness-review` when:

1. **Model upgrade**: The `model` field in `.claude/settings.json` changes (e.g., Opus 4.5 → Opus 4.6)
2. **Quarterly review**: Every 3 months as part of framework maintenance
3. **Complexity concern**: When the total component count exceeds previous baseline by > 10%

## Refinement Methodology

1. **Remove one component at a time** (never batch removals)
2. **Measure impact**: Run a standard-scope task with and without the component
3. **Distinguish load-bearing from overhead**: If output quality degrades without the component, it's load-bearing — keep it
4. **Re-evaluate with newer models**: Assumptions go stale. What Opus 4.5 couldn't do, Opus 4.6 may handle natively

## What to Look For

- Skills that duplicate model-native capabilities (e.g., the model may now handle TDD without explicit skill enforcement)
- Rules that re-state CLAUDE.md content (loaded automatically — rule is redundant)
- Agents marked as stubs that were never activated
- Hooks that trigger on every operation but rarely produce useful output
- Archived rules still loaded via `.claude/rules/archive/` (should be excluded from active rules)

## What to Never Remove

- **CONSTITUTION.md** — immutable rules, context drift defence
- **compass.md** — per-message injection, drift defence
- **Verification gate rule** — independent verification is a proven necessity
- **TDD skill** — test-first discipline degrades without enforcement
- **pre-bash-validate.py** — safety-critical hook

## Decision Log

After each refinement review, append results to `.claude/memory/architectural-decisions.md`:
```
[DD/MM/YYYY] DECISION: Removed [component] | REASON: [model handles this natively on Opus 4.6] | ALTERNATIVES REJECTED: [keeping it as optional]
```
