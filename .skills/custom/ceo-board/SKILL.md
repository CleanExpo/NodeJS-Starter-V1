# CEO Board Deliberation Skill

## Overview

The CEO Board Deliberation skill orchestrates multi-agent reasoning for strategic business decisions. It implements IndyDevDan's innovation of templated agent expertise with persistent learning.

**Created:** 2026-03-24
**Framework:** CleanExpo/NodeJS-Starter-V1
**Agents:** 9 specialized board members with persistent expertise

---

## The Golden Example

To understand how the board works, review this complete example decision:

**File:** [.pi/ceo-agents/briefs/_EXAMPLE-acquisition-offer.md](./.pi/ceo-agents/briefs/_EXAMPLE-acquisition-offer.md)

**What it demonstrates:**
- How to structure a board brief
- Expected deliberation process
- Agent perspective patterns
- How expertise files are updated
- Output format for decision memos

Use this example to train new team members on the board's decision process.

---

## Quick Start

### 1. Prepare Your Brief

Copy the template and fill it out:

```bash
cp .pi/ceo-agents/briefs/_TEMPLATE.md \
   .pi/ceo-agents/briefs/[YOUR-TOPIC]-[DATE].md
```

**Required sections:**
- **Situation** — What's the context?
- **Stakes** — What's at risk or possible?
- **Constraints** — What are our limits?
- **Key Questions** — What does the board decide?

### 2. Start the Board

```bash
/ceo-begin [YOUR-TOPIC]-[DATE]
```

The board will:
1. Review your brief
2. Deliberate with all 9 agents
3. Debate and challenge each other
4. Reach a decision
5. Update expertise files with their learning

### 3. Review the Decision

Find outputs at:
```
.pi/ceo-agents/
├── memos/[TOPIC]-[DATE].md        # Decision summary
├── conversations/[TOPIC]-[DATE].json # Full debate transcript
└── artifacts/[TOPIC]-[DATE].svg     # Visual arguments
```

---

## The 9 Board Members

### 1. **CEO**
**Perspective:** Holistic business lens, execution reality
**Questions:** Can we execute this? Does it align with strategy? How do we communicate it?
**Expertise File:** `.pi/ceo-agents/expertise/ceo.md`

### 2. **Revenue Agent**
**Perspective:** Growth, unit economics, expansion
**Questions:** How does this impact MRR? Is it capital-efficient? What's the TAM?
**Expertise File:** `.pi/ceo-agents/expertise/revenue.md`

### 3. **Product Strategist**
**Perspective:** Feature prioritization, user value, roadmap
**Questions:** Does this delight users? How does it fit the roadmap? What's the UX impact?
**Expertise File:** `.pi/ceo-agents/expertise/product-strategist.md`

### 4. **Technical Architect**
**Perspective:** System design, feasibility, technical debt
**Questions:** Is this technically sound? What's the implementation complexity? Scalability concerns?
**Expertise File:** `.pi/ceo-agents/expertise/technical-architect.md`

### 5. **Contrarian**
**Perspective:** Risk identification, blindspots, second-order effects
**Questions:** What could go wrong? What are we not seeing? When should we say "no"?
**Expertise File:** `.pi/ceo-agents/expertise/contrarian.md`

### 6. **Compounder**
**Perspective:** Long-term leverage, compound effects, platform thinking
**Questions:** What compound effects does this create? Will this give us an unfair advantage over time?
**Expertise File:** `.pi/ceo-agents/expertise/compounder.md`

### 7. **Custom Oracle**
**Perspective:** Domain-specific expertise (customize for your industry)
**Questions:** What do domain experts know about this? Regulatory/compliance concerns?
**Expertise File:** `.pi/ceo-agents/expertise/custom-oracle.md`

### 8. **Market Strategist**
**Perspective:** Competitive positioning, market timing, go-to-market
**Questions:** How does this position us competitively? Is timing right? Market adoption risk?
**Expertise File:** `.pi/ceo-agents/expertise/market-strategist.md`

### 9. **Moonshot**
**Perspective:** Radical innovation, asymmetric bets, breakthrough possibilities
**Questions:** Is there a bigger opportunity here? What's the moonshot play?
**Expertise File:** `.pi/ceo-agents/expertise/moonshot.md`

---

## How Agent Expertise Works

Each agent has a persistent expertise file that evolves:

### Initial State
```
ceo.md
├── Role Description — What this agent brings
├── Core Perspectives — Their lens on problems
├── Decision History — Table of all decisions they've participated in
└── Learning Notes — What they've learned over time
```

### After Each Deliberation

Agents update their files with:
1. **Decision Record** — Topic, position taken, outcome
2. **Learning** — What they learned from the debate
3. **Pattern Recognition** — How this fits with past decisions
4. **Accuracy Tracking** — How did their prediction fare?

### Example Update

```markdown
| Date | Topic | Position | Outcome | Notes |
|------|-------|----------|---------|-------|
| 2026-03-24 | Acquisition Offer | "Pursue, but negotiate harder" | TBD | Concerned about valuation, team retention |
```

---

## Deliberation Quality Metrics

The board improves over time. Track:

1. **Decision Quality** — How well do decisions age?
2. **Agent Agreement** — Which agents tend to align?
3. **Contrarian Accuracy** — How often does the Contrarian spot real risks?
4. **Compounder Insight** — Which compound bets pay off?
5. **Speed** — How quickly does the board reach consensus?

---

## Best Practices

### For Brief Writers

1. **Be Specific** — Vague situations lead to weaker deliberations
2. **Include Data** — Concrete metrics help agents reason better
3. **State Constraints** — Be honest about limitations
4. **Ask Real Questions** — Don't lead the board toward a predetermined answer

### For Board Users

1. **Trust the Process** — Diverse perspectives catch blindspots
2. **Review Dissent** — The Contrarian's concerns often matter most
3. **Track Predictions** — Come back and see how the board's predictions fared
4. **Improve Expertise** — Manually update agent files with industry insights

### For Maintenance

1. **Keep Expertise Current** — Update agent files as patterns emerge
2. **Archive Decisions** — Keep decision history for reference
3. **Learn from Outcomes** — Track prediction accuracy
4. **Customize Agents** — Adjust the Custom Oracle for your industry

---

## File Structure

```
.pi/
├── README.md                           # PI workspace overview
├── ceo-agents/
│   ├── briefs/
│   │   ├── _TEMPLATE.md                # Brief template (copy this)
│   │   ├── _EXAMPLE-acquisition-offer.md # Golden example
│   │   └── [TOPIC]-[DATE].md           # Your briefs go here
│   ├── deliberations/
│   │   └── [TOPIC]-[DATE].json         # Deliberation records
│   ├── memos/
│   │   └── [TOPIC]-[DATE].md           # Decision memos
│   ├── conversations/
│   │   └── [TOPIC]-[DATE].json         # Full transcripts
│   ├── artifacts/
│   │   └── [TOPIC]-[DATE].svg          # Visual arguments
│   └── expertise/
│       ├── ceo.md
│       ├── revenue.md
│       ├── product-strategist.md
│       ├── technical-architect.md
│       ├── contrarian.md
│       ├── compounder.md
│       ├── custom-oracle.md
│       ├── market-strategist.md
│       └── moonshot.md
└── shared/
    └── context/
        └── _TEMPLATE.md                # Shared business context
```

---

## Integration with CleanExpo

The CEO Board integrates with your workflow:

- **Briefs** can reference GitHub issues or milestones
- **Memos** can be published as announcements
- **Artifacts** can embed in documentation
- **Expertise** informs prioritization and resource allocation

---

## Related Commands

- **`/hey-claude`** — Ask Claude to explain board decisions
- **`/swarm-audit`** — Audit decision-making patterns
- **`/generate-route-reference`** — Keep documentation in sync

---

## Credits

**Inspired by:** IndyDevDan's agent scaling insights
**Insight:** *"If you template your engineering, your agents can do exactly what you did. This is the big advantage. When you're not creating prescriptions, workflows, and systems for your agents to repeat, you miss out on all the true leverage."*

---

**Last Updated:** 2026-03-24
**Status:** Active
**Maintainer:** CleanExpo Team
