-- File: database/migrations/006_create_form_field_config.sql
-- Purpose: Dynamic form field configuration per visa type

CREATE TABLE IF NOT EXISTS form_field_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visa_type_id    UUID NOT NULL REFERENCES visa_types(id) ON DELETE CASCADE,
    field_name      VARCHAR(100) NOT NULL,
    field_label     VARCHAR(200) NOT NULL,
    field_type      VARCHAR(50)  NOT NULL,  -- text, number, date, select, boolean
    is_required     BOOLEAN NOT NULL DEFAULT TRUE,
    options         JSONB,                   -- for select fields
    validation_rules JSONB,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USA Tourist form fields
INSERT INTO form_field_config (id, visa_type_id, field_name, field_label, field_type, is_required, display_order) VALUES
    ('c1000001-0001-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'full_name',          'Full Name (as in passport)',     'text',    TRUE,  1),
    ('c1000001-0001-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'date_of_birth',      'Date of Birth',                  'date',    TRUE,  2),
    ('c1000001-0001-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000001', 'nationality',        'Nationality',                    'text',    TRUE,  3),
    ('c1000001-0001-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000001', 'passport_number',    'Passport Number',                'text',    TRUE,  4),
    ('c1000001-0001-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001', 'passport_expiry',    'Passport Expiry Date',           'date',    TRUE,  5),
    ('c1000001-0001-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000001', 'travel_date',        'Intended Travel Date',           'date',    TRUE,  6),
    ('c1000001-0001-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000001', 'return_date',        'Intended Return Date',           'date',    TRUE,  7),
    ('c1000001-0001-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000001', 'purpose_of_visit',   'Purpose of Visit',               'text',    TRUE,  8),
    ('c1000001-0001-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000001', 'us_address',         'Address in the US',              'text',    FALSE, 9),
    ('c1000001-0001-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000001', 'us_contact',         'US Contact Person (if any)',      'text',    FALSE, 10),
    ('c1000001-0001-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000001', 'prev_us_visa',       'Have you had a US visa before?', 'boolean', FALSE, 11),
    ('c1000001-0001-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000001', 'criminal_record',    'Any criminal record?',           'boolean', TRUE,  12)
ON CONFLICT (id) DO NOTHING;

-- UAE Tourist form fields
INSERT INTO form_field_config (id, visa_type_id, field_name, field_label, field_type, is_required, display_order) VALUES
    ('c1000002-0001-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'full_name',       'Full Name (as in passport)',  'text', TRUE, 1),
    ('c1000002-0001-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000001', 'date_of_birth',   'Date of Birth',               'date', TRUE, 2),
    ('c1000002-0001-0000-0000-000000000003', 'a1000002-0000-0000-0000-000000000001', 'nationality',     'Nationality',                 'text', TRUE, 3),
    ('c1000002-0001-0000-0000-000000000004', 'a1000002-0000-0000-0000-000000000001', 'passport_number', 'Passport Number',             'text', TRUE, 4),
    ('c1000002-0001-0000-0000-000000000005', 'a1000002-0000-0000-0000-000000000001', 'passport_expiry', 'Passport Expiry Date',        'date', TRUE, 5),
    ('c1000002-0001-0000-0000-000000000006', 'a1000002-0000-0000-0000-000000000001', 'travel_date',     'Intended Travel Date',        'date', TRUE, 6),
    ('c1000002-0001-0000-0000-000000000007', 'a1000002-0000-0000-0000-000000000001', 'return_date',     'Intended Return Date',        'date', TRUE, 7),
    ('c1000002-0001-0000-0000-000000000008', 'a1000002-0000-0000-0000-000000000001', 'hotel_name',      'Hotel Name in UAE',           'text', TRUE, 8),
    ('c1000002-0001-0000-0000-000000000009', 'a1000002-0000-0000-0000-000000000001', 'sponsor_name',    'Sponsor Name (if applicable)','text', FALSE,9)
ON CONFLICT (id) DO NOTHING;

-- UK Visitor form fields
INSERT INTO form_field_config (id, visa_type_id, field_name, field_label, field_type, is_required, display_order) VALUES
    ('c1000003-0001-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'full_name',          'Full Name (as in passport)',    'text',    TRUE,  1),
    ('c1000003-0001-0000-0000-000000000002', 'a1000003-0000-0000-0000-000000000001', 'date_of_birth',      'Date of Birth',                 'date',    TRUE,  2),
    ('c1000003-0001-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000001', 'nationality',        'Nationality',                   'text',    TRUE,  3),
    ('c1000003-0001-0000-0000-000000000004', 'a1000003-0000-0000-0000-000000000001', 'passport_number',    'Passport Number',               'text',    TRUE,  4),
    ('c1000003-0001-0000-0000-000000000005', 'a1000003-0000-0000-0000-000000000001', 'passport_expiry',    'Passport Expiry Date',          'date',    TRUE,  5),
    ('c1000003-0001-0000-0000-000000000006', 'a1000003-0000-0000-0000-000000000001', 'travel_date',        'Intended Travel Date',          'date',    TRUE,  6),
    ('c1000003-0001-0000-0000-000000000007', 'a1000003-0000-0000-0000-000000000001', 'return_date',        'Intended Return Date',          'date',    TRUE,  7),
    ('c1000003-0001-0000-0000-000000000008', 'a1000003-0000-0000-0000-000000000001', 'uk_address',         'Address in UK',                 'text',    FALSE, 8),
    ('c1000003-0001-0000-0000-000000000009', 'a1000003-0000-0000-0000-000000000001', 'employment_status',  'Employment Status',             'text',    TRUE,  9),
    ('c1000003-0001-0000-0000-000000000010', 'a1000003-0000-0000-0000-000000000001', 'annual_income',      'Annual Income (GBP)',            'number',  TRUE,  10),
    ('c1000003-0001-0000-0000-000000000011', 'a1000003-0000-0000-0000-000000000001', 'prev_uk_visa',       'Have you visited UK before?',   'boolean', FALSE, 11),
    ('c1000003-0001-0000-0000-000000000012', 'a1000003-0000-0000-0000-000000000001', 'criminal_record',    'Any criminal record?',          'boolean', TRUE,  12)
ON CONFLICT (id) DO NOTHING;

-- ROLLBACK:
-- DROP TABLE IF EXISTS form_field_config;
