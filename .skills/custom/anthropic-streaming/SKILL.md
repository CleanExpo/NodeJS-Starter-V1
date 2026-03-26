---
id: anthropic-streaming
type: skill
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
context: fork
---

# Anthropic SSE Streaming — NodeJS-Starter-V1 Pattern

> Documents the SSE streaming pipeline: FastAPI → Next.js → React.
> Use when implementing or debugging streaming chat in this project.

---

## Architecture

```
React UI (chat-interface.tsx)
    │  fetch('/api/chat', { stream: true })
    ▼
Next.js Route Handler (apps/web/app/api/chat/route.ts)
    │  Proxy: fetch(`${BACKEND_URL}/api/chat/stream`)
    ▼
FastAPI (apps/backend/src/api/routes/chat.py)
    │  POST /api/chat/stream → StreamingResponse
    ▼
AnthropicClient.client.messages.stream(...)
    │  async text_stream generator
    ▼
SSE frames: data: {"type":"text_delta","delta":{"text":"..."}}
```

---

## FastAPI Streaming Endpoint

```python
from fastapi.responses import StreamingResponse
import json

@router.post("/chat/stream")
async def stream_chat(request: Request, stream_request: StreamChatRequest) -> StreamingResponse:
    selector = ModelSelector()
    client = selector.get_client(tier="sonnet")

    async def event_stream():
        if not isinstance(client, AnthropicClient):
            # Non-Anthropic fallback: single non-streaming response
            result = await client.chat(messages=stream_request.messages, system=system)
            yield f"data: {json.dumps({'type': 'text_delta', 'delta': {'text': result}})}\n\n"
            yield "data: [DONE]\n\n"
            return

        async with client.client.messages.stream(
            model=client.model,
            max_tokens=client.max_tokens,
            messages=stream_request.messages,
            system=system,
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {json.dumps({'type': 'text_delta', 'delta': {'text': text}})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

---

## Next.js Passthrough (route.ts)

```typescript
if (body.stream) {
  const upstream = await fetch(`${BACKEND_URL}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: body.messages, system: body.system }),
  });
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

**Key**: Pass `upstream.body` directly — do NOT buffer it. This keeps the response stream alive.

---

## React Incremental Rendering

```typescript
const assistantId = (Date.now() + 1).toString();

// 1. Append placeholder with isStreaming: true
setMessages((prev) => [
  ...prev,
  { id: assistantId, role: 'assistant', content: '', isStreaming: true, timestamp: new Date() },
]);

// 2. Read SSE chunks
const reader = response.body!.getReader();
const decoder = new TextDecoder();
let accumulated = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
    try {
      const event = JSON.parse(line.slice(6));
      if (event.type === 'text_delta') {
        accumulated += event.delta.text;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      }
    } catch {
      /* skip malformed SSE */
    }
  }
}

// 3. Clear streaming flag
setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)));
```

---

## Thinking Block Streaming

When `thinking: true` is enabled, the stream produces two event types:

```
data: {"type": "thinking_delta", "delta": {"thinking": "Let me consider..."}}
data: {"type": "text_delta", "delta": {"text": "The answer is..."}}
```

Render thinking blocks separately (e.g., collapsible details element):

```typescript
if (event.type === 'thinking_delta') {
  // Append to thinking buffer — render in <details> or sidebar
}
if (event.type === 'text_delta') {
  // Append to main content — render inline
}
```

---

## Error Recovery

| Scenario                | Behaviour                                                    |
| ----------------------- | ------------------------------------------------------------ |
| Network drop mid-stream | `reader.read()` resolves `done: true` — gracefully ends      |
| Backend 5xx error       | `upstream.ok` is false in Next.js route — returns JSON error |
| Malformed SSE frame     | `try/catch` in frame parser — skip silently                  |
| Non-Anthropic provider  | Falls back to single non-streaming response                  |

---

## Token Budget Warning

Before streaming large requests, check token count:

```python
count = await client.count_tokens(messages=messages, system=system)
if count > settings.token_count_warning_threshold:
    # Return 429-like warning to the client before streaming starts
    pass
```

---

## SSE Frame Format

```
data: {"type": "text_delta", "delta": {"text": "Hello"}}
data: {"type": "text_delta", "delta": {"text": " world"}}
data: [DONE]
```

Empty lines between frames are mandatory per the SSE spec. The `\n\n` suffix in each `yield` provides this.
