-- ============================================
-- AI Training Platform - Find and Remove Duplicate Materials
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Find duplicate materials (same link)
-- This shows you which materials are duplicates
SELECT
  link,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as material_ids,
  STRING_AGG(title, ' | ') as titles
FROM public.materials
WHERE link IS NOT NULL AND link != ''
GROUP BY link
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: See detailed information about duplicates
-- (Uncomment to run)
-- SELECT
--   m.id,
--   m.title,
--   m.link,
--   m.created_at,
--   m.vote_count,
--   p.full_name as uploaded_by
-- FROM public.materials m
-- LEFT JOIN public.profiles p ON m.uploaded_by = p.id
-- WHERE m.link IN (
--   SELECT link
--   FROM public.materials
--   WHERE link IS NOT NULL AND link != ''
--   GROUP BY link
--   HAVING COUNT(*) > 1
-- )
-- ORDER BY m.link, m.created_at;

-- Step 3: Delete duplicates (keeps the OLDEST one for each link)
-- IMPORTANT: Review the results from Step 1 first!
-- Uncomment the lines below to delete duplicates:

-- DELETE FROM public.materials m
-- WHERE m.id IN (
--   SELECT m2.id
--   FROM public.materials m2
--   INNER JOIN (
--     SELECT link, MIN(created_at) as first_created
--     FROM public.materials
--     WHERE link IS NOT NULL AND link != ''
--     GROUP BY link
--     HAVING COUNT(*) > 1
--   ) dups ON m2.link = dups.link
--   WHERE m2.created_at > dups.first_created
-- );

-- Step 4: Add unique constraint to prevent future duplicates
-- Run this AFTER deleting duplicates from Step 3
-- ALTER TABLE public.materials ADD CONSTRAINT materials_link_unique UNIQUE (link);

-- Step 5: Verify no duplicates remain
SELECT
  link,
  COUNT(*) as count
FROM public.materials
WHERE link IS NOT NULL AND link != ''
GROUP BY link
HAVING COUNT(*) > 1;

-- If this returns 0 rows, you're good! No duplicates.

-- ============================================
-- DONE!
-- ============================================
