import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { COLLECTIONS, type CollectionDef } from "../../contracts/content-collections.js";
import { contentColumns as cols, hasContentColumn as hasCol } from "../../contracts/content-schema.js";
import { todayInSantoDomingo } from "../../lib/dates.js";
import type { ContentReaderPort, PublicContentSearchHit } from "../../contracts/content-reader.js";
import type { FavoritesReaderPort } from "../../contracts/favorites.js";
import type { SearchAnalyticsPort } from "../../contracts/search-analytics.js";
import type { PublicSettingsReaderPort } from "../../contracts/site-settings.js";

const ok = z.object({ data: z.any() });
const SEARCHABLE = COLLECTIONS.filter((c) => cols(c.table)[c.title]);
const GEO = COLLECTIONS.filter((c) => c.geo && hasCol(c.table, c.geo.lat) && hasCol(c.table, c.geo.lng));
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
export interface DiscoverDeps {
  contentReader: ContentReaderPort;
  searchAnalytics: SearchAnalyticsPort;
  publicSettings: PublicSettingsReaderPort;
  favorites: FavoritesReaderPort;
}

/** Búsqueda global, mapa, "cerca de mí", geocodificación inversa y recomendaciones (docs §5.4). */
export async function discoverRoutes(app: FastifyInstance, { contentReader, searchAnalytics, publicSettings, favorites }: DiscoverDeps) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const typesParam = z.string().max(300).optional().describe("Tipos separados por coma (p. ej. beach,hotel)");
  const wanted = (types?: string) => {
    if (!types) return null;
    const set = new Set(types.split(",").map((t) => t.trim()).filter(Boolean));
    for (const t of set) if (!COLLECTIONS.some((c) => c.entityType === t || c.path === t)) throw AppError.validation(`Tipo desconocido: ${t}`);
    return set;
  };
  const pick = (defs: CollectionDef[], set: Set<string> | null) => (set ? defs.filter((d) => set.has(d.entityType) || set.has(d.path)) : defs);

  // ---------- Búsqueda ----------
  interface Hit { type: string; collection: string; id: string; slug: string | null; title: string; subtitle: string | null; image: string | null; score: number }
  const toHit = (x: PublicContentSearchHit): Hit => ({ type: x.type, collection: x.collection, id: x.id, slug: x.slug, title: x.title, subtitle: x.subtitle, image: x.image, score: Math.round(Number(x.score) * 100) / 100 });
  /**
   * Todas las colecciones en UNA consulta (UNION ALL) y una sola conexión del pool: antes eran ~40 consultas por búsqueda, y con
   * tráfico simultáneo agotaban el pool. Si alguna colección fallara, se recurre a consultar una por una y se omite la que falla.
   */
  const searchMany = async (defs: CollectionDef[], q: string, limit: number, titleOnly: boolean, log: FastifyRequest["log"]): Promise<Hit[]> => {
    if (!defs.length) return [];
    const result = await contentReader.searchPublicContent(defs.map((definition) => definition.path), q, limit, titleOnly);
    if (result.fallbackUsed) log.warn({ failedCollections: result.failedCollections }, "Falló la búsqueda unificada; se consultó colección por colección");
    for (const collection of result.failedCollections) log.warn({ collection }, "Falló la búsqueda en una colección");
    return result.hits.map(toHit);
  };
  // Respuestas iguales para todos: 30 s de caché por app y una sola consulta si llegan muchas idénticas a la vez
  // (las instancias viven en app.publicCache para que publicar las vacúe al instante).

  r.get("/search", {
    config: rl(120, "1 minute"),
    schema: { tags: ["búsqueda"], summary: "Búsqueda global multi-colección ordenada por relevancia (sin acentos ni mayúsculas, tolera errores leves)", querystring: z.object({ q: z.string().trim().min(2).max(80), types: typesParam, limit: z.coerce.number().int().min(1).max(50).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req, reply) => {
    const q = norm(req.query.q);
    const defs = pick(SEARCHABLE, wanted(req.query.types));
    const per = Math.min(req.query.limit, 10);
    const { data } = await app.publicCache.search.wrap(`${q}|${req.query.types ?? ""}|${req.query.limit}`, async () => {
      const all = await searchMany(defs, q, per, false, req.log);
      all.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      return { data: all.slice(0, req.query.limit), collections: defs.length };
    });
    // Se registra la consulta (sin datos personales) para las "búsquedas frecuentes".
    if (q.length >= 3) void searchAnalytics.recordSearch(q, data.length).catch(() => undefined);
    reply.header("cache-control", "public, max-age=30");
    return { data, meta: { q: req.query.q, total: data.length, collections: defs.length } };
  });

  r.get("/search/suggest", {
    config: rl(240, "1 minute"),
    schema: { tags: ["búsqueda"], summary: "Autocompletado por nombre (máx. 8)", querystring: z.object({ q: z.string().trim().min(2).max(60), types: typesParam }), response: { 200: ok } },
  }, async (req, reply) => {
    const q = norm(req.query.q);
    const defs = pick(SEARCHABLE, wanted(req.query.types));
    const data = await app.publicCache.suggest.wrap(`${q}|${req.query.types ?? ""}`, async () => {
      const hits = (await searchMany(defs, q, 4, true, req.log)).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      const seen = new Set<string>();
      return hits.filter((h) => { const k = `${h.type}:${norm(h.title)}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8).map((h) => ({ type: h.type, id: h.id, slug: h.slug, title: h.title, image: h.image }));
    });
    reply.header("cache-control", PUBLIC_CACHE);
    return { data };
  });

  r.get("/search/popular", { schema: { tags: ["búsqueda"], summary: "Búsquedas frecuentes de los últimos 7 días (o las sugeridas por el equipo)", response: { 200: ok } } }, async (_q, reply) => {
    const data = await app.publicCache.popular.wrap("popular", async () => {
      let d = await searchAnalytics.listPopularSearches(10);
      if (!d.length) {
        const value = await publicSettings.getPublicSetting("search.popular");
        d = Array.isArray(value) ? (value as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 10) : [];
      }
      return d;
    });
    reply.header("cache-control", PUBLIC_CACHE);
    return { data };
  });

  // ---------- Mapa ----------
  r.get("/map/layers", { schema: { tags: ["mapa"], summary: "Capas del mapa interactivo", response: { 200: ok } } }, async (_q, reply) => {
    const data = await app.publicCache.mapLayers.wrap("layers", () => contentReader.listPublicMapLayers(GEO.map((definition) => definition.path)));
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: data.filter((l) => l.count > 0) };
  });

  r.get("/map/features", {
    config: rl(120, "1 minute"),
    schema: { tags: ["mapa"], summary: "GeoJSON de una o varias capas dentro de un rectángulo (bbox=minLng,minLat,maxLng,maxLat)", querystring: z.object({ layer: z.string().min(2).max(300), bbox: z.string().regex(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/).optional(), limit: z.coerce.number().int().min(1).max(1000).default(500) }) },
  }, async (req, reply) => {
    const layers = req.query.layer.split(",").map((l) => l.trim());
    const defs = layers.map((l) => { const d = GEO.find((g) => g.path === l || g.entityType === l); if (!d) throw AppError.validation(`Capa desconocida: ${l}`); return d; });
    const bbox = req.query.bbox?.split(",").map(Number) as [number, number, number, number] | undefined;
    if (bbox && (bbox[0] >= bbox[2] || bbox[1] >= bbox[3] || Math.abs(bbox[1]) > 90 || Math.abs(bbox[3]) > 90 || Math.abs(bbox[0]) > 180 || Math.abs(bbox[2]) > 180)) throw AppError.validation("bbox inválido");
    const rows = await contentReader.listPublicMapFeatures(defs.map((definition) => definition.path), bbox, req.query.limit);
    const features = rows.map((x) => {
      const definition = defs.find((candidate) => candidate.path === x.collection);
      return { type: "Feature", geometry: { type: "Point", coordinates: [x.lng, x.lat] }, properties: { id: x.id, type: definition!.entityType, layer: x.collection, slug: x.slug, name: x.name, image: x.image, rating: x.rating } };
    });
    reply.header("cache-control", "public, max-age=60").header("content-type", "application/geo+json; charset=utf-8");
    return JSON.stringify({ type: "FeatureCollection", features: features.slice(0, req.query.limit) });
  });

  // ---------- Cerca de mí y geocodificación inversa ----------
  r.get("/geo/nearby", {
    config: rl(120, "1 minute"),
    schema: { tags: ["mapa"], summary: "Lugares cercanos de varias colecciones, del más cercano al más lejano", querystring: z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180), radius: z.coerce.number().int().min(100).max(200_000).default(10_000), types: typesParam, limit: z.coerce.number().int().min(1).max(60).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req, reply) => {
    const { lat, lng, radius, limit } = req.query;
    const set = wanted(req.query.types);
    const defs = set ? pick(GEO, set) : GEO.filter((d) => d.nearbyDefault);
    const found = await contentReader.findNearbyPublicPlaces(defs.map((definition) => definition.path), lat, lng, radius, limit);
    reply.header("cache-control", "public, max-age=60");
    return { data: found, meta: { center: { lat, lng }, radius_m: radius, total: found.length } };
  });

  r.get("/geo/reverse", {
    config: rl(120, "1 minute"),
    schema: { tags: ["mapa"], summary: "Provincia, municipio y destino más cercanos a una coordenada (hasta 60 km)", querystring: z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }), response: { 200: ok } },
  }, async (req, reply) => {
    const { lat, lng } = req.query;
    reply.header("cache-control", "public, max-age=300");
    return { data: await contentReader.reverseGeocode(lat, lng) };
  });

  // ---------- Recomendaciones de portada ----------
  r.get("/recommendations/home", {
    onRequest: optionalUser,
    schema: { tags: ["búsqueda"], summary: "Secciones de la portada (personalizadas si hay sesión)", security: [{}, { bearerAuth: [] }], querystring: z.object({ limit: z.coerce.number().int().min(1).max(20).default(8) }), response: { 200: ok } },
  }, async (req, reply) => {
    const limit = req.query.limit;
    const buildSections = async () => {
      const top = async (d: CollectionDef, opts: { excludeIds?: string[]; upcomingFrom?: string } = {}) => {
        const rows = await contentReader.listPublicSectionItems(d.path, limit, opts);
        return rows.map((x) => ({ type: d.entityType, collection: d.path, id: x.id, slug: x.slug, title: x.title, subtitle: x.subtitle, image: x.image, rating: x.rating }));
      };
      const by = (path: string) => COLLECTIONS.find((c) => c.path === path);
      const sections: { key: string; title: string; items: unknown[] }[] = [];
      const add = async (key: string, title: string, path: string, opts?: Parameters<typeof top>[1]) => { const d = by(path); if (d) { const items = await top(d, opts); if (items.length) sections.push({ key, title, items }); } };

      if (req.user) {
        // Personalización: lo del mismo destino que sus favoritos y de los tipos que más guarda, sin repetir lo que ya marcó.
        const favs = await favorites.listRecentFavorites(req.user.id, 50);
        const typeCount = new Map<string, number>();
        for (const f of favs) typeCount.set(f.entity_type, (typeCount.get(f.entity_type) ?? 0) + 1);
        const favTypes = [...typeCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 2);
        const ids = favs.map((f) => f.entity_id).filter((x) => /^[0-9a-f-]{36}$/.test(x));
        for (const t of favTypes) {
          const d = COLLECTIONS.find((c) => c.entityType === t);
          if (d) await add(`for_you_${d.path}`, `Para ti: ${d.label}`, d.path, { excludeIds: ids });
        }
      }
      await add("destinations", "Destinos destacados", "destinations");
      await add("beaches", "Playas mejor valoradas", "beaches");
      await add("experiences", "Experiencias", "experiences");
      await add("hotels", "Dónde hospedarte", "hotels");
      await add("restaurants", "Dónde comer", "restaurants");
      await add("events", "Próximos eventos", "events", { upcomingFrom: todayInSantoDomingo() });
      return sections;
    };
    // La versión anónima es igual para todos (30 s de caché); la personalizada depende del usuario y no se cachea.
    const sections = req.user ? await buildSections() : await app.publicCache.home.wrap(`home|${limit}`, buildSections);
    if (!req.user) reply.header("cache-control", "public, max-age=120");
    return { data: { personalized: !!req.user, sections } };
  });
}
