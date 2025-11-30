<div align="center">

# 🤖 Claude Code Agent Orchestration System

### Production-ready monorepo for AI-powered applications

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

<p align="center">
  <strong>Build intelligent applications with Claude, LangGraph, and modern web technologies</strong>
</p>

[Getting Started](#-getting-started) •
[Features](#-features) •
[Architecture](#-architecture) •
[Documentation](#-documentation) •
[Deployment](#-deployment)

</div>

---

## ✨ Features

<table>
<tr>
<td>

### 🎨 Frontend
- **Next.js 15** with App Router
- **React 19** with Server Components
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- Full **TypeScript** support
- Responsive & accessible design

</td>
<td>

### ⚡ Backend
- **FastAPI** for high-performance APIs
- **LangGraph** agent orchestration
- Multi-model AI support
- Async-first architecture
- Structured logging
- Rate limiting & auth middleware

</td>
</tr>
<tr>
<td>

### 🗄️ Database
- **Supabase** (PostgreSQL)
- **pgvector** for embeddings
- Row Level Security (RLS)
- Real-time subscriptions
- Built-in authentication
- Migration system

</td>
<td>

### 🤖 AI Integration
- **Claude 4.5** (Opus/Sonnet/Haiku)
- **Gemini 2.0** Flash
- **OpenRouter** multi-model
- MCP tool integrations
- SKILL.md orchestration
- Verification-first approach

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `npm install -g pnpm` |
| Python | 3.12+ | [python.org](https://python.org/) |
| uv | Latest | `pip install uv` |
| Supabase CLI | Latest | `npm install -g supabase` |

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/CleanExpo/NodeJS-Starter-V1.git
cd NodeJS-Starter-V1

# 2. Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Configure your environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start development
pnpm dev
```

<details>
<summary>📦 Manual Installation</summary>

```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
cd apps/backend
uv sync
cd ../..

# Start Supabase (optional)
supabase start

# Start development servers
pnpm dev
```

</details>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js 15 │  │   React 19  │  │   Tailwind + shadcn/ui  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         └────────────────┼──────────────────────┘               │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │ API Calls
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼                                       │
│                       BACKEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   FastAPI   │──│  LangGraph  │──│   Agent Orchestrator    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌────────────▼────────────┐  │
│  │  AI Models  │  │  MCP Tools  │  │      SKILL.md Files     │  │
│  │ Claude/Gemini│ │ Exa/Playwright│ │   (Agent Behaviors)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼                                       │
│                       DATABASE                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Supabase                                ││
│  │  PostgreSQL  │  pgvector  │  Auth  │  Real-time  │  Storage ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
📦 NodeJS-Starter-V1
├── 📂 .github/workflows      # CI/CD pipelines
├── 📂 .vscode                # VS Code configuration
├── 📂 apps
│   ├── 📂 web                # Next.js frontend
│   │   ├── 📂 app            # App router pages
│   │   ├── 📂 components     # React components
│   │   ├── 📂 lib            # Utilities & clients
│   │   └── 📂 hooks          # Custom React hooks
│   └── 📂 backend            # Python backend
│       ├── 📂 src
│       │   ├── 📂 agents     # AI agent implementations
│       │   ├── 📂 api        # FastAPI routes
│       │   ├── 📂 graphs     # LangGraph workflows
│       │   ├── 📂 models     # AI model clients
│       │   └── 📂 skills     # SKILL.md parser
│       └── 📂 tests          # Pytest tests
├── 📂 packages
│   ├── 📂 shared             # Shared TypeScript types
│   └── 📂 config             # Shared configurations
├── 📂 skills                 # SKILL.md orchestration files
├── 📂 supabase               # Database migrations
└── 📂 scripts                # Setup & utility scripts
```

---

## 🔧 Development

<table>
<tr>
<th>Frontend</th>
<th>Backend</th>
</tr>
<tr>
<td>

```bash
# Development
pnpm dev --filter=web

# Build
pnpm build --filter=web

# Lint
pnpm lint --filter=web

# Type check
pnpm type-check --filter=web

# Test
pnpm test --filter=web
```

</td>
<td>

```bash
cd apps/backend

# Development
uv run uvicorn src.api.main:app --reload

# Test
uv run pytest

# Type check
uv run mypy src/

# Lint
uv run ruff check src/
```

</td>
</tr>
</table>

### Full Stack Commands

```bash
# Start all services
./scripts/dev.sh

# Build everything
pnpm build

# Run all checks
pnpm turbo run lint type-check test
```

---

## 🤖 AI Models

| Provider | Model | Identifier | Best For |
|----------|-------|------------|----------|
| Anthropic | Claude Opus 4.5 | `claude-opus-4-5-20251101` | Complex reasoning |
| Anthropic | Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | Balanced tasks |
| Anthropic | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Fast responses |
| Google | Gemini 2.0 Flash | `gemini-2.0-flash-exp` | Speed & efficiency |
| OpenRouter | Various | Multiple | Model flexibility |

---

## 📖 SKILL.md Orchestration

The `/skills` directory defines agent behaviors using markdown files:

```
skills/
├── ORCHESTRATOR.md           # Master routing logic
├── core/
│   ├── VERIFICATION.md       # Verification-first approach
│   ├── ERROR-HANDLING.md     # Error patterns
│   └── CODING-STANDARDS.md   # Code quality rules
├── frontend/
│   ├── NEXTJS.md             # Next.js patterns
│   ├── TAILWIND.md           # Tailwind CSS patterns
│   └── COMPONENTS.md         # Component guidelines
├── backend/
│   ├── LANGGRAPH.md          # LangGraph workflows
│   ├── FASTAPI.md            # FastAPI patterns
│   └── AGENTS.md             # Agent building
└── database/
    ├── SUPABASE.md           # Supabase patterns
    └── MIGRATIONS.md         # Migration guidelines
```

---

## ⚙️ Environment Variables

Create `.env.local` from `.env.example`:

```env
# 🔐 Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 🤖 AI Models
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...
OPENROUTER_API_KEY=sk-or-...

# 🔧 MCP Tools
EXA_API_KEY=...

# 🔗 Backend
BACKEND_URL=http://localhost:8000
BACKEND_API_KEY=your-secret-key
```

---

## 🚢 Deployment

<table>
<tr>
<th width="33%">Frontend</th>
<th width="33%">Backend</th>
<th width="33%">Database</th>
</tr>
<tr>
<td>

**Vercel**

1. Import from GitHub
2. Set root: `apps/web`
3. Add environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

</td>
<td>

**DigitalOcean**

1. Create App Platform app
2. Connect GitHub repo
3. Set Dockerfile path
4. Configure secrets

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps)

</td>
<td>

**Supabase**

1. Create project
2. Get connection string
3. Run migrations:
```bash
supabase db push
```

</td>
</tr>
</table>

---

## 🧪 Testing

```bash
# Run all tests
pnpm turbo run test

# Frontend tests with coverage
pnpm test --filter=web -- --coverage

# Backend tests with coverage
cd apps/backend && uv run pytest --cov

# E2E tests (if configured)
pnpm test:e2e
```

---

## 📚 Documentation

| Resource | Description |
|----------|-------------|
| [Next.js Docs](https://nextjs.org/docs) | Frontend framework |
| [FastAPI Docs](https://fastapi.tiangolo.com/) | Backend framework |
| [LangGraph Docs](https://langchain-ai.github.io/langgraph/) | Agent orchestration |
| [Supabase Docs](https://supabase.com/docs) | Database & auth |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [Tailwind CSS](https://tailwindcss.com/docs) | Styling |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code:
- Passes all linting and type checks
- Includes appropriate tests
- Follows the existing code style

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Built with ❤️ using Claude Code

[![Claude](https://img.shields.io/badge/Powered%20by-Claude-blueviolet?style=for-the-badge)](https://anthropic.com/)

**[⬆ Back to Top](#-claude-code-agent-orchestration-system)**

</div>
