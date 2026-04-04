-- ============================================================
-- NBF Homes: Add whatsapp_number + category columns
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- 1. Add whatsapp_number column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT NULL;

-- 2. Add category column (same as profession, used for display)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;

-- 3. Make sure contact_number column exists (some installs may use phone_number)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS contact_number TEXT DEFAULT NULL;

-- 4. IMPORTANT: Reset onboarding cache for ALL existing users
-- This forces them to fill the new form with WhatsApp number + category.
-- The frontend checks DB fields: if whatsapp_number OR profession is NULL → show modal.
-- So we just need to ensure those fields ARE null for users who haven't filled them.
-- (No action needed — they are NULL by default if not filled.)

-- 5. Verify structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('contact_number', 'whatsapp_number', 'profession', 'category', 'status', 'full_name')
ORDER BY column_name;

-- ============================================================
-- EXPECTED RESULT:
-- contact_number  | text | YES | null
-- whatsapp_number | text | YES | null
-- profession      | text | YES | null
-- category        | text | YES | null
-- ============================================================
