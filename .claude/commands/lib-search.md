# /lib search — Search the Solution Library

Search registry and skill content for matching assets.

## Usage

```
/lib search <query> [--type <skill|agent|workflow>] [--category <category>]
```

## Examples

```bash
/lib search "rate limiting"
/lib search "auth" --type skill
/lib search "testing" --category backend
/lib search webhook
```

## Search Strategy

1. **Exact match** — name in registry
2. **Description match** — keywords in description field
3. **Category match** — assets in matching category
4. **Skill content** — grep SKILL.md files for query terms

## Output Format

```
SEARCH: "rate limiting"
═══════════════════════════════════════════════

SKILLS (2 matches)
  ● rate-limiter              Backend › Sliding window, token bucket
    Path: .skills/custom/rate-limiter/SKILL.md
    Status: active

  ● resilience-patterns       Backend › Circuit breaker, retry, bulkhead
    Path: .skills/custom/resilience-patterns/SKILL.md
    Status: active

AGENTS (1 match)
  ● backend-specialist        Worker › Includes rate-limiter skill
    Skills: api-contract, rate-limiter, webhook-handler, ...

═══════════════════════════════════════════════
2 skills, 1 agent found for "rate limiting"
```

## No Results

If no results found:

1. Check spelling
2. Try broader terms
3. Use `/lib add` to contribute the missing pattern
