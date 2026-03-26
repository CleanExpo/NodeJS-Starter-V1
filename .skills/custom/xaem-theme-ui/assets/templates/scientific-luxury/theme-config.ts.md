# SL Theme Config — TypeScript Template

> Scientific Luxury theme configuration. Copy and modify spectral colours, glow, timing, weights, and opacity values. Structural constraints (background, borders, radius, engine) are locked and not included.

```typescript
// theme-config.ts — Scientific Luxury Theme
// Structural constraints (bg #050505, border 0.5px, rounded-sm, Framer Motion)
// are enforced by the design system layer and are NOT part of theme config.

export const THEME = {
  /** Six spectral colours with semantic roles */
  spectral: {
    primary: '#00F5FF',   // Active, in-progress, CTA
    success: '#00FF88',   // Completed, approved, positive
    warning: '#FFB800',   // Verification, awaiting, caution
    danger: '#FF4444',    // Error, failed, rejected
    accent: '#FF00FF',    // Escalation, human intervention
    neutral: '#6B7280',   // Pending, inactive, disabled
  },

  /** Glow intensity tiers */
  glow: {
    low: { inner: '20', outer: '10', spread: 20 },
    medium: { inner: '40', outer: '20', spread: 40 },
    high: { inner: '60', outer: '30', spread: 60 },
  },

  /** Animation duration scale (seconds) */
  durations: {
    fast: 0.2,      // Micro-interactions
    normal: 0.4,    // Standard transitions
    slow: 0.6,      // Deliberate, emphasised
    breathe: 2.0,   // Breathing pulse loops
    pulse: 1.5,     // Glow pulse cycles
    ambient: 3.0,   // Background ambient effects
  },

  /** Typography weight distribution */
  weights: {
    hero: 200,       // Hero display titles
    title: 300,      // Section headings
    body: 400,       // Body text
    data: 500,       // Monospace data values
    label: 400,      // Uppercase labels
  },

  /** Text opacity hierarchy (6 steps) */
  textOpacity: {
    primary: 0.9,
    secondary: 0.7,
    tertiary: 0.5,
    muted: 0.4,
    subtle: 0.3,
    ghost: 0.2,
  },

  /** Border opacity hierarchy (3 steps) */
  borderOpacity: {
    visible: 0.1,
    subtle: 0.06,
    ghost: 0.03,
  },
} as const;

/** Physics-based easing curves — locked, not themeable */
export const EASINGS = {
  outExpo: [0.19, 1, 0.22, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  snappy: [0.68, -0.55, 0.265, 1.55] as const,
};

/** Status colour mapping */
export const STATUS_MAP = {
  pending: THEME.spectral.neutral,
  in_progress: THEME.spectral.primary,
  awaiting_verification: THEME.spectral.warning,
  verification_in_progress: THEME.spectral.warning,
  verification_passed: THEME.spectral.success,
  verification_failed: THEME.spectral.danger,
  completed: THEME.spectral.success,
  failed: THEME.spectral.danger,
  blocked: THEME.spectral.warning,
  escalated_to_human: THEME.spectral.accent,
} as const;

/** Framer Motion presets using theme values */
export const MOTION_PRESETS = {
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: THEME.durations.normal, ease: EASINGS.outExpo },
  },
  breathing: {
    animate: { opacity: [1, 0.6, 1], scale: [1, 1.05, 1] },
    transition: {
      duration: THEME.durations.breathe,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  glowPulse: (colour: string) => ({
    animate: {
      boxShadow: [
        `0 0 0 ${colour}00`,
        `0 0 ${THEME.glow.medium.spread}px ${colour}${THEME.glow.medium.inner}`,
        `0 0 0 ${colour}00`,
      ],
    },
    transition: { duration: THEME.durations.pulse, repeat: Infinity },
  }),
};
```

## Customisation Guide

1. **Change palette**: Modify `spectral` values — ensure >= 70% saturation and 4.5:1 contrast against `#050505`
2. **Adjust glow**: Modify `glow` tiers within bounds (inner 15-65%, outer 8-35%, spread 12-80px)
3. **Change timing**: Modify `durations` within bounds (see SKILL.md timing ranges)
4. **Adjust weights**: Modify `weights` within bounds (hero 100-300, title 200-400, etc.)
5. **Tune opacity**: Modify `textOpacity` and `borderOpacity` within bounds

Do **not** add background, border-radius, or animation-engine properties — those are structural.
