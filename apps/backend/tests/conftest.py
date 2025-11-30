"""Pytest configuration and fixtures."""

import pytest
from httpx import AsyncClient, ASGITransport

from src.api.main import app


@pytest.fixture
def anyio_backend() -> str:
    """Use asyncio backend for async tests."""
    return "asyncio"


@pytest.fixture
async def client() -> AsyncClient:
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
