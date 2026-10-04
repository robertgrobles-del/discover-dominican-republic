-- ==============================================================================
-- Migración 0068: Módulo de Gamificación Patrocinada por Operadores y Estancias para Creadores
-- 1. Retos y misiones patrocinadas por establecimientos turísticos
-- 2. Premios y vouchers patrocinados para el Club de Recompensas
-- 3. Hub de estancias para creadores de contenido (postulaciones e invitaciones directas)
-- ==============================================================================

-- 1. Retos patrocinados por operadores
CREATE TABLE IF NOT EXISTS operator_sponsored_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  entity_type text NOT NULL DEFAULT 'hotel' CHECK (entity_type IN ('hotel', 'restaurant', 'bar', 'experience', 'destination', 'other')),
  entity_id text,
  action_type text NOT NULL DEFAULT 'visit_checkin' CHECK (action_type IN ('visit_checkin', 'scan_qr', 'review_photo', 'booking_completed', 'social_share')),
  xp_reward integer NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  coin_reward integer NOT NULL DEFAULT 15 CHECK (coin_reward >= 0),
  budget_total numeric(12,2) DEFAULT 0 CHECK (budget_total >= 0),
  budget_spent numeric(12,2) DEFAULT 0 CHECK (budget_spent >= 0),
  max_completions integer DEFAULT 100 CHECK (max_completions > 0),
  current_completions integer DEFAULT 0 CHECK (current_completions >= 0),
  reward_voucher_code text,
  reward_voucher_discount text,
  banner_image_url text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected')),
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_sponsored_challenge_dates CHECK (ends_at >= starts_at)
);
CREATE INDEX IF NOT EXISTS idx_sponsored_challenges_status ON operator_sponsored_challenges (status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_sponsored_challenges_operator ON operator_sponsored_challenges (operator_id);

-- 2. Premios patrocinados para el Club de Recompensas
CREATE TABLE IF NOT EXISTS operator_sponsored_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prize_name text NOT NULL,
  category text NOT NULL DEFAULT 'discount_coupon' CHECK (category IN ('hotel_stay', 'restaurant_dinner', 'excursion_pass', 'discount_coupon', 'merchandise', 'vip_pass')),
  description text NOT NULL,
  terms_conditions text,
  image_url text,
  coin_price integer NOT NULL DEFAULT 100 CHECK (coin_price > 0),
  stock_total integer NOT NULL DEFAULT 10 CHECK (stock_total > 0),
  stock_remaining integer NOT NULL DEFAULT 10 CHECK (stock_remaining >= 0),
  voucher_prefix text DEFAULT 'DR-',
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'active', 'out_of_stock', 'inactive', 'rejected')),
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsored_rewards_status ON operator_sponsored_rewards (status, coin_price);
CREATE INDEX IF NOT EXISTS idx_sponsored_rewards_operator ON operator_sponsored_rewards (operator_id);

-- 3. Estancias para Creadores de Contenido / Influencers (publicadas por Hoteles/Negocios)
CREATE TABLE IF NOT EXISTS creator_stays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hotel_name text NOT NULL,
  destination text NOT NULL,
  province_id text,
  stay_title text NOT NULL,
  stay_description text NOT NULL,
  nights_count integer NOT NULL DEFAULT 2 CHECK (nights_count > 0),
  guests_allowed integer NOT NULL DEFAULT 2 CHECK (guests_allowed > 0),
  room_type text DEFAULT 'Habitación Deluxe o Suite',
  included_perks text[] DEFAULT ARRAY['Alojamiento', 'Desayuno incluido', 'Acceso a instalaciones'],
  deliverables_required text[] DEFAULT ARRAY['1 Reel / Video corto', 'Stories etiquetando al hotel y @descubrerd', 'Fotos en alta resolución'],
  min_followers_guideline text DEFAULT '10k+',
  preferred_niches text[] DEFAULT ARRAY['Turismo', 'Lifestyle', 'Gastronomía'],
  dates_flexibility text DEFAULT 'A coordinar según disponibilidad',
  image_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_stays_status ON creator_stays (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_stays_operator ON creator_stays (operator_id);

-- 4. Postulaciones de Creadores a Estancias
CREATE TABLE IF NOT EXISTS creator_stay_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id uuid NOT NULL REFERENCES creator_stays(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_message text NOT NULL,
  social_profiles jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_dates text,
  proposed_deliverables text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  operator_feedback text,
  content_links text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_stay_creator UNIQUE (stay_id, creator_id)
);
CREATE INDEX IF NOT EXISTS idx_creator_stay_apps_creator ON creator_stay_applications (creator_id, status);
CREATE INDEX IF NOT EXISTS idx_creator_stay_apps_stay ON creator_stay_applications (stay_id, status);

-- 5. Invitaciones Directas de Hoteles a Creadores
CREATE TABLE IF NOT EXISTS creator_stay_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stay_id uuid REFERENCES creator_stays(id) ON DELETE SET NULL,
  hotel_name text NOT NULL,
  invitation_message text NOT NULL,
  offered_perks text[] DEFAULT ARRAY['Estancia 2 noches todo incluido', 'Spa', 'Experiencia gastronómica'],
  requested_deliverables text[] DEFAULT ARRAY['1 Reel colaborativo', '3 Stories destacadas'],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
  decline_reason text,
  scheduled_dates text,
  content_links text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_stay_invites_creator ON creator_stay_invitations (creator_id, status);
CREATE INDEX IF NOT EXISTS idx_creator_stay_invites_operator ON creator_stay_invitations (operator_id, status);
