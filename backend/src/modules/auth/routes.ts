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
const challengeResponse = z.object({ data: z.object({ two_factor_required: z.literal(true), challenge_token: z.string() }) });
const otp = z.string().trim().regex(/^\d{3}\s?\d{3}$/, "El código son 6 dígitos");
const recovery = z.string().trim().min(8).max(32);
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
    schema: {
      tags: ["auth"], summary: "Iniciar sesión",
      description: "Si la cuenta tiene verificación en dos pasos devuelve `two_factor_required` y un `challenge_token` de 5 minutos que se canjea en `POST /auth/2fa/verify`.",
      body: z.object({ email, password }), response: { 200: z.union([sessionResponse, challengeResponse]) },
    },
    config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    const result = await app.auth.login(req.body, ctx(req));
    if ("twoFactor" in result) return { data: { two_factor_required: true as const, challenge_token: result.twoFactor.challenge_token } };
    return { data: { user: result.user, tokens: tokensOut(req, reply, result.session) } };
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
      response: { 200: z.object({ data: user.extend({
        counts: z.object({ favorites: z.number(), unread_notifications: z.number() }),
        two_factor: z.object({ enabled: z.boolean(), recovery_codes_left: z.number(), required: z.boolean() }),
      }) }) },
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

  // ---------- Verificación en dos pasos ----------
  r.post("/auth/2fa/setup", {
    schema: {
      tags: ["auth"], summary: "Paso 1 del 2FA: obtener el secreto para la app de autenticación", security: bearer,
      description: "Devuelve el secreto (base32) y la URI `otpauth://` para generar el QR. No queda activo hasta confirmarlo en `/auth/2fa/enable`.",
      response: { 200: z.object({ data: z.object({ secret: z.string(), otpauth_uri: z.string(), issuer: z.string(), account: z.string() }) }) },
    },
    preHandler: app.authenticate, config: limit(10, "1 hour"),
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.auth.twoFactorSetup(req.user!.id) };
  });

  r.post("/auth/2fa/enable", {
    schema: {
      tags: ["auth"], summary: "Paso 2 del 2FA: confirmar con un código y recibir los códigos de recuperación", security: bearer,
      description: "Los códigos de recuperación se muestran **una sola vez**. Devuelve un nuevo `access_token` con el segundo factor ya cumplido.",
      body: z.object({ code: otp }),
      response: { 200: z.object({ data: z.object({ recovery_codes: z.array(z.string()), access_token: z.string(), expires_in: z.number() }) }) },
    },
    preHandler: app.authenticate, config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.auth.twoFactorEnable(req.user!.id, req.user!.sid, req.body.code, ctx(req)) };
  });

  r.post("/auth/2fa/verify", {
    schema: {
      tags: ["auth"], summary: "Completar el inicio de sesión con el código de la app o un código de recuperación",
      body: z.object({ challenge_token: z.string().min(20).max(2000), code: otp.optional(), recovery_code: recovery.optional() })
        .refine((b) => !!b.code !== !!b.recovery_code, { message: "Envía `code` o `recovery_code` (uno solo)" }),
      response: { 200: z.object({ data: z.object({ user, tokens, used_recovery_code: z.boolean() }) }) },
    },
    config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    const { user: u, session, usedRecoveryCode } = await app.auth.verifyTwoFactorChallenge(req.body, ctx(req));
    return { data: { user: u, tokens: tokensOut(req, reply, session), used_recovery_code: usedRecoveryCode } };
  });

  r.post("/auth/2fa/disable", {
    schema: {
      tags: ["auth"], summary: "Desactivar el 2FA (contraseña + código); cierra las demás sesiones", security: bearer,
      body: z.object({ password, code: otp.optional(), recovery_code: recovery.optional() }).refine((b) => !!b.code !== !!b.recovery_code, { message: "Envía `code` o `recovery_code` (uno solo)" }),
      response: noContent,
    },
    preHandler: app.authenticate, config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    await app.auth.twoFactorDisable(req.user!.id, req.user!.sid, req.body, ctx(req));
    return reply.code(204).send(null);
  });

  r.post("/auth/2fa/recovery-codes", {
    schema: {
      tags: ["auth"], summary: "Generar códigos de recuperación nuevos (invalida los anteriores)", security: bearer,
      body: z.object({ code: otp }), response: { 200: z.object({ data: z.object({ recovery_codes: z.array(z.string()) }) }) },
    },
    preHandler: app.authenticate, config: limit(10, "15 minutes"),
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.auth.twoFactorRegenerateRecovery(req.user!.id, req.body.code, ctx(req)) };
  });

  // ---------- Inicio de sesión social (OIDC) ----------
  const STATE_COOKIE = "oauth_state";
  const OAUTH_COOKIE_PATH = "/api/v1/auth/oauth";
  const provider = z.object({ provider: z.string().regex(/^[a-z]{2,20}$/) });
  const setState = (reply: FastifyReply, state: string) =>
    reply.setCookie(STATE_COOKIE, state, { httpOnly: true, secure: app.env.NODE_ENV === "production", sameSite: "lax", path: OAUTH_COOKIE_PATH, maxAge: 600 });

  r.get("/auth/oauth/providers", {
    schema: { tags: ["auth"], summary: "Proveedores de inicio de sesión social disponibles", response: { 200: z.object({ data: z.array(z.object({ id: z.string(), name: z.string() })) }) } },
  }, async (_req, reply) => {
    reply.header("cache-control", "public, max-age=300");
    return { data: app.oauth.available() };
  });

  r.post("/auth/oauth/:provider/start", {
    schema: {
      tags: ["auth"], summary: "Iniciar el flujo social: devuelve la URL del proveedor",
      description: "`mode: login` (por defecto) inicia sesión o crea la cuenta; `mode: link` vincula el proveedor a la cuenta autenticada (requiere Bearer). El navegador debe navegar a `authorize_url`; al volver, el proveedor pasa por `/callback` y el usuario llega a `redirect_to?oauth_code=…`, que se canjea en `POST /auth/oauth/exchange`.",
      params: provider, body: z.object({ redirect_to: z.string().max(500).optional(), mode: z.enum(["login", "link"]).optional() }).nullish(),
      response: { 200: z.object({ data: z.object({ authorize_url: z.string() }) }) },
    },
    config: limit(20, "15 minutes"),
  }, async (req, reply) => {
    const mode = req.body?.mode ?? "login";
    if (mode === "link") await app.authenticate(req, reply);
    const { authorize_url, state } = await app.oauth.start({ provider: req.params.provider, mode, redirectTo: req.body?.redirect_to, userId: mode === "link" ? req.user!.id : undefined });
    setState(reply, state);
    reply.header("cache-control", "no-store");
    return { data: { authorize_url } };
  });

  r.get("/auth/oauth/:provider", {
    schema: { tags: ["auth"], summary: "Variante por redirección (302) para enlaces simples de \"Continuar con …\"", params: provider, querystring: z.object({ redirect_to: z.string().max(500).optional() }), response: { 302: z.null() } },
    config: limit(20, "15 minutes"),
  }, async (req, reply) => {
    const { authorize_url, state } = await app.oauth.start({ provider: req.params.provider, mode: "login", redirectTo: req.query.redirect_to });
    setState(reply, state);
    return reply.redirect(authorize_url);
  });

  r.get("/auth/oauth/:provider/callback", {
    schema: {
      tags: ["auth"], summary: "Retorno del proveedor (lo llama el navegador; redirige al frontend)", params: provider,
      querystring: z.object({ code: z.string().max(2000).optional(), state: z.string().max(200).optional(), error: z.string().max(100).optional() }).catchall(z.string()),
      response: { 302: z.null() },
    },
    config: limit(30, "15 minutes"),
  }, async (req, reply) => {
    const result = await app.oauth.callback({ provider: req.params.provider, code: req.query.code, state: req.query.state, cookieState: req.cookies[STATE_COOKIE], providerError: req.query.error });
    reply.clearCookie(STATE_COOKIE, { path: OAUTH_COOKIE_PATH });
    const url = new URL(result.redirectTo);
    for (const [k, v] of Object.entries(result.query)) url.searchParams.set(k, v);
    reply.header("cache-control", "no-store").header("referrer-policy", "no-referrer");
    return reply.redirect(url.toString());
  });

  r.post("/auth/oauth/exchange", {
    schema: {
      tags: ["auth"], summary: "Canjear el `oauth_code` (60 s, un solo uso) por la sesión",
      body: z.object({ code: z.string().min(20).max(200) }), response: { 200: z.union([sessionResponse, challengeResponse]) },
    },
    config: limit(20, "15 minutes"),
  }, async (req, reply) => {
    const result = await app.oauth.exchange(req.body.code, ctx(req));
    if ("twoFactor" in result) return { data: { two_factor_required: true as const, challenge_token: result.twoFactor.challenge_token } };
    return { data: { user: result.user, tokens: tokensOut(req, reply, result.session) } };
  });

  r.get("/auth/identities", {
    schema: {
      tags: ["auth"], summary: "Proveedores vinculados a mi cuenta", security: bearer,
      response: { 200: z.object({ data: z.object({ password_set: z.boolean(), identities: z.array(z.object({ provider: z.string(), email: z.string().nullable(), linked_at: z.string(), last_login_at: z.string().nullable() })) }) }) },
    },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    reply.header("cache-control", "private, no-store");
    return { data: await app.oauth.identities(req.user!.id) };
  });

  r.delete("/auth/identities/:provider", {
    schema: { tags: ["auth"], summary: "Desvincular un proveedor (debe quedar otro método de acceso)", security: bearer, params: provider, response: noContent },
    preHandler: app.authenticate,
  }, async (req, reply) => {
    await app.oauth.unlink(req.user!.id, req.params.provider);
    return reply.code(204).send(null);
  });
}
