---
id: harness-review
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /harness-review — Harness Refinement Audit

Audits the current framework for complexity, redundancy, and unused components. Every harness component encodes an assumption about what the model can't do on its own — this command stress-tests those assumptions.

> "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing." — Anthropic Engineering

## Usage

```
/harness-review
/harness-review --verbose    # Include full file paths and descriptions
```

## Audit Process

### Step 1: Inventory

Count all active framework components:

```bash
# Agents
find .claude/agents -name "agent.md" | wc -l

# Skills
find .skills/custom -name "SKILL.md" | wc -l

# Rules
find .claude/rules -name "*.md" -not -path "*/archive/*" | wc -l

# Hooks
# Count from .claude/settings.json hooks configuration

# Commands
find .claude/commands -name "*.md" | wc -l

# Blueprints
find .claude/blueprints -name "*.md" | wc -l

# Rubrics
find .claude/rubrics -name "*.md" -not -path "*/calibration/*" | wc -l
```

### Step 2: Identify Stub Agents

Check each agent for `status: stub` or minimal content (< 20 lines of non-frontmatter content):

```bash
for f in .claude/agents/*/agent.md; do
  lines=$(grep -v '^---$' "$f" | grep -v '^$' | wc -l)
  if [ "$lines" -lt 20 ]; then
    echo "STUB: $f ($lines lines)"
  fi
done
```

### Step 3: Identify Unreferenced Skills

Check each skill in `.skills/custom/` against:
- `.skills/AGENTS.md` (registry)
- `.claude/blueprints/*.md` (toolshed references)
- `.claude/agents/*/agent.md` (skills_required fields)
- `.claude/rules/*.md` (rule references)

Any skill not referenced by at least one of these is a removal candidate.

### Step 4: Identify Redundant Rules

Check for rules in `.claude/rules/` that duplicate content from:
- `.claude/rules/archive/` (old versions that may still be loaded)
- CLAUDE.md sections
- Skill content

### Step 5: Model Assumption Check

For each major component, document the assumption it encodes:

| Component | Assumption | Still Valid? |
|-----------|-----------|-------------|
| [Component] | [What it assumes the model can't do] | [Yes/No/Unknown] |

### Step 6: Produce Report

```markdown
# Harness Review: [Date]

## Inventory
| Component | Count |
|-----------|-------|
| Agents | [N] |
| Skills | [N] |
| Rules | [N] |
| Hooks | [N] |
| Commands | [N] |
| Blueprints | [N] |
| Rubrics | [N] |
| **Total** | **[N]** |

## Removal Candidates

### Stub Agents (< 20 lines)
- [agent-name] — [reason it's a stub]

### Unreferenced Skills
- [skill-name] — not referenced by any registry, blueprint, or agent

### Redundant Rules
- [rule-name] — duplicates content from [source]

## Model Assumption Audit
[Table from Step 5]

## Recommendations
1. [Specific recommendation with rationale]
2. [Specific recommendation with rationale]

## Action Required
- [ ] Review removal candidates — confirm none are load-bearing
- [ ] Remove confirmed redundancies
- [ ] Update AGENTS.md registry
```

## When to Run

- **After model upgrade**: When `.claude/settings.json` model field changes
- **Quarterly**: As part of regular framework maintenance
- **After major feature delivery**: When complexity may have grown unchecked
- **Before onboarding**: To ensure the framework is lean for new contributors

## Important

- This command is READ-ONLY — it never deletes files
- All removal decisions require human approval
- The report is advisory — not all candidates should be removed
- Some "unused" skills may be intentionally available for future use
