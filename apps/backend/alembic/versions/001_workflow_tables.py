"""Add workflow builder tables

Revision ID: 001
Revises: None
Create Date: 2026-03-09

Creates the 6 workflow tables that exist in SQLAlchemy models (workflow_models.py)
but were missing from scripts/init-db.sql.

Tables created:
  - workflows
  - workflow_nodes
  - workflow_edges
  - workflow_executions
  - workflow_execution_logs
  - workflow_collaborators

ENUM types created:
  - workflow_node_type
  - workflow_edge_type
  - workflow_execution_status
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ENUM types
    workflow_node_type = sa.Enum(
        "start", "trigger", "end", "output", "llm", "agent", "tool", "action",
        "conditional", "logic", "loop", "knowledge", "http", "code", "verification",
        name="workflow_node_type",
    )
    workflow_edge_type = sa.Enum(
        "default", "true", "false", "success", "error", "item",
        name="workflow_edge_type",
    )
    workflow_execution_status = sa.Enum(
        "pending", "running", "completed", "failed", "cancelled", "awaiting",
        name="workflow_execution_status",
    )
    workflow_node_type.create(op.get_bind(), checkfirst=True)
    workflow_edge_type.create(op.get_bind(), checkfirst=True)
    workflow_execution_status.create(op.get_bind(), checkfirst=True)

    # workflows
    op.create_table(
        "workflows",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("version", sa.String(50), nullable=False, server_default="1.0.0"),
        sa.Column("is_published", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_template", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("tags", ARRAY(sa.Text), nullable=False, server_default="{}"),
        sa.Column("variables", JSONB, nullable=False, server_default="{}"),
        sa.Column("skill_compatibility", ARRAY(sa.Text), nullable=False, server_default="{}"),
        sa.Column("metadata", JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("idx_workflows_user_id", "workflows", ["user_id"])
    op.create_index("idx_workflows_is_published", "workflows", ["is_published"])

    # workflow_nodes
    op.create_table(
        "workflow_nodes",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PGUUID(as_uuid=True), sa.ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("type", PGEnum(name="workflow_node_type", create_type=False), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("position_x", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("position_y", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("config", JSONB, nullable=False, server_default="{}"),
        sa.Column("inputs", JSONB, nullable=False, server_default="{}"),
        sa.Column("outputs", JSONB, nullable=False, server_default="{}"),
        sa.Column("metadata", JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_workflow_nodes_type", "workflow_nodes", ["type"])

    # workflow_edges
    op.create_table(
        "workflow_edges",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PGUUID(as_uuid=True), sa.ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("source_node_id", PGUUID(as_uuid=True), sa.ForeignKey("workflow_nodes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("target_node_id", PGUUID(as_uuid=True), sa.ForeignKey("workflow_nodes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("source_handle", sa.String(100), nullable=True),
        sa.Column("target_handle", sa.String(100), nullable=True),
        sa.Column("type", PGEnum(name="workflow_edge_type", create_type=False), nullable=False, server_default="default"),
        sa.Column("condition", sa.Text, nullable=True),
        sa.Column("metadata", JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # workflow_executions
    op.create_table(
        "workflow_executions",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PGUUID(as_uuid=True), sa.ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("user_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("status", PGEnum(name="workflow_execution_status", create_type=False), nullable=False, server_default="pending"),
        sa.Column("current_node_id", PGUUID(as_uuid=True), sa.ForeignKey("workflow_nodes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("variables", JSONB, nullable=False, server_default="{}"),
        sa.Column("input_data", JSONB, nullable=False, server_default="{}"),
        sa.Column("output_data", JSONB, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now(), index=True),
    )
    op.create_index("idx_workflow_executions_status", "workflow_executions", ["status"])

    # workflow_execution_logs
    op.create_table(
        "workflow_execution_logs",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("execution_id", PGUUID(as_uuid=True), sa.ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("node_id", PGUUID(as_uuid=True), sa.ForeignKey("workflow_nodes.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", PGEnum(name="workflow_execution_status", create_type=False), nullable=False),
        sa.Column("input_data", JSONB, nullable=True),
        sa.Column("output_data", JSONB, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_ms", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # workflow_collaborators
    op.create_table(
        "workflow_collaborators",
        sa.Column("id", PGUUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PGUUID(as_uuid=True), sa.ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("user_id", PGUUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.String(50), nullable=False, server_default="editor"),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("last_active_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cursor_position", JSONB, nullable=True),
        sa.UniqueConstraint("workflow_id", "user_id", name="uq_workflow_collaborator"),
    )


def downgrade() -> None:
    op.drop_table("workflow_collaborators")
    op.drop_table("workflow_execution_logs")
    op.drop_table("workflow_executions")
    op.drop_table("workflow_edges")
    op.drop_table("workflow_nodes")
    op.drop_table("workflows")
    sa.Enum(name="workflow_execution_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="workflow_edge_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="workflow_node_type").drop(op.get_bind(), checkfirst=True)
