-- ============================================
-- AI Training Platform — Migration V9
-- Progressive Week Unlocking
-- Run this in Supabase SQL Editor AFTER V7 migration
-- ============================================

-- Add is_enabled column to week_content
-- Defaults to false — admin must explicitly unlock each week
ALTER TABLE public.week_content
  ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT false;

-- Week 1 and Reference are unlocked by default
UPDATE public.week_content
SET is_enabled = true
WHERE week IN ('Week 1', 'Reference');

-- Seed all week rows if they don't exist yet (safe to run multiple times)
INSERT INTO public.week_content (week, is_enabled) VALUES
  ('Week 1',    true),
  ('Week 2',    false),
  ('Week 3',    false),
  ('Week 4',    false),
  ('Week 5',    false),
  ('Week 6',    false),
  ('Week 7',    false),
  ('Week 8',    false),
  ('Week 9',    false),
  ('Reference', true)
ON CONFLICT (week) DO NOTHING;

-- Verify
SELECT week, is_enabled FROM public.week_content ORDER BY week;
