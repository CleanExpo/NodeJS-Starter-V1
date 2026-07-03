"""
SQLAlchemy ORM Models for Workflow Builder

Database models for visual workflow creation and execution.
Scientific Luxury Design System compliant with spectral colour mapping.
"""

import enum
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .models import Base


class WorkflowNodeType(str, enum.Enum):
    """
    Workflow node types with Scientific Luxury spectral colour mapping.

    Colour Reference:
    - Cyan (#00F5FF): start, trigger, knowledge
    - Grey (#6B7280): end, output
    - Magenta (#FF00FF): llm, agent
    - Emerald (#00FF88): tool, action, http, code
    - Amber (#FFB800): conditional, logic, loop, verification
    """

    START = "start"
    TRIGGER = "trigger"
    END = "end"
    OUTPUT = "output"
    LLM = "llm"
    AGENT = "agent"
    TOOL = "tool"
    ACTION = "action"
    CONDITIONAL = "conditional"
    LOGIC = "logic"
    LOOP = "loop"
    KNOWLEDGE = "knowledge"
    HTTP = "http"
    CODE = "code"
    VERIFICATION = "verification"


class WorkflowEdgeType(str, enum.Enum):
    """Edge types for workflow connections."""

    DEFAULT = "default"
    TRUE = "true"
    FALSE = "false"
    SUCCESS = "success"
    ERROR = "error"
    ITEM = "item"


class WorkflowExecutionStatus(str, enum.Enum):
    """
    Execution status with Scientific Luxury colour mapping.

    Colour Reference:
    - Grey (#6B7280): pending, cancelled
    - Cyan (#00F5FF): running
    - Emerald (#00FF88): completed
    - Red (#FF4444): failed
    - Amber (#FFB800): awaiting
    """

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    AWAITING = "awaiting"


class Workflow(Base):
    """
    Workflow definition model.

    Table: workflows
    """

    __tablename__ = "workflows"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    variables: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    skill_compatibility: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    workflow_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="workflows")
    nodes = relationship(
        "WorkflowNode",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="WorkflowNode.created_at",
    )
    edges = relationship(
        "WorkflowEdge",
        back_populates="workflow",
        cascade="all, delete-orphan",
    )
    executions = relationship(
        "WorkflowExecution",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="WorkflowExecution.created_at.desc()",
    )
    collaborators = relationship(
        "WorkflowCollaborator",
        back_populates="workflow",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Workflow(id={self.id}, name={self.name})>"


class WorkflowNode(Base):
    """
    Workflow node model.

    Table: workflow_nodes
    """

    __tablename__ = "workflow_nodes"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    workflow_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[WorkflowNodeType] = mapped_column(
        Enum(WorkflowNodeType, name="workflow_node_type"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    position_x: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    position_y: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    inputs: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    outputs: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    node_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    workflow = relationship("Workflow", back_populates="nodes")
    outgoing_edges = relationship(
        "WorkflowEdge",
        foreign_keys="WorkflowEdge.source_node_id",
        back_populates="source_node",
        cascade="all, delete-orphan",
    )
    incoming_edges = relationship(
        "WorkflowEdge",
        foreign_keys="WorkflowEdge.target_node_id",
        back_populates="target_node",
        cascade="all, delete-orphan",
    )
    execution_logs = relationship(
        "WorkflowExecutionLog",
        back_populates="node",
        cascade="all, delete-orphan",
    )

    @property
    def position(self) -> dict[str, float]:
        """Return position as dict for React Flow compatibility."""
        return {"x": float(self.position_x), "y": float(self.position_y)}

    def __repr__(self) -> str:
        return f"<WorkflowNode(id={self.id}, type={self.type}, label={self.label})>"


class WorkflowEdge(Base):
    """
    Workflow edge model (connections between nodes).

    Table: workflow_edges
    """

    __tablename__ = "workflow_edges"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    workflow_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_node_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflow_nodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_node_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflow_nodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_handle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_handle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    type: Mapped[WorkflowEdgeType] = mapped_column(
        Enum(WorkflowEdgeType, name="workflow_edge_type"),
        default=WorkflowEdgeType.DEFAULT,
        nullable=False,
    )
    condition: Mapped[str | None] = mapped_column(Text, nullable=True)
    edge_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    workflow = relationship("Workflow", back_populates="edges")
    source_node = relationship(
        "WorkflowNode",
        foreign_keys=[source_node_id],
        back_populates="outgoing_edges",
    )
    target_node = relationship(
        "WorkflowNode",
        foreign_keys=[target_node_id],
        back_populates="incoming_edges",
    )

    def __repr__(self) -> str:
        return f"<WorkflowEdge(id={self.id}, {self.source_node_id} -> {self.target_node_id})>"


class WorkflowExecution(Base):
    """
    Workflow execution model.

    Table: workflow_executions
    """

    __tablename__ = "workflow_executions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    workflow_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[WorkflowExecutionStatus] = mapped_column(
        Enum(WorkflowExecutionStatus, name="workflow_execution_status"),
        default=WorkflowExecutionStatus.PENDING,
        nullable=False,
        index=True,
    )
    current_node_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflow_nodes.id", ondelete="SET NULL"),
        nullable=True,
    )
    variables: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    input_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    output_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    user = relationship("User", backref="workflow_executions")
    current_node = relationship("WorkflowNode", foreign_keys=[current_node_id])
    logs = relationship(
        "WorkflowExecutionLog",
        back_populates="execution",
        cascade="all, delete-orphan",
        order_by="WorkflowExecutionLog.created_at",
    )

    @property
    def duration_ms(self) -> int | None:
        """Calculate execution duration in milliseconds."""
        if self.completed_at and self.started_at:
            delta = self.completed_at - self.started_at
            return int(delta.total_seconds() * 1000)
        return None

    def __repr__(self) -> str:
        return f"<WorkflowExecution(id={self.id}, workflow_id={self.workflow_id}, status={self.status})>"


class WorkflowExecutionLog(Base):
    """
    Workflow execution log model (per-node execution details).

    Table: workflow_execution_logs
    """

    __tablename__ = "workflow_execution_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflow_executions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    node_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflow_nodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[WorkflowExecutionStatus] = mapped_column(
        Enum(WorkflowExecutionStatus, name="workflow_execution_status"),
        nullable=False,
        index=True,
    )
    input_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    output_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    execution = relationship("WorkflowExecution", back_populates="logs")
    node = relationship("WorkflowNode", back_populates="execution_logs")

    def __repr__(self) -> str:
        return f"<WorkflowExecutionLog(id={self.id}, node_id={self.node_id}, status={self.status})>"


class WorkflowCollaborator(Base):
    """
    Workflow collaborator model (for real-time collaboration).

    Table: workflow_collaborators
    """

    __tablename__ = "workflow_collaborators"
    __table_args__ = (UniqueConstraint("workflow_id", "user_id", name="uq_workflow_collaborator"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    workflow_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(50), default="editor", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    last_active_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=True,
    )
    cursor_position: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    workflow = relationship("Workflow", back_populates="collaborators")
    user = relationship("User", backref="workflow_collaborations")

    def __repr__(self) -> str:
        return f"<WorkflowCollaborator(workflow_id={self.workflow_id}, user_id={self.user_id})>"
