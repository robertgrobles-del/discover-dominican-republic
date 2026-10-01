import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../../lib/audit.js";

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const STATUS = ["open", "in_progress", "resolved", "closed"] as const;
const PRIORITY = ["low", "medium", "high", "urgent"] as const;
const ref = (id: string) => id.slice(0, 8).toUpperCase();

/** Soporte desde el panel (docs §5.17): bandeja, asignación, respuestas al usuario (con aviso y correo), notas internas y métricas. */
export async function adminSupportRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const staff = app.requireRole("admin", "moderator");
  const tag = ["admin", "soporte"];
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  const ticket = async (id: string) => {
    const t = (await db.query("SELECT t.id, t.user_id, t.subject, t.description, t.status, t.priority, t.category, t.assigned_to, t.created_at, t.updated_at, t.first_response_at, t.resolved_at, u.email, u.locale, p.display_name FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id LEFT JOIN profiles p ON p.id = t.user_id WHERE t.id = $1", [id])).rows[0];
    if (!t) throw AppError.notFound("Ticket");
    return t;
  };

  r.get("/admin/support/tickets", {
    onRequest: staff,
    schema: {
      tags: tag, summary: "Bandeja de soporte (lo más urgente y antiguo primero)", security: bearer,
      querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(30), status: z.enum(STATUS).optional(), priority: z.enum(PRIORITY).optional(), assigned_to: z.string().uuid().optional(), unassigned: z.enum(["true"]).optional(), q: z.string().trim().max(100).optional() }),
      response: { 200: paged },
    },
  }, async (req) => {
    const q = req.query;
    const p = [q.status ?? null, q.priority ?? null, q.assigned_to ?? null, q.unassigned === "true", q.q ? `%${q.q.replace(/[\\%_]/g, "\\$&")}%` : null];
    const w = "($1::text IS NULL OR t.status = $1) AND ($2::text IS NULL OR t.priority = $2) AND ($3::uuid IS NULL OR t.assigned_to = $3) AND (NOT $4 OR t.assigned_to IS NULL) AND ($5::text IS NULL OR t.subject ILIKE $5 OR u.email ILIKE $5)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT t.id, t.subject, t.status, t.priority, t.category, t.assigned_to, t.created_at, t.updated_at, u.email, pr.display_name,
              (SELECT count(*)::int FROM support_messages m WHERE m.ticket_id = t.id AND NOT m.internal) AS messages, t.first_response_at
         FROM support_tickets t LEFT JOIN users u ON u.id = t.user_id LEFT JOIN profiles pr ON pr.id = t.user_id WHERE ${w}
        ORDER BY (t.status IN ('resolved', 'closed')), CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.created_at LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, p,
    );
    return { data: rows.map((x) => ({ ...x, reference: ref(x.id) })), meta: pageMeta(q.page, q.per_page, total) };
  });

  r.get("/admin/support/tickets/:id", { onRequest: staff, schema: { tags: tag, summary: "Ticket con toda la conversación, incluidas las notas internas", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const t = await ticket(req.params.id);
    const messages = (await db.query("SELECT m.id, m.message, m.is_admin_reply, m.internal, m.sender_id, p.display_name AS sender_name, m.created_at FROM support_messages m LEFT JOIN profiles p ON p.id = m.sender_id WHERE m.ticket_id = $1 ORDER BY m.created_at", [t.id])).rows;
    return { data: { ...t, reference: ref(t.id), messages } };
  });

  r.patch("/admin/support/tickets/:id", {
    onRequest: staff,
    schema: { tags: tag, summary: "Cambia estado, prioridad o asignación (quien atiende debe ser personal). Al resolver se avisa a la persona", security: bearer, params: uuid, body: z.object({ status: z.enum(STATUS), priority: z.enum(PRIORITY), assigned_to: z.string().uuid().nullable() }).partial().strict(), response: { 200: ok } },
  }, async (req) => {
    const t = await ticket(req.params.id);
    const b = req.body;
    if (!Object.keys(b).length) throw AppError.validation("No hay cambios que guardar");
    if (b.assigned_to && !(await db.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role::text IN ('admin', 'moderator')", [b.assigned_to])).rowCount) throw AppError.validation("Sólo se puede asignar a personal de soporte (admin o moderador)", { field: "assigned_to" });
    const sets: string[] = ["updated_at = now()"], p: unknown[] = [t.id];
    const bind = (v: unknown) => { p.push(v); return `$${p.length}`; };
    if (b.status) sets.push(`status = ${bind(b.status)}`, `resolved_at = ${["resolved", "closed"].includes(b.status) ? "coalesce(resolved_at, now())" : "NULL"}`);
    if (b.priority) sets.push(`priority = ${bind(b.priority)}`);
    if (b.assigned_to !== undefined) sets.push(`assigned_to = ${bind(b.assigned_to)}`);
    await db.query(`UPDATE support_tickets SET ${sets.join(", ")} WHERE id = $1`, p);
    await audit(db, { actor: req.user!.id, action: "support.ticket_updated", entity: "support_ticket", id: t.id, meta: b, ip: req.ip });
    if (b.status === "resolved" && t.status !== "resolved") await app.notifications.notify(t.user_id, { type: "system", title: "Resolvimos tu ticket", message: t.subject, link: `/soporte/${t.id}`, data: { ticket_id: t.id } });
    const after = await ticket(t.id);
    return { data: { ...after, reference: ref(after.id) } };
  });

  r.post("/admin/support/tickets/:id/messages", {
    onRequest: staff, config: rl(120, "1 hour"),
    schema: { tags: tag, summary: "Responde al usuario (aviso en su bandeja y correo) o deja una nota interna que él no ve", security: bearer, params: uuid, body: z.object({ message: z.string().trim().min(1).max(4000), internal: z.boolean().default(false) }), response: { 201: ok } },
  }, async (req, reply) => {
    const t = await ticket(req.params.id);
    if (t.status === "closed") throw new AppError("BUSINESS_RULE", "El ticket está cerrado", { code: "TICKET_CLOSED" });
    const m = (await db.query<{ id: string }>("INSERT INTO support_messages (ticket_id, sender_id, message, is_admin_reply, internal) VALUES ($1,$2,$3,true,$4) RETURNING id", [t.id, req.user!.id, req.body.message, req.body.internal])).rows[0]!;
    if (!req.body.internal) {
      await db.query("UPDATE support_tickets SET updated_at = now(), first_response_at = coalesce(first_response_at, now()), status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END, assigned_to = coalesce(assigned_to, $2) WHERE id = $1", [t.id, req.user!.id]);
      await app.notifications.notify(t.user_id, { type: "system", title: `Respuesta a tu ticket: ${t.subject}`.slice(0, 200), message: req.body.message, link: `/soporte/${t.id}`, data: { ticket_id: t.id } });
      if (t.email) await app.mailer.send({ to: t.email, template: "support.reply", locale: (t.locale as "es" | "en") ?? "es", data: { name: (t.display_name ?? "").split(" ")[0] || "hola", reference: ref(t.id), message: req.body.message.slice(0, 1500), url: `${app.env.WEB_BASE_URL}/soporte/${t.id}` }, userId: t.user_id });
    } else await db.query("UPDATE support_tickets SET updated_at = now() WHERE id = $1", [t.id]);
    await audit(db, { actor: req.user!.id, action: req.body.internal ? "support.note_added" : "support.replied", entity: "support_ticket", id: t.id, ip: req.ip });
    reply.code(201);
    return { data: { id: m.id, internal: req.body.internal } };
  });

  r.get("/admin/support/stats", { onRequest: staff, schema: { tags: tag, summary: "Pendientes por estado y prioridad, sin asignar, antigüedad y tiempo medio de primera respuesta (30 días)", security: bearer, response: { 200: ok } } }, async () => {
    const by = async (col: "status" | "priority") => Object.fromEntries((await db.query<{ k: string; n: number }>(`SELECT ${col} AS k, count(*)::int AS n FROM support_tickets ${col === "priority" ? "WHERE status IN ('open', 'in_progress')" : ""} GROUP BY 1`)).rows.map((x) => [x.k, x.n]));
    const s = (await db.query<{ unassigned: number; oldest_hours: number | null; avg_first_response_hours: number | null; resolved_30d: number }>(
      `SELECT count(*) FILTER (WHERE status IN ('open', 'in_progress') AND assigned_to IS NULL)::int AS unassigned,
              round((extract(epoch FROM now() - min(created_at) FILTER (WHERE status IN ('open', 'in_progress'))) / 3600)::numeric, 1)::float8 AS oldest_hours,
              round((avg(extract(epoch FROM first_response_at - created_at)) FILTER (WHERE first_response_at IS NOT NULL AND created_at > now() - interval '30 days') / 3600)::numeric, 1)::float8 AS avg_first_response_hours,
              count(*) FILTER (WHERE resolved_at > now() - interval '30 days')::int AS resolved_30d
         FROM support_tickets`,
    )).rows[0]!;
    return { data: { by_status: await by("status"), open_by_priority: await by("priority"), ...s } };
  });
}
