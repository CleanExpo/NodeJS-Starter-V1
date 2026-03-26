# Execution Guardian - Anti-Patterns Reference

Risk operation types that trigger governance intervention. Use this reference to identify operations requiring pre-execution validation gates.

---

## HIGH Risk Operation Types

### Database Migrations

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| `ALTER TABLE` | Adding/dropping columns, changing types | Schema changes affect all downstream queries |
| `DROP TABLE` / `DROP COLUMN` | Removing database objects | Irreversible data loss without backup |
| Alembic revision without `downgrade()` | Missing rollback function | Migration cannot be reversed |
| Type changes on populated columns | `ALTER COLUMN type VARCHAR` to `INTEGER` | Data truncation or conversion failure |
| Index drops on high-traffic tables | `DROP INDEX idx_users_email` | Immediate query performance degradation |

**Anti-Pattern**: Assuming "it's just adding a column" is safe. Adding a NOT NULL column without a default to a populated table will fail.

### Authentication & Authorisation Changes

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| JWT secret rotation | Changing `JWT_SECRET_KEY` | Invalidates all existing sessions |
| RBAC permission changes | Adding/removing roles or scopes | May lock out existing users |
| Password hashing algorithm change | Switching from bcrypt to argon2 | Existing hashes become unverifiable |
| OAuth provider config | Changing redirect URIs, client IDs | Breaks third-party login flows |
| Session management changes | Token expiry, refresh token logic | Unexpected user logouts |

**Anti-Pattern**: Rotating JWT secrets without a dual-key validation period. All users are force-logged-out simultaneously.

### Destructive File Operations

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| `rm -rf` | Recursive deletion | No confirmation, no undo |
| `git reset --hard` | Discarding all uncommitted work | Permanent loss of unstaged changes |
| `git clean -f` | Removing untracked files | May delete generated files needed at runtime |
| `git push --force` | Rewriting remote history | Destroys other developers' work |
| File overwrites without backup | `Write` to existing file without `Read` first | Original content lost |

**Anti-Pattern**: Running `git reset --hard` to "clean up" when `git stash` would preserve the work.

### Deployment Operations

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| Production deploy | `vercel deploy --prod` | Live user impact |
| Environment variable changes | Adding/removing from `.env.production` | May break runtime configuration |
| Docker image push | `docker push` to production registry | Replaces running container image |
| Infrastructure changes | Terraform apply, DNS changes | Multi-service blast radius |

**Anti-Pattern**: Deploying without running the full test suite first. "Tests passed locally" is not sufficient.

### Security Changes

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| CORS policy modification | Changing `Access-Control-Allow-Origin` | May expose API to malicious origins |
| CSP header changes | Modifying `Content-Security-Policy` | May allow script injection |
| Rate limit config | Changing or disabling rate limits | Opens door to brute-force attacks |
| Secret rotation | Any credential or API key change | May break integrations |

**Anti-Pattern**: Setting CORS to `*` in production "to fix a quick bug". This is a permanent security regression.

---

## MEDIUM Risk Operation Types

### API Contract Changes

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| Response shape change | Renaming or removing fields | Frontend renders `undefined` |
| Status code change | `200` to `201` for creation | Client-side condition logic breaks |
| Endpoint rename | `/api/users` to `/api/v2/users` | All consumers must update |
| Request body change | New required fields | Existing clients send incomplete requests |

**Anti-Pattern**: Changing a response field name without updating the corresponding Zod schema in `apps/web/`.

### Multi-Layer Changes

| Signal | Example | Why It Triggers |
|--------|---------|-----------------|
| Frontend + Backend in one PR | Adding a new feature end-to-end | Contract mismatch risk |
| Backend + Database in one PR | New endpoint with new table | Migration ordering matters |
| 3+ layers modified | Frontend + Backend + DB + Docker | Blast radius spans entire stack |

**Anti-Pattern**: Making a "small change" across three layers without running cross-layer integration tests.

---

## LOW Risk Operation Types

### Dependency Changes

| Signal | Example | Governance |
|--------|---------|-----------|
| `pnpm add` / `uv add` | Adding new packages | Audit for vulnerabilities |
| Major version bump | `next@14` to `next@15` | Breaking change review |
| Removing packages | `pnpm remove lodash` | Check no remaining imports |

### Configuration Changes

| Signal | Example | Governance |
|--------|---------|-----------|
| `next.config.ts` | Build configuration | Syntax validation |
| `pyproject.toml` | Python project config | Dependency resolution check |
| `tsconfig.json` | TypeScript compiler options | Type-check after change |
| `.env.example` | Documentation of env vars | No blocking gate |

---

## Governance Bypass Anti-Patterns

These patterns indicate the Guardian is being circumvented incorrectly:

| Anti-Pattern | Problem | Correct Approach |
|-------------|---------|------------------|
| "It's just a small change" | Size does not determine risk; type does | Gate based on operation type |
| Skipping gates in EXPLORATION mode for write ops | EXPLORATION is for read-only | Switch to BUILD mode for writes |
| Self-healing security gates | Masks real vulnerabilities | Security gates are always manual |
| Gating every single file edit | Over-governance kills momentum | Only gate destructive/multi-layer/security ops |
| Ignoring advisory warnings repeatedly | Accumulated tech debt | Track advisory warnings; escalate after 3 consecutive |
