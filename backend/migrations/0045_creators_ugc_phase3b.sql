-- ==============================================================================
-- Migración 0045: Fase 3B — Módulo de Creadores UGC & Video Pipeline (Grupo G)
-- Monetización de Creadores en 3 Capas:
-- 1. Comisión por reserva/compra originada en el video
-- 2. Licenciamiento de contenido a marcas y operadores
-- 3. Fondo de Creadores por visualizaciones / engagement
-- ==============================================================================

-- 1. Perfiles de Creador de Contenido UGC
CREATE TABLE IF NOT EXISTS creator_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  handle text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  cover_url text,
  social_channels jsonb NOT NULL DEFAULT '{}', -- { instagram, tiktok, youtube }
  tier text NOT NULL DEFAULT 'emerging' CHECK (tier IN ('emerging', 'verified', 'pro', 'partner')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'under_review')),
  commission_rate numeric(5,2) NOT NULL DEFAULT 8.00 CHECK (commission_rate BETWEEN 0 AND 50),
  payout_method text,
  payout_details text,
  total_views bigint NOT NULL DEFAULT 0,
  total_earnings numeric(12,2) NOT NULL DEFAULT 0,
  balance_pending numeric(12,2) NOT NULL DEFAULT 0,
  balance_available numeric(12,2) NOT NULL DEFAULT 0,
  approved_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_tier ON creator_profiles (tier, total_views DESC);

-- 2. Videos y Contenido UGC de Creadores
CREATE TABLE IF NOT EXISTS creator_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 900), -- máx 15 minutos
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  resolution text, -- '1080p', '4k', '720p'
  aspect_ratio text DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')),
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  destination_name text,
  category text, -- 'playas', 'gastronomia', 'aventura', 'cultura'
  tags text[] NOT NULL DEFAULT '{}',
  linked_listing_id uuid, -- Producto/tour vinculado para atribución directa
  linked_listing_type text CHECK (linked_listing_type IN ('marketplace_product', 'operator_listing')),
  license_available boolean NOT NULL DEFAULT true,
  license_fee numeric(10,2) DEFAULT 0, -- tarifa de licencia opcional
  views_count bigint NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('processing', 'pending_review', 'published', 'rejected', 'archived')),
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_videos_status ON creator_videos (status, views_count DESC);
CREATE INDEX IF NOT EXISTS idx_creator_videos_creator ON creator_videos (creator_id, status);

-- 3. Telemetría de Videos (Views, Engagement y Atribución)
CREATE TABLE IF NOT EXISTS creator_video_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES creator_videos(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view_start', 'view_complete', 'like', 'share', 'conversion')),
  watch_time_seconds integer DEFAULT 0,
  session_id text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_video_events_video_type ON creator_video_events (video_id, event_type, created_at);

-- 4. Liquidaciones y Payouts a Creadores
CREATE TABLE IF NOT EXISTS creator_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'DOP',
  payout_source text NOT NULL CHECK (payout_source IN ('creator_fund', 'affiliate_commission', 'content_licensing', 'tip')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'failed')),
  bank_reference text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON creator_payouts (creator_id, status);
