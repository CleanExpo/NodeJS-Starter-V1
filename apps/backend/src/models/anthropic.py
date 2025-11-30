"""Anthropic Claude API client."""

from typing import Any

from anthropic import AsyncAnthropic

from src.config import get_settings
from src.utils import get_logger

settings = get_settings()
logger = get_logger(__name__)


class AnthropicClient:
    """Client for Anthropic Claude API."""

    # Available models
    OPUS = "claude-opus-4-5-20251101"
    SONNET = "claude-sonnet-4-5-20250929"
    HAIKU = "claude-haiku-4-5-20251001"

    def __init__(self, model: str | None = None) -> None:
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = model or self.SONNET
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature

    async def complete(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> str:
        """Generate a completion from Claude.

        Args:
            prompt: The user prompt
            system: Optional system prompt
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature

        Returns:
            The model's response text
        """
        try:
            messages = [{"role": "user", "content": prompt}]

            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature or self.temperature,
                system=system or "You are a helpful AI assistant.",
                messages=messages,
            )

            return response.content[0].text

        except Exception as e:
            logger.error("Anthropic API error", error=str(e))
            raise

    async def chat(
        self,
        messages: list[dict[str, str]],
        system: str | None = None,
    ) -> str:
        """Multi-turn chat completion.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system: Optional system prompt

        Returns:
            The model's response text
        """
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system or "You are a helpful AI assistant.",
                messages=messages,
            )

            return response.content[0].text

        except Exception as e:
            logger.error("Anthropic chat error", error=str(e))
            raise

    async def with_tools(
        self,
        prompt: str,
        tools: list[dict[str, Any]],
        system: str | None = None,
    ) -> dict[str, Any]:
        """Generate a completion with tool use.

        Args:
            prompt: The user prompt
            tools: List of tool definitions
            system: Optional system prompt

        Returns:
            The model's response including tool calls
        """
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system or "You are a helpful AI assistant with access to tools.",
                messages=[{"role": "user", "content": prompt}],
                tools=tools,
            )

            return {
                "content": response.content,
                "stop_reason": response.stop_reason,
                "usage": response.usage,
            }

        except Exception as e:
            logger.error("Anthropic tool use error", error=str(e))
            raise
