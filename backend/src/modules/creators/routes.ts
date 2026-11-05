import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { httpUrl } from "./url.js";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../../lib/audit.js";
import { CreatorService } from "./service.js";
import type { CreatorAffiliateService } from "./affiliate.js";

declare module "fastify" {
  interface FastifyInstance {
    creators: CreatorService;
    creatorAffiliate: CreatorAffiliateService;
  }
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(20) };

/** Rutas públicas y de creadores UGC (Docs §Fase 3B) */
export async function creatorRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const service = app.creators ?? new CreatorService(db);
  const optionalUser = async (req: FastifyRequest) => {
    if (req.headers.authorization) {
      try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; }
    }
  };

  // ---------- Feed y Detalle Público ----------
  r.get("/creators/feed", {
    schema: {
      tags: ["creadores"],
      summary: "Feed público de videos y experiencias UGC",
      querystring: z.object({
        ...page,
        category: z.string().max(60).optional(),
        destination: z.string().max(80).optional(),
      }),
      response: { 200: z.object({ data: any, meta: any }) },
    },
  }, async (req, reply) => {
    const { rows, total } = await service.listFeed(req.query);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.get("/creators/profile/:handle", {
    schema: {
      tags: ["creadores"],
      summary: "Perfil público del creador: identidad, sellos con sus criterios, reputación y métricas agregadas",
      params: z.object({ handle: z.string().max(80) }),
      response: { 200: ok },
    },
  }, async (req, reply) => {
    // Punto 41: la identidad pública respeta `public_profile = false` respondiendo 404.
    const p = await service.publicIdentity(req.params.handle);
    if (!p) throw AppError.notFound("Perfil de creador");
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: p };
  });

  r.post("/creators/videos/:id/events", {
    onRequest: optionalUser,
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    schema: {
      tags: ["creadores"],
      summary: "Registra evento de reproducción o interacción en video UGC",
      params: uuid,
      body: z.object({
        // "conversion" lo registra el servidor al atribuir una venta, no el cliente.
        event_type: z.enum(["view_start", "view_complete", "like", "share"]),
        watch_time_seconds: z.number().int().min(0).max(86_400).default(0),
        session_id: z.string().min(6).max(100).optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await service.trackVideoEvent({
      video_id: req.params.id,
      event_type: req.body.event_type,
      watch_time_seconds: req.body.watch_time_seconds,
      session_id: req.body.session_id,
      user_id: req.user?.id ?? null,
      ip: req.ip,
    });
    return { data: res };
  });

  // ---------- Panel del Creador (Autenticado) ----------
  r.post("/creators/onboarding", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Registro como creador de contenido de Descubre RD",
      security: bearer,
      body: z.object({
        handle: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_.]+$/),
        display_name: z.string().trim().min(2).max(100),
        bio: z.string().max(500).optional(),
        avatar_url: httpUrl().optional(),
        social_channels: z.record(z.string(), z.string()).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const p = await service.registerCreator(req.user!.id, req.body);
    await audit(db, { actor: req.user!.id, action: "creator.register", entity: "creator_profile", id: p.id, ip: req.ip });
    reply.code(201);
    return { data: p };
  });

  r.get("/creators/me", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Panel privado del creador: métricas, saldo acumulado y videos",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const profile = await service.getProfile(req.user!.id);
    if (!profile) throw AppError.notFound("Perfil de creador no configurado");
    const { rows: videos } = await db.query("SELECT * FROM creator_videos WHERE creator_id = $1 ORDER BY created_at DESC", [req.user!.id]);
    const { rows: payouts } = await db.query("SELECT * FROM creator_payouts WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 20", [req.user!.id]);
    return { data: { profile, videos, payouts } };
  });

  r.post("/creators/videos", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Publica un video UGC con atribución a tours o experiencias (queda en revisión de moderación)",
      security: bearer,
      body: z.object({
        title: z.string().trim().min(3).max(120),
        description: z.string().max(1000).optional(),
        video_url: httpUrl(),
        thumbnail_url: httpUrl().optional(),
        duration_seconds: z.number().int().min(1).max(900),
        file_size_bytes: z.number().int().min(1),
        resolution: z.string().max(20).optional(),
        aspect_ratio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
        destination_name: z.string().max(100).optional(),
        category: z.string().max(60).optional(),
        tags: z.array(z.string().max(40)).max(15).default([]),
        linked_listing_id: z.string().uuid().optional(),
        linked_listing_type: z.enum(["marketplace_product", "operator_listing"]).optional(),
        license_available: z.boolean().default(true),
        license_fee: z.number().min(0).default(0),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const profile = await service.getProfile(req.user!.id);
    if (!profile) throw AppError.notFound("Debes completar tu registro como creador antes de publicar videos");
    const video = await service.publishVideo({ ...req.body, creator_id: req.user!.id });
    await audit(db, { actor: req.user!.id, action: "creator.video_publish", entity: "creator_video", id: video.id, ip: req.ip });
    reply.code(201);
    return { data: video };
  });

  // ---------- Punto 41: Centro de identidad y reputación del creador ----------
  r.get("/creators/me/identity", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Centro de identidad: perfil, sellos con criterios publicados, reputación y audiencia",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => ({ data: await service.identity(req.user!.id) }));

  r.patch("/creators/me/identity", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Actualiza la identidad declarada del creador (categorías, idiomas, visibilidad y bio)",
      security: bearer,
      body: z.object({
        categories: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
        languages: z.array(z.string().trim().min(1).max(5)).max(6).optional(),
        public_profile: z.boolean().optional(),
        bio: z.string().max(500).optional(),
        avatar_url: httpUrl().optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const profile = await service.updateIdentity(req.user!.id, req.body);
    await audit(db, { actor: req.user!.id, action: "creator.identity_update", entity: "creator_profile", id: profile.id, meta: { fields: Object.keys(req.body) }, ip: req.ip });
    return { data: profile };
  });

  // ---------- Punto 44: apelaciones del creador ----------
  r.get("/creators/me/appeals", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Apelaciones de mis publicaciones, con su estado y resolución",
      security: bearer,
      querystring: z.object(page),
      response: { 200: z.object({ data: any, meta: any }) },
    },
  }, async (req) => {
    const { rows, total } = await service.listAppeals(req.user!.id, req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });

  r.post("/creators/videos/:id/appeal", {
    onRequest: auth,
    schema: {
      tags: ["creadores"],
      summary: "Apela la moderación de mi publicación (una sola apelación abierta por publicación)",
      security: bearer,
      params: uuid,
      body: z.object({ reason: z.string().trim().min(10).max(500) }).strict(),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const appeal = await service.appealVideo(req.user!.id, req.params.id, req.body.reason);
    await audit(db, { actor: req.user!.id, action: "creator.appeal_create", entity: "creator_video_appeal", id: appeal.id, meta: { video_id: req.params.id }, ip: req.ip });
    reply.code(201);
    return { data: appeal };
  });

  // ---------- Administración / Liquidaciones (#G - Capa 3 Fondo de Creadores) ----------
  // ---------- Enlaces de afiliado (comparten el `?ref=` de los embajadores; ver creators/affiliate.ts) ----------
  const links = app.creatorAffiliate;
  r.get("/creators/me/affiliate", { onRequest: auth, schema: { tags: ["creadores"], summary: "Mis enlaces de afiliado con sus clics, pedidos y comisiones (estimadas y confirmadas)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await links.overview(req.user!.id) }));
  r.post("/creators/me/affiliate/links", {
    onRequest: auth, config: { rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max: 30, timeWindow: "1 hour" } : { max: 1_000_000, timeWindow: "1 minute" } },
    schema: { tags: ["creadores"], summary: "Crea un enlace de afiliado hacia una página del sitio (si ya existe para ese destino, devuelve el mismo)", security: bearer, body: z.object({ target_path: z.string().trim().min(1).max(300), label: z.string().trim().max(80).optional() }), response: { 200: ok, 201: ok } },
  }, async (req, reply) => {
    const link = await links.createLink(req.user!.id, req.body);
    if (link.created) { reply.code(201); await audit(db, { actor: req.user!.id, action: "creator.affiliate_link_created", entity: "creator_affiliate_link", id: link.id, meta: { target: link.target_path }, ip: req.ip }); }
    return { data: link };
  });
  r.delete("/creators/me/affiliate/links/:id", { onRequest: auth, schema: { tags: ["creadores"], summary: "Archiva un enlace: deja de atribuir compras nuevas; lo ya atribuido se conserva", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await links.archiveLink(req.user!.id, req.params.id);
    reply.code(204);
    return null;
  });

  // ---------- Admin: directorio de creadores y matchmaking con estancias ----------
  r.get("/admin/creators", {
    onRequest: admin,
    schema: { tags: ["admin", "creadores"], summary: "Directorio de creadores con su contenido y el rendimiento de sus enlaces", security: bearer, querystring: z.object({ ...page, q: z.string().trim().max(80).optional(), status: z.string().max(20).optional() }), response: { 200: ok } },
  }, async (req) => {
    const { rows, total } = await links.adminDirectory(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/admin/creator-stays/open", { onRequest: admin, schema: { tags: ["admin", "creadores"], summary: "Estancias abiertas de los operadores, para invitar creadores", security: bearer, response: { 200: ok } } }, async () => ({
    data: (await db.query(
      `SELECT s.id, s.hotel_name, s.destination, s.stay_title, s.nights_count, s.included_perks, s.deliverables_required, s.image_url, s.created_at,
              (SELECT count(*)::int FROM creator_stay_invitations i WHERE i.stay_id = s.id) AS invitations
         FROM creator_stays s WHERE s.status = 'open' ORDER BY s.created_at DESC LIMIT 100`,
    )).rows,
  }));
  r.post("/admin/creators/:id/invite-stay", {
    onRequest: admin,
    schema: {
      tags: ["admin", "creadores"], summary: "Invita a un creador a una estancia abierta en nombre de su operador (matchmaking del equipo)", security: bearer, params: uuid,
      body: z.object({ stay_id: z.string().uuid(), invitation_message: z.string().trim().min(10).max(1000), scheduled_dates: z.string().trim().max(100).optional() }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const creator = (await db.query("SELECT 1 FROM creator_profiles WHERE id = $1 AND status = 'approved'", [req.params.id])).rowCount;
    if (!creator) throw AppError.notFound("Creador");
    const stay = (await db.query<{ operator_id: string; hotel_name: string; included_perks: string[]; deliverables_required: string[] }>("SELECT operator_id, hotel_name, included_perks, deliverables_required FROM creator_stays WHERE id = $1 AND status = 'open'", [req.body.stay_id])).rows[0];
    if (!stay) throw AppError.notFound("Estancia abierta");
    const dup = await db.query("SELECT 1 FROM creator_stay_invitations WHERE creator_id = $1 AND stay_id = $2 AND status IN ('pending', 'accepted')", [req.params.id, req.body.stay_id]);
    if (dup.rowCount) throw new AppError("CONFLICT", "Ese creador ya tiene una invitación vigente para esta estancia", { code: "ALREADY_INVITED" });
    const row = (await db.query(
      `INSERT INTO creator_stay_invitations (operator_id, creator_id, stay_id, hotel_name, invitation_message, offered_perks, requested_deliverables, scheduled_dates, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
      [stay.operator_id, req.params.id, req.body.stay_id, stay.hotel_name, req.body.invitation_message, stay.included_perks?.length ? stay.included_perks : ["Estancia"], stay.deliverables_required?.length ? stay.deliverables_required : ["Contenido acordado"], req.body.scheduled_dates ?? null],
    )).rows[0];
    await audit(db, { actor: req.user!.id, action: "admin.creator_stay_invitation_sent", entity: "creator_stay_invitation", id: row.id, meta: { creator_id: req.params.id, stay_id: req.body.stay_id, on_behalf_of: stay.operator_id }, ip: req.ip });
    reply.code(201);
    return { data: row };
  });

  r.post("/admin/creators/:id/payout", {
    onRequest: admin,
    schema: {
      tags: ["admin", "creadores"],
      summary: "Registra y liquida fondos a creador (Fondo de Creadores o Comisiones)",
      security: bearer,
      params: uuid,
      body: z.object({
        amount: z.number().min(100),
        payout_source: z.enum(["creator_fund", "affiliate_commission", "content_licensing", "tip"]),
        bank_reference: z.string().trim().min(3).max(100),
        notes: z.string().max(300).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    // Cliente dedicado: BEGIN/COMMIT por el pool pueden ir a conexiones distintas y dejar la transacción abierta.
    const c = await db.connect();
    try {
      await c.query("BEGIN");
      const ins = await c.query(
        `INSERT INTO creator_payouts (creator_id, amount, payout_source, status, bank_reference, notes, paid_at)
         VALUES ($1, $2, $3, 'paid', $4, $5, now())
         RETURNING *`,
        [req.params.id, b.amount, b.payout_source, b.bank_reference, b.notes ?? null],
      );
      await c.query(
        `UPDATE creator_profiles
            SET balance_available = GREATEST(0, balance_available - $1), updated_at = now()
          WHERE id = $2`,
        [b.amount, req.params.id],
      );
      await c.query("COMMIT");
      await audit(db, { actor: req.user!.id, action: "creator.payout", entity: "creator_payout", id: ins.rows[0].id, meta: { amount: b.amount }, ip: req.ip });
      reply.code(201);
      return { data: ins.rows[0] };
    } catch (e) {
      await c.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      c.release();
    }
  });
}
