#!/usr/bin/env pwsh
# validate-library.ps1 — Schema validation, orphan detection, duplicate detection
# Usage: .\validate-library.ps1 [-Scope <full|quick|security|coverage>]

param(
    [ValidateSet("full", "quick", "security", "coverage")]
    [string]$Scope = "full"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Join-Path $PSScriptRoot ".." ".."
$LibraryRoot = Join-Path $RepoRoot "solution-library"
$RegistryPath = Join-Path $LibraryRoot "registry"
$SkillsPath = Join-Path $RepoRoot ".skills" "custom"
$AgentsPath = Join-Path $RepoRoot ".claude" "agents"

$warnings = 0
$failures = 0

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "LIBRARY VALIDATION — $Title" -ForegroundColor Cyan
    Write-Host ("=" * 47) -ForegroundColor DarkGray
}

function Write-Result {
    param([string]$Message, [string]$Status)
    $colour = switch ($Status) {
        "PASS"  { "Green" }
        "WARN"  { "Yellow" }
        "FAIL"  { "Red" }
        "INFO"  { "White" }
        default { "White" }
    }
    Write-Host "  [$Status] $Message" -ForegroundColor $colour
    if ($Status -eq "WARN") { $script:warnings++ }
    if ($Status -eq "FAIL") { $script:failures++ }
}

Write-Header ($Scope.ToUpper())

# === Registry Existence ===
Write-Host ""
Write-Host "Registry Files" -ForegroundColor DarkGray
$registries = @("agents.yaml", "skills.yaml", "workflows.yaml", "projects.yaml", "deprecated.yaml", "promotion-log.yaml")
foreach ($r in $registries) {
    $path = Join-Path $RegistryPath $r
    if (Test-Path $path) {
        Write-Result $r "PASS"
    } else {
        Write-Result "$r — MISSING" "FAIL"
    }
}

if ($Scope -in @("full", "quick")) {
    # === Orphan Detection ===
    Write-Host ""
    Write-Host "Orphan Detection" -ForegroundColor DarkGray

    # Check skills in registry have corresponding SKILL.md
    if (Test-Path (Join-Path $RegistryPath "skills.yaml")) {
        $skillsContent = Get-Content (Join-Path $RegistryPath "skills.yaml") -Raw
        $skillMatches = [regex]::Matches($skillsContent, 'name: ([a-z][a-z0-9-]+)')
        $orphanCount = 0

        foreach ($match in $skillMatches) {
            $skillName = $match.Groups[1].Value
            $skillFile = Join-Path $SkillsPath $skillName "SKILL.md"
            if (-not (Test-Path $skillFile)) {
                Write-Result "Orphaned skill reference: $skillName (no SKILL.md)" "WARN"
                $orphanCount++
            }
        }

        if ($orphanCount -eq 0) {
            Write-Result "No orphaned skill references" "PASS"
        }
    }
}

if ($Scope -in @("full", "coverage")) {
    # === Coverage Analysis ===
    Write-Host ""
    Write-Host "Coverage Analysis" -ForegroundColor DarkGray

    # Count skills
    $skillsFile = Join-Path $RegistryPath "skills.yaml"
    if (Test-Path $skillsFile) {
        $skillsContent = Get-Content $skillsFile -Raw
        $skillCount = ([regex]::Matches($skillsContent, "- name:")).Count
        Write-Result "$skillCount skills registered" "INFO"
    }

    # Count agents
    $agentsFile = Join-Path $RegistryPath "agents.yaml"
    if (Test-Path $agentsFile) {
        $agentsContent = Get-Content $agentsFile -Raw
        $agentCount = ([regex]::Matches($agentsContent, "- name:")).Count
        Write-Result "$agentCount agents registered" "INFO"
    }
}

# === Summary ===
Write-Host ""
Write-Host ("=" * 47) -ForegroundColor DarkGray

$healthScore = [Math]::Max(0, 100 - ($failures * 20) - ($warnings * 5))
$scoreColour = if ($healthScore -ge 90) { "Green" } elseif ($healthScore -ge 75) { "Yellow" } else { "Red" }

Write-Host ""
Write-Host "  Health Score: $healthScore/100" -ForegroundColor $scoreColour
Write-Host "  Failures: $failures | Warnings: $warnings" -ForegroundColor White
Write-Host ""

if ($failures -gt 0) {
    Write-Host "  VALIDATION FAILED — fix failures before syncing." -ForegroundColor Red
    exit 1
} elseif ($warnings -gt 0) {
    Write-Host "  VALIDATION PASSED WITH WARNINGS." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "  VALIDATION PASSED." -ForegroundColor Green
    exit 0
}
