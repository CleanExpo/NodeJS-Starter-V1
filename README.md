# Claude Code Agent Orchestration System v2

A production-ready monorepo template for building AI-powered applications with Next.js, LangGraph, and Claude.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Python 3.12, FastAPI, LangGraph |
| **Database** | Supabase (PostgreSQL + pgvector + Auth) |
| **AI Models** | Claude (Opus/Sonnet/Haiku 4.5), Gemini, OpenRouter |
| **MCPs** | Playwright, Exa, Ref.tools |
| **Orchestrator** | Dual system (SKILL.md + Python/LangGraph) |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.12+
- uv (Python package manager)
- Supabase CLI (optional, for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development
pnpm dev
```

## Project Structure

```
project-root/
├── .github/workflows/     # CI/CD pipelines
├── .vscode/               # VS Code configuration
├── apps/
│   ├── web/               # Next.js frontend
│   └── backend/           # Python/LangGraph backend
├── packages/
│   ├── shared/            # Shared TypeScript types
│   └── config/            # Shared configs (ESLint, TypeScript)
├── skills/                # SKILL.md orchestration files
├── supabase/              # Database migrations
└── scripts/               # Setup and utility scripts
```

## Development

### Frontend (Next.js)

```bash
# Start frontend only
pnpm dev --filter=web

# Build
pnpm build --filter=web

# Lint
pnpm lint --filter=web

# Type check
pnpm type-check --filter=web
```

### Backend (Python)

```bash
cd apps/backend

# Start development server
uv run uvicorn src.api.main:app --reload

# Run tests
uv run pytest

# Type check
uv run mypy src/

# Lint
uv run ruff check src/
```

### Full Stack

```bash
# Start all services
./scripts/dev.sh

# Or use Turbo
pnpm dev

# Build everything
pnpm build

# Run all lints and type checks
pnpm turbo run lint type-check
```

### Database (Supabase)

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > packages/shared/src/types/supabase.ts
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Models
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx
OPENROUTER_API_KEY=sk-or-xxx

# MCP Tools
EXA_API_KEY=xxx

# Backend
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=your-internal-api-key
```

## AI Model Configuration

| Provider | Model | API String |
|----------|-------|------------|
| Anthropic | Claude Opus 4.5 | `claude-opus-4-5-20251101` |
| Anthropic | Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` |
| Anthropic | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` |
| Google | Gemini 2.0 Flash | `gemini-2.0-flash-exp` |
| OpenRouter | Multi-model | Various |

## SKILL.md Orchestration

The `/skills` directory contains markdown files that define agent behaviors:

- `ORCHESTRATOR.md` - Master orchestrator routing
- `core/VERIFICATION.md` - Verification-first development
- `core/ERROR-HANDLING.md` - Error handling patterns
- `frontend/NEXTJS.md` - Next.js patterns
- `backend/LANGGRAPH.md` - LangGraph workflows
- `database/SUPABASE.md` - Supabase patterns

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Configure environment variables
4. Deploy automatically on push to main

### Backend (DigitalOcean)

1. Create a DigitalOcean App Platform app
2. Connect your GitHub repo
3. Set Dockerfile path to `apps/backend/Dockerfile`
4. Configure environment variables
5. Deploy via GitHub Actions or manually

### Database (Supabase)

1. Create a Supabase project
2. Get connection details from dashboard
3. Run migrations:
   ```bash
   supabase db push --db-url "postgresql://..."
   ```

## Testing

```bash
# Frontend tests
pnpm test --filter=web

# Backend tests
cd apps/backend && uv run pytest

# All tests
pnpm turbo run test
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## License

MIT

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/your-username/your-repo/issues) page.
