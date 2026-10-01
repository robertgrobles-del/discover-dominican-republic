import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { CircuitBreaker } from "../../lib/breaker.js";
import { readBodyCapped, traceHeaders } from "../../lib/http.js";
import { todayInSantoDomingo } from "../operators/domain/dates.js";

export type FetchJson = (url: string) => Promise<{ status: number; json(): Promise<any> }>;
const MAX_JSON_BYTES = 2_000_000;
const defaultFetch: FetchJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: traceHeaders({ accept: "application/json" }) });
  const text = await readBodyCapped(res, MAX_JSON_BYTES);
  return { status: res.status, json: async () => JSON.parse(text) };
};

export const FX_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "MXN"] as const;
export const WEATHER_LOCATIONS = [
  { slug: "santo-domingo", name: "Santo Domingo", lat: 18.4861, lng: -69.9312 }, { slug: "santiago", name: "Santiago", lat: 19.4517, lng: -70.697 },
  { slug: "punta-cana", name: "Punta Cana", lat: 18.582, lng: -68.4055 }, { slug: "puerto-plata", name: "Puerto Plata", lat: 19.7934, lng: -70.6884 },
  { slug: "la-romana", name: "La Romana", lat: 18.4273, lng: -68.9728 }, { slug: "samana", name: "Samaná", lat: 19.2058, lng: -69.3364 },
  { slug: "jarabacoa", name: "Jarabacoa", lat: 19.1167, lng: -70.6367 }, { slug: "barahona", name: "Barahona", lat: 18.2085, lng: -71.1008 },
] as const;
export const TIME_ZONES = [
  { id: "America/Santo_Domingo", label: "República Dominicana", utc_offset: "-04:00", dst: false },
  { id: "America/New_York", label: "Nueva York / Miami", utc_offset: "-05:00 / -04:00 (verano)", dst: true },
  { id: "America/Bogota", label: "Bogotá", utc_offset: "-05:00", dst: false }, { id: "America/Mexico_City", label: "Ciudad de México", utc_offset: "-06:00", dst: false },
  { id: "America/Sao_Paulo", label: "São Paulo", utc_offset: "-03:00", dst: false }, { id: "Europe/Madrid", label: "Madrid", utc_offset: "+01:00 / +02:00 (verano)", dst: true },
  { id: "Europe/London", label: "Londres", utc_offset: "+00:00 / +01:00 (verano)", dst: true }, { id: "Europe/Paris", label: "París / Berlín / Roma", utc_offset: "+01:00 / +02:00 (verano)", dst: true },
] as const;

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Datos vivos (docs §5.5): tasas, combustibles, loterías, clima y utilidades. Los proveedores externos se apagan con `*_PROVIDER=none`. */
export class LiveService {
  /** Cinco ciclos consecutivos fallidos abren el circuito del proveedor 5 minutos; cada proveedor tiene el suyo. */
  private readonly fxBreaker = new CircuitBreaker(5, 300_000);
  private readonly weatherBreaker = new CircuitBreaker(5, 300_000);
  constructor(private readonly db: Db, private readonly env: Env, private readonly log: FastifyBaseLogger, public fetchJson: FetchJson = defaultFetch) {}

  // ---------- Tasas de cambio ----------
  async latestRates(): Promise<{ date: string | null; rates: { currency: string; buy: number; sell: number; mid: number }[] }> {
    const { rows } = await this.db.query<{ currency_code: string; buy_rate: string; sell_rate: string; rate_date: string }>(
      "SELECT DISTINCT ON (currency_code) currency_code, buy_rate, sell_rate, rate_date::text AS rate_date FROM exchange_rates ORDER BY currency_code, rate_date DESC",
    );
    const date = rows.map((r) => r.rate_date).sort().at(-1) ?? null;
    return { date, rates: rows.map((r) => ({ currency: r.currency_code, buy: Number(r.buy_rate), sell: Number(r.sell_rate), mid: round((Number(r.buy_rate) + Number(r.sell_rate)) / 2, 4) })).sort((a, b) => a.currency.localeCompare(b.currency)) };
  }

  async rateHistory(currency: string, days: number) {
    const { rows } = await this.db.query("SELECT rate_date::text AS date, buy_rate, sell_rate FROM exchange_rates WHERE currency_code = $1 AND rate_date >= current_date - $2::int ORDER BY rate_date", [currency, days]);
    return rows.map((r) => ({ date: r.date, buy: Number(r.buy_rate), sell: Number(r.sell_rate), mid: round((Number(r.buy_rate) + Number(r.sell_rate)) / 2, 4) }));
  }

  /** Convierte entre DOP y las monedas con tasa vigente (pasando por DOP) usando el punto medio compra/venta. */
  async convert(amount: number, from: string, to: string) {
    const { date, rates } = await this.latestRates();
    const dop = (c: string) => {
      if (c === "DOP") return 1;
      const r = rates.find((x) => x.currency === c);
      if (r) return r.mid;
      if (c === "USD") return this.env.DEFAULT_USD_DOP; // sin tasas cargadas, sólo el dólar tiene un valor de respaldo
      throw new AppError("BUSINESS_RULE", `No hay tasa vigente para ${c}`, { code: "NO_RATE", currency: c });
    };
    const fromRate = dop(from), toRate = dop(to);
    return { amount, from, to, result: round((amount * fromRate) / toRate), rate: round(fromRate / toRate, 6), rate_date: date, fallback: !rates.length };
  }

  /** Actualiza las tasas desde el proveedor configurado (mitad del mercado ± margen de compra/venta). */
  async refreshRates() {
    if (this.env.FX_PROVIDER === "none") return { skipped: true as const, reason: "FX_PROVIDER=none" };
    return this.fxBreaker.execute(async () => {
      const res = await this.fetchJson("https://open.er-api.com/v6/latest/USD");
      if (res.status !== 200) throw new Error(`El proveedor de tasas respondió ${res.status}`);
      const body = await res.json();
      const r = body?.rates as Record<string, number> | undefined;
      if (body?.result !== "success" || !r?.DOP || r.DOP < 20 || r.DOP > 200) throw new Error("Respuesta del proveedor de tasas inválida");
      const today = todayInSantoDomingo(), spread = this.env.FX_SPREAD_PCT / 100;
      let saved = 0;
      for (const c of FX_CURRENCIES) {
        const perUnit = c === "USD" ? r.DOP : r[c] ? r.DOP / r[c]! : null; // DOP por 1 unidad de la moneda
        if (!perUnit || !Number.isFinite(perUnit)) continue;
        await this.db.query(
          "INSERT INTO exchange_rates (rate_date, currency_code, buy_rate, sell_rate) VALUES ($1,$2,$3,$4) ON CONFLICT (rate_date, currency_code) DO UPDATE SET buy_rate = EXCLUDED.buy_rate, sell_rate = EXCLUDED.sell_rate",
          [today, c, round(perUnit * (1 - spread), 4), round(perUnit * (1 + spread), 4)],
        );
        saved++;
      }
      return { skipped: false as const, saved, date: today };
    }, new Error("El proveedor de tasas está en circuito abierto; se reintenta más tarde"));
  }

  // ---------- Combustibles ----------
  async fuel() {
    const { rows } = await this.db.query("SELECT effective_date::text AS date, gasolina_premium, gasolina_regular, gasoil_optimo, gasoil_regular, glp, gnv FROM fuel_prices ORDER BY effective_date DESC LIMIT 2");
    const [cur, prev] = rows;
    if (!cur) return { effective_date: null, prices: [] };
    const labels: Record<string, string> = { gasolina_premium: "Gasolina premium", gasolina_regular: "Gasolina regular", gasoil_optimo: "Gasoil óptimo", gasoil_regular: "Gasoil regular", glp: "GLP", gnv: "GNV" };
    return { effective_date: cur.date, previous_date: prev?.date ?? null, prices: Object.keys(labels).map((k) => ({ product: k, label: labels[k], price: Number(cur[k]), previous: prev ? Number(prev[k]) : null, change: prev ? round(Number(cur[k]) - Number(prev[k])) : null })) };
  }

  // ---------- Loterías ----------
  async lotteries() {
    const { rows } = await this.db.query(
      `SELECT l.id, l.name, l.country, l.logo_url, d.id AS draw_id, d.name AS draw_name, d.draw_days, d.draw_time::text AS draw_time, d.number_of_balls, d.ball_range_min, d.ball_range_max, d.has_bonus,
              lr.draw_date::text AS last_date, lr.winning_numbers AS last_numbers, lr.bonus_number AS last_bonus, lr.jackpot_amount AS last_jackpot
         FROM lotteries l LEFT JOIN lottery_draws d ON d.lottery_id = l.id AND d.is_active
         LEFT JOIN LATERAL (SELECT * FROM lottery_results r WHERE r.draw_id = d.id AND r.is_active ORDER BY r.draw_date DESC LIMIT 1) lr ON true
        WHERE l.is_active ORDER BY l.name, d.draw_time`,
    );
    const map = new Map<string, any>();
    for (const r of rows) {
      const l = map.get(r.id) ?? { id: r.id, name: r.name, country: r.country, logo_url: r.logo_url, draws: [] };
      if (r.draw_id) l.draws.push({ id: r.draw_id, name: r.draw_name, days: r.draw_days, time: r.draw_time, balls: r.number_of_balls, range: [r.ball_range_min, r.ball_range_max], has_bonus: r.has_bonus, last_result: r.last_date ? { date: r.last_date, numbers: r.last_numbers, bonus: r.last_bonus, jackpot: r.last_jackpot } : null });
      map.set(r.id, l);
    }
    return [...map.values()];
  }

  async lottery(id: string) {
    const all = await this.lotteries();
    const l = all.find((x) => x.id === id);
    if (!l) throw AppError.notFound("Lotería");
    const results = (await this.db.query("SELECT r.id, r.draw_id, d.name AS draw_name, r.draw_date::text AS date, r.winning_numbers AS numbers, r.bonus_number AS bonus, r.jackpot_amount AS jackpot FROM lottery_results r JOIN lottery_draws d ON d.id = r.draw_id WHERE d.lottery_id = $1 AND r.is_active ORDER BY r.draw_date DESC, d.draw_time DESC LIMIT 30", [id])).rows;
    return { ...l, results };
  }

  async lotteryResults(f: { game?: string; from?: string; to?: string; limit: number }) {
    const params: unknown[] = [], where = ["r.is_active", "d.is_active"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.game) { const ph = bind(f.game); where.push(`(d.lottery_id = ${ph}::uuid OR d.id = ${ph}::uuid)`); }
    if (f.from) where.push(`r.draw_date >= ${bind(f.from)}::date`);
    if (f.to) where.push(`r.draw_date <= ${bind(f.to)}::date`);
    return (await this.db.query(`SELECT r.id, l.name AS lottery, d.name AS draw, r.draw_date::text AS date, r.winning_numbers AS numbers, r.bonus_number AS bonus, r.jackpot_amount AS jackpot FROM lottery_results r JOIN lottery_draws d ON d.id = r.draw_id JOIN lotteries l ON l.id = d.lottery_id WHERE ${where.join(" AND ")} ORDER BY r.draw_date DESC, d.draw_time DESC LIMIT ${f.limit}`, params)).rows;
  }

  // ---------- Clima ----------
  async weather(slug?: string) {
    const { rows } = await this.db.query("SELECT location_slug, location_name, temperature_c, feels_like_c, humidity, wind_kmh, condition, icon, source, observed_at FROM weather_snapshots WHERE ($1::text IS NULL OR location_slug = $1) ORDER BY location_name", [slug ?? null]);
    if (slug && !rows.length) throw AppError.notFound("Ubicación");
    const data = rows.map((r) => ({ location: r.location_slug, name: r.location_name, temperature_c: num(r.temperature_c), feels_like_c: num(r.feels_like_c), humidity: r.humidity, wind_kmh: num(r.wind_kmh), condition: r.condition, icon: r.icon, source: r.source, observed_at: new Date(r.observed_at).toISOString(), stale: Date.now() - new Date(r.observed_at).getTime() > 3 * 3_600_000 }));
    return slug ? data[0]! : data;
  }
  async forecast(slug: string, days: number) {
    const r = (await this.db.query<{ location_name: string; forecast: unknown[]; observed_at: Date }>("SELECT location_name, forecast, observed_at FROM weather_snapshots WHERE location_slug = $1", [slug])).rows[0];
    if (!r) throw AppError.notFound("Ubicación");
    return { location: slug, name: r.location_name, days: (r.forecast ?? []).slice(0, days), updated_at: new Date(r.observed_at).toISOString() };
  }

  /** Clima y pronóstico de las ciudades principales desde OpenWeather (5 días, agregado por día). */
  async refreshWeather() {
    if (this.env.WEATHER_PROVIDER === "none") return { skipped: true as const, reason: "WEATHER_PROVIDER=none" };
    // Un fallo por ciclo (no por llamada): un fallo parcial que salva alguna ciudad no cuenta contra el circuito.
    return this.weatherBreaker.execute(async () => {
      const key = this.env.OPENWEATHER_API_KEY!;
      let saved = 0;
      const errors: string[] = [];
      for (const loc of WEATHER_LOCATIONS) {
        try {
          const q = `lat=${loc.lat}&lon=${loc.lng}&units=metric&lang=es&appid=${encodeURIComponent(key)}`;
          const [now, fc] = await Promise.all([this.fetchJson(`https://api.openweathermap.org/data/2.5/weather?${q}`), this.fetchJson(`https://api.openweathermap.org/data/2.5/forecast?${q}`)]);
          if (now.status !== 200) throw new Error(`clima ${now.status}`);
          const w = await now.json();
          const days = new Map<string, { min: number; max: number; pop: number; cond: string[] }>();
          if (fc.status === 200) for (const it of (await fc.json()).list ?? []) {
            const date = String(it.dt_txt ?? "").slice(0, 10);
            if (!date) continue;
            const d = days.get(date) ?? { min: 99, max: -99, pop: 0, cond: [] };
            d.min = Math.min(d.min, it.main?.temp_min ?? it.main?.temp); d.max = Math.max(d.max, it.main?.temp_max ?? it.main?.temp); d.pop = Math.max(d.pop, it.pop ?? 0); d.cond.push(it.weather?.[0]?.description ?? "");
            days.set(date, d);
          }
          const forecast = [...days.entries()].map(([date, d]) => ({ date, min_c: round(d.min, 1), max_c: round(d.max, 1), rain_probability: Math.round(d.pop * 100), condition: d.cond[Math.floor(d.cond.length / 2)] || d.cond[0] || "" }));
          await this.db.query(
            `INSERT INTO weather_snapshots (location_slug, location_name, temperature_c, feels_like_c, humidity, wind_kmh, condition, icon, forecast, source, observed_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'openweather',now(),now())
             ON CONFLICT (location_slug) DO UPDATE SET temperature_c = EXCLUDED.temperature_c, feels_like_c = EXCLUDED.feels_like_c, humidity = EXCLUDED.humidity, wind_kmh = EXCLUDED.wind_kmh, condition = EXCLUDED.condition, icon = EXCLUDED.icon, forecast = EXCLUDED.forecast, source = 'openweather', observed_at = now(), updated_at = now()`,
            [loc.slug, loc.name, round(w.main.temp, 1), round(w.main.feels_like, 1), w.main.humidity, round((w.wind?.speed ?? 0) * 3.6, 1), w.weather?.[0]?.description ?? "", w.weather?.[0]?.icon ?? null, JSON.stringify(forecast)],
          );
          saved++;
        } catch (err) { errors.push(`${loc.slug}: ${(err as Error).message}`); this.log.warn({ err, location: loc.slug }, "No se pudo actualizar el clima de una ubicación"); }
      }
      if (!saved) throw new Error(`No se pudo actualizar el clima: ${errors.join("; ")}`);
      return { skipped: false as const, saved, errors };
    }, new Error("El proveedor de clima está en circuito abierto; se reintenta más tarde"));
  }

  // ---------- Playas, alertas, eventos, webcams ----------
  async alerts() {
    return (await this.db.query("SELECT id, alert_type AS type, severity, title, description, province_id, expires_at, created_at FROM weather_alerts WHERE is_active AND (expires_at IS NULL OR expires_at > now()) ORDER BY CASE severity WHEN 'extrema' THEN 0 WHEN 'grave' THEN 1 WHEN 'moderada' THEN 2 ELSE 3 END, created_at DESC LIMIT 100")).rows;
  }
  async beachStatus() {
    const reports = (await this.db.query("SELECT DISTINCT ON (location) id, location, wind_speed, wind_direction, wave_height, wave_period, water_temp, condition_rating, recommendation, created_at FROM marine_reports ORDER BY location, created_at DESC")).rows
      .map((r) => ({ ...r, wind_speed: num(r.wind_speed), wave_height: num(r.wave_height), water_temp: num(r.water_temp) }));
    const alerts = (await this.db.query("SELECT alert_type AS type, severity, title FROM weather_alerts WHERE is_active AND alert_type IN ('sargazo', 'oleaje_alto') AND (expires_at IS NULL OR expires_at > now())")).rows;
    return { reports, alerts };
  }
  async eventsNow() {
    const today = todayInSantoDomingo();
    return (await this.db.query(
      "SELECT id, title, slug, start_date, end_date, location, image_url FROM events WHERE status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) AND start_date <= $1::date AND coalesce(end_date, start_date) >= $1::date ORDER BY start_date LIMIT 50", [today],
    )).rows;
  }
}
