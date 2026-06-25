# API Reference

## Overview

- **Base URL (Dev):** `http://localhost:PORT/api/v1`
- **Base URL (Staging):** `https://staging.afsys.example.com/api/v1`
- **Base URL (Production):** `https://afsys.example.com/api/v1`
- **Authentication:** [Bearer token / API Key / OAuth 2.0]
- **Content-Type:** `application/json`

---

## Authentication

All endpoints (unless marked public) require an `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the `/auth/login` endpoint and expire after [X] hours.

---

## Standard Response Envelope

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [ ... ]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / Validation Error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## Endpoints

### Authentication

#### POST /auth/login

Authenticate a user and receive a JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "expiresAt": "2026-07-22T00:00:00Z"
  }
}
```

---

#### POST /auth/logout

Invalidate the current token.

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content.

---

### [Resource Group: Example — Users]

#### GET /users

List users (paginated).

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 100) |
| `search` | string | — | Filter by name or email |

**Response (200):**
```json
{
  "success": true,
  "data": [ { "id": "uuid", "email": "...", "name": "..." } ],
  "meta": { "page": 1, "pageSize": 20, "total": 45 }
}
```

---

#### POST /users

Create a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Full Name",
  "role": "member"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "email": "user@example.com", "name": "Full Name" }
}
```

---

#### GET /users/{id}

Retrieve a single user by ID.

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "email": "...", "name": "...", "createdAt": "..." }
}
```

---

#### PATCH /users/{id}

Update a user (partial update).

---

#### DELETE /users/{id}

Delete a user.

**Response (204):** No content.

---

## Rate Limiting

- **Default:** 100 requests per minute per API key.
- Rate limit headers are returned on every response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset` (Unix timestamp)

---

## Versioning

The API is versioned via the URL path (`/api/v1`). Breaking changes increment the major version. Minor/patch changes are backwards-compatible.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0.0 | 2026-06-22 | Initial API definition |
