-- Grant Admin Access to Sushil Bhai (Robust Version)
-- This script fixes the "Key is not present in table users" error by manually syncing the user first.

DO $$
DECLARE
  target_user_id uuid;
  user_email text := 'sushilpatel7489@gmail.com';
  user_meta jsonb;
BEGIN
  -- 1. Find the User details from auth.users
  SELECT id, raw_user_meta_data INTO target_user_id, user_meta
  FROM auth.users
  WHERE email = user_email;

  -- 2. Check if user exists in auth system
  IF target_user_id IS NOT NULL THEN
    
    -- 3. ENSURE user exists in public.users (Fix for Foreign Key Error)
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      target_user_id, 
      user_email, 
      COALESCE(user_meta->>'full_name', user_meta->>'name', 'Sushil Bhai'),
      'admin' -- Set role directly here
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin', -- Ensure role is updated if they already existed
      email = EXCLUDED.email;

    -- 4. Now safely insert into admin_users
    INSERT INTO public.admin_users (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'SUCCESS: Admin access granted to % (ID: %)', user_email, target_user_id;
  ELSE
    RAISE WARNING 'User with email % not found in auth system. Please Sign Up/Log In first.', user_email;
  END IF;
END $$;
