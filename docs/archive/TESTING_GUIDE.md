---
id: testing_guide
type: doc
version: 1.0.0
created: 20/03/2026
modified: 20/03/2026
status: active
---

# Testing Guide - Complete System

## Overview

This document provides comprehensive testing information for the entire system, including PRD generation, security, accessibility, and database integration.

**Test Coverage** (Updated 2026-01-06):

- ✅ Backend Unit Tests: **87%+** coverage
- ✅ Frontend Unit Tests: **77%+** coverage
- ✅ Security Tests: **Complete** (XSS, API Security, OWASP ZAP)
- ✅ Accessibility Tests: **Complete** (WCAG 2.1 AA)
- ✅ Component Tests: **Complete** (Dashboard, Forms)
- ✅ Integration Tests: **Complete**
- ✅ E2E Tests: **Complete**
- ✅ Database Tests: **Complete** (RLS, Integrity)
- ✅ Contract Tests: **Complete** (Pact - Frontend/Backend)
- ✅ Visual Regression: **Complete** (Percy - 50+ snapshots)
- ✅ Performance Tests: **Complete** (Lighthouse CI - Core Web Vitals)
- ✅ Load Testing: **Complete** (k6 - 4 scenarios)
- ✅ Penetration Testing: **Complete** (OWASP ZAP - Baseline + Full)

**Total Test Count**: **300+ test cases** | **4 load test scenarios** | **Automated security scans**

---

## Test Structure

```
apps/backend/tests/
├── test_prd_agents.py                     # Unit tests for PRD agents
├── test_prd_routes.py                     # Unit tests for API routes
├── security/
│   └── test_api_security.py              # API security tests (SQL injection, XSS, auth)
├── integration/
│   └── test_supabase_rls.py              # Database integration & RLS tests
└── contracts/
    └── test_prd_provider.py              # Pact provider verification tests

apps/web/__tests__/
├── hooks/
│   └── use-prd-generation.test.ts        # Hook tests
├── components/
│   ├── prd-components.test.tsx           # PRD component tests
│   ├── oauth-components.test.tsx         # OAuth component tests
│   ├── contractor-availability.test.tsx  # Contractor component tests
│   ├── dashboard/
│   │   ├── AgentList.test.tsx           # Agent list component (13 tests)
│   │   └── QueueStats.test.tsx          # Queue stats component (19 tests)
│   └── forms/
│       └── TaskSubmissionForm.test.tsx   # Form component (23 tests)
└── security/
    └── xss-prevention.test.tsx           # XSS prevention tests (17 tests)

apps/web/e2e/
└── prd-generation.spec.ts                # E2E tests with Playwright

apps/web/tests/
├── accessibility/
│   └── a11y.spec.ts                      # Accessibility tests (50+ tests)
├── contracts/
│   └── prd-consumer.pact.test.ts         # Pact consumer contract tests
└── visual/
    └── components.visual.spec.ts         # Percy visual regression tests (50+ snapshots)
```

---

## Backend Tests

### Running Backend Tests

```bash
# All tests
cd apps/backend
uv run pytest

# Specific test file
uv run pytest tests/test_prd_agents.py

# With coverage
uv run pytest --cov=src.agents.prd --cov-report=html

# Verbose output
uv run pytest -v

# Single test
uv run pytest tests/test_prd_agents.py::TestPRDAnalysisAgent::test_execute_success
```

### Backend Test Coverage

#### PRD Agents Tests (`test_prd_agents.py`)

**TestPRDAnalysisAgent**:

- ✅ Successful requirements analysis
- ✅ API failure handling
- ✅ Invalid JSON response (fallback parser)

**TestFeatureDecomposer**:

- ✅ Successful feature decomposition
- ✅ Conversion to feature_list.json format

**TestTechnicalSpecGenerator**:

- ✅ Successful technical spec generation
- ✅ Database schema generation
- ✅ API endpoint generation

**TestPRDOrchestrator**:

- ✅ Full PRD generation end-to-end
- ✅ Document generation (6 files)
- ✅ Sub-agent failure handling

**Integration Functions**:

- ✅ `generate_features_from_spec()` with PRD system
- ✅ `load_features_from_prd_json()` from file
- ✅ File not found error handling

#### API Routes Tests (`test_prd_routes.py`)

**POST /api/prd/generate**:

- ✅ Successful generation request
- ✅ Missing requirements validation
- ✅ Requirements too short validation
- ✅ Invalid context validation

**GET /api/prd/status/{run_id}**:

- ✅ Status retrieval (pending, in_progress, completed, failed)
- ✅ Not found error (404)
- ✅ Result data in completed status

**GET /api/prd/result/{prd_id}**:

- ✅ Successful result retrieval
- ✅ Not found error (404)
- ✅ Not completed error (400)

**GET /api/prd/documents/{prd_id}**:

- ✅ Document listing

**Background Task**:

- ✅ `execute_prd_generation()` success
- ✅ `execute_prd_generation()` failure

**Total**: 22 backend test cases

---

## Frontend Tests

### Running Frontend Tests

```bash
# All tests
cd apps/web
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Specific test file
pnpm test use-prd-generation

# Update snapshots
pnpm test -u
```

### Frontend Test Coverage

#### Hook Tests (`use-prd-generation.test.ts`)

**usePRDGeneration**:

- ✅ Default state initialization
- ✅ Successful PRD generation request
- ✅ API error handling
- ✅ Network error handling
- ✅ PRD result fetching
- ✅ State reset

**usePRDResult**:

- ✅ Fetch PRD result on mount
- ✅ Fetch error handling
- ✅ Network error handling
- ✅ Empty prdId handling

**Total**: 10 hook test cases

#### Component Tests (`prd-components.test.tsx`)

**PRDGeneratorForm**:

- ✅ Render all form fields
- ✅ Submit button disabled when requirements too short
- ✅ Submit button enabled when valid
- ✅ Form submission with correct data
- ✅ Inputs disabled during generation
- ✅ Generating state in submit button
- ✅ Character count display
- ✅ 50-character minimum validation

**PRDGenerationProgress**:

- ✅ Progress bar with percentage
- ✅ Current step display
- ✅ Completed phases with checkmarks
- ✅ Current phase with spinner
- ✅ Pending phases without decoration
- ✅ All 5 generation phases render
- ✅ Estimated time display
- ✅ Null current step handling
- ✅ 100% progress display

**Total**: 17 component test cases

---

## Security Tests

### XSS Prevention Tests (`xss-prevention.test.tsx`)

**Location**: `apps/web/__tests__/security/xss-prevention.test.tsx`

**Running XSS Tests**:

```bash
cd apps/web
pnpm test xss-prevention
```

**Coverage** (17 tests):

- ✅ React default escaping (script tags, image onerror, all XSS payloads)
- ✅ dangerouslySetInnerHTML protection
- ✅ URL injection prevention (javascript:, data: URLs)
- ✅ Attribute injection prevention (event handlers, style injection)
- ✅ Form input sanitization
- ✅ Content Security Policy headers
- ✅ Third-party content sanitization
- ✅ JSON injection prevention
- ✅ DOM-based XSS prevention (URL params, hash fragments)
- ✅ React-specific protections (children props, object injection)

**Test Status**: ✅ **17/17 PASSING**

### API Security Tests (`test_api_security.py`)

**Location**: `apps/backend/tests/security/test_api_security.py`

**Running API Security Tests**:

```bash
cd apps/backend
uv run pytest tests/security/test_api_security.py -v
```

**Coverage** (80+ tests):

**SQL Injection Prevention**:

- ✅ 8+ SQL injection payloads tested
- ✅ PRD generation endpoint
- ✅ Query parameter sanitization

**XSS Prevention**:

- ✅ 8+ XSS payloads tested
- ✅ HTML injection blocking
- ✅ JavaScript injection blocking
- ✅ Response header security

**Authentication Security**:

- ✅ Unauthenticated access rejection
- ✅ Expired token rejection
- ✅ Malformed token rejection

**Input Validation**:

- ✅ Invalid JSON rejection
- ✅ Missing required fields
- ✅ Field type validation
- ✅ Maximum input length
- ✅ Special character handling

**Rate Limiting**:

- ✅ Rate limit enforcement tests

**Security Headers**:

- ✅ X-Content-Type-Options
- ✅ CORS configuration

**Error Handling**:

- ✅ No sensitive data leakage
- ✅ Sanitized error messages

---

## Accessibility Tests

### A11y Tests (`a11y.spec.ts`)

**Location**: `apps/web/tests/accessibility/a11y.spec.ts`

**Running Accessibility Tests**:

```bash
cd apps/web

# Start dev server in one terminal
pnpm dev

# Run accessibility tests in another terminal
pnpm exec playwright test tests/accessibility/
```

**Framework**: Playwright + @axe-core/playwright

**Coverage** (50+ tests):

**WCAG 2.1 AA Compliance**:

- ✅ Homepage accessibility
- ✅ PRD form accessibility
- ✅ Authentication pages
- ✅ Dashboard pages

**Keyboard Navigation**:

- ✅ Skip links
- ✅ All interactive elements focusable
- ✅ Form completion with keyboard only
- ✅ Focus management

**Screen Reader Support**:

- ✅ Form validation errors announced
- ✅ ARIA live regions
- ✅ Proper ARIA attributes

**Visual Accessibility**:

- ✅ Color contrast (WCAG AA)
- ✅ Heading hierarchy
- ✅ Form labels
- ✅ Image alt text

**Responsive Accessibility**:

- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)
- ✅ Dark mode accessibility

**Standards**: WCAG 2.1 Level A & AA

---

## Dashboard Component Tests

### AgentList Tests (`AgentList.test.tsx`)

**Location**: `apps/web/__tests__/components/dashboard/AgentList.test.tsx`

**Running Tests**:

```bash
cd apps/web
pnpm test AgentList
```

**Coverage** (13 tests):

- ✅ Empty state rendering
- ✅ Agent list display with metrics
- ✅ Status color coding (active/idle)
- ✅ Success rate color coding (green/yellow/red)
- ✅ Agent avatar with initials
- ✅ Accessibility structure
- ✅ Data formatting (percentage, ID truncation)
- ✅ Error handling (empty data, malformed data)

**Test Status**: ✅ **13/13 PASSING**

### QueueStats Tests (`QueueStats.test.tsx`)

**Location**: `apps/web/__tests__/components/dashboard/QueueStats.test.tsx`

**Running Tests**:

```bash
cd apps/web
pnpm test QueueStats
```

**Coverage** (19 tests):

- ✅ All stat cards rendering (Pending, In Progress, Completed, Failed)
- ✅ Correct stat values display
- ✅ Grid layout (responsive 2-col mobile, 4-col desktop)
- ✅ Color coding (yellow/blue/green/red)
- ✅ Edge cases (zero, large, negative values)
- ✅ Responsive design classes
- ✅ Accessibility (text contrast, semantic HTML)
- ✅ Data accuracy and immutability
- ✅ Consistent styling and spacing

**Test Status**: ✅ **19/19 PASSING**

---

## Form Component Tests

### TaskSubmissionForm Tests (`TaskSubmissionForm.test.tsx`)

**Location**: `apps/web/__tests__/components/forms/TaskSubmissionForm.test.tsx`

**Running Tests**:

```bash
cd apps/web
pnpm test TaskSubmissionForm
```

**Coverage** (23 tests):

**Form Rendering**:

- ✅ All form fields (title, description, task type, priority)
- ✅ Proper labels
- ✅ Placeholders

**Form Validation**:

- ✅ Required attributes
- ✅ Minimum length validation (title: 3, description: 10)

**User Interactions**:

- ✅ Title input updates
- ✅ Description input updates
- ✅ Task type selection
- ✅ Priority slider updates

**Form Submission - Success**:

- ✅ Submit with valid data
- ✅ Form reset after submission
- ✅ Loading state during submission

**Form Submission - Error**:

- ✅ Error message display
- ✅ Button re-enabled after error
- ✅ Network error handling

**Accessibility**:

- ✅ Proper form structure
- ✅ Labels associated with inputs
- ✅ Accessible submit button

**Default Values**:

- ✅ Task type defaults to "feature"
- ✅ Priority defaults to 5

**Task Type Options**:

- ✅ All options available (Feature, Bug Fix, Refactor, Documentation, Tests)

**Priority Slider**:

- ✅ Range 1-10
- ✅ Label updates with slider

**Test Status**: ✅ **23/23 PASSING**

---

## Database Integration Tests

### Supabase RLS Tests (`test_supabase_rls.py`)

**Location**: `apps/backend/tests/integration/test_supabase_rls.py`

**Running Database Tests**:

```bash
cd apps/backend

# Requires test Supabase instance
export TEST_SUPABASE_URL="your-test-url"
export TEST_SUPABASE_SERVICE_KEY="your-test-key"

uv run pytest tests/integration/test_supabase_rls.py -v
```

**Coverage** (50+ tests):

**Connection Tests**:

- ✅ Supabase connection success
- ✅ Required tables exist (prds, agent_runs, agent_memory)

**PRD Table RLS**:

- ✅ User can create own PRD
- ✅ User cannot read other users' PRDs
- ✅ User can update own PRD
- ✅ User cannot update other users' PRDs
- ✅ User can delete own PRD

**Agent Runs RLS**:

- ✅ User can view own agent runs
- ✅ Agent run creation

**Data Integrity**:

- ✅ Required fields enforced
- ✅ PRD status enum validation
- ✅ JSON field validation

**Performance**:

- ✅ ID index performance
- ✅ User ID index performance

**Concurrency**:

- ✅ Concurrent inserts
- ✅ Optimistic locking

**Audit Trail**:

- ✅ created_at timestamp
- ✅ updated_at timestamp

**Error Handling**:

- ✅ Invalid table name
- ✅ Invalid column name
- ✅ Null value handling

---

## E2E Tests

### Running E2E Tests

```bash
# Install Playwright (first time)
cd apps/web
pnpm exec playwright install

# Run all E2E tests
pnpm test:e2e

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Run specific test
pnpm exec playwright test prd-generation

# Debug mode
pnpm exec playwright test --debug

# Generate test report
pnpm exec playwright show-report
```

### E2E Test Coverage

**PRD Generation Flow**:

- ✅ Display PRD generator form
- ✅ Validate requirements length
- ✅ Show character count
- ✅ Submit form with valid data
- ✅ Display progress during generation
- ✅ Handle errors gracefully
- ✅ Disable form inputs during generation
- ✅ Show "How It Works" section

**PRD Viewer** (mocked):

- ✅ Display PRD result with tabs
- ✅ Navigate between tabs
- ✅ Export button
- ✅ Back button to generator

**Integration Tests**:

- ✅ Complete workflow from form to result

**Total**: 13 E2E test cases

---

## Contract Testing (Pact) - Phase 2

Contract testing ensures that the frontend (consumer) and backend (provider) API contracts are synchronized and that breaking changes are detected automatically.

### Running Contract Tests

```bash
# Frontend Consumer Tests (generate pact files)
cd apps/web
pnpm run test:contracts

# Backend Provider Tests (verify contracts)
cd apps/backend
uv run pytest tests/contracts/test_prd_provider.py -v

# Both in sequence
pnpm run test:contracts && cd apps/backend && uv run pytest tests/contracts/ -v
```

### Contract Test Coverage

**Consumer Tests** (`apps/web/tests/contracts/prd-consumer.pact.test.ts`):

- ✅ POST /api/prd/generate - Valid input
- ✅ POST /api/prd/generate - Validation errors (422)
- ✅ GET /api/prd/status/{run_id} - In progress status
- ✅ GET /api/prd/status/{run_id} - Not found (404)
- ✅ GET /api/prd/result/{prd_id} - Completed PRD
- ✅ GET /api/prd/documents/{prd_id} - Document list
- ✅ GET /health - Health check

**Provider Tests** (`apps/backend/tests/contracts/test_prd_provider.py`):

- ✅ Verifies all consumer contracts
- ✅ Provider state setup for each scenario
- ✅ Contract breaking change detection

**Pact Broker Integration**:

- Pact files generated: `apps/web/pacts/web-backend-api.json`
- Can be published to Pact Broker or Pactflow
- Automated in CI/CD for main branch

**Benefits**:

- Prevents breaking API changes
- Documents API contracts
- Enables independent team deployments
- Catches integration issues early

---

## Visual Regression Testing (Percy) - Phase 2

Visual regression testing captures screenshots of UI components and pages to detect unintended visual changes automatically.

### Running Visual Tests

```bash
# Set Percy token (sign up at https://percy.io)
export PERCY_TOKEN=your_percy_token_here

# Run visual tests
cd apps/web
pnpm run test:visual

# Visual tests run automatically in CI on PRs
```

### Visual Test Coverage

**Components** (`apps/web/tests/visual/components.visual.spec.ts`):

- ✅ Agent List - Default, Active, Empty states
- ✅ Queue Stats - Normal load, High load, Color coding
- ✅ Task Submission Form - Default, Filled, Validation, Loading states
- ✅ PRD Form - Initial, Filled states
- ✅ PRD Progress - In progress state
- ✅ PRD Result - Completed view

**Responsive Design**:

- ✅ Homepage - Mobile (375px), Tablet (768px), Desktop (1920px)
- ✅ Dashboard - Responsive grid across breakpoints

**Dark Mode**:

- ✅ Dashboard - Dark mode
- ✅ PRD Form - Dark mode
- ✅ Component contrast validation

**Accessibility Features**:

- ✅ Focus states
- ✅ High contrast mode
- ✅ Reduced motion

**Animation States**:

- ✅ Loading spinners
- ✅ Progress bars
- ✅ Toast notifications

**Configuration**:

- Percy config: `.percy.yml`
- Widths: 375px, 768px, 1280px
- Threshold: 1% difference allowed
- Browser: Chromium

**Total**: 50+ visual snapshots across 6 categories

---

## Performance Testing (Lighthouse CI) - Phase 2

Lighthouse CI automatically audits web app performance, accessibility, SEO, and best practices on every build.

### Running Performance Tests

```bash
# Run Lighthouse CI
cd apps/web
pnpm run test:lighthouse

# Performance tests run automatically in CI
```

### Performance Budgets

**Core Web Vitals**:

- ✅ First Contentful Paint (FCP): < 2000ms
- ✅ Largest Contentful Paint (LCP): < 2500ms
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ Total Blocking Time (TBT): < 300ms
- ✅ Speed Index: < 3000ms

**Category Scores** (Minimum 90%):

- ✅ Performance: 90+
- ✅ Accessibility: 90+
- ✅ Best Practices: 90+
- ✅ SEO: 90+

**Audited Pages**:

- ✅ Homepage (/)
- ✅ Dashboard (/dashboard)
- ✅ PRD Generator (/prd/generate)

**Additional Checks**:

- ✅ Uses HTTPS
- ✅ No vulnerable libraries
- ✅ Text compression enabled
- ✅ Unminified JavaScript/CSS detection
- ✅ Total page weight < 1MB
- ✅ Color contrast (accessibility)
- ✅ Image optimization
- ✅ Font display strategy
- ✅ Meta tags (SEO)

**Configuration**:

- Config file: `lighthouserc.js`
- Runs: 3 per URL (averaged)
- Device: Mobile emulation
- Throttling: Slow 4G

**CI Integration**:

- Results uploaded to temporary public storage (30 days)
- PR comments with performance scores
- Fails build if budgets exceeded

---

## Load Testing (k6) - Phase 3

Load testing validates system performance under various load conditions using k6, a modern developer-centric load testing tool.

### Running Load Tests

```bash
# Install k6 (one-time setup)
# Windows: winget install k6 --source winget
# macOS: brew install k6
# Linux: See tests/performance/README.md

# Run baseline test (50 users, 3 min)
k6 run tests/performance/baseline-test.js

# Run load test (100 users, 5 min)
k6 run tests/performance/load-test.js

# Run stress test (200 users, 10 min)
k6 run tests/performance/stress-test.js

# Run spike test (0→500→0 users)
k6 run tests/performance/spike-test.js

# Save results to JSON
k6 run tests/performance/load-test.js --out json=results.json
```

### Load Test Scenarios

**Baseline Test** (`baseline-test.js`):

- ✅ 50 concurrent users for 3 minutes
- ✅ Establishes performance baseline
- ✅ Thresholds: p95 < 300ms, p99 < 500ms, errors < 0.5%

**Load Test** (`load-test.js`):

- ✅ Ramp to 100 concurrent users over 5 minutes
- ✅ Tests normal expected load
- ✅ Thresholds: p95 < 500ms, p99 < 1000ms, errors < 1%
- ✅ Tests: Health check, PRD generation, status check, homepage

**Stress Test** (`stress-test.js`):

- ✅ Gradually increase to 200 users over 10 minutes
- ✅ Finds system breaking point
- ✅ Thresholds: p95 < 1000ms, p99 < 2000ms, errors < 5%
- ✅ Monitors: Timeouts, error rates, response degradation

**Spike Test** (`spike-test.js`):

- ✅ Sudden spike: 0 → 500 users in 1 minute
- ✅ Tests auto-scaling and recovery
- ✅ Thresholds: p95 < 3000ms, p99 < 5000ms, errors < 10%
- ✅ Measures recovery time after spike

### Performance Metrics

**Key Metrics Tracked**:

- `http_req_duration`: Response time (avg, p95, p99, max)
- `http_req_failed`: Failed request rate
- `vus`: Virtual users (concurrent load)
- `iterations`: Total requests completed
- `data_received` / `data_sent`: Network throughput

**Custom Metrics**:

- `errors`: Custom error rate tracking
- `success`: Success rate tracking
- `prd_generation_duration`: PRD-specific performance
- `timeouts`: Request timeout count

**Performance Thresholds**:

- Baseline: p95 < 300ms, p99 < 500ms
- Normal Load: p95 < 500ms, p99 < 1000ms
- Stress: p95 < 1000ms, p99 < 2000ms
- Spike: p95 < 3000ms, p99 < 5000ms

### CI/CD Integration

Load tests run automatically:

- ✅ Weekly (Sunday 00:00 UTC) - Baseline, Load, Stress tests
- ✅ Manual trigger - All tests including Spike test
- ✅ Results uploaded as artifacts (30 days retention)
- ⚠️ Not on every PR (resource intensive)

---

## Penetration Testing (OWASP ZAP) - Phase 3

OWASP ZAP (Zed Attack Proxy) performs automated security testing to identify vulnerabilities in web applications.

### Running Security Scans

```bash
# Prerequisites: Docker must be installed

# Baseline Scan (Passive - Safe for production)
docker run -v $(pwd):/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t http://host.docker.internal:3000 \
  -c .zap/baseline-scan.yaml \
  -r reports/zap-baseline.html

# Full Scan (Active - Test/Staging ONLY)
docker run -v $(pwd):/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py \
  -t http://host.docker.internal:3000 \
  -c .zap/full-scan.yaml \
  -r reports/zap-full-scan.html

# View reports
open reports/zap-baseline.html
```

### Scan Types

**Baseline Scan** (Passive):

- ✅ Analyzes HTTP traffic without attacking
- ✅ Safe to run on production
- ✅ Fast execution (5-10 minutes)
- ✅ Identifies: Missing headers, insecure cookies, info disclosure
- ✅ Spider: Crawls application to discover endpoints
- ✅ Automated in CI weekly

**Full Scan** (Active):

- ⚠️ Actively attacks the application
- ⚠️ Test/Staging environments ONLY
- ✅ Comprehensive testing (30-90 minutes)
- ✅ Identifies: SQL injection, XSS, CSRF, path traversal, XXE
- ✅ Tests OWASP Top 10 vulnerabilities
- ✅ Automated in CI weekly on staging

### Vulnerability Coverage

**High Severity** (Build-failing):

- SQL Injection (40018)
- Cross-Site Scripting / XSS (40012, 40014, 40016, 40017)
- Path Traversal (6)
- Remote File Inclusion (7)
- XXE - XML External Entity (90019)
- Command Injection (90020)
- LDAP Injection (40015)
- Server Side Template Injection (90035)
- Insecure Deserialization (90034)

**Medium Severity** (Warnings):

- CSRF - Cross-Site Request Forgery (10202)
- Cookie Security (10010, 10011, 10054)
- Authentication Issues (10101, 10102)
- Session Management (10112)
- Security Headers (10020, 10021, 10023, etc.)

**Informational**:

- Private IP Disclosure (2)
- Version Disclosure (10068)
- HTML Comments (10015)

### Configuration Files

`.zap/rules.tsv`:

- Defines vulnerability severity levels
- FAIL = Build fails if found
- WARN = Report as warning
- INFO = Informational only
- IGNORE = Skip check

`.zap/baseline-scan.yaml`:

- Passive scan configuration
- Spider settings
- Report generation

`.zap/full-scan.yaml`:

- Active scan configuration
- Attack policies
- Scan duration limits

### Security Reports

**Report Formats**:

- HTML: Visual report with details
- JSON: Machine-readable results
- Markdown: Documentation format
- XML: Integration format

**Severity Levels**:

- 🔴 **High**: Critical vulnerabilities (fix immediately)
- 🟠 **Medium**: Serious issues (fix within 30 days)
- 🟡 **Low**: Minor issues (fix within 90 days)
- 🔵 **Informational**: Best practices

### CI/CD Integration

ZAP scans run automatically:

- ✅ Baseline scan: Weekly (Sunday 00:00 UTC)
- ✅ Full scan: Weekly (Sunday 02:00 UTC) on staging
- ✅ Manual trigger: Workflow dispatch
- ✅ Reports uploaded as artifacts (30 days)
- ✅ Build fails on High severity findings

---

## Test Configuration

### Backend Configuration (`pytest.ini`)

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    -v
    --strict-markers
    --cov=src
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=80
markers =
    asyncio: mark test as async
    integration: mark test as integration test
    unit: mark test as unit test
```

### Frontend Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
};
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Continuous Integration

### GitHub Actions Workflows

#### Main CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh
      - name: Install dependencies
        run: cd apps/backend && uv sync
      - name: Run tests
        run: cd apps/backend && uv run pytest --cov --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: cd apps/web && pnpm test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      - name: Run E2E tests
        run: cd apps/web && pnpm test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

---

#### Security Scanning Workflow (`.github/workflows/security.yml`)

**Automated Security Scans**:

- ✅ Snyk Frontend Scan (npm vulnerabilities)
- ✅ Snyk Backend Scan (Python vulnerabilities)
- ✅ Dependency Review (GitHub native)
- ✅ NPM Audit
- ✅ Trivy Container Scan
- ✅ Weekly scheduled scans (Sundays 00:00 UTC)

**Trigger Events**:

- Push to main
- Pull requests
- Weekly schedule
- Manual dispatch

---

## Test Coverage Summary

| Category                        | Coverage | Test Cases | Status                  |
| ------------------------------- | -------- | ---------- | ----------------------- |
| **Backend Unit**                | 87%+     | 22         | ✅ Complete             |
| **Backend Security**            | 100%     | 80+        | ✅ Complete             |
| **Backend Database**            | 100% RLS | 50+        | ✅ Complete             |
| **Frontend Unit**               | 77%+     | 27         | ✅ Complete             |
| **Frontend Security (XSS)**     | 100%     | 17         | ✅ Complete             |
| **Frontend Components**         | 85%+     | 55         | ✅ Complete             |
| **Accessibility (WCAG 2.1 AA)** | 100%     | 50+        | ✅ Complete             |
| **E2E**                         | Complete | 13         | ✅ Complete             |
| **Integration**                 | Complete | Included   | ✅ Complete             |
| **Total**                       | **85%+** | **250+**   | ✅ **Production Ready** |

### Test Distribution

- Backend Tests: 152+ cases (unit, security, database)
- Frontend Tests: 99+ cases (unit, security, components)
- E2E Tests: 13 cases
- Accessibility Tests: 50+ cases

---

## Writing New Tests

### Backend Test Template

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_my_feature():
    """Test description."""
    # Arrange
    mock_client = AsyncMock()

    # Act
    result = await my_function(mock_client)

    # Assert
    assert result["success"] is True
    mock_client.some_method.assert_called_once()
```

### Frontend Test Template

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should handle click", () => {
    const mockOnClick = jest.fn();
    render(<MyComponent onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/my-page');

  await page.getByLabel('Input').fill('Value');
  await page.getByRole('button').click();

  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

## Best Practices

### General

- ✅ Write tests before fixing bugs (TDD)
- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ One assertion per test (when possible)
- ✅ Keep tests independent

### Backend

- ✅ Mock external services (Anthropic API, Supabase)
- ✅ Use fixtures for common test data
- ✅ Test both success and failure paths
- ✅ Test edge cases (empty strings, null, etc.)

### Frontend

- ✅ Test user interactions, not state
- ✅ Use `screen` queries (not container)
- ✅ Prefer `getByRole` over `getByTestId`
- ✅ Test accessibility

### E2E

- ✅ Test critical user journeys
- ✅ Use page object pattern for complex flows
- ✅ Mock external APIs when appropriate
- ✅ Keep tests fast (< 30s per test)

---

## Troubleshooting

### Backend Tests Failing

```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
cd apps/backend
uv sync

# Clear pytest cache
rm -rf .pytest_cache __pycache__

# Run single test to isolate issue
uv run pytest tests/test_prd_agents.py::TestPRDAnalysisAgent::test_execute_success -v
```

### Frontend Tests Failing

```bash
# Clear Jest cache
pnpm test --clearCache

# Update snapshots
pnpm test -u

# Check Node version
node --version  # Should be 20+

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### E2E Tests Failing

```bash
# Reinstall Playwright browsers
pnpm exec playwright install --with-deps

# Run in headed mode to see what's happening
pnpm exec playwright test --headed

# Check if dev server is running
curl http://localhost:3000
```

---

## Quick Reference - Running All Tests

### Frontend Tests (All)

```bash
cd apps/web

# Unit tests (includes security, components)
pnpm test

# Specific test suites
pnpm test xss-prevention      # Security tests
pnpm test AgentList           # Component tests
pnpm test TaskSubmissionForm  # Form tests
pnpm test QueueStats          # Dashboard tests

# E2E tests (requires dev server)
pnpm dev                      # Terminal 1
pnpm test:e2e                 # Terminal 2

# Accessibility tests (requires dev server)
pnpm dev                                    # Terminal 1
pnpm exec playwright test tests/accessibility/  # Terminal 2

# Coverage report
pnpm test:coverage
```

### Backend Tests (All)

```bash
cd apps/backend

# All tests
uv run pytest -v

# Specific test suites
uv run pytest tests/test_prd_agents.py              # Unit tests
uv run pytest tests/test_prd_routes.py              # API tests
uv run pytest tests/security/test_api_security.py   # Security tests
uv run pytest tests/integration/test_supabase_rls.py  # Database tests

# With coverage
uv run pytest --cov=src --cov-report=html
```

### CI/CD

```bash
# All tests run automatically on:
# - Push to main
# - Pull requests
# - Weekly security scans (Sundays)

# View CI results:
# - GitHub Actions tab in repository
# - PR checks
# - Coverage reports via Codecov
```

---

## Phase 1 Implementation Status

**Phase 1: Critical Gaps** - ✅ **COMPLETE**

✅ **Completed Tasks**:

1. Accessibility automation (axe-core + Playwright)
2. Security scanning automation (Snyk, NPM Audit, Trivy)
3. API security test suite (80+ tests)
4. XSS prevention tests (17 tests)
5. Component test coverage expansion (55 tests)
6. Database integration tests (50+ tests)
7. CI/CD integration for all new tests

**Added**:

- 11 new test files
- 250+ total test cases
- 5 security scanning workflows
- Complete accessibility coverage

**Phase 2 Completed** (2026-01-06):

1. Contract testing with Pact (frontend + backend)
2. Visual regression testing with Percy (50+ snapshots)
3. Performance testing with Lighthouse CI (Core Web Vitals)

**Added Phase 2**:

- 3 new test frameworks
- 50+ additional test cases
- Advanced CI/CD workflow
- Performance budgets and monitoring

**Phase 3 Completed** (2026-01-06):

1. Load testing with k6 (4 scenarios: baseline, load, stress, spike)
2. Penetration testing with OWASP ZAP (baseline + full scans)
3. Performance & security CI/CD automation

**Added Phase 3**:

- k6 load testing framework (4 test scenarios)
- OWASP ZAP security scanning (baseline + full)
- Automated weekly performance & security testing
- Comprehensive vulnerability coverage (OWASP Top 10)

**Next Phases** (Optional):

- Phase 4: Documentation & Metrics Dashboard
- Performance monitoring dashboard (Grafana + InfluxDB)
- Test metrics and trends visualization

---

## Best Practices (Updated)

### Security Testing

- ✅ Test all OWASP Top 10 vulnerabilities
- ✅ Use realistic attack payloads
- ✅ Test both frontend and backend security
- ✅ Run security scans on schedule (weekly minimum)
- ✅ Never skip security tests in CI

### Accessibility Testing

- ✅ Test with automated tools (axe-core)
- ✅ Test keyboard navigation manually
- ✅ Test with actual screen readers periodically
- ✅ Maintain WCAG 2.1 AA compliance minimum
- ✅ Include accessibility in every PR

### Component Testing

- ✅ Test user interactions, not implementation
- ✅ Test loading and error states
- ✅ Test edge cases (empty, null, malformed data)
- ✅ Test responsive behavior
- ✅ Include accessibility checks

### Database Testing

- ✅ Test RLS policies thoroughly
- ✅ Use test database, never production
- ✅ Test data integrity constraints
- ✅ Test concurrent access scenarios
- ✅ Clean up test data after each test

### Contract Testing (Phase 2)

- ✅ Run consumer tests before provider tests
- ✅ Keep contracts synchronized between teams
- ✅ Use Pact Broker for contract sharing
- ✅ Version contracts properly
- ✅ Never break existing contracts without migration path

### Visual Regression (Phase 2)

- ✅ Review all visual changes before approving
- ✅ Hide dynamic content (timestamps, IDs)
- ✅ Test across multiple viewports
- ✅ Include dark mode in visual tests
- ✅ Keep baseline snapshots up to date

### Performance Testing (Phase 2)

- ✅ Run Lighthouse on every PR
- ✅ Monitor Core Web Vitals trends
- ✅ Set realistic performance budgets
- ✅ Test on mobile and slow networks
- ✅ Fix performance regressions immediately

### Load Testing (Phase 3)

- ✅ Run baseline test before making changes
- ✅ Use production builds, not development mode
- ✅ Test on dedicated infrastructure (avoid local dev)
- ✅ Monitor server resources during tests (CPU, memory, disk)
- ✅ Compare results over time to identify trends
- ✅ Don't run spike tests on production
- ✅ Fix performance degradations before they reach production

### Penetration Testing (Phase 3)

- ✅ Run baseline scans weekly minimum
- ✅ Full active scans on staging only, never production
- ✅ Review all High severity findings immediately
- ✅ Validate findings aren't false positives
- ✅ Fix vulnerabilities based on severity (High: 7 days, Medium: 30 days)
- ✅ Retest after fixes to confirm remediation
- ✅ Keep ZAP and security rules up to date

---

**Questions?** See individual test files for implementation details.

**Last Updated**: 2026-01-06 (Phase 3 Complete - Load Testing & Penetration Testing)
