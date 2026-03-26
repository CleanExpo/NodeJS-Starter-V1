---
id: ship
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /ship — Build to Production Pipeline

End-to-end deployment pipeline that chains verification, build, migration, deployment, and canary checks. This is the production counterpart to `/harness` (which handles idea → code).

## Usage

```
/ship                           # Full pipeline: verify → build → migrate → deploy → canary
/ship --dry-run                 # Run all checks without deploying
/ship --frontend-only           # Deploy frontend only (Vercel)
/ship --backend-only            # Deploy backend only (DigitalOcean/Railway)
/ship --skip-canary             # Skip post-deploy canary check
```

## Pipeline Stages

```
Stage 1: PRE-FLIGHT     → Environment validation + verification gates
Stage 2: BUILD          → Production builds (frontend + backend)
Stage 3: MIGRATE        → Database migrations (if pending)
Stage 4: DEPLOY         → Push to production (Vercel + backend host)
Stage 5: CANARY         → Post-deploy health check + smoke tests
Stage 6: CONFIRM        → Human confirmation or automatic rollback
```

### Stage 1: Pre-Flight (deploy-guardian agent)

Dispatch the `deploy-guardian` agent to validate production readiness:

1. **Environment check**: All required vars in `.env` exist and are non-default
   ```bash
   # Verify critical vars are set and not defaults
   # JWT_SECRET_KEY ≠ default, ≥32 chars
   # DATABASE_URL set
   # SENTRY_DSN set (or explicitly opted out)
   ```

2. **Verification gates**: Run the full verification suite
   ```bash
   pnpm turbo run type-check lint test
   pnpm build --filter=web
   cd apps/backend && uv run pytest -v
   ```

3. **Security scan**: Check for exposed secrets
   ```bash
   # No .env files committed
   # No hardcoded API keys in source
   # No debug flags enabled
   ```

4. **Migration check**: Verify all migrations are applied
   ```bash
   cd apps/backend && uv run alembic check
   ```

5. **Gate**: ALL checks must pass. Any failure → STOP with error report.

### Stage 2: Build

Production builds for both applications:

```bash
# Frontend
pnpm build --filter=web
# Verify standalone output exists
ls apps/web/.next/standalone/

# Backend
cd apps/backend && uv sync --frozen --no-dev
# Verify no dev dependencies in production
```

### Stage 3: Migrate (if pending)

Run pending database migrations:

```bash
cd apps/backend && uv run alembic upgrade head
```

**Safety rules**:
- Always run `alembic check` first to see what's pending
- Never run destructive migrations (DROP TABLE, DROP COLUMN) without explicit user confirmation
- Log all migration operations
- If migration fails → STOP and report (do NOT proceed to deploy)

### Stage 4: Deploy

Deploy to production infrastructure:

```bash
# Frontend → Vercel
cd apps/web && vercel --prod

# Backend → Platform-specific
# DigitalOcean:
doctl apps create-deployment $DO_APP_ID
# OR Railway:
railway up
# OR Docker:
docker compose -f docker-compose.prod.yml up -d
```

**Safety rules**:
- Deploy frontend first (static, instant rollback via Vercel)
- Deploy backend second (requires migration to be complete)
- If backend deploy fails → frontend is still on old version (safe)

### Stage 5: Canary Check

Post-deploy monitoring for 5 minutes:

1. **Health endpoint**: Hit `/api/health` and `/api/health/deep` every 30 seconds
2. **Smoke test**: Run critical path checks:
   - Login flow responds
   - Dashboard loads
   - API returns expected shapes
3. **Error rate**: Check Sentry for new errors in the deployment window
4. **Performance**: Check response times haven't degraded

**Gate**: If any canary check fails → trigger Stage 6 with ROLLBACK recommendation.

### Stage 6: Confirm

Present deployment report to user:

```markdown
# Deployment Report: [timestamp]

## Pre-Flight
- [ ] Environment validated
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Migrations applied

## Build
- [ ] Frontend build successful
- [ ] Backend build successful

## Deploy
- [ ] Frontend deployed to [URL]
- [ ] Backend deployed to [URL]

## Canary (5 min)
- [ ] Health checks: X/X passing
- [ ] Smoke tests: X/X passing
- [ ] Error rate: [X new errors / baseline]
- [ ] Performance: [avg response time]

## Verdict: [GO / ROLLBACK]
```

If ROLLBACK:
```bash
# Frontend: Vercel instant rollback
vercel rollback

# Backend: Redeploy previous version
doctl apps create-deployment $DO_APP_ID --force-rebuild
```

## Rollback Strategy

| Component | Rollback Method | Time |
|-----------|----------------|------|
| Frontend (Vercel) | `vercel rollback` | Instant |
| Backend (Docker) | Redeploy previous image | 2-3 min |
| Database migration | `alembic downgrade -1` (if reversible) | 1-5 min |

**Rule**: All migrations MUST be reversible. Irreversible migrations require explicit user confirmation before Stage 3.

## When to Use

- Deploying to production after `/harness` completes Phase 8
- Deploying hotfixes after `/minion` creates a merged PR
- Regular deployment cycles

## When NOT to Use

- Local development → use `pnpm dev`
- Staging deployment → not yet supported (future: `/ship --staging`)
- Zero-downtime migration → requires blue-green setup (future enhancement)

## Integration with Harness

```
/harness "build feature X"
  → Phase 1-8 (idea → PR)
  → Human reviews and merges PR
  → /ship (PR merged → production)
     → Pre-flight → Build → Migrate → Deploy → Canary → Confirm
```

The `/harness` command ends at PR creation. `/ship` picks up after the PR is merged.

## Prerequisites

- `vercel` CLI installed and authenticated (frontend)
- Platform CLI installed (backend: `doctl`, `railway`, or Docker)
- `SENTRY_DSN` configured (or explicitly opted out)
- All CI/CD checks passing on main branch
- PR merged (never ship unmerged code)
