-- Migration to add Marketplace payment tables, Geolocation Offers, and Ambassador features.

-- 1. Create Offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_code TEXT,
    discount_percentage NUMERIC,
    original_price NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    latitude NUMERIC,
    longitude NUMERIC,
    radius_meters INTEGER DEFAULT 500,
    is_flash BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to offers
CREATE POLICY "Allow public read access to offers" ON public.offers
    FOR SELECT USING (true);

-- Allow all for authenticated users (for simulation/partner purposes)
CREATE POLICY "Allow authenticated full access to offers" ON public.offers
    FOR ALL USING (auth.role() = 'authenticated');


-- 2. Create Partner Profiles table
CREATE TABLE IF NOT EXISTS public.partner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT, -- hotel, restaurante, tour_operador, transporte, etc.
    description TEXT,
    phone TEXT,
    email TEXT,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on partner profiles
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to partner profiles
CREATE POLICY "Allow public read access to partner_profiles" ON public.partner_profiles
    FOR SELECT USING (true);

-- Allow partners to manage their own profile
CREATE POLICY "Allow partners to update their own profile" ON public.partner_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow partners to insert their own profile" ON public.partner_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);


-- 3. Create Ambassadors table
CREATE TABLE IF NOT EXISTS public.ambassadors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    clicks_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    total_earned NUMERIC DEFAULT 0.00,
    pending_payout NUMERIC DEFAULT 0.00,
    tier TEXT DEFAULT 'Bronce',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ambassadors
ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to ambassadors (for ranking/verification)
CREATE POLICY "Allow public read access to ambassadors" ON public.ambassadors
    FOR SELECT USING (true);

-- Allow users to manage their own ambassador profile
CREATE POLICY "Allow users to manage their own ambassador profile" ON public.ambassadors
    FOR ALL USING (auth.uid() = id);


-- 4. Create Ambassador Referrals table
CREATE TABLE IF NOT EXISTS public.ambassador_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID REFERENCES public.ambassadors(id) ON DELETE CASCADE,
    referred_email TEXT,
    sale_amount NUMERIC,
    commission_earned NUMERIC,
    status TEXT DEFAULT 'pending', -- pending, approved, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ambassador referrals
ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;

-- Allow ambassadors to read their own referrals
CREATE POLICY "Allow ambassadors to view their own referrals" ON public.ambassador_referrals
    FOR SELECT USING (auth.uid() = ambassador_id);

-- Allow anyone to insert referrals (generated upon purchase)
CREATE POLICY "Allow insert referrals" ON public.ambassador_referrals
    FOR INSERT WITH CHECK (true);


-- 5. Insert mock data for offers
INSERT INTO public.offers (title, description, discount_code, discount_percentage, original_price, price, start_time, end_time, latitude, longitude, radius_meters, is_flash, image_url)
VALUES 
('Escape Romántico en Cayo Levantado', 'Disfruta del lujo y la exclusividad en la bahía de Samaná. Todo incluido en Resort 5 estrellas.', 'SAMANAROMANCE', 40, 25000, 15000, now(), now() + interval '2 days', 19.1673, -69.2974, 1000, true, 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600'),
('Excursión Cuevas y Manglares Los Haitises', 'Recorrido en lancha por el parque nacional con guía bilingüe y almuerzo criollo incluido.', 'HAITISES2X1', 50, 4500, 2250, now(), now() + interval '1 day', 19.0423, -69.5752, 1200, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'),
('Ruta Colonial + Cena de Lujo en Jalao', 'Explora los monumentos históricos de Santo Domingo y disfruta de una cena de tres tiempos en Jalao.', 'ZONACOLONIAL', 20, 8000, 6500, now(), now() + interval '3 days', 18.4735, -69.8858, 500, true, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'),
('Glamping de Aventura en Bahía de las Águilas', 'Duerme bajo las estrellas en tiendas tipo safari frente al mar turquesa más virgen del Caribe.', 'ECORDEAL', 15, 12000, 9900, now(), now() + interval '4 days', 17.8465, -71.6508, 1500, false, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600');
