#!/usr/bin/env node
/**
 * Seeder Masivo de Pruebas con Faker.js (Fase 10.54)
 * Genera cuentas, perfiles y opiniones de prueba en volumen.
 * USO: DATABASE_URL=postgres://... npx tsx scripts/seed-mass-faker.ts [--count 100]
 *
 * IMPORTANTE: se niega a correr con NODE_ENV=production.
 * Punto 69 del plan (datos sintéticos etiquetados): todo lo que inserta en las tablas de personas
 * y opiniones (users, reviews) lleva is_synthetic = true y synthetic_batch = SYNTHETIC_BATCH, así
 * que se limpia con `npm run db:purge-synthetic -- --batch seed-mass-faker` sin tocar datos reales.
 */
import { Pool } from "pg";
import { fakerES_MX as faker } from "@faker-js/faker";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

/** Nombre del lote sintético (punto 69): siempre el nombre del script que lo inserta. */
const SYNTHETIC_BATCH = "seed-mass-faker";

if (process.env.NODE_ENV === "production") {
  console.error("❌ seed-mass-faker.ts NO debe ejecutarse en producción.");
  process.exit(1);
}

const countArg = process.argv.indexOf("--count");
const countValue = countArg !== -1 ? process.argv[countArg + 1] : undefined;
const totalRecords = countValue ? parseInt(countValue, 10) : 50;

async function seedMassData() {
  console.log(`🌱 Generando ${totalRecords} registros masivos con Faker.js...`);

  // Las reseñas apuntan a destinos reales (entity_id es uuid): si la base no tiene ninguno, se
  // crean sólo las cuentas.
  const { rows: targets } = await pool.query<{ id: string }>("SELECT id FROM destinations WHERE deleted_at IS NULL LIMIT 50");
  if (targets.length === 0) console.log("   ⚠️  Sin destinos publicados: se omiten las reseñas.");

  let users = 0;
  let reviews = 0;
  for (let i = 0; i < totalRecords; i++) {
    // RETURNING id: si el correo ya existía no se crea perfil ni reseña, y no se toca esa cuenta.
    const created = await pool.query<{ id: string }>(
      `INSERT INTO users (id, email, password_hash, is_synthetic, synthetic_batch)
       VALUES ($1,$2,'faker-no-login',true,$3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [faker.string.uuid(), faker.internet.email().toLowerCase(), SYNTHETIC_BATCH]
    );
    const userId = created.rows[0]?.id;
    if (!userId) continue;
    users++;

    await pool.query(`INSERT INTO profiles (id, display_name) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, faker.person.fullName()]);

    const target = targets[i % targets.length];
    if (!target) continue;
    await pool.query(
      `INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, comment, is_approved, is_synthetic, synthetic_batch)
       VALUES ($1,$2,'destination',$3,$4,$5,true,true,$6)
       ON CONFLICT DO NOTHING`,
      [faker.string.uuid(), userId, target.id, faker.number.int({ min: 3, max: 5 }), faker.lorem.paragraph(), SYNTHETIC_BATCH]
    );
    reviews++;
  }

  console.log(`✅ ¡Seeding masivo completado! ${users} cuentas y ${reviews} reseñas (lote "${SYNTHETIC_BATCH}").`);
  console.log(`🧹 Para borrar lo sintético: npm run db:purge-synthetic -- --batch ${SYNTHETIC_BATCH}`);
  await pool.end();
}

seedMassData().catch((err) => {
  console.error("❌ Error en seeding masivo:", err);
  pool.end();
  process.exit(1);
});
