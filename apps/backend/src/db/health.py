"""
Database health monitoring and circuit breaker.

Provides tools to check database connectivity and implements a circuit breaker
pattern to prevent cascading failures during database outages.
"""

import asyncio
import time
from typing import Any

from src.utils import get_logger

logger = get_logger(__name__)

# Circuit breaker state constants
CLOSED = "closed"
OPEN = "open"
HALF_OPEN = "half_open"


class DatabaseHealthMonitor:
    """
    Monitors database health and implements a circuit breaker pattern.

    Uses a simple state machine: CLOSED → OPEN → HALF_OPEN → CLOSED
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        timeout_seconds: int = 10,
        recovery_timeout_seconds: int = 30,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.recovery_timeout_seconds = recovery_timeout_seconds

        # State
        self.state = CLOSED
        self.failures = 0
        self.last_failure_time: float | None = None
        self.last_recovery_time: float | None = None

        # Lock for thread safety
        self._lock = asyncio.Lock()

    async def check_health(self) -> dict[str, Any]:
        """
        Check database health with circuit breaker protection.

        Returns:
            Dictionary with health status and details
        """
        async with self._lock:
            # If breaker is open, return failure immediately
            if self.state == OPEN:
                return {
                    "healthy": False,
                    "state": self.state,
                    "failures": self.failures,
                    "last_failure": self.last_failure_time,
                    "reason": "circuit breaker open",
                }

            # If in half-open state, try a single test
            if self.state == HALF_OPEN:
                return await self._test_connection()

            # In closed state, try to connect
            return await self._test_connection()

    async def _test_connection(self) -> dict[str, Any]:
        """
        Test actual database connection.

        Returns:
            Dictionary with health status and details
        """
        start_time = time.time()

        try:
            # Import the database connection here to avoid circular imports
            from sqlalchemy import text

            from src.config.database import async_engine, get_database_url

            # Get database URL
            db_url = get_database_url(async_mode=True)

            # Test connection on the shared async engine
            async with async_engine.connect() as connection:
                await connection.execute(text("SELECT 1"))

            # Success
            duration = time.time() - start_time
            await self._handle_success()

            return {
                "healthy": True,
                "state": CLOSED,
                "response_time": round(duration * 1000, 2),  # ms
                "failures": self.failures,
                "last_success": time.time(),
                "url": db_url,
            }

        except Exception as e:
            duration = time.time() - start_time
            await self._handle_failure(str(e))

            return {
                "healthy": False,
                "state": self.state,
                "response_time": round(duration * 1000, 2),  # ms
                "failures": self.failures,
                "last_failure": self.last_failure_time,
                "error": str(e),
            }

    async def _handle_success(self) -> None:
        """
        Handle successful connection.
        """
        if self.state == HALF_OPEN:
            self.state = CLOSED
            self.failures = 0
            self.last_recovery_time = time.time()
            logger.info("Database connection recovered - circuit breaker closed")

    async def _handle_failure(self, error: str) -> None:
        """
        Handle connection failure.
        """
        self.failures += 1
        self.last_failure_time = time.time()

        if self.state == CLOSED:
            if self.failures >= self.failure_threshold:
                self.state = OPEN
                logger.warning(
                    f"Database failure threshold reached ({self.failures}/{self.failure_threshold}). "
                    "Circuit breaker opened."
                )
        elif self.state == OPEN:
            # In OPEN state, wait for recovery timeout before transitioning to HALF_OPEN
            if self.last_failure_time and (time.time() - self.last_failure_time > self.recovery_timeout_seconds):
                self.state = HALF_OPEN
                logger.info("Database circuit breaker in half-open state - testing connection")


class HealthChecker:
    """
    Utility class for checking database health.

    Provides a simple API to check if database is available.
    """

    def __init__(self) -> None:
        self.monitor = DatabaseHealthMonitor()

    async def check_db_health(self) -> dict[str, Any]:
        """
        Check database health with circuit breaker.

        Returns:
            Dictionary with health status and details
        """
        return await self.monitor.check_health()

    async def ensure_db_available(self) -> bool:
        """
        Ensure database is available and reachable.

        Returns:
            True if database is available, False otherwise
        """
        health = await self.check_db_health()
        return health["healthy"]

    async def get_circuit_breaker_status(self) -> dict[str, Any]:
        """
        Get current circuit breaker status.

        Returns:
            Dictionary with circuit breaker state and stats
        """
        return {
            "state": self.monitor.state,
            "failures": self.monitor.failures,
            "failure_threshold": self.monitor.failure_threshold,
            "recovery_timeout": self.monitor.recovery_timeout_seconds,
            "last_failure": self.monitor.last_failure_time,
            "last_recovery": self.monitor.last_recovery_time,
        }

    async def report_health(self) -> None:
        """
        Report database health status.
        """
        health = await self.check_db_health()

        if health["healthy"]:
            logger.info("Database is healthy", status=health)
        else:
            logger.warning("Database health check failed", status=health)
