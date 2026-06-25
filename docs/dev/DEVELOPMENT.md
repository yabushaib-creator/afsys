# Developer Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Setup](#2-local-setup)
3. [Project Structure](#3-project-structure)
4. [Development Workflow](#4-development-workflow)
5. [Running the Application](#5-running-the-application)
6. [Testing](#6-testing)
7. [Debugging](#7-debugging)
8. [Environment Variables](#8-environment-variables)
9. [Database](#9-database)
10. [Dependency Management](#10-dependency-management)
11. [CI/CD Pipeline](#11-cicd-pipeline)

---

## 1. Prerequisites

Before setting up the project, ensure you have the following installed:

| Tool | Minimum Version | Notes |
|---|---|---|
| [Runtime, e.g., Node.js] | [version] | Use `nvm` / `pyenv` to manage versions |
| [Package Manager] | [version] | |
| [Docker] | 24.x | Required for running services locally |
| [Docker Compose] | 2.x | |
| Git | 2.40+ | |

---

## 2. Local Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd afsys

# 2. Install dependencies
[install command]

# 3. Set up environment configuration
cp config/example.env config/.env
# Open config/.env and fill in required values (see Section 8)

# 4. Start dependent services (database, cache, etc.)
docker compose up -d

# 5. Run database migrations
[migration command]

# 6. Seed development data (optional)
[seed command]

# 7. Start the application in development mode
[dev start command]
```

The application should now be running at `http://localhost:[PORT]`.

---

## 3. Project Structure

```
src/
├── [module-a]/
│   ├── [module-a].controller.[ext]
│   ├── [module-a].service.[ext]
│   ├── [module-a].model.[ext]
│   └── [module-a].test.[ext]
├── shared/
│   ├── utils/
│   ├── middleware/
│   └── types/
└── main.[ext]

tests/
├── unit/
├── integration/
└── e2e/

scripts/
├── migrate.sh
├── seed.sh
└── build.sh

config/
├── example.env
└── [environment].config.[ext]
```

---

## 4. Development Workflow

### Branching

Always branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write code.
2. Write or update tests.
3. Run linter: `[lint command]`
4. Run tests: `[test command]`
5. Commit using Conventional Commits format (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).
6. Push and open a Pull Request against `develop`.

### Code Review

- At least one peer approval is required before merging.
- Address all review comments; resolve threads after addressing.
- Do not self-merge without approval.

---

## 5. Running the Application

| Command | Description |
|---|---|
| `[dev command]` | Start in development mode with hot reload |
| `[start command]` | Start in production mode |
| `[build command]` | Build for production |
| `[lint command]` | Run linter |
| `[format command]` | Run code formatter |

---

## 6. Testing

| Command | Description |
|---|---|
| `[test command]` | Run all tests |
| `[test:unit command]` | Run unit tests only |
| `[test:int command]` | Run integration tests only |
| `[test:e2e command]` | Run end-to-end tests only |
| `[test:coverage command]` | Run tests with coverage report |

Coverage report is generated at `coverage/index.html`.

Minimum required coverage: **[X]%** (enforced by CI).

See [docs/qa/TEST_STRATEGY.md](../qa/TEST_STRATEGY.md) for the full testing approach.

---

## 7. Debugging

### Local Debugging

- [Describe how to attach a debugger — e.g., VS Code launch.json config]
- Debug port: `[PORT]`

### Logging

- Log level is controlled by the `LOG_LEVEL` environment variable.
- Values: `error`, `warn`, `info`, `debug`, `trace`
- Default: `info` in development, `warn` in production.

### Common Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Connection refused` on startup | Database not running | Run `docker compose up -d` |
| `Missing env variable` error | `.env` not set up | Copy `config/example.env` to `config/.env` |
| Tests failing with `Cannot find module` | Dependencies not installed | Run `[install command]` |

---

## 8. Environment Variables

Copy `config/example.env` to `config/.env` and set values:

| Variable | Required | Description | Example |
|---|---|---|---|
| `APP_ENV` | Yes | Environment name | `development` |
| `APP_PORT` | Yes | Port the app listens on | `3000` |
| `DATABASE_URL` | Yes | Primary database connection string | `postgres://user:pass@localhost:5432/afsys` |
| `REDIS_URL` | No | Cache server URL | `redis://localhost:6379` |
| `JWT_SECRET` | Yes | Secret for signing JWTs | [32+ char random string] |
| `LOG_LEVEL` | No | Log verbosity | `info` |

**Never commit actual credentials to the repository.**

---

## 9. Database

### Migrations

```bash
# Create a new migration
[migration create command]

# Apply all pending migrations
[migration run command]

# Roll back the last migration
[migration rollback command]

# Show migration status
[migration status command]
```

### Resetting the Local Database

```bash
# WARNING: Destroys all local data
[db reset command]
```

---

## 10. Dependency Management

- Add a production dependency: `[add command]`
- Add a dev dependency: `[add dev command]`
- Remove a dependency: `[remove command]`
- Audit for vulnerabilities: `[audit command]`

Dependabot / Renovate is configured to open PRs for dependency updates automatically. Review these PRs promptly.

---

## 11. CI/CD Pipeline

The pipeline runs on every push and PR:

| Stage | Trigger | What it does |
|---|---|---|
| Lint | Push / PR | Runs linter, fails on warnings |
| Test | Push / PR | Runs unit + integration tests, enforces coverage |
| Build | Push to develop/main | Builds production artifact |
| Security Scan | Push / PR | SAST + dependency vulnerability scan |
| Deploy Staging | Merge to develop | Auto-deploys to staging environment |
| Deploy Production | Merge to main | Manual approval gate, then deploys |

Pipeline configuration: `.github/workflows/`

See [docs/ops/DEPLOYMENT.md](../ops/DEPLOYMENT.md) for the full deployment process.
