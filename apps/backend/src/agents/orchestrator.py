"""
Orchestrator Agent - Python/LangGraph implementation
Mirrors the SKILL.md orchestrator for backend execution
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel

from .base_agent import BaseAgent, VerificationResult
from .registry import AgentRegistry
from src.utils import get_logger

logger = get_logger(__name__)


class TaskStatus(str, Enum):
    """Status of a task."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskState(BaseModel):
    """State of a task being processed."""

    task_id: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: str | None = None
    attempts: int = 0
    max_attempts: int = 3
    verification: VerificationResult | None = None
    error_history: list[str] = []
    result: Any = None


class OrchestratorState(BaseModel):
    """State managed by the orchestrator."""

    current_task: TaskState | None = None
    completed_tasks: list[TaskState] = []
    failed_tasks: list[TaskState] = []
    context: dict[str, Any] = {}


class OrchestratorAgent(BaseAgent):
    """
    Master orchestrator that:
    1. Routes tasks to appropriate agents
    2. Enforces verification-first development
    3. Maintains honest status reporting
    4. Handles escalation after failures
    """

    def __init__(self) -> None:
        super().__init__(
            name="orchestrator",
            capabilities=["orchestrate", "route", "manage", "coordinate"],
        )
        self.registry = AgentRegistry()

    async def execute(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute the orchestrator on a task."""
        return await self.run(task_description, context)

    async def run(
        self,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Run the orchestrator on a task."""
        task_id = f"task_{hash(task_description) % 10000}"

        state = OrchestratorState(
            current_task=TaskState(
                task_id=task_id,
                description=task_description,
            ),
            context=context or {},
        )

        # Execute the orchestration workflow
        state = await self._route_task(state)

        if state.current_task and state.current_task.status != TaskStatus.BLOCKED:
            state = await self._execute_task(state)
            state = await self._verify_task(state)

            if state.current_task.status == TaskStatus.FAILED:
                state = await self._handle_failure(state)

                # Retry if attempts remaining
                while (
                    state.current_task
                    and state.current_task.status == TaskStatus.FAILED
                    and state.current_task.attempts < state.current_task.max_attempts
                ):
                    state = await self._execute_task(state)
                    state = await self._verify_task(state)

                    if state.current_task.status == TaskStatus.FAILED:
                        state = await self._handle_failure(state)

            if state.current_task.status == TaskStatus.COMPLETED:
                state = self._complete_task(state)
            elif state.current_task.status == TaskStatus.FAILED:
                state.failed_tasks.append(state.current_task)
                state.current_task = None

        return {
            "task_id": task_id,
            "completed": len(state.completed_tasks),
            "failed": len(state.failed_tasks),
            "tasks": [
                task.model_dump()
                for task in state.completed_tasks + state.failed_tasks
            ],
        }

    async def _route_task(self, state: OrchestratorState) -> OrchestratorState:
        """Route task to appropriate agent based on task type."""
        if not state.current_task:
            return state

        task = state.current_task
        category = self._categorize_task(task.description)
        agent = self.registry.get_agent_for_category(category)

        if agent:
            task.assigned_agent = agent.name
            task.status = TaskStatus.IN_PROGRESS
            logger.info(
                "Routed task to agent",
                task_id=task.task_id,
                agent=agent.name,
                category=category,
            )
        else:
            task.status = TaskStatus.BLOCKED
            task.error_history.append(f"No agent found for category: {category}")
            logger.warning("No agent found for task", category=category)

        return state

    async def _execute_task(self, state: OrchestratorState) -> OrchestratorState:
        """Execute the task using assigned agent."""
        if not state.current_task or not state.current_task.assigned_agent:
            return state

        task = state.current_task
        task.attempts += 1

        agent = self.registry.get_agent(task.assigned_agent)
        if not agent:
            task.status = TaskStatus.FAILED
            task.error_history.append(f"Agent not found: {task.assigned_agent}")
            return state

        try:
            result = await agent.execute(task.description, state.context)
            task.result = result
            task.status = TaskStatus.VERIFYING
            logger.info("Task execution completed", task_id=task.task_id, attempt=task.attempts)
        except Exception as e:
            task.error_history.append(str(e))
            task.status = TaskStatus.FAILED
            logger.error("Task execution failed", task_id=task.task_id, error=str(e))

        return state

    async def _verify_task(self, state: OrchestratorState) -> OrchestratorState:
        """
        Verify task completion - THE CRITICAL STEP

        This is where we enforce verification-first development.
        No assumptions. Actual verification.
        """
        if not state.current_task or not state.current_task.assigned_agent:
            return state

        task = state.current_task
        agent = self.registry.get_agent(task.assigned_agent)

        if not agent:
            task.status = TaskStatus.FAILED
            return state

        verification = VerificationResult(success=True)
        errors: list[str] = []

        # Build check
        build_result = agent.verify_build()
        if not build_result.success:
            verification.success = False
            errors.append(f"Build failed: {build_result.error}")

        # Test check
        test_result = agent.verify_tests()
        if not test_result.success:
            verification.success = False
            errors.append(f"Tests failed: {test_result.error}")

        # Functional check
        func_result = agent.verify_functionality(task.result)
        if not func_result.success:
            verification.success = False
            errors.append(f"Functionality check failed: {func_result.error}")

        task.verification = VerificationResult(
            success=verification.success,
            error="; ".join(errors) if errors else None,
        )

        if verification.success:
            task.status = TaskStatus.COMPLETED
            logger.info("Task verification passed", task_id=task.task_id)
        else:
            task.status = TaskStatus.FAILED
            task.error_history.extend(errors)
            logger.warning("Task verification failed", task_id=task.task_id, errors=errors)

        return state

    async def _handle_failure(self, state: OrchestratorState) -> OrchestratorState:
        """
        Handle task failure with honest reporting.

        No sugar-coating. No "almost working".
        State clearly what failed and why.
        """
        if not state.current_task:
            return state

        task = state.current_task
        failure_report = self._generate_failure_report(task)
        task.error_history.append(failure_report)

        logger.warning(
            "Task failed",
            task_id=task.task_id,
            attempt=task.attempts,
            max_attempts=task.max_attempts,
        )

        return state

    def _complete_task(self, state: OrchestratorState) -> OrchestratorState:
        """Mark task as complete and move to completed list."""
        if state.current_task:
            state.completed_tasks.append(state.current_task)
            state.current_task = None
        return state

    def _categorize_task(self, description: str) -> str:
        """Categorize task based on description."""
        description_lower = description.lower()

        keywords = {
            "frontend": ["frontend", "component", "ui", "page", "next", "react", "css", "tailwind"],
            "backend": ["backend", "api", "agent", "langgraph", "python", "fastapi"],
            "database": ["database", "migration", "supabase", "sql", "query", "schema"],
            "devops": ["deploy", "docker", "ci", "cd", "devops", "infrastructure"],
        }

        for category, words in keywords.items():
            if any(word in description_lower for word in words):
                return category

        return "general"

    def _generate_failure_report(self, task: TaskState) -> str:
        """Generate honest failure report."""
        report = f"""
## Task Failed: {task.description}

### Attempt: {task.attempts}/{task.max_attempts}

### Verification Results:
"""
        if task.verification:
            status = "PASS" if task.verification.success else "FAIL"
            report += f"- Overall: {status}\n"
            if task.verification.error:
                report += f"- Error: {task.verification.error}\n"

        if task.error_history:
            report += "\n### Error History:\n"
            for error in task.error_history[-3:]:  # Last 3 errors
                report += f"- {error}\n"

        return report
