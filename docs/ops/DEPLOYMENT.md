# Deployment Guide

## Overview

This guide covers deploying AFSYS to each environment. All production deployments require a change ticket and must follow the process below.

---

## 1. Environments

| Environment | URL | Branch | Deploy Method | Approver |
|---|---|---|---|---|
| Development | `http://localhost:[PORT]` | Any feature branch | Manual / local | Developer |
| Staging | `https://staging.afsys.example.com` | `develop` | Auto on merge | None (automatic) |
| Production | `https://afsys.example.com` | `main` | Manual, approval gate | Tech Lead + PM |

---

## 2. Prerequisites

Ensure you have:
- Access to the deployment target (cloud account, cluster credentials)
- The deployment tooling installed: [e.g., kubectl, AWS CLI, Helm]
- Relevant secrets/credentials in your terminal session
- A passing CI build for the commit you intend to deploy

---

## 3. Staging Deployment

Staging deploys automatically when code is merged to `develop` via the CI/CD pipeline.

**Pipeline stages:**
1. Build Docker image
2. Run test suite
3. Run security scan
4. Push image to registry with `develop-<short-sha>` tag
5. Deploy to staging namespace
6. Run smoke tests
7. Notify team in `#deployments` channel

**To trigger manually:**
```bash
# Re-run the CI pipeline (GitHub Actions)
gh workflow run deploy-staging.yml --ref develop
```

---

## 4. Production Deployment

### 4.1 Pre-Deployment Checklist

- [ ] All stories for this release are merged to `develop` and verified in staging.
- [ ] Release branch `release/x.y.z` created from `develop`.
- [ ] QA sign-off received (see TEST_STRATEGY.md exit criteria).
- [ ] Change Request raised and approved.
- [ ] Rollback plan documented (section 6 of this guide).
- [ ] On-call engineer notified and available during deployment window.
- [ ] Maintenance window communicated to users (if downtime expected).
- [ ] Database migrations reviewed by Tech Lead.

### 4.2 Release Steps

```bash
# 1. Merge release branch to main (after approvals)
git checkout main
git merge --no-ff release/x.y.z
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin main --tags

# 2. Merge back to develop to capture any release-branch changes
git checkout develop
git merge --no-ff main
git push origin develop
```

### 4.3 Production Pipeline Stages

1. Build Docker image from `main`
2. Run full test suite
3. Run DAST security scan against staging
4. **Manual approval gate** — Tech Lead approves in CI dashboard
5. Push image with `vX.Y.Z` and `latest` tags
6. Run database migrations (with dry-run option reviewed first)
7. Rolling deploy to production cluster (zero-downtime if applicable)
8. Run post-deploy smoke tests
9. Monitor error rates and latency for 15 minutes
10. Notify stakeholders of successful deployment

---

## 5. Database Migrations

**Always run migrations separately from application deployment.**

```bash
# Dry run — preview changes without applying
[migration command] --dry-run

# Apply migrations
[migration command]

# Verify applied migrations
[migration status command]
```

**Rules:**
- Migrations must be backwards-compatible with the previous application version (blue/green safety).
- Never drop columns in the same release that removes their usage — do it in the next release.
- Never run destructive migrations without a backup taken in the last 1 hour.

---

## 6. Rollback Procedure

### 6.1 Application Rollback

```bash
# Re-deploy the previous image tag
[deploy command] --image afsys:vX.Y.[Z-1]

# Verify rollback succeeded
curl -f https://afsys.example.com/health
```

### 6.2 Database Rollback

```bash
# Roll back the last migration
[migration rollback command]
```

**Note:** Not all migrations are reversible. Check the migration file for a `down` method before assuming rollback is safe.

### 6.3 Decision Matrix

| Scenario | Action |
|---|---|
| Smoke tests fail immediately after deploy | Rollback application immediately |
| Error rate spikes > [X]% within 15 min | Rollback application; investigate |
| Performance degradation > 2× baseline | Rollback; investigate under non-production load |
| Security incident discovered | Rollback; notify security team; open incident |

---

## 7. Environment Configuration

Production environment variables are managed in [AWS Secrets Manager / Azure Key Vault / Vault].

To rotate a secret in production:
1. Update the secret in the secrets manager.
2. Trigger a rolling restart of the application pods/instances (secrets are injected at startup).
3. Verify health checks pass after restart.

---

## 8. Health Checks

| Endpoint | Expected Response | What it checks |
|---|---|---|
| `GET /health` | `200 { "status": "ok" }` | Application is running |
| `GET /health/ready` | `200 { "status": "ready" }` | App + DB + dependencies ready |
| `GET /health/live` | `200` | Process is alive (liveness probe) |

---

## 9. Deployment History

| Version | Date | Deployer | Notes |
|---|---|---|---|
| v0.1.0 | [Date] | [Name] | Initial production release |
