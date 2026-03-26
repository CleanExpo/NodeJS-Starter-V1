# Standards — Scientific Luxury chart styling

Styling conventions for data visualisations produced within the Scientific Luxury design system. These standards apply alongside the rules in `SKILL.md` and add the visual layer specific to the OLED-first, spectral-colour aesthetic.


## Foundation

The Scientific Luxury design system treats data visualisations as precision instruments. Charts follow the same principle as the rest of the system: every visual choice serves legibility on dark backgrounds with high contrast ratios. Default charting library aesthetics — grey grids, white surfaces, decorative colour — are replaced entirely.


## Chart surface

### Background

All chart rendering assumes OLED Black `#050505` as the base surface. The chart area itself has no border and no distinct background colour — it inherits the page surface directly.

The chart container uses `#0a0a0a` with a `1px solid rgba(255,255,255,0.05)` border and `rounded-sm` (4px border radius). This creates subtle differentiation from the page without a heavy border treatment. No shadows, no gradients on the container.

### Gridlines

Horizontal gridlines only. Vertical gridlines are removed entirely.

```tsx
<CartesianGrid
  horizontal={true}
  vertical={false}
  stroke="rgba(255,255,255,0.05)"
/>
```

At 5% white opacity, gridlines are perceptible when the reader looks for them to estimate values, but they recede behind the data at casual viewing distance. This is deliberate — the grid is a reference tool, not a visual element.


## Spectral palette

The six semantic colour slots, defined as a reusable object:

```tsx
const SPECTRAL_PALETTE = {
  primary: '#00F5FF',   // Cyan — main data series, active states, current values
  positive: '#00FF88',  // Emerald — growth, success, above-target, increases
  warning: '#FFB800',   // Amber — caution, approaching threshold, needs attention
  negative: '#FF4444',  // Red — decline, failure, below-target, decreases
  neutral: 'rgba(255,255,255,0.4)',  // Reference lines, baselines, secondary context
  accent: '#FF00FF',    // Magenta — escalation, anomaly, requires human intervention
};
```

### Colour assignment rules

Single-series charts use `primary`. Two-series comparisons (current vs. previous) use `primary` and `neutral`. Directional data (profit/loss, growth/decline) uses `positive` and `negative`. The `accent` colour is reserved for outliers, anomalies, and items requiring escalation — it should appear rarely.

Never assign colours based on array index. Every colour assignment must be justified by the data's semantic meaning.


## Axis styling

### Tick labels

Font: JetBrains Mono. Size: 11px. Colour: `rgba(255,255,255,0.6)`.

```tsx
tick={{
  fill: 'rgba(255,255,255,0.6)',
  fontFamily: 'JetBrains Mono',
  fontSize: 11,
}}
```

JetBrains Mono aligns digits vertically, which is essential for scanning numeric axis ticks. The 60% white opacity creates readable text that does not compete with the data elements at full opacity.

### Axis lines

Stroke: `rgba(255,255,255,0.1)`. Slightly more visible than gridlines but still subordinate to data.

```tsx
axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
```

### Axis labels

Descriptive text with units. Font: system sans-serif. Size: 12px. Colour: `rgba(255,255,255,0.4)`.

```tsx
label={{
  value: 'Revenue (AUD)',
  angle: -90,
  position: 'insideLeft',
  fill: 'rgba(255,255,255,0.4)',
}}
```

Y-axis labels are rotated -90 degrees and positioned inside-left. X-axis labels are positioned inside-bottom with a -5 offset. Every axis must have a label with units — "Revenue (AUD)", "Response time (ms)", "Active users".


## Tooltip

Custom tooltip component with a dark surface that matches the chart aesthetic:

```tsx
const tooltipStyle = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',      // rounded-sm
  padding: '8px 12px',
};

const tooltipLabelStyle = {
  fontFamily: 'JetBrains Mono',
  fontSize: '11px',
  color: 'rgba(255,255,255,0.6)',
  margin: '0 0 4px 0',
};

const tooltipValueStyle = {
  fontFamily: 'JetBrains Mono',
  fontSize: '13px',
  margin: 0,
  // color: inherit from series colour
};
```

The tooltip label shows the X-axis value (date, category). Each value line shows the series name and formatted value, coloured to match the series stroke. No decorative elements, no shadows, no arrows.

When relevant, include a delta indicator: `+12.4%` in Emerald or `-3.2%` in Red, using the spectral palette to reinforce directional semantics.


## Legend

Legends are a last resort. Prefer annotation-first design: labels placed directly on chart elements (line endpoints, bar segments).

When a legend is unavoidable:

```tsx
<Legend
  verticalAlign="bottom"
  align="center"
  iconType="circle"
  iconSize={8}
  wrapperStyle={{
    paddingTop: '12px',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'JetBrains Mono',
    fontSize: '11px',
    border: 'none',
    background: 'none',
  }}
/>
```

Bottom-aligned, no box border, no background. Colour indicators are small circles (8px). Text at `rgba(255,255,255,0.4)`. Items separated by 24px horizontal gap.


## Animation

All chart entry animations use Framer Motion integration, not Recharts' built-in `isAnimationActive`.

| Chart type | Animation | Duration | Easing |
|------------|-----------|----------|--------|
| Line | Path draw (stroke-dashoffset) | 600ms | ease-out |
| Bar | Height grow from baseline | 300ms + 50ms stagger | ease-out |
| Area | Opacity fade 0 to 0.15 | 400ms | ease-out |
| Metric card | Number count-up | 500ms | ease-out |

No bounce, no overshoot, no elastic easing. Data animations are precise, not playful.

```tsx
// Framer Motion wrapper example
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  <ResponsiveContainer width="100%" height={300}>
    {/* chart content */}
  </ResponsiveContainer>
</motion.div>
```


## Responsive behaviour

Charts use `ResponsiveContainer` with `width="100%"` and a minimum height of 300px.

```tsx
<ResponsiveContainer width="100%" height={300} minWidth={320}>
  {/* chart content */}
</ResponsiveContainer>
```

At viewports below 640px, axis labels switch to abbreviated forms: "Mar" instead of "March", "$12K" instead of "$12,000". Labels must never overlap or truncate.


## Data formatting

### Numbers

Use `toLocaleString('en-AU')` for number formatting. Large values use suffixes: K (thousands), M (millions), B (billions).

```tsx
tickFormatter={(value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}}
```

### Dates

DD/MM/YYYY for full dates. Abbreviated forms on axes: "26 Mar", "Mar 2026", "2026" — density determined by the time range of the data.

### Currency

AUD ($) with the dollar sign prefix. No cents for values above $100. Two decimal places for values below $100.
