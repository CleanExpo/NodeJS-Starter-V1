"""
User Authentication Models
SQLAlchemy models for JWT-based authentication
"""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.models import Base

from .jwt import get_password_hash, verify_password

_MAX_FAILED_ATTEMPTS = 5
_LOCKOUT_MINUTES = 15


class User(Base):
    """User model for authentication."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False, server_default="0")
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships (back-populated from db.models)
    contractors = relationship("Contractor", back_populates="user")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        """Hash and set the user's password."""
        self.password_hash = get_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify the user's password."""
        return verify_password(password, self.password_hash)

    def is_locked(self) -> bool:
        """Return True if the account is currently locked."""
        if self.locked_until is None:
            return False
        return datetime.now(UTC) < self.locked_until

    def record_failed_login(self) -> None:
        """Increment failed attempts and lock if threshold reached."""
        from datetime import timedelta

        self.failed_login_attempts = (self.failed_login_attempts or 0) + 1
        if self.failed_login_attempts >= _MAX_FAILED_ATTEMPTS:
            self.locked_until = datetime.now(UTC) + timedelta(minutes=_LOCKOUT_MINUTES)

    def record_successful_login(self) -> None:
        """Reset lockout counters and update last_login_at."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.last_login_at = datetime.now(UTC)

    def to_dict(self) -> dict:
        """Convert user to dictionary (excluding password_hash)."""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class PasswordResetToken(Base):
    """Password reset token — single-use, time-limited."""

    __tablename__ = "password_reset_tokens"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    def is_valid(self) -> bool:
        """Return True if token has not expired and has not been used."""
        return self.used_at is None and datetime.now(UTC) < self.expires_at
