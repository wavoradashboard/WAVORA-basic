-- SQL Snippets & Guide for CRTB Cut (Vocals Start) in Tracks Ingestion
-- Since tracks are stored in the JSONB column "tracks" inside "public.releases",
-- no structural table migrations (ALTER TABLE) are required because JSONB natively stores flexible object formats.
-- Below are helpful SQL queries to inspect, query, or report on CRTB Cut metadata.

-- 1. Query all releases with track details, including track index, track name, and their CRTB Cut values
SELECT 
    r.id AS release_id,
    r.album_name,
    r.email AS artist_email,
    track_element->>'trackName' AS track_name,
    track_element->>'crtbCut' AS crtb_cut,
    track_element->>'isrc' AS track_isrc
FROM 
    public.releases r,
    jsonb_array_elements(r.tracks) AS track_element
WHERE 
    track_element->>'crtbCut' IS NOT NULL 
    AND track_element->>'crtbCut' <> '';

-- 2. Query only releases that have at least one track with a CRTB Cut set
SELECT 
    id AS release_id,
    album_name,
    main_artist_name,
    email,
    tracks
FROM 
    public.releases
WHERE 
    jsonb_path_exists(tracks, '$[*] ? (@.crtbCut != null && @.crtbCut != "")');

-- 3. How to update a specific track's CRTB Cut directly in the database JSONB array
-- Let's say we want to set CRTB Cut of track index 0 for a specific release ID
-- Note: Replace '00000000-0000-0000-0000-000000000000' with your actual release UUID:
-- UPDATE public.releases
-- SET tracks = jsonb_set(tracks, '{0,crtbCut}', '"0:35"'::jsonb)
-- WHERE id = '00000000-0000-0000-0000-000000000000';
