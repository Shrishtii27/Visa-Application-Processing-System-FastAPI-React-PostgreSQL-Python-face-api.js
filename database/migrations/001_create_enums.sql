-- File: database/migrations/001_create_enums.sql
-- Purpose: Create custom PostgreSQL ENUM types

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'reviewer');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM (
            'draft', 'submitted', 'under_review',
            'approved', 'rejected', 'manual_review'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_step') THEN
        CREATE TYPE application_step AS ENUM (
            'country_selection', 'visa_type_selection',
            'passport_upload', 'form_filling',
            'document_upload', 'face_verification', 'completed'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visa_purpose') THEN
        CREATE TYPE visa_purpose AS ENUM (
            'tourism', 'business', 'student',
            'work', 'family', 'transit', 'medical'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM (
            'pending', 'uploaded', 'verified', 'rejected'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'passport', 'bank_statement', 'photo',
            'invitation_letter', 'travel_insurance',
            'hotel_booking', 'flight_booking',
            'employment_letter', 'noc', 'other'
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_status') THEN
        CREATE TYPE checklist_status AS ENUM (
            'pending', 'pass', 'fail', 'manual_review'
        );
    END IF;
END $$;

-- ROLLBACK:
-- DROP TYPE IF EXISTS checklist_status;
-- DROP TYPE IF EXISTS document_type;
-- DROP TYPE IF EXISTS document_status;
-- DROP TYPE IF EXISTS visa_purpose;
-- DROP TYPE IF EXISTS application_step;
-- DROP TYPE IF EXISTS application_status;
-- DROP TYPE IF EXISTS user_role;
