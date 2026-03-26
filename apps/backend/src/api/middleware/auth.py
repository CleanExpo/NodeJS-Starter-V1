"""Authentication middleware for JWT validation."""

import hmac
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.auth.jwt import decode_access_token
from src.config import get_settings
from src.utils import get_logger

settings = get_settings()
logger = get_logger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for JWT authentication."""

    # Paths that don't require authentication
    PUBLIC_PATHS = {
        "/",
        "/health",
        "/ready",
        "/docs",
        "/openapi.json",
        # Auth endpoints — must be public for unauthenticated users
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/logout",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
    }

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        """Process the request and validate authentication."""
        # Skip auth for public paths
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        # Check for API key authentication (timing-safe comparison)
        api_key = request.headers.get("Authorization", "").replace("Bearer ", "")

        if (
            settings.backend_api_key
            and api_key
            and hmac.compare_digest(api_key, settings.backend_api_key)
        ):
            request.state.auth_type = "api_key"
            return await call_next(request)

        # Check for JWT in Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                request.state.user_email = payload["sub"]
                request.state.auth_type = "jwt"
                return await call_next(request)

        # Check for JWT in httpOnly auth_token cookie
        cookie_token = request.cookies.get("auth_token")
        if cookie_token:
            payload = decode_access_token(cookie_token)
            if payload and payload.get("sub"):
                request.state.user_email = payload["sub"]
                request.state.auth_type = "jwt_cookie"
                return await call_next(request)

        # Reject unauthenticated requests in all environments
        return Response(
            content='{"error": "Unauthorized"}',
            status_code=401,
            media_type="application/json",
        )
