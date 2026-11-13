-- ==============================================================================
-- Esquema para la Base de Datos de Indicadores (Loterías, Tasas de Cambio, Combustibles)
-- Turso / LibSQL (SQLite compatible)
--
-- Conexión en Vercel (Variables de Entorno oficiales):
--   TURSO_DB_LOTERY_URL     = libsql://descubre-indicators-[tu-org].turso.io
--   TURSO_AUTH_LOTERY_TOKEN = [token-secreto-creado-en-turso]
--
-- Si TURSO_DB_LOTERY_URL no está definido, el backend hace fallback
-- automático a TURSO_DATABASE_URL / TURSO_AUTH_TOKEN principal.
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Instituciones / Empresas de Lotería
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

-- 2. Sorteos por Lotería (n sorteos por empresa)
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

-- 3. Resultados Históricos de Sorteos (n números ganadores por sorteo y fecha)
CREATE TABLE IF NOT EXISTS lottery_results (
  id TEXT PRIMARY KEY,
  draw_id TEXT NOT NULL REFERENCES lottery_draws(id) ON DELETE CASCADE,
  draw_date TEXT NOT NULL,                      -- Formato ISO YYYY-MM-DD
  winning_numbers TEXT NOT NULL,                -- JSON Array de enteros o strings: ej. [42, 18, 77]
  bonus_number INTEGER,                         -- Bolo especial o multiplicador (ej. Super Palé, Loto Más)
  jackpot_amount TEXT,                          -- Acumulado anunciado (ej. "RD$ 420 Millones")
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (draw_id, draw_date)
);

-- 4. Tasas de Cambio Oficiales e Interbancarias
CREATE TABLE IF NOT EXISTS exchange_rates (
  id TEXT PRIMARY KEY,
  rate_date TEXT NOT NULL,                      -- Formato YYYY-MM-DD
  currency_code TEXT NOT NULL,                  -- USD, EUR, CAD, GBP, CHF
  buy_rate REAL NOT NULL,                       -- Tasa compra en DOP
  sell_rate REAL NOT NULL,                      -- Tasa venta en DOP
  bank_name TEXT NOT NULL DEFAULT 'Banco Central de la República Dominicana',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (rate_date, currency_code, bank_name)
);

-- 5. Precios Semanales de Combustibles (MICM)
CREATE TABLE IF NOT EXISTS fuel_prices (
  id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL UNIQUE,          -- Fecha de vigencia semanal (YYYY-MM-DD)
  gasolina_premium REAL NOT NULL,               -- Precios en DOP / galón
  gasolina_regular REAL NOT NULL,
  gasoil_optimo REAL NOT NULL,
  gasoil_regular REAL NOT NULL,
  glp REAL NOT NULL,
  gnv REAL NOT NULL,                            -- Por metro cúbico
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Índices de Alto Rendimiento para Consultas e Históricos
CREATE INDEX IF NOT EXISTS idx_lotteries_slug ON lotteries(slug);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_lottery_id ON lottery_draws(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_slug ON lottery_draws(slug);
CREATE INDEX IF NOT EXISTS idx_lottery_draws_lottery_slug ON lottery_draws(lottery_id, slug);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_date ON lottery_results(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_id ON lottery_results(draw_id);
CREATE INDEX IF NOT EXISTS idx_lottery_results_draw_history ON lottery_results(draw_id, draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON fuel_prices(effective_date DESC);
