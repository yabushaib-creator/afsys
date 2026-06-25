# Coding Standards

All contributors must follow these standards. Code reviews will enforce them.

---

## 1. General Principles

- **Readability first.** Code is read far more than it is written. Optimize for the reader.
- **Explicit over implicit.** Don't rely on magic defaults or hidden behavior.
- **Single responsibility.** Each function, class, and module has one clear purpose.
- **Fail fast.** Validate inputs early; surface errors at the boundary, not deep in logic.
- **Don't Repeat Yourself (DRY).** Extract shared logic — but only when the duplication is real, not coincidental.
- **Prefer composition over inheritance.**
- **No dead code.** Remove unused functions, variables, and imports. Git history preserves old code if needed.

---

## 2. Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| Variables / functions | `camelCase` | `getUserById` |
| Classes / types | `PascalCase` | `UserService` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Files | `kebab-case` | `user-service.ts` |
| Directories | `kebab-case` | `auth/`, `user-management/` |
| Database tables | `snake_case` | `user_accounts` |
| Database columns | `snake_case` | `created_at` |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL` |

### Naming Rules

- Names must be descriptive. Avoid single-letter variables outside loop counters.
- Boolean names should read as questions: `isActive`, `hasPermission`, `canDelete`.
- Functions should be verbs: `createUser`, `fetchReport`, `validateInput`.
- Avoid abbreviations unless universally understood (`id`, `url`, `api`, `html`).
- Avoid generic names: `data`, `result`, `temp`, `obj`, `stuff`.

---

## 3. File and Module Organization

- One primary export per file where practical.
- Group related files in a feature folder, not by type (prefer `user/user.service.ts` over `services/user.ts`).
- Index files (`index.ts`) may re-export from a module but should contain no logic.
- Keep files short: if a file exceeds ~300 lines, consider splitting.

---

## 4. Functions

- Functions should do **one thing**.
- Maximum function length: ~30 lines. If longer, decompose.
- Maximum parameter count: 3. Use an options object for more.
- Return early for guard clauses instead of deeply nested `if` blocks.
- Prefer pure functions (same input → same output, no side effects) where possible.

```
// Avoid deep nesting:
function process(user) {
  if (user) {
    if (user.isActive) {
      if (user.role === 'admin') {
        // ... logic
      }
    }
  }
}

// Prefer early returns:
function process(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (user.role !== 'admin') return;
  // ... logic
}
```

---

## 5. Comments

- Comment the **why**, never the **what**.
- Code should be self-documenting through clear naming.
- Remove commented-out code before committing.
- Use `// TODO:` or `// FIXME:` sparingly, and always link to a tracked issue.

```
// Good: explains non-obvious constraint
// BCrypt cost factor 12 is the minimum per our security policy (see NFR-S-02).
const HASH_ROUNDS = 12;

// Bad: restates the code
// Set hash rounds to 12
const HASH_ROUNDS = 12;
```

---

## 6. Error Handling

- Never silently swallow exceptions: `catch (e) { }` is forbidden.
- Use typed/structured errors, not raw string messages.
- Log errors with sufficient context (operation, input summary, correlation ID).
- Distinguish between operational errors (expected, recoverable) and programmer errors (bugs, fail fast).
- Do not expose internal error details or stack traces in API responses to clients.

```
// Bad:
try {
  await db.query(sql);
} catch (e) {}

// Good:
try {
  await db.query(sql);
} catch (error) {
  logger.error('Failed to execute query', { sql: sql.name, error });
  throw new DatabaseError('Query execution failed', { cause: error });
}
```

---

## 7. Security-Sensitive Code

- Validate and sanitize **all** external input (HTTP requests, file uploads, query params).
- Never construct SQL from string concatenation. Always use parameterized queries.
- Never log secrets, tokens, passwords, or PII.
- Use constant-time comparison for secrets (`crypto.timingSafeEqual`).
- Sanitize data before rendering in HTML to prevent XSS.
- See [Security Policy](../security/SECURITY.md) for full guidelines.

---

## 8. Testing Requirements

- Every new function or feature must have corresponding unit tests.
- Bug fixes must include a regression test that fails before the fix and passes after.
- Tests must be independent: no shared mutable state between tests.
- Use descriptive test names: `should return 404 when user does not exist`.
- See [Test Strategy](../qa/TEST_STRATEGY.md) for the full approach.

---

## 9. Git Hygiene

- Commits must follow Conventional Commits format (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).
- Each commit should represent a single logical change.
- Do not commit secrets, credentials, or generated files.
- Rebase feature branches before opening a PR to keep history clean.
- Keep PRs small and focused: one feature or fix per PR.

---

## 10. Code Review Checklist

Reviewers should verify:

- [ ] Does the code do what the PR description says?
- [ ] Are there tests, and do they cover the important cases?
- [ ] Are naming conventions followed?
- [ ] Is error handling appropriate?
- [ ] Are there any security concerns?
- [ ] Is any documentation update needed?
- [ ] Does this introduce any unnecessary complexity?
- [ ] Are there any performance concerns at scale?
