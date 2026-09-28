-- Migration 0047: Fase 5B - Membresías VIP (Pasaporte RD), Puntos/Fidelización y Ticketing de Eventos
-- Modelos #18 (Puntos canjeables y fidelización avanzada), #19 (Pasaporte RD / Membresía VIP), #20 (Ticketing de eventos en vivo y streaming)

CREATE TABLE IF NOT EXISTS membership_plans (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price_annual NUMERIC(10, 2) NOT NULL DEFAULT 49.99,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  points_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.50,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memberships (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  plan_id VARCHAR(64) NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, EXPIRED
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  payment_reference VARCHAR(128),
  vip_badge_code VARCHAR(64) DEFAULT 'PASAPORTE_VIP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);

-- Extensión para fidelización por puntos (#18)
CREATE TABLE IF NOT EXISTS loyalty_points_ledger (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  points_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL DEFAULT 0,
  reason VARCHAR(64) NOT NULL, -- PURCHASE_REWARD, CREATOR_TIP, REDEMPTION, VIP_BONUS
  reference_id VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_user ON loyalty_points_ledger(user_id);

-- Ticketing para eventos en vivo (#20)
CREATE TABLE IF NOT EXISTS event_tickets (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  tier_name VARCHAR(64) NOT NULL DEFAULT 'GENERAL', -- GENERAL, VIP, BACKSTAGE, STREAMING
  price_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  qr_code_hash VARCHAR(128) UNIQUE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ISSUED', -- ISSUED, CHECKED_IN, CANCELLED
  checked_in_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_user ON event_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_qr ON event_tickets(qr_code_hash);

-- Semilla de planes de membresía VIP (#19 Pasaporte RD)
INSERT INTO membership_plans (id, slug, name, description, price_annual, points_multiplier, benefits, is_active)
VALUES 
  ('plan_pasaporte_rd_vip', 'pasaporte-rd-vip', 'Pasaporte RD VIP Anual', 'Acceso ilimitado a descuentos exclusivos de operadores turísticos, multiplicador x2 en puntos y soporte concierge.', 59.99, 2.00, '["Descuento del 15% en tours certificados", "Acceso prioritario a eventos en vivo", "Insignia VIP en la comunidad y perfiles", "Multiplicador x2 en puntos canjeables", "Soporte concierge vía WhatsApp"]'::jsonb, TRUE),
  ('plan_pasaporte_rd_elite', 'pasaporte-rd-elite', 'Pasaporte RD Elite', 'Para viajeros frecuentes con cobertura de asistencia y acceso VIP backstage en festivales y carnavales.', 119.99, 2.50, '["Todos los beneficios VIP", "Asistencia al viajero nacional incluida", "Pase backstage en carnavales y festivales asociados", "Multiplicador x2.5 en puntos canjeables"]'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_annual = EXCLUDED.price_annual,
  points_multiplier = EXCLUDED.points_multiplier,
  benefits = EXCLUDED.benefits;
