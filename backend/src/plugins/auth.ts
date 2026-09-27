import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../lib/errors.js";
import { OAuthService } from "../modules/auth/oauth.js";
import { AuthService, STAFF_ROLES } from "../modules/auth/service.js";
import { createTokenService, type TokenService } from "../modules/auth/tokens.js";
import { Mailer } from "../modules/mailer/mailer.js";

export interface AuthUser { id: string; roles: string[]; locale: string; sid: string; mfa: boolean; /** Admin que está mirando esta cuenta en una sesión de soporte (sólo lectura). */ imp?: string }

/** Lo que una sesión de soporte nunca puede ver, aunque sea de lectura. */
const SUPPORT_DENIED = ["/api/v1/admin", "/api/v1/me/export", "/api/v1/auth/2fa", "/api/v1/auth/sessions"];

declare module "fastify" {
  interface FastifyRequest { user?: AuthUser }
  interface FastifyInstance {
    tokens: TokenService;
    mailer: Mailer;
    auth: AuthService;
    oauth: OAuthService;
    /** onRequest: exige `Authorization: Bearer <jwt>` válido y deja `req.user`. */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** onRequest: como `authenticate`, pero además exige alguno de los roles indicados (docs §7.3). */
    requireRole: (...roles: string[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuth(app: FastifyInstance) {
  const tokens = await createTokenService(app.env, app.log);
  const mailer = new Mailer(app.env, app.db, app.log);
  app.decorate("tokens", tokens);
  app.decorate("mailer", mailer);
  const auth = new AuthService(app.env, app.db, tokens, mailer, app.log);
  app.decorate("auth", auth);
  app.decorate("oauth", new OAuthService(app.env, app.db, auth, app.log));
  if (app.env.MAIL_WORKER_ENABLED) mailer.start();
  app.addHook("onClose", async () => { await mailer.stop(); });

  const SESSION_CACHE_MS = app.env.NODE_ENV === "test" ? 0 : 5000; // la revocación se nota en, como mucho, 5 s
  const sessions = new Map<string, { ok: boolean; at: number }>();
  const sessionActive = async (sid: string, userId: string): Promise<boolean> => {
    const k = `${sid}:${userId}`, hit = sessions.get(k);
    if (hit && Date.now() - hit.at < SESSION_CACHE_MS) return hit.ok;
    const ok = !!(await app.db.query("SELECT 1 FROM refresh_tokens WHERE family_id = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > now() LIMIT 1", [sid, userId])).rowCount;
    if (SESSION_CACHE_MS) { if (sessions.size > 10_000) sessions.clear(); sessions.set(k, { ok, at: Date.now() }); }
    return ok;
  };

  const authenticate = async (req: FastifyRequest) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHENTICATED", "Falta el token de acceso");
    const c = await tokens.verifyAccess(header.slice(7).trim());
    // Un token firmado sigue siendo válido hasta que vence, pero si su sesión se cerró (cierre de sesión, suspensión, cambio de roles o
    // de contraseña, reset de 2FA) debe dejar de servir ya: se comprueba que la sesión siga viva, con una caché corta para no golpear la base en cada petición.
    if (!(await sessionActive(c.sid, c.sub))) throw new AppError("UNAUTHENTICATED", "La sesión ya no es válida");
    req.user = { id: c.sub, roles: c.roles, locale: c.locale, sid: c.sid, mfa: c.mfa, ...(c.imp ? { imp: c.imp } : {}) };
    if (c.imp) {
      // Sesión de soporte: sólo lectura y sin lo sensible. La única escritura permitida es cerrarla.
      const path = req.url.split("?")[0]!;
      if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !(req.method === "POST" && path === "/api/v1/auth/impersonation/end")) throw new AppError("FORBIDDEN", "Esta es una sesión de soporte de sólo lectura", { code: "IMPERSONATION_READONLY" });
      if (SUPPORT_DENIED.some((p) => path === p || path.startsWith(`${p}/`))) throw new AppError("FORBIDDEN", "Una sesión de soporte no puede ver esto", { code: "IMPERSONATION_RESTRICTED" });
    }
  };
  app.decorate("authenticate", authenticate);
  // Cada petición hecha en una sesión de soporte queda auditada (método, ruta y resultado; nunca el cuerpo).
  app.addHook("onResponse", async (req, reply) => {
    if (!req.user?.imp) return;
    await app.db.query("INSERT INTO audit_log (actor_id, action, entity_type, entity_id, meta, ip) VALUES ($1, 'support.impersonated_request', 'user', $2, $3, $4)", [req.user.imp, req.user.id, JSON.stringify({ method: req.method, path: req.url.split("?")[0], status: reply.statusCode, session: (await app.db.query<{ id: string }>("SELECT id FROM support_sessions WHERE sid = $1", [req.user.sid])).rows[0]?.id ?? null }), req.ip]).catch((err) => app.log.warn({ err }, "No se pudo auditar la petición de soporte"));
  });
  app.decorate("requireRole", (...roles: string[]) => async (req: FastifyRequest) => {
    await authenticate(req);
    if (!req.user!.roles.some((r) => roles.includes(r))) throw new AppError("FORBIDDEN", "No tienes permiso para esta acción");
    // Rutas de personal (admin/editor/moderator): con la política activa exigen haber completado el segundo factor en esta sesión.
    if (app.env.REQUIRE_2FA_FOR_STAFF && roles.some((r) => STAFF_ROLES.includes(r)) && !req.user!.mfa) {
      throw new AppError("MFA_REQUIRED", "Esta acción requiere verificación en dos pasos", { setup: "/api/v1/auth/2fa/setup", verify: "/api/v1/auth/2fa/verify" });
    }
  });
}
