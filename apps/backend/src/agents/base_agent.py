"""Base agent class for all specialized agents.

CRITICAL: This module has been updated to eliminate self-attestation.
Agents can NO LONGER verify their own work - verification MUST be done
by the IndependentVerifier.

The old verify_build(), verify_tests(), verify_functionality() methods
now raise errors directing to use proper independent verification.
"""

from abc import ABC, abstractmethod
from typing import Any
import uuid

from pydantic import BaseModel, Field

from src.utils import get_logger
from src.skills import SkillLoader, SkillExecutor


# ============================================================================
# Verification Models (kept for backward compatibility, but deprecated)
# ============================================================================


class VerificationResult(BaseModel):
    """Result of a verification check.

    DEPRECATED: Use IndependentVerifier for actual verification.
    This model is kept for backward compatibility only.
    """

    success: bool
    error: str | None = None
    output: str | None = None
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    verified_by: str | None = Field(
        default=None,
        description="ID of verifier - if None, verification is self-attestation (INVALID)"
    )


class TaskOutput(BaseModel):
    """Structured output from a task execution."""

    task_id: str
    agent_id: str
    status: str = Field(description="completed, failed, or pending_verification")
    outputs: list[dict[str, Any]] = Field(
        default_factory=list,
        description="List of outputs claimed by agent"
    )
    completion_criteria: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Criteria that must be verified for completion"
    )
    requires_verification: bool = Field(
        default=True,
        description="Whether this task requires independent verification"
    )


# ============================================================================
# Self-Attestation Prevention
# ============================================================================


class SelfAttestationError(Exception):
    """Raised when an agent attempts to verify its own work."""

    def __init__(self, agent_name: str, method: str) -> None:
        super().__init__(
            f"SELF-ATTESTATION BLOCKED: Agent '{agent_name}' cannot call {method}() "
            f"on itself. Use IndependentVerifier for all verification. "
            f"Import from: src.verification import IndependentVerifier"
        )
        self.agent_name = agent_name
        self.method = method


# ============================================================================
# Base Agent Class
# ============================================================================


class BaseAgent(ABC):
    """Abstract base class for all agents.

    CRITICAL CHANGES (Verification System Update):
    - verify_build(), verify_tests(), verify_functionality() now RAISE ERRORS
    - All verification MUST go through IndependentVerifier
    - Agents report outputs, IndependentVerifier verifies them
    - This eliminates the "agents grading their own homework" problem

    New workflow:
    1. Agent executes task and produces outputs
    2. Agent reports outputs via get_task_output()
    3. Orchestrator sends outputs to IndependentVerifier
    4. Only IndependentVerifier can mark task as verified
    """

    def __init__(self, name: str, capabilities: list[str] | None = None) -> None:
        self.name = name
        self.agent_id = f"agent_{name}_{uuid.uuid4().hex[:8]}"
        self.capabilities = capabilities or []
        self.logger = get_logger(f"agent.{name}")
        self._current_task_id: str | None = None
        self._current_outputs: list[dict[str, Any]] = []
        self._completion_criteria: list[dict[str, Any]] = []

        # Skill integration
        self._skill_executor = SkillExecutor()
        self._loaded_skills: list[str] = []

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

    # =========================================================================
    # DEPRECATED METHODS - Now raise errors to prevent self-attestation
    # =========================================================================

    def verify_build(self) -> VerificationResult:
        """DEPRECATED: Agents cannot verify their own builds.

        Raises:
            SelfAttestationError: Always - use IndependentVerifier instead.
        """
        raise SelfAttestationError(self.name, "verify_build")

    def verify_tests(self) -> VerificationResult:
        """DEPRECATED: Agents cannot verify their own tests.

        Raises:
            SelfAttestationError: Always - use IndependentVerifier instead.
        """
        raise SelfAttestationError(self.name, "verify_tests")

    def verify_functionality(self, result: Any) -> VerificationResult:
        """DEPRECATED: Agents cannot verify their own functionality.

        Raises:
            SelfAttestationError: Always - use IndependentVerifier instead.
        """
        raise SelfAttestationError(self.name, "verify_functionality")

    # =========================================================================
    # NEW METHODS - For proper verification workflow
    # =========================================================================

    def start_task(self, task_id: str) -> None:
        """Start tracking a new task.

        Args:
            task_id: Unique identifier for this task
        """
        self._current_task_id = task_id
        self._current_outputs = []
        self._completion_criteria = []
        self.logger.info("Task started", task_id=task_id, agent=self.name)

    def report_output(
        self,
        output_type: str,
        path: str,
        description: str,
    ) -> None:
        """Report an output produced by this agent.

        These outputs will be verified by IndependentVerifier.

        Args:
            output_type: Type of output (file, endpoint, test, build, other)
            path: Path or URL of the output
            description: Human-readable description
        """
        self._current_outputs.append({
            "type": output_type,
            "path": path,
            "description": description,
        })
        self.logger.debug(
            "Output reported",
            output_type=output_type,
            path=path,
            agent=self.name,
        )

    def add_completion_criterion(
        self,
        criterion_type: str,
        target: str,
        expected: str | None = None,
        threshold: int | None = None,
    ) -> None:
        """Add a criterion that must be verified for task completion.

        Args:
            criterion_type: Type of verification (file_exists, tests_pass, etc.)
            target: What to verify (file path, test path, endpoint URL)
            expected: Expected value or status
            threshold: Threshold for numeric checks
        """
        self._completion_criteria.append({
            "type": criterion_type,
            "target": target,
            "expected": expected,
            "threshold": threshold,
        })
        self.logger.debug(
            "Completion criterion added",
            criterion_type=criterion_type,
            target=target,
            agent=self.name,
        )

    def get_task_output(self) -> TaskOutput:
        """Get the structured output for the current task.

        This is sent to IndependentVerifier for verification.

        Returns:
            TaskOutput with all claimed outputs and completion criteria
        """
        return TaskOutput(
            task_id=self._current_task_id or f"task_{uuid.uuid4().hex[:8]}",
            agent_id=self.agent_id,
            status="pending_verification",
            outputs=self._current_outputs,
            completion_criteria=self._completion_criteria,
            requires_verification=True,
        )

    def get_agent_id(self) -> str:
        """Get this agent's unique ID.

        Used by IndependentVerifier to ensure different agents verify work.
        """
        return self.agent_id

    def can_handle(self, task_description: str) -> bool:
        """Check if this agent can handle the given task.

        Args:
            task_description: Description of the task

        Returns:
            True if this agent can handle the task
        """
        task_lower = task_description.lower()
        return any(cap.lower() in task_lower for cap in self.capabilities)

    # =========================================================================
    # SKILL INTEGRATION - Load and use skills during task execution
    # =========================================================================

    def load_relevant_skills(self, task_description: str) -> list[str]:
        """Load skills relevant to the current task.

        This method finds skills that match the agent's capabilities and
        the task description, and loads them for use during execution.

        Args:
            task_description: Description of the task to execute

        Returns:
            List of loaded skill names
        """
        loaded = []

        # Try to find skills matching agent capabilities
        for capability in self.capabilities:
            # Map capabilities to skill paths
            skill_mapping = {
                "frontend": ["frontend/NEXTJS.md", "frontend/COMPONENTS.md"],
                "react": ["frontend/NEXTJS.md", "frontend/COMPONENTS.md"],
                "nextjs": ["frontend/NEXTJS.md"],
                "backend": ["backend/FASTAPI.md", "backend/AGENTS.md"],
                "api": ["backend/FASTAPI.md"],
                "fastapi": ["backend/FASTAPI.md"],
                "database": ["database/SUPABASE.md", "database/MIGRATIONS.md"],
                "supabase": ["database/SUPABASE.md"],
                "devops": ["devops/DOCKER.md", "devops/DEPLOYMENT.md"],
            }

            skill_paths = skill_mapping.get(capability.lower(), [])
            for skill_path in skill_paths:
                if self._skill_executor.load_skill(skill_path):
                    skill_name = skill_path.replace(".md", "").replace("/", "_")
                    loaded.append(skill_name)
                    self._loaded_skills.append(skill_name)

        # Always load core skills
        core_skills = [
            "core/VERIFICATION.md",
            "core/ERROR-HANDLING.md",
            "core/CODING-STANDARDS.md",
        ]
        for skill_path in core_skills:
            if self._skill_executor.load_skill(skill_path):
                skill_name = skill_path.replace(".md", "").replace("/", "_")
                if skill_name not in loaded:
                    loaded.append(skill_name)
                    self._loaded_skills.append(skill_name)

        if loaded:
            self.logger.info(
                "Loaded skills for task",
                task=task_description[:100],
                skills=loaded,
                agent=self.name,
            )

        return loaded

    def get_skill_context(self) -> str:
        """Get combined context from all loaded skills.

        Returns:
            Combined skill prompts as context for LLM
        """
        if not self._loaded_skills:
            return ""

        context_parts = ["# Loaded Skills and Guidelines\n"]

        for skill_name in self._loaded_skills:
            prompt = self._skill_executor.get_skill_prompt(skill_name)
            if prompt:
                context_parts.append(f"\n## {skill_name}\n")
                context_parts.append(prompt)
                context_parts.append("\n")

        return "\n".join(context_parts)

    def get_skill_verification_steps(self) -> list[str]:
        """Get verification steps from all loaded skills.

        Returns:
            List of verification step descriptions
        """
        all_steps = []

        for skill_name in self._loaded_skills:
            steps = self._skill_executor.get_verification_steps(skill_name)
            all_steps.extend(steps)

        return all_steps


# ============================================================================
# Specialized Agents
# ============================================================================


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
        task_id = f"frontend_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        self.logger.info("Executing frontend task", task=task_description)

        # Report what we're producing (will be verified independently)
        # In real implementation, this would track actual file outputs
        result = {"status": "pending_verification", "task": task_description}

        # Return result - verification happens separately via IndependentVerifier
        return {
            **result,
            "task_output": self.get_task_output().model_dump(),
        }


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
        task_id = f"backend_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        self.logger.info("Executing backend task", task=task_description)

        result = {"status": "pending_verification", "task": task_description}

        return {
            **result,
            "task_output": self.get_task_output().model_dump(),
        }


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
        task_id = f"database_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        self.logger.info("Executing database task", task=task_description)

        result = {"status": "pending_verification", "task": task_description}

        return {
            **result,
            "task_output": self.get_task_output().model_dump(),
        }


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
        task_id = f"devops_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        self.logger.info("Executing devops task", task=task_description)

        result = {"status": "pending_verification", "task": task_description}

        return {
            **result,
            "task_output": self.get_task_output().model_dump(),
        }


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
        task_id = f"general_{uuid.uuid4().hex[:8]}"
        self.start_task(task_id)

        self.logger.info("Executing general task", task=task_description)

        result = {"status": "pending_verification", "task": task_description}

        return {
            **result,
            "task_output": self.get_task_output().model_dump(),
        }
