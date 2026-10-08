-- Tarifas de Banners según Ubicación, Tamaño y Modalidad de Rotación (Solo o Rotativo)

ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS base_price_monthly numeric(12, 2) NOT NULL DEFAULT 500.00 CHECK (base_price_monthly >= 0);
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS exclusive_multiplier numeric(4, 2) NOT NULL DEFAULT 2.50 CHECK (exclusive_multiplier >= 1.00);

-- Si el banner en particular adquiere modalidad exclusiva (no rota con otros) o rotativa compartida
ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS is_exclusive boolean NOT NULL DEFAULT false;
ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS custom_price_monthly numeric(12, 2);
