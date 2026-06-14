-- Supabase SQL to fix the 'releases' table
-- Paste this into your Supabase SQL Editor and run it

-- 1. Create or ensure the releases table exists with correct column types
CREATE TABLE IF NOT EXISTS public.releases (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    album_name TEXT,
    type TEXT,
    main_artist_name TEXT,
    feature_artists JSONB, -- Storing as JSONB instead of text[] helps prevent array insertion errors
    other_artists JSONB,
    language TEXT,
    content_type TEXT,
    num_tracks INTEGER,
    genre TEXT,
    sub_genre TEXT,
    label_name TEXT,
    upc TEXT,
    content_id TEXT,
    c_line TEXT,
    p_line TEXT,
    release_date TEXT,
    cover_art_url TEXT,
    tracks JSONB,
    special_request TEXT,
    status TEXT DEFAULT 'Submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    feedback TEXT
);

-- If the columns already exist but as text, you might need to alter their type or just recreate the table
-- If you want to drop and recreate the table entirely (WARNING: you will lose existing data in it):
-- DROP TABLE public.releases;
-- (And then run the CREATE TABLE block above)

-- 2. Drop any problematic triggers (Webhooks) that might be causing the insert to fail
-- If your webhook was named "release_webhook" for example, uncomment the next line:
-- DROP TRIGGER IF EXISTS "release_webhook" ON public.releases;

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

-- 4. Recreate Policies for proper access
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.releases;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.releases;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.releases;

-- Insert Policy
CREATE POLICY "Enable insert for authenticated users only" 
ON public.releases FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Read Policy (Admins can read all, Users read their own)
CREATE POLICY "Enable read access for all users" 
ON public.releases FOR SELECT 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'admin@g.g' 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'wavoradashboard@gmail.com'
);

-- Update Policy (Admins can update all, Users update their own)
CREATE POLICY "Enable update for users based on email" 
ON public.releases FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'admin@g.g' 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'wavoradashboard@gmail.com'
);

-- Delete Policy
CREATE POLICY "Enable delete for users based on email" 
ON public.releases FOR DELETE 
TO authenticated 
USING (
    auth.uid() = user_id 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'admin@g.g' 
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'wavoradashboard@gmail.com'
);
