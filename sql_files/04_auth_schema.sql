-- 04_auth_schema.sql
-- Linking public tables to supabase auth schema

-- Add foreign key reference to auth.users if it doesn't exist
-- Note: You cannot usually ALTER auth.users, but you can reference it.

-- Ensure public.users.id references auth.users.id
-- This might fail if public.users contains IDs not in auth.users, so be careful.
DO $$ BEGIN
  ALTER TABLE public.users 
    ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null; -- If accessing auth schema is restricted
END $$;
