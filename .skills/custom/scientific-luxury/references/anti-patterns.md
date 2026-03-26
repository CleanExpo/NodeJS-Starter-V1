# Scientific Luxury — Anti-Patterns Reference

> Extracted from `SKILL.md` §Banned Elements and §AI Tells. Each ban includes before/after code examples.

---

## Banned Element: Standard Bootstrap/Tailwind Cards

**Why banned**: Generic, overused. Betrays factory-default aesthetic.

```tsx
// BEFORE (banned)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-bold">Metric</h3>
    <p className="text-3xl">1,234</p>
  </div>
</div>

// AFTER (correct)
<div className="relative pl-4">
  <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
  <div className="space-y-8">
    {items.map((item, index) => (
      <TimelineNode key={item.id} item={item} index={index} />
    ))}
  </div>
</div>
```

---

## Banned Element: Generic Neon Borders (`border-cyan-500`)

**Why banned**: Cheap gaming aesthetic. Lacks precision.

```tsx
// BEFORE (banned)
<div className="border-2 border-cyan-500 rounded-lg p-4">
  Content
</div>

// AFTER (correct)
<div className="border-[0.5px] border-white/[0.06] rounded-sm bg-white/[0.01] p-4">
  Content
</div>

// Spectral border for active state:
<div className="border-[0.5px] border-cyan-500/30 rounded-sm p-4">
  Content
</div>
```

---

## Banned Element: Symmetrical Grids (`grid-cols-2`, `grid-cols-4`)

**Why banned**: "The Bento Trap" — symmetrical grids are the most generic layout pattern.

```tsx
// BEFORE (banned)
<div className="grid grid-cols-2 gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// AFTER (correct) — 60/40 asymmetric split
<div className="flex">
  <div className="flex-[3]">Main content</div>
  <div className="flex-[2]">Sidebar</div>
</div>

// AFTER (correct) — 70/30 asymmetric split
<div className="flex">
  <div className="flex-[7]">Main content</div>
  <div className="flex-[3]">Sidebar</div>
</div>
```

---

## Banned Element: Standard Rounded Corners (`rounded-lg`, `rounded-xl`)

**Why banned**: Soft, unprofessional appearance. Violates sharp precision aesthetic.

```tsx
// BEFORE (banned)
<div className="rounded-lg p-4">Content</div>
<div className="rounded-xl p-4">Content</div>
<div className="rounded-2xl p-4">Content</div>

// AFTER (correct)
<div className="rounded-sm p-4">Content</div>

// Exception: Orbs and indicators may use rounded-full
<div className="h-2 w-2 rounded-full bg-cyan-500" />
```

---

## Banned Element: Lucide/FontAwesome Icons for Status

**Why banned**: Visual noise. Lacks scientific precision.

```tsx
// BEFORE (banned)
import { CheckCircle, XCircle, Clock } from 'lucide-react';
<CheckCircle className="text-green-500" />

// AFTER (correct) — Breathing orb
<motion.div
  className="h-2 w-2 rounded-full"
  style={{ backgroundColor: '#00FF88' }}
  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

---

## Banned Element: Linear CSS Transitions

**Why banned**: Mechanical, lifeless motion. Violates physics-based animation requirement.

```tsx
// BEFORE (banned)
<div className="transition-all duration-300 ease-linear hover:bg-gray-100">
  Content
</div>

// AFTER (correct) — Framer Motion with physics easing
<motion.div
  whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
>
  Content
</motion.div>
```

---

## Banned Element: White/Light Backgrounds

**Why banned**: Generic SaaS look. Violates OLED Black foundation.

```tsx
// BEFORE (banned)
<div className="bg-white min-h-screen">
  <div className="bg-gray-50 p-4">Card</div>
</div>

// AFTER (correct)
<div className="bg-[#050505] min-h-screen">
  <div className="bg-white/[0.01] p-4">Card</div>
</div>
```

---

## Banned Element: `text-muted-foreground`

**Why banned**: Semantic but generic. Does not convey precise opacity hierarchy.

```tsx
// BEFORE (banned)
<p className="text-muted-foreground">Secondary text</p>

// AFTER (correct) — explicit opacity
<p className="text-white/40">Secondary text</p>
<p className="text-white/70">More prominent secondary text</p>
```

---

## AI Tells — Visual & CSS

| Tell | Why Banned | Alternative |
|------|-----------|-------------|
| Neon outer glows (`box-shadow` glows) | Generic AI signature | Inner borders or tinted shadows |
| Pure `#000000` | Too harsh | OLED Black `#050505` |
| Oversaturated custom accents | Off-palette | Use predefined spectral colours only |
| Gradient text on headers (`bg-clip-text`) | Top AI tell | Solid colour text with weight/opacity hierarchy |
| 3-column equal card layouts | Most generic AI pattern | Asymmetric grids, zig-zag, horizontal scroll |

## AI Tells — Typography

| Tell | Why Banned | Alternative |
|------|-----------|-------------|
| Inter font | Overused AI default | JetBrains Mono (data), Editorial New (headings), system sans-serif (body) |
| Oversized H1 | Scale without hierarchy | Control hierarchy with weight and colour |
| "Elevate", "Seamless", "Unleash", "Next-Gen" | AI copywriting cliches | Concrete, specific language |

## AI Tells — Content

| Tell | Why Banned | Alternative |
|------|-----------|-------------|
| "John Doe" / "Jane Smith" | Generic placeholder | Diverse, creative, realistic names |
| Round numbers (`99.99%`, `50%`, `$100.00`) | AI tells | Organic data: `47.2%`, `$87.50` |
| "Acme Corp" | Generic placeholder | Contextual, premium brand names |
| Lorem Ipsum | Filler text | Real draft copy in en-AU |

## AI Tells — Components

| Tell | Why Banned | Alternative |
|------|-----------|-------------|
| Generic SVG egg avatars | Factory default | Styled initials, photo placeholders, squircle shapes |
| Pill badges for "New"/"Beta" | Generic | Square badges or plain text labels |
| Accordion FAQ sections | Overused pattern | Side-by-side lists, searchable help, progressive disclosure |
