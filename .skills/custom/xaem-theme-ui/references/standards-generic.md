# Generic Theme Generation Standards

> Portable theme generation patterns for any dark-mode design system. No project-specific references.

---

## Two-Pass Pipeline

### Pass 1: Generate

Define the creative parameters of the theme:

1. **Colour palette** — 4-6 colours with semantic roles (primary, success, warning, danger, accent, neutral)
2. **Glow/shadow intensity** — Inner opacity, outer opacity, spread radius per tier (low, medium, high)
3. **Animation timing scale** — Duration tokens for micro-interactions, transitions, breathing, ambient
4. **Typography weight distribution** — Weight assignments for hero, title, body, data, label
5. **Opacity hierarchy** — Text opacity steps and border opacity steps

### Pass 2: Translate

Convert generated values into implementable code:

1. **CSS custom properties** — `:root` variables
2. **TypeScript design token file** — Typed `const` object
3. **Framework config extension** — Tailwind `theme.extend` or equivalent
4. **Animation presets** — Framer Motion / CSS transition presets
5. **Status colour mapping** — Semantic status → colour lookup

---

## Colour Palette Standards

### Minimum Requirements

- Define at least 4 semantic roles (primary, success, warning, danger)
- All colours must pass WCAG AA contrast (4.5:1) against the background
- Each colour must be visually distinct from every other at reduced opacity
- No pure white as a theme colour

### Generation Strategies

| Strategy        | Method                              | Best For                          |
| --------------- | ----------------------------------- | --------------------------------- |
| Analogous       | Colours within 30 degrees on wheel  | Calm, harmonious interfaces       |
| Complementary   | Opposite sides of the wheel         | High-contrast, alert-heavy UIs    |
| Triadic         | Three colours at 120 degree spacing | Balanced, data-rich displays      |
| Split-complement| One base + two adjacent complements | Vibrant without harsh contrast    |

### Contrast Verification

```
For each colour in palette:
  contrast_ratio = relative_luminance(colour) / relative_luminance(background)
  ASSERT contrast_ratio >= 4.5
```

---

## Glow/Shadow Intensity

Define three tiers of visual emphasis:

| Tier   | Use Case            | Inner Opacity | Outer Opacity | Spread    |
| ------ | ------------------- | ------------- | ------------- | --------- |
| Low    | Ambient presence    | 15-25%        | 8-12%         | 12-24px   |
| Medium | Interactive default | 35-45%        | 18-25%        | 30-50px   |
| High   | Alert / active      | 55-65%        | 28-35%        | 50-80px   |

---

## Animation Timing Scale

Define 4-6 duration tokens:

| Token    | Purpose                    | Typical Range |
| -------- | -------------------------- | ------------- |
| fast     | Micro-interactions         | 0.1-0.3s      |
| normal   | Standard transitions       | 0.3-0.6s      |
| slow     | Emphasised transitions     | 0.5-1.0s      |
| breathe  | Breathing pulse loops      | 1.5-3.0s      |
| ambient  | Background ambient effects | 2.0-5.0s      |

All durations must use easing functions. Linear timing should be avoided.

---

## Typography Weight Distribution

Map font weights to semantic roles:

| Role  | Typical Range | Purpose              |
| ----- | ------------- | -------------------- |
| Hero  | 100-300       | Large display text   |
| Title | 200-400       | Section headings     |
| Body  | 300-500       | Paragraph text       |
| Data  | 400-600       | Numeric/code values  |
| Label | 300-500       | Form/field labels    |

---

## Opacity Hierarchy

### Text Opacity (6 steps)

```
primary   → 0.85-0.95  (main content)
secondary → 0.65-0.75  (supporting content)
tertiary  → 0.45-0.55  (de-emphasised)
muted     → 0.35-0.45  (subtle)
subtle    → 0.25-0.35  (barely visible)
ghost     → 0.15-0.25  (decorative)
```

### Border Opacity (3 steps)

```
visible → 0.08-0.12  (clear separation)
subtle  → 0.04-0.08  (soft separation)
ghost   → 0.02-0.04  (hint of structure)
```

---

## Code Output Format

### CSS Variables

```css
:root {
  --theme-primary: [hex];
  --theme-success: [hex];
  --theme-warning: [hex];
  --theme-danger: [hex];
  --duration-fast: [value]s;
  --duration-normal: [value]s;
  --text-primary: rgba(255, 255, 255, [opacity]);
  --border-visible: rgba(255, 255, 255, [opacity]);
}
```

### TypeScript Tokens

```typescript
export const THEME = {
  colours: { primary: '[hex]', success: '[hex]', /* ... */ },
  durations: { fast: [number], normal: [number], /* ... */ },
  weights: { hero: [number], title: [number], /* ... */ },
} as const;
```

---

## Theme Validation Checklist

- [ ] All colours pass contrast check against background
- [ ] Glow intensities within defined bounds
- [ ] Animation durations within defined ranges
- [ ] Typography weights within defined ranges
- [ ] Opacity hierarchy has correct number of steps
- [ ] CSS variables are valid syntax
- [ ] TypeScript tokens compile without errors
- [ ] No structural constraints overridden
