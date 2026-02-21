-- ============================================
-- AI Training Platform - V10 Migration
-- Add 'must_read' as a valid material_tier value
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Drop the existing check constraint that only allows core/optional/reference
ALTER TABLE public.materials
  DROP CONSTRAINT IF EXISTS materials_material_tier_check;

-- STEP 2: Add a new constraint that includes 'must_read'
ALTER TABLE public.materials
  ADD CONSTRAINT materials_material_tier_check
  CHECK (material_tier IN ('must_read', 'core', 'optional', 'reference'));

-- ============================================
-- VERIFICATION
-- ============================================

-- Confirm constraint is updated:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.materials'::regclass AND conname = 'materials_material_tier_check';

-- Check tier distribution:
-- SELECT material_tier, COUNT(*) FROM public.materials GROUP BY material_tier ORDER BY material_tier;

-- ============================================
-- DONE! Summary:
-- - materials.material_tier now accepts: 'must_read' | 'core' | 'optional' | 'reference'
-- - Re-upload your spreadsheet — must_read values will now be stored correctly
-- ============================================
