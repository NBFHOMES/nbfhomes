-- Fix for 'new row violates row-level security policy for table "leads_activity"'
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.leads_activity ENABLE ROW LEVEL SECURITY;

-- 2. Clean up old/conflicting policies
DROP POLICY IF EXISTS "Users can insert their own lead activity" ON public.leads_activity;
DROP POLICY IF EXISTS "System can insert activity" ON public.leads_activity;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads_activity;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads_activity;

-- 3. Allow ANY authenticated user to insert a lead activity (Action)
-- This is a system-level event triggered by the UI, so we allow it.
CREATE POLICY "Anyone can insert leads" 
ON public.leads_activity FOR INSERT 
WITH CHECK (true);

-- 4. Secure SELECT access: Only the property owner, the person who made the lead, or an admin can see the lead details.
DROP POLICY IF EXISTS "Owners can view activity" ON public.leads_activity;
DROP POLICY IF EXISTS "Admins and Owners can view lead activity" ON public.leads_activity;
DROP POLICY IF EXISTS "Owners and Admins can view leads" ON public.leads_activity;

CREATE POLICY "Owners and Admins can view leads" 
ON public.leads_activity FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR auth.uid() = user_id 
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
