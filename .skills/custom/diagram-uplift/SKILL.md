---
id: diagram-uplift
name: diagram-uplift
type: rigid
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
metadata:
  author: NodeJS-Starter-V1
  locale: en-AU
description: >
  Override default Mermaid/diagram aesthetics. Replaces grey nodes, single-colour
  diagrams, and cramped layouts with spectral node colouring, OLED-optimised
  backgrounds, and semantic visual hierarchy. Triggers on diagram creation,
  flowcharts, architecture diagrams, sequence diagrams, and ER diagrams.
---

# Diagram uplift

LLMs produce Mermaid diagrams with predictable failure modes: the default grey theme with black text, monochromatic node colouring that conveys no semantic meaning, top-down direction regardless of data flow, and zero subgraph grouping for bounded contexts. This skill replaces those defaults with spectral node colouring mapped to semantic purpose, OLED-optimised backgrounds, and layout direction that matches the diagram's conceptual flow.

The skill is rigid. Every diagram produced under its governance must pass the eval criteria at the end of this file. There are no soft recommendations here — each rule exists because its violation is detectable and its correction is measurable.


## When to apply

### Positive triggers

Activate this skill when the task involves producing or revising diagrams:

- "diagram", "flowchart", "Mermaid", "chart", "graph"
- "architecture diagram", "system diagram", "component diagram"
- "sequence diagram", "interaction diagram"
- "ER diagram", "entity relationship", "data model diagram"
- "flow diagram", "process flow", "workflow diagram"
- "visualise the flow", "show the architecture", "map the system"
- Any task where the primary output is a Mermaid code block or visual diagram

### Negative triggers

Do not activate for tasks where the output is primarily prose, code, or data:

- Document formatting (use `document-formatting-uplift` instead)
- Code-only implementations (use `tdd` instead)
- Database migrations or schema changes expressed as SQL
- Configuration files, environment variable documentation
- Textual architecture descriptions without diagram output


## Banned defaults

Eight anti-patterns that LLMs produce by default when generating Mermaid diagrams. Each is banned unconditionally.

| # | Banned pattern | Why it fails | Replacement |
|---|---------------|-------------|-------------|
| 1 | Default Mermaid theme (grey nodes, black text, white background) | Zero visual hierarchy; every node looks identical regardless of its role in the system | Custom `%%{init}%%` theme block with spectral colours and OLED background |
| 2 | Grey nodes with black text | Illegible on dark backgrounds; conveys no semantic meaning about node type | Spectral node colouring mapped to node purpose (data, success, decision, error, external) |
| 3 | Single-colour diagrams | All nodes appear equally important; the reader cannot distinguish data stores from decision points from external services | Minimum three colours per diagram, each mapped to a semantic category |
| 4 | TD (top-down) direction for everything | Sequential processes and data pipelines flow naturally left-to-right; forcing TD creates unnecessarily tall, narrow diagrams | LR for sequential flows and pipelines; TD for hierarchical relationships and org charts |
| 5 | No subgraph grouping | Flat diagrams with 10+ nodes become unreadable; bounded contexts are invisible | Subgraph boundaries for every logical grouping (frontend/backend, service boundaries, phases) |
| 6 | Default arrow styles (thin, no labels) | Relationships between nodes carry no meaning beyond "connected to" | Labelled arrows with semantic thickness; dotted for async, solid for sync, thick for critical path |
| 7 | LR (left-to-right) for hierarchical processes | Tree structures and dependency graphs read naturally top-down; forcing LR creates wide, shallow diagrams that scroll horizontally | TD for hierarchies, dependency trees, and inheritance diagrams |
| 8 | Text-heavy nodes (more than 4 words) | Long labels create oversized nodes that distort the layout and compete with the diagram's structural information | Maximum 4 words per node label; move detail to annotations or a legend |

Reference: See `references/anti-patterns.md` for full before/after examples of each pattern.


## Replacement standards

These rules govern all diagram output when this skill is active.

### Spectral node colouring

Every node in a diagram must be coloured according to its semantic role. The colour mapping is not decorative — it encodes information. A reader should be able to glance at a diagram and immediately distinguish data stores from decision points from external services, without reading any labels.

The Scientific Luxury spectral palette provides five semantic categories that cover the vast majority of system diagram node types. When a node does not fit cleanly into one category, choose the closest match. Never leave a node in the default grey.

### Layout direction

Choose the direction that matches the diagram's conceptual flow. Sequential processes — authentication flows, data pipelines, request lifecycles — flow left-to-right because the reader's eye naturally follows this direction for temporal sequences. Hierarchical structures — component trees, dependency graphs, organisational charts — flow top-down because parent-child relationships read naturally as vertical.

When a diagram contains both sequential and hierarchical elements, prefer LR for the primary flow and use subgraphs with internal TD direction for hierarchical subsections.

### Subgraph boundaries

Every diagram with more than six nodes must use subgraph grouping. Subgraphs map to bounded contexts: frontend vs backend, service boundaries, processing phases, or deployment zones. The subgraph title should name the boundary (e.g., "Frontend", "Auth Service", "Phase 1: Validation") rather than describe its contents.

Subgraph backgrounds use `#0a0a0a` — one shade lighter than the OLED base — to create subtle containment without harsh borders.

### Arrow semantics

Arrows carry meaning beyond simple connection. Synchronous calls use solid lines. Asynchronous messages use dotted lines. Critical path flows use thick lines. Data flow labels describe what is transmitted, not the mechanism: "JWT token" rather than "HTTP response", "user credentials" rather than "POST request".

### Styling references

For Scientific Luxury projects, apply `references/standards.md` — the full spectral theme configuration, node colour mapping table, and Mermaid init block.

For all other projects, apply `references/standards-generic.md` — a professional dark-mode palette with clean node styling that works in any Markdown renderer.


## Node colour mapping

Node types mapped to spectral colours. This table is the authoritative reference for which colour to apply to which node.

| Node type | Colour | Hex | Usage |
|-----------|--------|-----|-------|
| Data / storage | Cyan | `#00F5FF` | Databases, caches, file stores, message queues, state stores |
| Success / output | Emerald | `#00FF88` | Successful responses, completed states, output endpoints, healthy services |
| Decision / logic | Amber | `#FFB800` | Conditional branches, validation gates, routing logic, feature flags |
| Error / failure | Red | `#FF4444` | Error states, failed validations, circuit breakers, dead letter queues |
| External / integration | Magenta | `#FF00FF` | Third-party APIs, external services, user-facing endpoints, browser clients |

When a node serves multiple purposes, colour it by its primary role in the diagram's narrative. A database that stores error logs is still a data node (Cyan), not an error node (Red), because its architectural role is storage.


## Mermaid theme init block

Every Mermaid diagram produced under this skill must begin with this init block. Paste it verbatim before the diagram direction declaration.

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#00F5FF', 'primaryTextColor': '#ffffff',
  'primaryBorderColor': 'rgba(255,255,255,0.1)',
  'lineColor': 'rgba(255,255,255,0.3)',
  'secondaryColor': '#00FF88', 'tertiaryColor': '#FFB800',
  'background': '#050505', 'mainBkg': '#0a0a0a',
  'nodeBorder': 'rgba(255,255,255,0.1)',
  'fontFamily': 'JetBrains Mono, monospace', 'fontSize': '14px'
}}}%%
```

This configuration sets the OLED black background, spectral primary/secondary/tertiary colours, semi-transparent borders that avoid harsh edges, and JetBrains Mono for precise label alignment.

For node-specific colouring beyond the three theme slots, use inline `style` directives after the node declaration:

```
style nodeId fill:#FF4444,stroke:rgba(255,255,255,0.1),color:#ffffff
```


## en-AU enforcement

All diagram labels, annotations, and surrounding prose must use Australian English spelling and conventions.

Spelling: colour, behaviour, optimisation, organised, licence (noun), analyse, centre, defence, honour, programme (but "program" for software).

Dates use DD/MM/YYYY format. Currency uses AUD ($). Times reference AEST or AEDT. Node labels use sentence case — "User authentication" not "User Authentication".


## Eval criteria

Every diagram produced under this skill must pass all eight checks. A single failure means the diagram requires revision.

| # | Criterion | PASS condition |
|---|----------|---------------|
| 1 | Theme init block | Diagram begins with the `%%{init}%%` block (or generic equivalent). No default Mermaid theme. |
| 2 | Spectral colouring | Every node is coloured according to the node colour mapping table. No grey or default-coloured nodes. |
| 3 | Minimum three colours | At least three distinct spectral colours appear in the diagram. Single-colour diagrams are rejected. |
| 4 | Correct direction | LR for sequential flows, TD for hierarchies. Direction matches the conceptual flow of the content. |
| 5 | Subgraph grouping | Diagrams with more than six nodes use subgraph boundaries for bounded contexts. |
| 6 | Node label brevity | No node label exceeds 4 words. Detail is in annotations or a legend, not crammed into node text. |
| 7 | Arrow semantics | Arrows use labels, and line style distinguishes sync from async where both exist in the same diagram. |
| 8 | en-AU compliance | Australian spelling in all labels and annotations. Sentence case for node labels. DD/MM/YYYY for any dates. |

Run this checklist mentally before declaring any diagram task complete. If any criterion fails, fix it before delivering.
