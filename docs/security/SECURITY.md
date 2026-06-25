# Security Policy

## Document Information

| Field | Value |
|---|---|
| Project | AFSYS |
| Version | 0.1 (Draft) |
| Author | [Security Lead / Tech Lead] |
| Last Updated | 2026-06-22 |
| Classification | Internal |

---

## 1. Reporting Vulnerabilities

**Do not report security vulnerabilities in public GitHub Issues.**

Report security vulnerabilities to: **[security@example.com]**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact details

We will acknowledge within **48 hours** and aim to provide a remediation timeline within **5 business days**.

---

## 2. Threat Model

### 2.1 Assets

| Asset | Sensitivity | Consequence of Compromise |
|---|---|---|
| User credentials | Critical | Account takeover |
| PII (names, emails) | High | Privacy breach, regulatory penalty |
| Business data | High | Competitive harm, data loss |
| Session tokens | Critical | Account hijacking |
| API keys / secrets | Critical | Full system compromise |
| Infrastructure access | Critical | Full system compromise |

### 2.2 Trust Boundaries

- **External → API Gateway:** All traffic is untrusted; authenticated and validated at the boundary.
- **API Gateway → Application:** Trusted after auth verification; still validate input.
- **Application → Database:** Trusted internal network; use least-privilege service accounts.
- **Application → External APIs:** Outbound; use allowlisted endpoints only.

### 2.3 Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| Unauthenticated internet user | Low–Medium | Opportunistic attack |
| Authenticated user (privilege escalation) | Medium | Access unauthorized data |
| Compromised third-party dependency | Medium | Supply chain attack |
| Insider threat | High | Data theft |

---

## 3. Security Requirements

### 3.1 Authentication

- Passwords must be hashed with bcrypt (cost factor ≥ 12) or Argon2id.
- JWTs must be signed (HS256 minimum; RS256 preferred for multi-service).
- Token expiry: Access tokens ≤ 1 hour; Refresh tokens ≤ 30 days.
- Multi-factor authentication (MFA) must be available; required for admin roles.
- Account lockout after 5 failed attempts within 15 minutes (unlock after 15 min or via email).

### 3.2 Authorization

- Enforce Role-Based Access Control (RBAC) on every endpoint.
- Authorization checks happen server-side only — never trust client-supplied role claims.
- Apply the principle of least privilege: users and services have only the permissions they need.
- Object-level authorization: verify ownership/access before returning or modifying any resource.

### 3.3 Input Validation

- Validate all input at system boundaries (HTTP endpoints, file uploads, CLI arguments).
- Use allowlists (permitted values) over denylists (blocked values).
- Reject oversized payloads early (configure max request body size at the gateway).
- Never construct SQL from string interpolation — use parameterized queries exclusively.
- Sanitize HTML output to prevent XSS; use a context-aware escaping library.

### 3.4 Data Protection

- All data in transit: TLS 1.2 minimum; TLS 1.3 preferred.
- All PII and sensitive data encrypted at rest (AES-256 or database-level encryption).
- Secrets (API keys, DB passwords, JWT secrets) are never stored in code or git history.
- Secrets are injected at runtime from [AWS Secrets Manager / Key Vault / Vault].
- Log sanitization: never log passwords, tokens, credit card numbers, or PII.

### 3.5 Dependency Security

- All dependencies scanned for known vulnerabilities on every CI run.
- Critical/High CVEs patched within 48 hours of discovery.
- Medium CVEs patched within the next sprint.
- Pin dependency versions; avoid `latest` or broad ranges in production.

### 3.6 Infrastructure Security

- Principle of least privilege applied to all cloud IAM roles and service accounts.
- No SSH keys or long-lived credentials in code or configuration files.
- Security groups / firewall rules: allow only necessary ports and sources.
- All storage buckets/containers: private by default; no public access without explicit justification.
- Enable cloud-provider audit logging (CloudTrail / Activity Log / Cloud Audit Logs).

---

## 4. OWASP Top 10 Controls

| Risk | Control Applied |
|---|---|
| A01: Broken Access Control | RBAC enforced server-side; object-level auth checks |
| A02: Cryptographic Failures | TLS everywhere; strong hashing; secrets in vault |
| A03: Injection | Parameterized queries; input validation; ORM |
| A04: Insecure Design | Threat modeling during design phase |
| A05: Security Misconfiguration | IaC reviewed; hardened defaults; no debug in prod |
| A06: Vulnerable Components | Automated dependency scanning; patch SLA enforced |
| A07: Auth & Session Failures | Strong hashing; short-lived tokens; MFA; lockout |
| A08: Software & Data Integrity | Signed commits; image signing; SBOM |
| A09: Logging & Monitoring | Centralized logs; alerting; incident response plan |
| A10: SSRF | Outbound allowlist; block internal IP ranges |

---

## 5. Security Testing

| Activity | Frequency | Owner |
|---|---|---|
| SAST (static analysis) | Every PR | CI/CD |
| Dependency scan (SCA) | Every PR | CI/CD |
| DAST (OWASP ZAP) | Every release to staging | QA |
| OWASP Top 10 manual review | Quarterly | Tech Lead |
| External penetration test | Annually | Third-party firm |
| Secret scanning | Every commit | CI/CD (GitGuardian / trufflehog) |

---

## 6. Incident Response

For security incidents, follow the [Runbook](../ops/RUNBOOK.md) and additionally:

1. **Contain immediately:** Revoke compromised tokens, rotate secrets, isolate affected systems.
2. **Preserve evidence:** Do not destroy logs; snapshot affected systems.
3. **Notify:** Security lead, Engineering Lead, Legal (if PII is involved).
4. **Assess data exposure:** Determine what data was accessible.
5. **Regulatory notification:** If PII is compromised, assess GDPR/local law notification obligations (typically 72-hour window).
6. **Remediate root cause** before bringing systems back online.
7. **Post-mortem** within 48 hours.

---

## 7. Secure Development Checklist

Before any code is merged, developers confirm:

- [ ] All input is validated at the boundary.
- [ ] SQL queries use parameterized statements.
- [ ] No secrets or credentials are in the code.
- [ ] Output rendered in HTML is escaped.
- [ ] Authorization is checked before accessing any resource.
- [ ] Logs do not contain PII or secrets.
- [ ] New dependencies have been reviewed for known vulnerabilities.
- [ ] Error responses do not leak implementation details.
