# 🔒 Security Best Practices

## Authentication & Authorization

### JWT Authentication

Secure token-based authentication with configurable expiration:

```typescript
// Login endpoint returns JWT token
@Post('login')
async login(@Body() credentials: LoginDto) {
  const user = await this.authService.validateUser(credentials);
  const token = this.authService.generateToken(user);
  return { access_token: token, user };
}

// Protected routes use JWT guard
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### JWT Configuration

```env
# Minimum 32 characters required
JWT_SECRET_KEY=your-very-secure-secret-key-minimum-32-chars
JWT_EXPIRATION=7d
```

### Role-Based Access Control (RBAC)

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}
```

## Password Security

### Password Hashing

Passwords are hashed with bcrypt (minimum 10 rounds):

```typescript
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements

- Minimum 8 characters
- Must contain uppercase and lowercase letters
- Must contain numbers
- Must contain special characters

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}
```

## Input Validation

### DTO Validation

All inputs validated with class-validator:

```typescript
export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Sanitization

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Trim()
  @Escape()
  username?: string;
}
```

## Rate Limiting

Protect endpoints from abuse with throttling:

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  // Protected by rate limiting
  // Default: 100 requests per 15 minutes
}
```

Custom rate limits:

```typescript
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('login')
async login(@Body() credentials: LoginDto) {
  return this.authService.login(credentials);
}
```

## Security Headers

### Helmet Configuration

Enhanced HTTP security headers:

```typescript
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:', 'https:'],
      scriptSrc: [`'self'`],
      frameSrc: [`'none'`],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

### Headers Explained

- **Content-Security-Policy** - Prevents XSS attacks
- **X-Frame-Options** - Prevents clickjacking
- **X-Content-Type-Options** - Prevents MIME sniffing
- **Strict-Transport-Security** - Enforces HTTPS
- **Referrer-Policy** - Controls referrer information

## CORS Configuration

### Environment-Aware CORS

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
});
```

### Configuration

```env
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3355,https://example.com
```

## Environment Variables

### Security Best Practices

1. **Never commit .env files**
   ```bash
   # .gitignore
   .env
   .env.*.local
   ```

2. **Use ConfigService for all configuration**
   ```typescript
   // ✅ Good
   constructor(private configService: ConfigService) {}
   const secret = this.configService.get<string>('JWT_SECRET_KEY');

   // ❌ Bad
   const secret = 'hardcoded-secret';
   ```

3. **Validate environment variables on startup**
   ```typescript
   // config.schema.ts
   export const configSchema = z.object({
     DATABASE_URL: z.string().url(),
     JWT_SECRET_KEY: z.string().min(32),
     NODE_ENV: z.enum(['development', 'production']),
   });
   ```

4. **Use different configs for different environments**
   ```env
   # .env.development
   LOG_LEVEL=debug
   DEBUG=true

   # .env.production
   LOG_LEVEL=error
   DEBUG=false
   ```

## SQL Injection Prevention

### Prisma Protection

Prisma automatically prevents SQL injection through parameterized queries:

```typescript
// ✅ Safe - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ❌ Never use raw SQL with user input
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### Best Practices

- Always use Prisma's query builder
- Never concatenate user input into queries
- Use parameterized queries if raw SQL is necessary
- Validate and sanitize all inputs

## Sensitive Data Protection

### Never Log Sensitive Information

```typescript
// ❌ Bad
this.logger.log('User password:', user.password);

// ✅ Good
this.logger.log('User created', { userId: user.id, email: user.email });
```

### Exclude Sensitive Fields from Responses

```typescript
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  passwordResetToken: string;
}
```

### Error Messages

```typescript
// ❌ Bad - exposes internal details
throw new Error(`Database error: ${error.message}`);

// ✅ Good - generic message
throw new InternalServerErrorException('An error occurred');
```

## HTTPS/TLS

### Production Deployment

Always use HTTPS in production:

```typescript
// Enforce HTTPS redirect
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

### Certificate Management

- Use Let's Encrypt for free certificates
- Automate certificate renewal
- Use strong TLS versions (1.2+)

## API Security Checklist

- ✅ JWT authentication implemented
- ✅ Password hashing with bcrypt
- ✅ Input validation on all endpoints
- ✅ Rate limiting configured
- ✅ Security headers set (Helmet)
- ✅ CORS configured restrictively
- ✅ Environment variables secured
- ✅ Error messages don't expose sensitive info
- ✅ SQL injection prevention (Prisma)
- ✅ HTTPS enforced in production
- ✅ Sensitive fields excluded from responses
- ✅ Logging doesn't contain sensitive data

## Security Monitoring

### Logging

Monitor security events:

```typescript
// Log authentication attempts
this.logger.log('User login attempt', { email, ip: req.ip });

// Log authorization failures
this.logger.warn('Unauthorized access attempt', { userId, resource });

// Log suspicious activity
this.logger.error('Multiple failed login attempts', { email, attempts });
```

### Error Handling

Implement global exception filter:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error securely
    // Return generic error message to client
    // Don't expose stack traces in production
  }
}
```

## Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
yarn audit

# Update dependencies
yarn upgrade

# Fix vulnerabilities
yarn audit fix
```

### Use Renovate

Automated dependency updates:

```json
{
  "extends": ["config:base"],
  "automerge": true,
  "major": {
    "automerge": false
  }
}
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Fastify Security](https://www.fastify.io/docs/latest/Guides/Security/)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#security)
