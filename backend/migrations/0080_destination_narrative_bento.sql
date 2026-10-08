-- ==============================================================================
-- Migración 0080: Ampliación de campos para Narrativa Visual Bento & Stories
-- Soporta:
-- 1. destinations: narrative_quote, narrative_author, local_story, curated_gallery, day_timeline
-- 2. admin/movil: quick_facts, badges_destacados
-- ==============================================================================

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS narrative_quote text,
  ADD COLUMN IF NOT EXISTS narrative_author text,
  ADD COLUMN IF NOT EXISTS local_story text,
  ADD COLUMN IF NOT EXISTS curated_gallery jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS day_timeline jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS quick_facts jsonb NOT NULL DEFAULT '[]';
