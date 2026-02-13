-- Fix QR Code RLS Policies
-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything on qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Public can view active qr_codes" ON public.qr_codes;

-- Policy 1: Admins can do EVERYTHING
CREATE POLICY "Admins can do everything on qr_codes"
ON public.qr_codes
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.admin_users)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.admin_users)
);

-- Policy 2: Public can view ACTIVE codes
CREATE POLICY "Public can view active qr_codes"
ON public.qr_codes
FOR SELECT
TO public
USING (status = 'active');

-- Grants
GRANT ALL ON TABLE public.qr_codes TO service_role;
GRANT SELECT ON TABLE public.qr_codes TO anon;
GRANT SELECT ON TABLE public.qr_codes TO authenticated;
