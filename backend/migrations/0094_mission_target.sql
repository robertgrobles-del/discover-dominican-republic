-- Retos diarios creados desde el panel: a dónde se dirige al viajero para cumplirlo (página del portal o enlace externo).
ALTER TABLE gamification_missions
  ADD COLUMN IF NOT EXISTS target_url text CHECK (target_url IS NULL OR target_url ~ '^(/|https://)'),
  ADD COLUMN IF NOT EXISTS target_label text;

-- La API de administración admite misiones «special»; la restricción original sólo conocía «story».
ALTER TABLE gamification_missions DROP CONSTRAINT IF EXISTS gamification_missions_mission_type_check;
ALTER TABLE gamification_missions ADD CONSTRAINT gamification_missions_mission_type_check
  CHECK (mission_type IN ('daily', 'weekly', 'story', 'special', 'onboarding'));
