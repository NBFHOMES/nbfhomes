-- 03_main_tables.sql
-- Core tables for the application

-- USERS TABLE (Public Profile)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY, -- Will reference auth.users
  full_name text,
  email text,
  contact_number text,
  avatar_url text,
  profession text, -- Support for user profession
  status text DEFAULT 'active',
  role text DEFAULT 'user', -- simplified from enum to text for flexibility if needed, or stick to text
  is_verified boolean DEFAULT false,
  assigned_qr_id text UNIQUE, -- Smart QR Link
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  handle text UNIQUE, -- For SEO friendly URLs
  title text NOT NULL,
  description text,
  description_html text,
  price numeric, -- Simplified from price_range jsonb for core logic, but keeping jsonb if existing app uses it
  price_range jsonb DEFAULT '{"minVariantPrice": {"amount": "0", "currencyCode": "INR"}}'::jsonb,
  featured_image jsonb,
  images jsonb[],
  tags text[],
  options jsonb[],
  variants jsonb[],
  seo jsonb,
  available_for_sale boolean DEFAULT false,
  category_id text,
  user_id uuid REFERENCES public.users(id),
  status text DEFAULT 'pending',
  is_verified boolean DEFAULT false,
  view_count numeric DEFAULT 0,
  
  -- Missing Column Fixes
  currency_code text DEFAULT 'INR',
  "contactNumber" text,
  location text,
  address text,
  type text, -- or use property_type enum
  latitude numeric,
  longitude numeric,
  "googleMapsLink" text,
  "bathroomType" text DEFAULT 'Common',
  "securityDeposit" text,
  "electricityStatus" text DEFAULT 'Separate',
  "tenantPreference" text DEFAULT 'Any',
  amenities jsonb,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- COLLECTIONS TABLE (Categories)
CREATE TABLE IF NOT EXISTS public.collections (
  id text PRIMARY KEY,
  handle text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  path text,
  seo jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADS TABLE
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    media_url text,
    media_type text CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
    cta_text text,
    cta_link text,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROPERTIES LEADS (Aggregate Counts - Legacy/Backend Compat)
CREATE TABLE IF NOT EXISTS public.properties_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  type text CHECK (type IN ('contact', 'whatsapp')),
  count numeric DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- LEADS / ACTIVITY
CREATE TABLE IF NOT EXISTS public.leads_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id), -- User who clicked/viewed
  owner_id uuid REFERENCES public.users(id), -- Owner of the property
  activity_type text CHECK (activity_type IN ('contact', 'whatsapp', 'view', 'share')),
  metadata jsonb DEFAULT '{}'::jsonb, -- Store ip, user_agent, etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INQUIRIES
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id), -- Optional, if logged in
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  message text,
  status text DEFAULT 'new', -- new, read, contacted, closed
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROPERTY VIEWS (Detailed Log)
CREATE TABLE IF NOT EXISTS public.property_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  ip_address text,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid REFERENCES public.users(id) PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
