import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { LOCALES, type Locale } from "../../lib/i18n.js";
import type { Mailer } from "../mailer/mailer.js";
import { hashPassword, passwordIssues, verifyAgainstDummy, verifyPassword } from "./password.js";
import { hashToken, newOpaqueToken, type TokenService } from "./tokens.js";

export interface RequestContext { ip?: string; userAgent?: string }
export interface Session { access_token: string; token_type: "Bearer"; expires_in: number; refresh_token: string }
export interface UserDto {
  id: string; email: string; email_verified: boolean; display_name: string | null; avatar_url: string | null;
  locale: string; roles: string[]; created_at: string;
}

const VERIFY_HOURS = 24;
const RESET_MINUTES = 60;
const RESEND_MAX_PER_HOUR = 3;
const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos";

interface UserRow {
  id: string; email: string; password_hash: string; locale: string; status: string; email_verified_at: Date | null;
  failed_login_count: number; locked_until: Date | null; created_at: Date; display_name: string | null; avatar_url: string | null; is_suspended: boolean | null;
}

const USER_SQL = `SELECT u.id, u.email, u.password_hash, u.locale, u.status, u.email_verified_at, u.failed_login_count, u.locked_until, u.created_at,
                         p.display_name, p.avatar_url, p.is_suspended
                    FROM users u LEFT JOIN profiles p ON p.id = u.id`;

/** Reglas de negocio de cuentas y sesiones (docs §5.1). Las rutas sólo validan entrada y llaman aquí. */
export class AuthService {
  constructor(
    private readonly env: Env, private readonly db: Db, private readonly tokens: TokenService,
    private readonly mailer: Mailer, private readonly log: FastifyBaseLogger,
  ) {}

  private link(path: string, token: string) { return `${this.env.WEB_BASE_URL}${path}?token=${encodeURIComponent(token)}`; }
  private locale(l: string): Locale { return (LOCALES as readonly string[]).includes(l) ? (l as Locale) : "es"; }
  private toDto(u: UserRow, roles: string[]): UserDto {
    return { id: u.id, email: u.email, email_verified: !!u.email_verified_at, display_name: u.display_name, avatar_url: u.avatar_url, locale: u.locale, roles, created_at: new Date(u.created_at).toISOString() };
  }
  private async rolesOf(userId: string, client: Db | PoolClient = this.db): Promise<string[]> {
    const { rows } = await client.query<{ role: string }>("SELECT role::text FROM user_roles WHERE user_id = $1 ORDER BY role", [userId]);
    return rows.map((r) => r.role);
  }
  private assertPassword(password: string, email: string) {
    const issues = passwordIssues(password, email);
    if (issues.length) throw AppError.validation("La contraseña no cumple la política de seguridad", issues.map((issue) => ({ field: "password", issue })));
  }

  // ---------- Sesiones ----------
  private async startSession(client: PoolClient, u: { id: string; locale: string }, ctx: RequestContext, familyId: string = randomUUID()): Promise<Session> {
    const roles = await this.rolesOf(u.id, client);
    const refresh = newOpaqueToken();
    const expires = new Date(Date.now() + this.env.REFRESH_TTL_DAYS * 86_400_000);
    await client.query(
      "INSERT INTO refresh_tokens (user_id, family_id, token_hash, user_agent, ip, expires_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [u.id, familyId, hashToken(refresh), ctx.userAgent?.slice(0, 250) ?? null, ctx.ip ?? null, expires],
    );
    const access_token = await this.tokens.signAccess({ sub: u.id, roles, locale: u.locale, sid: familyId, mfa: false });
    return { access_token, token_type: "Bearer", expires_in: this.tokens.accessTtl, refresh_token: refresh };
  }

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const out = await fn(c);
      await c.query("COMMIT");
      return out;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }

  // ---------- Registro ----------
  async register(input: { email: string; password: string; display_name?: string; locale?: string; marketing_opt_in?: boolean }, ctx: RequestContext) {
    const email = input.email.trim().toLowerCase();
    this.assertPassword(input.password, email);
    const password_hash = await hashPassword(input.password);
    const locale = this.locale(input.locale ?? "es");
    const name = (input.display_name?.trim() || email.split("@")[0]!).slice(0, 80);
    const verifyToken = newOpaqueToken();

    const { user, session } = await this.tx(async (c) => {
      const id = randomUUID();
      try {
        await c.query(
          "INSERT INTO users (id, email, password_hash, locale, terms_accepted_at, marketing_opt_in) VALUES ($1, $2, $3, $4, now(), $5)",
          [id, email, password_hash, locale, input.marketing_opt_in ?? false],
        );
      } catch (e) {
        if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe una cuenta con ese correo", { reason: "EMAIL_TAKEN" });
        throw e;
      }
      await c.query("INSERT INTO profiles (id, display_name, role) VALUES ($1, $2, 'user')", [id, name]);
      await c.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'user')", [id]);
      await c.query("INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at) VALUES ($1, 'verify_email', $2, now() + make_interval(hours => $3))", [id, hashToken(verifyToken), VERIFY_HOURS]);
      // Outbox transaccional: el correo de verificación se encola en la misma transacción que la cuenta.
      await this.mailer.send({ to: email, template: "auth.verify_email", locale, userId: id, data: { name, url: this.link("/verificar-correo", verifyToken), hours: VERIFY_HOURS } }, c);
      const session = await this.startSession(c, { id, locale }, ctx);
      const { rows } = await c.query<UserRow>(`${USER_SQL} WHERE u.id = $1`, [id]);
      return { user: rows[0]!, session };
    });

    return { user: this.toDto(user, ["user"]), session };
  }

  // ---------- Inicio de sesión ----------
  async login(input: { email: string; password: string }, ctx: RequestContext) {
    const email = input.email.trim().toLowerCase();
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE lower(u.email) = $1`, [email]);
    const u = rows[0];
    if (!u || u.status === "deleted") {
      await verifyAgainstDummy(input.password);
      throw new AppError("UNAUTHENTICATED", GENERIC_LOGIN_ERROR);
    }
    if (u.locked_until && u.locked_until > new Date()) {
      await verifyAgainstDummy(input.password);
      const retry = Math.ceil((u.locked_until.getTime() - Date.now()) / 1000);
      throw new AppError("RATE_LIMITED", "Demasiados intentos fallidos. Intenta de nuevo más tarde.", { retry_after_seconds: retry });
    }
    if (!(await verifyPassword(u.password_hash, input.password))) {
      const failed = u.failed_login_count + 1;
      const lock = failed >= this.env.LOGIN_MAX_FAILURES;
      await this.db.query(
        "UPDATE users SET failed_login_count = $2, locked_until = CASE WHEN $3 THEN now() + make_interval(mins => $4) ELSE locked_until END WHERE id = $1",
        [u.id, lock ? 0 : failed, lock, this.env.LOGIN_LOCK_MINUTES],
      );
      if (lock) this.log.warn({ userId: u.id, ip: ctx.ip }, "Cuenta bloqueada temporalmente por intentos fallidos");
      throw new AppError("UNAUTHENTICATED", GENERIC_LOGIN_ERROR);
    }
    if (u.status === "suspended" || u.is_suspended) throw new AppError("ACCOUNT_SUSPENDED", "Tu cuenta está suspendida. Contacta a soporte.");

    const session = await this.tx(async (c) => {
      await c.query("UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = now() WHERE id = $1", [u.id]);
      return this.startSession(c, u, ctx);
    });
    return { user: this.toDto(u, await this.rolesOf(u.id)), session };
  }

  // ---------- Refresco con rotación y detección de reutilización ----------
  async refresh(rawToken: string, ctx: RequestContext): Promise<Session> {
    const { rows } = await this.db.query<{ id: string; user_id: string; family_id: string; expires_at: Date; revoked_at: Date | null }>(
      "SELECT id, user_id, family_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1", [hashToken(rawToken)],
    );
    const t = rows[0];
    if (!t) throw new AppError("UNAUTHENTICATED", "Sesión inválida");
    if (t.revoked_at) {
      // Un token ya rotado se presentó de nuevo: posible robo. Se invalida toda la familia (la sesión completa).
      await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL", [t.family_id]);
      this.log.warn({ userId: t.user_id, family: t.family_id, ip: ctx.ip }, "Reutilización de refresh token: sesión revocada");
      throw new AppError("UNAUTHENTICATED", "Sesión inválida");
    }
    if (t.expires_at < new Date()) throw new AppError("TOKEN_EXPIRED", "La sesión expiró");

    const { rows: u } = await this.db.query<{ id: string; locale: string; status: string; is_suspended: boolean | null }>(
      "SELECT u.id, u.locale, u.status, p.is_suspended FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [t.user_id],
    );
    const user = u[0];
    if (!user || user.status !== "active" || user.is_suspended) {
      await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL", [t.family_id]);
      throw new AppError(user?.status === "suspended" || user?.is_suspended ? "ACCOUNT_SUSPENDED" : "UNAUTHENTICATED", "Sesión inválida");
    }
    return this.tx(async (c) => {
      // Sólo el primero de dos refrescos simultáneos con el mismo token gana la rotación (el otro ve revoked_at y falla).
      const claimed = await c.query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [t.id]);
      if (!claimed.rowCount) throw new AppError("UNAUTHENTICATED", "Sesión inválida");
      const session = await this.startSession(c, user, ctx, t.family_id);
      await c.query("UPDATE refresh_tokens SET replaced_by = (SELECT id FROM refresh_tokens WHERE token_hash = $2) WHERE id = $1", [t.id, hashToken(session.refresh_token)]);
      return session;
    });
  }

  async logout(input: { userId: string; familyId?: string; all?: boolean }) {
    if (input.all) await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [input.userId]);
    else if (input.familyId) await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND family_id = $2 AND revoked_at IS NULL", [input.userId, input.familyId]);
  }
  async logoutByRefresh(rawToken: string) {
    await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = (SELECT family_id FROM refresh_tokens WHERE token_hash = $1) AND revoked_at IS NULL", [hashToken(rawToken)]);
  }

  // ---------- Perfil de la sesión ----------
  async me(userId: string) {
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE u.id = $1`, [userId]);
    const u = rows[0];
    if (!u || u.status === "deleted") throw new AppError("UNAUTHENTICATED", "Sesión inválida");
    const [roles, counts] = await Promise.all([
      this.rolesOf(userId),
      this.db.query<{ favorites: number; unread_notifications: number }>(
        `SELECT (SELECT count(*)::int FROM favorites WHERE user_id = $1) AS favorites,
                (SELECT count(*)::int FROM notifications WHERE user_id = $1 AND NOT is_read) AS unread_notifications`, [userId]),
    ]);
    return { ...this.toDto(u, roles), counts: counts.rows[0]! };
  }

  // ---------- Verificación de correo ----------
  private async issueToken(purpose: "verify_email" | "reset_password", userId: string, ttl: { hours?: number; minutes?: number }) {
    const token = newOpaqueToken();
    await this.db.query("UPDATE auth_tokens SET used_at = now() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL", [userId, purpose]);
    await this.db.query(
      "INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at) VALUES ($1, $2, $3, now() + make_interval(hours => $4, mins => $5))",
      [userId, purpose, hashToken(token), ttl.hours ?? 0, ttl.minutes ?? 0],
    );
    return token;
  }

  private async consumeToken(purpose: "verify_email" | "reset_password", raw: string, c: PoolClient | Db = this.db): Promise<string> {
    const { rows } = await c.query<{ user_id: string }>(
      "UPDATE auth_tokens SET used_at = now() WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now() RETURNING user_id", [hashToken(raw), purpose],
    );
    if (!rows[0]) throw new AppError("INVALID_TOKEN", "El enlace es inválido o ya venció");
    return rows[0].user_id;
  }

  async verifyEmail(token: string) {
    const userId = await this.consumeToken("verify_email", token);
    const { rows } = await this.db.query<{ email: string; locale: string; display_name: string | null; was_verified: boolean }>(
      `UPDATE users u SET email_verified_at = COALESCE(u.email_verified_at, now()) FROM profiles p
        WHERE u.id = $1 AND p.id = u.id RETURNING u.email, u.locale, p.display_name,
              (SELECT email_verified_at IS NOT NULL FROM users WHERE id = $1) AS was_verified`, [userId],
    );
    const u = rows[0];
    if (u && !u.was_verified) {
      await this.mailer.send({ to: u.email, template: "auth.welcome", locale: this.locale(u.locale), userId, data: { name: u.display_name ?? u.email, url: this.env.WEB_BASE_URL } });
    }
    return { verified: true as const };
  }

  async resendVerification(userId: string) {
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE u.id = $1`, [userId]);
    const u = rows[0];
    if (!u) throw new AppError("UNAUTHENTICATED", "Sesión inválida");
    if (u.email_verified_at) throw new AppError("CONFLICT", "Tu correo ya está verificado", { reason: "ALREADY_VERIFIED" });
    const sent = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM auth_tokens WHERE user_id = $1 AND purpose = 'verify_email' AND created_at > now() - interval '1 hour'", [userId])).rows[0]!.n;
    if (sent >= RESEND_MAX_PER_HOUR) throw new AppError("RATE_LIMITED", "Ya solicitaste varios correos. Intenta de nuevo en una hora.");
    const token = await this.issueToken("verify_email", userId, { hours: VERIFY_HOURS });
    await this.mailer.send({ to: u.email, template: "auth.verify_email", locale: this.locale(u.locale), userId, data: { name: u.display_name ?? u.email, url: this.link("/verificar-correo", token), hours: VERIFY_HOURS } });
  }

  // ---------- Contraseñas ----------
  async forgotPassword(emailRaw: string) {
    const email = emailRaw.trim().toLowerCase();
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE lower(u.email) = $1 AND u.status <> 'deleted'`, [email]);
    const u = rows[0];
    if (!u) return; // la respuesta es idéntica exista o no la cuenta (no se revela qué correos están registrados)
    // Antibombardeo: máximo 3 correos de restablecimiento por hora a una misma cuenta (sea quien sea el que lo pida).
    const recent = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM auth_tokens WHERE user_id = $1 AND purpose = 'reset_password' AND created_at > now() - interval '1 hour'", [u.id])).rows[0]!.n;
    if (recent >= 3) { this.log.warn({ userId: u.id }, "Límite de correos de restablecimiento alcanzado"); return; }
    const token = await this.issueToken("reset_password", u.id, { minutes: RESET_MINUTES });
    await this.mailer.send({ to: u.email, template: "auth.reset_password", locale: this.locale(u.locale), userId: u.id, data: { name: u.display_name ?? u.email, url: this.link("/reset-password", token), minutes: RESET_MINUTES } });
  }

  async resetPassword(input: { token: string; password: string }) {
    const { rows: peek } = await this.db.query<{ email: string }>(
      "SELECT u.email FROM auth_tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = $1 AND t.purpose = 'reset_password' AND t.used_at IS NULL AND t.expires_at > now()", [hashToken(input.token)],
    );
    if (!peek[0]) throw new AppError("INVALID_TOKEN", "El enlace es inválido o ya venció");
    this.assertPassword(input.password, peek[0].email);
    const password_hash = await hashPassword(input.password);
    const userId = await this.tx(async (c) => {
      const id = await this.consumeToken("reset_password", input.token, c);
      await c.query("UPDATE users SET password_hash = $2, failed_login_count = 0, locked_until = NULL WHERE id = $1", [id, password_hash]);
      await c.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [id]);
      return id;
    });
    await this.notifyPasswordChanged(userId);
  }

  async updatePassword(userId: string, input: { current_password: string; new_password: string }, ctx: RequestContext): Promise<Session> {
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE u.id = $1`, [userId]);
    const u = rows[0];
    if (!u) throw new AppError("UNAUTHENTICATED", "Sesión inválida");
    if (!(await verifyPassword(u.password_hash, input.current_password))) throw new AppError("FORBIDDEN", "La contraseña actual no es correcta");
    this.assertPassword(input.new_password, u.email);
    const password_hash = await hashPassword(input.new_password);
    const session = await this.tx(async (c) => {
      await c.query("UPDATE users SET password_hash = $2 WHERE id = $1", [userId, password_hash]);
      await c.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
      return this.startSession(c, u, ctx);
    });
    await this.notifyPasswordChanged(userId);
    return session;
  }

  private async notifyPasswordChanged(userId: string) {
    const { rows } = await this.db.query<UserRow>(`${USER_SQL} WHERE u.id = $1`, [userId]);
    const u = rows[0];
    if (u) await this.mailer.send({ to: u.email, template: "auth.password_changed", locale: this.locale(u.locale), userId, data: { name: u.display_name ?? u.email } });
  }

  // ---------- Dispositivos ----------
  async sessions(userId: string, currentFamily: string) {
    const { rows } = await this.db.query<{ family_id: string; user_agent: string | null; ip: string | null; started_at: Date; last_seen_at: Date }>(
      `SELECT family_id, (array_agg(user_agent ORDER BY created_at DESC))[1] AS user_agent, (array_agg(ip ORDER BY created_at DESC))[1] AS ip,
              min(created_at) AS started_at, max(created_at) AS last_seen_at
         FROM refresh_tokens WHERE user_id = $1 AND expires_at > now()
          AND family_id IN (SELECT family_id FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL)
        GROUP BY family_id ORDER BY max(created_at) DESC`, [userId],
    );
    return rows.map((r) => ({
      id: r.family_id, current: r.family_id === currentFamily, user_agent: r.user_agent,
      ip: r.ip ? r.ip.replace(/(\d+)\.(\d+)$/, "x.x").replace(/:[0-9a-f]*:[0-9a-f]*$/i, ":x:x") : null, // se enmascara el final de la IP
      started_at: r.started_at.toISOString(), last_seen_at: r.last_seen_at.toISOString(),
    }));
  }
  async revokeSession(userId: string, familyId: string) {
    const r = await this.db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND family_id = $2 AND revoked_at IS NULL", [userId, familyId]);
    if (!r.rowCount) throw AppError.notFound("Sesión");
  }
}
