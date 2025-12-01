# Deployment Guide

## Development Setup

### Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Docker and Docker Compose

### Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Start services with Docker Compose:

```bash
docker compose up --watch
```

This starts PostgreSQL and Elasticsearch with auto-reload for code changes.

## Environment Variables

### Core

| Variable              | Description                               | Default     |
| --------------------- | ----------------------------------------- | ----------- |
| NODE_ENV              | Environment mode (development/production) | development |
| API_PORT              | Port for the API server                   | 3000        |
| ANNOTATOR_MIN_VERSION | Minimum annotator version                 | 0.108.0     |

### Database (PostgreSQL)

| Variable          | Description       | Default     |
| ----------------- | ----------------- | ----------- |
| DATABASE_HOST     | Database hostname | localhost   |
| DATABASE_PORT     | Database port     | 5432        |
| DATABASE_USERNAME | Database user     | postgres    |
| DATABASE_PASSWORD | Database password | postgres    |
| DATABASE_NAME     | Database name     | rda_gateway |

### Elasticsearch

| Variable                    | Description               | Default               |
| --------------------------- | ------------------------- | --------------------- |
| ELASTIC_USERNAME            | Elasticsearch user        | elastic               |
| ELASTIC_PASSWORD            | Elasticsearch password    | changeme              |
| ELASTIC_NODE_ENDPOINTS      | Comma-separated node URLs | http://localhost:9200 |
| ELASTIC_REJECT_UNAUTHORIZED | Reject invalid TLS certs  | true                  |
| ELASTIC_SECURE              | Use TLS/SSL               | true                  |

### Authentication (Keycloak)

| Variable              | Description             | Default  |
| --------------------- | ----------------------- | -------- |
| AUTH_STRATEGY         | Authentication strategy | keycloak |
| KEYCLOAK_AUTH_URL     | Keycloak realm URL      | -        |
| KEYCLOAK_CLIENT_ID    | OAuth client ID         | rda-auth |
| KEYCLOAK_REDIRECT_URL | OAuth redirect URL      | -        |

### Redis (BullMQ)

| Variable       | Description    | Default   |
| -------------- | -------------- | --------- |
| REDIS_HOST     | Redis hostname | localhost |
| REDIS_PORT     | Redis port     | 6379      |
| REDIS_PASSWORD | Redis password | -         |

### Object Storage (Minio)

| Variable           | Description        | Default |
| ------------------ | ------------------ | ------- |
| MINIO_USER         | Minio access key   | rda     |
| MINIO_PASSWORD     | Minio secret key   | -       |
| MINIO_PORT         | Minio server port  | 9000    |
| MINIO_CONSOLE_PORT | Minio console port | 9001    |

## Production Deployment

### Build

```bash
pnpm run build
```

This creates a `dist/` directory with compiled JavaScript.

### Run

```bash
NODE_ENV=production pnpm run start:prod
```

### Docker

Build the production image:

```bash
docker build -t rda-gateway .
```

Run the container:

```bash
docker run -p 3000:3000 --env-file .env rda-gateway
```

## Service Dependencies

The application requires these external services:

### PostgreSQL

- Version: 17 or compatible
- Port: 5432
- The application validates database connection at startup

### Elasticsearch

- Version: 8.15 or compatible
- Port: 9200
- Requires authentication
- TLS/SSL recommended for production

### Redis (Optional)

- Required for BullMQ job queuing
- Currently not active in the codebase but infrastructure is ready

## Health Checks

The root endpoint (`GET /`) returns a health check response.

The `/annotator` endpoint returns annotator service information.

## Troubleshooting

### Database Connection Failed

- Verify DATABASE_HOST is reachable
- Check DATABASE_USERNAME and DATABASE_PASSWORD
- Ensure the database exists

### Elasticsearch Connection Failed

- Verify ELASTIC_NODE_ENDPOINTS format
- Check ELASTIC_USERNAME and ELASTIC_PASSWORD
- For TLS issues, verify ELASTIC_REJECT_UNAUTHORIZED and ELASTIC_SECURE settings

### Port Already in Use

- Change API_PORT to an available port
- Check for other services using port 3000
