---
id: anthropic-web-search
type: skill
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Anthropic Web Search Tool v2 — Integration Guide

> Documents web search v2 integration for NodeJS-Starter-V1.
> GA since February 2026. Requires Opus 4.6 or Sonnet 4.6.

---

## Overview

Web Search Tool v2 (`web_search_20260209`) lets Claude search the web during inference.
Results are injected into the context window before Claude generates its response.
Priced as tool-use tokens — not counted as standard input/output.

---

## Model Requirements

| Model                       | Web Search | Code Execution |
| --------------------------- | ---------- | -------------- |
| `claude-opus-4-6`           | ✅         | ✅             |
| `claude-sonnet-4-6`         | ✅         | ✅             |
| `claude-haiku-4-5-20251001` | ❌         | ❌             |

---

## Basic Usage

```python
from src.models.anthropic import AnthropicClient
from src.models.selector import ModelSelector

selector = ModelSelector()
client = selector.get_client(tier="sonnet")  # Must be Opus or Sonnet

tool = AnthropicClient.get_web_search_tool(max_uses=5)
response = await client.create_message(
    messages=[{"role": "user", "content": "What's the latest Anthropic API release?"}],
    tools=[tool],
)
```

---

## Tool Definition

```python
@staticmethod
def get_web_search_tool(
    max_uses: int = 5,
    allowed_domains: list[str] | None = None,
    blocked_domains: list[str] | None = None,
) -> dict:
    tool = {"type": "web_search_20260209", "name": "web_search"}
    if max_uses != 5:
        tool["max_uses"] = max_uses
    if allowed_domains:
        tool["allowed_domains"] = allowed_domains
    if blocked_domains:
        tool["blocked_domains"] = blocked_domains
    return tool
```

---

## Domain Filtering

```python
# Restrict to trusted sources
tool = AnthropicClient.get_web_search_tool(
    allowed_domains=["docs.python.org", "fastapi.tiangolo.com", "nextjs.org"],
)

# Block noisy sources
tool = AnthropicClient.get_web_search_tool(
    blocked_domains=["reddit.com", "quora.com"],
)
```

---

## Bundled Code Execution (Free)

When paired with code execution, code execution is free:

```python
tools = [
    AnthropicClient.get_web_search_tool(max_uses=3),
    AnthropicClient.get_code_execution_tool(),
]
response = await client.create_message(
    messages=[{"role": "user", "content": "Search for the latest Python version and run a script to check my version"}],
    tools=tools,
)
```

**Code execution type**: `code_execution_20250825`
**Sandbox**: Secure Python environment, no filesystem access, 30s timeout.

---

## Cost Model

- Web search is billed as **tool-use tokens**, not standard tokens
- Each search call counts against `max_uses`
- Code execution is **free** when bundled with web search
- `count_tokens()` does not include web search results (fetched at inference time)

---

## Environment Settings

```bash
WEB_SEARCH_ENABLED=true      # Enable web search tool
WEB_SEARCH_MAX_USES=5        # Max searches per request
```

In `settings.py`:

```python
web_search_enabled: bool = Field(default=False)
web_search_max_uses: int = Field(default=5)
```

---

## Feature Flag Pattern

```python
from src.config import get_settings

settings = get_settings()

tools = []
if settings.web_search_enabled:
    tools.append(AnthropicClient.get_web_search_tool(
        max_uses=settings.web_search_max_uses,
    ))

response = await client.create_message(messages=messages, tools=tools or None)
```

---

## Response Structure

When Claude uses web search, `stop_reason` is `"tool_use"` and `content` contains tool use blocks:

```json
{
  "type": "tool_use",
  "name": "web_search",
  "input": { "query": "Anthropic API latest release" }
}
```

After search results are injected, Claude continues to `"end_turn"`.
The `AnthropicClient.with_tools()` method handles the full tool-use response.

---

## Limitations

- **Not available on Haiku** — Haiku 4.5 does not support web search or code execution
- **No custom search engines** — Uses Anthropic's built-in search infrastructure
- **Rate limits apply** — Web search calls count toward API rate limits
- **Not deterministic** — Results vary based on web content at inference time
