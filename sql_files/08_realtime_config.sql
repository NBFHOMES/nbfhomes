-- 08_realtime_config.sql
-- Enable Realtime for instant updates

-- Add tables to the publication
-- This allows Supabase to broadcast changes to the client
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.leads_activity;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.properties_leads;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
