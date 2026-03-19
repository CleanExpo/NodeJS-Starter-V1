---
id: post-verification
name: post-verification
type: hook
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
priority: 2
blocking: false
---


# Post-Verification Hook

Runs after verification agent completes verification.

## Actions

### 1. Evidence Collection
```
Collect:
- Test output
- Build logs
- Screenshots
- Lighthouse scores
- Error messages (if any)
```

### 2. Update PROGRESS.md
```
IF major feature completed:
  Update PROGRESS.md with:
  - Component completion status
  - Verification tier used
  - Test results
  - Next steps
```

### 3. Store Learning
```
IF verification failed:
  Store failure patterns for future prevention

IF verification passed:
  Store success patterns for reuse
```

### 4. Generate Report
```markdown
## Verification Report

**Tier**: [A/B/C/D]
**Result**: [PASS/FAIL]
**Duration**: [X minutes]

### Evidence
[Attached]

### Issues
[None / List]
```

## Integration

Called by verification agent after completing verification.
