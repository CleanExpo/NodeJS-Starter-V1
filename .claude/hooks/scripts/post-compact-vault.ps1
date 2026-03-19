# PostCompact Hook — Vault Index Preservation
# Triggers: After context compaction completes
# Purpose: Ensure VAULT-INDEX.md is in context after compaction
#
# Available since Claude Code v2.1.76
# @version 1.0.0
# @locale en-AU

param(
    [string]$HookEvent = "PostCompact"
)

# Build the vault reminder to inject post-compaction
$vaultReminder = @"
VAULT_SYSTEM_ACTIVE: true
INDEX_PATH: .claude/VAULT-INDEX.md
WIKI_LINK_SYNTAX: [[id]], [[type/id]], [[id#section]], [[id|display]]
REGENERATE_CMD: pnpm vault:index
"@

# Output as JSON for hook system
$output = @{
    result = "continue"
    additionalContext = $vaultReminder
} | ConvertTo-Json -Compress

Write-Output $output
