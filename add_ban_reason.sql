-- Add ban_reason column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS ban_reason text DEFAULT 'No reason provided';
