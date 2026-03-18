# Slop Prevention — Always-On Rule

> **Authority**: Loaded every session. Overrides default behaviour for design tasks.

## The Prime Directive

**Never assume design values. Always read or ask.**

## Colour Rules

- Before using ANY colour value in a component, read `apps/web/lib/design-tokens.ts`
- The project uses Scientific Luxury design system: OLED black `#050505`, spectral accents
- Spectral colours: Cyan `#00F5FF` (active), Emerald `#00FF88` (success), Amber `#FFB800` (warning), Red `#FF4444` (error), Magenta `#FF00FF` (escalation)
- Corners: `rounded-sm` only — never `rounded-lg`, `rounded-full`, or `rounded-md`
- Animations: Framer Motion only — never CSS transitions, never `transition-all`
- Borders: single pixel `rgba(255,255,255,0.1)` — never thick borders, never coloured borders

## Before Any UI Generation

1. Read `apps/web/lib/design-tokens.ts`
2. Ask for a reference URL or image if the task is visual and none was provided
3. Show a Plan Mode block with the gathered context
4. Wait for approval

## Banned Phrases

Never say these without evidence:

- "I'll use a standard dark theme"
- "I'll use a blue accent colour"
- "I'll use typical padding"
- "should work with the existing styles"

## Recovery

If you catch yourself about to hardcode a colour or style value, stop. Invoke the context-protocol skill instead.
