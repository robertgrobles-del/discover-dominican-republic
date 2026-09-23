-- Migration: Add Polymorphic Entity Translations Table

CREATE TABLE IF NOT EXISTS public.entity_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    language TEXT NOT NULL,
    field_name TEXT NOT NULL,
    translation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (entity_type, entity_id, language, field_name)
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.entity_translations ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de traducciones para internacionalización
CREATE POLICY "Allow public read of translations"
ON public.entity_translations FOR SELECT
USING (true);

-- Permitir a administradores hacer todas las operaciones
CREATE POLICY "Allow admin manage of translations"
ON public.entity_translations FOR ALL
USING (
  true
);
