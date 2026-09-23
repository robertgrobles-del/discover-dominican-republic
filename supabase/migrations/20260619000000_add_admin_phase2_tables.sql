-- Migration: Add Phase 2 admin functionalities tables

-- ─── 1. MODERACIÓN UGC DE MEDIA Y CONTROL DE SUSPENSIONES ───────────────────

CREATE TABLE IF NOT EXISTS public.ugc_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('photo', 'video')),
    associated_entity_type TEXT NOT NULL,
    associated_entity_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_suspensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 2. ATENCIÓN AL CLIENTE Y SISTEMA DE TICKETS ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 3. AUTOMATIZACIÓN DE MARKETING Y CRM ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    segment_interests TEXT[],
    sent_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 4. CONTABILIDAD DE FIDELIZACIÓN Y RECOMPENSAS ───────────────────────────

CREATE TABLE IF NOT EXISTS public.points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('earn_coins', 'spend_coins', 'earn_xp')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_entity_type TEXT,
    reference_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 5. PEDIDOS, FACTURACIÓN E HISTORIAL DE VENTAS B2B/B2C ───────────────────

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_method TEXT,
    payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('experience', 'tour_package', 'ticket')),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_unit NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    payout_method TEXT,
    payout_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC(5, 2),
    discount_amount NUMERIC(10, 2),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 6. ALERTAS DE CLIMA/SARGAZO Y CONTACTOS DE EMERGENCIA ───────────────────

CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    alert_type TEXT CHECK (alert_type IN ('sargazo', 'clima_adverso', 'oleaje_alto', 'huracan', 'otro')),
    severity TEXT CHECK (severity IN ('informativa', 'moderada', 'grave', 'extrema')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    institution TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 7. TAREAS PROGRAMADAS Y SEGURIDAD DE RED ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.system_cron_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT UNIQUE NOT NULL,
    schedule_cron TEXT NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('idle', 'running', 'success', 'failed')),
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS public.ip_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT UNIQUE NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('blacklist', 'whitelist')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
