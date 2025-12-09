"""Agent PRD System - AI-powered Product Requirement Document generation.

This module provides comprehensive PRD generation from high-level requirements:
- Requirements analysis
- Feature decomposition into user stories
- Technical specification generation
- Test scenario planning
- Implementation roadmap

Usage:
    from src.agents.prd import PRDOrchestrator

    orchestrator = PRDOrchestrator()
    result = await orchestrator.generate(
        requirements="Build a chat app with AI responses",
        context={"target_users": "Developers", "timeline": "3 months"}
    )

    # Access generated artifacts
    prd_doc = result["prd_document"]
    features = result["feature_list"]
    tech_spec = result["technical_spec"]
"""

from .analysis_agent import PRDAnalysisAgent, PRDAnalysis
from .feature_decomposer import FeatureDecomposer, UserStory, Epic, FeatureDecomposition
from .tech_spec_generator import TechnicalSpecGenerator, TechnicalSpec, DatabaseTable, APIEndpoint
from .test_generator import TestScenarioGenerator, TestPlan, TestScenario, TestCategory
from .roadmap_planner import RoadmapPlanner, Roadmap, Sprint, Milestone, Risk
from .prd_orchestrator import PRDOrchestrator, PRDResult

__all__ = [
    # Orchestrator (main entry point)
    "PRDOrchestrator",
    "PRDResult",
    # Individual agents
    "PRDAnalysisAgent",
    "PRDAnalysis",
    "FeatureDecomposer",
    "UserStory",
    "Epic",
    "FeatureDecomposition",
    "TechnicalSpecGenerator",
    "TechnicalSpec",
    "DatabaseTable",
    "APIEndpoint",
    "TestScenarioGenerator",
    "TestPlan",
    "TestScenario",
    "TestCategory",
    "RoadmapPlanner",
    "Roadmap",
    "Sprint",
    "Milestone",
    "Risk",
]
