# Contributing to NodeJS-Starter-V1

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Fork-and-PR Workflow

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally.
3. **Create a branch** from `main` for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit them (see commit conventions below).
5. **Push** your branch to your fork.
6. **Open a Pull Request** against the `main` branch of this repository.

## Commit Conventions

We use conventional commits. Every commit message must follow this format:

```
<type>(<scope>): <description>
```

### Types

| Type    | Usage                                      |
| ------- | ------------------------------------------ |
| `feat`  | A new feature                              |
| `fix`   | A bug fix                                  |
| `docs`  | Documentation-only changes                 |
| `chore` | Maintenance tasks (deps, configs, tooling) |

### Examples

```
feat(web): add dark mode toggle
fix(backend): resolve agent timeout on large payloads
docs(readme): update installation instructions
chore(deps): bump Next.js to 16.1
```

## Running Tests

### Frontend (Next.js)

```bash
pnpm test
```

### Backend (FastAPI)

```bash
cd apps/backend && uv run pytest
```

## Code Style

- **ESLint** and **Prettier** are configured and enforced by pre-commit hooks.
- Run `pnpm run lint` to check for linting issues manually.
- Run `pnpm run type-check` to verify TypeScript types.
- Code style is auto-formatted on commit — no manual formatting required.

## Pull Request Requirements

Before a PR can be merged, it must satisfy the following:

1. **Type-check passes** — `pnpm run type-check`
2. **Lint passes** — `pnpm run lint`
3. **Tests pass** — `pnpm test` (frontend) and `cd apps/backend && uv run pytest` (backend)
4. **Description** — Include a clear summary of what the PR changes and why.
5. **Scope** — Keep PRs focused. One feature or fix per PR where possible.

## Questions?

If you have questions about contributing, feel free to open a discussion or reach out via the issue tracker.
