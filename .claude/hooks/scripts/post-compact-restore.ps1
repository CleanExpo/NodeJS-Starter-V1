# post-compact-restore.ps1
# PostCompact hook — re-injects project context after Claude Code compacts the context window.
# Reads .claude/memory/current-state.md and outputs a context block for Claude to process.

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) {
    $root = $PSScriptRoot | Split-Path | Split-Path | Split-Path
}

$stateFile = Join-Path $root ".claude/memory/current-state.md"
$constitutionFile = Join-Path $root ".claude/memory/CONSTITUTION.md"

$output = @{
    context_restored = $true
    message = "Context compacted. Project context re-injected."
    files_to_reread = @()
}

# Always inject CONSTITUTION.md location
if (Test-Path $constitutionFile) {
    $output.files_to_reread += ".claude/memory/CONSTITUTION.md"
    $constitution = [string](Get-Content $constitutionFile -Raw -ErrorAction SilentlyContinue)
    if ($constitution) {
        $output.constitution_summary = ($constitution -split "`n" | Select-Object -First 20) -join "`n"
    }
}

# Inject current-state.md if it exists
if (Test-Path $stateFile) {
    $output.files_to_reread += ".claude/memory/current-state.md"
    $state = [string](Get-Content $stateFile -Raw -ErrorAction SilentlyContinue)
    if ($state) {
        $output.current_state = $state
    }
}

# Output JSON for Claude Code to process
$output | ConvertTo-Json -Depth 5 -Compress
