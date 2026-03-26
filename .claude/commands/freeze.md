---
id: freeze
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /freeze — Scope Restriction

Restricts file write operations to a specified directory for the current session. Prevents accidental cross-contamination when working on a focused task.

## Usage

```
/freeze <directory-path>
```

**Examples**:
```
/freeze apps/web/
/freeze apps/web/components/dashboard
/freeze apps/backend/src/api/
```

## Behaviour

1. Write the allowed scope to `.claude/.scope-lock`:
   ```json
   {
     "scope": "<directory-path>",
     "activated": "<ISO timestamp>",
     "reason": "User invoked /freeze"
   }
   ```

2. The `guard-scope-check.ps1` PostToolUse hook reads `.scope-lock` on every Edit/Write operation
3. If the modified file is OUTSIDE the guarded directory → inject a WARNING into context
4. Warning format: `⚠ SCOPE GUARD: Write to {file} is outside frozen scope {scope}. Use /unfreeze to remove restriction.`

## Important Notes

- Scope guard is advisory (warns, does not hard-block) to avoid breaking the session
- The guard applies to Edit and Write tool operations, not Bash commands
- `.scope-lock` is deleted on `/unfreeze` or when the session ends
- Nested freezes are NOT supported — a new `/freeze` overwrites the previous scope
- The frozen directory path is relative to the project root

## When to Use

- Working on a specific feature within `apps/web/` and want to prevent backend changes
- Specialist agent executing a task that should only touch one module
- During refactoring to ensure changes stay within target scope
