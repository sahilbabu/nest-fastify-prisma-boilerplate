# Unified Response & Error Format Guide

## Overview

This project implements a **unified response and error format** across all API endpoints for consistency, predictability, and better client integration.

### Key Features

✅ **Unified Success Response Format** - All endpoints return consistent response structure  
✅ **Unified Error Format** - All errors follow the same format  
✅ **Automatic Wrapping** - ResponseInterceptor handles wrapping automatically  
✅ **Type-Safe** - Full TypeScript support with generics  
✅ **Pagination Support** - Built-in pagination metadata  
✅ **Zero Breaking Changes** - Works with existing code  

---

## Success Response Format

### Standard Response Structure

All successful responses follow this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-10-21T18:30:00.000Z",
    "path": "/api/v1/users/profile",
    "version": "1.0"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses (2xx status codes) |
| `statusCode` | number | HTTP status code (200, 201, etc.) |
| `message` | string | Human-readable success message |
| `data` | T \| undefined | The actual response data (generic type) |
| `meta` | IResponseMeta | Metadata about the response |
| `pagination` | IPaginationMeta \| undefined | Pagination info (only for paginated endpoints) |

### Metadata Structure

```typescript
interface IResponseMeta {
  timestamp: string;      // ISO-8601 format
  path: string;           // Request path
  version?: string;       // API version
}
```

### Pagination Structure

```typescript
interface IPaginationMeta {
  total: number;          // Total items in database
  page: number;           // Current page number
  limit: number;          // Items per page
  totalPages: number;     // Total number of pages
}
```

---

## Error Response Format

### Standard Error Structure

All errors follow this unified format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-10-21T18:30:00.000Z",
  "message": "Validation failed",
  "path": "/api/v1/users",
  "code": "P2002",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  },
  "details": {
    "originalMessage": "...",
    "meta": { }
  }
}
```

### Error Fields

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | number | HTTP status code (400, 401, 500, etc.) |
| `timestamp` | string | ISO-8601 timestamp |
| `message` | string | Error message |
| `path` | string | Request path |
| `code` | string \| undefined | Error code (e.g., Prisma error code) |
| `errors` | object | Field-level error details |
| `details` | object | Additional error context (dev only) |

### Error Handling

The `HttpExceptionFilter` automatically handles:

- **Prisma Errors** - All Prisma error codes (P1xxx, P2xxx, etc.)
- **Validation Errors** - class-validator errors
- **HTTP Exceptions** - NestJS built-in exceptions
- **Generic Errors** - Fallback for unknown errors
- **Environment-Aware** - Detailed errors in dev, sanitized in production

---

## Usage Examples

### Basic Controller Response

Controllers automatically wrap responses via the `ResponseInterceptor`:

```typescript
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    // Service returns data with optional message
    return {
      message: 'Profile retrieved successfully',
      id: user.id,
      name: user.name,
      email: user.email,
    };
    
    // Interceptor automatically wraps to:
    // {
    //   success: true,
    //   statusCode: 200,
    //   message: 'Profile retrieved successfully',
    //   data: { id, name, email },
    //   meta: { timestamp, path, version }
    // }
  }
}
```

### Using ResponseBuilder for Explicit Responses

For more control, use the `ResponseBuilder` utility:

```typescript
import { ResponseBuilder } from '@/common/utils/response.builder';

@Controller('users')
export class UserController {
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    const userData = { id: user.id, name: user.name };
    
    // Explicit response building
    return ResponseBuilder.success(
      userData,
      'Profile retrieved successfully',
      200,
      '/api/v1/users/profile'
    );
  }
}
```

### Paginated Response

```typescript
@Controller('users')
export class UserController {
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const [users, total] = await this.userService.findAllWithCount(
      query.page,
      query.limit
    );
    
    return ResponseBuilder.paginated(
      users,
      total,
      query.page,
      query.limit,
      'Users retrieved successfully'
    );
    
    // Returns:
    // {
    //   success: true,
    //   statusCode: 200,
    //   message: 'Users retrieved successfully',
    //   data: [...users],
    //   meta: { ... },
    //   pagination: {
    //     total: 100,
    //     page: 1,
    //     limit: 10,
    //     totalPages: 10
    //   }
    // }
  }
}
```

### Empty Response (Delete/No Content)

```typescript
@Controller('users')
export class UserController {
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.userService.delete(id);
    
    return ResponseBuilder.empty('User deleted successfully', 200);
  }
}
```

### Service Response

Services can return data with optional message:

```typescript
@Injectable()
export class UserService {
  async updateProfile(
    user: User,
    dto: UpdateProfileDto
  ): Promise<{ message: string; user: User }> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
    
    return {
      message: 'Profile updated successfully',
      user: updated,
    };
  }
}
```

---

## ResponseBuilder API

### Methods

#### `ResponseBuilder.success<T>(data, message?, statusCode?, path?)`

Create a success response with data.

```typescript
ResponseBuilder.success(
  { id: 1, name: 'John' },
  'User created',
  201,
  '/api/v1/users'
);
```

#### `ResponseBuilder.paginated<T>(data, total, page, limit, message?, statusCode?, path?)`

Create a paginated response.

```typescript
ResponseBuilder.paginated(
  users,
  100,
  1,
  10,
  'Users retrieved',
  200,
  '/api/v1/users'
);
```

#### `ResponseBuilder.withMeta<T>(data, message?, meta, statusCode?)`

Create a response with custom metadata.

```typescript
ResponseBuilder.withMeta(
  data,
  'Success',
  {
    timestamp: dayjs().format(),
    path: '/api/v1/custom',
    version: '2.0',
  },
  200
);
```

#### `ResponseBuilder.paginatedWithMeta<T>(data, total, page, limit, meta, message?, statusCode?)`

Create a paginated response with custom metadata.

```typescript
ResponseBuilder.paginatedWithMeta(
  users,
  100,
  1,
  10,
  customMeta,
  'Users retrieved',
  200
);
```

#### `ResponseBuilder.empty(message?, statusCode?, path?)`

Create an empty response (for delete/no content operations).

```typescript
ResponseBuilder.empty('User deleted', 200);
```

---

## Response DTO

### ResponseDto Class

```typescript
export class ResponseDto<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | undefined;
  meta: IResponseMeta | undefined;
  pagination: IPaginationMeta | undefined;
}
```

### Type-Safe Usage

```typescript
// With specific type
const response: ResponseDto<User> = ResponseBuilder.success(user);

// With generic type
function handleResponse<T>(data: T): ResponseDto<T> {
  return ResponseBuilder.success(data);
}
```

---

## How It Works

### ResponseInterceptor Flow

1. **Request comes in** → Controller processes request
2. **Controller returns data** → ResponseInterceptor intercepts
3. **Interceptor checks response**:
   - If already `ResponseDto` instance → return as-is
   - If has `message` field → extract and wrap
   - Otherwise → wrap with default message
4. **Interceptor adds metadata** → timestamp, path, version
5. **Response sent to client** → Unified format

### Automatic Wrapping

The interceptor automatically extracts the `message` field from responses:

```typescript
// Controller returns
{ message: 'Success', user: { id: 1 } }

// Interceptor transforms to
{
  success: true,
  statusCode: 200,
  message: 'Success',
  data: { user: { id: 1 } },
  meta: { ... }
}
```

---

## Best Practices

### ✅ DO

- Use `ResponseBuilder` for explicit control over responses
- Include meaningful messages in responses
- Use pagination for list endpoints
- Return `ResponseDto` instances from services when needed
- Use proper HTTP status codes (201 for create, 204 for delete, etc.)

### ❌ DON'T

- Don't manually construct response objects (let interceptor handle it)
- Don't include sensitive data in responses
- Don't forget to handle pagination for large datasets
- Don't use generic error messages
- Don't mix response formats across endpoints

---

## Migration Guide

### For Existing Endpoints

No changes required! The `ResponseInterceptor` automatically wraps all responses.

**Before:**
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return { id: user.id, name: user.name };
}
```

**After (automatic):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { "id": 1, "name": "John" },
  "meta": { "timestamp": "...", "path": "...", "version": "1.0" }
}
```

### For New Endpoints

Use `ResponseBuilder` for explicit control:

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return ResponseBuilder.success(
    { id: user.id, name: user.name },
    'Profile retrieved successfully'
  );
}
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/common/dto/response.dto.ts` | Response DTO and interfaces |
| `src/common/interceptors/response.interceptor.ts` | Global response interceptor |
| `src/common/utils/response.builder.ts` | Response builder utilities |
| `src/common/filters/http-exception.filter.ts` | Error handling filter |
| `src/common/utils/bootstrap.util.ts` | Bootstrap configuration |

---

## Troubleshooting

### Response not wrapped?

Ensure `setupGlobalInterceptors()` is called in `main.ts`:

```typescript
setupGlobalInterceptors(app);
```

### Custom response not working?

Return a `ResponseDto` instance directly:

```typescript
return new ResponseDto(200, 'Custom message', data, meta);
```

### Pagination not showing?

Use `ResponseBuilder.paginated()`:

```typescript
return ResponseBuilder.paginated(data, total, page, limit);
```

---

## See Also

- [Error Handling Guide](./05-error-handling.md)
- [API Documentation](./03-api-documentation.md)
- [Project Structure](./01-project-structure.md)
