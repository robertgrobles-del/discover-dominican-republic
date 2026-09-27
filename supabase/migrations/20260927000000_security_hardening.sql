-- =====================================================================
-- Security hardening — auditoría 2026-09-26
-- Aplicar JUNTO con los cambios de cliente y Edge Functions del mismo
-- commit (la gamificación deja de escribirse directamente desde el
-- navegador y pasa a las funciones award_points / redeem_prize).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Políticas de admin sin "TO authenticated"
--    has_role() ya no es ejecutable por anon (migración 20260705...),
--    pero estas políticas FOR ALL se evalúan también para visitantes
--    anónimos, y Postgres aborta la consulta con
--    "permission denied for function has_role".
--    Resultado actual: los visitantes sin sesión no pueden leer
--    playas, ríos, cuevas, artículos, Airbnb, spas, paquetes, etc.
-- ---------------------------------------------------------------------
ALTER POLICY "Admins can manage airbnb_listings"        ON public.airbnb_listings        TO authenticated;
ALTER POLICY "Admins can manage article translations"   ON public.article_translations   TO authenticated;
ALTER POLICY "Admins can manage articles"               ON public.articles               TO authenticated;
ALTER POLICY "Admins can manage artisanal_workshops"    ON public.artisanal_workshops    TO authenticated;
ALTER POLICY "Admins can manage beaches"                ON public.beaches                TO authenticated;
ALTER POLICY "Admins can manage caves"                  ON public.caves                  TO authenticated;
ALTER POLICY "Admins can manage coffee_experiences"     ON public.coffee_experiences     TO authenticated;
ALTER POLICY "Admins manage collectibles"               ON public.digital_collectibles   TO authenticated;
ALTER POLICY "Admins manage levels"                     ON public.gamification_levels    TO authenticated;
ALTER POLICY "Admins manage missions"                   ON public.gamification_missions  TO authenticated;
ALTER POLICY "Admins manage prizes"                     ON public.gamification_prizes    TO authenticated;
ALTER POLICY "Admins manage routes"                     ON public.gamified_routes        TO authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lottery_results' AND policyname = 'Admins can manage lottery results') THEN
    EXECUTE 'ALTER POLICY "Admins can manage lottery results" ON public.lottery_results TO authenticated';
  ELSIF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lottery_results' AND policyname = 'Allow admin manage of lottery_results') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow admin manage of lottery_results" ON public.lottery_results';
    EXECUTE 'CREATE POLICY "Admins can manage lottery results" ON public.lottery_results TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;
ALTER POLICY "Admins manage stamps"                     ON public.passport_stamps        TO authenticated;
ALTER POLICY "Admins can manage rivers"                 ON public.rivers                 TO authenticated;
ALTER POLICY "Admins manage checkpoints"                ON public.route_checkpoints      TO authenticated;
ALTER POLICY "Admins can manage spas"                   ON public.spas_wellness          TO authenticated;
ALTER POLICY "Admins can manage tour_packages"          ON public.tour_packages          TO authenticated;

-- ---------------------------------------------------------------------
-- 2) Gamificación: el usuario podía escribir sus propias monedas,
--    XP y nivel (UPDATE libre sobre user_gamification) y crear canjes
--    de premios sin saldo real. Ahora:
--      - monedas/XP/nivel solo cambian vía award_points / redeem_prize
--      - el usuario solo puede tocar racha y fecha de actividad
-- ---------------------------------------------------------------------

-- 2a) Evitar filas iniciales infladas
DROP POLICY IF EXISTS "Users insert own gamification" ON public.user_gamification;
CREATE POLICY "Users insert own gamification"
  ON public.user_gamification FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND total_xp = 0 AND coins = 0 AND current_level = 1
    AND total_missions_completed = 0 AND total_purchases = 0 AND total_referrals = 0
  );

-- 2b) UPDATE solo en columnas no económicas
REVOKE UPDATE ON public.user_gamification FROM anon, authenticated;
GRANT  UPDATE (streak_days, last_activity_date) ON public.user_gamification TO authenticated;

-- 2c) Transacciones y canjes solo desde funciones del servidor
DROP POLICY IF EXISTS "Users insert own capped transactions" ON public.gamification_transactions;
DROP POLICY IF EXISTS "Users insert own redemptions"         ON public.user_prize_redemptions;

-- 2d) Índice para deduplicar recompensas por fuente
CREATE INDEX IF NOT EXISTS gamification_tx_user_source_idx
  ON public.gamification_transactions (user_id, source_type, source_id, created_at);

-- 2e) Otorgar puntos con topes por acción y por día
CREATE OR REPLACE FUNCTION public.award_points(
  _xp integer,
  _coins integer,
  _description text,
  _source_type text,
  _source_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _max_xp_per_call   constant integer := 200;
  _max_coin_per_call constant integer := 100;
  _max_xp_per_day    constant integer := 1500;
  _max_coin_per_day  constant integer := 500;
  _xp_today integer;
  _coin_today integer;
  _row public.user_gamification;
  _new_level integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  _source_type := left(coalesce(_source_type, 'other'), 40);
  _source_id   := left(_source_id, 100);
  _description := left(coalesce(_description, ''), 200);

  -- Recompensas únicas por fuente (misión, logro, etc.)
  IF _source_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.gamification_transactions
    WHERE user_id = _uid AND source_type = _source_type AND source_id = _source_id
      AND transaction_type = 'earn'
  ) THEN
    SELECT * INTO _row FROM public.user_gamification WHERE user_id = _uid;
    RETURN jsonb_build_object('awarded_xp', 0, 'awarded_coins', 0, 'duplicate', true,
                              'total_xp', _row.total_xp, 'coins', _row.coins, 'level', _row.current_level);
  END IF;

  _xp    := greatest(0, least(coalesce(_xp, 0),    _max_xp_per_call));
  _coins := greatest(0, least(coalesce(_coins, 0), _max_coin_per_call));

  SELECT coalesce(sum(xp_amount), 0), coalesce(sum(coin_amount), 0)
    INTO _xp_today, _coin_today
  FROM public.gamification_transactions
  WHERE user_id = _uid AND transaction_type = 'earn'
    AND created_at >= date_trunc('day', now());

  _xp    := greatest(0, least(_xp,    _max_xp_per_day   - _xp_today));
  _coins := greatest(0, least(_coins, _max_coin_per_day - _coin_today));

  INSERT INTO public.user_gamification (user_id) VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _row FROM public.user_gamification WHERE user_id = _uid FOR UPDATE;

  SELECT coalesce(max(level_number), _row.current_level) INTO _new_level
  FROM public.gamification_levels
  WHERE xp_required <= _row.total_xp + _xp;

  UPDATE public.user_gamification
     SET total_xp = total_xp + _xp,
         coins    = coins + _coins,
         current_level = greatest(current_level, _new_level),
         total_missions_completed = total_missions_completed
                                    + CASE WHEN _source_type = 'mission' THEN 1 ELSE 0 END,
         last_activity_date = current_date
   WHERE user_id = _uid
   RETURNING * INTO _row;

  INSERT INTO public.gamification_transactions
    (user_id, transaction_type, xp_amount, coin_amount, description, source_type, source_id)
  VALUES (_uid, 'earn', _xp, _coins, _description, _source_type, _source_id);

  RETURN jsonb_build_object('awarded_xp', _xp, 'awarded_coins', _coins, 'duplicate', false,
                            'total_xp', _row.total_xp, 'coins', _row.coins, 'level', _row.current_level);
END;
$$;

-- 2f) Canje de premios atómico, con saldo, nivel, vigencia y stock verificados en el servidor
CREATE OR REPLACE FUNCTION public.redeem_prize(_prize_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _prize public.gamification_prizes;
  _row public.user_gamification;
  _code text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _prize FROM public.gamification_prizes WHERE id = _prize_id FOR UPDATE;
  IF NOT FOUND OR NOT coalesce(_prize.is_active, false) THEN
    RAISE EXCEPTION 'Premio no disponible';
  END IF;
  IF _prize.valid_until IS NOT NULL AND _prize.valid_until < current_date THEN
    RAISE EXCEPTION 'Premio vencido';
  END IF;
  IF _prize.quantity_available IS NOT NULL
     AND coalesce(_prize.quantity_redeemed, 0) >= _prize.quantity_available THEN
    RAISE EXCEPTION 'Premio agotado';
  END IF;

  SELECT * INTO _row FROM public.user_gamification WHERE user_id = _uid FOR UPDATE;
  IF NOT FOUND OR _row.coins < _prize.coin_cost THEN
    RAISE EXCEPTION 'No tienes suficientes monedas';
  END IF;
  IF _row.current_level < coalesce(_prize.min_level, 1) THEN
    RAISE EXCEPTION 'Necesitas ser nivel % para canjear este premio', _prize.min_level;
  END IF;

  _code := 'PRZ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

  UPDATE public.user_gamification SET coins = coins - _prize.coin_cost WHERE user_id = _uid;
  UPDATE public.gamification_prizes
     SET quantity_redeemed = coalesce(quantity_redeemed, 0) + 1
   WHERE id = _prize_id;

  INSERT INTO public.user_prize_redemptions (user_id, prize_id, coins_spent, redemption_code, status)
  VALUES (_uid, _prize_id, _prize.coin_cost, _code, 'pending');

  INSERT INTO public.gamification_transactions
    (user_id, transaction_type, coin_amount, description, source_type, source_id)
  VALUES (_uid, 'spend', -_prize.coin_cost, left('Canje: ' || _prize.name, 200),
          'prize_redemption', _prize_id::text);

  RETURN jsonb_build_object('code', _code, 'coins', _row.coins - _prize.coin_cost);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_points(integer, integer, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_prize(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.award_points(integer, integer, text, text, text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.redeem_prize(uuid) TO authenticated;

-- Wrappers de compatibilidad para llamadas previas
DROP FUNCTION IF EXISTS public.award_user_xp(integer, integer, text, text, text);
CREATE OR REPLACE FUNCTION public.award_user_xp(
  xp_to_award integer,
  coins_to_award integer,
  xp_description text,
  source_type text,
  source_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.award_points(xp_to_award, coins_to_award, xp_description, source_type, source_id);
$$;

CREATE OR REPLACE FUNCTION public.redeem_user_prize(target_prize_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _res jsonb;
BEGIN
  _res := public.redeem_prize(target_prize_id);
  RETURN _res->>'code';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_user_xp(integer, integer, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_user_prize(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.award_user_xp(integer, integer, text, text, text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.redeem_user_prize(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 3) Referidos: el usuario podía autoasignarse xp_awarded/coins_awarded
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users insert referral use" ON public.referral_uses;
CREATE POLICY "Users insert referral use"
  ON public.referral_uses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_user_id
    AND coalesce(xp_awarded, 0) = 0 AND coalesce(coins_awarded, 0) = 0
    AND NOT EXISTS (  -- no auto-referirse
      SELECT 1 FROM public.referral_codes rc
      WHERE rc.id = referral_code_id AND rc.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 4) Reseñas: el cliente marcaba todas como verified = true y podía
--    fijar helpful_count. Solo admin/moderador pueden cambiar esos campos.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.verified := false;
    NEW.helpful_count := 0;
  ELSE
    NEW.verified := OLD.verified;
    NEW.helpful_count := OLD.helpful_count;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.guard_review_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_review_fields ON public.reviews;
CREATE TRIGGER guard_review_fields
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.guard_review_fields();

-- Mismo problema en contadores de publicaciones sociales
CREATE OR REPLACE FUNCTION public.guard_social_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.likes_count := 0;
    NEW.comments_count := 0;
  ELSE
    NEW.likes_count := OLD.likes_count;
    NEW.comments_count := OLD.comments_count;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.guard_social_counters() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_social_counters ON public.social_posts;
CREATE TRIGGER guard_social_counters
  BEFORE INSERT OR UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.guard_social_counters();

-- ---------------------------------------------------------------------
-- 5) Reservas: el usuario podía cambiar su propia reserva a
--    status = 'confirmed' o modificar total_price.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_reservation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSE
    NEW.user_id     := OLD.user_id;
    NEW.total_price := OLD.total_price;
    NEW.currency    := OLD.currency;
    NEW.item_id     := OLD.item_id;
    NEW.item_type   := OLD.item_type;
    -- el cliente solo puede cancelar
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.guard_reservation_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_reservation_fields ON public.reservations;
CREATE TRIGGER guard_reservation_fields
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.guard_reservation_fields();

-- ---------------------------------------------------------------------
-- 6) Establecimientos: cualquier persona que se registre podía leer
--    numero_identificacion (cédula/RNC) de todo el registro.
--    Se ocultan esa columna y los metadatos internos; la página
--    /establecimientos no los usa.
-- ---------------------------------------------------------------------
REVOKE SELECT ON public.establecimientos FROM anon, authenticated;
GRANT  SELECT (id, subsector, actividad, rut, nombre, sector_zona, provincia,
               estatus_proceso, estatus_licencia, estatus_establecimiento,
               fecha_vencimiento, telefono, correo, is_active)
  ON public.establecimientos TO authenticated;

-- ---------------------------------------------------------------------
-- 7) Bucket csv-imports era público: cualquiera con la URL podía
--    descargar los archivos importados (datos de establecimientos).
-- ---------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'csv-imports';

-- ---------------------------------------------------------------------
-- 8) Perfiles: display_name por defecto era la parte local del correo
--    (juan.perez@... -> "juan.perez") y los perfiles son legibles por
--    anon. Los nuevos usuarios ya no exponen su correo.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      nullif(left(trim(NEW.raw_user_meta_data->>'display_name'), 60), ''),
      'Viajero ' || upper(substr(replace(NEW.id::text, '-', ''), 1, 5))
    )
  );
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Opcional (revisar antes): anonimizar perfiles existentes cuyo nombre
-- es exactamente la parte local del correo.
-- UPDATE public.profiles p
--    SET display_name = 'Viajero ' || upper(substr(replace(p.id::text, '-', ''), 1, 5))
--   FROM auth.users u
--  WHERE u.id = p.id AND p.display_name = split_part(u.email, '@', 1);

-- ---------------------------------------------------------------------
-- 9) Analítica: INSERT abierto sin límites de tamaño (inflado de CTR
--    y de la base de datos). Se limita el tamaño de cada evento.
--    Para frenar fraude de clics hace falta además rate limiting en
--    una Edge Function (ver informe).
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'analytics_events'
               AND column_name = 'metadata') THEN
    EXECUTE 'ALTER TABLE public.analytics_events
             ADD CONSTRAINT analytics_metadata_size
             CHECK (metadata IS NULL OR pg_column_size(metadata) < 4096) NOT VALID';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 10) Cerrar las 12 tablas con políticas admin abiertas con USING (true)
--     (loterías, tasas, combustibles, traducciones, áreas protegidas,
--      aves, aguas termales, proyectos de compensación, peajes, reportes marinos)
-- ---------------------------------------------------------------------
DO $$
DECLARE
  _tbl text;
  _pol text;
  _tables text[] := ARRAY[
    'lotteries', 'lottery_draws', 'lottery_results', 'exchange_rates', 'fuel_prices',
    'entity_translations', 'protected_areas', 'bird_species', 'hot_springs',
    'offset_projects', 'toll_routes', 'marine_reports'
  ];
BEGIN
  FOREACH _tbl IN ARRAY _tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = _tbl) THEN
      FOR _pol IN (
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = _tbl 
          AND policyname ILIKE '%admin%'
      ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', _pol, _tbl);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "Admins manage %I" ON public.%I TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))',
        _tbl, _tbl
      );
    END IF;
  END LOOP;
END $$;

