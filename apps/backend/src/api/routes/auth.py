"""
Auth Router — JWT-based authentication endpoints.

Endpoints:
  POST /api/auth/register         — Create account
  POST /api/auth/login            — Obtain JWT
  POST /api/auth/logout           — Invalidate session (client clears cookie)
  GET  /api/auth/me               — Current user
  PATCH /api/auth/me              — Update profile
  POST /api/auth/change-password  — Change password (requires current password)
  POST /api/auth/forgot-password  — Initiate password reset
  POST /api/auth/reset-password   — Complete password reset with token

Account lockout: 5 failed attempts → 15-minute lock.

Password reset: token stored as SHA-256 hash. In production wire up an email
provider (SendGrid, Resend, SES) to deliver the token. For local dev the token
is returned in the response body and logged to stdout.
"""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.jwt import create_access_token, get_password_hash
from src.auth.models import PasswordResetToken, User
from src.config.database import get_async_db
from src.config.settings import get_settings
from src.services.email import send_password_reset_email
from src.utils import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Auth"])

_RESET_TOKEN_EXPIRE_MINUTES = 60
_MIN_PASSWORD_LENGTH = 8


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ---------------------------------------------------------------------------
# Dependency — current authenticated user
# ---------------------------------------------------------------------------

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_async_db),
) -> User:
    """Resolve the JWT/cookie to a User row. Raises 401 if invalid."""
    email: str | None = getattr(request.state, "user_email", None)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _validate_password(password: str) -> None:
    if len(password) < _MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Password must be at least {_MIN_PASSWORD_LENGTH} characters",
        )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_async_db)) -> dict:
    """Create a new user account."""
    _validate_password(body.password)

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("User registered", email=user.email)
    return {"user": user.to_dict(), "message": "Account created"}


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_async_db)) -> dict:
    """Authenticate and return a JWT access token."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    # Constant-time path — always check password to prevent timing attacks
    dummy_hash = "$2b$12$" + "x" * 53  # noqa: S105 — dummy, never valid
    _candidate_hash = user.password_hash if user else dummy_hash

    from src.auth.jwt import verify_password
    password_ok = verify_password(body.password, _candidate_hash)

    if not user or not user.is_active or not password_ok:
        if user:
            if user.is_locked():
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="Account locked due to too many failed attempts. Try again later.",
                )
            user.record_failed_login()
            await db.commit()
            if user.is_locked():
                logger.warning("Account locked", email=user.email)
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="Account locked due to too many failed attempts. Try again later.",
                )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.is_locked():
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account locked due to too many failed attempts. Try again later.",
        )

    user.record_successful_login()
    await db.commit()

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user.to_dict()}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout() -> None:
    """Logout — client is responsible for clearing the auth cookie."""
    # JWT is stateless; the cookie is cleared by the Next.js /api/auth/logout route.
    return None


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> dict:
    """Return the current authenticated user."""
    return current_user.to_dict()


@router.patch("/me")
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """Update profile fields."""
    if body.full_name is not None:
        current_user.full_name = body.full_name
    await db.commit()
    await db.refresh(current_user)
    return current_user.to_dict()


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """Change password — requires current password for verification."""
    _validate_password(body.new_password)
    if not current_user.check_password(body.current_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.set_password(body.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """
    Initiate password reset.

    Always returns 200 to avoid revealing whether an email is registered.

    Production: wire up an email provider (SendGrid, Resend, SES) to send the
    token. The token is intentionally returned in the response body here so
    local development works without an email service.
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    response: dict = {"message": "If that email is registered, a reset link has been sent."}

    if not user or not user.is_active:
        return response

    # Invalidate any existing tokens for this user
    existing = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    )
    for old_token in existing.scalars().all():
        old_token.used_at = datetime.now(UTC)

    plain_token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=_hash_token(plain_token),
        expires_at=datetime.now(UTC) + timedelta(minutes=_RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset_token)
    await db.commit()

    # Send password reset email via Resend (falls back to logging if not configured)
    await send_password_reset_email(to_email=user.email, reset_token=plain_token)

    settings = get_settings()
    if settings.environment == "development" and settings.debug:
        # Dev only: surface the token so you can test without an email service.
        logger.warning("Password reset token returned in response (dev+debug only)", email=user.email)
        response["dev_token"] = plain_token
        response["dev_note"] = "Token returned in response body (dev+debug only)."

    return response


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """Complete password reset using the token from forgot-password."""
    _validate_password(body.new_password)

    token_hash = _hash_token(body.token)
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token or not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user_result = await db.execute(select(User).where(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.set_password(body.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    reset_token.used_at = datetime.now(UTC)
    await db.commit()

    logger.info("Password reset completed", email=user.email)
    return {"message": "Password reset successfully"}
