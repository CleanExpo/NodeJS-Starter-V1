"""Application settings and configuration."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # Supabase
    supabase_url: str = Field(default="", alias="NEXT_PUBLIC_SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="NEXT_PUBLIC_SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="")
    supabase_jwt_secret: str = Field(default="")

    # AI Models
    anthropic_api_key: str = Field(default="")
    google_ai_api_key: str = Field(default="")
    openrouter_api_key: str = Field(default="")

    # MCP Tools
    exa_api_key: str = Field(default="")
    ref_tools_api_key: str = Field(default="")

    # Model defaults
    default_model: str = Field(default="claude-sonnet-4-5-20250929")
    max_tokens: int = Field(default=4096)
    temperature: float = Field(default=0.7)


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
