# Non-Coder Build Guide — Idea to Production

> Universal reference for solo founders using Claude Code to build SaaS applications.
> Use this to understand what phase you're in, what specialist role is working, and what your job is at each step.

---

## How to Use This Guide

1. **Before starting a feature**: Read the phase descriptions to understand what's involved
2. **When giving instructions**: Use the `/build` command — it structures your requirements so Claude builds what you actually want
3. **When Claude says "done"**: Check the VERIFICATION CHECKLIST it provides against what you see in the browser
4. **When something feels wrong**: Find the relevant phase below and check "Common Pitfalls"

---

## The 10 Phases of Building a Feature

### Phase 1: Idea & Requirements

**Real-team specialist:** Product Manager
**What Claude does:** Asks clarifying questions, echoes back your requirement to confirm understanding
**What you do:** Describe WHAT you want, WHO uses it, and WHAT they should see

**Use the `/build` command.** It gives Claude a structured template instead of free-text.

| Term | Plain English |
|------|---------------|
| Requirements | A written description of what the feature should do |
| User story | "As a [role], I want [thing] so that [reason]" |
| Acceptance criteria | How you'll know it's done — what you can see and click |
| Scope | The boundary of what's included (and what's NOT) |

**Common pitfalls:**
- Describing HOW to build it instead of WHAT it should do (let Claude choose the how)
- Forgetting to say who uses the feature (admin? student? public visitor?)
- Not specifying what the user should SEE when it works

---

### Phase 2: Architecture

**Real-team specialist:** Software Architect / Tech Lead
**What Claude does:** Decides which files to create, which patterns to follow, how data flows
**What you do:** Nothing — this is Claude's domain. Review the plan if one is presented.

| Term | Plain English |
|------|---------------|
| Architecture | The structure of how parts of the app connect to each other |
| Frontend | What runs in the browser — the pages, buttons, forms you see |
| Backend | What runs on the server — the logic, data processing, security |
| API | The bridge between frontend and backend — how they talk to each other |
| Database | Where all the data is permanently stored (users, courses, orders) |
| Monorepo | One repository containing multiple apps (e.g. `apps/web/` + `apps/backend/`) |

**Common pitfalls:**
- Asking Claude to "just make it work" without context about what exists
- Not knowing which folder to look in (see Architecture Routing in your CLAUDE.md)

---

### Phase 3: Database & Schema

**Real-team specialist:** Database Engineer / DBA
**What Claude does:** Creates tables, columns, relationships, and migration files
**What you do:** Confirm the data model makes sense (e.g. "Does a student have many enrolments? Yes")

| Term | Plain English |
|------|---------------|
| Table | A spreadsheet-like structure in the database (e.g. `users`, `courses`) |
| Column | A field in the table (e.g. `email`, `created_at`, `is_active`) |
| Migration | A versioned change to the database structure (add a table, rename a column) |
| Foreign key (FK) | A link between two tables (e.g. `enrollment.course_id` points to `courses.id`) |
| Schema | The complete structure of all tables and their relationships |
| Seed data | Test data inserted for development (fake users, sample courses) |

**Common pitfalls:**
- Asking for a feature that needs a table that doesn't exist yet (Claude should catch this)
- Not understanding that database changes are HIGH RISK and need careful handling

---

### Phase 4: Backend API

**Real-team specialist:** Backend Engineer
**What Claude does:** Creates API endpoints — the server-side logic that processes requests
**What you do:** Nothing during creation. During testing, confirm the data looks right.

| Term | Plain English |
|------|---------------|
| Endpoint | A URL the server listens on (e.g. `POST /api/courses` creates a new course) |
| GET / POST / PUT / DELETE | The action type: read / create / update / delete |
| Route | The URL pattern an endpoint responds to |
| Middleware | Code that runs before every request (e.g. checking if user is logged in) |
| JWT | A secure token that proves who you are (like a digital wristband) |
| CORS | Security rules that control which websites can talk to your server |

**Common pitfalls:**
- Assuming the backend "just works" because the frontend looks right
- Not checking that authentication is enforced on new endpoints

---

### Phase 5: Frontend Pages

**Real-team specialist:** Frontend Engineer / UI Developer
**What Claude does:** Creates React components, pages, forms, and layouts
**What you do:** Describe what users should SEE. Provide screenshots or reference URLs if possible.

| Term | Plain English |
|------|---------------|
| Component | A reusable UI element (a button, a card, a form) |
| Page | A full screen at a URL (e.g. `/student/dashboard`) |
| Layout | The shared frame around pages (sidebar, header, footer) |
| Props | Data passed into a component (like function arguments) |
| State | Data that changes over time in the browser (loading spinner, form values) |
| Responsive | The page adjusts its layout for mobile, tablet, and desktop screens |

**Common pitfalls:**
- Describing colours or styles in words instead of referencing the design system
- Forgetting to specify what happens on mobile vs desktop

---

### Phase 6: Integration & Wiring

**Real-team specialist:** Full-Stack Engineer
**What Claude does:** Connects frontend to backend, adds navigation links, enforces auth gates
**What you do:** Verify you can NAVIGATE to the new feature from the existing app

> This is where most non-coder frustration happens. Claude builds the page but forgets to:
> - Add the link in the sidebar/navigation
> - Mount the API route in the main router
> - Add auth protection so only logged-in users can access it
> - Update the route documentation

| Term | Plain English |
|------|---------------|
| Route mounting | Registering a new backend endpoint so the server knows it exists |
| Navigation wiring | Adding the link to the sidebar, menu, or breadcrumb so users can find the page |
| Auth gate | A check that redirects to login if the user isn't authenticated |
| API client call | Frontend code that fetches data from the backend |
| Integration | Making two separate pieces work together as one |

**Common pitfalls:**
- Claude builds a page but it's an "island" — not connected to anything
- The page works at its URL but there's no way to navigate to it
- The backend endpoint exists but the frontend doesn't call it

**The Verification Gate catches this.** Claude must show you a checklist of observable outcomes including navigation paths.

---

### Phase 7: Testing

**Real-team specialist:** QA Engineer / Test Engineer
**What Claude does:** Writes automated tests that verify the code works correctly
**What you do:** Run the tests when asked, report if something looks wrong in the browser

| Term | Plain English |
|------|---------------|
| Unit test | Tests one small piece of code in isolation |
| Integration test | Tests that multiple pieces work together |
| E2E test | Tests the full user journey in a real browser (Playwright) |
| Test suite | All the tests for a project |
| Coverage | What percentage of code has tests |
| CI/CD | Automated system that runs tests when code is pushed |

**Common pitfalls:**
- "Tests pass" doesn't mean the feature looks right — visual verification is still needed
- Skipping tests to ship faster creates debt you pay later

---

### Phase 8: Design & Polish

**Real-team specialist:** UI/UX Designer
**What Claude does:** Applies design tokens, adds animations, ensures visual consistency
**What you do:** Review the visual result against your design system or reference

| Term | Plain English |
|------|---------------|
| Design system | A set of rules for colours, spacing, typography, corners, borders |
| Design tokens | The actual values (e.g. `#050505` for background, `rounded-sm` for corners) |
| Responsive design | Adapting the layout for different screen sizes |
| Animation | Movement and transitions (hover effects, page transitions) |
| Accessibility | Making the app usable for people with disabilities (screen readers, keyboard nav) |

**Common pitfalls:**
- Claude uses generic blue/grey theme instead of your project's design system
- Rounded corners when your system specifies sharp (`rounded-sm`)
- CSS transitions when your system specifies Framer Motion only

---

### Phase 9: Deployment

**Real-team specialist:** DevOps Engineer / Platform Engineer
**What Claude does:** Configures hosting, CI/CD, environment variables, DNS
**What you do:** Provide API keys, domain names, hosting account access

| Term | Plain English |
|------|---------------|
| Deployment | Making your app accessible on the internet |
| Hosting | The server(s) where your app runs (Vercel, Fly.io, DigitalOcean) |
| Environment variables | Secret configuration values (API keys, database passwords) |
| DNS | The system that maps your domain name to your server's address |
| CI/CD | Automated pipeline that tests and deploys code when you push changes |
| SSL/HTTPS | Encryption that makes your site secure (the padlock icon) |

**Common pitfalls:**
- Forgetting to set environment variables on the hosting platform
- Deploying before running database migrations on production
- Using test/development API keys in production

---

### Phase 10: Maintenance & Iteration

**Real-team specialist:** Various (depends on the task)
**What Claude does:** Fixes bugs, adds features, optimises performance
**What you do:** Report what's not working, describe what you want changed

| Term | Plain English |
|------|---------------|
| Bug | Something that doesn't work as expected |
| Feature request | A new capability you want to add |
| Refactor | Restructuring code without changing what it does (cleanup) |
| Performance | How fast the app responds |
| Monitoring | Tools that alert you when something breaks |
| Technical debt | Shortcuts taken earlier that make future work harder |

**Common pitfalls:**
- Describing symptoms instead of expected behaviour ("it's broken" vs "I expected to see X but I see Y")
- Asking for a "quick fix" that creates more technical debt

---

## The Requirements Template

Every time you want Claude to build something, use `/build`. It structures your request into 7 fields:

```
WHAT:       [One sentence — what is being built or changed]
WHERE:      [Which page or area of the app]
WHO:        [Which user role uses this — admin, student, instructor, public]
WHEN:       [What triggers this — clicking a button, loading a page, submitting a form]
SHOULD SEE: [What the user sees when it works correctly]
DON'T DO:   [What to avoid — existing features to preserve, patterns to skip]
SUCCESS:    [How you'll know it's done — observable, checkable outcomes]
```

---

## The Verification Gate

Claude cannot say "done" without providing a verification checklist. Example:

```
VERIFICATION CHECKLIST — Quiz Result Page

Before this is done, please check:
[ ] Go to: http://localhost:3009/student/quizzes
[ ] Click on any enrolled quiz
[ ] Complete the quiz and submit
[ ] You should see: your score as a percentage
[ ] You should see: a Pass/Fail label in green/red
[ ] You should see: a "Back to Course" button
[ ] You should NOT see: any error messages or blank areas

How to get there: Login > Student Dashboard > click any course > quiz tab

Reply "looks good" to close this, or describe what's different.
```

If Claude says "done" without this checklist, remind it: **"Where's the verification checklist?"**

---

## Quick Reference: Your Job vs Claude's Job

| Your Job | Claude's Job |
|----------|-------------|
| Describe WHAT you want | Decide HOW to build it |
| Say WHO uses it | Choose which files and patterns |
| Say what they SHOULD SEE | Write the code |
| Say what to AVOID | Run the tests |
| Confirm the checklist | Produce the verification checklist |
| Say "looks good" or describe what's wrong | Fix what's wrong |
