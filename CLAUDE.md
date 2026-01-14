# CLAUDE.md - AI Project Scaffolding Architecture

> **Professional Scaffolding Module**: Next.js + FastAPI/LangGraph + PostgreSQL Patterns

## 🎯 Quick Overview

This is a **professional scaffolding module** providing senior-level architecture patterns for AI-powered applications. It's designed to be integrated into your projects as an add-on to enhance overall code quality and architecture.

**Important**: When starting a new project, always use `create-next-app@latest` with stable versions first, then integrate these scaffolding patterns.

## 📋 Quick Commands

```bash
# Setup (one-time)
pnpm run setup              # Unix/macOS
pnpm run setup:windows      # Windows

# Development
pnpm dev                    # Start all services
pnpm run verify             # Health check

# Docker Management
pnpm run docker:up          # Start PostgreSQL + Redis
pnpm run docker:down        # Stop services
pnpm run docker:reset       # Reset database

# Testing & Quality
pnpm turbo run test         # All tests
pnpm turbo run lint         # Linting
pnpm turbo run type-check   # Type checking

# Dependency Verification (NEW)
pnpm verify                 # Full verification + dependency check
pnpm verify:fix             # Auto-fix dependency issues
pnpm deps:clean             # Clean install dependencies
```

## 🏗️ Architecture Overview

### Frontend (Next.js 15)

**Location**: `apps/web/`

- Next.js 15 with App Router
- React 19 with Server Components
- Tailwind CSS v4 + design tokens
- shadcn/ui components
- JWT authentication (cookie-based)

**Key Files**:

- `apps/web/lib/api/client.ts` - API client (fetch wrapper)
- `apps/web/lib/api/auth.ts` - Authentication API
- `apps/web/middleware.ts` - JWT auth middleware
- `apps/web/app/` - App Router pages

### Backend (FastAPI + LangGraph)

**Location**: `apps/backend/`

- FastAPI async framework
- LangGraph agent orchestration
- SQLAlchemy 2.0 ORM
- JWT authentication with bcrypt
- Dual AI providers (Ollama + Claude)

**Key Directories**:

- `src/agents/` - AI agent implementations
- `src/api/` - FastAPI routes and dependencies
- `src/auth/` - JWT token management
- `src/config/` - Database and settings
- `src/db/` - SQLAlchemy models
- `src/models/` - AI provider abstraction layer

### Database (PostgreSQL 15)

**Location**: Docker Compose

- PostgreSQL 15 with pgvector extension
- Redis 7 for caching
- Auto-migrations on startup
- Persistent volumes

**Schema Location**: `scripts/init-db.sql`

**Key Tables**:

- `users` - Authentication with bcrypt passwords
- `documents` - Document storage with vector embeddings
- `contractors` - Contractor profiles
- `availability_slots` - Scheduling system

### AI Integration

**Default**: Ollama (local, free)
**Optional**: Claude API (cloud, paid)

**Provider Files**:

- `apps/backend/src/models/base_provider.py` - Abstract interface
- `apps/backend/src/models/ollama_provider.py` - Local AI
- `apps/backend/src/models/anthropic.py` - Cloud AI
- `apps/backend/src/models/selector.py` - Auto-detection

## 📂 Project Structure

```
ai-project-scaffolding/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/                # App Router
│   │   ├── components/         # React components
│   │   ├── lib/api/            # API client
│   │   └── middleware.ts       # JWT auth
│   └── backend/                # Python Backend
│       ├── src/
│       │   ├── agents/         # AI agents
│       │   ├── api/            # FastAPI routes
│       │   ├── auth/           # JWT authentication
│       │   ├── config/         # Configuration
│       │   ├── db/             # Database models
│       │   └── models/         # AI providers
│       └── tests/              # Pytest tests
├── scripts/                    # Setup scripts
│   ├── setup.sh               # Unix/macOS setup
│   ├── setup.ps1              # Windows setup
│   ├── verify.sh              # Health checks
│   └── init-db.sql            # Database schema
├── docs/                       # Documentation
│   ├── LOCAL_SETUP.md         # Setup guide
│   ├── AI_PROVIDERS.md        # Ollama vs Claude
│   └── OPTIONAL_SERVICES.md   # Deployment guides
├── docker-compose.yml         # PostgreSQL + Redis
└── .env.example               # Environment template
```

## 🔄 Development Workflow

### 1. Initial Setup

```bash
# Option A: Fresh project with stable Next.js
npx create-next-app@latest my-project --typescript --tailwind --eslint --app
cd my-project

# Copy scaffolding patterns
cp -r /path/to/scaffolding/apps/backend ./apps/
cp -r /path/to/scaffolding/scripts ./

# Run setup
pnpm run setup

# Start development
pnpm dev
```

### 2. Development Cycle

```bash
# Make changes to code
# Hot reload works automatically

# Run tests before committing
pnpm turbo run test

# Check code quality
pnpm turbo run lint type-check
```

### 3. Database Changes

```bash
# If you modify database schema:
cd apps/backend

# Create migration
uv run alembic revision --autogenerate -m "description"

# Apply migration
uv run alembic upgrade head

# Or reset completely (destroys data)
pnpm run docker:reset
```

## 🔐 Authentication Flow

### JWT-Based (No External Auth Service)

1. **Login**: `POST /api/auth/login`
   - User submits email/password
   - Backend verifies with bcrypt
   - Returns JWT token
   - Frontend stores in cookie

2. **Protected Routes**:
   - Frontend middleware checks cookie
   - Redirects to login if missing
   - Backend validates JWT on API requests

3. **Logout**: `POST /api/auth/logout`
   - Frontend clears cookie
   - Backend invalidates session

**Implementation**:

- Backend: `apps/backend/src/auth/jwt.py`
- Frontend: `apps/web/lib/api/auth.ts`
- Middleware: `apps/web/middleware.ts`

## 🤖 AI Provider System

### How It Works

The template uses a **provider abstraction layer** that allows switching between local and cloud AI:

```python
# apps/backend/src/models/selector.py

# Automatically selects provider based on:
1. AI_PROVIDER environment variable
2. Availability of API keys
3. Fallback to Ollama if no key
```

### Default: Ollama (Local)

```bash
# .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### Optional: Claude (Cloud)

```bash
# .env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Provider Interface

All providers implement:

- `complete()` - Single completion
- `chat()` - Chat messages
- `generate_embeddings()` - Vector embeddings

## 📊 Database Architecture

### Connection Strategy

**Dual Engine Pattern**:

- **Async Engine**: For API requests (asyncpg driver)
- **Sync Engine**: For migrations (psycopg2 driver)

```python
# apps/backend/src/config/database.py

# API usage
async with AsyncSessionLocal() as session:
    result = await session.execute(query)

# Migrations
# Alembic uses sync engine automatically
```

### Key Models

**User** (`users` table):

- Email/password authentication
- JWT-based sessions
- Admin flag

**Document** (`documents` table):

- Title, content, metadata
- Vector embeddings (pgvector)
- Full-text search ready

**Contractor** (`contractors` table):

- Profile information
- Availability tracking
- Document associations

## 🧪 Testing Strategy

### Backend Tests (Pytest)

```bash
cd apps/backend

# All tests
uv run pytest

# With coverage
uv run pytest --cov

# Specific test file
uv run pytest tests/test_auth.py
```

### Frontend Tests (Vitest)

```bash
# All tests
pnpm test --filter=web

# Watch mode
pnpm test:watch --filter=web

# E2E tests
pnpm test:e2e --filter=web
```

### CI/CD

GitHub Actions runs:

- All tests (no external services needed)
- Linting (ESLint + Ruff)
- Type checking (TypeScript + mypy)
- Security scans (NPM Audit + Trivy)

**No secrets required!** The CI works out of the box.

## 🚀 Optional Upgrades

### When You're Ready for Production

See [`docs/OPTIONAL_SERVICES.md`](docs/OPTIONAL_SERVICES.md) for:

**Frontend Hosting**:

- Vercel (recommended)
- Netlify
- Cloudflare Pages

**Backend Hosting**:

- DigitalOcean App Platform
- Railway
- Fly.io
- Render

**Database Hosting**:

- Keep Docker (works fine)
- Upgrade to managed PostgreSQL

**Cloud AI**:

- Claude API ($3-75/1M tokens)
- Better quality than local

**External Services**:

- Codecov (coverage tracking)
- Snyk (security scanning)
- Sentry (error monitoring)
- PostHog (analytics)

## 🎯 Key Principles

### 1. Local-First

Everything runs on your machine. No cloud required for development.

### 2. Zero Barriers

No API keys, accounts, or configuration needed to start.

### 3. Production Ready

Real authentication, testing, CI/CD included.

### 4. Optional Upgrades

Easy path to cloud services when ready.

## 📝 Spec Generation System ✅ NEW

**Principle**: Every feature and project phase requires a specification document before implementation.

### Automatic Detection

The system automatically detects when you start new work and prompts for spec.md generation if one doesn't exist.

### Spec Types

- **Project Phase Spec**: For architectural changes (Phase 0-9 style)
  - Location: `docs/phases/phase-X-spec.md`
  - Links to PROGRESS.md
- **Feature Spec**: For focused features
  - Location: `docs/features/[feature-name]/spec.md`
  - Links to feature branch

### Generation Modes

- **Interview Mode**: Spec Builder Agent conducts 6-phase interactive interview (comprehensive)
- **Template Mode**: Pre-filled template for quick start (fast)
- **Validation Mode**: Reviews existing specs for completeness and compliance

### Verification

Specs must be ≥80% complete before implementation:

- ✅ All 6 phases have content
- ✅ Australian context specified (en-AU, DD/MM/YYYY, AUD)
- ✅ Design system compliance (NO Lucide icons, design tokens)
- ✅ Verification criteria defined

**See**: `docs/SPEC_GENERATION.md` for full documentation and workflows

## 📚 Documentation

| Document                                                         | Purpose                  |
| ---------------------------------------------------------------- | ------------------------ |
| [`README.md`](README.md)                                         | Overview and quick start |
| [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)                     | Complete setup guide     |
| [`docs/AI_PROVIDERS.md`](docs/AI_PROVIDERS.md)                   | Ollama vs Claude         |
| [`docs/OPTIONAL_SERVICES.md`](docs/OPTIONAL_SERVICES.md)         | Deployment guides        |
| [`docs/new-project-checklist.md`](docs/new-project-checklist.md) | 3-step setup             |

## 🔧 Troubleshooting

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Restart services
docker compose down && docker compose up -d

# View logs
docker compose logs -f postgres
```

### Ollama Not Working

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# Start Ollama
ollama serve
```

### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Change ports in .env if needed
```

### Dependencies Not Installing

```bash
# Clear and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install

# Backend
cd apps/backend && rm -rf .venv && uv sync
```

## 📝 Environment Variables

### Required (All Have Defaults)

```bash
# Database
DATABASE_URL=postgresql://starter_user:local_dev_password@localhost:5432/starter_db

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRE_MINUTES=60

# AI Provider
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# API
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Optional (Cloud Upgrades)

```bash
# Anthropic Claude
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Other AI Providers
OPENAI_API_KEY=sk-xxx
GOOGLE_AI_API_KEY=xxx

# External Services
SENTRY_DSN=xxx
POSTHOG_API_KEY=xxx
```

## 🎓 Learning Resources

**Frameworks**:

- [Next.js Docs](https://nextjs.org/docs) - Frontend
- [FastAPI Docs](https://fastapi.tiangolo.com/) - Backend
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/) - Agents

**Tools**:

- [Ollama Docs](https://ollama.com/) - Local AI
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database
- [shadcn/ui](https://ui.shadcn.com/) - UI Components

**Concepts**:

- [JWT Authentication](https://jwt.io/introduction)
- [RAG (Retrieval Augmented Generation)](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Vector Embeddings](https://www.pinecone.io/learn/vector-embeddings/)

---

## 🚀 Quick Reference

**Start Development**: `pnpm dev`
**Run Tests**: `pnpm turbo run test`
**Check Health**: `pnpm run verify`
**Reset Database**: `pnpm run docker:reset`

**Default Credentials**: admin@local.dev / admin123

---

**Professional scaffolding for senior-level AI application development**
