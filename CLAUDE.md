# Claude Integration Guide

Claude integration enables AI-assisted development, decision-making, and system intelligence for CleanExpo/NodeJS-Starter-V1.

**Engineering standard (binding):** [docs/adr/0001-starter-pack-standard.md](docs/adr/0001-starter-pack-standard.md) — strict types with zero `tsconfig` exclusions, all CI gates green before any PR opens (`pnpm type-check && pnpm lint && pnpm format:check && pnpm test && pnpm build`), Conventional-Commit PR titles, no credentials in code or env examples. New projects start via `scripts/bootstrap-new-project.sh`.

## Quick Start

1. **Getting Context:** Run `/hey-claude` to start a session with full system context
2. **Making Decisions:** Use `/ceo-begin` to run a CEO Board deliberation
3. **System Audit:** Run `/swarm-audit` to analyze codebase health
4. **Documentation:** Use `/generate-route-reference` to keep docs in sync

---

## Commands Available

### 1. `/hey-claude`

**What:** Start a new Claude session with full system context

**Use when:**

- Onboarding new team members
- Starting major feature development
- Debugging complex issues
- Need architecture guidance
- Want code examples or best practices

**Example:**

```
/hey-claude "How do I add a new API endpoint?"
/hey-claude "Explain the authentication flow"
```

**See:** [.claude/commands/hey-claude.md](./.claude/commands/hey-claude.md)

---

### 2. `/ceo-begin`

**What:** Begin a CEO Board deliberation on a strategic decision

**Use when:**

- Making significant strategic decisions
- Need multiple perspectives on a decision
- Want documented decision history
- Need to update agent expertise
- Want visual decision artifacts

**How:**

1. Prepare a brief at `.pi/ceo-agents/briefs/[TOPIC]-[DATE].md`
2. Run `/ceo-begin [TOPIC]-[DATE]`
3. Review decision memo at `.pi/ceo-agents/memos/[TOPIC]-[DATE].md`

**The 9 Board Members:**

- CEO — Holistic business lens
- Revenue — Growth and unit economics
- Product Strategist — User value and roadmap
- Technical Architect — System design and feasibility
- Contrarian — Risks and blindspots
- Compounder — Long-term leverage
- Custom Oracle — Domain-specific expertise
- Market Strategist — Competitive positioning
- Moonshot — Radical innovation

**Example:**

```
/ceo-begin "acquisition-offer-2026-03-24"
```

**See:**

- [.claude/commands/ceo-begin.md](./.claude/commands/ceo-begin.md)
- [.pi/README.md](./.pi/README.md)
- [.pi/ceo-agents/briefs/\_EXAMPLE-acquisition-offer.md](./.pi/ceo-agents/briefs/_EXAMPLE-acquisition-offer.md)

---

### 3. `/swarm-audit`

**What:** Run automated audit of codebase architecture, patterns, and quality

**Use when:**

- Before major refactoring
- Before releases to catch issues
- Quarterly architecture review
- After onboarding major features
- Need to identify inconsistencies

**Audits:**

- Architecture compliance
- Pattern consistency
- Code quality metrics
- Documentation coverage
- Security issues

**Example:**

```
/swarm-audit
/swarm-audit routes
/swarm-audit middleware
```

**See:** [.claude/commands/swarm-audit.md](./.claude/commands/swarm-audit.md)

---

### 4. `/generate-route-reference`

**What:** Auto-generate API route reference documentation

**Use when:**

- After adding new routes
- Before deployments
- In CI/CD pipeline
- Need to sync docs with code

**Generates:**

- Complete route listing
- Request/response examples
- Parameter documentation
- Status code reference
- Error code guide

**Output:** Updates [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md)

**Example:**

```
/generate-route-reference
```

**See:** [.claude/commands/generate-route-reference.md](./.claude/commands/generate-route-reference.md)

---

## The PI Agent Workspace

The `.pi/` directory is a persistent workspace for agent deliberation systems.

### Key Directories

**`.pi/ceo-agents/`** — CEO Board deliberation system

- `briefs/` — Board decision briefs (copy `_TEMPLATE.md`)
- `memos/` — Decision memos and conclusions
- `conversations/` — Full deliberation transcripts
- `artifacts/` — SVG diagrams and visual arguments
- `expertise/` — 9 agent expertise files with decision history

**`.pi/shared/`** — Shared business context

- `context/` — Business context template agents load

### Workflow

1. **Prepare Brief** — Copy `_TEMPLATE.md`, fill it out
2. **Submit to Board** — Run `/ceo-begin`
3. **Review Outputs** — Check memo, transcript, artifacts
4. **Update Expertise** — Agents record their learning
5. **Track Outcomes** — Compare predictions to actual results

**See:**

- [.pi/README.md](./.pi/README.md) — Full workspace documentation
- [.pi/ceo-agents/briefs/\_EXAMPLE-acquisition-offer.md](./.pi/ceo-agents/briefs/_EXAMPLE-acquisition-offer.md) — Golden example

---

## Living Documentation System

Documentation that stays in sync with your code.

### Key Files

**[SYSTEM_DOCS.md](./SYSTEM_DOCS.md)**

- Architecture overview
- Running the application
- Adding new routes
- Middleware reference
- Configuration guide
- API standards
- Logging and observability

**[ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md)**

- Complete API endpoint listing
- Request/response examples
- Status codes and errors
- Parameter documentation
- Auto-generated by `/generate-route-reference`

**[This File - CLAUDE.md](./CLAUDE.md)**

- Claude integration guide
- Command reference
- Workflow documentation

### Keeping Docs Fresh

1. Update code with clear JSDoc comments
2. Run `/generate-route-reference` after route changes
3. Update [SYSTEM_DOCS.md](./SYSTEM_DOCS.md) for architecture changes
4. Use `/hey-claude` to ask for documentation help

---

## Typical Workflows

### Onboarding a New Team Member

```bash
# 1. Get full system context
/hey-claude "Give me an overview of CleanExpo"

# 2. Ask specific questions
/hey-claude "How is authentication implemented?"
/hey-claude "Where do I add a new endpoint?"
/hey-claude "What's the project structure?"

# 3. Review documentation
- Read SYSTEM_DOCS.md
- Review ROUTE_REFERENCE.md
- Check .pi/README.md for decision framework
```

### Adding a New Feature

```bash
# 1. Get architectural guidance
/hey-claude "I want to add user notifications. How should I structure this?"

# 2. Implement with confidence
# (Claude provides patterns and examples)

# 3. Update documentation
/generate-route-reference

# 4. Get code review
/hey-claude "Review my new notification service"
```

### Making a Strategic Decision

```bash
# 1. Prepare your brief
cp .pi/ceo-agents/briefs/_TEMPLATE.md \
   .pi/ceo-agents/briefs/[your-topic]-[date].md

# 2. Review the golden example
# (Read _EXAMPLE-acquisition-offer.md for format)

# 3. Start deliberation
/ceo-begin [your-topic]-[date]

# 4. Review results
# Check .pi/ceo-agents/memos/[your-topic]-[date].md
```

### Auditing Code Quality

```bash
# 1. Run full audit
/swarm-audit

# 2. Review findings
# Get detailed report of architecture, patterns, quality, docs, security

# 3. Ask for help fixing issues
/hey-claude "The audit found 3 routes missing error handling. Help me fix them."

# 4. Track improvements
# Re-run quarterly or before releases
```

---

## Best Practices

### For Developers

1. **Use `/hey-claude` Early** — Get architectural guidance before coding
2. **Document as You Go** — Keep JSDoc comments current
3. **Run `/swarm-audit` Regularly** — Catch issues before they compound
4. **Review Past Decisions** — Learn from prior board deliberations

### For Leads & Decision-Makers

1. **Structure Your Briefs** — Use the template, be specific
2. **Trust the Process** — Diverse agent perspectives catch blindspots
3. **Track Predictions** — Come back and see how board decisions aged
4. **Update Agent Expertise** — Keep files current with learning

### For Team Health

1. **Transparent Decisions** — Share decision memos with team
2. **Learn from Outcomes** — Revisit decisions quarterly
3. **Improve Expertise** — Update agent files as patterns emerge
4. **Use `/hey-claude` for Training** — Help new members understand systems

---

## File Structure

```
CleanExpo/NodeJS-Starter-V1/
├── .pi/                              # Agent workspace
│   ├── README.md                     # PI workspace overview
│   ├── ceo-agents/
│   │   ├── briefs/
│   │   │   ├── _TEMPLATE.md          # Copy this to start
│   │   │   └── _EXAMPLE-acquisition-offer.md # Learn from this
│   │   ├── memos/                    # Decision summaries
│   │   ├── conversations/            # Full transcripts
│   │   ├── artifacts/                # Visual arguments
│   │   └── expertise/                # 9 agent expertise files
│   └── shared/
│       └── context/                  # Shared business context
├── .claude/
│   └── commands/
│       ├── hey-claude.md             # Get system context
│       ├── ceo-begin.md              # Start board deliberation
│       ├── swarm-audit.md            # Audit code quality
│       └── generate-route-reference.md # Update API docs
├── SYSTEM_DOCS.md                    # Architecture & systems
├── ROUTE_REFERENCE.md                # API documentation
└── CLAUDE.md                         # This file
```

---

## Troubleshooting

**"I don't know where to start"**
→ Run `/hey-claude "Help me understand CleanExpo"`

**"The board's decision doesn't feel right"**
→ Review the Contrarian's concerns—they often surface real risks

**"Docs are out of date"**
→ Run `/generate-route-reference` to auto-sync

**"I want to understand the audit findings"**
→ Run `/hey-claude "Explain the swarm audit results and help me fix them"`

**"How do I improve decision quality?"**
→ Track decision outcomes quarterly, update agent expertise files with learnings

---

## Credits

**Inspired by:** IndyDevDan's agent scaling insights

_"If you template your engineering, your agents can do exactly what you did. This is the big advantage. When you're not creating prescriptions, workflows, and systems for your agents to repeat, you miss out on all the true leverage."_

---

**Last Updated:** 2026-03-24
**Status:** Active
**Maintainer:** CleanExpo Team
