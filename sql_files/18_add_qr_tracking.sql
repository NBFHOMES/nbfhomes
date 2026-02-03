-- Add tracking columns to qr_codes table
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS scan_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at timestamptz;
