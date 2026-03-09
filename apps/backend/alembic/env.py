"""Alembic environment configuration.

Reads DATABASE_URL from environment (or alembic.ini fallback).
Imports all SQLAlchemy models so autogenerate detects all tables.
"""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Import Base and ALL models so autogenerate detects them
from src.db.models import Base  # noqa: F401 — registers: users, contractors, availability_slots, documents
from src.db.workflow_models import (  # noqa: F401 — registers: workflows, workflow_nodes, workflow_edges, workflow_executions, workflow_execution_logs, workflow_collaborators
    Workflow,
    WorkflowCollaborator,
    WorkflowEdge,
    WorkflowExecution,
    WorkflowExecutionLog,
    WorkflowNode,
)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Use DATABASE_URL env var if set (overrides alembic.ini for production/CI)
database_url = os.environ.get("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL without a live DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (requires live DB connection)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
