-- ============================================
-- AI Training Platform - V5 Migration
-- Add Essential Field for Top Materials
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add is_essential column to materials table
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_essential boolean DEFAULT false NOT NULL;

-- 2. Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_materials_essential ON public.materials(is_essential) WHERE is_essential = true;

-- 3. Recreate material_scores view to include is_essential
DROP VIEW IF EXISTS public.material_scores;

CREATE OR REPLACE VIEW public.material_scores AS
SELECT
  m.*,
  COALESCE(AVG(v.quality_score), 0)::numeric(3,1) AS avg_quality,
  COALESCE(AVG(v.relevance_score), 0)::numeric(3,1) AS avg_relevance,
  COALESCE((AVG(v.quality_score) + AVG(v.relevance_score)) / 2, 0)::numeric(3,1) AS avg_overall,
  COUNT(v.id)::integer AS vote_count
FROM public.materials m
LEFT JOIN public.votes v ON v.material_id = m.id
GROUP BY m.id;

-- ============================================
-- DONE! Essential field added.
-- - Admins can mark materials as "Essential" (top 30 must-reads)
-- - Indexed for performance
-- - View updated to include the field
-- ============================================
