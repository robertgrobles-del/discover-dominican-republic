import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";

const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const locale = z.enum(["es", "en", "fr", "de", "pt", "it"]);
const mailLocale = (l: string | undefined) => (l === "en" ? "en" : "es");
const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });

/** Token de baja sin estado: `<correo en base64url>.<HMAC>`. Sirve para enlaces de campañas sin guardar un token por envío. */
export const unsubscribeToken = (secret: string, mail: string) => `${Buffer.from(mail).toString("base64url")}.${createHmac("sha256", secret).update(`unsub:${mail}`).digest("base64url").slice(0, 32)}`;
export function verifyUnsubscribeToken(secret: string, token: string): string | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const mail = Buffer.from(b64, "base64url").toString("utf8");
  const expected = createHmac("sha256", secret).update(`unsub:${mail}`).digest("base64url").slice(0, 32);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? mail : null;
}

/** Captación y soporte (docs §5.6): newsletter con doble opt-in, contacto, tickets, leads y alta de establecimientos. */
export async function formsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const secret = app.env.APP_SECRET!;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };

  // ---------- Newsletter ----------
  r.post("/newsletter/subscribe", {
    config: rl(10, "1 hour"),
    schema: { tags: ["formularios"], summary: "Suscribirse (doble opt-in por correo)", body: z.object({ email, name: z.string().trim().max(80).optional(), lists: z.array(z.string().trim().max(40)).max(10).optional(), locale: locale.optional(), source: z.string().trim().max(60).optional(), website: z.string().max(200).optional() }), response: { 202: ok } },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    const generic = { data: { message: "Si el correo es válido, te enviamos un enlace para confirmar tu suscripción." } };
    if (b.website) return generic; // campo trampa: los bots lo llenan
    const cur = (await db.query<{ is_active: boolean; confirmed_at: Date | null }>("SELECT is_active, confirmed_at FROM newsletter_subscribers WHERE email = $1", [b.email])).rows[0];
    if (cur?.is_active && cur.confirmed_at) return generic; // ya suscrito: no se revela ni se reenvía
    const token = randomBytes(24).toString("base64url");
    await db.query(
      `INSERT INTO newsletter_subscribers (email, nombre, lists, locale, source, is_active, confirm_hash, confirmed_at, unsubscribed_at) VALUES ($1,$2,$3,$4,$5,false,$6,NULL,NULL)
       ON CONFLICT (email) DO UPDATE SET nombre = coalesce(EXCLUDED.nombre, newsletter_subscribers.nombre), lists = EXCLUDED.lists, locale = EXCLUDED.locale, is_active = false, confirm_hash = EXCLUDED.confirm_hash, confirmed_at = NULL, unsubscribed_at = NULL`,
      [b.email, b.name ?? null, b.lists ?? [], b.locale ?? "es", b.source ?? null, sha(token)],
    );
    await app.mailer.send({ to: b.email, template: "newsletter.confirm", locale: mailLocale(b.locale), data: { url: `${app.env.WEB_BASE_URL}/newsletter/confirmar?token=${token}` } });
    return generic;
  });
  const confirm = async (token: string) => {
    const res = await db.query("UPDATE newsletter_subscribers SET is_active = true, confirmed_at = now(), confirm_hash = NULL WHERE confirm_hash = $1 RETURNING email", [sha(token)]);
    if (!res.rowCount) throw new AppError("NOT_FOUND", "El enlace no es válido o ya se usó");
    return { data: { confirmed: true } };
  };
  const unsubscribe = async (token: string) => {
    const mail = verifyUnsubscribeToken(secret, token);
    if (!mail) throw new AppError("NOT_FOUND", "El enlace no es válido");
    await db.query("UPDATE newsletter_subscribers SET is_active = false, unsubscribed_at = now() WHERE email = $1", [mail]);
    return { data: { unsubscribed: true } };
  };
  const tokenQ = z.object({ token: z.string().min(10).max(200) });
  r.get("/newsletter/confirm", { config: rl(30, "1 minute"), schema: { tags: ["formularios"], summary: "Confirma la suscripción", querystring: tokenQ, response: { 200: ok } } }, async (req) => confirm(req.query.token));
  r.post("/newsletter/confirm", { config: rl(30, "1 minute"), schema: { tags: ["formularios"], summary: "Confirma la suscripción (POST)", body: tokenQ, response: { 200: ok } } }, async (req) => confirm(req.body.token));
  r.get("/newsletter/unsubscribe", { config: rl(30, "1 minute"), schema: { tags: ["formularios"], summary: "Baja con un clic", querystring: tokenQ, response: { 200: ok } } }, async (req) => unsubscribe(req.query.token));
  r.post("/newsletter/unsubscribe", { config: rl(30, "1 minute"), schema: { tags: ["formularios"], summary: "Baja con un clic (POST, para el encabezado List-Unsubscribe-Post)", body: tokenQ, response: { 200: ok } } }, async (req) => unsubscribe(req.body.token));

  // ---------- Contacto y soporte ----------
  const CATEGORIES = ["contact", "suggestion", "press", "creators", "influencers", "support", "other"] as const;
  const ackTicket = async (to: string, name: string, ticketId: string, subject: string, loc: string | undefined) =>
    app.mailer.send({ to, template: "support.received", locale: mailLocale(loc), data: { name: name.split(" ")[0]!, reference: ticketId.slice(0, 8).toUpperCase(), subject } });

  r.post("/contact", {
    preHandler: optionalUser, config: rl(5, "1 hour"),
    schema: { tags: ["formularios"], summary: "Formulario de contacto, sugerencias, prensa y creadores", body: z.object({ name: z.string().trim().min(2).max(100), email, category: z.enum(CATEGORIES).default("contact"), subject: z.string().trim().min(3).max(150), message: z.string().trim().min(10).max(4000), locale: locale.optional(), website: z.string().max(200).optional() }), response: { 202: ok } },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    if (b.website) return { data: { received: true } };
    const t = (await db.query<{ id: string }>("INSERT INTO support_tickets (user_id, subject, description, category, contact_name, contact_email) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [req.user?.id ?? null, b.subject, b.message, b.category, b.name, b.email])).rows[0]!;
    await ackTicket(b.email, b.name, t.id, b.subject, b.locale);
    return { data: { received: true, reference: t.id.slice(0, 8).toUpperCase() } };
  });

  const ticketBody = z.object({ subject: z.string().trim().min(3).max(150), description: z.string().trim().min(10).max(4000), priority: z.enum(["low", "medium", "high"]).default("medium"), category: z.enum(CATEGORIES).default("support") });
  r.post("/support/tickets", { preHandler: app.authenticate, config: rl(10, "1 hour"), schema: { tags: ["soporte"], summary: "Abre un ticket", security: bearer, body: ticketBody, response: { 201: ok } } }, async (req, reply) => {
    const u = (await db.query<{ email: string; name: string | null; locale: string }>("SELECT u.email, p.display_name AS name, u.locale FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [req.user!.id])).rows[0]!;
    const b = req.body;
    const t = (await db.query<{ id: string }>("INSERT INTO support_tickets (user_id, subject, description, priority, category, contact_name, contact_email) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id", [req.user!.id, b.subject, b.description, b.priority, b.category, u.name ?? u.email, u.email])).rows[0]!;
    await ackTicket(u.email, u.name ?? u.email, t.id, b.subject, u.locale);
    reply.code(201);
    return { data: { id: t.id } };
  });
  r.get("/support/tickets", { preHandler: app.authenticate, schema: { tags: ["soporte"], summary: "Mis tickets", security: bearer, querystring: z.object({ page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(50).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM support_tickets WHERE user_id = $1", [req.user!.id])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, subject, status, priority, category, created_at, updated_at FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.user!.id]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  const ownTicket = async (userId: string, id: string) => {
    const t = (await db.query("SELECT id, subject, description, status, priority, category, created_at, updated_at FROM support_tickets WHERE id = $1 AND user_id = $2", [id, userId])).rows[0];
    if (!t) throw AppError.notFound("Ticket"); // no se distingue "no existe" de "no es tuyo"
    return t;
  };
  r.get("/support/tickets/:id", { preHandler: app.authenticate, schema: { tags: ["soporte"], summary: "Conversación de un ticket", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const t = await ownTicket(req.user!.id, req.params.id);
    const messages = (await db.query("SELECT id, message, is_admin_reply, created_at FROM support_messages WHERE ticket_id = $1 ORDER BY created_at", [t.id])).rows;
    return { data: { ...t, messages } };
  });
  r.post("/support/tickets/:id/messages", { preHandler: app.authenticate, config: rl(30, "1 hour"), schema: { tags: ["soporte"], summary: "Responde en mi ticket", security: bearer, params: uuid, body: z.object({ message: z.string().trim().min(1).max(4000) }), response: { 201: ok } } }, async (req, reply) => {
    const t = await ownTicket(req.user!.id, req.params.id);
    if (t.status === "closed") throw new AppError("BUSINESS_RULE", "El ticket está cerrado; abre uno nuevo", { code: "TICKET_CLOSED" });
    const m = (await db.query<{ id: string }>("INSERT INTO support_messages (ticket_id, sender_id, message, is_admin_reply) VALUES ($1,$2,$3,false) RETURNING id", [t.id, req.user!.id, req.body.message])).rows[0]!;
    await db.query("UPDATE support_tickets SET updated_at = now(), status = CASE WHEN status = 'resolved' THEN 'open' ELSE status END WHERE id = $1", [t.id]);
    reply.code(201);
    return { data: { id: m.id } };
  });

  // ---------- Leads ----------
  r.post("/leads", {
    config: rl(10, "1 hour"),
    schema: { tags: ["formularios"], summary: "Lead comercial (requiere consentimiento)", body: z.object({ name: z.string().trim().min(2).max(100), email, phone: z.string().trim().max(30).optional(), company: z.string().trim().max(120).optional(), message: z.string().trim().max(2000).optional(), source: z.string().trim().max(60).optional(), interest: z.string().trim().max(80).optional(), consent: z.literal(true, { error: "Debes aceptar el tratamiento de tus datos" }), website: z.string().max(200).optional() }), response: { 202: ok } },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    if (!b.website) await db.query("INSERT INTO marketing_leads (nombre, email, telefono, empresa, mensaje, source, interest, consent) VALUES ($1,$2,$3,$4,$5,$6,$7,true)", [b.name, b.email, b.phone ?? null, b.company ?? null, b.message ?? null, b.source ?? null, b.interest ?? null]);
    return { data: { received: true } };
  });

  // ---------- Alta de establecimientos ----------
  r.post("/establishments/register", {
    preHandler: optionalUser, config: rl(5, "1 hour"),
    schema: {
      tags: ["formularios"], summary: "Solicita el alta de un establecimiento (queda pendiente de revisión)",
      body: z.object({
        type: z.enum(["general", "restaurante", "bar", "hotel", "tour", "spa", "tienda"]), name: z.string().trim().min(2).max(120), contact_name: z.string().trim().min(2).max(100), email, phone: z.string().trim().min(7).max(30),
        address: z.string().trim().min(5).max(200), province: z.string().trim().min(2).max(60), website: z.string().url().max(300).optional(), photo_url: z.string().url().max(500).optional(),
        description: z.string().trim().min(10).max(3000), rnc: z.string().trim().max(20).optional(), schedule: z.string().trim().max(200).optional(), details: z.record(z.string(), z.unknown()).optional(), locale: locale.optional(), website_trap: z.string().max(200).optional(),
      }),
      response: { 202: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    if (b.website_trap) return { data: { received: true } };
    const token = randomBytes(24).toString("base64url");
    const row = (await db.query<{ id: string }>(
      `INSERT INTO establishment_registrations (tipo_establecimiento, nombre, responsable, email, telefono, direccion, provincia, website, foto_url, descripcion, rnc, horario, detalles, access_hash, user_id, locale)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
      [b.type, b.name, b.contact_name, b.email, b.phone, b.address, b.province, b.website ?? null, b.photo_url ?? null, b.description, b.rnc ?? null, b.schedule ?? null, b.details ? JSON.stringify(b.details) : null, sha(token), req.user?.id ?? null, b.locale ?? "es"],
    )).rows[0]!;
    await app.mailer.send({ to: b.email, template: "establishment.received", locale: mailLocale(b.locale), data: { name: b.contact_name.split(" ")[0]!, establishment: b.name, url: `${app.env.WEB_BASE_URL}/registro/estado?id=${row.id}&token=${token}` } });
    return { data: { received: true, id: row.id, access_token: token } };
  });
  r.get("/establishments/registrations/:id/status", { config: rl(30, "1 minute"), schema: { tags: ["formularios"], summary: "Estado de una solicitud (con su token)", params: uuid, querystring: tokenQ, response: { 200: ok } } }, async (req) => {
    const row = (await db.query("SELECT nombre, status, created_at, reviewed_at, review_note, access_hash FROM establishment_registrations WHERE id = $1", [req.params.id])).rows[0];
    if (!row || !row.access_hash || row.access_hash !== sha(req.query.token)) throw AppError.notFound("Solicitud");
    return { data: { name: row.nombre, status: row.status, created_at: row.created_at, reviewed_at: row.reviewed_at, note: row.status === "rechazado" ? row.review_note : null } };
  });
}
