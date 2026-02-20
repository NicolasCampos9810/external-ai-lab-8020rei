-- ============================================
-- AI Training Platform - V7 Migration
-- 9-Week Structure, Core/Optional/Reference Tiers,
-- Week Objectives & Deliverables
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Add material_tier column to materials
-- (Replaces the binary is_essential boolean with a 3-tier system)
-- ============================================

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS material_tier text NOT NULL DEFAULT 'optional'
  CHECK (material_tier IN ('core', 'optional', 'reference'));

-- Migrate existing is_essential data: essential → core, everything else stays optional
UPDATE public.materials SET material_tier = 'core' WHERE is_essential = true;

-- Create index for faster tier filtering
CREATE INDEX IF NOT EXISTS idx_materials_tier ON public.materials(material_tier);

-- ============================================
-- STEP 2: Add justification_for_assignment column
-- (Short text explaining why this material was assigned)
-- ============================================

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS justification_for_assignment text;

-- ============================================
-- STEP 3: Create week_content table
-- (Stores objectives, homework, and deliverable prompt per week — admin-editable)
-- ============================================

CREATE TABLE IF NOT EXISTS public.week_content (
  week                text PRIMARY KEY,
  objectives          text,
  homework            text,
  deliverable_prompt  text,
  updated_at          timestamptz DEFAULT now(),
  updated_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Seed rows for all weeks (safe to run multiple times — ON CONFLICT DO NOTHING)
INSERT INTO public.week_content (week) VALUES
  ('Week 1'),
  ('Week 2'),
  ('Week 3'),
  ('Week 4'),
  ('Week 5'),
  ('Week 6'),
  ('Week 7'),
  ('Week 8'),
  ('Week 9'),
  ('Reference')
ON CONFLICT (week) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.week_content ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read week content
CREATE POLICY "week_content_read" ON public.week_content
  FOR SELECT USING (true);

-- Only admins can insert/update/delete week content
CREATE POLICY "week_content_admin_write" ON public.week_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STEP 4: Create week_deliverables table
-- (Stores each user's submitted link per week — updateable)
-- ============================================

CREATE TABLE IF NOT EXISTS public.week_deliverables (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week         text NOT NULL,
  link         text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE (user_id, week)
);

-- Enable Row Level Security
ALTER TABLE public.week_deliverables ENABLE ROW LEVEL SECURITY;

-- Anyone can read all deliverable submissions (admins can see everyone's)
CREATE POLICY "deliverables_read_all" ON public.week_deliverables
  FOR SELECT USING (true);

-- Users can insert/update/delete only their own deliverables
CREATE POLICY "deliverables_own_write" ON public.week_deliverables
  FOR ALL
  USING (user_id = auth.uid());

-- Index for fast per-week + per-user lookups
CREATE INDEX IF NOT EXISTS idx_deliverables_week ON public.week_deliverables(week);
CREATE INDEX IF NOT EXISTS idx_deliverables_user ON public.week_deliverables(user_id);

-- ============================================
-- STEP 5: Recreate material_scores view
-- (Now includes material_tier and justification_for_assignment)
-- ============================================

DROP VIEW IF EXISTS public.material_scores;

CREATE OR REPLACE VIEW public.material_scores AS
SELECT
  m.*,
  COALESCE(AVG(v.quality_score), 0)::numeric(3,1)                                    AS avg_quality,
  COALESCE(AVG(v.relevance_score), 0)::numeric(3,1)                                   AS avg_relevance,
  COALESCE((AVG(v.quality_score) + AVG(v.relevance_score)) / 2, 0)::numeric(3,1)     AS avg_overall,
  COUNT(v.id)::integer                                                                 AS vote_count
FROM public.materials m
LEFT JOIN public.votes v ON v.material_id = m.id
GROUP BY m.id;

-- ============================================
-- VERIFICATION
-- Run these to confirm everything looks right:
-- ============================================

-- Check material tier distribution after migration:
-- SELECT material_tier, COUNT(*) FROM public.materials GROUP BY material_tier ORDER BY material_tier;

-- Check week_content rows were seeded:
-- SELECT week FROM public.week_content ORDER BY week;

-- Check week_deliverables table exists:
-- SELECT COUNT(*) FROM public.week_deliverables;

-- Verify material_scores view includes new columns:
-- SELECT id, title, material_tier, justification_for_assignment, avg_overall, vote_count
-- FROM public.material_scores LIMIT 5;

-- ============================================
-- DONE! Summary of changes:
-- - materials.material_tier: 'core' | 'optional' | 'reference'
--   (existing is_essential=true materials auto-migrated to 'core')
-- - materials.justification_for_assignment: text (nullable)
-- - week_content table: objectives, homework, deliverable_prompt per week
-- - week_deliverables table: user link submissions per week (updatable)
-- - material_scores view: recreated with new columns
-- ============================================
