# QA & Test Strategy

## Document Information

| Field | Value |
|---|---|
| Project | AFSYS |
| Version | 0.1 (Draft) |
| Author | [QA Lead] |
| Last Updated | 2026-06-22 |
| Status | Draft |

---

## 1. Objectives

- Ensure the system meets all functional and non-functional requirements before release.
- Detect defects early (shift-left) to minimize cost of correction.
- Build confidence in the codebase through automated regression safety nets.
- Provide clear, repeatable test evidence for stakeholder sign-off.

---

## 2. Scope

**In Scope:**
- Functional testing of all user stories in scope for each release.
- API contract testing.
- Integration testing of third-party system connections.
- Performance/load testing for critical paths.
- Security testing (OWASP Top 10, authentication/authorization).
- Accessibility testing (WCAG 2.1 AA).

**Out of Scope:**
- Load testing infrastructure capacity beyond [X] concurrent users.
- Penetration testing (handled by a separate security audit engagement).

---

## 3. Test Pyramid

```
         ┌──────────────┐
         │     E2E       │  Small number, slow, high confidence
         │  (5–10%)      │
        ┌┴──────────────┴┐
        │  Integration   │  Service + DB + external integrations
        │  (20–30%)      │
       ┌┴────────────────┴┐
       │     Unit          │  Fast, isolated, majority of tests
       │    (60–70%)       │
       └──────────────────┘
```

---

## 4. Test Types

### 4.1 Unit Tests

- **Target:** Individual functions, methods, classes.
- **Isolation:** All external dependencies mocked/stubbed.
- **Owned by:** Developers (written alongside code).
- **Tooling:** [e.g., Jest / pytest / JUnit]
- **Coverage target:** [X]% line/branch coverage enforced in CI.
- **Run time:** < 5 minutes for the full suite.

### 4.2 Integration Tests

- **Target:** Interaction between modules, database queries, message queue flows.
- **Isolation:** Real database (test instance), mocked external APIs.
- **Owned by:** Developers / QA.
- **Tooling:** [e.g., Supertest / pytest-django / TestContainers]
- **Run time:** < 15 minutes.

### 4.3 End-to-End (E2E) Tests

- **Target:** Critical user journeys through the full stack.
- **Isolation:** Staging-like environment, seeded data.
- **Owned by:** QA.
- **Tooling:** [e.g., Playwright / Cypress / Selenium]
- **Scope:** Cover the top [N] user journeys (login, [key workflow 1], [key workflow 2]).

### 4.4 API Contract Tests

- **Target:** Verify API responses match documented contracts (schema, status codes).
- **Tooling:** [e.g., Pact / Dredd / Postman / Newman]
- **Run time:** < 5 minutes.

### 4.5 Performance Tests

- **Target:** Response times and throughput under expected and peak load.
- **Tooling:** [e.g., k6 / Locust / JMeter]
- **Thresholds:**
  - P95 response time < 500ms for read endpoints.
  - P95 response time < 2s for write endpoints.
  - Zero errors under [X] concurrent users.
- **Frequency:** Run before each major release.

### 4.6 Security Tests

- OWASP ZAP DAST scan on staging before each release.
- Dependency vulnerability scan (via Dependabot / Snyk) on every PR.
- Manual OWASP Top 10 checklist review each quarter.

### 4.7 Accessibility Tests

- Automated: `axe-core` integrated in E2E tests for key pages.
- Manual: Screen-reader review of critical flows before each release.

---

## 5. Test Environments

| Environment | Purpose | Data | Who Manages |
|---|---|---|---|
| Local | Developer testing | Seeded local data | Developer |
| CI | Automated test runs on every PR | Fresh seed each run | CI system |
| Staging | Full integration / UAT | Anonymized production-like data | DevOps |
| Production | Smoke tests only | Real data | QA / DevOps |

---

## 6. Entry and Exit Criteria

### Entry Criteria (before testing begins)

- Feature is code-complete and deployed to the test environment.
- Unit tests pass in CI.
- Build is smoke-tested and accessible.
- Test data is set up.

### Exit Criteria (before release)

- All test cases for in-scope stories executed.
- Zero open P1 (Critical) or P2 (High) defects.
- Code coverage meets the defined threshold.
- Performance thresholds met.
- UAT sign-off received from Product Owner.
- Security scan shows no High/Critical vulnerabilities unmitigated.

---

## 7. Defect Management

| Severity | Description | SLA for Fix |
|---|---|---|
| P1 — Critical | System down, data loss, security breach | Fix immediately; hotfix to production |
| P2 — High | Core feature broken, no workaround | Fix in current sprint |
| P3 — Medium | Feature impaired, workaround exists | Fix in next sprint |
| P4 — Low | Minor UI/UX issue | Prioritize in backlog |

Defects are logged in [Issue Tracker — e.g., GitHub Issues / Jira] with:
- Steps to reproduce
- Expected vs. actual behavior
- Environment and version
- Severity
- Screenshots / logs

---

## 8. Test Reporting

- **Per PR:** CI reports test pass/fail and coverage delta.
- **Per Sprint:** QA publishes a test summary: test cases run, pass/fail counts, open defects.
- **Per Release:** QA publishes a release test report for stakeholder sign-off.

---

## 9. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Developers | Write and maintain unit and integration tests |
| QA Lead | Test strategy, test plans, E2E test authoring, defect tracking |
| QA Engineers | Test case execution, defect reporting, regression testing |
| Product Owner | UAT sign-off, acceptance criteria validation |
| DevOps | Maintain CI/CD pipeline, test environments |
