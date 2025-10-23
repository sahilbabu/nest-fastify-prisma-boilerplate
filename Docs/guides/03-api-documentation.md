# 📡 API Documentation

## API Overview

All endpoints are versioned with `/api/v1/` prefix. The API uses JWT authentication for protected routes.

## Swagger Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:3355/api/docs
```

## Authentication

### Login

**Endpoint:** `POST /api/v1/auth/login`

Request:
```json
{
  "email": "admin@example.com",
  "password": "#Pass1234"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "username": "admin"
  }
}
```

### Signup

**Endpoint:** `POST /api/v1/auth/signup`

Request:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "username": "newuser"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "new-user-id",
    "email": "newuser@example.com",
    "username": "newuser"
  }
}
```

## Health Check

### Ping

**Endpoint:** `GET /api/v1/ping`

Response:
```json
{
  "message": "pong",
  "timestamp": "2025-10-21T12:00:00.000Z"
}
```

## User Management

### Get All Users

**Endpoint:** `GET /api/v1/users`

**Authentication:** Required (JWT)

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by email or username

Response:
```json
{
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "createdAt": "2025-10-21T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### Get User by ID

**Endpoint:** `GET /api/v1/users/:id`

**Authentication:** Required (JWT)

Response:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "username": "username",
  "createdAt": "2025-10-21T12:00:00.000Z",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

### Get Current User Profile

**Endpoint:** `GET /api/v1/users/profile`

**Authentication:** Required (JWT)

Response:
```json
{
  "id": "current-user-id",
  "email": "current@example.com",
  "username": "currentuser",
  "createdAt": "2025-10-21T12:00:00.000Z",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

### Update Current User Profile

**Endpoint:** `PATCH /api/v1/users/profile`

**Authentication:** Required (JWT)

Request:
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

Response:
```json
{
  "id": "user-id",
  "email": "newemail@example.com",
  "username": "newusername",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

### Create User

**Endpoint:** `POST /api/v1/users`

**Authentication:** Required (JWT)

Request:
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "id": "new-user-id",
  "email": "newuser@example.com",
  "username": "newuser",
  "createdAt": "2025-10-21T12:00:00.000Z"
}
```

### Update User

**Endpoint:** `PATCH /api/v1/users/:id`

**Authentication:** Required (JWT)

Request:
```json
{
  "username": "updatedusername",
  "email": "updated@example.com"
}
```

Response:
```json
{
  "id": "user-id",
  "email": "updated@example.com",
  "username": "updatedusername",
  "updatedAt": "2025-10-21T12:00:00.000Z"
}
```

### Delete User

**Endpoint:** `DELETE /api/v1/users/:id`

**Authentication:** Required (JWT)

Response:
```json
{
  "message": "User deleted successfully"
}
```

## API Versioning

All endpoints are versioned with `/api/v1/` prefix. To create a new version:

1. Create a new controller with version suffix
2. Update the `@Controller()` decorator with new version
3. Register in the module

Example:
```typescript
@Controller('api/v2/users')
export class UserControllerV2 {
  // v2 endpoints
}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden - Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Error details in development mode"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634829600
```

## Authentication Headers

Include JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
  http://localhost:3355/api/v1/users
```

## Pagination

List endpoints support pagination:

```bash
# Get page 2 with 20 items per page
GET /api/v1/users?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 100,
  "page": 2,
  "limit": 20,
  "pages": 5
}
```

## Filtering & Searching

Some endpoints support filtering:

```bash
# Search users
GET /api/v1/users?search=john

# Filter by status
GET /api/v1/users?status=active
```

Check Swagger documentation for available filters per endpoint.
