# /lib use — Load Workflow for Active Project

Load a library workflow into the context of the active project.

## Usage

```
/lib use <workflow-name>
```

## Available Workflows

| Workflow           | Description                   |
| ------------------ | ----------------------------- |
| `idea-to-prd`      | Transform raw idea into PRD   |
| `prd-to-spec`      | Convert PRD to technical spec |
| `spec-to-build`    | TDD implementation cycle      |
| `build-to-release` | QA, security, deploy          |
| `library-sync`     | Pull latest library assets    |
| `skill-promotion`  | Promote pattern to library    |
| `agent-audit`      | Audit agent compliance        |
| `regression-pack`  | Run all eval packs            |

## Examples

```bash
/lib use spec-to-build
/lib use build-to-release
/lib use library-sync
```

## What Happens

1. Locate workflow in `solution-library/registry/workflows.yaml`
2. Load workflow definition from its path
3. Load required agents into context
4. Execute first phase of workflow

## Project Context

The loaded workflow will use the active project's:

- `CLAUDE.md` for project rules
- `.env` for environment context
- Git state for branch/commit info
