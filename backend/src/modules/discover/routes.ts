import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { COLLECTIONS, type CollectionDef } from "../content/collections.js";
import { cols, hasCol, visibility } from "../content/query.js";
import { todayInSantoDomingo } from "../operators/domain/dates.js";

const ok = z.object({ data: z.any() });
const Q = (c: string) => `"${c}"`;
const SEARCHABLE = COLLECTIONS.filter((c) => cols(c.table)[c.title]);
const GEO = COLLECTIONS.filter((c) => c.geo && hasCol(c.table, c.geo.lat) && hasCol(c.table, c.geo.lng));
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const like = (s: string) => `%${s.replace(/[\\%_]/g, "\\$&")}%`;
/** Distancia en metros entre dos puntos (fórmula del semiverseno) como expresión SQL. */
const haversine = (latCol: string, lngCol: string, latPh: string, lngPh: string) =>
  `(2 * 6371000 * asin(sqrt(power(sin(radians((${latCol} - ${latPh}) / 2)), 2) + cos(radians(${latPh})) * cos(radians(${latCol})) * power(sin(radians((${lngCol} - ${lngPh}) / 2)), 2))))`;

/** Búsqueda global, mapa, "cerca de mí", geocodificación inversa y recomendaciones (docs §5.4). */
export async function discoverRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
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
  const searchOne = async (d: CollectionDef, q: string, limit: number, titleOnly = false): Promise<Hit[]> => {
    const t = d.table, title = Q(d.title);
    const t0 = `lower(f_unaccent(${title}::text))`;
    const extra = titleOnly ? [] : d.search.filter((c) => c !== d.title && cols(t)[c]?.type === "text").slice(0, 3);
    const match = [`${t0} LIKE $2 ESCAPE '\\'`, `similarity(${t0}, $1) > 0.3`, ...extra.map((c) => `lower(f_unaccent(${Q(c)}::text)) LIKE $2 ESCAPE '\\'`)].join(" OR ");
    const score = `CASE WHEN ${t0} = $1 THEN 1.0 WHEN ${t0} LIKE $3 ESCAPE '\\' THEN 0.85 WHEN ${t0} LIKE $2 ESCAPE '\\' THEN 0.6 ELSE greatest(similarity(${t0}, $1), 0.25) END`;
    const { rows } = await db.query(
      `SELECT id, ${hasCol(t, "slug") ? "slug" : "NULL::text AS slug"}, ${title}::text AS title, ${hasCol(t, "short_description") ? "short_description::text" : "NULL::text"} AS subtitle,
              ${hasCol(t, "image_url") ? "image_url::text" : "NULL::text"} AS image, ${score} AS score
         FROM ${Q(t)} WHERE ${visibility(d)} AND (${match}) ORDER BY score DESC${hasCol(t, "rating") ? ", rating DESC NULLS LAST" : ""}, ${title} LIMIT ${limit}`,
      [q, like(q), `${q.replace(/[\\%_]/g, "\\$&")}%`],
    );
    return rows.map((x) => ({ type: d.entityType, collection: d.path, id: x.id, slug: x.slug, title: x.title, subtitle: x.subtitle, image: x.image, score: Math.round(Number(x.score) * 100) / 100 }));
  };

  r.get("/search", {
    config: rl(120, "1 minute"),
    schema: { tags: ["búsqueda"], summary: "Búsqueda global multi-colección ordenada por relevancia (sin acentos ni mayúsculas, tolera errores leves)", querystring: z.object({ q: z.string().trim().min(2).max(80), types: typesParam, limit: z.coerce.number().int().min(1).max(50).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req, reply) => {
    const q = norm(req.query.q);
    const defs = pick(SEARCHABLE, wanted(req.query.types));
    const per = Math.min(req.query.limit, 10);
    const all = (await Promise.all(defs.map((d) => searchOne(d, q, per).catch((err) => { req.log.warn({ err, collection: d.path }, "Falló la búsqueda en una colección"); return [] as Hit[]; })))).flat();
    all.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const data = all.slice(0, req.query.limit);
    // Se registra la consulta (sin datos personales) para las "búsquedas frecuentes".
    if (q.length >= 3) void db.query("INSERT INTO analytics_events (event_type, page, metadata) VALUES ('search', '/search', $1)", [JSON.stringify({ q, results: data.length })]).catch(() => undefined);
    reply.header("cache-control", "public, max-age=30");
    return { data, meta: { q: req.query.q, total: data.length, collections: defs.length } };
  });

  r.get("/search/suggest", {
    config: rl(240, "1 minute"),
    schema: { tags: ["búsqueda"], summary: "Autocompletado por nombre (máx. 8)", querystring: z.object({ q: z.string().trim().min(2).max(60), types: typesParam }), response: { 200: ok } },
  }, async (req, reply) => {
    const q = norm(req.query.q);
    const defs = pick(SEARCHABLE, wanted(req.query.types));
    const hits = (await Promise.all(defs.map((d) => searchOne(d, q, 4, true).catch(() => [] as Hit[])))).flat().sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const seen = new Set<string>();
    const data = hits.filter((h) => { const k = `${h.type}:${norm(h.title)}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8).map((h) => ({ type: h.type, id: h.id, slug: h.slug, title: h.title, image: h.image }));
    reply.header("cache-control", PUBLIC_CACHE);
    return { data };
  });

  r.get("/search/popular", { schema: { tags: ["búsqueda"], summary: "Búsquedas frecuentes de los últimos 7 días (o las sugeridas por el equipo)", response: { 200: ok } } }, async (_q, reply) => {
    const { rows } = await db.query<{ q: string; n: number }>("SELECT metadata->>'q' AS q, count(*)::int AS n FROM analytics_events WHERE event_type = 'search' AND created_at > now() - interval '7 days' AND coalesce((metadata->>'results')::int, 0) > 0 GROUP BY 1 HAVING count(*) >= 2 ORDER BY 2 DESC, 1 LIMIT 10");
    let data: string[] = rows.map((x) => x.q);
    if (!data.length) {
      const s = (await db.query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = 'search.popular' AND is_public")).rows[0];
      data = Array.isArray(s?.value) ? (s!.value as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 10) : [];
    }
    reply.header("cache-control", PUBLIC_CACHE);
    return { data };
  });

  // ---------- Mapa ----------
  r.get("/map/layers", { schema: { tags: ["mapa"], summary: "Capas del mapa interactivo", response: { 200: ok } } }, async (_q, reply) => {
    const data = await Promise.all(GEO.map(async (d) => ({
      id: d.path, type: d.entityType, label: d.label, group: d.tag,
      count: (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${Q(d.table)} WHERE ${visibility(d)} AND ${Q(d.geo!.lat)} IS NOT NULL AND ${Q(d.geo!.lng)} IS NOT NULL`)).rows[0]!.n,
    })));
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
    const features: unknown[] = [];
    for (const d of defs) {
      const { lat, lng } = d.geo!;
      const params: unknown[] = [], where = [visibility(d), `${Q(lat)} IS NOT NULL`, `${Q(lng)} IS NOT NULL`];
      if (bbox) { params.push(bbox[0], bbox[2], bbox[1], bbox[3]); where.push(`${Q(lng)} BETWEEN $1 AND $2`, `${Q(lat)} BETWEEN $3 AND $4`); }
      const { rows } = await db.query(
        `SELECT id, ${hasCol(d.table, "slug") ? "slug" : "NULL::text AS slug"}, ${Q(d.title)}::text AS name, ${Q(lat)}::float8 AS lat, ${Q(lng)}::float8 AS lng, ${hasCol(d.table, "image_url") ? "image_url::text" : "NULL::text"} AS image, ${hasCol(d.table, "rating") ? "rating::float8" : "NULL::float8"} AS rating
           FROM ${Q(d.table)} WHERE ${where.join(" AND ")} ORDER BY ${hasCol(d.table, "rating") ? "rating DESC NULLS LAST," : ""} id LIMIT ${req.query.limit}`, params,
      );
      for (const x of rows) features.push({ type: "Feature", geometry: { type: "Point", coordinates: [x.lng, x.lat] }, properties: { id: x.id, type: d.entityType, layer: d.path, slug: x.slug, name: x.name, image: x.image, rating: x.rating } });
    }
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
    const found = (await Promise.all(defs.map(async (d) => {
      const dist = haversine(Q(d.geo!.lat), Q(d.geo!.lng), "$1", "$2");
      const { rows } = await db.query(
        `SELECT id, ${hasCol(d.table, "slug") ? "slug" : "NULL::text AS slug"}, ${Q(d.title)}::text AS name, ${hasCol(d.table, "image_url") ? "image_url::text" : "NULL::text"} AS image, ${hasCol(d.table, "rating") ? "rating::float8" : "NULL::float8"} AS rating, ${dist} AS distance_m
           FROM ${Q(d.table)} WHERE ${visibility(d)} AND ${Q(d.geo!.lat)} IS NOT NULL AND ${Q(d.geo!.lng)} IS NOT NULL AND ${dist} <= $3 ORDER BY distance_m LIMIT ${limit}`, [lat, lng, radius],
      );
      return rows.map((x) => ({ type: d.entityType, collection: d.path, id: x.id, slug: x.slug, name: x.name, image: x.image, rating: x.rating, distance_m: Math.round(x.distance_m) }));
    }))).flat().sort((a, b) => a.distance_m - b.distance_m).slice(0, limit);
    reply.header("cache-control", "public, max-age=60");
    return { data: found, meta: { center: { lat, lng }, radius_m: radius, total: found.length } };
  });

  r.get("/geo/reverse", {
    config: rl(120, "1 minute"),
    schema: { tags: ["mapa"], summary: "Provincia, municipio y destino más cercanos a una coordenada (hasta 60 km)", querystring: z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }), response: { 200: ok } },
  }, async (req, reply) => {
    const { lat, lng } = req.query;
    const nearest = async (table: string) => (await db.query(
      `SELECT t.id, t.name, t.slug, t.province_id, p.name AS province_name, p.slug AS province_slug, ${haversine("t.latitude", "t.longitude", "$1", "$2")} AS d
         FROM ${Q(table)} t LEFT JOIN provinces p ON p.id = t.province_id WHERE t.status = 'published' AND t.deleted_at IS NULL AND t.latitude IS NOT NULL AND t.longitude IS NOT NULL ORDER BY d LIMIT 1`, [lat, lng],
    )).rows[0];
    const [mun, dest] = await Promise.all([nearest("municipalities"), nearest("destinations")]);
    const close = (x?: { d: number }) => (x && x.d <= 60_000 ? x : null);
    const m = close(mun) as typeof mun | null, d = close(dest) as typeof dest | null;
    const best = [m, d].filter(Boolean).sort((a, b) => a!.d - b!.d)[0] ?? null;
    reply.header("cache-control", "public, max-age=300");
    return { data: {
      province: best?.province_id ? { id: best.province_id, name: best.province_name, slug: best.province_slug } : null,
      municipality: m ? { id: m.id, name: m.name, slug: m.slug, distance_m: Math.round(m.d) } : null,
      destination: d ? { id: d.id, name: d.name, slug: d.slug, distance_m: Math.round(d.d) } : null,
    } };
  });

  // ---------- Recomendaciones de portada ----------
  r.get("/recommendations/home", {
    onRequest: optionalUser,
    schema: { tags: ["búsqueda"], summary: "Secciones de la portada (personalizadas si hay sesión)", security: [{}, { bearerAuth: [] }], querystring: z.object({ limit: z.coerce.number().int().min(1).max(20).default(8) }), response: { 200: ok } },
  }, async (req, reply) => {
    const limit = req.query.limit;
    const top = async (d: CollectionDef, opts: { where?: string; order?: string; params?: unknown[] } = {}) => {
      const t = d.table;
      const { rows } = await db.query(
        `SELECT id, ${hasCol(t, "slug") ? "slug" : "NULL::text AS slug"}, ${Q(d.title)}::text AS title, ${hasCol(t, "short_description") ? "short_description::text" : "NULL::text"} AS subtitle, ${hasCol(t, "image_url") ? "image_url::text" : "NULL::text"} AS image, ${hasCol(t, "rating") ? "rating::float8" : "NULL::float8"} AS rating
           FROM ${Q(t)} WHERE ${visibility(d)}${opts.where ? ` AND ${opts.where}` : ""} ORDER BY ${opts.order ?? `${hasCol(t, "is_featured") ? "is_featured DESC NULLS LAST," : ""} ${hasCol(t, "rating") ? "rating DESC NULLS LAST," : ""} ${Q(d.title)}`} LIMIT ${limit}`, opts.params ?? [],
      );
      return rows.map((x) => ({ type: d.entityType, collection: d.path, id: x.id, slug: x.slug, title: x.title, subtitle: x.subtitle, image: x.image, rating: x.rating }));
    };
    const by = (path: string) => COLLECTIONS.find((c) => c.path === path);
    const sections: { key: string; title: string; items: unknown[] }[] = [];
    const add = async (key: string, title: string, path: string, opts?: Parameters<typeof top>[1]) => { const d = by(path); if (d) { const items = await top(d, opts); if (items.length) sections.push({ key, title, items }); } };

    if (req.user) {
      // Personalización: lo del mismo destino que sus favoritos y de los tipos que más guarda, sin repetir lo que ya marcó.
      const favs = (await db.query<{ entity_type: string; entity_id: string }>("SELECT entity_type, entity_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [req.user.id])).rows;
      const typeCount = new Map<string, number>();
      for (const f of favs) typeCount.set(f.entity_type, (typeCount.get(f.entity_type) ?? 0) + 1);
      const favTypes = [...typeCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 2);
      const ids = favs.map((f) => f.entity_id).filter((x) => /^[0-9a-f-]{36}$/.test(x));
      for (const t of favTypes) {
        const d = COLLECTIONS.find((c) => c.entityType === t);
        if (d) await add(`for_you_${d.path}`, `Para ti: ${d.label}`, d.path, { where: ids.length ? `id <> ALL($1::uuid[])` : undefined, params: ids.length ? [ids] : [] });
      }
    }
    await add("destinations", "Destinos destacados", "destinations");
    await add("beaches", "Playas mejor valoradas", "beaches");
    await add("experiences", "Experiencias", "experiences");
    await add("hotels", "Dónde hospedarte", "hotels");
    await add("restaurants", "Dónde comer", "restaurants");
    await add("events", "Próximos eventos", "events", { where: "coalesce(end_date, start_date) >= $1::date", order: "start_date ASC", params: [todayInSantoDomingo()] });
    if (!req.user) reply.header("cache-control", "public, max-age=120");
    return { data: { personalized: !!req.user, sections } };
  });
}
