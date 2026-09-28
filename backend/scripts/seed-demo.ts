#!/usr/bin/env node
/**
 * Sprint 6.4 — Seed de Datos de Demostracion
 * Pobla la base de datos con datos reales de RD para demos y entornos de staging.
 * USO: DATABASE_URL=postgres://... npx tsx scripts/seed-demo.ts
 * IMPORTANTE: Solo se ejecuta si NODE_ENV != "production".
 */
import { Pool } from "pg";
import { createHash, randomUUID } from "node:crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

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
    console.log("\n" + "=".repeat(50));
    console.log("✅ Seed completado exitosamente.");
  } catch (err) {
    console.error("❌ Error durante el seed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
