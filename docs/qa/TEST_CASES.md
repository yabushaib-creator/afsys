# Test Case Catalog

## Document Information

| Field | Value |
|---|---|
| Project | AFSYS |
| Version | 0.1 (Draft) |
| Author | [QA Lead] |
| Last Updated | 2026-06-22 |

---

## Test Case Template

```
### TC-NNN: [Test Case Title]

**Related Story:** US-NNN  
**Feature:** [Feature area]  
**Type:** Unit | Integration | E2E | Manual  
**Priority:** P1 | P2 | P3  
**Preconditions:** [State required before test]

| Step | Action | Expected Result |
|---|---|---|
| 1 | | |
| 2 | | |

**Test Data:** [Specific data values needed]  
**Postconditions:** [State after test]  
**Notes:** [Any edge cases or clarifications]
```

---

## Feature: Authentication

### TC-001: Successful Login with Valid Credentials

**Related Story:** US-001  
**Feature:** Authentication  
**Type:** E2E  
**Priority:** P1  
**Preconditions:** User account `testuser@example.com` exists with password `Test@1234!`

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login form is displayed |
| 2 | Enter `testuser@example.com` in the email field | Email field populated |
| 3 | Enter `Test@1234!` in the password field | Password masked with dots |
| 4 | Click the "Login" button | Redirected to the dashboard |
| 5 | Check response headers | `Authorization` or session cookie is set |
| 6 | Check dashboard content | User's name is displayed in the header |

**Test Data:** `testuser@example.com` / `Test@1234!`  
**Postconditions:** User is authenticated; session token is active.

---

### TC-002: Login Fails with Wrong Password

**Related Story:** US-001  
**Feature:** Authentication  
**Type:** E2E  
**Priority:** P1  
**Preconditions:** User account `testuser@example.com` exists

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login form is displayed |
| 2 | Enter `testuser@example.com` | Email field populated |
| 3 | Enter `WrongPassword` | Password masked |
| 4 | Click "Login" | Error message displayed: "Invalid credentials" |
| 5 | Verify URL | Remains on login page |
| 6 | Verify no session token is issued | No `Authorization` header or cookie |

**Test Data:** `testuser@example.com` / `WrongPassword`  
**Notes:** Error must not reveal whether the email is registered.

---

### TC-003: Account Lockout After 3 Failed Attempts

**Related Story:** US-001  
**Feature:** Authentication  
**Type:** Integration  
**Priority:** P1  
**Preconditions:** User account `testuser@example.com` exists, no prior failures

| Step | Action | Expected Result |
|---|---|---|
| 1 | Attempt login with wrong password | "Invalid credentials" error |
| 2 | Repeat step 1 | "Invalid credentials" error |
| 3 | Repeat step 1 | "Invalid credentials" error |
| 4 | Attempt login with correct password | Account locked message displayed |
| 5 | Check lockout duration message | "Try again in 15 minutes" message |
| 6 | Wait 15 minutes and retry with correct password | Login succeeds |

---

### TC-004: Password Reset – Happy Path

**Related Story:** US-003  
**Feature:** Authentication  
**Type:** E2E  
**Priority:** P1  
**Preconditions:** User `testuser@example.com` exists; email service is available

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to "Forgot Password" | Reset request form displayed |
| 2 | Enter `testuser@example.com` | Email field populated |
| 3 | Submit the form | Success message: "Check your email" |
| 4 | Check email inbox | Reset email received within 2 minutes |
| 5 | Click the reset link in the email | Password reset form displayed |
| 6 | Enter and confirm a new password `NewPass@5678!` | Success confirmation shown |
| 7 | Log in with the new password | Login succeeds |
| 8 | Attempt to reuse the reset link | Expiry or "already used" error |

---

### TC-005: Password Reset Link Expiry

**Related Story:** US-003  
**Feature:** Authentication  
**Type:** Integration  
**Priority:** P2  
**Preconditions:** A password reset token has been generated and is > 1 hour old

| Step | Action | Expected Result |
|---|---|---|
| 1 | Use an expired reset link | Error: "This link has expired" |
| 2 | Verify no password change occurred | Can still log in with old password |

---

### TC-006: Logout Invalidates Session

**Related Story:** US-002  
**Feature:** Authentication  
**Type:** E2E  
**Priority:** P1  
**Preconditions:** User is logged in

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Logout" | Redirected to login page |
| 2 | Navigate to a protected route directly | Redirected to login page |
| 3 | Attempt API call with old token | 401 Unauthorized response |

---

## Feature: [Next Feature Area]

_Add test cases here following the same template._

---

## Test Coverage Matrix

| User Story | TC IDs | Status |
|---|---|---|
| US-001: User Login | TC-001, TC-002, TC-003 | Draft |
| US-002: User Logout | TC-006 | Draft |
| US-003: Password Reset | TC-004, TC-005 | Draft |
