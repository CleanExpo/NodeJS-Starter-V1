<!-- PR title must be Conventional Commits (feat:/fix:/docs:/chore:/refactor:/test:/ci:) — it becomes the squash-merge commit. -->

## What

<!-- One paragraph: the change and why now. Link the ticket/issue. -->

## Expected vs actual (bug fixes)

<!-- Expected behaviour / actual behaviour before this PR. Delete section for features. -->

## Verification

<!-- Paste real output or a recording. "Should work" is not verification. -->

- [ ] `pnpm type-check` green on this branch
- [ ] `pnpm lint` green
- [ ] `pnpm test` green (backend: `uv run pytest`)
- [ ] `pnpm build` green
- [ ] Change exercised end-to-end where the user meets it (browser/API/terminal) — evidence linked above

## Blast radius

<!-- What could this break? Behaviour changes ship behind a flag defaulting OFF. -->

- [ ] No behaviour change, or the change is flag-gated default-off
- [ ] No secrets, no unrelated files, no lockfile drift (package.json + lockfile committed together)
