---
id: unfreeze
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /unfreeze — Remove Scope Restriction

Removes the scope restriction set by `/freeze`, restoring full write access.

## Usage

```
/unfreeze
```

## Behaviour

1. Delete `.claude/.scope-lock` if it exists
2. Confirm: `Scope guard removed. Full write access restored.`
3. If no scope lock was active: `No scope guard is active.`

## Notes

- This is a simple cleanup command — no side effects
- Scope guards are also automatically removed when the session ends
