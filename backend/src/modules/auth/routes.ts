import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import type { Session } from "./service.js";

const COOKIE = "refresh_token";
const COOKIE_PATH = "/api/v1/auth";

// Se normaliza (espacios y mayúsculas) antes de validar el formato.
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const password = z.string().min(1).max(200);
const locale = z.enum(["es", "en", "fr", "de", "pt", "it"]);

const user = z.object({
  id: z.string(), email: z.string(), email_verified: z.boolean(), display_name: z.string().nullable(), avatar_url: z.string().nullable(),
  locale: z.string(), roles: z.array(z.string()), created_at: z.string(),
});
const tokens = z.object({ access_token: z.string(), token_type: z.literal("Bearer"), expires_in: z.number(), refresh_token: z.string().optional() });
const sessionResponse = z.object({ data: z.object({ user, tokens }) });
const noContent = { 204: z.null() } as const;
const bearer = [{ bearerAuth: [] }];

export async function authRoutes(app: FastifyInstance) {
  await app.register(cookie);
  const r = app.withTypeProvider<ZodTypeProvider>();
  const limit = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const ctx = (req: FastifyRequest) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });

  /** Modo web: el refresh token viaja en cookie HttpOnly. Modo móvil/API: en el cuerpo JSON. */
  const cookieMode = (req: FastifyRequest) => req.headers["x-refresh-transport"] === "cookie";
  const tokensOut = (req: FastifyRequest, reply: FastifyReply, s: Session) => {
    const { refresh_token, ...rest } = s;
    if (cookieMode(req)) {
      reply.setCookie(COOKIE, refresh_token, {
        httpOnly: true, secure: app.env.NODE_ENV === "production", sameSite: "lax", path: COOKIE_PATH, maxAge: app.env.REFRESH_TTL_DAYS * 86_400,
      });
      return rest;
    }
    return s;
  };
  const readRefresh = (req: FastifyRequest, bodyToken?: string) => {
    if (bodyToken) return bodyToken;
    const fromCookie = req.cookies[COOKIE];
    // Con cookie se exige la cabecera personalizada: fuerza preflight CORS y bloquea peticiones cruzadas simples (CSRF).
    if (fromCookie && !cookieMode(req)) throw AppError.validation("Falta la cabecera X-Refresh-Transport: cookie");
    if (!fromCookie) throw new AppError("UNAUTHENTICATED", "Falta el token de refresco");
    return fromCookie;
  };

  r.post("/auth/register", {
    schema: {
      tags: ["auth"], summary: "Crear cuenta", description: "Crea usuario, perfil y rol `user`, envía el correo de verificación e inicia sesión. La verificación se exige para reservar/pagar, no para navegar.",
      body: z.object({
        email, password, display_name: z.string().trim().min(1).max(80).optional(), locale: locale.optional(), marketing_opt_in: z.boolean().optional(),
        accept_terms: z.literal(true, { error: "Debes aceptar los términos y la política de privacidad" }),
      }),
      response: { 201: sessionResponse },
    },
    config: limit(10, "1 hour"),
  }, async (req, reply) => {
    const { accept_terms: _t, ...input } = req.body;
    const { user: u, session } = await app.auth.register(input, ctx(req));
    return reply.code(201).send({ data: { user: u, tokens: tokensOut(req, reply, session) } });
  });

  r.post("/auth/login", {
    schema: { tags: ["auth"], summary: "Iniciar sesión", body: z.object({ email, password }), response: { 200: sessionResponse } },
    config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    const { user: u, session } = await app.auth.login(req.body, ctx(req));
    return { data: { user: u, tokens: tokensOut(req, reply, session) } };
  });

  r.post("/auth/refresh", {
    schema: {
      tags: ["auth"], summary: "Rotar el token de refresco",
      description: "El token de refresco es de un solo uso. Presentar uno ya usado revoca toda la sesión (detección de robo).",
      body: z.object({ refresh_token: z.string().min(20).max(200).optional() }).nullish(),
      response: { 200: z.object({ data: z.object({ tokens }) }) },
    },
    config: limit(60, "1 minute"),
  }, async (req, reply) => {
    const session = await app.auth.refresh(readRefresh(req, req.body?.refresh_token), ctx(req));
    return { data: { tokens: tokensOut(req, reply, session) } };
  });

  r.post("/auth/logout", {
    schema: {
      tags: ["auth"], summary: "Cerrar sesión", description: "Con `?all=true` cierra todas las sesiones del usuario (requiere token de acceso).",
      querystring: z.object({ all: z.enum(["true", "false"]).optional() }), body: z.object({ refresh_token: z.string().max(200).optional() }).nullish(), response: noContent,
    },
  }, async (req, reply) => {
    if (req.query.all === "true") {
      await app.authenticate(req, reply);
      await app.auth.logout({ userId: req.user!.id, all: true });
    } else {
      const raw = req.body?.refresh_token ?? req.cookies[COOKIE];
      if (raw) await app.auth.logoutByRefresh(raw);
    }
    reply.clearCookie(COOKIE, { path: COOKIE_PATH });
    return reply.code(204).send(null);
  });

  r.get("/auth/me", {
    schema: {
      tags: ["auth"], summary: "Usuario de la sesión actual", security: bearer,
      response: { 200: z.object({ data: user.extend({ counts: z.object({ favorites: z.number(), unread_notifications: z.number() }) }) }) },
    },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.auth.me(req.user!.id) };
  });

  r.post("/auth/verify-email", {
    schema: { tags: ["auth"], summary: "Confirmar correo con el token del enlace", body: z.object({ token: z.string().min(20).max(200) }), response: { 200: z.object({ data: z.object({ verified: z.literal(true) }) }) } },
    config: limit(20, "1 hour"),
  }, async (req) => ({ data: await app.auth.verifyEmail(req.body.token) }));

  r.post("/auth/resend-verification", {
    schema: { tags: ["auth"], summary: "Reenviar correo de verificación (máx. 3 por hora)", security: bearer, response: { 202: z.object({ data: z.object({ sent: z.literal(true) }) }) } },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    await app.auth.resendVerification(req.user!.id);
    return reply.code(202).send({ data: { sent: true } });
  });

  r.post("/auth/forgot-password", {
    schema: {
      tags: ["auth"], summary: "Solicitar restablecimiento de contraseña", description: "Responde siempre 202, exista o no la cuenta.",
      body: z.object({ email }), response: { 202: z.object({ data: z.object({ accepted: z.literal(true) }) }) },
    },
    config: limit(5, "1 hour"),
  }, async (req, reply) => {
    await app.auth.forgotPassword(req.body.email);
    return reply.code(202).send({ data: { accepted: true } });
  });

  r.post("/auth/reset-password", {
    schema: { tags: ["auth"], summary: "Definir nueva contraseña con el token del correo", body: z.object({ token: z.string().min(20).max(200), password }), response: noContent },
    config: limit(10, "1 hour"),
  }, async (req, reply) => {
    await app.auth.resetPassword(req.body);
    return reply.code(204).send(null);
  });

  r.post("/auth/update-password", {
    schema: {
      tags: ["auth"], summary: "Cambiar la contraseña (cierra las demás sesiones)", security: bearer,
      body: z.object({ current_password: password, new_password: password }), response: { 200: z.object({ data: z.object({ tokens }) }) },
    },
    preHandler: app.authenticate, config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    const session = await app.auth.updatePassword(req.user!.id, req.body, ctx(req));
    return { data: { tokens: tokensOut(req, reply, session) } };
  });

  r.get("/auth/sessions", {
    schema: {
      tags: ["auth"], summary: "Dispositivos con sesión abierta", security: bearer,
      response: { 200: z.object({ data: z.array(z.object({ id: z.string(), current: z.boolean(), user_agent: z.string().nullable(), ip: z.string().nullable(), started_at: z.string(), last_seen_at: z.string() })) }) },
    },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.auth.sessions(req.user!.id, req.user!.sid) };
  });

  r.delete("/auth/sessions/:id", {
    schema: { tags: ["auth"], summary: "Cerrar la sesión de un dispositivo", security: bearer, params: z.object({ id: z.string().uuid() }), response: noContent },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    await app.auth.revokeSession(req.user!.id, req.params.id);
    return reply.code(204).send(null);
  });
}
