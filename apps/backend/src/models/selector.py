"""Model selection logic for choosing the appropriate AI model."""

from typing import Literal

from .anthropic import AnthropicClient
from .google import GoogleClient
from .openrouter import OpenRouterClient
from src.config import get_settings

settings = get_settings()

ModelProvider = Literal["anthropic", "google", "openrouter"]
ModelTier = Literal["opus", "sonnet", "haiku", "pro"]


class ModelSelector:
    """Selects and instantiates the appropriate model client."""

    def __init__(self) -> None:
        self._clients: dict[str, AnthropicClient | GoogleClient | OpenRouterClient] = {}

    def get_client(
        self,
        provider: ModelProvider = "anthropic",
        tier: ModelTier = "sonnet",
    ) -> AnthropicClient | GoogleClient | OpenRouterClient:
        """Get a model client for the specified provider and tier.

        Args:
            provider: The model provider to use
            tier: The model tier/quality level

        Returns:
            An instantiated model client
        """
        cache_key = f"{provider}:{tier}"

        if cache_key in self._clients:
            return self._clients[cache_key]

        client = self._create_client(provider, tier)
        self._clients[cache_key] = client
        return client

    def _create_client(
        self,
        provider: ModelProvider,
        tier: ModelTier,
    ) -> AnthropicClient | GoogleClient | OpenRouterClient:
        """Create a new client instance."""
        match provider:
            case "anthropic":
                model = self._get_anthropic_model(tier)
                return AnthropicClient(model=model)

            case "google":
                return GoogleClient()

            case "openrouter":
                model = self._get_openrouter_model(tier)
                return OpenRouterClient(model=model)

            case _:
                # Default to Anthropic Sonnet
                return AnthropicClient()

    def _get_anthropic_model(self, tier: ModelTier) -> str:
        """Get the Anthropic model string for a tier."""
        match tier:
            case "opus":
                return AnthropicClient.OPUS
            case "haiku":
                return AnthropicClient.HAIKU
            case _:
                return AnthropicClient.SONNET

    def _get_openrouter_model(self, tier: ModelTier) -> str:
        """Get the OpenRouter model string for a tier."""
        match tier:
            case "opus":
                return OpenRouterClient.CLAUDE_OPUS
            case "pro":
                return OpenRouterClient.GEMINI_PRO
            case _:
                return OpenRouterClient.CLAUDE_SONNET

    def select_for_task(
        self,
        task_complexity: Literal["simple", "moderate", "complex"],
        prefer_speed: bool = False,
    ) -> AnthropicClient | GoogleClient | OpenRouterClient:
        """Automatically select a model based on task requirements.

        Args:
            task_complexity: How complex the task is
            prefer_speed: Whether to prioritize speed over quality

        Returns:
            An appropriate model client
        """
        if prefer_speed:
            # Use Haiku for speed
            return self.get_client("anthropic", "haiku")

        match task_complexity:
            case "simple":
                return self.get_client("anthropic", "haiku")
            case "moderate":
                return self.get_client("anthropic", "sonnet")
            case "complex":
                return self.get_client("anthropic", "opus")
            case _:
                return self.get_client("anthropic", "sonnet")
