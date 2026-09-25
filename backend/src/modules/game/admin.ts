import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { normalizeType, type ColType } from "../content/manifest-reader.js";
import { audit } from "../operators/team.js";

interface Cfg { table: string; pk: "id" | "action"; readonly: string[]; order: string; label: string }
const CONFIGS: Cfg[] = [
  { table: "achievements", pk: "id", readonly: ["id", "created_at", "updated_at", "total_unlocked"], order: "display_order, name", label: "Logros" },
  { table: "gamification_levels", pk: "id", readonly: ["id", "created_at"], order: "level_number", label: "Niveles" },
  { table: "gamification_missions", pk: "id", readonly: ["id", "created_at"], order: "mission_type, name", label: "Misiones" },
  { table: "gamification_prizes", pk: "id", readonly: ["id", "created_at", "updated_at", "quantity_redeemed"], order: "coin_cost", label: "Premios" },
  { table: "gamification_rules", pk: "action", readonly: ["updated_at"], order: "action", label: "Reglas de puntos" },
  { table: "trivia_questions", pk: "id", readonly: ["id", "created_at", "updated_at", "times_answered", "times_correct"], order: "created_at DESC", label: "Preguntas de trivia" },
  { table: "xp_milestones", pk: "id", readonly: ["id"], order: "xp_threshold", label: "Hitos de XP" },
  { table: "gamification_seasons", pk: "id", readonly: ["id", "created_at", "is_active"], order: "number DESC", label: "Temporadas" },
  { table: "gamification_leagues", pk: "id", readonly: ["id", "created_at"], order: "display_order", label: "Ligas" },
];

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

/** Administración de la configuración del juego (docs §5.17): logros, misiones, premios, niveles, reglas, trivia, hitos, temporadas y ligas. */
export async function gameAdminRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");

  for (const cfg of CONFIGS) {
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
    const check = (data: Record<string, unknown>, existing?: Record<string, unknown>) => {
      if (cfg.table === "trivia_questions") {
        const options = (data.options ?? existing?.options) as unknown[] | undefined, idx = (data.correct_index ?? existing?.correct_index) as number | undefined;
        if (options !== undefined && (!Array.isArray(options) || options.length < 2 || options.length > 6 || options.some((o) => typeof o !== "string"))) throw AppError.validation("La pregunta necesita de 2 a 6 opciones de texto");
        if (options && idx !== undefined && (idx < 0 || idx >= options.length)) throw AppError.validation("correct_index no corresponde a ninguna opción");
      }
      if (cfg.table === "gamification_seasons" && data.starts_at && data.ends_at && String(data.ends_at) <= String(data.starts_at)) throw AppError.validation("La temporada debe terminar después de empezar");
    };

    r.get(base, { preHandler: admin, schema: { ...hide, summary: `${cfg.label}: lista`, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) }) } }, async (req) => {
      const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${cfg.table}`)).rows[0]!.n;
      const list = await db.query(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.order} LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`);
      return { data: list.rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
    });
    r.post(base, { preHandler: admin, schema: { ...hide, summary: `${cfg.label}: crear`, body } }, async (req, reply) => {
      const data = await parse(req.body);
      const { cols } = await meta();
      check(data);
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (!keys.length) throw AppError.validation("Envía al menos un campo");
      try {
        const row = (await db.query(`INSERT INTO ${cfg.table} (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`, keys.map((k) => ser(cols, k, data[k])))).rows[0];
        await audit(db, { actor: req.user!.id, action: `game_config.${cfg.table}.create`, entity: cfg.table, id: String(row[cfg.pk]), ip: req.ip });
        reply.code(201);
        return { data: row };
      } catch (e) { pgError(e); }
    });
    r.patch(`${base}/:id`, { preHandler: admin, schema: { ...hide, summary: `${cfg.label}: editar`, params: idp, body } }, async (req) => {
      const data = await parse(req.body);
      const { cols } = await meta();
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      if (!keys.length) throw AppError.validation("No hay cambios que guardar");
      const cur = (await db.query(`SELECT * FROM ${cfg.table} WHERE ${cfg.pk} = $1`, [req.params.id])).rows[0];
      if (!cur) throw AppError.notFound(cfg.label);
      check(data, cur);
      try {
        const row = (await db.query(`UPDATE ${cfg.table} SET ${keys.map((k, i) => `"${k}" = $${i + 2}`).join(", ")}${cols.updated_at ? ", updated_at = now()" : ""} WHERE ${cfg.pk} = $1 RETURNING *`, [req.params.id, ...keys.map((k) => ser(cols, k, data[k]))])).rows[0];
        await audit(db, { actor: req.user!.id, action: `game_config.${cfg.table}.update`, entity: cfg.table, id: req.params.id, meta: { fields: keys }, ip: req.ip });
        return { data: row };
      } catch (e) { pgError(e); }
    });
    r.delete(`${base}/:id`, { preHandler: admin, schema: { ...hide, summary: `${cfg.label}: borrar`, params: idp } }, async (req, reply) => {
      try {
        if (!(await db.query(`DELETE FROM ${cfg.table} WHERE ${cfg.pk} = $1`, [req.params.id])).rowCount) throw AppError.notFound(cfg.label);
      } catch (e) { if (e instanceof AppError) throw e; pgError(e); }
      await audit(db, { actor: req.user!.id, action: `game_config.${cfg.table}.delete`, entity: cfg.table, id: req.params.id, ip: req.ip });
      reply.code(204);
      return null;
    });
  }
}
