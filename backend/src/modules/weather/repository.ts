import type { Pool } from "pg";
import { AppError } from "../../lib/errors.js";

export type WeatherSnapshotRow = {
  [column: string]: unknown;
  location_slug: string;
  location_name: string;
  temperature_c: unknown;
  feels_like_c: unknown;
  humidity: number | null;
  wind_kmh: unknown;
  condition: string;
  icon: string | null;
  source: string;
  observed_at: Date | string;
  forecast?: unknown[];
};

export type WeatherSnapshotAdminInput = {
  location_slug?: string;
  location_name?: string;
  temperature_c?: number;
  feels_like_c?: number | null;
  humidity?: number | null;
  wind_kmh?: number | null;
  condition?: string;
  icon?: string | null;
  forecast?: unknown;
  source?: string;
  observed_at?: string;
};

/** Persistencia requerida por el dominio weather; independiente de Fastify y su pool global. */
export interface WeatherRepository {
  withRefreshLock<T>(run: () => Promise<T>): Promise<{ acquired: true; result: T } | { acquired: false }>;
  list(slug?: string): Promise<WeatherSnapshotRow[]>;
  forecast(slug: string): Promise<WeatherSnapshotRow | undefined>;
  save(snapshot: {
    location_slug: string;
    location_name: string;
    temperature_c: number;
    feels_like_c: number;
    humidity: number;
    wind_kmh: number;
    condition: string;
    icon: string | null;
    forecast: string;
  }): Promise<void>;
  adminList(page: number, perPage: number): Promise<{ rows: Record<string, unknown>[]; total: number }>;
  adminCreate(input: WeatherSnapshotAdminInput): Promise<Record<string, unknown>>;
  adminUpdate(id: string, input: WeatherSnapshotAdminInput): Promise<Record<string, unknown> | undefined>;
  adminDelete(id: string): Promise<boolean>;
}

const ADMIN_FIELDS = new Set([
  "location_slug", "location_name", "temperature_c", "feels_like_c", "humidity", "wind_kmh",
  "condition", "icon", "forecast", "source", "observed_at",
]);

function fieldValues(input: WeatherSnapshotAdminInput) {
  const keys = Object.keys(input).filter((key) => input[key as keyof WeatherSnapshotAdminInput] !== undefined);
  if (keys.some((key) => !ADMIN_FIELDS.has(key))) throw AppError.validation("Campo meteorológico no permitido");
  return { keys, values: keys.map((key) => key === "forecast" ? JSON.stringify(input.forecast ?? null) : input[key as keyof WeatherSnapshotAdminInput]) };
}

function rethrowWeatherWriteError(error: unknown): never {
  const pgError = error as { code?: string; column?: string; constraint?: string };
  if (pgError.code === "23502") throw AppError.validation(`Falta el campo "${pgError.column}"`, { field: pgError.column });
  if (pgError.code === "23505") throw new AppError("CONFLICT", "Ya existe un registro meteorológico con ese valor único", { constraint: pgError.constraint });
  if (pgError.code === "23503") throw new AppError("CONFLICT", "El snapshot está siendo usado por otro registro", { constraint: pgError.constraint });
  if (pgError.code === "23514" || pgError.code === "22P02") throw AppError.validation("Un valor no cumple las reglas de weather_snapshots", { constraint: pgError.constraint });
  throw error;
}

/** Adaptador temporal al PostgreSQL compartido; reemplazable por la conexión propietaria de weather. */
export class PostgresWeatherRepository implements WeatherRepository {
  constructor(private readonly db: Pool) {}

  async withRefreshLock<T>(run: () => Promise<T>) {
    const client = await this.db.connect();
    let acquired = false;
    try {
      const { rows } = await client.query<{ acquired: boolean }>("SELECT pg_try_advisory_lock($1) AS acquired", [7_271_003]);
      acquired = rows[0]?.acquired === true;
      if (!acquired) return { acquired: false as const };
      return { acquired: true as const, result: await run() };
    } finally {
      if (acquired) await client.query("SELECT pg_advisory_unlock($1)", [7_271_003]).catch(() => undefined);
      client.release();
    }
  }

  async list(slug?: string) {
    const { rows } = await this.db.query<WeatherSnapshotRow>(
      "SELECT location_slug, location_name, temperature_c, feels_like_c, humidity, wind_kmh, condition, icon, source, observed_at FROM weather_snapshots WHERE ($1::text IS NULL OR location_slug = $1) ORDER BY location_name",
      [slug ?? null],
    );
    return rows;
  }

  async forecast(slug: string) {
    const { rows } = await this.db.query<WeatherSnapshotRow>(
      "SELECT location_slug, location_name, forecast, observed_at FROM weather_snapshots WHERE location_slug = $1",
      [slug],
    );
    return rows[0];
  }

  async save(snapshot: Parameters<WeatherRepository["save"]>[0]) {
    await this.db.query(
      `INSERT INTO weather_snapshots (location_slug, location_name, temperature_c, feels_like_c, humidity, wind_kmh, condition, icon, forecast, source, observed_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'openweather',now(),now())
       ON CONFLICT (location_slug) DO UPDATE SET temperature_c = EXCLUDED.temperature_c, feels_like_c = EXCLUDED.feels_like_c, humidity = EXCLUDED.humidity, wind_kmh = EXCLUDED.wind_kmh, condition = EXCLUDED.condition, icon = EXCLUDED.icon, forecast = EXCLUDED.forecast, source = 'openweather', observed_at = now(), updated_at = now()`,
      [snapshot.location_slug, snapshot.location_name, snapshot.temperature_c, snapshot.feels_like_c, snapshot.humidity, snapshot.wind_kmh, snapshot.condition, snapshot.icon, snapshot.forecast],
    );
  }

  async adminList(page: number, perPage: number) {
    const total = Number((await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM weather_snapshots")).rows[0]!.n);
    const { rows } = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM weather_snapshots ORDER BY location_name LIMIT $1 OFFSET $2",
      [perPage, (page - 1) * perPage],
    );
    return { rows, total };
  }

  async adminCreate(input: WeatherSnapshotAdminInput) {
    const { keys, values } = fieldValues(input);
    if (!keys.length) throw AppError.validation("Envía al menos un campo");
    try {
      const columns = keys.map((key) => `"${key}"`).join(", ");
      const placeholders = keys.map((key, index) => key === "forecast" ? `$${index + 1}::jsonb` : `$${index + 1}`).join(", ");
      const { rows } = await this.db.query<Record<string, unknown>>(
        `INSERT INTO weather_snapshots (${columns}) VALUES (${placeholders}) RETURNING *`, values,
      );
      return rows[0]!;
    } catch (error) { rethrowWeatherWriteError(error); }
  }

  async adminUpdate(id: string, input: WeatherSnapshotAdminInput) {
    const { keys, values } = fieldValues(input);
    if (!keys.length) throw AppError.validation("No hay cambios que guardar");
    const assignments = keys.map((key, index) => `"${key}" = $${index + 2}${key === "forecast" ? `::jsonb` : ""}`).join(", ");
    try {
      const { rows } = await this.db.query<Record<string, unknown>>(
        `UPDATE weather_snapshots SET ${assignments}, updated_at = now() WHERE id = $1::uuid RETURNING *`,
        [id, ...values],
      );
      return rows[0];
    } catch (error) { rethrowWeatherWriteError(error); }
  }

  async adminDelete(id: string) {
    try {
      const { rowCount } = await this.db.query("DELETE FROM weather_snapshots WHERE id = $1::uuid", [id]);
      return (rowCount ?? 0) > 0;
    } catch (error) { rethrowWeatherWriteError(error); }
  }
}
