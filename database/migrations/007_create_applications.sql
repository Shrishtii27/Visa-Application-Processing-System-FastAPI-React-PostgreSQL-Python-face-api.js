-- File: database/migrations/007_create_applications.sql
-- Purpose: Create visa applications table

CREATE TABLE IF NOT EXISTS applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visa_type_id    UUID NOT NULL REFERENCES visa_types(id),
    country_code    VARCHAR(3) NOT NULL REFERENCES destination_countries(country_code),
    status          application_status NOT NULL DEFAULT 'draft',
    current_step    application_step NOT NULL DEFAULT 'country_selection',
    form_data       JSONB,
    notes           TEXT,
    reviewer_id     UUID REFERENCES users(id),
    reviewer_notes  TEXT,
    submitted_at    TIMESTAMPTZ,
    reviewed_at     TIMESTAMPTZ,
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_applications ON applications;
CREATE TRIGGER set_updated_at_applications
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROLLBACK:
-- DROP TABLE IF EXISTS applications;
