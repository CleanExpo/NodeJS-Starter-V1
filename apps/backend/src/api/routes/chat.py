"""Chat routes for AI agent interaction."""

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.agents.orchestrator import OrchestratorAgent
from src.models.anthropic import AnthropicClient
from src.models.selector import ModelSelector
from src.utils import get_logger

router = APIRouter()
logger = get_logger(__name__)


class ChatRequest(BaseModel):
    """Chat request model."""

    message: str
    conversation_id: str | None = None
    user_id: str | None = None


class StreamChatRequest(BaseModel):
    """Streaming chat request model (multi-turn messages array)."""

    messages: list[dict[str, str]]
    system: str | None = None
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    """Chat response model."""

    response: str
    conversation_id: str
    task_status: dict[str, Any] | None = None


def get_orchestrator() -> OrchestratorAgent:
    """Dependency to get orchestrator agent."""
    return OrchestratorAgent()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    chat_request: ChatRequest,
    orchestrator: OrchestratorAgent = Depends(get_orchestrator),
) -> ChatResponse:
    """Process a chat message through the AI agent."""
    try:
        user_id = getattr(request.state, "user_id", chat_request.user_id)

        logger.info(
            "Processing chat request",
            user_id=user_id,
            conversation_id=chat_request.conversation_id,
        )

        # Call LLM directly for real response
        selector = ModelSelector()
        llm_client = selector.get_client(tier="sonnet")
        response_text = await llm_client.chat(
            messages=[{"role": "user", "content": chat_request.message}],
            system=(
                "You are a helpful AI assistant integrated into a full-stack development platform. "
                "Respond clearly and directly."
            ),
        )

        # Also run orchestrator for task routing/tracking (non-blocking)
        try:
            result = await orchestrator.run(
                task_description=chat_request.message,
                context={
                    "user_id": user_id,
                    "conversation_id": chat_request.conversation_id,
                },
            )
            task_status = result.get("tasks", {})
        except Exception as orch_error:
            logger.warning("Orchestrator error (non-blocking)", error=str(orch_error))
            result = {}
            task_status = None

        return ChatResponse(
            response=response_text,
            conversation_id=chat_request.conversation_id or result.get("task_id", "new"),
            task_status=task_status,
        )

    except Exception as e:
        logger.error("Chat processing error", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Chat processing failed")


@router.post("/chat/stream")
async def stream_chat(
    request: Request,
    stream_request: StreamChatRequest,
) -> StreamingResponse:
    """Stream a chat response via Server-Sent Events."""
    user_id = getattr(request.state, "user_id", None)

    logger.info(
        "Processing streaming chat request",
        user_id=user_id,
        message_count=len(stream_request.messages),
    )

    selector = ModelSelector()
    client = selector.get_client(tier="sonnet")
    system_prompt = stream_request.system or (
        "You are a helpful AI assistant integrated into a full-stack development platform. "
        "Respond clearly and directly."
    )

    async def event_stream():  # type: ignore[return]
        try:
            if not isinstance(client, AnthropicClient):
                # Fallback: non-streaming for non-Anthropic providers
                result = await client.chat(
                    messages=stream_request.messages,
                    system=system_prompt,
                )
                yield f"data: {json.dumps({'type': 'text_delta', 'delta': {'text': result}})}\n\n"
                yield "data: [DONE]\n\n"
                return

            async with client.client.messages.stream(
                model=client.model,
                max_tokens=client.max_tokens,
                messages=stream_request.messages,
                system=system_prompt,
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'type': 'text_delta', 'delta': {'text': text}})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error("Stream error", error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
