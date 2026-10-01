import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { LOCALES } from "../../lib/i18n.js";
import { audit } from "../../lib/audit.js";
import { CHANNELS, NOTIFICATION_TYPES } from "./insert.js";
import type { NotificationService } from "./service.js";

declare module "fastify" { interface FastifyInstance { notifications: NotificationService } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const HEARTBEAT_MS = 25_000;

/** Preferencias, dispositivos push, tiempo real y difusiones (docs §5.13). La bandeja (`/me/notifications`) está en el módulo de perfil. */
export async function notificationRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const svc = app.notifications;
  const auth = app.authenticate, admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const tag = ["notificaciones"];

  // ---------- Preferencias (matriz tipo × canal) ----------
  r.get("/me/notification-preferences", { onRequest: auth, schema: { tags: tag, summary: "Matriz de notificaciones por canal (email, push, in_app) y tipo", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.preferences(req.user!.id) }));
  r.put("/me/notification-preferences", { onRequest: auth, schema: { tags: tag, summary: "Actualiza sólo lo enviado (las promociones requieren activarse)", security: bearer, body: z.partialRecord(z.enum(CHANNELS), z.partialRecord(z.enum(NOTIFICATION_TYPES), z.boolean())), response: { 200: ok } } }, async (req) => ({ data: await svc.setPreferences(req.user!.id, req.body) }));

  // ---------- Web Push ----------
  r.get("/me/push-subscriptions", { onRequest: auth, schema: { tags: tag, summary: "Mis dispositivos con push y la clave pública VAPID para registrarlos", security: bearer, response: { 200: ok } } }, async (req) => ({ data: { enabled: svc.pushSender.enabled, public_key: app.env.VAPID_PUBLIC_KEY ?? null, devices: await svc.listPush(req.user!.id) } }));
  r.post("/me/push-subscriptions", {
    onRequest: auth, config: rl(30, "1 hour"),
    schema: { tags: tag, summary: "Registra un dispositivo (objeto `PushSubscription` del navegador)", security: bearer, body: z.object({ endpoint: z.string().url().max(1000), keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }), user_agent: z.string().max(200).optional() }), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await svc.addPush(req.user!.id, req.body) }; });
  r.delete("/me/push-subscriptions/:id", { onRequest: auth, schema: { tags: tag, summary: "Quita un dispositivo", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => { await svc.removePush(req.user!.id, req.params.id); reply.code(204); return null; });

  // ---------- Tiempo real ----------
  r.post("/notifications/stream-ticket", { onRequest: auth, config: rl(60, "1 minute"), schema: { tags: tag, summary: "Ticket de un minuto para abrir el flujo SSE (un EventSource no puede enviar el encabezado Authorization)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: svc.createTicket(req.user!.id) }));

  /** El flujo acepta el ticket (navegador) o el encabezado Authorization (otros clientes). */
  const streamAuth = async (req: FastifyRequest) => {
    const ticket = (req.query as { ticket?: string }).ticket;
    if (ticket) {
      const id = svc.verifyTicket(ticket);
      if (!id) throw new AppError("UNAUTHENTICATED", "El ticket no es válido o venció");
      req.user = { id, roles: [], locale: "es", sid: "stream", mfa: false };
      return;
    }
    await app.authenticate(req, undefined as never);
  };
  r.get("/notifications/stream", {
    onRequest: streamAuth,
    schema: { tags: tag, summary: "Notificaciones en tiempo real (SSE): `event: ready`, luego `event: notification` con cada aviso nuevo; latido cada 25 s. Máximo 5 conexiones por persona", security: [{}, ...bearer], querystring: z.object({ ticket: z.string().max(300).optional() }) },
  }, async (req, reply) => {
    const userId = req.user!.id;
    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, { ...reply.getHeaders(), "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" } as never);
    const write = (s: string) => { if (!raw.destroyed && !raw.writableEnded) raw.write(s); };
    let done = false;
    let unsubscribe = () => undefined as void;
    const beat = setInterval(() => write(": latido\n\n"), HEARTBEAT_MS);
    const close = () => { if (done) return; done = true; clearInterval(beat); unsubscribe(); if (!raw.writableEnded) raw.end(); };
    unsubscribe = svc.subscribe(userId, (n) => write(`event: notification\nid: ${n.id}\ndata: ${JSON.stringify(n)}\n\n`), close);
    await svc.ensureListening();     // «ready» significa que ya se puede recibir: no se pierde nada de lo que ocurra después
    write(`retry: 5000\nevent: ready\ndata: ${JSON.stringify({ unread: (await app.db.query<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id = $1 AND NOT is_read", [userId])).rows[0]!.n })}\n\n`);
    req.raw.on("close", close);
    raw.on("close", close);
  });

  // ---------- Difusión (administración) ----------
  const segment = z.object({ roles: z.array(z.string().max(30)).max(10).optional(), locales: z.array(z.enum(LOCALES)).max(6).optional(), min_level: z.number().int().min(1).max(10).optional(), marketing_opt_in: z.boolean().optional() }).default({});
  r.post("/admin/notifications/broadcast", {
    onRequest: admin, config: rl(10, "1 hour"),
    schema: {
      tags: ["admin", ...tag], summary: "Difunde un aviso a un segmento (respeta las preferencias de cada persona). Con `dry_run` sólo cuenta a quién alcanzaría", security: bearer,
      body: z.object({ title: z.string().trim().min(3).max(150), message: z.string().trim().max(1000).optional(), link: z.string().trim().max(300).regex(/^(\/|https:\/\/)/, "El enlace debe ser una ruta o una URL https").optional(), type: z.enum(NOTIFICATION_TYPES).default("system"), segment, dry_run: z.boolean().default(false) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    if (b.dry_run) return { data: { dry_run: true, audience: await svc.audience(b.segment) } };
    const data = await svc.broadcast(req.user!.id, { title: b.title, message: b.message, link: b.link, type: b.type, segment: b.segment });
    await audit(app.db, { actor: req.user!.id, action: "notifications.broadcast", entity: "notification_broadcast", id: data.id, meta: { segment: b.segment, delivered: data.delivered }, ip: req.ip });
    return { data };
  });
  r.get("/admin/notifications/broadcasts", { onRequest: admin, schema: { tags: ["admin", ...tag], summary: "Difusiones enviadas", security: bearer, response: { 200: ok } } }, async () => ({ data: await svc.broadcasts() }));
}
