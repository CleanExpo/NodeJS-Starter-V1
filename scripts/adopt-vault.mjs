#!/usr/bin/env node

/**
 * Vault Adoption Script — NodeJS-Starter-V1
 *
 * Adds missing frontmatter to existing .md files while preserving
 * existing fields. Uses the frontmatter schema for defaults.
 *
 * Usage: pnpm vault:adopt [--dry-run]
 *
 * @version 1.0.0
 * @locale en-AU
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname, basename, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')

const SCAN_CONFIGS = [
  { path: '.claude/agents', type: 'agent', filename: 'agent.md' },
  { path: '.skills/custom', type: 'skill', filename: 'SKILL.md' },
  { path: '.claude/rules', type: 'rule', filename: null },
  { path: '.claude/blueprints', type: 'blueprint', filename: null },
  { path: '.claude/commands', type: 'command', filename: null },
  { path: '.claude/hooks', type: 'hook', filename: null },
  { path: '.claude/primers', type: 'primer', filename: null },
  { path: '.claude/memory', type: 'memory', filename: null },
  { path: 'docs', type: 'doc', filename: null },
]

const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

// ─────────────────────────────────────────────────────────────────────────────
// Parsers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse existing frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { frontmatter: null, body: content, raw: null }

  const yaml = match[1]
  const body = content.slice(match[0].length).replace(/^\r?\n/, '')
  const result = {}

  let currentKey = null
  let currentArray = null
  let currentObject = null
  let inNestedObject = false
  let nestedKey = null

  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim().replace(/^['"]|['"]$/g, '')
      if (currentArray) {
        currentArray.push(value)
      }
      continue
    }

    // Key-value pair
    const kvMatch = line.match(/^(\s*)([a-z_]+):\s*(.*)$/i)
    if (kvMatch) {
      const [, indent, key, value] = kvMatch
      const indentLevel = indent.length

      if (indentLevel === 0) {
        inNestedObject = false
        if (value.trim() === '') {
          // Could be array or object
          result[key] = []
          currentArray = result[key]
          currentKey = key
        } else {
          result[key] = value.trim().replace(/^['"]|['"]$/g, '')
          currentArray = null
          currentKey = key
        }
      } else if (indentLevel === 2) {
        // Nested under previous key
        if (currentKey && Array.isArray(result[currentKey]) && result[currentKey].length === 0) {
          // Convert to object
          result[currentKey] = {}
          currentArray = null
        }
        if (typeof result[currentKey] === 'object' && !Array.isArray(result[currentKey])) {
          result[currentKey][key] = value.trim().replace(/^['"]|['"]$/g, '')
        }
      }
    }
  }

  return { frontmatter: result, body, raw: match[0] }
}

/**
 * Generate new frontmatter YAML
 */
function generateFrontmatter(data) {
  const lines = ['---']

  const simpleFields = ['id', 'name', 'type', 'version', 'created', 'modified', 'status', 'role', 'priority', 'toolshed', 'token_budget', 'category', 'complexity', 'authority', 'scope', 'event_type', 'script_path', 'blocking', 'effort']
  const arrayFields = ['aliases', 'tags', 'context_scope', 'skills_required', 'triggers', 'complements', 'overrides']
  const objectFields = ['links', 'metadata', 'iteration_caps']

  // Simple fields first
  for (const field of simpleFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const value = data[field]
      if (typeof value === 'string' && (value.includes(':') || value.includes('#'))) {
        lines.push(`${field}: "${value}"`)
      } else {
        lines.push(`${field}: ${value}`)
      }
    }
  }

  // Array fields
  for (const field of arrayFields) {
    if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
      lines.push(`${field}:`)
      for (const item of data[field]) {
        lines.push(`  - ${item}`)
      }
    }
  }

  // Object fields
  for (const field of objectFields) {
    if (data[field] && typeof data[field] === 'object' && Object.keys(data[field]).length > 0) {
      lines.push(`${field}:`)
      for (const [key, value] of Object.entries(data[field])) {
        if (Array.isArray(value)) {
          lines.push(`  ${key}:`)
          for (const item of value) {
            lines.push(`    - ${item}`)
          }
        } else {
          lines.push(`  ${key}: ${value}`)
        }
      }
    }
  }

  // Description (often multiline for skills)
  if (data.description) {
    const desc = data.description.replace(/"/g, '\\"')
    if (desc.length > 80 || desc.includes('\n')) {
      lines.push(`description: >`)
      lines.push(`  ${desc.split('\n').join('\n  ')}`)
    } else {
      lines.push(`description: "${desc}"`)
    }
  }

  lines.push('---')
  return lines.join('\n')
}

/**
 * Extract ID from path
 */
function extractIdFromPath(filePath) {
  const parts = filePath.split(/[/\\]/)
  const filename = basename(filePath, '.md')

  if (filename === 'agent' || filename === 'SKILL') {
    return parts[parts.length - 2]
  }

  return filename.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Get current date in DD/MM/YYYY format
 */
function getCurrentDate() {
  const now = new Date()
  return now.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Adoption Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process a single file
 */
function adoptFile(filePath, type) {
  const relativePath = relative(ROOT, filePath).replace(/\\/g, '/')
  const content = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)

  const id = extractIdFromPath(relativePath)
  const today = getCurrentDate()

  // Build merged frontmatter
  const merged = {
    // Required common fields (with defaults)
    id: frontmatter?.id || frontmatter?.name || id,
    type: frontmatter?.type || type,
    version: frontmatter?.version || (frontmatter?.metadata?.version) || '1.0.0',
    created: frontmatter?.created || today,
    modified: today,
    status: frontmatter?.status || 'active',

    // Preserve name if it exists (for backward compatibility)
    ...(frontmatter?.name && { name: frontmatter.name }),

    // Optional common fields
    ...(frontmatter?.aliases && { aliases: frontmatter.aliases }),
    ...(frontmatter?.tags && { tags: frontmatter.tags }),
    ...(frontmatter?.links && { links: frontmatter.links }),

    // Type-specific fields
    ...(frontmatter?.role && { role: frontmatter.role }),
    ...(frontmatter?.priority && { priority: frontmatter.priority }),
    ...(frontmatter?.toolshed && { toolshed: frontmatter.toolshed }),
    ...(frontmatter?.context_scope && { context_scope: frontmatter.context_scope }),
    ...(frontmatter?.token_budget && { token_budget: frontmatter.token_budget }),
    ...(frontmatter?.skills_required && { skills_required: frontmatter.skills_required }),
    ...(frontmatter?.category && { category: frontmatter.category }),
    ...(frontmatter?.complexity && { complexity: frontmatter.complexity }),
    ...(frontmatter?.complements && { complements: frontmatter.complements }),
    ...(frontmatter?.triggers && { triggers: frontmatter.triggers }),
    ...(frontmatter?.authority && { authority: frontmatter.authority }),
    ...(frontmatter?.scope && { scope: frontmatter.scope }),
    ...(frontmatter?.overrides && { overrides: frontmatter.overrides }),
    ...(frontmatter?.event_type && { event_type: frontmatter.event_type }),
    ...(frontmatter?.script_path && { script_path: frontmatter.script_path }),
    ...(frontmatter?.blocking !== undefined && { blocking: frontmatter.blocking }),
    ...(frontmatter?.iteration_caps && { iteration_caps: frontmatter.iteration_caps }),
    ...(frontmatter?.effort && { effort: frontmatter.effort }),

    // Preserve description (skills use this)
    ...(frontmatter?.description && { description: frontmatter.description }),

    // Preserve metadata block (for skills with author info)
    ...(frontmatter?.metadata && { metadata: frontmatter.metadata }),

    // License
    ...(frontmatter?.license && { license: frontmatter.license }),
  }

  // Generate new content
  const newFrontmatter = generateFrontmatter(merged)
  const newContent = `${newFrontmatter}\n\n${body}`

  // Check if changed
  const changed = content !== newContent

  if (changed) {
    if (DRY_RUN) {
      console.log(`${YELLOW}[DRY-RUN]${RESET} Would update: ${relativePath}`)
    } else {
      writeFileSync(filePath, newContent, 'utf-8')
      console.log(`${GREEN}[UPDATED]${RESET} ${relativePath}`)
    }
  }

  return { path: relativePath, changed, hadFrontmatter: !!frontmatter }
}

/**
 * Find all .md files in a directory
 */
function findMdFiles(dir, files = []) {
  if (!existsSync(dir)) return files

  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        findMdFiles(fullPath, files)
      }
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(fullPath)
    }
  }

  return files
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log(`${CYAN}Vault Adoption — NodeJS-Starter-V1${RESET}`)
  if (DRY_RUN) {
    console.log(`${YELLOW}Running in dry-run mode (no files will be modified)${RESET}`)
  }
  console.log()

  let totalFiles = 0
  let updatedFiles = 0
  let newFrontmatter = 0

  for (const config of SCAN_CONFIGS) {
    const fullPath = join(ROOT, config.path)
    const files = findMdFiles(fullPath)

    for (const file of files) {
      // Skip non-matching files for specific filename configs
      if (config.filename && !file.endsWith(config.filename)) continue

      totalFiles++
      const result = adoptFile(file, config.type)

      if (result.changed) {
        updatedFiles++
        if (!result.hadFrontmatter) {
          newFrontmatter++
        }
      }
    }
  }

  console.log()
  console.log('─'.repeat(60))
  console.log(`${CYAN}Summary:${RESET}`)
  console.log(`  Files scanned: ${totalFiles}`)
  console.log(`  Files updated: ${updatedFiles}`)
  console.log(`  New frontmatter added: ${newFrontmatter}`)

  if (DRY_RUN) {
    console.log(`\n${YELLOW}Run without --dry-run to apply changes.${RESET}`)
  } else if (updatedFiles > 0) {
    console.log(`\n${GREEN}Run 'pnpm vault:index' to regenerate indexes.${RESET}`)
  }
}

main()
