-- File: database/migrations/003_create_destination_countries.sql
-- Purpose: Create destination_countries table and seed with initial data

CREATE TABLE IF NOT EXISTS destination_countries (
    country_code  VARCHAR(3)   PRIMARY KEY,
    country_name  VARCHAR(100) NOT NULL,
    flag_emoji    VARCHAR(10),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO destination_countries (country_code, country_name, flag_emoji, is_active) VALUES
    ('US',  'United States',   '🇺🇸', TRUE),
    ('AE',  'United Arab Emirates', '🇦🇪', TRUE),
    ('GB',  'United Kingdom',  '🇬🇧', TRUE),
    ('SG',  'Singapore',       '🇸🇬', TRUE),
    ('AU',  'Australia',       '🇦🇺', TRUE),
    ('CA',  'Canada',          '🇨🇦', TRUE),
    ('DE',  'Germany',         '🇩🇪', TRUE),
    ('FR',  'France',          '🇫🇷', TRUE),
    ('NZ',  'New Zealand',     '🇳🇿', TRUE),
    ('JP',  'Japan',           '🇯🇵', TRUE)
ON CONFLICT (country_code) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS destination_countries;
