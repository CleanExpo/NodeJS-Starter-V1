---
id: post-session
name: post-session
type: hook
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
priority: 3
blocking: false
---


# Post-Session Hook

Runs at the end of a work session to capture learnings and update progress.

## Actions

### 1. Capture Learnings
```
Record:
- What was accomplished
- What challenges were encountered
- What solutions worked
- What patterns emerged
```

### 2. Update PROGRESS.md
```
Update:
- Overall completion percentages
- Component statuses
- Blockers encountered
- Next actions identified
```

### 3. Generate Session Summary
```markdown
## Session Summary

**Date**: YYYY-MM-DD
**Duration**: X hours

### Accomplished
- [Task 1]
- [Task 2]

### Challenges
- [Challenge 1 + solution]

### Next Steps
- [Action 1]
- [Action 2]
```

### 4. Store Context
```
Save session context for next session:
- Current tasks
- Open questions
- Pending decisions
```

## Integration

Called automatically at end of session or when user ends conversation.
