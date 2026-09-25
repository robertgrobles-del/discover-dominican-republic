import pg from "pg";
import { migrate } from "../src/db/migrator.js";

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd_test";

/** Antes de las pruebas: esquema limpio en la base de pruebas y un conjunto mínimo de datos deterministas. */
export default async function setup() {
  process.env.TEST_DATABASE_URL = TEST_DATABASE_URL;
  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });
  try {
    await migrate(pool, { reset: true });
    await pool.query(`
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
    `);
  } finally {
    await pool.end();
  }
}
