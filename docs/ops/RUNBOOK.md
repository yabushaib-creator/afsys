# Operations Runbook

## Overview

This runbook provides step-by-step procedures for common operational tasks and incident response for AFSYS.

---

## 1. On-Call Responsibilities

**On-call rotation:** [Describe rotation schedule and tooling, e.g., PagerDuty]

On-call engineer is responsible for:
- Acknowledging pages within **15 minutes**.
- Triaging severity and engaging additional responders if needed.
- Keeping stakeholders updated during incidents.
- Writing an incident report within 24 hours of resolution (P1/P2).

---

## 2. Monitoring & Alerting

| System | URL | What it monitors |
|---|---|---|
| Application metrics | [Grafana URL] | Request rate, error rate, latency |
| Infrastructure | [Cloud console URL] | CPU, memory, disk, network |
| Logs | [Log aggregator URL] | Application and system logs |
| Uptime / synthetic | [Uptime tool URL] | External endpoint availability |
| Alerting | [PagerDuty / OpsGenie] | Paging and escalation |

### Key Alerts

| Alert | Threshold | Severity | Runbook Section |
|---|---|---|---|
| High error rate | > 1% 5xx over 5 min | P1 | §4.1 |
| High P95 latency | > 2s over 5 min | P2 | §4.2 |
| Low disk space | < 20% free | P2 | §5.1 |
| Failed health check | 3 consecutive failures | P1 | §4.3 |
| Database connection exhaustion | > 90% pool usage | P1 | §4.4 |

---

## 3. Incident Management

### Severity Levels

| Severity | Description | Response Time | Stakeholder Notification |
|---|---|---|---|
| P1 — Critical | Production down, data loss, security breach | 15 min acknowledge; all-hands | Immediate; every 30 min update |
| P2 — High | Core feature broken, significant user impact | 30 min | Within 1 hour; hourly updates |
| P3 — Medium | Feature impaired, workaround available | Next business day | Daily update |
| P4 — Low | Minor issue, no user impact | Planned sprint | None required |

### Incident Response Process

```
1. Detect (alert fires or user report)
    ↓
2. Acknowledge (on-call confirms they're responding)
    ↓
3. Assess (determine severity, gather initial facts)
    ↓
4. Communicate (notify stakeholders per severity SLA)
    ↓
5. Mitigate (stop the bleeding — rollback, scale, disable feature)
    ↓
6. Resolve (root cause fixed or workaround stable)
    ↓
7. Post-mortem (blameless RCA within 24–48 hours for P1/P2)
```

---

## 4. Common Incident Procedures

### 4.1 High Error Rate (5xx Responses)

1. Check application logs in [log aggregator URL] for error details.
2. Check recent deployments: was there a release in the last 30 minutes?
3. Check database connectivity: `[db health command]`
4. Check upstream dependencies (external APIs, queues).
5. If caused by a bad deployment → **rollback** (see [DEPLOYMENT.md](DEPLOYMENT.md) §6).
6. If database-related → see §4.4.
7. If upstream dependency → implement circuit-breaker or return cached response.

### 4.2 High Latency

1. Check Grafana for the slow endpoint(s).
2. Check for long-running database queries: `[db slow query log command]`
3. Check cache hit rates; a cache flush may cause a "cold start" spike.
4. Check for resource constraints (CPU, memory throttling).
5. If a single endpoint: can it be temporarily disabled or rate-limited?

### 4.3 Health Check Failures

```bash
# Check application status
curl -v https://afsys.example.com/health/ready

# Check pod/container status
[kubectl get pods / docker ps command]

# View recent logs
[kubectl logs / docker logs command] --tail=100
```

1. Confirm the issue is not a monitoring false-positive.
2. Restart the affected instance if unresponsive.
3. If restart doesn't resolve: rollback to previous version.

### 4.4 Database Issues

```bash
# Check database connectivity
[db ping command]

# Check active connections
[db connection count query]

# Check for table locks
[db lock query]
```

**Connection exhaustion:**
- Identify long-running queries holding connections.
- Kill idle connections if safe: `[kill query command]`
- Consider restarting the application connection pool (rolling restart).

**Database down:**
- Escalate to DBA / cloud provider immediately.
- Switch application to read-only mode if available.
- Engage DR failover if RTO is at risk.

---

## 5. Routine Operational Tasks

### 5.1 Disk Space Management

```bash
# Check disk usage
[disk check command]

# Find large files
[find large files command]

# Rotate logs
[log rotation command]
```

Archive or delete log files older than [X] days.

### 5.2 Backup Verification

Run weekly to confirm backups are recoverable:

```bash
# List recent backups
[backup list command]

# Test restore to a scratch environment
[restore command] --target scratch-db --backup [latest]

# Verify data integrity
[integrity check command]
```

### 5.3 Certificate Renewal

TLS certificates auto-renew via [Let's Encrypt / ACM / cert-manager].  
Check certificate expiry monthly:

```bash
[cert expiry check command]
```

Alert if < 30 days until expiry.

### 5.4 Dependency Security Patching

1. Review weekly Dependabot / Snyk reports.
2. Apply patches for Critical/High vulnerabilities within 48 hours.
3. Apply Medium/Low patches in the next planned sprint.

---

## 6. Post-Mortem Template

```markdown
## Incident Post-Mortem: [Short Title]

**Date:** YYYY-MM-DD  
**Severity:** P1 / P2  
**Duration:** HH:MM  
**Authors:** [Names]

### Summary
[2–3 sentences: what happened, what was the impact, how was it resolved]

### Timeline (all times UTC)
- HH:MM — Alert fired
- HH:MM — On-call acknowledged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Incident resolved

### Root Cause
[Clear, factual description of the technical root cause]

### Contributing Factors
- [Factor 1]
- [Factor 2]

### Impact
- Users affected: ~[N]
- Duration: [X] minutes
- Data loss: None / [describe]
- SLA impact: [Yes/No — X minutes of downtime]

### What Went Well
- [Fast detection]
- [Clear communication]

### What Could Be Improved
- [Gap 1]
- [Gap 2]

### Action Items
| Action | Owner | Due Date |
|---|---|---|
| [Specific, measurable action] | [Name] | [Date] |
```

---

## 7. Escalation Contacts

| Role | Name | Contact | When to Escalate |
|---|---|---|---|
| On-Call Engineer | [Rotation] | [PagerDuty] | First responder |
| Engineering Lead | [Name] | [Phone/Slack] | P1 or unresolved P2 after 30 min |
| DBA | [Name] | [Phone] | Database incidents |
| Cloud Account Owner | [Name] | [Phone] | Infrastructure outages |
| Security Team | [Name] | [Email] | Any suspected breach |
| Product Manager | [Name] | [Slack] | User communication needed |
