-- Tabla para persistir favoritos de usuarios
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('destino', 'hotel', 'experiencia', 'restaurante', 'evento')),
  item_name TEXT NOT NULL,
  item_image TEXT,
  item_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id, item_type)
);

-- Tabla para opiniones de usuarios
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  traveler_type TEXT NOT NULL CHECK (traveler_type IN ('solo', 'couple', 'family', 'business')),
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para favoritos
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- RLS para opiniones (lectura pública, escritura autenticada)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at en reviews
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();