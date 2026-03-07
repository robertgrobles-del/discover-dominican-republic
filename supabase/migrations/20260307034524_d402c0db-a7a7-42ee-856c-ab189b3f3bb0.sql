
-- Contest registrations (sorteos)
CREATE TABLE public.contest_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  pais TEXT,
  edad TEXT,
  visitado TEXT,
  intereses TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Survey responses (encuestas)
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id TEXT NOT NULL,
  email TEXT NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vacation registrations (vacaciones)
CREATE TABLE public.vacation_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  pais TEXT,
  acompanantes TEXT,
  tipo_viajero TEXT,
  fecha_llegada DATE,
  fecha_salida DATE,
  aeropuerto TEXT,
  destino TEXT,
  alojamiento TEXT,
  nombre_alojamiento TEXT,
  intereses TEXT[],
  primera_vez TEXT,
  como_supo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: Public insert, no read for anonymous
ALTER TABLE public.contest_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contest registrations"
  ON public.contest_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert survey responses"
  ON public.survey_responses FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert vacation registrations"
  ON public.vacation_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins can read all
CREATE POLICY "Admins can read contest registrations"
  ON public.contest_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read survey responses"
  ON public.survey_responses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read vacation registrations"
  ON public.vacation_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
