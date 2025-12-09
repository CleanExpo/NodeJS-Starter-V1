"""Agents module."""

from .orchestrator import OrchestratorAgent
from .base_agent import BaseAgent
from .registry import AgentRegistry
from .marketing_agents import CopywritingAgent, BusinessConsistencyAgent
from .factory import create_agent, list_agent_types, get_agent_capabilities, AGENT_CONFIGS

__all__ = [
    "OrchestratorAgent",
    "BaseAgent",
    "AgentRegistry",
    "CopywritingAgent",
    "BusinessConsistencyAgent",
    # Agent Factory (recommended for creating new agents)
    "create_agent",
    "list_agent_types",
    "get_agent_capabilities",
    "AGENT_CONFIGS",
]
