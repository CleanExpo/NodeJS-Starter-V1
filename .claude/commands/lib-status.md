# /lib status — Show Library Health

Show the current state and health metrics of the Solution Library.

## Usage

```
/lib status
```

## Output Format

```
SOLUTION LIBRARY STATUS
═══════════════════════════════════════════════
Version:      1.0.0
Last sync:    17/03/2026 14:32 AEDT
Health score: 84/100

ASSETS
──────
Governance agents:  2  (100% documented)
Worker agents:     28  (100% documented)
Skills:            65  (82% have evals)
Workflows:          8  (100% defined)
Deprecated:         0

CONSUMING PROJECTS
──────────────────
Active:  0
Pending: 0

RECENT ACTIVITY
───────────────
17/03/2026  Library initialised (v1.0.0)

PENDING ACTIONS
───────────────
⚠ 12 skills missing eval cases
  Run: /lib audit --scope quick

REGISTRY FILES
──────────────
solution-library/registry/agents.yaml      ✓
solution-library/registry/skills.yaml      ✓
solution-library/registry/workflows.yaml   ✓
solution-library/registry/projects.yaml    ✓
solution-library/registry/deprecated.yaml  ✓
solution-library/registry/promotion-log.yaml ✓
═══════════════════════════════════════════════
```

## Health Score

| Score  | Status                  |
| ------ | ----------------------- |
| 90-100 | Excellent               |
| 75-89  | Good — minor gaps       |
| 60-74  | Fair — attention needed |
| < 60   | Poor — audit required   |

## Quick Commands

From the status output, you can:

- Run `/lib audit` to investigate issues
- Run `/lib sync` to get latest updates
- Run `/lib list` to browse all assets
- Run `/lib search <query>` to find specific patterns
