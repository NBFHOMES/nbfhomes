-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    desktop_media_url TEXT NOT NULL,
    desktop_media_type VARCHAR(50) NOT NULL CHECK (desktop_media_type IN ('image', 'video')),
    mobile_media_url TEXT NOT NULL,
    mobile_media_type VARCHAR(50) NOT NULL CHECK (mobile_media_type IN ('image', 'video')),
    action_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active ads
CREATE POLICY "Public can view active advertisements" 
ON advertisements FOR SELECT 
USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access to advertisements" 
ON advertisements FOR ALL 
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
