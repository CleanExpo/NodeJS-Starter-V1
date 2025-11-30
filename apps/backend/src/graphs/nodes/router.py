"""Router node for directing tasks to appropriate agents."""

from typing import Any

from src.agents.registry import AgentRegistry
from src.utils import get_logger

logger = get_logger(__name__)


class RouterNode:
    """Routes tasks to the appropriate agent based on task type."""

    def __init__(self) -> None:
        self.registry = AgentRegistry()

    def route(self, task_description: str) -> str:
        """Determine which agent should handle the task.

        Args:
            task_description: Description of the task

        Returns:
            Name of the agent to handle the task
        """
        agent = self.registry.get_agent_for_task(task_description)
        if agent:
            logger.info("Routed task to agent", agent=agent.name)
            return agent.name

        logger.warning("No specific agent found, using general")
        return "general"

    def get_agent_capabilities(self, agent_name: str) -> list[str]:
        """Get capabilities of a specific agent.

        Args:
            agent_name: Name of the agent

        Returns:
            List of capability strings
        """
        agent = self.registry.get_agent(agent_name)
        if agent:
            return agent.capabilities
        return []

    def list_available_agents(self) -> list[dict[str, Any]]:
        """List all available agents.

        Returns:
            List of agent information
        """
        return self.registry.list_agents()
