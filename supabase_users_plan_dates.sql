-- Wavora Live Supabase Schema Update
-- Add explicit plan start and end dates to the users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS plan_end_date timestamp with time zone;
