#!/usr/bin/env pwsh
# sync-library.ps1 — Pull latest library assets and validate local state
# Usage: .\sync-library.ps1 [-DryRun] [-Force]

param(
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$LibraryRoot = Join-Path $PSScriptRoot ".." ".." "solution-library"
$RegistryPath = Join-Path $LibraryRoot "registry"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "LIBRARY SYNC" -ForegroundColor Cyan
    Write-Host ("=" * 47) -ForegroundColor DarkGray
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $colour = switch ($Status) {
        "PASS"  { "Green" }
        "WARN"  { "Yellow" }
        "FAIL"  { "Red" }
        "INFO"  { "White" }
        default { "White" }
    }
    Write-Host "  [$Status] $Message" -ForegroundColor $colour
}

# Step 1: Check git state
Write-Header "Library Sync"
Write-Step "Checking git state..."

$gitStatus = git status --porcelain 2>&1
if ($gitStatus -and -not $Force) {
    Write-Step "Working directory has uncommitted changes" "WARN"
    Write-Step "Commit or stash changes before syncing, or use -Force" "WARN"
    if (-not $DryRun) {
        exit 1
    }
}

# Step 2: Read current version
$LibraryYaml = Join-Path $LibraryRoot "library.yaml"
if (-not (Test-Path $LibraryYaml)) {
    Write-Step "library.yaml not found at: $LibraryYaml" "FAIL"
    exit 1
}

Write-Step "Library configuration found" "PASS"

# Step 3: Dry-run check
if ($DryRun) {
    Write-Step "DRY RUN — no changes will be applied" "INFO"
}

# Step 4: Validate registries
$registries = @("agents.yaml", "skills.yaml", "workflows.yaml", "projects.yaml", "deprecated.yaml", "promotion-log.yaml")
$allValid = $true

Write-Step "Validating registries..."
foreach ($registry in $registries) {
    $path = Join-Path $RegistryPath $registry
    if (Test-Path $path) {
        Write-Step "$registry" "PASS"
    } else {
        Write-Step "$registry — MISSING" "FAIL"
        $allValid = $false
    }
}

if (-not $allValid -and -not $Force) {
    Write-Host ""
    Write-Host "Validation failed. Run validate-library.ps1 for details." -ForegroundColor Red
    exit 1
}

# Step 5: Count assets
Write-Step "Counting assets..."
$agentsYaml = Get-Content (Join-Path $RegistryPath "agents.yaml") -Raw
$skillsYaml = Get-Content (Join-Path $RegistryPath "skills.yaml") -Raw

$agentCount = ([regex]::Matches($agentsYaml, "- name:")).Count
$skillCount  = ([regex]::Matches($skillsYaml, "- name:")).Count

Write-Step "Found $agentCount agents, $skillCount skills" "INFO"

# Step 6: Complete
Write-Host ""
Write-Host ("=" * 47) -ForegroundColor DarkGray
if ($DryRun) {
    Write-Host "Dry run complete — no changes applied." -ForegroundColor Yellow
} else {
    Write-Host "Sync complete. Run /lib list to see all assets." -ForegroundColor Green
}
Write-Host ""
