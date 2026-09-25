import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../lib/errors.js";
import { AuthService, STAFF_ROLES } from "../modules/auth/service.js";
import { createTokenService, type TokenService } from "../modules/auth/tokens.js";
import { Mailer } from "../modules/mailer/mailer.js";

export interface AuthUser { id: string; roles: string[]; locale: string; sid: string; mfa: boolean }

declare module "fastify" {
  interface FastifyRequest { user?: AuthUser }
  interface FastifyInstance {
    tokens: TokenService;
    mailer: Mailer;
    auth: AuthService;
    /** preHandler: exige `Authorization: Bearer <jwt>` válido y deja `req.user`. */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** preHandler: como `authenticate`, pero además exige alguno de los roles indicados (docs §7.3). */
    requireRole: (...roles: string[]) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuth(app: FastifyInstance) {
  const tokens = await createTokenService(app.env, app.log);
  const mailer = new Mailer(app.env, app.db, app.log);
  app.decorate("tokens", tokens);
  app.decorate("mailer", mailer);
  app.decorate("auth", new AuthService(app.env, app.db, tokens, mailer, app.log));
  if (app.env.MAIL_WORKER_ENABLED) mailer.start();
  app.addHook("onClose", async () => { await mailer.stop(); });

  const authenticate = async (req: FastifyRequest) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHENTICATED", "Falta el token de acceso");
    const c = await tokens.verifyAccess(header.slice(7).trim());
    req.user = { id: c.sub, roles: c.roles, locale: c.locale, sid: c.sid, mfa: c.mfa };
  };
  app.decorate("authenticate", authenticate);
  app.decorate("requireRole", (...roles: string[]) => async (req: FastifyRequest) => {
    await authenticate(req);
    if (!req.user!.roles.some((r) => roles.includes(r))) throw new AppError("FORBIDDEN", "No tienes permiso para esta acción");
    // Rutas de personal (admin/editor/moderator): con la política activa exigen haber completado el segundo factor en esta sesión.
    if (app.env.REQUIRE_2FA_FOR_STAFF && roles.some((r) => STAFF_ROLES.includes(r)) && !req.user!.mfa) {
      throw new AppError("MFA_REQUIRED", "Esta acción requiere verificación en dos pasos", { setup: "/api/v1/auth/2fa/setup", verify: "/api/v1/auth/2fa/verify" });
    }
  });
}
