# Before/after examples

Three side-by-side comparisons demonstrating the most impactful formatting corrections. Each example shows the same content expressed first in default LLM style, then in the uplift style.


## Example 1: Bullet wall transformed to prose

### Before

```markdown
## Authentication flow

- The user navigates to the login page and enters their email and password
- The frontend validates the input format before sending to the backend
- The backend receives the credentials and hashes the password with bcrypt
- The hashed password is compared against the stored hash in the users table
- If the hashes match, a JWT is generated with the user's ID and role as claims
- The JWT is signed with the RS256 algorithm using the server's private key
- The token is set as an HttpOnly, Secure cookie with a 24-hour expiry
- Subsequent requests include the cookie automatically via the browser
```

### Why the before version fails

Eight bullets describe a strictly sequential, causal process. Each step depends on the previous one: the backend cannot compare hashes until it receives credentials, and the JWT cannot be generated until the comparison succeeds. Bullet lists strip away these causal relationships and present each step as an isolated fact. The reader must mentally reconstruct the flow, which increases cognitive load and introduces opportunities for misunderstanding.

The bullets also create a false sense of equivalence — each step appears equally important, when in reality the JWT generation and cookie configuration are the architecturally significant decisions that deserve emphasis.

### After

```markdown
## Authentication flow

The user submits their email and password through the login form. The frontend
validates the input format — checking email structure and minimum password
length — before forwarding the credentials to the backend's `/api/auth/login`
endpoint.

The backend hashes the submitted password with bcrypt and compares it against
the stored hash in the `users` table. On a successful match, the server
generates a JWT containing the user's ID and role as claims, signed with RS256
using the server's private key. This token is set as an HttpOnly, Secure cookie
with a 24-hour expiry, which the browser includes automatically on all
subsequent requests to the same origin.

The HttpOnly flag prevents JavaScript from accessing the token, mitigating XSS
attacks. The Secure flag ensures the cookie is only transmitted over HTTPS. These
two flags together mean the token is never exposed to client-side code and never
sent over an unencrypted connection.
```

### What changed

The prose version preserves causal chains: "On a successful match" connects authentication to token generation. It also adds context that bullets suppressed — the security rationale for HttpOnly and Secure flags, the specific endpoint path, the validation checks. The three paragraphs create a natural grouping: input handling, authentication logic, and security justification.


## Example 2: Header spam transformed to appropriate hierarchy

### Before

```markdown
## Environment configuration

### Overview

Environment configuration is an essential part of the application setup process.
This section covers how environment variables are managed.

### Environment variable categories

#### Application settings

##### Server configuration

###### Port settings

The application listens on port 3000 by default.

###### Host settings

The application binds to 0.0.0.0 in production and 127.0.0.1 in development.

##### Logging configuration

###### Log level

Set to "info" in production and "debug" in development.

###### Log format

JSON in production, pretty-printed in development.

#### Database settings

##### Connection string

###### Format

PostgreSQL connection strings follow the format:
`postgresql://user:password@host:port/database`
```

### Why the before version fails

Six heading levels for content that amounts to a handful of configuration values. The deepest headings ("Port settings", "Host settings", "Log level") each contain a single sentence. The reader navigates through a tree structure that promises depth but delivers fragments. The "Overview" subsection restates the H2 heading, wasting the reader's time and the document's most prominent paragraph position.

This structure also makes the document nearly impossible to scan. A reader looking for the database connection string format must navigate through H2, H3, H4, H5, and H6 headings — five clicks in a table of contents — to reach a single line of content.

### After

```markdown
## Environment configuration

The application uses environment variables for all deployment-specific settings,
with defaults suitable for local development. Variables are loaded from `.env`
files (never committed to version control) and can be overridden by the host
environment.

### Application settings

The server listens on port 3000 by default and binds to `127.0.0.1` in
development or `0.0.0.0` in production. Logging uses JSON format at the "info"
level in production, switching to pretty-printed "debug" output in development.
Both the port and log level can be overridden via `PORT` and `LOG_LEVEL`
environment variables respectively.

### Database settings

PostgreSQL connection strings follow the standard format:
`postgresql://user:password@host:port/database`. The application reads this from
the `DATABASE_URL` environment variable. In local development, the default
points to the Docker Compose PostgreSQL instance at `localhost:5432`.

Connection pooling maintains between 5 and 20 connections, configurable via
`DB_POOL_MIN` and `DB_POOL_MAX`. The defaults are appropriate for a single
application instance; multi-instance deployments should reduce `DB_POOL_MAX`
to avoid exhausting the database's connection limit.
```

### What changed

Two heading levels replace six. Each section contains enough prose to justify its heading. Configuration values that were isolated under individual headings are now grouped into coherent paragraphs where their relationships are visible — the reader can see that port, host, and log settings are all application-level concerns in a single paragraph rather than navigating a tree to discover this.


## Example 3: AI filler prose transformed to direct writing

### Before

```markdown
## Caching strategy

Let's dive into the comprehensive overview of our caching strategy! In this
section, we'll explore the various caching mechanisms employed throughout the
application, providing a detailed look at how each layer contributes to the
overall performance optimisation.

It's worth noting that caching is a critical component of any high-performance
web application. As we can see from industry benchmarks, effective caching can
reduce response times by up to 90%. It's important to mention that our approach
leverages multiple caching layers to achieve optimal results.

Here's a comprehensive breakdown of the key caching layers:

- **Redis Cache** — Our primary caching layer that stores frequently accessed
  data in memory for lightning-fast retrieval!
- **HTTP Cache** — Leveraging browser and CDN caching through carefully crafted
  cache-control headers for an amazing user experience!
- **Query Cache** — PostgreSQL's built-in query cache that automatically caches
  query plans for improved database performance!

In conclusion, our multi-layered caching approach provides a robust and
scalable solution that significantly enhances the application's performance
characteristics.
```

### Why the before version fails

The first paragraph contains zero information about the actual caching strategy. "Let's dive in" and "comprehensive overview" are verbal throat-clearing. The second paragraph cites "industry benchmarks" without referencing any, claims "up to 90%" without a source, and uses three hedge phrases ("It's worth noting", "As we can see", "It's important to mention") in three sentences.

The bullet list uses the banned bold-dash pattern uniformly, adds exclamation marks to technical descriptions, and uses marketing language ("lightning-fast", "amazing user experience"). The concluding paragraph restates the heading using different adjectives ("robust and scalable") without adding information.

Every anti-pattern in this example is a default LLM behaviour: filler openings, unsourced claims, hedge phrases, uniform formatting, exclamation marks, and content-free conclusions.

### After

```markdown
## Caching strategy

The application caches data at three layers, each targeting a different access
pattern. Together they reduce median API response times from 120ms (database
only) to 15ms (cache hit) — measured against the production dataset of 50,000
users and 200,000 records.

Redis serves as the primary application cache, storing serialised query results
with TTLs between 30 seconds and 5 minutes depending on how frequently the
underlying data changes. User session data uses a 30-second TTL because
permissions can change at any time. Product catalogue data uses a 5-minute TTL
because it changes at most once per deployment.

HTTP cache headers instruct browsers and CDN edge nodes to cache static assets
indefinitely (via content-hash URLs) and API responses for up to 60 seconds.
The `Cache-Control` header for API responses includes `stale-while-revalidate=30`,
allowing edge nodes to serve stale content while fetching a fresh copy in the
background.

PostgreSQL caches query execution plans automatically. The application assists
this by using parameterised queries exclusively — prepared statements allow
PostgreSQL to reuse plans across executions with different parameter values,
which reduces planning overhead from approximately 2ms to 0.1ms per query.
```

### What changed

The opening sentence states the three-layer structure and delivers a concrete metric (120ms to 15ms) with its measurement context. Each subsequent paragraph addresses one caching layer with specifics: TTL values with rationale, header directives with their effects, and PostgreSQL plan caching with measured overhead reduction.

No filler phrases. No exclamation marks. No unsourced claims. No conclusion paragraph — the content ends when the information ends. The reader finishes this section knowing exactly what is cached, for how long, and why those values were chosen.
