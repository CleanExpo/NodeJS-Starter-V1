# Standards — Generic chart styling

Portable styling conventions for data visualisations that are not tied to a specific design system. These standards work on both dark and light backgrounds, pass WCAG AA contrast requirements, and use system fonts. Apply these alongside the rules in `SKILL.md`.


## Publication-quality palette

Six colours selected to pass WCAG AA contrast on both dark (`#1a1a1a`) and light (`#ffffff`) backgrounds. Each colour is distinct under protanopia, deuteranopia, and tritanopia simulations.

```tsx
const PUBLICATION_PALETTE = {
  primary: '#4E79A7',   // Steel blue — main data series
  positive: '#59A14F',  // Forest green — growth, success, increases
  warning: '#EDC949',   // Gold — caution, approaching threshold
  negative: '#E15759',  // Coral red — decline, failure, decreases
  neutral: '#9C9C9C',   // Medium grey — reference lines, baselines
  accent: '#B07AA1',    // Muted purple — anomaly, highlight
};
```

This palette draws from the Tableau 10 family, which was designed by research into perceptual distinctness. The colours are muted enough for professional publication but saturated enough to distinguish 6 series on a busy chart.

### Colour assignment rules

The same semantic mapping applies as in the Scientific Luxury palette. Single-series charts use `primary`. Directional data uses `positive` and `negative`. Comparisons use `primary` and `neutral`. `Accent` is reserved for anomalies. Never assign colours by array index.


## Chart surface

### Background

Use the page's existing background — do not force a specific chart background colour. The chart container may use a subtle border (`1px solid rgba(0,0,0,0.1)` on light backgrounds, `1px solid rgba(255,255,255,0.1)` on dark backgrounds) with `border-radius: 4px`.

### Gridlines

Horizontal gridlines only, at low opacity:

```tsx
<CartesianGrid
  horizontal={true}
  vertical={false}
  stroke="rgba(0,0,0,0.08)"  // Light background
  // stroke="rgba(255,255,255,0.08)"  // Dark background
/>
```

No vertical gridlines. The X-axis tick marks provide sufficient alignment cues.


## Axis styling

### Tick labels

Font: system monospace stack (`"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`). Size: 11px. Colour: inherits from the page's secondary text colour, or `rgba(0,0,0,0.6)` on light backgrounds / `rgba(255,255,255,0.6)` on dark backgrounds.

```tsx
tick={{
  fill: 'rgba(0,0,0,0.6)',
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 11,
}}
```

### Axis lines

Stroke: `rgba(0,0,0,0.15)` on light backgrounds, `rgba(255,255,255,0.15)` on dark backgrounds.

### Axis labels

Every axis must have a descriptive label with units. Font: system sans-serif. Size: 12px. Colour: secondary text colour.

```tsx
label={{
  value: 'Revenue ($)',
  angle: -90,
  position: 'insideLeft',
  fill: 'rgba(0,0,0,0.5)',
}}
```


## Tooltip

Custom tooltip with a surface that matches the page context:

```tsx
// Light background context
const tooltipStyleLight = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: '4px',
  padding: '8px 12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

// Dark background context
const tooltipStyleDark = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '4px',
  padding: '8px 12px',
};
```

Tooltip labels use system monospace for values. Each value line is coloured to match the series. Include units in the value display.


## Legend

Same principles as the Scientific Luxury standard: legends are a last resort. Prefer annotation-first labels on chart elements.

When a legend is unavoidable:

- Bottom-aligned, centred
- No box border or background
- Colour indicators as small circles (8px)
- Text in the page's secondary text colour
- Horizontal layout, items separated by 24px


## Animation

CSS transitions are acceptable for generic contexts (Framer Motion is not assumed to be a dependency):

```css
.chart-bar {
  transition: height 300ms ease-out;
}

.chart-line path {
  transition: stroke-dashoffset 600ms ease-out;
}
```

If Framer Motion is available, use it following the same timing as the Scientific Luxury standard. If neither Framer Motion nor CSS transitions are practical, Recharts' built-in `isAnimationActive` with `animationDuration={400}` and `animationEasing="ease-out"` is acceptable.


## Responsive behaviour

Charts use `ResponsiveContainer` with `width="100%"` and a minimum height of 300px. Axis labels abbreviate at viewports below 640px. Labels must never overlap or truncate.


## Data formatting

### Numbers

Use `toLocaleString()` with the appropriate locale for the target audience. For en-AU contexts, use `toLocaleString('en-AU')`. Large values use K/M/B suffixes on axis ticks.

### Dates

Follow the locale convention of the target audience. For en-AU: DD/MM/YYYY full, abbreviated as "26 Mar", "Mar 2026".

### Currency

Use the locale's currency symbol. For en-AU: AUD ($). For generic international: use the three-letter ISO code (AUD, USD, GBP) to avoid ambiguity.


## Accessibility

### Contrast

All data elements must meet WCAG AA contrast ratios against the chart background:

- Text: minimum 4.5:1 for normal text, 3:1 for large text (18px+)
- Non-text elements (bars, lines, points): minimum 3:1 against adjacent colours

### Non-colour encoding

Never rely on colour alone to convey information. Supplement colour with:

- Pattern fills for bar chart segments (diagonal lines, dots, crosshatch)
- Dash patterns for line chart series (`strokeDasharray` values: solid, "8 4", "4 4", "2 4")
- Shape variation for data points (circle, square, triangle, diamond)

### Screen readers

Chart containers must have `role="img"` and `aria-label` describing the chart's key message. Detailed data should be available in a visually hidden table below the chart.

```tsx
<div role="img" aria-label="Monthly revenue trending upward from $120K in January to $185K in June">
  <ResponsiveContainer width="100%" height={300}>
    {/* chart content */}
  </ResponsiveContainer>
</div>
```
