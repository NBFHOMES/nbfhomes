-- fix_qr_rls_v2.sql
-- Run this in Supabase SQL Editor

-- 1. Update the Public Select Policy to allow 'unused' status
-- This ensures that when a new barcode is scanned, the system can find it 
-- and show the "Activation" screen instead of "Invalid QR Code".

DROP POLICY IF EXISTS "Public can view valid qr codes" ON public.qr_codes;

CREATE POLICY "Public can view valid qr codes"
ON public.qr_codes
FOR SELECT
TO public
USING (
  status = 'active' OR status = 'unused'
);

-- 2. Verify settings for admin_users (ensure admins can manage everything)
DROP POLICY IF EXISTS "Admins can manage qr_codes" ON public.qr_codes;
CREATE POLICY "Admins can manage qr_codes"
ON public.qr_codes
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

COMMIT;
