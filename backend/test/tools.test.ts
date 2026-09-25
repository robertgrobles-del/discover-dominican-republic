import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BUDGET_DEFAULTS, CARBON_DEFAULTS, CONFOTUR_DEFAULTS, TAX_DEFAULTS, budget, carbon, confotur, packingList, restaurantBill, tolls, withOverrides } from "../src/modules/tools/calculators.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `tl${Date.now().toString(36)}${n++}@test.local`;

describe("calculadoras (funciones puras)", () => {
  it("presupuesto: por persona y día, vuelos una sola vez, estilos y rubros excluidos", () => {
    const std = budget(BUDGET_DEFAULTS, { days: 7, travelers: 2, style: "estandar" });
    const line = (c: string) => std.lines.find((l) => l.category === c)!;
    expect(line("alojamiento").amount).toBe(80 * 7); // por día, sin importar las personas
    expect(line("comida").amount).toBe(35 * 7 * 2); // por persona y día
    expect(line("vuelos").amount).toBe(350 * 2); // por persona, sin días
    expect(line("compras")).toMatchObject({ included: false, amount: 0 });
    expect(std.total).toBe(560 + 490 + 175 + 560 + 700 + 112 + 70 + 70);
    expect(std.per_person).toBe(std.total / 2);
    expect(budget(BUDGET_DEFAULTS, { days: 7, travelers: 2, style: "lujo" }).total).toBeCloseTo(std.total * 2.5, 2);
    expect(budget(BUDGET_DEFAULTS, { days: 7, travelers: 2, style: "mochilero" }).total).toBeCloseTo(std.total * 0.5, 2);
    const noFlights = budget(BUDGET_DEFAULTS, { days: 7, travelers: 2, style: "estandar", exclude: ["vuelos"] });
    expect(noFlights.total).toBe(std.total - 700);
    expect(budget(BUDGET_DEFAULTS, { days: 3, travelers: 1, style: "estandar", include: ["compras"] }).total).toBe(20 * 3);
  });

  it("cuenta de restaurante: ITBIS 18 %, propina de ley 10 % y propina voluntaria", () => {
    expect(restaurantBill(TAX_DEFAULTS, { subtotal: 1500, tip_pct: 5 })).toMatchObject({ itbis: 270, legal_tip: 150, voluntary_tip: 75, total: 1995 });
    expect(restaurantBill(TAX_DEFAULTS, { subtotal: 1000, regime: "retail", tip_pct: 10 })).toMatchObject({ itbis: 180, legal_tip: 0, voluntary_tip: 0, total: 1180 });
  });

  it("CONFOTUR: transferencia 3 %, IPI 1 %, ISR 20 % de rentas y activos 1 % de empresas, hasta 15 años", () => {
    const p = confotur(CONFOTUR_DEFAULTS, { property_value: 200_000, annual_rental_income: 20_000 });
    expect(p).toMatchObject({ transfer_tax_savings: 6000, ipi_savings_per_year: 2000, isr_savings_per_year: 4000, assets_tax_savings_per_year: 0, savings_per_year: 6000, years: 15, total_savings: 6000 + 6000 * 15 });
    expect(confotur(CONFOTUR_DEFAULTS, { property_value: 100_000, is_company: true, years: 5 })).toMatchObject({ assets_tax_savings_per_year: 1000, total_savings: 3000 + (1000 + 1000) * 5 });
    expect(confotur(CONFOTUR_DEFAULTS, { property_value: 100_000, years: 99 }).years).toBe(15); // nunca más de 15 años
  });

  it("carbono: vuelo por pasajero, vehículo compartido, guagua y lancha, y árboles", () => {
    const r = carbon(CARBON_DEFAULTS, { flight_km_one_way: 1500, round_trip: true, passengers: 2, rental_car_km: 250, car_type: "gasoline", bus_km: 100, ferry_trips: 1 });
    expect(r.flight_km).toBe(3000);
    expect(r.breakdown_kg).toEqual({ flight: 3000 * 0.115 * 2, car: 250 * 0.192, bus: 100 * 0.04 * 2, ferry: 18 * 2 });
    expect(r.total_kg).toBeCloseTo(690 + 48 + 8 + 36, 2);
    expect(r.trees_needed).toBe(Math.ceil(r.total_kg / 22));
    expect(carbon(CARBON_DEFAULTS, { flight_km_one_way: 0, round_trip: false, passengers: 1 })).toMatchObject({ total_kg: 0, trees_needed: 0 });
    expect(carbon(CARBON_DEFAULTS, { flight_km_one_way: 1, round_trip: false, passengers: 1 }).trees_needed).toBe(1);
    expect(carbon(CARBON_DEFAULTS, { flight_km_one_way: 0, round_trip: false, passengers: 1, rental_car_km: 100, car_type: "electric" }).total_kg).toBe(4.5);
  });

  it("peajes por categoría de vehículo", () => {
    const pts = [{ name: "A", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 }, { name: "B", cat1Price: 100, cat2Price: 200, cat3Price: 300, cat4Price: 400 }];
    expect(tolls(pts, 1)).toMatchObject({ stations: 2, total: 160 });
    expect(tolls(pts, 4).total).toBe(640);
    expect(tolls([{ name: "X" } as never], 2).total).toBe(0); // dato incompleto: no rompe el cálculo
  });

  it("lista de empaque: cantidades según días y reglas por clima, actividades y niños", () => {
    const beach = packingList({ days: 5, climate: "tropical", activities: ["playa"] });
    const names = (l: ReturnType<typeof packingList>) => l.categories.flatMap((c) => c.items.map((i) => i.id));
    expect(names(beach)).toEqual(expect.arrayContaining(["traje-bano", "protector-solar", "repelente", "pasaporte"]));
    expect(names(beach)).not.toContain("botas");
    const hike = packingList({ days: 12, climate: "lluvioso", activities: ["senderismo", "noche"], with_kids: true });
    expect(names(hike)).toEqual(expect.arrayContaining(["botas", "impermeable", "ropa-formal", "pañales", "mochila"]));
    expect(hike.categories.find((c) => c.id === "ropa")!.items.find((i) => i.id === "ropa-interior")!.quantity).toBe(10); // tope
    expect(packingList({ days: 2, climate: "fresco", activities: [] }).categories[1]!.items.find((i) => i.id === "chaqueta")!.essential).toBe(true);
    expect(hike.total_items).toBeGreaterThan(beach.total_items);
  });

  it("los ajustes sólo aceptan cifras numéricas que ya existen", () => {
    const cfg = withOverrides(BUDGET_DEFAULTS, { categories: { alojamiento: 100, inventado: 5, comida: "mucho", vuelos: -3 }, styles: { lujo: 3 }, extra: { x: 1 } });
    expect(cfg.categories.alojamiento).toBe(100);
    expect(cfg.categories.comida).toBe(35); // texto: se ignora
    expect(cfg.categories.vuelos).toBe(350); // negativo: se ignora
    expect(cfg.styles.lujo).toBe(3);
    expect(Object.keys(cfg.categories)).not.toContain("inventado");
    expect(Object.keys(cfg)).not.toContain("extra");
    expect(withOverrides(BUDGET_DEFAULTS, "nada")).toBe(BUDGET_DEFAULTS);
    expect(withOverrides(BUDGET_DEFAULTS, [1, 2])).toBe(BUDGET_DEFAULTS);
  });
});

describe("calculadoras y herramientas por HTTP", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor");
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("presupuesto: valida rubros y entrega el total también en DOP", async () => {
    const res = json(await call("POST", "/calculators/budget", { payload: { days: 7, travelers: 2, style: "estandar" } })).data;
    expect(res.total).toBe(560 + 490 + 175 + 560 + 700 + 112 + 70 + 70);
    expect(res.total_dop).toBeCloseTo(res.total * res.usd_rate, 1);
    expect(res.lines.find((l: { category: string }) => l.category === "vuelos").amount).toBe(700);
    for (const bad of [{ days: 0, travelers: 1 }, { days: 5, travelers: 0 }, { days: 5, travelers: 1, style: "rey" }, { days: 5, travelers: 1, exclude: ["yates"] }]) {
      expect((await call("POST", "/calculators/budget", { payload: bad })).statusCode, JSON.stringify(bad)).toBe(400);
    }
  });

  it("las cifras se ajustan desde site_settings sin tocar código, con validación", async () => {
    const before = json(await call("POST", "/calculators/tax", { payload: { subtotal: 1000, tip_percent: 0 } })).data;
    expect(before).toMatchObject({ itbis: 180, legal_tip: 100, total: 1280 });
    await call("PUT", "/admin/settings/calculators.tax", { token: admin, payload: { value: { itbis_pct: 16, legal_tip_pct: "x", inventado: 1 } } });
    const after = json(await call("POST", "/calculators/tax", { payload: { subtotal: 1000 } })).data;
    expect(after).toMatchObject({ itbis: 160, legal_tip: 100 }); // el 16 se aplica; el texto y el campo inventado se ignoran
    const defaults = json(await call("GET", "/admin/calculators/defaults", { token: admin })).data;
    expect(defaults.tax.current.itbis_pct).toBe(16);
    expect(defaults.tax.defaults.itbis_pct).toBe(18);
    await call("DELETE", "/admin/settings/calculators.tax", { token: admin });
    expect(json(await call("POST", "/calculators/tax", { payload: { subtotal: 1000 } })).data.itbis).toBe(180);
    expect((await call("GET", "/admin/calculators/defaults", { token: editor })).statusCode).toBe(403);
  });

  it("CONFOTUR, cuenta y carbono por HTTP con validación", async () => {
    expect(json(await call("POST", "/calculators/confotur", { payload: { property_value: 200000, annual_rental_income: 20000 } })).data.total_savings).toBe(96000);
    expect((await call("POST", "/calculators/confotur", { payload: { property_value: 0 } })).statusCode).toBe(400);
    expect((await call("POST", "/calculators/tax", { payload: { subtotal: -5 } })).statusCode).toBe(400);
    const byRoute = json(await call("POST", "/calculators/carbon", { payload: { origin: "Miami (MIA)", destination: "Punta Cana (PUJ)", passengers: 2 } })).data;
    expect(byRoute.flight_km).toBe(2800);
    expect(byRoute.breakdown_kg.flight).toBeCloseTo(2800 * 0.115 * 2, 2);
    expect(Array.isArray(byRoute.offset_projects)).toBe(true);
    const unknown = await call("POST", "/calculators/carbon", { payload: { origin: "Marte", destination: "Punta Cana (PUJ)" } });
    expect(unknown.statusCode).toBe(422);
    expect(json(unknown).error.details.code).toBe("ROUTE_UNKNOWN");
    expect(json(await call("POST", "/calculators/carbon", { payload: { flight_km: 100, round_trip: false } })).data.flight_km).toBe(100);
    expect(json(await call("GET", "/calculators/carbon/routes")).data.length).toBeGreaterThanOrEqual(7);
  });

  it("peajes: usa las rutas publicadas del CMS y sus estaciones", async () => {
    const created = json(await call("POST", "/admin/toll-routes", { token: editor, payload: { name: `Ruta ${tag}`, description: "Ruta de prueba", tolls_data: [{ name: "Peaje A", cat1Price: 60, cat2Price: 120, cat3Price: 180, cat4Price: 240 }, { name: "Peaje B", cat1Price: 100, cat2Price: 200, cat3Price: 300, cat4Price: 400 }] } })).data;
    const slug = created.slug as string;
    expect((await call("POST", "/calculators/tolls", { payload: { route: slug } })).statusCode).toBe(404); // borrador: no es público
    await call("POST", `/admin/toll-routes/${created.id}/publish`, { token: admin });
    const res = json(await call("POST", "/calculators/tolls", { payload: { route: slug, vehicle: 2 } })).data;
    expect(res).toMatchObject({ stations: 2, total: 320, category: 2 });
    expect(json(await call("POST", "/calculators/tolls", { payload: { route: created.id, vehicle: 4 } })).data.total).toBe(640);
    expect(json(await call("GET", "/calculators/tolls/routes")).data.find((x: { slug: string }) => x.slug === slug).stations).toEqual(["Peaje A", "Peaje B"]);
    expect((await call("POST", "/calculators/tolls", { payload: { route: slug, vehicle: 9 } })).statusCode).toBe(400);
    await call("POST", `/admin/toll-routes/${created.id}/unpublish`, { token: admin });
  });

  it("lista de empaque por HTTP", async () => {
    const res = json(await call("POST", "/calculators/packing-list", { payload: { days: 7, climate: "tropical", activities: ["playa", "senderismo"], with_kids: true, travelers: 3 } })).data;
    expect(res.categories.map((c: { id: string }) => c.id)).toEqual(expect.arrayContaining(["documentos", "ropa", "aventura", "ninos"]));
    expect(res.note).toBeTruthy();
    expect((await call("POST", "/calculators/packing-list", { payload: { days: 7, activities: ["volar"] } })).statusCode).toBe(400);
  });

  it("glosario, frases y requisitos de entrada", async () => {
    expect(json(await call("GET", "/tools/dictionary?q=GUAGUA")).data[0]).toMatchObject({ term: "Guagua", category: "transporte" });
    expect(json(await call("GET", "/tools/dictionary?q=mangu")).data.some((t: { term: string }) => t.term === "Mangú")).toBe(true); // sin acentos
    expect(json(await call("GET", "/tools/dictionary?category=comida")).data.every((t: { category: string }) => t.category === "comida")).toBe(true);
    expect(json(await call("GET", "/tools/phrases?lang=fr")).data.find((p: { es: string }) => p.es === "Gracias").translation).toBe("Merci");
    expect(json(await call("GET", "/tools/phrases?lang=de&category=emergencia")).data).toHaveLength(1);
    expect((await call("GET", "/tools/phrases?lang=ja")).statusCode).toBe(400);
    expect(json(await call("GET", "/tools/requirements?country=cn")).data).toMatchObject({ country_code: "CN", visa_required: true });
    expect(json(await call("GET", "/tools/requirements?country=US")).data).toMatchObject({ visa_required: false, tourist_card_fee_usd: 10 });
    expect(json(await call("GET", "/tools/requirements")).data.length).toBeGreaterThanOrEqual(6);
    expect((await call("GET", "/tools/requirements?country=ZZ")).statusCode).toBe(404);
    expect((await call("GET", "/tools/requirements?country=USA")).statusCode).toBe(400);
  });

  it("el equipo edita el glosario y las ofertas; el público sólo ve lo activo y los leads exigen consentimiento", async () => {
    const term = await call("POST", "/admin/dictionary_terms", { token: editor, payload: { term: `Palabra ${tag}`, meaning: "Un significado", category: "expresiones" } });
    expect(term.statusCode).toBe(201);
    expect((await call("POST", "/admin/dictionary_terms", { token: editor, payload: { term: `palabra ${tag}`, meaning: "repetida" } })).statusCode).toBe(409); // sin distinguir mayúsculas
    expect(json(await call("GET", `/tools/dictionary?q=${tag}`)).data).toHaveLength(1);
    await call("PATCH", `/admin/dictionary_terms/${json(term).data.id}`, { token: editor, payload: { is_active: false } });
    expect(json(await call("GET", `/tools/dictionary?q=${tag}`)).data).toHaveLength(0);

    expect((await call("POST", "/admin/affiliate_offers", { token: editor, payload: { kind: "esim", name: "Insegura", provider: "X", url: "http://inseguro.com" } })).statusCode).toBe(400);
    const offer = json(await call("POST", "/admin/affiliate_offers", { token: editor, payload: { kind: "esim", name: `eSIM ${tag}`, provider: "Proveedor", price_from_usd: 9.99, url: "https://esim.example.com", is_featured: true } })).data;
    const off = json(await call("POST", "/admin/affiliate_offers", { token: editor, payload: { kind: "esim", name: `Apagada ${tag}`, provider: "P", url: "https://x.example.com", is_active: false } })).data;
    const list = json(await call("GET", "/tools/esim")).data as { id: string; price_from_usd: number }[];
    expect(list[0]!.id).toBe(offer.id); // destacadas primero
    expect(list[0]!.price_from_usd).toBe(9.99);
    expect(list.some((o) => o.id === off.id)).toBe(false);
    expect(json(await call("GET", "/tools/insurance")).data.every((o: { id: string }) => o.id !== offer.id)).toBe(true);

    const email = uniq();
    const lead = (payload: object, path = "esim") => call("POST", `/tools/${path}/lead`, { payload: { name: "Visitante Uno", email, ...payload } });
    expect((await lead({ consent: false })).statusCode).toBe(400);
    expect((await lead({ consent: true, offer_id: offer.id }, "insurance")).statusCode).toBe(404); // la oferta no es de ese tipo
    expect((await lead({ consent: true, offer_id: offer.id, message: "Quiero más info" })).statusCode).toBe(202);
    expect((await pool.query("SELECT source, interest, consent FROM marketing_leads WHERE email = $1", [email])).rows[0]).toEqual({ source: "tool:esim", interest: `eSIM ${tag}`, consent: true });
    expect((await lead({ consent: true, website: "http://spam" })).statusCode).toBe(202);
    expect((await pool.query("SELECT count(*)::int AS n FROM marketing_leads WHERE email = $1", [email])).rows[0].n).toBe(1);
  });
});
