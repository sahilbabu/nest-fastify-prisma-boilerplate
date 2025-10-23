# 🏗️ Architecture & Design Decisions

## Technology Stack

| Component | Technology | Version | Why? |
|-----------|-----------|---------|------|
| Framework | NestJS | 11.1+ | Progressive, modular, TypeScript-first |
| HTTP Server | Fastify | 4.x | 2x faster than Express, better performance |
| ORM | Prisma | 6.15+ | Type-safe, intuitive, great DX |
| Database | PostgreSQL | 15+ | Robust, reliable, feature-rich |
| Language | TypeScript | 5.9+ | Type safety, better tooling, fewer bugs |
| Package Manager | Yarn | 1.22+ | Faster, more reliable than npm |

## Architecture Pattern

### Modular Architecture

The application follows a **feature-based modular architecture**:

```
src/
├── common/          # Shared across all modules
├── core/            # Core services (config, logger, prisma)
├── modules/         # Feature modules (auth, user, etc.)
└── main.ts          # Entry point
```

Each feature module is self-contained:
- Controllers (HTTP endpoints)
- Services (business logic)
- DTOs (data validation)
- Module configuration

### Dependency Injection

NestJS's built-in DI container manages dependencies:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

Benefits:
- Loose coupling
- Easy testing with mocks
- Centralized dependency management

## Why Fastify over Express?

### Performance

Fastify is **2x faster** than Express:

| Metric | Express | Fastify |
|--------|---------|---------|
| Req/Sec | 15,640 | 32,030 |
| Bytes/Sec | 3.38 MB | 4.87 MB |

### Features

- **Schema-based validation** - Built-in JSON schema validation
- **Plugin architecture** - Modular and extensible
- **TypeScript support** - First-class TypeScript support
- **Streaming** - Better streaming support
- **Hooks** - Lifecycle hooks for request/response

### Configuration

```typescript
// main.ts
const app = await NestFactory.create(
  AppModule,
  new FastifyAdapter({
    bodyLimit: 10485760, // 10MB
    trustProxy: true,
  }),
);
```

## Why Prisma?

### Type Safety

Prisma generates TypeScript types from your schema:

```typescript
// Fully typed - no 'any' types
const user: User = await prisma.user.findUnique({
  where: { id: 'user-id' },
});
```

### Developer Experience

- **Intuitive API** - Easy to learn and use
- **Prisma Studio** - GUI for database management
- **Migrations** - Version control for schema changes
- **Seeding** - Built-in data population

### Database Agnostic

Switch databases with minimal changes:
- PostgreSQL
- MySQL
- SQLite
- SQL Server
- MongoDB

## Core Services

### Configuration Service

Centralized configuration with **Zod validation**:

```typescript
// config/config.schema.ts
export const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET_KEY: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production']),
});

// Usage
constructor(private configService: ConfigService) {}
const dbUrl = this.configService.get<string>('DATABASE_URL');
```

Benefits:
- Type-safe configuration
- Validation at startup
- Environment-specific configs

### Logger Service

Winston-based structured logging:

```typescript
// Usage
this.logger.log('User created', { userId: 'id', email: 'user@example.com' });
this.logger.error('Database error', error);
```

Features:
- Structured logging
- Multiple transports
- Performance metrics
- Log levels

### Prisma Service

Centralized ORM management:

```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
```

## Security Architecture

### Authentication

JWT-based authentication with guards:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Authorization

Role-based access control:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}
```

### Input Validation

Class-validator with DTOs:

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Security Headers

Helmet for HTTP security headers:

```typescript
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
    },
  },
});
```

## Data Flow

```
Request
  ↓
Middleware (CORS, Helmet, etc.)
  ↓
Guards (Authentication, Authorization)
  ↓
Pipes (Validation)
  ↓
Controller (Route handler)
  ↓
Service (Business logic)
  ↓
Prisma (Database)
  ↓
Response
  ↓
Interceptors (Transform response)
  ↓
Client
```

## Database Design

### Schema Organization

Schemas are split by feature in `prisma/schemas/`:

```prisma
// schema.prisma - Main configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// user.prisma - User models
model User {
  id    String  @id @default(cuid())
  email String  @unique
  name  String?
}
```

### Migrations

Version-controlled schema changes:

```bash
# Create migration
yarn prisma migrate dev --name add_user_role

# Apply in production
yarn prisma migrate deploy
```

## Testing Strategy

### Unit Tests

Test individual services and controllers:

```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create(createUserDto);
    expect(user.email).toBe(createUserDto.email);
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
describe('User API (e2e)', () => {
  it('POST /users should create user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send(createUserDto)
      .expect(201);
  });
});
```

## Performance Optimizations

### Compression

Adaptive gzip/brotli compression:

```typescript
await app.register(require('@fastify/compress'), {
  threshold: 1024,
});
```

### Connection Pooling

Optimized database connections:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Caching

Redis for caching:

```typescript
@Cacheable()
async getUser(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

### Query Optimization

Prisma select/include for efficient queries:

```typescript
// Good - fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});

// Bad - fetches all fields
const users = await prisma.user.findMany();
```

## Deployment Architecture

### Docker

Multi-stage builds for production:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install && yarn build

# Runtime stage
FROM node:18-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]
```

### Environment-Based Configuration

Different configs for different environments:

```env
# Development
NODE_ENV=development
LOG_LEVEL=debug

# Production
NODE_ENV=production
LOG_LEVEL=error
```

## Scalability Considerations

- **Horizontal scaling** - Stateless design allows multiple instances
- **Database replication** - PostgreSQL replication for high availability
- **Caching layer** - Redis for distributed caching
- **Load balancing** - Nginx/HAProxy for request distribution
- **Microservices** - Modular design allows service extraction
