"""
Database error hierarchy and types.

Defines custom exceptions for database operations to provide consistent,
structured error handling across the application.
"""

from typing import Any


class DatabaseError(Exception):
    """Base exception for all database errors."""

    def __init__(self, message: str, operation: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.operation = operation  # e.g., "SELECT", "INSERT", "connect"
        self.details = details or {}

    def __str__(self) -> str:
        return f"{self.message} (operation: {self.operation})"


class ConnectionError(DatabaseError):
    """Raised when database connection fails or times out."""
    pass


class QueryTimeoutError(DatabaseError):
    """Raised when a query exceeds the configured timeout threshold."""
    pass


class IntegrityError(DatabaseError):
    """Raised for constraint violations (unique, foreign key, etc.)."""
    pass


class MigrationError(DatabaseError):
    """Raised when schema migration fails."""
    pass


class PoolExhaustedError(DatabaseError):
    """Raised when the connection pool is exhausted."""
    pass


class DatabaseUnavailableError(DatabaseError):
    """Raised when the database service is temporarily unavailable."""
    pass
