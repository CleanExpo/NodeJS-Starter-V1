"""MCP Server package — Code Intelligence and Domain Memory servers.

Provides MCP (Model Context Protocol) servers that expose structured
analysis capabilities to AI agents:

- **CodeIntelligenceServer**: LSP-like code analysis without a full LSP server.
  File diagnostics, symbol search, AST pattern matching, multi-language support.

- **DomainMemoryMCPServer**: Domain memory operations (see ``mcp_server.py``).

Usage:
    from src.tools.mcp import CodeIntelligenceServer, get_code_intel_tools

    server = CodeIntelligenceServer(project_root="/path/to/repo")
    diagnostics = await server.analyse_file("src/main.py")
    symbols = await server.search_symbols("UserService")
"""

from .code_intel_server import (
    CodeIntelligenceServer,
    Diagnostic,
    DiagnosticSeverity,
    FileStructure,
    PatternMatch,
    SymbolDefinition,
    SymbolKind,
    get_code_intel_tools,
)

__all__ = [
    "CodeIntelligenceServer",
    "Diagnostic",
    "DiagnosticSeverity",
    "FileStructure",
    "PatternMatch",
    "SymbolDefinition",
    "SymbolKind",
    "get_code_intel_tools",
]
