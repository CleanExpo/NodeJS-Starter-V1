# Standards — Generic document styling

Portable styling conventions for documents that are not tied to a specific design system. These standards work in any Markdown renderer, any colour scheme, and any platform. Apply these alongside the formatting rules in `SKILL.md`.


## Typography

### Font stack

Body text uses the system sans-serif stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. This renders a native-feeling font on every platform without requiring font downloads.

Code and data use the system monospace stack: `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace`.

### Size scale

The typographic scale follows a 1.25 ratio (Major Third):

- Body text: 1rem (16px baseline)
- H3 subheadings: 1.25rem (20px)
- H2 section headings: 1.5rem (24px)
- H1 document title: 2rem (32px) — used once per document

Do not use font sizes between these steps. The scale creates consistent visual rhythm; arbitrary sizes break it.

### Line height

Body text: 1.5x the font size. This provides comfortable reading density for screens. Headings: 1.2x — tighter line height for short text that does not need the same breathing room as paragraphs.


## Whitespace

### Vertical rhythm

Consistent spacing anchored to the body line height (1.5 at 16px = 24px):

- Between paragraphs: 1x (24px) — one blank line in Markdown
- Between subsections: 2x (48px) — two blank lines before H3 when preceded by content
- Between major sections: 2.5x (60px) — two blank lines before H2
- Before and after code blocks: 1.5x (36px)
- Before and after tables: 1.5x (36px)

In Markdown, the practical implementation is: one blank line between all block elements, two blank lines before H2 headings. Markdown renderers normalise multiple blank lines, but the two-blank-line convention signals intent to human readers editing the source.

### Horizontal margins

Body text should not exceed 80 characters per line in source Markdown. Longer lines are harder to read and produce awkward diffs in version control. Most Markdown renderers handle line wrapping at display time, but keeping source lines under 80 characters improves the editing experience.


## Headings

Sentence case for all headings. "Database connection pooling" not "Database Connection Pooling". Title case is reserved for proper nouns and product names within headings.

Maximum two levels per section. An H2 introduces a major topic; an H3 may subdivide it. If the content calls for H4, consider whether the H3 section should be split into two H3 sections instead, or whether the H4 content belongs in a paragraph with a bold lead-in.


## Tables

### Alignment

- Text columns: left-aligned
- Numeric columns: right-aligned
- Status or boolean columns: centre-aligned

### Borders

Minimal borders. Markdown tables inherently render a header separator; no additional visual borders are needed. In contexts where CSS is available, use only a bottom border on the header row and no other borders.

### Cell content

Each cell should contain a single value or a short phrase. If a cell requires more than 10 words, the content is better expressed as prose outside the table, with the table providing a summary view.

### Column headers

Short, specific labels. "Response time (ms)" not "The average response time of the endpoint measured in milliseconds". Units go in the header, not repeated in every cell.


## Lists

Bullet lists for genuinely unordered, independent items. Numbered lists for sequential steps. If a list exceeds 7 items, consider whether some items can be grouped into prose paragraphs with the list reserved for a summary.

Nested lists should not exceed one level of nesting. Two levels of bullet nesting (a sub-list within a list) signals that the content needs a different structure — either prose paragraphs or a separate subsection.


## Code blocks

Specify the language identifier after the opening triple backtick for syntax highlighting: ` ```typescript `, ` ```python `, ` ```bash `. Use ` ```text ` for output that is not code but benefits from monospace rendering (log output, file trees).

Inline code (single backtick) is for referencing code identifiers within prose: function names, variable names, file paths, command names. It is not for emphasis — use bold or italics for emphasis.


## Blockquotes

Use blockquotes for attributed quotations and for callouts that require visual distinction from surrounding prose. Do not use blockquotes as a substitute for indentation or for general notes.

For warnings and notes, prefer inline markers: "**Note**: ..." or "**Warning**: ..." at the start of a paragraph, rather than a blockquote. This keeps the content in the main text flow rather than visually separating it.


## Links

Use descriptive link text, not bare URLs. "[Authentication guide](./docs/auth.md)" not "see https://example.com/docs/auth.md". The link text should describe the destination, not instruct the reader: "the authentication guide" not "click here to read the authentication guide".

Reference-style links at the bottom of the document are preferred for long URLs or frequently repeated links. This keeps the source Markdown readable.


## Document metadata

Generic documents include a minimal frontmatter block:

```yaml
---
title: Document title in sentence case
created: DD/MM/YYYY
modified: DD/MM/YYYY
status: draft | active | archived
author: Name or team
locale: en-AU
---
```

The `locale` field ensures that any agent or tool processing the document applies the correct spelling conventions.
