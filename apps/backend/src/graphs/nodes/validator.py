"""Validator node for verifying task outputs."""

from typing import Any

from src.agents.registry import AgentRegistry
from src.agents.base_agent import VerificationResult
from src.utils import get_logger

logger = get_logger(__name__)


class ValidatorNode:
    """Validates task outputs using agent verification methods."""

    def __init__(self) -> None:
        self.registry = AgentRegistry()

    def validate(
        self,
        agent_name: str,
        result: Any,
    ) -> VerificationResult:
        """Validate a task result.

        Args:
            agent_name: Name of the agent that produced the result
            result: The result to validate

        Returns:
            VerificationResult with success status and any errors
        """
        agent = self.registry.get_agent(agent_name)

        if not agent:
            return VerificationResult(
                success=False,
                error=f"Agent not found: {agent_name}",
            )

        # Run all verification checks
        errors: list[str] = []

        # Check build
        build_result = agent.verify_build()
        if not build_result.success:
            errors.append(f"Build: {build_result.error}")

        # Check tests
        test_result = agent.verify_tests()
        if not test_result.success:
            errors.append(f"Tests: {test_result.error}")

        # Check functionality
        func_result = agent.verify_functionality(result)
        if not func_result.success:
            errors.append(f"Functionality: {func_result.error}")

        if errors:
            return VerificationResult(
                success=False,
                error="; ".join(errors),
            )

        logger.info("Validation passed", agent=agent_name)
        return VerificationResult(success=True)

    def quick_validate(self, result: Any) -> bool:
        """Quick validation check for a result.

        Args:
            result: The result to validate

        Returns:
            True if the result appears valid
        """
        if result is None:
            return False

        if isinstance(result, dict):
            if result.get("error"):
                return False
            if result.get("status") == "failed":
                return False

        return True

    def generate_validation_report(
        self,
        agent_name: str,
        result: Any,
        verification: VerificationResult,
    ) -> str:
        """Generate a human-readable validation report.

        Args:
            agent_name: Name of the agent
            result: The task result
            verification: The verification result

        Returns:
            Formatted validation report
        """
        status = "PASSED" if verification.success else "FAILED"

        report = f"""
## Validation Report

**Agent:** {agent_name}
**Status:** {status}
"""

        if not verification.success and verification.error:
            report += f"\n**Errors:**\n{verification.error}\n"

        if result:
            report += f"\n**Result Summary:**\n{str(result)[:500]}\n"

        return report
