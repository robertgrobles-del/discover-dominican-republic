import { isIP } from "node:net";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import type { FlagService } from "../../lib/flags.js";
import { pageMeta } from "../../lib/pagination.js";
import { evaluate, ipInCidr, type IpRule, type IpRuleService } from "../../plugins/ip-rules.js";
import { audit } from "../operators/team.js";

declare module "fastify" { interface FastifyInstance { flags: FlagService; ipRules: IpRuleService } }

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) };
const flagName = z.string().regex(/^[a-z][a-z0-9_]{1,39}$/, "Sólo minúsculas, números y _");
const cidrSchema = z.string().trim().max(64).refine((v) => { const [ip, bits] = v.split("/"); return !!ip && isIP(ip) > 0 && (bits === undefined || (/^\d{1,3}$/.test(bits) && Number(bits) <= (isIP(ip) === 6 ? 128 : 32))); }, "Indica una IP o un rango válido (1.2.3.4, 10.0.0.0/8, 2001:db8::/32)");

/** Seguridad y operación del panel (docs §5.17): banderas antifraude de usuarios, reglas de IP y banderas de funciones. */
export async function adminSecurityRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin"), mod = app.requireRole("admin", "moderator");
  const tag = ["admin", "seguridad"];

  // ---------- Banderas de usuario ----------
  r.get("/admin/user-flags", { onRequest: mod, schema: { tags: tag, summary: "Banderas antifraude de usuarios", security: bearer, querystring: z.object({ ...pageQ, user_id: z.string().uuid().optional(), flag_name: flagName.optional() }), response: { 200: paged } } }, async (req) => {
    const p = [req.query.user_id ?? null, req.query.flag_name ?? null];
    const w = "($1::uuid IS NULL OR f.user_id = $1) AND ($2::text IS NULL OR f.flag_name = $2)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM user_flags f WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT f.id, f.user_id, u.email, pr.display_name, f.flag_name, f.value, f.note, f.created_by, f.created_at, f.updated_at FROM user_flags f JOIN users u ON u.id = f.user_id LEFT JOIN profiles pr ON pr.id = f.user_id WHERE ${w} ORDER BY f.updated_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/user-flags", { onRequest: mod, schema: { tags: tag, summary: "Marca a un usuario (si ya tiene esa bandera, actualiza el valor y la nota)", security: bearer, body: z.object({ user_id: z.string().uuid(), flag_name: flagName, value: z.string().trim().max(200).optional(), note: z.string().trim().max(500).optional() }), response: { 201: ok } } }, async (req, reply) => {
    if (!(await db.query("SELECT 1 FROM users WHERE id = $1", [req.body.user_id])).rowCount) throw AppError.notFound("Usuario");
    const row = (await db.query("INSERT INTO user_flags (user_id, flag_name, value, note, created_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, flag_name) DO UPDATE SET value = EXCLUDED.value, note = EXCLUDED.note, updated_at = now() RETURNING id, user_id, flag_name, value, note", [req.body.user_id, req.body.flag_name, req.body.value ?? null, req.body.note ?? null, req.user!.id])).rows[0];
    await audit(db, { actor: req.user!.id, action: "user.flag_set", entity: "user", id: req.body.user_id, meta: { flag: req.body.flag_name }, ip: req.ip });
    reply.code(201);
    return { data: row };
  });
  r.patch("/admin/user-flags/:id", { onRequest: mod, schema: { tags: tag, summary: "Cambia el valor o la nota de una bandera", security: bearer, params: uuid, body: z.object({ value: z.string().trim().max(200).nullable(), note: z.string().trim().max(500).nullable() }).partial().strict(), response: { 200: ok } } }, async (req) => {
    const e = Object.entries(req.body).filter(([, v]) => v !== undefined);
    if (!e.length) throw AppError.validation("No hay cambios que guardar");
    const row = (await db.query(`UPDATE user_flags SET ${e.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1 RETURNING id, user_id, flag_name, value, note`, [req.params.id, ...e.map(([, v]) => v)])).rows[0];
    if (!row) throw AppError.notFound("Bandera");
    await audit(db, { actor: req.user!.id, action: "user.flag_updated", entity: "user", id: row.user_id, meta: { flag: row.flag_name }, ip: req.ip });
    return { data: row };
  });
  r.delete("/admin/user-flags/:id", { onRequest: mod, schema: { tags: tag, summary: "Quita una bandera", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const row = (await db.query("DELETE FROM user_flags WHERE id = $1 RETURNING user_id, flag_name", [req.params.id])).rows[0];
    if (!row) throw AppError.notFound("Bandera");
    await audit(db, { actor: req.user!.id, action: "user.flag_removed", entity: "user", id: row.user_id, meta: { flag: row.flag_name }, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---------- Reglas de IP ----------
  const rules = async () => (await db.query<IpRule & { note: string | null; expires_at: Date | null; created_at: Date }>("SELECT id, cidr::text AS cidr, action, scope, note, expires_at, created_at FROM ip_rules WHERE expires_at IS NULL OR expires_at > now() ORDER BY created_at DESC")).rows;
  r.get("/admin/ip-rules", { onRequest: admin, schema: { tags: tag, summary: "Reglas de IP vigentes y tu dirección actual", security: bearer, response: { 200: ok } } }, async (req) => ({ data: { your_ip: req.ip, rules: await rules() } }));
  r.post("/admin/ip-rules", {
    onRequest: admin,
    schema: { tags: tag, summary: "Bloquea una IP o rango (`deny`), o restringe el panel a una lista de direcciones (`allow` con alcance `admin`). Rechaza reglas que te dejarían fuera", security: bearer, body: z.object({ cidr: cidrSchema, action: z.enum(["allow", "deny"]), scope: z.enum(["all", "admin"]).default("all"), note: z.string().trim().max(300).optional(), expires_at: z.string().datetime({ offset: true }).optional() }), response: { 201: ok } },
  }, async (req, reply) => {
    const b = req.body;
    if (b.action === "allow" && b.scope !== "admin") throw AppError.validation("Una regla `allow` sólo aplica al panel (scope = admin)");
    if (b.expires_at && new Date(b.expires_at).getTime() <= Date.now()) throw AppError.validation("La fecha de vencimiento ya pasó");
    // Antes de guardar se comprueba que quien la crea no se quede fuera del panel (ni del API).
    const candidate: IpRule = { id: "nuevo", cidr: b.cidr, action: b.action, scope: b.scope };
    const after = [...(await rules()), candidate];
    const verdict = evaluate(after, req.ip, true);
    if (verdict !== "ok" || evaluate(after, req.ip, false) !== "ok") throw new AppError("BUSINESS_RULE", "Esta regla bloquearía tu propia dirección; agrega primero tu IP a la lista de permitidos", { code: "SELF_LOCKOUT", your_ip: req.ip });
    const row = (await db.query("INSERT INTO ip_rules (cidr, action, scope, note, expires_at, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, cidr::text AS cidr, action, scope, note, expires_at", [b.cidr, b.action, b.scope, b.note ?? null, b.expires_at ?? null, req.user!.id])).rows[0];
    app.ipRules.clear();
    await audit(db, { actor: req.user!.id, action: "security.ip_rule_added", entity: "ip_rule", id: row.id, meta: { cidr: b.cidr, action: b.action, scope: b.scope }, ip: req.ip });
    reply.code(201);
    return { data: row };
  });
  r.delete("/admin/ip-rules/:id", { onRequest: admin, schema: { tags: tag, summary: "Quita una regla (no permite dejar tu propia IP fuera de una lista de permitidos)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const all = await rules();
    const target = all.find((x) => x.id === req.params.id);
    if (!target) throw AppError.notFound("Regla");
    if (evaluate(all.filter((x) => x.id !== target.id), req.ip, true) !== "ok") throw new AppError("BUSINESS_RULE", "Quitar esta regla te dejaría fuera del panel", { code: "SELF_LOCKOUT", your_ip: req.ip });
    await db.query("DELETE FROM ip_rules WHERE id = $1", [req.params.id]);
    app.ipRules.clear();
    await audit(db, { actor: req.user!.id, action: "security.ip_rule_removed", entity: "ip_rule", id: req.params.id, meta: { cidr: target.cidr }, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---------- Banderas de funciones ----------
  r.get("/admin/system/feature-flags", { onRequest: admin, schema: { tags: tag, summary: "Banderas de funciones", security: bearer, response: { 200: ok } } }, async () => ({ data: (await db.query("SELECT key, enabled, description, is_public, updated_at FROM feature_flags ORDER BY key")).rows }));
  r.put("/admin/system/feature-flags", {
    onRequest: admin,
    schema: { tags: tag, summary: "Enciende o apaga funciones (crea la bandera si no existe). Rige en segundos", security: bearer, body: z.object({ flags: z.array(z.object({ key: z.string().regex(/^[a-z][a-z0-9_]{1,59}$/), enabled: z.boolean(), description: z.string().trim().max(200).optional(), is_public: z.boolean().optional() })).min(1).max(50) }), response: { 200: ok } },
  }, async (req) => {
    for (const f of req.body.flags) {
      await db.query(
        `INSERT INTO feature_flags (key, enabled, description, is_public, updated_by) VALUES ($1,$2,$3,coalesce($4, false),$5)
         ON CONFLICT (key) DO UPDATE SET enabled = EXCLUDED.enabled, description = coalesce($3, feature_flags.description), is_public = coalesce($4, feature_flags.is_public), updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [f.key, f.enabled, f.description ?? null, f.is_public ?? null, req.user!.id],
      );
    }
    app.flags.clear();
    await audit(db, { actor: req.user!.id, action: "system.flags_changed", entity: "feature_flag", id: null, meta: { flags: Object.fromEntries(req.body.flags.map((f) => [f.key, f.enabled])) }, ip: req.ip });
    return { data: (await db.query("SELECT key, enabled, description, is_public, updated_at FROM feature_flags ORDER BY key")).rows };
  });
  r.get("/feature-flags", { schema: { tags: ["config"], summary: "Banderas públicas (el frontend oculta lo que esté apagado)", response: { 200: ok } } }, async (_q, reply) => {
    reply.header("cache-control", "public, max-age=15");
    return { data: Object.fromEntries((await db.query<{ key: string; enabled: boolean }>("SELECT key, enabled FROM feature_flags WHERE is_public ORDER BY key")).rows.map((x) => [x.key, x.enabled])) };
  });
}

void ipInCidr;
