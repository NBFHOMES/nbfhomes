-- Add new columns to public.users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Update existing users to have is_onboarded = false (already default, but good for clarity)
UPDATE public.users
SET is_onboarded = FALSE
WHERE is_onboarded IS NULL;

-- Optional: If you want to auto-onboard users who already have data (cleanup)
-- UPDATE public.users
-- SET is_onboarded = TRUE
-- WHERE profession IS NOT NULL AND state IS NOT NULL AND city IS NOT NULL;
