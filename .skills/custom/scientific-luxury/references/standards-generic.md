# Premium Dark-Mode Design Standards (Generic)

> Portable dark-mode design standards for any project. No project-specific branding or colour palette references.

---

## Colour Foundation

### Background

Use a near-black background, not pure `#000000`. A value like `#050505` or `#0A0A0A` gives depth without the harshness of pure black.

```css
--background-primary: #0A0A0A;
--background-elevated: rgba(255, 255, 255, 0.02);
--background-hover: rgba(255, 255, 255, 0.04);
```

### Accent Colours

Define a limited palette (4-6 colours) with semantic meaning. Every colour should have a clear purpose — do not introduce colours without a role.

| Role    | Purpose                          |
| ------- | -------------------------------- |
| Primary | Active states, CTAs, in-progress |
| Success | Completed, approved, positive    |
| Warning | Caution, awaiting, verification  |
| Danger  | Error, failed, rejected          |
| Accent  | Escalation, special states       |
| Neutral | Disabled, inactive, pending      |

### Text Opacity Hierarchy

Use opacity rather than grey shades for text hierarchy on dark backgrounds:

```css
--text-primary:   rgba(255, 255, 255, 0.9);
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary:  rgba(255, 255, 255, 0.5);
--text-muted:     rgba(255, 255, 255, 0.35);
```

---

## Typography

### Font Selection

- **Monospace** for data values, code, timestamps: system monospace or a premium mono like JetBrains Mono
- **Sans-serif** for headings and body: choose a distinctive typeface rather than defaults
- Avoid Inter as a heading font — it is overused in AI-generated UIs

### Hierarchy

Control hierarchy through **weight and colour**, not just scale:

| Element       | Weight           | Tracking         |
| ------------- | ---------------- | ---------------- |
| Hero Title    | Extralight (200) | Tight (-0.02em)  |
| Section Title | Light (300)      | Tight (-0.01em)  |
| Body Text     | Normal (400)     | Normal           |
| Data Value    | Medium (500)     | Normal           |
| Label         | Normal (400)     | Wide (0.2-0.3em) |

---

## Borders

### Thin Border Philosophy

Use sub-pixel or single-pixel borders with low opacity for elegance:

```css
border: 0.5px solid rgba(255, 255, 255, 0.06);
```

### Corner Radius

Choose one consistent radius and apply it everywhere. Avoid mixing `rounded-lg`, `rounded-xl`, and `rounded-2xl` in the same interface. A sharp radius (2px) conveys precision; larger radii convey softness.

---

## Animation

### Easing Curves

Use physics-based easing functions. Avoid `linear` and default `ease`:

```css
--ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:   cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
```

### Engine

Use a declarative animation library (e.g., Framer Motion for React) rather than CSS transitions for complex interactions. Reserve CSS transitions for simple hover state colour changes.

### Performance

- Animate only `transform` and `opacity` — never `top`, `left`, `width`, `height`
- Isolate perpetual animations in leaf components
- Use `will-change` sparingly and only when needed

---

## Layout

### Asymmetric Splits

Avoid 50/50 symmetrical layouts. Use ratios like 60/40 or 70/30 for visual interest.

### Avoid Equal-Column Card Grids

Three equal cards in a row is the most common AI-generated layout pattern. Use timeline layouts, masonry grids, or horizontal scroll instead.

---

## Depth Layering

### Z-Index Scale

Define a consistent z-index scale rather than using arbitrary values:

| Layer    | z-index |
| -------- | ------- |
| Base     | 0       |
| Elevated | 10      |
| Overlay  | 20      |
| Modal    | 30      |
| Toast    | 40      |
| Tooltip  | 50      |

### Backdrop Blur

Apply backdrop blur only to fixed/sticky elements. Avoid on scrolling containers — causes GPU repaint storms on mobile.

---

## Status Indicators

Replace icon-based status indicators with animated elements:

- **Breathing dot**: Scales and fades subtly for active/live states
- **Glow pulse**: Box-shadow animation for error/attention states
- **Colour transition**: Smooth colour shift for state changes

---

## Content Quality

- No placeholder text (Lorem Ipsum, "Click here")
- No generic names ("John Doe", "Acme Corp")
- Avoid round numbers that look artificial (`99.99%`, `$100.00`)
- Write real copy appropriate to the domain

---

## Responsive Strategy

| Breakpoint    | Strategy                                         |
| ------------- | ------------------------------------------------ |
| Desktop       | Full layout with sidebar navigation              |
| Tablet        | Overlay sidebar or collapsed navigation          |
| Mobile        | Bottom navigation bar, stacked single-column     |

Use `min-h-[100dvh]` instead of `h-screen` for full-height sections.
