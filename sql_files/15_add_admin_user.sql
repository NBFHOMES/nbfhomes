-- Insert the user into the admin_users table
INSERT INTO public.admin_users (user_id)
VALUES ('abbe12b0-9ce2-4dc9-88d9-547c218838b8')
ON CONFLICT (user_id) DO NOTHING;
