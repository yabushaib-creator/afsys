# Contributing to AFSYS

Thank you for contributing. Please read this guide before opening a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Commit Standards](#commit-standards)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

All contributors are expected to be professional, respectful, and constructive. Harassment, discrimination, or personal attacks of any kind are not tolerated.

---

## Getting Started

1. **Fork** the repository (external contributors) or create a branch (team members).
2. Clone your fork locally.
3. Follow the setup steps in [docs/dev/DEVELOPMENT.md](docs/dev/DEVELOPMENT.md).
4. Create a feature or bugfix branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

1. Write your code following [docs/dev/CODING_STANDARDS.md](docs/dev/CODING_STANDARDS.md).
2. Add or update tests to cover your change.
3. Run the full test suite and confirm it passes.
4. Run the linter and resolve any issues.
5. Update documentation if you changed behavior, APIs, or configuration.
6. Push your branch and open a Pull Request.

---

## Pull Request Process

1. Fill out the PR template completely.
2. Link the PR to the relevant issue(s): `Closes #123`.
3. Ensure the CI pipeline passes.
4. Request at least **one** reviewer (two for changes to core logic or security-sensitive code).
5. Address all review comments before merging.
6. Squash or rebase commits if the history is messy.
7. The PR author merges after approval (not the reviewer).

**Do not force-push to shared branches.**

---

## Commit Standards

Use Conventional Commits format:

```
<type>(<scope>): <short imperative summary>

[optional body — explain WHY, not WHAT]

[optional footer: Closes #123, Breaking change: ...]
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructure (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build, dependencies, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration |

---

## Reporting Bugs

Open a GitHub Issue using the **Bug Report** template. Include:
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, runtime version, config)
- Relevant logs or screenshots

---

## Requesting Features

Open a GitHub Issue using the **Feature Request** template. Include:
- Problem statement / user need
- Proposed solution
- Alternatives considered
- Any relevant mockups or references
