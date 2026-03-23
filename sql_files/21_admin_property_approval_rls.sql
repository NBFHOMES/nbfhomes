-- ==============================================================================
-- SQL Script: Allow Admins to Update Properties (For Approval)
-- ==============================================================================

BEGIN;

-- 1. Create a policy that allows anyone in the 'admin_users' table to UPDATE properties,
-- regardless of whether they own that property or not.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'properties' 
        AND policyname = 'Admins can update properties'
    ) THEN
        CREATE POLICY "Admins can update properties"
        ON public.properties
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE admin_users.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

COMMIT;

-- Note: This is required because earlier we added an RLS policy that ONLY allowed
-- the owner (user_id = auth.uid()) to update their property. That accidentally
-- locked out the admins from clicking "Approve", because Supabase RLS blocked the update
-- since the admin's auth.uid() was not the property owner's user_id.
