# /lib push — Promote Pattern to Library

Promote a proven pattern from a project into the Solution Library.

## Usage

```
/lib push <type> <name>
```

## Prerequisites

Before running `/lib push`, the pattern must:

- [ ] Be used successfully in ≥ 2 projects
- [ ] Have complete documentation (SKILL.md or agent.md)
- [ ] Have a passing eval case
- [ ] Have an assigned owner

## Process

1. **Validate** — `promote-pattern.ps1` checks all prerequisites
2. **Duplicate check** — Scan registry for existing similar patterns
3. **Orchestrator review** — Senior Orchestrator checks technical quality
4. **PM approval** — Senior PM checks scope fit and priority
5. **Register** — Add to appropriate YAML registry
6. **Log** — Append to `promotion-log.yaml`

## Examples

```bash
/lib push skill webhook-validator
/lib push agent compliance-checker
/lib push workflow api-to-deployment
```

## Approval Requirements

| Approver            | Checks                                          |
| ------------------- | ----------------------------------------------- |
| Senior Orchestrator | Technical correctness, no duplicates, eval pass |
| Senior PM           | Scope fit, owner assigned, priority alignment   |

Both approvals required before promotion completes.

## After Promotion

- Pattern appears in `/lib list`
- Entry added to `promotion-log.yaml`
- Consuming projects can sync via `/lib sync`
