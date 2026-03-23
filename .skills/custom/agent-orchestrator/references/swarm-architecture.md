# Agent Swarm Architecture

## Design Philosophy

A single Claude session with 60+ skills in context suffers from predictable failure modes: attention dilution (too many instructions competing for focus), recency bias (later skills overshadow earlier ones), lost-in-the-middle (skills loaded mid-context get ignored), and token exhaustion (the context window fills up with instructions before the actual work begins).

The swarm architecture solves this by giving each specialist agent its own clean context window with only the 5-8 skills it needs. An orchestrator agent sits at the top, receives the user's request, figures out which specialist(s) to engage, and coordinates the results.

### Core Principles

1. **Context isolation** — Each agent loads only its own skills. A Sales Agent never sees engineering documentation. This keeps each agent sharp and focused.
2. **Single responsibility** — Each agent owns one domain. Overlap is minimised but not eliminated — some cross-domain skills appear in multiple agents when they genuinely serve both.
3. **Hub-and-spoke by default, chain when sequential** — The orchestrator delegates to agents independently for parallel tasks, but chains agents in sequence when one agent's output feeds the next.
4. **Human-in-the-loop** — The orchestrator always surfaces results to the user. Agents don't autonomously hand off to other agents without the orchestrator coordinating.
5. **Graceful degradation** — If a specialist agent isn't available, the orchestrator falls back to handling the task directly with whatever skills it has.

---

## Specialist Agent Definitions

### 1. Engineering Agent
**Domain**: Software development, architecture, DevOps, quality, and operational reliability.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `engineering:architecture` | ADRs, technology decisions, trade-off analysis |
| 2 | `engineering:code-review` | PR review, security, performance, correctness |
| 3 | `engineering:debug` | Structured debugging: reproduce, isolate, fix |
| 4 | `engineering:deploy-checklist` | Pre-deployment verification and rollback planning |
| 5 | `engineering:documentation` | Technical docs, READMEs, runbooks, onboarding |
| 6 | `engineering:incident-response` | Triage, communication, postmortem |
| 7 | `engineering:system-design` | Service design, API design, data modelling |
| 8 | `engineering:tech-debt` | Identify, categorise, prioritise refactoring |
| 9 | `engineering:testing-strategy` | Test plans, coverage strategy, test architecture |
| 10 | `engineering:standup` | Generate standup updates from activity |

**Routes to this agent when**: code, architecture, debugging, deployment, incidents, testing, technical debt, PRs, infrastructure.

---

### 2. Design & UX Agent
**Domain**: User experience, interface design, research, accessibility, and design systems.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `design:design-critique` | Structured feedback on usability and hierarchy |
| 2 | `design:design-handoff` | Developer specs from designs |
| 3 | `design:design-system` | Audit, document, extend design systems |
| 4 | `design:accessibility-review` | WCAG 2.1 AA audits |
| 5 | `design:user-research` | Plan, conduct, synthesise research |
| 6 | `design:research-synthesis` | Themes and insights from research data |
| 7 | `design:ux-copy` | Microcopy, error messages, CTAs, empty states |

**Routes to this agent when**: design review, mockups, wireframes, accessibility, user research, UX writing, design tokens, component specs.

---

### 3. Product & Project Management Agent
**Domain**: Roadmaps, sprints, specs, stakeholder communication, and project governance.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `senior-saas-pm` | 15-year PM persona — full lifecycle advice and deliverables |
| 2 | `product-management:write-spec` | PRDs and feature specs |
| 3 | `product-management:sprint-planning` | Sprint scoping, capacity, goals |
| 4 | `product-management:roadmap-update` | Roadmap creation and reprioritisation |
| 5 | `product-management:stakeholder-update` | Status reports for leadership |
| 6 | `product-management:metrics-review` | Product metrics analysis and insights |
| 7 | `product-management:synthesize-research` | Structured insights from feedback |
| 8 | `product-management:competitive-brief` | Competitive analysis for product strategy |

**Routes to this agent when**: project plans, sprint planning, roadmaps, specs, stakeholder updates, risk registers, retros, SOWs, go-live, implementation plans, competitive analysis for product decisions.

---

### 4. Data & Analytics Agent
**Domain**: SQL, analysis, visualisation, dashboards, and statistical methods.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `data:analyze` | Full data analysis from quick lookups to reports |
| 2 | `data:write-query` | Optimised SQL across all dialects |
| 3 | `data:sql-queries` | Complex analytical queries, CTEs, window functions |
| 4 | `data:explore-data` | Dataset profiling, quality checks, distributions |
| 5 | `data:build-dashboard` | Interactive HTML dashboards |
| 6 | `data:create-viz` | Publication-quality charts with Python |
| 7 | `data:statistical-analysis` | Descriptive stats, hypothesis testing, outlier detection |
| 8 | `data:validate-data` | QA methodology, accuracy, and bias checks |

**Routes to this agent when**: SQL, data analysis, charts, dashboards, metrics, statistics, data quality, visualisations, database queries.

---

### 5. Sales Agent
**Domain**: Pipeline, prospecting, call prep, competitive intel, and forecasting.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `sales:account-research` | Company and person research for sales intel |
| 2 | `sales:call-prep` | Pre-call briefing with context and agenda |
| 3 | `sales:call-summary` | Post-call action items, follow-up drafts |
| 4 | `sales:draft-outreach` | Personalised cold outreach |
| 5 | `sales:competitive-intelligence` | Battlecards and competitor comparison |
| 6 | `sales:pipeline-review` | Pipeline health, deal prioritisation |
| 7 | `sales:forecast` | Weighted forecast with scenarios |
| 8 | `sales:daily-briefing` | Morning sales briefing |
| 9 | `sales:create-an-asset` | Sales assets: landing pages, decks, one-pagers |

**Routes to this agent when**: prospects, leads, pipeline, deals, outreach, sales calls, forecasts, battlecards, CRM, quotas.

---

### 6. Marketing & Brand Agent
**Domain**: Content creation, campaigns, SEO, email, brand voice, and ambassador content.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `brand-ambassador` | Authentic social media content as brand representative |
| 2 | `marketing:content-creation` | Blog, social, email, press releases, case studies |
| 3 | `marketing:campaign-plan` | Full campaign briefs with calendars |
| 4 | `marketing:email-sequence` | Multi-email drip campaigns with branching |
| 5 | `marketing:seo-audit` | Keyword research, on-page, content gaps |
| 6 | `marketing:brand-review` | Content compliance against brand guidelines |
| 7 | `marketing:competitive-brief` | Positioning and messaging comparison |
| 8 | `marketing:performance-report` | Marketing metrics and optimisation |
| 9 | `brand-voice:brand-voice-enforcement` | Apply brand guidelines to content |
| 10 | `brand-voice:guideline-generation` | Create brand guidelines from materials |

**Routes to this agent when**: social media, blog posts, campaigns, SEO, email marketing, brand voice, ambassador content, content calendar, newsletters, brand guidelines.

---

### 7. Customer Support Agent
**Domain**: Ticket handling, escalation, knowledge base, and customer communication.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `customer-support:ticket-triage` | Categorise, prioritise, route tickets |
| 2 | `customer-support:draft-response` | Professional customer-facing replies |
| 3 | `customer-support:customer-research` | Multi-source lookup for customer questions |
| 4 | `customer-support:customer-escalation` | Package escalations with full context |
| 5 | `customer-support:kb-article` | Knowledge base articles from resolved issues |

**Routes to this agent when**: support tickets, customer complaints, escalations, help articles, customer responses, SLA, triage.

---

### 8. Document Production Agent
**Domain**: Creating polished output files — Word docs, spreadsheets, presentations, PDFs.

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `docx` | Word document creation and editing |
| 2 | `xlsx` | Spreadsheet creation, formulas, charts |
| 3 | `pptx` | Presentation creation and editing |
| 4 | `pdf` | PDF creation, extraction, merging |

**Routes to this agent when**: "create a doc", "make a spreadsheet", "build a presentation", "generate a PDF", or any request where the final deliverable is a formatted file. This agent is often the **second agent in a chain** — another agent produces the content, then this agent formats it into the requested file type.

---

## Routing Patterns

### Pattern 1: Hub-and-Spoke (Independent Tasks)

```
User Request
     │
     ▼
┌──────────┐
│Orchestrator│
└──────────┘
   │    │    │
   ▼    ▼    ▼
 Agent Agent Agent    ← parallel, independent
   │    │    │
   ▼    ▼    ▼
┌──────────┐
│Orchestrator│  ← collects, synthesises, responds
└──────────┘
```

**Use when**: The request touches multiple domains that don't depend on each other.

**Example**: "Give me a competitive analysis and prep me for my sales call with Acme Corp"
→ Marketing Agent (competitive brief) + Sales Agent (call prep) in parallel

---

### Pattern 2: Sequential Chain

```
User Request
     │
     ▼
┌──────────┐
│Orchestrator│
└──────────┘
     │
     ▼
  Agent A  → output feeds into →  Agent B  → output feeds into →  Agent C
```

**Use when**: One agent's output is the input for the next.

**Example**: "Research our competitors, write a blog post about our advantages, and format it as a Word doc"
→ Marketing Agent (competitive brief) → Marketing Agent (content creation) → Document Agent (docx)

---

### Pattern 3: Fan-Out then Converge

```
User Request
     │
     ▼
┌──────────┐
│Orchestrator│
└──────────┘
   │    │    │
   ▼    ▼    ▼
 Agent Agent Agent    ← parallel research
   │    │    │
   └────┼────┘
        ▼
    Agent D           ← synthesis agent receives all results
        │
        ▼
┌──────────┐
│Orchestrator│
└──────────┘
```

**Use when**: Multiple agents gather information, then a single agent synthesises.

**Example**: "Prepare our quarterly business review"
→ Data Agent (metrics) + Sales Agent (pipeline/forecast) + Product Agent (roadmap status) → Product Agent (stakeholder update combining all inputs)

---

## Routing Decision Logic

The orchestrator classifies each request through this decision tree:

```
1. Does this request map to a single domain?
   YES → Route to that specialist agent
   NO  → Continue to step 2

2. Does this request require sequential processing?
   (i.e., does Agent B need Agent A's output?)
   YES → Build a chain: A → B → C
   NO  → Continue to step 3

3. Can the domains be addressed independently?
   YES → Fan out to multiple agents in parallel
   NO  → Fan out, then converge through a synthesis agent

4. Does the final output need to be a formatted file?
   YES → Add Document Agent as the final step in the chain
   NO  → Orchestrator synthesises and responds directly
```

### Ambiguity Resolution

When a request could go to multiple agents, the orchestrator uses these tiebreakers:

- **"competitive analysis"** → Marketing Agent if about positioning/messaging, Product Agent if about product strategy, Sales Agent if about battlecards for deals
- **"stakeholder update"** → Product Agent for recurring status, Senior PM skill for project-specific updates
- **"write content"** → Marketing Agent for external content, Customer Support Agent for customer-facing responses, Engineering Agent for technical documentation
- **"research"** → Sales Agent for prospect research, Design Agent for user research, Customer Support Agent for ticket investigation, Marketing Agent for competitor research

When genuinely ambiguous, the orchestrator asks the user a brief clarifying question.

---

## Context Budget Management

Each specialist agent operates within its own context window. The orchestrator manages the overall token budget:

| Component | Token Budget |
|-----------|-------------|
| Orchestrator routing + synthesis | ~10K tokens |
| Per-agent skill loading | ~5-15K tokens (depends on skills triggered) |
| Per-agent working context | ~80-150K tokens |
| Inter-agent context passing | ~2-5K tokens per handoff (summaries, not raw output) |

**Key rule**: When passing context between agents in a chain, the orchestrator summarises the previous agent's output rather than passing it raw. This prevents context pollution and keeps each agent's window clean.

---

## Scaling Strategy

### Adding New Skills
1. Determine which agent the skill belongs to (or if a new agent is needed)
2. If an agent would exceed 10 skills, consider splitting it
3. Update the orchestrator's routing table
4. Test with edge-case prompts that could route ambiguously

### Adding New Agents
1. Define the domain, list skills (5-8 ideal, 10 max)
2. Add routing keywords to the orchestrator
3. Add disambiguation rules for overlapping domains
4. Test the full routing path

### Agent Size Guidelines
- **Minimum**: 3 skills (below this, fold into a related agent)
- **Ideal**: 5-8 skills
- **Maximum**: 10 skills (above this, context quality degrades)
