-- File: database/migrations/004_create_visa_types.sql
-- Purpose: Create visa_types table and seed with standard visa types

CREATE TABLE IF NOT EXISTS visa_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code    VARCHAR(3) NOT NULL REFERENCES destination_countries(country_code),
    purpose         visa_purpose NOT NULL,
    visa_name       VARCHAR(200) NOT NULL,
    duration_days   INTEGER,
    max_stay_days   INTEGER,
    is_multiple_entry BOOLEAN NOT NULL DEFAULT FALSE,
    processing_days INTEGER,
    fee_usd         NUMERIC(10, 2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_visa_types ON visa_types;
CREATE TRIGGER set_updated_at_visa_types
    BEFORE UPDATE ON visa_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: USA
INSERT INTO visa_types (id, country_code, purpose, visa_name, duration_days, max_stay_days, is_multiple_entry, processing_days, fee_usd) VALUES
    ('a1000001-0000-0000-0000-000000000001', 'US', 'tourism',  'B-1/B-2 Tourist Visa',   3650, 180, TRUE,  90,  160.00),
    ('a1000001-0000-0000-0000-000000000002', 'US', 'student',  'F-1 Student Visa',        1825, 365, TRUE,  60,  160.00),
    ('a1000001-0000-0000-0000-000000000003', 'US', 'business', 'B-1 Business Visa',       3650, 180, TRUE,  90,  160.00)
ON CONFLICT (id) DO NOTHING;

-- Seed: UAE
INSERT INTO visa_types (id, country_code, purpose, visa_name, duration_days, max_stay_days, is_multiple_entry, processing_days, fee_usd) VALUES
    ('a1000002-0000-0000-0000-000000000001', 'AE', 'tourism',  'UAE Tourist Visa 30 Days',  30,  30, FALSE,  3,   90.00),
    ('a1000002-0000-0000-0000-000000000002', 'AE', 'tourism',  'UAE Tourist Visa 90 Days',  90,  90, TRUE,   5,  180.00),
    ('a1000002-0000-0000-0000-000000000003', 'AE', 'business', 'UAE Business Visa',         30,  30, FALSE,  5,  120.00)
ON CONFLICT (id) DO NOTHING;

-- Seed: UK
INSERT INTO visa_types (id, country_code, purpose, visa_name, duration_days, max_stay_days, is_multiple_entry, processing_days, fee_usd) VALUES
    ('a1000003-0000-0000-0000-000000000001', 'GB', 'tourism',  'UK Standard Visitor Visa', 180, 180, TRUE,  15,  115.00),
    ('a1000003-0000-0000-0000-000000000002', 'GB', 'student',  'UK Student Visa',          365, 365, TRUE,  30,  490.00),
    ('a1000003-0000-0000-0000-000000000003', 'GB', 'work',     'UK Skilled Worker Visa',  1825, 365, TRUE,  30,  610.00)
ON CONFLICT (id) DO NOTHING;

-- Seed: Singapore
INSERT INTO visa_types (id, country_code, purpose, visa_name, duration_days, max_stay_days, is_multiple_entry, processing_days, fee_usd) VALUES
    ('a1000004-0000-0000-0000-000000000001', 'SG', 'tourism',  'Singapore Tourist Visa',   30,  30, FALSE,  3,   30.00),
    ('a1000004-0000-0000-0000-000000000002', 'SG', 'business', 'Singapore Business Visa',  30,  30, FALSE,  5,   50.00)
ON CONFLICT (id) DO NOTHING;

-- Seed: Germany (Schengen)
INSERT INTO visa_types (id, country_code, purpose, visa_name, duration_days, max_stay_days, is_multiple_entry, processing_days, fee_usd) VALUES
    ('a1000007-0000-0000-0000-000000000001', 'DE', 'tourism',  'Schengen Tourist Visa',    90,  90, TRUE,  15,   85.00),
    ('a1000007-0000-0000-0000-000000000002', 'DE', 'business', 'Schengen Business Visa',   90,  90, TRUE,  15,   85.00)
ON CONFLICT (id) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS visa_types;
