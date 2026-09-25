-- Herramientas del viajero (docs §5.5): glosario, frases, requisitos de entrada, distancias de vuelo y ofertas de afiliados.

CREATE TABLE IF NOT EXISTS dictionary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  meaning text NOT NULL,
  example text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_dictionary_term ON dictionary_terms (lower(term));

CREATE TABLE IF NOT EXISTS travel_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'basico',
  es text NOT NULL,
  en text, fr text, de text, pt text, it text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entry_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  country_name text NOT NULL,
  visa_required boolean NOT NULL DEFAULT false,
  max_stay_days integer,
  passport_validity_months integer NOT NULL DEFAULT 6,
  tourist_card_fee_usd numeric(8,2),
  entry_form text,                              -- p. ej. formulario electrónico E-Ticket
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code)
);

CREATE TABLE IF NOT EXISTS flight_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  distance_km integer NOT NULL CHECK (distance_km > 0),
  UNIQUE (origin, destination)
);

CREATE TABLE IF NOT EXISTS affiliate_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('esim', 'insurance', 'prepaid-card')),
  name text NOT NULL,
  provider text NOT NULL,
  description text,
  price_from_usd numeric(8,2),
  url text NOT NULL CHECK (url LIKE 'https://%'),
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_offers_kind ON affiliate_offers (kind, sort_order) WHERE is_active;

-- Datos iniciales editables desde el panel.
INSERT INTO flight_routes (origin, destination, distance_km) VALUES
  ('Miami (MIA)', 'Punta Cana (PUJ)', 1400), ('Miami (MIA)', 'Santo Domingo (SDQ)', 1350), ('New York (JFK)', 'Punta Cana (PUJ)', 2500), ('New York (JFK)', 'Santo Domingo (SDQ)', 2550),
  ('Madrid (MAD)', 'Santo Domingo (SDQ)', 6600), ('Madrid (MAD)', 'Punta Cana (PUJ)', 6550), ('Bogotá (BOG)', 'Santo Domingo (SDQ)', 1650)
ON CONFLICT DO NOTHING;
INSERT INTO dictionary_terms (term, meaning, example, category) VALUES
  ('Guagua', 'Autobús o minibús de transporte público.', 'Vamos en guagua hasta Santiago.', 'transporte'), ('Colmado', 'Tienda de barrio donde se compra de todo.', 'Voy al colmado a buscar hielo.', 'lugares'),
  ('Vaina', 'Cosa, asunto (muy usado en el habla cotidiana).', 'Esa vaina está buenísima.', 'expresiones'), ('Chin', 'Un poco.', 'Dame un chin de azúcar.', 'expresiones'),
  ('Motoconcho', 'Motocicleta que se usa como taxi.', 'Tomé un motoconcho hasta la playa.', 'transporte'), ('Bacano', 'Excelente, genial.', 'Ese hotel es bacano.', 'expresiones'),
  ('Tigueraje', 'Astucia callejera o picardía.', 'Tiene mucho tigueraje.', 'expresiones'), ('Mangú', 'Puré de plátano verde, típico del desayuno dominicano.', 'Desayuné mangú con los tres golpes.', 'comida')
ON CONFLICT DO NOTHING;
INSERT INTO travel_phrases (category, es, en, fr, de, pt, it, sort_order) VALUES
  ('basico', 'Hola, buenos días', 'Hello, good morning', 'Bonjour', 'Guten Morgen', 'Olá, bom dia', 'Buongiorno', 1),
  ('basico', 'Gracias', 'Thank you', 'Merci', 'Danke', 'Obrigado', 'Grazie', 2),
  ('basico', '¿Cuánto cuesta?', 'How much is it?', 'Combien ça coûte ?', 'Wie viel kostet das?', 'Quanto custa?', 'Quanto costa?', 3),
  ('transporte', '¿Dónde está la parada de guagua?', 'Where is the bus stop?', 'Où est l''arrêt de bus ?', 'Wo ist die Bushaltestelle?', 'Onde fica a parada de ônibus?', 'Dov''è la fermata dell''autobus?', 4),
  ('emergencia', 'Necesito ayuda', 'I need help', 'J''ai besoin d''aide', 'Ich brauche Hilfe', 'Preciso de ajuda', 'Ho bisogno di aiuto', 5),
  ('comida', 'La cuenta, por favor', 'The check, please', 'L''addition, s''il vous plaît', 'Die Rechnung, bitte', 'A conta, por favor', 'Il conto, per favore', 6)
ON CONFLICT DO NOTHING;
INSERT INTO entry_requirements (country_code, country_name, visa_required, max_stay_days, passport_validity_months, tourist_card_fee_usd, entry_form, notes) VALUES
  ('US', 'Estados Unidos', false, 30, 6, 10, 'Formulario electrónico E-Ticket', 'Sin visa para turismo. La tarjeta de turista suele estar incluida en el boleto aéreo.'),
  ('CA', 'Canadá', false, 30, 6, 10, 'Formulario electrónico E-Ticket', 'Sin visa para turismo hasta 30 días.'),
  ('ES', 'España', false, 30, 6, 10, 'Formulario electrónico E-Ticket', 'Ciudadanos de la UE no necesitan visa para turismo.'),
  ('CO', 'Colombia', false, 30, 6, 10, 'Formulario electrónico E-Ticket', 'Sin visa para turismo.'),
  ('CN', 'China', true, 30, 6, NULL, 'Visa consular previa', 'Requiere visa emitida por el consulado dominicano antes del viaje.'),
  ('IN', 'India', true, 30, 6, NULL, 'Visa consular previa', 'Requiere visa emitida por el consulado dominicano antes del viaje.')
ON CONFLICT DO NOTHING;
