CREATE TABLE IF NOT EXISTS vocabulary (
    subject_scheme VARCHAR NOT NULL,
    scheme_uri VARCHAR NOT NULL,
    value_scheme VARCHAR NOT NULL,
    value_uri VARCHAR NOT NULL,
    namespace VARCHAR NOT NULL,
    additional_metadata JSONB,
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (subject_scheme, scheme_uri, value_scheme, value_uri)
);

CREATE TABLE IF NOT EXISTS metric (
    id SERIAL PRIMARY KEY,
    type VARCHAR NOT NULL,
    version VARCHAR NOT NULL,
    browser VARCHAR NOT NULL, 
    browser_version VARCHAR NOT NULL,
    os VARCHAR NOT NULL,
    arch VARCHAR NOT NULL,
    locale VARCHAR NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS annotator_metadata (
    id SERIAL PRIMARY KEY,
    version VARCHAR NOT NULL UNIQUE,
    chrome_zip_url VARCHAR NOT NULL,
    release_date TIMESTAMPTZ NOT NULL,
    is_prerelease BOOLEAN NOT NULL DEFAULT false,
    file_size_bytes BIGINT NOT NULL,
    sha256_digest VARCHAR,
    name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add annotation_target column to resource table
ALTER TABLE resource ADD COLUMN IF NOT EXISTS annotation_target JSONB;
