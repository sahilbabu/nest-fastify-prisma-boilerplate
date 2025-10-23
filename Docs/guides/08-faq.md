# ❓ Frequently Asked Questions

## General Questions

### What is this project?

This is a production-ready NestJS backend starter template built with Fastify and Prisma. It provides a robust foundation for building scalable web applications with modern TypeScript architecture.

### Who should use this?

- Developers building Node.js/TypeScript backends
- Teams wanting a production-ready starter template
- Projects requiring high performance and type safety
- Applications needing modern development tooling

### Is this suitable for production?

Yes! This template includes:
- Security best practices
- Performance optimizations
- Docker support
- Comprehensive testing setup
- Professional development tools

## Technical Questions

### Why Fastify instead of Express?

Fastify is **2x faster** than Express with:
- Better performance metrics
- Built-in schema validation
- Plugin architecture
- First-class TypeScript support

See [Architecture Guide](./04-architecture.md#why-fastify-over-express) for details.

### Why Prisma instead of TypeORM?

Prisma offers:
- Better type safety with generated types
- Intuitive API
- Excellent developer experience
- Database-agnostic design
- Built-in migrations and seeding

### Can I use this with MySQL or SQLite?

Yes! Prisma supports multiple databases:

```prisma
# PostgreSQL (default)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# MySQL
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

# SQLite
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### How do I add a new feature module?

1. Create module directory: `src/modules/feature-name/`
2. Create controller, service, module files
3. Create DTOs in `dto/` subdirectory
4. Register module in `app.module.ts`

Example:
```bash
mkdir -p src/modules/posts/dto
touch src/modules/posts/{posts.controller,posts.service,posts.module}.ts
```

### How do I create a new database migration?

```bash
# Make changes to schema.prisma
# Then create migration
yarn prisma migrate dev --name descriptive_name

# This creates migration file and updates database
```

### Can I use MongoDB with this template?

Yes! Prisma supports MongoDB:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

However, some features may need adjustment (migrations work differently).

## Setup & Installation

### I'm getting "port already in use" error

```bash
# Find and kill process using port 3355
lsof -i :3355
kill -9 <PID>

# Or change port in .env
PORT=3356
```

### Database connection fails

Check your `.env` file:

```env
# Verify DATABASE_URL format
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Test connection
psql postgresql://user:password@localhost:5432/database_name
```

### Prisma client not generating

```bash
# Regenerate client
yarn prisma generate

# If still failing, check schema.prisma for errors
yarn prisma validate
```

### Hot reload not working

```bash
# Restart development server
yarn start:dev

# On macOS, increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Development

### How do I debug the application?

1. Press `F5` in VS Code
2. Or use `yarn start:debug`
3. Open `chrome://inspect` in Chrome
4. Click "inspect" on the Node process

### How do I run tests?

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# E2E tests
yarn test:e2e

# Coverage report
yarn test:cov
```

### How do I format code?

```bash
# Auto-format with Prettier
yarn format

# Lint and fix
yarn lint --fix
```

### Can I use the project without Docker?

Yes! Docker is optional. You can:
1. Install PostgreSQL locally
2. Set up `.env` with local database URL
3. Run `yarn start:dev`

### How do I add environment variables?

1. Add to `.env` file
2. Add to `config/config.schema.ts` for validation
3. Access via `ConfigService`:

```typescript
constructor(private configService: ConfigService) {}
const value = this.configService.get<string>('VARIABLE_NAME');
```

## Authentication & Security

### How do I implement role-based access?

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}
```

### How do I change JWT expiration?

```env
# In .env
JWT_EXPIRATION=7d  # 7 days
JWT_EXPIRATION=24h # 24 hours
JWT_EXPIRATION=30m # 30 minutes
```

### How do I implement refresh tokens?

Add to your auth service:

```typescript
generateRefreshToken(user: User): string {
  return this.jwtService.sign(
    { sub: user.id },
    { expiresIn: '7d' }
  );
}

async refreshToken(token: string): Promise<string> {
  const payload = this.jwtService.verify(token);
  return this.generateAccessToken(payload);
}
```

### How do I add OAuth (Google, GitHub)?

Use `@nestjs/passport` with strategies:

```bash
yarn add @nestjs/passport passport-google-oauth20
```

Then create strategy and controller endpoints.

## Database

### How do I seed the database?

```bash
# Run seeders
yarn seed

# Create custom seeder in prisma/seeders/
# Then run it in index.ts
```

### How do I reset the database?

```bash
# WARNING: This deletes all data
yarn prisma migrate reset

# Or manually
yarn prisma migrate resolve --rolled-back migration_name
```

### How do I backup the database?

```bash
# PostgreSQL backup
pg_dump -U user -h localhost database > backup.sql

# Restore
psql -U user -h localhost database < backup.sql
```

### How do I optimize database queries?

Use Prisma's `select` and `include`:

```typescript
// Good - fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});

// Include relations
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

## Deployment

### How do I deploy to production?

See [Deployment Guide](./07-deployment.md) for detailed instructions for:
- Railway
- Heroku
- AWS
- Google Cloud
- DigitalOcean

### How do I set up CI/CD?

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: yarn install
      - run: yarn lint
      - run: yarn test
```

### How do I monitor the application?

Integrate monitoring services:
- Sentry for error tracking
- New Relic for performance
- Datadog for infrastructure
- CloudWatch for AWS

### How do I handle zero-downtime deployments?

Use:
- Blue-green deployments
- Canary deployments
- Rolling updates with Kubernetes

## Performance

### How do I improve application performance?

1. Enable compression
2. Optimize database queries
3. Use caching (Redis)
4. Implement pagination
5. Monitor with APM tools

### How do I monitor memory usage?

```bash
# Watch memory
watch -n 1 'ps aux | grep node'

# Get detailed memory info
node -e "console.log(process.memoryUsage())"
```

### How do I scale the application?

1. **Horizontal scaling** - Run multiple instances
2. **Database replication** - Read replicas
3. **Caching** - Redis for distributed cache
4. **Load balancing** - Nginx/HAProxy
5. **Microservices** - Extract services

## Troubleshooting

### Application crashes on startup

Check logs:
```bash
yarn start:dev

# Look for error messages
# Common issues:
# - Database connection failed
# - Invalid environment variables
# - Port already in use
```

### Tests failing

```bash
# Clear Jest cache
yarn test --clearCache

# Run with verbose output
yarn test --verbose

# Run specific test
yarn test user.service
```

### Docker build fails

```bash
# Check Dockerfile syntax
docker build --no-cache -t app:latest .

# View build logs
docker build -t app:latest . 2>&1 | tail -20
```

### Memory leak suspected

```bash
# Monitor memory over time
watch -n 1 'ps aux | grep node'

# Use heap snapshot
node --inspect dist/main.js
# Then use Chrome DevTools
```

## Contributing

### How do I contribute to this project?

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

### How do I report bugs?

Create GitHub issue with:
- Description of bug
- Steps to reproduce
- Expected vs actual behavior
- Environment info

### How do I request features?

Create GitHub issue with:
- Feature description
- Use case
- Proposed implementation (optional)

## License & Legal

### What license is this project under?

MIT License - Free for commercial and personal use.

### Can I use this in production?

Yes! The MIT license allows commercial use.

### Do I need to credit the author?

Not required by license, but appreciated!

## Getting Help

- 📚 [Documentation](../guides/)
- 🐛 [GitHub Issues](https://github.com/sahilbabu/NestJS-Fastify-Prisma-Boilerplate/issues)
- 💬 [Discussions](https://github.com/sahilbabu/NestJS-Fastify-Prisma-Boilerplate/discussions)
- 📖 [Official Docs](https://docs.nestjs.com)

## Still Have Questions?

- Check the relevant guide in `Docs/guides/`
- Search existing GitHub issues
- Create a new GitHub discussion
- Refer to official framework documentation
