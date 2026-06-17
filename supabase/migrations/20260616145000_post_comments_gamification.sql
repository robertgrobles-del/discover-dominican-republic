-- Migration: Post Comments with Gamification Rules
-- Rules:
--   1. User cannot comment more than once on the same post
--   2. User cannot comment on more than 3 DIFFERENT posts per day
--   3. Earn 15 XP + 5 coins per valid comment

-- ============================================
-- 1. Create post_comments table
-- ============================================

CREATE TABLE IF NOT EXISTS public.post_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id     TEXT NOT NULL,                -- String ID of the social post
    content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 3 AND 500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one comment per user per post
CREATE UNIQUE INDEX IF NOT EXISTS uq_post_comments_user_post
    ON public.post_comments (user_id, post_id);

-- Performance index for daily limit check
CREATE INDEX IF NOT EXISTS idx_post_comments_user_date
    ON public.post_comments (user_id, created_at);

-- ============================================
-- 2. Enable RLS on post_comments
-- ============================================

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read all comments
CREATE POLICY "Anyone reads comments" ON public.post_comments
    FOR SELECT USING (true);

-- Only the RPC (SECURITY DEFINER) can insert — no direct client inserts
-- We block direct inserts by NOT creating a client INSERT policy.
-- The RPC below runs as the table owner and bypasses RLS.

-- ============================================
-- 3. Secure RPC: post_comment
-- ============================================

CREATE OR REPLACE FUNCTION public.post_comment(
    p_post_id   TEXT,
    p_content   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id           UUID;
    v_already_commented BOOLEAN;
    v_posts_today       INTEGER;
    v_xp_reward         INTEGER := 15;
    v_coin_reward       INTEGER := 5;
BEGIN
    -- Get authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
    END IF;

    -- Validate content length
    IF char_length(trim(p_content)) < 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'content_too_short');
    END IF;

    -- Rule 1: Check if user already commented on this post
    SELECT EXISTS (
        SELECT 1 FROM public.post_comments
        WHERE user_id = v_user_id AND post_id = p_post_id
    ) INTO v_already_commented;

    IF v_already_commented THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_commented');
    END IF;

    -- Rule 2: Check daily limit (max 3 DIFFERENT posts per day)
    SELECT COUNT(DISTINCT post_id)
    INTO v_posts_today
    FROM public.post_comments
    WHERE user_id = v_user_id
      AND created_at >= (CURRENT_DATE AT TIME ZONE 'America/Santo_Domingo');

    IF v_posts_today >= 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'daily_limit_reached');
    END IF;

    -- Insert the comment
    INSERT INTO public.post_comments (user_id, post_id, content)
    VALUES (v_user_id, p_post_id, trim(p_content));

    -- Award XP and coins via the existing secure function
    PERFORM public.award_user_xp(
        xp_to_award    => v_xp_reward,
        coins_to_award => v_coin_reward,
        xp_description => 'Comentaste en una publicación social',
        source_type    => 'social_comment',
        source_id      => p_post_id
    );

    RETURN jsonb_build_object(
        'success',       true,
        'xp_awarded',    v_xp_reward,
        'coins_awarded', v_coin_reward,
        'posts_today',   v_posts_today + 1
    );

EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_commented');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.post_comment(TEXT, TEXT) TO authenticated;

-- ============================================
-- 4. Helper function: get comment count per user for today
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_comment_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id       UUID;
    v_posts_today   INTEGER;
    v_total         INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('posts_today', 0, 'total_comments', 0);
    END IF;

    SELECT COUNT(DISTINCT post_id)
    INTO v_posts_today
    FROM public.post_comments
    WHERE user_id = v_user_id
      AND created_at >= (CURRENT_DATE AT TIME ZONE 'America/Santo_Domingo');

    SELECT COUNT(*)
    INTO v_total
    FROM public.post_comments
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'posts_today',    v_posts_today,
        'total_comments', v_total,
        'limit_reached',  v_posts_today >= 3,
        'remaining',      GREATEST(0, 3 - v_posts_today)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_comment_stats() TO authenticated;
