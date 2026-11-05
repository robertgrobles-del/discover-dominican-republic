import { createHash } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { tableAdminRoutes, type TableCfg } from "../../lib/table-admin.js";
import { withUtm } from "../../lib/utm.js";
import { unsubscribeToken } from "../../lib/unsubscribe-token.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import { todayInSantoDomingo } from "../../lib/dates.js";
import { audit } from "../../lib/audit.js";
import { newClickId, newPostbackSecret, verifyPostback } from "../../lib/ad-postback.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sessionId = z.string().min(8).max(100);
const hashSession = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 24); // no se guarda la sesión ni la IP: sólo un hash truncado
const hourBucket = () => { const d = new Date(); d.setMinutes(0, 0, 0); return d.toISOString(); };

/** Gobierno de los banners: el equipo edita lo visible; los contadores y la trazabilidad los gobierna el sistema. */
const TABLES: TableCfg[] = [
  { table: "ad_banners", pk: "id", readonly: ["id", "created_at", "slug_history", "created_by", "updated_by", "reviewed_by", "version", "deleted_at", "published_at", "unpublished_at"], order: "created_at DESC", label: "Banners",
    check: (d) => { if (d.start_date && d.end_date && String(d.end_date) < String(d.start_date)) throw AppError.validation("La fecha final es anterior a la inicial"); for (const f of ["target_url", "image_url", "image_url_right", "video_url"]) if (typeof d[f] === "string" && !/^(https:\/\/|\/)/.test(d[f] as string)) throw AppError.validation(`${f} debe ser https o una ruta local`); } },
  { table: "ad_slots", pk: "placement" as never, readonly: [], order: "placement", label: "Espacios publicitarios" },
  { table: "ad_clients", pk: "id", readonly: ["id", "created_at", "updated_at", "deleted_at"], order: "legal_name", label: "Clientes publicitarios" },
];

/** Servidor de anuncios, ofertas y campañas de correo (docs §5.12). */
export async function marketingRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const admin = app.requireRole("admin");
  const tag = ["publicidad"];

  // ---------- Servidor de anuncios ----------
  r.get("/ads/slots", { schema: { tags: tag, summary: "Espacios publicitarios, dimensiones, capacidad de rotación y esquema de precios", response: { 200: ok } } }, async (_q, reply) => {
    reply.header("cache-control", "public, max-age=300");
    return {
      data: (await db.query(
        "SELECT placement, label, width_pct, height_px, max_items, base_price_monthly, exclusive_multiplier FROM ad_slots WHERE is_active ORDER BY placement"
      )).rows.map((row) => ({
        ...row,
        base_price_monthly: Number(row.base_price_monthly),
        exclusive_multiplier: Number(row.exclusive_multiplier),
        exclusive_price_monthly: Number(row.base_price_monthly) * Number(row.exclusive_multiplier),
        rotation_mode: row.max_items > 1 ? `Rotativo (hasta ${row.max_items} anuncios)` : "Exclusivo (1 solo anuncio)",
      })),
    };
  });

  /** Elige `n` elementos sin repetir con probabilidad proporcional a su peso (prioridad + 1): rotación ponderada. */
  const weightedPick = <T extends { weight: number }>(items: T[], n: number): T[] => {
    const pool = [...items], out: T[] = [];
    while (out.length < n && pool.length) {
      const total = pool.reduce((s, x) => s + x.weight, 0);
      let roll = Math.random() * total, i = 0;
      for (; i < pool.length - 1; i++) { roll -= pool[i]!.weight; if (roll <= 0) break; }
      out.push(pool.splice(i, 1)[0]!);
    }
    return out;
  };

  // Catálogo público de lo que el portal puede pintar ahora mismo: banners publicados, activos, en fechas y con cliente.
  // El portal elige el hueco en el navegador (tipo + ubicación + sección); impresiones y clics vuelven por /ads/:id/*.
  r.get("/ads/catalog", { config: rl(120, "1 minute"), schema: { tags: tag, summary: "Banners vigentes para el portal (todos los huecos)", response: { 200: ok } } }, async (_req, reply) => {
    const { rows } = await db.query(
      `SELECT id, name, image_url, image_url_right, alt_text, target_url, headline, subtext, cta_text, sponsor, banner_type, placement, section, page,
              start_date, end_date, priority, is_featured, sponsorship_scope, is_takeover, content_type, video_url, video_autoplay, video_loop,
              video_muted, animation_type, animation_config, slider_items, slider_interval, slide_details, utm_campaign, utm_source, utm_medium, utm_content
         FROM ad_banners
        WHERE status = 'published' AND deleted_at IS NULL AND is_active AND client_id IS NOT NULL AND (published_at IS NULL OR published_at <= now())
          AND (start_date IS NULL OR start_date <= $1::date) AND (end_date IS NULL OR end_date >= $1::date)
        ORDER BY priority DESC NULLS LAST, created_at DESC`, [todayInSantoDomingo()]);
    reply.header("cache-control", "public, max-age=60");
    return { data: rows.map((b) => ({ ...b, is_active: true })) };
  });

  r.get("/ads", {
    config: rl(300, "1 minute"),
    schema: { tags: tag, summary: "Banners vigentes de un espacio, con rotación ponderada por prioridad", querystring: z.object({ placement: z.string().regex(/^[a-z][a-z0-9_]{1,50}$/), page: z.string().max(100).optional(), section: z.string().max(60).optional(), limit: z.coerce.number().int().min(1).max(10).optional() }), response: { 200: ok } },
  }, async (req, reply) => {
    const today = todayInSantoDomingo();
    const slot = (await db.query<{ max_items: number }>("SELECT max_items FROM ad_slots WHERE placement = $1 AND is_active", [req.query.placement])).rows[0];
    if (!slot) throw AppError.notFound("Espacio publicitario");
    const { rows } = await db.query(
      `SELECT id, name, image_url, image_url_right, alt_text, headline, subtext, cta_text, sponsor, content_type, video_url, video_autoplay, video_loop, video_muted, animation_type, animation_config, slider_items, slider_interval, target_url, priority
         FROM ad_banners WHERE status = 'published' AND deleted_at IS NULL AND is_active AND (published_at IS NULL OR published_at <= now()) AND placement = $1
          AND (start_date IS NULL OR start_date <= $2::date) AND (end_date IS NULL OR end_date >= $2::date)
          AND (page IS NULL OR page = $3) AND (section IS NULL OR section = $4)`, [req.query.placement, today, req.query.page ?? "", req.query.section ?? ""],
    );
    const picked = weightedPick(rows.map((x) => ({ ...x, weight: Math.max(0, Number(x.priority ?? 0)) + 1 })), Math.min(req.query.limit ?? slot.max_items, slot.max_items));
    // El destino real no se expone: el clic pasa por el servidor para poder contarlo.
    reply.header("cache-control", "no-store");
    return { data: picked.map(({ target_url, priority, weight, ...b }) => ({ ...b, click_url: target_url ? `/api/v1/ads/${b.id}/click` : null })) };
  });

  /** Cuenta una vista o un clic una sola vez por sesión, banner y hora. */
  const count = async (bannerId: string, session: string, kind: "impression" | "click") => {
    const seen = await db.query("INSERT INTO ad_seen (banner_id, session_hash, kind, hour) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING", [bannerId, hashSession(session), kind, hourBucket()]);
    if (!seen.rowCount) return false;
    await db.query(`INSERT INTO ad_stats (banner_id, day, ${kind === "click" ? "clicks" : "impressions"}) VALUES ($1, $2, 1) ON CONFLICT (banner_id, day) DO UPDATE SET ${kind === "click" ? "clicks" : "impressions"} = ad_stats.${kind === "click" ? "clicks" : "impressions"} + 1`, [bannerId, todayInSantoDomingo()]);
    return true;
  };
  const exists = async (id: string) => !!(await db.query("SELECT 1 FROM ad_banners WHERE id = $1 AND status = 'published' AND deleted_at IS NULL", [id])).rowCount;

  r.post("/ads/impressions", { config: rl(120, "1 minute"), schema: { tags: tag, summary: "Registra vistas en lote (deduplicadas por sesión y hora)", body: z.object({ session_id: sessionId, ids: z.array(z.string().uuid()).min(1).max(20) }), response: { 204: z.null() } } }, async (req, reply) => {
    for (const id of new Set(req.body.ids)) if (await exists(id)) await count(id, req.body.session_id, "impression");
    reply.code(204);
    return null;
  });
  r.post("/ads/:id/impression", { config: rl(120, "1 minute"), schema: { tags: tag, summary: "Registra una vista", params: uuid, body: z.object({ session_id: sessionId }), response: { 204: z.null() } } }, async (req, reply) => {
    if (await exists(req.params.id)) await count(req.params.id, req.body.session_id, "impression");
    reply.code(204);
    return null;
  });
  r.get("/ads/:id/click", { config: rl(120, "1 minute"), schema: { tags: tag, summary: "Cuenta el clic y redirige al destino del anunciante con click_id para Server-to-Server tracking", params: uuid, querystring: z.object({ s: sessionId.optional() }) } }, async (req, reply) => {
    const b = (await db.query<{ target_url: string | null; name: string; slug: string | null; placement: string | null; click_id_param: string }>("SELECT target_url, name, slug, placement, coalesce(click_id_param, 'click_id') AS click_id_param FROM ad_banners WHERE id = $1 AND status = 'published' AND deleted_at IS NULL", [req.params.id])).rows[0];
    if (!b?.target_url) throw AppError.notFound("Banner");
    await count(req.params.id, req.query.s ?? `${req.ip}:${req.headers["user-agent"] ?? ""}`, "click");
    const url = b.target_url;
    if (!(url.startsWith("https://") || (url.startsWith("/") && !url.startsWith("//")))) throw AppError.notFound("Banner");
    
    // Si es destino externo https://, generamos un click_id único para Server-to-Server tracking (Postback)
    let extra: Record<string, string> | undefined;
    if (url.startsWith("https://")) {
      const cid = newClickId();
      await db.query("INSERT INTO ad_clicks (click_id, banner_id) VALUES ($1, $2)", [cid, req.params.id]);
      extra = { [b.click_id_param || "click_id"]: cid };
    }
    return reply.redirect(withUtm(url, { source: "descubrerd", medium: "banner", campaign: b.slug ?? b.name, content: b.placement, extra }), 302);
  });

  /** Webhook / Postback de conversión Server-to-Server enviado por el anunciante */
  const postbackSchema = {
    tags: tag,
    summary: "Recepción de conversión S2S (Postback) desde la web del anunciante",
    body: z.object({
      t: z.coerce.number().int().min(1000000000),
      click_id: z.string().min(16).max(64),
      order_id: z.string().trim().min(1).max(100),
      value: z.coerce.number().min(0),
      currency: z.string().length(3).default("USD"),
      signature: z.string().min(1),
    }).nullish(),
    querystring: z.object({
      t: z.coerce.number().int().optional(),
      click_id: z.string().optional(),
      order_id: z.string().optional(),
      value: z.coerce.number().optional(),
      currency: z.string().optional(),
      signature: z.string().optional(),
    }).nullish(),
    response: { 200: ok },
  };

  const handlePostback = async (req: FastifyRequest) => {
    const raw = (req.body || req.query || {}) as Record<string, unknown>;
    const t = Number(raw.t);
    const click_id = String(raw.click_id || "");
    const order_id = String(raw.order_id || "");
    const valueStr = String(raw.value ?? "");
    const value = Number(valueStr);
    const currency = String(raw.currency || "USD").toUpperCase();
    const signature = String(raw.signature || "");

    if (!t || !click_id || !order_id || !valueStr || isNaN(value) || !signature) {
      throw AppError.validation("Parámetros obligatorios faltantes o inválidos: t, click_id, order_id, value, signature");
    }

    const clickRow = (await db.query<{ banner_id: string }>("SELECT banner_id FROM ad_clicks WHERE click_id = $1", [click_id])).rows[0];
    if (!clickRow) throw AppError.notFound("Click ID inválido o expirado");

    const keyRow = (await db.query<{ secret: string }>("SELECT secret FROM ad_postback_keys WHERE banner_id = $1", [clickRow.banner_id])).rows[0];
    if (!keyRow?.secret) throw new AppError("FORBIDDEN", "El banner no tiene clave de firma activada");

    const valid = verifyPostback(keyRow.secret, { t, click_id, order_id, value: valueStr, currency }, signature);
    if (!valid) throw new AppError("UNAUTHENTICATED", "Firma HMAC del postback inválida o fuera de la ventana de tolerancia");

    const res = await db.query(
      `INSERT INTO ad_conversions (click_id, banner_id, external_order_id, value, currency)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (banner_id, external_order_id) DO NOTHING RETURNING id`,
      [click_id, clickRow.banner_id, order_id, value, currency],
    );

    return { data: { success: true, processed: !!res.rowCount, message: res.rowCount ? "Conversión registrada con éxito" : "Conversión ya registrada previamente" } };
  };

  r.post("/ads/postback", { config: rl(60, "1 minute"), schema: postbackSchema }, handlePostback);
  // Fastify no admite esquema de cuerpo en GET: la variante por URL valida sólo la cadena de consulta.
  const { body: _postbackBody, ...postbackQuerySchema } = postbackSchema;
  r.get("/ads/postback", { config: rl(60, "1 minute"), schema: postbackQuerySchema }, handlePostback);

  // Administración de clave de firma para el anunciante
  r.post("/admin/ads/:id/postback-key", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Genera o rota la clave HMAC para Server-to-Server tracking del banner", params: uuid, security: bearer, response: { 200: ok } },
  }, async (req) => {
    const banner = (await db.query("SELECT id FROM ad_banners WHERE id = $1 AND deleted_at IS NULL", [req.params.id])).rows[0];
    if (!banner) throw AppError.notFound("Banner");
    const secret = newPostbackSecret();
    await db.query(
      `INSERT INTO ad_postback_keys (banner_id, secret) VALUES ($1, $2)
       ON CONFLICT (banner_id) DO UPDATE SET secret = EXCLUDED.secret, rotated_at = now()`,
      [req.params.id, secret],
    );
    await audit(db, { actor: req.user!.id, action: "banner.postback_key_rotate", entity: "ad_banner", id: req.params.id, ip: req.ip });
    return { data: { banner_id: req.params.id, secret, message: "Guarda esta clave: no se volverá a mostrar completa por seguridad." } };
  });

  r.post("/advertisers/requests", {
    onRequest: optionalUser, config: rl(5, "1 hour"),
    schema: { tags: tag, summary: "Solicitud de publicidad (crea un lead y un ticket)", body: z.object({ company: z.string().trim().min(2).max(120), contact_name: z.string().trim().min(2).max(100), email, phone: z.string().trim().max(30).optional(), budget: z.string().trim().max(60).optional(), message: z.string().trim().min(10).max(3000), consent: z.literal(true, { error: "Debes aceptar el tratamiento de tus datos" }), website: z.string().max(200).optional() }), response: { 202: ok } },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    if (b.website) return { data: { received: true } };
    await app.leads.capture({ name: b.contact_name, email: b.email, phone: b.phone, company: b.company, message: b.message, source: "advertiser", interest: b.budget });
    const ticketId = await app.supportIntake.openTicket({ subject: `Publicidad: ${b.company}`, description: b.message, category: "advertising", contactName: b.contact_name, contactEmail: b.email });
    // El correo no está verificado: solo se citan textos del remitente si la sesión es dueña de ese correo.
    const echo = !!req.user?.id && !!(await db.query("SELECT 1 FROM users WHERE id = $1 AND lower(email) = lower($2)", [req.user.id, b.email])).rowCount;
    await app.mailer.send({ to: b.email, template: "support.received", locale: "es", data: { name: echo ? b.contact_name.split(" ")[0]! : "viajero", reference: ticketId.slice(0, 8).toUpperCase(), subject: echo ? `Publicidad: ${b.company}` : "Publicidad" } });
    return { data: { received: true } };
  });

  r.get("/admin/ads/reports", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Vistas, clics, conversiones S2S e ingresos por banner y por anunciante", security: bearer, querystring: z.object({ from: date.optional(), to: date.optional() }), response: { 200: ok } },
  }, async (req) => {
    const to = req.query.to ?? todayInSantoDomingo(), from = req.query.from ?? new Date(Date.parse(`${to}T00:00:00Z`) - 29 * 86_400_000).toISOString().slice(0, 10);
    const rows = (await db.query(
      `SELECT b.id, b.name, b.sponsor, b.placement,
              coalesce(sum(s.impressions), 0)::int AS impressions,
              coalesce(sum(s.clicks), 0)::int AS clicks,
              (SELECT count(*)::int FROM ad_conversions c WHERE c.banner_id = b.id AND c.created_at::date BETWEEN $1::date AND $2::date) AS conversions,
              coalesce((SELECT sum(c.value) FROM ad_conversions c WHERE c.banner_id = b.id AND c.created_at::date BETWEEN $1::date AND $2::date), 0)::numeric(12,2) AS total_revenue_usd
         FROM ad_banners b
         LEFT JOIN ad_stats s ON s.banner_id = b.id AND s.day BETWEEN $1::date AND $2::date
        WHERE b.deleted_at IS NULL
        GROUP BY b.id
        ORDER BY impressions DESC, b.name`, [from, to],
    )).rows.map((x) => ({
      ...x,
      total_revenue_usd: Number(x.total_revenue_usd),
      ctr: x.impressions ? Math.round((x.clicks / x.impressions) * 10_000) / 100 : 0,
      conversion_rate: x.clicks ? Math.round((x.conversions / x.clicks) * 10_000) / 100 : 0,
    }));
    const sponsors = new Map<string, { sponsor: string; impressions: number; clicks: number; conversions: number; total_revenue_usd: number }>();
    for (const x of rows) {
      const k = x.sponsor ?? "(sin anunciante)";
      const s = sponsors.get(k) ?? { sponsor: k, impressions: 0, clicks: 0, conversions: 0, total_revenue_usd: 0 };
      s.impressions += x.impressions;
      s.clicks += x.clicks;
      s.conversions += x.conversions;
      s.total_revenue_usd += x.total_revenue_usd;
      sponsors.set(k, s);
    }
    return {
      data: {
        range: { from, to },
        banners: rows,
        sponsors: [...sponsors.values()].map((s) => ({
          ...s,
          ctr: s.impressions ? Math.round((s.clicks / s.impressions) * 10_000) / 100 : 0,
          conversion_rate: s.clicks ? Math.round((s.conversions / s.clicks) * 10_000) / 100 : 0,
        })).sort((a, b) => b.impressions - a.impressions),
      },
    };
  });
  await tableAdminRoutes(app, TABLES, ["admin", "editor"]);

  // ---------- Facturación de banners a su cliente ----------
  // Una factura por banner y mes (reference_id = "<banner>:<YYYY-MM>"): el comprador sale de la ficha del cliente, nunca
  // de lo que mande quien llama, y el mismo mes no se factura dos veces.
  r.post("/admin/ad_banners/:id/invoices", {
    onRequest: admin,
    schema: {
      tags: ["publicidad", "billing"], summary: "Factura un mes de un banner a su cliente (NCF/e-CF)", security: [{ bearerAuth: [] }],
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Formato AAAA-MM"),
        subtotal: z.number().min(0).max(99_999_999).optional(),          // por defecto, el precio mensual del banner
        itbis_rate: z.number().min(0).max(0.18).optional(),              // por defecto 18 %
        ncf_type: z.enum(["B01", "B02", "B14", "B15", "E31", "E32", "E44", "E45"]).optional(),
        currency: z.enum(["DOP", "USD", "EUR"]).optional(),
        exchange_rate: z.number().positive().max(1_000).optional(),
        payment_method: z.string().trim().min(2).max(40).optional(),
      }).strict(),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = (await db.query<{ name: string; custom_price_monthly: string | null; legal_name: string | null; rnc_cedula: string | null; default_ncf_type: string | null }>(
      `SELECT b.name, b.custom_price_monthly, c.legal_name, c.rnc_cedula, c.default_ncf_type
         FROM ad_banners b LEFT JOIN ad_clients c ON c.id = b.client_id AND c.deleted_at IS NULL
        WHERE b.id = $1 AND b.deleted_at IS NULL`, [req.params.id])).rows[0];
    if (!b) throw AppError.notFound("Banner");
    if (!b.legal_name) throw AppError.validation("El banner no tiene cliente asignado");
    const subtotal = req.body.subtotal ?? Number(b.custom_price_monthly ?? NaN);
    if (!Number.isFinite(subtotal)) throw AppError.validation("Indica el monto: el banner no tiene precio mensual");
    const ncf_type = (req.body.ncf_type ?? b.default_ncf_type ?? "B01") as "B01";
    if ((ncf_type === "B01" || ncf_type === "E31") && !b.rnc_cedula) throw AppError.validation("Una factura de crédito fiscal requiere el RNC o la cédula del cliente");
    const reference_id = `${req.params.id}:${req.body.period}`;
    if ((await app.invoicingService.listInvoicesByReference("advertising", reference_id)).some((i) => i.status !== "cancelled")) {
      throw new AppError("CONFLICT", `Ese mes (${req.body.period}) ya está facturado`, { reason: "ALREADY_INVOICED" });
    }
    const invoice = await app.invoicingService.issueInvoice({
      ncf_type, buyer_name: b.legal_name, buyer_rnc_cedula: b.rnc_cedula ?? undefined, subtotal,
      itbis: Math.round(subtotal * (req.body.itbis_rate ?? 0.18) * 100) / 100,
      currency: req.body.currency, exchange_rate: req.body.exchange_rate, payment_method: req.body.payment_method ?? "transfer",
      reference_type: "advertising", reference_id,
    });
    await audit(db, { actor: req.user!.id, action: "ads.banner_invoiced", entity: "ad_banner", id: req.params.id, ip: req.ip });
    reply.code(201);
    return { data: invoice };
  });

  r.get("/admin/ad_clients/:id/invoices", {
    onRequest: admin,
    schema: { tags: ["publicidad", "billing"], summary: "Facturas de publicidad emitidas a un cliente", security: [{ bearerAuth: [] }], params: z.object({ id: z.string().uuid() }), response: { 200: ok } },
  }, async (req) => {
    const { rows } = await db.query(
      `SELECT i.*, b.id AS banner_id, b.name AS banner_name, split_part(i.reference_id, ':', 2) AS period
         FROM fiscal_invoices i JOIN ad_banners b ON b.id::text = split_part(i.reference_id, ':', 1)
        WHERE i.reference_type = 'advertising' AND b.client_id = $1 ORDER BY i.issued_at DESC LIMIT 500`, [req.params.id]);
    return { data: rows };
  });

  // ---------- Ofertas ----------
  r.post("/offers/:id/redeem", {
    onRequest: app.authenticate, config: rl(20, "1 hour"),
    schema: { tags: tag, summary: "Canjea una oferta vigente (una vez por persona) y devuelve su código de descuento", security: bearer, params: uuid, response: { 200: ok } },
  }, async (req) => {
    const o = (await db.query<{ id: string; title: string; discount_code: string | null; discount_percentage: string | null }>(
      "SELECT id, title, discount_code, discount_percentage FROM offers WHERE id = $1 AND status = 'published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) AND (start_time IS NULL OR start_time <= now()) AND (end_time IS NULL OR end_time > now())", [req.params.id],
    )).rows[0];
    if (!o) throw AppError.notFound("Oferta");
    const ins = await db.query("INSERT INTO offer_redemptions (offer_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [o.id, req.user!.id]);
    if (!ins.rowCount) throw new AppError("CONFLICT", "Ya canjeaste esta oferta", { reason: "ALREADY_REDEEMED" });
    return { data: { offer: o.title, code: o.discount_code, discount_percentage: o.discount_percentage === null ? null : Number(o.discount_percentage) } };
  });
  void optionalUser;

  // ---------- Leads y campañas ----------
  r.get("/admin/marketing/leads", { onRequest: admin, schema: { tags: ["admin"], summary: "Leads por estado y origen", security: bearer, querystring: z.object({ status: z.enum(["nuevo", "contactado", "calificado", "perdido"]).optional(), source: z.string().max(60).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const p = [req.query.status ?? null, req.query.source ?? null];
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM marketing_leads WHERE ($1::text IS NULL OR status = $1) AND ($2::text IS NULL OR source = $2)", p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, nombre AS name, email, telefono AS phone, empresa AS company, mensaje AS message, source, interest, status, consent, created_at FROM marketing_leads WHERE ($1::text IS NULL OR status = $1) AND ($2::text IS NULL OR source = $2) ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/marketing/leads/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Cambia el estado de un lead", security: bearer, params: uuid, body: z.object({ status: z.enum(["nuevo", "contactado", "calificado", "perdido"]) }), response: { 204: z.null() } } }, async (req, reply) => {
    if (!(await db.query("UPDATE marketing_leads SET status = $2 WHERE id = $1", [req.params.id, req.body.status])).rowCount) throw AppError.notFound("Lead");
    await audit(db, { actor: req.user!.id, action: "marketing.lead_status", entity: "lead", id: req.params.id, meta: { status: req.body.status }, ip: req.ip });
    reply.code(204);
    return null;
  });

  const campaign = z.object({ title: z.string().trim().min(3).max(150), subject: z.string().trim().min(3).max(150), body_template: z.string().trim().min(10).max(20_000), segment_interests: z.array(z.string().max(40)).max(20).nullable() });
  const cget = async (id: string) => { const c = (await db.query("SELECT id, title, subject, body_template, segment_interests, sent_count, status, scheduled_for, sent_at, created_at FROM marketing_campaigns WHERE id = $1", [id])).rows[0]; if (!c) throw AppError.notFound("Campaña"); return c; };
  r.get("/admin/marketing/campaigns", { onRequest: admin, schema: { tags: ["admin"], summary: "Campañas de correo", security: bearer, response: { 200: ok } } }, async () => ({ data: (await db.query("SELECT id, title, subject, segment_interests, sent_count, status, scheduled_for, sent_at, created_at FROM marketing_campaigns ORDER BY created_at DESC LIMIT 200")).rows }));
  r.get("/admin/marketing/campaigns/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Detalle de una campaña", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await cget(req.params.id) }));
  r.post("/admin/marketing/campaigns", { onRequest: admin, schema: { tags: ["admin"], summary: "Crea una campaña (borrador). Variables: {{name}}", security: bearer, body: campaign.partial({ segment_interests: true }), response: { 201: ok } } }, async (req, reply) => {
    const b = req.body;
    const row = (await db.query("INSERT INTO marketing_campaigns (title, subject, body_template, segment_interests) VALUES ($1,$2,$3,$4) RETURNING id", [b.title, b.subject, b.body_template, b.segment_interests ? JSON.stringify(b.segment_interests) : null])).rows[0];
    await audit(db, { actor: req.user!.id, action: "marketing.campaign_created", entity: "campaign", id: row.id, ip: req.ip });
    reply.code(201);
    return { data: row };
  });
  r.patch("/admin/marketing/campaigns/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Edita una campaña que aún no se envió", security: bearer, params: uuid, body: campaign.partial().strict(), response: { 200: ok } } }, async (req) => {
    const c = await cget(req.params.id);
    if (!["draft", "scheduled"].includes(c.status)) throw new AppError("BUSINESS_RULE", "Sólo se editan campañas en borrador o programadas", { code: "INVALID_STATE" });
    const b = req.body;
    await db.query("UPDATE marketing_campaigns SET title = coalesce($2, title), subject = coalesce($3, subject), body_template = coalesce($4, body_template), segment_interests = CASE WHEN $5::boolean THEN $6::jsonb ELSE segment_interests END, updated_at = now() WHERE id = $1", [req.params.id, b.title ?? null, b.subject ?? null, b.body_template ?? null, "segment_interests" in b, b.segment_interests ? JSON.stringify(b.segment_interests) : null]);
    return { data: await cget(req.params.id) };
  });
  r.post("/admin/marketing/campaigns/:id/send-test", { onRequest: admin, config: rl(10, "1 hour"), schema: { tags: ["admin"], summary: "Envía la campaña a tu propio correo", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    const c = await cget(req.params.id);
    const me = (await db.query<{ email: string }>("SELECT email FROM users WHERE id = $1", [req.user!.id])).rows[0]!;
    await sendCampaignMail(app, me.email, c, "Prueba", "es");
    reply.code(204);
    return null;
  });
  r.post("/admin/marketing/campaigns/:id/schedule", { onRequest: admin, schema: { tags: ["admin"], summary: "Programa el envío (a partir de esa fecha lo toma el trabajo newsletter.send)", security: bearer, params: uuid, body: z.object({ scheduled_for: z.string().datetime({ offset: true }) }), response: { 200: ok } } }, async (req) => {
    const c = await cget(req.params.id);
    if (!["draft", "scheduled"].includes(c.status)) throw new AppError("BUSINESS_RULE", "La campaña ya no se puede programar", { code: "INVALID_STATE" });
    if (new Date(req.body.scheduled_for).getTime() < Date.now() - 60_000) throw AppError.validation("La fecha ya pasó");
    await db.query("UPDATE marketing_campaigns SET status = 'scheduled', scheduled_for = $2, updated_at = now() WHERE id = $1", [req.params.id, req.body.scheduled_for]);
    await audit(db, { actor: req.user!.id, action: "marketing.campaign_scheduled", entity: "campaign", id: req.params.id, meta: { at: req.body.scheduled_for }, ip: req.ip });
    return { data: await cget(req.params.id) };
  });
  r.post("/admin/marketing/campaigns/:id/cancel", { onRequest: admin, schema: { tags: ["admin"], summary: "Cancela una campaña programada", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const res = await db.query("UPDATE marketing_campaigns SET status = 'draft', scheduled_for = NULL, updated_at = now() WHERE id = $1 AND status = 'scheduled'", [req.params.id]);
    if (!res.rowCount) { await cget(req.params.id); throw new AppError("BUSINESS_RULE", "Sólo se cancelan campañas programadas", { code: "INVALID_STATE" }); }
    return { data: await cget(req.params.id) };
  });
}

async function sendCampaignMail(app: FastifyInstance, to: string, c: { title: string; subject: string; body_template: string }, name: string, locale: "es" | "en") {
  await app.mailer.send({ to, template: "marketing.campaign", locale, data: { subject: c.subject, body: c.body_template.replace(/\{\{\s*name\s*\}\}/g, name), unsubscribe_url: `${app.env.WEB_BASE_URL}/newsletter/baja?token=${unsubscribeToken(app.env.APP_SECRET!, to)}` } });
}

/** Envía las campañas programadas cuya hora llegó (por lotes de 2 000, sin duplicar: cada entrega queda registrada). */
export async function sendCampaigns(app: FastifyInstance): Promise<number> {
  const db = app.db;
  const due = (await db.query<{ id: string; title: string; subject: string; body_template: string; segment_interests: string[] | null }>("UPDATE marketing_campaigns SET status = 'sending' WHERE id IN (SELECT id FROM marketing_campaigns WHERE status = 'scheduled' AND scheduled_for <= now() ORDER BY scheduled_for LIMIT 3 FOR UPDATE SKIP LOCKED) RETURNING id, title, subject, body_template, segment_interests")).rows;
  let sent = 0;
  for (const c of due) {
    try {
      const subs = (await db.query<{ email: string; nombre: string | null; locale: string }>(
        `SELECT s.email, s.nombre, s.locale FROM newsletter_subscribers s WHERE s.is_active AND s.confirmed_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM campaign_deliveries d WHERE d.campaign_id = $1 AND d.email = s.email)
           AND ($2::jsonb IS NULL OR jsonb_array_length($2::jsonb) = 0 OR coalesce(s.intereses, '[]'::jsonb) ?| ARRAY(SELECT jsonb_array_elements_text($2::jsonb))) LIMIT 2000`, [c.id, c.segment_interests ? JSON.stringify(c.segment_interests) : null],
      )).rows;
      for (const s of subs) {
        const claimed = await db.query("INSERT INTO campaign_deliveries (campaign_id, email) VALUES ($1,$2) ON CONFLICT DO NOTHING", [c.id, s.email]);
        if (!claimed.rowCount) continue;
        await sendCampaignMail(app, s.email, c, s.nombre?.split(" ")[0] ?? "", s.locale === "en" ? "en" : "es");
        sent++;
      }
      const remaining = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM newsletter_subscribers s WHERE s.is_active AND s.confirmed_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM campaign_deliveries d WHERE d.campaign_id = $1 AND d.email = s.email)", [c.id])).rows[0]!.n;
      await db.query("UPDATE marketing_campaigns SET sent_count = (SELECT count(*) FROM campaign_deliveries WHERE campaign_id = $1), status = $2, sent_at = CASE WHEN $2 = 'sent' THEN now() ELSE sent_at END, updated_at = now() WHERE id = $1", [c.id, remaining > 0 && subs.length >= 2000 ? "scheduled" : "sent"]);
    } catch (err) {
      app.log.error({ err, campaign: c.id }, "Falló el envío de una campaña");
      await db.query("UPDATE marketing_campaigns SET status = 'failed', updated_at = now() WHERE id = $1", [c.id]);
    }
  }
  return sent;
}

export function registerMarketingJobs(app: FastifyInstance, runner: JobRegistrar) {
  runner.register({ name: "newsletter.send", description: "Envía las campañas programadas a los suscriptores confirmados (por lotes, sin duplicar)", everySeconds: 300, run: async () => ({ sent: await sendCampaigns(app) }) });
  // Aviso al equipo cuando una campaña publicada está por terminar: a 7 días y la víspera (una vez cada uno).
  runner.register({
    name: "ads.expiring", description: "Avisa a los administradores de banners que vencen en 7 días o mañana", everySeconds: 86_400,
    run: async ({ now }) => {
      const today = todayInSantoDomingo(now);
      const { rows } = await app.db.query<{ id: string; name: string; sponsor: string | null; days: number }>(
        `SELECT id, name, sponsor, (end_date - $1::date) AS days FROM ad_banners
          WHERE status = 'published' AND deleted_at IS NULL AND is_active AND end_date IS NOT NULL AND (end_date - $1::date) IN (1, 7)`, [today],
      );
      if (!rows.length) return { expiring: 0, notified: 0 };
      const admins = await app.identity.userIdsWithRole("admin");
      for (const b of rows) for (const adminId of admins) {
        await app.notifications.notify(adminId, { type: "system", title: b.days === 1 ? `El banner "${b.name}" vence mañana` : `El banner "${b.name}" vence en 7 días`, message: b.sponsor ? `Anunciante: ${b.sponsor}` : null, link: "/admin", data: { banner_id: b.id, days_left: b.days } });
      }
      return { expiring: rows.length, notified: rows.length * admins.length };
    },
  });
  runner.register({ name: "ads.cleanup", description: "Borra marcas de deduplicación de anuncios de más de 3 días", everySeconds: 86_400, run: async () => ({ deleted: (await app.db.query("DELETE FROM ad_seen WHERE hour < now() - interval '3 days'")).rowCount }) });
}
