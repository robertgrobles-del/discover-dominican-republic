-- Gamificación con reglas en el servidor (docs §5.11): reglas de puntos, antifraude por acción, misiones por período, canjes con envío, trivia con corrección en servidor y referidos.

-- ---------- Reglas de puntos (lo que el cliente informa es QUÉ hizo; los puntos los fija esta tabla) ----------
CREATE TABLE IF NOT EXISTS gamification_rules (
  action text PRIMARY KEY CHECK (action ~ '^[a-z][a-z0-9_]{1,40}$'),
  description text,
  xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins integer NOT NULL DEFAULT 0 CHECK (coins >= 0),
  daily_cap integer CHECK (daily_cap IS NULL OR daily_cap > 0),        -- máximo de concesiones por día (hora de RD)
  cooldown_seconds integer NOT NULL DEFAULT 0 CHECK (cooldown_seconds >= 0),
  unique_per_ref boolean NOT NULL DEFAULT false,                        -- una sola vez por (usuario, acción, ref_id)
  client_allowed boolean NOT NULL DEFAULT false,                        -- puede pedirse con POST /gamification/actions
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO gamification_rules (action, description, xp, coins, daily_cap, cooldown_seconds, unique_per_ref, client_allowed) VALUES
  ('review_created',    'Reseña aprobada',                    20, 5, 3,  0,  true,  false),
  ('favorite_added',    'Agregar un favorito',                 2, 0, 10, 0,  true,  false),
  ('social_post',       'Publicar en RD Social',               5, 1, 3,  0,  true,  false),
  ('social_comment',    'Comentar en RD Social',               2, 0, 5,  20, true,  false),
  ('booking_completed', 'Completar una reserva',             100, 20, NULL, 0, true, false),
  ('photo_upload',      'Subir una foto aprobada',            10, 2, 5,  0,  true,  false),
  ('page_visit',        'Visitar una página del portal',       1, 0, 5,  5,  false, true),
  ('share',             'Compartir contenido',                 3, 0, 5,  30, false, true),
  ('spot_visited',      'Marcar un lugar como visitado',      15, 2, 5,  0,  true,  true),
  ('checkin',           'Check-in diario',                    10, 2, 1,  0,  false, false),
  ('early_bird',        'Bono madrugador (antes de las 8:00)', 15, 0, 1, 0,  false, false),
  ('streak_bonus',      'Bono por racha',                      0, 25, NULL, 0, true, false),
  ('mission_completed', 'Misión completada',                   0, 0, NULL, 0, true, false),
  ('achievement_unlocked', 'Logro desbloqueado',               0, 0, NULL, 0, true, false),
  ('trivia_completed',  'Partida de trivia',                   0, 0, 5,  0,  true,  false),
  ('referral_signup',   'Un referido se registró con tu código', 50, 20, 10, 0, true, false),
  ('referral_applied',  'Usaste un código de referido',       25, 10, NULL, 0, true, false),
  ('admin_adjustment',  'Ajuste manual',                       0, 0, NULL, 0, false, false)
ON CONFLICT (action) DO NOTHING;

-- ---------- Estado del jugador ----------
ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS last_checkin_date date;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_gamification_user ON user_gamification (user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON user_gamification (total_xp DESC);
ALTER TABLE gamification_transactions ADD COLUMN IF NOT EXISTS action text;
CREATE INDEX IF NOT EXISTS idx_gtx_user_created ON gamification_transactions (user_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_gtx_user_action ON gamification_transactions (user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gtx_source ON gamification_transactions (user_id, action, source_id) WHERE source_id IS NOT NULL;

-- ---------- Niveles, ligas y temporada iniciales ----------
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamification_levels_number ON gamification_levels (level_number);
INSERT INTO gamification_levels (level_number, title, xp_required, icon, marketplace_discount) VALUES
  (1, 'Turista', 0, '🌱', 0), (2, 'Curioso', 100, '🧭', 0), (3, 'Viajero', 300, '🎒', 2), (4, 'Explorador', 600, '🗺️', 3), (5, 'Aventurero', 1000, '⛰️', 5),
  (6, 'Trotamundos', 1600, '🌴', 6), (7, 'Guía local', 2400, '🏝️', 8), (8, 'Embajador', 3500, '⭐', 10), (9, 'Leyenda', 5000, '🏆', 12), (10, 'Maestro del Caribe', 7500, '👑', 15)
ON CONFLICT (level_number) DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamification_leagues_slug ON gamification_leagues (slug);
INSERT INTO gamification_leagues (name, slug, icon, min_xp_week, max_xp_week, coin_reward, display_order) VALUES
  ('Bronce', 'bronze', '🥉', 0, 99, 0, 1), ('Plata', 'silver', '🥈', 100, 299, 10, 2), ('Oro', 'gold', '🥇', 300, 699, 25, 3), ('Platino', 'platinum', '💠', 700, 1499, 50, 4), ('Diamante', 'diamond', '💎', 1500, NULL, 100, 5)
ON CONFLICT (slug) DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamification_seasons_number ON gamification_seasons (number);
INSERT INTO gamification_seasons (name, number, starts_at, ends_at, is_active, top_rewards)
  SELECT 'Temporada 1', 1, date_trunc('day', now()), date_trunc('day', now()) + interval '90 days', true, '[{"rank":1,"coins":500},{"rank":2,"coins":300},{"rank":3,"coins":200}]'::jsonb
   WHERE NOT EXISTS (SELECT 1 FROM gamification_seasons);
-- Sólo una temporada activa a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamification_one_active_season ON gamification_seasons ((true)) WHERE is_active;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_league_stats ON user_league_stats (user_id, season_id);
CREATE INDEX IF NOT EXISTS idx_user_league_season_xp ON user_league_stats (season_id, xp_this_season DESC);

-- ---------- Hitos de XP ----------
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_xp_milestones ON user_xp_milestones (user_id, milestone_id);
INSERT INTO xp_milestones (xp_threshold, badge_icon, badge_name, coin_reward, description)
  SELECT * FROM (VALUES (500, '🥉', 'Medio millar', 10, 'Llegaste a 500 XP'), (2000, '🥈', 'Dos mil', 30, 'Llegaste a 2 000 XP'), (5000, '🥇', 'Cinco mil', 75, 'Llegaste a 5 000 XP')) v
   WHERE NOT EXISTS (SELECT 1 FROM xp_milestones);

-- ---------- Misiones por período (diarias/semanales se reinician) ----------
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS period_key text NOT NULL DEFAULT 'all';
DELETE FROM user_missions a USING user_missions b WHERE a.user_id = b.user_id AND a.mission_id = b.mission_id AND a.period_key = b.period_key AND (a.updated_at, a.id) < (b.updated_at, b.id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_missions_period ON user_missions (user_id, mission_id, period_key);

-- ---------- Logros ----------
DELETE FROM user_achievements a USING user_achievements b WHERE a.user_id = b.user_id AND a.achievement_id = b.achievement_id AND (a.unlocked_at, a.id) < (b.unlocked_at, b.id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_achievements ON user_achievements (user_id, achievement_id);

-- ---------- Canjes y envíos ----------
ALTER TABLE reward_shipments ADD COLUMN IF NOT EXISTS redemption_id uuid REFERENCES user_prize_redemptions(id) ON DELETE SET NULL;
ALTER TABLE reward_shipments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_reward_shipments_user ON reward_shipments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prize_redemptions_user ON user_prize_redemptions (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_prize_redemption_code ON user_prize_redemptions (redemption_code) WHERE redemption_code IS NOT NULL;

-- ---------- Trivia: la sesión guarda sus preguntas y respuestas; la corrección es del servidor ----------
ALTER TABLE trivia_sessions
  ADD COLUMN IF NOT EXISTS question_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS finished_at timestamptz;
UPDATE trivia_sessions SET finished_at = completed_at WHERE finished_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trivia_sessions_score ON trivia_sessions (finished_at DESC, score DESC) WHERE finished_at IS NOT NULL;

-- ---------- Referidos ----------
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_codes_code ON referral_codes (code);
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_codes_user ON referral_codes (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_uses_referred ON referral_uses (referred_user_id);   -- un usuario aplica un código una sola vez

-- ---------- Banderas antifraude ----------
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_flags ON user_flags (user_id, flag_name);
