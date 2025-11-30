---
name: agents
version: 1.0.0
description: AI Agent building patterns
author: Your Team
priority: 3
triggers:
  - agent
  - orchestrator
  - ai
---

# Agent Building Patterns

## Agent Architecture

```python
from abc import ABC, abstractmethod
from typing import Any

class BaseAgent(ABC):
    """Base class for all agents."""

    def __init__(self, name: str, capabilities: list[str] | None = None):
        self.name = name
        self.capabilities = capabilities or []
        self.logger = get_logger(f"agent.{name}")

    @abstractmethod
    async def execute(
        self,
        task: str,
        context: dict[str, Any] | None = None,
    ) -> Any:
        """Execute a task."""
        pass

    def can_handle(self, task: str) -> bool:
        """Check if agent can handle task."""
        return any(cap in task.lower() for cap in self.capabilities)
```

## Specialized Agents

```python
class CodeAgent(BaseAgent):
    """Agent for code-related tasks."""

    def __init__(self):
        super().__init__(
            name="code",
            capabilities=["code", "implement", "fix", "refactor"],
        )

    async def execute(self, task: str, context: dict | None = None) -> dict:
        # Analyze task
        analysis = await self.analyze_task(task)

        # Generate solution
        solution = await self.generate_solution(analysis)

        # Verify solution
        verification = await self.verify_solution(solution)

        return {
            "solution": solution,
            "verification": verification,
        }
```

## Agent Registry

```python
class AgentRegistry:
    """Registry for managing agents."""

    def __init__(self):
        self._agents: dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent) -> None:
        self._agents[agent.name] = agent

    def get_agent(self, name: str) -> BaseAgent | None:
        return self._agents.get(name)

    def find_agent_for_task(self, task: str) -> BaseAgent | None:
        for agent in self._agents.values():
            if agent.can_handle(task):
                return agent
        return None
```

## Tool Integration

```python
class ToolExecutor:
    """Executes tools on behalf of agents."""

    def __init__(self):
        self.tools: dict[str, Callable] = {}

    def register_tool(self, name: str, func: Callable) -> None:
        self.tools[name] = func

    async def execute(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        tool = self.tools[tool_name]
        return await tool(**kwargs)

# Example tools
async def web_search(query: str) -> list[dict]:
    """Search the web."""
    ...

async def read_file(path: str) -> str:
    """Read a file."""
    ...

async def write_file(path: str, content: str) -> bool:
    """Write to a file."""
    ...
```

## Memory and Context

```python
class AgentMemory:
    """Memory system for agents."""

    def __init__(self, max_items: int = 100):
        self.short_term: list[dict] = []
        self.long_term: dict[str, Any] = {}
        self.max_items = max_items

    def add(self, item: dict) -> None:
        self.short_term.append(item)
        if len(self.short_term) > self.max_items:
            self.short_term.pop(0)

    def remember(self, key: str, value: Any) -> None:
        self.long_term[key] = value

    def recall(self, key: str) -> Any | None:
        return self.long_term.get(key)

    def get_context(self, last_n: int = 10) -> list[dict]:
        return self.short_term[-last_n:]
```

## Orchestration

```python
class Orchestrator:
    """Coordinates multiple agents."""

    def __init__(self):
        self.registry = AgentRegistry()
        self.memory = AgentMemory()

    async def process(self, task: str) -> dict:
        # Find appropriate agent
        agent = self.registry.find_agent_for_task(task)
        if not agent:
            return {"error": "No agent available for task"}

        # Build context
        context = {
            "history": self.memory.get_context(),
            "task": task,
        }

        # Execute task
        result = await agent.execute(task, context)

        # Store in memory
        self.memory.add({
            "task": task,
            "agent": agent.name,
            "result": result,
        })

        return result
```

## Verification Loop

```python
async def execute_with_verification(
    agent: BaseAgent,
    task: str,
    max_attempts: int = 3,
) -> dict:
    """Execute task with verification loop."""

    for attempt in range(max_attempts):
        # Execute
        result = await agent.execute(task)

        # Verify
        verification = await verify_result(result)

        if verification.passed:
            return {
                "success": True,
                "result": result,
                "attempts": attempt + 1,
            }

        # Log failure
        logger.warning(
            "Verification failed",
            attempt=attempt + 1,
            errors=verification.errors,
        )

    return {
        "success": False,
        "error": "Max attempts exceeded",
        "attempts": max_attempts,
    }
```

## Verification

- [ ] Agent handles tasks correctly
- [ ] Error handling works
- [ ] Memory persists appropriately
- [ ] Tools execute successfully
- [ ] Orchestration routes correctly
