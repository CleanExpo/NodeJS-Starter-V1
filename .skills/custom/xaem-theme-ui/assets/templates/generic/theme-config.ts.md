# Generic Theme Config — TypeScript Template

> Portable theme configuration for any dark-mode design system. Replace values with your project's tokens.

```typescript
// theme-config.ts — Generic Dark-Mode Theme

export const THEME = {
  /** Semantic colour palette */
  colours: {
    primary: '#00B4D8',   // Active, CTAs
    success: '#06D6A0',   // Positive states
    warning: '#FFD166',   // Caution states
    danger: '#EF476F',    // Error states
    accent: '#A855F7',    // Special states
    neutral: '#6B7280',   // Disabled, inactive
  },

  /** Background tokens */
  backgrounds: {
    primary: '#0A0A0A',
    elevated: 'rgba(255, 255, 255, 0.02)',
    hover: 'rgba(255, 255, 255, 0.04)',
  },

  /** Animation duration scale (seconds) */
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    breathing: 2.0,
    ambient: 3.0,
  },

  /** Typography weight distribution */
  weights: {
    display: 200,
    heading: 300,
    body: 400,
    emphasis: 500,
    label: 400,
  },

  /** Text opacity hierarchy */
  textOpacity: {
    primary: 0.9,
    secondary: 0.7,
    tertiary: 0.5,
    muted: 0.35,
  },

  /** Border tokens */
  borders: {
    width: '1px',
    radius: '2px',
    opacity: {
      visible: 0.1,
      subtle: 0.06,
    },
  },
} as const;

/** Easing curves */
export const EASINGS = {
  smooth: [0.4, 0, 0.2, 1] as const,
  spring: [0.68, -0.55, 0.265, 1.55] as const,
  outExpo: [0.19, 1, 0.22, 1] as const,
};
```

## CSS Variables Output

```css
:root {
  /* Colours */
  --colour-primary: #00B4D8;
  --colour-success: #06D6A0;
  --colour-warning: #FFD166;
  --colour-danger: #EF476F;
  --colour-accent: #A855F7;
  --colour-neutral: #6B7280;

  /* Backgrounds */
  --bg-primary: #0A0A0A;
  --bg-elevated: rgba(255, 255, 255, 0.02);

  /* Durations */
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;

  /* Text Opacity */
  --text-primary: rgba(255, 255, 255, 0.9);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  --text-muted: rgba(255, 255, 255, 0.35);

  /* Borders */
  --border-visible: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.06);
}
```

## Customisation

- Replace colour hex values with your brand palette
- Adjust background primary to your desired dark tone
- Modify duration scale to match your animation preferences
- Extend `colours` object with additional semantic roles as needed
- Add `glow` configuration if your design system uses glow effects
