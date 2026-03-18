# Slop Prevention — Always-On Rule

> **Authority**: Loaded every session. Overrides default behaviour for design tasks.

## The Prime Directive

**Never assume design values. Always read or ask.**

## Colour Rules

- Before using ANY colour value in a component, read `apps/web/lib/design-tokens.ts`
- The project uses Scientific Luxury design system: OLED black `#050505`, spectral accents
- Spectral colours: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)
- Corners: `rounded-sm` only — never `rounded-lg`, `rounded-xl`, or `rounded-md` — exception: orbs and status indicators use `rounded-full`
- Animations: Framer Motion only — never CSS transitions, never `transition-all`
- Borders: `border-[0.5px] border-white/[0.06]` (default) — active states may use spectral colour borders at 30–50% opacity — never thick borders, never solid-colour borders

## Before Any UI Generation

1. Read `apps/web/lib/design-tokens.ts`
2. If no reference URL or image is in the task description, ask for one — one question only
3. Show a Plan Mode block with the gathered context
4. Wait for approval

## Banned Phrases

Never say these without evidence:

- "I'll use a standard dark theme"
- "I'll use a blue accent colour"
- "I'll use typical padding"
- "should work with the existing styles"

## Recovery

If you catch yourself about to hardcode a colour or style value, stop. Read `.skills/custom/context-protocol/SKILL.md` and follow the DESIGN PATH from Step 1.
