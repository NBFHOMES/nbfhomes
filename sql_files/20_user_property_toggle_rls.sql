-- ==============================================================================
-- SQL Script: Allow Users to Update Their Own Property Status (Active/Inactive)
-- ==============================================================================

-- 1. Ensure Row Level Security (RLS) allows users to UPDATE their own properties.
-- If a similar policy already exists, this might throw an error (which is safe to ignore).
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'properties' 
        AND policyname = 'Users can update their own properties'
    ) THEN
        CREATE POLICY "Users can update their own properties"
        ON public.properties
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END
$$;

COMMIT;

-- Note:
-- If your 'status' column in 'properties' table is using a specific ENUM type 
-- (like 'pending', 'approved', 'rejected') instead of just 'text', 
-- you might need to add 'inactive' to that ENUM. 
-- Example (Uncomment and run ONLY if 'status' is an ENUM and 'inactive' is missing):
-- ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'inactive';
