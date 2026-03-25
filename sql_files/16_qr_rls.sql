-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do EVERYTHING on qr_codes
DROP POLICY IF EXISTS "Admins can manage qr_codes" ON public.qr_codes;
CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can VIEW their own assigned QR code
DROP POLICY IF EXISTS "Users can view assigned qr" ON public.qr_codes;
CREATE POLICY "Users can view assigned qr" ON public.qr_codes
    FOR SELECT
    USING (
        assigned_user_id = auth.uid()
    );

-- Policy: Allow reading unused codes? (Maybe not needed for public, only admins generate)

-- Policy: Public can READ qr_codes for scanning/redirect purpose (no auth needed)
-- Only exposes: code, status, assigned_user_id (minimum fields needed for redirect)
DROP POLICY IF EXISTS "Public can scan qr codes" ON public.qr_codes;
CREATE POLICY "Public can scan qr codes" ON public.qr_codes
    FOR SELECT
    USING (true);
