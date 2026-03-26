---
id: retro
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /retro — Engineering Retrospective

Generates a structured retrospective report from the most recent development cycle. Analyses git history, architectural decisions, iteration counts, and rubric scores to produce an evidence-based process review.

## Usage

```
/retro
/retro --period 7d          # Last 7 days (default)
/retro --period 14d         # Last 14 days
/retro --since 2026-03-20   # Since specific date
```

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| `git log` | Commits, PRs merged, revert frequency, files changed |
| `gh pr list --state merged` | PR cycle time, review turnaround |
| `.claude/memory/architectural-decisions.md` | Decisions made and their rationale |
| `.claude/data/active-contract.json` (if exists) | Contract criteria hit/miss rate |
| `.claude/rubrics/` scores (from last Phase 6) | Quality gate results |
| Iteration counts (from minion state or harness logs) | Budget utilisation |

## Output Format

Produce a structured retrospective using the template at `.claude/templates/retrospective.md`:

```markdown
# Retrospective: [Date Range]

## Metrics
- Commits: [N]
- PRs merged: [N]
- Reverts: [N] ([percentage]%)
- Average PR cycle time: [hours/days]
- Rubric scores: [list of Phase 6 scores]
- Iteration budget: [used]/[available]

## What Went Well (evidence-based)
- [Observation backed by data]

## What Was Slow (evidence-based)
- [Observation backed by data]

## What to Change
- [Actionable improvement for next sprint]

## Decisions Made
- [From architectural-decisions.md, with rationale]
```

## Save Location

Save the retrospective to `.planning/retros/retro-{YYYY-MM-DD}.md`.

Create the directory if it doesn't exist: `mkdir -p .planning/retros/`

## Integration

- Optional Phase 8.5 in the Agent Harness — delivery-manager can trigger after PR creation
- Not mandatory — retrospectives are advisory, not blocking
- Retrospectives are append-only — never overwrite a previous retro
