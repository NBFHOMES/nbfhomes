-- Create QR Codes table for inventory management
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    code text UNIQUE NOT NULL, -- Format: 'nbf_PREFIX.RANDOM'
    status text DEFAULT 'unused', -- 'unused', 'active', 'disabled'
    assigned_user_id uuid REFERENCES auth.users(id),
    is_downloaded boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    generated_by uuid REFERENCES auth.users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON public.qr_codes(status);
