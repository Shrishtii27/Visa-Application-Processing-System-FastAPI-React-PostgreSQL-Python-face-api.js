-- File: database/migrations/010_create_application_checklists.sql
-- Purpose: Automated checklist results per application

CREATE TABLE IF NOT EXISTS application_checklists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    check_name      VARCHAR(100) NOT NULL,
    check_category  VARCHAR(100),
    status          checklist_status NOT NULL DEFAULT 'pending',
    score           NUMERIC(5, 4),        -- 0.0000 to 1.0000
    details         JSONB,
    checked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_application_checklists ON application_checklists;
CREATE TRIGGER set_updated_at_application_checklists
    BEFORE UPDATE ON application_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROLLBACK:
-- DROP TABLE IF EXISTS application_checklists;
