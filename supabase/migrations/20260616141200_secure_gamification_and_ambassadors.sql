-- Migration: Mitigate RLS and BOLA vulnerabilities in Gamification and Ambassadors

-- ============================================
-- 1. Drop Insecure RLS Policies
-- ============================================

-- Drop insecure policies on public.ambassadors
DROP POLICY IF EXISTS "Allow users to manage their own ambassador profile" ON public.ambassadors;

-- Re-create secure read-only policy for users on public.ambassadors
CREATE POLICY "Allow users to select own ambassador profile" ON public.ambassadors
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Drop insecure public insert policy on public.ambassador_referrals
DROP POLICY IF EXISTS "Allow insert referrals" ON public.ambassador_referrals;

-- Drop insecure update/insert policies on gamification tables
DROP POLICY IF EXISTS "Users update own gamification" ON public.user_gamification;
DROP POLICY IF EXISTS "Users insert own transactions" ON public.gamification_transactions;
DROP POLICY IF EXISTS "Users insert own progress" ON public.user_missions;
DROP POLICY IF EXISTS "Users update own progress" ON public.user_missions;
DROP POLICY IF EXISTS "Users insert own stamps" ON public.user_achievements; -- Check just in case
DROP POLICY IF EXISTS "Users insert own completions" ON public.user_checkpoint_completions;
DROP POLICY IF EXISTS "Users insert own collectibles" ON public.user_collectibles;
DROP POLICY IF EXISTS "Users update own collectibles" ON public.user_collectibles;

-- Ensure read-only SELECT policies are present for own data
CREATE POLICY "Users select own achievements" ON public.user_achievements
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 2. Define Secure Database Functions (RPCs)
-- ============================================

-- A. Award XP Function
CREATE OR REPLACE FUNCTION public.award_user_xp(
    xp_to_award INTEGER,
    coins_to_award INTEGER,
    xp_description TEXT,
    source_type TEXT DEFAULT NULL,
    source_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    new_xp INTEGER;
    new_coins INTEGER;
    next_lvl INTEGER;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Ensure profile exists
    INSERT INTO public.user_gamification (user_id, total_xp, coins, current_level)
    VALUES (current_user_id, 0, 0, 1)
    ON CONFLICT (user_id) DO NOTHING;

    -- Calculate new XP and coins
    SELECT total_xp + xp_to_award, coins + coins_to_award, current_level
    INTO new_xp, new_coins, next_lvl
    FROM public.user_gamification
    WHERE user_id = current_user_id;

    -- Calculate level threshold based on gamification_levels
    SELECT COALESCE(MAX(level_number), next_lvl)
    INTO next_lvl
    FROM public.gamification_levels
    WHERE new_xp >= xp_required;

    -- If source type is mission, increment completed missions counter
    IF source_type = 'mission' THEN
        UPDATE public.user_gamification
        SET total_missions_completed = COALESCE(total_missions_completed, 0) + 1
        WHERE user_id = current_user_id;
    END IF;

    -- Update user gamification profile
    UPDATE public.user_gamification
    SET total_xp = new_xp,
        coins = new_coins,
        current_level = next_lvl,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = current_user_id;

    -- Log transaction
    INSERT INTO public.gamification_transactions (
        user_id, transaction_type, xp_amount, coin_amount, description, source_type, source_id
    )
    VALUES (
        current_user_id, 'earn', xp_to_award, coins_to_award, xp_description, source_type, source_id
    );
END;
$$;


-- B. Redeem Prize Function
CREATE OR REPLACE FUNCTION public.redeem_user_prize(
    target_prize_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    prize_cost INTEGER;
    prize_min_level INTEGER;
    user_coins INTEGER;
    user_level INTEGER;
    redemption_code TEXT;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get prize details
    SELECT coin_cost, min_level
    INTO prize_cost, prize_min_level
    FROM public.gamification_prizes
    WHERE id = target_prize_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prize not found or inactive';
    END IF;

    -- Get user details
    SELECT coins, current_level
    INTO user_coins, user_level
    FROM public.user_gamification
    WHERE user_id = current_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User gamification profile not found';
    END IF;

    -- Validate coins and level
    IF user_coins < prize_cost THEN
        RAISE EXCEPTION 'Insufficient coins';
    END IF;

    IF user_level < prize_min_level THEN
        RAISE EXCEPTION 'Level too low for this prize';
    END IF;

    -- Deduct coins
    UPDATE public.user_gamification
    SET coins = coins - prize_cost,
        updated_at = NOW()
    WHERE user_id = current_user_id;

    -- Generate redemption code
    redemption_code := 'PRZ-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 10));

    -- Insert redemption record
    INSERT INTO public.user_prize_redemptions (
        user_id, prize_id, coins_spent, redemption_code, status, created_at
    )
    VALUES (
        current_user_id, target_prize_id, prize_cost, redemption_code, 'pending', NOW()
    );

    -- Log transaction
    INSERT INTO public.gamification_transactions (
        user_id, transaction_type, coin_amount, description, source_type, source_id
    )
    VALUES (
        current_user_id, 'spend', -prize_cost, 'Canje de premio', 'prize_redemption', target_prize_id::TEXT
    );

    RETURN redemption_code;
END;
$$;


-- C. Track Ambassador Sale Function
CREATE OR REPLACE FUNCTION public.track_ambassador_sale(
    ref_code TEXT,
    purchase_amount NUMERIC,
    buyer_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_ambassador_id UUID;
    comm_earned NUMERIC;
BEGIN
    -- Anyone authenticated (the buyer processing checkout) can trigger a referral sale track
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get ambassador details by referral code
    SELECT id INTO target_ambassador_id
    FROM public.ambassadors
    WHERE referral_code = ref_code;

    IF NOT FOUND THEN
        -- If referral code is not found, exit gracefully
        RETURN;
    END IF;

    comm_earned := ROUND((purchase_amount * 0.08)::NUMERIC, 2);

    -- Insert referral record
    INSERT INTO public.ambassador_referrals (
        ambassador_id, referred_email, sale_amount, commission_earned, status, created_at
    )
    VALUES (
        target_ambassador_id, buyer_email, purchase_amount, comm_earned, 'approved', NOW()
    );

    -- Update ambassador stats
    UPDATE public.ambassadors
    SET sales_count = COALESCE(sales_count, 0) + 1,
        total_earned = COALESCE(total_earned, 0.00) + comm_earned,
        pending_payout = COALESCE(pending_payout, 0.00) + comm_earned
    WHERE id = target_ambassador_id;
END;
$$;


-- D. Perform Daily Check-in Function
CREATE OR REPLACE FUNCTION public.perform_daily_checkin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    today DATE;
    last_act DATE;
    cur_streak INTEGER;
    new_streak INTEGER;
    xp_bonus INTEGER;
    coin_bonus INTEGER;
    gamification_rec RECORD;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    today := CURRENT_DATE;

    -- Ensure profile exists
    INSERT INTO public.user_gamification (user_id, total_xp, coins, current_level, streak_days)
    VALUES (current_user_id, 0, 0, 1, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Get current gamification profile
    SELECT last_activity_date, streak_days, total_xp, coins, current_level
    INTO gamification_rec
    FROM public.user_gamification
    WHERE user_id = current_user_id;

    -- If already checked in today, return status false
    IF gamification_rec.last_activity_date = today THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ya has realizado check-in hoy.');
    END IF;

    -- Calculate streak
    IF gamification_rec.last_activity_date = today - 1 THEN
        new_streak := COALESCE(gamification_rec.streak_days, 0) + 1;
    ELSE
        new_streak := 1;
    END IF;

    -- Calculate bonuses
    xp_bonus := 10 + (new_streak * 2);
    coin_bonus := 5 + new_streak;

    -- Award XP, coins and update streak
    PERFORM public.award_user_xp(xp_bonus, coin_bonus, 'Check-in diario (racha: ' || new_streak || ' días)', 'daily_checkin');

    -- Update streak specifically
    UPDATE public.user_gamification
    SET streak_days = new_streak,
        last_activity_date = today,
        updated_at = NOW()
    WHERE user_id = current_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'xp_awarded', xp_bonus,
        'coins_awarded', coin_bonus,
        'streak_days', new_streak
    );
END;
$$;


-- E. Unlock User Achievement Function
CREATE OR REPLACE FUNCTION public.unlock_user_achievement(
    target_achievement_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    ach_rec RECORD;
    unlocked_already BOOLEAN;
    xp_bonus INTEGER;
    coin_bonus INTEGER;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if already unlocked
    SELECT EXISTS (
        SELECT 1 FROM public.user_achievements
        WHERE user_id = current_user_id AND achievement_id = target_achievement_id
    ) INTO unlocked_already;

    IF unlocked_already THEN
        RETURN jsonb_build_object('unlocked', false, 'message', 'Logro ya desbloqueado');
    END IF;

    -- Get achievement info
    SELECT name, xp_reward, coin_reward
    INTO ach_rec
    FROM public.achievements
    WHERE id = target_achievement_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Achievement not found or inactive';
    END IF;

    xp_bonus := COALESCE(ach_rec.xp_reward, 0);
    coin_bonus := COALESCE(ach_rec.coin_reward, 0);

    -- Insert user_achievements record
    INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked_at)
    VALUES (current_user_id, target_achievement_id, 100, NOW());

    -- Award XP/Coins
    IF xp_bonus > 0 OR coin_bonus > 0 THEN
        PERFORM public.award_user_xp(xp_bonus, coin_bonus, 'Logro desbloqueado: ' || ach_rec.name, 'achievement', target_achievement_id::TEXT);
    END IF;

    -- Update total unlocked count
    UPDATE public.achievements
    SET total_unlocked = COALESCE(total_unlocked, 0) + 1
    WHERE id = target_achievement_id;

    RETURN jsonb_build_object(
        'unlocked', true,
        'name', ach_rec.name,
        'xp_reward', xp_bonus,
        'coin_reward', coin_bonus
    );
END;
$$;
