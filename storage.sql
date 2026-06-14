-- =========================================================
--   SUPABASE STORAGE SETUP & RLS POLICIES (COMPATIBLE V2)
-- =========================================================
-- Paste this script directly into your Supabase SQL Editor.
-- This script does NOT use system-level alters, avoiding ownership errors.

-- ---------------------------------------------------------
-- PART 1: Create the 'app-files' private bucket
-- ---------------------------------------------------------
-- In standard Supabase setups, this safely inserts the bucket definition.
-- If this fails due to project permission restrictions, you can simply create 
-- the bucket manually via the Supabase Dashboard UI (Storage -> "New Bucket" -> name: "app-files" -> "Private").
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
  VALUES (
    'app-files', 
    'app-files', 
    false, 
    52428800, -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp3']
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: If direct inserts are disallowed due to policy restrictions,
    -- the user can create it manually, but do not abort the transaction.
    RAISE NOTICE 'Skipping direct bucket insertion due to permission limit: %', SQLERRM;
END
$$;


-- ---------------------------------------------------------
-- PART 2: Clean up old storage policies to prevent overlap
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users and Admins can read files" ON storage.objects;
DROP POLICY IF EXISTS "Users and Admins can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can preview files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view and manage all files" ON storage.objects;


-- ---------------------------------------------------------
-- PART 3: READ Access Policy
-- ---------------------------------------------------------
-- Restricts reading files to the uploader (where folder path is their Auth UID)
-- OR administrators ('admin@g.g' or 'wavoradashboard@gmail.com')
CREATE POLICY "Users and Admins can read files" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'app-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com')
  )
);


-- ---------------------------------------------------------
-- PART 4: UPLOAD (Insert) Access Policy
-- ---------------------------------------------------------
-- Allows authenticated users to upload files ONLY to folders labeled with their user ID.
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);


-- ---------------------------------------------------------
-- PART 5: UPDATE Access Policy
-- ---------------------------------------------------------
-- Allows users to update/overwrite files within their own workspace folder.
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'app-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);


-- ---------------------------------------------------------
-- PART 6: DELETE Access Policy
-- ---------------------------------------------------------
-- Allows users to delete files under their own folder, 
-- or administrators to clean up storage records.
CREATE POLICY "Users and Admins can delete files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'app-files' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com')
  )
);
