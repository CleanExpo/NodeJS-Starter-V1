"""Base agent class for all specialized agents."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel

from src.utils import get_logger


class VerificationResult(BaseModel):
    """Result of a verification check."""

    success: bool
    error: str | None = None
    output: str | None = None


class BaseAgent(ABC):
    """Abstract base class for all agents."""

    def __init__(self, name: str, capabilities: list[str] | None = None) -> None:
        self.name = name
        self.capabilities = capabilities or []
        self.logger = get_logger(f"agent.{name}")

    @abstractmethod
    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> Any:
        """Execute a task.

        Args:
            task_description: Description of the task to execute
            context: Additional context for the task

        Returns:
            The result of the task execution
        """
        pass

    def verify_build(self) -> VerificationResult:
        """Verify that the build passes.

        Override in subclasses for specific build verification.
        """
        return VerificationResult(success=True)

    def verify_tests(self) -> VerificationResult:
        """Verify that tests pass.

        Override in subclasses for specific test verification.
        """
        return VerificationResult(success=True)

    def verify_functionality(self, result: Any) -> VerificationResult:
        """Verify that the functionality works as expected.

        Override in subclasses for specific functionality verification.
        """
        if result is None:
            return VerificationResult(success=False, error="No result produced")
        return VerificationResult(success=True)

    def can_handle(self, task_description: str) -> bool:
        """Check if this agent can handle the given task.

        Args:
            task_description: Description of the task

        Returns:
            True if this agent can handle the task
        """
        task_lower = task_description.lower()
        return any(cap.lower() in task_lower for cap in self.capabilities)


class FrontendAgent(BaseAgent):
    """Agent for frontend-related tasks."""

    def __init__(self) -> None:
        super().__init__(
            name="frontend",
            capabilities=["frontend", "react", "next", "component", "ui", "css", "tailwind"],
        )

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a frontend task."""
        self.logger.info("Executing frontend task", task=task_description)
        # Placeholder implementation
        return {"status": "completed", "task": task_description}


class BackendAgent(BaseAgent):
    """Agent for backend-related tasks."""

    def __init__(self) -> None:
        super().__init__(
            name="backend",
            capabilities=["backend", "api", "python", "fastapi", "langgraph", "agent"],
        )

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a backend task."""
        self.logger.info("Executing backend task", task=task_description)
        # Placeholder implementation
        return {"status": "completed", "task": task_description}


class DatabaseAgent(BaseAgent):
    """Agent for database-related tasks."""

    def __init__(self) -> None:
        super().__init__(
            name="database",
            capabilities=["database", "sql", "supabase", "migration", "query", "schema"],
        )

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a database task."""
        self.logger.info("Executing database task", task=task_description)
        # Placeholder implementation
        return {"status": "completed", "task": task_description}


class DevOpsAgent(BaseAgent):
    """Agent for DevOps-related tasks."""

    def __init__(self) -> None:
        super().__init__(
            name="devops",
            capabilities=["devops", "docker", "deploy", "ci", "cd", "infrastructure"],
        )

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a devops task."""
        self.logger.info("Executing devops task", task=task_description)
        # Placeholder implementation
        return {"status": "completed", "task": task_description}


class GeneralAgent(BaseAgent):
    """General-purpose agent for tasks that don't fit other categories."""

    def __init__(self) -> None:
        super().__init__(
            name="general",
            capabilities=["general", "help", "question", "explain"],
        )

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a general task."""
        self.logger.info("Executing general task", task=task_description)
        # Placeholder implementation
        return {"status": "completed", "task": task_description}
