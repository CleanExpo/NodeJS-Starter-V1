# /lib list — List Available Assets

List all available agents, skills, and workflows in the Solution Library.

## Usage

```
/lib list [type] [--filter <category>] [--status <active|deprecated>]
```

## Examples

```bash
/lib list                          # List everything
/lib list skills                   # List all skills
/lib list agents                   # List all agents
/lib list workflows                # List all workflows
/lib list skills --filter security # List security skills
/lib list --status deprecated      # Show deprecated items
```

## Output Format

```
SOLUTION LIBRARY — ASSETS
═══════════════════════════════════════════════

GOVERNANCE AGENTS (2)
  ● senior-project-manager    Scope, priorities, release gates
  ● senior-orchestrator       Routing, skill selection, promotions

WORKER AGENTS (28)
  ● orchestrator              Primary task routing
  ● frontend-specialist       React/Next.js, Scientific Luxury
  [...]

SKILLS BY CATEGORY

  Governance (8)
    ● council-of-logic        Mathematical first principles
    ● tdd                     Test-driven development
    [...]

  Frontend (6)
    ● scientific-luxury       OLED Black design system
    [...]

WORKFLOWS (8)
  ● idea-to-prd               Idea → Product Requirements
  [...]

Total: 2 governance agents, 28 worker agents, 65+ skills, 8 workflows
Last sync: 17/03/2026
═══════════════════════════════════════════════
```

## Registry Source

All data sourced from:

- `solution-library/registry/agents.yaml`
- `solution-library/registry/skills.yaml`
- `solution-library/registry/workflows.yaml`
