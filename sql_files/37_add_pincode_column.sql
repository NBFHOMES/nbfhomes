-- Migration: Add pincode column to properties table
-- Run this in Supabase SQL Editor → New Query → Paste & Run

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS locality TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
