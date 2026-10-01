import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { readBodyCapped, traceHeaders } from "../../lib/http.js";
import type { AuthService, LoginResult, RequestContext } from "./service.js";

/**
 * Inicio de sesión social con OpenID Connect (docs §5.1). Flujo de código de autorización con PKCE (S256), `state` de un
 * solo uso atado al navegador por cookie, `nonce` y verificación completa del id_token. Sólo hay que añadir un proveedor
 * en `providers()` para cualquiera que hable OIDC (Google hoy; Microsoft, Apple con su secreto JWT y otros después).
 */
interface Provider { id: string; name: string; issuer: string; clientId: string; clientSecret: string; scope: string }
interface Discovery { authorization_endpoint: string; token_endpoint: string; jwks_uri: string; issuer: string }

const STATE_TTL_SECONDS = 600;
const CODE_TTL_SECONDS = 60;
const MAX_OIDC_BYTES = 1_000_000;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const b64u = (buf: Buffer) => buf.toString("base64url");

export type OAuthErrorCode =
  | "invalid_state" | "access_denied" | "token_exchange_failed" | "invalid_id_token" | "email_not_verified"
  | "identity_in_use" | "provider_already_linked" | "account_suspended" | "provider_unavailable";

export class OAuthService {
  private readonly discovery = new Map<string, { at: number; doc: Discovery }>();
  private readonly jwks = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

  constructor(private readonly env: Env, private readonly db: Db, private readonly auth: AuthService, private readonly log: FastifyBaseLogger) {}

  // ---------- Configuración ----------
  private providers(): Provider[] {
    const list: Provider[] = [];
    if (this.env.OAUTH_GOOGLE_CLIENT_ID && this.env.OAUTH_GOOGLE_CLIENT_SECRET) {
      list.push({ id: "google", name: "Google", issuer: this.env.OAUTH_GOOGLE_ISSUER, clientId: this.env.OAUTH_GOOGLE_CLIENT_ID, clientSecret: this.env.OAUTH_GOOGLE_CLIENT_SECRET, scope: "openid email profile" });
    }
    return list;
  }
  available() { return this.providers().map((p) => ({ id: p.id, name: p.name })); }
  private provider(id: string): Provider {
    const p = this.providers().find((x) => x.id === id);
    if (!p) throw AppError.notFound("Proveedor");
    return p;
  }
  private callbackUrl(p: Provider) { return `${this.env.PUBLIC_BASE_URL}/api/v1/auth/oauth/${p.id}/callback`; }
  private get defaultRedirect() { return `${this.env.WEB_BASE_URL}/login/oauth`; }

  /** Orígenes a los que se puede devolver al usuario (evita redirecciones abiertas). */
  private allowedOrigins(): Set<string> {
    const raw = [this.env.WEB_BASE_URL, ...this.env.CORS_ORIGINS.split(","), ...this.env.OAUTH_REDIRECT_ALLOWLIST.split(",")];
    const out = new Set<string>();
    for (const r of raw.map((s) => s.trim()).filter(Boolean)) { try { out.add(new URL(r).origin); } catch { /* entrada inválida: se ignora */ } }
    return out;
  }
  private checkRedirect(url: string | undefined): string {
    if (!url) return this.defaultRedirect;
    let u: URL;
    try { u = new URL(url); } catch { throw AppError.validation("redirect_to no es una URL válida"); }
    if (!["http:", "https:"].includes(u.protocol) || !this.allowedOrigins().has(u.origin)) throw AppError.validation("redirect_to no está permitido");
    return u.toString();
  }

  // ---------- OIDC ----------
  private async discover(p: Provider): Promise<Discovery> {
    const hit = this.discovery.get(p.issuer);
    if (hit && Date.now() - hit.at < 3_600_000) return hit.doc;
    try {
      const res = await fetch(`${p.issuer.replace(/\/$/, "")}/.well-known/openid-configuration`, { headers: traceHeaders(), signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = (res.body ? JSON.parse(await readBodyCapped(res, MAX_OIDC_BYTES)) : await res.json()) as Discovery;
      if (!doc.authorization_endpoint || !doc.token_endpoint || !doc.jwks_uri) throw new Error("Documento de descubrimiento incompleto");
      this.discovery.set(p.issuer, { at: Date.now(), doc });
      return doc;
    } catch (err) {
      this.log.warn({ err: (err as Error).message, issuer: p.issuer }, "No se pudo consultar el proveedor OIDC");
      throw new AppError("UPSTREAM_ERROR", "El proveedor de inicio de sesión no está disponible");
    }
  }

  // ---------- Paso 1: iniciar ----------
  async start(input: { provider: string; mode: "login" | "link"; redirectTo?: string; userId?: string }): Promise<{ authorize_url: string; state: string }> {
    const p = this.provider(input.provider);
    const redirectTo = this.checkRedirect(input.redirectTo);
    const doc = await this.discover(p);
    const state = b64u(randomBytes(32)), nonce = b64u(randomBytes(24)), verifier = b64u(randomBytes(48));
    await this.db.query("DELETE FROM oauth_states WHERE expires_at < now()");
    await this.db.query(
      "INSERT INTO oauth_states (state_hash, provider, code_verifier, nonce, redirect_to, mode, user_id, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now() + make_interval(secs => $8))",
      [sha256(state), p.id, verifier, nonce, redirectTo, input.mode, input.userId ?? null, STATE_TTL_SECONDS],
    );
    const u = new URL(doc.authorization_endpoint);
    u.search = new URLSearchParams({
      response_type: "code", client_id: p.clientId, redirect_uri: this.callbackUrl(p), scope: p.scope, state, nonce,
      code_challenge: b64u(createHash("sha256").update(verifier).digest()), code_challenge_method: "S256",
      ...(input.mode === "login" ? { prompt: "select_account" } : {}),
    }).toString();
    return { authorize_url: u.toString(), state };
  }

  // ---------- Paso 2: callback del proveedor ----------
  async callback(input: { provider: string; code?: string; state?: string; cookieState?: string; providerError?: string }): Promise<{ redirectTo: string; query: Record<string, string> }> {
    const fail = (redirectTo: string, error: OAuthErrorCode) => ({ redirectTo, query: { error } });
    // El state debe coincidir con la cookie del navegador que inició el flujo (evita "login CSRF").
    if (!input.state || !input.cookieState || input.state !== input.cookieState) return fail(this.defaultRedirect, "invalid_state");
    const { rows } = await this.db.query<{ provider: string; code_verifier: string; nonce: string; redirect_to: string; mode: "login" | "link"; user_id: string | null }>(
      "DELETE FROM oauth_states WHERE state_hash = $1 AND expires_at > now() RETURNING provider, code_verifier, nonce, redirect_to, mode, user_id", [sha256(input.state)],
    );
    const st = rows[0];
    if (!st || st.provider !== input.provider) return fail(this.defaultRedirect, "invalid_state"); // de un solo uso: repetir el enlace falla
    if (input.providerError || !input.code) return fail(st.redirect_to, "access_denied");

    const p = this.provider(input.provider);
    let claims: { sub: string; email?: string; email_verified?: boolean | string; name?: string; picture?: string; locale?: string };
    try {
      const doc = await this.discover(p);
      const res = await fetch(doc.token_endpoint, {
        method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json", ...traceHeaders() }, signal: AbortSignal.timeout(8000),
        body: new URLSearchParams({ grant_type: "authorization_code", code: input.code, redirect_uri: this.callbackUrl(p), client_id: p.clientId, client_secret: p.clientSecret, code_verifier: st.code_verifier }),
      });
      if (!res.ok) { this.log.warn({ status: res.status }, "El proveedor rechazó el intercambio de código"); return fail(st.redirect_to, "token_exchange_failed"); }
      const tokens = (res.body ? JSON.parse(await readBodyCapped(res, MAX_OIDC_BYTES)) : await res.json()) as { id_token?: string };
      if (!tokens.id_token) return fail(st.redirect_to, "token_exchange_failed");
      let jwks = this.jwks.get(doc.jwks_uri);
      if (!jwks) { jwks = createRemoteJWKSet(new URL(doc.jwks_uri), { cooldownDuration: 30_000, timeoutDuration: 5000 }); this.jwks.set(doc.jwks_uri, jwks); }
      const { payload } = await jwtVerify(tokens.id_token, jwks, { issuer: doc.issuer, audience: p.clientId, algorithms: ["RS256", "ES256"] });
      if (payload.nonce !== st.nonce || !payload.sub) return fail(st.redirect_to, "invalid_id_token");
      claims = payload as typeof claims;
    } catch (err) {
      if (err instanceof AppError) return fail(st.redirect_to, "provider_unavailable");
      this.log.warn({ err: (err as Error).message }, "id_token inválido o proveedor no disponible");
      return fail(st.redirect_to, "invalid_id_token");
    }

    const email = claims.email?.trim().toLowerCase();
    const emailVerified = claims.email_verified === true || claims.email_verified === "true";
    const subject = String(claims.sub);

    try {
      const identity = (await this.db.query<{ user_id: string }>("SELECT user_id FROM oauth_identities WHERE provider = $1 AND subject = $2", [p.id, subject])).rows[0];

      if (st.mode === "link") {
        if (!st.user_id) return fail(st.redirect_to, "invalid_state");
        if (identity && identity.user_id !== st.user_id) return fail(st.redirect_to, "identity_in_use");
        const existing = (await this.db.query("SELECT 1 FROM oauth_identities WHERE user_id = $1 AND provider = $2", [st.user_id, p.id])).rowCount;
        if (!identity && existing) return fail(st.redirect_to, "provider_already_linked");
        if (!identity) await this.db.query("INSERT INTO oauth_identities (user_id, provider, subject, email, last_login_at) VALUES ($1, $2, $3, $4, now())", [st.user_id, p.id, subject, email ?? null]);
        return { redirectTo: st.redirect_to, query: { linked: p.id } };
      }

      let userId = identity?.user_id;
      if (!userId) {
        // Un correo no verificado por el proveedor no demuestra que la persona sea su dueña: no se crea ni se vincula nada.
        if (!email || !emailVerified) return fail(st.redirect_to, "email_not_verified");
        const found = (await this.db.query<{ id: string; email_verified_at: Date | null }>("SELECT id, email_verified_at FROM users WHERE lower(email) = $1 AND status <> 'deleted'", [email])).rows[0];
        if (found) {
          userId = found.id;
          // Anti "pre-secuestro": si la cuenta existente nunca verificó su correo, quien la creó pudo no ser el dueño; se anula su contraseña y sesiones.
          if (!found.email_verified_at) await this.auth.neutralizeUnverifiedAccount(found.id);
        } else {
          userId = await this.auth.createOAuthUser({ email, display_name: claims.name, picture: claims.picture, locale: claims.locale });
        }
        await this.db.query("INSERT INTO oauth_identities (user_id, provider, subject, email, last_login_at) VALUES ($1, $2, $3, $4, now()) ON CONFLICT (provider, subject) DO NOTHING", [userId, p.id, subject, email]);
      } else {
        await this.db.query("UPDATE oauth_identities SET last_login_at = now(), email = COALESCE($3, email) WHERE provider = $1 AND subject = $2", [p.id, subject, email ?? null]);
      }
      const check = await this.auth.assertCanLogin(userId);
      if (check) return fail(st.redirect_to, check);

      const code = b64u(randomBytes(32));
      await this.db.query("INSERT INTO oauth_login_codes (code_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))", [sha256(code), userId, CODE_TTL_SECONDS]);
      return { redirectTo: st.redirect_to, query: { oauth_code: code, provider: p.id } };
    } catch (err) {
      this.log.error({ err }, "Error completando el inicio de sesión social");
      return fail(st.redirect_to, "provider_unavailable");
    }
  }

  // ---------- Paso 3: canje del código por la sesión ----------
  async exchange(code: string, ctx: RequestContext): Promise<LoginResult> {
    await this.db.query("DELETE FROM oauth_login_codes WHERE expires_at < now() - interval '1 hour'");
    const { rows } = await this.db.query<{ user_id: string }>(
      "UPDATE oauth_login_codes SET used_at = now() WHERE code_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING user_id", [sha256(code)],
    );
    if (!rows[0]) throw new AppError("INVALID_TOKEN", "El código es inválido, ya se usó o venció");
    return this.auth.loginAs(rows[0].user_id, ctx);
  }

  // ---------- Identidades vinculadas ----------
  async identities(userId: string) {
    const { rows } = await this.db.query<{ provider: string; email: string | null; created_at: Date; last_login_at: Date | null }>(
      "SELECT provider, email, created_at, last_login_at FROM oauth_identities WHERE user_id = $1 ORDER BY created_at", [userId],
    );
    const pw = (await this.db.query<{ password_set: boolean }>("SELECT password_set FROM users WHERE id = $1", [userId])).rows[0]?.password_set ?? true;
    return {
      identities: rows.map((r) => ({ provider: r.provider, email: r.email, linked_at: r.created_at.toISOString(), last_login_at: r.last_login_at?.toISOString() ?? null })),
      password_set: pw,
    };
  }

  /** Desvincula un proveedor, siempre que quede otra forma de entrar (contraseña u otro proveedor). */
  async unlink(userId: string, provider: string) {
    const { identities, password_set } = await this.identities(userId);
    if (!identities.some((i) => i.provider === provider)) throw AppError.notFound("Identidad");
    if (!password_set && identities.length <= 1) throw new AppError("BUSINESS_RULE", "Es tu único método de acceso: crea una contraseña (\"olvidé mi contraseña\") antes de desvincularlo");
    await this.db.query("DELETE FROM oauth_identities WHERE user_id = $1 AND provider = $2", [userId, provider]);
  }
}
