
-- Monuments table
CREATE TABLE public.monuments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  monument_type TEXT DEFAULT 'monumento',
  description TEXT,
  short_description TEXT,
  historical_period TEXT,
  year_built TEXT,
  architect TEXT,
  address TEXT,
  province_id UUID REFERENCES public.provinces(id),
  destination_id UUID REFERENCES public.destinations(id),
  latitude NUMERIC,
  longitude NUMERIC,
  image_url TEXT,
  gallery TEXT[],
  opening_hours TEXT,
  entry_fee TEXT,
  phone TEXT,
  website TEXT,
  rating NUMERIC DEFAULT 4.0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Parks table
CREATE TABLE public.parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  park_type TEXT DEFAULT 'parque nacional',
  description TEXT,
  short_description TEXT,
  area_km2 NUMERIC,
  established_year INTEGER,
  ecosystems TEXT[],
  flora_fauna TEXT[],
  activities TEXT[],
  trails TEXT[],
  address TEXT,
  province_id UUID REFERENCES public.provinces(id),
  destination_id UUID REFERENCES public.destinations(id),
  latitude NUMERIC,
  longitude NUMERIC,
  image_url TEXT,
  gallery TEXT[],
  opening_hours TEXT,
  entry_fee TEXT,
  phone TEXT,
  website TEXT,
  rating NUMERIC DEFAULT 4.0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monuments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read monuments" ON public.monuments FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public can read parks" ON public.parks FOR SELECT TO anon, authenticated USING (is_active = true);
