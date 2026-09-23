-- Migration: Add advanced admin functionalities tables

-- ─── 1. RUTAS Y CIRCUITOS TURÍSTICOS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    duration_hours NUMERIC(4, 2),
    distance_km NUMERIC(6, 2),
    difficulty TEXT CHECK (difficulty IN ('facil', 'moderado', 'dificil')),
    gpx_track_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    place_name TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.audio_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    language TEXT DEFAULT 'es',
    associated_entity_type TEXT NOT NULL,
    associated_entity_id UUID NOT NULL,
    duration_seconds INTEGER
);

-- ─── 2. REPORTE DE CONTENIDO / UGC ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ugc_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente'::text CHECK (status IN ('pendiente', 'revisado', 'ignorado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 3. TICKETING Y RESERVAS AVANZADAS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.event_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    ticket_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'unused'::text CHECK (status IN ('unused', 'scanned', 'cancelled')),
    scanned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 4. RECOMPENSAS E INVENTARIO ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reward_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    coins_cost INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    is_physical BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reward_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reward_id UUID REFERENCES public.reward_inventory(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    courier_name TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 5. ENCUESTAS DE CALIDAD Y NPS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.survey_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 6. AUDITORÍA, REDIRECCIONES Y WEBHOOKS ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.seo_redirections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT UNIQUE NOT NULL,
    target_path TEXT NOT NULL,
    redirect_type INTEGER DEFAULT 301 CHECK (redirect_type IN (301, 302)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.system_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    event_type TEXT NOT NULL,
    secret_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
