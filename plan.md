# Visual Content Creation Framework - Implementation Plan

**Generated:** 2025-12-02
**Status:** PENDING APPROVAL

---

## Overview

Install a research-backed visual content creation system for trade businesses, following the same compact skill + detailed scaffold pattern used by Foundation-First Architecture.

## Architecture Decision

**Pattern:** Compact skill file + detailed `.content-creation/` folder (mirrors `.journeys/` pattern)

**Rationale:**
- Keeps skill file under 100 lines (context window efficiency)
- Detailed YAML files provide comprehensive guidance when needed
- Templates enable copy-and-customize workflow
- Aligns with existing Foundation-First Architecture

---

## File Structure

```
skills/marketing/VISUAL-CONTENT.md          # Compact skill trigger (~90 lines)

.content-creation/
├── MASTER-INDEX.yaml                       # How everything connects
├── README.md                               # Quick start guide
├── trust-hierarchy/
│   └── content-types.yaml                  # 7-tier trust ranking
├── photography/
│   └── capture-system.yaml                 # Photo protocols, equipment, quality
├── video/
│   ├── video-types.yaml                    # 7 video types with formulas
│   └── equipment.yaml                      # Starter to intermediate kits
├── platforms/
│   └── specifications.yaml                 # FB, IG, TikTok, YouTube, LinkedIn
├── guidelines/
│   └── image-sourcing.yaml                 # Decision framework, AI risks
├── checklists/
│   ├── daily-capture.yaml                  # Job site photo protocol
│   ├── testimonial.yaml                    # Customer testimonial capture
│   └── content-review.yaml                 # Weekly/monthly review
├── calendar/
│   └── framework.yaml                      # Weekly rhythm, batching
├── quality/
│   └── standards.yaml                      # Image/video quality gates
├── research/
│   └── statistics.yaml                     # Verified stats with sources
└── _templates/
    ├── photo-capture.template.yaml         # Daily capture checklist
    ├── video-script.template.yaml          # Script templates per type
    └── content-calendar.template.yaml      # Weekly planning template
```

---

## Implementation Steps

| Step | Action | Files |
|------|--------|-------|
| 1 | Create skill file | `skills/marketing/VISUAL-CONTENT.md` |
| 2 | Create folder structure | `.content-creation/` + subdirs |
| 3 | Create core files | `MASTER-INDEX.yaml`, `README.md` |
| 4 | Create trust hierarchy | `trust-hierarchy/content-types.yaml` |
| 5 | Create photo system | `photography/capture-system.yaml` |
| 6 | Create video system | `video/video-types.yaml`, `video/equipment.yaml` |
| 7 | Create platform specs | `platforms/specifications.yaml` |
| 8 | Create guidelines | `guidelines/image-sourcing.yaml` |
| 9 | Create checklists | 3 checklist files |
| 10 | Create calendar framework | `calendar/framework.yaml` |
| 11 | Create quality standards | `quality/standards.yaml` |
| 12 | Create research stats | `research/statistics.yaml` |
| 13 | Create templates | 3 template files |
| 14 | Commit and push | All new files |

---

## Key Content Summary

### Trust Hierarchy (7 Tiers)

| Tier | Type | Trust | When to Use |
|------|------|-------|-------------|
| 1 | Real Work Photos | 10/10 | Always - YOUR actual work |
| 2 | Video Testimonials | 9/10 | Highest converting content |
| 3 | Behind-the-Scenes | 8/10 | Humanizes brand |
| 4 | Educational/How-To | 7/10 | Authority building |
| 5 | Designed Graphics | 5/10 | Info only, no trust |
| 6 | Stock Photography | 2/10 | Generic blogs ONLY |
| 7 | AI Generated | 1/10 | Abstract only, NEVER people/work |

### Video Types (7 Types)

| Type | Difficulty | Time | Best For |
|------|------------|------|----------|
| Quick Tips | ★☆☆☆☆ | 5-10 min | TikTok, Reels |
| Before/After | ★★☆☆☆ | 10-20 min | Instagram |
| Testimonial | ★★★☆☆ | 30-60 min | Website, Sales |
| Walkthrough | ★★★☆☆ | 1-2 hrs | YouTube |
| Day in Life | ★★★☆☆ | Full day | YouTube |
| Team Intro | ★★☆☆☆ | 10-15 min | About page |
| How-To | ★★★★☆ | 2-4 hrs | YouTube |

### Platform Specs

| Platform | Audience | Best Content |
|----------|----------|--------------|
| Facebook | Older homeowners | B/A photos, testimonials |
| Instagram | Younger, visual | Reels, carousels |
| TikTok | Discovery | Quick tips, gross-out |
| YouTube | Search-based | How-to, walkthroughs |
| LinkedIn | B2B, commercial | Case studies |

### Critical Rules

1. **Capture photos BEFORE unpacking tools**
2. **Real photos > Stock > AI (always)**
3. **NEVER use AI for people or work photos**
4. **Batch content monthly, post 3x weekly**
5. **Audio quality > video quality**
6. **Casey Neistat Rule:** Best camera = the one in your pocket

---

## Integration Points

- **Foundation-First:** Links to personas (Dave the Plumber)
- **AARRR Funnel:** Content maps to acquisition/activation stages
- **Psychology:** Uses Cialdini (social proof, authority)
- **Journeys:** Content supports awareness → decision stages

---

## Verified Statistics (From Research)

| Stat | Source |
|------|--------|
| 47% book first contractor with recent content | HighLevel |
| 3+ posts/week = 2.5X more leads | HighLevel |
| Authentic photos: 8% CTR vs 2.35% stock | Marketing research |
| 76% can't tell if image is real or AI | imgix |
| 25% conversion increase with unique imagery | Branding research |
| 90% top YouTube videos use custom thumbnails | YouTube data |

---

## Estimated Output

- **Files:** 17 new files
- **Lines:** ~1,800 total
- **Skill file:** ~90 lines (compact)

---

## Status: AWAITING APPROVAL

Ready to implement upon user confirmation.
