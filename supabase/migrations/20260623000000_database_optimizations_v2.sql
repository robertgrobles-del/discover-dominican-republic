-- Migration: Advanced Database Optimizations, Indexing, and Atomic Functions (Block 3 Improvements)

-- 1. Composite & High-Frequency Indexing
CREATE INDEX IF NOT EXISTS idx_contest_registrations_phone_created ON public.contest_registrations(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contest_registrations_referral ON public.contest_registrations(referral_code);
CREATE INDEX IF NOT EXISTS idx_ugc_reports_status_created ON public.ugc_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_level_xp ON public.player_profiles(level DESC, xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_status ON public.user_missions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_destinations_category_rating ON public.destinations(category, rating DESC);

-- 2. Soft-delete columns for auditable records
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hotels' AND column_name='deleted_at') THEN
        ALTER TABLE public.hotels ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='deleted_at') THEN
        ALTER TABLE public.restaurants ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='destinations' AND column_name='deleted_at') THEN
        ALTER TABLE public.destinations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- 3. Atomic Sorteo Ticket Redemption & Referral Increment Function
CREATE OR REPLACE FUNCTION public.increment_user_sorteo_tickets(
    p_phone TEXT,
    p_tickets_to_add INT,
    p_task_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
    v_new_total INT;
BEGIN
    -- Check if record exists
    SELECT * INTO v_user FROM public.contest_registrations WHERE phone = p_phone FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuario no encontrado');
    END IF;

    -- Update tickets atomically
    UPDATE public.contest_registrations
    SET tickets = COALESCE(tickets, 0) + p_tickets_to_add,
        updated_at = NOW()
    WHERE phone = p_phone
    RETURNING tickets INTO v_new_total;

    -- Log transaction if needed
    RETURN jsonb_build_object(
        'success', true,
        'new_total_tickets', v_new_total,
        'added', p_tickets_to_add,
        'task', p_task_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
