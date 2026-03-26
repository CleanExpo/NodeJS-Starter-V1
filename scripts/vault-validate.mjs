#!/usr/bin/env node

/**
 * Vault Validator — NodeJS-Starter-V1
 *
 * Validates the vault structure:
 * - Checks for broken wiki-links
 * - Validates frontmatter against schema
 * - Reports duplicate IDs
 * - Checks for missing required fields
 *
 * Usage: pnpm vault:validate
 *
 * @version 1.0.0
 * @locale en-AU
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname, basename, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SCAN_PATHS = [
  '.claude/agents',
  '.skills/custom',
  '.claude/rules',
  '.claude/blueprints',
  '.claude/commands',
  '.claude/hooks',
  '.claude/primers',
  '.claude/memory',
  'docs',
]

const REQUIRED_COMMON_FIELDS = ['id', 'type', 'version', 'status']
const VALID_TYPES = ['agent', 'skill', 'rule', 'hook', 'blueprint', 'primer', 'memory', 'command', 'doc']
const VALID_STATUSES = ['active', 'deprecated', 'draft', 'stub']

// Known non-standard types that are valid in this codebase
const LEGACY_TYPES = ['rigid', 'flexible', 'Capability Uplift', 'Encoded Preference Workflow']

// ANSI colours for terminal output
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

// ─────────────────────────────────────────────────────────────────────────────
// Parsers
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

  let currentKey = null
  let currentArray = null

  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim()
      if (currentArray) {
        currentArray.push(value.replace(/^['"]|['"]$/g, ''))
      }
      continue
    }

    const kvMatch = line.match(/^(\s*)([a-z_]+):\s*(.*)$/i)
    if (kvMatch) {
      const [, indent, key, value] = kvMatch

      if (indent.length === 0) {
        if (value.trim() === '') {
          result[key] = []
          currentArray = result[key]
          currentKey = key
        } else {
          result[key] = value.trim().replace(/^['"]|['"]$/g, '')
          currentArray = null
          currentKey = key
        }
      }
    }
  }

  return result
}

/**
 * Extract wiki-links from content (excluding code blocks)
 * @param {string} content - File content
 * @returns {string[]} Array of wiki-link targets
 */
function extractWikiLinks(content) {
  // Remove code blocks first (both fenced and inline)
  const withoutFencedCode = content.replace(/```[\s\S]*?```/g, '')
  const withoutInlineCode = withoutFencedCode.replace(/`[^`]+`/g, '')

  const links = []
  const regex = /\[\[([^\]|#\\]+)(?:[|#\\][^\]]+)?\]\]/g
  let match

  while ((match = regex.exec(withoutInlineCode)) !== null) {
    const link = match[1].trim()
    // Skip placeholder/example links
    if (['id', 'type/id', 'link', 'wiki-link', 'nonexistent'].includes(link)) continue
    links.push(link)
  }

  return links
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

  const parts = filePath.split(/[/\\]/)
  const filename = basename(filePath, '.md')

  if (filename === 'agent' || filename === 'SKILL') {
    return parts[parts.length - 2]
  }

  return filename.toLowerCase().replace(/\s+/g, '-')
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanners
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively find all .md files
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
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        findMdFiles(fullPath, files)
      }
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

// ─────────────────────────────────────────────────────────────────────────────
// Validators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a single file
 * @param {string} filePath - File path
 * @param {Map} idMap - Map of all IDs to paths
 * @param {Set} allIds - Set of all valid IDs
 * @param {Set} allAliases - Set of all aliases
 * @returns {object[]} Array of issues
 */
function validateFile(filePath, idMap, allIds, allAliases) {
  const issues = []
  const relativePath = relative(ROOT, filePath).replace(/\\/g, '/')

  try {
    const content = readFileSync(filePath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    // Check for frontmatter presence
    if (!frontmatter) {
      issues.push({
        severity: 'warning',
        file: relativePath,
        message: 'Missing frontmatter',
      })
      return issues
    }

    const id = extractId(frontmatter, relativePath)

    // Check required fields
    for (const field of REQUIRED_COMMON_FIELDS) {
      if (!frontmatter[field] && field !== 'id') {
        // id can be derived from name
        if (field === 'id' && !frontmatter.name) {
          issues.push({
            severity: 'warning',
            file: relativePath,
            message: `Missing required field: ${field}`,
          })
        } else if (field !== 'id') {
          issues.push({
            severity: 'warning',
            file: relativePath,
            message: `Missing required field: ${field}`,
          })
        }
      }
    }

    // Validate type (allow legacy types with warning)
    if (frontmatter.type && !VALID_TYPES.includes(frontmatter.type)) {
      if (LEGACY_TYPES.includes(frontmatter.type)) {
        issues.push({
          severity: 'warning',
          file: relativePath,
          message: `Legacy type: ${frontmatter.type} (consider migrating to standard type)`,
        })
      } else {
        issues.push({
          severity: 'error',
          file: relativePath,
          message: `Invalid type: ${frontmatter.type}`,
        })
      }
    }

    // Validate status
    if (frontmatter.status && !VALID_STATUSES.includes(frontmatter.status)) {
      issues.push({
        severity: 'error',
        file: relativePath,
        message: `Invalid status: ${frontmatter.status}`,
      })
    }

    // Validate date format (DD/MM/YYYY)
    const dateFields = ['created', 'modified']
    for (const field of dateFields) {
      if (frontmatter[field] && !/^\d{2}\/\d{2}\/\d{4}$/.test(frontmatter[field])) {
        issues.push({
          severity: 'warning',
          file: relativePath,
          message: `Invalid date format for ${field}: ${frontmatter[field]} (expected DD/MM/YYYY)`,
        })
      }
    }

    // Check for wiki-links
    const wikiLinks = extractWikiLinks(content)
    for (const link of wikiLinks) {
      // Handle type/id format
      const linkId = link.includes('/') ? link.split('/').pop() : link

      if (!allIds.has(linkId) && !allAliases.has(linkId)) {
        issues.push({
          severity: 'error',
          file: relativePath,
          message: `Broken wiki-link: [[${link}]]`,
        })
      }
    }
  } catch (err) {
    issues.push({
      severity: 'error',
      file: relativePath,
      message: `Parse error: ${err.message}`,
    })
  }

  return issues
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log(`${CYAN}Vault Validator — NodeJS-Starter-V1${RESET}\n`)

  // Collect all files
  const allFiles = []
  for (const scanPath of SCAN_PATHS) {
    const fullPath = join(ROOT, scanPath)
    allFiles.push(...findMdFiles(fullPath))
  }

  console.log(`Scanning ${allFiles.length} files...\n`)

  // First pass: collect all IDs and aliases
  const idMap = new Map()
  const allIds = new Set()
  const allAliases = new Set()
  const duplicateIds = []

  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8')
      const frontmatter = parseFrontmatter(content) || {}
      const relativePath = relative(ROOT, file).replace(/\\/g, '/')
      const id = extractId(frontmatter, relativePath)

      if (allIds.has(id)) {
        duplicateIds.push({
          id,
          files: [idMap.get(id), relativePath],
        })
      } else {
        allIds.add(id)
        idMap.set(id, relativePath)
      }

      // Collect aliases
      if (Array.isArray(frontmatter.aliases)) {
        for (const alias of frontmatter.aliases) {
          allAliases.add(alias)
        }
      }
    } catch (err) {
      // Will be caught in validation pass
    }
  }

  // Report duplicate IDs
  if (duplicateIds.length > 0) {
    console.log(`${RED}DUPLICATE IDs:${RESET}`)
    for (const dup of duplicateIds) {
      console.log(`  ${YELLOW}${dup.id}${RESET}:`)
      for (const file of dup.files) {
        console.log(`    - ${file}`)
      }
    }
    console.log()
  }

  // Second pass: validate all files
  const allIssues = []

  for (const file of allFiles) {
    const issues = validateFile(file, idMap, allIds, allAliases)
    allIssues.push(...issues)
  }

  // Report results
  const errors = allIssues.filter((i) => i.severity === 'error')
  const warnings = allIssues.filter((i) => i.severity === 'warning')

  if (errors.length > 0) {
    console.log(`${RED}ERRORS (${errors.length}):${RESET}`)
    for (const issue of errors) {
      console.log(`  ${RED}[ERROR]${RESET} ${issue.file}`)
      console.log(`         ${issue.message}`)
    }
    console.log()
  }

  if (warnings.length > 0) {
    console.log(`${YELLOW}WARNINGS (${warnings.length}):${RESET}`)
    for (const issue of warnings) {
      console.log(`  ${YELLOW}[WARN]${RESET} ${issue.file}`)
      console.log(`        ${issue.message}`)
    }
    console.log()
  }

  // Summary
  console.log('─'.repeat(60))
  console.log(`${CYAN}Summary:${RESET}`)
  console.log(`  Files scanned: ${allFiles.length}`)
  console.log(`  Unique IDs: ${allIds.size}`)
  console.log(`  Aliases: ${allAliases.size}`)
  console.log(`  Duplicate IDs: ${duplicateIds.length}`)
  console.log(`  Errors: ${errors.length}`)
  console.log(`  Warnings: ${warnings.length}`)

  if (errors.length === 0 && duplicateIds.length === 0) {
    console.log(`\n${GREEN}Vault is valid!${RESET}`)
    process.exitCode = 0
  } else {
    console.log(`\n${RED}Vault has issues. Run pnpm vault:index after fixing.${RESET}`)
    process.exitCode = 1
  }
}

main()
