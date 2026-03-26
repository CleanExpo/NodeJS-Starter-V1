---
template: test-file
variant: generic
locale: en-AU
---

# Test file template — Generic

## TypeScript (Vitest)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { UserProfileEditor } from '../UserProfileEditor';

// --- Test fixtures ---

const MOCK_USER_ID = 'user-001';
const MOCK_DISPLAY_NAME = 'Test User';

function createDefaultProps(): React.ComponentProps<typeof UserProfileEditor> {
  return {
    userId: MOCK_USER_ID,
    onSave: vi.fn(),
  };
}

function createMockUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: MOCK_USER_ID,
    displayName: MOCK_DISPLAY_NAME,
    email: 'test@example.com',
    verified: true,
    ...overrides,
  };
}

// --- Tests ---

describe('UserProfileEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('displays the user profile when loaded', async () => {
      // Arrange
      const mockProfile = createMockUserProfile();
      vi.mocked(fetchUserProfile).mockResolvedValueOnce(mockProfile);
      const props = createDefaultProps();

      // Act
      render(<UserProfileEditor {...props} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByDisplayValue(MOCK_DISPLAY_NAME)).toBeInTheDocument();
      });
    });

    it('renders a placeholder when no user ID is provided', () => {
      // Arrange
      const props = createDefaultProps();
      props.userId = '';

      // Act
      render(<UserProfileEditor {...props} />);

      // Assert
      expect(screen.getByText('No resource selected.')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('displays the error message when profile fetch fails', async () => {
      // Arrange
      const fetchError = new Error('Failed to load user profile');
      vi.mocked(fetchUserProfile).mockRejectedValueOnce(fetchError);
      const props = createDefaultProps();

      // Act
      render(<UserProfileEditor {...props} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('calls onSave with updated profile data', async () => {
      // Arrange
      const mockProfile = createMockUserProfile();
      vi.mocked(fetchUserProfile).mockResolvedValueOnce(mockProfile);
      vi.mocked(updateUserProfile).mockResolvedValueOnce({ ...mockProfile, displayName: 'Updated Name' });
      const props = createDefaultProps();
      const user = userEvent.setup();

      // Act
      render(<UserProfileEditor {...props} />);
      await waitFor(() => expect(screen.getByDisplayValue(MOCK_DISPLAY_NAME)).toBeInTheDocument());
      const nameInput = screen.getByLabelText('Display name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      // Assert
      await waitFor(() => {
        expect(props.onSave).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: 'Updated Name' })
        );
      });
    });

    it('disables the save button while submitting', async () => {
      // Arrange
      const mockProfile = createMockUserProfile();
      vi.mocked(fetchUserProfile).mockResolvedValueOnce(mockProfile);
      vi.mocked(updateUserProfile).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      const props = createDefaultProps();
      const user = userEvent.setup();

      // Act
      render(<UserProfileEditor {...props} />);
      await waitFor(() => expect(screen.getByDisplayValue(MOCK_DISPLAY_NAME)).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      // Assert
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });
});
```

## Python (pytest)

```python
"""Tests for the user service.

Follows the arrange-act-assert pattern. Each test targets a single behaviour.
Fixtures produce domain-specific test data with descriptive names.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from src.services.user_service import UserService, UserNotFoundError
from tests.fixtures.user_fixtures import create_mock_user, create_mock_update_payload


# --- Fixtures ---


@pytest.fixture
def mock_db_session():
    """Provide a mocked async database session."""
    return AsyncMock()


@pytest.fixture
def user_service(mock_db_session):
    """Provide a UserService instance with mocked dependencies."""
    return UserService(db_session=mock_db_session)


# --- Tests ---


class TestUserRetrieval:
    """Tests for fetching user records."""

    async def test_returns_user_when_found(
        self, user_service: UserService, mock_db_session: AsyncMock
    ) -> None:
        # Arrange
        expected_user = create_mock_user(user_id="user-001", display_name="Test User")
        mock_db_session.execute.return_value.scalar_one_or_none.return_value = expected_user

        # Act
        retrieved_user = await user_service.get_by_id("user-001")

        # Assert
        assert retrieved_user is not None
        assert retrieved_user.id == "user-001"
        assert retrieved_user.display_name == "Test User"

    async def test_raises_not_found_for_nonexistent_user(
        self, user_service: UserService, mock_db_session: AsyncMock
    ) -> None:
        # Arrange
        mock_db_session.execute.return_value.scalar_one_or_none.return_value = None

        # Act & Assert
        with pytest.raises(UserNotFoundError, match="user-999"):
            await user_service.get_by_id("user-999")


class TestUserUpdate:
    """Tests for updating user records."""

    async def test_updates_display_name_successfully(
        self, user_service: UserService, mock_db_session: AsyncMock
    ) -> None:
        # Arrange
        existing_user = create_mock_user(user_id="user-001", display_name="Old Name")
        mock_db_session.execute.return_value.scalar_one_or_none.return_value = existing_user
        update_payload = create_mock_update_payload(display_name="New Name")

        # Act
        updated_user = await user_service.update("user-001", update_payload)

        # Assert
        assert updated_user.display_name == "New Name"
        mock_db_session.commit.assert_awaited_once()

    async def test_raises_not_found_when_updating_nonexistent_user(
        self, user_service: UserService, mock_db_session: AsyncMock
    ) -> None:
        # Arrange
        mock_db_session.execute.return_value.scalar_one_or_none.return_value = None
        update_payload = create_mock_update_payload(display_name="Does Not Matter")

        # Act & Assert
        with pytest.raises(UserNotFoundError, match="user-999"):
            await user_service.update("user-999", update_payload)
```

## Template notes

**Naming**: Test descriptions are sentences that describe the expected behaviour: "returns user when found", "raises not found for nonexistent user". The reader understands the test's purpose from the description alone.

**Arrange-Act-Assert**: Comments mark each phase. No test combines multiple actions or assertions about unrelated behaviours.

**Fixtures**: Factory functions (`createMockUserProfile`, `create_mock_user`) produce domain objects with sensible defaults and explicit override parameters. Named constants (`MOCK_USER_ID`) replace magic strings.

**Edge cases**: Test both happy paths and error paths. Include empty inputs, missing records, and network failures.

**No `any` types**: Test fixtures and mock return values are fully typed. Mock functions use `vi.mocked()` for type-safe mock access.
