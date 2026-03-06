# Audit Mode Classifier — Hard Rule

> **Authority**: Always-on. Overrides all audit scoring.
> **Mandate**: Repository type MUST be classified before any readiness scoring begins.
> **Locale**: en-AU — colour, behaviour, optimisation, organised, licence (noun).

---

## The Rule

**BEFORE scoring any repository for production readiness, classify it.**

Applying SaaS application criteria to a framework, starter, or governance repo produces
a false score. The audit system MUST resolve repository type first.

```
CLASSIFICATION → MODE SELECTION → SCORING → REPORT
       ↑
       |
  MANDATORY FIRST STEP
  Never skip this.
```

---

## Repository Types

### 1. Framework Mode

**Indicators:**

- Root-level description includes: "starter", "template", "scaffold", "framework", "boilerplate", "engine", "adoption", "generator", "toolkit", "archetype"
- Contains an agent/skill architecture layer (`.claude/`, `.skills/`, agent definitions)
- Contains a project adoption script (`adopt-project.*`, `bootstrap.*`)
- Contains governance documentation (CLAUDE.md, memory.md, CONSTITUTION.md)
- No live production URL — by design, not a defect
- App code exists as a **template/demo** (not a live product)
- docs/ contains architectural guides for downstream users

**Correct "Finished" definition:** See section below.

**Incorrect checks to suppress:**

- Live production deployment
- SSL certificates for a live domain
- Database backups for a non-runtime system
- Legal pages (privacy policy, ToS) for a demo app
- Payment processing for a template
- Business analytics for a framework
- Customer support infrastructure

---

### 2. Application Mode

**Indicators:**

- Repo describes a specific product (LMS, portal, SaaS tool, internal app)
- Has a production deployment configured (or production is the goal)
- Serves real customers (or will serve them)
- Business logic specific to the product (billing, user management, CMS)
- No framework adoption layer

**Correct "Finished" definition:** Full production-ready SaaS criteria (see memory.md Section 2).

---

### 3. Hybrid Mode

**Indicators:**

- Contains BOTH a framework/governance layer AND a deployable application layer
- The application layer is a demo or showcase of the framework
- Downstream projects clone or adopt the framework, then build on top

**Correct "Finished" definition:** Two separate scores — Framework Readiness and Template Readiness. Neither score is labelled simply as "production ready".

---

## Classification Signals (Detection Logic)

```
SIGNAL                                          | POINTS | MODE
------------------------------------------------|--------|-------
CLAUDE.md present with agent routing            |   +3   | Framework
.skills/ directory with custom skill files      |   +3   | Framework
.claude/agents/ with specialist agent defs      |   +3   | Framework
adopt-project.* script present                  |   +3   | Framework
"starter" / "template" in README.md title/desc  |   +2   | Framework
CONSTITUTION.md / memory.md present             |   +2   | Framework
Governance hooks system (.claude/hooks/)        |   +2   | Framework
No production deployment (intentional)          |   +1   | Framework
------------------------------------------------|--------|-------
apps/web AND apps/backend both present          |   +2   | Hybrid
Live production URL configured or targeted      |   +2   | Application
Business-specific models (orders, billing, CMS) |   +2   | Application
Customer-facing feature documentation           |   +2   | Application
Production deployment guide for the repo itself |   +1   | Application

SCORING:
Framework ≥ 8 points AND Application ≤ 3 points → FRAMEWORK MODE
Application ≥ 8 points AND Framework ≤ 3 points → APPLICATION MODE
Both ≥ 4 points                                 → HYBRID MODE
```

---

## Mode-Aware Scoring Rules

### Framework Mode — "Finished" means:

- [ ] Repository classification is implemented before scoring
- [ ] Governance framework is loaded and operational (CONSTITUTION, hooks, memory)
- [ ] Agent hierarchy is complete and documented
- [ ] Skill library covers all lifecycle phases (plan, build, test, deploy, audit)
- [ ] Audit engine generates truthful, mode-aware reports
- [ ] Project adoption engine works correctly for downstream projects
- [ ] Documentation is sufficient to onboard downstream projects
- [ ] Proof-gated completion logic is enforced (no false completion claims)
- [ ] Model registry supports multi-provider AI
- [ ] Visual pipeline / design system is enforced
- [ ] Downstream project requirements are generated correctly (not assigned as framework defects)
- [ ] Scaffold/template quality is sufficient for downstream use

**Score: % of above criteria PROVEN**

### Application Mode — "Finished" means:

Full production-ready SaaS criteria — see memory.md Section 2.

### Hybrid Mode — "Finished" means:

Two separate scorecard rows:

- **Framework Readiness:** % of Framework Mode criteria met
- **Template Readiness:** % of template quality criteria met (see below)

Template quality criteria (for the starter application):

- [ ] Auth flows work (register, login, logout, protected routes)
- [ ] Database schema correct with constraints and migrations
- [ ] API routes with proper validation and error handling
- [ ] Frontend components follow design system
- [ ] CI/CD pipeline is configured and passing
- [ ] Testing infrastructure is set up (unit, integration, E2E)
- [ ] Environment configuration is documented and safe
- [ ] Docker Compose or equivalent local dev setup works
- [ ] Design system is documented and enforced
- [ ] Core patterns demonstrated (auth, CRUD, AI integration)

**NOTE**: Template Readiness is NOT the same as Application (SaaS) Readiness.
The following are DOWNSTREAM PROJECT RESPONSIBILITIES, not template defects:

- Production deployment configuration
- SSL/TLS certificates
- Database backups
- Legal pages (privacy policy, ToS)
- Payment processing integration
- Customer analytics
- Support infrastructure
- Business-specific error monitoring

---

## Classification Output Format

Before any audit report, output:

```
REPOSITORY CLASSIFICATION
═══════════════════════════════════════════════════
Repository:        [name]
Primary Purpose:   [one sentence]
Mode:              FRAMEWORK | APPLICATION | HYBRID

Framework Signals: [list signals detected, with points]
Application Signals: [list signals detected, with points]

Classification:    [MODE] (Framework: Xpts, Application: Xpts)
Scoring Approach:  [what criteria will be applied]

If HYBRID:
  Framework Layer: [what the framework layer consists of]
  Template Layer:  [what the application/template layer consists of]

IMPORTANT:
  Items classified as "downstream project requirements" will NOT
  be scored as defects against this repository.
═══════════════════════════════════════════════════
```

---

## Integration with Human Outcome Translation

When outcome language is detected ("Finished", "Ready", "Done"):

1. FIRST classify the repository
2. THEN apply the mode-appropriate Definition of Done
3. THEN run the gap analysis (Proven / Unknown / Missing)
4. THEN produce the execution plan

This rule overrides the generic "Finished" definition in memory.md Section 2.
The memory.md definition applies ONLY to Application Mode repos.

---

## Enforcement

This rule activates when:

- The `/audit` command is invoked
- The `outcome-translator` skill runs
- The `definition-of-done-builder` skill runs
- The `finished-audit` skill runs
- A human says "Finished", "Ready", "Done", "Production ready", "Launch it"

All completion gate logic MUST run classification first.
Skipping classification is an error equivalent to hallucinating a score.
