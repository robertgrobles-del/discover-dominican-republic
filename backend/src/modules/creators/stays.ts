import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });

export async function creatorStayRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  // Un negocio es quien dirige una organización de operador (propietario o administrador) o tiene el rol global
  // "partner". El rol "operator" que se pedía antes no existe en `app_role` y dejaba la ruta sólo para administración.
  const operator = async (req: FastifyRequest) => {
    await app.authenticate(req, undefined as never);
    if (req.user!.roles.some((role) => role === "admin" || role === "partner")) return;
    const member = await db.query("SELECT 1 FROM org_members WHERE user_id = $1 AND role IN ('owner', 'admin') AND (expires_at IS NULL OR expires_at > now())", [req.user!.id]);
    if (!member.rowCount) throw new AppError("FORBIDDEN", "Necesitas dirigir una organización de operador para usar esta función");
  };
  const admin = app.requireRole("admin");
  const creatorOrUser = app.authenticate;

  // ================= 1. Operador: Publicar Oportunidades de Estancia =================
  r.post("/operators/creator-stays", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Publica una oportunidad de estancia para influencers y creadores de contenido",
      security: bearer,
      body: z.object({
        hotel_name: z.string().trim().min(2).max(120),
        destination: z.string().trim().min(2).max(100),
        province_id: z.string().max(80).optional(),
        stay_title: z.string().trim().min(5).max(150),
        stay_description: z.string().trim().min(10).max(2000),
        nights_count: z.number().int().min(1).max(14).default(2),
        guests_allowed: z.number().int().min(1).max(6).default(2),
        room_type: z.string().max(100).default("Habitación Deluxe o Suite"),
        included_perks: z.array(z.string().max(100)).min(1).default(["Alojamiento", "Desayuno incluido"]),
        deliverables_required: z.array(z.string().max(150)).min(1).default(["1 Reel / Video corto", "Stories con mención"]),
        min_followers_guideline: z.string().max(50).default("10k+"),
        preferred_niches: z.array(z.string().max(50)).default(["Turismo", "Lifestyle"]),
        dates_flexibility: z.string().max(200).default("A coordinar según disponibilidad"),
        image_url: z.string().url().max(500).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const res = await db.query(
      `INSERT INTO creator_stays (
        operator_id, hotel_name, destination, province_id, stay_title, stay_description,
        nights_count, guests_allowed, room_type, included_perks, deliverables_required,
        min_followers_guideline, preferred_niches, dates_flexibility, image_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'open')
      RETURNING *`,
      [
        req.user!.id, b.hotel_name, b.destination, b.province_id || null, b.stay_title, b.stay_description,
        b.nights_count, b.guests_allowed, b.room_type, b.included_perks, b.deliverables_required,
        b.min_followers_guideline, b.preferred_niches, b.dates_flexibility, b.image_url || null,
      ]
    );

    await audit(db, {
      actor: req.user!.id,
      action: "operator.creator_stay_published",
      entity: "creator_stay",
      id: res.rows[0].id,
      meta: { hotel_name: b.hotel_name, stay_title: b.stay_title },
      ip: req.ip,
    });

    reply.code(201);
    return { data: res.rows[0] };
  });

  r.get("/operators/creator-stays", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Lista las estancias publicadas por mi establecimiento con conteo de postulaciones",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const stays = await db.query(
      `SELECT s.*, 
        count(a.id)::int as applications_count,
        count(a.id) FILTER (WHERE a.status = 'approved')::int as approved_count
       FROM creator_stays s
       LEFT JOIN creator_stay_applications a ON a.stay_id = s.id
       WHERE s.operator_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.user!.id]
    );
    return { data: stays.rows };
  });

  r.get("/operators/creator-stays/:id/applications", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Ver postulantes para una estancia concreta",
      security: bearer,
      params: uuid,
      response: { 200: ok },
    },
  }, async (req) => {
    // Validar propiedad de la estancia
    const stay = await db.query("SELECT id FROM creator_stays WHERE id = $1 AND operator_id = $2", [req.params.id, req.user!.id]);
    if (stay.rowCount === 0) throw AppError.notFound("Estancia no encontrada");

    const apps = await db.query(
      `SELECT a.*, coalesce(cp.display_name, split_part(u.email, '@', 1)) as creator_name, u.email as creator_email, cp.avatar_url as creator_avatar
       FROM creator_stay_applications a
       JOIN users u ON u.id = a.creator_id
       LEFT JOIN creator_profiles cp ON cp.id = a.creator_id
       WHERE a.stay_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    return { data: apps.rows };
  });

  r.patch("/operators/creator-stay-applications/:id", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Acepta o rechaza la postulación de un creador",
      security: bearer,
      params: uuid,
      body: z.object({
        status: z.enum(["approved", "rejected", "completed", "cancelled"]),
        operator_feedback: z.string().max(500).optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    const res = await db.query(
      `UPDATE creator_stay_applications a
       SET status = $2, operator_feedback = coalesce($3, operator_feedback), updated_at = now()
       FROM creator_stays s
       WHERE a.id = $1 AND a.stay_id = s.id AND s.operator_id = $4
       RETURNING a.*`,
      [req.params.id, b.status, b.operator_feedback || null, req.user!.id]
    );
    if (res.rowCount === 0) throw AppError.notFound("Postulación no encontrada");
    return { data: res.rows[0] };
  });

  // ================= 2. Operador: Directorio de Creadores e Invitación Directa =================
  r.get("/operators/creators/directory", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Directorio de creadores verificados para invitaciones directas",
      security: bearer,
      querystring: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const creators = await db.query(
      // Sólo perfiles aprobados y públicos; el nombre y la imagen salen del propio perfil de creador.
      `SELECT cp.id, cp.display_name as name, cp.handle, cp.avatar_url, cp.bio,
        cp.social_channels as social_profiles, cp.categories as niches, cp.audience_verified as verified
       FROM creator_profiles cp
       WHERE cp.status = 'approved' AND cp.public_profile
       ORDER BY cp.audience_verified DESC, cp.display_name ASC
       LIMIT 50`
    );
    return { data: creators.rows };
  });

  r.post("/operators/creators/:id/invite-stay", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "creadores"],
      summary: "Envía una invitación directa de estancia a un creador",
      security: bearer,
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        stay_id: z.string().uuid().optional(),
        hotel_name: z.string().trim().min(2).max(120),
        invitation_message: z.string().trim().min(10).max(1000),
        offered_perks: z.array(z.string().max(100)).min(1).default(["Estancia 2 noches todo incluido", "Spa"]),
        requested_deliverables: z.array(z.string().max(150)).min(1).default(["1 Reel colaborativo", "3 Stories"]),
        scheduled_dates: z.string().max(100).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const res = await db.query(
      `INSERT INTO creator_stay_invitations (
        operator_id, creator_id, stay_id, hotel_name, invitation_message,
        offered_perks, requested_deliverables, scheduled_dates, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        req.user!.id, req.params.id, b.stay_id || null, b.hotel_name, b.invitation_message,
        b.offered_perks, b.requested_deliverables, b.scheduled_dates || null,
      ]
    );

    await audit(db, {
      actor: req.user!.id,
      action: "operator.creator_direct_invitation_sent",
      entity: "creator_stay_invitation",
      id: res.rows[0].id,
      meta: { creator_id: req.params.id, hotel_name: b.hotel_name },
      ip: req.ip,
    });

    reply.code(201);
    return { data: res.rows[0] };
  });

  // ================= 3. Creador / Influencer: Ver Estancias y Postular =================
  r.get("/creators/stays/open", {
    schema: {
      tags: ["creadores"],
      summary: "Lista de estancias y colaboraciones abiertas para creadores de contenido",
      response: { 200: ok },
    },
  }, async () => {
    const stays = await db.query(
      `SELECT s.*, s.hotel_name as operator_business_name
       FROM creator_stays s
       WHERE s.status = 'open'
       ORDER BY s.created_at DESC
       LIMIT 50`
    );
    return { data: stays.rows };
  });

  r.post("/creators/stays/:id/apply", {
    onRequest: creatorOrUser,
    schema: {
      tags: ["creadores"],
      summary: "Postulación de un creador a una estancia de hotel",
      security: bearer,
      params: uuid,
      body: z.object({
        pitch_message: z.string().trim().min(10).max(1000),
        social_profiles: z.record(z.string(), z.any()).default({}),
        proposed_dates: z.string().max(100).optional(),
        proposed_deliverables: z.string().max(500).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    try {
      const res = await db.query(
        `INSERT INTO creator_stay_applications (
          stay_id, creator_id, pitch_message, social_profiles,
          proposed_dates, proposed_deliverables, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *`,
        [
          req.params.id, req.user!.id, b.pitch_message, JSON.stringify(b.social_profiles),
          b.proposed_dates || null, b.proposed_deliverables || null,
        ]
      );
      reply.code(201);
      return { data: res.rows[0] };
    } catch (err) {
      if ((err as { code?: string }).code === "23505") {
        throw new AppError("CONFLICT", "Ya te has postulado previamente a esta estancia.", { code: "ALREADY_APPLIED" });
      }
      throw err;
    }
  });

  r.get("/creators/me/stay-applications", {
    onRequest: creatorOrUser,
    schema: {
      tags: ["creadores"],
      summary: "Mis postulaciones a estancias de hoteles y estado",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT a.*, s.stay_title, s.hotel_name, s.destination, s.nights_count, s.image_url as stay_image
       FROM creator_stay_applications a
       JOIN creator_stays s ON s.id = a.stay_id
       WHERE a.creator_id = $1
       ORDER BY a.created_at DESC`,
      [req.user!.id]
    );
    return { data: res.rows };
  });

  r.get("/creators/me/invitations", {
    onRequest: creatorOrUser,
    schema: {
      tags: ["creadores"],
      summary: "Invitaciones directas recibidas de hoteles",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT i.*, i.hotel_name as operator_name, u.email as operator_email
       FROM creator_stay_invitations i
       JOIN users u ON u.id = i.operator_id
       WHERE i.creator_id = $1
       ORDER BY i.created_at DESC`,
      [req.user!.id]
    );
    return { data: res.rows };
  });

  r.patch("/creators/invitations/:id/respond", {
    onRequest: creatorOrUser,
    schema: {
      tags: ["creadores"],
      summary: "Aceptar o declinar invitación de un hotel",
      security: bearer,
      params: uuid,
      body: z.object({
        decision: z.enum(["accepted", "declined"]),
        decline_reason: z.string().max(300).optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    const res = await db.query(
      `UPDATE creator_stay_invitations
       SET status = $2, decline_reason = coalesce($3, decline_reason), updated_at = now()
       WHERE id = $1 AND creator_id = $4
       RETURNING *`,
      [req.params.id, b.decision, b.decline_reason || null, req.user!.id]
    );
    if (res.rowCount === 0) throw AppError.notFound("Invitación no encontrada");
    return { data: res.rows[0] };
  });

  r.post("/creators/stays/:id/deliverables", {
    onRequest: creatorOrUser,
    schema: {
      tags: ["creadores"],
      summary: "El creador envía los enlaces de contenido UGC completados (Reels, TikTok, Posts)",
      security: bearer,
      params: uuid,
      body: z.object({
        content_links: z.array(z.string().url().max(500)).min(1),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    const res = await db.query(
      `UPDATE creator_stay_applications
       SET content_links = array_cat(content_links, $2::text[]), status = 'completed', updated_at = now()
       WHERE id = $1 AND creator_id = $3
       RETURNING *`,
      [req.params.id, b.content_links, req.user!.id]
    );
    if (res.rowCount === 0) throw AppError.notFound("Postulación no encontrada");
    return { data: res.rows[0] };
  });

  // ================= 4. Administración: entregables de contenido tras las estancias =================
  // Vive aquí, en el módulo dueño de las estancias, y no en `game`: cada tabla la toca un solo dominio.
  r.get("/admin/creators/stay-deliverables", {
    onRequest: admin,
    schema: {
      tags: ["admin", "creadores"],
      summary: "Lista entregables de contenido (Reels, Videos, Fotos) subidos por creadores tras estancias",
      security: bearer,
      response: { 200: ok },
    },
  }, async () => {
    const res = await db.query(
      `SELECT a.id as application_id, a.content_links, a.status, a.updated_at,
        s.stay_title, s.hotel_name, s.destination, s.hotel_name as operator_name,
        coalesce(cp.display_name, split_part(u.email, '@', 1)) as creator_name, u.email as creator_email
       FROM creator_stay_applications a
       JOIN creator_stays s ON s.id = a.stay_id
       JOIN users u ON u.id = a.creator_id
       LEFT JOIN creator_profiles cp ON cp.id = a.creator_id
       WHERE array_length(a.content_links, 1) > 0
       ORDER BY a.updated_at DESC
       LIMIT 200`
    );
    return { data: res.rows };
  });
}
