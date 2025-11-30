"""Executor node for running agent tasks."""

from typing import Any

from src.agents.registry import AgentRegistry
from src.utils import get_logger

logger = get_logger(__name__)


class ExecutorNode:
    """Executes tasks using the appropriate agent."""

    def __init__(self) -> None:
        self.registry = AgentRegistry()

    async def execute(
        self,
        agent_name: str,
        task_description: str,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute a task with the specified agent.

        Args:
            agent_name: Name of the agent to use
            task_description: Description of the task
            context: Additional context for the task

        Returns:
            Execution result
        """
        agent = self.registry.get_agent(agent_name)

        if not agent:
            logger.error("Agent not found", name=agent_name)
            return {
                "success": False,
                "error": f"Agent not found: {agent_name}",
            }

        try:
            logger.info("Executing task", agent=agent_name, task=task_description[:100])
            result = await agent.execute(task_description, context)

            return {
                "success": True,
                "agent": agent_name,
                "result": result,
            }

        except Exception as e:
            logger.error("Execution failed", agent=agent_name, error=str(e))
            return {
                "success": False,
                "agent": agent_name,
                "error": str(e),
            }

    async def execute_with_retry(
        self,
        agent_name: str,
        task_description: str,
        context: dict[str, Any] | None = None,
        max_retries: int = 3,
    ) -> dict[str, Any]:
        """Execute a task with retry logic.

        Args:
            agent_name: Name of the agent to use
            task_description: Description of the task
            context: Additional context for the task
            max_retries: Maximum number of retry attempts

        Returns:
            Execution result
        """
        last_error = None

        for attempt in range(max_retries):
            result = await self.execute(agent_name, task_description, context)

            if result["success"]:
                return result

            last_error = result.get("error")
            logger.warning(
                "Execution attempt failed",
                attempt=attempt + 1,
                max_retries=max_retries,
                error=last_error,
            )

        return {
            "success": False,
            "agent": agent_name,
            "error": f"Failed after {max_retries} attempts: {last_error}",
        }
