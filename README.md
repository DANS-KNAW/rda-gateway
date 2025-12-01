# RDA Gateway

Backend service for the [RDA TIGER](https://www.rd-alliance.org/working-groups/rda-tiger/) project. Provides annotation management, vocabulary services, and document indexing for RDA domain-specific terms.

## Prerequisites

- Node.js 20+
- pnpm
- Docker and Docker Compose

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start services with Docker Compose
docker compose up
```

The API runs on `http://localhost:3000` by default.

## API Documentation

Interactive API documentation is available at `/api` when the server is running.

## Commands

```bash
# Development
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod

# Run tests
pnpm run test
pnpm run test:e2e

# Lint and format
pnpm run lint
pnpm run format
```

## Documentation

- [Architecture](docs/architecture.md) - System design and module structure
- [Deployment](docs/deployment.md) - Environment setup and deployment guide
