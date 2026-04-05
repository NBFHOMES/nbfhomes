-- Fix RLS for site_settings to allow admins to insert/update settings

-- Drop existing policies just in case
DROP POLICY IF EXISTS "Settings are viewable by everyone." ON public.site_settings;
DROP POLICY IF EXISTS "Admins can modify settings" ON public.site_settings;

-- Public can view
CREATE POLICY "Settings are viewable by everyone." 
ON public.site_settings FOR SELECT 
USING (true);

-- Admins can insert/update/delete
CREATE POLICY "Admins can modify settings" 
ON public.site_settings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
