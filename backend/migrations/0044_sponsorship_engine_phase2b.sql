-- ==============================================================================
-- Migración 0044: Fase 2B — Motor de Patrocinio Genérico & Ad Server (Grupo B)
-- #2 Posiciones patrocinadas en búsqueda
-- #8 Banners publicitarios
-- #9 Contenido editorial patrocinado
-- #10 Emails patrocinados
-- #11 Notificaciones push patrocinadas
-- ==============================================================================

-- 1. Campañas de Patrocinio
CREATE TABLE IF NOT EXISTS sponsorship_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  advertiser_name text NOT NULL,
  advertiser_email text NOT NULL,
  campaign_name text NOT NULL,
  billing_type text NOT NULL CHECK (billing_type IN ('flat', 'cpc', 'cpm')),
  budget_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (budget_total >= 0),
  budget_spent numeric(12,2) NOT NULL DEFAULT 0 CHECK (budget_spent >= 0),
  cpc_rate numeric(10,2) DEFAULT 0 CHECK (cpc_rate >= 0),
  cpm_rate numeric(10,2) DEFAULT 0 CHECK (cpm_rate >= 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_campaign_dates CHECK (ends_at >= starts_at)
);
CREATE INDEX IF NOT EXISTS idx_spons_camp_status ON sponsorship_campaigns (status, starts_at, ends_at);

-- 2. Espacios publicitarios / Slots de patrocinio
CREATE TABLE IF NOT EXISTS sponsorship_slots (
  id text PRIMARY KEY,
  name text NOT NULL,
  slot_type text NOT NULL CHECK (slot_type IN ('search_position', 'banner', 'sponsored_content', 'email_placement', 'push_placement')),
  max_active_creatives integer NOT NULL DEFAULT 1 CHECK (max_active_creatives > 0),
  recommended_dimensions text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pre-popular los slots estándares del portal
INSERT INTO sponsorship_slots (id, name, slot_type, max_active_creatives, recommended_dimensions)
VALUES
  ('search_top', 'Posición Patrocinada Superior en Búsqueda', 'search_position', 3, NULL),
  ('home_hero_banner', 'Banner Destacado Home', 'banner', 5, '1440x600'),
  ('category_banner', 'Banner en Cabecera de Categoría', 'banner', 3, '1200x300'),
  ('sponsored_article', 'Artículo / Guía Editorial Patrocinada', 'sponsored_content', 10, '800x500'),
  ('newsletter_sponsor', 'Espacio Patrocinado en Newsletter Semanal', 'email_placement', 2, '600x200'),
  ('push_announcement', 'Notificación Push Institucional Patrocinada', 'push_placement', 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Creatividades / Anuncios
CREATE TABLE IF NOT EXISTS sponsorship_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES sponsorship_campaigns(id) ON DELETE CASCADE,
  slot_id text NOT NULL REFERENCES sponsorship_slots(id) ON DELETE CASCADE,
  title text NOT NULL,
  headline text,
  body_text text,
  target_url text NOT NULL,
  image_url text,
  badge_label text NOT NULL DEFAULT 'Patrocinado',
  category_target text,
  destination_target text,
  weight integer NOT NULL DEFAULT 10 CHECK (weight > 0),
  daily_cap_impressions integer,
  daily_cap_clicks integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'rejected')),
  impressions_count integer NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spons_creat_slot ON sponsorship_creatives (slot_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_spons_creat_campaign ON sponsorship_creatives (campaign_id);

-- 4. Eventos de Telemetría (Impresiones y Clics para facturación y analítica de ROI)
CREATE TABLE IF NOT EXISTS sponsorship_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id uuid NOT NULL REFERENCES sponsorship_creatives(id) ON DELETE CASCADE,
  slot_id text NOT NULL REFERENCES sponsorship_slots(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion')),
  session_id text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  page text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spons_events_creative_time ON sponsorship_events (creative_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_spons_events_date ON sponsorship_events (created_at);
