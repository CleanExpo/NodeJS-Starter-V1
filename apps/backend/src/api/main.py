"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.utils import setup_logging, get_logger

from .routes import chat, health, webhooks
from .middleware.auth import AuthMiddleware
from .middleware.rate_limit import RateLimitMiddleware

settings = get_settings()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager."""
    setup_logging(debug=settings.debug)
    logger.info("Starting application", environment=settings.environment)
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title=settings.project_name,
    description="LangGraph Agent Orchestration Backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(webhooks.router, prefix="/api", tags=["Webhooks"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "AI Agent Orchestration API", "version": "0.1.0"}
