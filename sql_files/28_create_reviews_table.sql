-- Create Reviews Table for Smart Review System
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content text NOT NULL,
    status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
    admin_reply text,
    admin_reply_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read approved reviews
DROP POLICY IF EXISTS "Allow public read-only access to approved reviews" ON public.reviews;
CREATE POLICY "Allow public read-only access to approved reviews"
ON public.reviews FOR SELECT
USING (status = 'approved');

-- Allow authenticated users to insert their own reviews
DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated users to insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);
