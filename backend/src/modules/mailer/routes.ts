import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { LOCALES, type Locale } from "../../lib/i18n.js";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../operators/team.js";
import { renderOverride, renderTemplate, type TemplateKey } from "./templates.js";
import { checkOverride, NOT_EDITABLE, SAMPLES, VARS, type TemplateOverride } from "./templates-meta.js";

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const locale = z.enum(LOCALES);
const KEYS = Object.keys(VARS) as TemplateKey[];
const keyParam = z.string().refine((k): k is TemplateKey => (KEYS as string[]).includes(k), "Plantilla desconocida");
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(30) };
const overrideBody = z.object({
  subject: z.string().trim().min(1).max(200), title: z.string().trim().min(1).max(200), body_html: z.string().trim().min(1).max(20_000),
  body_text: z.string().trim().max(20_000).nullish(), cta_label: z.string().trim().max(80).nullish(), cta_var: z.string().trim().max(40).nullish(),
});
const norm = (b: z.infer<typeof overrideBody>): TemplateOverride => ({ subject: b.subject, title: b.title, body_html: b.body_html, body_text: b.body_text || null, cta_label: b.cta_label || null, cta_var: b.cta_var || null });

/** Administración del correo (docs §5.13): plantillas editables con historial, bitácora, reenvío y lista de supresión. */
export async function emailAdminRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db, mailer = app.mailer;
  const admin = app.requireRole("admin");
  const tag = ["admin", "correo"];
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const editable = (key: TemplateKey) => { if (NOT_EDITABLE.includes(key)) throw new AppError("BUSINESS_RULE", "Esta plantilla la arma el servidor y no se edita desde el panel", { code: "NOT_EDITABLE" }); };
  const validate = (key: TemplateKey, o: TemplateOverride) => { const errors = checkOverride(key, o); if (errors.length) throw AppError.validation("La plantilla tiene errores", { errors }); };
  const cols = "subject, title, body_html, body_text, cta_label, cta_var";

  // ---------- Plantillas ----------
  r.get("/admin/email/templates", { onRequest: admin, schema: { tags: tag, summary: "Plantillas, sus variables y en qué idiomas están personalizadas", security: bearer, response: { 200: ok } } }, async () => {
    const rows = (await db.query<{ key: string; locale: string; version: number; updated_at: Date }>("SELECT key, locale, version, updated_at FROM email_templates")).rows;
    return { data: KEYS.map((key) => ({ key, variables: VARS[key], editable: !NOT_EDITABLE.includes(key), customized: Object.fromEntries(rows.filter((x) => x.key === key).map((x) => [x.locale, { version: x.version, updated_at: x.updated_at }])) })) };
  });

  r.get("/admin/email/templates/:key", { onRequest: admin, schema: { tags: tag, summary: "Una plantilla: variables, datos de ejemplo, texto por defecto y versión personalizada de cada idioma", security: bearer, params: z.object({ key: keyParam }), response: { 200: ok } } }, async (req) => {
    const key = req.params.key as TemplateKey;
    const custom = (await db.query(`SELECT locale, ${cols}, version, updated_at FROM email_templates WHERE key = $1`, [key])).rows;
    const defaults = Object.fromEntries(LOCALES.map((l) => { const d = renderTemplate(key, l, SAMPLES[key] as never); return [l, { renders_as: d.locale, subject: d.subject, text: d.text }]; }));
    return { data: { key, variables: VARS[key], editable: !NOT_EDITABLE.includes(key), sample: SAMPLES[key], defaults, custom: Object.fromEntries(custom.map((c) => [c.locale, c])) } };
  });

  r.put("/admin/email/templates/:key/:locale", {
    onRequest: admin, config: rl(60, "1 hour"),
    schema: { tags: tag, summary: "Guarda la plantilla de un idioma (versionada). Variables `{{name}}`; el HTML se limpia (sólo texto, listas y enlaces https)", security: bearer, params: z.object({ key: keyParam, locale }), body: overrideBody, response: { 200: ok } },
  }, async (req) => {
    const key = req.params.key as TemplateKey;
    editable(key);
    const o = norm(req.body);
    validate(key, o);
    const c = await db.connect();
    try {
      await c.query("BEGIN");
      const v = (await c.query<{ version: number }>("SELECT version FROM email_templates WHERE key = $1 AND locale = $2 FOR UPDATE", [key, req.params.locale])).rows[0];
      const version = (v?.version ?? (await c.query<{ n: number }>("SELECT coalesce(max(version), 0)::int AS n FROM email_template_versions WHERE key = $1 AND locale = $2", [key, req.params.locale])).rows[0]!.n) + 1;
      await c.query(
        `INSERT INTO email_templates (key, locale, subject, title, body_html, body_text, cta_label, cta_var, version, updated_by, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
         ON CONFLICT (key, locale) DO UPDATE SET subject = EXCLUDED.subject, title = EXCLUDED.title, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, cta_label = EXCLUDED.cta_label, cta_var = EXCLUDED.cta_var, version = EXCLUDED.version, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [key, req.params.locale, o.subject, o.title, o.body_html, o.body_text, o.cta_label, o.cta_var, version, req.user!.id],
      );
      await c.query("INSERT INTO email_template_versions (key, locale, version, subject, title, body_html, body_text, cta_label, cta_var, updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [key, req.params.locale, version, o.subject, o.title, o.body_html, o.body_text, o.cta_label, o.cta_var, req.user!.id]);
      await c.query("COMMIT");
      mailer.clearTemplateCache();
      await audit(db, { actor: req.user!.id, action: "email.template_saved", entity: "email_template", id: null, meta: { key, locale: req.params.locale, version }, ip: req.ip });
      return { data: { key, locale: req.params.locale, version, ...o } };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  });

  r.delete("/admin/email/templates/:key/:locale", { onRequest: admin, schema: { tags: tag, summary: "Vuelve a la plantilla por defecto de ese idioma (el historial se conserva)", security: bearer, params: z.object({ key: keyParam, locale }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("DELETE FROM email_templates WHERE key = $1 AND locale = $2", [req.params.key, req.params.locale])).rowCount) throw AppError.notFound("Plantilla personalizada");
    mailer.clearTemplateCache();
    await audit(db, { actor: req.user!.id, action: "email.template_reset", entity: "email_template", id: null, meta: { key: req.params.key, locale: req.params.locale }, ip: req.ip });
    reply.code(204);
    return null;
  });

  r.get("/admin/email/templates/:key/versions", { onRequest: admin, schema: { tags: tag, summary: "Historial de versiones de un idioma", security: bearer, params: z.object({ key: keyParam }), querystring: z.object({ locale }), response: { 200: ok } } }, async (req) => ({
    data: (await db.query(`SELECT version, ${cols}, updated_by, created_at FROM email_template_versions WHERE key = $1 AND locale = $2 ORDER BY version DESC LIMIT 50`, [req.params.key, req.query.locale])).rows,
  }));

  r.post("/admin/email/templates/:key/:locale/restore", { onRequest: admin, schema: { tags: tag, summary: "Restaura una versión anterior (queda como una versión nueva)", security: bearer, params: z.object({ key: keyParam, locale }), body: z.object({ version: z.number().int().min(1) }), response: { 200: ok } } }, async (req) => {
    const key = req.params.key as TemplateKey;
    editable(key);
    const old = (await db.query<TemplateOverride>(`SELECT ${cols} FROM email_template_versions WHERE key = $1 AND locale = $2 AND version = $3`, [key, req.params.locale, req.body.version])).rows[0];
    if (!old) throw AppError.notFound("Versión");
    validate(key, old);
    const version = (await db.query<{ n: number }>("SELECT coalesce(max(version), 0)::int + 1 AS n FROM email_template_versions WHERE key = $1 AND locale = $2", [key, req.params.locale])).rows[0]!.n;
    await db.query(
      `INSERT INTO email_templates (key, locale, subject, title, body_html, body_text, cta_label, cta_var, version, updated_by, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
       ON CONFLICT (key, locale) DO UPDATE SET subject = EXCLUDED.subject, title = EXCLUDED.title, body_html = EXCLUDED.body_html, body_text = EXCLUDED.body_text, cta_label = EXCLUDED.cta_label, cta_var = EXCLUDED.cta_var, version = EXCLUDED.version, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [key, req.params.locale, old.subject, old.title, old.body_html, old.body_text, old.cta_label, old.cta_var, version, req.user!.id],
    );
    await db.query("INSERT INTO email_template_versions (key, locale, version, subject, title, body_html, body_text, cta_label, cta_var, updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [key, req.params.locale, version, old.subject, old.title, old.body_html, old.body_text, old.cta_label, old.cta_var, req.user!.id]);
    mailer.clearTemplateCache();
    await audit(db, { actor: req.user!.id, action: "email.template_restored", entity: "email_template", id: null, meta: { key, locale: req.params.locale, from: req.body.version, version }, ip: req.ip });
    return { data: { key, locale: req.params.locale, version, restored_from: req.body.version } };
  });

  const previewBody = z.object({ locale, data: z.record(z.string().max(40), z.union([z.string().max(500), z.number()])).optional(), override: overrideBody.optional() });
  /** Renderiza con datos de ejemplo: el borrador que se envía, si no la plantilla guardada y si no la del código. */
  const preview = async (key: TemplateKey, b: z.infer<typeof previewBody>) => {
    const data = { ...(SAMPLES[key] as Record<string, unknown>), ...(b.data ?? {}) };
    let o: TemplateOverride | null = null;
    if (b.override) { editable(key); o = norm(b.override); validate(key, o); }
    else o = (await db.query<TemplateOverride>(`SELECT ${cols} FROM email_templates WHERE key = $1 AND locale = $2`, [key, b.locale])).rows[0] ?? null;
    return { data, rendered: o ? { ...renderOverride(o, data, b.locale), source: b.override ? "draft" : "custom" } : { ...renderTemplate(key, b.locale, data as never), source: "default" } };
  };
  r.post("/admin/email/templates/:key/preview", { onRequest: admin, schema: { tags: tag, summary: "Vista previa con datos de ejemplo (de un borrador sin guardar, de la plantilla guardada o de la del código)", security: bearer, params: z.object({ key: keyParam }), body: previewBody, response: { 200: ok } } }, async (req) => {
    const { rendered } = await preview(req.params.key as TemplateKey, req.body);
    return { data: { subject: rendered.subject, html: rendered.html, text: rendered.text, source: rendered.source, locale: rendered.locale } };
  });

  r.post("/admin/email/templates/:key/test", {
    onRequest: admin, config: rl(20, "1 hour"),
    schema: { tags: tag, summary: "Envía un correo de prueba (con datos de ejemplo y asunto «[PRUEBA]»)", security: bearer, params: z.object({ key: keyParam }), body: previewBody.extend({ to: email }), response: { 202: ok } },
  }, async (req, reply) => {
    const key = req.params.key as TemplateKey;
    const { data, rendered } = await preview(key, req.body);
    const why = await mailer.suppressedReason(req.body.to, key);
    if (why) throw new AppError("BUSINESS_RULE", "Esa dirección está en la lista de supresión", { code: "SUPPRESSED", reason: why });
    // Se encola con un asunto marcado; el contenido es el de la vista previa (borrador incluido) porque viaja como plantilla temporal.
    await db.query("INSERT INTO email_log (to_email, template, locale, subject, payload, status, next_attempt_at) VALUES ($1,$2,$3,$4,$5,'queued', now())", [req.body.to, key, rendered.locale, `[PRUEBA] ${rendered.subject}`, JSON.stringify({ data, test_override: req.body.override ? norm(req.body.override) : undefined, subject_prefix: "[PRUEBA] " })]);
    await audit(db, { actor: req.user!.id, action: "email.test_sent", entity: "email_template", id: null, meta: { key, to: req.body.to }, ip: req.ip });
    reply.code(202);
    return { data: { queued: true, to: req.body.to, source: rendered.source } };
  });

  // ---------- Bitácora ----------
  const logQ = z.object({ ...pageQ, to: z.string().trim().max(254).optional(), template: z.string().max(60).optional(), status: z.enum(["queued", "sending", "sent", "delivered", "bounced", "complained", "failed", "suppressed"]).optional(), from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
  r.get("/admin/email/log", { onRequest: admin, schema: { tags: tag, summary: "Bitácora de correos (sin el contenido ni los datos personales del mensaje)", security: bearer, querystring: logQ, response: { 200: paged } } }, async (req) => {
    const q = req.query;
    const p = [q.to ? `%${q.to.replace(/[\\%_]/g, "\\$&").toLowerCase()}%` : null, q.template ?? null, q.status ?? null, q.from ?? null, q.until ?? null];
    const w = "($1::text IS NULL OR to_email LIKE $1) AND ($2::text IS NULL OR template = $2) AND ($3::text IS NULL OR status = $3) AND ($4::date IS NULL OR created_at >= $4::date) AND ($5::date IS NULL OR created_at < $5::date + 1)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM email_log WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, to_email, template, locale, subject, status, attempts, error, resent_from, created_at, sent_at, delivered_at, opened_at, (payload IS NOT NULL) AS can_resend FROM email_log WHERE ${w} ORDER BY created_at DESC, id LIMIT ${q.per_page} OFFSET ${(q.page - 1) * q.per_page}`, p);
    return { data: rows, meta: pageMeta(q.page, q.per_page, total) };
  });

  r.get("/admin/email/stats", { onRequest: admin, schema: { tags: tag, summary: "Correos por estado en las últimas 24 h y 7 días", security: bearer, response: { 200: ok } } }, async () => {
    const one = async (interval: string) => Object.fromEntries((await db.query<{ status: string; n: number }>(`SELECT status, count(*)::int AS n FROM email_log WHERE created_at > now() - interval '${interval}' GROUP BY status`)).rows.map((x) => [x.status, x.n]));
    return { data: { last_24h: await one("24 hours"), last_7d: await one("7 days"), suppressions: (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM email_suppressions")).rows[0]!.n } };
  });

  r.post("/admin/email/log/:id/resend", { onRequest: admin, config: rl(60, "1 hour"), schema: { tags: tag, summary: "Reenvía un correo (crea uno nuevo enlazado al original). No aplica a direcciones suprimidas", security: bearer, params: z.object({ id: z.string().uuid() }), response: { 202: ok } } }, async (req, reply) => {
    const src = (await db.query<{ to_email: string; template: string; payload: unknown; status: string }>("SELECT to_email, template, payload, status FROM email_log WHERE id = $1", [req.params.id])).rows[0];
    if (!src) throw AppError.notFound("Correo");
    if (!src.payload) throw new AppError("BUSINESS_RULE", "El contenido de este correo ya no está disponible", { code: "NO_PAYLOAD" });
    if (["queued", "sending"].includes(src.status)) throw new AppError("BUSINESS_RULE", "El correo todavía está en cola", { code: "INVALID_STATE" });
    const why = await mailer.suppressedReason(src.to_email, src.template);
    if (why) throw new AppError("BUSINESS_RULE", "La dirección está en la lista de supresión; quítala primero", { code: "SUPPRESSED", reason: why });
    const row = (await db.query<{ id: string }>("INSERT INTO email_log (user_id, to_email, template, locale, subject, payload, status, next_attempt_at, resent_from) SELECT user_id, to_email, template, locale, subject, payload, 'queued', now(), id FROM email_log WHERE id = $1 RETURNING id", [req.params.id])).rows[0]!;
    await audit(db, { actor: req.user!.id, action: "email.resent", entity: "email_log", id: req.params.id, ip: req.ip });
    reply.code(202);
    return { data: { id: row.id, resent_from: req.params.id } };
  });

  // ---------- Supresiones ----------
  r.get("/admin/email/suppressions", { onRequest: admin, schema: { tags: tag, summary: "Direcciones a las que no se escribe", security: bearer, querystring: z.object({ ...pageQ, reason: z.enum(["hard_bounce", "complaint", "unsubscribe", "manual"]).optional(), q: z.string().trim().max(254).optional() }), response: { 200: paged } } }, async (req) => {
    const p = [req.query.reason ?? null, req.query.q ? `%${req.query.q.replace(/[\\%_]/g, "\\$&").toLowerCase()}%` : null];
    const w = "($1::text IS NULL OR reason = $1) AND ($2::text IS NULL OR email LIKE $2)";
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM email_suppressions WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT email, reason, note, created_by, created_at FROM email_suppressions WHERE ${w} ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/email/suppressions", { onRequest: admin, schema: { tags: tag, summary: "Agrega una dirección a la lista (bloqueo manual por defecto)", security: bearer, body: z.object({ email, reason: z.enum(["hard_bounce", "complaint", "unsubscribe", "manual"]).default("manual"), note: z.string().trim().max(300).optional() }), response: { 201: ok } } }, async (req, reply) => {
    await db.query("INSERT INTO email_suppressions (email, reason, note, created_by) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason, note = EXCLUDED.note, created_by = EXCLUDED.created_by", [req.body.email, req.body.reason, req.body.note ?? null, req.user!.id]);
    await audit(db, { actor: req.user!.id, action: "email.suppression_added", entity: "email_suppression", id: null, meta: { email: req.body.email, reason: req.body.reason }, ip: req.ip });
    reply.code(201);
    return { data: { email: req.body.email, reason: req.body.reason } };
  });
  r.delete("/admin/email/suppressions", { onRequest: admin, schema: { tags: tag, summary: "Quita una dirección de la lista (`?email=`)", security: bearer, querystring: z.object({ email }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("DELETE FROM email_suppressions WHERE email = $1", [req.query.email])).rowCount) throw AppError.notFound("Dirección");
    await audit(db, { actor: req.user!.id, action: "email.suppression_removed", entity: "email_suppression", id: null, meta: { email: req.query.email }, ip: req.ip });
    reply.code(204);
    return null;
  });
}

interface MailEvent { type: "delivered" | "bounce" | "complaint" | "open"; provider_id?: string; email?: string; bounce_type?: "hard" | "soft" }

/** Eventos de entrega del proveedor de correo (docs §5.13). Formato genérico firmado con HMAC-SHA256; un adaptador por proveedor puede traducir a este formato. */
export async function emailWebhookRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  // Encapsulado: el parser entrega el texto crudo (para verificar la firma) y no afecta al resto de la API.
  app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => done(null, body));

  const verify = (raw: string, header: string | undefined, secret: string) => {
    const m = /^sha256=([0-9a-f]{64})$/i.exec(header ?? "");
    if (!m) return false;
    const good = createHmac("sha256", secret).update(raw).digest();
    const got = Buffer.from(m[1]!, "hex");
    return got.length === good.length && timingSafeEqual(got, good);
  };

  r.post("/webhooks/email/:provider", { config: { rateLimit: { max: 600, timeWindow: "1 minute" } }, schema: { tags: ["correo"], summary: "Eventos de entrega, rebote, queja y apertura (firma `X-Email-Signature: sha256=…`)", hide: true, params: z.object({ provider: z.enum(["generic"]) }) } }, async (req, reply) => {
    const secret = app.env.EMAIL_WEBHOOK_SECRET;
    if (!secret) throw new AppError("NOT_FOUND", "Webhook no configurado");
    const raw = typeof req.body === "string" ? req.body : "";
    if (!verify(raw, req.headers["x-email-signature"] as string | undefined, secret)) throw new AppError("UNAUTHENTICATED", "Firma inválida");
    let events: MailEvent[];
    try { events = z.object({ events: z.array(z.object({ type: z.enum(["delivered", "bounce", "complaint", "open"]), provider_id: z.string().max(200).optional(), email: z.string().max(254).optional(), bounce_type: z.enum(["hard", "soft"]).optional() })).max(500) }).parse(JSON.parse(raw)).events; }
    catch { throw AppError.validation("Cuerpo inválido"); }
    const out = { delivered: 0, bounced: 0, soft_bounces: 0, complained: 0, opened: 0, suppressed: 0, unknown: 0 };
    for (const e of events) {
      const row = e.provider_id ? (await db.query<{ id: string; to_email: string }>("SELECT id, to_email FROM email_log WHERE provider_id = $1 ORDER BY created_at DESC LIMIT 1", [e.provider_id])).rows[0] : undefined;
      const to = (row?.to_email ?? e.email ?? "").toLowerCase();
      const suppress = async (reason: "hard_bounce" | "complaint") => {
        if (!to) return;
        if ((await db.query("INSERT INTO email_suppressions (email, reason, note) VALUES ($1,$2,'Automático (proveedor de correo)') ON CONFLICT (email) DO NOTHING", [to, reason])).rowCount) out.suppressed++;
      };
      if (!row && !to) { out.unknown++; continue; }
      if (e.type === "delivered" && row) { if ((await db.query("UPDATE email_log SET status = 'delivered', delivered_at = now() WHERE id = $1 AND status = 'sent'", [row.id])).rowCount) out.delivered++; }
      else if (e.type === "open" && row) { await db.query("UPDATE email_log SET opened_at = coalesce(opened_at, now()) WHERE id = $1", [row.id]); out.opened++; }
      else if (e.type === "bounce") {
        if ((e.bounce_type ?? "hard") === "hard") { if (row) await db.query("UPDATE email_log SET status = 'bounced', bounce_type = 'hard' WHERE id = $1", [row.id]); await suppress("hard_bounce"); out.bounced++; }
        else { if (row) await db.query("UPDATE email_log SET bounce_type = 'soft', error = 'soft_bounce' WHERE id = $1 AND status IN ('sent', 'delivered')", [row.id]); out.soft_bounces++; }   // un rebote blando no suprime: el buzón puede recuperarse
      } else if (e.type === "complaint") { if (row) await db.query("UPDATE email_log SET status = 'complained' WHERE id = $1", [row.id]); await suppress("complaint"); out.complained++; }
    }
    reply.code(200);
    return { received: true, ...out };
  });
}

export type { Locale };
