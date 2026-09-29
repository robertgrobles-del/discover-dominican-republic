import { type FastifyPluginAsync } from "fastify";
import { type MembershipsAndTicketingService } from "./service.js";

declare module "fastify" {
  interface FastifyInstance {
    membershipsService: MembershipsAndTicketingService;
  }
}

export const membershipsRoutes: FastifyPluginAsync = async (app) => {
  const auth = app.authenticate;

  // Listar planes disponibles (Público)
  app.get("/memberships/plans", async (_request, reply) => {
    const plans = await app.membershipsService.listActivePlans();
    return reply.send({
      success: true,
      data: plans,
    });
  });

  // Suscribirse a un plan VIP (#19 Pasaporte RD) — exige sesión: la suscripción y su cobro quedan a nombre de quien llama, nunca de un usuario adivinado.
  app.post<{
    Body: {
      plan_slug_or_id: string;
      payment_reference?: string;
    };
  }>("/memberships/subscribe", { onRequest: auth }, async (request, reply) => {
    const userId = request.user!.id;
    const { plan_slug_or_id, payment_reference } = request.body || {};

    if (!plan_slug_or_id) {
      return reply.status(400).send({
        success: false,
        error: { code: "BAD_REQUEST", message: "plan_slug_or_id es requerido." },
      });
    }

    const membership = await app.membershipsService.subscribeUserToPlan(
      userId,
      plan_slug_or_id,
      payment_reference
    );

    return reply.status(201).send({
      success: true,
      data: membership,
      message: "¡Suscripción al Pasaporte RD activada exitosamente con beneficios VIP!",
    });
  });

  // Ver membresía y balance de puntos (#18 y #19) — exige sesión: es información propia del viajero.
  app.get("/memberships/me", { onRequest: auth }, async (request, reply) => {
    const userId = request.user!.id;
    const data = await app.membershipsService.getUserMembership(userId);

    return reply.send({
      success: true,
      data,
    });
  });

  // Comprar ticket para evento en vivo (#20) — exige sesión: el pago y el ticket quedan a nombre de quien llama.
  app.post<{
    Params: { id: string };
    Body: {
      tier_name?: string;
      price?: number;
      currency?: string;
    };
  }>("/events/:id/tickets/purchase", { onRequest: auth }, async (request, reply) => {
    const userId = request.user!.id;
    const eventId = request.params.id;
    const { tier_name, price, currency } = request.body || {};

    const ticket = await app.membershipsService.purchaseTicket({
      eventId,
      userId,
      tierName: tier_name,
      price,
      currency,
    });

    return reply.status(201).send({
      success: true,
      data: ticket,
      message: "Ticket de evento emitido con código QR único.",
    });
  });

  // Validar y hacer check-in de ticket en puerta (#20) — exige sesión (personal escaneando en la puerta), igual que POST /tickets/verify.
  app.post<{
    Body: {
      qr_code_hash: string;
    };
  }>("/events/tickets/verify", { onRequest: auth }, async (request, reply) => {
    const { qr_code_hash } = request.body || {};

    if (!qr_code_hash) {
      return reply.status(400).send({
        success: false,
        error: { code: "BAD_REQUEST", message: "qr_code_hash es requerido." },
      });
    }

    const ticket = await app.membershipsService.verifyAndCheckInTicket(qr_code_hash);

    return reply.send({
      success: true,
      data: ticket,
      message: "Check-in exitoso para el evento.",
    });
  });
};
