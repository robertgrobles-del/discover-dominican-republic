import type { FastifyInstance } from "fastify";
import { AppError } from "../../lib/errors.js";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { type MembershipsAndTicketingService } from "./service.js";
import { audit } from "../../lib/audit.js";

declare module "fastify" {
  interface FastifyInstance {
    membershipsService: MembershipsAndTicketingService;
  }
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];

/** Membresías Pasaporte RD (#18, #19) y ticketing de eventos en vivo (#20) */
export async function membershipsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const auth = app.authenticate;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  // Listar planes disponibles (Público)
  r.get("/memberships/plans", {
    schema: {
      tags: ["memberships"],
      summary: "Planes de membresía Pasaporte RD activos (#19)",
      response: { 200: ok },
    },
  }, async (_req, reply) => {
    const plans = await app.membershipsService.listActivePlans();
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: plans };
  });

  // Suscribirse a un plan VIP (#19) — exige sesión: la suscripción y su cobro quedan a nombre de quien llama.
  r.post("/memberships/subscribe", {
    onRequest: auth, ...rl(10, "1 hour"),
    schema: {
      tags: ["memberships"],
      summary: "Suscribe a la persona autenticada en un plan Pasaporte RD (#19)",
      security: bearer,
      body: z.object({
        plan_slug_or_id: z.string().trim().min(1).max(100),
        payment_reference: z.string().trim().min(4).max(120).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    // Sin integración de cobro: sólo el proveedor de pruebas puede activarlo, para no dar por pagado algo que nadie cobró.
    if (app.env.PAYMENT_PROVIDER !== "fake") throw new AppError("SERVICE_UNAVAILABLE", "La suscripción a Pasaporte RD no está disponible todavía: falta conectar el cobro");
    const membership = await app.membershipsService.subscribeUserToPlan(
      req.user!.id,
      req.body.plan_slug_or_id,
      req.body.payment_reference,
    );
    reply.code(201);
    return { data: membership };
  });

  // Ver membresía y balance de puntos (#18 y #19) — exige sesión: es información propia del viajero.
  r.get("/memberships/me", {
    onRequest: auth,
    schema: {
      tags: ["memberships"],
      summary: "Membresía activa y balance de puntos de quien llama (#18, #19)",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const data = await app.membershipsService.getUserMembership(req.user!.id);
    return { data };
  });

  // Comprar ticket para evento en vivo (#20) — exige sesión: el precio lo decide el servidor, nunca el cliente.
  r.post("/events/:id/tickets/purchase", {
    onRequest: auth, ...rl(20, "1 hour"),
    schema: {
      tags: ["memberships", "live"],
      summary: "Compra de entrada para un evento en vivo con QR único (#20)",
      security: bearer,
      params: z.object({ id: z.string().min(1).max(64) }),
      body: z.object({ tier_name: z.string().trim().min(1).max(60).optional() }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const ticket = await app.membershipsService.purchaseTicket({
      eventId: req.params.id,
      userId: req.user!.id,
      tierName: req.body.tier_name,
    });
    reply.code(201);
    return { data: ticket };
  });

  // Validar y hacer check-in de ticket en puerta (#20) — exige sesión (personal escaneando en la puerta).
  r.post("/events/tickets/verify", {
    onRequest: auth, ...rl(120, "1 minute"),
    schema: {
      tags: ["memberships", "live"],
      summary: "Valida el QR de una entrada y registra el check-in en puerta (#20)",
      security: bearer,
      body: z.object({ qr_code_hash: z.string().trim().min(6).max(120) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const ticket = await app.membershipsService.verifyAndCheckInTicket(req.body.qr_code_hash);
    return { data: ticket };
  });

  // ================= Administración de Planes de Membresía (B8) =================
  const admin = app.requireRole("admin");
  const planBody = z.object({
    id: z.string().trim().max(64).optional(),
    slug: z.string().trim().min(2).max(64),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).nullable().optional(),
    price_annual: z.number().min(0).max(1_000_000),
    currency: z.string().trim().max(10).default("USD"),
    points_multiplier: z.number().min(1).max(20).default(1.0),
    benefits: z.array(z.string().max(300)).default([]),
    is_active: z.boolean().default(true),
  });

  r.get("/admin/memberships/plans", {
    onRequest: admin,
    schema: {
      tags: ["admin", "memberships"],
      summary: "Listado completo de planes de membresía para administración (B8)",
      security: bearer,
      response: { 200: ok },
    },
  }, async () => {
    const { rows } = await app.db.query(
      "SELECT id, slug, name, description, price_annual, currency, points_multiplier, benefits, is_active, created_at, updated_at FROM membership_plans ORDER BY price_annual ASC"
    );
    return { data: rows.map(r => ({ ...r, price_annual: Number(r.price_annual), points_multiplier: Number(r.points_multiplier) })) };
  });

  r.post("/admin/memberships/plans", {
    onRequest: admin,
    schema: {
      tags: ["admin", "memberships"],
      summary: "Crea un plan de membresía Pasaporte RD (B8)",
      security: bearer,
      body: planBody,
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    const planId = b.id || b.slug;
    const { rows } = await app.db.query(
      `INSERT INTO membership_plans (id, slug, name, description, price_annual, currency, points_multiplier, benefits, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, NOW(), NOW())
       RETURNING id, slug, name, description, price_annual, currency, points_multiplier, benefits, is_active`,
      [planId, b.slug, b.name, b.description ?? null, b.price_annual, b.currency, b.points_multiplier, JSON.stringify(b.benefits), b.is_active]
    );
    await audit(app.db, {
      actor: req.user!.id,
      action: "admin.membership_plan.create",
      entity: "membership_plan",
      id: String(rows[0].id),
      meta: { slug: b.slug, name: b.name, price_annual: b.price_annual },
      ip: req.ip,
    });
    reply.code(201);
    return { data: { ...rows[0], price_annual: Number(rows[0].price_annual), points_multiplier: Number(rows[0].points_multiplier) } };
  });

  r.patch("/admin/memberships/plans/:id", {
    onRequest: admin,
    schema: {
      tags: ["admin", "memberships"],
      summary: "Edita un plan de membresía Pasaporte RD (B8)",
      security: bearer,
      params: z.object({ id: z.string().max(64) }),
      // Sin valores por defecto: en una edición parcial, un campo omitido no debe pisar lo guardado.
      body: z.object({
        slug: z.string().trim().min(2).max(64),
        name: z.string().trim().min(2).max(120),
        description: z.string().trim().max(2000).nullable(),
        price_annual: z.number().min(0).max(1_000_000),
        currency: z.string().trim().max(10),
        points_multiplier: z.number().min(1).max(20),
        benefits: z.array(z.string().max(300)),
        is_active: z.boolean(),
      }).partial().strict(),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (b.slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(b.slug); }
    if (b.name !== undefined) { fields.push(`name = $${idx++}`); values.push(b.name); }
    if (b.description !== undefined) { fields.push(`description = $${idx++}`); values.push(b.description); }
    if (b.price_annual !== undefined) { fields.push(`price_annual = $${idx++}`); values.push(b.price_annual); }
    if (b.currency !== undefined) { fields.push(`currency = $${idx++}`); values.push(b.currency); }
    if (b.points_multiplier !== undefined) { fields.push(`points_multiplier = $${idx++}`); values.push(b.points_multiplier); }
    if (b.benefits !== undefined) { fields.push(`benefits = $${idx++}::jsonb`); values.push(JSON.stringify(b.benefits)); }
    if (b.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(b.is_active); }

    if (!fields.length) return { data: null };

    fields.push("updated_at = NOW()");
    values.push(req.params.id);

    const { rows } = await app.db.query(
      `UPDATE membership_plans SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, slug, name, description, price_annual, currency, points_multiplier, benefits, is_active`,
      values
    );
    if (!rows[0]) throw new Error("Plan no encontrado");
    await audit(app.db, {
      actor: req.user!.id,
      action: "admin.membership_plan.update",
      entity: "membership_plan",
      id: req.params.id,
      meta: { fields: Object.keys(b) },
      ip: req.ip,
    });
    return { data: { ...rows[0], price_annual: Number(rows[0].price_annual), points_multiplier: Number(rows[0].points_multiplier) } };
  });
}
