---
id: anthropic-features
type: skill
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Anthropic API Features — March 2026 Reference

> Master reference for all current Anthropic API capabilities.
> Use this skill when integrating Anthropic features into NodeJS-Starter-V1.

---

## Model Registry

| Model             | ID                          | Tier   | Key Capabilities                                |
| ----------------- | --------------------------- | ------ | ----------------------------------------------- |
| Claude Opus 4.6   | `claude-opus-4-6`           | opus   | Thinking, Fast Mode, Web Search, Code Execution |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | sonnet | Thinking, Web Search, Code Execution            |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | haiku  | High throughput, low latency                    |

**Implementation path**: `apps/backend/src/models/anthropic.py` → `ClaudeModels`
**Selector**: `ModelSelector.get_client(tier="sonnet")` → auto-selects by settings

---

## Adaptive Thinking

Allows Claude to reason step-by-step before responding. Available on Opus 4.6 and Sonnet 4.6.

```python
# Enable via create_message()
response = await client.create_message(
    messages=messages,
    thinking=True,
    thinking_budget=16000,  # 1024–128000
)
```

**Setting**: `THINKING_ENABLED=true`, `THINKING_BUDGET_TOKENS=10000`
**Constraint**: `budget_tokens` must be less than `max_tokens` (unless interleaved)

---

## Fast Mode

2.5× faster output for Opus 4.6. Research preview — not for production latency SLAs.

```python
response = await client.create_message(
    messages=messages,
    fast_mode=True,  # Opus 4.6 only
)
```

**Setting**: `FAST_MODE_ENABLED=true`
**Note**: `output_config: { speed: "fast" }` — Opus 4.6 only

---

## Automatic Prompt Caching (GA)

No beta header required. Caches system prompts and tool definitions across requests.

- System prompts > 2000 characters are auto-cached in `create_message()`
- Cache control: `{ "type": "ephemeral" }` — 5-minute default TTL, optional `"1h"`
- Minimum cacheable: 1024 tokens

**Implementation**: `AnthropicClient._create_cached_system()` and `_add_cache_to_tools()`

---

## Token Counting API

Free pre-flight call — no model inference, no charge.

```python
token_count = await client.count_tokens(
    messages=messages,
    system=system_prompt,
)
# warn if token_count > settings.token_count_warning_threshold
```

**Setting**: `TOKEN_COUNT_WARNING_THRESHOLD=50000`
**Use case**: Cost estimation, input validation, context window management

---

## Web Search Tool v2 (GA — Feb 2026)

Requires Opus 4.6 or Sonnet 4.6. Priced as tool-use tokens.

```python
tool = AnthropicClient.get_web_search_tool(
    max_uses=5,
    allowed_domains=["docs.python.org"],   # optional
    blocked_domains=["reddit.com"],         # optional
)
response = await client.create_message(messages=messages, tools=[tool])
```

**Type identifier**: `web_search_20260209`
**Setting**: `WEB_SEARCH_ENABLED=true`, `WEB_SEARCH_MAX_USES=5`

---

## Code Execution Tool (GA — Feb 2026)

Runs Python in a secure sandboxed environment. Free when bundled with web search.

```python
tools = [
    AnthropicClient.get_web_search_tool(),
    AnthropicClient.get_code_execution_tool(),
]
```

**Type identifier**: `code_execution_20250825`

---

## Agent Skills (Beta)

Anthropic-managed document processing. Beta header: `skills-2025-10-02`.
Supported: `excel`, `powerpoint`, `word`, `pdf`.

```python
skill = AnthropicClient.get_agent_skill("pdf")
```

**Setting**: `AGENT_SKILLS_ENABLED=true`

---

## MCP Connector (Beta) — "Remote Control"

Connect any MCP-compatible remote server in the messages API.
Beta header: `mcp-connector-2025-05-14`.

```python
server = AnthropicClient.get_mcp_server_tool(
    server_name="github",
    server_url="https://mcp.github.com",
    allowed_tools=["create_issue", "list_repos"],
)
```

**Setting**: `MCP_CONNECTOR_ENABLED=true`

---

## Structured Outputs

Enforced JSON schema response — model guaranteed to match schema.

```python
schema = {
    "name": "task_result",
    "schema": {
        "type": "object",
        "properties": {"status": {"type": "string"}, "result": {"type": "string"}},
        "required": ["status", "result"],
    },
}
response = await client.create_message(messages=messages, schema=schema)
```

---

## Voice Mode

**NOT available via Anthropic API.**
Voice is only available in:

- Claude.ai consumer app
- Claude Code CLI

There is no voice API endpoint. Do not implement or promise voice features via API.

---

## Out of Scope (Deferred)

- **Message Batches API** — 50% cost reduction for async bulk jobs. Requires job queue.
- **Files API** — Upload-once file references. Requires file management UI.
