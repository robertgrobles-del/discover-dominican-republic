
-- 1) SECURITY DEFINER function exposure
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 2) contest_registrations: validate INSERT
DROP POLICY IF EXISTS "Anyone can insert contest registrations" ON public.contest_registrations;
CREATE POLICY "Public can insert valid contest registrations"
  ON public.contest_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(nombre,'')) BETWEEN 2 AND 120 AND
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) BETWEEN 5 AND 200 AND
    (telefono IS NULL OR length(telefono) BETWEEN 6 AND 30) AND
    (pais IS NULL OR length(pais) BETWEEN 2 AND 80)
  );

-- 3) vacation_registrations: validate INSERT + allow submitter delete if authed
DROP POLICY IF EXISTS "Anyone can insert vacation registrations" ON public.vacation_registrations;
CREATE POLICY "Public can insert valid vacation registrations"
  ON public.vacation_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(nombre,'')) BETWEEN 2 AND 120 AND
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) BETWEEN 5 AND 200 AND
    (telefono IS NULL OR length(telefono) BETWEEN 6 AND 30)
  );

-- 4) survey_responses: owner link + policies
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Anyone can insert survey responses" ON public.survey_responses;
CREATE POLICY "Public can insert valid survey response"
  ON public.survey_responses FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid()) AND
    (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );
CREATE POLICY "Users view own survey responses"
  ON public.survey_responses FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id);
CREATE POLICY "Users delete own survey responses"
  ON public.survey_responses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5) notifications: only service_role (bypasses RLS) can insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- 6) establecimientos: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Public can view active establecimientos" ON public.establecimientos;
CREATE POLICY "Authenticated can view active establecimientos"
  ON public.establecimientos FOR SELECT TO authenticated
  USING (is_active = true);

-- 7) referral_codes: only owner can read
DROP POLICY IF EXISTS "Users view own referral code" ON public.referral_codes;
CREATE POLICY "Users view own referral code"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 8) gamification_transactions: cap self-inserted rewards
DROP POLICY IF EXISTS "Users insert own transactions" ON public.gamification_transactions;
CREATE POLICY "Users insert own capped transactions"
  ON public.gamification_transactions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    coalesce(xp_amount, 0) BETWEEN -1000 AND 500 AND
    coalesce(coin_amount, 0) BETWEEN -100000 AND 100
  );

-- 9) user_gamification: add admin ALL policy; keep user UPDATE tightened with WITH CHECK
DROP POLICY IF EXISTS "Users update own gamification" ON public.user_gamification;
CREATE POLICY "Users update own gamification"
  ON public.user_gamification FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage user_gamification"
  ON public.user_gamification FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 10) passport_stamps: cap self-awarded rewards + enforce is_verified=false
DROP POLICY IF EXISTS "Users insert own stamps" ON public.passport_stamps;
CREATE POLICY "Users insert own capped stamps"
  ON public.passport_stamps FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    coalesce(xp_earned, 0) BETWEEN 0 AND 200 AND
    coalesce(coins_earned, 0) BETWEEN 0 AND 50 AND
    coalesce(is_verified, false) = false
  );

-- 11) user_checkpoint_completions: cap self-awarded rewards
DROP POLICY IF EXISTS "Users insert own completions" ON public.user_checkpoint_completions;
CREATE POLICY "Users insert own capped completions"
  ON public.user_checkpoint_completions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    coalesce(xp_earned, 0) BETWEEN 0 AND 200 AND
    coalesce(coins_earned, 0) BETWEEN 0 AND 50
  );

-- 12) user_prize_redemptions: admin management
CREATE POLICY "Admins manage user_prize_redemptions"
  ON public.user_prize_redemptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 13) Storage: lock csv-imports bucket to admins
DROP POLICY IF EXISTS "Admins manage csv-imports" ON storage.objects;
CREATE POLICY "Admins manage csv-imports"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'csv-imports' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'csv-imports' AND public.has_role(auth.uid(), 'admin'::app_role));
