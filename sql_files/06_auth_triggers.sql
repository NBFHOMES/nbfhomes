-- 06_auth_triggers.sql
-- Automation for user creation and property handling

-- 1. Helper Function: Slugify
CREATE OR REPLACE FUNCTION public.slugify(value TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(value, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger: Auto-Generate Handle for Properties
CREATE OR REPLACE FUNCTION public.set_handle_if_null() RETURNS TRIGGER AS $$
DECLARE
  base_handle TEXT;
  new_handle TEXT;
  counter INT := 0;
BEGIN
  IF NEW.handle IS NULL OR NEW.handle = '' THEN
    base_handle := public.slugify(NEW.title);
    -- Fallback if title is empty or non-latin
    IF base_handle IS NULL OR base_handle = '' THEN base_handle := 'property-' || floor(random() * 10000)::text; END IF;
    
    new_handle := base_handle;
    -- Check collision
    WHILE EXISTS (SELECT 1 FROM public.properties WHERE handle = new_handle) LOOP
      counter := counter + 1;
      new_handle := base_handle || '-' || counter;
    END LOOP;
    NEW.handle := new_handle;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_property_handle ON public.properties;
CREATE TRIGGER ensure_property_handle BEFORE INSERT ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_handle_if_null();

-- 3. Trigger: Handle New User (Auth -> Public Sync)
-- CRITICAL for Login Loop Prevention: Ensures public profile exists immediately
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), -- Fallback to email if name missing
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$;

-- Drop and recreate the auth trigger to be safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. RPC: Increment View Count (Atomic)
DROP FUNCTION IF EXISTS public.increment_view_count(uuid);
CREATE OR REPLACE FUNCTION public.increment_view_count(row_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.properties
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = row_id;
END;
$$;

-- 5. RPC: Increment Leads Count (Atomic)
DROP FUNCTION IF EXISTS public.increment_leads_count(uuid);
CREATE OR REPLACE FUNCTION public.increment_leads_count(row_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.properties
  SET leads_count = COALESCE(leads_count, 0) + 1
  WHERE id = row_id;
END;
$$;
