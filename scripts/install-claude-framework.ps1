# install-claude-framework.ps1
# Installs the Claude Code framework overhaul into a target project.
# Applies: lean settings.json, path-scoped rules, PostCompact hook, idea-to-production skill.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/install-claude-framework.ps1 -TargetProject "D:\path\to\other-project"
#
# What it does NOT touch:
#   - CLAUDE.md (project-specific -- see manual step below)
#   - Any application code

param(
    [Parameter(Mandatory=$false)]
    [string]$TargetProject = ""
)

$SourceProject = git rev-parse --show-toplevel 2>$null
if (-not $SourceProject) {
    $SourceProject = $PSScriptRoot | Split-Path
}

if (-not $TargetProject) {
    Write-Host "Usage: powershell -ExecutionPolicy Bypass -File scripts/install-claude-framework.ps1 -TargetProject `"D:\path\to\project`""
    Write-Host ""
    Write-Host "Target project path not provided. Running in DRY RUN mode to show what would be copied."
    $DryRun = $true
    $TargetProject = "D:\path\to\target-project"
} else {
    if (-not (Test-Path $TargetProject)) {
        Write-Error "Target project not found: $TargetProject"
        exit 1
    }
    $DryRun = $false
}

function Copy-Item-Safe {
    param($Source, $Dest, $Label)
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would copy: $Source -> $Dest"
    } else {
        $destDir = Split-Path $Dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $Source $Dest -Force
        Write-Host "  [OK] $Label"
    }
}

Write-Host ""
Write-Host "=== Claude Code Framework Installer ==="
Write-Host "Source: $SourceProject"
if ($DryRun) { Write-Host "Mode:   DRY RUN" } else { Write-Host "Target: $TargetProject" }
Write-Host ""

# ---- 1. settings.json ----
Write-Host "1. Settings"
$settingsSource = Join-Path $SourceProject ".claude/settings.json"
$settingsDest = Join-Path $TargetProject ".claude/settings.json"

if (-not $DryRun -and (Test-Path $settingsDest)) {
    Copy-Item $settingsDest "$settingsDest.bak" -Force
    Write-Host "  [OK] Backed up existing settings.json to settings.json.bak"
}
Copy-Item-Safe $settingsSource $settingsDest "settings.json installed"

# ---- 2. Core rules ----
Write-Host ""
Write-Host "2. Rules"
$ruleSources = @(
    @{ src = ".claude/rules/core.md"; label = "core.md (always loaded)" },
    @{ src = ".claude/rules/frontend.md"; label = "frontend.md (path-scoped: apps/web/**)" },
    @{ src = ".claude/rules/backend.md"; label = "backend.md (path-scoped: apps/backend/**)" }
)
foreach ($rule in $ruleSources) {
    $src = Join-Path $SourceProject $rule.src
    $dst = Join-Path $TargetProject $rule.src
    Copy-Item-Safe $src $dst $rule.label
}

# Copy archive (reference files)
$archiveDir = Join-Path $SourceProject ".claude/rules/archive"
$archiveDest = Join-Path $TargetProject ".claude/rules/archive"
if (-not $DryRun) {
    if (-not (Test-Path $archiveDest)) {
        New-Item -ItemType Directory -Path $archiveDest -Force | Out-Null
    }
    Copy-Item "$archiveDir\*.md" $archiveDest -Force
    Write-Host "  [OK] archive/ (reference files)"
} else {
    Write-Host "  [DRY RUN] Would copy archive/ reference files"
}

# ---- 3. PostCompact hook ----
Write-Host ""
Write-Host "3. Hooks"
$hookSource = Join-Path $SourceProject ".claude/hooks/scripts/post-compact-restore.ps1"
$hookDest = Join-Path $TargetProject ".claude/hooks/scripts/post-compact-restore.ps1"
Copy-Item-Safe $hookSource $hookDest "post-compact-restore.ps1"

# Copy other hooks
$hookSources = @(
    "user-prompt-compass.ps1",
    "session-start-context.ps1",
    "pre-compact-save.py",
    "post-edit-format.ps1",
    "notification-alert.ps1",
    "stop-verify-todos.py",
    "pre-bash-validate.py"
)
foreach ($hook in $hookSources) {
    $src = Join-Path $SourceProject ".claude/hooks/scripts/$hook"
    $dst = Join-Path $TargetProject ".claude/hooks/scripts/$hook"
    if (Test-Path $src) {
        Copy-Item-Safe $src $dst $hook
    }
}

# ---- 4. Idea-to-production skill ----
Write-Host ""
Write-Host "4. Skills"
$skillSource = Join-Path $SourceProject ".skills/custom/idea-to-production/SKILL.md"
$skillDest = Join-Path $TargetProject ".skills/custom/idea-to-production/SKILL.md"
Copy-Item-Safe $skillSource $skillDest "idea-to-production skill"

# ---- 5. Memory constitution ----
Write-Host ""
Write-Host "5. Memory"
$memSources = @(
    "CONSTITUTION.md",
    "compass.md"
)
foreach ($mem in $memSources) {
    $src = Join-Path $SourceProject ".claude/memory/$mem"
    $dst = Join-Path $TargetProject ".claude/memory/$mem"
    if (Test-Path $src) {
        Copy-Item-Safe $src $dst $mem
    }
}

# ---- Summary ----
Write-Host ""
Write-Host "=== Done ==="
Write-Host ""
Write-Host "Manual step required -- update CLAUDE.md in the target project:"
Write-Host "  Target: under 120 lines. Keep: Quick Commands, Architecture Routing, Testing Discipline."
Write-Host "  Template: $(Join-Path $SourceProject 'CLAUDE.md')"
Write-Host ""
Write-Host "Verify PowerShell execution policy (run as Administrator):"
Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine"
Write-Host ""
Write-Host "Test the PostCompact hook:"
Write-Host "  powershell -ExecutionPolicy Bypass -File .claude/hooks/scripts/post-compact-restore.ps1"
Write-Host ""
if (-not $DryRun) {
    Write-Host "Git status of installed files:"
    Push-Location $TargetProject
    git status --short .claude/ .skills/custom/idea-to-production/ 2>$null
    Pop-Location
}
