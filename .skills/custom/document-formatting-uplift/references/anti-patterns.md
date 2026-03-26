# Anti-patterns reference

Detailed before/after examples for each of the 12 banned document formatting patterns. Use these to calibrate detection and correction.


## 1. Wall of bullets for connected ideas

**Before**:
```markdown
## Authentication flow

- Users submit credentials via the login form
- The backend validates credentials against the database
- A JWT token is generated with a 24-hour expiry
- The token is stored in an HttpOnly cookie
- Subsequent requests include the cookie automatically
- The middleware extracts and validates the token
- Invalid tokens redirect to the login page
- Expired tokens trigger a refresh flow
```

**Why it's bad**: These eight bullets describe a sequential, causal process. Each step depends on the previous one. Fragmenting them into isolated bullets destroys the cause-and-effect chain and forces the reader to mentally reconstruct the flow.

**After**:
```markdown
## Authentication flow

Users submit their credentials through the login form, and the backend validates them
against the database. On success, the server generates a JWT with a 24-hour expiry and
stores it in an HttpOnly cookie, which the browser includes automatically on subsequent
requests.

The authentication middleware intercepts each request, extracts the token from the cookie,
and validates its signature and expiry. Invalid tokens redirect to the login page. Expired
tokens trigger a refresh flow that issues a new JWT without requiring the user to
re-authenticate.
```

**Detection cue**: A list of 5 or more bullets where items form a sequence or build on each other. Look for temporal words ("then", "next", "after") or causal words ("therefore", "because", "which triggers") that would naturally connect the items.


## 2. Excessive heading nesting for thin content

**Before**:
```markdown
## Database configuration

### Connection pooling

#### Pool size settings

##### Minimum connections

The minimum pool size is set to 5 connections.
```

**Why it's bad**: Four heading levels to deliver a single sentence. The reader navigates through a hierarchy that promises depth and finds almost nothing. The heading structure implies a complex topic when the content is straightforward.

**After**:
```markdown
## Database configuration

The connection pool maintains between 5 and 20 connections. The minimum of 5 ensures the
application can handle baseline traffic without cold-start latency. The maximum of 20
prevents a single service from exhausting the database's connection limit of 100 across
all application instances.

Pool connections idle for longer than 30 seconds are reclaimed. This threshold balances
memory usage against the cost of establishing new connections, which takes approximately
15ms to the local PostgreSQL instance.
```

**Detection cue**: Three or more heading levels where the deepest level contains fewer than two paragraphs of content. Also look for headings that could be absorbed as bold text or topic sentences within a paragraph.


## 3. Section opening restates the heading

**Before**:
```markdown
## Error handling

Error handling is a critical part of any application. In this section, we'll cover how
our application handles errors across the frontend and backend layers.
```

**Why it's bad**: The reader already chose to read the "Error handling" section. Telling them the section is about error handling wastes their time and signals that the author had nothing substantive to open with.

**After**:
```markdown
## Error handling

The backend catches all unhandled exceptions at the FastAPI middleware layer and returns
structured JSON error responses with an appropriate HTTP status code. The frontend
displays these errors through a toast notification system that auto-dismisses after 5
seconds for warnings and persists until acknowledged for errors.
```

**Detection cue**: The first sentence of a section contains the same noun or noun phrase as the heading, or begins with "This section covers", "Here we discuss", "In this section".


## 4. Filler opening phrases

**Before**:
```markdown
## Deployment architecture

Let's dive into the deployment architecture for our application. Here's a comprehensive
overview of how the system is deployed across multiple environments, providing a detailed
look at each component and its role in the overall infrastructure.
```

**Why it's bad**: "Let's dive in" is verbal throat-clearing. "Comprehensive overview" promises breadth while delivering nothing. The entire opening paragraph contains zero information about the actual deployment architecture.

**After**:
```markdown
## Deployment architecture

The application runs on three environments: development (local Docker Compose), staging
(single AWS ECS task), and production (ECS service with 3 tasks behind an ALB). All three
environments use the same Docker image, differentiated only by environment variables
injected at runtime.
```

**Detection cue**: First sentence contains "let's", "dive in", "comprehensive", "overview", "detailed look", "in-depth", or similar meta-commentary about the content rather than the content itself.


## 5. Hedge phrases that pad word count

**Before**:
```markdown
It's worth noting that the cache invalidation strategy uses a TTL-based approach.
It's important to mention that stale reads are acceptable for up to 30 seconds.
As we can see from the metrics, cache hit rates average 94% across all endpoints.
```

**Why it's bad**: Each hedge phrase adds 4-6 words that communicate nothing. They weaken the statements they precede — if the cache strategy is worth noting, the author should note it with authority rather than apologise for mentioning it.

**After**:
```markdown
The cache invalidation strategy uses a TTL-based approach. Stale reads are acceptable
for up to 30 seconds, a threshold chosen because the underlying data changes at most
twice per minute. Cache hit rates average 94% across all endpoints.
```

**Detection cue**: Sentences beginning with "It's worth noting", "It's important to mention", "It should be noted", "As we can see", "Notably", "Interestingly". Any phrase that could be deleted without changing the sentence's meaning.


## 6. Bold-dash list monotony

**Before**:
```markdown
## API rate limiting

- **IP-based limiting** — Each IP address is limited to 100 requests per minute
- **User-based limiting** — Authenticated users get 500 requests per minute
- **Endpoint-based limiting** — Write endpoints have stricter limits than reads
- **Burst allowance** — Short bursts up to 2x the limit are permitted
- **Response headers** — X-RateLimit-Remaining indicates remaining quota
```

**Why it's bad**: When every item follows the identical `**Bold** — description` pattern, the formatting becomes invisible. The reader's eye stops distinguishing between items because the visual rhythm is perfectly monotonous.

**After**:
```markdown
## API rate limiting

Rate limits are enforced at three levels. IP-based limits cap unauthenticated traffic at
100 requests per minute. Authenticated users receive a higher allowance of 500 requests
per minute, tied to their user ID rather than IP. Write endpoints (POST, PUT, DELETE) are
limited to 50 requests per minute regardless of authentication status.

Short bursts up to twice the stated limit are permitted to accommodate legitimate spikes,
such as a page load that triggers multiple API calls simultaneously. The
`X-RateLimit-Remaining` response header reports the caller's remaining quota so clients
can implement backoff before hitting the limit.
```

**Detection cue**: Three or more consecutive list items where every item begins with bold text followed by a dash or colon. The pattern is `- **Word** — rest of item` repeated uniformly.


## 7. "Key" prefix overuse

**Before**:
```markdown
## Key features

- Key benefit: Reduces deployment time by 60%
- Key advantage: Zero-downtime rolling updates
- Key capability: Automatic rollback on health check failure
- Key metric: 99.9% uptime SLA

## Key considerations

Here are the key takeaways from our key findings...
```

**Why it's bad**: When everything is "key", nothing is. The word becomes semantic noise — a verbal tic rather than a meaningful qualifier. It also signals that the author did not think carefully about what actually distinguishes these items.

**After**:
```markdown
## Deployment benefits

Rolling updates eliminate downtime during deployments, and automatic rollback triggers
when health checks fail within 60 seconds of a new version going live. Together, these
reduce deployment-related incidents from an average of 3 per month to fewer than 1.

Deployment time dropped from 25 minutes to 10 minutes after migrating to container-based
deploys, primarily because the build step now produces a cached Docker layer rather than
a full reinstall.
```

**Detection cue**: The word "key" appearing more than once in a section, or appearing in a heading. Also watch for "main", "primary", "important" used as generic qualifiers rather than to distinguish from secondary items.


## 8. Prose content forced into comparison tables

**Before**:
```markdown
| Aspect | REST API | GraphQL |
|--------|----------|---------|
| Learning curve | REST is simpler to learn because it follows HTTP conventions that most developers already know. The request/response model is straightforward. | GraphQL requires learning a query language and understanding schemas, resolvers, and type systems. The initial investment is higher but pays off for complex data requirements. |
| Flexibility | REST endpoints return fixed data shapes. Over-fetching and under-fetching are common problems that require creating new endpoints or adding query parameters. | GraphQL lets clients request exactly the data they need. This eliminates over-fetching and reduces the number of round trips for complex views. |
```

**Why it's bad**: Table cells containing 2-3 sentences each create a cramped, hard-to-read layout. The comparison loses its nuance when squeezed into columns. Tables work for discrete values (numbers, status labels, yes/no), not for explanatory prose.

**After**:
```markdown
REST and GraphQL serve different optimisation targets. REST maps naturally onto HTTP
semantics and requires no additional tooling beyond a standard HTTP client — most
developers can be productive within hours. The trade-off is rigidity: each endpoint
returns a fixed shape, and complex views often require multiple round trips or bespoke
query parameters to avoid over-fetching.

GraphQL shifts complexity from the server to the schema layer. Clients request exactly
the fields they need, eliminating over-fetching entirely. The cost is a steeper initial
learning curve — developers must understand the type system, write resolvers, and manage
a schema that grows with the API surface.
```

**Detection cue**: Table cells containing more than 15 words, or cells that wrap to multiple lines. Tables comparing subjective qualities (flexibility, maintainability, developer experience) rather than discrete data points.


## 9. Exclamation marks in technical docs

**Before**:
```markdown
## Getting started

Welcome to the project! Setting up is easy! Just follow these steps and you'll be
running in no time! Don't forget to check the troubleshooting section if you run into
any issues!
```

**Why it's bad**: Technical documentation informs; it does not sell. Exclamation marks communicate excitement, which is appropriate in marketing copy but undermines credibility in engineering communication. The reader wants to trust the document's accuracy, and breathless enthusiasm erodes that trust.

**After**:
```markdown
## Getting started

The setup process takes approximately 10 minutes and requires Docker, Node.js 20+, and
pnpm. Follow the steps below in order. If a step fails, the troubleshooting section at
the end of this document addresses the most common failure modes.
```

**Detection cue**: Any exclamation mark in a Markdown file that is not inside a code block or a user-facing UI string.


## 10. Generic section ordering

**Before**:
```markdown
## Overview

The widget system provides...

## Features

- Feature A
- Feature B

## Getting started

### Installation

### Configuration

## API reference

## FAQ

## Contributing
```

**Why it's bad**: This is the default template every documentation generator produces. It prioritises comprehensiveness over usefulness. A developer evaluating this library needs to know what it does and how to run it — they do not need an FAQ section in the README.

**After**:
```markdown
## What this does

Single sentence: what problem this solves.

## Quick start

Three commands to go from zero to running.

## How it works

Architecture explanation appropriate to the reader's needs.

## Configuration reference

Table of environment variables with types and defaults.
```

**Detection cue**: Sections that follow the Overview/Features/Getting Started/API/FAQ/Contributing template without adaptation to the document's specific purpose and audience.


## 11. Emoji in headers or bullets

**Before**:
```markdown
## 🚀 Getting started

- ✅ Install dependencies
- 📦 Configure environment
- 🔧 Run database migrations
- 🎉 Start the development server

## 📋 Prerequisites

## ⚡ Performance
```

**Why it's bad**: Emoji add visual noise without communicating information that words cannot. They print inconsistently across platforms, break grep searches, and make documents look like social media posts rather than engineering artefacts.

**After**:
```markdown
## Getting started

1. Install dependencies
2. Configure environment variables
3. Run database migrations
4. Start the development server

## Prerequisites

## Performance
```

**Detection cue**: Any emoji character (Unicode blocks U+1F600-U+1F64F, U+1F300-U+1F5FF, U+1F680-U+1F6FF, U+2600-U+26FF, U+2700-U+27BF) appearing outside of code blocks or quoted user-facing strings.


## 12. Code blocks for non-code content

**Before**:
````markdown
```
IMPORTANT: The database must be running before starting the application.
Make sure Docker is installed and the containers are healthy.
```

```
Note: If you're using Windows, replace `./scripts/setup.sh` with
`.\scripts\setup.ps1` in all the commands below.
```
````

**Why it's bad**: Code blocks render in monospace font at a fixed width, which is optimised for reading code — character-by-character, with alignment mattering. Prose in a code block is harder to read because the font is designed for a different purpose. It also prevents the text from wrapping naturally on narrow viewports.

**After**:
```markdown
The database must be running before starting the application. Verify that Docker is
installed and that `docker ps` shows healthy containers for both PostgreSQL and Redis.

> **Windows users**: Replace `./scripts/setup.sh` with `.\scripts\setup.ps1` in all
> commands below.
```

**Detection cue**: Code blocks (triple backtick) that contain no code — no function calls, no variable assignments, no command-line invocations, no configuration syntax. Plain English sentences inside triple backticks are always wrong.
