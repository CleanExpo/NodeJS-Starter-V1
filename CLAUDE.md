# CLAUDE.md - Project Intelligence

> This file provides context for Claude Code when working with this codebase.

## Project Overview

This is a **Claude Code Agent Orchestration System** - a production-ready monorepo for building AI-powered applications. It uses a dual orchestration approach combining SKILL.md files with Python/LangGraph for maximum flexibility.

## Foundation-First Architecture

This project follows a **foundation-first architecture** - preventing problems before they exist through strict typing, layered architecture, and automated validation.

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                  Components                      │
│         (UI, loading, error, empty states)       │
├─────────────────────────────────────────────────┤
│                    Hooks                         │
│            (Data fetching, state)                │
├─────────────────────────────────────────────────┤
│                 API Routes                       │
│      (try/catch + validate + service call)       │
├─────────────────────────────────────────────────┤
│                  Services                        │
│         (Business logic, calls repos)            │
├─────────────────────────────────────────────────┤
│                Repositories                      │
│           (Data access only)                     │
├─────────────────────────────────────────────────┤
│                  Database                        │
│              (Supabase/PostgreSQL)               │
└─────────────────────────────────────────────────┘
```

### Layer Rules (CRITICAL)

- **Components** cannot import from `server/`
- **API routes** must use services, never repositories directly
- **Repositories** cannot import from services
- **All functions** must have explicit return types
- **Never use `any`** - use `unknown` and validate

### Claude Code Commands

Run these commands to manage the foundation:

| Command | Description |
|---------|-------------|
| `/bootstrap` | Full foundation setup (run ONCE on new project) |
| `/new-feature <name>` | Scaffold complete feature with all files |
| `/verify` | Check foundation is intact |
| `/audit` | Full architecture audit |
| `/fix-types` | Regenerate database types from Supabase |

### Configuration

Project settings are in `.claude/settings.json` with:
- Strict TypeScript configuration
- Layer architecture rules
- Component state requirements
- API route patterns
- Git hooks for validation

## Tech Stack

### Frontend (`apps/web/`)
- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with Server Components
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Components**: shadcn/ui (new-york style)
- **Language**: TypeScript 5.7+

### Backend (`apps/backend/`)
- **Framework**: FastAPI (Python 3.12+)
- **Agent Orchestration**: LangGraph
- **Package Manager**: uv
- **Containerization**: Docker

### Database
- **Provider**: Supabase (PostgreSQL)
- **Extensions**: pgvector for embeddings
- **Auth**: Supabase Auth with RLS policies

### AI Models
- Claude 4.5 (Opus/Sonnet/Haiku)
- Gemini 2.0 Flash
- OpenRouter (multi-model)

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & clients
│   │   └── hooks/           # Custom React hooks
│   └── backend/             # Python backend
│       └── src/
│           ├── agents/      # AI agent implementations
│           ├── api/         # FastAPI routes
│           ├── graphs/      # LangGraph workflows
│           ├── models/      # AI model clients
│           └── skills/      # SKILL.md parser
├── packages/
│   ├── shared/              # Shared TypeScript types
│   └── config/              # Shared configurations
├── skills/                  # SKILL.md orchestration files
├── supabase/                # Database migrations
└── scripts/                 # Setup & utility scripts
```

## Common Commands

### Development
```bash
# Start all services
pnpm dev

# Frontend only
pnpm dev --filter=web

# Backend only
cd apps/backend && uv run uvicorn src.api.main:app --reload
```

### Testing
```bash
# All tests
pnpm turbo run test

# Frontend tests
pnpm test --filter=web

# Backend tests
cd apps/backend && uv run pytest
```

### Building
```bash
# Build everything
pnpm build

# Type checking
pnpm turbo run type-check

# Linting
pnpm turbo run lint
```

## Code Conventions

### TypeScript/React
- Use functional components with hooks
- Prefer Server Components where possible
- Use `"use client"` directive only when necessary
- Follow shadcn/ui patterns for components
- Use Zod for form validation
- Prefer named exports over default exports

### Python
- Use type hints everywhere
- Follow PEP 8 style guidelines
- Use async/await for I/O operations
- Use Pydantic for data validation
- Keep functions small and focused

### File Naming
- React components: `PascalCase.tsx`
- Utilities/hooks: `kebab-case.ts`
- Python modules: `snake_case.py`
- SKILL files: `SCREAMING-KEBAB.md`

## SKILL.md System

The `/skills` directory contains markdown files that define agent behaviors:

```yaml
---
name: skill-name
version: "1.0"
triggers:
  - "keyword patterns"
priority: 1-10
---
```

Skills are loaded by the backend and used for routing and behavior definition.

### Key Skills
- `ORCHESTRATOR.md` - Master routing logic
- `core/VERIFICATION.md` - Verification-first approach
- `frontend/NEXTJS.md` - Next.js patterns
- `backend/LANGGRAPH.md` - LangGraph workflows

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Models (at least one required)
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
OPENROUTER_API_KEY=

# Backend
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=
```

## Database

### Migrations
```bash
# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

### Key Tables
- `profiles` - User profiles (extends auth.users)
- `conversations` - Chat conversations
- `messages` - Chat messages
- `documents` - Document storage with embeddings
- `agent_state` - LangGraph state persistence

## API Endpoints

### Frontend API Routes (`apps/web/app/api/`)
- `POST /api/chat` - Chat completions
- `GET /api/health` - Health check
- `POST /api/webhooks/supabase` - Supabase webhooks

### Backend API Routes (`apps/backend/src/api/`)
- `POST /api/v1/chat` - Agent chat endpoint
- `GET /api/v1/health` - Health check
- `POST /api/v1/webhooks` - External webhooks

## Component Patterns

### Using shadcn/ui
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
```

### Form Handling
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
```

### Authentication
```tsx
import { useAuth } from "@/hooks/use-auth"
const { user, signIn, signOut } = useAuth()
```

## Agent Development

### Creating a New Agent
1. Create agent class in `apps/backend/src/agents/`
2. Extend `BaseAgent` class
3. Register in `AgentRegistry`
4. Add corresponding SKILL.md file

### LangGraph Workflow
```python
from langgraph.graph import StateGraph
from src.graphs.state import AgentState

graph = StateGraph(AgentState)
graph.add_node("process", process_node)
graph.add_edge("process", END)
```

## Deployment

### Frontend (Vercel)
- Automatic deployment from `main` branch
- Root directory: `apps/web`
- Build command: `pnpm turbo run build --filter=web`

### Backend (DigitalOcean)
- Docker-based deployment
- Uses `apps/backend/Dockerfile`
- Requires `DO_APP_ID` secret

## Troubleshooting

### Common Issues

**pnpm install fails**
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

**Backend won't start**
```bash
cd apps/backend
uv sync --reinstall
```

**Supabase connection issues**
- Check `.env.local` has correct URLs
- Ensure `supabase start` is running for local dev

**Type errors after pulling**
```bash
pnpm turbo run type-check --force
```

## Foundation Patterns

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/server/errors';
import { FeatureService } from '@/server/services';
import { FeatureValidator } from '@/server/validators';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const validated = FeatureValidator.create.parse(body);
    const result = await FeatureService.create(validated);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Service Pattern
```typescript
import { FeatureRepository } from '@/server/repositories';
import { NotFoundError } from '@/server/errors';

export class FeatureService {
  static async getById(id: string): Promise<Feature> {
    const result = await FeatureRepository.findById(id);
    if (!result) {
      throw new NotFoundError('Feature', id);
    }
    return result;
  }
}
```

### Component Pattern (All States Required)
```typescript
export function FeatureList(): JSX.Element {
  const { data, isLoading, error } = useFeatures();

  if (isLoading) return <FeatureSkeleton />;
  if (error) return <FeatureError error={error} />;
  if (!data?.length) return <FeatureEmpty />;

  return <FeatureGrid items={data} />;
}
```

## Contributing

1. Create feature branch from `main`
2. Follow code conventions above
3. Add tests for new functionality
4. Run `pnpm turbo run lint type-check test`
5. Submit PR with clear description

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
