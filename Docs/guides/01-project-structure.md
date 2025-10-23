# 📁 Project Structure

## Directory Overview

```
📁 Project Root
├── 📁 .vscode/                    # VS Code workspace settings
├── 📁 Docs/                      # Project documentation
│   └── 📁 guides/                # Documentation guides
├── 📁 logs/                      # Application logs
├── 📁 scripts/                   # Build and deployment scripts
├── 📁 src/
│   ├── 📁 common/                # Shared utilities and configurations
│   │   ├── 📁 base/              # Base classes (pagination, sorting, etc.)
│   │   ├── 📁 decorators/        # Custom decorators (roles, permissions, public, current-user)
│   │   ├── 📁 exceptions/        # Custom exception classes
│   │   ├── 📁 filters/           # Exception filters with Prisma error handling
│   │   ├── 📁 guards/            # Custom guards (JWT auth, roles, permissions)
│   │   ├── 📁 interceptors/      # Custom interceptors
│   │   ├── 📁 pipes/             # Custom validation pipes
│   │   ├── 📁 utils/             # Utility functions (hashing, bootstrap, etc.)
│   │   └── common.module.ts      # Common module
│   ├── 📁 core/                  # Core application modules
│   │   ├── 📁 config/            # Configuration management
│   │   │   ├── config.module.ts  # Configuration module
│   │   │   ├── config.schema.ts  # Zod schema validation
│   │   │   ├── env.ts            # Environment configuration
│   │   │   └── server.config.ts  # Server configuration
│   │   ├── 📁 logger/            # Winston logger configuration
│   │   │   ├── logger.controller.ts
│   │   │   ├── logger.module.ts
│   │   │   ├── logger.service.ts
│   │   │   └── winston.config.ts
│   │   ├── 📁 prisma/            # Prisma ORM configuration
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   └── 📁 redis/             # Redis configuration
│   ├── 📁 gateways/              # WebSocket gateways
│   ├── 📁 generated/             # Prisma generated client
│   │   ├── browser.ts
│   │   ├── client.ts
│   │   ├── commonInputTypes.ts
│   │   ├── enums.ts
│   │   ├── models.ts
│   │   ├── 📁 internal/          # Prisma internal files
│   │   └── 📁 models/            # Generated model types
│   ├── 📁 jobs/                  # Background jobs and schedulers
│   ├── 📁 modules/               # Feature modules
│   │   ├── 📁 auth/              # Authentication module
│   │   │   ├── 📁 dto/           # Login/Signup DTOs
│   │   │   ├── 📁 strategies/    # JWT strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   └── 📁 user/              # User management module
│   │       ├── 📁 dto/           # User DTOs
│   │       ├── user.controller.ts
│   │       ├── user.module.ts
│   │       └── user.service.ts
│   ├── app.controller.ts         # Root controller
│   ├── app.module.ts             # Root module
│   ├── app.service.ts            # Root service
│   └── main.ts                   # Application entry point
├── 📁 prisma/
│   ├── 📁 migrations/            # Database migrations
│   ├── 📁 schemas/               # Prisma schema files
│   │   ├── schema.prisma         # Main schema configuration
│   │   └── user.prisma           # User schema
│   └── 📁 seeders/               # Database seeders
│       ├── 📁 data/              # Seed data files
│       └── index.ts              # Seeder entry point
├── 📁 test/                      # Test files and configurations
│   ├── app.e2e-spec.ts           # E2E tests
│   └── jest-e2e.json             # Jest E2E configuration
├── 📄 Configuration Files
│   ├── .editorconfig             # Editor configuration
│   ├── .gitignore                # Git ignore rules
│   ├── .prettierrc                # Prettier formatting rules
│   ├── .prettierignore            # Prettier ignore patterns
│   ├── docker-compose.dev.yml    # Development Docker setup
│   ├── docker-compose.yml        # Production Docker setup
│   ├── Dockerfile                # Production Docker image
│   ├── Dockerfile.dev            # Development Docker image
│   ├── env.example               # Environment variables template
│   ├── eslint.config.mjs         # ESLint configuration
│   ├── jest.config.js            # Jest configuration
│   ├── nest-cli.json             # NestJS CLI configuration
│   ├── package.json              # Project dependencies
│   ├── prisma.config.ts          # Prisma configuration
│   ├── renovate.json             # Renovate bot configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── tsconfig.build.json       # TypeScript build configuration
└── 📄 Documentation
    ├── README.md                 # Project overview
    ├── LICENSE                   # MIT License
    └── MAIL_INTEGRATION.md       # Email integration guide
```

## Key Directories Explained

### `/src/common/`
Shared utilities used across the application:
- **base/** - Base classes for pagination, sorting, and common patterns
- **decorators/** - Custom decorators like `@CurrentUser()`, `@Roles()`, `@Public()`
- **exceptions/** - Custom exception classes for consistent error handling
- **filters/** - Exception filters with Prisma-specific error handling
- **guards/** - Authentication and authorization guards
- **interceptors/** - Request/response interceptors
- **pipes/** - Custom validation pipes
- **utils/** - Helper functions for hashing, bootstrapping, etc.

### `/src/core/`
Core application services:
- **config/** - Centralized configuration management with Zod validation
- **logger/** - Winston logger setup with structured logging
- **prisma/** - Prisma ORM service and module
- **redis/** - Redis cache configuration

### `/src/modules/`
Feature-based modules (one per feature):
- **auth/** - Authentication and JWT strategy
- **user/** - User management and profile operations

Each module follows the pattern:
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `*.module.ts` - Module configuration
- `dto/` - Data transfer objects for validation

### `/prisma/`
Database configuration and management:
- **schemas/** - Prisma schema files (split by feature)
- **migrations/** - Database migration history
- **seeders/** - Initial data population scripts

## Naming Conventions

- **Files**: kebab-case (`user-profile.service.ts`)
- **Classes**: PascalCase (`UserProfileService`)
- **Interfaces**: PascalCase with 'I' prefix (`IUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Functions/Variables**: camelCase (`getUserById`)

## File Organization

- One class per file
- Keep files under 300 lines
- Extract complex logic into separate utilities
- Use barrel exports (`index.ts`) for modules
