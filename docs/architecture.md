# Architecture

RDA Gateway uses a modular NestJS architecture. Each module handles a specific domain within the RDA TIGER system.

## Modules

### VocabulariesModule

Manages RDA domain vocabulary terms. Stores vocabulary entries in PostgreSQL with support for:

- Subject schemes and URIs
- Value schemes and URIs
- Namespaces
- Additional metadata (JSON)
- Soft delete with restore

**Location:** `src/vocabularies/`

### IngestsModule

Handles bulk ingestion of vocabularies from CSV files. Uses a strategy pattern for file processing:

- Parses CSV columns as vocabulary schemes
- Generates scheme URIs from filename and column name
- Creates vocabulary entries for unique values

Depends on VocabulariesModule for persistence.

**Location:** `src/ingests/`

### KnowledgeBaseModule

Manages Elasticsearch integration for document indexing and search:

- Builds deposit documents by joining data from multiple PostgreSQL tables
- Handles annotation indexing
- Provides search endpoints that proxy to Elasticsearch

**Location:** `src/knowledge-base/`

## Database Schema

### Vocabulary Table

| Column              | Type      | Description                    |
| ------------------- | --------- | ------------------------------ |
| subject_scheme      | string    | Subject scheme identifier (PK) |
| scheme_uri          | string    | URI of the scheme (PK)         |
| value_scheme        | string    | Value scheme identifier (PK)   |
| value_uri           | string    | URI of the value (PK)          |
| namespace           | string    | Namespace identifier           |
| additional_metadata | jsonb     | Flexible metadata              |
| deleted_at          | timestamp | Soft delete marker             |
| created_at          | timestamp | Creation time                  |
| updated_at          | timestamp | Last update time               |

The vocabulary table uses a composite primary key of four fields.

## Data Flow

### Vocabulary Ingestion

1. CSV file uploaded to `/ingests/files`
2. IngestsModule parses CSV and extracts column values
3. VocabulariesModule stores each unique value as a vocabulary entry

### Document Search

1. Search request sent to `/knowledge-base/rda/_search`
2. KnowledgeBaseService proxies request to Elasticsearch
3. Results returned to client

### Annotation Creation

1. Annotation data sent to `/knowledge-base/annotation`
2. KnowledgeBaseService stores annotation in Elasticsearch
3. Annotation ID returned to client

## Configuration

Configuration uses NestJS ConfigModule with Zod validation. All environment variables are validated at startup.

**Config files:** `src/config/`

- `core.config.ts` - Application settings
- `database.config.ts` - PostgreSQL connection
- `elasticsearch.config.ts` - Elasticsearch connection
- `iam.config.ts` - Authentication settings
- `bullmq.config.ts` - Redis/BullMQ (reserved for future use)
