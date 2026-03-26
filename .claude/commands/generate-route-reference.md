# Command: /generate-route-reference

**Category:** Documentation
**Description:** Auto-generate or regenerate API route reference documentation

## Usage

```
/generate-route-reference
```

Regenerates `ROUTE_REFERENCE.md` by scanning your code.

## What It Does

1. **Scans Routes** — Finds all route definitions in `routes/` and `index.js`
2. **Extracts Metadata** — HTTP method, path, parameters, response format
3. **Analyzes Code** — Reads route handlers to document behavior
4. **Generates Examples** — Creates example requests and responses
5. **Updates File** — Regenerates `ROUTE_REFERENCE.md` with all findings

## Requirements

For best results, structure your routes with:

```javascript
// routes/data/create.js
/**
 * POST /api/data - Create new data item
 * @param {string} title - Item title (required)
 * @param {string} description - Item description (optional)
 * @returns {object} Created item with ID
 */
async function createData(req, res) {
  // handler code
}
```

## Example Generated Documentation

After running the command, `ROUTE_REFERENCE.md` will include:

```markdown
### POST /api/data

**Description:** Create new data item

**Parameters:**
- `title` (string, required) — Item title
- `description` (string, optional) — Item description

**Request:**
```json
{ "title": "My Item", "description": "Description" }
```

**Response:**
```json
{ "success": true, "data": { "id": "123", "title": "My Item" } }
```

**Status Codes:**
- 201 — Created
- 400 — Invalid input
```

## Before & After

**Before:**
```
ROUTE_REFERENCE.md
├── Outdated endpoints
├── Missing new routes
├── Incorrect examples
└── Gaps in documentation
```

**After:**
```
ROUTE_REFERENCE.md
├── All routes documented
├── Accurate examples
├── Current request/response formats
└── Complete parameter lists
```

## Tips

- Run after adding new routes
- Run before deployments to ensure docs match code
- Commit generated file to git
- Use in CI/CD to catch undocumented routes

## Manual Updates

You can still manually edit `ROUTE_REFERENCE.md` for:
- Extended descriptions
- Usage examples and workflows
- Related endpoints
- Error scenarios

Just keep JSDoc comments in code in sync.

## Related Commands

- **`/hey-claude`** — Ask about route implementation
- **`/swarm-audit`** — Find undocumented routes
- **`/system-docs`** — View architecture overview

---

**See Also:**
- [ROUTE_REFERENCE.md](../../ROUTE_REFERENCE.md) — The generated file
- [SYSTEM_DOCS.md](../../SYSTEM_DOCS.md) — System architecture
- [CLAUDE.md](../../CLAUDE.md) — All commands
