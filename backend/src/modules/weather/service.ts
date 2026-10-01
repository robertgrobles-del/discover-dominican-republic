import type { FastifyBaseLogger } from "fastify";
import { AppError } from "../../lib/errors.js";
import { CircuitBreaker } from "../../lib/breaker.js";
import { defaultFetchJson, type FetchJson } from "../../lib/fetch-json.js";
import type { WeatherRepository, WeatherSnapshotAdminInput } from "./repository.js";

declare module "fastify" { interface FastifyInstance { weather: WeatherService } }

export const WEATHER_LOCATIONS = [
  { slug: "santo-domingo", name: "Santo Domingo", lat: 18.4861, lng: -69.9312 }, { slug: "santiago", name: "Santiago", lat: 19.4517, lng: -70.697 },
  { slug: "punta-cana", name: "Punta Cana", lat: 18.582, lng: -68.4055 }, { slug: "puerto-plata", name: "Puerto Plata", lat: 19.7934, lng: -70.6884 },
  { slug: "la-romana", name: "La Romana", lat: 18.4273, lng: -68.9728 }, { slug: "samana", name: "Samaná", lat: 19.2058, lng: -69.3364 },
  { slug: "jarabacoa", name: "Jarabacoa", lat: 19.1167, lng: -70.6367 }, { slug: "barahona", name: "Barahona", lat: 18.2085, lng: -71.1008 },
] as const;

type WeatherRuntimeConfig = { WEATHER_PROVIDER: "none" | "openweather"; OPENWEATHER_API_KEY?: string };

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

/** Lógica del subdominio meteorológico; el almacenamiento será propiedad del servicio `weather`. */
export class WeatherService {
  readonly locations = WEATHER_LOCATIONS;
  private readonly breaker = new CircuitBreaker(5, 300_000);

  constructor(private readonly repository: WeatherRepository, private readonly env: WeatherRuntimeConfig, private readonly log: FastifyBaseLogger, public fetchJson: FetchJson = defaultFetchJson) {}

  async weather(slug?: string) {
    const rows = await this.repository.list(slug);
    if (slug && !rows.length) throw AppError.notFound("Ubicación");
    const data = rows.map((r) => ({ location: r.location_slug, name: r.location_name, temperature_c: num(r.temperature_c), feels_like_c: num(r.feels_like_c), humidity: r.humidity, wind_kmh: num(r.wind_kmh), condition: r.condition, icon: r.icon, source: r.source, observed_at: new Date(r.observed_at).toISOString(), stale: Date.now() - new Date(r.observed_at).getTime() > 3 * 3_600_000 }));
    return slug ? data[0]! : data;
  }

  async forecast(slug: string, days: number) {
    const row = await this.repository.forecast(slug);
    if (!row) throw AppError.notFound("Ubicación");
    return { location: slug, name: row.location_name, days: (row.forecast ?? []).slice(0, days), updated_at: new Date(row.observed_at).toISOString() };
  }

  adminList(page: number, perPage: number) { return this.repository.adminList(page, perPage); }
  adminCreate(input: WeatherSnapshotAdminInput) { return this.repository.adminCreate(input); }
  adminUpdate(id: string, input: WeatherSnapshotAdminInput) { return this.repository.adminUpdate(id, input); }
  adminDelete(id: string) { return this.repository.adminDelete(id); }

  /** Actualiza clima y pronóstico de ciudades principales desde OpenWeather. */
  async refreshWeather() {
    if (this.env.WEATHER_PROVIDER === "none") return { skipped: true as const, reason: "WEATHER_PROVIDER=none" };
    const outcome = await this.repository.withRefreshLock(() => this.breaker.execute(async () => {
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
          await this.repository.save({
            location_slug: loc.slug,
            location_name: loc.name,
            temperature_c: round(w.main.temp, 1),
            feels_like_c: round(w.main.feels_like, 1),
            humidity: w.main.humidity,
            wind_kmh: round((w.wind?.speed ?? 0) * 3.6, 1),
            condition: w.weather?.[0]?.description ?? "",
            icon: w.weather?.[0]?.icon ?? null,
            forecast: JSON.stringify(forecast),
          });
          saved++;
        } catch (err) { errors.push(`${loc.slug}: ${(err as Error).message}`); this.log.warn({ err, location: loc.slug }, "No se pudo actualizar el clima de una ubicación"); }
      }
      if (!saved) throw new Error(`No se pudo actualizar el clima: ${errors.join("; ")}`);
      return { skipped: false as const, saved, errors };
    }, new Error("El proveedor de clima está en circuito abierto; se reintenta más tarde")));
    return outcome.acquired ? outcome.result : { skipped: true as const, reason: "refresh_already_running" };
  }
}
