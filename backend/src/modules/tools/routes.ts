import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { tableAdminRoutes, type TableCfg } from "../../lib/table-admin.js";
import { BUDGET_DEFAULTS, CARBON_DEFAULTS, CONFOTUR_DEFAULTS, TAX_DEFAULTS, budget, carbon, confotur, packingList, restaurantBill, tolls, withOverrides, type TollPoint } from "./calculators.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const TOOL_TABLES: TableCfg[] = [
  { table: "dictionary_terms", pk: "id", readonly: ["id", "created_at"], order: "term", label: "Glosario" },
  { table: "travel_phrases", pk: "id", readonly: ["id", "created_at"], order: "sort_order, category", label: "Frases de viaje" },
  { table: "entry_requirements", pk: "id", readonly: ["id", "updated_at"], order: "country_name", label: "Requisitos de entrada" },
  { table: "flight_routes", pk: "id", readonly: ["id"], order: "origin, destination", label: "Distancias de vuelo" },
  { table: "affiliate_offers", pk: "id", readonly: ["id", "created_at"], order: "kind, sort_order", label: "Ofertas de afiliados" },
];
const KINDS = { esim: "esim", insurance: "insurance", "prepaid-card": "prepaid-card" } as const;
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

/** Calculadoras y herramientas del viajero (docs §5.5). Las cifras de las calculadoras se ajustan en `site_settings` (`calculators.<nombre>`). */
export async function toolsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const pub = <T>(reply: { header: (k: string, v: string) => unknown }, v: T, cache = PUBLIC_CACHE) => { reply.header("cache-control", cache); return v; };
  const calc = ["calculadoras"], tools = ["herramientas"];

  /** Cifras vigentes: valores por defecto con los ajustes del equipo (caché corta para no leer la base en cada cálculo). */
  const CONFIG_TTL_MS = app.env.NODE_ENV === "test" ? 0 : 30_000;
  const cache = new Map<string, { at: number; value: unknown }>();
  const config = async <T extends Record<string, unknown>>(name: string, defaults: T): Promise<T> => {
    const hit = cache.get(name);
    if (hit && Date.now() - hit.at < CONFIG_TTL_MS) return hit.value as T;
    const row = (await db.query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = $1", [`calculators.${name}`])).rows[0];
    const value = withOverrides(defaults, row?.value);
    cache.set(name, { at: Date.now(), value });
    return value;
  };
  const rate = async () => Number((await db.query<{ sell_rate: string }>("SELECT sell_rate FROM exchange_rates WHERE currency_code = 'USD' ORDER BY rate_date DESC LIMIT 1")).rows[0]?.sell_rate ?? app.env.DEFAULT_USD_DOP);

  r.post("/calculators/budget", {
    config: rl(120, "1 minute"),
    schema: {
      tags: calc, summary: "Presupuesto de viaje por rubro (USD y DOP)",
      body: z.object({ days: z.number().int().min(1).max(90), travelers: z.number().int().min(1).max(30), style: z.enum(["mochilero", "estandar", "lujo"]).default("estandar"), region: z.enum(["general", "este", "norte", "sur", "capital"]).optional(), include: z.array(z.string().max(30)).max(20).optional(), exclude: z.array(z.string().max(30)).max(20).optional() }),
      response: { 200: ok },
    },
  }, async (req) => {
    const cfg = await config("budget", BUDGET_DEFAULTS);
    const known = Object.keys(cfg.categories);
    for (const c of [...(req.body.include ?? []), ...(req.body.exclude ?? [])]) if (!known.includes(c)) throw AppError.validation(`Rubro desconocido: ${c}`, { known });
    const res = budget(cfg, req.body);
    const fx = await rate();
    return { data: { ...res, total_dop: Math.round(res.total * fx * 100) / 100, usd_rate: fx } };
  });

  r.post("/calculators/tax", { config: rl(120, "1 minute"), schema: { tags: calc, summary: "Cuenta con ITBIS (18 %) y propina de ley (10 %) más propina voluntaria", body: z.object({ subtotal: z.number().min(0).max(100_000_000), tip_percent: z.number().min(0).max(50).default(0), regime: z.enum(["restaurant", "retail"]).default("restaurant") }), response: { 200: ok } } }, async (req) => ({ data: restaurantBill(await config("tax", TAX_DEFAULTS), { subtotal: req.body.subtotal, tip_pct: req.body.tip_percent, regime: req.body.regime }) }));

  r.post("/calculators/confotur", { config: rl(120, "1 minute"), schema: { tags: calc, summary: "Beneficios fiscales estimados de la Ley 158-01 (CONFOTUR)", body: z.object({ property_value: z.number().gt(0).max(10_000_000_000), annual_rental_income: z.number().min(0).max(10_000_000_000).optional(), is_company: z.boolean().default(false), years: z.number().int().min(1).max(15).optional() }), response: { 200: ok } } }, async (req) => ({ data: confotur(await config("confotur", CONFOTUR_DEFAULTS), req.body) }));

  r.post("/calculators/carbon", {
    config: rl(120, "1 minute"),
    schema: {
      tags: calc, summary: "Huella de carbono del viaje y proyectos para compensarla",
      body: z.object({ origin: z.string().max(60).optional(), destination: z.string().max(60).optional(), flight_km: z.number().min(0).max(25_000).optional(), round_trip: z.boolean().default(true), passengers: z.number().int().min(1).max(50).default(1), rental_car_km: z.number().min(0).max(20_000).default(0), car_type: z.enum(["gasoline", "diesel", "hybrid", "electric"]).default("gasoline"), bus_km: z.number().min(0).max(20_000).default(0), ferry_trips: z.number().int().min(0).max(20).default(0) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    let km = b.flight_km ?? 0;
    if (b.flight_km === undefined && b.origin && b.destination) {
      const route = (await db.query<{ distance_km: number }>("SELECT distance_km FROM flight_routes WHERE origin = $1 AND destination = $2", [b.origin, b.destination])).rows[0];
      if (!route) throw new AppError("BUSINESS_RULE", "No tenemos esa ruta: indica la distancia con flight_km", { code: "ROUTE_UNKNOWN" });
      km = route.distance_km;
    }
    const res = carbon(await config("carbon", CARBON_DEFAULTS), { flight_km_one_way: km, round_trip: b.round_trip, passengers: b.passengers, rental_car_km: b.rental_car_km, car_type: b.car_type, bus_km: b.bus_km, ferry_trips: b.ferry_trips });
    const projects = (await db.query("SELECT id, title, slug, location, category, cost_info FROM offset_projects WHERE status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) ORDER BY title LIMIT 10")).rows;
    return { data: { ...res, offset_projects: projects } };
  });
  r.get("/calculators/carbon/routes", { schema: { tags: calc, summary: "Rutas de vuelo con distancia conocida", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT origin, destination, distance_km FROM flight_routes ORDER BY origin, destination")).rows }));

  // ---- Peajes ----
  r.get("/calculators/tolls/routes", { schema: { tags: calc, summary: "Rutas con peaje y sus estaciones", response: { 200: ok } } }, async (_q, reply) => {
    const rows = (await db.query("SELECT id, name, slug, description, tolls_data FROM toll_routes WHERE status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) ORDER BY name")).rows;
    return pub(reply, { data: rows.map((x) => ({ id: x.id, slug: x.slug, name: x.name, description: x.description, stations: parseTolls(x.tolls_data).map((t) => t.name) })) });
  });
  const parseTolls = (raw: unknown): TollPoint[] => {
    const v = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : raw;
    return Array.isArray(v) ? v.filter((t): t is TollPoint => !!t && typeof t.name === "string") : [];
  };
  r.post("/calculators/tolls", { config: rl(120, "1 minute"), schema: { tags: calc, summary: "Costo de peajes de una ruta según la categoría del vehículo (1 liviano … 4 pesado)", body: z.object({ route: z.string().min(2).max(100), vehicle: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1) }), response: { 200: ok } } }, async (req) => {
    const isUuid = /^[0-9a-f-]{36}$/i.test(req.body.route);
    const row = (await db.query<{ id: string; name: string; tolls_data: unknown }>(`SELECT id, name, tolls_data FROM toll_routes WHERE status = 'published' AND deleted_at IS NULL AND ${isUuid ? "id = $1::uuid" : "slug = $1"}`, [req.body.route])).rows[0];
    if (!row) throw AppError.notFound("Ruta");
    return { data: { route: { id: row.id, name: row.name }, ...tolls(parseTolls(row.tolls_data), req.body.vehicle) } };
  });

  r.post("/calculators/packing-list", { config: rl(120, "1 minute"), schema: { tags: calc, summary: "Lista de empaque según duración, clima y actividades", body: z.object({ days: z.number().int().min(1).max(60), climate: z.enum(["tropical", "calor", "fresco", "lluvioso"]).default("tropical"), activities: z.array(z.enum(["playa", "senderismo", "ciudad", "noche", "aventura", "negocios"])).max(6).default([]), with_kids: z.boolean().default(false), travelers: z.number().int().min(1).max(30).default(1) }), response: { 200: ok } } }, async (req) => ({ data: packingList(req.body) }));

  // ---------- Herramientas ----------
  r.get("/tools/dictionary", { schema: { tags: tools, summary: "Glosario de dominicanismos (sin acentos ni mayúsculas)", querystring: z.object({ q: z.string().trim().max(60).optional(), category: z.string().trim().max(40).optional(), limit: z.coerce.number().int().min(1).max(200).default(100) }), response: { 200: ok } } }, async (req, reply) => {
    const q = req.query.q ? `%${req.query.q.replace(/[\\%_]/g, "\\$&")}%` : null;
    const rows = (await db.query(`SELECT term, meaning, example, category FROM dictionary_terms WHERE is_active AND ($1::text IS NULL OR lower(f_unaccent(term)) LIKE lower(f_unaccent($1)) ESCAPE '\\' OR lower(f_unaccent(meaning)) LIKE lower(f_unaccent($1)) ESCAPE '\\') AND ($2::text IS NULL OR category = $2) ORDER BY term LIMIT ${req.query.limit}`, [q, req.query.category ?? null])).rows;
    return pub(reply, { data: rows });
  });
  r.get("/tools/phrases", { schema: { tags: tools, summary: "Frases útiles del español al idioma elegido", querystring: z.object({ lang: z.enum(["en", "fr", "de", "pt", "it"]).default("en"), category: z.string().trim().max(40).optional() }), response: { 200: ok } } }, async (req, reply) => {
    const rows = (await db.query(`SELECT category, es, ${req.query.lang} AS translation FROM travel_phrases WHERE is_active AND ${req.query.lang} IS NOT NULL AND ($1::text IS NULL OR category = $1) ORDER BY sort_order, es`, [req.query.category ?? null])).rows;
    return pub(reply, { data: rows });
  });
  r.get("/tools/requirements", { schema: { tags: tools, summary: "Requisitos de entrada por país (código ISO de 2 letras)", querystring: z.object({ country: z.string().trim().length(2).toUpperCase().optional() }), response: { 200: ok } } }, async (req, reply) => {
    const rows = (await db.query("SELECT country_code, country_name, visa_required, max_stay_days, passport_validity_months, tourist_card_fee_usd, entry_form, notes, updated_at FROM entry_requirements WHERE is_active AND ($1::text IS NULL OR country_code = $1) ORDER BY country_name", [req.query.country ?? null])).rows;
    if (req.query.country && !rows.length) throw AppError.notFound("País");
    return pub(reply, { data: req.query.country ? { ...rows[0], tourist_card_fee_usd: rows[0].tourist_card_fee_usd === null ? null : Number(rows[0].tourist_card_fee_usd) } : rows.map((x) => ({ ...x, tourist_card_fee_usd: x.tourist_card_fee_usd === null ? null : Number(x.tourist_card_fee_usd) })) });
  });

  for (const [path, kind] of Object.entries(KINDS)) {
    r.get(`/tools/${path}`, { schema: { tags: tools, summary: `Ofertas de ${path}`, response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT id, name, provider, description, price_from_usd, url, is_featured FROM affiliate_offers WHERE kind = $1 AND is_active ORDER BY is_featured DESC, sort_order, name", [kind])).rows.map((x) => ({ ...x, price_from_usd: x.price_from_usd === null ? null : Number(x.price_from_usd) })) }));
    r.post(`/tools/${path}/lead`, {
      config: rl(10, "1 hour"),
      schema: { tags: tools, summary: `Solicita información sobre ${path} (requiere consentimiento)`, body: z.object({ name: z.string().trim().min(2).max(100), email, phone: z.string().trim().max(30).optional(), offer_id: z.string().uuid().optional(), message: z.string().trim().max(1000).optional(), consent: z.literal(true, { error: "Debes aceptar el tratamiento de tus datos" }), website: z.string().max(200).optional() }), response: { 202: ok } },
    }, async (req, reply) => {
      const b = req.body;
      reply.code(202);
      if (b.website) return { data: { received: true } };
      let offer: string | null = null;
      if (b.offer_id) {
        offer = (await db.query<{ name: string }>("SELECT name FROM affiliate_offers WHERE id = $1 AND kind = $2 AND is_active", [b.offer_id, kind])).rows[0]?.name ?? null;
        if (!offer) throw AppError.notFound("Oferta");
      }
      await app.leads.capture({ name: b.name, email: b.email, phone: b.phone, message: b.message, source: `tool:${kind}`, interest: offer });
      return { data: { received: true } };
    });
  }

  await tableAdminRoutes(app, TOOL_TABLES, ["admin", "editor"]);
  r.get("/admin/calculators/defaults", { onRequest: app.requireRole("admin"), schema: { tags: ["admin"], summary: "Cifras por defecto y vigentes de las calculadoras (se ajustan con site_settings `calculators.<nombre>`)", security: bearer, response: { 200: ok } } }, async () => ({
    data: { budget: { defaults: BUDGET_DEFAULTS, current: await config("budget", BUDGET_DEFAULTS) }, tax: { defaults: TAX_DEFAULTS, current: await config("tax", TAX_DEFAULTS) }, confotur: { defaults: CONFOTUR_DEFAULTS, current: await config("confotur", CONFOTUR_DEFAULTS) }, carbon: { defaults: CARBON_DEFAULTS, current: await config("carbon", CARBON_DEFAULTS) } },
  }));
}
