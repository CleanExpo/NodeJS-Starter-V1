# XAEM Theme UI — Before/After Examples

> Demonstrates the transformation from default theme values to a custom Scientific Luxury theme preset.

---

## Example 1: Default Theme → Midnight Aurora

### BEFORE — Default / No Theme System

```typescript
// Hardcoded colours scattered across components
const ActiveBadge = () => (
  <span className="bg-blue-500 text-white rounded-full px-3 py-1">Active</span>
);

const ErrorBadge = () => (
  <span className="bg-red-500 text-white rounded-full px-3 py-1">Error</span>
);

// No duration tokens — magic numbers everywhere
<div className="transition-all duration-300 ease-linear hover:bg-gray-100">
  Content
</div>
```

**Problems**: Hardcoded Tailwind colours, no semantic mapping, `rounded-full` (banned), CSS transitions (banned), `ease-linear` (banned), `bg-gray-100` (banned).

### AFTER — Midnight Aurora Theme Applied

```typescript
// theme-config.ts — Midnight Aurora preset
export const THEME = {
  spectral: {
    primary: '#00D4FF',   // Ice Blue
    success: '#00E87A',   // Mint
    warning: '#FF9F00',   // Deep Amber
    danger: '#FF3355',    // Crimson
    accent: '#CC44FF',    // Violet
    neutral: '#5A6270',   // Slate
  },
  glow: {
    low: { inner: '25', outer: '12', spread: 25 },
    medium: { inner: '45', outer: '22', spread: 50 },
    high: { inner: '65', outer: '32', spread: 70 },
  },
  durations: {
    fast: 0.24,
    normal: 0.48,
    slow: 0.72,
    breathe: 2.4,
    pulse: 1.8,
    ambient: 3.6,
  },
  weights: {
    hero: 100,
    title: 200,
    body: 400,
    data: 500,
    label: 400,
  },
} as const;
```

```tsx
// Components use theme tokens — no hardcoded colours
import { THEME } from './theme-config';

const StatusBadge = ({ status }: { status: keyof typeof STATUS_MAP }) => {
  const colour = STATUS_MAP[status];
  return (
    <motion.span
      className="rounded-sm border-[0.5px] px-3 py-1 font-mono text-xs"
      style={{
        borderColor: `${colour}30`,
        color: colour,
        backgroundColor: `${colour}08`,
      }}
      whileHover={{ backgroundColor: `${colour}15` }}
      transition={{ duration: THEME.durations.fast, ease: [0.19, 1, 0.22, 1] }}
    >
      {status.replace('_', ' ')}
    </motion.span>
  );
};
```

---

## Example 2: CSS Variables — Default → Solar Flare

### BEFORE — No CSS Variables

```css
/* Colours hardcoded in component styles */
.header { background: #1a1a2e; }
.accent { color: #00bcd4; }
.success { color: #4caf50; }
.error { color: #f44336; }
```

### AFTER — Solar Flare Theme via CSS Variables

```css
:root {
  /* Solar Flare Spectral Palette */
  --spectral-primary: #FFAA00;
  --spectral-success: #44FF66;
  --spectral-warning: #FF6600;
  --spectral-danger: #FF2222;
  --spectral-accent: #FF44AA;
  --spectral-neutral: #7A7A80;

  /* Tight Glow */
  --glow-low-spread: 12px;
  --glow-med-spread: 16px;
  --glow-high-spread: 24px;

  /* Faster Timing (-15%) */
  --duration-fast: 0.17s;
  --duration-normal: 0.34s;
  --duration-slow: 0.51s;
  --duration-breathe: 1.7s;
  --duration-pulse: 1.28s;
  --duration-ambient: 2.55s;

  /* Heavier Weights */
  --weight-hero: 200;
  --weight-title: 400;
  --weight-data: 600;

  /* Text Opacity (standard) */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  --text-muted: rgba(255, 255, 255, 0.4);
  --text-subtle: rgba(255, 255, 255, 0.3);
  --text-ghost: rgba(255, 255, 255, 0.2);

  /* Border Opacity (standard) */
  --border-visible: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-ghost: rgba(255, 255, 255, 0.03);
}
```

---

## Key Transformation Principles

| Before | After |
|--------|-------|
| Hardcoded colours in components | Semantic tokens from theme config |
| CSS `transition: linear` | Framer Motion with physics easing |
| `rounded-full` / `rounded-lg` | `rounded-sm` (structural, not themed) |
| No glow/shadow system | Three-tier glow intensity scale |
| Magic number durations | Named duration tokens with bounds |
| Single font weight | Five-level weight distribution |
| Binary text opacity (100% or muted) | Six-step opacity hierarchy |
