-- Run this in your Supabase SQL Editor

-- 1. Create a public users table linked to Auth
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Basic',
    is_approved BOOLEAN NOT NULL DEFAULT false,
    allowed_c_lines TEXT,
    allowed_p_lines TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Admins can view all users, but for simplicity let's allow read for all authenticated users to allow the mock Admin flows to work if needed:
CREATE POLICY "All authenticated users can view public users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admins need an override for insert/update, for safety we can allow authenticated users inserting:
CREATE POLICY "Authenticated users can insert users (used for admin creation)" ON public.users FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 2. Artists Profile Table
CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    spotify_link TEXT,
    apple_music_link TEXT,
    instagram_link TEXT,
    default_c_line TEXT,
    default_p_line TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own artists" ON public.artists 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 3. Labels Table
CREATE TABLE public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own labels" ON public.labels 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 4. Releases Table
CREATE TABLE public.releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    album_name TEXT NOT NULL,
    type TEXT NOT NULL,
    main_artist_name TEXT NOT NULL,
    other_artists JSONB,
    language TEXT NOT NULL,
    content_type TEXT NOT NULL,
    num_tracks INTEGER NOT NULL,
    genre TEXT NOT NULL,
    sub_genre TEXT NOT NULL,
    label_name TEXT,
    upc TEXT,
    content_id TEXT DEFAULT 'No',
    c_line TEXT,
    p_line TEXT,
    release_date TEXT NOT NULL,
    cover_art_url TEXT NOT NULL,
    tracks JSONB NOT NULL,
    special_request TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    feedback TEXT
);

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own releases" ON public.releases 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 5. Revenue Reports Table
CREATE TABLE public.revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    month TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    breakdown JSONB NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own revenue reports" ON public.revenue_reports 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 6. Support Queries
CREATE TABLE public.support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    query_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    reply_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own queries" ON public.support_queries 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 7. OAC Applications
CREATE TABLE public.oac_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    spotify_link TEXT NOT NULL,
    youtube_link TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.oac_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own OAC applications" ON public.oac_applications 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));

-- 8. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_value TEXT,
    severity TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications are readable by all authenticated users
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read notifications" ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Auth Hook or Function to auto-create user profile (Optional, you can also just insert manually after sign up)

-- 9. Payout Requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_details JSONB,
    status TEXT NOT NULL DEFAULT 'Pending',
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users handle their own payout requests" ON public.payout_requests 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com'));