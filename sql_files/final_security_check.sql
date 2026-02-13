-- final_security_check.sql
-- EXPLICITLY ENABLE RLS AND SET POLICIES FOR CRITICAL TABLES

-- 1. Secure Admin Users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public read (needed for 'isAdmin' checks on client)
DROP POLICY IF EXISTS "Public can check admin status" ON public.admin_users;
CREATE POLICY "Public can check admin status" ON public.admin_users FOR SELECT USING (true);

-- ONLY admins can modify admin_users (prevents privilege escalation)
-- Note: This requires at least one initial admin to utilize
DROP POLICY IF EXISTS "Admins can manage admin list" ON public.admin_users;
CREATE POLICY "Admins can manage admin list" ON public.admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);


-- 2. Secure QR Codes
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
DROP POLICY IF EXISTS "Admins can manage qr_codes" ON public.qr_codes;
CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Users can view their assigned code
DROP POLICY IF EXISTS "Users can view assigned qr" ON public.qr_codes;
CREATE POLICY "Users can view assigned qr" ON public.qr_codes FOR SELECT USING (
    assigned_user_id = auth.uid()
);

-- Public can view active QR codes (for scanning/redirection)
DROP POLICY IF EXISTS "Public can view valid qr codes" ON public.qr_codes;
CREATE POLICY "Public can view valid qr codes" ON public.qr_codes FOR SELECT USING (
    status = 'active'
);
