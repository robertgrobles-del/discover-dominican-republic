import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });

export async function operatorGamificationRoutes(app: FastifyInstance) {
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

  // ================= 1. Retos Patrocinados por Operadores =================
  r.post("/operators/sponsorship/challenges", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "gamificación"],
      summary: "Crea un reto o misión patrocinada por el establecimiento",
      security: bearer,
      body: z.object({
        title: z.string().trim().min(3).max(120),
        description: z.string().trim().min(5).max(1000).optional(),
        entity_type: z.enum(["hotel", "restaurant", "bar", "experience", "destination", "other"]).default("hotel"),
        entity_id: z.string().max(80).optional(),
        action_type: z.enum(["visit_checkin", "scan_qr", "review_photo", "booking_completed", "social_share"]).default("visit_checkin"),
        xp_reward: z.number().int().min(10).max(500).default(50),
        coin_reward: z.number().int().min(5).max(150).default(15),
        budget_total: z.number().min(0).default(0),
        max_completions: z.number().int().min(1).max(10000).default(100),
        reward_voucher_code: z.string().max(50).optional(),
        reward_voucher_discount: z.string().max(100).optional(), // Ej: "15% de descuento en cena"
        banner_image_url: z.string().url().max(500).optional(),
        starts_at: z.string().datetime().optional(),
        ends_at: z.string().datetime().optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const startsAt = b.starts_at ? new Date(b.starts_at) : new Date();
    const endsAt = b.ends_at ? new Date(b.ends_at) : new Date(Date.now() + 30 * 86400000);

    const res = await db.query(
      `INSERT INTO operator_sponsored_challenges (
        operator_id, title, description, entity_type, entity_id, action_type,
        xp_reward, coin_reward, budget_total, max_completions,
        reward_voucher_code, reward_voucher_discount, banner_image_url,
        starts_at, ends_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending_review')
      RETURNING *`,
      [
        req.user!.id, b.title, b.description || null, b.entity_type, b.entity_id || null, b.action_type,
        b.xp_reward, b.coin_reward, b.budget_total, b.max_completions,
        b.reward_voucher_code || null, b.reward_voucher_discount || null, b.banner_image_url || null,
        startsAt, endsAt,
      ]
    );

    await audit(db, {
      actor: req.user!.id,
      action: "operator.challenge_created",
      entity: "operator_sponsored_challenge",
      id: res.rows[0].id,
      meta: { title: b.title, action_type: b.action_type },
      ip: req.ip,
    });

    reply.code(201);
    return { data: res.rows[0] };
  });

  r.get("/operators/sponsorship/challenges", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "gamificación"],
      summary: "Lista los retos patrocinados creados por mi establecimiento",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT * FROM operator_sponsored_challenges WHERE operator_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    return { data: res.rows };
  });

  // ================= 2. Premios del Club de Recompensas por Operadores =================
  r.post("/operators/sponsorship/rewards", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "gamificación"],
      summary: "Publica un premio o voucher para el Club de Recompensas",
      security: bearer,
      body: z.object({
        prize_name: z.string().trim().min(3).max(120),
        category: z.enum(["hotel_stay", "restaurant_dinner", "excursion_pass", "discount_coupon", "merchandise", "vip_pass"]).default("discount_coupon"),
        description: z.string().trim().min(5).max(1000),
        terms_conditions: z.string().max(2000).optional(),
        image_url: z.string().url().max(500).optional(),
        coin_price: z.number().int().min(10).max(5000).default(100),
        stock_total: z.number().int().min(1).max(500).default(10),
        voucher_prefix: z.string().max(20).default("DR-"),
        valid_until: z.string().datetime().optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const validUntil = b.valid_until ? new Date(b.valid_until) : null;

    const res = await db.query(
      `INSERT INTO operator_sponsored_rewards (
        operator_id, prize_name, category, description, terms_conditions,
        image_url, coin_price, stock_total, stock_remaining, voucher_prefix, valid_until, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, 'pending_review')
      RETURNING *`,
      [
        req.user!.id, b.prize_name, b.category, b.description, b.terms_conditions || null,
        b.image_url || null, b.coin_price, b.stock_total, b.voucher_prefix || "DR-", validUntil,
      ]
    );

    await audit(db, {
      actor: req.user!.id,
      action: "operator.reward_created",
      entity: "operator_sponsored_reward",
      id: res.rows[0].id,
      meta: { prize_name: b.prize_name, coin_price: b.coin_price },
      ip: req.ip,
    });

    reply.code(201);
    return { data: res.rows[0] };
  });

  r.get("/operators/sponsorship/rewards", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "gamificación"],
      summary: "Lista los premios publicados por mi establecimiento",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT * FROM operator_sponsored_rewards WHERE operator_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    return { data: res.rows };
  });

  // ================= 3. Estadísticas de Impacto de Gamificación =================
  r.get("/operators/sponsorship/stats", {
    onRequest: operator,
    schema: {
      tags: ["operadores", "gamificación"],
      summary: "Métricas de participación, visitas generadas y canjes",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const challengesRes = await db.query<{ count: string; completions: string }>(
      `SELECT count(*) as count, coalesce(sum(current_completions), 0) as completions FROM operator_sponsored_challenges WHERE operator_id = $1`,
      [req.user!.id]
    );
    const rewardsRes = await db.query<{ count: string; redeemed: string }>(
      `SELECT count(*) as count, coalesce(sum(stock_total - stock_remaining), 0) as redeemed FROM operator_sponsored_rewards WHERE operator_id = $1`,
      [req.user!.id]
    );

    return {
      data: {
        active_challenges: parseInt(challengesRes.rows[0]?.count || "0", 10),
        total_completions: parseInt(challengesRes.rows[0]?.completions || "0", 10),
        active_rewards: parseInt(rewardsRes.rows[0]?.count || "0", 10),
        total_redemptions: parseInt(rewardsRes.rows[0]?.redeemed || "0", 10),
      },
    };
  });

  // ================= 4. Administración: revisión de retos y premios patrocinados =================
  // Vive aquí, en el módulo dueño de estas tablas, y no en `game`: así cada tabla tiene un solo escritor.
  const operatorName = "coalesce(p.display_name, split_part(u.email, '@', 1))";
  const reviewBody = z.object({ decision: z.enum(["active", "rejected"]), rejection_reason: z.string().max(300).optional() });

  r.get("/admin/gamification/sponsored-challenges", {
    onRequest: admin,
    schema: {
      tags: ["admin", "gamificación"],
      summary: "Lista los retos patrocinados creados por operadores para revisión y moderación",
      security: bearer,
      querystring: z.object({ status: z.enum(["pending_review", "active", "rejected", "paused", "completed"]).optional() }),
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT c.*, ${operatorName} as operator_name, u.email as operator_email
       FROM operator_sponsored_challenges c
       JOIN users u ON u.id = c.operator_id
       LEFT JOIN profiles p ON p.id = c.operator_id
       WHERE ($1::text IS NULL OR c.status = $1)
       ORDER BY c.created_at DESC`,
      [req.query.status ?? null]
    );
    return { data: res.rows };
  });

  r.patch("/admin/gamification/sponsored-challenges/:id/review", {
    onRequest: admin,
    schema: { tags: ["admin", "gamificación"], summary: "Aprueba o rechaza un reto patrocinado", security: bearer, params: uuid, body: reviewBody, response: { 200: ok } },
  }, async (req) => {
    const b = req.body;
    const res = await db.query(
      `UPDATE operator_sponsored_challenges
       SET status = $2, rejection_reason = coalesce($3, rejection_reason), updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, b.decision, b.rejection_reason ?? null]
    );
    if (res.rowCount === 0) throw AppError.notFound("Reto patrocinado");
    await audit(db, { actor: req.user!.id, action: "gamification.challenge_reviewed", entity: "sponsored_challenge", id: req.params.id, meta: { decision: b.decision }, ip: req.ip });
    return { data: res.rows[0] };
  });

  r.get("/admin/gamification/sponsored-rewards", {
    onRequest: admin,
    schema: {
      tags: ["admin", "gamificación"],
      summary: "Lista premios ofrecidos por negocios para el Club de Recompensas",
      security: bearer,
      querystring: z.object({ status: z.enum(["pending_review", "active", "rejected", "out_of_stock"]).optional() }),
      response: { 200: ok },
    },
  }, async (req) => {
    const res = await db.query(
      `SELECT r.*, ${operatorName} as operator_name, u.email as operator_email
       FROM operator_sponsored_rewards r
       JOIN users u ON u.id = r.operator_id
       LEFT JOIN profiles p ON p.id = r.operator_id
       WHERE ($1::text IS NULL OR r.status = $1)
       ORDER BY r.created_at DESC`,
      [req.query.status ?? null]
    );
    return { data: res.rows };
  });

  r.patch("/admin/gamification/sponsored-rewards/:id/review", {
    onRequest: admin,
    schema: { tags: ["admin", "gamificación"], summary: "Aprueba o rechaza un premio del Club ofrecido por un negocio", security: bearer, params: uuid, body: reviewBody, response: { 200: ok } },
  }, async (req) => {
    const b = req.body;
    const res = await db.query(
      `UPDATE operator_sponsored_rewards
       SET status = $2, rejection_reason = coalesce($3, rejection_reason), updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, b.decision, b.rejection_reason ?? null]
    );
    if (res.rowCount === 0) throw AppError.notFound("Premio patrocinado");
    await audit(db, { actor: req.user!.id, action: "gamification.reward_reviewed", entity: "sponsored_reward", id: req.params.id, meta: { decision: b.decision }, ip: req.ip });
    return { data: res.rows[0] };
  });
}
