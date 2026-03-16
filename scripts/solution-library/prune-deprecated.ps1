#!/usr/bin/env pwsh
# prune-deprecated.ps1 — Remove deprecated items past their grace period
# Usage: .\prune-deprecated.ps1 [-DryRun]

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = Join-Path $PSScriptRoot ".." ".."
$LibraryRoot = Join-Path $RepoRoot "solution-library"
$DeprecatedFile = Join-Path $LibraryRoot "registry" "deprecated.yaml"

function Write-Header {
    Write-Host ""
    Write-Host "DEPRECATION PRUNER" -ForegroundColor Cyan
    Write-Host ("=" * 47) -ForegroundColor DarkGray
}

Write-Header

if (-not (Test-Path $DeprecatedFile)) {
    Write-Host "  [INFO] deprecated.yaml not found — nothing to prune" -ForegroundColor White
    exit 0
}

$content = Get-Content $DeprecatedFile -Raw
$today = Get-Date

Write-Host "  [INFO] Checking deprecated.yaml for items past grace period..." -ForegroundColor White
Write-Host "  [INFO] Today: $($today.ToString('dd/MM/yyyy'))" -ForegroundColor DarkGray
Write-Host ""

# Parse removal_date entries
$pattern = 'removal_date: "(\d{4}-\d{2}-\d{2})"'
$matches = [regex]::Matches($content, $pattern)

if ($matches.Count -eq 0) {
    Write-Host "  [PASS] No deprecated items to prune." -ForegroundColor Green
    exit 0
}

$pruneCount = 0
foreach ($match in $matches) {
    $removalDate = [DateTime]::ParseExact($match.Groups[1].Value, "yyyy-MM-dd", $null)
    if ($removalDate -lt $today) {
        $pruneCount++
        Write-Host "  [WARN] Item past removal date: $($match.Groups[1].Value)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host ("=" * 47) -ForegroundColor DarkGray

if ($pruneCount -eq 0) {
    Write-Host "  No items past grace period. Library is clean." -ForegroundColor Green
} else {
    Write-Host "  $pruneCount item(s) past grace period." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "  DRY RUN — no files deleted." -ForegroundColor Yellow
    } else {
        Write-Host "  Review deprecated.yaml and manually remove these items." -ForegroundColor White
        Write-Host "  Archive the source files before deletion." -ForegroundColor White
    }
}
Write-Host ""
