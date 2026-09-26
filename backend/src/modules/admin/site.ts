import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { COLLECTIONS } from "../content/collections.js";
import { hasCol, manifest } from "../content/query.js";
import { audit } from "../operators/team.js";

const bearer = [{ bearerAuth: [] }];
const ok = z.object({ data: z.any() });
const key = z.string().regex(/^[a-z][a-z0-9_.-]{1,63}$/, "Minúsculas, números, punto, guion y guion bajo");
const localPath = z.string().regex(/^\/[^\s?#]*$/, "Debe ser una ruta que empiece con /").max(300);

/** Ajustes del sitio, redirecciones, panel de control, salud del sistema y auditoría (docs §5.17). */
export async function adminSiteRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const staff = app.requireRole("admin", "editor", "moderator");

  // ---------- Ajustes ----------
  r.get("/site/settings", { schema: { tags: ["sitio"], summary: "Ajustes públicos del sitio (textos, contacto, redes, menú…)", response: { 200: ok } } }, async (_req, reply) => {
    const { rows } = await db.query<{ key: string; value: unknown }>("SELECT key, value FROM site_settings WHERE is_public ORDER BY key");
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: Object.fromEntries(rows.map((x) => [x.key, x.value])) };
  });
  r.get("/admin/settings", { onRequest: admin, schema: { tags: ["admin"], summary: "Todos los ajustes", security: bearer, response: { 200: ok } } }, async () => ({ data: (await db.query("SELECT key, value, description, is_public, updated_at FROM site_settings ORDER BY key")).rows }));
  r.get("/admin/settings/:key", { onRequest: admin, schema: { tags: ["admin"], summary: "Un ajuste", security: bearer, params: z.object({ key }), response: { 200: ok } } }, async (req) => {
    const row = (await db.query("SELECT key, value, description, is_public, updated_at FROM site_settings WHERE key = $1", [req.params.key])).rows[0];
    if (!row) throw AppError.notFound("Ajuste");
    return { data: row };
  });
  r.put("/admin/settings/:key", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Crea o reemplaza un ajuste (JSON, máx. 64 KB)", security: bearer, params: z.object({ key }), body: z.object({ value: z.any(), is_public: z.boolean().default(false), description: z.string().max(300).optional() }), response: { 200: ok } },
  }, async (req) => {
    const json = JSON.stringify(req.body.value ?? null);
    if (req.body.value === undefined) throw AppError.validation("Falta value");
    if (json.length > 65_536) throw AppError.validation("El valor supera 64 KB");
    const row = (await db.query(
      `INSERT INTO site_settings (key, value, is_public, description, updated_by) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, is_public = EXCLUDED.is_public, description = coalesce(EXCLUDED.description, site_settings.description), updated_at = now(), updated_by = EXCLUDED.updated_by
       RETURNING key, value, description, is_public, updated_at`, [req.params.key, json, req.body.is_public, req.body.description ?? null, req.user!.id],
    )).rows[0];
    await audit(db, { actor: req.user!.id, action: "settings.updated", entity: "setting", id: req.params.key, meta: { is_public: req.body.is_public }, ip: req.ip });
    return { data: row };
  });
  r.delete("/admin/settings/:key", { onRequest: admin, schema: { tags: ["admin"], summary: "Elimina un ajuste", security: bearer, params: z.object({ key }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("DELETE FROM site_settings WHERE key = $1", [req.params.key])).rowCount) throw AppError.notFound("Ajuste");
    await audit(db, { actor: req.user!.id, action: "settings.deleted", entity: "setting", id: req.params.key, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---------- Redirecciones ----------
  const redirect = z.object({ source_path: localPath, target_path: z.string().max(500).refine((p) => p.startsWith("/") || p.startsWith("https://"), "Ruta local o URL https"), redirect_type: z.union([z.literal(301), z.literal(302)]).default(301), is_active: z.boolean().default(true) });
  r.get("/redirects", { schema: { tags: ["sitio"], summary: "Redirecciones activas (para el servidor web o el frontend)", response: { 200: ok } } }, async (_req, reply) => {
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: (await db.query("SELECT source_path AS \"from\", target_path AS \"to\", redirect_type AS status FROM seo_redirections WHERE is_active ORDER BY source_path")).rows };
  });
  r.get("/admin/seo_redirections", { onRequest: admin, schema: { tags: ["admin"], summary: "Redirecciones", security: bearer, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM seo_redirections")).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, source_path, target_path, redirect_type, is_active, created_at FROM seo_redirections ORDER BY source_path LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  const checkRedirect = async (source: string, target: string, ignoreId?: string) => {
    if (source === target) throw AppError.validation("El origen y el destino son iguales");
    // Evita bucles simples (A→B y B→A) y cadenas que vuelven al origen.
    let cur = target;
    for (let i = 0; i < 10 && cur.startsWith("/"); i++) {
      const next = (await db.query<{ target_path: string }>("SELECT target_path FROM seo_redirections WHERE source_path = $1 AND is_active AND ($2::uuid IS NULL OR id <> $2)", [cur, ignoreId ?? null])).rows[0];
      if (!next) return;
      if (next.target_path === source) throw AppError.validation("Esta redirección crearía un bucle");
      cur = next.target_path;
    }
  };
  r.post("/admin/seo_redirections", { onRequest: admin, schema: { tags: ["admin"], summary: "Crea una redirección", security: bearer, body: redirect, response: { 201: ok } } }, async (req, reply) => {
    await checkRedirect(req.body.source_path, req.body.target_path);
    try {
      const row = (await db.query("INSERT INTO seo_redirections (source_path, target_path, redirect_type, is_active, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id, source_path, target_path, redirect_type, is_active", [req.body.source_path, req.body.target_path, req.body.redirect_type, req.body.is_active, req.user!.id])).rows[0];
      await audit(db, { actor: req.user!.id, action: "redirect.created", entity: "redirect", id: row.id, meta: req.body, ip: req.ip });
      reply.code(201);
      return { data: row };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una redirección desde esa ruta", { reason: "SOURCE_TAKEN" });
      throw e;
    }
  });
  r.patch("/admin/seo_redirections/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Edita una redirección", security: bearer, params: z.object({ id: z.string().uuid() }), body: redirect.partial(), response: { 200: ok } } }, async (req) => {
    const cur = (await db.query<{ source_path: string; target_path: string }>("SELECT source_path, target_path FROM seo_redirections WHERE id = $1", [req.params.id])).rows[0];
    if (!cur) throw AppError.notFound("Redirección");
    const b = req.body;
    await checkRedirect(b.source_path ?? cur.source_path, b.target_path ?? cur.target_path, req.params.id);
    const row = (await db.query("UPDATE seo_redirections SET source_path = coalesce($2, source_path), target_path = coalesce($3, target_path), redirect_type = coalesce($4, redirect_type), is_active = coalesce($5, is_active) WHERE id = $1 RETURNING id, source_path, target_path, redirect_type, is_active", [req.params.id, b.source_path ?? null, b.target_path ?? null, b.redirect_type ?? null, b.is_active ?? null])).rows[0];
    await audit(db, { actor: req.user!.id, action: "redirect.updated", entity: "redirect", id: req.params.id, ip: req.ip });
    return { data: row };
  });
  r.delete("/admin/seo_redirections/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Elimina una redirección", security: bearer, params: z.object({ id: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("DELETE FROM seo_redirections WHERE id = $1", [req.params.id])).rowCount) throw AppError.notFound("Redirección");
    await audit(db, { actor: req.user!.id, action: "redirect.deleted", entity: "redirect", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---------- Panel de control y salud ----------
  r.get("/admin/dashboard", { onRequest: staff, schema: { tags: ["admin"], summary: "KPIs, pendientes de moderación y contenido por estado", security: bearer, response: { 200: ok } } }, async () => {
    const one = async (sql: string) => Number((await db.query<{ n: string }>(sql)).rows[0]!.n);
    const [users, newUsers, bookings30, revenue30, pendingReviews, pendingReports, reportedPosts, pendingMedia, openTickets, pendingOrgs, pendingPayouts, pendingEstablishments, failedJobs] = await Promise.all([
      one("SELECT count(*) AS n FROM users WHERE status = 'active'"), one("SELECT count(*) AS n FROM users WHERE created_at > now() - interval '7 days'"),
      one("SELECT count(*) AS n FROM bookings WHERE created_at > now() - interval '30 days' AND status <> 'cancelled'"),
      one("SELECT coalesce(sum(CASE WHEN kind = 'refund' THEN -amount ELSE amount END), 0) AS n FROM booking_payments WHERE status = 'succeeded' AND created_at > now() - interval '30 days' AND currency = 'USD'"),
      one("SELECT count(*) AS n FROM reviews WHERE status = 'pending'"), one("SELECT count(*) AS n FROM ugc_reports WHERE status = 'pendiente'"), one("SELECT count(*) AS n FROM social_posts WHERE report_count > 0 AND NOT is_active AND deleted_at IS NULL"),
      one("SELECT count(*) AS n FROM ugc_media WHERE status = 'pending'"), one("SELECT count(*) AS n FROM support_tickets WHERE status IN ('open', 'in_progress')"),
      one("SELECT count(*) AS n FROM partner_profiles WHERE verification = 'pending'"), one("SELECT count(*) AS n FROM payouts WHERE status = 'pending'"),
      one("SELECT count(*) AS n FROM establishment_registrations WHERE status = 'pendiente'"), one("SELECT count(*) AS n FROM system_cron_jobs WHERE status = 'failed'"),
    ]);
    const content: Record<string, Record<string, number>> = {};
    for (const d of COLLECTIONS) {
      if (!manifest[d.table] || !hasCol(d.table, "status")) continue;
      const { rows } = await db.query<{ status: string; n: number }>(`SELECT status, count(*)::int AS n FROM "${d.table}" ${hasCol(d.table, "deleted_at") ? "WHERE deleted_at IS NULL" : ""} GROUP BY status`);
      content[d.path] = Object.fromEntries(rows.map((x) => [x.status, x.n]));
    }
    const inReview = Object.entries(content).map(([path, s]) => ({ path, n: s.in_review ?? 0 })).filter((x) => x.n > 0);
    return { data: { users: { active: users, new_7d: newUsers }, bookings: { last_30d: bookings30, collected_usd_30d: revenue30 }, pending: { reviews: pendingReviews, ugc_reports: pendingReports, reported_posts: reportedPosts, ugc_media: pendingMedia, support_tickets: openTickets, operators_to_verify: pendingOrgs, payouts: pendingPayouts, establishment_requests: pendingEstablishments, content_in_review: inReview }, health: { failed_jobs: failedJobs }, content } };
  });

  r.get("/admin/system/health", { onRequest: admin, schema: { tags: ["admin"], summary: "Estado de la base de datos, la cola de correo y los trabajos", security: bearer, response: { 200: ok } } }, async () => {
    const t0 = Date.now();
    await db.query("SELECT 1");
    const mail = Object.fromEntries((await db.query<{ status: string; n: number }>("SELECT status, count(*)::int AS n FROM email_log WHERE created_at > now() - interval '7 days' GROUP BY status")).rows.map((x) => [x.status, x.n]));
    const oldest = (await db.query<{ age: number | null }>("SELECT extract(epoch FROM now() - min(created_at))::int AS age FROM email_log WHERE status = 'queued'")).rows[0]!.age;
    const jobs = await app.jobs.list();
    return {
      data: {
        database: { ok: true, latency_ms: Date.now() - t0 },
        mail_queue: { last_7d: mail, oldest_queued_seconds: oldest },
        jobs: jobs.map((j: { name: string; status: string; enabled: boolean; last_run_at: string | null; error_log: string | null }) => ({ name: j.name, status: j.status, enabled: j.enabled, last_run_at: j.last_run_at, error: j.error_log })),
        payments: { provider: app.gateway.name },
        version: process.env.npm_package_version ?? null, node: process.version, uptime_seconds: Math.round(process.uptime()),
      },
    };
  });

  // ---------- Auditoría ----------
  r.get("/admin/audit-logs", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Auditoría con filtros por actor, entidad, acción y fechas (?format=csv exporta)", security: bearer, querystring: z.object({ actor: z.string().uuid().optional(), entity: z.string().max(40).optional(), action: z.string().max(60).optional(), from: z.string().datetime({ offset: true }).optional(), to: z.string().datetime({ offset: true }).optional(), format: z.enum(["json", "csv"]).default("json"), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(200).default(50) }) },
  }, async (req, reply) => {
    const p: unknown[] = [], w = ["true"];
    const bind = (v: unknown) => { p.push(v); return `$${p.length}`; };
    const q = req.query;
    if (q.actor) w.push(`actor_id = ${bind(q.actor)}`);
    if (q.entity) w.push(`entity_type = ${bind(q.entity)}`);
    if (q.action) w.push(`action LIKE ${bind(`${q.action.replace(/[\\%_]/g, "\\$&")}%`)}`);
    if (q.from) w.push(`created_at >= ${bind(q.from)}`);
    if (q.to) w.push(`created_at <= ${bind(q.to)}`);
    if (q.format === "csv") {
      const { rows } = await db.query(`SELECT id, created_at, actor_id, action, entity_type, entity_id, org_id, ip, meta FROM audit_log WHERE ${w.join(" AND ")} ORDER BY id DESC LIMIT 10000`, p);
      const cell = (v: unknown) => { let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
      const names = ["id", "created_at", "actor_id", "action", "entity_type", "entity_id", "org_id", "ip", "meta"];
      reply.header("content-type", "text/csv; charset=utf-8").header("content-disposition", 'attachment; filename="auditoria.csv"');
      return [names.join(","), ...rows.map((row) => names.map((n) => cell(row[n])).join(","))].join("\r\n");
    }
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM audit_log WHERE ${w.join(" AND ")}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, created_at, actor_id, action, entity_type, entity_id, org_id, ip, meta FROM audit_log WHERE ${w.join(" AND ")} ORDER BY id DESC LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, p);
    return { data: rows, meta: pageMeta(q.page, q.per_page, total) };
  });
}
