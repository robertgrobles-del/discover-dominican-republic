import type { FastifyRequest } from "fastify";
import type { Db } from "../db/pool.js";
import { AppError } from "./errors.js";
import { TtlCache } from "./cache.js";

/**
 * Banderas de funciones (docs §5.17): se encienden o apagan desde el panel sin desplegar. Una bandera desconocida cuenta como encendida
 * (así, un error de la base nunca apaga el sitio) y el estado se guarda 10 s por proceso.
 */
export class FlagService {
  private readonly cache = new TtlCache<Map<string, boolean>>(10_000, 1);
  constructor(private readonly db: Db) {}

  private all() {
    return this.cache.wrap("all", async () => new Map((await this.db.query<{ key: string; enabled: boolean }>("SELECT key, enabled FROM feature_flags")).rows.map((r) => [r.key, r.enabled])));
  }
  async enabled(key: string): Promise<boolean> {
    try { return (await this.all()).get(key) ?? true; } catch { return true; }
  }
  clear() { this.cache.clear(); }

  /** Hook `onRequest` que responde 503 mientras la bandera esté apagada. */
  gate(key: string, message: string) {
    return async (_req: FastifyRequest) => {
      if (!(await this.enabled(key))) throw new AppError("SERVICE_UNAVAILABLE", message, { code: "FEATURE_DISABLED", flag: key });
    };
  }
}
