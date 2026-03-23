-- ==============================================================================
-- SQL Script: 23_fix_admin_approval
-- Fixes "Silent Failure" where admin clicks approve but it doesn't save to database
-- ==============================================================================

BEGIN;

-- 1. Ensure all users listed in admin_users also strictly have 'role' = 'admin' in users table.
-- Many times Admin Panel opens because they are in admin_users, 
-- but Supabase security checks the users table and silently blocks the update.
UPDATE public.users 
SET role = 'admin' 
WHERE id IN (SELECT user_id FROM public.admin_users);

-- 2. Add an unbreakable double-check policy. 
-- This allows Admins to update ANY property completely bypassing "Owner check".
DROP POLICY IF EXISTS "Admins from admin_users can update properties" ON public.properties;
CREATE POLICY "Admins from admin_users can update properties"
ON public.properties
FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

COMMIT;
