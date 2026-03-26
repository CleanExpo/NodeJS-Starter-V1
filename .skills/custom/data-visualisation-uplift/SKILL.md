---
id: data-visualisation-uplift
name: data-visualisation-uplift
type: rigid
version: 1.0.0
created: 26/03/2026
modified: 26/03/2026
status: active
metadata:
  author: NodeJS-Starter-V1
  locale: en-AU
description: >
  Override default chart aesthetics. Replaces grey gridlines, rainbow palettes,
  and legend-heavy layouts with spectral data semantics, OLED-optimised dark
  themes, and annotation-first design. Triggers on chart creation, dashboard
  data displays, metrics visualisation, and any Recharts or Chart.js usage.
context: fork
---

# Data visualisation uplift

LLMs and default charting libraries produce visualisations with predictable failure modes: grey gridlines on white backgrounds, rainbow colour palettes with no semantic meaning, oversized legends that compete with the data, and placeholder axis labels that communicate nothing. This skill replaces those defaults with spectral data semantics, OLED-optimised dark themes, and annotation-first design that foregrounds the data itself.

The skill is rigid. Every chart produced under its governance must pass the eval criteria at the end of this file. There are no soft recommendations here — each rule exists because its violation is detectable and its correction is measurable.


## When to apply

### Positive triggers

Activate this skill when the task involves producing or revising data visualisations:

- "chart", "graph", "plot", "visualisation", "visualize", "data display"
- "dashboard data", "metrics", "KPI", "analytics view"
- "Recharts", "Chart.js", "D3", "charting library"
- Any task where the primary output is a chart component, dashboard panel, or data-driven visual
- Metric cards, sparklines, or single-value KPI displays

### Negative triggers

Do not activate for tasks where the output is non-visual data processing:

- Data pipeline or ETL logic (no visual output)
- Database queries or migrations
- API endpoint creation that returns raw JSON
- Statistical computation without a rendering target
- Test file authoring for chart components (use `tdd` instead)


## Banned defaults

Eight anti-patterns that charting libraries produce by default. Each is banned unconditionally.

| # | Banned pattern | Why it's bad | Replacement |
|---|---------------|-------------|-------------|
| 1 | Grey gridlines on white background | Zero contrast hierarchy; the grid competes with the data instead of receding behind it. On OLED displays, white backgrounds waste power and cause eye strain in dark environments. | Horizontal-only gridlines at `rgba(255,255,255,0.05)` on `#050505` background. The grid whispers; the data speaks. |
| 2 | Pie charts with more than 4 segments | Human perception cannot accurately compare angles beyond 3-4 slices. A 7-segment pie chart is a guessing game, not a visualisation. | Horizontal bar chart sorted by value, or a treemap for part-to-whole relationships exceeding 4 categories. |
| 3 | Rainbow colour palettes | Colours carry no semantic meaning. The reader cannot infer whether red means "bad" or is simply the fifth colour in the sequence. Rainbow palettes also fail multiple forms of colour blindness. | Spectral palette mapped to data semantics: Cyan for primary/active, Emerald for positive/growth, Amber for warning/caution, Red for negative/decline. |
| 4 | Oversized legends consuming more than 15% of chart area | The legend becomes a separate document the reader must cross-reference against the chart. Cognitive load doubles because the eye travels between legend and data. | Inline labels directly on chart elements (annotation-first), or a minimal bottom-aligned legend with `text-white/40` and no box border. |
| 5 | "Value" / "Label" / "Series 1" axis labels | Placeholder text that shipped to production. The reader has no idea what the Y-axis measures or what units apply. | Descriptive axis labels with units: "Revenue (AUD)", "Response time (ms)", "Active users". JetBrains Mono at 11px, `text-white/60`. |
| 6 | Default browser tooltips or unstyled tooltip boxes | White tooltip on white chart, or a browser-native title popup. Both break visual continuity and look unfinished. | Styled tooltip: `bg-[#0a0a0a]`, `border border-white/10`, `rounded-sm`, JetBrains Mono, spectral-coloured value text. |
| 7 | Equal-weight bidirectional gridlines (both X and Y) | Creates a cage around the data. Vertical gridlines are almost never useful for time-series or categorical data — the axis tick marks suffice. | Horizontal gridlines only, at `rgba(255,255,255,0.05)`. Vertical gridlines removed entirely. The X-axis tick marks provide sufficient alignment cues. |
| 8 | Vertical bar charts with more than 8 categories | Labels overlap, rotate to 45 degrees, or truncate. The reader tilts their head or squints. The chart fails its primary job of making data legible. | Horizontal bar chart (labels read naturally left-to-right), or group categories and show a drill-down interaction. |

Reference: See `references/anti-patterns.md` for full before/after Recharts JSX examples of each pattern.


## Replacement standards

These rules govern all chart output when this skill is active.

### Spectral palette semantics

Colours are not decorative — they encode meaning. Every colour in a chart must map to a data semantic, and that mapping must be consistent across all charts in the same view.

The spectral palette defines six semantic slots:

- **Primary** `#00F5FF` (Cyan) — the main data series, active states, current values
- **Positive** `#00FF88` (Emerald) — growth, success, above-target, increases
- **Warning** `#FFB800` (Amber) — caution, approaching threshold, needs attention
- **Negative** `#FF4444` (Red) — decline, failure, below-target, decreases
- **Neutral** `rgba(255,255,255,0.4)` — reference lines, baselines, secondary context
- **Accent** `#FF00FF` (Magenta) — escalation, anomaly, requires human intervention

When a chart has only one series, use Primary. When comparing two series (e.g., current vs. previous period), use Primary and Neutral. Add Positive/Negative only when the data has directional semantics (profit/loss, growth/decline). Accent is reserved for outliers and anomalies.

For generic (non-Scientific Luxury) projects, see `references/standards-generic.md` for a publication-quality palette that passes WCAG AA on both dark and light backgrounds.

### Chart surface

Background colour is `#050505` — OLED Black. The chart area has no border. The surrounding container may use `bg-[#0a0a0a]` with `border border-white/5` and `rounded-sm` to create subtle differentiation from the page surface.

Horizontal gridlines only, rendered at `stroke="rgba(255,255,255,0.05)"`. No vertical gridlines. The gridlines exist to aid value estimation, not to cage the data. At 5% white opacity on a near-black background, they are perceptible only when the reader looks for them.

### Axis styling

Axis labels use JetBrains Mono at 11px with `fill="rgba(255,255,255,0.6)"`. This provides clear readability without competing with data elements. Axis lines themselves render at `stroke="rgba(255,255,255,0.1)"` — slightly more visible than gridlines but still subordinate to data.

Every axis must have a descriptive label with units. Time-series X-axes format dates according to the data density: "Mar 26" for daily, "Mar 2026" for monthly, "2026" for yearly. Numeric Y-axes include the unit in the axis label, not repeated on every tick.

### Tooltip design

Tooltips use a dark surface that matches the chart aesthetic:

- Background: `#0a0a0a`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border radius: `rounded-sm` (4px)
- Font: JetBrains Mono for values, system sans-serif for labels
- Value colour: matches the series colour from the spectral palette
- Padding: 8px 12px

The tooltip shows the data point's label, value with units, and — when relevant — the delta from the previous period. No decorative elements, no shadows, no arrows.

### Legend design

Legends are a last resort. The preferred approach is annotation-first: labels placed directly on or adjacent to chart elements (line endpoints, bar segments, area fills). When a legend is unavoidable (more than 2 series with overlapping paths), it must be:

- Bottom-aligned, below the chart
- No box border or background
- Text at `text-white/40`
- Colour indicators as small circles (8px), not rectangles
- Horizontal layout, with items separated by 24px

### Animation

Chart entry animations use Framer Motion, not CSS transitions. The data should materialise with purpose:

- Line charts: path draw animation, 600ms, `ease-out`
- Bar charts: height grow from baseline, 300ms per bar with 50ms stagger, `ease-out`
- Area charts: opacity fade from 0 to target opacity, 400ms, `ease-out`
- Metric cards: number count-up animation, 500ms, `ease-out`

No bounce, no overshoot, no elastic easing on data visualisations. Data animations should feel precise, not playful.

### Responsive behaviour

Charts must be responsive. The container uses `ResponsiveContainer` (Recharts) with `width="100%"` and a minimum height of 300px. On viewports below 640px, axis labels may reduce to abbreviated forms ("Mar" instead of "March", "K" suffix instead of full thousands) but must never overlap or truncate.

### Styling references

For Scientific Luxury projects, apply `references/standards.md` — full spectral palette, OLED background, JetBrains Mono axes, Framer Motion animations.

For all other projects, apply `references/standards-generic.md` — publication-quality palette, system fonts, minimal gridlines, WCAG AA compliance on both dark and light backgrounds.


## Chart archetypes

Four chart types with prescribed configurations. Each archetype exists because it matches a specific data communication purpose.

### Line chart (time series)

**Purpose**: Show change over time. The X-axis is temporal; the Y-axis is the measured value.

Use line charts when the data has a natural temporal ordering and the reader needs to perceive trends, inflection points, and rates of change. A line implies continuity between data points — do not use line charts for categorical data where no interpolation is meaningful.

Configuration: stroke width 2px, no data point dots by default (add dots only when the dataset has fewer than 12 points), smooth curve type `monotoneX` for natural interpolation that respects data order.

Template: `assets/templates/scientific-luxury/line-chart.tsx.md` or `assets/templates/generic/line-chart.tsx.md`

### Bar chart (comparison)

**Purpose**: Compare discrete values across categories. Each bar is an independent measurement.

Use horizontal bars by default. Vertical bars are acceptable only when the number of categories is 6 or fewer and the labels are short (under 10 characters). Horizontal orientation ensures labels read naturally and accommodates longer category names.

Configuration: bar radius `[4, 4, 0, 0]` for top corners only, gap between bars at 20% of bar width, fill colour from the spectral palette based on data semantics.

Template: `assets/templates/scientific-luxury/bar-chart.tsx.md` or `assets/templates/generic/bar-chart.tsx.md`

### Area chart (volume and accumulation)

**Purpose**: Show magnitude over time. The filled area emphasises volume rather than position, making it suited for revenue, traffic, or resource consumption data.

Area charts combine the trend visibility of line charts with a visual weight that communicates scale. Use them when the absolute magnitude matters as much as the trend direction. For comparing multiple series, use stacked areas only when the series sum to a meaningful total.

Configuration: fill opacity 0.15 (the fill hints at volume without obscuring gridlines), stroke on top edge at full opacity, gradient fill from series colour at top to transparent at bottom.

Template: `assets/templates/scientific-luxury/area-chart.tsx.md` or `assets/templates/generic/area-chart.tsx.md`

### Metric card (single KPI)

**Purpose**: Display a single key performance indicator with context. The primary value dominates; supporting context (trend, comparison, label) is subordinate.

Metric cards are not charts in the traditional sense, but they are the most common data visualisation element in dashboards. A well-designed metric card communicates the value, its unit, its trend direction, and its status in a single glance.

Configuration: primary value in JetBrains Mono at 32px, label in system sans at 12px `text-white/40`, trend indicator using spectral colours (Emerald for up, Red for down, Neutral for flat), optional sparkline beneath the value.

Template: `assets/templates/scientific-luxury/metric-card.tsx.md` or `assets/templates/generic/metric-card.tsx.md`


## en-AU enforcement

All chart labels, tooltips, annotations, and surrounding text produced under this skill must use Australian English spelling and conventions.

Spelling: colour, behaviour, optimisation, organised, licence (noun), analyse, centre, defence, honour, programme (but "program" for software).

Dates on axes use DD/MM/YYYY format or abbreviated forms (26 Mar, Mar 2026). Currency values use AUD ($) with the dollar sign prefix. Times reference AEST or AEDT. Sentence case for all chart titles and axis labels.


## Eval criteria

Every chart produced under this skill must pass all eight checks. A single failure means the chart requires revision.

| # | Criterion | PASS condition |
|---|----------|---------------|
| 1 | OLED-optimised surface | Chart background is `#050505` or darker. No white or light-grey backgrounds. Container uses `#0a0a0a` with subtle border. |
| 2 | Spectral palette semantics | Every colour maps to a documented semantic (primary, positive, warning, negative, neutral, accent). No decorative or arbitrary colour usage. |
| 3 | No banned patterns | Zero instances of: grey-on-white gridlines, >4-segment pie charts, rainbow palettes, oversized legends, placeholder axis labels, default tooltips, bidirectional gridlines, >8-category vertical bars. |
| 4 | Annotation-first | Data labels appear directly on or adjacent to chart elements where feasible. Legend used only when annotation is impractical (>2 overlapping series). |
| 5 | Axis discipline | Every axis has a descriptive label with units. JetBrains Mono at 11px. `text-white/60`. No "Value", "Label", or "Series 1" text. |
| 6 | Tooltip styling | Custom tooltip with `#0a0a0a` background, `border-white/10`, `rounded-sm`, JetBrains Mono values. No default browser or library tooltips. |
| 7 | Responsive | Chart uses `ResponsiveContainer` with `width="100%"`. Labels do not overlap or truncate at 640px viewport width. |
| 8 | en-AU compliance | Australian spelling, DD/MM/YYYY dates, AUD currency, sentence case titles. |

Run this checklist mentally before declaring any chart task complete. If any criterion fails, fix it before delivering.
