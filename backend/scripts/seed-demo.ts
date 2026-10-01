#!/usr/bin/env node
/**
 * Sprint 6.4 — Seed de Datos de Demostracion
 * Pobla la base de datos con datos reales de RD para demos y entornos de staging.
 * USO: DATABASE_URL=postgres://... npx tsx scripts/seed-demo.ts
 * IMPORTANTE: Solo se ejecuta si NODE_ENV != "production".
 *
 * Punto 69 del plan (datos sintéticos etiquetados): lo que este script crea en las tablas de
 * personas y cuentas (users, partner_profiles, creator_profiles, reviews) queda marcado con
 * is_synthetic = true y synthetic_batch = SYNTHETIC_BATCH, de modo que se puede limpiar con
 * `npm run db:purge-synthetic -- --batch seed-demo` sin tocar ni un registro real.
 */
import { Pool } from "pg";
import { hash as hashPassword } from "@node-rs/argon2";
import { createHash, randomUUID } from "node:crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

/** Nombre del lote sintético (punto 69): siempre el nombre del script que lo inserta. */
const SYNTHETIC_BATCH = "seed-demo";

if (process.env.NODE_ENV === "production") {
  console.error("❌ seed-demo.ts NO debe ejecutarse en produccion.");
  process.exit(1);
}

async function q(sql: string, params: unknown[] = []) {
  return pool.query(sql, params);
}

// ── 1. PLANES DE MEMBRESIA ──────────────────────────────────────────────────
async function seedMembershipPlans() {
  console.log("📋 Sembrando planes de membresia...");
  const plans = [
    {
      id: "plan-explorador",
      slug: "explorador",
      name: "Explorador",
      description: "Acceso gratuito con funciones basicas",
      price_annual: 0,
      currency: "USD",
      points_multiplier: 1.0,
      benefits: JSON.stringify(["Directorio completo", "Favoritos", "Itinerarios basicos"]),
    },
    {
      id: "plan-aventurero",
      slug: "aventurero",
      name: "Aventurero Premium",
      description: "La experiencia completa del viajero digital",
      price_annual: 49,
      currency: "USD",
      points_multiplier: 1.5,
      benefits: JSON.stringify(["Todo de Explorador", "Descuentos 10%", "Soporte prioritario", "Badge Aventurero"]),
    },
    {
      id: "plan-pasaporte-vip",
      slug: "pasaporte-vip",
      name: "Pasaporte VIP RD",
      description: "Acceso VIP a lo mejor de la isla con beneficios exclusivos",
      price_annual: 99,
      currency: "USD",
      points_multiplier: 2.5,
      benefits: JSON.stringify(["Todo de Aventurero", "Multiplicador XP x2.5", "Acceso anticipado a eventos", "Badge VIP dorado", "Descuentos 20%", "Lounge en aeropuertos"]),
    },
  ];
  for (const p of plans) {
    await q(
      `INSERT INTO membership_plans (id, slug, name, description, price_annual, currency, points_multiplier, benefits, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,true)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, price_annual=EXCLUDED.price_annual`,
      [p.id, p.slug, p.name, p.description, p.price_annual, p.currency, p.points_multiplier, p.benefits]
    );
  }
  console.log(`   ✅ ${plans.length} planes de membresia`);
}

// ── 2. SLOTS DE PATROCINIO ───────────────────────────────────────────────────
async function seedSponsorshipSlots() {
  console.log("📢 Sembrando slots de patrocinio (Ad Server)...");
  const slots = [
    { id: "slot-billboard-desktop",  name: "Billboard Desktop",      slot_type: "billboard",       max_active_creatives: 3, recommended_dimensions: "980x120" },
    { id: "slot-leaderboard",        name: "Leaderboard Estandar",   slot_type: "leaderboard",     max_active_creatives: 5, recommended_dimensions: "728x90" },
    { id: "slot-mpu-medium-rect",    name: "Medium Rectangle / MPU", slot_type: "mpu",             max_active_creatives: 5, recommended_dimensions: "300x250" },
    { id: "slot-half-page",          name: "Half-Page",              slot_type: "half_page",       max_active_creatives: 2, recommended_dimensions: "300x600" },
    { id: "slot-mobile-sticky",      name: "Mobile Sticky Footer",   slot_type: "mobile_sticky",   max_active_creatives: 2, recommended_dimensions: "320x50" },
    { id: "slot-skyscraper",         name: "Skyscraper Lateral",     slot_type: "skyscraper",      max_active_creatives: 3, recommended_dimensions: "160x600" },
    { id: "slot-panoramico",         name: "Full-Width Panoramico",  slot_type: "panoramic",       max_active_creatives: 2, recommended_dimensions: "1920x250" },
    { id: "slot-search-top",         name: "Posicion Patrocinada #1", slot_type: "search_position", max_active_creatives: 3, recommended_dimensions: null },
  ];
  for (const s of slots) {
    await q(
      `INSERT INTO sponsorship_slots (id, name, slot_type, max_active_creatives, recommended_dimensions, is_active)
       VALUES ($1,$2,$3,$4,$5,true)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, is_active=true`,
      [s.id, s.name, s.slot_type, s.max_active_creatives, s.recommended_dimensions]
    );
  }
  console.log(`   ✅ ${slots.length} slots de patrocinio`);
}

// ── 3. CAMPAÑA Y CREATIVIDADES DE DEMO ──────────────────────────────────────
async function seedSponsorshipCampaign() {
  console.log("🎯 Sembrando campaña de demo (Playa RD Turismo)...");
  const campId = "camp-demo-playa-rd";
  const starts = new Date();
  const ends = new Date(starts.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias

  await q(
    `INSERT INTO sponsorship_campaigns (id, advertiser_name, advertiser_email, title, billing_type, budget_total, budget_spent, cpm_rate, cpc_rate, starts_at, ends_at, status)
     VALUES ($1,'Ministerio de Turismo RD','digital@mitur.gob.do','Descubre el Caribe en RD','cpm',50000,0,4.50,0,$2,$3,'active')
     ON CONFLICT (id) DO NOTHING`,
    [campId, starts.toISOString(), ends.toISOString()]
  );

  const creatives = [
    { slot_id: "slot-billboard-desktop", title: "Visita Punta Cana", headline: "El paraiso te espera", target_url: "https://descubrerd.do/punta-cana", badge_label: "Patrocinado", category_target: "playa", destination_target: "Punta Cana", weight: 10 },
    { slot_id: "slot-mpu-medium-rect",   title: "Samana, la Perla del Caribe", headline: "Ballenas, cascadas y mas", target_url: "https://descubrerd.do/samana", badge_label: "Patrocinado", category_target: "naturaleza", destination_target: "Samana", weight: 8 },
    { slot_id: "slot-mobile-sticky",     title: "Jarabacoa de Aventura", headline: "Rafting y montanas verdes", target_url: "https://descubrerd.do/jarabacoa", badge_label: "Patrocinado", category_target: "aventura", destination_target: "Jarabacoa", weight: 7 },
  ];

  for (const c of creatives) {
    await q(
      `INSERT INTO sponsorship_creatives (id, campaign_id, slot_id, title, headline, target_url, badge_label, category_target, destination_target, weight, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active')
       ON CONFLICT DO NOTHING`,
      [randomUUID(), campId, c.slot_id, c.title, c.headline, c.target_url, c.badge_label, c.category_target, c.destination_target, c.weight]
    );
  }
  console.log(`   ✅ 1 campana + ${creatives.length} creatividades`);
}

// ── 4. PAQUETES DINAMICOS ────────────────────────────────────────────────────
async function seedDynamicPackages() {
  console.log("📦 Sembrando paquetes turisticos dinamicos...");
  const packages = [
    {
      id: "pkg-punta-cana-3d",
      slug: "punta-cana-3-dias-todo-incluido",
      title: "Punta Cana 3 Dias Todo Incluido",
      description: "3 noches en resort 5 estrellas frente al mar, desayuno, almuerzo y cena incluidos, traslado aeropuerto-hotel-aeropuerto.",
      duration_days: 3,
      base_price: 450,
      currency: "USD",
      discount_percentage: 15,
      is_featured: true,
    },
    {
      id: "pkg-samana-4d",
      slug: "samana-aventura-4-dias",
      title: "Samana Aventura 4 Dias",
      description: "Tour de avistamiento de ballenas (enero-marzo), visita a El Limon, excursion a Cayo Levantado y snorkeling.",
      duration_days: 4,
      base_price: 380,
      currency: "USD",
      discount_percentage: 10,
      is_featured: true,
    },
    {
      id: "pkg-norte-cultura-5d",
      slug: "norte-cultural-5-dias",
      title: "Norte Cultural: Santiago y Zona Citruts",
      description: "Visita al Monumento de Santiago, fabrica de tabacos artesanales, carnaval santiaguero y gastronomia criolla.",
      duration_days: 5,
      base_price: 290,
      currency: "USD",
      discount_percentage: 5,
      is_featured: false,
    },
    {
      id: "pkg-jarabacoa-adventure",
      slug: "jarabacoa-aventura-extrema",
      title: "Jarabacoa Extremo 2 Dias",
      description: "Rafting en el rio Yaque del Norte, tirolesa, cabalgata en montanas y noche en eco-lodge.",
      duration_days: 2,
      base_price: 195,
      currency: "USD",
      discount_percentage: 0,
      is_featured: false,
    },
  ];

  for (const p of packages) {
    await q(
      `INSERT INTO dynamic_packages (id, slug, title, description, duration_days, base_price, currency, discount_percentage, is_featured, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
       ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, base_price=EXCLUDED.base_price`,
      [p.id, p.slug, p.title, p.description, p.duration_days, p.base_price, p.currency, p.discount_percentage, p.is_featured]
    );
  }
  console.log(`   ✅ ${packages.length} paquetes turisticos`);
}

// ── 5. MISIONES PATROCINADAS DE GAMIFICACION ─────────────────────────────────
async function seedSponsoredMissions() {
  console.log("🎮 Sembrando misiones patrocinadas...");
  const missions = [
    {
      id: "mission-reseña-7",
      name: "Critico Gastronomico",
      description: "Deja 7 resenas de restaurantes en 30 dias",
      target_action: "review_created",
      target_count: 7,
      xp_reward: 350,
      coin_reward: 50,
      mission_type: "monthly",
      is_sponsored: true,
      sponsor_name: "Asociacion de Restaurantes RD",
      sponsor_reward_text: "Cupon de 15% en tu proximo restaurante",
      is_featured: true,
    },
    {
      id: "mission-fotos-playa",
      name: "Fotografo de Playas",
      description: "Comparte 5 fotos de playas con la comunidad",
      target_action: "photo_uploaded",
      target_count: 5,
      xp_reward: 200,
      coin_reward: 30,
      mission_type: "monthly",
      is_sponsored: false,
      sponsor_name: null,
      sponsor_reward_text: null,
      is_featured: false,
    },
    {
      id: "mission-checkin-3",
      name: "Explorador Activo",
      description: "Haz check-in 3 dias seguidos",
      target_action: "checkin",
      target_count: 3,
      xp_reward: 75,
      coin_reward: 10,
      mission_type: "weekly",
      is_sponsored: false,
      sponsor_name: null,
      sponsor_reward_text: null,
      is_featured: true,
    },
  ];

  for (const m of missions) {
    await q(
      `INSERT INTO gamification_missions (id, name, description, target_action, target_count, xp_reward, coin_reward, mission_type, is_active, is_featured, is_sponsored, sponsor_name, sponsor_reward_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, is_active=true`,
      [m.id, m.name, m.description, m.target_action, m.target_count, m.xp_reward, m.coin_reward, m.mission_type, m.is_featured, m.is_sponsored, m.sponsor_name, m.sponsor_reward_text]
    );
  }
  console.log(`   ✅ ${missions.length} misiones`);
}

// ── 6. B2B API KEY DE DEMO ───────────────────────────────────────────────────
async function seedB2bApiKey() {
  console.log("🔑 Sembrando API key B2B de demo...");
  const demoKey = "demo-b2b-key-descubrerd-2026";
  const keyHash = createHash("sha256").update(demoKey).digest("hex");
  await q(
    `INSERT INTO b2b_api_keys (id, key_hash, client_name, client_email, scopes, is_active, rate_limit_per_minute)
     VALUES ($1,$2,'Demo Partner','demo@partner.do',ARRAY['analytics:read','establishments:read'],true,60)
     ON CONFLICT (id) DO NOTHING`,
    [randomUUID(), keyHash]
  );
  console.log(`   ✅ B2B key de demo (hash: ${keyHash.slice(0, 12)}...)`);
  console.log(`   ⚠️  API Key DEMO: "${demoKey}" — NO usar en produccion`);
}

// ── 7. CUENTAS E IDENTIDADES DE DEMOSTRACIÓN (punto 69) ──────────────────────
/**
 * Cuentas de demostración con id y correo fijos, marcadas con is_synthetic = true y el lote
 * SYNTHETIC_BATCH. Nunca se mezclan con cuentas reales: la contraseña es pública y sólo sirve
 * para enseñar la plataforma en demos/staging. Se borran con
 * `npm run db:purge-synthetic -- --batch seed-demo`.
 */
const DEMO_TRAVELER_ID = "d0000000-0000-4000-8000-000000000001";
const DEMO_PARTNER_ID = "d0000000-0000-4000-8000-000000000002";
const DEMO_CREATOR_ID = "d0000000-0000-4000-8000-000000000003";

const DEMO_ACCOUNTS = [
  { id: DEMO_TRAVELER_ID, email: "demo.viajero@descubrerd.do", displayName: "Viajero Demo", role: "user" },
  { id: DEMO_PARTNER_ID, email: "demo.operador@descubrerd.do", displayName: "Operador Demo RD", role: "partner" },
  { id: DEMO_CREATOR_ID, email: "demo.creador@descubrerd.do", displayName: "Creador Demo RD", role: "user" },
] as const;

/** Contraseña pública de las cuentas demo. Nunca debe existir una cuenta así en producción. */
const DEMO_PASSWORD = "DemoRD.2026";

async function seedDemoAccounts() {
  console.log("🧪 Sembrando cuentas de demostración etiquetadas (is_synthetic = true)...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const a of DEMO_ACCOUNTS) {
    await q(
      `INSERT INTO users (id, email, password_hash, is_synthetic, synthetic_batch)
       VALUES ($1,$2,$3,true,$4)
       ON CONFLICT DO NOTHING`,
      [a.id, a.email, passwordHash, SYNTHETIC_BATCH]
    );
    await q(
      `INSERT INTO profiles (id, display_name, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [a.id, a.displayName, a.role]
    );
    await q(`INSERT INTO user_roles (user_id, role) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [a.id, a.role]);
  }

  // Organización de demostración. Desde la migración 0013 partner_profiles.id ya no tiene que ser
  // el id de un usuario, pero conservamos el del operador demo para que la cuenta sea reconocible.
  await q(
    `INSERT INTO partner_profiles (id, business_name, business_type, email, description, slug, province, is_synthetic, synthetic_batch)
     VALUES ($1,'Operador Demo RD','operador','demo.operador@descubrerd.do','Organización de demostración: no factura ni vende de verdad.','operador-demo-rd','Santo Domingo',true,$2)
     ON CONFLICT DO NOTHING`,
    [DEMO_PARTNER_ID, SYNTHETIC_BATCH]
  );

  await q(
    `INSERT INTO creator_profiles (id, handle, display_name, bio, is_synthetic, synthetic_batch)
     VALUES ($1,'demo-creador','Creador Demo RD','Perfil de creador de demostración (contenido de ejemplo).',true,$2)
     ON CONFLICT DO NOTHING`,
    [DEMO_CREATOR_ID, SYNTHETIC_BATCH]
  );

  // Reseña de demostración sobre un destino publicado real, para que la demo tenga contenido.
  const { rows } = await q(`SELECT id FROM destinations WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1`);
  const destinationId: string | undefined = rows[0]?.id;
  if (destinationId) {
    await q(
      `INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, comment, is_approved, is_synthetic, synthetic_batch)
       VALUES ($1,$2,'destination',$3,5,'Reseña de demostración (dato sintético, no de un viajero real).',true,true,$4)
       ON CONFLICT DO NOTHING`,
      [randomUUID(), DEMO_TRAVELER_ID, destinationId, SYNTHETIC_BATCH]
    );
  } else {
    console.log("   ⚠️  Sin destinos publicados: se omite la reseña de demostración.");
  }

  console.log(`   ✅ ${DEMO_ACCOUNTS.length} cuentas + 1 organización + 1 creador + 1 reseña (lote "${SYNTHETIC_BATCH}")`);
  console.log(`   ⚠️  Contraseña DEMO: "${DEMO_PASSWORD}" — sólo para demos, jamás en producción.`);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌴 Descubre RD — Seed de Datos de Demostracion");
  console.log("=".repeat(50));
  try {
    await seedMembershipPlans();
    await seedSponsorshipSlots();
    await seedSponsorshipCampaign();
    await seedDynamicPackages();
    await seedSponsoredMissions();
    await seedB2bApiKey();
    await seedDemoAccounts();
    console.log("\n" + "=".repeat(50));
    console.log("✅ Seed completado exitosamente.");
    console.log(`🧹 Para borrar lo sintético: npm run db:purge-synthetic -- --batch ${SYNTHETIC_BATCH}`);
  } catch (err) {
    console.error("❌ Error durante el seed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
