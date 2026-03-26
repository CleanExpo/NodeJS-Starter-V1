# XAEM Theme UI — Theme Preset Standards

> Extracted from `SKILL.md` §Theme Presets. The four predefined theme configurations.

---

## Preset 1: Scientific Luxury (Default)

The baseline theme. All values match `apps/web/lib/design-tokens.ts`.

| Property | Value |
|----------|-------|
| Primary | `#00F5FF` (Cyan) |
| Success | `#00FF88` (Emerald) |
| Warning | `#FFB800` (Amber) |
| Danger | `#FF4444` (Red) |
| Accent | `#FF00FF` (Magenta) |
| Neutral | `#6B7280` (Grey) |
| Glow | Standard |
| Timing | Standard |
| Weights | Standard (hero 200, title 300, body 400, data 500, label 400) |

---

## Preset 2: Midnight Aurora

Cool-shifted palette with extended glow spread for ambient dashboards.

| Property | Value |
|----------|-------|
| Primary | `#00D4FF` (Ice Blue) |
| Success | `#00E87A` (Mint) |
| Warning | `#FF9F00` (Deep Amber) |
| Danger | `#FF3355` (Crimson) |
| Accent | `#CC44FF` (Violet) |
| Neutral | `#5A6270` (Slate) |
| Glow | High-spread (medium spread 50px) |
| Timing | Slower (+20% all durations) |
| Weights | Lighter (hero 100, title 200) |

---

## Preset 3: Solar Flare

Warm-shifted palette with snappy timing for alert-dense interfaces.

| Property | Value |
|----------|-------|
| Primary | `#FFAA00` (Solar Gold) |
| Success | `#44FF66` (Neon Green) |
| Warning | `#FF6600` (Flame) |
| Danger | `#FF2222` (Hot Red) |
| Accent | `#FF44AA` (Hot Pink) |
| Neutral | `#7A7A80` (Warm Grey) |
| Glow | Tight (spread 16px) |
| Timing | Faster (-15% all durations) |
| Weights | Heavier (data 600, title 400) |

---

## Preset 4: Deep Ocean

Desaturated blue-green palette with slow, ambient timing for monitoring views.

| Property | Value |
|----------|-------|
| Primary | `#0099CC` (Deep Teal) |
| Success | `#00CC99` (Sea Green) |
| Warning | `#CCAA00` (Muted Gold) |
| Danger | `#CC3344` (Muted Red) |
| Accent | `#9944CC` (Deep Purple) |
| Neutral | `#556677` (Ocean Grey) |
| Glow | Diffuse (spread 70px) |
| Timing | Slowest (+30% all durations) |
| Weights | Standard |

---

## Theme Generation Bounds

### Palette Constraints

- All colours must have >= 70% saturation
- All colours must pass 4.5:1 contrast against `#050505`
- No pure white (`#FFFFFF`) as a spectral colour
- Each colour visually distinct at 50% opacity over OLED black

### Glow Intensity Bounds

| Tier   | Inner Opacity | Outer Opacity | Spread  |
| ------ | ------------- | ------------- | ------- |
| Low    | 15-25%        | 8-12%         | 12-24px |
| Medium | 35-45%        | 18-25%        | 30-50px |
| High   | 55-65%        | 28-35%        | 50-80px |

### Animation Timing Bounds

| Token    | Min    | Max    | Default |
| -------- | ------ | ------ | ------- |
| fast     | 0.15s  | 0.3s   | 0.2s    |
| normal   | 0.3s   | 0.6s   | 0.4s    |
| slow     | 0.5s   | 0.9s   | 0.6s    |
| breathe  | 1.5s   | 3.0s   | 2.0s    |
| pulse    | 1.0s   | 2.5s   | 1.5s    |
| ambient  | 2.0s   | 4.0s   | 3.0s    |

### Typography Weight Bounds

| Token       | Min | Max | Default |
| ----------- | --- | --- | ------- |
| heroWeight  | 100 | 300 | 200     |
| titleWeight | 200 | 400 | 300     |
| bodyWeight  | 300 | 500 | 400     |
| dataWeight  | 400 | 600 | 500     |
| labelWeight | 300 | 500 | 400     |

### Opacity Hierarchy Bounds

```
Text:   primary(0.85-0.95) → secondary(0.65-0.75) → tertiary(0.45-0.55)
        → muted(0.35-0.45) → subtle(0.25-0.35) → ghost(0.15-0.25)

Border: visible(0.08-0.12) → subtle(0.04-0.08) → ghost(0.02-0.04)
```

---

## Palette Generation Strategies

| Strategy | Colour Wheel | Suited For |
|----------|-------------|-----------|
| Analogous | Within 30 degrees | Ambient dashboards, harmonious feel |
| Complementary | Opposite sides | Alert-heavy interfaces, high contrast |
| Triadic | 120 degree spacing | Data-rich views, balanced vibrancy |
