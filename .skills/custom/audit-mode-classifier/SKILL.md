---
id: audit-mode-classifier
type: skill
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
context: fork
---

# Skill: audit-mode-classifier

**Name:** audit-mode-classifier
**Purpose:** Classify a repository as Framework, Application, or Hybrid before applying any readiness scoring
**Type:** Capability Uplift
**Version:** 1.0.0
**Locale:** en-AU

---

## Triggers

Activate this skill when ANY of the following are true:

- `/audit` command is invoked
- A readiness score is being calculated
- "Finished", "Ready", "Done", "Production ready", or "Launch it" is used
- A "pathway to finished" report is being generated
- A Definition of Done is being assembled

**HARD RULE**: Classification must happen BEFORE scoring. This skill always runs first.

---

## Inputs

- Repository root directory
- README.md (or equivalent entry document)
- CLAUDE.md if present
- package.json (for project description)
- Directory listing: root, docs/, .claude/, .skills/, apps/

---

## Classification Algorithm

### Step 1: Collect Signals

Scan for Framework signals (max 14 pts):

| Signal                                                        | Points | Check                                                        |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| CLAUDE.md with agent routing table                            | 3      | Grep CLAUDE.md for "agent"                                   |
| `.skills/` directory with custom SKILL.md files               | 3      | Glob `.skills/custom/**/*.md`                                |
| `.claude/agents/` with agent definitions                      | 3      | Glob `.claude/agents/**/*.md`                                |
| `adopt-project.*` or `bootstrap.*` script in scripts/         | 3      | Glob `scripts/adopt*`, `scripts/bootstrap*`                  |
| "starter" or "template" in README.md title or first paragraph | 2      | Read README.md lines 1-10                                    |
| `CONSTITUTION.md` or `memory.md` present                      | 2      | Glob `memory.md`, `.claude/memory/CONSTITUTION.md`           |
| Hooks system in `.claude/hooks/` or `.claude/settings.json`   | 2      | Glob `.claude/hooks/`                                        |
| No production deployment configured (intentional absence)     | 1      | Absence of `vercel.json`, `netlify.toml`, Dockerfile at root |

Scan for Application signals (max 9 pts):

| Signal                                                      | Points | Check                                                               |
| ----------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| Live production URL referenced in README                    | 2      | Grep README.md for `https://`                                       |
| Business-specific models (orders, billing, CMS, LMS)        | 2      | Grep apps/ for "order", "billing", "payment", "cms"                 |
| Customer-facing feature documentation                       | 2      | Grep docs/ for "user guide", "customer", "onboarding for end-users" |
| Production deployment guide specific to this repo           | 1      | Read docs/production-deployment.md intro                            |
| apps/web AND apps/backend present as primary project output | 2      | Glob `apps/web/`, `apps/backend/` — present as non-demo             |

### Step 2: Score

```
Framework Score ≥ 8 AND Application Score ≤ 3 → FRAMEWORK MODE
Application Score ≥ 8 AND Framework Score ≤ 3 → APPLICATION MODE
Both ≥ 4                                       → HYBRID MODE
```

### Step 3: Identify Mode-Appropriate "Finished" Criteria

**Framework Mode** — use criteria from audit-mode-classifier.md §Framework Mode

**Application Mode** — use criteria from memory.md §2 (default SaaS checklist)

**Hybrid Mode** — score both layers separately:

- Framework Readiness: framework criteria only
- Template Readiness: template quality criteria only
- Downstream responsibilities: listed but NOT scored as defects

---

## Output Format

```markdown
## Repository Classification

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| **Mode**                | FRAMEWORK / APPLICATION / HYBRID |
| **Primary Purpose**     | [one sentence]                   |
| **Framework Signals**   | [Xpts / 14pts max]               |
| **Application Signals** | [Xpts / 9pts max]                |

### Signals Detected

**Framework:**

- [signal detected — Xpts]
- [signal detected — Xpts]
- ...

**Application:**

- [signal detected — Xpts]
- ...

### Scoring Approach Applied

[For Framework/Application]: [which criteria set will be used]

[For Hybrid]:

- Layer 1 (Framework): scored against framework criteria
- Layer 2 (Template): scored against template quality criteria
- Downstream Items: listed but NOT scored as defects

### Downstream Project Responsibilities

The following items will NOT be scored as defects against this repository.
They are the responsibility of downstream projects that clone/adopt this framework:

- [item 1]
- [item 2]
- ...
```

---

## Validation Gates

Before producing any readiness score, verify:

- [ ] Classification has run (mode is FRAMEWORK, APPLICATION, or HYBRID)
- [ ] Scoring criteria match the mode
- [ ] Downstream responsibilities are explicitly listed and excluded from scoring
- [ ] If HYBRID, two separate scores are generated — never merged into one

**Gate failure:** If classification was skipped, halt scoring. State: "Classification required before scoring. Running classifier now."

---

## Failure Modes

| Failure                            | Cause                                             | Recovery                                          |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| False "not production ready"       | Application Mode applied to Framework repo        | Re-run classifier, recategorise                   |
| Merged score in Hybrid mode        | Two layers merged into one score                  | Split into Framework + Template scores            |
| Downstream items marked as defects | Mode not detected before scoring                  | Re-run classifier, re-categorise items            |
| Inflated score                     | Framework items marked as app-ready without proof | Verify each criterion against framework checklist |

---

## Eval Examples

### Good Example (Hybrid Classification)

```
Repository: NodeJS-Starter-V1
Framework Signals: 14/14 (CLAUDE.md with agents, .skills/71 custom, .claude/agents/23, adopt-project.mjs, "starter" in README, CONSTITUTION.md, hooks system, no production URL)
Application Signals: 4/9 (apps/web + apps/backend present)
Mode: HYBRID

Framework Layer: AI governance engine, 23 agents, 71 skills, adoption pipeline
Template Layer: Next.js 15 + FastAPI starter template

Downstream (NOT defects):
- Production deployment → downstream project responsibility
- SSL/TLS certificates → downstream project responsibility
- Database backups → downstream project responsibility
- Legal pages → downstream project responsibility
- Payment flows → downstream project responsibility
```

### Bad Example (Category Error)

```
❌ WRONG: "NodeJS-Starter-V1 is 38% production ready because it lacks:
- live production deployment [CRITICAL]
- SSL/TLS certificates [CRITICAL]
- database backups [CRITICAL]
- legal pages [CRITICAL]"

✓ CORRECT: "NodeJS-Starter-V1 Framework Readiness: 90%
Template Readiness: 75%
Items below are downstream project responsibilities (not defects):
- production deployment, SSL, backups, legal pages"
```
