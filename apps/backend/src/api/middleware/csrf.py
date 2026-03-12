"""CSRF protection middleware using double-submit cookie pattern."""

import secrets
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "x-csrf-token"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}
EXEMPT_PATHS = {"/health", "/ready", "/docs", "/openapi.json", "/redoc"}


class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF protection using double-submit cookie pattern."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip CSRF for safe methods
        if request.method in SAFE_METHODS:
            response = await call_next(request)
            # Set CSRF cookie on GET requests if not present
            if request.method == "GET" and CSRF_COOKIE_NAME not in request.cookies:
                token = secrets.token_urlsafe(32)
                response.set_cookie(
                    key=CSRF_COOKIE_NAME,
                    value=token,
                    httponly=False,  # Must be readable by JS
                    samesite="lax",
                    secure=request.url.scheme == "https",
                    path="/",
                )
            return response

        # Skip CSRF for exempt paths
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        # Validate CSRF token
        cookie_token = request.cookies.get(CSRF_COOKIE_NAME)
        header_token = request.headers.get(CSRF_HEADER_NAME)

        if not cookie_token or not header_token or cookie_token != header_token:
            return Response(
                content='{"detail": "CSRF validation failed"}',
                status_code=403,
                media_type="application/json",
            )

        return await call_next(request)
