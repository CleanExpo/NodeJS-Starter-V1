"""
SQLAlchemy ORM Models

Database models matching the PostgreSQL schema from init-db.sql.
These are separate from Pydantic models (used for API validation).
"""

import enum
from datetime import UTC, datetime
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


class AustralianState(str, enum.Enum):
    """Australian states and territories (matching database ENUM)."""

    QLD = "QLD"  # Queensland
    NSW = "NSW"  # New South Wales
    VIC = "VIC"  # Victoria
    SA = "SA"  # South Australia
    WA = "WA"  # Western Australia
    TAS = "TAS"  # Tasmania
    NT = "NT"  # Northern Territory
    ACT = "ACT"  # Australian Capital Territory


class AvailabilityStatus(str, enum.Enum):
    """Availability status for contractor slots (matching database ENUM)."""

    AVAILABLE = "available"
    BOOKED = "booked"
    TENTATIVE = "tentative"
    UNAVAILABLE = "unavailable"


class Contractor(Base):
    """
    Contractor model for tracking contractor information.

    Table: contractors
    """

    __tablename__ = "contractors"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    abn: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    specialisation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="contractors")
    availability_slots = relationship("AvailabilitySlot", back_populates="contractor", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Contractor(id={self.id}, name={self.name})>"


class AvailabilitySlot(Base):
    """
    Availability slot model for contractor scheduling.

    Table: availability_slots
    """

    __tablename__ = "availability_slots"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    contractor_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("contractors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    start_time: Mapped[datetime] = mapped_column(Time, nullable=False)
    end_time: Mapped[datetime] = mapped_column(Time, nullable=False)
    suburb: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[AustralianState] = mapped_column(
        Enum(AustralianState, name="australian_state"),
        nullable=False,
        default=AustralianState.QLD,
        index=True,
    )
    postcode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[AvailabilityStatus] = mapped_column(
        Enum(AvailabilityStatus, name="availability_status"),
        default=AvailabilityStatus.AVAILABLE,
        index=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    contractor = relationship("Contractor", back_populates="availability_slots")

    def __repr__(self) -> str:
        return f"<AvailabilitySlot(id={self.id}, contractor_id={self.contractor_id}, date={self.date})>"


class Document(Base):
    """
    Document model for RAG/semantic search with pgvector.

    Table: documents
    """

    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536), nullable=True)  # OpenAI/Anthropic dimension
    # Renamed from 'metadata' to avoid SQLAlchemy reserved name
    doc_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, title={self.title})>"
