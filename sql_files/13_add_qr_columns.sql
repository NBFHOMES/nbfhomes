-- 13_add_qr_columns.sql
-- Add Smart QR column to users table

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS assigned_qr_id text UNIQUE;

-- Add index for fast public lookups
CREATE INDEX IF NOT EXISTS idx_users_assigned_qr_id ON public.users(assigned_qr_id);
