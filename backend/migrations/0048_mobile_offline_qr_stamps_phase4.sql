-- Migration 0048: Fase 4 — Sprint 4.2: App Móvil, Modo Offline y Validación de Sellos de Pasaporte por QR
-- Ítems #220 (Escaneo de QR para Sellos del Pasaporte) y #222 (Paquetes de Datos de Emergencia / Offline)

-- 1. Códigos QR dinámicos o estáticos para Sellos del Pasaporte Turístico Digital (#220)
CREATE TABLE IF NOT EXISTS passport_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- destination, attraction, hotel, restaurant, park, monument, etc.
  entity_id uuid NOT NULL,
  qr_token text UNIQUE NOT NULL,
  stamp_title text NOT NULL,
  stamp_badge_url text,
  xp_reward integer NOT NULL DEFAULT 50,
  coins_reward integer NOT NULL DEFAULT 10,
  province_id uuid REFERENCES provinces(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_passport_qr_token ON passport_qr_codes (qr_token) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_passport_qr_entity ON passport_qr_codes (entity_type, entity_id);

-- Semilla de códigos QR oficiales para lugares turísticos clave
INSERT INTO passport_qr_codes (id, entity_type, entity_id, qr_token, stamp_title, xp_reward, coins_reward)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'monument', '00000000-0000-0000-0000-000000000001', 'DR-STAMP-ZONA-COLONIAL-2026', 'Sello Oficial Zona Colonial Santo Domingo', 100, 25),
  ('c0000000-0000-0000-0000-000000000002', 'beach', '00000000-0000-0000-0000-000000000002', 'DR-STAMP-BAHIA-AGUILAS-2026', 'Sello de Honor Bahía de las Águilas', 150, 40),
  ('c0000000-0000-0000-0000-000000000003', 'mountain', '00000000-0000-0000-0000-000000000003', 'DR-STAMP-PICO-DUARTE-2026', 'Cumbre Pico Duarte — Techo del Caribe', 250, 50)
ON CONFLICT (qr_token) DO UPDATE SET
  stamp_title = EXCLUDED.stamp_title,
  xp_reward = EXCLUDED.xp_reward,
  coins_reward = EXCLUDED.coins_reward;
