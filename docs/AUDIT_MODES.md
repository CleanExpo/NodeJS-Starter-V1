---
id: audit_modes
type: doc
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Audit Modes — NodeJS-Starter-V1

> **Purpose**: Documents the three audit modes used by the audit system to correctly classify repositories before scoring.
> **Rule**: Classification always precedes scoring. See `.claude/rules/audit-mode-classifier.md`.
> **Locale**: en-AU

---

## Why Audit Modes Exist

A framework, starter, or governance repository is NOT a live SaaS application. Applying SaaS production-readiness criteria to a framework repo produces a misleading score — it reports "38% production ready" when in fact the framework layer is ~90% complete and the template layer is ~75% complete.

The audit mode system solves this by classifying the repository first, then applying the correct scoring criteria.

---

## Mode 1 — Framework Mode

### Used For

- Starter repos and scaffolding systems
- Project adoption engines
- Governance frameworks
- Agent/skill platforms
- Orchestration engines
- Developer toolkits and archetypes

### "Finished" Definition

A Framework Mode repository is "Finished" when it can successfully scaffold, audit, adopt, and guide downstream projects. Specifically:

| Criterion                         | Description                                   |
| --------------------------------- | --------------------------------------------- |
| Repository classification         | Audit system classifies repos before scoring  |
| Governance operational            | CONSTITUTION, hooks, memory system loaded     |
| Agent hierarchy complete          | All specialist agents documented and bounded  |
| Skill library operational         | Skills cover all development lifecycle phases |
| Audit engine truthful             | Reports are mode-aware and evidence-based     |
| Adoption engine works             | Downstream projects can be initialised        |
| Documentation sufficient          | Onboarding docs enable downstream use         |
| Proof-gated completion            | No false "Done" claims without evidence       |
| Model registry                    | Multi-provider AI support                     |
| Visual pipeline                   | Design system enforced                        |
| Downstream requirements generated | Correct output for downstream projects        |
| Scaffold/template quality         | Sufficient to build on                        |

### What Is NOT a Defect in Framework Mode

The following are **downstream project responsibilities**, not framework defects:

- Live production deployment
- SSL/TLS certificates for a live domain
- Automated database backups
- Legal pages (privacy policy, ToS)
- Payment processing integration
- Customer analytics
- Support infrastructure
- Customer-facing error monitoring configuration
- Production-level rate limiting tuning
- Environment-specific secrets management

These items will be **generated as recommendations** in the downstream project's own audit — not scored against the framework.

---

## Mode 2 — Application Mode

### Used For

- Deployable SaaS applications
- LMS or e-learning systems
- Customer portals
- Internal business applications
- Client-facing products

### "Finished" Definition

Full production-ready SaaS criteria apply. See `memory.md` Section 2 for the complete checklist including:

- Frontend: Production URL, auth flows, responsive design, copy finalised
- Backend: Endpoints within latency, health check, auth middleware, no unhandled exceptions
- Data & Security: Backups, CORS, JWT rotation, rate limiting
- Payments: Live mode, webhook configuration, test transactions
- Deployment: CI/CD green, SSL, DNS, rollback path
- Business: Support, legal pages, analytics, error monitoring

---

## Mode 3 — Hybrid Mode

### Used For

Repositories that contain BOTH:

- A framework/governance layer
- A deployable application layer (demo, showcase, or starter template)

### "Finished" Definition

Two separate scores are produced — never merged:

#### Framework Readiness (%)

Scored against Framework Mode criteria.

#### Template Readiness (%)

Scored against template quality criteria:

| Criterion                  | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| Auth flows                 | Register, login, logout, protected routes work locally |
| Database schema            | Correct constraints, types, relations                  |
| API routes                 | Proper validation and error handling                   |
| Frontend components        | Follow design system, accessible                       |
| CI/CD pipeline             | Configured and passing                                 |
| Testing infrastructure     | Unit, integration, E2E configured                      |
| Environment configuration  | Documented and safe defaults                           |
| Local dev setup            | Docker Compose or equivalent                           |
| Design system              | Documented and enforced                                |
| Core patterns demonstrated | Auth, CRUD, AI integration                             |

**Template Readiness is NOT Application Readiness.** A template at 75% readiness means it's a solid foundation for downstream projects to build on — not that it's incomplete or broken.

---

## Classification Signals

The classifier uses a points-based system. See `.claude/rules/audit-mode-classifier.md` for the full signal table and scoring rules.

Quick reference:

| Signal                          | Mode             |
| ------------------------------- | ---------------- |
| CLAUDE.md with agent routing    | Framework (+3)   |
| .skills/ with custom skills     | Framework (+3)   |
| .claude/agents/ with agents     | Framework (+3)   |
| adopt-project.\* script         | Framework (+3)   |
| "starter"/"template" in README  | Framework (+2)   |
| CONSTITUTION.md / memory.md     | Framework (+2)   |
| Hooks system                    | Framework (+2)   |
| No production URL (intentional) | Framework (+1)   |
| apps/web + apps/backend present | Hybrid (+2)      |
| Live production URL in README   | Application (+2) |
| Business-specific models        | Application (+2) |
| Customer-facing feature docs    | Application (+2) |

---

## Integration with /audit Command

The `/audit` command runs classification as Phase 0 (before any other phase):

```
Phase 0:  Repository Classification  ← NEW — mandatory first step
Phase 1:  Repository Scan
Phase 2:  Strengths and Weaknesses
Phase 3:  Infrastructure Enhancement Pathway
Phase 4:  Pathway to Finished
Phase 5:  Implementation Task List
Phase 6:  Linear Sync (if enabled)
Phase 7:  Self-Verification
Phase 8:  Executive Summary
```

---

## Integration with Outcome Translation

When outcome language is detected ("Finished", "Ready", "Done"):

1. **Classify** the repository (Framework / Application / Hybrid)
2. **Apply** the mode-appropriate Definition of Done
3. **Run** gap analysis (Proven / Unknown / Missing)
4. **Produce** the execution plan appropriate to the repo type

This prevents the "38% production ready" false positive that occurs when SaaS criteria are blindly applied to a framework repo.

---

## Related Files

| File                                              | Purpose                                        |
| ------------------------------------------------- | ---------------------------------------------- |
| `.claude/rules/audit-mode-classifier.md`          | Hard rule — classification before scoring      |
| `.skills/custom/audit-mode-classifier/SKILL.md`   | Classifier algorithm and output format         |
| `.claude/commands/audit.md`                       | Audit command with Phase 0 classification      |
| `memory.md`                                       | Updated with mode-aware "Finished" definitions |
| `reports/full-audit/repository-classification.md` | Classification result for this repo            |
