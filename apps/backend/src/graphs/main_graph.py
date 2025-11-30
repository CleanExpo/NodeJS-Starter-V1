"""Main LangGraph workflow definition."""

from typing import Any, TypedDict

from langgraph.graph import StateGraph, END

from src.agents.orchestrator import OrchestratorAgent
from src.utils import get_logger

logger = get_logger(__name__)


class GraphState(TypedDict):
    """State for the main workflow graph."""

    input: str
    context: dict[str, Any]
    agent_output: dict[str, Any] | None
    final_response: str | None
    error: str | None


def create_main_graph() -> StateGraph:
    """Create the main LangGraph workflow.

    Returns:
        Compiled StateGraph
    """
    workflow = StateGraph(GraphState)

    # Add nodes
    workflow.add_node("route", route_node)
    workflow.add_node("execute", execute_node)
    workflow.add_node("respond", respond_node)
    workflow.add_node("error_handler", error_handler_node)

    # Set entry point
    workflow.set_entry_point("route")

    # Add edges
    workflow.add_conditional_edges(
        "route",
        should_execute,
        {
            "execute": "execute",
            "error": "error_handler",
        }
    )

    workflow.add_conditional_edges(
        "execute",
        check_execution,
        {
            "success": "respond",
            "error": "error_handler",
        }
    )

    workflow.add_edge("respond", END)
    workflow.add_edge("error_handler", END)

    return workflow.compile()


async def route_node(state: GraphState) -> GraphState:
    """Route incoming requests to appropriate handler."""
    logger.info("Routing request", input=state["input"][:100])

    # Simple routing - can be expanded with more sophisticated logic
    return state


def should_execute(state: GraphState) -> str:
    """Determine if we should execute or handle error."""
    if state.get("error"):
        return "error"
    return "execute"


async def execute_node(state: GraphState) -> GraphState:
    """Execute the task using the orchestrator."""
    try:
        orchestrator = OrchestratorAgent()
        result = await orchestrator.run(
            task_description=state["input"],
            context=state.get("context", {}),
        )
        state["agent_output"] = result
        logger.info("Execution completed", result=result)

    except Exception as e:
        state["error"] = str(e)
        logger.error("Execution failed", error=str(e))

    return state


def check_execution(state: GraphState) -> str:
    """Check if execution was successful."""
    if state.get("error"):
        return "error"
    return "success"


async def respond_node(state: GraphState) -> GraphState:
    """Generate final response."""
    output = state.get("agent_output", {})

    if output.get("completed", 0) > 0:
        state["final_response"] = "Task completed successfully."
    elif output.get("failed", 0) > 0:
        state["final_response"] = "Task failed. Please check the error details."
    else:
        state["final_response"] = "Task processed."

    return state


async def error_handler_node(state: GraphState) -> GraphState:
    """Handle errors in the workflow."""
    error = state.get("error", "Unknown error")
    state["final_response"] = f"An error occurred: {error}"
    logger.error("Error in workflow", error=error)
    return state
