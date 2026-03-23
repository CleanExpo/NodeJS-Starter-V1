# The PI Agent Workspace

The `.pi/` directory is the runtime workspace for all agent deliberation systems in the CleanExpo/NodeJS-Starter-V1 framework. It provides the infrastructure for multi-agent reasoning, persistent expertise tracking, decision transparency, and visual argument representation.

## What is PI?

PI stands for **Persistent Inference**—a workspace where agents collaborate, deliberate, and build institutional knowledge over time. Rather than stateless API calls, PI enables agents to:

- Work from **structured templates** that enforce consistency and quality
- Persist **expertise and memory** across multiple deliberations
- Maintain **conversation observability** for audit trails and learning
- Generate **visual arguments** (SVG diagrams, decision trees) to explain complex reasoning
- Validate all outputs before acceptance

## Directory Structure

```
.pi/
├── README.md                          # This file
├── ceo-agents/                        # CEO Board deliberation system
│   ├── briefs/                        # Board proposals (validated against template)
│   │   └── _TEMPLATE.md               # Required brief format & schema
│   ├── deliberations/                 # Full debate transcripts from each session
│   ├── memos/                         # Final decision memos with conclusions
│   ├── conversations/                 # Observability logs and conversation artifacts
│   ├── artifacts/                     # SVG diagrams, visual decision trees, arguments
│   └── expertise/                     # Persistent agent memory & learning
│       ├── ceo.md                     # CEO perspective & decision history
│       ├── revenue.md                 # Revenue/Growth agent memory
│       ├── product-strategist.md      # Product strategy expertise
│       ├── technical-architect.md     # Technical feasibility tracking
│       ├── contrarian.md              # Contrarian view & blindspot detection
│       ├── compounder.md              # Long-term leverage & compounding effects
│       ├── custom-oracle.md           # Domain-specific custom oracle
│       ├── market-strategist.md       # Market positioning & competitive insight
│       └── moonshot.md                # Moonshot/innovation possibilities
└── shared/
    └── context/                       # Shared business context (loaded by all agents)
        └── _TEMPLATE.md               # Business context schema
```

## How It Works

### 1. Brief Submission
Someone submits a brief to `ceo-agents/briefs/` describing a decision that needs the board's input. The brief is validated against `.pi/ceo-agents/briefs/_TEMPLATE.md`—missing required sections are rejected.

### 2. Deliberation
The CEO Board system (a multi-agent LLM orchestration) is invoked:
- Each of the 9 agents reads the brief
- Each agent consults their expertise file to understand their historical positions
- Agents read shared context to align on business state
- A moderated debate unfolds with structured position-taking
- All dialogue is logged to `ceo-agents/conversations/`
- Visual arguments are generated as SVG diagrams in `ceo-agents/artifacts/`

### 3. Decision & Memory
- A final decision memo is written to `ceo-agents/memos/`
- Each agent updates their expertise file with:
  - The position they took
  - What they learned
  - How their prediction fared (in future reflection sessions)
- Decision history is appended to their expertise table

### 4. Observability
Every deliberation produces:
- **Conversation Log**: Full transcript of the debate
- **Deliberation Record**: Structured decision JSON with timestamps
- **Visual Artifacts**: SVG diagrams showing tension points, consensus areas, key trade-offs
- **Memo**: Human-readable decision summary

## The CEO Board: First System on PI

The CEO Board implements IndyDevDan's innovation: **templated agent reasoning with persistent expertise**.

IndyDevDan's insight: *"If you template your engineering, your agents can do exactly what you did. This is the big advantage. When you're not creating prescriptions, workflows, and systems for your agents to repeat, you miss out on all the true leverage."*

The 9 agents on the board:
1. **CEO** — Holistic business lens, execution reality, stakeholder needs
2. **Revenue** — Growth rate, unit economics, expansion opportunities
3. **Product Strategist** — Feature prioritization, user value, roadmap consistency
4. **Technical Architect** — System design, technical debt, scalability concerns
5. **Contrarian** — "What could go wrong?", blind spots, second-order effects
6. **Compounder** — Long-term leverage, compound effects, platform thinking
7. **Custom Oracle** — Domain-specific expertise (e.g., regulatory, industry vertical)
8. **Market Strategist** — Competitive positioning, market timing, go-to-market
9. **Moonshot** — Radical ideas, asymmetric bets, innovation possibilities

Each agent has persistent expertise that evolves. Over time, patterns emerge—who collaborates well, which tensions are structural vs. temporary, which agents catch blindspots the others miss.

## Usage

### To Submit a Brief
1. Copy `.pi/ceo-agents/briefs/_TEMPLATE.md`
2. Fill in Situation, Stakes, Constraints, Key Questions
3. Save to `.pi/ceo-agents/briefs/[TOPIC]-[DATE].md`
4. The CEO Board system validates and schedules deliberation

### To Review Past Decisions
- Browse `.pi/ceo-agents/memos/` for decision summaries
- Review `.pi/ceo-agents/deliberations/` for full debate transcripts
- Check `.pi/ceo-agents/artifacts/` for visual decision trees

### To Understand Agent Expertise
- Read `.pi/ceo-agents/expertise/[AGENT].md` to see their perspective evolution
- Use decision history table to track accuracy and learning over time

## Validation & Quality Gates

All outputs are validated before being written to PI:

- **Brief validation**: Must contain Situation, Stakes, Constraints, Key Questions
- **Memo validation**: Must document all 9 agent positions, final decision, rationale
- **Artifact validation**: SVG diagrams must be self-contained and accessible
- **Expertise updates**: Must include decision context, timestamp, outcome reference

## Integration with CleanExpo

The PI workspace is independent but integrates with CleanExpo's workflow:
- Briefs can reference CleanExpo issues or milestones
- Decision memos can be published as CleanExpo announcements
- Visual artifacts can be embedded in documentation
- Agent expertise informs prioritization and resource allocation

---

**Created for CleanExpo/NodeJS-Starter-V1 framework**
**Inspired by IndyDevDan's agent scaling insights**
