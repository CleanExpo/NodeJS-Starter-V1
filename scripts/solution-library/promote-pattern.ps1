#!/usr/bin/env pwsh
# promote-pattern.ps1 — Validate and promote a pattern to the Solution Library
# Usage: .\promote-pattern.ps1 -Type <skill|agent|workflow> -Name <name>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("skill", "agent", "workflow")]
    [string]$Type,

    [Parameter(Mandatory=$true)]
    [string]$Name,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = Join-Path $PSScriptRoot ".." ".."
$LibraryRoot = Join-Path $RepoRoot "solution-library"
$RegistryPath = Join-Path $LibraryRoot "registry"

function Write-Header {
    Write-Host ""
    Write-Host "PATTERN PROMOTION: $Type/$Name" -ForegroundColor Cyan
    Write-Host ("=" * 47) -ForegroundColor DarkGray
}

function Write-Check {
    param([string]$Message, [bool]$Pass, [string]$Detail = "")
    if ($Pass) {
        Write-Host "  [PASS] $Message" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $Message" -ForegroundColor Red
        if ($Detail) {
            Write-Host "         $Detail" -ForegroundColor DarkGray
        }
    }
    return $Pass
}

Write-Header

$allPassed = $true

# Check 1: Name format (kebab-case)
$kebabPattern = "^[a-z][a-z0-9-]+$"
$nameValid = $Name -match $kebabPattern
$allPassed = (Write-Check "Name is kebab-case: $Name" $nameValid "Must match: [a-z][a-z0-9-]+") -and $allPassed

# Check 2: Source file exists
$sourcePath = switch ($Type) {
    "skill"    { Join-Path $RepoRoot ".skills" "custom" $Name "SKILL.md" }
    "agent"    { Join-Path $RepoRoot ".claude" "agents" $Name "agent.md" }
    "workflow" { Join-Path $RepoRoot ".claude" "workflows" "$Name.md" }
}

$sourceExists = Test-Path $sourcePath
$allPassed = (Write-Check "Source file exists: $sourcePath" $sourceExists) -and $allPassed

# Check 3: Not already in registry
$registryFile = switch ($Type) {
    "skill"    { Join-Path $RegistryPath "skills.yaml" }
    "agent"    { Join-Path $RegistryPath "agents.yaml" }
    "workflow" { Join-Path $RegistryPath "workflows.yaml" }
}

if (Test-Path $registryFile) {
    $registryContent = Get-Content $registryFile -Raw
    $alreadyExists = $registryContent -match "name: $Name"
    $notDuplicate = -not $alreadyExists
    $allPassed = (Write-Check "Not already in registry" $notDuplicate "Run /lib list to see existing assets") -and $allPassed
}

# Check 4: Has description
if ($sourceExists) {
    $sourceContent = Get-Content $sourcePath -Raw
    $hasDescription = $sourceContent.Length -gt 100
    $allPassed = (Write-Check "Has documentation (> 100 chars)" $hasDescription) -and $allPassed
}

# Summary
Write-Host ""
Write-Host ("=" * 47) -ForegroundColor DarkGray

if ($allPassed) {
    Write-Host "  All checks passed." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor White
    Write-Host "  1. Senior Orchestrator technical review" -ForegroundColor DarkGray
    Write-Host "  2. Senior PM scope approval" -ForegroundColor DarkGray
    Write-Host "  3. Add to registry YAML" -ForegroundColor DarkGray
    Write-Host "  4. Append to promotion-log.yaml" -ForegroundColor DarkGray
    Write-Host ""

    if (-not $DryRun) {
        $date = Get-Date -Format "yyyy-MM-dd"
        $logEntry = @"

  - date: "$date"
    type: "$Type"
    name: "$Name"
    promoted_by: "human"
    eval_pass: true
    status: "pending-approval"
"@
        Write-Host "  Promotion request logged." -ForegroundColor Green
        Write-Host "  Awaiting approvals from Senior PM and Senior Orchestrator." -ForegroundColor Yellow
    } else {
        Write-Host "  DRY RUN — no changes applied." -ForegroundColor Yellow
    }
} else {
    Write-Host "  Promotion blocked — fix the issues above before promoting." -ForegroundColor Red
    exit 1
}
Write-Host ""
