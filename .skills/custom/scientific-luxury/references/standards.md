# Scientific Luxury — Design Standards Reference

> Extracted from `SKILL.md`. Core tokens, typography, spacing, animation easings, and border rules.

---

## Colour Palette

### OLED Black Foundation

```css
--background-primary: #050505;           /* True OLED black */
--background-elevated: rgba(255, 255, 255, 0.01);
--background-hover: rgba(255, 255, 255, 0.02);
```

### Spectral Colours

| Colour      | Hex       | Usage                                |
| ----------- | --------- | ------------------------------------ |
| **Cyan**    | `#00F5FF` | Active, in-progress, primary actions |
| **Emerald** | `#00FF88` | Success, completed, approved         |
| **Amber**   | `#FFB800` | Warning, verification, awaiting      |
| **Red**     | `#FF4444` | Error, failed, rejected              |
| **Magenta** | `#FF00FF` | Escalation, human intervention       |
| **Grey**    | `#6B7280` | Pending, inactive, disabled          |

### Status Colour Mapping

```typescript
const STATUS_COLOURS = {
  pending: '#6B7280',
  in_progress: '#00F5FF',
  awaiting_verification: '#FFB800',
  completed: '#00FF88',
  failed: '#FF4444',
  escalated: '#FF00FF',
} as const;
```

### Opacity Scale — Text

```css
--text-primary:   rgba(255, 255, 255, 0.9);
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary:  rgba(255, 255, 255, 0.5);
--text-muted:     rgba(255, 255, 255, 0.4);
--text-subtle:    rgba(255, 255, 255, 0.3);
```

### Opacity Scale — Borders

```css
--border-visible: rgba(255, 255, 255, 0.1);
--border-subtle:  rgba(255, 255, 255, 0.06);
```

---

## Typography

### Font Stack

```css
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;  /* Data/Technical */
--font-sans: 'Inter', 'SF Pro Display', system-ui;        /* Editorial/Names */
```

### Hierarchy

| Element       | Font | Size    | Weight           | Tracking  |
| ------------- | ---- | ------- | ---------------- | --------- |
| Hero Title    | Sans | 5xl-6xl | Extralight (200) | Tight     |
| Section Title | Sans | 2xl-4xl | Light (300)      | Tight     |
| Label         | Sans | 10px    | Normal           | 0.2-0.3em |
| Data Value    | Mono | lg-xl   | Medium (500)     | Normal    |
| Timestamp     | Mono | 10px    | Normal           | Normal    |

---

## Borders

### Single Pixel Philosophy

```css
border: 0.5px solid rgba(255, 255, 255, 0.06);
```

### Tailwind Class

```tsx
className="border-[0.5px] border-white/[0.06]"
```

### Variants

| Variant                 | Class                                     |
| ----------------------- | ----------------------------------------- |
| Subtle (default)        | `border-[0.5px] border-white/[0.06]`      |
| Visible (hover/focus)   | `border-[0.5px] border-white/[0.1]`       |
| Spectral (active state) | `border-[0.5px] border-cyan-500/30`       |

### Corners

Only `rounded-sm` (2px) is permitted. Exception: `rounded-full` for orbs and indicators.

---

## Animation Easings

### Approved Easings (Framer Motion)

```typescript
const EASINGS = {
  outExpo: [0.19, 1, 0.22, 1],           // Primary — smooth deceleration
  smooth:  [0.4, 0, 0.2, 1],             // Gentle ease
  snappy:  [0.68, -0.55, 0.265, 1.55],   // Snappy with overshoot
};
```

### CSS Custom Properties

```css
--ease-spring:   cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
```

### Animation Engine

All animations **must** use Framer Motion. CSS transitions and `@keyframes` are prohibited.

---

## Depth Layering

### Z-Index Scale

| Layer    | z-index | Usage                              |
| -------- | ------- | ---------------------------------- |
| Base     | 0       | Default content                    |
| Elevated | 10      | Cards with elevation               |
| Overlay  | 20      | Dropdowns, popovers, tooltips      |
| Modal    | 30      | Modal dialogs, drawers             |
| Toast    | 40      | Toast notifications                |
| Tooltip  | 50      | Tooltip overlays (highest)         |

Never use arbitrary z-index values (`z-[9999]`).

### Backdrop Blur Tokens

| Token     | Value                    | Usage             |
| --------- | ------------------------ | ----------------- |
| `blur-sm` | `backdrop-blur-[4px]`    | Subtle depth hint |
| `blur-md` | `backdrop-blur-[8px]`    | Overlay panels    |
| `blur-lg` | `backdrop-blur-[12px]`   | Modal backgrounds |

Apply backdrop blur only to fixed/sticky elements. Never on scrolling containers.

---

## Design Parameters

Three configurable dials. Defaults: `DESIGN_VARIANCE=5`, `MOTION_INTENSITY=5`, `VISUAL_DENSITY=3`.

| Parameter        | Range | Effect                                    |
| ---------------- | ----- | ----------------------------------------- |
| DESIGN_VARIANCE  | 1-10  | Layout complexity (asymmetric → orbital)  |
| MOTION_INTENSITY | 1-10  | Animation density (entry-only → advanced) |
| VISUAL_DENSITY   | 1-10  | Content spacing (luxury → cockpit)        |

Immutable constraints (OLED Black, `rounded-sm`, spectral colours, single-pixel borders, Framer Motion) are **never** overridden by parameter values.

---

## Navigation Patterns

| Breakpoint            | Pattern              | Details                                         |
| --------------------- | -------------------- | ----------------------------------------------- |
| Desktop (>=1024px)    | Fixed sidebar        | 240px width, collapsible to 64px icon-only      |
| Tablet (768-1023px)   | Overlay sidebar      | Slides in from left, backdrop blur behind        |
| Mobile (<768px)       | Bottom navigation    | 4-5 items max, icon + label, min-h-[60px]       |

Active nav item: spectral Cyan `#00F5FF` indicator (2px left border or bottom border on mobile).

---

## Australian Localisation

| Element  | Format             | Example           |
| -------- | ------------------ | ----------------- |
| Date     | DD/MM/YYYY         | 23/01/2026        |
| Time     | H:MM am/pm         | 2:30 pm           |
| Timezone | AEST/AEDT          | 2:30 pm AEDT      |
| Currency | AUD ($)            | $1,234.56         |
| Spelling | Australian English | colour, behaviour |
