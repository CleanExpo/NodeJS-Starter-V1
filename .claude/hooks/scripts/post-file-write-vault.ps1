# PostToolUse Hook — Vault Frontmatter Maintenance
# Triggers: After Write/Edit tool completes on .md files
# Purpose: Update modified date in frontmatter, queue index regeneration
#
# @version 1.0.0
# @locale en-AU

param(
    [Parameter(ValueFromPipeline = $true)]
    [string]$InputJson
)

# Parse input
$input = $InputJson | ConvertFrom-Json
$toolName = $input.tool_name
$toolInput = $input.tool_input

# Only process Write/Edit on .md files
if ($toolName -notin @("Write", "Edit")) {
    Write-Output '{"result": "continue"}'
    exit 0
}

$filePath = $toolInput.file_path
if (-not $filePath -or -not $filePath.EndsWith(".md")) {
    Write-Output '{"result": "continue"}'
    exit 0
}

# Skip index files (auto-generated)
if ($filePath -match "index\.md$" -or $filePath -match "VAULT-INDEX\.md$") {
    Write-Output '{"result": "continue"}'
    exit 0
}

# Get today's date in DD/MM/YYYY format
$today = (Get-Date).ToString("dd/MM/yyyy")

# Build reminder to update frontmatter
$reminder = @"
VAULT_MAINTENANCE: File '$filePath' was modified.
If this file has frontmatter, the 'modified' field should be updated to: $today
Consider running 'pnpm vault:index' if structural changes were made.
"@

$output = @{
    result = "continue"
    additionalContext = $reminder
} | ConvertTo-Json -Compress

Write-Output $output
