CREATE TABLE IF NOT EXISTS lotteries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'República Dominicana',
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  color_scheme TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lottery_draws (
  id TEXT PRIMARY KEY,
  lottery_id TEXT NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  draw_days TEXT NOT NULL DEFAULT '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]',
  draw_time TEXT NOT NULL,
  ball_range_min INTEGER NOT NULL DEFAULT 0,
  ball_range_max INTEGER NOT NULL DEFAULT 99,
  number_of_balls INTEGER NOT NULL DEFAULT 3,
  tombolas_count INTEGER NOT NULL DEFAULT 1,
  has_bonus INTEGER NOT NULL DEFAULT 0,
  bonus_name TEXT,
  description TEXT,
  schedule_description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lottery_results (
  id TEXT PRIMARY KEY,
  draw_id TEXT NOT NULL REFERENCES lottery_draws(id) ON DELETE CASCADE,
  draw_date TEXT NOT NULL,
  winning_numbers TEXT NOT NULL,
  bonus_number INTEGER,
  jackpot_amount TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (draw_id, draw_date)
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY,
  rate_date TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  buy_rate REAL NOT NULL,
  sell_rate REAL NOT NULL,
  bank_name TEXT NOT NULL DEFAULT 'Banco Central de la República Dominicana',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (rate_date, currency_code, bank_name)
);

CREATE TABLE IF NOT EXISTS fuel_prices (
  id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL UNIQUE,
  gasolina_premium REAL NOT NULL,
  gasolina_regular REAL NOT NULL,
  gasoil_optimo REAL NOT NULL,
  gasoil_regular REAL NOT NULL,
  glp REAL NOT NULL,
  gnv REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_lotteries_slug ON lotteries(slug);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_lottery_id ON lottery_draws(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_slug ON lottery_draws(slug);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_lottery_slug ON lottery_draws(lottery_id, slug);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_date ON lottery_results(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_id ON lottery_results(draw_id);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_history ON lottery_results(draw_id, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON fuel_prices(effective_date DESC);

INSERT OR IGNORE INTO lotteries (id, slug, name, country, logo_url, website_url, description, color_scheme) VALUES
('lot-leidsa', 'leidsa', 'LEIDSA', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://leidsa.com', 'Lotería Electrónica Internacional Dominicana S.A., pionera en loterías electrónicas en RD.', 'from-red-600 to-red-950'),
('lot-nacional', 'nacional', 'Lotería Nacional', 'República Dominicana', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80', 'https://loterianacional.gob.do', 'Institución oficial del Estado Dominicano fundada por el Padre Billini en 1882.', 'from-blue-700 to-blue-950'),
('lot-loteka', 'loteka', 'LOTEKA', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://loteka.com.do', 'Empresa de sorteos dominicana reconocida por su sorteo Mega Chances.', 'from-amber-600 to-yellow-950'),
('lot-real', 'real', 'Lotería Real', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://loteriareal.com.do', 'Originaria de Santiago de los Caballeros, líder en sorteos del Cibao y todo el país.', 'from-emerald-700 to-teal-950'),
('lot-primera', 'primera', 'La Primera', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://laprimera.do', 'Sorteos diarios con dos emisiones: mediodía y noche.', 'from-purple-700 to-purple-950'),
('lot-suerte', 'suerte', 'La Suerte Dominicana', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://lasuertedominicana.com', 'Sorteos diarios con gran arraigo en el territorio dominicano.', 'from-cyan-700 to-slate-900'),
('lot-king', 'king', 'King Lottery', 'República Dominicana', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=120&q=80', 'https://kinglottery.com', 'Sorteos caribeños con emisión al mediodía y noche.', 'from-yellow-600 to-amber-950'),
('lot-newyork', 'newyork', 'Lotería New York', 'Estados Unidos', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=120&q=80', 'https://nylottery.ny.gov', 'Resultados oficiales de la Lotería de Nueva York ampliamente jugados en RD.', 'from-slate-800 to-slate-950'),
('lot-florida', 'florida', 'Lotería Florida', 'Estados Unidos', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80', 'https://flalottery.com', 'Resultados oficiales de la Lotería de Florida en sus sorteos de día y noche.', 'from-orange-700 to-amber-950'),
('lot-anguila', 'anguila', 'Anguila Lottery', 'Caribe', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80', 'https://anguilalottery.com', 'Sorteos diarios de Anguila con emisiones a las 10AM, 1PM, 6PM y 9PM.', 'from-teal-700 to-slate-950');

INSERT OR IGNORE INTO lottery_draws (id, lottery_id, slug, name, draw_days, draw_time, ball_range_min, ball_range_max, number_of_balls, tombolas_count, has_bonus, bonus_name, description, schedule_description) VALUES
('draw-lei-quiniela', 'lot-leidsa', 'quiniela-pale-leidsa', 'Quiniela y Palé LEIDSA', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '20:55', 0, 99, 3, 3, 0, NULL, 'El sorteo de quiniela y palé más jugado de la República Dominicana con 3 bolos del 00 al 99.', 'Lunes a Sábado 8:55 PM / Domingos 3:55 PM'),
('draw-lei-loto', 'lot-leidsa', 'loto-leidsa', 'Loto, Loto Más & Súper Loto', '["miercoles","sabado"]', '20:55', 1, 38, 6, 1, 1, 'Loto Más', 'El loto millonario acumulativo de República Dominicana. 6 bolos principales del 1 al 38 más bolos adicionales.', 'Miércoles y Sábados 8:55 PM'),
('draw-lei-pega3', 'lot-leidsa', 'pega-3-mas', 'Pega 3 Más', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '20:55', 0, 99, 3, 3, 0, NULL, 'Juego de 3 números con múltiples opciones de acierto exacto o desorden.', 'Lunes a Sábado 8:55 PM / Domingos 3:55 PM'),
('draw-lei-superkino', 'lot-leidsa', 'super-kino-tv', 'Súper Kino TV', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '20:55', 1, 80, 10, 1, 0, NULL, 'Sorteo diario de 10 bolos entre 80 números con premio mayor de 25 millones de pesos.', 'Todos los días 8:55 PM'),
('draw-nac-ganamas', 'lot-nacional', 'gana-mas', 'Gana Más', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '14:30', 0, 99, 3, 3, 0, NULL, 'El tradicional sorteo de la tarde de la Lotería Nacional Dominicana.', 'Todos los días 2:30 PM'),
('draw-nac-noche', 'lot-nacional', 'nacional-noche', 'Sorteo Nacional Noche', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '21:00', 0, 99, 3, 3, 0, NULL, 'El sorteo nocturno estelar de la Lotería Nacional, transmitido por CERTV Canal 4.', 'Lunes a Sábado 9:00 PM / Domingos 6:00 PM'),
('draw-nac-juegapega', 'lot-nacional', 'juega-pega', 'Juega+ Pega+', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '14:30', 0, 99, 5, 1, 0, NULL, 'Juego numérico de la Lotería Nacional con 5 números premiados.', 'Todos los días 2:30 PM'),
('draw-lot-megachances', 'lot-loteka', 'mega-chances', 'Mega Chances', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '19:55', 0, 99, 5, 5, 0, NULL, 'Sorteo estelar de Loteka con 5 tómbolas independientes y premio millonario.', 'Todos los días 7:55 PM'),
('draw-lot-quiniela', 'lot-loteka', 'quiniela-loteka', 'Quiniela Loteka', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '19:55', 0, 99, 3, 3, 0, NULL, 'La quiniela diaria tradicional de Loteka con 3 números ganadores.', 'Todos los días 7:55 PM'),
('draw-rea-quiniela', 'lot-real', 'quiniela-real', 'Quiniela Real', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '12:55', 0, 99, 3, 3, 0, NULL, 'El sorteo insignia de mediodía de la Lotería Real desde Santiago de los Caballeros.', 'Todos los días 12:55 PM'),
('draw-rea-loto', 'lot-real', 'loto-real', 'Loto Real', '["martes","viernes"]', '12:55', 1, 38, 6, 1, 0, NULL, 'El loto millonario de la Lotería Real con acumulado millonario.', 'Martes y Viernes 12:55 PM'),
('draw-pri-mediodia', 'lot-primera', 'primera-mediodia', 'La Primera Mediodía', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '12:00', 0, 99, 3, 3, 0, NULL, 'Sorteo diario de apertura del mediodía.', 'Todos los días 12:00 PM'),
('draw-pri-noche', 'lot-primera', 'primera-noche', 'La Primera Noche', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '20:00', 0, 99, 3, 3, 0, NULL, 'Sorteo nocturno diario de La Primera.', 'Todos los días 8:00 PM'),
('draw-sue-mediodia', 'lot-suerte', 'la-suerte-mediodia', 'La Suerte Mediodía', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '12:30', 0, 99, 3, 3, 0, NULL, 'Sorteo tradicional dominicano de las doce y media.', 'Todos los días 12:30 PM'),
('draw-sue-tarde', 'lot-suerte', 'la-suerte-tarde', 'La Suerte Tarde', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '18:00', 0, 99, 3, 3, 0, NULL, 'Emisión vespertina de La Suerte Dominicana.', 'Todos los días 6:00 PM'),
('draw-king-mediodia', 'lot-king', 'king-lottery-mediodia', 'King Lottery Mediodía', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '12:30', 0, 99, 3, 3, 0, NULL, 'Sorteo caribeño King Lottery de mediodía.', 'Todos los días 12:30 PM'),
('draw-king-noche', 'lot-king', 'king-lottery-noche', 'King Lottery Noche', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '19:30', 0, 99, 3, 3, 0, NULL, 'Sorteo caribeño King Lottery de noche.', 'Todos los días 7:30 PM'),
('draw-ny-tarde', 'lot-newyork', 'new-york-tarde', 'New York Tarde', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '15:30', 0, 99, 3, 3, 0, NULL, 'Sorteo oficial de la tarde de Nueva York (Numbers & Win 4).', 'Todos los días 3:30 PM (Hora RD)'),
('draw-ny-noche', 'lot-newyork', 'new-york-noche', 'New York Noche', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '23:30', 0, 99, 3, 3, 0, NULL, 'Sorteo oficial nocturno de Nueva York.', 'Todos los días 11:30 PM (Hora RD)'),
('draw-fl-dia', 'lot-florida', 'florida-dia', 'Florida Día', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '14:30', 0, 99, 3, 3, 0, NULL, 'Sorteo de Pick 3 / Pick 4 de Florida del mediodía.', 'Todos los días 2:30 PM (Hora RD)'),
('draw-fl-noche', 'lot-florida', 'florida-noche', 'Florida Noche', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '22:30', 0, 99, 3, 3, 0, NULL, 'Sorteo nocturno oficial de la Lotería de Florida.', 'Todos los días 10:30 PM (Hora RD)'),
('draw-ang-10am', 'lot-anguila', 'anguila-10am', 'Anguila Mañana (10:00 AM)', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '10:00', 0, 99, 3, 3, 0, NULL, 'Emisión matutina de Anguila Lottery.', 'Todos los días 10:00 AM'),
('draw-ang-1pm', 'lot-anguila', 'anguila-1pm', 'Anguila Mediodía (1:00 PM)', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '13:00', 0, 99, 3, 3, 0, NULL, 'Emisión de mediodía de Anguila Lottery.', 'Todos los días 1:00 PM'),
('draw-ang-6pm', 'lot-anguila', 'anguila-6pm', 'Anguila Tarde (6:00 PM)', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '18:00', 0, 99, 3, 3, 0, NULL, 'Emisión de la tarde de Anguila Lottery.', 'Todos los días 6:00 PM'),
('draw-ang-9pm', 'lot-anguila', 'anguila-9pm', 'Anguila Noche (9:00 PM)', '["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]', '21:00', 0, 99, 3, 3, 0, NULL, 'Emisión de cierre nocturno de Anguila Lottery.', 'Todos los días 9:00 PM');
