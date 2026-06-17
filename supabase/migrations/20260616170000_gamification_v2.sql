-- ============================================================
-- Gamification V2: Leagues, Seasons, Photo Challenges, Social
-- 50 mejoras al sistema de gamificación
-- ============================================================

-- ============================================================
-- 1. LEAGUES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gamification_leagues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT NOT NULL DEFAULT '🏅',
  min_xp_week INTEGER NOT NULL DEFAULT 0,
  max_xp_week INTEGER,
  color       TEXT NOT NULL DEFAULT '#6B7280',
  bg_color    TEXT NOT NULL DEFAULT '#F3F4F6',
  coin_reward INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.gamification_leagues (name, slug, icon, min_xp_week, max_xp_week, color, bg_color, coin_reward, display_order)
VALUES
  ('Bronce',   'bronze',   '🥉', 0,    199,  '#CD7F32', '#FEF3C7', 10,  1),
  ('Plata',    'silver',   '🥈', 200,  499,  '#9CA3AF', '#F1F5F9', 25,  2),
  ('Oro',      'gold',     '🥇', 500,  999,  '#F59E0B', '#FFFBEB', 50,  3),
  ('Platino',  'platinum', '💎', 1000, 2499, '#06B6D4', '#ECFEFF', 100, 4),
  ('Diamante', 'diamond',  '👑', 2500, NULL, '#8B5CF6', '#F5F3FF', 200, 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. SEASONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gamification_seasons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  number      INTEGER NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  top_rewards JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Current season
INSERT INTO public.gamification_seasons (name, number, starts_at, ends_at, is_active, top_rewards)
VALUES (
  'Temporada del Verano RD',
  1,
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month' - interval '1 second',
  true,
  '[
    {"rank": 1, "prize": "Tour gratuito a Punta Cana", "icon": "🏖️", "coins": 500},
    {"rank": 2, "prize": "Cena en restaurante premium", "icon": "🍽️", "coins": 300},
    {"rank": 3, "prize": "Entrada a parque nacional", "icon": "🌿", "coins": 200},
    {"rank": "4-10", "prize": "Insignia exclusiva de temporada", "icon": "⭐", "coins": 100}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. USER LEAGUE TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_league_stats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id     UUID NOT NULL REFERENCES public.gamification_seasons(id) ON DELETE CASCADE,
  league_slug   TEXT NOT NULL DEFAULT 'bronze',
  xp_this_week  INTEGER NOT NULL DEFAULT 0,
  xp_this_season INTEGER NOT NULL DEFAULT 0,
  week_rank     INTEGER,
  season_rank   INTEGER,
  last_updated  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_user_league_stats_season ON public.user_league_stats(season_id, xp_this_week DESC);

-- ============================================================
-- 4. PHOTO CHALLENGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.photo_challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  theme       TEXT NOT NULL,
  destination TEXT,
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at     TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  xp_reward   INTEGER NOT NULL DEFAULT 100,
  coin_reward INTEGER NOT NULL DEFAULT 50,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photo_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  caption      TEXT,
  votes        INTEGER NOT NULL DEFAULT 0,
  is_approved  BOOLEAN NOT NULL DEFAULT false,
  is_winner    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

-- Insert initial photo challenge
INSERT INTO public.photo_challenges (title, description, theme, destination, xp_reward, coin_reward)
VALUES (
  'Reto Foto: Atardecer en RD',
  'Captura el atardecer más hermoso de República Dominicana. Las mejores 3 fotos ganan XP extra.',
  'Atardecer',
  'Cualquier destino',
  150,
  75
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. SOCIAL FOLLOWS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.explorer_follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_explorer_follows_follower ON public.explorer_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_explorer_follows_following ON public.explorer_follows(following_id);

-- ============================================================
-- 6. GUILDS (Grupos regionales)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.explorer_guilds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT NOT NULL DEFAULT '🏴',
  region      TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  total_xp    BIGINT NOT NULL DEFAULT 0,
  is_official  BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guild_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id  UUID NOT NULL REFERENCES public.explorer_guilds(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (guild_id, user_id)
);

-- Official regional guilds
INSERT INTO public.explorer_guilds (name, slug, description, icon, region, is_official)
VALUES
  ('Exploradores del Norte',   'norte',   'Los mejores exploradores de la región Norte',   '🔵', 'Norte',  true),
  ('Guardianes del Sur',       'sur',     'Aventureros de la región Sur dominicana',        '🟢', 'Sur',    true),
  ('Descubridores del Este',   'este',    'La región más turística del país',               '🟡', 'Este',   true),
  ('Cibaeños Exploradores',    'cibao',   'El corazón cultural del Cibao',                 '🟣', 'Cibao',  true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. XP MILESTONES (mejora #10)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.xp_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  xp_threshold INTEGER NOT NULL UNIQUE,
  badge_icon   TEXT NOT NULL,
  badge_name   TEXT NOT NULL,
  coin_reward  INTEGER NOT NULL DEFAULT 0,
  description  TEXT
);

INSERT INTO public.xp_milestones (xp_threshold, badge_icon, badge_name, coin_reward, description)
VALUES
  (500,   '⚡', 'Primer Rayo',       25,  'Alcanzaste 500 XP'),
  (1000,  '🌟', 'Estrella Naciente', 50,  'Alcanzaste 1,000 XP'),
  (2500,  '💫', 'Astro RD',          75,  'Alcanzaste 2,500 XP'),
  (5000,  '🌙', 'Luna Exploradora',  100, 'Alcanzaste 5,000 XP'),
  (10000, '☀️', 'Sol de RD',         200, 'Alcanzaste 10,000 XP'),
  (25000, '🌈', 'Arcoíris Caribeño', 500, 'Alcanzaste 25,000 XP'),
  (50000, '👑', 'Leyenda Dominicana',1000,'Alcanzaste 50,000 XP')
ON CONFLICT (xp_threshold) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_xp_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.xp_milestones(id),
  achieved_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);

-- ============================================================
-- 8. SEASONAL BADGES (mejora #12)
-- ============================================================

ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS season        TEXT,
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS available_until DATE,
  ADD COLUMN IF NOT EXISTS is_secret     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rarity        TEXT NOT NULL DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS progress_max  INTEGER DEFAULT 1;

-- New seasonal & thematic badges
INSERT INTO public.achievements (name, description, short_description, icon, xp_reward, coin_reward, category, rarity, is_secret, display_order, is_active)
VALUES
  -- Seasonal
  ('Espíritu de Carnaval',    'Participa activamente durante el Carnaval dominicano', 'Activo en Carnaval', '🎭', 200, 100, 'seasonal', 'epic', false, 100, true),
  ('Semana Santa Explorer',   'Explora durante Semana Santa', 'Activo en Semana Santa', '✝️', 150, 75, 'seasonal', 'rare', false, 101, true),
  ('Navidad Criolla',         'Activo durante la temporada navideña', 'Activo en Navidad', '🎄', 175, 80, 'seasonal', 'rare', false, 102, true),
  -- Thematic
  ('Sello del Merengue',      'Visita 3 lugares con cultura del merengue', 'Fanático del merengue', '🎺', 150, 50, 'culture', 'uncommon', false, 110, true),
  ('Ámbar Dominicano',        'Descubre el origen del ámbar dominicano en Santiago', 'Coleccionista de ámbar', '💎', 175, 75, 'culture', 'rare', false, 111, true),
  ('Ciguapa Explorer',        'Descubre destinos misteriosos del norte', 'Misterio del norte', '🌙', 200, 100, 'adventure', 'epic', true, 112, true),
  ('Vaquero del Sur',         'Visita las haciendas y zonas rurales del sur', 'Alma del sur', '🤠', 150, 60, 'culture', 'uncommon', false, 113, true),
  ('Fotógrafo del Amanecer',  'Sube una foto del amanecer en cualquier destino', 'Madrugador', '🌅', 125, 50, 'photo', 'uncommon', false, 114, true),
  ('Parque del Este',         'Visita el Parque Nacional del Este', 'Naturaleza del Este', '🦎', 200, 100, 'adventure', 'rare', false, 115, true),
  ('Crucerista de Élite',     'Completa 3 actividades de crucero', 'Amante del mar', '⚓', 175, 75, 'tourism_type', 'rare', false, 116, true),
  ('Gastrónomo Nacional',     'Prueba 5 tipos diferentes de gastronomía típica', 'Paladar fino', '🥘', 150, 60, 'tourism_type', 'uncommon', false, 117, true),
  ('Trivia Maestro',          'Completa 10 preguntas de trivia perfectas', 'Experto en RD', '🧠', 200, 100, 'knowledge', 'rare', false, 118, true),
  ('Completista Turístico',   'Gana las 5 insignias turísticas principales', 'Colección completa', '🏆', 500, 250, 'special', 'legendary', false, 119, true),
  ('Racha de Leyenda',        'Mantén una racha de 30 días consecutivos', 'Dedicación total', '🔥', 400, 200, 'streak', 'legendary', true, 120, true),
  ('Embajador Social',        'Consigue 10 seguidores exploradores', 'Influencer de RD', '🌟', 150, 75, 'social', 'rare', false, 121, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. RPC: get_streak_multiplier (mejora #1)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_streak_multiplier(p_streak_days INTEGER)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_streak_days >= 30 THEN 2.0
    WHEN p_streak_days >= 14 THEN 1.75
    WHEN p_streak_days >= 7  THEN 1.5
    WHEN p_streak_days >= 3  THEN 1.25
    ELSE 1.0
  END;
$$;

-- ============================================================
-- 10. RPC: perform_early_bird_bonus (mejora #3)
-- ============================================================

CREATE OR REPLACE FUNCTION public.perform_early_bird_bonus()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour INTEGER := EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Santo_Domingo');
  v_today DATE := (now() AT TIME ZONE 'America/Santo_Domingo')::date;
  v_last TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Only between 5am and 9am
  IF v_hour < 5 OR v_hour >= 9 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_early_bird_hours');
  END IF;

  -- Check not already received today
  SELECT value INTO v_last
  FROM public.user_flags
  WHERE user_id = auth.uid() AND flag_name = 'early_bird_date'
  LIMIT 1;

  IF v_last = v_today::text THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_claimed');
  END IF;

  -- Award bonus
  PERFORM public.award_user_xp(
    xp_to_award => 20,
    coins_to_award => 5,
    xp_description => '🐦 Bono Madrugador (Early Bird)',
    source_type => 'early_bird',
    source_id => NULL
  );

  -- Record flag
  INSERT INTO public.user_flags (user_id, flag_name, value)
  VALUES (auth.uid(), 'early_bird_date', v_today::text)
  ON CONFLICT (user_id, flag_name) DO UPDATE SET value = v_today::text, updated_at = now();

  RETURN jsonb_build_object('success', true, 'xp_awarded', 20);
END;
$$;

GRANT EXECUTE ON FUNCTION public.perform_early_bird_bonus() TO authenticated;

-- ============================================================
-- 11. RPC: award_weekly_streak_bonus (mejora #7)
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_and_award_streak_bonus()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER;
  v_bonus  INTEGER := 0;
  v_already_flag TEXT;
  v_week TEXT := date_trunc('week', now())::date::text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  SELECT streak_days INTO v_streak
  FROM public.user_gamification WHERE user_id = auth.uid();

  -- Weekly bonus at 7, 14, 30 days
  IF v_streak NOT IN (7, 14, 21, 30) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_milestone');
  END IF;

  -- Check not already awarded this milestone
  SELECT value INTO v_already_flag
  FROM public.user_flags
  WHERE user_id = auth.uid() AND flag_name = 'streak_bonus_' || v_streak
  LIMIT 1;

  IF v_already_flag IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_awarded');
  END IF;

  v_bonus := CASE v_streak
    WHEN 7  THEN 100
    WHEN 14 THEN 200
    WHEN 21 THEN 300
    WHEN 30 THEN 500
    ELSE 100
  END;

  PERFORM public.award_user_xp(
    xp_to_award => v_bonus,
    coins_to_award => v_bonus / 5,
    xp_description => '🔥 Bono de racha de ' || v_streak || ' días',
    source_type => 'streak_bonus',
    source_id => NULL
  );

  INSERT INTO public.user_flags (user_id, flag_name, value)
  VALUES (auth.uid(), 'streak_bonus_' || v_streak, now()::text)
  ON CONFLICT (user_id, flag_name) DO UPDATE SET value = now()::text, updated_at = now();

  RETURN jsonb_build_object('success', true, 'xp_awarded', v_bonus, 'streak', v_streak);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_award_streak_bonus() TO authenticated;

-- ============================================================
-- 12. USER FLAGS TABLE (for deduplication)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_flags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_name  TEXT NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, flag_name)
);

-- ============================================================
-- 13. RPC: get_league_leaderboard (mejora #35)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_season_leaderboard(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  rank        BIGINT,
  user_id     UUID,
  display_name TEXT,
  avatar_url  TEXT,
  xp_season   BIGINT,
  league_slug TEXT,
  level_icon  TEXT,
  missions    BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY uls.xp_this_season DESC) AS rank,
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    uls.xp_this_season,
    uls.league_slug,
    COALESCE(gl.icon, '🌱') AS level_icon,
    COALESCE(ug.total_missions_completed, 0) AS missions
  FROM public.user_league_stats uls
  JOIN public.profiles p ON p.id = uls.user_id
  LEFT JOIN public.user_gamification ug ON ug.user_id = uls.user_id
  LEFT JOIN public.gamification_levels gl ON gl.level_number = ug.current_level
  WHERE uls.season_id = (SELECT id FROM public.gamification_seasons WHERE is_active = true LIMIT 1)
  ORDER BY uls.xp_this_season DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_season_leaderboard(INTEGER) TO anon, authenticated;

-- ============================================================
-- 14. RPC: check_xp_milestones
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_xp_milestones()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp INTEGER;
  v_milestone RECORD;
  v_awarded JSONB := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT total_xp INTO v_xp FROM public.user_gamification WHERE user_id = auth.uid();

  FOR v_milestone IN
    SELECT m.* FROM public.xp_milestones m
    WHERE m.xp_threshold <= v_xp
      AND NOT EXISTS (
        SELECT 1 FROM public.user_xp_milestones um
        WHERE um.user_id = auth.uid() AND um.milestone_id = m.id
      )
  LOOP
    INSERT INTO public.user_xp_milestones (user_id, milestone_id) VALUES (auth.uid(), v_milestone.id);
    
    UPDATE public.user_gamification
    SET coins = coins + v_milestone.coin_reward
    WHERE user_id = auth.uid();

    v_awarded := v_awarded || jsonb_build_object(
      'badge_icon', v_milestone.badge_icon,
      'badge_name', v_milestone.badge_name,
      'xp_threshold', v_milestone.xp_threshold,
      'coins', v_milestone.coin_reward
    );
  END LOOP;

  RETURN v_awarded;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_xp_milestones() TO authenticated;

-- ============================================================
-- 15. RPC: vote_photo_submission
-- ============================================================

CREATE TABLE IF NOT EXISTS public.photo_votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.photo_submissions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, user_id)
);

CREATE OR REPLACE FUNCTION public.vote_photo_submission(p_submission_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  INSERT INTO public.photo_votes (submission_id, user_id) VALUES (p_submission_id, auth.uid());
  UPDATE public.photo_submissions SET votes = votes + 1 WHERE id = p_submission_id;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('success', false, 'reason', 'already_voted');
END;
$$;

GRANT EXECUTE ON FUNCTION public.vote_photo_submission(UUID) TO authenticated;

-- Enable RLS
ALTER TABLE public.gamification_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_league_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explorer_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read seasons" ON public.gamification_seasons FOR SELECT USING (true);
CREATE POLICY "Public read leagues" ON public.gamification_leagues FOR SELECT USING (true);
CREATE POLICY "Own league stats" ON public.user_league_stats FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public read league stats" ON public.user_league_stats FOR SELECT USING (true);
CREATE POLICY "Own follows" ON public.explorer_follows FOR ALL USING (follower_id = auth.uid());
CREATE POLICY "Public read follows" ON public.explorer_follows FOR SELECT USING (true);
CREATE POLICY "Guild member own" ON public.guild_members FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public read guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Public read photo challenges" ON public.photo_challenges FOR SELECT USING (true);
CREATE POLICY "Public read photo submissions" ON public.photo_submissions FOR SELECT USING (is_approved = true);
CREATE POLICY "Own photo submission" ON public.photo_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own votes" ON public.photo_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own flags" ON public.user_flags FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Own xp milestones" ON public.user_xp_milestones FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Public read xp milestones" ON public.user_xp_milestones FOR SELECT USING (true);
