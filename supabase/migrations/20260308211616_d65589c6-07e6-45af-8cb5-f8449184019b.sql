
CREATE TABLE public.establecimientos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsector text NOT NULL,
  actividad text,
  rut text,
  numero_identificacion text,
  nombre text NOT NULL,
  sector_zona text,
  provincia text,
  estatus_proceso text,
  estatus_licencia text,
  estatus_establecimiento text,
  fecha_vencimiento date,
  telefono text,
  correo text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.establecimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active establecimientos"
  ON public.establecimientos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage establecimientos"
  ON public.establecimientos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_establecimientos_subsector ON public.establecimientos(subsector);
CREATE INDEX idx_establecimientos_provincia ON public.establecimientos(provincia);
CREATE INDEX idx_establecimientos_estatus ON public.establecimientos(estatus_establecimiento);
