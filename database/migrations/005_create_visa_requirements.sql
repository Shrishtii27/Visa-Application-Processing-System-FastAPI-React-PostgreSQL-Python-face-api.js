-- File: database/migrations/005_create_visa_requirements.sql
-- Purpose: Define required documents per visa type

CREATE TABLE IF NOT EXISTS visa_requirements (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visa_type_id          UUID NOT NULL REFERENCES visa_types(id) ON DELETE CASCADE,
    document_type         document_type NOT NULL,
    is_mandatory          BOOLEAN NOT NULL DEFAULT TRUE,
    description           TEXT,
    max_age_days          INTEGER,
    min_balance_amount    NUMERIC(12, 2),
    min_balance_currency  VARCHAR(3),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USA Tourist
INSERT INTO visa_requirements (id, visa_type_id, document_type, is_mandatory, description, max_age_days, min_balance_amount, min_balance_currency) VALUES
    ('b1000001-0001-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'passport',          TRUE, 'Valid passport with 6 months validity',       NULL, NULL, NULL),
    ('b1000001-0001-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'bank_statement',    TRUE, 'Bank statement for last 3 months',              90, 2000.00, 'USD'),
    ('b1000001-0001-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000001', 'photo',             TRUE, 'Recent passport-size photograph',             NULL, NULL, NULL),
    ('b1000001-0001-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000001', 'hotel_booking',     TRUE, 'Confirmed hotel booking or accommodation proof',NULL, NULL, NULL),
    ('b1000001-0001-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001', 'flight_booking',    TRUE, 'Confirmed return flight tickets',             NULL, NULL, NULL),
    ('b1000001-0001-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000001', 'travel_insurance',  TRUE, 'Travel insurance for the duration of stay',   NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- UAE Tourist 30 Days
INSERT INTO visa_requirements (id, visa_type_id, document_type, is_mandatory, description, max_age_days, min_balance_amount, min_balance_currency) VALUES
    ('b1000002-0001-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'passport',          TRUE, 'Valid passport with 6 months validity',       NULL, NULL, NULL),
    ('b1000002-0001-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000001', 'bank_statement',    TRUE, 'Bank statement for last 3 months',              90, 3000.00, 'AED'),
    ('b1000002-0001-0000-0000-000000000003', 'a1000002-0000-0000-0000-000000000001', 'photo',             TRUE, 'Recent passport-size photograph',             NULL, NULL, NULL),
    ('b1000002-0001-0000-0000-000000000004', 'a1000002-0000-0000-0000-000000000001', 'hotel_booking',     TRUE, 'Hotel booking confirmation',                  NULL, NULL, NULL),
    ('b1000002-0001-0000-0000-000000000005', 'a1000002-0000-0000-0000-000000000001', 'flight_booking',    TRUE, 'Return flight tickets',                       NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- UK Standard Visitor
INSERT INTO visa_requirements (id, visa_type_id, document_type, is_mandatory, description, max_age_days, min_balance_amount, min_balance_currency) VALUES
    ('b1000003-0001-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'passport',          TRUE, 'Valid passport with 6 months validity',       NULL, NULL, NULL),
    ('b1000003-0001-0000-0000-000000000002', 'a1000003-0000-0000-0000-000000000001', 'bank_statement',    TRUE, 'Bank statement for last 6 months',             180, 1000.00, 'GBP'),
    ('b1000003-0001-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000001', 'photo',             TRUE, 'Recent passport-size photograph',             NULL, NULL, NULL),
    ('b1000003-0001-0000-0000-000000000004', 'a1000003-0000-0000-0000-000000000001', 'employment_letter', TRUE, 'Employment letter or proof of financial means',NULL, NULL, NULL),
    ('b1000003-0001-0000-0000-000000000005', 'a1000003-0000-0000-0000-000000000001', 'hotel_booking',     TRUE, 'Hotel booking or accommodation letter',       NULL, NULL, NULL),
    ('b1000003-0001-0000-0000-000000000006', 'a1000003-0000-0000-0000-000000000001', 'flight_booking',    TRUE, 'Return flight tickets',                       NULL, NULL, NULL),
    ('b1000003-0001-0000-0000-000000000007', 'a1000003-0000-0000-0000-000000000001', 'travel_insurance',  FALSE,'Travel insurance (recommended)',              NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Germany Schengen Tourist
INSERT INTO visa_requirements (id, visa_type_id, document_type, is_mandatory, description, max_age_days, min_balance_amount, min_balance_currency) VALUES
    ('b1000007-0001-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'passport',          TRUE, 'Valid passport with 3 months beyond stay',    NULL, NULL, NULL),
    ('b1000007-0001-0000-0000-000000000002', 'a1000007-0000-0000-0000-000000000001', 'bank_statement',    TRUE, 'Bank statement for last 3 months',              90, 1500.00, 'EUR'),
    ('b1000007-0001-0000-0000-000000000003', 'a1000007-0000-0000-0000-000000000001', 'photo',             TRUE, 'Biometric photo (35x45mm)',                   NULL, NULL, NULL),
    ('b1000007-0001-0000-0000-000000000004', 'a1000007-0000-0000-0000-000000000001', 'travel_insurance',  TRUE, 'Travel insurance min €30,000 coverage',       NULL, NULL, NULL),
    ('b1000007-0001-0000-0000-000000000005', 'a1000007-0000-0000-0000-000000000001', 'hotel_booking',     TRUE, 'Hotel or accommodation confirmation',         NULL, NULL, NULL),
    ('b1000007-0001-0000-0000-000000000006', 'a1000007-0000-0000-0000-000000000001', 'flight_booking',    TRUE, 'Return flight itinerary',                     NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS visa_requirements;
