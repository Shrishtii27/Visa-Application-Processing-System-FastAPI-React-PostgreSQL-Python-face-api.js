-- File: database/migrations/011_create_indexes.sql
-- Purpose: Create performance indexes on all high-traffic columns

-- users
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active    ON users(is_active);

-- destination_countries
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON destination_countries(is_active);

-- visa_types
CREATE INDEX IF NOT EXISTS idx_visa_types_country  ON visa_types(country_code);
CREATE INDEX IF NOT EXISTS idx_visa_types_purpose  ON visa_types(purpose);
CREATE INDEX IF NOT EXISTS idx_visa_types_active   ON visa_types(is_active);

-- visa_requirements
CREATE INDEX IF NOT EXISTS idx_visa_req_visa_type  ON visa_requirements(visa_type_id);
CREATE INDEX IF NOT EXISTS idx_visa_req_doc_type   ON visa_requirements(document_type);

-- form_field_config
CREATE INDEX IF NOT EXISTS idx_form_config_visa    ON form_field_config(visa_type_id);
CREATE INDEX IF NOT EXISTS idx_form_config_order   ON form_field_config(visa_type_id, display_order);

-- applications
CREATE INDEX IF NOT EXISTS idx_apps_user           ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status         ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_country        ON applications(country_code);
CREATE INDEX IF NOT EXISTS idx_apps_visa_type      ON applications(visa_type_id);
CREATE INDEX IF NOT EXISTS idx_apps_reviewer       ON applications(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_apps_created        ON applications(created_at DESC);

-- uploaded_documents
CREATE INDEX IF NOT EXISTS idx_docs_application    ON uploaded_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_docs_status         ON uploaded_documents(status);
CREATE INDEX IF NOT EXISTS idx_docs_type           ON uploaded_documents(document_type);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_application   ON audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_user          ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action        ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created       ON audit_logs(created_at DESC);

-- application_checklists
CREATE INDEX IF NOT EXISTS idx_checklist_app       ON application_checklists(application_id);
CREATE INDEX IF NOT EXISTS idx_checklist_status    ON application_checklists(status);

-- ROLLBACK: DROP INDEX IF EXISTS for each index above
