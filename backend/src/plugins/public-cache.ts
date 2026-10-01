import type { FastifyInstance } from "fastify";
import { TtlCache } from "../lib/cache.js";

const TTL = 30_000;
const MAX = 500;

/** Superficies públicas cacheadas en memoria; sus claves ya incluyen los filtros que cambian la respuesta (B7.65). */
export interface PublicCaches {
  search: TtlCache<{ data: unknown[]; collections: number }>;
  suggest: TtlCache<unknown[]>;
  popular: TtlCache<string[]>;
  home: TtlCache<{ key: string; title: string; items: unknown[] }[]>;
  mapLayers: TtlCache<{ id: string; type: string; label: string; group: string; count: number }[]>;
  facets: TtlCache<{ data: Record<string, { value: string; count: number }[]>; total: number }>;
}

declare module "fastify" {
  interface FastifyInstance {
    publicCache: PublicCaches;
    /** Vacía toda la caché de contenido público; la invocan las mutaciones del CMS y del panel (B7.64). */
    invalidatePublicContent(): void;
  }
}

/** Cachés por instancia de app (no globales: cada buildApp() empieza fría y las pruebas no se contaminan entre sí). */
export function registerPublicCache(app: FastifyInstance) {
  app.decorate("publicCache", {
    search: new TtlCache<{ data: unknown[]; collections: number }>(TTL, MAX),
    suggest: new TtlCache<unknown[]>(TTL, MAX),
    popular: new TtlCache<string[]>(TTL, MAX),
    home: new TtlCache<{ key: string; title: string; items: unknown[] }[]>(TTL, MAX),
    mapLayers: new TtlCache<{ id: string; type: string; label: string; group: string; count: number }[]>(TTL, MAX),
    facets: new TtlCache<{ data: Record<string, { value: string; count: number }[]>; total: number }>(TTL, MAX),
  });
  app.decorate("invalidatePublicContent", () => {
    for (const c of Object.values(app.publicCache)) c.clear();
  });
}
