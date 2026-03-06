# Recommended Skill Map

> Maps each agent tier to their recommended skills. Maximum 8 skills per agent.
> Source of truth for skill loading decisions.

## Skill Loading Principles

1. **Process skills first** — load delegation-planner, outcome-translator before implementation skills
2. **Implementation skills second** — load domain-specific skills after process skills are active
3. **Maximum 8 per agent** — Shannon's law: more than 8 creates noise, not signal
4. **Never load speculatively** — only load a skill when its trigger phrase matches the task
5. **Conflict resolution** — if two skills conflict, the process skill wins over the implementation skill

---

## Agent Skill Map

### Layer 1: Senior PM Agent

| #   | Skill                        | Purpose                                    | Type    |
| --- | ---------------------------- | ------------------------------------------ | ------- |
| 1   | `outcome-translator`         | Convert founder language to execution plan | Process |
| 2   | `definition-of-done-builder` | Generate measurable DoD criteria           | Process |
| 3   | `delegation-planner`         | Map work to correct agent layer            | Process |
| 4   | `blueprint-first`            | Require ASCII planning before code         | Process |
| 5   | `evidence-verifier`          | Verify proof artifacts exist               | Process |
| 6   | `finished-audit`             | Audit whether "finished" is true           | Process |

**Max: 6 skills** (process-only — PM never loads implementation skills)

---

### Layer 2: Senior Orchestrator Agent

| #   | Skill                        | Purpose                              | Type    |
| --- | ---------------------------- | ------------------------------------ | ------- |
| 1   | `delegation-planner`         | Route work to correct specialist     | Process |
| 2   | `evidence-verifier`          | Verify sub-agent proof artifacts     | Process |
| 3   | `finished-audit`             | Block false completion claims        | Process |
| 4   | `blueprint-first`            | Enforce planning before architecture | Process |
| 5   | `definition-of-done-builder` | Build DoD when PM skipped it         | Process |
| 6   | `outcome-translator`         | Fallback translation capability      | Process |
| 7   | `execution-guardian`         | Complexity and blast radius checks   | Process |
| 8   | `system-supervisor`          | Production health monitoring         | Process |

**Max: 8 skills**

---

### Layer 3A: Senior Engineering Agent

| #   | Skill                 | Purpose                                 | Type           |
| --- | --------------------- | --------------------------------------- | -------------- |
| 1   | `blueprint-engine`    | DAG execution for multi-file tasks      | Implementation |
| 2   | `execution-guardian`  | Complexity checks before implementation | Process        |
| 3   | `saga-pattern`        | Distributed transaction handling        | Implementation |
| 4   | `resilience-patterns` | Retry, circuit breaker, timeout         | Implementation |
| 5   | `structured-logging`  | Observability standards                 | Implementation |
| 6   | `secret-management`   | Env var and secrets hygiene             | Implementation |
| 7   | `rate-limiter`        | API protection                          | Implementation |
| 8   | `graceful-shutdown`   | Process lifecycle                       | Implementation |

---

### Layer 3B: Senior UI/UX Agent

| #   | Skill                        | Purpose                               | Type           |
| --- | ---------------------------- | ------------------------------------- | -------------- |
| 1   | `scientific-luxury`          | OLED Black design system              | Implementation |
| 2   | `blueprint-first`            | ASCII wireframe before component code | Process        |
| 3   | `visual-excellence-enforcer` | Prevent factory-default UI            | Process        |
| 4   | `xaem-theme-ui`              | Component theme patterns              | Implementation |
| 5   | `error-boundary`             | React error boundary patterns         | Implementation |
| 6   | `dashboard-patterns`         | Layout and data display               | Implementation |
| 7   | `i18n-patterns`              | en-AU locale enforcement              | Implementation |
| 8   | `feature-flag`               | Progressive rollout                   | Implementation |

---

### Layer 3C: Senior QA / Production Agent

| #   | Skill                | Purpose                       | Type           |
| --- | -------------------- | ----------------------------- | -------------- |
| 1   | `playwright-browser` | E2E test automation           | Implementation |
| 2   | `health-check`       | Endpoint health patterns      | Implementation |
| 3   | `metrics-collector`  | Observability and alerting    | Implementation |
| 4   | `ci-cd-patterns`     | GitHub Actions workflows      | Implementation |
| 5   | `tracing-patterns`   | Distributed tracing           | Implementation |
| 6   | `status-page`        | Service status monitoring     | Implementation |
| 7   | `execution-guardian` | Pre-deployment risk checks    | Process        |
| 8   | `system-supervisor`  | Production health supervision | Process        |

---

### Layer 3D: Senior Research Agent

| #   | Skill                 | Purpose                      | Type           |
| --- | --------------------- | ---------------------------- | -------------- |
| 1   | `truth-finder`        | 4-tier source verification   | Process        |
| 2   | `api-contract`        | API design evaluation        | Implementation |
| 3   | `api-versioning`      | Versioning strategy research | Implementation |
| 4   | `changelog-generator` | Technology change tracking   | Implementation |
| 5   | `markdown-processor`  | Research output formatting   | Implementation |
| 6   | `structured-logging`  | Research log standards       | Implementation |

**Max: 6 skills**

---

### Layer 3E: Senior LMS Content Agent

| #   | Skill                | Purpose                    | Type           |
| --- | -------------------- | -------------------------- | -------------- |
| 1   | `content-moderation` | Content quality and safety | Process        |
| 2   | `pdf-generator`      | Document generation        | Implementation |
| 3   | `markdown-processor` | Content formatting         | Implementation |
| 4   | `data-transform`     | Content pipeline           | Implementation |
| 5   | `vector-search`      | Semantic search            | Implementation |
| 6   | `pipeline-builder`   | Content ingestion          | Implementation |

**Max: 6 skills**

---

### Layer 3F: Senior Growth / Marketing Agent

| #   | Skill                 | Purpose                     | Type           |
| --- | --------------------- | --------------------------- | -------------- |
| 1   | `search-indexer`      | SEO and search optimisation | Implementation |
| 2   | `metrics-collector`   | Analytics and KPI tracking  | Implementation |
| 3   | `notification-system` | User engagement             | Implementation |
| 4   | `webhook-handler`     | Analytics event capture     | Implementation |
| 5   | `report-generator`    | Growth reporting            | Implementation |
| 6   | `audit-trail`         | Analytics audit logging     | Implementation |

**Max: 6 skills**

---

### Layer 4: Sub-Agents

Sub-agents load NO skills. They execute the minimal task, return evidence, and exit.

---

## Conflict Resolution

When two skills have overlapping trigger phrases, apply this priority order:

1. **Process skills beat implementation skills** — governance always wins
2. **More specific beat more general** — `visual-excellence-enforcer` beats `scientific-luxury` for design audits
3. **Earlier-loaded beats later-loaded** — load order determines precedence
4. **Explicit instruction beats heuristic** — if the user names a skill, load it regardless

## Anti-Patterns

- Loading `blueprint-engine` for a single-file edit (YAGNI — use a sub-agent)
- Loading `outcome-translator` for a technical implementation task (wrong layer)
- Loading 10+ skills "just in case" (Shannon noise violation)
- Loading the same skill twice in one session (wasteful)
