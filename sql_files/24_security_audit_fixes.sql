-- 24_security_audit_fixes.sql
-- CRITICAL SECURITY FIX: Prevents Privilege Escalation 
-- Stop malicious users from updating their own 'role' or 'is_verified' status via standard API calls

CREATE OR REPLACE FUNCTION protect_restricted_columns()
RETURNS trigger AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- We assume if auth.uid() is null, it's the service_role key bypassing RLS
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if the current executing user is in the admin_users table
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ) INTO is_admin;
  
  -- If NOT an admin, reject any changes to protected columns
  IF NOT is_admin THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security Violation: You are not authorized to elevate privileges or change roles.';
    END IF;

    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      RAISE EXCEPTION 'Security Violation: You cannot artificially verify your own account.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to allow safe re-runs
DROP TRIGGER IF EXISTS enforce_restricted_columns ON public.users;

-- Bind the trigger to run BEFORE any UPDATE on the users table
CREATE TRIGGER enforce_restricted_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION protect_restricted_columns();
