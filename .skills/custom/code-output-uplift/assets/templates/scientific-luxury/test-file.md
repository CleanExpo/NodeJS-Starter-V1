---
template: test-file
variant: scientific-luxury
locale: en-AU
design-system: scientific-luxury
---

# Test file template — Scientific Luxury

## TypeScript (Vitest)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AgentDashboard } from '../AgentDashboard';
import { createMockAgentState } from '../../test-utils/agent-fixtures';

// --- Test fixtures ---

const MOCK_AGENT_ID = 'agent-001';

function createDefaultProps(): React.ComponentProps<typeof AgentDashboard> {
  return {
    agentId: MOCK_AGENT_ID,
    onComplete: vi.fn(),
  };
}

// --- Tests ---

describe('AgentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('displays the agent status when loaded', async () => {
      // Arrange
      const mockAgentState = createMockAgentState({ status: 'active' });
      vi.mocked(fetchAgentState).mockResolvedValueOnce(mockAgentState);
      const props = createDefaultProps();

      // Act
      render(<AgentDashboard {...props} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('renders the empty state when no agent ID is provided', () => {
      // Arrange
      const props = createDefaultProps();
      props.agentId = '';

      // Act
      render(<AgentDashboard {...props} />);

      // Assert
      expect(screen.getByText('No resource selected.')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('displays an error message when the agent fetch fails', async () => {
      // Arrange
      const networkError = new Error('Network request failed');
      vi.mocked(fetchAgentState).mockRejectedValueOnce(networkError);
      const props = createDefaultProps();

      // Act
      render(<AgentDashboard {...props} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Network request failed')).toBeInTheDocument();
      });
    });

    it('shows a generic message for non-Error thrown values', async () => {
      // Arrange
      vi.mocked(fetchAgentState).mockRejectedValueOnce('unexpected string error');
      const props = createDefaultProps();

      // Act
      render(<AgentDashboard {...props} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('calls onComplete when the primary action succeeds', async () => {
      // Arrange
      const mockAgentState = createMockAgentState({ status: 'active' });
      const mockResult = { id: 'result-001', status: 'complete' as const, updatedAt: '2026-03-26T00:00:00Z' };
      vi.mocked(fetchAgentState).mockResolvedValueOnce(mockAgentState);
      vi.mocked(executePrimaryAction).mockResolvedValueOnce(mockResult);
      const props = createDefaultProps();
      const user = userEvent.setup();

      // Act
      render(<AgentDashboard {...props} />);
      await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      // Assert
      await waitFor(() => {
        expect(props.onComplete).toHaveBeenCalledWith(mockResult);
      });
    });

    it('disables the action button while submitting', async () => {
      // Arrange
      const mockAgentState = createMockAgentState({ status: 'active' });
      vi.mocked(fetchAgentState).mockResolvedValueOnce(mockAgentState);
      vi.mocked(executePrimaryAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      const props = createDefaultProps();
      const user = userEvent.setup();

      // Act
      render(<AgentDashboard {...props} />);
      await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      // Assert
      expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
    });
  });
});
```

## Python (pytest)

```python
"""Tests for agent execution service.

Follows the arrange-act-assert pattern. Each test targets a single behaviour.
Fixtures create domain-specific test data with descriptive names.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from src.agents.agent_executor import AgentExecutor, AgentExecutionError
from tests.fixtures.agent_fixtures import create_mock_agent_config, create_mock_execution_input


# --- Fixtures ---


@pytest.fixture
def mock_agent_config():
    """Provide a valid agent configuration for testing."""
    return create_mock_agent_config(
        agent_id="agent-001",
        timeout_ms=30_000,
        max_retries=3,
    )


@pytest.fixture
def agent_executor(mock_agent_config):
    """Provide an AgentExecutor instance with mocked dependencies."""
    return AgentExecutor(config=mock_agent_config)


# --- Tests ---


class TestAgentExecution:
    """Tests for the core agent execution flow."""

    async def test_returns_execution_result_on_success(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        execution_input = create_mock_execution_input(prompt="Analyse this dataset")
        expected_output = "Dataset analysis: 42 records processed"

        with patch.object(
            agent_executor, "_invoke_model", new_callable=AsyncMock
        ) as mock_invoke:
            mock_invoke.return_value = expected_output

            # Act
            execution_result = await agent_executor.execute(execution_input)

        # Assert
        assert execution_result.output == expected_output
        assert execution_result.status == "complete"
        assert execution_result.duration_ms > 0

    async def test_raises_timeout_error_when_execution_exceeds_limit(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        execution_input = create_mock_execution_input(prompt="Long-running task")

        with patch.object(
            agent_executor, "_invoke_model", new_callable=AsyncMock
        ) as mock_invoke:
            mock_invoke.side_effect = TimeoutError("Model invocation timed out")

            # Act & Assert
            with pytest.raises(AgentExecutionError, match="exceeded the 30-second timeout"):
                await agent_executor.execute(execution_input)

    async def test_retries_on_transient_failure_then_succeeds(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        execution_input = create_mock_execution_input(prompt="Retry test")
        transient_error = ConnectionError("Temporary network failure")
        successful_output = "Retry succeeded"

        with patch.object(
            agent_executor, "_invoke_model", new_callable=AsyncMock
        ) as mock_invoke:
            mock_invoke.side_effect = [transient_error, successful_output]

            # Act
            execution_result = await agent_executor.execute(execution_input)

        # Assert
        assert execution_result.output == successful_output
        assert execution_result.retry_count == 1

    async def test_raises_after_exhausting_retry_attempts(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        execution_input = create_mock_execution_input(prompt="Persistent failure")
        persistent_error = ConnectionError("Service unavailable")

        with patch.object(
            agent_executor, "_invoke_model", new_callable=AsyncMock
        ) as mock_invoke:
            mock_invoke.side_effect = persistent_error

            # Act & Assert
            with pytest.raises(AgentExecutionError, match="failed after 3 attempts"):
                await agent_executor.execute(execution_input)

        assert mock_invoke.call_count == 4  # 1 initial + 3 retries


class TestAgentExecutionEdgeCases:
    """Tests for boundary conditions and edge cases."""

    async def test_handles_empty_input_gracefully(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        empty_input = create_mock_execution_input(prompt="")

        # Act & Assert
        with pytest.raises(AgentExecutionError, match="Input prompt must not be empty"):
            await agent_executor.execute(empty_input)

    async def test_truncates_input_exceeding_maximum_length(
        self, agent_executor: AgentExecutor
    ) -> None:
        # Arrange
        oversized_prompt = "x" * 100_001
        execution_input = create_mock_execution_input(prompt=oversized_prompt)

        with patch.object(
            agent_executor, "_invoke_model", new_callable=AsyncMock
        ) as mock_invoke:
            mock_invoke.return_value = "Truncated input processed"

            # Act
            execution_result = await agent_executor.execute(execution_input)

        # Assert
        invoked_prompt = mock_invoke.call_args[0][0]
        assert len(invoked_prompt) <= 100_000
```

## Template notes

**Naming**: Test descriptions read as sentences: "displays the agent status when loaded", "raises timeout error when execution exceeds limit". The reader should understand what the test verifies without reading the test body.

**Arrange-Act-Assert**: Every test follows this structure with comments marking each phase. The arrangement creates the specific conditions, the action triggers the behaviour, and the assertion verifies the outcome.

**Fixtures**: Use domain-specific factory functions (`createMockAgentState`, `create_mock_execution_input`) rather than inline object literals. Fixtures describe what they produce in their names.

**Edge cases**: Explicitly test empty inputs, oversized inputs, network failures, and non-Error thrown values. These are the cases LLMs typically skip.

**No magic values**: Test constants are named (`MOCK_AGENT_ID`) or created through fixtures with explicit parameters.
