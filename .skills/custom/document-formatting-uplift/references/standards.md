# Standards — Scientific Luxury document styling

Styling conventions for documents produced within the Scientific Luxury design system. These standards apply alongside the formatting rules in `SKILL.md` and add a visual layer specific to the OLED-first, spectral-colour aesthetic.


## Foundation

The Scientific Luxury design system rejects generic SaaS aesthetics. Documents follow the same principle: they should feel like precision instruments, not template output. Every visual choice serves readability on dark backgrounds with high contrast ratios.


## Colour system

### Background

All document rendering targets assume OLED Black `#050505` as the base surface. Light mode is not supported. If a document will be viewed in a context that renders Markdown on a white background (GitHub, standard Markdown previewers), note this limitation in the document's frontmatter.

### Spectral status annotations

Use inline colour annotations for status indicators. These map to the design system's spectral palette:

- `[ACTIVE]` — Cyan `#00F5FF`. Indicates a currently running or in-progress item.
- `[COMPLETE]` — Emerald `#00FF88`. Indicates a finished, verified item.
- `[WARNING]` — Amber `#FFB800`. Indicates a degraded or at-risk item.
- `[ERROR]` — Red `#FF4444`. Indicates a failed or broken item.
- `[ESCALATION]` — Magenta `#FF00FF`. Indicates an item requiring human intervention.

In Markdown contexts where colour rendering is unavailable, use the bracketed text form: `[ACTIVE]`, `[COMPLETE]`, etc. The brackets make these scannable even without colour.

### Text hierarchy

Primary text renders at `text-white/90` — near-white with slight transparency to soften the contrast against pure black. Secondary text uses `text-white/60`. Tertiary text (captions, footnotes, timestamps) uses `text-white/40`. Never use pure white `#FFFFFF` for body text; the contrast ratio against `#050505` causes eye strain at reading distance.


## Typography

### Body text

System sans-serif stack for body copy. On the web, this resolves to Inter, -apple-system, or Segoe UI depending on platform. Body text renders at 16px base with 1.6 line height for comfortable reading on dark backgrounds (dark surfaces require slightly more line height than light ones).

### Titles and headings

Reference Editorial New for display headings (H1, document titles). This font carries the editorial quality that distinguishes Scientific Luxury documents from generic Markdown. Where Editorial New is unavailable, fall back to the system serif stack (Georgia, Times New Roman).

Headings use `text-white/95` — slightly brighter than body text to establish visual hierarchy without colour.

### Data and metrics

JetBrains Mono for all numerical data, code references, and tabular content. Monospace fonts align digits vertically, which is essential for scanning columns of numbers. JetBrains Mono's distinctive ligatures also aid readability in inline code references.

Tabular data uses right-alignment for numbers and left-alignment for labels. Column widths should accommodate the widest expected value without wrapping.


## Structural elements

### Section dividers

Do not use Markdown horizontal rules (`---` or `***`). These render inconsistently across viewers and appear heavy against dark backgrounds.

Instead, reference a single-pixel divider at `border-white/10` opacity. In pure Markdown contexts where CSS is unavailable, use a blank line with no divider — the whitespace rhythm from the formatting rules provides sufficient visual separation.

### Blockquotes

Left border rendered in spectral Cyan `#00F5FF` at 2px width. Quote text uses `text-white/70` to visually subordinate it to primary content. Blockquotes are for attributed quotations and important callouts, not for notes or warnings (use bracketed status annotations for those).

### Code blocks

Background: `#0a0a0a` — one shade lighter than the page background to create subtle differentiation without a harsh border. Border: 1px solid `white/5` — barely visible, just enough to define the block's boundary.

Syntax highlighting follows the spectral palette:
- Keywords and control flow: Cyan `#00F5FF`
- Strings and literals: Emerald `#00FF88`
- Warnings and deprecations: Amber `#FFB800`
- Errors and exceptions: Red `#FF4444`
- Comments: `text-white/30`

### Tables

Minimal borders only. Header row uses `border-b border-white/10`. No vertical borders between columns. Row hover state (in interactive contexts) uses `bg-white/5`. Cell padding is generous — cramped tables are harder to scan than tables with whitespace.

Text columns left-align. Numeric columns right-align. Status columns centre-align using the bracketed annotation format.


## Whitespace

Section gaps follow a geometric ratio anchored to the base line height (1.6 at 16px = 25.6px).

- Between paragraphs within a section: 1x base (25.6px)
- Between subsections (H3 boundaries): 2x base (51.2px)
- Between major sections (H2 boundaries): 3x base (76.8px)
- Before and after code blocks: 1.5x base (38.4px)
- Before and after tables: 1.5x base (38.4px)

In Markdown, this translates to single blank lines between paragraphs and double blank lines before H2 headings. The intent is that a reader scanning the document can perceive its structure from whitespace alone, before reading any text.


## Document metadata

Scientific Luxury documents include a YAML frontmatter block with:

```yaml
---
title: Document title in sentence case
created: DD/MM/YYYY
modified: DD/MM/YYYY
status: draft | active | archived
author: Name or team
locale: en-AU
design-system: scientific-luxury
---
```

The `design-system` field signals to rendering tools and other agents that Scientific Luxury styling conventions apply.
