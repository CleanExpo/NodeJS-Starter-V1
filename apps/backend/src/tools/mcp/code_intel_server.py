"""Code Intelligence MCP Server — LSP-like analysis without a full LSP server.

Provides structural code analysis capabilities to AI agents, enabling better
code review, refactoring, and bug detection across the monorepo.

Supported languages: TypeScript/JavaScript, Python, SQL

Usage:
    from src.tools.mcp import CodeIntelligenceServer, get_code_intel_tools

    server = CodeIntelligenceServer(project_root="/path/to/repo")
    diagnostics = await server.analyse_file("src/main.py")
    symbols = await server.search_symbols("UserService")
    patterns = await server.find_patterns(r"async def \\w+\\(", language="python")
    structure = await server.get_file_structure("src/agents/base_agent.py")
"""

from __future__ import annotations

import ast
import re
from enum import Enum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from src.utils import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class DiagnosticSeverity(str, Enum):
    """Severity levels for code diagnostics."""

    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    HINT = "hint"


class Diagnostic(BaseModel):
    """A diagnostic message from code analysis."""

    file_path: str
    line: int
    column: int
    severity: DiagnosticSeverity
    message: str
    code: str | None = None
    source: str = "code-intel"


class SymbolKind(str, Enum):
    """Kind of symbol found in the codebase."""

    CLASS = "class"
    FUNCTION = "function"
    METHOD = "method"
    VARIABLE = "variable"
    IMPORT = "import"
    CONSTANT = "constant"
    MODULE = "module"


class SymbolDefinition(BaseModel):
    """A symbol definition found in the codebase."""

    name: str
    kind: SymbolKind
    file_path: str
    line: int
    column: int = 0
    signature: str | None = None
    docstring: str | None = None
    is_async: bool = False
    is_exported: bool = False


class PatternMatch(BaseModel):
    """A pattern match found in the codebase."""

    file_path: str
    line: int
    column: int
    matched_text: str
    context_lines: list[str] = Field(default_factory=list)


class FileStructure(BaseModel):
    """Structural overview of a source file."""

    file_path: str
    language: str
    imports: list[str] = Field(default_factory=list)
    classes: list[SymbolDefinition] = Field(default_factory=list)
    functions: list[SymbolDefinition] = Field(default_factory=list)
    constants: list[SymbolDefinition] = Field(default_factory=list)
    line_count: int = 0
    has_tests: bool = False


# ---------------------------------------------------------------------------
# Language detection helpers
# ---------------------------------------------------------------------------

_LANG_MAP: dict[str, str] = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".sql": "sql",
    ".md": "markdown",
}

_EXCLUDED_DIRS = {
    "node_modules", ".git", "__pycache__", ".mypy_cache",
    ".ruff_cache", "dist", ".next", ".turbo", "build",
    "venv", ".venv", "eggs", ".eggs",
}


def _detect_language(file_path: str) -> str:
    """Detect language from file extension."""
    suffix = Path(file_path).suffix.lower()
    return _LANG_MAP.get(suffix, "unknown")


def _should_skip_path(path: Path) -> bool:
    """Return True if the path is inside an excluded directory."""
    return any(part in _EXCLUDED_DIRS for part in path.parts)


# ---------------------------------------------------------------------------
# Python AST analysis
# ---------------------------------------------------------------------------


def _analyse_python_file(source: str, file_path: str) -> tuple[list[Diagnostic], FileStructure]:
    """Parse a Python file and extract diagnostics and structure.

    Args:
        source: File source text.
        file_path: Relative file path for reporting.

    Returns:
        Tuple of (diagnostics, file_structure).
    """
    diagnostics: list[Diagnostic] = []
    structure = FileStructure(file_path=file_path, language="python", line_count=source.count("\n") + 1)

    try:
        tree = ast.parse(source, filename=file_path)
    except SyntaxError as exc:
        diagnostics.append(
            Diagnostic(
                file_path=file_path,
                line=exc.lineno or 1,
                column=exc.offset or 0,
                severity=DiagnosticSeverity.ERROR,
                message=str(exc.msg),
                code="syntax-error",
            )
        )
        return diagnostics, structure

    # Collect imports
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                structure.imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            structure.imports.append(module)

    # Collect top-level classes and functions
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.ClassDef):
            docstring = ast.get_docstring(node)
            sym = SymbolDefinition(
                name=node.name,
                kind=SymbolKind.CLASS,
                file_path=file_path,
                line=node.lineno,
                docstring=docstring,
            )
            structure.classes.append(sym)
            # Collect methods
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    args = [a.arg for a in child.args.args]
                    sig = f"def {child.name}({', '.join(args)})"
                    method_sym = SymbolDefinition(
                        name=child.name,
                        kind=SymbolKind.METHOD,
                        file_path=file_path,
                        line=child.lineno,
                        signature=sig,
                        docstring=ast.get_docstring(child),
                        is_async=isinstance(child, ast.AsyncFunctionDef),
                    )
                    structure.functions.append(method_sym)

        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            args = [a.arg for a in node.args.args]
            sig = f"{'async ' if isinstance(node, ast.AsyncFunctionDef) else ''}def {node.name}({', '.join(args)})"
            sym = SymbolDefinition(
                name=node.name,
                kind=SymbolKind.FUNCTION,
                file_path=file_path,
                line=node.lineno,
                signature=sig,
                docstring=ast.get_docstring(node),
                is_async=isinstance(node, ast.AsyncFunctionDef),
            )
            structure.functions.append(sym)

        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id.isupper():
                    structure.constants.append(
                        SymbolDefinition(
                            name=target.id,
                            kind=SymbolKind.CONSTANT,
                            file_path=file_path,
                            line=node.lineno,
                        )
                    )

    # Detect test file
    structure.has_tests = "test" in file_path.lower() or any(
        isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name.startswith("test_")
        for n in ast.walk(tree)
    )

    # Warn on missing docstrings in public functions
    for sym in structure.functions:
        if not sym.name.startswith("_") and not sym.docstring:
            diagnostics.append(
                Diagnostic(
                    file_path=file_path,
                    line=sym.line,
                    column=0,
                    severity=DiagnosticSeverity.HINT,
                    message=f"Public function '{sym.name}' is missing a docstring.",
                    code="missing-docstring",
                )
            )

    return diagnostics, structure


# ---------------------------------------------------------------------------
# TypeScript/JavaScript analysis (regex-based)
# ---------------------------------------------------------------------------


def _analyse_ts_file(source: str, file_path: str) -> tuple[list[Diagnostic], FileStructure]:
    """Analyse a TypeScript/JavaScript file via regex patterns.

    Args:
        source: File source text.
        file_path: Relative file path for reporting.

    Returns:
        Tuple of (diagnostics, file_structure).
    """
    diagnostics: list[Diagnostic] = []
    structure = FileStructure(
        file_path=file_path,
        language="typescript",
        line_count=source.count("\n") + 1,
    )

    lines = source.splitlines()

    # Imports
    import_re = re.compile(r"^import\s+.+\s+from\s+['\"](.+)['\"]", re.MULTILINE)
    for m in import_re.finditer(source):
        structure.imports.append(m.group(1))

    # Classes
    class_re = re.compile(r"^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)", re.MULTILINE)
    for m in class_re.finditer(source):
        line_no = source[: m.start()].count("\n") + 1
        structure.classes.append(
            SymbolDefinition(
                name=m.group(1),
                kind=SymbolKind.CLASS,
                file_path=file_path,
                line=line_no,
                is_exported="export" in m.group(0),
            )
        )

    # Functions / arrow functions
    fn_re = re.compile(
        r"^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)",
        re.MULTILINE,
    )
    arrow_re = re.compile(
        r"^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(",
        re.MULTILINE,
    )
    for m in list(fn_re.finditer(source)) + list(arrow_re.finditer(source)):
        line_no = source[: m.start()].count("\n") + 1
        name = m.group(1)
        structure.functions.append(
            SymbolDefinition(
                name=name,
                kind=SymbolKind.FUNCTION,
                file_path=file_path,
                line=line_no,
                is_async="async" in m.group(0),
                is_exported="export" in m.group(0),
            )
        )

    # Constants (UPPER_CASE)
    const_re = re.compile(r"^(?:export\s+)?const\s+([A-Z][A-Z0-9_]+)\s*=", re.MULTILINE)
    for m in const_re.finditer(source):
        line_no = source[: m.start()].count("\n") + 1
        structure.constants.append(
            SymbolDefinition(
                name=m.group(1),
                kind=SymbolKind.CONSTANT,
                file_path=file_path,
                line=line_no,
            )
        )

    # Detect test file
    structure.has_tests = (
        ".test." in file_path
        or ".spec." in file_path
        or any("describe(" in ln or "it(" in ln or "test(" in ln for ln in lines)
    )

    return diagnostics, structure


# ---------------------------------------------------------------------------
# Main server
# ---------------------------------------------------------------------------


class CodeIntelligenceServer:
    """LSP-like code intelligence without a full language server.

    Provides file diagnostics, symbol search, pattern matching and structural
    analysis across TypeScript, Python and SQL files in a monorepo.

    Attributes:
        project_root: Absolute path to the repository root.
    """

    def __init__(self, project_root: str | Path = ".") -> None:
        """Initialise the code intelligence server.

        Args:
            project_root: Root directory of the project to analyse.
        """
        self.project_root = Path(project_root).resolve()
        logger.info("CodeIntelligenceServer initialised", project_root=str(self.project_root))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def analyse_file(self, file_path: str) -> list[Diagnostic]:
        """Analyse a single file and return diagnostics.

        Detects syntax errors, missing docstrings and basic style issues.

        Args:
            file_path: Path to the file, relative to project_root.

        Returns:
            List of diagnostics ordered by line number.
        """
        abs_path = self.project_root / file_path
        if not abs_path.exists():
            return [
                Diagnostic(
                    file_path=file_path,
                    line=1,
                    column=0,
                    severity=DiagnosticSeverity.ERROR,
                    message=f"File not found: {file_path}",
                    code="file-not-found",
                )
            ]

        source = abs_path.read_text(encoding="utf-8", errors="replace")
        lang = _detect_language(file_path)

        if lang == "python":
            diagnostics, _ = _analyse_python_file(source, file_path)
        elif lang in ("typescript", "javascript"):
            diagnostics, _ = _analyse_ts_file(source, file_path)
        else:
            diagnostics = []

        logger.debug("analyse_file complete", file=file_path, issues=len(diagnostics))
        return sorted(diagnostics, key=lambda d: d.line)

    async def search_symbols(
        self,
        query: str,
        *,
        kind: SymbolKind | None = None,
        language: str | None = None,
        max_results: int = 50,
    ) -> list[SymbolDefinition]:
        """Search for symbol definitions across the project.

        Args:
            query: Symbol name (or partial name) to search for.
            kind: Optional — restrict to a specific symbol kind.
            language: Optional — restrict to "python", "typescript", or "javascript".
            max_results: Maximum number of results to return.

        Returns:
            Matching symbol definitions.
        """
        results: list[SymbolDefinition] = []
        query_lower = query.lower()

        for source_file, source, lang in self._iter_source_files(language):
            if lang == "python":
                _, structure = _analyse_python_file(source, source_file)
            elif lang in ("typescript", "javascript"):
                _, structure = _analyse_ts_file(source, source_file)
            else:
                continue

            all_symbols = structure.classes + structure.functions + structure.constants
            for sym in all_symbols:
                if query_lower in sym.name.lower():
                    if kind is None or sym.kind == kind:
                        results.append(sym)
                        if len(results) >= max_results:
                            return results

        return results

    async def find_patterns(
        self,
        pattern: str,
        *,
        language: str | None = None,
        context_lines: int = 2,
        max_results: int = 100,
    ) -> list[PatternMatch]:
        """Search for regex patterns across source files.

        Args:
            pattern: Regular expression pattern to search for.
            language: Optional — restrict to a specific language.
            context_lines: Number of surrounding lines to include in each match.
            max_results: Maximum number of matches to return.

        Returns:
            List of pattern matches with context.
        """
        compiled = re.compile(pattern, re.MULTILINE)
        matches: list[PatternMatch] = []

        for file_rel, source, _lang in self._iter_source_files(language):
            lines = source.splitlines()
            for m in compiled.finditer(source):
                line_no = source[: m.start()].count("\n") + 1
                col = m.start() - source.rfind("\n", 0, m.start()) - 1

                start = max(0, line_no - 1 - context_lines)
                end = min(len(lines), line_no + context_lines)
                ctx = lines[start:end]

                matches.append(
                    PatternMatch(
                        file_path=file_rel,
                        line=line_no,
                        column=col,
                        matched_text=m.group(0),
                        context_lines=ctx,
                    )
                )
                if len(matches) >= max_results:
                    return matches

        return matches

    async def get_file_structure(self, file_path: str) -> FileStructure:
        """Return the structural overview of a file.

        Args:
            file_path: Path relative to project_root.

        Returns:
            FileStructure with classes, functions, imports and constants.
        """
        abs_path = self.project_root / file_path
        if not abs_path.exists():
            return FileStructure(file_path=file_path, language="unknown")

        source = abs_path.read_text(encoding="utf-8", errors="replace")
        lang = _detect_language(file_path)

        if lang == "python":
            _, structure = _analyse_python_file(source, file_path)
        elif lang in ("typescript", "javascript"):
            _, structure = _analyse_ts_file(source, file_path)
        else:
            structure = FileStructure(
                file_path=file_path,
                language=lang,
                line_count=source.count("\n") + 1,
            )

        return structure

    # ------------------------------------------------------------------
    # MCP tool definitions
    # ------------------------------------------------------------------

    def list_tools(self) -> list[dict[str, Any]]:
        """Return MCP tool definitions for this server."""
        return [
            {
                "name": "code_intel_analyse_file",
                "description": "Analyse a source file and return diagnostics (syntax errors, style issues).",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Path to the file, relative to the project root.",
                        }
                    },
                    "required": ["file_path"],
                },
            },
            {
                "name": "code_intel_search_symbols",
                "description": "Search for symbol definitions (classes, functions, constants) across the project.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Symbol name or partial name."},
                        "kind": {
                            "type": "string",
                            "enum": [k.value for k in SymbolKind],
                            "description": "Restrict to a specific symbol kind (optional).",
                        },
                        "language": {
                            "type": "string",
                            "enum": ["python", "typescript", "javascript"],
                            "description": "Restrict to a language (optional).",
                        },
                        "max_results": {"type": "integer", "default": 50},
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "code_intel_find_patterns",
                "description": "Search for a regex pattern across source files and return matches with context.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pattern": {"type": "string", "description": "Regular expression pattern."},
                        "language": {
                            "type": "string",
                            "enum": ["python", "typescript", "javascript"],
                            "description": "Restrict search to a language (optional).",
                        },
                        "context_lines": {
                            "type": "integer",
                            "default": 2,
                            "description": "Lines of context around each match.",
                        },
                        "max_results": {"type": "integer", "default": 100},
                    },
                    "required": ["pattern"],
                },
            },
            {
                "name": "code_intel_get_file_structure",
                "description": "Get the structural overview of a file — imports, classes, functions and constants.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Path to the file, relative to the project root.",
                        }
                    },
                    "required": ["file_path"],
                },
            },
        ]

    async def execute_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any],
    ) -> dict[str, Any]:
        """Dispatch an MCP tool call.

        Args:
            tool_name: Name of the tool to execute.
            arguments: Tool arguments.

        Returns:
            Serialisable result dict.
        """
        try:
            if tool_name == "code_intel_analyse_file":
                diags = await self.analyse_file(arguments["file_path"])
                return {"success": True, "diagnostics": [d.model_dump() for d in diags]}

            elif tool_name == "code_intel_search_symbols":
                kind = SymbolKind(arguments["kind"]) if "kind" in arguments else None
                symbols = await self.search_symbols(
                    arguments["query"],
                    kind=kind,
                    language=arguments.get("language"),
                    max_results=arguments.get("max_results", 50),
                )
                return {"success": True, "symbols": [s.model_dump() for s in symbols]}

            elif tool_name == "code_intel_find_patterns":
                matches = await self.find_patterns(
                    arguments["pattern"],
                    language=arguments.get("language"),
                    context_lines=arguments.get("context_lines", 2),
                    max_results=arguments.get("max_results", 100),
                )
                return {"success": True, "matches": [m.model_dump() for m in matches]}

            elif tool_name == "code_intel_get_file_structure":
                structure = await self.get_file_structure(arguments["file_path"])
                return {"success": True, "structure": structure.model_dump()}

            else:
                raise ValueError(f"Unknown tool: {tool_name}")

        except Exception as exc:
            logger.error("CodeIntelligenceServer tool error", tool=tool_name, error=str(exc))
            return {"success": False, "error": str(exc)}

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _iter_source_files(
        self,
        language_filter: str | None = None,
    ):
        """Yield (relative_path, source_text, language) tuples for all source files.

        Args:
            language_filter: Only yield files for this language.

        Yields:
            Tuples of (relative_path_str, source_text, language).
        """
        extensions = set(_LANG_MAP.keys())
        if language_filter:
            extensions = {ext for ext, lang in _LANG_MAP.items() if lang == language_filter}

        for ext in extensions:
            for abs_path in self.project_root.rglob(f"*{ext}"):
                if _should_skip_path(abs_path):
                    continue
                try:
                    source = abs_path.read_text(encoding="utf-8", errors="replace")
                    rel = str(abs_path.relative_to(self.project_root))
                    yield rel, source, _detect_language(str(abs_path))
                except OSError:
                    continue


# ---------------------------------------------------------------------------
# Convenience factory for tool registration
# ---------------------------------------------------------------------------


def get_code_intel_tools(project_root: str | Path = ".") -> tuple[CodeIntelligenceServer, list[dict[str, Any]]]:
    """Create a server instance and return its MCP tool definitions.

    Args:
        project_root: Root of the project to analyse.

    Returns:
        Tuple of (server_instance, list_of_tool_definitions).
    """
    server = CodeIntelligenceServer(project_root=project_root)
    return server, server.list_tools()
