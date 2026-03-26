# Command: /hey-claude

**Category:** Workspace Setup
**Description:** Start a new Claude session with full system context loaded

## Usage

```
/hey-claude
```

## What It Does

This command initializes a new Claude conversation with:

1. **System Context** — Loads current directory structure and key files
2. **Project Overview** — File tree, README, main entry points
3. **Documentation** — SYSTEM_DOCS.md and CLAUDE.md preloaded
4. **Ready for Questions** — You can immediately ask about:
   - How to implement a feature
   - How existing code works
   - How to debug an issue
   - Architecture guidance
   - Code examples

## Example

```bash
/hey-claude "How do I add a new API endpoint?"
/hey-claude "Explain the authentication flow"
/hey-claude "Help me debug this error"
```

## Related Commands

- **`/ceo-begin`** — Start a CEO Board deliberation about a decision
- **`/swarm-audit`** — Run automated system audit
- **`/generate-route-reference`** — Regenerate API documentation

## Tips

- Use this when onboarding new team members
- Use before starting complex features that need context
- Claude will ask clarifying questions about your project structure
- You can ask follow-up questions in the same session

---

**See Also:** [CLAUDE.md](../../CLAUDE.md) for all available commands
