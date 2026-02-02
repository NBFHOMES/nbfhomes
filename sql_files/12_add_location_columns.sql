-- 12_add_location_columns.sql
-- Add missing location columns for Enhanced Search

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS locality text,
ADD COLUMN IF NOT EXISTS state text;

-- Optional: Create indexes for faster search
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties USING btree (city);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties USING btree (locality);
