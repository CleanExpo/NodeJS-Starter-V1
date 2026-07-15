# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-13

### Added

- Monorepo architecture (Next.js 15 + FastAPI + PostgreSQL 15 + Redis 7)
- JWT authentication with Supabase PKCE
- 12 API routers (agents, chat, webhooks, PRD, workflows, RAG, analytics, contractors, search, documents, health, jobs)
- Frontend Vitest + Playwright suites and a backend pytest suite (430+ test functions) with coverage thresholds
- CI/CD pipeline with GitHub Actions
- Security scanning (Snyk, Trivy, dependency audit)
- Multi-agent coordination harness (8-phase convergence loop)
- Rate limiting and auth middleware
- Docker Compose for local development (PostgreSQL + Redis)
- Outcome translation and blueprint-first architecture

## [1.0.1] - 2026-03-14

### Changed

- Supabase state store now properly initializes when credentials are available
- Adaptive thinking now respects `THINKING_ENABLED` environment variable
- Added `SUPABASE_JWT_SECRET` field to enable shared authentication between app and Supabase
