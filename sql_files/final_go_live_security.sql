-- final_go_live_security.sql
-- COMPLETE SECURITY AUDIT & RLS ENFORCEMENT

-- 1. ADMIN USERS TABLE
-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Public can check who is an admin (needed for UI logic 'isAdmin')
DROP POLICY IF EXISTS "Public can check admin status" ON public.admin_users;
CREATE POLICY "Public can check admin status" ON public.admin_users FOR SELECT USING (true);

-- Policy: Only existing Admins can manage the admin list
-- (Bootstrapping check: IF no admins exist, this might lock you out, but assuming initial seed)
DROP POLICY IF EXISTS "Admins can manage admin list" ON public.admin_users;
CREATE POLICY "Admins can manage admin list" ON public.admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 2. QR CODES TABLE
-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do anything
DROP POLICY IF EXISTS "Admins can manage qr_codes" ON public.qr_codes;
CREATE POLICY "Admins can manage qr_codes" ON public.qr_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Policy: Users can view their own assigned QR code
DROP POLICY IF EXISTS "Users can view assigned qr" ON public.qr_codes;
CREATE POLICY "Users can view assigned qr" ON public.qr_codes FOR SELECT USING (
    assigned_user_id = auth.uid()
);

-- Policy: Public can view ACTIVE QR codes (for scanning)
DROP POLICY IF EXISTS "Public can view valid qr codes" ON public.qr_codes;
CREATE POLICY "Public can view valid qr codes" ON public.qr_codes FOR SELECT USING (
    status = 'active'
);

-- 3. USERS TABLE (General Protection)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (
    id = auth.uid()
);

-- Policy: Public read (Profiles are public)
DROP POLICY IF EXISTS "Public profiles" ON public.users;
CREATE POLICY "Public profiles" ON public.users FOR SELECT USING (true);
