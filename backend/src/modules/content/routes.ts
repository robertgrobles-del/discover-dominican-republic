import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z, type ZodTypeAny } from "zod";
import { AppError } from "../../lib/errors.js";
import { applyTranslations, LOCALES, resolveLocale, type Locale } from "../../lib/i18n.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { BY_PATH, BY_TABLE, COLLECTIONS, type CollectionDef } from "./collections.js";
import type { ColType } from "./manifest-reader.js";
import {
  buildOrder, buildSelect, buildWhere, colType, hasCol, listColumns, manifest, mapRow, parseQuery, publicColumns, visibility,
  type ParsedQuery,
} from "./query.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const Q = (n: string) => `"${n}"`;
type Row = Record<string, unknown>;

const ZT: Record<ColType, ZodTypeAny> = {
  uuid: z.string(), text: z.string(), integer: z.number(), numeric: z.number(), boolean: z.boolean(),
  jsonb: z.any(), array: z.array(z.any()), timestamp: z.string(), date: z.string(),
};

/** Esquema de respuesta exacto de una colección, construido a partir de las columnas reales de la tabla. */
function itemSchema(d: CollectionDef) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const c of publicColumns(d)) shape[c] = ZT[colType(d.table, c)].nullable().optional();
  shape.seo = z.object({ title: z.string().nullable(), description: z.string().nullable(), og_image: z.string().nullable(), canonical_url: z.string().nullable(), noindex: z.boolean() }).optional();
  shape.distance_m = z.number().optional();
  for (const r of Object.keys(d.relations)) shape[r] = z.record(z.string(), z.any()).nullable().optional();
  return z.object(shape);
}

const filterParams = (d: CollectionDef) => {
  const shape: Record<string, ZodTypeAny> = {};
  for (const [c, kind] of Object.entries(d.filters)) {
    shape[`filter[${c}]`] = z.string().optional().describe(kind === "contains" ? "Lista separada por comas: coincide con cualquiera" : "Valor o lista separada por comas");
    if (kind === "range") for (const op of ["gte", "lte", "gt", "lt"]) shape[`filter[${c}][${op}]`] = z.string().optional();
  }
  return shape;
};

/** Pasa los parámetros de consulta sin transformarlos: `parseQuery` los valida contra la definición. */
const loose = z.union([z.string(), z.array(z.string())]);

function baseQuery(d: CollectionDef) {
  return z.object({
    page: z.string().optional().describe("Página (desde 1)"),
    per_page: z.string().optional().describe("Elementos por página (1-100, 24 por defecto)"),
    q: z.string().optional().describe("Búsqueda de texto sin acentos ni mayúsculas"),
    sort: z.string().optional().describe(`Orden: ${d.sort.join(", ")}${d.geo ? ", distance (con near)" : ""}; prefijo - para descendente`),
    lang: z.string().optional().describe("es, en, fr, de, pt, it"),
    fields: z.string().optional().describe("Columnas a devolver (siempre incluye id)"),
    include: z.string().optional().describe(`Relaciones: ${Object.keys(d.relations).join(", ") || "ninguna"}`),
    ...(d.geo ? { near: z.string().optional().describe("lat,lng"), radius: z.string().optional().describe("metros (1-200000, 5000 por defecto)") } : {}),
    ...filterParams(d),
  }).catchall(loose);
}

const listMeta = z.object({ page: z.number(), per_page: z.number(), total: z.number(), total_pages: z.number(), locale: z.string(), fallback_locale: z.string().optional() });

export async function contentRoutes(app: FastifyInstance) {
  for (const d of COLLECTIONS) registerCollection(app, d);
}

function pickLocale(req: FastifyRequest, lang: string | undefined): Locale {
  if (lang !== undefined && !(LOCALES as readonly string[]).includes(lang)) throw AppError.validation(`lang debe ser uno de: ${LOCALES.join(", ")}`);
  return resolveLocale(lang, req.headers["accept-language"]);
}

function registerCollection(app: FastifyInstance, d: CollectionDef) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const item = itemSchema(d);
  const base = `/${d.path}`;
  const idOrSlug = z.object({ idOrSlug: z.string().min(1).max(160) });
  const query = baseQuery(d);
  const T = Q(d.table);

  async function decorate(rows: Row[], parsed: ParsedQuery, sel: { fields: string[]; wantSeo: boolean }, locale: Locale) {
    let dto = rows.map((row) => mapRow(d, row, sel)) as (Row & { id: string })[];
    for (const relName of parsed.include) {
      const rel = d.relations[relName]!;
      const relDef = BY_TABLE.get(rel.table)!;
      const ids = [...new Set(rows.map((x) => x[rel.column]).filter((v): v is string => typeof v === "string"))];
      const found = new Map<string, Row>();
      if (ids.length) {
        const cols = rel.fields.map(Q).join(", ");
        const res = await app.db.query<Row>(`SELECT ${cols} FROM ${Q(rel.table)} WHERE id = ANY($1::uuid[]) AND ${visibility(relDef)}`, [ids]);
        for (const x of res.rows) found.set(String(x.id), x);
      }
      dto = dto.map((o, i) => ({ ...o, [relName]: found.get(String(rows[i]![rel.column])) ?? null }));
    }
    const fields = d.translatable.filter((f) => sel.fields.includes(f)) as (keyof Row & string)[];
    return applyTranslations(app.db, d.table, dto, locale, fields);
  }

  /** Columnas extra que hacen falta para resolver `include` aunque `fields` no las pida. */
  const withRelationColumns = (p: ParsedQuery) => {
    if (p.fields) for (const inc of p.include) { const c = d.relations[inc]!.column; if (!p.fields.includes(c)) p.fields = [...p.fields, c]; }
    return p;
  };

  // ---------- Listado ----------
  r.get(base, {
    schema: {
      tags: [d.tag], summary: `Listado de ${d.label.toLowerCase()}`,
      description: `Contenido CMS publicado. Filtros: ${Object.entries(d.filters).map(([c, k]) => `\`filter[${c}]\`${k === "range" ? " (gte/lte/gt/lt)" : ""}`).join(", ") || "ninguno"}. Búsqueda \`q\` en: ${d.search.join(", ")}.`,
      querystring: query,
      response: { 200: z.object({ data: z.array(item), meta: listMeta }) },
    },
  }, async (req, reply) => {
    const parsed = withRelationColumns(parseQuery(d, req.query as Row));
    const locale = pickLocale(req, parsed.lang);
    const built = buildWhere(d, parsed);
    const sel = buildSelect(d, parsed, false, built.nearPh);
    const order = buildOrder(d, parsed);
    const total = (await app.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${T} WHERE ${built.where}`, built.params)).rows[0]!.n;
    const { rows } = await app.db.query<Row>(
      `SELECT ${sel.select} FROM ${T} WHERE ${built.where} ORDER BY ${order} LIMIT ${parsed.perPage} OFFSET ${(parsed.page - 1) * parsed.perPage}`, built.params,
    );
    const tr = await decorate(rows, parsed, sel, locale);
    reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
    return { data: tr.rows, meta: { ...pageMeta(parsed.page, parsed.perPage, total), locale, ...(tr.fallback ? { fallback_locale: "es" } : {}) } };
  });

  // ---------- Facetas ----------
  const facetable = Object.entries(d.filters).filter(([c, k]) => k === "contains" || ["text", "uuid", "boolean"].includes(colType(d.table, c))).map(([c]) => c);
  if (facetable.length) {
    r.get(`${base}/facets`, {
      schema: {
        tags: [d.tag], summary: `Facetas de ${d.label.toLowerCase()}`,
        description: `Conteos por valor para construir filtros. Aplica los mismos filtros y \`q\` del listado, salvo el propio campo de cada faceta. Campos: ${facetable.join(", ")}.`,
        querystring: baseQuery(d).extend({ fields: z.string().optional().describe(`Campos de faceta (por defecto todos): ${facetable.join(", ")}`) }),
        response: { 200: z.object({ data: z.record(z.string(), z.array(z.object({ value: z.string(), count: z.number() }))), meta: z.object({ total: z.number() }) }) },
      },
    }, async (req, reply) => {
      const raw = { ...(req.query as Row) };
      const wanted = typeof raw.fields === "string" ? raw.fields.split(",").map((s) => s.trim()).filter(Boolean) : facetable;
      delete raw.fields; delete raw.include; delete raw.sort; delete raw.page; delete raw.per_page;
      for (const f of wanted) if (!facetable.includes(f)) throw AppError.validation(`Faceta no válida: ${f}`, { allowed: facetable });
      const parsed = parseQuery(d, raw);
      const data: Record<string, { value: string; count: number }[]> = {};
      for (const f of wanted) {
        const { where, params } = buildWhere(d, parsed, { skip: f });
        const c = Q(f);
        const type = colType(d.table, f);
        const source = type === "jsonb" ? `${T} CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(${c}) = 'array' THEN ${c} ELSE '[]'::jsonb END) AS v(val)`
          : type === "array" ? `${T} CROSS JOIN LATERAL unnest(${c}) AS v(val)` : T;
        const value = type === "jsonb" || type === "array" ? "v.val" : `${c}::text`;
        const res = await app.db.query<{ value: string; count: number }>(
          `SELECT ${value} AS value, count(*)::int AS count FROM ${source} WHERE ${where} AND ${type === "jsonb" || type === "array" ? "v.val" : c} IS NOT NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 50`, params,
        );
        data[f] = res.rows;
      }
      const total = (await app.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${T} WHERE ${buildWhere(d, parsed).where}`, buildWhere(d, parsed).params)).rows[0]!.n;
      reply.header("cache-control", PUBLIC_CACHE);
      return { data, meta: { total } };
    });
  }

  // ---------- Detalle ----------
  async function fetchOne(key: string, sel: { select: string }): Promise<Row | undefined> {
    const byId = UUID.test(key);
    if (!byId && !hasCol(d.table, "slug")) return undefined;
    // Un slug anterior (renombrado en el CMS) sigue resolviendo a la misma ficha, que ya devuelve su slug vigente.
    const match = byId ? "id = $1" : hasCol(d.table, "slug_history") ? "(slug = $1 OR $1 = ANY(slug_history))" : "slug = $1";
    const res = await app.db.query<Row>(`SELECT ${sel.select} FROM ${T} WHERE ${match} AND ${visibility(d)} LIMIT 1`, [key]);
    return res.rows[0];
  }

  r.get(`${base}/:idOrSlug`, {
    schema: {
      tags: [d.tag], summary: `Detalle de ${d.label.toLowerCase()} por id (uuid) o slug`,
      params: idOrSlug,
      querystring: z.object({ lang: z.string().optional(), include: z.string().optional().describe(`Relaciones: ${Object.keys(d.relations).join(", ") || "ninguna"}`), fields: z.string().optional() }).catchall(loose),
      response: { 200: z.object({ data: item, meta: z.object({ locale: z.string() }) }) },
    },
  }, async (req, reply) => {
    const parsed = withRelationColumns(parseQuery(d, req.query as Row));
    const locale = pickLocale(req, parsed.lang);
    const sel = buildSelect(d, parsed, true);
    const row = await fetchOne(req.params.idOrSlug, sel);
    if (!row) throw AppError.notFound(d.label.replace(/s$/, ""));
    const tr = await decorate([row], parsed, sel, locale);
    reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
    return { data: tr.rows[0]!, meta: { locale } };
  });

  // ---------- Relacionados ----------
  if (d.related.length) {
    r.get(`${base}/:idOrSlug/related`, {
      schema: {
        tags: [d.tag], summary: `${d.label} relacionados`, params: idOrSlug,
        querystring: z.object({ limit: z.string().optional(), lang: z.string().optional() }).catchall(loose),
        response: { 200: z.object({ data: z.array(item), meta: z.object({ locale: z.string() }) }) },
      },
    }, async (req, reply) => {
      const limit = Math.min(12, Math.max(1, Number((req.query as Row).limit ?? 6) || 6));
      const locale = pickLocale(req, (req.query as Row).lang as string | undefined);
      const cur = await fetchOne(req.params.idOrSlug, { select: ["id", ...d.related].map(Q).join(", ") });
      if (!cur) throw AppError.notFound(d.label.replace(/s$/, ""));
      const conds: string[] = [];
      const extraParams: unknown[] = [cur.id];
      for (const c of d.related) if (cur[c] !== null && cur[c] !== undefined) { extraParams.push(cur[c]); conds.push(`${Q(c)} = $${extraParams.length}`); }
      if (!conds.length) return { data: [], meta: { locale } };
      const parsed: ParsedQuery = { page: 1, perPage: limit, include: [], filters: [] };
      const built = buildWhere(d, parsed, { extra: `id <> $1 AND (${conds.join(" OR ")})`, extraParams });
      const sel = buildSelect(d, parsed, false);
      const order = ["is_featured", "rating"].filter((c) => hasCol(d.table, c)).map((c) => `${Q(c)} DESC NULLS LAST`).concat(Q(d.title)).join(", ");
      const { rows } = await app.db.query<Row>(`SELECT ${sel.select} FROM ${T} WHERE ${built.where} ORDER BY ${order}, "id" LIMIT ${limit}`, built.params);
      const tr = await decorate(rows, parsed, sel, locale);
      reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
      return { data: tr.rows, meta: { locale } };
    });
  }

  // ---------- Cercanos ----------
  if (d.geo) {
    const nearbyDefault = COLLECTIONS.filter((c) => c.geo && c.nearbyDefault).map((c) => c.path);
    r.get(`${base}/:idOrSlug/nearby`, {
      schema: {
        tags: [d.tag], summary: `Lugares cerca de este elemento`, params: idOrSlug,
        description: `Otras colecciones con coordenadas alrededor. \`types\` (por defecto ${nearbyDefault.join(", ")}), \`radius\` en metros (5000), \`limit\` por tipo (5).`,
        querystring: z.object({ types: z.string().optional(), radius: z.string().optional(), limit: z.string().optional(), lang: z.string().optional() }).catchall(loose),
        response: { 200: z.object({ data: z.record(z.string(), z.array(z.record(z.string(), z.any()))), meta: z.object({ radius: z.number(), center: z.object({ lat: z.number(), lng: z.number() }), locale: z.string() }) }) },
      },
    }, async (req, reply) => {
      const qy = req.query as Row;
      const radius = Number(qy.radius ?? 5000);
      const limit = Math.min(20, Math.max(1, Number(qy.limit ?? 5) || 5));
      if (!Number.isFinite(radius) || radius < 1 || radius > 200_000) throw AppError.validation("radius debe estar entre 1 y 200000 metros");
      const locale = pickLocale(req, qy.lang as string | undefined);
      const types = (typeof qy.types === "string" ? qy.types.split(",").map((s) => s.trim()).filter(Boolean) : nearbyDefault);
      const targets = types.map((t) => { const x = BY_PATH.get(t); if (!x?.geo) throw AppError.validation(`Tipo no válido para cercanos: ${t}`, { allowed: COLLECTIONS.filter((c) => c.geo).map((c) => c.path) }); return x; });
      const cur = await fetchOne(req.params.idOrSlug, { select: ["id", d.geo!.lat, d.geo!.lng].map(Q).join(", ") });
      if (!cur) throw AppError.notFound(d.label.replace(/s$/, ""));
      const lat = cur[d.geo!.lat], lng = cur[d.geo!.lng];
      if (typeof lat !== "number" || typeof lng !== "number") throw new AppError("BUSINESS_RULE", "Este elemento no tiene coordenadas");
      const data: Record<string, Row[]> = {};
      for (const t of targets) {
        const parsed: ParsedQuery = { page: 1, perPage: limit, include: [], filters: [], near: { lat, lng, radius }, fields: ["id", "slug", t.title, "image_url", "rating"].filter((c) => hasCol(t.table, c)) };
        const built = buildWhere(t, parsed, t.table === d.table ? { extra: `id <> $1`, extraParams: [cur.id] } : {});
        const sel = buildSelect(t, parsed, false, built.nearPh);
        const { rows } = await app.db.query<Row>(`SELECT ${sel.select} FROM ${Q(t.table)} WHERE ${built.where} ORDER BY distance_m ASC, "id" LIMIT ${limit}`, built.params);
        data[t.path] = rows.map((row) => ({ ...mapRow(t, row, { fields: sel.fields, wantSeo: false }) }));
      }
      reply.header("cache-control", PUBLIC_CACHE).header("content-language", locale);
      return { data, meta: { radius, center: { lat, lng }, locale } };
    });
  }

  // ---------- Reseñas ----------
  if (d.reviewable) {
    r.get(`${base}/:idOrSlug/reviews`, {
      schema: {
        tags: [d.tag], summary: `Reseñas aprobadas de ${d.label.toLowerCase()}`, params: idOrSlug,
        querystring: z.object({ page: z.string().optional(), per_page: z.string().optional() }).catchall(loose),
        response: {
          200: z.object({
            data: z.array(z.object({ id: z.string(), rating: z.number(), comment: z.string().nullable(), author: z.string(), created_at: z.string() })),
            meta: z.object({ page: z.number(), per_page: z.number(), total: z.number(), total_pages: z.number(), summary: z.object({ average: z.number().nullable(), count: z.number(), distribution: z.record(z.string(), z.number()) }) }),
          }),
        },
      },
    }, async (req, reply) => {
      const qy = req.query as Row;
      const page = Math.max(1, Number(qy.page ?? 1) || 1);
      const perPage = Math.min(50, Math.max(1, Number(qy.per_page ?? 10) || 10));
      const cur = await fetchOne(req.params.idOrSlug, { select: Q("id") });
      if (!cur) throw AppError.notFound(d.label.replace(/s$/, ""));
      const where = "r.entity_type = $1 AND r.entity_id = $2 AND r.is_approved";
      const sum = (await app.db.query<{ average: number | null; count: number; d1: number; d2: number; d3: number; d4: number; d5: number }>(
        `SELECT round(avg(rating)::numeric, 2) AS average, count(*)::int AS count,
                count(*) FILTER (WHERE rating = 1)::int AS d1, count(*) FILTER (WHERE rating = 2)::int AS d2, count(*) FILTER (WHERE rating = 3)::int AS d3,
                count(*) FILTER (WHERE rating = 4)::int AS d4, count(*) FILTER (WHERE rating = 5)::int AS d5
           FROM reviews r WHERE ${where}`, [d.entityType, cur.id])).rows[0]!;
      const { rows } = await app.db.query<{ id: string; rating: number; comment: string | null; created_at: Date; display_name: string | null }>(
        `SELECT r.id, r.rating, r.comment, r.created_at, p.display_name FROM reviews r LEFT JOIN profiles p ON p.id = r.user_id
          WHERE ${where} ORDER BY r.created_at DESC, r.id LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, [d.entityType, cur.id]);
      reply.header("cache-control", PUBLIC_CACHE);
      return {
        data: rows.map((x) => {
          const [first = "", second = ""] = (x.display_name ?? "").trim().split(/\s+/);
          return { id: x.id, rating: x.rating, comment: x.comment, author: first ? `${first}${second ? ` ${second[0]!.toUpperCase()}.` : ""}` : "Viajero", created_at: x.created_at.toISOString() };
        }),
        meta: { ...pageMeta(page, perPage, sum.count), summary: { average: sum.average, count: sum.count, distribution: { "1": sum.d1, "2": sum.d2, "3": sum.d3, "4": sum.d4, "5": sum.d5 } } },
      };
    });
  }
}

export { listColumns, manifest };
