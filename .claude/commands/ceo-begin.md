# Command: /ceo-begin

**Category:** CEO Board Deliberations
**Description:** Begin a CEO Board deliberation on a strategic decision

## Usage

```
/ceo-begin
```

Or with a topic:

```
/ceo-begin "Should we pivot to enterprise customers?"
```

## What It Does

This command orchestrates a multi-agent CEO Board deliberation:

1. **Brief Review** — Loads your decision brief from `.pi/ceo-agents/briefs/`
2. **Agent Assembly** — Summons the 9 board members:
   - CEO, Revenue, Product Strategist, Technical Architect
   - Contrarian, Compounder, Custom Oracle
   - Market Strategist, Moonshot
3. **Moderated Debate** — Each agent shares perspective and challenges others
4. **Learning** — Agent expertise files updated with decision history
5. **Decision Memo** — Final memo saved to `.pi/ceo-agents/memos/`

## Before You Start

Prepare your brief:

1. Copy template: `.pi/ceo-agents/briefs/_TEMPLATE.md`
2. Fill in:
   - **Situation** — What's the context?
   - **Stakes** — What's at risk or possible?
   - **Constraints** — What are our limitations?
   - **Key Questions** — What does the board need to weigh in on?
3. Save as: `.pi/ceo-agents/briefs/[TOPIC]-[DATE].md`

**Example brief:**
```
.pi/ceo-agents/briefs/enterprise-pivot-2026-03-24.md
```

## Example

```
/ceo-begin "enterprise-pivot-2026-03-24"
```

## What You'll See

1. **Agent Positions** — Each agent presents their view
2. **Debate** — Agents question each other, challenge assumptions
3. **Decision Memo** — Final recommendation with all perspectives documented
4. **Artifacts** — Visual decision trees and tension maps (SVG)
5. **Learning** — Expertise files updated with decision record

## Output Location

After deliberation, find outputs at:

```
.pi/ceo-agents/
├── memos/[TOPIC]-[DATE].md          # Decision memo
├── conversations/[TOPIC]-[DATE].json # Full transcript
├── artifacts/[TOPIC]-[DATE].svg      # Visual arguments
└── expertise/[AGENT].md              # Updated expertise files
```

## Related Commands

- **`/hey-claude`** — Get system context for questions
- **`/swarm-audit`** — Audit decision-making quality
- **`/generate-route-reference`** — Update system documentation

## Tips

- **Be specific in your brief** — Vague situations lead to weaker deliberations
- **Include data points** — Concrete metrics help agents reason better
- **Revisit decisions** — Review past memos to see how predictions fared
- **Update expertise files** — Manually adjust agent perspectives over time

---

**See Also:**
- [.pi/README.md](../../.pi/README.md) — Full PI workspace documentation
- [CLAUDE.md](../../CLAUDE.md) — All available commands
- [SYSTEM_DOCS.md](../../SYSTEM_DOCS.md) — System architecture
