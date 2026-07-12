"""Application settings and configuration."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_UNSAFE_JWT_DEFAULTS = {
    "your-secret-key-change-in-production",
    "your-secret-key-change-in-production-use-long-random-string",
    "changeme",
    "secret",
}


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Project
    project_name: str = Field(default="AI Agent Orchestration")
    environment: Literal["development", "staging", "production"] = Field(
        default="development"
    )
    debug: bool = Field(default=False)

    # API
    backend_api_key: str = Field(default="")
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    # Database (PostgreSQL)
    database_url: str = Field(
        default="postgresql://starter_user:local_dev_password@localhost:5433/starter_db",
        description="PostgreSQL connection URL"
    )

    # JWT Authentication
    jwt_secret_key: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for JWT token signing"
    )
    jwt_expire_minutes: int = Field(default=60, description="JWT token expiration in minutes")

    # Webhook
    webhook_secret: str = Field(
        default="",
        description="HMAC secret for verifying webhook signatures"
    )

    # Email (Resend) — used by password-reset flow
    app_url: str = Field(
        default="http://localhost:3000",
        description="Public frontend base URL for links in outbound email"
    )
    resend_api_key: str = Field(
        default="",
        description="Resend API key; when empty, reset emails are logged instead of sent"
    )
    email_from: str = Field(
        default="noreply@example.com",
        description="From address for outbound email"
    )

    @model_validator(mode="after")
    def _reject_unsafe_defaults_in_production(self) -> "Settings":
        """Reject insecure default secrets when running in production."""
        if self.environment == "production":
            if self.jwt_secret_key in _UNSAFE_JWT_DEFAULTS:
                raise ValueError(
                    "JWT_SECRET_KEY must be changed from the default value "
                    "before running in production."
                )
            if len(self.jwt_secret_key) < 32:
                raise ValueError(
                    "JWT_SECRET_KEY must be at least 32 characters in production."
                )
        return self

    # AI Provider Configuration
    ai_provider: str = Field(
        default="ollama",
        description="AI provider: 'ollama' (local) or 'anthropic' (cloud)"
    )

    # Ollama (Local AI - No API key required)
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        description="Ollama server URL"
    )
    ollama_model: str = Field(
        default="llama3.1:8b",
        description="Ollama model for generation"
    )
    ollama_embedding_model: str = Field(
        default="nomic-embed-text",
        description="Ollama model for embeddings"
    )

    # Cloud AI Models (Optional)
    anthropic_api_key: str = Field(default="", description="Anthropic API key (optional)")
    google_ai_api_key: str = Field(default="", description="Google AI API key (optional)")
    openrouter_api_key: str = Field(default="", description="OpenRouter API key (optional)")

    # Supabase (Optional — real state backend)
    # When both are set, the app uses SupabaseStateStore; otherwise NullStateStore.
    supabase_url: str = Field(default="", description="Supabase project URL")
    supabase_anon_key: str = Field(default="", description="Supabase anon/public API key")
    supabase_service_role_key: str = Field(default="", description="Supabase service role key (admin ops)")
    
    # Supabase JWT — must match the JWT secret configured in Supabase dashboard
    # (Project Settings → API → JWT Secret) for shared auth to work.
    supabase_jwt_secret: str = Field(
        default="",
        description="Supabase JWT secret (must match app JWT_SECRET_KEY for shared auth)"
    )

    @model_validator(mode="after")
    def _validate_supabase_jwt_alignment(self) -> "Settings":
        """Validate that Supabase JWT secret matches app JWT secret when Supabase is configured."""
        if self.supabase_url and self.supabase_anon_key and self.supabase_jwt_secret:
            if self.supabase_jwt_secret != self.jwt_secret_key:
                raise ValueError(
                    "SUPABASE_JWT_SECRET must match JWT_SECRET_KEY for shared authentication "
                    "between application and Supabase. Either set both to the same value, "
                    "or leave SUPABASE_JWT_SECRET empty to disable shared auth."
                )
        return self

    # MCP Tools
    exa_api_key: str = Field(default="")
    ref_tools_api_key: str = Field(default="")

    # Model defaults
    default_model: str = Field(default="claude-sonnet-4-6")
    max_tokens: int = Field(default=4096)
    temperature: float = Field(default=0.7)

    # Streaming
    streaming_enabled: bool = Field(default=True, description="Enable SSE streaming")

    # Adaptive Thinking (Opus 4.6 / Sonnet 4.6 only)
    thinking_enabled: bool = Field(default=False, description="Adaptive thinking")
    thinking_budget_tokens: int = Field(default=10000, description="Max tokens for thinking blocks")

    # Fast Mode — Opus 4.6 only, research preview
    fast_mode_enabled: bool = Field(default=False, description="2.5× faster Opus 4.6 output")

    # Web Search Tool v2
    web_search_enabled: bool = Field(default=False, description="Web search tool v2 (Opus/Sonnet 4.6 only)")
    web_search_max_uses: int = Field(default=5, description="Max web search calls per request")

    # Token Safety
    token_count_warning_threshold: int = Field(
        default=50000,
        description="Warn when input token count exceeds this value"
    )

    # Beta Features
    agent_skills_enabled: bool = Field(default=False, description="Anthropic Agent Skills beta")
    mcp_connector_enabled: bool = Field(default=False, description="MCP Connector beta")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
