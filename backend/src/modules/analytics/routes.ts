import { createHash, randomBytes } from "node:crypto";
import { TtlCache } from "../../lib/cache.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { COLLECTIONS } from "../content/collections.js";
import { hasCol } from "../content/query.js";
import type { JobRunner } from "../jobs/runner.js";
import { addDays, todayInSantoDomingo } from "../operators/domain/dates.js";
import { audit } from "../operators/team.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";

const RETENTION_MONTHS = 13;
const EVENT_TYPES = ["page_view", "click", "search", "favorite", "share", "booking_start", "booking_complete", "signup", "login", "add_to_cart", "checkout_start", "purchase", "ad_click", "outbound_link", "error"] as const;
const SENSITIVE_KEY = /(mail|phone|tel|pass|token|secret|card|dni|cedula|passport|address|direccion|name|nombre)/i;
const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Ruta sin parámetros ni fragmento (pueden llevar tokens o datos personales). */
const cleanPage = (p: string | undefined) => (p ? p.split(/[?#]/)[0]!.slice(0, 200) : null);
/** Sólo el host de origen. */
const cleanSource = (s: string | undefined) => { if (!s) return null; try { return new URL(s).hostname.slice(0, 100) || null; } catch { return /^[a-z0-9.-]{1,100}$/i.test(s) ? s.toLowerCase() : null; } };
/** Quita de las propiedades cualquier campo que parezca un dato personal y limita su tamaño. */
export function cleanProps(props: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props ?? {}).slice(0, 20)) {
    if (SENSITIVE_KEY.test(k) || k.length > 40) continue;
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean" || v === null) out[k] = v;
  }
  return JSON.stringify(out).length > 2000 ? {} : out;
}

const csvCell = (v: unknown) => { let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const toCsv = (rows: Record<string, unknown>[]) => { const names = rows.length ? Object.keys(rows[0]!) : []; return [names.join(","), ...rows.map((r) => names.map((n) => csvCell(r[n])).join(","))].join("\r\n"); };

/** Ingesta anónima y paneles de analítica (docs §5.14). */
export async function analyticsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const tag = ["analítica"];
  const range = (q: { from?: string; to?: string }) => {
    const to = q.to ?? todayInSantoDomingo(), from = q.from ?? addDays(to, -29);
    if (from > to) throw AppError.validation("El rango de fechas es inválido");
    return { from, to };
  };
  const overviewCache = new TtlCache<unknown>(20_000, 50);
  const RD = "AT TIME ZONE 'America/Santo_Domingo'";

  r.post("/analytics/events", {
    config: rl(120, "1 minute"),
    schema: {
      tags: tag, summary: "Lote de eventos anónimos (máx. 50). Respeta Do-Not-Track, Sec-GPC y el consentimiento; no guarda IP",
      body: z.object({ consent: z.boolean().default(true), events: z.array(z.object({ type: z.enum(EVENT_TYPES), page: z.string().max(300).optional(), session_id: z.string().min(8).max(100), ts: z.string().datetime({ offset: true }).optional(), source: z.string().max(300).optional(), props: z.record(z.string(), z.unknown()).optional() })).min(1).max(50) }),
      response: { 204: z.null() },
    },
  }, async (req, reply) => {
    reply.code(204);
    if (req.headers.dnt === "1" || req.headers["sec-gpc"] === "1" || !req.body.consent) return null;
    const country = ((req.headers["cf-ipcountry"] ?? req.headers["x-vercel-ip-country"] ?? req.headers["x-country"]) as string | undefined)?.toUpperCase();
    const c = /^[A-Z]{2}$/.test(country ?? "") ? country! : null;
    const now = Date.now();
    const rows = req.body.events.map((e) => {
      // Un reloj de cliente desfasado no puede inventar el pasado ni el futuro: fuera de ±1 día se usa la hora del servidor.
      const t = e.ts && Math.abs(new Date(e.ts).getTime() - now) < 86_400_000 ? e.ts : new Date(now).toISOString();
      return [e.type, cleanPage(e.page), e.session_id.slice(0, 64), JSON.stringify(cleanProps(e.props)), t, c, cleanSource(e.source)];
    });
    // Fase 9.1: con Redis configurado, encolar en vez de insertar en la DB transaccional (un trabajo programado vacía la cola en lotes).
    // Si no hay Redis, o si falló encolar algún evento del lote, se inserta directo como antes (comportamiento sin cambios).
    if (app.telemetryQueue.enabled) {
      const queued = await Promise.all(rows.map((row) => app.telemetryQueue.push("analytics_events", row)));
      if (queued.every(Boolean)) return null;
    }
    const values = rows.map((_, i) => `($${i * 7 + 1},$${i * 7 + 2},$${i * 7 + 3},$${i * 7 + 4},$${i * 7 + 5},$${i * 7 + 6},$${i * 7 + 7})`).join(",");
    await db.query(`INSERT INTO analytics_events (event_type, page, session_id, metadata, created_at, country, source) VALUES ${values}`, rows.flat());
    return null;
  });

  r.get("/admin/analytics/overview", { onRequest: admin, schema: { tags: ["admin"], summary: "KPIs de la plataforma en un rango", security: bearer, querystring: z.object({ from: date.optional(), to: date.optional() }), response: { 200: ok } } }, async (req) => {
    const { from, to } = range(req.query);
    // Contar sesiones distintas sobre cientos de miles de eventos cuesta ~150 ms: se comparte el resultado 20 s (y una sola consulta si varios paneles lo piden a la vez).
    return { data: await overviewCache.wrap(`${from}|${to}`, () => overview(from, to)) };
  });
  const overview = async (from: string, to: string) => {
    const p = [from, to];
    const inRange = (col: string) => `${col} >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND ${col} < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo')`;
    const one = async (sql: string, params: unknown[] = p) => Number((await db.query<{ n: string }>(sql, params)).rows[0]!.n);
    // Vistas, sesiones y serie diaria salen de UNA pasada por los eventos del rango (antes eran tres).
    const eventsQ = db.query<{ day: string; views: number; sessions: number }>(`SELECT (created_at ${RD})::date::text AS day, count(*) FILTER (WHERE event_type = 'page_view')::int AS views, count(DISTINCT session_id)::int AS sessions FROM analytics_events WHERE ${inRange("created_at")} GROUP BY 1 ORDER BY 1`, p);
    const totalsQ = db.query<{ views: string; sessions: string }>(`SELECT count(*) FILTER (WHERE event_type = 'page_view') AS views, count(DISTINCT session_id) AS sessions FROM analytics_events WHERE ${inRange("created_at")}`, p);
    const [users, reviews, favorites, posts, registrations, bookings, revenue, orders] = await Promise.all([
      one(`SELECT count(*) AS n FROM users WHERE ${inRange("created_at")}`), one(`SELECT count(*) AS n FROM reviews WHERE ${inRange("created_at")}`), one(`SELECT count(*) AS n FROM favorites WHERE ${inRange("created_at")}`),
      one(`SELECT count(*) AS n FROM social_posts WHERE ${inRange("created_at")} AND deleted_at IS NULL`), one(`SELECT count(*) AS n FROM establishment_registrations WHERE ${inRange("created_at")}`),
      one(`SELECT count(*) AS n FROM bookings WHERE ${inRange("created_at")} AND status <> 'cancelled'`),
      one(`SELECT coalesce(sum(CASE WHEN kind = 'refund' THEN -amount ELSE amount END), 0) AS n FROM booking_payments WHERE status = 'succeeded' AND currency = 'USD' AND ${inRange("created_at")}`),
      one(`SELECT count(*) AS n FROM store_orders WHERE ${inRange("created_at")} AND status NOT IN ('pending', 'cancelled')`),
    ]);
    const [totals, dailyRes] = await Promise.all([totalsQ, eventsQ]);
    const views = Number(totals.rows[0]!.views), sessions = Number(totals.rows[0]!.sessions), daily = dailyRes.rows;
    return { range: { from, to }, users_new: users, reviews, favorites, social_posts: posts, establishment_requests: registrations, bookings, booking_revenue_usd: revenue, store_orders: orders, page_views: views, sessions, daily };
  };

  const traffic = async (q: { from?: string; to?: string; group: "page" | "source" | "country" | "day" }) => {
    const { from, to } = range(q);
    const col = q.group === "day" ? `(created_at ${RD})::date::text` : q.group;
    const dcol = q.group === "day" ? "day::text" : q.group;
    const cutoff = addDays(todayInSantoDomingo(), -Math.round(RETENTION_MONTHS * 30.4));
    // Lo reciente sale de los eventos crudos; lo anterior a la retención, del agregado diario.
    const { rows } = await db.query<{ k: string | null; views: number; sessions: number }>(
      `SELECT coalesce(k, '(directo)') AS k, sum(views)::int AS views, sum(sessions)::int AS sessions FROM (
         SELECT ${col} AS k, count(*) AS views, count(DISTINCT session_id) AS sessions FROM analytics_events WHERE event_type = 'page_view' AND created_at >= (greatest($1::date, $3::date)::timestamp AT TIME ZONE 'America/Santo_Domingo') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo') GROUP BY 1
         UNION ALL
         SELECT nullif(${dcol}, '') AS k, sum(events) AS views, sum(sessions) AS sessions FROM analytics_daily WHERE event_type = 'page_view' AND day BETWEEN $1::date AND least($2::date, $3::date - 1) GROUP BY 1
       ) t GROUP BY 1 ORDER BY views DESC, k LIMIT 100`, [from, to, cutoff],
    );
    return { range: { from, to }, group: q.group, rows: rows.map((x) => ({ key: x.k, views: x.views, sessions: x.sessions })) };
  };
  const trafficQ = z.object({ from: date.optional(), to: date.optional(), group: z.enum(["page", "source", "country", "day"]).default("page") });
  r.get("/admin/analytics/traffic", { onRequest: admin, schema: { tags: ["admin"], summary: "Vistas y sesiones por página, origen, país o día", security: bearer, querystring: trafficQ, response: { 200: ok } } }, async (req) => ({ data: await traffic(req.query) }));

  const topContent = async (q: { metric: "views" | "favorites"; type?: string; limit: number; from?: string; to?: string }) => {
    if (q.metric === "views") {
      const { from, to } = range(q);
      const { rows } = await db.query("SELECT page, count(*)::int AS views, count(DISTINCT session_id)::int AS sessions FROM analytics_events WHERE event_type = 'page_view' AND page IS NOT NULL AND created_at >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo') GROUP BY page ORDER BY views DESC, page LIMIT $3", [from, to, q.limit]);
      return rows;
    }
    const { rows } = await db.query<{ entity_type: string; entity_id: string; favorites: number }>("SELECT entity_type, entity_id, count(*)::int AS favorites FROM favorites WHERE ($1::text IS NULL OR entity_type = $1) GROUP BY 1, 2 ORDER BY favorites DESC, entity_id LIMIT $2", [q.type ?? null, q.limit]);
    const out = [];
    for (const x of rows) {
      const d = COLLECTIONS.find((c) => c.entityType === x.entity_type);
      let title: string | null = null, slug: string | null = null;
      if (d && /^[0-9a-f-]{36}$/i.test(x.entity_id)) { const t = (await db.query(`SELECT "${d.title}"::text AS title${hasCol(d.table, "slug") ? ", slug" : ""} FROM "${d.table}" WHERE id = $1`, [x.entity_id])).rows[0]; title = t?.title ?? null; slug = t?.slug ?? null; }
      out.push({ ...x, title, slug });
    }
    return out;
  };
  const topQ = z.object({ metric: z.enum(["views", "favorites"]).default("views"), type: z.string().max(40).optional(), limit: z.coerce.number().int().min(1).max(100).default(20), from: date.optional(), to: date.optional() });
  r.get("/admin/analytics/top-content", { onRequest: admin, schema: { tags: ["admin"], summary: "Contenido más visto o más guardado", security: bearer, querystring: topQ, response: { 200: ok } } }, async (req) => ({ data: await topContent(req.query) }));

  r.get("/admin/analytics/funnels/:name", { onRequest: admin, schema: { tags: ["admin"], summary: "Embudos calculados con datos reales (reserva, registro, tienda)", security: bearer, params: z.object({ name: z.enum(["reserva", "registro", "tienda"]) }), querystring: z.object({ from: date.optional(), to: date.optional() }), response: { 200: ok } } }, async (req) => {
    const { from, to } = range(req.query);
    const p = [from, to];
    const inR = (col: string) => `${col} >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND ${col} < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo')`;
    const n = async (sql: string) => Number((await db.query<{ n: string }>(sql, p)).rows[0]!.n);
    const steps: { step: string; count: number }[] = req.params.name === "reserva"
      ? [{ step: "Reservas iniciadas", count: await n(`SELECT count(*) AS n FROM bookings WHERE ${inR("created_at")}`) }, { step: "Confirmadas", count: await n(`SELECT count(*) AS n FROM bookings WHERE ${inR("created_at")} AND status IN ('confirmed', 'in_progress', 'completed')`) }, { step: "Con pago", count: await n(`SELECT count(*) AS n FROM bookings WHERE ${inR("created_at")} AND payment_status IN ('paid', 'partial')`) }, { step: "Completadas", count: await n(`SELECT count(*) AS n FROM bookings WHERE ${inR("created_at")} AND status = 'completed'`) }]
      : req.params.name === "registro"
        ? [{ step: "Cuentas creadas", count: await n(`SELECT count(*) AS n FROM users WHERE ${inR("created_at")}`) }, { step: "Correo verificado", count: await n(`SELECT count(*) AS n FROM users WHERE ${inR("created_at")} AND email_verified_at IS NOT NULL`) }, { step: "Con actividad de juego", count: await n(`SELECT count(*) AS n FROM users u WHERE ${inR("u.created_at")} AND EXISTS (SELECT 1 FROM gamification_transactions g WHERE g.user_id = u.id)`) }, { step: "Con una reserva o pedido", count: await n(`SELECT count(*) AS n FROM users u WHERE ${inR("u.created_at")} AND (EXISTS (SELECT 1 FROM bookings b WHERE b.user_id = u.id) OR EXISTS (SELECT 1 FROM store_orders o WHERE o.user_id = u.id))`) }]
        : [{ step: "Pedidos creados", count: await n(`SELECT count(*) AS n FROM store_orders WHERE ${inR("created_at")}`) }, { step: "Pagados", count: await n(`SELECT count(*) AS n FROM store_orders WHERE ${inR("created_at")} AND payment_status IN ('paid', 'partial', 'refunded')`) }, { step: "Enviados", count: await n(`SELECT count(*) AS n FROM store_orders WHERE ${inR("created_at")} AND (shipped_at IS NOT NULL OR status IN ('shipped', 'delivered'))`) }, { step: "Entregados", count: await n(`SELECT count(*) AS n FROM store_orders WHERE ${inR("created_at")} AND (delivered_at IS NOT NULL OR status = 'delivered')`) }];
    const first = steps[0]!.count;
    return { data: { name: req.params.name, range: { from, to }, steps: steps.map((s, i) => ({ ...s, pct_of_first: first ? Math.round((s.count / first) * 1000) / 10 : 0, pct_of_previous: i && steps[i - 1]!.count ? Math.round((s.count / steps[i - 1]!.count) * 1000) / 10 : null })) } };
  });

  const nps = async (q: { from?: string; to?: string }) => {
    const { from, to } = range(q);
    const scores = (await db.query<{ nps_score: number }>("SELECT nps_score FROM survey_responses WHERE nps_score IS NOT NULL AND created_at >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo')", [from, to])).rows.map((x) => x.nps_score);
    const promoters = scores.filter((s) => s >= 9).length, detractors = scores.filter((s) => s <= 6).length;
    const comments = (await db.query("SELECT r.nps_score AS score, t.title AS survey, (SELECT string_agg(value, ' · ') FROM jsonb_each_text(r.responses) WHERE key IN (SELECT q->>'id' FROM jsonb_array_elements(t.questions) q WHERE q->>'type' = 'text')) AS comment, r.created_at FROM survey_responses r JOIN survey_templates t ON t.id = r.template_id WHERE r.nps_score IS NOT NULL AND r.created_at >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND r.created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo') ORDER BY r.created_at DESC LIMIT 50", [from, to])).rows.filter((x) => x.comment);
    return { range: { from, to }, count: scores.length, score: scores.length ? Math.round(((promoters - detractors) / scores.length) * 100) : null, promoters, detractors, passives: scores.length - promoters - detractors, comments };
  };
  r.get("/admin/analytics/nps", { onRequest: admin, schema: { tags: ["admin"], summary: "NPS y comentarios de las encuestas", security: bearer, querystring: z.object({ from: date.optional(), to: date.optional() }), response: { 200: ok } } }, async (req) => ({ data: await nps(req.query) }));

  const searchTerms = async (q: { from?: string; to?: string; limit: number }) => {
    const { from, to } = range(q);
    return (await db.query("SELECT metadata->>'q' AS term, count(*)::int AS searches FROM analytics_events WHERE event_type = 'search' AND coalesce((metadata->>'results')::int, 0) = 0 AND created_at >= ($1::date::timestamp AT TIME ZONE 'America/Santo_Domingo') AND created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santo_Domingo') GROUP BY 1 ORDER BY searches DESC, term LIMIT $3", [from, to, q.limit])).rows;
  };
  r.get("/admin/analytics/search-terms", { onRequest: admin, schema: { tags: ["admin"], summary: "Términos buscados sin resultados", security: bearer, querystring: z.object({ from: date.optional(), to: date.optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }), response: { 200: ok } } }, async (req) => ({ data: await searchTerms(req.query) }));

  r.get("/admin/analytics/export.csv", { onRequest: admin, schema: { tags: ["admin"], summary: "Exporta un reporte en CSV", security: bearer, querystring: z.object({ report: z.enum(["traffic", "top-content", "search-terms", "nps"]), from: date.optional(), to: date.optional(), group: z.enum(["page", "source", "country", "day"]).default("page"), metric: z.enum(["views", "favorites"]).default("views"), limit: z.coerce.number().int().min(1).max(200).default(100) }) } }, async (req, reply) => {
    const q = req.query;
    const rows: Record<string, unknown>[] = q.report === "traffic" ? (await traffic(q)).rows : q.report === "top-content" ? await topContent(q) : q.report === "search-terms" ? await searchTerms(q) : (await nps(q)).comments;
    await audit(db, { actor: req.user!.id, action: "analytics.export", entity: "report", id: q.report, ip: req.ip });
    reply.header("content-type", "text/csv; charset=utf-8").header("content-disposition", `attachment; filename="${q.report}.csv"`);
    return toCsv(rows);
  });

  // ---------- Cifras públicas ----------
  r.get("/statistics/public", { schema: { tags: tag, summary: "Cifras públicas de /estadisticas (las del equipo en `statistics.public` más conteos del portal)", response: { 200: ok } } }, async (_q, reply) => {
    const s = (await db.query<{ value: unknown }>("SELECT value FROM site_settings WHERE key = 'statistics.public' AND is_public")).rows[0];
    const count = async (t: string) => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${t} WHERE status = 'published' AND deleted_at IS NULL`)).rows[0]!.n);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: { official: s?.value ?? null, portal: { destinations: await count("destinations"), beaches: await count("beaches"), hotels: await count("hotels"), restaurants: await count("restaurants"), events: await count("events") } } };
  });

  // ---------- API B2B & Analítica Agregada Anonimizada (#5 y #16) ----------
  r.post("/b2b/api-keys", {
    onRequest: app.authenticate,
    schema: {
      tags: ["b2b", "analítica"],
      summary: "Genera una nueva API Key B2B para acceso a datos agregados del turismo",
      security: bearer,
      body: z.object({
        client_name: z.string().trim().min(3).max(100),
        tier: z.enum(["standard", "pro", "enterprise"]).default("standard"),
        allowed_domains: z.array(z.string().max(100)).max(10).default([]),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const rawKey = `dr_b2b_${randomBytes(24).toString("hex")}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 14);
    const rateLimit = req.body.tier === "enterprise" ? 600 : req.body.tier === "pro" ? 240 : 60;

    const ins = await db.query(
      `INSERT INTO b2b_api_keys (user_id, client_name, key_hash, key_prefix, tier, allowed_domains, rate_limit_minute)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, client_name, key_prefix, tier, allowed_domains, rate_limit_minute, is_active, created_at`,
      [req.user!.id, req.body.client_name, keyHash, keyPrefix, req.body.tier, req.body.allowed_domains, rateLimit],
    );

    await audit(db, { actor: req.user!.id, action: "b2b.key_create", entity: "b2b_api_key", id: ins.rows[0].id, meta: { tier: req.body.tier }, ip: req.ip });
    reply.code(201);
    return { data: { key: rawKey, details: ins.rows[0] } };
  });

  r.get("/b2b/api-keys", {
    onRequest: app.authenticate,
    schema: {
      tags: ["b2b"],
      summary: "Mis API Keys B2B activas",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const { rows } = await db.query(
      "SELECT id, client_name, key_prefix, tier, allowed_domains, rate_limit_minute, is_active, last_used_at, created_at FROM b2b_api_keys WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user!.id],
    );
    return { data: rows };
  });

  r.delete("/b2b/api-keys/:id", {
    onRequest: app.authenticate,
    schema: {
      tags: ["b2b"],
      summary: "Revoca una API Key B2B",
      security: bearer,
      params: z.object({ id: z.string().uuid() }),
      response: { 204: z.null() },
    },
  }, async (req, reply) => {
    await db.query("UPDATE b2b_api_keys SET is_active = false, revoked_at = now() WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.id]);
    await audit(db, { actor: req.user!.id, action: "b2b.key_revoke", entity: "b2b_api_key", id: req.params.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  r.get("/api/v1/b2b/analytics/aggregate", {
    schema: {
      tags: ["b2b"],
      summary: "Datos turísticos agregados y anonimizados B2B (requiere encabezado X-API-Key)",
      querystring: z.object({ from: date.optional(), to: date.optional(), dimension: z.enum(["country", "destination", "category"]).default("country") }),
      response: { 200: ok },
    },
  }, async (req) => {
    const rawKey = req.headers["x-api-key"];
    if (typeof rawKey !== "string" || !rawKey.startsWith("dr_b2b_")) {
      throw new AppError("UNAUTHENTICATED", "API Key B2B inválida o ausente en el encabezado X-API-Key");
    }
    const hash = createHash("sha256").update(rawKey).digest("hex");
    const keyRow = (await db.query<{ id: string; tier: string }>("SELECT id, tier FROM b2b_api_keys WHERE key_hash = $1 AND is_active", [hash])).rows[0];
    if (!keyRow) throw new AppError("UNAUTHENTICATED", "API Key no autorizada o revocada");

    await db.query("UPDATE b2b_api_keys SET last_used_at = now() WHERE id = $1", [keyRow.id]);

    const { from, to } = range(req.query);
    const { rows } = await db.query(
      `SELECT coalesce(country, 'global') AS origin_country,
              sum(events)::int AS total_events,
              sum(sessions)::int AS total_sessions
         FROM analytics_daily
        WHERE day >= $1::date AND day <= $2::date
        GROUP BY country
        ORDER BY total_events DESC
        LIMIT 50`,
      [from, to],
    );

    return {
      data: {
        provider: "Descubre RD Open Tourism B2B Network",
        period: { from, to },
        dimension: req.query.dimension,
        total_sample_points: rows.length,
        records: rows,
      },
    };
  });
}

/** Retención (docs §14/§9): agrega por día lo que sale de la ventana de 13 meses y borra los eventos crudos ya agregados. */
export function registerAnalyticsJobs(app: FastifyInstance, runner: JobRunner) {
  runner.register({
    name: "analytics.flush_queue", description: "Vacía en lotes la cola Redis de eventos de analítica hacia PostgreSQL (Fase 9.1; no hace nada si no hay Redis)", everySeconds: 30,
    run: async () => {
      if (!app.telemetryQueue.enabled) return { flushed: 0 };
      let flushed = 0;
      for (;;) {
        const batch = (await app.telemetryQueue.drain("analytics_events", 500)) as [string, string | null, string, string, string, string | null, string | null][];
        if (batch.length === 0) break;
        const values = batch.map((_, i) => `($${i * 7 + 1},$${i * 7 + 2},$${i * 7 + 3},$${i * 7 + 4},$${i * 7 + 5},$${i * 7 + 6},$${i * 7 + 7})`).join(",");
        await app.db.query(`INSERT INTO analytics_events (event_type, page, session_id, metadata, created_at, country, source) VALUES ${values}`, batch.flat());
        flushed += batch.length;
        if (batch.length < 500) break;
      }
      return { flushed };
    },
  });
  runner.register({
    name: "analytics.rollup", description: `Agrega por día y purga los eventos de más de ${RETENTION_MONTHS} meses`, everySeconds: 86_400,
    run: async () => {
      const cutoff = `now() - interval '${RETENTION_MONTHS} months'`;
      const agg = await app.db.query(
        `INSERT INTO analytics_daily (day, event_type, page, country, source, events, sessions)
         SELECT (created_at AT TIME ZONE 'America/Santo_Domingo')::date, event_type, coalesce(page, ''), coalesce(country, ''), coalesce(source, ''), count(*)::int, count(DISTINCT session_id)::int
           FROM analytics_events WHERE created_at < ${cutoff} GROUP BY 1, 2, 3, 4, 5
         ON CONFLICT (day, event_type, page, country, source) DO UPDATE SET events = analytics_daily.events + EXCLUDED.events, sessions = GREATEST(analytics_daily.sessions, EXCLUDED.sessions)`,
      );
      const purged = await app.db.query(`DELETE FROM analytics_events WHERE created_at < ${cutoff}`);
      return { aggregated: agg.rowCount, purged: purged.rowCount };
    },
  });
}
