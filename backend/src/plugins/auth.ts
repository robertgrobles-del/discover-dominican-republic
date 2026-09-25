import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../lib/errors.js";
import { AuthService } from "../modules/auth/service.js";
import { createTokenService, type TokenService } from "../modules/auth/tokens.js";
import { Mailer } from "../modules/mailer/mailer.js";

export interface AuthUser { id: string; roles: string[]; locale: string; sid: string }

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
  app.addHook("onClose", async () => { await mailer.drain(); });

  const authenticate = async (req: FastifyRequest) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError("UNAUTHENTICATED", "Falta el token de acceso");
    const c = await tokens.verifyAccess(header.slice(7).trim());
    req.user = { id: c.sub, roles: c.roles, locale: c.locale, sid: c.sid };
  };
  app.decorate("authenticate", authenticate);
  app.decorate("requireRole", (...roles: string[]) => async (req: FastifyRequest) => {
    await authenticate(req);
    if (!req.user!.roles.some((r) => roles.includes(r))) throw new AppError("FORBIDDEN", "No tienes permiso para esta acción");
  });
}
