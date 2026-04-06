-- Migration: Add sharing_type to properties
-- Run this in Supabase SQL Editor

ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS sharing_type TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
