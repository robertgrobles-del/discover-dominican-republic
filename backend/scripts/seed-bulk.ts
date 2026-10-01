#!/usr/bin/env node
/**
 * Fase 10.54 del plan maestro: datos realistas en volumen (con @faker-js/faker) para probar paginación,
 * ordenamiento y el cursor keyset (Fase 10.21) con cientos de filas — el seed-demo.ts existente pone un puñado
 * de registros curados a mano, útiles para una demo pero no para ver cómo se comporta un listado con 500 filas.
 *
 * USO: DATABASE_URL=postgres://... npx tsx scripts/seed-bulk.ts [cantidad_por_coleccion=300]
 * IMPORTANTE: No corre en producción. Todo lo que crea lleva el prefijo "bulk-" en el slug o en el
 * correo, así que se puede borrar limpio con: DELETE FROM <tabla> WHERE slug LIKE 'bulk-%';
 *
 * Punto 69 del plan (datos sintéticos etiquetados): además del prefijo, las cuentas y reseñas que
 * este script inserta en las tablas de personas (users) y opiniones (reviews) van marcadas con
 * is_synthetic = true y synthetic_batch = SYNTHETIC_BATCH; se limpian con
 * `npm run db:purge-synthetic -- --batch seed-bulk`.
 */
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const COUNT = Number(process.argv[2] ?? 300);

/** Nombre del lote sintético (punto 69): siempre el nombre del script que lo inserta. */
const SYNTHETIC_BATCH = "seed-bulk";

if (process.env.NODE_ENV === "production") {
  console.error("❌ seed-bulk.ts NO debe ejecutarse en producción.");
  process.exit(1);
}
if (!Number.isInteger(COUNT) || COUNT < 1 || COUNT > 5000) {
  console.error("La cantidad debe ser un entero entre 1 y 5000.");
  process.exit(1);
}

faker.seed(20260101); // determinista: dos corridas seguidas generan los mismos nombres/slugs (más fácil de depurar)

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function seedDestinations(pool: Pool, n: number) {
  console.log(`🗺️  Generando ${n} destinos de prueba...`);
  const { rows: provinces } = await pool.query<{ id: string }>("SELECT id FROM provinces WHERE deleted_at IS NULL LIMIT 50");
  if (provinces.length === 0) { console.log("  (sin provincias en la base; se omite)"); return; }
  for (let i = 0; i < n; i++) {
    const name = `${faker.location.city()} ${faker.word.adjective()}`;
    const slug = `bulk-${slugify(name)}-${i}`;
    await pool.query(
      `INSERT INTO destinations (name, slug, province_id, short_description, latitude, longitude, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,'published', now() - ($7 || ' days')::interval)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, faker.helpers.arrayElement(provinces).id, faker.lorem.sentence(), faker.location.latitude({ min: 17.5, max: 19.9 }), faker.location.longitude({ min: -72, max: -68 }), faker.number.int({ min: 0, max: 720 })],
    );
  }
}

async function seedBeaches(pool: Pool, n: number) {
  console.log(`🏖️  Generando ${n} playas de prueba...`);
  const { rows: destinations } = await pool.query<{ id: string }>("SELECT id FROM destinations WHERE deleted_at IS NULL LIMIT 200");
  if (destinations.length === 0) { console.log("  (sin destinos en la base; se omite)"); return; }
  const beachTypes = ["arena-blanca", "salvaje", "urbana", "coral"];
  for (let i = 0; i < n; i++) {
    const name = `Playa ${faker.word.adjective()} ${faker.location.city()}`;
    const slug = `bulk-${slugify(name)}-${i}`;
    await pool.query(
      `INSERT INTO beaches (name, slug, destination_id, beach_type, rating, review_count, is_featured, latitude, longitude, short_description, description, is_active, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,'published', now() - ($12 || ' days')::interval)
       ON CONFLICT (slug) DO NOTHING`,
      [
        name, slug, faker.helpers.arrayElement(destinations).id, faker.helpers.arrayElement(beachTypes),
        faker.number.float({ min: 3, max: 5, fractionDigits: 1 }), faker.number.int({ min: 0, max: 500 }),
        faker.datatype.boolean({ probability: 0.15 }), faker.location.latitude({ min: 17.5, max: 19.9 }), faker.location.longitude({ min: -72, max: -68 }),
        faker.lorem.sentence(), faker.lorem.paragraphs(2), faker.number.int({ min: 0, max: 720 }),
      ],
    );
  }
}

async function seedHotels(pool: Pool, n: number) {
  console.log(`🏨 Generando ${n} hoteles de prueba...`);
  const { rows: destinations } = await pool.query<{ id: string }>("SELECT id FROM destinations WHERE deleted_at IS NULL LIMIT 200");
  if (destinations.length === 0) { console.log("  (sin destinos en la base; se omite)"); return; }
  for (let i = 0; i < n; i++) {
    const name = `${faker.company.name()} ${faker.helpers.arrayElement(["Resort", "Hotel", "Suites", "Beach Club"])}`;
    const slug = `bulk-${slugify(name)}-${i}`;
    await pool.query(
      `INSERT INTO hotels (name, slug, destination_id, stars, price_range, rating, is_featured, latitude, longitude, short_description, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published', now() - ($11 || ' days')::interval)
       ON CONFLICT (slug) DO NOTHING`,
      [
        name, slug, faker.helpers.arrayElement(destinations).id, faker.number.int({ min: 2, max: 5 }),
        faker.helpers.arrayElement(["$", "$$", "$$$", "$$$$"]), faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        faker.datatype.boolean({ probability: 0.1 }), faker.location.latitude({ min: 17.5, max: 19.9 }), faker.location.longitude({ min: -72, max: -68 }),
        faker.lorem.sentence(), faker.number.int({ min: 0, max: 720 }),
      ],
    );
  }
}

/**
 * Punto 69: cuentas y reseñas sintéticas etiquetadas, además del prefijo "bulk-" del correo.
 * Los ids son deterministas (`b000…i`) para que repetir el seed no deje cuentas huérfanas, y cada
 * fila que se inserta en las tablas de personas y opiniones lleva is_synthetic = true y su lote.
 */
async function seedSyntheticAccounts(pool: Pool, n: number) {
  console.log(`🧪 Generando ${n} cuentas y reseñas sintéticas (is_synthetic = true)...`);
  const { rows: beaches } = await pool.query<{ id: string }>(
    "SELECT id FROM beaches WHERE slug LIKE 'bulk-%' ORDER BY slug LIMIT 200",
  );
  if (beaches.length === 0) console.log("  (sin playas 'bulk-'; se omiten las reseñas sintéticas)");

  let users = 0;
  let reviews = 0;
  for (let i = 0; i < n; i++) {
    const id = `b0000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
    const inserted = await pool.query(
      `INSERT INTO users (id, email, password_hash, is_synthetic, synthetic_batch)
       VALUES ($1,$2,'bulk-no-login',true,$3)
       ON CONFLICT DO NOTHING`,
      [id, `bulk-${i}@demo.local`, SYNTHETIC_BATCH],
    );
    if (inserted.rowCount === 0) continue; // la cuenta ya existía: no se toca nada más
    users++;
    await pool.query(`INSERT INTO profiles (id, display_name) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [id, faker.person.fullName()]);

    const beach = beaches[i % beaches.length];
    if (!beach) continue;
    await pool.query(
      `INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, comment, is_approved, is_synthetic, synthetic_batch)
       VALUES ($1,$2,'beach',$3,$4,$5,true,true,$6)
       ON CONFLICT DO NOTHING`,
      [randomUUID(), id, beach.id, faker.number.int({ min: 3, max: 5 }), faker.lorem.sentence(), SYNTHETIC_BATCH],
    );
    reviews++;
  }
  console.log(`   ✅ ${users} cuentas "bulk-*@demo.local" + ${reviews} reseñas (lote "${SYNTHETIC_BATCH}")`);
}

async function main() {
  console.log(`Sembrando ~${COUNT} filas por colección (determinista, seed fija). Todo lleva slug "bulk-...".`);
  await seedDestinations(pool, COUNT);
  await seedBeaches(pool, COUNT);
  await seedHotels(pool, COUNT);
  await seedSyntheticAccounts(pool, COUNT);
  console.log("✅ Listo. Para borrar todo lo generado:");
  console.log("   DELETE FROM beaches WHERE slug LIKE 'bulk-%'; DELETE FROM hotels WHERE slug LIKE 'bulk-%'; DELETE FROM destinations WHERE slug LIKE 'bulk-%';");
  console.log(`   npm run db:purge-synthetic -- --batch ${SYNTHETIC_BATCH}   # cuentas y reseñas etiquetadas`);
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
