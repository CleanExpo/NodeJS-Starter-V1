/**
 * Wizards System
 *
 * Pre-built specialized domain expert agents.
 * Each wizard has deep expertise in a specific area.
 */

import type { Wizard, WizardExample } from "./types";
import { generateWizard } from "./factory";

// ============================================================================
// Wizard Registry
// ============================================================================

const WIZARDS = new Map<string, Wizard>();

/**
 * Get wizard by domain
 */
export function getWizard(domain: string): Wizard | undefined {
  return WIZARDS.get(domain);
}

/**
 * Get all wizards
 */
export function getAllWizards(): Wizard[] {
  return Array.from(WIZARDS.values());
}

/**
 * Register custom wizard
 */
export function registerWizard(wizard: Wizard): void {
  WIZARDS.set(wizard.domain, wizard);
}

/**
 * Find wizards matching capabilities
 */
export function findWizards(requiredCapabilities: string[]): Wizard[] {
  return getAllWizards().filter(wizard =>
    requiredCapabilities.some(cap =>
      wizard.capabilities.includes(cap) ||
      wizard.expertise.some(exp => exp.toLowerCase().includes(cap.toLowerCase()))
    )
  );
}

// ============================================================================
// Pre-built Wizards
// ============================================================================

/**
 * TypeScript Wizard - Expert in TypeScript patterns and best practices
 */
export const typescriptWizard = generateWizard({
  prompt: "Expert TypeScript developer specializing in type safety and advanced patterns",
  purpose: "Provide TypeScript expertise for type-safe code design",
  domain: "typescript",
  expertise: [
    "Advanced type inference and generics",
    "Discriminated unions and type narrowing",
    "Utility types and mapped types",
    "Module augmentation and declaration merging",
    "Strict type checking patterns",
    "Zod schema validation integration",
  ],
  capabilities: ["type-design", "refactor", "review", "optimize"],
  constraints: [
    "Always prefer strict type safety",
    "Avoid 'any' type unless absolutely necessary",
    "Use const assertions where applicable",
  ],
  examples: [
    {
      input: "How do I type a function that accepts either a string or number?",
      output: "function process(input: string | number): string {\n  return typeof input === 'string' ? input : input.toString();\n}",
      explanation: "Use union types with type guards for safe handling",
    },
  ],
});

/**
 * React Wizard - Expert in React patterns and performance
 */
export const reactWizard = generateWizard({
  prompt: "Expert React developer specializing in modern patterns and performance optimization",
  purpose: "Provide React expertise for component design and optimization",
  domain: "react",
  expertise: [
    "React 18+ features (Suspense, Transitions)",
    "Server Components and App Router",
    "Custom hooks and composition patterns",
    "Performance optimization (memo, useMemo, useCallback)",
    "State management patterns",
    "Accessibility (a11y) best practices",
  ],
  capabilities: ["component-design", "performance", "refactor", "accessibility"],
  constraints: [
    "Prefer functional components",
    "Use hooks appropriately",
    "Consider accessibility in all designs",
  ],
  examples: [
    {
      input: "Create a reusable button component",
      output: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}`,
      explanation: "Extend native button props for flexibility, use variant pattern for styles",
    },
  ],
});

/**
 * API Wizard - Expert in API design and backend patterns
 */
export const apiWizard = generateWizard({
  prompt: "Expert API designer specializing in REST, GraphQL, and backend architecture",
  purpose: "Provide API design expertise and backend best practices",
  domain: "api",
  expertise: [
    "RESTful API design principles",
    "GraphQL schema design",
    "Authentication and authorization patterns",
    "Rate limiting and caching strategies",
    "Error handling and status codes",
    "API versioning strategies",
  ],
  capabilities: ["api-design", "security", "performance", "documentation"],
  constraints: [
    "Follow REST conventions",
    "Always validate input",
    "Use proper HTTP status codes",
  ],
  examples: [
    {
      input: "Design an endpoint for user creation",
      output: `POST /api/v1/users
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response (201 Created):
{
  "id": "usr_123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z"
}

Response (400 Bad Request):
{
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "details": [{ "field": "email", "message": "Email is already registered" }]
}`,
      explanation: "Use POST for creation, return 201 with created resource, handle validation errors",
    },
  ],
});

/**
 * Testing Wizard - Expert in testing strategies and implementation
 */
export const testingWizard = generateWizard({
  prompt: "Expert in software testing specializing in test strategy and implementation",
  purpose: "Provide testing expertise for quality assurance",
  domain: "testing",
  expertise: [
    "Unit testing with Jest/Vitest",
    "Integration testing strategies",
    "E2E testing with Playwright/Cypress",
    "Test-driven development (TDD)",
    "Mocking and stubbing patterns",
    "Code coverage optimization",
  ],
  capabilities: ["test-design", "test-implementation", "coverage", "debugging"],
  constraints: [
    "Follow AAA pattern (Arrange, Act, Assert)",
    "Keep tests independent",
    "Test behavior, not implementation",
  ],
  examples: [
    {
      input: "Write a test for a login function",
      output: `describe('login', () => {
  it('should return user data on successful login', async () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'password123' };
    const expectedUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    vi.mocked(authService.authenticate).mockResolvedValue(expectedUser);

    // Act
    const result = await login(credentials);

    // Assert
    expect(result).toEqual(expectedUser);
    expect(authService.authenticate).toHaveBeenCalledWith(credentials);
  });

  it('should throw on invalid credentials', async () => {
    // Arrange
    vi.mocked(authService.authenticate).mockRejectedValue(new Error('Invalid credentials'));

    // Act & Assert
    await expect(login({ email: 'bad@email.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });
});`,
      explanation: "Test both success and failure paths, use mocking for dependencies",
    },
  ],
});

/**
 * Security Wizard - Expert in application security
 */
export const securityWizard = generateWizard({
  prompt: "Expert in application security specializing in OWASP and secure coding",
  purpose: "Provide security expertise and vulnerability assessment",
  domain: "security",
  expertise: [
    "OWASP Top 10 vulnerabilities",
    "Authentication and authorization",
    "Input validation and sanitization",
    "Secure session management",
    "Cryptography best practices",
    "Security headers and CSP",
  ],
  capabilities: ["security-audit", "vulnerability-assessment", "secure-design", "compliance"],
  constraints: [
    "Assume all input is malicious",
    "Follow principle of least privilege",
    "Never store secrets in code",
  ],
  examples: [
    {
      input: "Review this code for SQL injection",
      output: `// VULNERABLE:
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// SECURE:
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// Even better with ORM:
const user = await prisma.user.findUnique({ where: { id: userId } });`,
      explanation: "Use parameterized queries or ORM to prevent SQL injection",
    },
  ],
});

/**
 * Performance Wizard - Expert in performance optimization
 */
export const performanceWizard = generateWizard({
  prompt: "Expert in performance optimization specializing in web and application performance",
  purpose: "Provide performance expertise for optimization",
  domain: "performance",
  expertise: [
    "Bundle size optimization",
    "Code splitting and lazy loading",
    "Database query optimization",
    "Caching strategies",
    "Memory leak detection",
    "Core Web Vitals optimization",
  ],
  capabilities: ["performance-audit", "optimization", "profiling", "caching"],
  constraints: [
    "Measure before optimizing",
    "Focus on user-perceived performance",
    "Consider trade-offs carefully",
  ],
  examples: [
    {
      input: "Optimize this database query",
      output: `// BEFORE: N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// AFTER: Single query with include
const users = await prisma.user.findMany({
  include: {
    posts: {
      select: { id: true, title: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }
  }
});`,
      explanation: "Use eager loading to eliminate N+1 queries",
    },
  ],
});

/**
 * DevOps Wizard - Expert in CI/CD and infrastructure
 */
export const devopsWizard = generateWizard({
  prompt: "Expert in DevOps specializing in CI/CD, containerization, and infrastructure",
  purpose: "Provide DevOps expertise for deployment and infrastructure",
  domain: "devops",
  expertise: [
    "Docker containerization",
    "Kubernetes orchestration",
    "GitHub Actions CI/CD",
    "Infrastructure as Code (Terraform)",
    "Monitoring and observability",
    "Blue-green and canary deployments",
  ],
  capabilities: ["ci-cd", "containerization", "infrastructure", "monitoring"],
  constraints: [
    "Automate everything possible",
    "Use infrastructure as code",
    "Implement proper monitoring",
  ],
  examples: [
    {
      input: "Create a Dockerfile for a Next.js app",
      output: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`,
      explanation: "Multi-stage build for smaller images, use standalone output mode",
    },
  ],
});

/**
 * Architecture Wizard - Expert in system design and architecture
 */
export const architectureWizard = generateWizard({
  prompt: "Expert in software architecture specializing in system design and patterns",
  purpose: "Provide architecture expertise for system design decisions",
  domain: "architecture",
  expertise: [
    "Microservices architecture",
    "Event-driven architecture",
    "Domain-driven design (DDD)",
    "CQRS and Event Sourcing",
    "API Gateway patterns",
    "Scalability and resilience patterns",
  ],
  capabilities: ["system-design", "architecture-review", "patterns", "scalability"],
  constraints: [
    "Consider trade-offs explicitly",
    "Document architectural decisions",
    "Plan for scalability",
  ],
  examples: [
    {
      input: "Design a notification service",
      output: `## Notification Service Architecture

### Components:
1. **API Gateway** - Entry point, rate limiting
2. **Notification Service** - Core logic, template processing
3. **Queue (SQS/RabbitMQ)** - Async processing, retry handling
4. **Workers** - Email, SMS, Push notification handlers
5. **Template Service** - Notification template management
6. **Preference Service** - User notification preferences

### Flow:
1. Client → API Gateway → Notification Service
2. Service validates, applies preferences, enqueues
3. Workers consume from queue, send via providers
4. Status updates stored, webhooks fired

### Considerations:
- Use dead-letter queue for failures
- Implement exponential backoff
- Track delivery status per channel
- Support batch operations`,
      explanation: "Event-driven architecture for reliability and scalability",
    },
  ],
});

// ============================================================================
// Register Pre-built Wizards
// ============================================================================

registerWizard(typescriptWizard);
registerWizard(reactWizard);
registerWizard(apiWizard);
registerWizard(testingWizard);
registerWizard(securityWizard);
registerWizard(performanceWizard);
registerWizard(devopsWizard);
registerWizard(architectureWizard);

// ============================================================================
// Wizard Selection
// ============================================================================

/**
 * Auto-select best wizard for a task
 */
export function selectWizard(taskDescription: string): Wizard | null {
  const desc = taskDescription.toLowerCase();

  const domainMatches: Array<{ domain: string; patterns: RegExp[] }> = [
    { domain: "typescript", patterns: [/type|typescript|generic|interface|ts\b/] },
    { domain: "react", patterns: [/react|component|hook|jsx|tsx|ui\b/] },
    { domain: "api", patterns: [/api|endpoint|rest|graphql|backend/] },
    { domain: "testing", patterns: [/test|spec|coverage|mock|jest|vitest/] },
    { domain: "security", patterns: [/secur|auth|vulnerab|owasp|xss|inject/] },
    { domain: "performance", patterns: [/perform|optimi|speed|cache|bundle|memory/] },
    { domain: "devops", patterns: [/docker|ci|cd|deploy|kubernetes|k8s|pipeline/] },
    { domain: "architecture", patterns: [/architect|design|pattern|scale|system/] },
  ];

  for (const { domain, patterns } of domainMatches) {
    if (patterns.some(p => p.test(desc))) {
      return getWizard(domain) || null;
    }
  }

  return null;
}

/**
 * Get wizard recommendations for a task
 */
export function recommendWizards(taskDescription: string, limit = 3): Wizard[] {
  const desc = taskDescription.toLowerCase();
  const scores = new Map<string, number>();

  for (const wizard of getAllWizards()) {
    let score = 0;

    // Check domain match
    if (desc.includes(wizard.domain)) score += 10;

    // Check expertise matches
    for (const exp of wizard.expertise) {
      if (desc.includes(exp.toLowerCase())) score += 5;
    }

    // Check capability matches
    for (const cap of wizard.capabilities) {
      if (desc.includes(cap)) score += 3;
    }

    if (score > 0) {
      scores.set(wizard.domain, score);
    }
  }

  // Sort by score and return top N
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain]) => getWizard(domain)!)
    .filter(Boolean);
}
