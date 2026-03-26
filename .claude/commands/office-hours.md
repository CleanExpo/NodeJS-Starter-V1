---
id: office-hours
type: command
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
---

# /office-hours — Problem Reframing

YC-style problem reframing session. Takes a problem statement and challenges it from multiple angles before any implementation begins. This command does NOT write code — output is reframing only.

## Usage

```
/office-hours "problem statement"
/office-hours "The dashboard loads too slowly for users"
/office-hours "We need to add real-time notifications"
```

## Process

### Step 1: Restate the Problem (3 Framings)

Produce three distinct reframings of the problem:

1. **User-centric framing**: What is the user actually trying to accomplish? What pain are they feeling?
2. **Systems framing**: What architectural or technical constraint is causing this? Is it a symptom of a deeper issue?
3. **Business framing**: What is the business impact? What would solving this unlock?

### Step 2: Challenge the Key Assumption

Identify the strongest assumption embedded in the problem statement and challenge it:

- "What if the real problem is [alternative root cause]?"
- "What if we didn't need to [assumed requirement]?"
- "What if [constraint] isn't actually a constraint?"

### Step 3: Hidden Capabilities Search

Search the existing codebase for capabilities that could solve or partially solve the problem:

- Grep for related functionality
- Check existing skills, agents, and tools
- Identify unused or underused features

### Step 4: Alternative Approaches

Generate 2-3 alternative approaches ranked by effort vs impact:

| Approach | Effort | Impact | Risk | Notes |
|----------|--------|--------|------|-------|
| [Approach 1] | Low/Med/High | Low/Med/High | Low/Med/High | [Key trade-off] |
| [Approach 2] | | | | |
| [Approach 3] | | | | |

## Output Format

```markdown
# Office Hours: [Problem Statement]

## Three Framings
1. **User**: [user-centric reframing]
2. **Systems**: [technical reframing]
3. **Business**: [business impact reframing]

## Assumption Challenge
> The key assumption is: [assumption]
> Challenge: [what if this assumption is wrong?]

## Hidden Capabilities
- [Existing capability 1 that could help]
- [Existing capability 2 that could help]

## Alternative Approaches
[Table as above]

## Recommended Next Step
[Single most important action based on the reframing]
```

## When to Use

- Before starting a new feature (to avoid building the wrong thing)
- When a bug fix feels like a band-aid (to find the real problem)
- When stuck on an approach (to discover alternatives)
- When scope is growing (to refocus on the core problem)

## When NOT to Use

- For strategic/business decisions → use `/ceo-begin` instead
- For detailed planning → use the harness Phase 2 (Discovery) instead
- For active debugging → use `systematic-debugging` skill instead
