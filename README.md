<div align="center">

<!-- HERO BANNER -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/CleanExpo/NodeJS-Starter-V1/main/.github/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/CleanExpo/NodeJS-Starter-V1/main/.github/assets/banner-light.svg">
  <img alt="NodeJS-Starter-V1 Banner" src="https://raw.githubusercontent.com/CleanExpo/NodeJS-Starter-V1/main/.github/assets/banner-dark.svg" width="100%">
</picture>

<br/>

# NodeJS-Starter-V1

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-green.svg)](./CONTRIBUTING.md)

### Self-Contained AI Application Template

<p align="center">
  <strong>Build AI-powered applications without API keys, cloud accounts, or external dependencies</strong><br/>
  <em>Production-ready | Offline-first | Free forever</em>
</p>

<!-- TECH STACK BADGES -->

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

<!-- STATUS BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/No_API_Keys-Required-success?style=flat-square" alt="No API Keys"/>
  <img src="https://img.shields.io/badge/Offline-First-blue?style=flat-square" alt="Offline First"/>
  <img src="https://img.shields.io/badge/Setup-Under_10min-yellow?style=flat-square" alt="Quick Setup"/>
  <img src="https://img.shields.io/github/license/CleanExpo/NodeJS-Starter-V1?style=flat-square" alt="MIT License"/>
  <img src="https://img.shields.io/github/last-commit/CleanExpo/NodeJS-Starter-V1?style=flat-square" alt="Last Commit"/>
</p>

<!-- NAVIGATION -->
<p align="center">
  <a href="#-quick-start">Quick Start</a> |
  <a href="#-architecture">Architecture</a> |
  <a href="#-features">Features</a> |
  <a href="#-documentation">Docs</a> |
  <a href="#-development">Development</a>
</p>

---

### One-Command Setup

```bash
git clone https://github.com/CleanExpo/NodeJS-Starter-V1.git && cd NodeJS-Starter-V1 && pnpm run setup && pnpm dev
```

<sub>No API keys | No accounts | No configuration | Just works</sub>

### Upgrade an Existing Project

```bash
git remote add upstream https://github.com/CleanExpo/NodeJS-Starter-V1.git 2>/dev/null; git fetch upstream && git merge upstream/main --no-edit --allow-unrelated-histories && pnpm install && cd apps/backend && uv sync
```

<sub>Pulls the latest framework, agents, skills, and Anthropic integrations into your project</sub>

</div>

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Next.js 15)"]
        direction LR
        React["React 19"]
        RSC["Server Components"]
        TW["Tailwind v4"]
        Shadcn["shadcn/ui"]
    end

    subgraph Backend["Backend (FastAPI)"]
        direction LR
        API["REST API"]
        LG["LangGraph"]
        Agents["AI Agents"]
        Auth["JWT Auth"]
        SSE["SSE Stream"]
    end

    subgraph Data["Data Layer"]
        direction LR
        PG[("PostgreSQL 15\n+ pgvector")]
        Redis[("Redis 7\nCache")]
        Supabase[("Supabase\nState (opt)")]
    end

    subgraph AI["AI Provider Layer"]
        direction LR
        Ollama["Ollama\n(Local/Free)"]
        Claude["Claude API\n(Cloud/Paid)"]
    end

    Frontend -->|"REST + JWT"| Backend
    Frontend <-->|"SSE tokens"| SSE
    Backend -->|"SQLAlchemy"| Data
    Backend -->|"Provider Selector"| AI

    style Frontend fill:#0070f3,color:#fff
    style Backend fill:#009688,color:#fff
    style Data fill:#4169E1,color:#fff
    style AI fill:#8b5cf6,color:#fff
```

<details>
<summary><strong>View Data Flow Diagram</strong></summary>

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as AI Agent
    participant DB as PostgreSQL
    participant SB as Supabase

    U->>F: Request
    F->>B: API Call (JWT)
    B->>DB: Query Data
    DB-->>B: Results
    B->>A: Process with AI

    alt Streaming Mode
        A-->>F: SSE text_delta events
        F-->>U: Real-time tokens
    else Standard Mode
        A-->>B: AI Response
        B-->>F: JSON Response
        F-->>U: Rendered UI
    end

    opt Supabase configured
        B->>SB: Persist agent run
        SB-->>B: Confirmed
    end
```

</details>

---

## Getting Started

The quickest way to get up and running is with Docker Compose, which handles PostgreSQL, Redis, and all supporting services:

```bash
git clone https://github.com/CleanExpo/NodeJS-Starter-V1.git
cd NodeJS-Starter-V1
docker compose up -d        # Start PostgreSQL + Redis
pnpm install && pnpm dev    # Install deps and start dev servers
```

See the detailed Quick Start below for full prerequisites and verification steps.

---

## Quick Start

<details open>
<summary><strong>Prerequisites</strong></summary>

| Tool    | Version | Download                         |
| ------- | ------- | -------------------------------- |
| Docker  | Latest  | [docker.com](https://docker.com) |
| Node.js | 20+     | [nodejs.org](https://nodejs.org) |
| Python  | 3.12+   | [python.org](https://python.org) |
| pnpm    | 9+      | `npm i -g pnpm`                  |
| Ollama  | Latest  | [ollama.com](https://ollama.com) |

</details>

<details open>
<summary><strong>Installation</strong></summary>

```bash
# 1. Clone repository
git clone https://github.com/CleanExpo/NodeJS-Starter-V1.git
cd NodeJS-Starter-V1

# 2. Run automated setup
pnpm run setup              # macOS/Linux
pnpm run setup:windows      # Windows

# 3. Start development
pnpm dev
```

</details>

<details>
<summary><strong>Verify Installation</strong></summary>

```bash
pnpm run verify
```

| Service     | URL                    | Status  |
| ----------- | ---------------------- | ------- |
| Frontend    | http://localhost:3000  | Running |
| Backend API | http://localhost:8000  | Running |
| PostgreSQL  | localhost:5432         | Running |
| Redis       | localhost:6379         | Running |
| Ollama      | http://localhost:11434 | Running |

**Default Login:** `admin@local.dev` / `admin123`

</details>

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Frontend

- **Next.js 15** with App Router
- **React 19** Server Components
- **Tailwind CSS v4** + design tokens
- **shadcn/ui** component library
- **TypeScript** strict mode
- **Vitest** + Playwright testing

</td>
<td width="50%" valign="top">

### Backend

- **FastAPI** async Python + ASGI middleware
- **LangGraph** agent orchestration
- **SQLAlchemy 2.0** ORM
- **JWT** ASGI auth middleware (HS256)
- **Supabase** optional state backend
- **SSE Streaming** real-time token delivery
- **Pytest** 343+ tests passing

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Database

- **PostgreSQL 15** in Docker
- **pgvector** for embeddings
- **Alembic** migrations
- Full-text search ready
- Auto-seeded test data

</td>
<td width="50%" valign="top">

### AI Integration

- **Ollama** (local, free — no API key)
- **Claude API** (cloud, optional)
- Provider abstraction layer
- **Adaptive Thinking** (Opus/Sonnet 4.6)
- **Web Search v2** (GA Feb 2026)
- **Token Counting** pre-flight cost estimation
- **Agent Skills** Excel/Word/PDF (beta)
- **MCP Connector** remote servers (beta)
- RAG with vector search

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Agent Infrastructure

- **Multi-Agent Architecture** hierarchical workflow
- **Beads** git-backed task memory
- **Claude Code Hooks** automation
- **Vault Index System** O(1) wiki-link lookup
- **Linear Integration** project tracking
- **Quality Gates** verification system

</td>
<td width="50%" valign="top">

### Design System

- **Scientific Luxury** tier UI
- OLED black backgrounds
- Spectral colour system
- Physics-based animations
- Design tokens configuration

</td>
</tr>
</table>

---

## Project Structure

```
NodeJS-Starter-V1/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   └── lib/api/            # API client
│   └── backend/                # FastAPI backend
│       └── src/
│           ├── agents/         # AI agents (LangGraph)
│           ├── api/            # REST endpoints + SSE
│           ├── auth/           # JWT authentication
│           ├── models/         # AI providers (Anthropic, Ollama)
│           └── state/          # State store (NullStore / Supabase)
├── .beads/                     # AI agent memory (Beads)
├── .claude/                    # Claude Code config & hooks
│   ├── hooks/scripts/          # Automation scripts
│   └── rules/                  # Agent rules
├── .skills/                    # Agent skills (70 installed)
│   └── custom/
│       ├── anthropic-features/ # Anthropic API capability reference
│       ├── anthropic-streaming/# SSE streaming patterns
│       └── anthropic-web-search/ # Web Search v2 integration
├── .claude/
│   ├── VAULT-INDEX.md          # Wiki-link master index
│   ├── schemas/                # Frontmatter schema
│   └── hooks/scripts/          # Claude Code automation
├── docs/                       # Documentation
│   ├── MULTI_AGENT_ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   └── BEADS.md
├── scripts/                    # Setup & utility scripts
└── .github/workflows/          # CI/CD pipelines
```

---

## Claude Code Integration

This starter includes full Claude Code (CLI) integration with hooks, agents, and skills.

<details>
<summary><strong>Vault Index System</strong></summary>

Obsidian-style wiki-linking for O(1) discovery of agents, skills, rules, and commands.

```bash
# Regenerate indexes after adding new files
pnpm vault:index

# Check for broken wiki-links
pnpm vault:validate

# Add frontmatter to existing .md files
pnpm vault:adopt

# Full initialisation (for downstream projects)
/vault-init
```

**Wiki-Link Syntax**:
- `[[skill-name]]` — lookup by ID
- `[[agent/frontend-specialist]]` — direct path
- `[[scientific-luxury#banned-elements]]` — section anchor
- `[[scientific-luxury|Design System]]` — custom text

</details>

<details>
<summary><strong>Claude Code Commands</strong></summary>

```bash
/vault-init           # Initialise vault system
/verify               # Run verification checks
/audit                # Framework audit
/new-feature          # Guided feature development
/minion <task>        # One-shot task execution
/skill-manager        # Analyse skill gaps
```

</details>

---

## Development

<details>
<summary><strong>Common Commands</strong></summary>

```bash
# Start all services
pnpm dev

# Run tests
pnpm turbo run test

# Type check
pnpm turbo run type-check

# Lint
pnpm turbo run lint

# Docker management
pnpm run docker:up          # Start services
pnpm run docker:down        # Stop services
pnpm run docker:reset       # Reset database

# Vault management
pnpm vault:index            # Regenerate wiki-link indexes
pnpm vault:validate         # Check for broken links
```

</details>

<details>
<summary><strong>Backend Commands</strong></summary>

```bash
cd apps/backend

# Run server
uv run uvicorn src.api.main:app --reload

# Run tests
uv run pytest --cov

# Type check
uv run mypy src/

# Lint
uv run ruff check src/
```

</details>

<details>
<summary><strong>Frontend Commands</strong></summary>

```bash
# Unit tests
pnpm test --filter=web

# E2E tests
pnpm test:e2e --filter=web

# Type check
pnpm type-check --filter=web
```

</details>

---

## AI Configuration

<details>
<summary><strong>Local AI (Default - FREE)</strong></summary>

```bash
# Default configuration (no changes needed)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

| Model            | Size  | Use Case      |
| ---------------- | ----- | ------------- |
| llama3.1:8b      | 4.7GB | General tasks |
| nomic-embed-text | 274MB | Embeddings    |

</details>

<details>
<summary><strong>Cloud AI — Claude API (Optional)</strong></summary>

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
```

| Model             | Input | Output | Capabilities                           |
| ----------------- | ----- | ------ | -------------------------------------- |
| Claude Opus 4.6   | $5/1M | $25/1M | Adaptive thinking, Fast Mode, 128K out |
| Claude Sonnet 4.6 | $3/1M | $15/1M | Adaptive thinking, web search, 64K out |
| Claude Haiku 4.5  | $1/1M | $5/1M  | Fastest — high-throughput tasks        |

> All models support: SSE streaming, token counting, prompt caching, structured outputs, code execution.

</details>

<details>
<summary><strong>Anthropic Feature Flags (Optional)</strong></summary>

Add to `apps/backend/.env.local` to enable advanced Anthropic API capabilities:

```bash
# Streaming (default: on)
STREAMING_ENABLED=true

# Adaptive Thinking — Opus 4.6 / Sonnet 4.6 only
THINKING_ENABLED=false
THINKING_BUDGET_TOKENS=10000

# Fast Mode — Opus 4.6 only, 2.5× faster output (research preview)
FAST_MODE_ENABLED=false

# Web Search Tool v2 — GA Feb 2026
WEB_SEARCH_ENABLED=false
WEB_SEARCH_MAX_USES=5

# Token safety guard
TOKEN_COUNT_WARNING_THRESHOLD=50000

# Agent Skills beta — Anthropic-managed Excel/Word/PDF processing
AGENT_SKILLS_ENABLED=false

# MCP Connector beta — connect remote MCP servers in the messages API
MCP_CONNECTOR_ENABLED=false

# VOICE_MODE: NOT available via Anthropic API.
# Voice is only in Claude.ai consumer app and Claude Code CLI.
```

> See `.skills/custom/anthropic-features/SKILL.md` for the full capability matrix.

</details>

<details>
<summary><strong>Supabase State Backend (Optional)</strong></summary>

Without Supabase, the app uses `NullStateStore` — all functionality works, state is ephemeral.
Add these vars to get persistent `conversations`, `tasks`, and `agent_runs` tables:

```bash
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Only needed for admin ops

# Share the Supabase JWT secret so Supabase-issued user JWTs pass auth:
JWT_SECRET_KEY=<supabase-jwt-secret>
```

Get these from your [Supabase dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api).

The app automatically detects the credentials at startup and switches to `SupabaseStateStore`. If credentials are absent or the connection fails, it falls back to `NullStateStore` silently.

</details>

---

## Documentation

| Guide                                                         | Description                  |
| ------------------------------------------------------------- | ---------------------------- |
| [Quick Start](docs/guides/QUICK_START.md)                     | Get running in 10 minutes    |
| [Local Setup](docs/LOCAL_SETUP.md)                            | Complete setup guide         |
| [AI Providers](docs/AI_PROVIDERS.md)                          | Ollama vs Claude comparison  |
| [Multi-Agent Architecture](docs/MULTI_AGENT_ARCHITECTURE.md)  | Agent workflow specification |
| [Design System](docs/DESIGN_SYSTEM.md)                        | Scientific Luxury UI system  |
| [Beads](docs/BEADS.md)                                        | AI agent memory system       |
| [Vault Index System](docs/VAULT_INDEX_SYSTEM.md)              | Wiki-link O(1) lookup        |
| [Testing Guide](docs/guides/TESTING_GUIDE.md)                 | Testing strategies           |
| [CI/CD Guide](docs/guides/CI_CD_GUIDE.md)                     | Pipeline configuration       |
| [Production Deployment](docs/guides/PRODUCTION-DEPLOYMENT.md) | Deployment options           |

### Anthropic API Skills

| Skill                                                        | Description                                   |
| ------------------------------------------------------------ | --------------------------------------------- |
| [anthropic-features](.skills/custom/anthropic-features/)     | Full capability matrix — models, flags, betas |
| [anthropic-streaming](.skills/custom/anthropic-streaming/)   | SSE streaming patterns for this project       |
| [anthropic-web-search](.skills/custom/anthropic-web-search/) | Web Search v2 integration guide               |

### Framework Documentation

- [Next.js](https://nextjs.org/docs) | [FastAPI](https://fastapi.tiangolo.com/) | [LangGraph](https://langchain-ai.github.io/langgraph/) | [Ollama](https://ollama.com/) | [shadcn/ui](https://ui.shadcn.com/) | [Anthropic API](https://platform.claude.com/docs/en/home)

---

## Troubleshooting

<details>
<summary><strong>Ollama not running</strong></summary>

```bash
# Install and start Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b
ollama pull nomic-embed-text
ollama serve
```

</details>

<details>
<summary><strong>Database connection errors</strong></summary>

```bash
docker compose down
docker compose up -d
docker compose logs postgres
```

</details>

<details>
<summary><strong>Port conflicts</strong></summary>

```bash
# Check ports
lsof -i :3000   # Frontend
lsof -i :8000   # Backend
lsof -i :5432   # PostgreSQL
```

</details>

<details>
<summary><strong>Dependency issues</strong></summary>

```bash
rm -rf node_modules apps/*/node_modules
pnpm store prune
pnpm install
```

</details>

<details>
<summary><strong>401 errors in backend tests</strong></summary>

All backend tests use real HS256 JWTs — the `AuthMiddleware` is ASGI-layer and cannot be overridden by FastAPI `dependency_overrides`. Tests generate tokens via:

```python
from src.auth.jwt import create_access_token
from datetime import timedelta

AUTH_HEADERS = {
    "Authorization": f"Bearer {create_access_token({'sub': 'test@example.com'}, timedelta(hours=24))}"
}
```

</details>

---

## Contributing

Contributions welcome! Please:

- Keep it self-contained (no required external services)
- Maintain offline-first capability
- Include tests for new features
- Update documentation

---

## Community

- [Licence (MIT)](./LICENSE)
- [Security Policy](./SECURITY.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## Licence

MIT Licence — Use freely for any purpose.

---

<div align="center">

**[Quick Start](#-quick-start)** | **[Documentation](#-documentation)** | **[Issues](https://github.com/CleanExpo/NodeJS-Starter-V1/issues)**

<sub>Built with care for developers who want to build AI apps without barriers</sub>

<sub>Last Updated: 20/03/2026</sub>

</div>
