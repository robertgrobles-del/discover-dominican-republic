-- Análisis antivirus de los medios subidos.
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS scan_status text CHECK (scan_status IN ('clean', 'infected', 'skipped')),
  ADD COLUMN IF NOT EXISTS scanned_at timestamptz;
