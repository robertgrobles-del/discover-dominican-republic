#!/usr/bin/env node
/**
 * Genera la migración que guarda en la tabla `hotels` las secciones que la ficha de hotel componía en el
 * navegador con `src/data/hotelDetailData.ts` (habitaciones, piscinas, restaurantes, bares, vida nocturna, spa,
 * políticas, preguntas frecuentes, pasadía y política de niños), para que el panel las muestre y las edite.
 *
 * Usa los generadores del propio sitio, así que necesita el servidor de desarrollo y la API levantados:
 *   node scripts/gen-hotel-details-seed.cjs [http://localhost:8080] [http://localhost:3000/api/v1]
 * Sólo rellena lo que esté vacío: no pisa lo que ya se haya editado.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SITE = process.argv[2] ?? "http://localhost:8080";
const API = process.argv[3] ?? "http://localhost:3000/api/v1";
const OUT = path.resolve(__dirname, "../backend/migrations/0092_seed_hotel_details.sql");
const lit = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const jsonb = (v) => `${lit(JSON.stringify(v))}::jsonb`;

(async () => {
  const hotels = (await (await fetch(`${API}/hotels?per_page=100`)).json()).data;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(SITE, { waitUntil: "domcontentloaded" });
  const rows = await page.evaluate(async (list) => {
    const d = await import("/src/data/hotelDetailData.ts");
    const { getHotelBySlug } = await import("/src/data/hotels.ts");
    // Las imágenes empaquetadas con el sitio no son direcciones estables: se quitan y la ficha pone la suya.
    const clean = (v) => JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && /^\/(src|assets)\//.test(x) ? null : typeof x === "function" || (x && x.$$typeof) ? undefined : x)));
    return list.map((h) => {
      const s = getHotelBySlug(h.slug) ?? null;
      const base = s ?? { name: h.name, priceRange: h.price_range, amenities: Array.isArray(h.amenities) ? h.amenities : [] };
      const policies = d.generatePolicies(base);
      return {
        slug: h.slug,
        room_types: clean(d.generateRooms(base)), pools: clean(d.generatePools(base)), dining: clean(d.generateRestaurants(base)), bars_lounges: clean(d.generateBars(base)),
        nightlife: clean(d.generateNightlife(base)), spa_info: clean(d.generateSpa(s ?? h.name)), policies: clean(policies), faqs: clean(d.hotelFaqsData),
        check_in_time: policies.checkIn, check_out_time: policies.checkOut,
      };
    });
  }, hotels);
  await browser.close();

  // Lo que estaba escrito dentro de los componentes (HotelHighlights y la lista de etiquetas de la ficha).
  const extras = {
    day_pass: { price: "$85 USD (~RD$ 5,100) / persona", hours: "09:30 AM - 06:00 PM", includes: "Incluye acceso total a piscinas, playa privada, almuerzo buffet ilimitado, bebidas nacionales y toallas." },
    kids_policy: { title: "Hasta 2 Niños Gratis (0 - 5 años)", text: "Niños de 6 a 12 años con 50% de descuento compartiendo habitación. Acceso sin costo al Kids Club y parque acuático infantil." },
    nightlife_summary: "Discoteca, Teatro & Shows",
    experience_tags: ["Playa de Arena Blanca", "Régimen Todo Incluido", "Servicio de Mayordomo 24/7", "Piscinas Climatizadas", "Spa & Wellness de Autor", "Deportes Acuáticos No Motorizados", "Kids Club & Teens Lounge", "WiFi de Alta Velocidad"],
  };
  const empty = (c) => `(${c} IS NULL OR ${c} IN ('[]'::jsonb, '{}'::jsonb, 'null'::jsonb))`;
  const fill = (c, v) => `${c} = CASE WHEN ${empty(c)} THEN ${jsonb(v)} ELSE ${c} END`;
  const sql = rows.map((r) => `UPDATE hotels SET
  ${["room_types", "pools", "dining", "bars_lounges", "nightlife", "spa_info", "policies", "faqs"].map((c) => fill(c, r[c])).join(",\n  ")},
  check_in_time = coalesce(check_in_time, ${lit(r.check_in_time)}),
  check_out_time = coalesce(check_out_time, ${lit(r.check_out_time)}),
  extras = ${jsonb(extras)} || coalesce(extras, '{}'::jsonb)
WHERE slug = ${lit(r.slug)};`);
  const header = `-- ==============================================================================
-- Migración 0092: contenido de la ficha de hotel en la base
-- La ficha componía en el navegador habitaciones, piscinas, restaurantes, bares, vida nocturna,
-- spa, políticas, preguntas frecuentes, pasadía y política de niños (los mismos textos de
-- ejemplo para todos los hoteles). Se guardan en cada hotel como punto de partida para que el
-- panel los muestre y cada propietario los corrija; la ficha ya los lee de aquí.
-- Generada por scripts/gen-hotel-details-seed.cjs. Sólo rellena lo vacío (extras: no pisa claves existentes).
-- ==============================================================================`;
  fs.writeFileSync(OUT, `${header}\n\n${sql.join("\n\n")}\n`);
  console.log(`${rows.length} hoteles → ${path.relative(process.cwd(), OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
})().catch((e) => { console.error(e); process.exit(1); });
