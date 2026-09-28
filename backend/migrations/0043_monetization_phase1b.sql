-- ==============================================================================
-- Migración 0043: Fase 1B — Quick Wins Monetización & Modelos de Negocio
-- #1 Marketplace Experiencias & Tours ampliado
-- #3 Suscripciones & Niveles para Operadores
-- #6 Misiones Patrocinadas con Sponsor
-- #15 Sello Verificado y Auditoría Institucional
-- #5 y #16 Exportación Agregada B2B y API Keys de Terceros
-- ==============================================================================

-- 1. Ampliación de categorías del Marketplace (#1)
-- Permite categorías específicas de tours, excursiones, deportes acuáticos y experiencias culturales
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_products_category_check;
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_products_category_check CHECK (
  category IN (
    'artesania', 'gastronomia', 'cafe-cacao-ron', 'moda', 'arte',
    'joyeria', 'bienestar', 'experiencia', 'tour-aventura',
    'tour-cultural', 'deportes-acuaticos', 'ecoturismo', 'otros'
  )
);

-- 2. Niveles de suscripción y perfil destacado para Operadores (#3)
ALTER TABLE partner_profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'destacado', 'premium_partner', 'corporativo')),
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS priority_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_badge boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_badge_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_badge_notes text;

CREATE INDEX IF NOT EXISTS idx_partner_profiles_tier ON partner_profiles (subscription_tier, priority_score DESC) WHERE status = 'active';

-- Historial de suscripciones y facturación de operadores
CREATE TABLE IF NOT EXISTS operator_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  plan_tier text NOT NULL CHECK (plan_tier IN ('destacado', 'premium_partner', 'corporativo')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'DOP',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  auto_renew boolean NOT NULL DEFAULT true,
  last_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_op_subs_org ON operator_subscriptions (org_id, status);

-- 3. Misiones Patrocinadas (#6)
-- Agrega sponsor_id y marca comercial opcional a las misiones de gamificación
ALTER TABLE gamification_missions
  ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sponsor_name text,
  ADD COLUMN IF NOT EXISTS sponsor_logo_url text,
  ADD COLUMN IF NOT EXISTS sponsor_reward_text text,
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_gamification_missions_sponsor ON gamification_missions (sponsor_id) WHERE is_sponsored;

-- 4. Flujo de Sello "Verificado" Institucional (#15)
CREATE TABLE IF NOT EXISTS business_verification_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('hotel', 'restaurante', 'bar', 'operador', 'agencia', 'guia', 'otro')),
  business_name text NOT NULL,
  applicant_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rnc text,
  mitur_license text,
  documents text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  audited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  audit_notes text,
  badge_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_biz_verif_status ON business_verification_audits (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_biz_verif_business ON business_verification_audits (business_id, business_type);

-- 5. API Keys B2B y Acceso a Datos Agregados Anonimizados (#5 y #16)
CREATE TABLE IF NOT EXISTS b2b_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  tier text NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'pro', 'enterprise')),
  allowed_domains text[] NOT NULL DEFAULT '{}',
  rate_limit_minute integer NOT NULL DEFAULT 60 CHECK (rate_limit_minute > 0),
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_b2b_api_keys_hash ON b2b_api_keys (key_hash) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_b2b_api_keys_user ON b2b_api_keys (user_id);
