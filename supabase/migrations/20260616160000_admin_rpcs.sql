-- Migration: Admin RPCs for User & Operator management
-- Provides secure server-side admin functions

-- ============================================================
-- 1. HELPER: check caller is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- 2. RPC: admin_update_user_role
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_user_id UUID,
  p_new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF p_new_role NOT IN ('user', 'admin', 'partner', 'moderator') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_role');
  END IF;

  UPDATE public.profiles
  SET role = p_new_role, updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'role', p_new_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated;

-- ============================================================
-- 3. RPC: admin_toggle_user_suspended
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

CREATE OR REPLACE FUNCTION public.admin_toggle_user_suspended(
  p_user_id   UUID,
  p_suspended BOOLEAN,
  p_reason    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.profiles
  SET
    is_suspended     = p_suspended,
    suspension_reason = CASE WHEN p_suspended THEN p_reason ELSE NULL END,
    updated_at       = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'suspended', p_suspended);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_user_suspended(UUID, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 4. RPC: admin_award_xp_to_user
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_award_xp_to_user(
  p_user_id     UUID,
  p_xp_amount   INTEGER,
  p_coin_amount INTEGER DEFAULT 0,
  p_reason      TEXT DEFAULT 'Admin adjustment'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_xp    INTEGER;
  v_new_coins INTEGER;
BEGIN
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  UPDATE public.user_gamification
  SET
    total_xp = GREATEST(0, total_xp + p_xp_amount),
    coins    = GREATEST(0, coins + p_coin_amount),
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_xp, coins INTO v_new_xp, v_new_coins;

  -- Log transaction
  INSERT INTO public.gamification_transactions
    (user_id, transaction_type, xp_amount, coin_amount, description, source_type)
  VALUES
    (p_user_id, 'earn', p_xp_amount, p_coin_amount, p_reason, 'admin');

  RETURN jsonb_build_object(
    'success',    true,
    'new_xp',     v_new_xp,
    'new_coins',  v_new_coins
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_award_xp_to_user(UUID, INTEGER, INTEGER, TEXT) TO authenticated;

-- ============================================================
-- 5. Add verification fields to tour_operators & travel_agencies
-- ============================================================

ALTER TABLE public.tour_operators
  ADD COLUMN IF NOT EXISTS is_verified        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes  TEXT;

ALTER TABLE public.travel_agencies
  ADD COLUMN IF NOT EXISTS is_verified        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes  TEXT;

-- ============================================================
-- 6. RPC: admin_toggle_operator_verified
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_toggle_operator_verified(
  p_operator_id UUID,
  p_type        TEXT,   -- 'tour_operator' | 'travel_agency'
  p_verified    BOOLEAN,
  p_notes       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_user() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF p_type = 'tour_operator' THEN
    UPDATE public.tour_operators
    SET
      is_verified          = p_verified,
      verification_status  = CASE WHEN p_verified THEN 'verified' ELSE 'rejected' END,
      verified_at          = CASE WHEN p_verified THEN now() ELSE NULL END,
      verification_notes   = p_notes,
      updated_at           = now()
    WHERE id = p_operator_id;

  ELSIF p_type = 'travel_agency' THEN
    UPDATE public.travel_agencies
    SET
      is_verified          = p_verified,
      verification_status  = CASE WHEN p_verified THEN 'verified' ELSE 'rejected' END,
      verified_at          = CASE WHEN p_verified THEN now() ELSE NULL END,
      verification_notes   = p_notes,
      updated_at           = now()
    WHERE id = p_operator_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'invalid_type');
  END IF;

  RETURN jsonb_build_object('success', true, 'verified', p_verified);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_operator_verified(UUID, TEXT, BOOLEAN, TEXT) TO authenticated;

-- ============================================================
-- 7. Admin view: user_admin_view (read-only, no RLS bypass needed)
-- ============================================================

CREATE OR REPLACE VIEW public.user_admin_view AS
SELECT
  p.id,
  p.display_name,
  p.email,
  p.role,
  p.is_suspended,
  p.suspension_reason,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  COALESCE(g.total_xp, 0)              AS total_xp,
  COALESCE(g.coins, 0)                 AS coins,
  COALESCE(g.current_level, 1)         AS current_level,
  COALESCE(g.streak_days, 0)           AS streak_days,
  COALESCE(g.total_missions_completed, 0) AS total_missions_completed,
  COALESCE(g.total_referrals, 0)       AS total_referrals
FROM public.profiles p
LEFT JOIN public.user_gamification g ON g.user_id = p.id;

-- Only admins can query this view (handled at app level, but document it)
COMMENT ON VIEW public.user_admin_view IS 'Admin-only aggregated user view. Access controlled at application layer.';
