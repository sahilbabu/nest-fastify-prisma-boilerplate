# 🔧 Development Commands

## Running the Application

### Development Mode

```bash
# Start with hot reload
yarn start:dev

# Watch for changes and restart automatically
# Includes source maps for debugging
```

### Production Mode

```bash
# Build for production
yarn build

# Start production server
yarn start:prod

# Or build and start in one command
yarn build && yarn start:prod
```

### Debug Mode

```bash
# Start with debugger
yarn start:debug

# Then open chrome://inspect in Chrome
# Or use VS Code debugger (F5)
```

## Code Quality & Formatting

### Linting

```bash
# Check for linting errors
yarn lint

# Fix linting errors automatically
yarn lint --fix

# Check specific file
yarn lint src/app.module.ts
```

### Code Formatting

```bash
# Format all code with Prettier
yarn format

# Check if code is formatted
yarn format:check

# Format specific file
yarn format src/app.module.ts
```

### Type Checking

```bash
# Check TypeScript types
yarn tsc --noEmit

# Build with type checking
yarn build
```

## Testing

### Unit Tests

```bash
# Run all unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run specific test file
yarn test user.service

# Run tests with coverage
yarn test:cov

# Debug tests
yarn test:debug
```

### E2E Tests

```bash
# Run E2E tests
yarn test:e2e

# Run E2E tests in watch mode
yarn test:e2e --watch

# Run specific E2E test
yarn test:e2e app.e2e-spec
```

### Coverage Reports

```bash
# Generate coverage report
yarn test:cov

# Coverage report is in coverage/ directory
# Open coverage/lcov-report/index.html in browser
```

## Database Operations

### Prisma Commands

```bash
# Generate Prisma client
yarn prisma generate

# Open Prisma Studio (GUI)
yarn prisma studio

# Create a new migration
yarn prisma migrate dev --name add_user_role

# Apply migrations
yarn prisma migrate deploy

# Reset database (WARNING: deletes all data)
yarn prisma migrate reset

# Push schema changes without migrations
yarn prisma db push

# Validate schema
yarn prisma validate

# Format schema
yarn prisma format
```

### Database Seeding

```bash
# Run seeders
yarn seed

# Seed specific data
yarn seed:users

# Reset and seed
yarn prisma migrate reset --skip-generate && yarn seed
```

## Docker Development

### Development Environment

```bash
# Start development environment with Docker
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild images
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment

```bash
# Build and start production environment
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### Docker Utilities

```bash
# Access app container shell
docker-compose exec app sh

# Access database container
docker-compose exec postgres psql -U postgres -d nestjs_db

# View container stats
docker stats

# Remove all containers and volumes
docker-compose down -v
```

## Building

### Production Build

```bash
# Build application
yarn build

# Build output is in dist/ directory
```

### Docker Build

```bash
# Build Docker image
docker build -t nestjs-app:latest .

# Build development image
docker build -f Dockerfile.dev -t nestjs-app:dev .

# Run image
docker run -p 3355:3355 nestjs-app:latest
```

## Cleaning Up

```bash
# Remove build artifacts
yarn clean

# Remove node_modules
rm -rf node_modules

# Clear Prisma cache
yarn prisma generate --skip-engine-check

# Clear Jest cache
yarn test --clearCache

# Remove Docker containers and volumes
docker-compose down -v
```

## VS Code Integration

### Keyboard Shortcuts

- **F5** - Start debugging
- **Ctrl+Shift+P** - Open command palette
- **Ctrl+Shift+B** - Run build task
- **Ctrl+Shift+T** - Run test task
- **Ctrl+S** - Save (auto-formats code)

### Available Tasks

Open command palette (Ctrl+Shift+P) and search for:

- **Tasks: Run Task** - See all available tasks
- **Build** - Build the project
- **Test** - Run tests
- **Docker: Start** - Start Docker containers
- **Docker: Stop** - Stop Docker containers

### Debug Configurations

Press F5 to start debugging:

- **Debug App** - Debug main application
- **Debug Tests** - Debug unit tests
- **Debug E2E** - Debug E2E tests

## Environment Management

### Environment Files

```bash
# Copy example environment
cp env.example .env

# Create development environment
cp env.example .env.development

# Create production environment
cp env.example .env.production
```

### Switch Environments

```bash
# Development
NODE_ENV=development yarn start:dev

# Production
NODE_ENV=production yarn start:prod
```

## Useful Development Scripts

### Custom Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "yarn start:dev",
    "prod": "yarn build && yarn start:prod",
    "db:reset": "yarn prisma migrate reset --skip-generate && yarn seed",
    "db:studio": "yarn prisma studio",
    "quality": "yarn lint && yarn format && yarn test",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:prod": "docker-compose up --build"
  }
}
```

Usage:

```bash
yarn dev          # Start development
yarn prod         # Build and start production
yarn db:reset     # Reset database
yarn db:studio    # Open Prisma Studio
yarn quality      # Run all quality checks
yarn docker:dev   # Start Docker dev environment
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3355
lsof -i :3355

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3356
```

### Module Not Found

```bash
# Regenerate Prisma client
yarn prisma generate

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql postgresql://user:password@localhost:5432/nestjs_db

# Reset migrations
yarn prisma migrate reset

# Check DATABASE_URL in .env
```

### Hot Reload Not Working

```bash
# Restart development server
yarn start:dev

# Check file watcher limit (macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Memory Issues

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 yarn start:dev

# Check memory usage
node --max-old-space-size=4096 dist/main.js
```

## Performance Monitoring

### Boot Time

Application logs boot time on startup:

```
[Nest] 12345  - 10/21/2025, 12:00:00 PM     LOG [NestFactory] Nest application successfully started in 1234ms
```

### Memory Usage

Monitor memory usage:

```bash
# Watch memory in real-time
watch -n 1 'ps aux | grep node'

# Get detailed memory info
node -e "console.log(process.memoryUsage())"
```

### Request Profiling

Enable request logging:

```env
LOG_LEVEL=debug
```

Logs will include request timing information.

## Continuous Integration

### GitHub Actions

Example CI workflow:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn lint
      - run: yarn test
      - run: yarn test:e2e
```

## Performance Tips

1. **Use watch mode during development** - Faster feedback loop
2. **Enable source maps** - Easier debugging
3. **Use Prisma Studio** - Visual database management
4. **Monitor memory usage** - Catch memory leaks early
5. **Use Docker for consistency** - Same environment as production
6. **Run tests frequently** - Catch bugs early
7. **Use linting** - Catch code issues before runtime
