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
   - Design task → `context-protocol` (context-gather only — no re-approval; plan was already approved) + `scientific-luxury` skill
   - Code task → `context-protocol` (context-gather only — no re-approval; plan was already approved) + `tdd` skill
   - Debug task → `systematic-debugging` skill
   - Verification task → `verification-before-completion` skill
   - Any other task type → `context-protocol` (context-gather only) + `tdd` skill as default
     c. Runs `pnpm turbo run type-check lint test` after completing the task's implementation steps (or runs the specific verification command embedded in the task if one is present)
     d. Marks the task complete (`- [x]`) in PLAN.md only after verification passes
     e. Commits after marking complete
5. After all tasks complete, invokes `verification-before-completion`

## Rules

- Tasks from PLAN.md are pre-approved — use `context-protocol` for context-gathering only; do not produce a Plan Mode approval block again
- Never mark a task `[x]` before running verification — type-check, lint, and tests must pass first
- Never execute tasks out of order
- If a task fails, stop and report — do not continue to the next task
- Keep PLAN.md updated as tasks complete so progress survives session interruption
