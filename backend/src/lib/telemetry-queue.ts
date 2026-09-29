import { Redis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    telemetryQueue: TelemetryQueue;
  }
}

/**
 * Cola opcional en Redis para eventos de alto volumen y sin efectos de negocio (Fase 9.1: analítica anónima). Si no hay
 * `REDIS_URL` configurado, `enabled` es `false` y quien llama debe insertar directo en PostgreSQL como hace hoy — así
 * funciona igual con una sola instancia y sin infraestructura extra, y el cambio es 100% compatible hacia atrás.
 *
 * Se usa una lista simple (LPUSH/RPOP) en vez de un stream con consumer groups porque sólo un proceso vacía cada cola
 * (el propio `JobRunner` ya garantiza que un trabajo programado no corre dos veces a la vez entre instancias).
 *
 * Sólo para telemetría que tolera perderse o llegar unos segundos tarde. Escrituras con efecto de negocio (p. ej. contadores
 * de presupuesto de `sponsorship_events`) siguen síncronas a propósito: encolarlas cambiaría cuándo se confirma el gasto.
 */
export class TelemetryQueue {
  private readonly redis: Redis | null;

  constructor(url: string | undefined, private readonly log: FastifyBaseLogger) {
    if (!url) { this.redis = null; return; }
    this.redis = new Redis(url, { connectTimeout: 500, maxRetriesPerRequest: 1 });
    this.redis.on("error", (err) => this.log.warn({ err: err.message }, "Redis (cola de telemetría) no disponible"));
  }

  get enabled() { return this.redis !== null; }

  /** Encola un evento (lo serializa a JSON). Devuelve `false` si no hay Redis o si falló: el llamador debe insertar directo como respaldo. */
  async push(stream: string, event: unknown): Promise<boolean> {
    if (!this.redis) return false;
    try {
      await this.redis.lpush(`telemetry:${stream}`, JSON.stringify(event));
      return true;
    } catch (err) {
      this.log.warn({ err }, "No se pudo encolar telemetría; se insertará directo");
      return false;
    }
  }

  /** Saca hasta `max` eventos ya encolados (los más antiguos primero) para insertarlos en lote. Vacío si no hay Redis o si está vacía. */
  async drain(stream: string, max = 500): Promise<unknown[]> {
    if (!this.redis) return [];
    try {
      const raw = await this.redis.rpop(`telemetry:${stream}`, max);
      if (!raw) return [];
      const list = Array.isArray(raw) ? raw : [raw];
      return list.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter((v) => v !== null);
    } catch (err) {
      this.log.warn({ err }, "No se pudo vaciar la cola de telemetría");
      return [];
    }
  }

  async close() { await this.redis?.quit().catch(() => undefined); }
}
