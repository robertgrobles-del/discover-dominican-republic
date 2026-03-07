
-- ============================================
-- GAMIFICATION SYSTEM - COMPLETE DATABASE
-- ============================================

-- 1. Level definitions (static config)
CREATE TABLE public.gamification_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  title text NOT NULL,
  xp_required integer NOT NULL DEFAULT 0,
  icon text,
  color text,
  marketplace_discount numeric DEFAULT 0,
  perks text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. User gamification profile
CREATE TABLE public.user_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1,
  coins integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_missions_completed integer NOT NULL DEFAULT 0,
  total_purchases integer NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Missions / Challenges
CREATE TABLE public.gamification_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  short_description text,
  mission_type text NOT NULL DEFAULT 'daily',
  category text DEFAULT 'exploration',
  icon text,
  xp_reward integer NOT NULL DEFAULT 10,
  coin_reward integer NOT NULL DEFAULT 0,
  target_count integer NOT NULL DEFAULT 1,
  target_action text NOT NULL,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  min_level integer DEFAULT 1,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. User mission progress
CREATE TABLE public.user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_id uuid REFERENCES public.gamification_missions(id) ON DELETE CASCADE NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- 5. XP/Coin transaction log
CREATE TABLE public.gamification_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL,
  xp_amount integer DEFAULT 0,
  coin_amount integer DEFAULT 0,
  description text,
  source_type text,
  source_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Prize catalog (redeemable with coins)
CREATE TABLE public.gamification_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  short_description text,
  image_url text,
  prize_type text NOT NULL DEFAULT 'experience',
  coin_cost integer NOT NULL DEFAULT 100,
  min_level integer DEFAULT 1,
  quantity_available integer,
  quantity_redeemed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sponsor text,
  valid_until date,
  terms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. User prize redemptions
CREATE TABLE public.user_prize_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prize_id uuid REFERENCES public.gamification_prizes(id) ON DELETE CASCADE NOT NULL,
  coins_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  redemption_code text,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Referral tracking
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  total_referrals integer DEFAULT 0,
  total_earnings_coins integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referral_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  xp_awarded integer DEFAULT 0,
  coins_awarded integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prize_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

-- Levels: public read
CREATE POLICY "Anyone can view levels" ON public.gamification_levels FOR SELECT USING (true);
CREATE POLICY "Admins manage levels" ON public.gamification_levels FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User gamification: own data
CREATE POLICY "Users view own gamification" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own gamification" ON public.user_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gamification" ON public.user_gamification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public leaderboard view" ON public.user_gamification FOR SELECT USING (true);

-- Missions: public read active
CREATE POLICY "Anyone can view active missions" ON public.gamification_missions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage missions" ON public.gamification_missions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User missions: own data
CREATE POLICY "Users view own missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own missions" ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own missions" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: own data
CREATE POLICY "Users view own transactions" ON public.gamification_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.gamification_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prizes: public read
CREATE POLICY "Anyone can view active prizes" ON public.gamification_prizes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage prizes" ON public.gamification_prizes FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Prize redemptions: own data
CREATE POLICY "Users view own redemptions" ON public.user_prize_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own redemptions" ON public.user_prize_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral codes: own + public read
CREATE POLICY "Users view own referral code" ON public.referral_codes FOR SELECT USING (true);
CREATE POLICY "Users insert own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral uses: own data
CREATE POLICY "Users view own referral uses" ON public.referral_uses FOR SELECT USING (auth.uid() = referred_user_id);
CREATE POLICY "Users insert referral use" ON public.referral_uses FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- ============================================
-- SEED DATA: Levels
-- ============================================
INSERT INTO public.gamification_levels (level_number, name, title, xp_required, icon, color, marketplace_discount, perks) VALUES
(1, 'Curioso', 'Viajero Curioso', 0, '🌱', '#22c55e', 0, ARRAY['Acceso básico al portal']),
(2, 'Explorador', 'Explorador Novato', 100, '🧭', '#3b82f6', 3, ARRAY['3% descuento en marketplace', 'Badge de perfil']),
(3, 'Aventurero', 'Aventurero Activo', 300, '🏄', '#8b5cf6', 5, ARRAY['5% descuento', 'Misiones exclusivas']),
(4, 'Descubridor', 'Descubridor de RD', 600, '🗺️', '#f59e0b', 8, ARRAY['8% descuento', 'Acceso a sorteos VIP']),
(5, 'Viajero Élite', 'Viajero Élite', 1000, '⭐', '#ef4444', 10, ARRAY['10% descuento', 'Premios exclusivos', 'Badge dorado']),
(6, 'Embajador', 'Embajador Dominicano', 2000, '👑', '#d946ef', 15, ARRAY['15% descuento', 'Experiencias gratis', 'Perfil destacado', 'Contenido premium']);

-- ============================================
-- SEED DATA: Missions
-- ============================================
INSERT INTO public.gamification_missions (name, description, short_description, mission_type, category, icon, xp_reward, coin_reward, target_count, target_action, is_featured) VALUES
('Primera Reseña', 'Escribe tu primera reseña sobre un destino, hotel o restaurante', 'Deja una reseña', 'one_time', 'social', '✍️', 25, 10, 1, 'write_review', true),
('Explorador de Playas', 'Visita y marca como favorita 5 playas diferentes', 'Favorea 5 playas', 'one_time', 'exploration', '🏖️', 50, 25, 5, 'favorite_beach', true),
('Foodie Dominicano', 'Agrega 3 restaurantes a favoritos', 'Favorea 3 restaurantes', 'one_time', 'gastronomy', '🍽️', 30, 15, 3, 'favorite_restaurant', false),
('Viajero Social', 'Comparte 3 destinos en redes sociales', 'Comparte 3 destinos', 'weekly', 'social', '📱', 20, 10, 3, 'share_destination', false),
('Planificador Pro', 'Crea tu primer itinerario de viaje', 'Crea un itinerario', 'one_time', 'planning', '📋', 40, 20, 1, 'create_itinerary', true),
('Comprador Estrella', 'Realiza tu primera compra en el marketplace', 'Compra en marketplace', 'one_time', 'commerce', '🛍️', 50, 30, 1, 'marketplace_purchase', true),
('Referidor Activo', 'Invita a 3 amigos usando tu código de referido', 'Refiere 3 amigos', 'one_time', 'referral', '🤝', 100, 50, 3, 'referral_signup', true),
('Check-in Semanal', 'Haz check-in en un destino esta semana', 'Check-in semanal', 'weekly', 'exploration', '📍', 15, 5, 1, 'checkin', false),
('Racha de 7 Días', 'Visita el portal 7 días seguidos', 'Racha de 7 días', 'one_time', 'engagement', '🔥', 75, 35, 7, 'daily_login', true),
('Conocedor Cultural', 'Lee 5 artículos sobre cultura dominicana', 'Lee 5 artículos', 'one_time', 'culture', '📚', 35, 15, 5, 'read_article', false);

-- ============================================
-- SEED DATA: Prizes
-- ============================================
INSERT INTO public.gamification_prizes (name, description, short_description, prize_type, coin_cost, min_level, quantity_available, is_featured, sponsor) VALUES
('Daypass Resort', 'Disfruta un día completo en un resort all-inclusive de Punta Cana', 'Día en resort all-inclusive', 'experience', 500, 4, 10, true, 'Resorts RD'),
('Cena para 2', 'Cena romántica en restaurante gourmet de Santo Domingo', 'Cena romántica gourmet', 'experience', 300, 3, 20, true, 'Gastro RD'),
('Tour de Ballenas', 'Excursión de avistamiento de ballenas en Samaná', 'Tour ballenas Samaná', 'experience', 400, 3, 15, true, 'Whale Samaná'),
('Kit Café Premium', 'Set de café orgánico de Jarabacoa + taza artesanal', 'Kit café artesanal', 'product', 150, 2, 50, false, 'Café RD'),
('Fin de Semana Montaña', 'Escapada de fin de semana a cabaña en Constanza', 'Fin de semana Constanza', 'experience', 800, 5, 5, true, 'Montaña Verde'),
('Artesanía Larimar', 'Collar artesanal de Larimar dominicano', 'Collar de Larimar', 'product', 200, 2, 30, false, 'Larimar Shop'),
('Clase de Merengue', 'Clase privada de merengue con instructor profesional', 'Clase privada merengue', 'experience', 100, 1, 40, false, 'Ritmos RD'),
('Tour Zona Colonial', 'Tour guiado privado por la Zona Colonial de Santo Domingo', 'Tour privado colonial', 'experience', 250, 3, 25, true, 'Colonial Tours');
