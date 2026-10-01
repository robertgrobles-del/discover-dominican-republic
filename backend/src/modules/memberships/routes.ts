import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { type MembershipsAndTicketingService } from "./service.js";

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
}
