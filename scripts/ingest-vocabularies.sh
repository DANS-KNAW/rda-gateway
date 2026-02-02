#!/bin/bash
# Ingest new D3.6 vocabulary CSV files into the RDA Gateway
#
# Usage: ./scripts/ingest-vocabularies.sh <API_BASE_URL> <API_KEY>
# Example: ./scripts/ingest-vocabularies.sh http://localhost:3000 my-api-key-here
#
# This script ingests the following vocabularies into the `vocabulary` table:
# 1. EOSC Opportunity Area Expert Groups (7 items)
# 2. SRIA Implementation Challenges (14 items)
# 3. SRIA Priority Areas (22 items)
#
# NOTE: EOSC Task Forces (4 items), ERICs (33 items), and HE Projects (50 items)
# have been merged into the Keywords vocabulary. They are inserted directly into
# the `keyword` table via SQL (see scripts/data/keywords_insert.sql), not through
# this ingestion script, because the gateway routes namespace=rda_keywords to the
# dedicated `keyword` table.

set -euo pipefail

API_URL="${1:?Usage: $0 <API_BASE_URL> <API_KEY>}"
API_KEY="${2:?Usage: $0 <API_BASE_URL> <API_KEY>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"

echo "=== RDA Gateway Vocabulary Ingestion ==="
echo "API URL: $API_URL"
echo "Data dir: $DATA_DIR"
echo ""

# 1. EOSC Opportunity Area Expert Groups
echo "[1/3] Ingesting EOSC Opportunity Area Expert Groups..."
curl -s -X POST "$API_URL/ingests/files" \
  -H "x-api-key: $API_KEY" \
  -F "files=@$DATA_DIR/eosc_opportunity_areas.csv;type=text/csv" \
  -F "mode=row" \
  -F "valueColumn=name" \
  -F "namespace=eosc_opportunity_areas" \
  -F "subjectScheme=EOSC Opportunity Area Expert Groups" \
  -F "schemeUri=https://eosc.eu/eosc-opportunity-area-expert-groups/" | jq .
echo ""

# 2. SRIA Implementation Challenges
echo "[2/3] Ingesting SRIA Implementation Challenges..."
curl -s -X POST "$API_URL/ingests/files" \
  -H "x-api-key: $API_KEY" \
  -F "files=@$DATA_DIR/sria_challenges.csv;type=text/csv" \
  -F "mode=row" \
  -F "valueColumn=name" \
  -F "descriptionColumn=description" \
  -F "namespace=sria_challenges" \
  -F "subjectScheme=SRIA Implementation Challenges" \
  -F "schemeUri=https://eosc.eu/wp-content/uploads/2024/12/20241031_SRIA_1.3_final_Annex.pdf" | jq .
echo ""

# 3. SRIA Priority Areas
echo "[3/3] Ingesting SRIA Priority Areas..."
curl -s -X POST "$API_URL/ingests/files" \
  -H "x-api-key: $API_KEY" \
  -F "files=@$DATA_DIR/sria_priority_areas.csv;type=text/csv" \
  -F "mode=row" \
  -F "valueColumn=name" \
  -F "namespace=sria_priority_areas" \
  -F "subjectScheme=SRIA Priority Areas" \
  -F "schemeUri=https://eosc.eu/wp-content/uploads/2024/12/20241031_SRIA_1.3_final_Annex.pdf" | jq .
echo ""

echo "=== Ingestion complete ==="
