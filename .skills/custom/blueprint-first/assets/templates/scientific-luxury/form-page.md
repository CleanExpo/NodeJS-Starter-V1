# ASCII Blueprint Template: Form Page (Scientific Luxury)

> Copy and modify. Centred form container with SL design tokens.

```
BLUEPRINT: Form Page
═══════════════════════════════════════════════════════

DESKTOP LAYOUT (>= 1024px)
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR [OLED BG, border-b border-white/[0.06]]             │
│  ┌──────────────────┐                  ┌────────────────┐   │
│  │  Logo [font-mono] │                  │  Back Link     │   │
│  └──────────────────┘                  └────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        FORM CONTAINER [max-w-sm mx-auto]                     │
│        ┌────────────────────────────────────────┐            │
│        │  border-[0.5px] border-white/[0.06]    │            │
│        │  bg-white/[0.01] rounded-sm p-8        │            │
│        │                                        │            │
│        │  p: [Category Label]                   │            │
│        │     text-[10px] tracking-[0.3em]       │            │
│        │     text-white/30 uppercase             │            │
│        │  H2: [Form Title]                      │            │
│        │     text-2xl font-light                │            │
│        │     tracking-tight text-white           │            │
│        │                                        │            │
│        │  ┌────────────────────────────────┐    │            │
│        │  │  FIELD 1                        │    │            │
│        │  │  label: text-[10px] uppercase   │    │            │
│        │  │         tracking-[0.2em]        │    │            │
│        │  │         text-white/40           │    │            │
│        │  │  input: bg-transparent          │    │            │
│        │  │         border-[0.5px]          │    │            │
│        │  │         border-white/[0.06]     │    │            │
│        │  │         rounded-sm              │    │            │
│        │  │         font-mono text-sm       │    │            │
│        │  │         focus:border-CYN/30     │    │            │
│        │  └────────────────────────────────┘    │            │
│        │                                        │            │
│        │  ┌────────────────────────────────┐    │            │
│        │  │  FIELD 2 [same pattern]         │    │            │
│        │  └────────────────────────────────┘    │            │
│        │                                        │            │
│        │  ┌────────────────────────────────┐    │            │
│        │  │  FIELD 3 [same pattern]         │    │            │
│        │  └────────────────────────────────┘    │            │
│        │                                        │            │
│        │  [Error Message — RED #FF4444]         │            │
│        │  [Success Message — GRN #00FF88]       │            │
│        │                                        │            │
│        │  ┌────────────────────────────────┐    │            │
│        │  │  SUBMIT BUTTON                  │    │            │
│        │  │  w-full rounded-sm              │    │            │
│        │  │  border-[0.5px] border-CYN/30   │    │            │
│        │  │  font-mono uppercase            │    │            │
│        │  │  whileHover: bg CYN/5           │    │            │
│        │  │  whileTap: scale 0.98           │    │            │
│        │  └────────────────────────────────┘    │            │
│        │                                        │            │
│        │  [Secondary link — text-white/40]      │            │
│        └────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

MOBILE LAYOUT (< 768px)
┌───────────────────────────────┐
│  NAVBAR (compact)              │
├───────────────────────────────┤
│  FORM CONTAINER                │
│  [full width, px-4 py-8]       │
│  [Same fields, stacked]        │
│  [Submit button full width]    │
└───────────────────────────────┘

STATES
  Default:  Empty fields, no messages
  Loading:  Submit button shows loading indicator (breathing orb)
  Error:    Error message in RED #FF4444 above submit
             Field with error gets border-RED/30
  Success:  Success message in GRN #00FF88
             Redirect after 1.5s

COLOUR NOTES
  [CYN] = Cyan #00F5FF (focus state, submit button)
  [RED] = Red #FF4444 (error state)
  [GRN] = Emerald #00FF88 (success state)
  Background: OLED Black #050505
  Form container: bg-white/[0.01]

ANIMATION NOTES
  Form entry: opacity 0 → 1, y 20 → 0 (outExpo, 0.6s)
  Field focus: border colour transition via Framer Motion
  Submit: whileHover + whileTap
  Error shake: x [-10, 10, -5, 5, 0] (snappy easing)
  Success: opacity pulse then redirect

═══════════════════════════════════════════════════════
```
