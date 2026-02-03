# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RDA Gateway is a NestJS backend service for the [RDA TIGER](https://www.rd-alliance.org/working-groups/rda-tiger/) project. It provides annotation management, deposit storage, and vocabulary services for RDA domain-specific terms.

**Key Technologies:**
- NestJS framework with TypeScript
- PostgreSQL (TypeORM)
- Elasticsearch for knowledge base indexing
- BullMQ for job queuing (currently commented out but ready for integration)
- Docker/Docker Compose for development

## Development Setup

### Initial Setup
```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start services with Docker Compose (includes auto-reload)
docker compose up --watch
```

### VSCode Debugger Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Docker NestJS",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**The development workflow uses Docker Compose in watch mode with a debugger. Always develop with the debugger attached rather than using logging.**

## Common Commands

### Building and Running
```bash
# Build the project
pnpm run build

# Development (local)
pnpm run start:dev

# Debug mode (for Docker attach)
pnpm run start:debug

# Production
pnpm run start:prod
```

### Testing
```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e

# Run e2e tests in watch mode
pnpm run test:e2e:watch

# Run test coverage
pnpm run test:cov

# Debug a single test
pnpm run test:debug
```

### Code Quality
```bash
# Lint with auto-fix
pnpm run lint

# Format code
pnpm run format
```

### Releasing
```bash
# Preview what version will be released (dry-run)
npx standard-version --dry-run

# Create release (auto-detects version from commits)
pnpm run release

# Or force a specific version bump
pnpm run release:patch   # x.y.Z - bug fixes
pnpm run release:minor   # x.Y.0 - new features
pnpm run release:major   # X.0.0 - breaking changes

# Push release to trigger CI/CD
git push --follow-tags origin master
```

**Conventional Commits:**
- `feat: ...` → minor version bump
- `fix: ...` → patch version bump
- `feat!: ...` or `BREAKING CHANGE:` → major version bump
- `docs:`, `test:`, `chore:` → no version bump (included in changelog)

## Architecture

### Module Structure

The application follows a modular architecture with four main domain modules:

1. **VocabulariesModule** (`src/vocabularies/`)
   - Manages RDA domain vocabulary terms
   - Stores vocabulary entries in PostgreSQL with fields: `subject_scheme`, `scheme_uri`, `value_scheme`, `value_uri`, `namespace`, `additional_metadata`
   - Provides CRUD operations for vocabulary terms
   - Exports `VocabulariesService` for use by other modules

2. **IngestsModule** (`src/ingests/`)
   - Handles bulk ingestion of vocabularies from CSV files
   - Strategy pattern for different file types (currently supports CSV)
   - Parses CSV columns as vocabulary schemes and unique values as entries
   - Each column becomes a vocabulary with scheme URIs generated from filename and column name
   - Depends on `VocabulariesModule` for persistence

3. **KnowledgeBaseModule** (`src/knowledge-base/`)
   - Manages Elasticsearch integration for deposit document indexing
   - Builds complex deposit documents by joining data from multiple PostgreSQL tables (resource, subject_resource, workflow, rights, gorc_element, gorc_attribute)
   - Handles annotation indexing and search
   - Uses Elasticsearch client with authentication and TLS configuration

4. **IamModule** (`src/iam/`)
   - Identity and Access Management
   - Configured for Keycloak authentication (see `.env.example` for AUTH_STRATEGY)
   - Handles authentication callbacks

### Configuration System

Configuration uses NestJS's `@nestjs/config` with Zod validation:
- `src/config/core.config.ts` - Core app settings (NODE_ENV, API_PORT, ANNOTATOR_MIN_VERSION)
- `src/config/database.config.ts` - PostgreSQL connection settings
- `src/config/elasticsearch.config.ts` - Elasticsearch connection with auth
- `src/config/iam.config.ts` - Authentication strategy configuration
- `src/config/bullmq.config.ts` - Redis/BullMQ configuration (currently unused)
- `src/config/validation-schema.ts` - Combined Zod schema for environment validation

All environment variables are validated at startup using Zod schemas.

### Database Layer

TypeORM is used for PostgreSQL with:
- Entity definitions in `entities/` subdirectories
- Repository pattern via `@InjectRepository()`
- Transaction support for complex operations
- Raw SQL queries used in KnowledgeBaseService for complex joins

### Key Patterns

- **Exception Handling**: Custom `@ExceptionHandler` decorator (see `src/common/decorators/`)
- **Validation**: Global ValidationPipe with `whitelist: true` and `transform: true`
- **Configuration**: Type-safe config injection using `ConfigType<typeof configName>`
- **Logging**: NestJS Logger used throughout with contextual naming

## Important Notes

- **Main branch**: `master` (use this for PRs)
- **CORS**: Enabled globally in `main.ts`
- **Port**: Default API port is 3000 (configurable via `API_PORT` env var)
- **Docker Services**:
  - PostgreSQL on port 5432 (localhost only)
  - Elasticsearch on port 9200 (localhost only, requires auth)
- **BullMQ/Redis**: Infrastructure present but currently commented out in code
- **Test Setup**: E2E tests use testcontainers (see `@testcontainers/postgresql` in dependencies)

## File Upload Notes

When working with file uploads in IngestsModule:
- Uses `Express.Multer.File` type
- CSV parsing via `csv-parse/sync` library
- Files are processed in-memory (via `file.buffer`)
- Strategy pattern allows easy addition of new file type processors
