-- Optimizing connection settings to prevent ECONNRESET
-- This sets a longer timeout for the authenticator role (used by Supabase client)

ALTER ROLE authenticator SET statement_timeout = '15s';

-- Verify the setting
-- SELECT rolname, rolconfig FROM pg_roles WHERE rolname = 'authenticator';
