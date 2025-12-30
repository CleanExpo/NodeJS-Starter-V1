"""Tests for agent dashboard API routes."""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


class TestAgentDashboardAPI:
    """Tests for agent dashboard endpoints."""

    def test_get_agent_stats(self):
        """Test GET /api/agents/stats endpoint."""
        response = client.get("/api/agents/stats")

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "total_agents" in data
        assert "active_agents" in data
        assert "total_tasks" in data
        assert "success_rate" in data
        assert "avg_iterations" in data

        # Verify types
        assert isinstance(data["total_agents"], int)
        assert isinstance(data["success_rate"], float)
        assert 0 <= data["success_rate"] <= 1

    def test_get_agent_stats_with_time_range(self):
        """Test stats endpoint with custom time range."""
        response = client.get("/api/agents/stats?time_range=30")

        assert response.status_code == 200
        data = response.json()
        assert data["time_range_days"] == 30

    def test_list_agents(self):
        """Test GET /api/agents/list endpoint."""
        response = client.get("/api/agents/list")

        assert response.status_code == 200
        agents = response.json()

        assert isinstance(agents, list)

        # Verify agent structure if any agents exist
        if agents:
            agent = agents[0]
            assert "agent_id" in agent
            assert "agent_type" in agent
            assert "status" in agent
            assert "task_count" in agent
            assert "success_rate" in agent

    def test_list_agents_filtered_by_type(self):
        """Test listing agents with type filter."""
        response = client.get("/api/agents/list?agent_type=frontend")

        assert response.status_code == 200
        agents = response.json()

        # All returned agents should be frontend type
        for agent in agents:
            assert agent["agent_type"] == "frontend"

    def test_get_recent_tasks(self):
        """Test GET /api/agents/tasks/recent endpoint."""
        response = client.get("/api/agents/tasks/recent?limit=5")

        assert response.status_code == 200
        tasks = response.json()

        assert isinstance(tasks, list)
        assert len(tasks) <= 5

        # Verify task structure if any tasks exist
        if tasks:
            task = tasks[0]
            assert "task_id" in task
            assert "agent_type" in task
            assert "status" in task
            assert "iterations" in task
            assert "verified" in task

    def test_get_recent_tasks_filtered(self):
        """Test recent tasks with filters."""
        response = client.get(
            "/api/agents/tasks/recent?agent_type=backend&status=completed&limit=10"
        )

        assert response.status_code == 200
        tasks = response.json()

        # All returned tasks should match filters
        for task in tasks:
            assert task["agent_type"] == "backend"
            assert task["status"] == "completed"

    def test_get_performance_trends(self):
        """Test GET /api/agents/performance/trends endpoint."""
        response = client.get("/api/agents/performance/trends?days=7")

        assert response.status_code == 200
        data = response.json()

        assert "time_range_days" in data
        assert "data_points" in data
        assert data["time_range_days"] == 7

        # Verify data points structure
        if data["data_points"]:
            point = data["data_points"][0]
            assert "date" in point
            assert "tasks_completed" in point
            assert "success_rate" in point
            assert "avg_iterations" in point
