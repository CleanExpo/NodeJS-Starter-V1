# Promotion Policy

## When to Promote

A pattern is ready for promotion when:

1. **Reuse threshold**: Used successfully in >= 2 projects
2. **Eval pass**: Passes the relevant eval pack (see `evals/`)
3. **Documentation**: Has complete SKILL.md or agent.md
4. **Owner assigned**: Named owner responsible for maintenance
5. **No breaking changes**: Works without modifying consuming projects

## Promotion Process

1. Author runs `/lib push <type> <name>`
2. `promote-pattern.ps1` validates requirements
3. Senior Orchestrator reviews for duplication + quality
4. Senior Project Manager approves priority and scope fit
5. Pattern added to registry with promotion log entry
6. Consuming projects notified via CHANGELOG entry

## What Gets Promoted

| Type     | Minimum Requirements                   |
| -------- | -------------------------------------- |
| Skill    | SKILL.md + eval case + 2 project uses  |
| Agent    | agent.md + skill list + owner + eval   |
| Workflow | Workflow definition + success criteria |

## What Does NOT Get Promoted

- One-off project-specific configurations
- Patterns that depend on project-local secrets
- Untested patterns (no eval pass)
- Patterns with < 2 reuse instances
