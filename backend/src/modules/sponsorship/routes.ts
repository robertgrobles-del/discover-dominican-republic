import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../../lib/audit.js";
import { SponsorshipService } from "./service.js";
import { AuctionService } from "./auctions.js";

declare module "fastify" {
  interface FastifyInstance {
    sponsorship: SponsorshipService;
  }
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(20) };

/** Rutas públicas y de gestión publicitaria (Docs §Fase 2B) */
export async function sponsorshipRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const auth = app.authenticate;
  const service = app.sponsorship ?? new SponsorshipService(db);
  const optionalUser = async (req: FastifyRequest) => {
    if (req.headers.authorization) {
      try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; }
    }
  };

  // ---------- Ad Server Público: Entrega y Telemetría ----------
  r.get("/sponsorship/serve/:slot_id", {
    schema: {
      tags: ["patrocinio"],
      summary: "Entrega creatividades activas para un espacio publicitario",
      params: z.object({ slot_id: z.string().min(2).max(60) }),
      querystring: z.object({
        category: z.string().max(60).optional(),
        destination: z.string().max(80).optional(),
        limit: z.coerce.number().int().min(1).max(10).default(1),
      }),
      response: { 200: ok },
    },
  }, async (req, reply) => {
    const creatives = await service.serveSlot({
      slot_id: req.params.slot_id,
      category: req.query.category,
      destination: req.query.destination,
      limit: req.query.limit,
    });
    reply.header("cache-control", "private, no-cache, no-store, must-revalidate");
    return { data: creatives };
  });

  r.post("/sponsorship/telemetry", {
    onRequest: optionalUser,
    schema: {
      tags: ["patrocinio"],
      summary: "Registra telemetría de anuncios (impresión, clic o conversión)",
      body: z.object({
        creative_id: z.string().uuid(),
        slot_id: z.string().min(2).max(60),
        event_type: z.enum(["impression", "click", "conversion"]),
        session_id: z.string().min(6).max(100).optional(),
        page: z.string().max(300).optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const result = await service.recordEvent({
      ...req.body,
      user_id: req.user?.id ?? null,
      ip: req.ip,
    });
    return { data: result };
  });

  r.get("/sponsorship/slots", {
    schema: {
      tags: ["patrocinio"],
      summary: "Espacios de patrocinio e inventario disponibles en el portal",
      response: { 200: ok },
    },
  }, async (_req, reply) => {
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: await service.listSlots() };
  });

  // ---------- Panel Comercial / Gestión de Campañas (#2, #8, #9, #10, #11) ----------
  r.post("/sponsorship/campaigns", {
    onRequest: auth,
    schema: {
      tags: ["patrocinio"],
      summary: "Crea una nueva campaña publicitaria/patrocinada",
      security: bearer,
      body: z.object({
        sponsor_id: z.string().uuid().optional(),
        advertiser_name: z.string().trim().min(2).max(120),
        advertiser_email: z.string().trim().email(),
        campaign_name: z.string().trim().min(3).max(120),
        billing_type: z.enum(["flat", "cpc", "cpm"]),
        budget_total: z.number().min(0).default(0),
        cpc_rate: z.number().min(0).default(0),
        cpm_rate: z.number().min(0).default(0),
        starts_at: z.string().datetime({ offset: true }),
        ends_at: z.string().datetime({ offset: true }),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const ins = await db.query(
      `INSERT INTO sponsorship_campaigns
        (sponsor_id, advertiser_name, advertiser_email, campaign_name, billing_type, budget_total, cpc_rate, cpm_rate, starts_at, ends_at, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending_approval', $11)
       RETURNING *`,
      [b.sponsor_id ?? null, b.advertiser_name, b.advertiser_email, b.campaign_name, b.billing_type, b.budget_total, b.cpc_rate, b.cpm_rate, b.starts_at, b.ends_at, req.user!.id],
    );
    await audit(db, { actor: req.user!.id, action: "campaign.create", entity: "sponsorship_campaign", id: ins.rows[0].id, ip: req.ip });
    reply.code(201);
    return { data: ins.rows[0] };
  });

  r.get("/sponsorship/campaigns/mine", { onRequest: auth, schema: { tags: ["patrocinio"], summary: "Mis campañas con sus anuncios y resultados", security: bearer, response: { 200: ok } } }, async (req) => {
    const { rows } = await db.query(
      `SELECT camp.id, camp.campaign_name, camp.advertiser_name, camp.status, camp.billing_type, camp.starts_at, camp.ends_at, camp.created_at,
              coalesce((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'slot_id', c.slot_id, 'title', c.title, 'target_url', c.target_url, 'status', c.status, 'impressions', c.impressions_count, 'clicks', c.clicks_count) ORDER BY c.created_at)
                          FROM sponsorship_creatives c WHERE c.campaign_id = camp.id), '[]'::jsonb) AS creatives
         FROM sponsorship_campaigns camp WHERE camp.created_by = $1 ORDER BY camp.created_at DESC LIMIT 50`, [req.user!.id],
    );
    return { data: rows };
  });

  r.post("/sponsorship/campaigns/:id/creatives", {
    onRequest: auth,
    schema: {
      tags: ["patrocinio"],
      summary: "Agrega una creatividad/anuncio a una campaña",
      security: bearer,
      params: uuid,
      body: z.object({
        slot_id: z.string().min(2).max(60),
        title: z.string().trim().min(3).max(120),
        headline: z.string().max(200).optional(),
        body_text: z.string().max(1000).optional(),
        target_url: z.string().url().max(500),
        image_url: z.string().url().max(500).optional(),
        badge_label: z.string().max(30).default("Patrocinado"),
        category_target: z.string().max(60).optional(),
        destination_target: z.string().max(80).optional(),
        weight: z.number().int().min(1).max(100).default(10),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    // Sólo quien creó la campaña (o administración) le añade anuncios; una campaña ajena responde como inexistente.
    const campaign = (await db.query<{ created_by: string | null }>("SELECT created_by FROM sponsorship_campaigns WHERE id = $1", [req.params.id])).rows[0];
    if (!campaign || (campaign.created_by !== req.user!.id && !req.user!.roles.includes("admin"))) throw AppError.notFound("Campaña publicitaria");
    // `url()` admite cualquier esquema; un anuncio sólo puede enlazar por http(s).
    for (const url of [b.target_url, b.image_url]) if (url && !/^https?:\/\//i.test(url)) throw AppError.validation("Los enlaces del anuncio deben ser http o https");
    const ins = await db.query(
      `INSERT INTO sponsorship_creatives
        (campaign_id, slot_id, title, headline, body_text, target_url, image_url, badge_label, category_target, destination_target, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.params.id, b.slot_id, b.title, b.headline ?? null, b.body_text ?? null, b.target_url, b.image_url ?? null, b.badge_label, b.category_target ?? null, b.destination_target ?? null, b.weight],
    );
    await audit(db, { actor: req.user!.id, action: "creative.create", entity: "sponsorship_creative", id: ins.rows[0].id, ip: req.ip });
    reply.code(201);
    return { data: ins.rows[0] };
  });

  // ---------- Subasta semanal de posiciones patrocinadas ----------
  const auctions = new AuctionService(db);
  const monday = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD (lunes)");
  r.post("/sponsorship/bids", { onRequest: auth, config: { rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max: 30, timeWindow: "1 hour" } : { max: 1_000_000, timeWindow: "1 minute" } }, schema: { tags: ["patrocinio"], summary: "Puja (a sobre cerrado) por un espacio en una semana futura; repetirla sólo puede subirla", security: bearer, body: z.object({ slot_id: z.string().min(2).max(60), creative_id: z.string().uuid(), period_start: monday, amount: z.number().gt(0).max(99_999_999) }), response: { 201: ok } } }, async (req, reply) => {
    const bid = await auctions.placeBid(req.user!.id, req.body);
    await audit(db, { actor: req.user!.id, action: "sponsorship.bid", entity: "sponsorship_bid", id: bid.id, meta: { slot_id: bid.slot_id, period_start: bid.period_start, amount: bid.amount }, ip: req.ip });
    reply.code(201);
    return { data: bid };
  });
  r.get("/sponsorship/bids/mine", { onRequest: auth, schema: { tags: ["patrocinio"], summary: "Mis pujas y el precio mínimo de cada espacio", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await auctions.myBids(req.user!.id) }));
  r.delete("/sponsorship/bids/:id", { onRequest: auth, schema: { tags: ["patrocinio"], summary: "Retira una puja propia mientras la subasta siga abierta", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await auctions.withdraw(req.user!.id, req.params.id);
    reply.code(204);
    return null;
  });
  r.get("/admin/sponsorship/auctions", { onRequest: admin, schema: { tags: ["admin", "patrocinio"], summary: "Pujas de un espacio y semana, de mayor a menor", security: bearer, querystring: z.object({ slot_id: z.string().min(2).max(60), period_start: monday }), response: { 200: ok } } }, async (req) => ({ data: await auctions.board(req.query.slot_id, req.query.period_start) }));
  r.post("/admin/sponsorship/auctions/close", { onRequest: admin, schema: { tags: ["admin", "patrocinio"], summary: "Cierra la subasta: ganan las pujas más altas hasta el cupo del espacio", security: bearer, body: z.object({ slot_id: z.string().min(2).max(60), period_start: monday }), response: { 200: ok } } }, async (req) => ({ data: await auctions.close(req.user!.id, req.body.slot_id, req.body.period_start, req.ip) }));
  r.put("/admin/sponsorship/slots/:id/auction", { onRequest: admin, schema: { tags: ["admin", "patrocinio"], summary: "Activa la subasta de un espacio y fija su precio mínimo", security: bearer, params: z.object({ id: z.string().min(2).max(60) }), body: z.object({ enabled: z.boolean(), reserve: z.number().min(0).max(99_999_999) }), response: { 200: ok } } }, async (req) => {
    const slot = await auctions.setSlotAuction(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: "sponsorship.slot_auction_set", entity: "sponsorship_slot", id: req.params.id, meta: req.body, ip: req.ip });
    return { data: slot };
  });

  // ---------- Administración / Aprobación de Campañas ----------
  r.get("/admin/sponsorship/campaigns", {
    onRequest: admin,
    schema: {
      tags: ["admin", "patrocinio"],
      summary: "Listado de campañas publicitarias",
      security: bearer,
      querystring: z.object({
        ...page,
        status: z.enum(["draft", "pending_approval", "active", "paused", "completed", "cancelled"]).optional(),
      }),
      response: { 200: z.object({ data: any, meta: any }) },
    },
  }, async (req) => {
    const p: unknown[] = [];
    const w = ["true"];
    if (req.query.status) { p.push(req.query.status); w.push(`status = $${p.length}`); }
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM sponsorship_campaigns WHERE ${w.join(" AND ")}`, p)).rows[0]!.n;
    const { rows } = await db.query(
      `SELECT * FROM sponsorship_campaigns WHERE ${w.join(" AND ")} ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`,
      p,
    );
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.patch("/admin/sponsorship/campaigns/:id/status", {
    onRequest: admin,
    schema: {
      tags: ["admin", "patrocinio"],
      summary: "Aprueba o cambia el estado de una campaña publicitaria",
      security: bearer,
      params: uuid,
      body: z.object({
        status: z.enum(["active", "paused", "cancelled", "completed"]),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const updated = await db.query(
      "UPDATE sponsorship_campaigns SET status = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [req.body.status, req.params.id],
    );
    if (!updated.rows[0]) throw AppError.notFound("Campaña publicitaria");
    await audit(db, { actor: req.user!.id, action: "campaign.status_update", entity: "sponsorship_campaign", id: req.params.id, meta: { status: req.body.status }, ip: req.ip });
    return { data: updated.rows[0] };
  });
}
