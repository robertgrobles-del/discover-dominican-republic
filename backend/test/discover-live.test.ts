import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `dl${Date.now().toString(36)}${n++}@test.local`;
const PUNTA_CANA = { lat: 18.582, lng: -68.4055 };
const BAVARO_ID = "b1000000-0000-4000-8000-000000000001";
const day = (k: number) => addDays(todayInSantoDomingo(), k); // la fecha de referencia es la de RD (UTC-4), como en el servidor

describe("búsqueda, mapa y recomendaciones", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const res = json(await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string };
  };
  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("busca sin acentos ni mayúsculas, entre colecciones y ordenado por relevancia", async () => {
    const res = json(await call("GET", "/search?q=BAVARO"));
    expect(res.data[0]).toMatchObject({ type: "beach", collection: "beaches", slug: "playa-bavaro", title: "Playa Bávaro" });
    expect(res.data[0].score).toBeGreaterThan(0.5);
    const multi = json(await call("GET", "/search?q=caribe&limit=30")).data as { type: string; title: string }[];
    expect(multi.some((x) => x.type === "hotel" && x.title === "Hotel Caribe")).toBe(true);
    expect(json(await call("GET", "/search?q=cana")).data.some((x: { title: string }) => x.title === "Punta Cana")).toBe(true);
    for (let i = 1; i < res.data.length; i++) expect(res.data[i - 1].score).toBeGreaterThanOrEqual(res.data[i].score);
  });

  it("filtra por tipo, valida la entrada y nunca muestra borradores, inactivos o programados", async () => {
    const beaches = json(await call("GET", "/search?q=playa&types=beach&limit=50")).data as { type: string; slug: string }[];
    expect(beaches.length).toBeGreaterThan(0);
    expect(beaches.every((b) => b.type === "beach")).toBe(true);
    const slugs = beaches.map((b) => b.slug);
    for (const hidden of ["playa-oculta", "playa-borrador", "playa-futura"]) expect(slugs).not.toContain(hidden);
    expect((await call("GET", "/search?q=playa&types=planeta")).statusCode).toBe(400);
    expect((await call("GET", "/search?q=a")).statusCode).toBe(400);
    expect((await call("GET", "/search")).statusCode).toBe(400);
    expect(json(await call("GET", "/search?q=zzzzqqqq")).data).toEqual([]);
    // Un texto con comodines no rompe la consulta ni devuelve todo.
    expect((await call("GET", "/search?q=%25%25")).statusCode).toBe(200);
  });

  it("autocompleta con pocos resultados y sin repetir; las búsquedas frecuentes salen de las consultas reales", async () => {
    const sug = json(await call("GET", "/search/suggest?q=pun")).data as { title: string }[];
    expect(sug.length).toBeLessThanOrEqual(8);
    expect(sug.some((s) => s.title === "Punta Cana")).toBe(true);
    const q = `mar y sol`;
    for (let i = 0; i < 3; i++) await call("GET", `/search?q=${encodeURIComponent(q)}`);
    await new Promise((r) => setTimeout(r, 300)); // el registro de la consulta es asíncrono
    expect(json(await call("GET", "/search/popular")).data).toContain(q);
  });

  it("mapa: capas con conteo y GeoJSON por capa y bbox", async () => {
    const layers = json(await call("GET", "/map/layers")).data as { id: string; count: number }[];
    expect(layers.find((l) => l.id === "beaches")!.count).toBeGreaterThanOrEqual(3);
    const fc = json(await call("GET", "/map/features?layer=beaches"));
    expect(fc.type).toBe("FeatureCollection");
    const bavaro = fc.features.find((f: { properties: { id: string } }) => f.properties.id === BAVARO_ID);
    expect(bavaro.geometry.type).toBe("Point");
    expect(bavaro.geometry.coordinates).toHaveLength(2);
    expect(fc.features.map((f: { properties: { slug: string } }) => f.properties.slug)).not.toContain("playa-oculta");
    const [lng, lat] = bavaro.geometry.coordinates;
    const inside = json(await call("GET", `/map/features?layer=beaches&bbox=${lng - 0.5},${lat - 0.5},${lng + 0.5},${lat + 0.5}`));
    expect(inside.features.some((f: { properties: { id: string } }) => f.properties.id === BAVARO_ID)).toBe(true);
    const far = json(await call("GET", "/map/features?layer=beaches&bbox=0,0,1,1"));
    expect(far.features).toEqual([]);
    const multi = json(await call("GET", "/map/features?layer=beaches,hotels"));
    expect(new Set(multi.features.map((f: { properties: { layer: string } }) => f.properties.layer))).toEqual(new Set(["beaches", "hotels"]));
    for (const bad of ["layer=nada", "layer=beaches&bbox=1,1,0,0", "layer=beaches&bbox=abc", "layer=beaches&bbox=0,0,1,200"]) expect((await call("GET", `/map/features?${bad}`)).statusCode, bad).toBe(400);
  });

  it("cerca de mí: distancia ordenada, radio y tipos", async () => {
    const res = json(await call("GET", `/geo/nearby?lat=${PUNTA_CANA.lat}&lng=${PUNTA_CANA.lng}&radius=1000&types=destination`));
    expect(res.data[0]).toMatchObject({ type: "destination", name: "Punta Cana", distance_m: 0 });
    const wide = json(await call("GET", `/geo/nearby?lat=${PUNTA_CANA.lat}&lng=${PUNTA_CANA.lng}&radius=50000&limit=40`)).data as { distance_m: number; type: string }[];
    expect(wide.length).toBeGreaterThan(1);
    for (let i = 1; i < wide.length; i++) expect(wide[i]!.distance_m).toBeGreaterThanOrEqual(wide[i - 1]!.distance_m);
    expect(wide.every((x) => x.distance_m <= 50_000)).toBe(true);
    expect(json(await call("GET", "/geo/nearby?lat=0&lng=0&radius=1000")).data).toEqual([]);
    expect((await call("GET", "/geo/nearby?lat=95&lng=0")).statusCode).toBe(400);
    expect((await call("GET", `/geo/nearby?lat=1&lng=1&types=nada`)).statusCode).toBe(400);
  });

  it("geocodificación inversa: destino y provincia cercanos, o nada si está lejos", async () => {
    const res = json(await call("GET", `/geo/reverse?lat=${PUNTA_CANA.lat}&lng=${PUNTA_CANA.lng}`)).data;
    expect(res.destination).toMatchObject({ name: "Punta Cana" });
    expect(res.province).toMatchObject({ name: "La Altagracia" });
    expect(json(await call("GET", "/geo/reverse?lat=0&lng=0")).data).toEqual({ province: null, municipality: null, destination: null });
  });

  it("recomendaciones de portada: secciones para todos y personalizadas con favoritos", async () => {
    const anon = json(await call("GET", "/recommendations/home")).data;
    expect(anon.personalized).toBe(false);
    const keys = anon.sections.map((s: { key: string }) => s.key);
    expect(keys).toEqual(expect.arrayContaining(["destinations", "beaches", "hotels"]));
    expect(anon.sections.find((s: { key: string }) => s.key === "events").items.every((e: { title: string }) => e.title !== "Feria pasada")).toBe(true);
    const u = await signup();
    await call("PUT", `/me/favorites/beach/${BAVARO_ID}`, { token: u.token });
    const mine = json(await call("GET", "/recommendations/home", { token: u.token })).data;
    expect(mine.personalized).toBe(true);
    expect(mine.sections[0].key).toBe("for_you_beaches");
    expect(mine.sections[0].items.map((i: { id: string }) => i.id)).not.toContain(BAVARO_ID);
  });
});

describe("datos vivos", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let editor: string, admin: string, plain: string;
  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    if (!role) return reg.data.tokens.access_token as string;
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };

  beforeAll(async () => {
    app = await makeApp({ FX_PROVIDER: "open_er_api", WEATHER_PROVIDER: "openweather", OPENWEATHER_API_KEY: "test_key_1234567890" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor"); plain = await account();
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("tasas: el equipo las carga y el público las lee, convierte y ve su historial", async () => {
    expect((await call("POST", "/admin/exchange_rates", { token: plain, payload: { rate_date: day(0), currency_code: "EUR", buy_rate: 60, sell_rate: 62 } })).statusCode).toBe(403);
    expect((await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(0), currency_code: "EUR", buy_rate: 65, sell_rate: 60 } })).statusCode).toBe(400);
    expect((await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(-1), currency_code: "EUR", buy_rate: 63, sell_rate: 65 } })).statusCode).toBe(201);
    expect((await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(0), currency_code: "EUR", buy_rate: 64, sell_rate: 66 } })).statusCode).toBe(201);
    expect((await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(0), currency_code: "EUR", buy_rate: 64, sell_rate: 66 } })).statusCode).toBe(409);
    expect((await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(0), currency_code: "JPY", buy_rate: 1, sell_rate: 1 } })).statusCode).toBe(400);
    await call("POST", "/admin/exchange_rates", { token: editor, payload: { rate_date: day(0), currency_code: "GBP", buy_rate: 78, sell_rate: 80 } });
    const rates = json(await call("GET", "/live/exchange-rates")).data;
    expect(rates.rates.find((r: { currency: string }) => r.currency === "EUR")).toEqual({ currency: "EUR", buy: 64, sell: 66, mid: 65 });
    const conv = (from: string, to: string, amount = 100) => call("POST", "/utils/convert", { payload: { amount, from, to } });
    expect(json(await conv("EUR", "DOP")).data).toMatchObject({ result: 6500, rate: 65 });
    expect(json(await conv("DOP", "EUR", 6500)).data.result).toBe(100);
    expect(json(await conv("EUR", "GBP")).data.result).toBeCloseTo(100 * 65 / 79, 2);
    expect(json(await conv("EUR", "EUR")).data.result).toBe(100);
    const usd = json(await conv("USD", "DOP")).data; // sin tasa de USD cargada se usa el valor de respaldo
    expect(usd.result).toBeGreaterThan(0);
    const noRate = await conv("CAD", "DOP");
    expect(noRate.statusCode).toBe(422);
    expect(json(noRate).error.details.code).toBe("NO_RATE");
    expect((await conv("XXX", "DOP")).statusCode).toBe(400);
    const hist = json(await call("GET", "/live/exchange-rates/history?pair=EUR-DOP&days=7")).data;
    expect(hist.map((h: { mid: number }) => h.mid)).toEqual([64, 65]);
    expect((await call("GET", "/live/exchange-rates/history?pair=EUR-USD")).statusCode).toBe(400);
    expect((await call("GET", "/live/exchange-rates/history?pair=JPY-DOP")).statusCode).toBe(400);
  });

  it("el proveedor de tasas actualiza el día con margen de compra/venta, y sin proveedor no hace nada", async () => {
    app.live.fetchJson = async () => ({ status: 200, json: async () => ({ result: "success", rates: { DOP: 60, EUR: 0.9, GBP: 0.75, CAD: 1.4, MXN: 20 } }) });
    const res = await app.jobs.runNow("fx.refresh");
    expect(res.status).toBe("success");
    expect(res.result).toMatchObject({ skipped: false, saved: 5 });
    const eur = (await pool.query("SELECT buy_rate, sell_rate FROM exchange_rates WHERE currency_code = 'EUR' AND rate_date = $1", [(res.result as { date: string }).date])).rows[0];
    expect(Number(eur.sell_rate)).toBeCloseTo((60 / 0.9) * 1.01, 3);
    expect(Number(eur.buy_rate)).toBeCloseTo((60 / 0.9) * 0.99, 3);
    app.live.fetchJson = async () => ({ status: 200, json: async () => ({ result: "success", rates: { DOP: 5 } }) }); // dato absurdo
    expect((await app.jobs.runNow("fx.refresh")).status).toBe("failed");
    app.live.fetchJson = async () => ({ status: 503, json: async () => ({}) });
    expect((await app.jobs.runNow("fx.refresh")).status).toBe("failed");
    for (let i = 0; i < 3; i++) expect((await app.jobs.runNow("fx.refresh")).status).toBe("failed"); // 5 fallos seguidos abren el circuito
    app.live.fetchJson = async () => ({ status: 200, json: async () => ({ result: "success", rates: { DOP: 60, EUR: 0.9, GBP: 0.75, CAD: 1.4, MXN: 20 } }) });
    const open = await app.jobs.runNow("fx.refresh");
    expect(open.status).toBe("failed");
    expect(open.error).toMatch(/circuito abierto/i); // falla rápido aunque el proveedor ya se haya recuperado
    await pool.query("DELETE FROM exchange_rates WHERE currency_code IN ('USD', 'CAD', 'MXN')"); // no dejar tasas de prueba que alteren otras pruebas
    const off = await makeApp();
    expect((await off.live.refreshRates()).skipped).toBe(true);
    expect((await off.weather.refreshWeather()).skipped).toBe(true);
    await off.close();
  });

  it("combustibles: vigentes con variación contra la semana anterior", async () => {
    await call("POST", "/admin/fuel_prices", { token: editor, payload: { effective_date: day(-14), gasolina_premium: 300, gasolina_regular: 280, gasoil_optimo: 250, gasoil_regular: 230, glp: 150, gnv: 40 } });
    await call("POST", "/admin/fuel_prices", { token: editor, payload: { effective_date: day(-7), gasolina_premium: 310, gasolina_regular: 285.5, gasoil_optimo: 250, gasoil_regular: 232, glp: 148, gnv: 40 } });
    const fuel = json(await call("GET", "/live/fuel-prices")).data;
    expect(fuel.effective_date).toBe(day(-7));
    const prem = fuel.prices.find((p: { product: string }) => p.product === "gasolina_premium");
    expect(prem).toMatchObject({ price: 310, previous: 300, change: 10 });
    expect(fuel.prices.find((p: { product: string }) => p.product === "glp").change).toBe(-2);
  });

  it("loterías: sorteos, resultados y consulta por rango", async () => {
    const lot = json(await call("POST", "/admin/lotteries", { token: editor, payload: { name: `Lotería ${tag}`, is_active: true } })).data;
    const draw = json(await call("POST", "/admin/lottery_draws", { token: editor, payload: { lottery_id: lot.id, name: "Noche", draw_days: ["lun", "mar"], draw_time: "20:30:00", number_of_balls: 3 } })).data;
    for (const [d, nums] of [[day(-2), [1, 2, 3]], [day(-1), [4, 5, 6]]] as const) {
      expect((await call("POST", "/admin/lottery_results", { token: editor, payload: { draw_id: draw.id, draw_date: d, winning_numbers: nums } })).statusCode).toBe(201);
    }
    expect((await call("POST", "/admin/lottery_results", { token: editor, payload: { draw_id: draw.id, draw_date: day(-1), winning_numbers: [9, 9, 9] } })).statusCode).toBe(409);
    const all = json(await call("GET", "/lotteries")).data as { id: string; draws: { last_result: { numbers: number[] } }[] }[];
    const mine = all.find((l) => l.id === lot.id)!;
    expect(mine.draws[0]!.last_result.numbers).toEqual([4, 5, 6]);
    const detail = json(await call("GET", `/lotteries/${lot.id}`)).data;
    expect(detail.results.map((r: { numbers: number[] }) => r.numbers)).toEqual([[4, 5, 6], [1, 2, 3]]);
    expect((await call("GET", "/lotteries/99999999-9999-4999-8999-999999999999")).statusCode).toBe(404);
    expect(json(await call("GET", `/live/lottery/results?game=${lot.id}&from=${day(-2)}&to=${day(-2)}`)).data.map((r: { numbers: number[] }) => r.numbers)).toEqual([[1, 2, 3]]);
    expect(json(await call("GET", `/live/lottery/results?game=${draw.id}`)).data).toHaveLength(2);
    expect((await call("GET", "/live/lottery/results?game=no-uuid")).statusCode).toBe(400);
  });

  it("clima: el proveedor guarda actual y pronóstico agregado por día; el público lo lee", async () => {
    const calls: string[] = [];
    app.weather.fetchJson = async (url) => {
      calls.push(url);
      if (url.includes("/forecast")) return { status: 200, json: async () => ({ list: [
        { dt_txt: `${day(1)} 09:00:00`, main: { temp_min: 24, temp_max: 27, temp: 25 }, pop: 0.2, weather: [{ description: "nubes" }] },
        { dt_txt: `${day(1)} 15:00:00`, main: { temp_min: 26, temp_max: 31, temp: 30 }, pop: 0.6, weather: [{ description: "lluvia ligera" }] },
        { dt_txt: `${day(2)} 09:00:00`, main: { temp_min: 23, temp_max: 28, temp: 26 }, pop: 0, weather: [{ description: "despejado" }] },
      ] }) };
      return { status: 200, json: async () => ({ main: { temp: 28.34, feels_like: 31.2, humidity: 70 }, wind: { speed: 5 }, weather: [{ description: "cielo claro", icon: "01d" }] }) };
    };
    const res = await app.jobs.runNow("weather.refresh");
    expect(res.status).toBe("success");
    expect(res.result).toMatchObject({ skipped: false, saved: 8 });
    expect(calls.every((u) => u.startsWith("https://api.openweathermap.org/") && u.includes("appid=test_key_1234567890"))).toBe(true);
    const w = json(await call("GET", "/live/weather?province=santo-domingo")).data;
    expect(w).toMatchObject({ name: "Santo Domingo", temperature_c: 28.3, humidity: 70, wind_kmh: 18, condition: "cielo claro", stale: false });
    expect(json(await call("GET", "/live/weather")).data).toHaveLength(8);
    const fc = json(await call("GET", "/live/weather/forecast?province=samana&days=1")).data;
    expect(fc.days).toEqual([{ date: day(1), min_c: 24, max_c: 31, rain_probability: 60, condition: expect.any(String) }]);
    expect((await call("GET", "/live/weather?province=atlantida")).statusCode).toBe(400);
    // Un fallo parcial no tumba el trabajo, pero uno total sí.
    app.weather.fetchJson = async () => ({ status: 500, json: async () => ({}) });
    expect((await app.jobs.runNow("weather.refresh")).status).toBe("failed");
    expect(json(await call("GET", "/live/weather?province=santo-domingo")).data.temperature_c).toBe(28.3); // lo último conocido se conserva
    await pool.query("UPDATE weather_snapshots SET observed_at = now() - interval '5 hours' WHERE location_slug = 'santiago'");
    expect(json(await call("GET", "/live/weather?province=santiago")).data.stale).toBe(true);
  });

  it("alertas vigentes por gravedad, estado del mar, reportes marinos y eventos de hoy", async () => {
    await call("POST", "/admin/weather_alerts", { token: editor, payload: { alert_type: "oleaje_alto", severity: "moderada", title: `Oleaje ${tag}`, description: "Olas de 2 m", is_active: true, expires_at: new Date(Date.now() + 3_600_000).toISOString() } });
    await call("POST", "/admin/weather_alerts", { token: editor, payload: { alert_type: "sargazo", severity: "grave", title: `Sargazo ${tag}`, description: "Llegada masiva", is_active: true } });
    await call("POST", "/admin/weather_alerts", { token: editor, payload: { alert_type: "sargazo", severity: "extrema", title: `Vencida ${tag}`, description: "x", is_active: true, expires_at: new Date(Date.now() - 3_600_000).toISOString() } });
    const alerts = json(await call("GET", "/live/weather/alerts")).data as { title: string; severity: string }[];
    const mine = alerts.filter((a) => a.title.endsWith(tag));
    expect(mine.map((a) => a.severity)).toEqual(["grave", "moderada"]); // ordenadas por gravedad y sin la vencida

    const report = { location: `Bávaro ${tag}`, wind_speed: 22, wind_direction: "NE", wave_height: 1.5, wave_period: 8, water_temp: 27, condition_rating: "Buena", recommendation: "Apta para bañarse" };
    expect((await call("POST", "/live/marine-reports", { token: plain, payload: report })).statusCode).toBe(403);
    expect((await call("POST", "/live/marine-reports", { token: editor, payload: { ...report, condition_rating: "Genial" } })).statusCode).toBe(400);
    expect((await call("POST", "/live/marine-reports", { token: editor, payload: report })).statusCode).toBe(201);
    await call("POST", "/live/marine-reports", { token: editor, payload: { ...report, wave_height: 2.5, condition_rating: "Regular" } });
    const status = json(await call("GET", "/live/beach-status")).data;
    const latest = status.reports.find((x: { location: string }) => x.location === report.location);
    expect(latest).toMatchObject({ wave_height: 2.5, condition_rating: "Regular" }); // el más reciente por localidad
    expect(status.alerts.some((a: { type: string }) => a.type === "sargazo")).toBe(true);
    expect(json(await call("GET", `/live/marine-reports?location=${encodeURIComponent(report.location)}`)).data).toHaveLength(2);

    // Los eventos se insertan y se borran de inmediato: las pruebas de contenido comparten esta tabla y cuentan sus filas.
    try {
      await pool.query("INSERT INTO events (title, slug, start_date, end_date, status, published_at) VALUES ($1, $2, $3, $4, 'published', now() - interval '1 day'), ($5, $6, $7, NULL, 'published', now())", [`Hoy ${tag}`, `hoy-${tag}`, day(-1), day(1), `Mañana ${tag}`, `manana-${tag}`, day(1)]);
      const now = json(await call("GET", "/live/events-now")).data as { title: string }[];
      expect(now.some((e) => e.title === `Hoy ${tag}`)).toBe(true);
      expect(now.some((e) => e.title === `Mañana ${tag}`)).toBe(false);
    } finally {
      await pool.query("DELETE FROM events WHERE slug IN ($1, $2)", [`hoy-${tag}`, `manana-${tag}`]);
    }
  });

  it("webcams, zonas horarias y ciudades; sólo el admin dispara la actualización manual", async () => {
    await call("POST", "/admin/webcams", { token: editor, payload: { name: `Cam ${tag}`, stream_url: "https://stream.example.com/a", is_active: true, sort_order: -5 } });
    await call("POST", "/admin/webcams", { token: editor, payload: { name: `Apagada ${tag}`, stream_url: "https://stream.example.com/b", is_active: false } });
    const cams = json(await call("GET", "/live/webcams")).data as { name: string }[];
    expect(cams.some((c) => c.name === `Cam ${tag}`)).toBe(true);
    expect(cams.some((c) => c.name === `Apagada ${tag}`)).toBe(false);
    expect(json(await call("GET", "/live/time-zones")).data[0]).toMatchObject({ id: "America/Santo_Domingo", utc_offset: "-04:00" });
    expect(json(await call("GET", "/live/locations")).data).toHaveLength(8);
    expect((await call("POST", "/admin/live/refresh?source=weather", { token: editor })).statusCode).toBe(403);
    app.weather.fetchJson = async () => ({ status: 200, json: async () => ({ main: { temp: 30, feels_like: 33, humidity: 60 }, wind: { speed: 3 }, weather: [{ description: "soleado" }] }) });
    expect((await call("POST", "/admin/live/refresh?source=weather", { token: admin })).statusCode).toBe(200);
    expect((await call("POST", "/admin/live/refresh?source=lluvia", { token: admin })).statusCode).toBe(400);
  });
});
