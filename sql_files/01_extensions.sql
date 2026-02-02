-- 01_extensions.sql
-- Base extensions required for Supabase and the application

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PGCrypto for cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for text search (useful for search/filtering)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
