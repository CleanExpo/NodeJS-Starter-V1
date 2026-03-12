"""
Rate limiting middleware.

In-memory implementation suitable for single-worker deployments and development.
For multi-worker production deployments, replace with Redis-based rate limiting
(e.g., redis + sliding-window or token-bucket algorithm).
"""

import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.config import get_settings
from src.utils import get_logger

settings = get_settings()
logger = get_logger(__name__)

_MAX_TRACKED_CLIENTS = 10_000


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware with stale entry cleanup."""

    def __init__(self, app: Callable, requests_per_minute: int = 60) -> None:
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _get_client_id(self, request: Request) -> str:
        """Get a unique identifier for the client (IP-based)."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"

        client_host = request.client.host if request.client else "unknown"
        return f"ip:{client_host}"

    def _cleanup_stale_entries(self) -> None:
        """Remove all entries older than the rate window and evict if over capacity."""
        now = time.time()
        # Only run full cleanup every 60 seconds to avoid overhead
        if now - self._last_cleanup < 60:
            return

        self._last_cleanup = now
        minute_ago = now - 60

        # Remove stale timestamps and empty buckets
        stale_keys = []
        for client_id, timestamps in self.requests.items():
            filtered = [t for t in timestamps if t > minute_ago]
            if filtered:
                self.requests[client_id] = filtered
            else:
                stale_keys.append(client_id)

        for key in stale_keys:
            del self.requests[key]

        # LRU eviction if over capacity
        if len(self.requests) > _MAX_TRACKED_CLIENTS:
            sorted_clients = sorted(
                self.requests.items(),
                key=lambda item: max(item[1]) if item[1] else 0,
                reverse=True,
            )
            self.requests = defaultdict(list, dict(sorted_clients[:_MAX_TRACKED_CLIENTS]))
            logger.warning(
                "Rate limiter evicted stale entries",
                evicted=len(sorted_clients) - _MAX_TRACKED_CLIENTS,
            )

    def _is_rate_limited(self, client_id: str) -> bool:
        """Check if the client has exceeded the rate limit."""
        now = time.time()
        minute_ago = now - 60

        # Clean this client's stale timestamps
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id] if req_time > minute_ago
        ]

        # Check if rate limited
        if len(self.requests[client_id]) >= self.requests_per_minute:
            return True

        # Add current request
        self.requests[client_id].append(now)

        # Periodically clean up all stale entries
        self._cleanup_stale_entries()

        return False

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        """Process the request and apply rate limiting."""
        # Skip rate limiting for health checks
        if request.url.path in {"/health", "/ready"}:
            return await call_next(request)

        client_id = self._get_client_id(request)

        if self._is_rate_limited(client_id):
            logger.warning("Rate limit exceeded", client_id=client_id)
            return Response(
                content='{"error": "Rate limit exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        return await call_next(request)
