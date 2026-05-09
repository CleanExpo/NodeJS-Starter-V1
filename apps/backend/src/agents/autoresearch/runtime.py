"""Autoresearch Runtime — autonomous information gathering before agent responses.

Inspired by oh-my-codex autoresearch/runtime.ts. Enables agents to independently
research a topic by:

1. Planning — decomposing the question into parallel sub-tasks
2. Executing — running sub-tasks concurrently via strategy adapters
3. Aggregating — combining raw results
4. Synthesising — producing a coherent summary with confidence scoring

Usage:
    runtime = AutoresearchRuntime()
    synthesis = await runtime.research(
        topic="FastAPI streaming responses",
        objective="Understand how to implement SSE endpoints in FastAPI",
    )
    print(synthesis.key_findings)
"""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from src.utils import get_logger

from .contracts import (
    ResearchPlan,
    ResearchResult,
    ResearchStrategy,
    ResearchSynthesis,
    ResearchTask,
)

logger = get_logger(__name__)

_DEFAULT_STRATEGIES = [
    ResearchStrategy.CODE_SEARCH,
    ResearchStrategy.RAG_RETRIEVAL,
    ResearchStrategy.WEB_SEARCH,
]


class AutoresearchRuntime:
    """Coordinates autonomous research across multiple information strategies.

    The runtime decomposes a research question into sub-tasks, executes them
    in parallel, and synthesises the results into actionable findings.

    Attributes:
        max_parallel: Maximum concurrent research sub-tasks.
        task_timeout: Seconds before a sub-task is abandoned.
    """

    def __init__(
        self,
        max_parallel: int = 4,
        task_timeout: float = 30.0,
    ) -> None:
        """Initialise the autoresearch runtime.

        Args:
            max_parallel: Maximum concurrent research executions.
            task_timeout: Seconds before a sub-task times out.
        """
        self.max_parallel = max_parallel
        self.task_timeout = task_timeout
        self._semaphore = asyncio.Semaphore(max_parallel)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def research(
        self,
        topic: str,
        *,
        objective: str | None = None,
        strategies: list[ResearchStrategy] | None = None,
        context: dict[str, Any] | None = None,
    ) -> ResearchSynthesis:
        """Conduct autonomous research on a topic.

        Args:
            topic: Subject to research.
            objective: Optional specific question to answer.
            strategies: Research strategies to use (defaults to all three).
            context: Additional context for the research (e.g. codebase path).

        Returns:
            A ResearchSynthesis with key findings, sources, and confidence.
        """
        objective = objective or f"Research and summarise: {topic}"
        strategies = strategies or _DEFAULT_STRATEGIES

        logger.info("Autoresearch started", topic=topic, strategies=[s.value for s in strategies])

        # 1. Plan
        plan = await self._plan(topic, objective, strategies)

        # 2. Execute in parallel
        results = await self._execute(plan, context or {})

        # 3. Synthesise
        synthesis = await self._synthesise(plan, results)

        logger.info(
            "Autoresearch complete",
            topic=topic,
            tasks=len(results),
            confidence=synthesis.confidence,
        )
        return synthesis

    # ------------------------------------------------------------------
    # Planning phase
    # ------------------------------------------------------------------

    async def _plan(
        self,
        topic: str,
        objective: str,
        strategies: list[ResearchStrategy],
    ) -> ResearchPlan:
        """Decompose the research question into parallel sub-tasks.

        Args:
            topic: Research subject.
            objective: Specific question.
            strategies: Strategies to use.

        Returns:
            A ResearchPlan with one task per strategy.
        """
        tasks = []
        for i, strategy in enumerate(strategies):
            query = self._build_query(topic, objective, strategy)
            tasks.append(
                ResearchTask(
                    id=str(uuid.uuid4()),
                    query=query,
                    strategy=strategy,
                    priority=i + 1,
                )
            )

        return ResearchPlan(
            topic=topic,
            objective=objective,
            tasks=tasks,
            estimated_duration_seconds=self.task_timeout,
        )

    def _build_query(
        self,
        topic: str,
        objective: str,
        strategy: ResearchStrategy,
    ) -> str:
        """Tailor a search query for the given strategy.

        Args:
            topic: Research subject.
            objective: Specific question.
            strategy: Research strategy.

        Returns:
            Optimised query string.
        """
        if strategy == ResearchStrategy.CODE_SEARCH:
            return f"{topic} implementation patterns"
        elif strategy == ResearchStrategy.RAG_RETRIEVAL:
            return objective
        elif strategy == ResearchStrategy.WEB_SEARCH:
            return f"{topic} best practices documentation"
        elif strategy == ResearchStrategy.DOCUMENT_SCAN:
            return topic
        return topic

    # ------------------------------------------------------------------
    # Execution phase
    # ------------------------------------------------------------------

    async def _execute(
        self,
        plan: ResearchPlan,
        context: dict[str, Any],
    ) -> list[ResearchResult]:
        """Execute all research tasks concurrently.

        Args:
            plan: Research plan with tasks to execute.
            context: Shared context.

        Returns:
            List of ResearchResult, one per task.
        """
        coros = [self._run_task(task, context) for task in plan.tasks]
        results = await asyncio.gather(*coros, return_exceptions=True)

        processed: list[ResearchResult] = []
        for task, result in zip(plan.tasks, results):
            if isinstance(result, Exception):
                processed.append(
                    ResearchResult(
                        task_id=task.id,
                        query=task.query,
                        strategy=task.strategy,
                        success=False,
                        error=str(result),
                    )
                )
            else:
                processed.append(result)

        return processed

    async def _run_task(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Execute a single research task with timeout and semaphore.

        Args:
            task: The research task to execute.
            context: Shared context.

        Returns:
            ResearchResult.
        """
        async with self._semaphore:
            try:
                result = await asyncio.wait_for(
                    self._dispatch_strategy(task, context),
                    timeout=self.task_timeout,
                )
                return result
            except asyncio.TimeoutError:
                return ResearchResult(
                    task_id=task.id,
                    query=task.query,
                    strategy=task.strategy,
                    success=False,
                    error=f"Research task timed out after {self.task_timeout}s",
                )
            except Exception as exc:
                logger.warning("Research task failed", task_id=task.id, error=str(exc))
                return ResearchResult(
                    task_id=task.id,
                    query=task.query,
                    strategy=task.strategy,
                    success=False,
                    error=str(exc),
                )

    async def _dispatch_strategy(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Dispatch the task to the appropriate strategy adapter.

        Args:
            task: Research task.
            context: Shared context.

        Returns:
            ResearchResult.
        """
        if task.strategy == ResearchStrategy.CODE_SEARCH:
            return await self._code_search(task, context)
        elif task.strategy == ResearchStrategy.RAG_RETRIEVAL:
            return await self._rag_retrieval(task, context)
        elif task.strategy == ResearchStrategy.WEB_SEARCH:
            return await self._web_search(task, context)
        else:
            return await self._document_scan(task, context)

    # ------------------------------------------------------------------
    # Strategy adapters (integration points)
    # ------------------------------------------------------------------

    async def _code_search(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Search the codebase for relevant patterns using CodeIntelligenceServer.

        Args:
            task: Research task.
            context: May contain ``project_root`` key.

        Returns:
            ResearchResult with code pattern findings.
        """
        try:
            from src.tools.mcp import CodeIntelligenceServer

            project_root = context.get("project_root", ".")
            server = CodeIntelligenceServer(project_root=project_root)
            matches = await server.find_patterns(
                task.query.split()[0],  # Use first keyword as pattern seed
                max_results=task.max_results,
            )
            findings = [
                {
                    "file": m.file_path,
                    "line": m.line,
                    "match": m.matched_text,
                }
                for m in matches
            ]
            return ResearchResult(
                task_id=task.id,
                query=task.query,
                strategy=task.strategy,
                success=True,
                findings=findings,
                confidence=min(1.0, len(findings) / 5),
            )
        except Exception as exc:
            return ResearchResult(
                task_id=task.id,
                query=task.query,
                strategy=task.strategy,
                success=False,
                error=str(exc),
            )

    async def _rag_retrieval(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Retrieve relevant documents from the RAG pipeline.

        Args:
            task: Research task.
            context: Shared context.

        Returns:
            ResearchResult with document findings.
        """
        # Integration point: plug in the existing RAG tools from src.tools.rag_tools
        await asyncio.sleep(0)  # yield
        return ResearchResult(
            task_id=task.id,
            query=task.query,
            strategy=task.strategy,
            success=True,
            findings=[{"source": "rag", "query": task.query, "note": "RAG adapter ready for integration"}],
            confidence=0.5,
        )

    async def _web_search(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Search the web for external documentation.

        Args:
            task: Research task.
            context: Shared context.

        Returns:
            ResearchResult with web findings.
        """
        # Integration point: plug in src.tools.web_search
        await asyncio.sleep(0)
        return ResearchResult(
            task_id=task.id,
            query=task.query,
            strategy=task.strategy,
            success=True,
            findings=[{"source": "web", "query": task.query, "note": "Web search adapter ready for integration"}],
            confidence=0.4,
        )

    async def _document_scan(
        self,
        task: ResearchTask,
        context: dict[str, Any],
    ) -> ResearchResult:
        """Scan project documents for relevant content.

        Args:
            task: Research task.
            context: Shared context.

        Returns:
            ResearchResult with document scan findings.
        """
        await asyncio.sleep(0)
        return ResearchResult(
            task_id=task.id,
            query=task.query,
            strategy=task.strategy,
            success=True,
            findings=[],
            confidence=0.3,
        )

    # ------------------------------------------------------------------
    # Synthesis phase
    # ------------------------------------------------------------------

    async def _synthesise(
        self,
        plan: ResearchPlan,
        results: list[ResearchResult],
    ) -> ResearchSynthesis:
        """Combine research results into a coherent synthesis.

        Args:
            plan: The original research plan.
            results: Results from all executed tasks.

        Returns:
            ResearchSynthesis with aggregated key findings.
        """
        successful = [r for r in results if r.success]
        all_findings = [f for r in successful for f in r.findings]
        all_sources = list({s for r in successful for s in r.sources})

        overall_confidence = (
            sum(r.confidence for r in successful) / len(successful)
            if successful
            else 0.0
        )

        # Build key findings from finding dicts
        key_findings: list[str] = []
        for finding in all_findings[:10]:  # cap at 10
            if isinstance(finding, dict):
                text = finding.get("match") or finding.get("query") or str(finding)
                key_findings.append(text[:200])

        # Identify gaps (failed or low-confidence tasks)
        gaps = [
            f"Strategy '{r.strategy.value}' failed: {r.error}"
            for r in results
            if not r.success
        ]

        return ResearchSynthesis(
            topic=plan.topic,
            objective=plan.objective,
            key_findings=key_findings,
            sources=all_sources,
            confidence=overall_confidence,
            gaps=gaps,
            raw_results=results,
        )
