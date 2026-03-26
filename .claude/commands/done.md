# Done Command

Verify that a recently implemented feature is complete before claiming it is finished.

**Usage**: `/done`

> **Note**: This is different from `/verify`. The `/verify` command checks foundation architecture (TypeScript config, directory structure, circular dependencies). This command checks that the feature you just built actually works end-to-end.

## What This Does

Invokes the `verification-before-completion` skill, which requires:

1. **Run the relevant tests**
   - Frontend: `pnpm test --filter=web`
   - Backend: `cd apps/backend && uv run pytest -v`
   - Both: `pnpm turbo run test`

2. **Type check**

   ```bash
   pnpm turbo run type-check
   ```

3. **Lint**

   ```bash
   pnpm turbo run lint
   ```

4. **Manual smoke test**
   - Requires the dev server to be running (`pnpm dev`). If not running, start it first or skip and note as untested.
   - Open the feature in the browser (or call the endpoint)
   - Verify the happy path works
   - Verify the error path works

5. **Report**
   Output a checklist:

   ```
   DONE VERIFICATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✓ / ✗  Tests: [pass/fail count]
   ✓ / ✗  Type check: [pass/fail]
   ✓ / ✗  Lint: [pass/fail]
   ✓ / ✗  Smoke test: [what was tested, or "skipped — dev server not running"]

   VERDICT: [COMPLETE / NOT COMPLETE]

   If NOT COMPLETE:
   Blockers: [list what failed]
   Next action: [specific step to fix]
   ```

## Rules

- Never output "Done!" or "Complete!" without running the commands above
- Never skip the manual smoke test
- If any step fails, output the blocker and stop — do not claim completion
