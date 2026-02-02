-- 07_rls_security.sql
-- Row Level Security to prevent data leaks

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can check admin status" ON public.admin_users;
CREATE POLICY "Public can check admin status" ON public.admin_users FOR SELECT USING (true);
ALTER TABLE public.properties_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view leads counts" ON public.properties_leads;
CREATE POLICY "Public can view leads counts" ON public.properties_leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "System can insert leads counts" ON public.properties_leads;
CREATE POLICY "System can insert leads counts" ON public.properties_leads FOR INSERT WITH CHECK (true);

-- POLICIES

-- USERS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);


DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.users;
CREATE POLICY "Admins can delete all profiles" ON public.users FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);


-- PROPERTIES
DROP POLICY IF EXISTS "Properties are viewable by everyone." ON public.properties;
CREATE POLICY "Properties are viewable by everyone." ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own properties." ON public.properties;
CREATE POLICY "Users can insert their own properties." ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own properties." ON public.properties;
CREATE POLICY "Users can update their own properties." ON public.properties FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own properties." ON public.properties;
CREATE POLICY "Users can delete their own properties." ON public.properties FOR DELETE USING (auth.uid() = user_id);

-- OTHERS
DROP POLICY IF EXISTS "Collections are viewable by everyone." ON public.collections;
CREATE POLICY "Collections are viewable by everyone." ON public.collections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ads are viewable by everyone" ON public.ads;
CREATE POLICY "Ads are viewable by everyone" ON public.ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Settings are viewable by everyone." ON public.site_settings;
CREATE POLICY "Settings are viewable by everyone." ON public.site_settings FOR SELECT USING (true);

-- LEADS & ACTIVITY
ALTER TABLE public.properties_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view leads counts" ON public.properties_leads;
CREATE POLICY "Public can view leads counts" ON public.properties_leads FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert leads counts" ON public.properties_leads;
CREATE POLICY "System can insert leads counts" ON public.properties_leads FOR INSERT WITH CHECK (true);

ALTER TABLE public.leads_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert activity" ON public.leads_activity;
CREATE POLICY "System can insert activity" ON public.leads_activity FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view activity" ON public.leads_activity;
CREATE POLICY "Owners can view activity" ON public.leads_activity FOR SELECT USING (
  auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- INQUIRIES
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view their inquiries" ON public.inquiries;
CREATE POLICY "Owners can view their inquiries" ON public.inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = inquiries.property_id AND user_id = auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- PROPERTY VIEWS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert views" ON public.property_views;
CREATE POLICY "Public can insert views" ON public.property_views FOR INSERT WITH CHECK (true);

-- ADMIN OVERRIDES (Simplified: Any admin user can do anything)
-- Note: Assuming role 'admin' in public.users is trusted
DROP POLICY IF EXISTS "Admins can do everything" ON public.properties;
CREATE POLICY "Admins can do everything" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
