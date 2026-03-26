# Visual Excellence Enforcer — Anti-Patterns Reference

> Extracted from `SKILL.md` §Generic UI Patterns (Auto-Reject), §Non-Negotiable Rules, and §Design Audit Checklist.

---

## Auto-Reject Patterns

These patterns indicate factory-default LLM UI and trigger immediate rejection.

### 1. Unstyled shadcn Components

```tsx
// REJECTED — no customisation applied
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// CORRECT — Scientific Luxury overrides applied
<div className="rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.01] p-6">
  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Category</p>
  <h3 className="text-lg font-light text-white/90">Title</h3>
  <div className="mt-4">Content</div>
</div>
```

### 2. Blue Primary Buttons (`bg-blue-500`)

```tsx
// REJECTED
<button className="bg-blue-500 text-white rounded-lg px-4 py-2">Submit</button>

// CORRECT
<motion.button
  className="rounded-sm border-[0.5px] border-[#00F5FF]/30 bg-transparent px-5 py-2.5 font-mono text-sm uppercase text-[#00F5FF]"
  whileHover={{ backgroundColor: 'rgba(0,245,255,0.05)' }}
  transition={{ ease: [0.19, 1, 0.22, 1] }}
>
  Submit
</motion.button>
```

### 3. White Card Backgrounds

```tsx
// REJECTED
<div className="bg-white p-4 rounded-lg">Content</div>
<div className="bg-gray-50 p-4">Content</div>
<div className="bg-gray-100 p-4">Content</div>

// CORRECT
<div className="bg-white/[0.01] p-4 rounded-sm border-[0.5px] border-white/[0.06]">Content</div>
```

### 4. Default Tailwind Grey as Primary Colour

```tsx
// REJECTED — grey as primary palette
<div className="text-gray-900 bg-gray-50">
  <h1 className="text-gray-800">Title</h1>
  <p className="text-gray-600">Description</p>
</div>

// CORRECT — white opacity hierarchy on OLED black
<div className="text-white/90 bg-[#050505]">
  <h1 className="text-white">Title</h1>
  <p className="text-white/70">Description</p>
</div>
```

### 5. Buttons Without Hover State

```tsx
// REJECTED — no hover or animation
<button className="bg-gray-200 px-4 py-2">Click</button>

// CORRECT — Framer Motion hover + tap feedback
<motion.button
  className="rounded-sm border-[0.5px] border-white/[0.1] px-4 py-2 text-white/70"
  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
  whileTap={{ scale: 0.98 }}
  transition={{ ease: [0.19, 1, 0.22, 1] }}
>
  Click
</motion.button>
```

### 6. Placeholder Content

| Rejected | Why | Correct |
|----------|-----|---------|
| "Lorem ipsum dolor sit amet" | Filler text | Real draft copy in en-AU |
| "Click here" | Non-descriptive | Action-specific label |
| Grey box image placeholders | Lazy placeholder | Styled empty state or real imagery |

### 7. Default Browser Scrollbar

The default scrollbar must be styled or hidden. Use CSS scrollbar-gutter and custom styling.

---

## Code-Level Banned Patterns

These class names trigger automatic FAIL during code audit:

| Pattern | Severity | Replacement |
|---------|----------|-------------|
| `rounded-lg` | Critical | `rounded-sm` |
| `rounded-full` (on non-orbs) | Critical | `rounded-sm` |
| `rounded-xl` | Critical | `rounded-sm` |
| `rounded-2xl`, `rounded-3xl` | Critical | `rounded-sm` |
| `bg-white` | Critical | `bg-[#050505]` or `bg-white/[0.01]` |
| `bg-gray-` (any shade) | High | `bg-white/[0.01]` or `bg-white/[0.02]` |
| `bg-slate-` (any shade) | High | `bg-white/[0.01]` or `bg-white/[0.02]` |
| `transition-all linear` | Critical | Framer Motion with physics easing |
| `transition: all 0.3s` | Critical | Framer Motion with physics easing |
| `animate-` (Tailwind) | Critical | Framer Motion `motion.div` |
| `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` | High | No shadow or subtle spectral glow |

---

## Design Audit Checklist Anti-Patterns

### Typography Violations

- Inter, Roboto, or Arial as heading font
- Headlines without presence (default size, no tracking adjustment)
- Body text wider than ~65 characters
- Only 400/700 weights used (no 500/600 hierarchy)
- Numbers not using monospace or `tabular-nums`
- Orphaned words on last line

### Colour & Surface Violations

- Background is `#000000` (too harsh) instead of `#050505`
- More than 1 accent colour family used
- Shadows using pure black instead of background-tinted shadows
- Mixed warm and cool greys
- Purple/blue "AI gradient" aesthetic

### Layout Violations

- Symmetrical grids (`grid-cols-2`, `grid-cols-4`)
- 3-column equal card rows
- `h-screen` instead of `min-h-[100dvh]`
- Complex flexbox percentage math instead of CSS Grid
- No max-width container

### Interactivity Violations

- Missing hover states on interactive elements
- No active/pressed feedback
- No visible focus ring for keyboard navigation
- Spinner instead of skeleton loader
- `window.alert()` for error states
