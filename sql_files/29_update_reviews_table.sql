-- Run this in Supabase SQL Editor to fix the "admin_reply" error
-- and enable the "blocked" status for reviews

-- 1. Add missing columns
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS admin_reply_at timestamp with time zone;

-- 2. Update status constraint to include 'blocked'
-- First remove the old one
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_status_check;

-- Then add the new one with 'blocked'
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'blocked'));
