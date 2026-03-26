# /lib audit — Run Self-Improvement Audit

Audit the Solution Library for quality, coverage, and improvement opportunities.

## Usage

```
/lib audit [--scope <full|quick|security|coverage>]
```

## Audit Scopes

| Scope      | What It Checks                     |
| ---------- | ---------------------------------- |
| `full`     | All checks (default)               |
| `quick`    | Registry validity + orphans only   |
| `security` | Security skill coverage gaps       |
| `coverage` | Missing skills for common patterns |

## What Gets Audited

### Registry Health

- [ ] All agents have valid skill references
- [ ] All skills have existing SKILL.md files
- [ ] No orphaned files (files without registry entries)
- [ ] No duplicate entries
- [ ] All deprecated items have replacement pointers

### Skill Quality

- [ ] All skills have descriptions
- [ ] All skills have owners
- [ ] All skills have eval cases
- [ ] Skill limits respected (max 8 per agent)

### Coverage Gaps

- [ ] Common patterns without skills
- [ ] Agents without sufficient skills
- [ ] Eval packs for all domains

### Governance

- [ ] All promoted skills have promotion log entries
- [ ] No bypassed approvals in git history

## Examples

```bash
/lib audit                  # Full audit
/lib audit --scope quick    # Quick health check
/lib audit --scope security # Security coverage
```

## Script

Runs: `scripts/solution-library/validate-library.ps1`

## Output Format

```
LIBRARY AUDIT REPORT — 17/03/2026
═══════════════════════════════════════════════
Registry Health:    ✓ PASS
Skill Quality:      ⚠ WARN — 12 skills missing eval cases
Coverage:           ⚠ WARN — No skill for: vector-db, task-queue
Governance:         ✓ PASS

RECOMMENDATIONS
───────────────
1. Add eval cases for 12 skills (see list below)
2. Create skill: vector-db (requested by 2 projects)
3. Create skill: task-queue (requested by 1 project)

Health Score: 84/100
═══════════════════════════════════════════════
```
