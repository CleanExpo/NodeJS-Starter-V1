---
title: [Specification title in sentence case]
created: DD/MM/YYYY
modified: DD/MM/YYYY
status: draft
author: [Author or team]
locale: en-AU
design-system: scientific-luxury
---

# [Specification title]

<!-- One paragraph that states what this spec covers and why it exists. No filler.
     The reader should know within 30 seconds whether this document is relevant to them. -->


## Problem

<!-- Describe the problem this specification addresses. Be specific: what is broken, missing,
     or suboptimal? Include evidence — metrics, user reports, incident references. A problem
     statement without evidence is an opinion.

     Write in prose. If there are multiple facets to the problem, use paragraphs to separate
     them. Do not use bullets unless the facets are genuinely independent. -->


## Approach

<!-- Explain the chosen solution approach and why it was selected. This section must address
     alternatives that were considered and rejected, with reasons.

     Structure as prose. If comparing approaches, write comparative paragraphs rather than
     a comparison table (unless the comparison involves discrete, measurable values). -->

### Alternatives considered

<!-- For each alternative, explain what it is, why it was considered, and why it was rejected.
     Two to three paragraphs per alternative is typical. -->


## Design

<!-- The technical design. This is the longest section and may use subsections (H3 level only).
     Include architecture descriptions, data flow explanations, and interface definitions.

     Use diagrams where they clarify relationships that prose cannot. Reference diagram files
     rather than embedding ASCII art.

     Status annotations follow the spectral palette:
     [ACTIVE] for components currently running
     [COMPLETE] for verified, shipped components
     [WARNING] for at-risk or degraded areas
     [ERROR] for known broken items -->

### Data model

<!-- Describe the data structures this spec introduces or modifies. Use a table for field
     definitions — this is genuinely tabular data with consistent columns. -->

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| | | | |

### Interface contract

<!-- Define the API surface, event contracts, or integration points. Include request/response
     examples in code blocks with the appropriate language identifier. -->


## Implementation

<!-- A phased implementation plan. Use a table for the phase overview because phases have
     consistent attributes (name, scope, duration, verification). Follow the table with
     prose paragraphs expanding on each phase. -->

| Phase | Scope | Duration | Verification |
|-------|-------|----------|-------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

<!-- Expand each phase with a paragraph describing the work, dependencies, and risks.
     Do not use bullets for phase descriptions — the work within a phase is sequential
     and interconnected. -->


## Verification

<!-- Define how the team will know the spec has been fulfilled. Each criterion must be
     testable — a human or automated system can unambiguously determine pass or fail.

     Use a numbered list here because verification criteria are checked in sequence
     and each has a binary outcome. -->

1. [Criterion]: [How to test it] — [Expected result]
2. [Criterion]: [How to test it] — [Expected result]
3. [Criterion]: [How to test it] — [Expected result]


## Open questions

<!-- List unresolved decisions that block or may alter the implementation. Each question
     should state who can answer it and what the default assumption is if no answer arrives
     by the implementation start date. Remove this section when all questions are resolved. -->
