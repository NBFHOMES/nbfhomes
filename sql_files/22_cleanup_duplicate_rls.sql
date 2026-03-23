-- ==============================================================================
-- SQL Script: Remove Duplicate/Conflicting RLS Policies
-- ==============================================================================

BEGIN;

-- Remove the duplicate policies that were recently added 
-- (Because your '07_rls_security.sql' already handles both Users and Admins perfectly)

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;

-- Note: We are keeping the original policies from '07_rls_security.sql' untouched:
-- "Users can update their own properties." (With dot)
-- "Admins can do everything"

COMMIT;
