-- File: database/migrations/008_create_uploaded_documents.sql
-- Purpose: Track all files uploaded per application

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    requirement_id  UUID REFERENCES visa_requirements(id),
    document_type   document_type NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    original_name   VARCHAR(255),
    mime_type       VARCHAR(100),
    file_size_bytes INTEGER,
    status          document_status NOT NULL DEFAULT 'pending',
    ocr_data        JSONB,
    validation_data JSONB,
    rejection_reason TEXT,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_uploaded_documents ON uploaded_documents;
CREATE TRIGGER set_updated_at_uploaded_documents
    BEFORE UPDATE ON uploaded_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROLLBACK:
-- DROP TABLE IF EXISTS uploaded_documents;
