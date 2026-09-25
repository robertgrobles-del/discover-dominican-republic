import type { Db } from "../db/pool.js";

type Cb = (err: Error | null, res?: { current: number; ttl: number }) => void;
interface RouteOptions { routeInfo?: { method?: string | string[]; url?: string } }

// Una sola sentencia atómica: incrementa dentro de la ventana o la reinicia si ya venció (sin condiciones de carrera entre instancias).
const INCR = `
  INSERT INTO rate_limits (key, count, expires_at) VALUES ($1, 1, now() + make_interval(secs => $2::float8 / 1000))
  ON CONFLICT (key) DO UPDATE SET
    count = CASE WHEN rate_limits.expires_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
    expires_at = CASE WHEN rate_limits.expires_at <= now() THEN now() + make_interval(secs => $2::float8 / 1000) ELSE rate_limits.expires_at END
  RETURNING count, GREATEST(0, (EXTRACT(EPOCH FROM (expires_at - now())) * 1000))::int AS ttl`;
const READ = `SELECT count, GREATEST(0, (EXTRACT(EPOCH FROM (expires_at - now())) * 1000))::int AS ttl FROM rate_limits WHERE key = $1 AND expires_at > now()`;

/**
 * Almacén de límites de tasa en PostgreSQL para `@fastify/rate-limit`: los contadores se comparten entre todas las
 * instancias de la API sin necesitar Redis. Cada ruta con límite propio usa su propio espacio de claves.
 */
export function createPostgresStore(db: Db) {
  return class PostgresRateLimitStore {
    constructor(_options: unknown, private readonly prefix = "") {}

    incr(key: string, cb: Cb, timeWindow: number) {
      db.query<{ count: number; ttl: number }>(INCR, [`${this.prefix}${key}`, timeWindow]).then(
        (r) => cb(null, { current: r.rows[0]!.count, ttl: r.rows[0]!.ttl }),
        (err: Error) => cb(err),
      );
    }

    /** Lectura sin modificar el contador (`{ increment: false }` del plugin). */
    read(key: string, cb: Cb) {
      db.query<{ count: number; ttl: number }>(READ, [`${this.prefix}${key}`]).then(
        (r) => cb(null, r.rows[0] ? { current: r.rows[0].count, ttl: r.rows[0].ttl } : { current: 0, ttl: 0 }),
        (err: Error) => cb(err),
      );
    }

    child(routeOptions: RouteOptions) {
      const { method, url } = routeOptions.routeInfo ?? {};
      return new PostgresRateLimitStore(routeOptions, `${Array.isArray(method) ? method.join(",") : method ?? ""}:${url ?? ""}|`);
    }
  };
}

/** Borra contadores vencidos; se ejecuta periódicamente para que la tabla no crezca. */
export const purgeRateLimits = (db: Db) => db.query("DELETE FROM rate_limits WHERE expires_at < now() - interval '1 minute'");
