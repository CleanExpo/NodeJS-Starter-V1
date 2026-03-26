# API Route Reference

Complete documentation of all API endpoints in CleanExpo/NodeJS-Starter-V1.

**Last Updated:** 2026-03-24
**How to Update:** Use `/generate-route-reference` command or manually edit this file

---

## Route Categories

1. [Authentication](#authentication) — Login, signup, session management
2. [Users](#users) — User profile and account management
3. [Data](#data) — Core data endpoints
4. [Admin](#admin) — Administrative functions
5. [System](#system) — Health checks and system info

---

## Authentication

### POST /api/auth/login

**Description:** Authenticate a user and create a session

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

**Status Codes:**
- `200` — Login successful
- `401` — Invalid credentials
- `400` — Missing required fields

---

### POST /api/auth/signup

**Description:** Create a new user account

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

**Status Codes:**
- `201` — User created
- `409` — User already exists
- `400` — Invalid input

---

### POST /api/auth/logout

**Description:** Logout current user and invalidate session

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

**Status Codes:**
- `200` — Logout successful
- `401` — Not authenticated

---

## Users

### GET /api/users/:id

**Description:** Retrieve user profile information

**Headers:** `Authorization: Bearer {token}`

**URL Parameters:**
- `id` (string) — User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200` — User found
- `404` — User not found
- `401` — Not authenticated

---

### PUT /api/users/:id

**Description:** Update user profile

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "newemail@example.com",
    "name": "Updated Name"
  }
}
```

**Status Codes:**
- `200` — User updated
- `404` — User not found
- `401` — Not authenticated
- `400` — Invalid input

---

## Data

*Add your core data endpoints here (resources, collections, etc.)*

### GET /api/data

**Description:** List all data items

**Query Parameters:**
- `page` (number) — Page number (default: 1)
- `limit` (number) — Items per page (default: 20)
- `sort` (string) — Sort field (default: createdAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of data items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## Admin

*Add administrative endpoints here (user management, system settings, etc.)*

### GET /api/admin/health

**Description:** System health check (admin only)

**Headers:** `Authorization: Bearer {admin-token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "checks": {
      "database": "ok",
      "cache": "ok"
    }
  }
}
```

---

## System

### GET /api/health

**Description:** Public system health check

**Response:**
```json
{
  "success": true,
  "data": { "status": "healthy" }
}
```

---

### GET /api/version

**Description:** Get application version info

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

## Error Reference

**Common error codes:**

| Code | Status | Meaning |
|------|--------|----------|
| `AUTH_REQUIRED` | 401 | Authentication token missing or invalid |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_INPUT` | 400 | Request validation failed |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `SERVER_ERROR` | 500 | Unexpected server error |

**Error response format:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Contributing to This Reference

When you add new routes:

1. Document in this file using the template above
2. Include request/response examples
3. List all status codes
4. Note any authentication requirements
5. Run `/generate-route-reference` to auto-sync if you have a script for it

---

**Sync Status:** Manual (use `/generate-route-reference` to regenerate from code)
