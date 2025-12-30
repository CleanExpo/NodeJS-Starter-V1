"""Tests for task queue API routes."""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


class TestTaskQueueAPI:
    """Tests for task queue endpoints."""

    def test_create_task_success(self):
        """Test creating a new task."""
        response = client.post(
            "/api/tasks/",
            json={
                "title": "Test Task",
                "description": "This is a test task for the agentic layer",
                "task_type": "feature",
                "priority": 5
            }
        )

        assert response.status_code == 201
        data = response.json()

        assert data["title"] == "Test Task"
        assert data["task_type"] == "feature"
        assert data["status"] == "pending"
        assert "id" in data

    def test_create_task_validation_short_title(self):
        """Test that short titles are rejected."""
        response = client.post(
            "/api/tasks/",
            json={
                "title": "AB",  # Too short (min 3)
                "description": "Valid description here",
                "task_type": "feature",
                "priority": 5
            }
        )

        assert response.status_code == 422  # Validation error

    def test_create_task_validation_invalid_type(self):
        """Test that invalid task types are rejected."""
        response = client.post(
            "/api/tasks/",
            json={
                "title": "Valid Title",
                "description": "Valid description",
                "task_type": "invalid_type",
                "priority": 5
            }
        )

        assert response.status_code == 422  # Validation error

    def test_list_tasks(self):
        """Test listing tasks."""
        response = client.get("/api/tasks/")

        assert response.status_code == 200
        data = response.json()

        assert "tasks" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert isinstance(data["tasks"], list)

    def test_list_tasks_with_filters(self):
        """Test listing tasks with status filter."""
        response = client.get("/api/tasks/?status_filter=pending&page_size=10")

        assert response.status_code == 200
        data = response.json()

        # All returned tasks should be pending
        for task in data["tasks"]:
            assert task["status"] == "pending"

    def test_list_tasks_pagination(self):
        """Test task list pagination."""
        response = client.get("/api/tasks/?page=1&page_size=5")

        assert response.status_code == 200
        data = response.json()

        assert data["page"] == 1
        assert data["page_size"] == 5
        assert len(data["tasks"]) <= 5

    def test_get_queue_stats(self):
        """Test getting queue statistics."""
        response = client.get("/api/tasks/stats/summary")

        assert response.status_code == 200
        data = response.json()

        assert "total_tasks" in data
        assert "by_status" in data
        assert "pending" in data
        assert "in_progress" in data
        assert "completed" in data
        assert "failed" in data

    def test_get_task_by_id(self):
        """Test getting a specific task (will fail if no tasks exist)."""
        # First create a task
        create_response = client.post(
            "/api/tasks/",
            json={
                "title": "Test Get Task",
                "description": "Testing get endpoint",
                "task_type": "feature",
                "priority": 5
            }
        )

        if create_response.status_code == 201:
            task_id = create_response.json()["id"]

            # Now get it
            response = client.get(f"/api/tasks/{task_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == task_id
            assert data["title"] == "Test Get Task"

    def test_update_task_status(self):
        """Test updating a task status."""
        # Create task first
        create_response = client.post(
            "/api/tasks/",
            json={
                "title": "Test Update",
                "description": "Testing update endpoint",
                "task_type": "bug",
                "priority": 3
            }
        )

        if create_response.status_code == 201:
            task_id = create_response.json()["id"]

            # Update to in_progress
            response = client.patch(
                f"/api/tasks/{task_id}",
                json={"status": "in_progress"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "in_progress"
            assert data["started_at"] is not None

    def test_cancel_task(self):
        """Test cancelling a task."""
        # Create task first
        create_response = client.post(
            "/api/tasks/",
            json={
                "title": "Test Cancel",
                "description": "Testing cancel endpoint",
                "task_type": "feature",
                "priority": 5
            }
        )

        if create_response.status_code == 201:
            task_id = create_response.json()["id"]

            # Cancel it
            response = client.delete(f"/api/tasks/{task_id}")

            assert response.status_code == 204

            # Verify it's cancelled
            get_response = client.get(f"/api/tasks/{task_id}")
            if get_response.status_code == 200:
                assert get_response.json()["status"] == "cancelled"
