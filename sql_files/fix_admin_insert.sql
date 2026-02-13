-- FIX: Add First Available User as Admin
-- This script finds the most recently created user in auth.users and makes them an admin.
-- Run this AFTER signing up at least one user.

-- 1. Insert into public.users if not exists (sync fix)
INSERT INTO public.users (id, email, full_name, role, status)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'System Admin'), 
    'admin', 
    'active'
FROM auth.users
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active';

-- 2. Add to admin_users table
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verify
SELECT * FROM public.admin_users;
