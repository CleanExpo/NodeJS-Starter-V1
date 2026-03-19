#!/usr/bin/env node

/**
 * Vault Index Generator — NodeJS-Starter-V1
 *
 * Scans all .md files, extracts frontmatter, and generates:
 * - .claude/VAULT-INDEX.md (master lookup)
 * - Per-folder index.md files
 *
 * Usage: pnpm vault:index
 *
 * @version 1.0.0
 * @locale en-AU
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, basename, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SCAN_PATHS = [
  { path: '.claude/agents', type: 'agent', pattern: '**/agent.md' },
  { path: '.skills/custom', type: 'skill', pattern: '**/SKILL.md' },
  { path: '.claude/rules', type: 'rule', pattern: '**/*.md' },
  { path: '.claude/blueprints', type: 'blueprint', pattern: '*.md' },
  { path: '.claude/commands', type: 'command', pattern: '*.md' },
  { path: '.claude/hooks', type: 'hook', pattern: '*.md' },
  { path: '.claude/primers', type: 'primer', pattern: '*.md' },
  { path: '.claude/memory', type: 'memory', pattern: '*.md' },
  { path: 'docs', type: 'doc', pattern: '*.md' },
]

const OUTPUT_INDEX = '.claude/VAULT-INDEX.md'

// ─────────────────────────────────────────────────────────────────────────────
// Frontmatter Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse YAML frontmatter from a markdown file
 * @param {string} content - File content
 * @returns {object|null} Parsed frontmatter or null
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null

  const yaml = match[1]
  const result = {}

  // Simple YAML parser for flat and nested structures
  let currentKey = null
  let currentArray = null
  let inArray = false

  for (const line of yaml.split(/\r?\n/)) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue

    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim()
      if (currentArray) {
        currentArray.push(value.replace(/^['"]|['"]$/g, ''))
      }
      continue
    }

    // Key-value pair
    const kvMatch = line.match(/^(\s*)([a-z_]+):\s*(.*)$/i)
    if (kvMatch) {
      const [, indent, key, value] = kvMatch

      // Top-level key
      if (indent.length === 0) {
        if (value.trim() === '') {
          // Start of array or object
          result[key] = []
          currentArray = result[key]
          currentKey = key
        } else {
          // Simple value
          result[key] = value.trim().replace(/^['"]|['"]$/g, '')
          currentArray = null
          currentKey = key
        }
      } else {
        // Nested key (simplified - treats as part of parent)
        if (typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
          result[currentKey][key] = value.trim().replace(/^['"]|['"]$/g, '')
        }
      }
    }
  }

  return result
}

/**
 * Extract ID from frontmatter or derive from path
 * @param {object} frontmatter - Parsed frontmatter
 * @param {string} filePath - File path
 * @returns {string} ID
 */
function extractId(frontmatter, filePath) {
  if (frontmatter?.id) return frontmatter.id
  if (frontmatter?.name) return frontmatter.name

  // Derive from path
  const parts = filePath.split(/[/\\]/)
  const filename = basename(filePath, '.md')

  // For agent.md files, use parent directory name
  if (filename === 'agent' || filename === 'SKILL') {
    return parts[parts.length - 2]
  }

  return filename.toLowerCase().replace(/\s+/g, '-')
}

// ─────────────────────────────────────────────────────────────────────────────
// File Scanner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively find all .md files in a directory
 * @param {string} dir - Directory path
 * @param {string[]} files - Accumulator
 * @returns {string[]} Array of file paths
 */
function findMdFiles(dir, files = []) {
  if (!existsSync(dir)) return files

  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        findMdFiles(fullPath, files)
      }
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Scan all configured paths and collect file metadata
 * @returns {object[]} Array of file metadata
 */
function scanVault() {
  const entries = []

  for (const config of SCAN_PATHS) {
    const fullPath = join(ROOT, config.path)
    const files = findMdFiles(fullPath)

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8')
        const frontmatter = parseFrontmatter(content) || {}
        const relativePath = relative(ROOT, file).replace(/\\/g, '/')

        entries.push({
          id: extractId(frontmatter, relativePath),
          path: relativePath,
          type: frontmatter.type || config.type,
          status: frontmatter.status || 'active',
          version: frontmatter.version || '1.0.0',
          aliases: frontmatter.aliases || [],
          tags: frontmatter.tags || [],
          // Type-specific fields
          toolshed: frontmatter.toolshed,
          context_scope: frontmatter.context_scope,
          skills_required: frontmatter.skills_required,
          category: frontmatter.category,
          complements: frontmatter.complements,
          authority: frontmatter.authority,
          scope: frontmatter.scope,
          role: frontmatter.role,
          description: frontmatter.description,
        })
      } catch (err) {
        console.error(`Error parsing ${file}: ${err.message}`)
      }
    }
  }

  return entries
}

// ─────────────────────────────────────────────────────────────────────────────
// Index Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate the master VAULT-INDEX.md
 * @param {object[]} entries - All vault entries
 * @returns {string} Markdown content
 */
function generateMasterIndex(entries) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Group by type
  const byType = {}
  for (const entry of entries) {
    if (!byType[entry.type]) byType[entry.type] = []
    byType[entry.type].push(entry)
  }

  // Count stats
  const stats = Object.entries(byType).map(([type, items]) => ({
    type,
    total: items.length,
    active: items.filter((i) => i.status === 'active').length,
    deprecated: items.filter((i) => i.status === 'deprecated').length,
    draft: items.filter((i) => i.status === 'draft').length,
  }))

  let md = `---
id: vault-index
type: doc
version: 1.0.0
created: ${dateStr}
modified: ${dateStr}
status: active
tags: [index, vault, meta]
---

# VAULT-INDEX — NodeJS-Starter-V1

> Auto-generated by \`pnpm vault:index\`. Do not edit manually.
> Last updated: ${dateStr} ${timeStr}

## Quick Reference

| Type | Total | Active | Deprecated | Draft |
|------|-------|--------|------------|-------|
${stats.map((s) => `| ${s.type} | ${s.total} | ${s.active} | ${s.deprecated} | ${s.draft} |`).join('\n')}
| **Total** | **${entries.length}** | **${entries.filter((e) => e.status === 'active').length}** | **${entries.filter((e) => e.status === 'deprecated').length}** | **${entries.filter((e) => e.status === 'draft').length}** |

---

`

  // Agents section
  if (byType.agent?.length) {
    md += `## Agents

| ID | Path | Status | Toolshed | Skills |
|----|------|--------|----------|--------|
${byType.agent
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((a) => {
    const skills = (a.skills_required || []).map((s) => `[[${s}]]`).join(', ') || '-'
    return `| ${a.id} | \`${a.path}\` | ${a.status} | ${a.toolshed || '-'} | ${skills} |`
  })
  .join('\n')}

`
  }

  // Skills section
  if (byType.skill?.length) {
    md += `## Skills

| ID | Path | Status | Category | Complements |
|----|------|--------|----------|-------------|
${byType.skill
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((s) => {
    const complements = (s.complements || []).map((c) => `[[${c}]]`).join(', ') || '-'
    return `| ${s.id} | \`${s.path}\` | ${s.status} | ${s.category || '-'} | ${complements} |`
  })
  .join('\n')}

`
  }

  // Rules section
  if (byType.rule?.length) {
    md += `## Rules

| ID | Path | Status | Authority | Scope |
|----|------|--------|-----------|-------|
${byType.rule
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((r) => `| ${r.id} | \`${r.path}\` | ${r.status} | ${r.authority || '-'} | ${r.scope || '-'} |`)
  .join('\n')}

`
  }

  // Blueprints section
  if (byType.blueprint?.length) {
    md += `## Blueprints

| ID | Path | Status | Toolshed |
|----|------|--------|----------|
${byType.blueprint
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((b) => `| ${b.id} | \`${b.path}\` | ${b.status} | ${b.toolshed || '-'} |`)
  .join('\n')}

`
  }

  // Commands section
  if (byType.command?.length) {
    md += `## Commands

| ID | Path | Status |
|----|------|--------|
${byType.command
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((c) => `| ${c.id} | \`${c.path}\` | ${c.status} |`)
  .join('\n')}

`
  }

  // Hooks section
  if (byType.hook?.length) {
    md += `## Hooks

| ID | Path | Status |
|----|------|--------|
${byType.hook
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((h) => `| ${h.id} | \`${h.path}\` | ${h.status} |`)
  .join('\n')}

`
  }

  // Memory section
  if (byType.memory?.length) {
    md += `## Memory

| ID | Path | Status |
|----|------|--------|
${byType.memory
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((m) => `| ${m.id} | \`${m.path}\` | ${m.status} |`)
  .join('\n')}

`
  }

  // Docs section
  if (byType.doc?.length) {
    md += `## Documentation

| ID | Path | Status |
|----|------|--------|
${byType.doc
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((d) => `| ${d.id} | \`${d.path}\` | ${d.status} |`)
  .join('\n')}

`
  }

  // Wiki-link resolution guide
  md += `---

## Wiki-Link Resolution

| Pattern | Example | Resolution |
|---------|---------|------------|
| \`[[id]]\` | \`[[scientific-luxury]]\` | Search this index for matching ID |
| \`[[type/id]]\` | \`[[agent/frontend-specialist]]\` | Direct path by type |
| \`[[id#section]]\` | \`[[scientific-luxury#banned-elements]]\` | Link to heading anchor |
| \`[[id\\|display]]\` | \`[[scientific-luxury\\|Design System]]\` | Custom display text |

## Alias Index

${entries
  .filter((e) => e.aliases?.length > 0)
  .map((e) => `- **${e.id}**: ${e.aliases.join(', ')}`)
  .join('\n') || '_No aliases defined_'}
`

  return md
}

/**
 * Generate per-folder index.md
 * @param {object[]} entries - Entries for this folder
 * @param {string} type - Folder type
 * @returns {string} Markdown content
 */
function generateFolderIndex(entries, type) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  let md = `---
id: ${type}-index
type: doc
version: 1.0.0
created: ${dateStr}
modified: ${dateStr}
status: active
tags: [index, ${type}]
---

# ${type.charAt(0).toUpperCase() + type.slice(1)} Index

> Auto-generated by \`pnpm vault:index\`. Do not edit manually.
> Total: ${entries.length} | Active: ${entries.filter((e) => e.status === 'active').length}

`

  // Type-specific table format
  switch (type) {
    case 'agent':
      md += `| ID | Role | Toolshed | Status |
|----|------|----------|--------|
${entries
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((a) => `| [[${a.id}]] | ${a.role || '-'} | ${a.toolshed || '-'} | ${a.status} |`)
  .join('\n')}
`
      break

    case 'skill':
      md += `| ID | Category | Status | Description |
|----|----------|--------|-------------|
${entries
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((s) => `| [[${s.id}]] | ${s.category || '-'} | ${s.status} | ${(s.description || '-').substring(0, 60)}${(s.description || '').length > 60 ? '...' : ''} |`)
  .join('\n')}
`
      break

    case 'rule':
      md += `| ID | Authority | Scope | Status |
|----|-----------|-------|--------|
${entries
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((r) => `| [[${r.id}]] | ${r.authority || '-'} | ${r.scope || '-'} | ${r.status} |`)
  .join('\n')}
`
      break

    default:
      md += `| ID | Status |
|----|--------|
${entries
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((e) => `| [[${e.id}]] | ${e.status} |`)
  .join('\n')}
`
  }

  return md
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Execution
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log('Scanning vault...')
  const entries = scanVault()
  console.log(`Found ${entries.length} files`)

  // Generate master index
  console.log('Generating VAULT-INDEX.md...')
  const masterIndex = generateMasterIndex(entries)
  writeFileSync(join(ROOT, OUTPUT_INDEX), masterIndex, 'utf-8')
  console.log(`Written: ${OUTPUT_INDEX}`)

  // Generate per-folder indexes
  const folderConfigs = [
    { path: '.claude/agents', type: 'agent' },
    { path: '.skills/custom', type: 'skill' },
    { path: '.claude/rules', type: 'rule' },
    { path: '.claude/blueprints', type: 'blueprint' },
    { path: '.claude/commands', type: 'command' },
  ]

  for (const config of folderConfigs) {
    const folderEntries = entries.filter((e) => e.path.startsWith(config.path))
    if (folderEntries.length > 0) {
      const indexPath = join(ROOT, config.path, 'index.md')
      const indexContent = generateFolderIndex(folderEntries, config.type)
      writeFileSync(indexPath, indexContent, 'utf-8')
      console.log(`Written: ${config.path}/index.md`)
    }
  }

  console.log('Done!')
}

main()
