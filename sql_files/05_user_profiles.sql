-- 05_user_profiles.sql
-- Handling specific profile logic and updates

-- Ensure profession column exists (redundant if 03 ran, but safe)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profession text;

-- View for easier access if needed (optional, but good for "User and Profession" logic)
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT 
  id,
  full_name,
  email,
  profession,
  role,
  avatar_url
FROM public.users;
