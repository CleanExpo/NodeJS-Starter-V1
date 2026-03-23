# System Documentation Index

Living documentation for CleanExpo/NodeJS-Starter-V1. This file is the entry point for understanding system architecture, design decisions, and technical guidance.

## Quick Start

- **New to the codebase?** Start with [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md)
- **Looking for a route?** Use `/generate-route-reference` command
- **Need architectural overview?** See [Architecture](#architecture) below

## Core Sections

### 1. Architecture

**The system is organized as:**
- Express.js server with modular route handlers
- Middleware layer for auth, logging, validation
- Service layer for business logic
- Data layer with models and repositories
- Configuration system for environment management

**Key design principles:**
- RESTful API design
- Separation of concerns (routes → services → data)
- Middleware-driven cross-cutting concerns
- Environment-based configuration

### 2. Running the Application

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production
node index.js

# Tests
npm test
```

**Environment variables** are loaded from `.env` (see `.env.example` for template).

### 3. Adding New Routes

To add a new route:

1. Create a handler file: `routes/[feature]/[action].js`
2. Define the handler function:
   ```javascript
   async function handler(req, res) {
     // Validation
     // Service call
     // Response
   }
   module.exports = { handler };
   ```
3. Register in `index.js`: `app.post('/api/[endpoint]', require('./routes/[feature]/[action]').handler)`
4. Document in [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md)

### 4. Middleware

**Common middleware:**
- `middleware/auth.js` — Authentication and authorization
- `middleware/logging.js` — Request/response logging
- `middleware/validation.js` — Input validation
- `middleware/errors.js` — Global error handling

**Using middleware:**
```javascript
app.use(authMiddleware);
app.post('/api/protected', authMiddleware, handlerFunction);
```

### 5. Configuration

**Environment-based config:**
- `.env` — Development secrets (git-ignored)
- `.env.example` — Template for env vars
- `config/index.js` — Config loading and validation

**Accessing config:**
```javascript
const config = require('./config');
console.log(config.database.url);
```

### 6. Testing

**Test structure:**
- `test/` — Test files
- Use your preferred test framework (Jest, Mocha, etc.)
- Run `npm test` to execute

### 7. Database

*Add details about your database setup, migrations, models, etc.*

### 8. API Standards

**Response format:**
```javascript
{
  "success": true,
  "data": { /* payload */ },
  "error": null
}
```

**Error format:**
```javascript
{
  "success": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "Human-readable message" }
}
```

### 9. Logging & Observability

*Add information about logging, error tracking, monitoring, etc.*

## Living Documentation

This documentation lives alongside the code. When you make changes:

1. Update relevant sections here
2. Update [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md) if routes change
3. Use `/generate-route-reference` to auto-sync route documentation
4. Keep examples current and tested

## Commands Available

Several slash commands help navigate and maintain the system:

- **`/hey-claude`** — Start a new Claude session with system context
- **`/ceo-begin`** — Begin a CEO Board deliberation
- **`/swarm-audit`** — Run an automated system audit
- **`/generate-route-reference`** — Regenerate ROUTE_REFERENCE.md

See [CLAUDE.md](./CLAUDE.md) for full command documentation.

## Contributing

When adding new features:

1. Follow the architecture patterns described above
2. Add route documentation to [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md)
3. Update relevant sections in this file
4. Write tests for new functionality
5. Update `.env.example` if new environment variables are needed

## Key Files

| File | Purpose |
|------|----------|
| `index.js` | Application entry point |
| `config/index.js` | Configuration loader |
| `routes/` | API route handlers |
| `middleware/` | Express middleware |
| `services/` | Business logic |
| `models/` | Data models |
| `test/` | Test files |
| `.env.example` | Environment variable template |
| `SYSTEM_DOCS.md` | This file |
| `ROUTE_REFERENCE.md` | API route documentation |
| `CLAUDE.md` | Claude integration guide |

## Troubleshooting

*Add common issues and solutions here as they come up.*

## Further Reading

- [ROUTE_REFERENCE.md](./ROUTE_REFERENCE.md) — Complete API documentation
- [CLAUDE.md](./CLAUDE.md) — Claude integration and commands
- [.pi/README.md](./.pi/README.md) — PI agent workspace documentation

---

**Last Updated:** 2026-03-24
**Maintainer:** CleanExpo Team
