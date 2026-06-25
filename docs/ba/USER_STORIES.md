# User Stories

## Document Information

| Field | Value |
|---|---|
| Project | AFSYS |
| Version | 0.1 (Draft) |
| Author | [BA Lead] |
| Last Updated | 2026-06-22 |

---

## Story Map Overview

```
Goal ──► Epic ──► User Story ──► Acceptance Criteria
```

---

## Epic Template

```
## EPIC-NNN: [Epic Title]

**Goal:** [One sentence — what user outcome does this epic deliver?]
**Priority:** Must Have | Should Have | Could Have
**Estimated Size:** [S / M / L / XL]
**Dependencies:** [Other epics or requirements]
**Status:** Backlog | In Progress | Done

### Stories
- US-NNN
- US-NNN
```

---

## Story Template

```
## US-NNN: [Story Title]

**Epic:** EPIC-NNN  
**As a** [type of user],  
**I want** [to perform some action],  
**So that** [I achieve some benefit/goal].

**Priority:** Must Have | Should Have | Could Have  
**Story Points:** [Fibonacci: 1, 2, 3, 5, 8, 13]  
**Status:** Backlog | Ready | In Progress | Done

### Acceptance Criteria

- [ ] AC-1: Given [context], when [action], then [outcome].
- [ ] AC-2: Given [context], when [action], then [outcome].
- [ ] AC-3: [Edge/negative case].

### Notes / Clarifications
- [Any additional context for the developer or QA]

### Dependencies
- [Story or task this depends on]
```

---

## EPIC-001: User Authentication & Access

**Goal:** Allow users to securely log in and manage their sessions.  
**Priority:** Must Have  
**Estimated Size:** M  
**Status:** Backlog

### Stories
- US-001, US-002, US-003

---

## US-001: User Login

**Epic:** EPIC-001  
**As a** registered user,  
**I want** to log in with my email and password,  
**So that** I can access the system securely.

**Priority:** Must Have  
**Story Points:** 3  
**Status:** Backlog

### Acceptance Criteria

- [ ] AC-1: Given a valid email and password, when I submit the login form, then I am redirected to the dashboard and a session token is issued.
- [ ] AC-2: Given an incorrect password, when I submit the login form, then I see an error message and no token is issued.
- [ ] AC-3: Given three consecutive failed login attempts, when I try again, then my account is temporarily locked for 15 minutes.
- [ ] AC-4: Given a locked account, when I attempt to log in, then I see a clear message explaining the lockout and duration.
- [ ] AC-5: Login form is accessible via keyboard navigation and meets WCAG 2.1 AA.

### Notes
- Do not reveal whether the email exists on failure (generic "invalid credentials" message).

---

## US-002: User Logout

**Epic:** EPIC-001  
**As a** logged-in user,  
**I want** to log out of the system,  
**So that** my session is securely terminated.

**Priority:** Must Have  
**Story Points:** 1  
**Status:** Backlog

### Acceptance Criteria

- [ ] AC-1: Given I am logged in, when I click "Logout", then my session token is invalidated and I am redirected to the login page.
- [ ] AC-2: Given my session is invalidated, when I attempt to access a protected page, then I am redirected to login.

---

## US-003: Password Reset

**Epic:** EPIC-001  
**As a** registered user who has forgotten my password,  
**I want** to reset my password via email,  
**So that** I can regain access to my account.

**Priority:** Must Have  
**Story Points:** 5  
**Status:** Backlog

### Acceptance Criteria

- [ ] AC-1: Given a valid registered email, when I submit a password reset request, then I receive an email with a reset link within 2 minutes.
- [ ] AC-2: Given a valid reset link, when I submit a new password, then my password is updated and the link is invalidated.
- [ ] AC-3: Given a reset link older than 1 hour, when I attempt to use it, then I see an expiry error.
- [ ] AC-4: Given an unregistered email, when I submit a reset request, then the UI shows the same success message (no account enumeration).

---

## EPIC-002: [Next Epic Title]

**Goal:**  
**Priority:**  
**Estimated Size:**  
**Status:** Backlog

---

_Continue adding epics and stories. Keep stories small enough to be completed in one sprint._
