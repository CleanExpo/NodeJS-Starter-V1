# /lib add — Add Asset to Solution Library

Add a new agent, skill, or workflow to the Solution Library.

## Usage

```
/lib add <type> <name>
```

**Types**: `skill`, `agent`, `workflow`

## Process

1. Validate type and name
2. Check for duplicates in registry
3. Create scaffold from template
4. Register in appropriate YAML
5. Prompt for owner assignment

## Examples

```bash
/lib add skill rate-limiter-v2
/lib add agent data-engineer
/lib add workflow feature-to-production
```

## What Gets Created

**For skills**:

- `.skills/custom/<name>/SKILL.md` — Scaffold from template
- Entry in `solution-library/registry/skills.yaml`

**For agents**:

- `.claude/agents/<name>/agent.md` — Scaffold from template
- Entry in `solution-library/registry/agents.yaml`

**For workflows**:

- `.claude/workflows/<name>.md` — Scaffold from template
- Entry in `solution-library/registry/workflows.yaml`

## Validation

- Name must be kebab-case
- Type must be `skill`, `agent`, or `workflow`
- Name must not already exist in registry

## Next Steps

After adding:

1. Implement the scaffold
2. Write an eval case
3. Test in a project
4. When proven in ≥ 2 projects, run `/lib push <type> <name>`
