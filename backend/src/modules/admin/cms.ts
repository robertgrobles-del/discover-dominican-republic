import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { PoolClient } from "pg";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta, parseSort } from "../../lib/pagination.js";
import { slugify } from "../../lib/slug.js";
import { COLLECTIONS, type CollectionDef } from "../../contracts/content-collections.js";
import { contentColumns as cols, contentManifest as manifest, hasContentColumn as hasCol } from "../../contracts/content-schema.js";
import type { ColType } from "../../lib/db-types.js";
import { audit } from "../../lib/audit.js";

/** Columnas que gobierna el sistema (flujo editorial y trazabilidad): no se editan directamente. */
const MANAGED = new Set(["id", "created_at", "updated_at", "version", "status", "published_at", "unpublished_at", "slug_history", "created_by", "updated_by", "reviewed_by", "deleted_at"]);
const Q = (c: string) => `"${c}"`;
const bearer = [{ bearerAuth: [] }];
const uuid = z.string().uuid();

const ZT: Record<ColType, z.ZodType> = {
  uuid, text: z.string().max(50_000), integer: z.number().int(), numeric: z.number(), boolean: z.boolean(),
  jsonb: z.any().refine((v) => JSON.stringify(v ?? null).length <= 500_000, "JSON demasiado grande"),
  array: z.array(z.union([z.string().max(1000), z.number()])).max(500), timestamp: z.string().datetime({ offset: true }), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
};

/** Columnas editables de una colección: todo lo que no gobierna el flujo editorial (y `is_active`, que se deriva del estado). */
export const writableColumns = (d: CollectionDef) => Object.keys(cols(d.table)).filter((c) => !MANAGED.has(c) && !(c === "is_active" && hasCol(d.table, "status")));

/** Esquema de entrada generado a partir del manifest: estricto (una columna desconocida es un error) y todo opcional; la base exige lo obligatorio. */
export function bodySchema(d: CollectionDef) {
  const shape: Record<string, z.ZodType> = {};
  for (const c of writableColumns(d)) { const m = cols(d.table)[c]!; shape[c] = (m.nullable ? ZT[m.type].nullable() : ZT[m.type]).optional(); }
  return z.object(shape).strict();
}

function mapPgError(e: unknown): never {
  const err = e as { code?: string; column?: string; constraint?: string; detail?: string; message?: string };
  switch (err.code) {
    case "23502": throw AppError.validation(`Falta el campo "${err.column}"`, { field: err.column });
    case "23505": throw new AppError("CONFLICT", "Ya existe un registro con ese valor único", { reason: "UNIQUE_VIOLATION", constraint: err.constraint });
    case "23503": throw AppError.validation("Una referencia apunta a un registro que no existe o que aún se usa", { constraint: err.constraint });
    case "23514": throw AppError.validation("Un valor no cumple las reglas de la base de datos", { constraint: err.constraint });
    case "22P02": case "22007": case "22003": throw AppError.validation("Un valor tiene un formato inválido");
    default: throw e;
  }
}

const titleOf = (d: CollectionDef, row: Record<string, unknown>) => String(row[d.title] ?? row.name ?? row.title ?? "").trim();

export async function adminCmsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const editor = app.requireRole("admin", "editor");
  const admin = app.requireRole("admin");

  const tx = async <T>(fn: (c: PoolClient) => Promise<T>): Promise<T> => {
    const c = await db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); mapPgError(e); }
    finally { c.release(); }
  };

  const snapshot = async (c: PoolClient, d: CollectionDef, id: string, action: string, actor: string | null) => {
    if (!hasCol(d.table, "version")) return;
    const row = (await c.query(`SELECT * FROM ${Q(d.table)} WHERE id = $1`, [id])).rows[0];
    if (row) await c.query("INSERT INTO content_revisions (entity_type, entity_id, version, action, snapshot, author_id) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING", [d.table, id, row.version, action, JSON.stringify(row), actor]);
  };

  const ser = (v: unknown, type: ColType) => (type === "jsonb" && v !== null && v !== undefined ? JSON.stringify(v) : v);

  const uniqueSlug = async (c: PoolClient, d: CollectionDef, base: string, exceptId?: string) => {
    let slug = base || "sin-titulo";
    for (let i = 2; (await c.query(`SELECT 1 FROM ${Q(d.table)} WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2)`, [slug, exceptId ?? null])).rowCount; i++) slug = `${base}-${i}`;
    return slug;
  };

  // ---------- Operaciones (compartidas por las rutas, el lote y la importación) ----------
  const create = async (d: CollectionDef, data: Record<string, unknown>, actor: string, c: PoolClient, action = "create") => {
    const t = d.table, m = cols(t);
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => ser(data[k], m[k]!.type));
    if (hasCol(t, "slug")) {
      const slug = typeof data.slug === "string" && data.slug ? slugify(data.slug) : slugify(titleOf(d, data));
      if (!keys.includes("slug")) { keys.push("slug"); vals.push(await uniqueSlug(c, d, slug)); }
      else vals[keys.indexOf("slug")] = await uniqueSlug(c, d, slug);
    }
    if (hasCol(t, "status")) { keys.push("status"); vals.push("draft"); if (hasCol(t, "is_active")) { keys.push("is_active"); vals.push(false); } }
    if (hasCol(t, "created_by")) { keys.push("created_by", "updated_by"); vals.push(actor, actor); }
    const row = (await c.query(`INSERT INTO ${Q(t)} (${keys.map(Q).join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`, vals)).rows[0];
    await snapshot(c, d, row.id, action, actor);
    return row;
  };

  const update = async (d: CollectionDef, id: string, data: Record<string, unknown>, version: number | undefined, actor: string, c: PoolClient, action = "update") => {
    const t = d.table, m = cols(t);
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const sets: string[] = [], vals: unknown[] = [id];
    const bind = (v: unknown) => { vals.push(v); return `$${vals.length}`; };
    if (hasCol(t, "slug") && keys.includes("slug")) {
      const next = await uniqueSlug(c, d, slugify(String(data.slug ?? "")) || "sin-titulo", id);
      const ph = bind(next);
      sets.push(`slug_history = CASE WHEN slug IS NOT NULL AND slug <> ${ph} THEN array_append(array_remove(slug_history, ${ph}), slug) ELSE slug_history END`, `slug = ${ph}`);
      keys.splice(keys.indexOf("slug"), 1);
    }
    for (const k of keys) sets.push(`${Q(k)} = ${bind(ser(data[k], m[k]!.type))}`);
    if (hasCol(t, "updated_by")) sets.push(`updated_by = ${bind(actor)}`);
    if (hasCol(t, "updated_at")) sets.push("updated_at = now()");
    if (hasCol(t, "version")) sets.push("version = version + 1");
    if (!sets.length) throw AppError.validation("No hay cambios que guardar");
    const where = ["id = $1", ...(hasCol(t, "deleted_at") ? ["deleted_at IS NULL"] : []), ...(version !== undefined && hasCol(t, "version") ? [`version = ${bind(version)}`] : [])];
    const res = await c.query(`UPDATE ${Q(t)} SET ${sets.join(", ")} WHERE ${where.join(" AND ")} RETURNING *`, vals);
    if (!res.rowCount) {
      const cur = (await c.query(`SELECT ${hasCol(t, "version") ? "version" : "1 AS version"} FROM ${Q(t)} WHERE id = $1 ${hasCol(t, "deleted_at") ? "AND deleted_at IS NULL" : ""}`, [id])).rows[0];
      if (!cur) throw AppError.notFound("Registro");
      throw new AppError("CONFLICT", "Alguien más editó este registro; recarga y vuelve a aplicar tus cambios", { reason: "VERSION_CONFLICT", current_version: cur.version });
    }
    await snapshot(c, d, id, action, actor);
    return res.rows[0];
  };

  type Transition = "submit-review" | "publish" | "unpublish" | "archive";
  const FROM: Record<Transition, string[]> = { "submit-review": ["draft"], publish: ["draft", "in_review", "archived"], unpublish: ["published"], archive: ["draft", "in_review", "published"] };
  const TO: Record<Transition, string> = { "submit-review": "in_review", publish: "published", unpublish: "draft", archive: "archived" };
  const transition = async (d: CollectionDef, id: string, kind: Transition, actor: string, c: PoolClient, publishAt?: string) => {
    const t = d.table;
    if (!hasCol(t, "status")) throw AppError.validation("Esta colección no tiene flujo editorial");
    const cur = (await c.query(`SELECT * FROM ${Q(t)} WHERE id = $1 ${hasCol(t, "deleted_at") ? "AND deleted_at IS NULL" : ""} FOR UPDATE`, [id])).rows[0];
    if (!cur) throw AppError.notFound("Registro");
    if (!FROM[kind].includes(cur.status)) throw new AppError("BUSINESS_RULE", `No se puede ${kind} un registro en estado "${cur.status}"`, { code: "INVALID_TRANSITION", from: cur.status });
    if (kind === "publish") {
      const problems: { field: string; issue: string }[] = [];
      if (hasCol(t, "slug") && !cur.slug) problems.push({ field: "slug", issue: "Falta el slug" });
      if (!titleOf(d, cur)) problems.push({ field: d.title, issue: "Falta el título o nombre" });
      if (problems.length) throw new AppError("BUSINESS_RULE", "El registro no está listo para publicarse", { code: "INCOMPLETE", problems });
    }
    const sets = ["status = $2"], vals: unknown[] = [id, TO[kind]];
    const bind = (v: unknown) => { vals.push(v); return `$${vals.length}`; };
    if (kind === "publish") { sets.push(`published_at = ${bind(publishAt ?? new Date().toISOString())}`, "unpublished_at = NULL"); if (hasCol(t, "reviewed_by")) sets.push(`reviewed_by = ${bind(actor)}`); }
    if (kind === "unpublish" || kind === "archive") sets.push("unpublished_at = now()");
    if (hasCol(t, "is_active")) sets.push(`is_active = ${kind === "publish"}`);
    if (hasCol(t, "updated_by")) sets.push(`updated_by = ${bind(actor)}`);
    if (hasCol(t, "updated_at")) sets.push("updated_at = now()");
    if (hasCol(t, "version")) sets.push("version = version + 1");
    const row = (await c.query(`UPDATE ${Q(t)} SET ${sets.join(", ")} WHERE id = $1 RETURNING *`, vals)).rows[0];
    await snapshot(c, d, id, kind.replace("-", "_"), actor);
    return row;
  };

  const softDelete = async (d: CollectionDef, id: string, actor: string, c: PoolClient, hard: boolean) => {
    const t = d.table;
    if (hard || !hasCol(t, "deleted_at")) {
      const res = await c.query(`DELETE FROM ${Q(t)} WHERE id = $1`, [id]);
      if (!res.rowCount) throw AppError.notFound("Registro");
      return;
    }
    const res = await c.query(`UPDATE ${Q(t)} SET deleted_at = now()${hasCol(t, "status") ? ", status = 'archived'" : ""}${hasCol(t, "is_active") ? ", is_active = false" : ""}${hasCol(t, "version") ? ", version = version + 1" : ""}${hasCol(t, "updated_by") ? ", updated_by = $2" : ""} WHERE id = $1 AND deleted_at IS NULL`, hasCol(t, "updated_by") ? [id, actor] : [id]);
    if (!res.rowCount) throw AppError.notFound("Registro");
    await snapshot(c, d, id, "delete", actor);
  };

  const csvCell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita inyección de fórmulas al abrir en Excel
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  for (const d of COLLECTIONS) {
    if (!manifest[d.table]) continue;
    const base = `/admin/${d.path}`;
    const t = d.table;
    const body = bodySchema(d);
    const idp = z.object({ id: uuid });
    const hide = { tags: ["cms"], hide: true, security: bearer };
    const actorOf = (req: { user?: { id: string } }) => req.user!.id;
    // Punto único de las mutaciones del CMS: al auditar se vacía también la caché pública (B7.64); export es sólo lectura.
    const done = (req: { user?: { id: string }; ip: string }, action: string, id: string, extra?: Record<string, unknown>) => {
      if (action !== "export") app.invalidatePublicContent();
      return audit(db, { actor: actorOf(req), action: `cms.${action}`, entity: t, id, meta: extra, ip: req.ip });
    };

    // Quien tiene un permiso acotado sobre esta colección puede leer, crear, editar, borrar (lógico) y enviar a revisión.
    // Publicar, restaurar, importar, exportar y las acciones masivas siguen siendo sólo de editor o admin.
    const scoped = app.requireRoleOrGrant(["admin", "editor"], "catalog.manage", d.path);
    /** Con un permiso limitado a registros concretos (p. ej. un evento delegado), sólo se tocan esos. */
    const scopedTo = (req: { grant?: { record_ids: string[] } }, id?: string) => {
      const ids = req.grant?.record_ids ?? [];
      if (ids.length && (!id || !ids.includes(id))) throw new AppError("FORBIDDEN", "Tu permiso sólo cubre registros concretos de esta colección", { code: "OUT_OF_GRANT_SCOPE" });
    };

    r.get(`${base}/schema`, { onRequest: scoped, schema: { ...hide, summary: `Definición de campos de ${d.label}` } }, async () => ({
      data: {
        entity: d.path, table: t, label: d.label, title_field: d.title, states: ["draft", "in_review", "published", "archived"], has_workflow: hasCol(t, "status"),
        fields: Object.entries(cols(t)).map(([name, m]) => ({ name, type: m.type, nullable: m.nullable, writable: writableColumns(d).includes(name), searchable: d.search.includes(name), filterable: name in d.filters, sortable: d.sort.includes(name) })),
        relations: Object.fromEntries(Object.entries(d.relations).map(([k, v]) => [k, { column: v.column, table: v.table }])),
      },
    }));

    r.get(base, {
      onRequest: scoped,
      schema: { ...hide, summary: `Lista ${d.label} (todos los estados)`, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(25), q: z.string().trim().max(100).optional(), status: z.enum(["draft", "in_review", "published", "archived"]).optional(), deleted: z.enum(["true", "false"]).default("false"), sort: z.string().max(100).optional() }).catchall(z.string().max(200)) },
    }, async (req) => {
      const qs = req.query as Record<string, string> & { page: number; per_page: number };
      const params: unknown[] = [], where: string[] = [];
      const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
      if (hasCol(t, "deleted_at")) where.push(qs.deleted === "true" ? "deleted_at IS NOT NULL" : "deleted_at IS NULL");
      if (qs.status && hasCol(t, "status")) where.push(`status = ${bind(qs.status)}`);
      if (qs.q && d.search.length) { const ph = bind(`%${qs.q.replace(/[\\%_]/g, "\\$&")}%`); where.push(`(${d.search.filter((c) => hasCol(t, c)).map((c) => `lower(f_unaccent(${Q(c)}::text)) LIKE lower(f_unaccent(${ph})) ESCAPE '\\'`).join(" OR ")})`); }
      for (const [k, v] of Object.entries(qs)) {
        const m = k.match(/^filter\[([a-z_0-9]+)\]$/);
        if (!m) continue;
        const col = m[1]!;
        if (!hasCol(t, col) || ["jsonb", "array"].includes(cols(t)[col]!.type)) throw AppError.validation(`No se puede filtrar por "${col}"`);
        where.push(`${Q(col)}::text = ${bind(v)}`);
      }
      const sort = parseSort(qs.sort, [...new Set([...d.sort, "created_at", "updated_at", ...(hasCol(t, "status") ? ["status"] : [])])].filter((c) => hasCol(t, c)), [{ column: hasCol(t, "updated_at") ? "updated_at" : "id", dir: "DESC" }]);
      const w = where.length ? where.join(" AND ") : "true";
      const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${Q(t)} WHERE ${w}`, params)).rows[0]!.n;
      const { rows } = await db.query(`SELECT * FROM ${Q(t)} WHERE ${w} ORDER BY ${sort.map((s) => `${Q(s.column)} ${s.dir}`).join(", ")}, id LIMIT ${qs.per_page} OFFSET ${(qs.page - 1) * qs.per_page}`, params);
      return { data: rows, meta: pageMeta(qs.page, qs.per_page, total) };
    });

    r.get(`${base}/export`, { onRequest: editor, schema: { ...hide, summary: `Exporta ${d.label}`, querystring: z.object({ format: z.enum(["csv", "json"]).default("json"), status: z.enum(["draft", "in_review", "published", "archived"]).optional() }) } }, async (req, reply) => {
      const params: unknown[] = [];
      const where = [...(hasCol(t, "deleted_at") ? ["deleted_at IS NULL"] : []), ...(req.query.status && hasCol(t, "status") ? [(params.push(req.query.status), `status = $1`)] : [])];
      const { rows } = await db.query(`SELECT * FROM ${Q(t)} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id LIMIT 10000`, params);
      await done(req, "export", "-", { rows: rows.length });
      if (req.query.format === "json") return { data: rows };
      const names = Object.keys(cols(t));
      reply.header("content-type", "text/csv; charset=utf-8").header("content-disposition", `attachment; filename="${d.path}.csv"`);
      return [names.join(","), ...rows.map((row) => names.map((n) => csvCell(row[n])).join(","))].join("\r\n");
    });

    r.get(`${base}/:id`, { onRequest: scoped, schema: { ...hide, summary: `Detalle de ${d.label}`, params: idp } }, async (req) => {
      scopedTo(req, req.params.id);
      const row = (await db.query(`SELECT * FROM ${Q(t)} WHERE id = $1`, [req.params.id])).rows[0];
      if (!row) throw AppError.notFound("Registro");
      return { data: row };
    });

    r.post(base, { onRequest: scoped, schema: { ...hide, summary: `Crea (borrador) en ${d.label}`, body } }, async (req, reply) => {
      scopedTo(req); // un permiso sobre registros concretos no permite crear otros
      const row = await tx((c) => create(d, req.body as Record<string, unknown>, actorOf(req), c));
      await done(req, "create", row.id);
      reply.code(201);
      return { data: row };
    });

    r.patch(`${base}/:id`, { onRequest: scoped, schema: { ...hide, summary: `Edita ${d.label} (con version)`, params: idp, body: (hasCol(t, "version") ? body.extend({ version: z.number().int().min(1) }) : body) } }, async (req) => {
      scopedTo(req, req.params.id);
      const { version, ...data } = req.body as Record<string, unknown> & { version?: number };
      const row = await tx((c) => update(d, req.params.id, data, version, actorOf(req), c));
      await done(req, "update", req.params.id, { version: row.version });
      return { data: row };
    });

    r.delete(`${base}/:id`, { onRequest: scoped, schema: { ...hide, summary: `Borra ${d.label} (lógico; ?hard=true sólo admin)`, params: idp, querystring: z.object({ hard: z.enum(["true", "false"]).default("false") }) } }, async (req, reply) => {
      scopedTo(req, req.params.id);
      const hard = req.query.hard === "true";
      if (hard && !req.user!.roles.includes("admin")) throw new AppError("FORBIDDEN", "El borrado definitivo es sólo para administradores");
      await tx((c) => softDelete(d, req.params.id, actorOf(req), c, hard));
      await done(req, hard ? "hard_delete" : "delete", req.params.id);
      reply.code(204);
      return null;
    });

    for (const kind of ["submit-review", "publish", "unpublish", "archive"] as const) {
      r.post(`${base}/:id/${kind}`, {
        onRequest: kind === "submit-review" ? scoped : admin,
        schema: { ...hide, summary: `${kind} en ${d.label}`, params: idp, body: z.object({ publish_at: z.string().datetime({ offset: true }).optional() }).nullish() },
      }, async (req) => {
        scopedTo(req, req.params.id);
        const row = await tx((c) => transition(d, req.params.id, kind, actorOf(req), c, kind === "publish" ? req.body?.publish_at : undefined));
        await done(req, kind, req.params.id, { status: row.status });
        return { data: row };
      });
    }

    r.get(`${base}/:id/revisions`, { onRequest: editor, schema: { ...hide, summary: `Historial de ${d.label}`, params: idp } }, async (req) => ({
      data: (await db.query("SELECT r.version, r.action, r.author_id, r.created_at, p.display_name AS author FROM content_revisions r LEFT JOIN profiles p ON p.id = r.author_id WHERE r.entity_type = $1 AND r.entity_id = $2 ORDER BY r.version DESC LIMIT 200", [t, req.params.id])).rows,
    }));
    r.post(`${base}/:id/restore/:version`, { onRequest: editor, schema: { ...hide, summary: `Restaura una versión de ${d.label}`, params: z.object({ id: uuid, version: z.coerce.number().int().min(1) }) } }, async (req) => {
      const rev = (await db.query("SELECT snapshot FROM content_revisions WHERE entity_type = $1 AND entity_id = $2 AND version = $3", [t, req.params.id, req.params.version])).rows[0];
      if (!rev) throw AppError.notFound("Versión");
      const snap = rev.snapshot as Record<string, unknown>;
      const data: Record<string, unknown> = {};
      for (const c of writableColumns(d)) if (c in snap) data[c] = snap[c];
      // Las fechas del snapshot llegan como texto ISO; los jsonb ya son objetos.
      const row = await tx((c) => update(d, req.params.id, data, undefined, actorOf(req), c, "restore"));
      await done(req, "restore", req.params.id, { from_version: req.params.version, version: row.version });
      return { data: row };
    });

    r.post(`${base}/bulk`, {
      onRequest: editor,
      schema: { ...hide, summary: `Acciones masivas en ${d.label}`, body: z.object({ ids: z.array(uuid).min(1).max(100), action: z.enum(["publish", "unpublish", "archive", "submit-review", "delete", "set_field"]), field: z.string().max(60).optional(), value: z.any().optional() }) },
    }, async (req) => {
      const b = req.body;
      const isAdmin = req.user!.roles.includes("admin");
      if (["publish", "unpublish", "archive"].includes(b.action) && !isAdmin) throw new AppError("FORBIDDEN", "Sólo un administrador puede publicar o archivar");
      let patch: Record<string, unknown> = {};
      if (b.action === "set_field") {
        if (!b.field || !writableColumns(d).includes(b.field)) throw AppError.validation("Campo no editable");
        const parsed = (body.shape as Record<string, z.ZodType>)[b.field]!.safeParse(b.value);
        if (!parsed.success) throw AppError.validation(`Valor inválido para ${b.field}`);
        patch = { [b.field]: parsed.data };
      }
      const ok: string[] = [], failed: { id: string; reason: string }[] = [];
      for (const id of b.ids) {
        try {
          await tx((c) => b.action === "delete" ? softDelete(d, id, actorOf(req), c, false) : b.action === "set_field" ? update(d, id, patch, undefined, actorOf(req), c, "bulk") : transition(d, id, b.action as Transition, actorOf(req), c));
          ok.push(id);
        } catch (e) { failed.push({ id, reason: e instanceof AppError ? e.message : "Error interno" }); }
      }
      await done(req, `bulk_${b.action}`, "-", { ok: ok.length, failed: failed.length });
      return { data: { ok, failed } };
    });

    r.post(`${base}/import`, {
      onRequest: editor,
      schema: { ...hide, summary: `Importa filas JSON a ${d.label} (upsert por slug; dry_run por defecto)`, querystring: z.object({ dry_run: z.enum(["true", "false"]).default("true") }), body: z.object({ rows: z.array(z.record(z.string(), z.any())).min(1).max(500) }) },
    }, async (req, reply) => {
      const errors: { row: number; issues: unknown }[] = [];
      const parsed: Record<string, unknown>[] = [];
      req.body.rows.forEach((raw, i) => {
        const p = body.safeParse(raw);
        if (!p.success) errors.push({ row: i + 1, issues: p.error.issues.map((x) => ({ field: x.path.join("."), issue: x.message })) });
        else parsed.push(p.data as Record<string, unknown>);
      });
      const dry = req.query.dry_run === "true";
      if (errors.length) { reply.code(422); return { error: { code: "VALIDATION_ERROR", message: "Hay filas inválidas; no se aplicó nada", details: errors, request_id: req.id } }; }
      let inserted = 0, updated = 0;
      const run = async (c: PoolClient) => {
        for (const row of parsed) {
          const existing = hasCol(t, "slug") && typeof row.slug === "string" ? (await c.query(`SELECT id FROM ${Q(t)} WHERE slug = $1 ${hasCol(t, "deleted_at") ? "AND deleted_at IS NULL" : ""}`, [slugify(row.slug)])).rows[0] : null;
          if (existing) { const { slug: _s, ...rest } = row; if (Object.keys(rest).length) await update(d, existing.id, rest, undefined, actorOf(req), c, "import"); updated++; }
          else { await create(d, row, actorOf(req), c, "import"); inserted++; }
        }
      };
      if (dry) {
        const c = await db.connect();
        try { await c.query("BEGIN"); await run(c); } catch (e) { await c.query("ROLLBACK"); mapPgError(e); } finally { await c.query("ROLLBACK").catch(() => undefined); c.release(); }
      } else {
        await tx(run);
        await done(req, "import", "-", { inserted, updated });
      }
      return { data: { dry_run: dry, inserted, updated } };
    });
  }
}
