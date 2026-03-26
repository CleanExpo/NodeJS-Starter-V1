# ASCII Blueprint Template: Dashboard (Scientific Luxury)

> Copy and modify. Timeline layout, DataStrip metrics, OLED Black foundation.

```
BLUEPRINT: Dashboard
═══════════════════════════════════════════════════════

DESKTOP LAYOUT (>= 1024px)
┌──────────┬──────────────────────────────────────────────┐
│  SIDEBAR │  HEADER                                       │
│  [240px]  │  ┌──────────────────────────────────────┐    │
│  [OLED BG]│  │  p: [Category Label]                  │    │
│           │  │     text-[10px] tracking-[0.3em]       │    │
│  Logo     │  │  H1: [Dashboard Title]                 │    │
│           │  │     text-4xl font-extralight           │    │
│  ────────│  └──────────────────────────────────────┘    │
│  Nav 1   │  ┌──────────────────────────────────────┐    │
│  Nav 2*  │  │  DATASTRIP [inline metrics]            │    │
│  Nav 3   │  │  Active [CYN] │ Done [GRN] │ Err [RED]│    │
│  Nav 4   │  │  font-mono tabular-nums                │    │
│           │  └──────────────────────────────────────┘    │
│  ────────├──────────────────────────────────────────────┤
│  [v1.0]  │  TIMELINE CONTENT [NOT card grid]             │
│           │  ┌──────────────────────────────────────┐    │
│           │  │  │ Vertical spine                     │    │
│           │  │  │ bg-gradient-to-b from-white/10     │    │
│           │  │  ●─ Node 1 [stagger delay: 0.0s]     │    │
│           │  │  │  ┌────────────────────────────┐    │    │
│           │  │  │  │ [breathing orb] Title       │    │    │
│           │  │  │  │ font-mono data │ timestamp  │    │    │
│           │  │  │  └────────────────────────────┘    │    │
│           │  │  ●─ Node 2 [stagger delay: 0.1s]     │    │
│           │  │  │  ┌────────────────────────────┐    │    │
│           │  │  │  │ [breathing orb] Title       │    │    │
│           │  │  │  │ font-mono data │ timestamp  │    │    │
│           │  │  │  └────────────────────────────┘    │    │
│           │  │  ●─ Node 3 [stagger delay: 0.2s]     │    │
│           │  │                                       │    │
│           │  └──────────────────────────────────────┘    │
│           ├──────────────────────────────────────────────┤
│           │  FOOTER                                       │
│           │  font-mono text-[10px] text-white/20          │
│           │  [DD/MM/YYYY en-AU]                           │
└──────────┴──────────────────────────────────────────────┘

TABLET LAYOUT (768-1023px)
  Sidebar: overlay (slides from left, backdrop-blur-[8px])
  Content: full width
  DataStrip: scrollable if > 4 metrics

MOBILE LAYOUT (< 768px)
┌───────────────────────────────┐
│  HEADER (compact)              │
├───────────────────────────────┤
│  DATASTRIP (horizontal scroll) │
├───────────────────────────────┤
│  TIMELINE (full width, pl-4)   │
│  Single column, staggered      │
├───────────────────────────────┤
│  BOTTOM NAV (4-5 items)        │
│  min-h-[60px]                  │
│  Active: CYN bottom border     │
└───────────────────────────────┘

COLOUR NOTES
  * = active nav [CYAN #00F5FF, 2px left border]
  [CYN] = Cyan #00F5FF (active/in-progress)
  [GRN] = Emerald #00FF88 (completed/success)
  [RED] = Red #FF4444 (failed/error)
  Background: OLED Black #050505
  Sidebar border: border-r border-white/[0.06]

ANIMATION NOTES
  Timeline spine: scaleY from 0 → 1 (0.8s, outExpo)
  Nodes: staggered fade-in-left (0.1s intervals)
  Breathing orbs: scale [1, 1.3, 1] + opacity [1, 0.6, 1] (2s loop)
  Active glow: boxShadow pulse (1.5s loop)

═══════════════════════════════════════════════════════
```
