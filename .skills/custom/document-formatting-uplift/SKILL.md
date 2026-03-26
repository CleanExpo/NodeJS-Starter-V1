---
id: document-formatting-uplift
name: document-formatting-uplift
type: rigid
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
metadata:
  author: NodeJS-Starter-V1
  locale: en-AU
description: >
  Override default LLM document formatting. Replaces wall-of-bullets, header spam,
  and AI prose tells with prose-first hierarchy, typographic rhythm, and intentional
  whitespace. Triggers on document creation, reports, guides, specs, and READMEs.
context: fork
---

# Document formatting uplift

LLMs produce documents with predictable failure modes: bullet walls where paragraphs belong, four levels of headings for a single idea, and filler phrases that signal machine authorship. This skill replaces those defaults with prose-first hierarchy, deliberate whitespace, and direct language.

The skill is rigid. Every document produced under its governance must pass the eval criteria at the end of this file. There are no soft recommendations here — each rule exists because its violation is detectable and its correction is measurable.


## When to apply

### Positive triggers

Activate this skill when the task involves producing or revising written documents:

- "write a document", "write a report", "write a guide", "format document"
- README creation or revision
- Specification, proposal, or architecture document authoring
- "documentation style", "technical writing", "formatting"
- Any task where the primary output is a Markdown or prose document

### Negative triggers

Do not activate for tasks where the output is primarily code, configuration, or data:

- Code-only implementations (use `tdd` instead)
- API route or endpoint creation
- Test file authoring
- Database migrations or schema changes
- Git operations, CI/CD configuration


## Banned defaults

Twelve anti-patterns that LLMs produce by default. Each is banned unconditionally.

| # | Banned pattern | Why it's bad | Replacement |
|---|---------------|-------------|-------------|
| 1 | Wall of bullets for connected ideas | Fragments relationships between concepts; forces the reader to reconstruct the narrative | Prose paragraphs that link cause to effect, context to consequence |
| 2 | H2 to H3 to H4 nesting for one paragraph of content | Creates visual noise and false hierarchy; a single paragraph does not warrant three heading levels | Appropriate heading depth — maximum 2 levels per section |
| 3 | Opening a section by restating the heading | Wastes the reader's time; they already read the heading | Lead with the actual content — the first sentence should advance understanding |
| 4 | "Let's dive in", "Here's a comprehensive overview", "In conclusion" | Filler phrases that signal machine authorship and add zero information | Direct opening sentence that delivers content immediately |
| 5 | "It's worth noting", "It's important to mention", "As we can see" | Hedge phrases that pad word count while diluting authority | Delete entirely — if it's worth noting, just note it |
| 6 | Every list item starting with **bold text** + dash | Creates monotonous visual rhythm and buries the actual content | Mix formatting as content demands — bold only when emphasis is warranted |
| 7 | Overuse of "Key" prefix ("Key features", "Key benefits", "Key takeaways") | Generic qualifier that communicates nothing; everything in a document should be key | Use specific nouns — "Authentication methods", "Cost drivers", "Performance bottlenecks" |
| 8 | Three-column comparison tables for prose content | Forces nuanced comparisons into rigid cells; truncates reasoning | Prose with inline comparisons, or two-column tables when data is genuinely tabular |
| 9 | Exclamation marks in technical documentation | Unprofessional tone; reads as marketing copy rather than engineering communication | Period or no punctuation. Technical docs inform, they do not exclaim |
| 10 | Generic section ordering (Overview, Features, Getting Started) | Cookie-cutter structure ignores what the reader actually needs first | Content-appropriate structure driven by the document's purpose and audience |
| 11 | Emoji in headers or bullet points | Visual clutter that degrades scannability and prints poorly | Words only in technical documentation |
| 12 | Code blocks for non-code content | Misuses monospace formatting; makes text harder to read and copy | Proper formatting — bold, italics, blockquotes as semantics demand |

Reference: See `references/anti-patterns.md` for full before/after examples of each pattern.


## Replacement standards

These rules govern all document output when this skill is active.

### Prose-first principle

Default to paragraphs. A bullet list is appropriate only when the items are genuinely unordered, independent, and benefit from visual separation. If the items form a sequence, tell a story, or build on each other, write them as prose.

Connected ideas demand connected prose. The paragraph is the fundamental unit of technical writing because it preserves the relationships between statements — cause and effect, condition and consequence, claim and evidence. Bullets destroy these relationships by isolating each statement into a fragment.

### Heading discipline

Use a maximum of two heading levels per page section. An H2 introduces a major section; an H3 may subdivide it if the content genuinely warrants subdivision. H4 and deeper headings are banned except in reference documentation with established hierarchies (API docs with method/parameter/return structure).

Every heading must use sentence case. Title Case Looks Like Marketing Copy. Sentence case reads as technical communication.

### Whitespace rhythm

Apply geometric spacing ratios: section gaps are larger than paragraph gaps, which are larger than line gaps. In Markdown this means a blank line between paragraphs and two blank lines before a new H2 section. The reader's eye uses whitespace to parse document structure before reading a single word.

### Table usage

Tables are for structured data with consistent columns — configuration values, API parameters, comparison matrices with discrete values. If a cell would contain more than one sentence, the content belongs in prose. A table that compares two approaches across subjective dimensions (flexibility, maintainability, team preference) is nearly always better as prose.

### Opening sentences

The first sentence of any section must deliver content. It must not summarise what the section will cover, restate the heading, or welcome the reader. The reader chose to read this section — respect that choice by giving them information immediately.

### Styling references

For Scientific Luxury projects, apply `references/standards.md` — spectral colour annotations, OLED-friendly contrast, JetBrains Mono for data, Editorial New for titles.

For all other projects, apply `references/standards-generic.md` — system fonts, 1.25 typographic scale, minimal borders, professional whitespace.


## Document archetypes

Five document types with prescribed structures. Each structure exists because it matches how the target audience reads that type of document.

### Technical specification

**Structure**: Problem, Approach, Design, Implementation, Verification

The reader is an engineer who needs to understand what is being built and why. Lead with the problem because engineers evaluate solutions against the problem they solve. The approach section justifies the chosen path — what alternatives were considered and why this one won. Design covers architecture and data flow. Implementation is a phased plan with concrete deliverables. Verification defines how the team will know the spec has been fulfilled.

Template: `assets/templates/scientific-luxury/technical-spec.md` or `assets/templates/generic/technical-spec.md`

### User guide

**Structure**: Goal, Prerequisites, Steps, Troubleshooting

The reader wants to accomplish a specific task. State the goal so they can confirm they are reading the right document. List prerequisites so they can verify readiness before starting. Steps are sequential and numbered — this is the one context where an ordered list is correct. Troubleshooting addresses the failure modes that actual users encounter, not theoretical edge cases.

Template: `assets/templates/scientific-luxury/user-guide.md` or `assets/templates/generic/user-guide.md`

### Report

**Structure**: Summary, Findings, Evidence, Recommendations

The reader is a decision-maker who may read only the summary. The summary must stand alone — it contains the conclusion, not a preview of the conclusion. Findings present the data. Evidence supports the findings with specifics. Recommendations are actionable and tied to specific findings.

### Proposal

**Structure**: Context, Problem, Solution, Cost, Timeline

The reader needs to decide whether to invest resources. Context establishes shared understanding. The problem statement must be specific enough that the reader can verify they agree it is a problem. The solution addresses the stated problem directly. Cost and timeline are honest — padding estimates erodes trust.

### README

**Structure**: What, Why, Quick start, Architecture, Contributing

The reader is evaluating whether to use or contribute to the project. "What" is a single sentence. "Why" explains the problem this solves. Quick start gets them running in under five minutes. Architecture is a high-level map for orientation. Contributing tells them how to participate.


## en-AU enforcement

All documents produced under this skill must use Australian English spelling and conventions.

Spelling: colour, behaviour, optimisation, organised, licence (noun), analyse, centre, defence, honour, programme (but "program" for software).

Dates use DD/MM/YYYY format. Currency uses AUD ($). Times reference AEST or AEDT. Sentence case for all headings.


## Eval criteria

Every document produced under this skill must pass all eight checks. A single failure means the document requires revision.

| # | Criterion | PASS condition |
|---|----------|---------------|
| 1 | Prose-first | Connected ideas are in paragraphs, not bullet lists. Bullets used only for genuinely unordered, independent items. |
| 2 | Heading discipline | Maximum 2 heading levels per section. No H4 or deeper except in API reference docs. Sentence case throughout. |
| 3 | No filler phrases | Zero instances of "Let's dive in", "It's worth noting", "comprehensive overview", "In conclusion", or equivalent. |
| 4 | Direct openings | Every section's first sentence delivers content. No restatements of the heading. No "In this section, we will..." |
| 5 | Appropriate tables | Every table has structured, consistently-typed data. No table cells contain more than one sentence. |
| 6 | No banned formatting | No emoji in headers. No code blocks for non-code. No exclamation marks. No bold-dash list pattern throughout. |
| 7 | en-AU compliance | Australian spelling, DD/MM/YYYY dates, AUD currency, sentence case headings. |
| 8 | Archetype alignment | Document follows the prescribed structure for its type, or has a justified reason for deviation documented in a comment. |

Run this checklist mentally before declaring any document task complete. If any criterion fails, fix it before delivering.
