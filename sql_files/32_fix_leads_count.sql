-- ============================================================
-- NBF Homes: Fix missing leads_count and view_count
-- Run this in Supabase SQL Editor to fix Enquiry/Tracking errors
-- ============================================================

-- 1. Add missing columns to properties table if they don't exist
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS leads_count numeric DEFAULT 0;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS view_count numeric DEFAULT 0;

-- 2. Fix existing NULL values (CRITICAL: NULL + 1 = NULL)
UPDATE public.properties SET leads_count = 0 WHERE leads_count IS NULL;
UPDATE public.properties SET view_count = 0 WHERE view_count IS NULL;

-- 3. Create RPC function for incrementing leads (used in code)
CREATE OR REPLACE FUNCTION increment_leads_count(row_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.properties
  SET leads_count = COALESCE(leads_count, 0) + 1
  WHERE id = row_id;
END;
$$;

-- 4. Create RPC function for incrementing views
CREATE OR REPLACE FUNCTION increment_view_count(row_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.properties
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = row_id;
END;
$$;

-- 5. Optional: Verify structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('leads_count', 'view_count');
