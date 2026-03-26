# ASCII Blueprint Template: Landing Page (Scientific Luxury)

> Copy and modify. All sections annotated with SL design tokens.

```
BLUEPRINT: Landing Page
═══════════════════════════════════════════════════════

DESKTOP LAYOUT (>= 1024px)
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR [OLED BG #050505, border-b border-white/[0.06]]     │
│  ┌──────────────────┐                  ┌────────────────┐   │
│  │  Logo [font-mono] │                  │  Auth CTA [CYN]│   │
│  └──────────────────┘                  └────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  HERO [full-width, asymmetric 60/40 split]                   │
│  ┌────────────────────────────────┐ ┌──────────────────┐    │
│  │  flex-[3]                       │ │  flex-[2]        │    │
│  │  p: [Category Label]           │ │  [Visual Element]│    │
│  │     text-[10px] tracking-[0.3em]│ │  [Breathing Orb] │    │
│  │     text-white/30 uppercase     │ │  [or Parallax]   │    │
│  │  H1: [Hero Headline]           │ │                  │    │
│  │     text-5xl font-extralight   │ │                  │    │
│  │     tracking-tight             │ │                  │    │
│  │  p: [Supporting copy — 2 lines]│ │                  │    │
│  │     text-white/70              │ │                  │    │
│  │  [CTA Button] [Secondary CTA]  │ │                  │    │
│  │  border-[0.5px] border-CYN/30  │ │                  │    │
│  └────────────────────────────────┘ └──────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  DATASTRIP [inline metrics bar]                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Metric 1 [CYN] │ Metric 2 [GRN] │ Metric 3 [AMB]  │    │
│  │ font-mono       │ font-mono       │ font-mono       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  FEATURES [zig-zag layout, NOT 3-column grid]                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Feature 1 [text-left]  │  [Visual — right aligned] │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  [Visual — left aligned] │  Feature 2 [text-right]  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  Feature 3 [text-left]  │  [Visual — right aligned] │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  CTA SECTION [centred, breathing orb above]                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          [Breathing Orb — CYN]                       │    │
│  │  H2: [Call to Action Headline]                       │    │
│  │  p:  [Supporting copy]                               │    │
│  │  [Primary CTA Button]                                │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  FOOTER [border-t border-white/[0.06], font-mono text-xs]    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [DD/MM/YYYY]  │  [Links]  │  [Copyright]           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

MOBILE LAYOUT (< 768px)
┌───────────────────────────────┐
│  NAVBAR (compact)              │
├───────────────────────────────┤
│  HERO (full-width, stacked)    │
│  Label → H1 → p → CTA         │
├───────────────────────────────┤
│  DATASTRIP (horizontal scroll) │
├───────────────────────────────┤
│  FEATURES (stacked, no zig-zag)│
├───────────────────────────────┤
│  CTA SECTION                   │
├───────────────────────────────┤
│  FOOTER                        │
└───────────────────────────────┘

COLOUR NOTES
  [CYN] = Cyan #00F5FF (primary accent)
  [GRN] = Emerald #00FF88 (success metric)
  [AMB] = Amber #FFB800 (warning metric)
  Background: OLED Black #050505
  Borders: border-[0.5px] border-white/[0.06]

ANIMATION NOTES
  Hero: staggered entry (label → H1 → p → CTA)
  DataStrip: fade-in-left with outExpo easing
  Features: scroll-triggered reveal
  CTA Orb: breathing animation (2s loop)

═══════════════════════════════════════════════════════
```
