import pg from "pg";
import { migrate } from "../src/db/migrator.js";

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd_test";

/** Antes de las pruebas: esquema limpio en la base de pruebas y un conjunto mínimo de datos deterministas. */
export default async function setup() {
  process.env.TEST_DATABASE_URL = TEST_DATABASE_URL;
  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });
  try {
    await migrate(pool, { reset: true });
    await pool.query(PROVINCES);
    await pool.query(CONTENT_FIXTURES);
  } finally {
    await pool.end();
  }
}

const PROVINCES = `
  INSERT INTO provinces (id, name, slug, region, description, status, published_at) VALUES
    ('11111111-1111-4111-8111-111111111111', 'Samaná', 'samana', 'Noreste', 'Península de playas y ballenas', 'published', now()),
    ('22222222-2222-4222-8222-222222222222', 'La Altagracia', 'la-altagracia', 'Este', 'Punta Cana y Bávaro', 'published', now()),
    ('33333333-3333-4333-8333-333333333333', 'Santiago', 'santiago', 'Cibao Norte', 'Ciudad corazón', 'published', now()),
    ('44444444-4444-4444-8444-444444444444', 'Borrador', 'borrador', 'Este', 'No debe ser público', 'draft', NULL);
  INSERT INTO provinces (id, name, slug, region, status, published_at, deleted_at) VALUES
    ('55555555-5555-4555-8555-555555555555', 'Eliminada', 'eliminada', 'Este', 'published', now(), now());
  INSERT INTO entity_translations (entity_type, entity_id, language, field_name, translation_text) VALUES
    ('provinces', '11111111-1111-4111-8111-111111111111', 'en', 'name', 'Samana'),
    ('provinces', '11111111-1111-4111-8111-111111111111', 'en', 'description', 'Peninsula of beaches and whales');
`;

// Contenido de prueba para las colecciones públicas (test/content.test.ts). Ids fijos para poder referenciarlos.
const CONTENT_FIXTURES = `
  INSERT INTO destinations (id, name, slug, province_id, short_description, latitude, longitude, status, published_at) VALUES
    ('d1000000-0000-4000-8000-000000000001', 'Punta Cana', 'punta-cana', '22222222-2222-4222-8222-222222222222', 'Playas de arena blanca', 18.5820, -68.4055, 'published', now()),
    ('d1000000-0000-4000-8000-000000000002', 'Samaná', 'samana-destino', '11111111-1111-4111-8111-111111111111', 'Ballenas y cocoteros', 19.2058, -69.3364, 'published', now());

  INSERT INTO beaches (id, name, slug, destination_id, province_id, beach_type, wave_intensity, parking_available, is_featured, rating, review_count, latitude, longitude, short_description, description, is_active, status, published_at) VALUES
    ('b1000000-0000-4000-8000-000000000001', 'Playa Bávaro', 'playa-bavaro', 'd1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'arena-blanca', 'calma', true, true, 4.80, 120, 18.6800, -68.4200, 'Larga playa de arena blanca', 'Descripción larga de Bávaro', true, 'published', now()),
    ('b1000000-0000-4000-8000-000000000002', 'Playa Macao', 'playa-macao', 'd1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'salvaje', 'fuerte', false, false, 4.20, 40, 18.7400, -68.5000, 'Olas para surfistas', 'Descripción de Macao', true, 'published', now()),
    ('b1000000-0000-4000-8000-000000000003', 'Playa Rincón', 'playa-rincon', 'd1000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'arena-blanca', 'moderada', true, true, 4.90, 200, 19.2700, -69.2400, 'Una de las mejores playas', 'Descripción de Rincón', true, 'published', now()),
    ('b1000000-0000-4000-8000-000000000004', 'Playa Oculta', 'playa-oculta', 'd1000000-0000-4000-8000-000000000001', NULL, 'salvaje', NULL, false, false, 3.0, 1, 18.60, -68.30, 'Inactiva', 'No debe verse', false, 'published', now()),
    ('b1000000-0000-4000-8000-000000000005', 'Playa Borrador', 'playa-borrador', 'd1000000-0000-4000-8000-000000000001', NULL, 'salvaje', NULL, false, false, 3.0, 1, 18.60, -68.30, 'Borrador', 'No debe verse', true, 'draft', NULL),
    ('b1000000-0000-4000-8000-000000000006', 'Playa Futura', 'playa-futura', 'd1000000-0000-4000-8000-000000000001', NULL, 'salvaje', NULL, false, false, 3.0, 1, 18.60, -68.30, 'Programada', 'No debe verse aún', true, 'published', now() + interval '2 days');

  INSERT INTO hotels (id, name, slug, destination_id, stars, amenities, price_range, rating, is_featured, latitude, longitude, short_description, status, published_at) VALUES
    ('a1000000-0000-4000-8000-000000000001', 'Hotel Caribe', 'hotel-caribe', 'd1000000-0000-4000-8000-000000000001', 5, '["wifi","pool","spa"]', '$$$$', 4.70, true, 18.6810, -68.4210, 'Resort frente al mar', 'published', now()),
    ('a1000000-0000-4000-8000-000000000002', 'Hostal Sol', 'hostal-sol', 'd1000000-0000-4000-8000-000000000001', 3, '["wifi"]', '$$', 4.00, false, 18.5900, -68.4100, 'Económico y céntrico', 'published', now()),
    ('a1000000-0000-4000-8000-000000000003', 'Hotel Malecón', 'hotel-malecon', 'd1000000-0000-4000-8000-000000000002', 4, '["pool"]', '$$$', 4.40, false, 19.2050, -69.3300, 'Frente al malecón', 'published', now());

  INSERT INTO restaurants (id, name, slug, destination_id, cuisine_type, price_range, rating, latitude, longitude, status, published_at) VALUES
    ('c1000000-0000-4000-8000-000000000001', 'La Terraza', 'la-terraza', 'd1000000-0000-4000-8000-000000000001', '["italiana","mariscos"]', '$$', 4.50, 18.6790, -68.4190, 'published', now()),
    ('c1000000-0000-4000-8000-000000000002', 'El Fogón', 'el-fogon', 'd1000000-0000-4000-8000-000000000001', '["criolla"]', '$', 4.10, 18.5850, -68.4060, 'published', now()),
    ('c1000000-0000-4000-8000-000000000003', 'Mar y Sol', 'mar-y-sol', 'd1000000-0000-4000-8000-000000000002', '["mariscos"]', '$$$', 4.60, 19.2060, -69.3350, 'published', now());

  INSERT INTO events (id, title, slug, destination_id, start_date, category, status, published_at) VALUES
    ('e1000000-0000-4000-8000-000000000001', 'Festival del Merengue', 'festival-del-merengue', 'd1000000-0000-4000-8000-000000000001', '2026-10-01', 'musica', 'published', now()),
    ('e1000000-0000-4000-8000-000000000002', 'Carnaval', 'carnaval', 'd1000000-0000-4000-8000-000000000002', '2027-02-15', 'cultural', 'published', now()),
    ('e1000000-0000-4000-8000-000000000003', 'Feria pasada', 'feria-pasada', 'd1000000-0000-4000-8000-000000000001', '2026-01-05', 'cultural', 'published', now());

  INSERT INTO articles (id, title, slug, excerpt, tags, category, is_published, status, published_at) VALUES
    ('f1000000-0000-4000-8000-000000000001', 'Guía de playas', 'guia-de-playas', 'Las mejores playas', ARRAY['playa','guia'], 'guias', true, 'published', now() - interval '1 day'),
    ('f1000000-0000-4000-8000-000000000002', 'Borrador oculto', 'borrador-oculto', 'No visible', ARRAY['playa'], 'guias', false, 'published', now());

  INSERT INTO job_vacancies (id, title, slug, company_name, province, is_remote, deadline, status, published_at) VALUES
    ('91000000-0000-4000-8000-000000000001', 'Recepcionista', 'recepcionista', 'Hotel Caribe', 'La Altagracia', false, CURRENT_DATE + 30, 'published', now()),
    ('91000000-0000-4000-8000-000000000002', 'Vacante vencida', 'vacante-vencida', 'Hotel Caribe', 'La Altagracia', false, CURRENT_DATE - 1, 'published', now()),
    ('91000000-0000-4000-8000-000000000003', 'Guía remoto', 'guia-remoto', 'Descubre RD', 'Santiago', true, NULL, 'published', now());

  INSERT INTO offers (id, title, slug, original_price, price, is_flash, start_time, end_time, discount_code, status, published_at) VALUES
    ('81000000-0000-4000-8000-000000000001', 'Oferta activa', 'oferta-activa', 100, 50, true, now() - interval '1 day', now() + interval '5 days', 'SECRETO50', 'published', now()),
    ('81000000-0000-4000-8000-000000000002', 'Oferta vencida', 'oferta-vencida', 100, 60, false, now() - interval '10 days', now() - interval '1 day', 'X', 'published', now()),
    ('81000000-0000-4000-8000-000000000003', 'Oferta futura', 'oferta-futura', 100, 70, false, now() + interval '3 days', now() + interval '9 days', 'Y', 'published', now());

  INSERT INTO tour_guides (id, name, languages, is_eco_guide, rating, slug, status, published_at) VALUES
    ('71000000-0000-4000-8000-000000000001', 'Luis', '["es","en"]', true, 4.90, 'luis', 'published', now()),
    ('71000000-0000-4000-8000-000000000002', 'Ana', '["es","fr"]', false, 4.30, 'ana', 'published', now());

  INSERT INTO mountains (id, slug, name, altitude_m, mountain_range, province_id, difficulty, guides_required, rating, is_popular, latitude, longitude, status, published_at) VALUES
    ('61000000-0000-4000-8000-000000000001', 'pico-duarte', 'Pico Duarte', 3098, 'cordillera-central', '33333333-3333-4333-8333-333333333333', 'experto', true, 4.90, true, 19.0231, -70.9994, 'published', now()),
    ('61000000-0000-4000-8000-000000000002', 'monte-oculto', 'Monte Oculto', 500, 'otra', NULL, 'facil', false, 3.0, false, 18.9, -70.5, 'draft', NULL);

  INSERT INTO users (id, email, password_hash) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'ana@resenas.test', 'x'),
    ('a0000000-0000-4000-8000-000000000002', 'sin-nombre@resenas.test', 'x'),
    ('a0000000-0000-4000-8000-000000000003', 'tres@resenas.test', 'x'),
    ('a0000000-0000-4000-8000-000000000004', 'cuatro@resenas.test', 'x'),
    ('a0000000-0000-4000-8000-000000000005', 'cinco@resenas.test', 'x');
  INSERT INTO profiles (id, display_name) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Ana Pérez Gómez'),
    ('a0000000-0000-4000-8000-000000000002', NULL);
  INSERT INTO reviews (user_id, entity_type, entity_id, rating, comment, is_approved, created_at) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'beach', 'b1000000-0000-4000-8000-000000000001', 5, 'Espectacular', true, now() - interval '3 days'),
    ('a0000000-0000-4000-8000-000000000002', 'beach', 'b1000000-0000-4000-8000-000000000001', 5, 'Increíble', true, now() - interval '2 days'),
    ('a0000000-0000-4000-8000-000000000003', 'beach', 'b1000000-0000-4000-8000-000000000001', 4, 'Muy buena', true, now() - interval '1 day'),
    ('a0000000-0000-4000-8000-000000000004', 'beach', 'b1000000-0000-4000-8000-000000000001', 3, 'Regular', true, now()),
    ('a0000000-0000-4000-8000-000000000005', 'beach', 'b1000000-0000-4000-8000-000000000001', 1, 'Pendiente de moderación', false, now()),
    ('a0000000-0000-4000-8000-000000000001', 'hotel', 'b1000000-0000-4000-8000-000000000001', 1, 'Otro tipo de entidad', true, now());

  INSERT INTO entity_translations (entity_type, entity_id, language, field_name, translation_text) VALUES
    ('beaches', 'b1000000-0000-4000-8000-000000000001', 'en', 'name', 'Bavaro Beach'),
    ('beaches', 'b1000000-0000-4000-8000-000000000001', 'en', 'short_description', 'Long white sand beach');
`;
