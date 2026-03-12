# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-13

### Added

- Monorepo architecture (Next.js 16 + FastAPI + PostgreSQL 15 + Redis 7)
- JWT authentication with Supabase PKCE
- 12 API routers (agents, chat, webhooks, PRD, workflows, RAG, analytics, contractors, search, documents, health, jobs)
- 516 test files with coverage thresholds
- CI/CD pipeline with GitHub Actions
- Security scanning (CodeQL, dependency audit)
- Multi-agent coordination harness (8-phase convergence loop)
- Rate limiting and auth middleware
- Docker Compose for local development (PostgreSQL + Redis)
- Outcome translation and blueprint-first architecture
