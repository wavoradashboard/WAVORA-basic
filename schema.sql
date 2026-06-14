-- Wavora Live Supabase Schema
-- Run this in your Supabase SQL Editor to set up all tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text NOT NULL,
  artist_name text NOT NULL,
  plan text NOT NULL,
  is_approved boolean DEFAULT false,
  registered_at timestamp with time zone DEFAULT now(),
  allowed_c_lines text,
  allowed_p_lines text
);

-- 2. RELEASES TABLE
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  album_name text NOT NULL,
  type text NOT NULL,
  main_artist_name text NOT NULL,
  feature_artists jsonb DEFAULT '[]'::jsonb,
  other_artists jsonb DEFAULT '[]'::jsonb,
  language text,
  content_type text,
  num_tracks integer,
  genre text,
  sub_genre text,
  label_name text,
  upc text,
  content_id text DEFAULT 'No',
  c_line text,
  p_line text,
  release_date text,
  cover_art_url text,
  tracks jsonb DEFAULT '[]'::jsonb,
  special_request text,
  status text DEFAULT 'Submitted',
  feedback text,
  submitted_at timestamp with time zone DEFAULT now()
);

-- 3. ARTISTS TABLE
CREATE TABLE IF NOT EXISTS public.artists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text NOT NULL,
  spotify_link text,
  apple_music_link text,
  instagram_link text
);

-- 4. LABELS TABLE
CREATE TABLE IF NOT EXISTS public.labels (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text NOT NULL
);

-- 5. REVENUE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.revenue_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  month text NOT NULL,
  amount numeric NOT NULL,
  breakdown jsonb DEFAULT '[]'::jsonb,
  currency text DEFAULT 'USD'
);

-- 6. SUPPORT QUERIES TABLE
CREATE TABLE IF NOT EXISTS public.support_queries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  artist_name text,
  query_text text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'Pending',
  reply_text text
);

-- 7. OAC APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.oac_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  artist_name text,
  spotify_link text,
  youtube_link text,
  full_name text,
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'Pending'
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  target_type text NOT NULL,
  target_value text,
  severity text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oac_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Note: Depending on your security needs, you should create RLS policies for each table.
-- Basic policy allowing all authenticated users to read/write their own data, and admin email to see all.
-- Below is a generic open policy for rapid development, BUT you MUST lock this down for production!

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') IN ('admin@g.g', 'wavoradashboard@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Temporary open policies for development (replace with secure ones later)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;
CREATE POLICY "Enable read for authenticated users" ON public.users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
CREATE POLICY "Enable update for users based on email" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.releases;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.releases FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.artists;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.artists FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.labels;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.labels FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.revenue_reports;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.revenue_reports FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.support_queries;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.support_queries FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.oac_applications;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.oac_applications FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Notifications can be read by all authenticated, inserted by admin
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.notifications;
CREATE POLICY "Enable read for authenticated users" ON public.notifications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for admin" ON public.notifications;
CREATE POLICY "Enable insert for admin" ON public.notifications FOR INSERT TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Enable delete for admin" ON public.notifications;
CREATE POLICY "Enable delete for admin" ON public.notifications FOR DELETE TO authenticated USING (is_admin());

-- 9. PAYOUT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  artist_name text,
  amount numeric,
  currency text,
  payment_method text,
  payment_details jsonb,
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'Pending',
  feedback text
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.payout_requests;
CREATE POLICY "Enable CRUD for users based on user_id" ON public.payout_requests FOR ALL TO authenticated USING (auth.uid() = user_id OR is_admin());
