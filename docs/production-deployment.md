# Production Deployment Guide

> **Stack**: Next.js 15 (Vercel) + FastAPI (Railway) + PostgreSQL with pgvector

## Architecture Overview

```
Users → Vercel (Next.js frontend)
             ↓ API calls
        Railway (FastAPI backend)
             ↓ SQL
        Railway / Neon / Supabase (PostgreSQL 15 + pgvector)
```

The frontend and backend are **separate deployments**. The frontend calls the backend
via `NEXT_PUBLIC_BACKEND_URL`. CORS must explicitly allow the Vercel domain.

---

## Pre-Deployment Checklist

- [ ] All tests pass: `pnpm turbo run type-check lint test`
- [ ] Docker stack runs cleanly: `pnpm run docker:up && pnpm run verify`
- [ ] Alembic migrations tested locally: `cd apps/backend && uv run alembic upgrade head`
- [ ] Production secrets generated (JWT, webhook) — see [Secret Generation](#secret-generation)
- [ ] `.env` files **not** committed to git (check `.gitignore`)

---

## Secret Generation

Run once locally to generate production-grade secrets:

```bash
# JWT secret (minimum 32 chars — FastAPI startup will reject shorter)
python -c "import secrets; print(secrets.token_urlsafe(48))"

# Webhook HMAC secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Step 1 — Database (Railway PostgreSQL or Neon)

### Option A: Railway PostgreSQL

1. Create a new Railway project and add the **PostgreSQL** plugin
2. Enable the `pgvector` extension via the Railway console:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Copy the `DATABASE_URL` from Railway → Variables

### Option B: Neon

1. Create a project at https://neon.tech
2. Enable `pgvector` under Extensions
3. Copy the connection string (`postgresql://...`)

### Apply schema and migrations

Run from your local machine (or Railway's release command):

```bash
# 1. Apply base schema (tables: users, contractors, documents, etc.)
psql $DATABASE_URL -f scripts/init-db.sql

# 2. Apply Alembic migrations (workflow tables + auth hardening)
cd apps/backend
DATABASE_URL=$DATABASE_URL uv run alembic upgrade head
```

**As a Railway release command** in `railway.json`:

```json
{
  "deploy": {
    "releaseCommand": "psql $DATABASE_URL -f scripts/init-db.sql && uv run alembic upgrade head"
  }
}
```

---

## Step 2 — Backend (Railway FastAPI)

### Environment variables (Railway → Variables)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Railway PostgreSQL URL | Auto-injected if using Railway plugin |
| `ENVIRONMENT` | `production` | Enables safety validators |
| `JWT_SECRET_KEY` | Generated secret (≥32 chars) | **Required** — startup fails without it |
| `JWT_EXPIRE_MINUTES` | `60` | Adjust as needed |
| `WEBHOOK_SECRET` | Generated secret | **Required** in production |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` | Must include your Vercel URL |
| `AI_PROVIDER` | `anthropic` or `ollama` | Use `anthropic` for cloud deployment |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Required if `AI_PROVIDER=anthropic` |
| `BACKEND_API_KEY` | Random string | Internal service-to-service key |
| `DEBUG` | `false` | Never `true` in production |

### CORS configuration

`CORS_ORIGINS` must include your exact Vercel URL. Railway parses it as a JSON array:

```
CORS_ORIGINS=["https://your-app.vercel.app","https://your-custom-domain.com"]
```

If you forget to set this, the frontend will receive CORS errors on all API calls.

### Dockerfile

Railway auto-detects the Dockerfile at `apps/backend/Dockerfile`. If deploying manually:

```bash
docker build -t backend:latest apps/backend/
docker run -p 8000:8000 \
  -e DATABASE_URL=... \
  -e ENVIRONMENT=production \
  -e JWT_SECRET_KEY=... \
  -e CORS_ORIGINS='["https://your-app.vercel.app"]' \
  backend:latest
```

### Verify backend is healthy

```bash
curl https://your-backend.railway.app/health
# → {"status": "healthy", ...}

curl https://your-backend.railway.app/ready
# → {"status": "ready", "database": true}
```

---

## Step 3 — Frontend (Vercel)

### Environment variables (Vercel → Project Settings → Environment Variables)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.railway.app` | No trailing slash |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel URL |

> **Note**: `NEXT_PUBLIC_` variables are bundled into the browser. Never put secrets
> (JWT keys, API keys) in `NEXT_PUBLIC_` variables.

### Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Link and deploy
cd apps/web
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deploys on push to `main`.

---

## Step 4 — Smoke Test

After deployment:

```bash
# Backend health
curl https://your-backend.railway.app/health

# Register a test user
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"TestPass123"}'

# Login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"TestPass123"}'
```

---

## First Admin User

`seed-dev.sql` is **not** mounted in production (local Docker only). Create your first
admin via the API, then promote via SQL:

```bash
# 1. Register
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourapp.com","password":"<strong-password>","full_name":"Admin"}'

# 2. Promote to admin
psql $DATABASE_URL -c "UPDATE users SET is_admin = TRUE WHERE email = 'admin@yourapp.com';"
```

---

## Database Migrations (ongoing)

When you add new Alembic migrations:

```bash
# Generate from model changes
cd apps/backend && uv run alembic revision --autogenerate -m "description"

# Apply to production
DATABASE_URL=$PROD_DATABASE_URL uv run alembic upgrade head

# Rollback one step if needed
DATABASE_URL=$PROD_DATABASE_URL uv run alembic downgrade -1
```

---

## Security Checklist

- [ ] `ENVIRONMENT=production` set on Railway
- [ ] `JWT_SECRET_KEY` is randomly generated, ≥ 32 chars
- [ ] `WEBHOOK_SECRET` is set to a secure random value
- [ ] `DEBUG=false` on Railway
- [ ] `CORS_ORIGINS` lists only your actual frontend domain(s)
- [ ] `seed-dev.sql` not executed in production
- [ ] `NEXT_PUBLIC_*` variables contain no secrets
- [ ] HTTPS enforced (Vercel and Railway provide this automatically)

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| CORS errors in browser | `CORS_ORIGINS` missing Vercel URL | Add `https://your-app.vercel.app` to `CORS_ORIGINS` |
| `startup failed: JWT_SECRET_KEY must be changed` | Default JWT secret in production | Generate and set a real secret |
| `/ready` returns `"database": false` | DB not reachable | Check `DATABASE_URL`, verify pgvector extension enabled |
| `relation "workflows" does not exist` | Alembic migrations not run | Run `uv run alembic upgrade head` |
| Frontend 401 on all requests | CORS preflight failing | Verify `CORS_ORIGINS` includes exact frontend URL |
| Frontend can't reach backend | Wrong `NEXT_PUBLIC_BACKEND_URL` | Set to Railway URL, no trailing slash |
