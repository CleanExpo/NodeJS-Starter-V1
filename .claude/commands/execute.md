# Execute Command

Execute the current implementation plan from `.planning/PLAN.md`.

**Usage**: `/execute`

## What This Does

1. Reads `.planning/PLAN.md`
2. If the file does not exist, responds: "No PLAN.md found at `.planning/PLAN.md`. Run `/discuss` to create one."
3. Identifies all incomplete tasks — lines matching `- [ ]`
4. For each incomplete task in order:
   a. Shows the task description
   b. Invokes the appropriate skill(s) based on task type:
   - Design task → `context-protocol` + `scientific-luxury` skill
   - Code task → `context-protocol` + `tdd` skill
   - Debug task → `systematic-debugging` skill
   - Verification task → `verification-before-completion` skill
     c. Marks the task complete (`- [x]`) in PLAN.md when done
     d. Commits after each completed task
5. After all tasks complete, invokes `verification-before-completion`

## Rules

- Never skip the context-protocol step for design or code tasks
- Never mark a task `[x]` without running the verification command in that task
- Never execute tasks out of order
- If a task fails, stop and report — do not continue to the next task
- Keep PLAN.md updated as tasks complete so progress survives session interruption
