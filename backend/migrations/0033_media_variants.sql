-- Variantes de imagen (miniatura, mediana, grande) y original saneado (sin metadatos EXIF/GPS).
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '{}',      -- { thumb: { key, width, height, size, mime }, ... }
  ADD COLUMN IF NOT EXISTS sanitized boolean NOT NULL DEFAULT false;
