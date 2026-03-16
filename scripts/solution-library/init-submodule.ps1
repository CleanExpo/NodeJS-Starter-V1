#!/usr/bin/env pwsh
# init-submodule.ps1 — Initialise the solution library as a submodule in a consuming project
# Usage: .\init-submodule.ps1 -TargetRepo <path-to-consuming-project>

param(
    [Parameter(Mandatory=$true)]
    [string]$TargetRepo
)

$ErrorActionPreference = "Stop"
$SubmoduleUrl = "https://github.com/CleanExpo/NodeJS-Starter-V1.git"
$SubmodulePath = "lib/solution-library"

Write-Host ""
Write-Host "SOLUTION LIBRARY — SUBMODULE INIT" -ForegroundColor Cyan
Write-Host ("=" * 47) -ForegroundColor DarkGray

if (-not (Test-Path $TargetRepo)) {
    Write-Host "  [FAIL] Target repo not found: $TargetRepo" -ForegroundColor Red
    exit 1
}

Set-Location $TargetRepo

Write-Host "  [INFO] Adding submodule to: $TargetRepo" -ForegroundColor White
Write-Host "  [INFO] Source: $SubmoduleUrl" -ForegroundColor DarkGray
Write-Host "  [INFO] Path:   $SubmodulePath" -ForegroundColor DarkGray
Write-Host ""

git submodule add $SubmoduleUrl $SubmodulePath
git submodule update --init --recursive $SubmodulePath

Write-Host ""
Write-Host ("=" * 47) -ForegroundColor DarkGray
Write-Host "  [PASS] Submodule added successfully." -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "  1. git add .gitmodules $SubmodulePath" -ForegroundColor DarkGray
Write-Host "  2. git commit -m 'chore(lib): add solution library submodule'" -ForegroundColor DarkGray
Write-Host "  3. Run /lib list to verify assets are available" -ForegroundColor DarkGray
Write-Host ""
