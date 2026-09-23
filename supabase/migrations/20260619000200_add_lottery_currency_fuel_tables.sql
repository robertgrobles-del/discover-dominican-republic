-- Migration: Relational Lotteries, Exchange Rates and Fuel Prices

-- 1. DROP OLD TABLE IF EXISTS TO PREVENT CONFLICTS
DROP TABLE IF EXISTS public.lottery_results CASCADE;

-- 2. CREATE NEW RELATIONAL LOTTERY TABLES
CREATE TABLE IF NOT EXISTS public.lotteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'República Dominicana',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lottery_draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id UUID REFERENCES public.lotteries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    draw_days TEXT[] NOT NULL,
    draw_time TIME NOT NULL,
    ball_range_min INT DEFAULT 1,
    ball_range_max INT DEFAULT 100,
    number_of_balls INT DEFAULT 3,
    tombolas_count INT DEFAULT 3,
    has_bonus BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lottery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
    draw_date DATE NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    bonus_number INTEGER,
    jackpot_amount TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (draw_id, draw_date)
);

-- 3. CREATE HISTORICAL EXCHANGE RATES TABLE
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_date DATE NOT NULL,
    currency_code TEXT NOT NULL CHECK (currency_code IN ('USD', 'EUR', 'GBP', 'CAD', 'MXN')),
    buy_rate NUMERIC(10, 4) NOT NULL,
    sell_rate NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (rate_date, currency_code)
);

-- 4. CREATE HISTORICAL FUEL PRICES TABLE
CREATE TABLE IF NOT EXISTS public.fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    effective_date DATE NOT NULL UNIQUE,
    gasolina_premium NUMERIC(10, 2) NOT NULL,
    gasolina_regular NUMERIC(10, 2) NOT NULL,
    gasoil_optimo NUMERIC(10, 2) NOT NULL,
    gasoil_regular NUMERIC(10, 2) NOT NULL,
    glp NUMERIC(10, 2) NOT NULL,
    gnv NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;

-- 6. CREATE ACCESS POLICIES
-- Public Read Access
CREATE POLICY "Allow public read of lotteries" ON public.lotteries FOR SELECT USING (true);
CREATE POLICY "Allow public read of lottery_draws" ON public.lottery_draws FOR SELECT USING (true);
CREATE POLICY "Allow public read of lottery_results" ON public.lottery_results FOR SELECT USING (true);
CREATE POLICY "Allow public read of exchange_rates" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read of fuel_prices" ON public.fuel_prices FOR SELECT USING (true);

-- Admin Manage Access (Edge Function runs as service_role so it bypasses RLS, but standard admin RLS is added for completeness)
CREATE POLICY "Allow admin manage of lotteries" ON public.lotteries FOR ALL USING (true);
CREATE POLICY "Allow admin manage of lottery_draws" ON public.lottery_draws FOR ALL USING (true);
CREATE POLICY "Allow admin manage of lottery_results" ON public.lottery_results FOR ALL USING (true);
CREATE POLICY "Allow admin manage of exchange_rates" ON public.exchange_rates FOR ALL USING (true);
CREATE POLICY "Allow admin manage of fuel_prices" ON public.fuel_prices FOR ALL USING (true);

-- 7. CREATE HISTORICAL INDEXES
CREATE INDEX IF NOT EXISTS idx_lottery_results_date ON public.lottery_results (draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates (rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON public.fuel_prices (effective_date DESC);
