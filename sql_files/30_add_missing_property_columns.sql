-- Migration: Add missing property columns
-- Run this in Supabase SQL Editor → New Query → Paste & Run

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS built_up_area NUMERIC,
  ADD COLUMN IF NOT EXISTS furnishing_status TEXT,
  ADD COLUMN IF NOT EXISTS floor_number INTEGER,
  ADD COLUMN IF NOT EXISTS total_floors INTEGER,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS locality TEXT;

-- Refresh schema cache (important!)
NOTIFY pgrst, 'reload schema';
