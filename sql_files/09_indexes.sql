-- 09_indexes.sql
-- Indexes for speed optimization

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_category_id ON public.properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_leads_property_id ON public.leads_activity(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads_activity(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_views_property_id ON public.property_views(property_id);

CREATE INDEX IF NOT EXISTS idx_collections_handle ON public.collections(handle);
