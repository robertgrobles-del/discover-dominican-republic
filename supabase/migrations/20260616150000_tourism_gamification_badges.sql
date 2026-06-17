-- Migration: Tourism Gamification - Province Badges + Cultural Rewards
-- Features:
--   1. Province visit badges (all 32 provinces of Dominican Republic)
--   2. Tourism category badges (Beaches, Culture, Food, Adventure, Cruises)
--   3. Province visit tracker table
--   4. Cultural rewards seeded into achievements

-- ============================================
-- 1. Province visits tracker table
-- ============================================

CREATE TABLE IF NOT EXISTS public.province_visits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    province    TEXT NOT NULL,
    visited_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One visit per user per province
CREATE UNIQUE INDEX IF NOT EXISTS uq_province_visits_user_province
    ON public.province_visits (user_id, province);

ALTER TABLE public.province_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own province visits" ON public.province_visits
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 2. RPC: record_province_visit (secure, awards XP)
-- ============================================

CREATE OR REPLACE FUNCTION public.record_province_visit(
    p_province TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id       UUID;
    v_already_visited BOOLEAN;
    v_total_provinces INTEGER;
    v_xp_reward     INTEGER := 25;
    v_coin_reward   INTEGER := 10;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.province_visits
        WHERE user_id = v_user_id AND province = p_province
    ) INTO v_already_visited;

    IF v_already_visited THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_visited');
    END IF;

    INSERT INTO public.province_visits (user_id, province)
    VALUES (v_user_id, p_province);

    PERFORM public.award_user_xp(
        xp_to_award    => v_xp_reward,
        coins_to_award => v_coin_reward,
        xp_description => format('Visitaste la provincia de %s', p_province),
        source_type    => 'province_visit',
        source_id      => p_province
    );

    SELECT COUNT(*) INTO v_total_provinces
    FROM public.province_visits
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'success',          true,
        'xp_awarded',       v_xp_reward,
        'coins_awarded',    v_coin_reward,
        'total_provinces',  v_total_provinces
    );
EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_visited');
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_province_visit(TEXT) TO authenticated;

-- ============================================
-- 3. Seed: 5 Tourism Category Badges + 5 Province Milestone Badges
-- ============================================

INSERT INTO public.achievements (name, short_description, description, icon, rarity, category, xp_reward, coin_reward, display_order, is_active)
VALUES
-- Tourism Category Badges (the 5 requested)
(
    'Amante de Playas',
    'Explora las playas más hermosas de RD',
    'Has visitado y explorado las principales playas de la República Dominicana. Desde Punta Cana hasta Bahía de las Águilas, amas el mar caribeño.',
    '🏖️', 'rare', 'tourism_type', 150, 75, 10, true
),
(
    'Explorador Cultural',
    'Descubre la historia y cultura dominicana',
    'Has recorrido museos, monumentos y sitios históricos. Conoces la riqueza cultural de República Dominicana como pocos.',
    '🏛️', 'rare', 'tourism_type', 150, 75, 11, true
),
(
    'Foodie RD',
    'Catador oficial de la gastronomía dominicana',
    'Has probado y reseñado los platos más auténticos de la isla. El sancocho, el mangú y el mofongo no tienen secretos para ti.',
    '🍽️', 'rare', 'tourism_type', 150, 75, 12, true
),
(
    'Aventurero Nacional',
    'Conquistador de la naturaleza dominicana',
    'Has completado retos de aventura: senderismo, rafting, canyoning. La naturaleza salvaje de RD es tu hogar.',
    '⛰️', 'epic', 'tourism_type', 250, 100, 13, true
),
(
    'Crucerista',
    'Explorador de mares y puertos',
    'Has visitado los puertos y marinas de la isla. Conoces el lado náutico de República Dominicana.',
    '🚢', 'uncommon', 'tourism_type', 100, 50, 14, true
),
-- Province milestone badges
(
    'Visitante de Provincias',
    'Visitaste tu primera provincia',
    'Diste el primer paso en tu exploración provincial de República Dominicana. Hay 32 provincias más por descubrir.',
    '📍', 'common', 'provinces', 50, 20, 20, true
),
(
    'Explorador Regional',
    'Visitaste 5 provincias diferentes',
    'Ya conoces 5 provincias. Estás descubriendo la diversidad geográfica y cultural de República Dominicana.',
    '🗺️', 'uncommon', 'provinces', 100, 40, 21, true
),
(
    'Gran Explorador',
    'Visitaste 15 provincias diferentes',
    'Más de la mitad del país explorado. Eres un conocedor serio de la República Dominicana.',
    '🧭', 'rare', 'provinces', 200, 80, 22, true
),
(
    'Embajador de las Provincias',
    'Visitaste las 32 provincias de RD',
    '¡Completaste el mapa! Has puesto pie en las 32 provincias de la República Dominicana. Eres un verdadero embajador del país.',
    '🌟', 'legendary', 'provinces', 500, 250, 23, true
),
-- Cultural rewards
(
    'Guardián del Patrimonio',
    'Reseñaste 3 sitios patrimonio histórico',
    'Has contribuido a preservar la historia documentando y reseñando sitios del patrimonio histórico dominicano.',
    '🏺', 'rare', 'culture', 175, 70, 30, true
),
(
    'Cronista Dominicano',
    'Publicaste 10 comentarios en el feed social',
    'Tu voz enriquece la comunidad. Has compartido 10 experiencias en el feed social de Descubre RD.',
    '✍️', 'uncommon', 'culture', 120, 50, 31, true
),
(
    'Coleccionista de Sabores',
    'Visitaste 5 tipos de establecimientos gastronómicos',
    'Desde un chinchorrón hasta un restaurante de alta cocina. Tus papilas gustativas conocen toda la gama dominicana.',
    '👨‍🍳', 'rare', 'culture', 150, 60, 32, true
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. Helper: get_province_stats for a user
-- ============================================

CREATE OR REPLACE FUNCTION public.get_province_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_count   INTEGER;
    v_list    TEXT[];
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('total', 0, 'provinces', '[]'::jsonb);
    END IF;

    SELECT COUNT(*), ARRAY_AGG(province)
    INTO v_count, v_list
    FROM public.province_visits
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'total',     COALESCE(v_count, 0),
        'provinces', to_jsonb(COALESCE(v_list, ARRAY[]::TEXT[]))
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_province_stats() TO authenticated;
