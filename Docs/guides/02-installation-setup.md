# 🛠️ Installation & Setup

## Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** (v1.22 or higher) - **Required: Use Yarn, not npm**
- **PostgreSQL** database

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nestjs-fastify-prisma-starter
```

### 2. Install Dependencies

**This project uses Yarn as the package manager, not npm.**

```bash
yarn install

# or simply
yarn

# Dependencies are automatically installed from yarn.lock for reproducible builds
```

### 3. Environment Configuration

Copy the example environment file and customize it:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3355

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nestjs_db

# JWT
JWT_SECRET_KEY=your-secret-key-min-32-characters-required

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3355

# Logging
LOG_LEVEL=debug

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup

```bash
# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma migrate dev

# Seed the database with initial data
yarn seed
```

### 5. Start the Application

```bash
# Development mode with hot reload
yarn start:dev

# Production mode
yarn start:prod

# Debug mode
yarn start:debug
```

The application will start on `http://localhost:3355` (or your configured PORT).

## Quick Start (Experienced Developers)

```bash
git clone <repository-url>
cd nestjs-fastify-prisma-starter
yarn install
cp env.example .env
# Edit .env with your database URL and JWT secret
yarn prisma generate
yarn prisma migrate dev
yarn seed
yarn start:dev
```

## Docker Setup

### Development with Docker

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- NestJS application (hot-reload enabled)
- PostgreSQL 15-Alpine
- Redis 7-Alpine
- Adminer (database management UI)

### Production with Docker

```bash
docker-compose up --build
```

### Docker Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

## Default Test User

The seeder creates a default user for testing:

| Email            | Username | Password  |
| ---------------- | -------- | --------- |
| admin@example.com | admin    | #Pass1234 |

## Verify Installation

### 1. Check Application Health

```bash
curl http://localhost:3355/api/v1/ping
```

Expected response:
```json
{
  "message": "pong",
  "timestamp": "2025-10-21T12:00:00.000Z"
}
```

### 2. Access Swagger Documentation

Open your browser and navigate to:
```
http://localhost:3355/api/docs
```

### 3. Test Authentication

```bash
# Login
curl -X POST http://localhost:3355/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"#Pass1234"}'

# Response will include JWT token
```

## Troubleshooting

### Port Already in Use

If port 3355 is already in use:

```bash
# Change PORT in .env
PORT=3356

# Or kill the process using the port
lsof -i :3355
kill -9 <PID>
```

### Database Connection Error

Ensure PostgreSQL is running and connection string is correct:

```bash
# Test connection
psql postgresql://user:password@localhost:5432/nestjs_db
```

### Yarn Lock Issues

If you encounter yarn lock conflicts:

```bash
rm yarn.lock
yarn install
```

### Prisma Client Generation Error

```bash
# Regenerate Prisma client
yarn prisma generate

# Reset database if needed
yarn prisma migrate reset
```

## Next Steps

- Read the [API Documentation](./03-api-documentation.md)
- Check out [Architecture Decisions](./04-architecture.md)
- Review [Security Best Practices](./05-security.md)
- Explore [Development Commands](./06-development-commands.md)
