import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { LOCALES } from "../../lib/i18n.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { COLLECTIONS } from "../content/collections.js";
import { cols, hasCol } from "../content/query.js";
import { audit } from "../operators/team.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const locale = z.enum(LOCALES);
const targetLocale = z.enum(["en", "fr", "de", "pt", "it"]);
const NAMES: Record<string, string> = { es: "Español", en: "English", fr: "Français", de: "Deutsch", pt: "Português", it: "Italiano" };
const MAX_KEYS_PER_CALL = 2000;
/** Las cadenas son texto plano: se rechaza cualquier intento de meter código ejecutable. */
const UNSAFE = /<\s*(script|iframe|object|embed|style)\b|javascript:|on\w+\s*=/i;
const COLLECTION_BY_TABLE = new Map(COLLECTIONS.map((c) => [c.table, c]));

/** Traducciones: diccionario de la interfaz y traducciones de contenido (docs §5.15). */
export async function i18nRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const editor = app.requireRole("admin", "editor");
  const admin = app.requireRole("admin");
  const tag = ["traducciones"];

  const dictionary = async (loc: string, ns?: string, fallback = true) => {
    const rows = (await db.query<{ locale: string; namespace: string; key: string; value: string }>(
      "SELECT locale, namespace, key, value FROM ui_strings WHERE (locale = $1 OR ($2::boolean AND locale = 'es')) AND ($3::text IS NULL OR namespace = $3) ORDER BY namespace, key", [loc, fallback && loc !== "es", ns ?? null],
    )).rows;
    const out: Record<string, Record<string, string>> = {};
    // Primero el español de respaldo y luego el idioma pedido, que lo sobrescribe.
    for (const x of rows.filter((y) => y.locale === "es" && loc !== "es")) (out[x.namespace] ??= {})[x.key] = x.value;
    for (const x of rows.filter((y) => y.locale === loc)) (out[x.namespace] ??= {})[x.key] = x.value;
    return out;
  };

  r.get("/i18n/locales", { schema: { tags: tag, summary: "Idiomas activos y cobertura de la interfaz", response: { 200: ok } } }, async (_q, reply) => {
    const base = Number((await db.query<{ n: string }>("SELECT count(*) AS n FROM ui_strings WHERE locale = 'es'")).rows[0]!.n);
    const counts = new Map((await db.query<{ locale: string; n: number }>("SELECT locale, count(*)::int AS n FROM ui_strings GROUP BY locale")).rows.map((x) => [x.locale, x.n]));
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: LOCALES.map((code) => ({ code, name: NAMES[code], default: code === "es", ui_strings: counts.get(code) ?? 0, ui_coverage: code === "es" ? (base ? 100 : 0) : base ? Math.min(100, Math.round(((counts.get(code) ?? 0) / base) * 1000) / 10) : 0 })) };
  });

  r.get("/i18n/dictionary/:locale", {
    schema: { tags: tag, summary: "Diccionario de la interfaz (con ETag; lo que falta cae al español)", params: z.object({ locale }), querystring: z.object({ ns: z.string().regex(/^[a-z][a-zA-Z0-9_-]{0,39}$/).optional(), fallback: z.enum(["true", "false"]).default("true") }), response: { 200: ok } },
  }, async (req, reply) => {
    reply.header("cache-control", PUBLIC_CACHE).header("content-language", req.params.locale);
    return { data: { locale: req.params.locale, namespace: req.query.ns ?? null, strings: await dictionary(req.params.locale, req.query.ns, req.query.fallback === "true") } };
  });

  r.put("/admin/i18n/dictionary/:locale", {
    preHandler: admin,
    schema: {
      tags: ["admin"], summary: `Crea o reemplaza cadenas de la interfaz (máx. ${MAX_KEYS_PER_CALL} por llamada)`, security: bearer, params: z.object({ locale }),
      body: z.object({ strings: z.record(z.string().regex(/^[a-z][a-zA-Z0-9_-]{0,39}$/), z.record(z.string().min(1).max(200), z.string().max(2000))), delete: z.array(z.object({ ns: z.string().max(40), key: z.string().max(200) })).max(500).optional() }),
      response: { 200: ok },
    },
  }, async (req) => {
    const entries = Object.entries(req.body.strings).flatMap(([ns, kv]) => Object.entries(kv).map(([k, v]) => [ns, k, v] as const));
    if (entries.length > MAX_KEYS_PER_CALL) throw AppError.validation(`Máximo ${MAX_KEYS_PER_CALL} cadenas por llamada`);
    const bad = entries.filter(([, , v]) => UNSAFE.test(v));
    if (bad.length) throw AppError.validation("Hay cadenas con código no permitido", bad.slice(0, 10).map(([ns, k]) => ({ field: `${ns}.${k}`, issue: "Sólo se admite texto plano" })));
    const c = await db.connect();
    try {
      await c.query("BEGIN");
      for (const [ns, k, v] of entries) await c.query("INSERT INTO ui_strings (locale, namespace, key, value, updated_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()", [req.params.locale, ns, k, v, req.user!.id]);
      for (const d of req.body.delete ?? []) await c.query("DELETE FROM ui_strings WHERE locale = $1 AND namespace = $2 AND key = $3", [req.params.locale, d.ns, d.key]);
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
    await audit(db, { actor: req.user!.id, action: "i18n.dictionary_updated", entity: "ui_strings", id: req.params.locale, meta: { upserted: entries.length, deleted: req.body.delete?.length ?? 0 }, ip: req.ip });
    return { data: { locale: req.params.locale, upserted: entries.length, deleted: req.body.delete?.length ?? 0 } };
  });

  // ---------- Traducciones de contenido ----------
  const collectionOf = (entityType: string) => {
    const d = COLLECTION_BY_TABLE.get(entityType);
    if (!d || !d.translatable.length) throw AppError.validation(`"${entityType}" no tiene contenido traducible`, { translatable_types: [...COLLECTION_BY_TABLE.values()].filter((c) => c.translatable.length).map((c) => c.table) });
    return d;
  };

  r.get("/admin/translations", {
    preHandler: editor,
    schema: { tags: ["admin"], summary: "Traducciones de contenido por entidad, idioma y estado", security: bearer, querystring: z.object({ entity_type: z.string().max(60).optional(), entity_id: z.string().uuid().optional(), locale: targetLocale.optional(), status: z.enum(["machine", "human", "reviewed"]).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const q = req.query;
    const p = [q.entity_type ?? null, q.entity_id ?? null, q.locale ?? null, q.status ?? null];
    const w = "($1::text IS NULL OR entity_type = $1) AND ($2::uuid IS NULL OR entity_id = $2) AND ($3::text IS NULL OR language = $3) AND ($4::text IS NULL OR status = $4)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM entity_translations WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT entity_type, entity_id, language AS locale, field_name, translation_text AS text, status, updated_at FROM entity_translations WHERE ${w} ORDER BY entity_type, entity_id, language, field_name LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, p);
    return { data: rows, meta: pageMeta(q.page, q.per_page, total) };
  });

  r.put("/admin/translations/:entity_type/:entity_id/:locale", {
    preHandler: editor,
    schema: {
      tags: ["admin"], summary: "Guarda campos traducidos de una entidad (quedan como `human`)", security: bearer, params: z.object({ entity_type: z.string().max(60), entity_id: z.string().uuid(), locale: targetLocale }),
      body: z.object({ fields: z.record(z.string().max(60), z.string().max(20_000).nullable()), reviewed: z.boolean().default(false) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const d = collectionOf(req.params.entity_type);
    const names = Object.keys(req.body.fields);
    if (!names.length) throw AppError.validation("Envía al menos un campo");
    for (const f of names) if (!d.translatable.includes(f)) throw AppError.validation(`"${f}" no es un campo traducible de ${d.table}`, { translatable: d.translatable.filter((x) => hasCol(d.table, x)) });
    if (!(await db.query(`SELECT 1 FROM "${d.table}" WHERE id = $1${hasCol(d.table, "deleted_at") ? " AND deleted_at IS NULL" : ""}`, [req.params.entity_id])).rowCount) throw AppError.notFound("Registro");
    let saved = 0, removed = 0;
    for (const [f, text] of Object.entries(req.body.fields)) {
      if (text === null || text.trim() === "") { removed += (await db.query("DELETE FROM entity_translations WHERE entity_type = $1 AND entity_id = $2 AND language = $3 AND field_name = $4", [d.table, req.params.entity_id, req.params.locale, f])).rowCount ?? 0; continue; }
      await db.query(
        `INSERT INTO entity_translations (entity_type, entity_id, language, field_name, translation_text, status, updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (entity_type, entity_id, language, field_name) DO UPDATE SET translation_text = EXCLUDED.translation_text, status = EXCLUDED.status, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [d.table, req.params.entity_id, req.params.locale, f, text.trim(), req.body.reviewed ? "reviewed" : "human", req.user!.id],
      );
      saved++;
    }
    await audit(db, { actor: req.user!.id, action: "i18n.translation_saved", entity: d.table, id: req.params.entity_id, meta: { locale: req.params.locale, saved, removed }, ip: req.ip });
    return { data: { saved, removed } };
  });

  r.post("/admin/translations/:entity_type/:entity_id/:locale/review", {
    preHandler: editor,
    schema: { tags: ["admin"], summary: "Marca como revisadas las traducciones automáticas de una entidad e idioma", security: bearer, params: z.object({ entity_type: z.string().max(60), entity_id: z.string().uuid(), locale: targetLocale }), response: { 200: ok } },
  }, async (req) => {
    const d = collectionOf(req.params.entity_type);
    const res = await db.query("UPDATE entity_translations SET status = 'reviewed', updated_by = $4, updated_at = now() WHERE entity_type = $1 AND entity_id = $2 AND language = $3 AND status = 'machine'", [d.table, req.params.entity_id, req.params.locale, req.user!.id]);
    return { data: { reviewed: res.rowCount } };
  });

  r.post("/admin/translations/:entity_type/:entity_id/auto", { preHandler: editor, schema: { tags: ["admin"], summary: "Traducción automática (requiere un proveedor de traducción; hoy no hay ninguno configurado)", security: bearer, params: z.object({ entity_type: z.string().max(60), entity_id: z.string().uuid() }) } }, async () => {
    throw new AppError("SERVICE_UNAVAILABLE", "No hay un proveedor de traducción automática configurado; guarda las traducciones con PUT", { code: "NO_TRANSLATION_PROVIDER" });
  });

  /** Cobertura: por colección e idioma, qué parte de los campos traducibles de los registros publicados tiene traducción. */
  r.get("/admin/translations/coverage", {
    preHandler: editor,
    schema: { tags: ["admin"], summary: "Porcentaje traducido por colección e idioma (guía el plan de traducción)", security: bearer, response: { 200: ok } },
  }, async () => {
    const out = [];
    for (const d of COLLECTIONS) {
      const fields = d.translatable.filter((f) => cols(d.table)[f]);
      if (!fields.length) continue;
      const published = Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM "${d.table}" ${hasCol(d.table, "status") ? "WHERE status = 'published' AND deleted_at IS NULL" : ""}`)).rows[0]!.n);
      if (!published) continue;
      const have = new Map((await db.query<{ language: string; n: number }>(`SELECT language, count(*)::int AS n FROM entity_translations et WHERE entity_type = $1 AND field_name = ANY($2) AND EXISTS (SELECT 1 FROM "${d.table}" t WHERE t.id = et.entity_id) GROUP BY language`, [d.table, fields])).rows.map((x) => [x.language, x.n]));
      out.push({ collection: d.path, table: d.table, records: published, fields: fields.length, locales: Object.fromEntries((["en", "fr", "de", "pt", "it"] as const).map((l) => [l, Math.min(100, Math.round(((have.get(l) ?? 0) / (published * fields.length)) * 1000) / 10)])) });
    }
    const pending = Number((await db.query<{ n: string }>("SELECT count(*) AS n FROM entity_translations WHERE status = 'machine'")).rows[0]!.n);
    return { data: { collections: out, pending_review: pending } };
  });
}
