# Makefile for RDA Gateway
# Usage: make setup

.PHONY: setup install env docker wait start dev clean help check-pnpm \
        ingest-momsi ingest-iso639 export-seed test test-e2e lint format build

# Default target
.DEFAULT_GOAL := help

# Check if pnpm is installed
check-pnpm:
	@which pnpm > /dev/null 2>&1 || { \
		echo "Error: pnpm is not installed"; \
		echo "Install pnpm with: npm install -g pnpm"; \
		echo "Or visit: https://pnpm.io/installation"; \
		exit 1; \
	}
	@echo "pnpm found"

# Install dependencies
install: check-pnpm
	@echo "Installing dependencies..."
	pnpm install

# Create .env from .env.example if it doesn't exist
env:
	@if [ ! -f .env ]; then \
		echo "Creating .env from .env.example..."; \
		cp .env.example .env; \
		echo "Note: Update .env with your configuration"; \
	else \
		echo ".env already exists, skipping"; \
	fi

# Start Docker containers
docker:
	@echo "Starting Docker containers..."
	docker compose up -d

# Wait for services to be ready
wait:
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec rda-postgres-database pg_isready -U postgres > /dev/null 2>&1; do \
		echo "Waiting for PostgreSQL..."; \
		sleep 2; \
	done
	@echo "PostgreSQL is ready"
	@echo "Waiting for Elasticsearch to be ready..."
	@until curl -s -u elastic:$${ELASTIC_PASSWORD:-El@st1c!Str0ngP@ss2025\#} http://localhost:9200 > /dev/null 2>&1; do \
		echo "Waiting for Elasticsearch..."; \
		sleep 5; \
	done
	@echo "Elasticsearch is ready"

# Start development server
start: check-pnpm
	@echo "Starting development server..."
	pnpm run start:dev

# Full development setup
dev: install env docker wait start

# Full setup (same as dev but clearer naming)
setup: dev

# Clean up Docker volumes and containers
clean:
	@echo "Stopping and removing containers..."
	docker compose down -v
	@echo "Cleanup complete"

# Ingest MOMSI vocabulary data (column mode: each column = vocabulary category)
ingest-momsi:
	@echo "Ingesting MOMSI vocabulary data..."
	@if [ -z "$$API_KEY" ]; then \
		echo "Error: API_KEY environment variable not set"; \
		echo "Usage: API_KEY=your-key make ingest-momsi"; \
		exit 1; \
	fi
	curl -X POST http://localhost:3000/ingests/files \
		-H "x-api-key: $$API_KEY" \
		-F "files=@momsi.csv;type=text/csv" \
		-F "excludedColumns=🔗" \
		-F "excludedColumns=🖋️ Update" \
		-F "excludedColumns=All of the above"

# Ingest ISO 639 language codes (row mode: each row = one language)
# Format matches rda-annotator expectations
ingest-iso639:
	@echo "Ingesting ISO 639 language codes (row mode)..."
	@if [ -z "$$API_KEY" ]; then \
		echo "Error: API_KEY environment variable not set"; \
		echo "Usage: API_KEY=your-key make ingest-iso639"; \
		exit 1; \
	fi
	@if [ ! -f data/iso-639.csv ]; then \
		echo "Error: data/iso-639.csv not found"; \
		exit 1; \
	fi
	curl -X POST http://localhost:3000/ingests/files \
		-H "x-api-key: $$API_KEY" \
		-F "files=@data/iso-639.csv;type=text/csv" \
		-F "mode=row" \
		-F "valueColumn=name" \
		-F "valueUriColumn=code" \
		-F "subjectScheme=language" \
		-F "schemeUri=http://www.iso.org/iso/home/standards/language_codes.htm"

# Export seed data (vocabulary and reference tables only, no user data)
export-seed:
	@echo "Exporting seed data..."
	./scripts/export-seed-data.sh seed_data.sql

# Run tests
test: check-pnpm
	pnpm run test

# Run e2e tests
test-e2e: check-pnpm
	pnpm run test:e2e

# Lint code
lint: check-pnpm
	pnpm run lint

# Format code
format: check-pnpm
	pnpm run format

# Build project
build: check-pnpm
	pnpm run build

# Help
help:
	@echo "RDA Gateway - Available Commands"
	@echo ""
	@echo "  make setup        - Full development setup (install, env, docker, wait, start)"
	@echo "  make dev          - Same as setup"
	@echo "  make install      - Install pnpm dependencies"
	@echo "  make env          - Create .env from .env.example"
	@echo "  make docker       - Start Docker containers"
	@echo "  make wait         - Wait for services to be ready"
	@echo "  make start        - Start development server"
	@echo "  make clean        - Stop containers and remove volumes"
	@echo ""
	@echo "  make ingest-momsi  - Ingest MOMSI vocabulary, column mode (requires API_KEY)"
	@echo "  make ingest-iso639 - Ingest ISO 639 codes, row mode (requires API_KEY)"
	@echo "  make export-seed   - Export seed data to seed_data.sql"
	@echo ""
	@echo "  make test         - Run unit tests"
	@echo "  make test-e2e     - Run e2e tests"
	@echo "  make lint         - Lint code"
	@echo "  make format       - Format code"
	@echo "  make build        - Build project"
	@echo ""
	@echo "  make help         - Show this help message"
