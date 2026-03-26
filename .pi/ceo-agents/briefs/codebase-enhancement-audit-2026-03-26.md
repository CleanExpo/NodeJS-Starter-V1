# Brief: Codebase-Wide Enhancement & Update Audit

**Date Submitted:** 26/03/2026
**Submitted By:** Project Owner
**Decision Needed By:** 02/04/2026
**Board Topic:** Technical

---

## Situation

NodeJS-Starter-V1 has reached approximately 85% maturity following a concentrated build phase. The framework is a monorepo combining Next.js 15 (apps/web/) with FastAPI/LangGraph (apps/backend/) and PostgreSQL, designed as a self-contained AI starter template where everything runs locally in Docker.

Recent work includes a Capability Uplift overhaul (4 new uplift skills, 3 agent transforms, 13 skill retrofits with reference asset directories), sprint contract system (Phase 3.5 in the agent harness), QA calibration with few-shot examples across all 5 rubrics, and safety commands (/freeze, /retro, /office-hours, /harness-review).

The framework now has 29 pages, 99 React components, 16 API route modules, 24 agents (19 active, 5 stubs), 87 skills (all with context:fork), and 35 CLI commands. The CEO Board deliberation system is fully operational with 9 members and persistent expertise.

We need the Board to audit the entire codebase and identify enhancements and updates that should be prioritised for the next development phase. This is not about fixing bugs — it is about systematic strengthening, identifying where technical debt is accruing, and surfacing architectural decisions that may constrain future development.

---

## Stakes

**Downside if we audit poorly:**
- Miss critical technical debt that compounds into maintenance nightmares
- Prioritise cosmetic enhancements over foundational improvements
- Fail to identify architectural patterns that limit scalability or adoption
- Waste an entire sprint on low-impact work
- Ship a framework that looks complete but has hidden structural weaknesses

**Upside if we audit well:**
- Clear enhancement roadmap prioritised by compound impact
- Quick wins identified that unblock multiple downstream improvements
- Architectural constraints surfaced before they become expensive to fix
- Reusable audit framework for ongoing quality assessment
- Framework positioned as category-defining rather than merely functional

---

## Constraints

- All enhancements must respect existing architecture — no rewrites
- en-AU locale, Scientific Luxury design system (OLED Black #050505, spectral colours, rounded-sm, Framer Motion)
- Must not break existing 87 skills, 24 agents, or 35 commands
- Enhancements should be independently deliverable (no Big Bang changes)
- Budget: realistic for a small team over 2-4 week sprint cycles
- Stack: Next.js 15, React 19, Tailwind v4, FastAPI, SQLAlchemy 2.0, PostgreSQL

---

## Key Questions for the Board

1. **Technical Architect**: What architectural patterns in the current codebase are constraining future development? Where is technical debt compounding fastest? What would you refactor first?

2. **Contrarian**: What is the biggest technical risk we are sleeping on? What assumption in our architecture is most likely wrong? Which of our recent additions (Capability Uplift, sprint contracts) might actually be adding complexity without proportional value?

3. **Compounder**: Which enhancements would compound in value over 6-12 months? What foundational improvements unlock the most future work? Where should we invest now for asymmetric returns later?

4. **Revenue**: Which enhancements most directly improve the framework's adoption value for downstream projects? What would make a developer choose this over competing starters?

5. **Product Strategist**: What is the onboarding experience gap? If a new developer cloned this repo today, where would they get stuck? What user pain points remain?

6. **Moonshot**: What 10x improvement is possible that we are not seeing because we are thinking incrementally? What would make this framework category-defining?

---

## Background & Supporting Context

### Frontend Metrics (apps/web/)
- 29 pages across auth, dashboard, nutrition, agents, workflows, PRD, tasks, chat
- 99 React components (UI primitives, layout, forms, data display, business logic)
- 8 test files / 46 TSX files = **17% test coverage** (unit tests only, 0 E2E)
- Playwright configured but unused — 0 end-to-end tests in production
- Nutrition module: 7 pages, 12 API routes, feature-rich but untested end-to-end
- Workflow builder: visual design + execution (core complete, edge cases incomplete)
- Form validation: Zod schemas defined but inconsistently applied across forms

### Backend Metrics (apps/backend/)
- 16 API route modules, 122 Python files
- 3,525 LOC in agent infrastructure (orchestrator, router, context manager, subagent manager)
- 27 test files with 40% coverage threshold enforced
- PRD system: 6 specialised agents (orchestrator, analysis, tech spec, test gen, feature decomposer, roadmap)
- Authentication: JWT-based with refresh tokens, middleware applied
- Streaming: SSE for chat and agent execution

### Agent & Skills Framework
- 24 agents (19 active, 5 stubs: deploy-guardian, performance-optimizer, refactor-specialist remain unimplemented)
- 87 skills with Capability Uplift directory standard (references/ + assets/ on 13 output-shaping skills)
- 8-phase convergence loop with Phase 3.5 sprint contracts (newly added)
- 5 rubrics with few-shot calibration and quantified thresholds
- Agent expertise files exist but are not auto-updated post-deliberation

### Known Gaps (from codebase audit)
1. **E2E test coverage**: 0 tests despite Playwright being configured
2. **API documentation**: ROUTE_REFERENCE.md exists but is incomplete for 16 route modules
3. **Form validation**: Zod schemas inconsistently applied — some forms lack real-time feedback
4. **Error monitoring**: No Sentry/APM configured for production observability
5. **Workflow engine**: Error handling and transaction rollback incomplete
6. **Stub agents**: 5 agents remain as framework placeholders
7. **CEO Board learning loop**: Expertise files not auto-updated after deliberations
8. **Design system enforcement**: Rules documented but not enforced in the build pipeline (no ESLint rule for spectral colours)

### Recent Commits (Last 16)
- Sprint contract system + QA calibration + safety commands
- context:fork added to all 87 SKILL.md files
- 4 Capability Uplift skills registered + priority positions
- Retrofit: design, infrastructure, process domain skills with references/assets
- 4 new uplift skills: document-formatting, data-visualisation, diagram, code-output
- Agent transforms: frontend-specialist enhanced, docs-writer + code-reviewer implemented
- Golden example: document-formatting-uplift
- Merged 77 commits from origin/main

---

## Proposed Options

### Option A: Depth-First Audit
Focus on the 3 most critical systems (agent infrastructure, frontend pages, API routes) and go deep — architecture review, performance profiling, security audit, test coverage analysis.
- **Pros**: Thorough findings on critical systems
- **Cons**: Misses peripheral systems, slower

### Option B: Breadth-First Audit
Scan all systems at medium depth — identify the top 3 issues in each subsystem, rank globally by impact.
- **Pros**: Complete picture, finds cross-cutting concerns
- **Cons**: May miss deep architectural issues in critical systems

### Option C: Impact-Weighted Audit (Recommended)
Audit all systems but weight attention by adoption impact — prioritise enhancements that make the framework more valuable to downstream projects. Deep dive on onboarding experience, developer ergonomics, and production readiness.
- **Pros**: Directly tied to framework value proposition, balanced depth/breadth
- **Cons**: Requires clear definition of "adoption value"

---

**Note to the Board**: I want specific, actionable enhancement recommendations — not generic advice like "improve testing." Each recommendation should name specific files, modules, or patterns and estimate effort (days, not weeks). The Contrarian should specifically challenge whether any of our recent additions (87 skills, 35 commands, 5 rubrics) represent over-engineering.

**End of Brief**
