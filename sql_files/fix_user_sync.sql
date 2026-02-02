-- FIX USER SYNC ISSUES
-- Run this script in the Supabase SQL Editor to:
-- 1. Ensure the sync trigger exists and works
-- 2. Backfill any missing users from auth.users to public.users

-- 1. Re-create the Trigger Function (Robust Version)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), -- Fallback to email if name missing
    new.raw_user_meta_data->>'avatar_url',
    'user',
    new.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$;

-- 2. Re-bind the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill Missing Users (The "Fix")
-- This inserts any users that exist in Auth but are missing from Public
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    'user',
    created_at,
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Verify Admin Role (Optional - Ensure you are admin)
-- You can manually set your email to admin here if needed:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
