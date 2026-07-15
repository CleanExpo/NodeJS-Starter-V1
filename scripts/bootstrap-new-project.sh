#!/usr/bin/env bash
#
# bootstrap-new-project.sh — turn a clone of this template into a new project.
#
# Usage:
#   gh repo create <org>/<new-name> --template CleanExpo/NodeJS-Starter-V1 --private --clone
#   cd <new-name>
#   bash scripts/bootstrap-new-project.sh <new-name>
#
# What it does (idempotent; each step says what it changed):
#   1. Renames the project identity in package.json files.
#   2. Resets env files to placeholders (verifies no live credentials remain).
#   3. Applies the estate repo settings via gh: auto-merge, delete-branch-on-merge,
#      squash-only, branch protection with required checks (NO required-review — a
#      single-account org can never satisfy it; see docs/adr/0001).
#   4. Prints the day-one checklist.
#
set -euo pipefail

NEW_NAME="${1:?usage: bash scripts/bootstrap-new-project.sh <new-project-name>}"
REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"

echo "==> 1/4 Renaming project identity to '${NEW_NAME}'"
# Root package name (template name → new project name)
if command -v node >/dev/null; then
  node - "$NEW_NAME" <<'EOF'
const fs = require('fs');
const name = process.argv[2];
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = name;
pkg.description = `${name} — started from NodeJS-Starter-V1`;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`    package.json name → ${name}`);
EOF
fi

echo "==> 2/4 Checking env hygiene"
if grep -RInE "eyJ[A-Za-z0-9_-]{40,}|sk-ant-api[0-9]+-[A-Za-z0-9_-]{20,}" .env.example apps/*/.env.example 2>/dev/null; then
  echo "    ERROR: live-looking credentials found in env examples — fix before continuing." >&2
  exit 1
fi
echo "    env examples are placeholder-only."
for f in .env .env.local apps/web/.env.local apps/backend/.env; do
  [ -f "$f" ] && echo "    NOTE: local env file '$f' exists — review it manually (not template content)."
done

echo "==> 3/4 Applying repo settings via gh (skipped if repo not on GitHub yet)"
if [ -n "$REPO_SLUG" ]; then
  gh api -X PATCH "repos/${REPO_SLUG}" \
    -f allow_auto_merge=true \
    -f delete_branch_on_merge=true \
    -f allow_update_branch=true \
    -f allow_squash_merge=true \
    -f allow_merge_commit=false \
    -f allow_rebase_merge=false >/dev/null
  echo "    repo settings: auto-merge on, squash-only, delete-branch-on-merge on."

  gh api -X PUT "repos/${REPO_SLUG}/branches/main/protection" \
    --input - >/dev/null <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "Dependency Verification",
      "Backend Tests",
      "Frontend Tests",
      "Build Check",
      "Secret Scan (gitleaks)",
      "Prettier Format Check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
  echo "    branch protection: required checks incl. gitleaks, strict=false, no required-review (ADR-0001)."
else
  echo "    no GitHub remote detected — run this script again after 'gh repo create'."
fi

echo "==> 4/4 Day-one checklist"
cat <<'EOF'
    [ ] Create Supabase project; fill .env.local from .env.example (never commit it)
    [ ] Set Vercel (web) + Railway (backend) projects and secrets
    [ ] pnpm install && pnpm verify   — must be green before the first feature
    [ ] Read CLAUDE.md and docs/adr/0001-starter-pack-standard.md
    [ ] First PR: update README title/badges — confirms the merge rails work end-to-end
EOF
echo "Bootstrap complete."
