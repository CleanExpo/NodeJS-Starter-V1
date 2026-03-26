---
name: ui-calibration-examples
type: calibration
version: 1.0.0
created: 26/03/2026
---

# UI Rubric Calibration Examples

Few-shot scoring anchors for qa-validator and design-reviewer agents.

## 1. Scientific Luxury Compliance

### Score 20 — Exemplar
```tsx
// OLED Black background, spectral colours, single-pixel borders, rounded-sm
<div className="bg-[#050505] min-h-screen">
  <div className="border border-white/10 rounded-sm p-6">
    <h1 className="font-editorial text-white text-2xl">Dashboard</h1>
    <span className="text-[#00F5FF] font-mono text-sm">Active</span>
  </div>
</div>
// Framer Motion animation with physics-based easing
<motion.div animate={{ opacity: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} />
```

### Score 10 — Partial Compliance
```tsx
// Correct palette but wrong corners and animation
<div className="bg-[#050505]">
  <div className="border border-white/10 rounded-lg p-6"> {/* VIOLATION: rounded-lg */}
    <motion.div transition={{ duration: 0.3 }}> {/* VIOLATION: no physics easing */}
```

### Score 0 — Design System Ignored
```tsx
// White background, Tailwind defaults, no design system
<div className="bg-white rounded-xl shadow-lg p-8">
  <h1 className="text-gray-900 text-3xl font-bold">Dashboard</h1>
  <span className="text-blue-500">Active</span> {/* Not a spectral colour */}
</div>
```

## 2. Visual Hierarchy

### Score 20 — Clear Hierarchy
```
H1: font-editorial, text-2xl (2x body), tracking-tight, text-white
H2: font-sans, text-lg (1.5x body), text-white/80
Body: font-sans, text-sm, text-white/60
Data: font-mono (JetBrains Mono), text-xs, text-[#00F5FF]
Spacing: geometric ratio — section gap 2rem, element gap 1rem, inline gap 0.5rem
Max 3 heading levels per view.
```

### Score 10 — Hierarchy Present but Inconsistent
```
H1 and H2 use same font size (only weight differs)
Body text and data text use same colour
Spacing is arbitrary (mix of 8px, 12px, 20px, 16px with no pattern)
```

### Score 0 — No Hierarchy
```
All text is the same size and weight
No distinction between labels, data, and descriptions
No spacing rhythm — elements packed with uniform padding
```

## 3. Interaction & Animation

### Score 20 — Framer Motion with Physics
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Breathing orb indicator */}
  <motion.span
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    className="w-2 h-2 rounded-full bg-[#00FF88]"
  />
</motion.div>
```

### Score 10 — CSS Transitions Instead
```tsx
// Using CSS transitions instead of Framer Motion
<div className="transition-all duration-300 hover:scale-105">
  <span className="animate-pulse w-2 h-2 rounded-full bg-green-500" />
</div>
```

### Score 0 — No Animation or Linear
```tsx
// Static UI, no hover states, no transitions
<div>
  <span className="w-2 h-2 rounded-full bg-green-500" /> {/* Static dot */}
</div>
```

## 4. Accessibility

### Score 20 — WCAG 2.1 AA Compliant
```tsx
<button
  aria-label="Close dialog"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClose()}
  className="text-white/80 hover:text-white focus:ring-2 focus:ring-[#00F5FF] focus:outline-none"
>
  {/* Contrast ratio: white/80 on #050505 = 12.6:1 (passes AAA) */}
</button>
```

### Score 10 — Basic Accessibility
```tsx
<button onClick={handleClose} className="text-white/40">
  {/* Missing aria-label, no focus ring, contrast 3.2:1 (fails AA) */}
</button>
```

### Score 0 — Inaccessible
```tsx
<div onClick={handleClose}> {/* div instead of button — not keyboard accessible */}
  <span className="text-white/20"> {/* contrast 1.8:1 — fails all standards */}
</div>
```

## 5. Responsive Design

### Score 20 — Mobile-First
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-8">
  <button className="min-h-[44px] min-w-[44px]"> {/* Touch target >= 44px */}
  {/* Breakpoints: 640/768/1024/1280 — standard Tailwind */}
  {/* No horizontal scroll at any width */}
</div>
```

### Score 10 — Desktop-First
```tsx
<div className="grid grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
  {/* Desktop-first: starts at 3 cols, reduces down */}
  {/* Touch targets not considered */}
</div>
```

### Score 0 — Desktop Only
```tsx
<div className="grid grid-cols-4 w-[1200px]">
  {/* Fixed width — overflows on mobile */}
  {/* No responsive breakpoints */}
</div>
```
