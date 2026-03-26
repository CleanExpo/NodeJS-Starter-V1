# XAEM Theme UI — Anti-Patterns Reference

> Extracted from `SKILL.md` §Anti-Patterns and §The Two Laws. Patterns that violate structural constraints during theme generation.

---

## Anti-Pattern 1: Overriding OLED Black Background

**Why it fails**: Background is structural, not thematic. Changing it destroys the visual hierarchy foundation.

```typescript
// REJECTED — overrides structural constraint
export const THEME = {
  background: '#1A1A2E',  // NOT ALLOWED
  // ...
};

// CORRECT — background is locked, theme controls colours only
export const THEME = {
  spectral: {
    primary: '#00D4FF',
    // ...
  },
  // Background is NOT part of the theme — it is structural
};
```

---

## Anti-Pattern 2: Linear Transitions in Presets

**Why it fails**: Violates the physics-based motion requirement. Linear motion feels mechanical and lifeless.

```typescript
// REJECTED
export const themeMotion = {
  fadeIn: {
    transition: { duration: 0.3, ease: 'linear' },  // BANNED
  },
};

// CORRECT
export const themeMotion = {
  fadeIn: {
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },  // outExpo
  },
};
```

---

## Anti-Pattern 3: Pastel or Low-Saturation Colours

**Why it fails**: Insufficient contrast against OLED black. Colours appear washed out and lack the spectral intensity required.

```typescript
// REJECTED — saturation below 70%, fails contrast check
export const THEME = {
  spectral: {
    primary: '#88AACC',   // Pastel blue — saturation ~30%
    success: '#99CC99',   // Pastel green — saturation ~25%
    warning: '#CCBB88',   // Muted gold — saturation ~35%
  },
};

// CORRECT — high saturation, passes 4.5:1 contrast against #050505
export const THEME = {
  spectral: {
    primary: '#00F5FF',   // Cyan — saturation 100%
    success: '#00FF88',   // Emerald — saturation 100%
    warning: '#FFB800',   // Amber — saturation 100%
  },
};
```

**Constraint**: All spectral colours must have saturation >= 70% and pass 4.5:1 contrast ratio against `#050505`.

---

## Anti-Pattern 4: Symmetrical Grid Layouts in Themes

**Why it fails**: Layout is structural, not thematic. Themes control colour, timing, and glow — not layout patterns.

```tsx
// REJECTED — theme should not define layout
const themeLayout = {
  grid: 'grid-cols-2 lg:grid-cols-4 gap-4',  // NOT A THEME CONCERN
};

// CORRECT — layout is locked to timeline/asymmetric
// Themes only define: spectral palette, glow, timing, weights, opacity
```

---

## Anti-Pattern 5: Non-`rounded-sm` Border Radius in Tokens

**Why it fails**: Border radius is structural. Themes cannot modify it.

```typescript
// REJECTED
export const THEME = {
  borderRadius: {
    card: 'rounded-lg',    // STRUCTURAL — not themeable
    button: 'rounded-xl',  // STRUCTURAL — not themeable
  },
};

// CORRECT — border radius is not part of theme config
// rounded-sm is enforced by the structural layer (scientific-luxury skill)
```

---

## Anti-Pattern 6: CSS `@keyframes` Instead of Framer Motion

**Why it fails**: Bypasses the physics-based animation engine. CSS keyframes cannot express spring physics.

```css
/* REJECTED */
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
.breathing { animation: breathe 2s ease-in-out infinite; }

/* CORRECT — use Framer Motion preset */
```

```typescript
// CORRECT
export const themeMotion = {
  breathing: {
    animate: { opacity: [1, 0.6, 1], scale: [1, 1.05, 1] },
    transition: {
      duration: THEME.durations.breathe,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

---

## Anti-Pattern 7: White Text at 100% Opacity

**Why it fails**: Harsh against OLED black. Breaks the six-step opacity hierarchy.

```tsx
// REJECTED
<p className="text-white">Full white text</p>

// CORRECT — use opacity hierarchy
<p className="text-white/90">Primary text</p>     {/* --text-primary */}
<p className="text-white/70">Secondary text</p>   {/* --text-secondary */}
<p className="text-white/50">Tertiary text</p>    {/* --text-tertiary */}
```

**Constraint**: Maximum text opacity is 0.95. Use the six-step scale: `0.9 → 0.7 → 0.5 → 0.4 → 0.3 → 0.2`.

---

## Structural vs Thematic Summary

| Property         | Structural (Locked) | Thematic (Customisable) |
| ---------------- | ------------------- | ----------------------- |
| Background       | `#050505`           | --                      |
| Border width     | `0.5px`             | --                      |
| Border radius    | `rounded-sm`        | --                      |
| Animation engine | Framer Motion       | --                      |
| Layout pattern   | Timeline/asymmetric | --                      |
| Status icons     | Breathing orbs      | --                      |
| Spectral colours | --                  | Six hex values          |
| Glow intensity   | --                  | Inner/outer/spread      |
| Animation timing | --                  | Duration scale          |
| Typography weight| --                  | Weight distribution     |
| Opacity scale    | --                  | Text + border steps     |
| Easing curves    | --                  | Preset selection        |
