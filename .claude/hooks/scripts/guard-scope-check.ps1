# guard-scope-check.ps1 — PostToolUse hook for Edit|Write
# Checks if the modified file is within the frozen scope (if active).
# Advisory only — warns but does not block.

param()

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) { exit 0 }

$scopeLockPath = Join-Path $root ".claude/.scope-lock"

# No scope lock active — nothing to do
if (-not (Test-Path $scopeLockPath)) {
    exit 0
}

try {
    $lockContent = Get-Content $scopeLockPath -Raw | ConvertFrom-Json
    $allowedScope = $lockContent.scope
} catch {
    # Malformed scope lock — skip check
    exit 0
}

if (-not $allowedScope) { exit 0 }

# Read the tool result from stdin to find the affected file path
$input = [Console]::In.ReadToEnd()

# Try to extract file path from the tool input
# PostToolUse receives the tool name and result
$filePath = ""

# Match common patterns for file paths in Edit/Write tool results
if ($input -match '"file_path"\s*:\s*"([^"]+)"') {
    $filePath = $Matches[1]
} elseif ($input -match 'File (created|updated) successfully at:\s*(.+)') {
    $filePath = $Matches[2].Trim()
}

if (-not $filePath) { exit 0 }

# Normalise paths for comparison
$normalizedFile = $filePath.Replace('\', '/').ToLower()
$normalizedScope = (Join-Path $root $allowedScope).Replace('\', '/').ToLower()

# Check if the file is within the allowed scope
if (-not $normalizedFile.StartsWith($normalizedScope)) {
    $warning = "SCOPE GUARD: Write to $filePath is outside frozen scope ($allowedScope). Use /unfreeze to remove restriction."

    # Output as JSON for hook system
    $result = @{
        hookSpecificOutput = @{
            additionalContext = $warning
        }
    } | ConvertTo-Json -Compress

    Write-Output $result
}

exit 0
