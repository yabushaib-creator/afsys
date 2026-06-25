# AFSYS — Claude Code Project Guide

This file is the primary reference for AI-assisted development on this project. Read it before making any changes.

## Project Overview

- **Name:** AFSYS
- **Purpose:** [Describe the application's purpose]
- **Tech Stack:** [List primary languages, frameworks, and runtimes]
- **Package Manager:** [npm / pip / cargo / etc.]

## Repository Layout

```
src/        Application source code
tests/      All tests (unit, integration, e2e)
docs/       Project documentation
scripts/    Automation and CI/CD helpers
config/     Environment configuration templates
```

## Development Commands

```bash
# Install dependencies
[install command]

# Run in development mode
[dev command]

# Run all tests
[test command]

# Run linter / formatter
[lint command]

# Build for production
[build command]
```

## Coding Standards

- Follow [docs/dev/CODING_STANDARDS.md](docs/dev/CODING_STANDARDS.md) for all code style rules.
- All public functions/methods must have documentation comments.
- No commented-out code committed to main.
- Prefer explicit over implicit; avoid magic numbers.

## Testing Requirements

- Every new feature requires corresponding unit tests.
- Bug fixes must include a regression test.
- Minimum coverage threshold: [X]%.
- See [docs/qa/TEST_STRATEGY.md](docs/qa/TEST_STRATEGY.md) for the full QA approach.

## Branching Strategy

```
main            Production-ready code only
develop         Integration branch
feature/<name>  New features
bugfix/<name>   Bug fixes
hotfix/<name>   Emergency production fixes
release/<x.y.z> Release candidates
```

## Commit Message Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer: Closes #123]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

## Environment Configuration

- Never commit secrets or credentials.
- Copy `config/example.env` to `config/.env` for local development.
- Production secrets are managed via [secrets management approach].

## Architecture Decisions

Key architectural decisions are recorded as ADRs in [docs/architecture/DESIGN.md](docs/architecture/DESIGN.md). Consult before introducing new patterns or dependencies.

## Security

- See [docs/security/SECURITY.md](docs/security/SECURITY.md) for the threat model and security requirements.
- Validate all external input at system boundaries.
- Use parameterized queries; never construct SQL from user input.
- Report vulnerabilities to [security contact].

## Important Constraints

- [List any hard constraints: regulatory, performance, compatibility]
- [List any forbidden patterns or libraries]

## Definition of Done

A task is complete when:
1. Code is written and passes all existing tests
2. New tests are added for the change
3. Linter/formatter passes with no warnings
4. Documentation is updated if behavior changed
5. Code is reviewed and approved by at least one peer
6. CI pipeline is green
