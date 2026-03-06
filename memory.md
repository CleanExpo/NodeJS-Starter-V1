# memory.md — NodeJS-Starter-V1 Operational Constitution

> Version: 1.0.0 | Last Updated: 06/03/2026 | Authority: Permanent
> Load this file BEFORE any planning, delegation, execution, or completion claim.

---

## 1. Founder Communication Model

When a founder/user speaks in outcome language, translate it before acting.

| Phrase                  | Engineering Meaning                                     | Required Output           |
| ----------------------- | ------------------------------------------------------- | ------------------------- |
| "Finished"              | All production readiness gates passed with proof        | OUTCOME TRANSLATION block |
| "Ready"                 | All gates passed + monitoring + rollback path           | OUTCOME TRANSLATION block |
| "Launch it" / "Ship it" | Production deployed + DNS confirmed + health check      | OUTCOME TRANSLATION block |
| "Make it work"          | Root cause identified + fix applied + regression check  | OUTCOME TRANSLATION block |
| "Production ready"      | Full production checklist verified with artifacts       | OUTCOME TRANSLATION block |
| "Ready for clients"     | User journey verified + legal pages + support reachable | OUTCOME TRANSLATION block |
| "Done"                  | All acceptance criteria met with proof                  | OUTCOME TRANSLATION block |
| "Go live"               | Production deployment + monitoring active               | OUTCOME TRANSLATION block |
| "Just make it work"     | Root-cause analysis + fix + verification                | OUTCOME TRANSLATION block |

**Translation produces:**

1. Definition of Done — measurable criteria, not feelings
2. Gap Analysis — Proven / Unknown / Missing for each criterion
3. Gated Execution Plan — phases with verification gates and rollback paths
4. Proof Required — specific artifacts before completion can be claimed

---

## 2. Definition of Finished

Default meaning: **production-ready SaaS** with ALL of the following verified:

### Frontend

- [ ] Production URL responds with HTTP 200
- [ ] All primary pages load without console errors
- [ ] Auth flows work (register, login, logout, protected routes)
- [ ] No critical 404 errors on any linked asset
- [ ] Responsive layout verified on mobile and desktop
- [ ] All user-facing copy is correct and finalised
- [ ] Visual quality meets Scientific Luxury standard (no factory defaults)

### Backend

- [ ] All API endpoints respond within acceptable latency
- [ ] Health check endpoint returns 200
- [ ] Authentication middleware is active and rejecting invalid tokens
- [ ] No unhandled exceptions in production logs
- [ ] Database migrations are applied

### Data & Security

- [ ] Production database seeded with required reference data
- [ ] No development/test data in production
- [ ] Backup schedule is configured
- [ ] Environment variables set (no .env in production git)
- [ ] CORS restricted to production domain
- [ ] JWT secret rotated from default
- [ ] Rate limiting active on auth endpoints

### Payments (if applicable)

- [ ] Payment provider in live mode (not test mode)
- [ ] Webhook endpoint configured and verified
- [ ] At least one successful test transaction confirmed
- [ ] Refund flow tested

### Integrations

- [ ] All third-party API keys are production keys (not dev/sandbox)
- [ ] Webhook deliveries confirmed in provider dashboard
- [ ] Email delivery verified (not landing in spam)

### Deployment

- [ ] CI/CD pipeline is green
- [ ] Deployment rollback path documented and tested
- [ ] SSL certificate is valid and auto-renewing
- [ ] Domain DNS is pointing to production infrastructure

### Business Readiness

- [ ] Support contact method is live
- [ ] Privacy policy and terms of service are published
- [ ] Analytics tracking is active
- [ ] Error monitoring (e.g. Sentry) is configured

### Visual Quality

- [ ] No grey/white backgrounds (OLED Black #050505 required)
- [ ] No rounded-lg/rounded-full (rounded-sm only)
- [ ] Animations use Framer Motion only
- [ ] Fonts: JetBrains Mono (data), Editorial (names)
- [ ] Screenshot proof of actual rendered UI provided

### Proof Artifacts Required

- [ ] Screenshot of production homepage (HTTP 200)
- [ ] Screenshot of successful login
- [ ] Test suite output showing all passing
- [ ] CI/CD pipeline screenshot showing green

---

## 3. Agent Hierarchy

```
Senior PM Agent (Layer 1)
  └─ Translate outcome language → Definition of Done → Proof artifacts
  └─ Skills: outcome-translator, definition-of-done-builder, delegation-planner

Senior Orchestrator Agent (Layer 2)
  └─ Coordinate specialists → Enforce dependency order → Collect evidence → Block false completion
  └─ Context budget: < 80K tokens
  └─ Skills: delegation-planner, evidence-verifier, finished-audit, blueprint-first

Senior Specialist Agents (Layer 3)
  └─ Senior Engineering Agent — code, API, database, auth, migrations
  └─ Senior UI/UX Agent — frontend, design system, animation
  └─ Senior QA / Production Agent — test coverage, CI/CD, deployment
  └─ Senior Research Agent — external sources, technology evaluation
  └─ Senior LMS Content Agent — content pipelines, educational modules
  └─ Senior Growth / Marketing Agent — SEO, GEO, analytics

Sub-Agents (Layer 4)
  └─ Isolated file edits, targeted searches, evidence collection
  └─ Must return: evidence, files, logs, screenshots — NOT vague summaries
```

**Routing rules:**

- Outcome language / stakeholder comms → Layer 1 (Senior PM)
- Multi-agent coordination / phase gating → Layer 2 (Orchestrator)
- Domain implementation → Layer 3 (Specialist by domain)
- Isolated file edits / targeted searches → Layer 4 (Sub-Agent)

---

## 4. Skill Architecture

**Maximum 6–8 skills per agent.** Loading more degrades signal quality (Shannon Information Theory).

### Skill Schema

Every skill must define:

- `name` — unique identifier
- `purpose` — one sentence
- `type` — `Capability Uplift` | `Encoded Preference Workflow`
- `triggers` — exact phrases that activate it
- `inputs` — what the skill needs
- `steps` — numbered procedure
- `validation gates` — checks before output
- `output format` — exact structure
- `failure modes` — what breaks it and how to recover
- `eval examples` — good and bad examples

### Skill Loading Order

1. Process skills first (brainstorming, debugging, delegation-planner)
2. Implementation skills second (frontend-design, backend patterns)
3. Never load a skill you don't need — token budget is finite

---

## 5. Blueprint First Protocol

Before writing any code for UI, dashboards, landing pages, architecture, or database schemas:

```
Step 1: GENERATE → ASCII blueprint (no code)
Step 2: ITERATE  → Revise until approved by user
Step 3: CONVERT  → Blueprint → implementation spec
Step 4: BUILD    → Code from the spec only
```

**Violation:** Writing code before blueprint approval = dead code risk = rejected.

---

## 6. Completion Claim Protocol

### BANNED phrases (never output these without proof):

- "Done!"
- "That's complete."
- "Everything is working."
- "You're production ready."
- "Finished."
- "It's ready."

### REQUIRED before any completion claim:

1. Every Definition of Done criterion has PROVEN status
2. At least one proof artifact provided per critical criterion
3. No criterion labelled UNKNOWN or MISSING

### If any criterion is unverified:

```
NOT COMPLETE — [N] criteria are UNKNOWN or MISSING.
Next required action: [specific step]
```

---

## 7. Evaluation System

Score every output on 4 dimensions:

| Dimension    | Weight | Question                    |
| ------------ | ------ | --------------------------- |
| Correctness  | 35%    | Does it do what was asked?  |
| Completeness | 30%    | Is anything missing?        |
| Proof        | 25%    | Is there evidence it works? |
| Velocity     | 10%    | Was it efficient?           |

**Gate:** Score < 70% = NOT ACCEPTABLE. Revise before proceeding.

---

## 8. Visual Excellence and Model Currency Protocol

### No Factory-Default UI

The system does not accept generic LLM-generated UI as complete output.

**Banned visual patterns:**

- Grey/white backgrounds (must be OLED Black `#050505`)
- `rounded-lg`, `rounded-full`, `rounded-xl` (only `rounded-sm` allowed)
- Linear CSS transitions (must use approved cubic-bezier easings)
- Placeholder images
- Default browser fonts

**Required visual proof:** Screenshot of actual rendered UI against design token spec.

### Model Routing Policy

| Task Category                   | Provider    | Model ID               | Approved Since |
| ------------------------------- | ----------- | ---------------------- | -------------- |
| Reasoning / orchestration       | Anthropic   | claude-sonnet-4-6      | 06/03/2026     |
| Complex reasoning               | Google      | gemini-2.5-pro-preview | 06/03/2026     |
| Fast image generation / editing | Google      | gemini-2.5-flash-image | 06/03/2026     |
| Image editing with context      | Nano Banana | nano-banana-pro        | 06/03/2026     |
| High-fidelity branding visuals  | Google      | imagen-4               | 06/03/2026     |
| 3D logo renders                 | Google      | imagen-4               | 06/03/2026     |

### Model Currency Check

Run `pnpm starter:audit` to check all model references against this policy.
Any OUTDATED or UNAPPROVED model must be updated before shipping.

---

## 9. Development Principles

1. **Local-First** — Everything runs locally. No cloud required for development.
2. **Zero Barriers** — No API keys, accounts, or configuration needed to start.
3. **Production Ready** — Real authentication, testing, CI/CD included.
4. **Retrieval-First** — Query Context7/NotebookLM/Skills before loading docs into context.
5. **Proof Required** — Never claim completion without verifiable artifacts.
6. **Blueprint First** — ASCII diagram before any UI/schema/architecture code.
7. **No False Completion** — UNKNOWN and MISSING items must be resolved, not ignored.
8. **Agent Hierarchy** — Route work to the correct layer. PMs don't write code.
9. **Visual Excellence** — Factory-default UI is not complete UI.
10. **en-AU Locale** — colour, behaviour, optimisation, organised, licence (noun), DD/MM/YYYY, AUD.
