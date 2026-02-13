-- ============================================
-- AI Training Platform - Fix User Deletion
-- Enable proper CASCADE DELETE for user-related data
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check existing foreign key constraints
-- This shows you what constraints exist and whether they have CASCADE DELETE
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (ccu.table_name = 'profiles' OR tc.table_name IN ('votes', 'vote_reactions', 'materials'))
ORDER BY tc.table_name;

-- Step 2: Drop existing foreign key constraints that reference profiles
-- We'll recreate them with CASCADE DELETE

-- Drop votes.user_id constraint
ALTER TABLE public.votes
DROP CONSTRAINT IF EXISTS votes_user_id_fkey CASCADE;

-- Drop vote_reactions.user_id constraint
ALTER TABLE public.vote_reactions
DROP CONSTRAINT IF EXISTS vote_reactions_user_id_fkey CASCADE;

-- Drop materials.uploaded_by constraint
ALTER TABLE public.materials
DROP CONSTRAINT IF EXISTS materials_uploaded_by_fkey CASCADE;

-- Step 3: Recreate constraints with CASCADE DELETE
-- Now when a profile is deleted, related data will be automatically deleted

-- votes.user_id → CASCADE DELETE
ALTER TABLE public.votes
ADD CONSTRAINT votes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- vote_reactions.user_id → CASCADE DELETE
ALTER TABLE public.vote_reactions
ADD CONSTRAINT vote_reactions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- materials.uploaded_by → SET NULL (keep materials but remove uploader reference)
ALTER TABLE public.materials
ADD CONSTRAINT materials_uploaded_by_fkey
FOREIGN KEY (uploaded_by)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Step 4: Verify the constraints are now correct
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name;

-- Should show:
-- votes.user_id → CASCADE
-- vote_reactions.user_id → CASCADE
-- materials.uploaded_by → SET NULL

-- ============================================
-- DONE! User deletion should now work properly.
-- When a user is deleted:
-- - Their votes will be deleted automatically
-- - Their vote reactions will be deleted automatically
-- - Materials they uploaded will remain but uploader will be NULL
-- ============================================
