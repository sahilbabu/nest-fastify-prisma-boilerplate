<h1 align="center">🚀 <a href="http://nodejs.org" target="_blank">NestJS</a> <a href="https://www.fastify.io/" target="_blank">Fastify</a> <a href="https://www.prisma.io/" target="_blank">Prisma</a> <a href="https://www.postgresql.org/" target="_blank">PostgreSQL</a> Starter</h1>

<p align="center">
  <a href="https://github.com/vndevteam/nestjs-boilerplate/actions/workflows/ci.yml" target="_blank"><img src="https://github.com/vndevteam/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg" alt="Build & run test passing" /></a>
  <a href="https://app.renovatebot.com/dashboard" target="_blank"><img src="https://img.shields.io/badge/renovate-enabled-%231A1F6C?logo=renovatebot" alt="renovate enabled" /></a>
  <a href="https://github.com/sahilbabu" target="_blank"><img src="https://img.shields.io/badge/supported_by-sahilbabu-d91965?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTMwIiBoZWlnaHQ9IjE4NyIgdmlld0JveD0iMCAwIDEzMCAxODciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BCjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83NzExXzQ4OTEpIj4KPHBhdGggZD0iTTc1Ljk5NjcgNDUuNzUwNkM2NS4xMDg5IDQ2Ljg2MSA1Ny45MjMgNTguNDA5NyA2Mi4yNzgxIDY4Ljg0OEwxMDguNDQyIDE4N0w3My42MDEzIDE1NS4wMTlIMzQuODQwOUMyMC42ODY4IDE1NS4wMTkgOS4zNjM0OSAxNDMuNDcgOS4zNjM0OSAxMjkuMDM0Vjk0LjYxMDVDOS4zNjM0OSA5Mi4xNjc1IDguNDkyNDYgODkuNzI0NSA2Ljc1MDQyIDg3Ljk0NzdMMCA4MS4wNjNMNi43NTA0MiA3NC4xNzgxQzguNDkyNDYgNzIuNDAxNCA5LjM2MzQ5IDY5Ljk1ODQgOS4zNjM0OSA2Ny41MTU0VjMxLjA5MjZDOS4zNjM0OSAxMy43Njk2IDIzLjA4MjEgMCAzOS44NDkyIDBINTguMTQwN0w3NS45OTY3IDQ1Ljc1MDZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTI1LjY0NiAxMTIuMzc4Vjk0LjgzMjdDMTI1LjY0NiA5My43MjIyIDEyNi4wODEgOTIuNjExOCAxMjYuOTUyIDkxLjcyMzRMMTMwLjAwMSA4OC4zOTIxTDEyNi45NTIgODUuMDYwN0MxMjYuMDgxIDg0LjE3MjQgMTI1LjY0NiA4My4wNjE5IDEyNS42NDYgODEuOTUxNFY2OS43MzY1QzEyNS42NDYgNTYuNDExMSAxMTQuOTc2IDQ1Ljc1MDcgMTAyLjEyOCA0NS43NTA3SDc1Ljk5NzNMMTA1LjYxMiAxMzAuODExQzEwNS42MTIgMTMwLjgxMSAxMTAuNjIgMTMwLjgxMSAxMTAuODM4IDEzMC44MTFDMTE5LjExMyAxMjkuMDM1IDEyNS42NDYgMTIxLjQ4NCAxMjUuNjQ2IDExMi4zNzhaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c%2BCjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzc3MTFfNDg5MSI%2BCjxyZWN0IHdpZHRoPSIxMzAiIGhlaWdodD0iMTg3IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM%2BCjwvc3ZnPgo%3D&logoColor=d91965" alt="supported by sahilbabu" /></a>
</p>


A **high-performance**, **production-ready RESTful API boilerplate** built with **[NestJS](https://nestjs.com/)**, **[Fastify](https://www.fastify.io/)**, and **[Prisma](https://www.prisma.io/)**.  
It provides a **robust**, **scalable foundation** for building **modern TypeScript web applications** with **clean architecture** and **industry best practices**.


[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1+-red.svg)](https://nestjs.com/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-black.svg)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15+-green.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 🛠️ Technology Stack

| Component | Technology | Version | Intro |
|-----------|-----------|---------|-------|
| Framework | NestJS | 11.1+ | Progressive Node.js framework with TypeScript support |
| HTTP Server | Fastify | 4.x | 2x faster than Express with better performance |
| ORM | Prisma | 6.15+ | Type-safe ORM with excellent developer experience |
| Database | PostgreSQL | 15+ | Robust relational database |
| Language | TypeScript | 5.9+ | Strong Type Safety |
| Package Manager | Yarn | 1.22+ | Yarn is faster, especially Yarn Berry (v2+) |

## ✨ Features

### 🏗️ Core Features 
- ✅ **Authentication** — sign up & sign in via email and password using **JWT + PassportJS**
- ✅ **Internationalization (i18n)** — multi-language support powered by [`nestjs-i18n`](https://github.com/ToonvanStrijp/nestjs-i18n)
- ✅ **API Documentation** — interactive API docs using **Swagger UI**
- ✅ **Database Seeding** — prepopulate your database with test or default data
- ✅ **Mailing System** — built-in email service for notifications and verifications using (@nestjs-modules/mailer & nodemailer).
- ✅ **Pagination** — supports both **Offset** and **Cursor-based** pagination
- ✅ **Environment Configuration** — fully isolated configs for **development**, **staging**, and **production**
- ✅ **Storage** — file storage with support for multiple drivers (Local filesystem storage, Amazon S3, Wasabi (S3-compatible), Azure Blob Storage)
- ✅ **Logger** — structured logging with Winston
- ✅ **Husky** — git hooks for pre-commit and pre-push
- ✅ **Renovate** — automated dependency updates
- ✅ **Unified Response Format System** — consistent response format for all API responses
- ✅ **Error Format System** — consistent error format for all API responses
- ✅ **API Versioning** — backward compatibility for evolving APIs
- ✅ **Docker** — ready-to-use Docker setup for both dev & prod environments
- ✅ **E2E and unit tests** — with Jest testing framework

### 🤞 Checklist Features
- [x] **RBAC** Module  Role-Based Access Control (RBAC) Module
- [ ] **Caching** Module with Redis
- [ ] **CI/CD** (Github Actions) Pipeline
- [ ] **Social** sign in (Apple, Facebook, Google, Twitter). 
- [ ] **notifications** webhook notifications

### ⚙️ Architecture & Performance
- ⚡ **High-performance Fastify adapter** — optimized for speed and low overhead
- 🔒 **Security-first setup** — includes **Helmet**, **CORS**, and **Content Security Policy (CSP)**
- 📦 **Smart compression** — automatic gzip & Brotli compression
- 🎯 **Full TypeScript support** — strict mode enabled for maximum type safety
- 🔄 **Hot Reloading** — fast development workflow with real-time updates
- 📊 **Advanced Logging** — integrated **Winston logger** for structured logs
- 💾 **Real-time Monitoring** — memory usage and performance insights


### 🔐 Authentication & Authorization
- 🔑 **JWT-based Authentication** — stateless and secure token management
- 🧩 **Role-based Authorization** — easy role and permission handling
- 📝 **Comprehensive Input Validation** — DTOs validated with `class-validator` and `class-transformer`
- 🌍 **Internationalization Support** — user-friendly error messages and localization across modules

### 💻 Developer Experience
- 🧪 **Testing with Jest** — unit and e2e test setup ready out of the box
- 📏 **Strict ESLint Rules** — enforced code quality and style consistency
- 🎨 **Auto-formatting** — integrated **Prettier** for clean, consistent code
- 🔧 **Zod Schema Validation** — environment and config validation
- 📚 **API Versioning** — backward compatibility for evolving APIs
- 🐳 **Docker Support** — ready-to-use Docker setup for both dev & prod environments
- ⚡ **VS Code Integration** — built-in debugging and task configuration

> ⚡ **Designed for performance. Built for scalability. Perfected for developer happiness.**

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Yarn (not npm)
- PostgreSQL

### Installation

```bash
# Clone and setup
git clone <repository-url>
cd nestjs-fastify-prisma-starter
yarn install

# Configure environment
cp env.example .env
# Edit .env with your database URL and JWT secret

# Setup database
yarn prisma generate
yarn prisma migrate dev
yarn seed

# Start development
yarn start:dev
```

Access the application at `http://localhost:3355`

Swagger API docs: `http://localhost:3355/api/docs`

## 📚 Documentation

Comprehensive documentation is organized in `Docs/guides/`:

| Guide | Description |
|-------|-------------|
| **[Installation & Setup](./Docs/guides/02-installation-setup.md)** | Step-by-step setup guide with Docker |
| **[Project Structure](./Docs/guides/01-project-structure.md)** | Codebase organization and conventions |
| **[API Documentation](./Docs/guides/03-api-documentation.md)** | Complete API reference |
| **[Architecture](./Docs/guides/04-architecture.md)** | Design decisions and patterns |
| **[Security](./Docs/guides/05-security.md)** | Security best practices |
| **[Development Commands](./Docs/guides/06-development-commands.md)** | All dev commands and workflows |
| **[Deployment](./Docs/guides/07-deployment.md)** | Production deployment guide |
| **[FAQ](./Docs/guides/08-faq.md)** | Common questions and troubleshooting |

👉 **[Full Documentation Index](./Docs/guides/INDEX.md)**

## 🔧 Essential Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugger

# Testing
yarn test               # Run unit tests
yarn test:e2e          # Run E2E tests
yarn test:cov          # Coverage report

# Code Quality
yarn lint              # Check linting
yarn format            # Auto-format code

# Database
yarn prisma studio    # Open database GUI
yarn prisma migrate dev --name migration_name
yarn seed             # Seed database

# Docker
docker-compose -f docker-compose.dev.yml up
```

See [Development Commands](./Docs/guides/06-development-commands.md) for complete list.

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/login      # User login
POST   /api/v1/auth/signup     # User registration
```

### Users
```
GET    /api/v1/users           # Get all users
POST   /api/v1/users           # Create user
GET    /api/v1/users/:id       # Get user by ID
GET    /api/v1/users/profile   # Get current user profile
PATCH  /api/v1/users/profile   # Update profile
PATCH  /api/v1/users/:id       # Update user
DELETE /api/v1/users/:id       # Delete user
```

### System
```
GET    /api/v1/ping            # Health check
```

### Storage
```
GET     /api/v1/files         # Get all files
POST    /api/v1/files/upload  # Upload file
GET     /api/v1/files/:id    # Get file
DELETE  /api/v1/files/:id    # Delete file
```


See [API Documentation](./Docs/guides/03-api-documentation.md) for details.

## 🔐 Default Test User

| Email | Username | Password |
|-------|----------|----------|
| admin@example.com | admin | #Pass1234 |

## 🏗️ Project Structure

```
src/
├── common/              # Shared utilities (guards, decorators, pipes)
├── core/                # Core services (config, logger, prisma)
├── modules/             # Feature modules (auth, user)
└── main.ts              # Entry point

prisma/
├── schemas/             # Database schemas
├── migrations/          # Migration history
└── seeders/             # Database seeders

Docs/guides/             # Comprehensive documentation
```

See [Project Structure](./Docs/guides/01-project-structure.md) for details.

## 🚀 Deployment

### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up --build
```

### Cloud Platforms
- Railway
- Heroku
- AWS ECS/Lambda
- Google Cloud Run
- DigitalOcean

See [Deployment Guide](./Docs/guides/07-deployment.md) for detailed instructions.

## 🔒 Security Features

- ✅ JWT authentication with configurable expiration
- ✅ Input validation with class-validator
- ✅ Rate limiting on endpoints
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma)
- ✅ Password hashing with bcrypt
- ✅ Environment-based security levels

See [Security Guide](./Docs/guides/05-security.md) for comprehensive details.

## 📊 Performance

Fastify is **2x faster** than Express:

| Metric | Express | Fastify |
|--------|---------|---------|
| Req/Sec | 15,640 | 32,030 |
| Bytes/Sec | 3.38 MB | 4.87 MB |

See [Architecture Guide](./Docs/guides/04-architecture.md) for more details.

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## 👨‍💻 Author

Mudassar Ali ([**sahilbabu**](https://github.com/sahilbabu/NestJS-Fastify-Prisma-Boilerplate)) | [**eGooTY**](https://egooty.com/)

---

## 🆘 Need Help?

- 📚 Check the [Documentation Index](./Docs/guides/INDEX.md)
- ❓ Browse [FAQ](./Docs/guides/08-faq.md)
- 🐛 [Report Issues](https://github.com/sahilbabu/NestJS-Fastify-Prisma-Boilerplate/issues)
- 💬 [Start Discussion](https://github.com/sahilbabu/NestJS-Fastify-Prisma-Boilerplate/discussions)

**Last Updated: October 2025** ⭐ **Happy coding! 🎉**
