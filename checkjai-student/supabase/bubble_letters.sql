-- Create table for Bubble Letters
CREATE TABLE IF NOT EXISTS public.bubble_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT, -- Optional, can be null if we want to keep it anonymous but linked to a session
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bubble_letters ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (anonymous or logged in students)
CREATE POLICY "Enable insert for everyone" ON public.bubble_letters
    FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated teachers can select (optional, for admin view later)
-- Assuming we have a role 'authenticated' for teachers or just let them query via service role
