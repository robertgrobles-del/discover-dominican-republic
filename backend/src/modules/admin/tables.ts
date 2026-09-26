import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { normalizeType, type ColType } from "../content/manifest-reader.js";
import { audit } from "../operators/team.js";

export interface TableCfg {
  table: string; pk: "id" | "action"; readonly: string[]; order: string; label: string;
  /** Validación de negocio adicional (recibe lo enviado y, al editar, la fila actual). */
  check?: (data: Record<string, unknown>, existing?: Record<string, unknown>) => void;
}

const ZT: Record<ColType, z.ZodType> = {
  uuid: z.string().uuid(), text: z.string().max(10_000), integer: z.number().int(), numeric: z.number(), boolean: z.boolean(),
  jsonb: z.any().refine((v) => JSON.stringify(v ?? null).length <= 100_000, "JSON demasiado grande"), array: z.array(z.string().max(500)).max(200),
  timestamp: z.string().datetime({ offset: true }), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
};
const bearer = [{ bearerAuth: [] }];

function pgError(e: unknown): never {
  const err = e as { code?: string; column?: string; constraint?: string };
  if (err.code === "23502") throw AppError.validation(`Falta el campo "${err.column}"`, { field: err.column });
  if (err.code === "23505") throw new AppError("CONFLICT", "Ya existe un registro con ese valor único", { reason: "UNIQUE_VIOLATION", constraint: err.constraint });
  if (err.code === "23503") throw new AppError("CONFLICT", "Este registro se usa en otro lugar y no se puede borrar o apuntar así", { reason: "IN_USE", constraint: err.constraint });
  if (err.code === "23514" || err.code === "22P02") throw AppError.validation("Un valor no cumple las reglas de la base de datos", { constraint: err.constraint });
  throw e;
}

/**
 * CRUD administrativo genérico para tablas de configuración o de datos vivos (docs §5.17). El esquema de columnas se lee de la base la primera vez
 * que se usa (no al arrancar: la API debe poder iniciar con la base caída); el cuerpo es estricto y toda escritura queda auditada.
 */
export async function tableAdminRoutes(app: FastifyInstance, configs: TableCfg[], roles: string[] = ["admin"]) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole(...roles);

  for (const cfg of configs) {
    // El esquema de columnas se lee de la base la primera vez que se usa (no al arrancar: la API debe poder iniciar con la base caída).
    let cached: Promise<{ cols: Record<string, { type: ColType; nullable: boolean }>; body: z.ZodType<Record<string, unknown>> }> | null = null;
    const meta = () => (cached ??= (async () => {
      const { rows } = await db.query<{ column_name: string; data_type: string; is_nullable: string }>("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position", [cfg.table]);
      const cols = Object.fromEntries(rows.map((c) => [c.column_name, { type: normalizeType(c.data_type), nullable: c.is_nullable === "YES" }]));
      const shape: Record<string, z.ZodType> = {};
      for (const c of Object.keys(cols).filter((k) => !cfg.readonly.includes(k))) shape[c] = (cols[c]!.nullable ? ZT[cols[c]!.type].nullable() : ZT[cols[c]!.type]).optional();
      return { cols, body: z.object(shape).strict() as unknown as z.ZodType<Record<string, unknown>> };
    })().catch((e) => { cached = null; throw e; }));
    const parse = async (raw: unknown) => {
      const p = (await meta()).body.safeParse(raw);
      if (!p.success) throw AppError.validation("Solicitud inválida", p.error.issues.map((i) => ({ field: i.path.join("."), issue: i.message })));
      return p.data;
    };
    const body = z.record(z.string(), z.any());
    const base = `/admin/${cfg.table}`;
    const idp = cfg.pk === "id" ? z.object({ id: z.string().uuid() }) : z.object({ id: z.string().regex(/^[a-z][a-z0-9_]{1,40}$/) });
    const hide = { tags: ["admin"], security: bearer };
    const ser = (cols: Record<string, { type: ColType }>, k: string, v: unknown) => (cols[k]!.type === "jsonb" && v !== null && v !== undefined ? JSON.stringify(v) : v);
    const check = cfg.check ?? (() => undefined);

    r.get(base, { onRequest: admin, schema: { ...hide, summary: `${cfg.label}: lista`, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) }) } }, async (req) => {
      const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${cfg.table}`)).rows[0]!.n;
      const list = await db.query(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.order} LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`);
      return { data: list.rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
    });
    r.post(base, { onRequest: admin, schema: { ...hide, summary: `${cfg.label}: crear`, body } }, async (req, reply) => {
      const data = await parse(req.body);
      const { cols } = await meta();
      check(data);
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (!keys.length) throw AppError.validation("Envía al menos un campo");
      try {
        const row = (await db.query(`INSERT INTO ${cfg.table} (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`, keys.map((k) => ser(cols, k, data[k])))).rows[0];
        await audit(db, { actor: req.user!.id, action: `admin.${cfg.table}.create`, entity: cfg.table, id: String(row[cfg.pk]), ip: req.ip });
        reply.code(201);
        return { data: row };
      } catch (e) { pgError(e); }
    });
    r.patch(`${base}/:id`, { onRequest: admin, schema: { ...hide, summary: `${cfg.label}: editar`, params: idp, body } }, async (req) => {
      const data = await parse(req.body);
      const { cols } = await meta();
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (!keys.length) throw AppError.validation("No hay cambios que guardar");
      const cur = (await db.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.pk} = $1`, [req.params.id])).rows[0];
      if (!cur) throw AppError.notFound(cfg.label);
      check(data, cur);
      try {
        const row = (await db.query(`UPDATE ${cfg.table} SET ${keys.map((k, i) => `"${k}" = $${i + 2}`).join(", ")}${cols.updated_at ? ", updated_at = now()" : ""} WHERE ${cfg.pk} = $1 RETURNING *`, [req.params.id, ...keys.map((k) => ser(cols, k, data[k]))])).rows[0];
        await audit(db, { actor: req.user!.id, action: `admin.${cfg.table}.update`, entity: cfg.table, id: req.params.id, meta: { fields: keys }, ip: req.ip });
        return { data: row };
      } catch (e) { pgError(e); }
    });
    r.delete(`${base}/:id`, { onRequest: admin, schema: { ...hide, summary: `${cfg.label}: borrar`, params: idp } }, async (req, reply) => {
      try {
        if (!(await db.query(`DELETE FROM ${cfg.table} WHERE ${cfg.pk} = $1`, [req.params.id])).rowCount) throw AppError.notFound(cfg.label);
      } catch (e) { if (e instanceof AppError) throw e; pgError(e); }
      await audit(db, { actor: req.user!.id, action: `admin.${cfg.table}.delete`, entity: cfg.table, id: req.params.id, ip: req.ip });
      reply.code(204);
      return null;
    });
  }
}
