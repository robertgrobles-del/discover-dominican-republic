-- ==============================================================================
-- Migración 0057: Punto 69 del plan — datos sintéticos etiquetados para demos.
-- "Separar cuentas y datasets de demostración del entorno y registros reales."
--
-- `is_synthetic` es la marca que separa los datos de demostración/prueba de los
-- registros reales: true = la fila la creó un seed (faker o curado a mano) y no
-- representa a una persona ni a un negocio de verdad; false (DEFAULT) = registro
-- real. `synthetic_batch` guarda el lote que la creó ('seed-demo', 'seed-bulk',
-- 'seed-mass-faker', …) para poder limpiar sólo ese lote sin tocar el resto.
--
-- Las cinco tablas elegidas son las que representan personas y cuentas
-- (users, bookings, reviews, partner_profiles, creator_profiles), justo donde
-- mezclar demo con real contamina métricas, listados y soporte.
--
-- Limpieza: `npm run db:purge-synthetic [-- --batch <nombre>]` (sólo borra lo
-- etiquetado; nunca toca filas con is_synthetic = false).
--
-- Idempotente: ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS.
-- ==============================================================================

-- 1. Columnas de etiquetado en las cinco tablas.
ALTER TABLE users            ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE users            ADD COLUMN IF NOT EXISTS synthetic_batch text;

ALTER TABLE bookings         ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE bookings         ADD COLUMN IF NOT EXISTS synthetic_batch text;

ALTER TABLE reviews          ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE reviews          ADD COLUMN IF NOT EXISTS synthetic_batch text;

ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS synthetic_batch text;

ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS synthetic_batch text;

-- 2. Índices parciales por lote: sólo indexan las filas sintéticas, así sirven para
--    contar/limpiar por lote sin penalizar las consultas sobre registros reales.
CREATE INDEX IF NOT EXISTS idx_users_synthetic_batch            ON users            (synthetic_batch) WHERE is_synthetic;
CREATE INDEX IF NOT EXISTS idx_bookings_synthetic_batch         ON bookings         (synthetic_batch) WHERE is_synthetic;
CREATE INDEX IF NOT EXISTS idx_reviews_synthetic_batch          ON reviews          (synthetic_batch) WHERE is_synthetic;
CREATE INDEX IF NOT EXISTS idx_partner_profiles_synthetic_batch ON partner_profiles (synthetic_batch) WHERE is_synthetic;
CREATE INDEX IF NOT EXISTS idx_creator_profiles_synthetic_batch ON creator_profiles (synthetic_batch) WHERE is_synthetic;
