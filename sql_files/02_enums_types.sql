-- 02_enums_types.sql
-- Custom types and enums for the application

-- Property Types (RK Degree Schema roughly translates here)
DO $$ BEGIN
    CREATE TYPE public.property_type AS ENUM (
        'RK', 
        '1BHK', 
        '2BHK', 
        '3BHK', 
        '4BHK', 
        'Villa', 
        'PG', 
        'Hostel', 
        'Shop', 
        'Office', 
        'Land'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Status
DO $$ BEGIN
    CREATE TYPE public.property_status AS ENUM (
        'pending', 
        'active', 
        'rejected', 
        'sold', 
        'rented'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User Role
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'user', 
        'admin', 
        'agent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
