import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { hashToken } from "../src/modules/auth/tokens.js";
import { json, makeApp, testEnv } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `user${Date.now().toString(36)}${n++}@test.local`;

describe("autenticación", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp({ LOGIN_MAX_FAILURES: "3" }); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  const post = (url: string, payload: unknown, headers: Record<string, string> = {}) => app.inject({ method: "POST", url: `/api/v1${url}`, payload: payload as object, headers });
  const register = async (email = uniq(), extra: Record<string, unknown> = {}) => {
    const res = await post("/auth/register", { email, password: PW, display_name: "Ana Prueba", accept_terms: true, ...extra });
    return { res, email, body: json(res) };
  };
  const login = (email: string, password = PW, headers: Record<string, string> = {}) => post("/auth/login", { email, password }, headers);
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });
  const tokenFrom = (email: string, template: string) => {
    const url = app.mailer.last(email, template)!.text.match(/token=([\w%-]+)/)![1]!;
    return decodeURIComponent(url);
  };

  describe("registro", () => {
    it("crea cuenta, perfil, rol y sesión; envía verificación y no guarda secretos en claro", async () => {
      const { res, email, body } = await register("  Nuevo.Usuario@Test.Local ");
      expect(res.statusCode).toBe(201);
      expect(body.data.user).toMatchObject({ email: "nuevo.usuario@test.local", email_verified: false, display_name: "Ana Prueba", roles: ["user"], locale: "es" });
      expect(body.data.tokens).toMatchObject({ token_type: "Bearer", expires_in: 900 });
      expect(body.data.tokens.refresh_token.length).toBeGreaterThan(30);

      const u = (await pool.query("SELECT password_hash, terms_accepted_at FROM users WHERE email = $1", ["nuevo.usuario@test.local"])).rows[0];
      expect(u.password_hash).toMatch(/^\$argon2id\$/);
      expect(u.password_hash).not.toContain(PW);
      expect(u.terms_accepted_at).not.toBeNull();
      const rt = (await pool.query("SELECT token_hash FROM refresh_tokens WHERE user_id = $1", [body.data.user.id])).rows[0];
      expect(rt.token_hash).toBe(hashToken(body.data.tokens.refresh_token)); // sólo el hash está en la base
      expect(rt.token_hash).not.toBe(body.data.tokens.refresh_token);

      await app.mailer.drain();
      const mail = app.mailer.last("nuevo.usuario@test.local", "auth.verify_email")!;
      expect(mail.subject).toContain("Confirma");
      expect(mail.text).toMatch(/verificar-correo\?token=/);
      expect(mail.html).toContain("Confirmar mi correo");
      const log = (await pool.query("SELECT status FROM email_log WHERE to_email = $1 AND template = 'auth.verify_email'", ["nuevo.usuario@test.local"])).rows[0];
      expect(log.status).toBe("sent");
    });

    it("usa el idioma pedido en el correo", async () => {
      const { email } = await register(uniq(), { locale: "en" });
      await app.mailer.drain();
      expect(app.mailer.last(email, "auth.verify_email")!.subject).toBe("Confirm your email on Descubre RD");
    });

    it("rechaza correos repetidos sin importar mayúsculas", async () => {
      const { email } = await register();
      const dup = await post("/auth/register", { email: email.toUpperCase(), password: PW, accept_terms: true });
      expect(dup.statusCode).toBe(409);
      expect(json(dup).error).toMatchObject({ code: "CONFLICT", details: { reason: "EMAIL_TAKEN" } });
    });

    it("valida la entrada: correo, términos y política de contraseñas", async () => {
      const bad: [unknown, string][] = [
        [{ email: "no-es-correo", password: PW, accept_terms: true }, "correo inválido"],
        [{ email: uniq(), password: PW, accept_terms: false }, "sin aceptar términos"],
        [{ email: uniq(), password: PW }, "faltan términos"],
        [{ email: uniq(), password: "corta1", accept_terms: true }, "muy corta"],
        [{ email: uniq(), password: "password", accept_terms: true }, "demasiado común"],
        [{ email: uniq(), password: "aaaaaaaaaaaa", accept_terms: true }, "una sola clase"],
        [{ email: "maria.gomez@test.local", password: "maria.gomez-2026", accept_terms: true }, "contiene el correo"],
      ];
      for (const [payload, why] of bad) {
        const res = await post("/auth/register", payload);
        expect(res.statusCode, why).toBe(400);
        expect(json(res).error.code, why).toBe("VALIDATION_ERROR");
      }
    });
  });

  describe("inicio de sesión", () => {
    it("inicia sesión con el correo en cualquier capitalización", async () => {
      const { email } = await register();
      const res = await login(email.toUpperCase());
      expect(res.statusCode).toBe(200);
      expect(json(res).data.user.email).toBe(email);
    });

    it("no distingue entre contraseña errónea y cuenta inexistente", async () => {
      const { email } = await register();
      const wrong = await login(email, "Otra-Clave-2026!");
      const ghost = await login("nadie@test.local", PW);
      expect(wrong.statusCode).toBe(401);
      expect(ghost.statusCode).toBe(401);
      expect(json(wrong).error.message).toBe(json(ghost).error.message);
    });

    it("bloquea temporalmente tras varios fallos y lo levanta con el tiempo", async () => {
      const { email } = await register();
      for (let i = 0; i < 3; i++) expect((await login(email, "Mala-Clave-2026!")).statusCode).toBe(401);
      const locked = await login(email, PW); // aun con la contraseña correcta
      expect(locked.statusCode).toBe(429);
      expect(json(locked).error.details.retry_after_seconds).toBeGreaterThan(0);
      await pool.query("UPDATE users SET locked_until = now() - interval '1 second' WHERE email = $1", [email]);
      const ok = await login(email, PW);
      expect(ok.statusCode).toBe(200);
      expect((await pool.query("SELECT failed_login_count FROM users WHERE email = $1", [email])).rows[0].failed_login_count).toBe(0);
    });

    it("las cuentas suspendidas no pueden entrar", async () => {
      const { email, body } = await register();
      await pool.query("UPDATE profiles SET is_suspended = true WHERE id = $1", [body.data.user.id]);
      const res = await login(email);
      expect(res.statusCode).toBe(403);
      expect(json(res).error.code).toBe("ACCOUNT_SUSPENDED");
    });
  });

  describe("token de acceso", () => {
    it("GET /auth/me exige token válido", async () => {
      const { body } = await register();
      const at = body.data.tokens.access_token;
      expect((await app.inject({ url: "/api/v1/auth/me" })).statusCode).toBe(401);
      expect((await app.inject({ url: "/api/v1/auth/me", headers: bearer("basura") })).statusCode).toBe(401);
      const me = await app.inject({ url: "/api/v1/auth/me", headers: bearer(at) });
      expect(me.statusCode).toBe(200);
      expect(me.headers["cache-control"]).toContain("no-store");
      expect(json(me).data).toMatchObject({ email: body.data.user.email, roles: ["user"], counts: { favorites: 0, unread_notifications: 0 } });
    });

    it("distingue token vencido de token inválido y rechaza firmas ajenas", async () => {
      const { body } = await register();
      const short = await app.tokens.signAccess({ sub: body.data.user.id, roles: ["user"], locale: "es", sid: "00000000-0000-4000-8000-000000000000" }, 1);
      await new Promise((r) => setTimeout(r, 1500));
      const expired = await app.inject({ url: "/api/v1/auth/me", headers: bearer(short) });
      expect(expired.statusCode).toBe(401);
      expect(json(expired).error.code).toBe("TOKEN_EXPIRED");

      const other = await buildApp({ env: testEnv() }); // otra instancia = otro par de claves efímero
      const forged = await other.tokens.signAccess({ sub: body.data.user.id, roles: ["admin"], locale: "es", sid: "x" });
      const res = await app.inject({ url: "/api/v1/auth/me", headers: bearer(forged) });
      expect(res.statusCode).toBe(401);
      expect(json(res).error.code).toBe("UNAUTHENTICATED");
      await other.close();
    });

    it("requireRole responde 401 sin token, 403 sin el rol y 200 con él", async () => {
      const guarded = await buildApp({ env: testEnv() });
      guarded.get("/api/v1/_admin-only", { preHandler: guarded.requireRole("admin") }, async () => ({ ok: true }));
      await guarded.ready();
      const reg = json(await guarded.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email: uniq(), password: PW, accept_terms: true } }));
      expect((await guarded.inject({ url: "/api/v1/_admin-only" })).statusCode).toBe(401);
      expect((await guarded.inject({ url: "/api/v1/_admin-only", headers: bearer(reg.data.tokens.access_token) })).statusCode).toBe(403);
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [reg.data.user.id]);
      const again = json(await guarded.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: reg.data.user.email, password: PW } }));
      expect(again.data.user.roles).toEqual(["admin", "user"]);
      expect((await guarded.inject({ url: "/api/v1/_admin-only", headers: bearer(again.data.tokens.access_token) })).statusCode).toBe(200);
      await guarded.close();
    });
  });

  describe("refresco y cierre de sesión", () => {
    it("rota el token de refresco y detecta su reutilización revocando toda la sesión", async () => {
      const { body } = await register();
      const first = body.data.tokens.refresh_token as string;
      const r1 = await post("/auth/refresh", { refresh_token: first });
      expect(r1.statusCode).toBe(200);
      const second = json(r1).data.tokens.refresh_token as string;
      expect(second).not.toBe(first);

      const replay = await post("/auth/refresh", { refresh_token: first }); // reutilización del token ya rotado
      expect(replay.statusCode).toBe(401);
      const dead = await post("/auth/refresh", { refresh_token: second }); // el nuevo también quedó revocado
      expect(dead.statusCode).toBe(401);
    });

    it("rechaza tokens de refresco desconocidos o ausentes", async () => {
      expect((await post("/auth/refresh", { refresh_token: "x".repeat(43) })).statusCode).toBe(401);
      expect((await post("/auth/refresh", {})).statusCode).toBe(401);
    });

    it("logout revoca la sesión; logout?all cierra todas", async () => {
      const { email, body } = await register();
      const a = body.data.tokens.refresh_token as string;
      const other = json(await login(email)).data.tokens;
      expect((await post("/auth/logout", { refresh_token: a })).statusCode).toBe(204);
      expect((await post("/auth/refresh", { refresh_token: a })).statusCode).toBe(401);
      expect((await post("/auth/refresh", { refresh_token: other.refresh_token })).statusCode).toBe(200); // la otra sesión sigue

      const again = json(await login(email)).data.tokens;
      expect((await app.inject({ method: "POST", url: "/api/v1/auth/logout?all=true", headers: bearer(again.access_token) })).statusCode).toBe(204);
      expect((await post("/auth/refresh", { refresh_token: again.refresh_token })).statusCode).toBe(401);
    });

    it("modo web: refresco en cookie HttpOnly y protección CSRF por cabecera", async () => {
      const { email } = await register();
      const res = await login(email, PW, { "x-refresh-transport": "cookie" });
      const body = json(res);
      expect(body.data.tokens.refresh_token).toBeUndefined();
      const c = res.cookies.find((x) => x.name === "refresh_token")!;
      expect(c).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/api/v1/auth" });

      const noHeader = await app.inject({ method: "POST", url: "/api/v1/auth/refresh", cookies: { refresh_token: c.value } });
      expect(noHeader.statusCode).toBe(400);
      const ok = await app.inject({ method: "POST", url: "/api/v1/auth/refresh", cookies: { refresh_token: c.value }, headers: { "x-refresh-transport": "cookie" } });
      expect(ok.statusCode).toBe(200);
      expect(ok.cookies.find((x) => x.name === "refresh_token")!.value).not.toBe(c.value);
    });
  });

  describe("verificación de correo", () => {
    it("confirma el correo una sola vez y envía la bienvenida", async () => {
      const { email, body } = await register();
      await app.mailer.drain();
      const token = tokenFrom(email, "auth.verify_email");
      const res = await post("/auth/verify-email", { token });
      expect(res.statusCode).toBe(200);
      const me = json(await app.inject({ url: "/api/v1/auth/me", headers: bearer(body.data.tokens.access_token) }));
      expect(me.data.email_verified).toBe(true);
      await app.mailer.drain();
      expect(app.mailer.last(email, "auth.welcome")).toBeDefined();
      const reuse = await post("/auth/verify-email", { token });
      expect(reuse.statusCode).toBe(400);
      expect(json(reuse).error.code).toBe("INVALID_TOKEN");
      expect((await post("/auth/verify-email", { token: "z".repeat(43) })).statusCode).toBe(400);
    });

    it("reenvío: invalida el enlace anterior, limita a 3 por hora y se niega si ya está verificado", async () => {
      const { email, body } = await register();
      await app.mailer.drain();
      const old = tokenFrom(email, "auth.verify_email");
      const h = bearer(body.data.tokens.access_token);
      const r1 = await app.inject({ method: "POST", url: "/api/v1/auth/resend-verification", headers: h });
      expect(r1.statusCode).toBe(202);
      await app.mailer.drain();
      expect((await post("/auth/verify-email", { token: old })).statusCode).toBe(400); // el anterior quedó invalidado
      expect((await app.inject({ method: "POST", url: "/api/v1/auth/resend-verification", headers: h })).statusCode).toBe(202);
      const limited = await app.inject({ method: "POST", url: "/api/v1/auth/resend-verification", headers: h });
      expect(limited.statusCode).toBe(429);

      const fresh = tokenFrom(email, "auth.verify_email");
      await post("/auth/verify-email", { token: fresh });
      const done = await app.inject({ method: "POST", url: "/api/v1/auth/resend-verification", headers: h });
      expect(done.statusCode).toBe(409);
    });
  });

  describe("contraseñas", () => {
    it("olvidé mi contraseña: misma respuesta exista o no la cuenta; sólo envía correo si existe", async () => {
      const { email } = await register();
      await app.mailer.drain(); // los correos del registro previo ya salieron
      const before = app.mailer.outbox.length;
      const ghost = await post("/auth/forgot-password", { email: "fantasma@test.local" });
      await app.mailer.drain();
      expect(ghost.statusCode).toBe(202);
      expect(app.mailer.outbox.length).toBe(before);
      const real = await post("/auth/forgot-password", { email: email.toUpperCase() });
      await app.mailer.drain();
      expect(real.statusCode).toBe(202);
      expect(json(real)).toEqual(json(ghost));
      expect(app.mailer.last(email, "auth.reset_password")!.text).toMatch(/reset-password\?token=/);
    });

    it("restablecer: cambia la clave, cierra todas las sesiones, avisa por correo y el enlace es de un solo uso", async () => {
      const { email, body } = await register();
      await post("/auth/forgot-password", { email });
      await app.mailer.drain();
      const token = tokenFrom(email, "auth.reset_password");

      const weak = await post("/auth/reset-password", { token, password: "corta" });
      expect(weak.statusCode).toBe(400); // una contraseña débil no consume el enlace

      const NEW = "Nueva-Clave-Segura-77!";
      expect((await post("/auth/reset-password", { token, password: NEW })).statusCode).toBe(204);
      expect((await post("/auth/refresh", { refresh_token: body.data.tokens.refresh_token })).statusCode).toBe(401);
      expect((await login(email, PW)).statusCode).toBe(401);
      expect((await login(email, NEW)).statusCode).toBe(200);
      await app.mailer.drain();
      expect(app.mailer.last(email, "auth.password_changed")).toBeDefined();
      expect((await post("/auth/reset-password", { token, password: "Otra-Clave-Segura-88!" })).statusCode).toBe(400);
    });

    it("cambiar contraseña: exige la actual, cierra las demás sesiones y devuelve una nueva", async () => {
      const { email, body } = await register();
      const other = json(await login(email)).data.tokens;
      const h = bearer(body.data.tokens.access_token);
      const NEW = "Otra-Clave-Larga-99!";
      const wrong = await app.inject({ method: "POST", url: "/api/v1/auth/update-password", headers: h, payload: { current_password: "mal", new_password: NEW } });
      expect(wrong.statusCode).toBe(403);
      const ok = await app.inject({ method: "POST", url: "/api/v1/auth/update-password", headers: h, payload: { current_password: PW, new_password: NEW } });
      expect(ok.statusCode).toBe(200);
      const fresh = json(ok).data.tokens;
      expect((await post("/auth/refresh", { refresh_token: other.refresh_token })).statusCode).toBe(401);
      expect((await post("/auth/refresh", { refresh_token: fresh.refresh_token })).statusCode).toBe(200);
      expect((await login(email, NEW)).statusCode).toBe(200);
    });
  });

  describe("dispositivos", () => {
    it("lista sesiones abiertas, marca la actual y permite cerrar otra", async () => {
      const { email, body } = await register();
      const second = json(await login(email, PW, { "user-agent": "TestPhone/1.0" })).data.tokens;
      const h = bearer(body.data.tokens.access_token);
      const list = json(await app.inject({ url: "/api/v1/auth/sessions", headers: h })).data as { id: string; current: boolean; user_agent: string | null }[];
      expect(list).toHaveLength(2);
      expect(list.filter((s) => s.current)).toHaveLength(1);
      const phone = list.find((s) => s.user_agent === "TestPhone/1.0")!;
      expect((await app.inject({ method: "DELETE", url: `/api/v1/auth/sessions/${phone.id}`, headers: h })).statusCode).toBe(204);
      expect((await post("/auth/refresh", { refresh_token: second.refresh_token })).statusCode).toBe(401);
      expect((await app.inject({ method: "DELETE", url: `/api/v1/auth/sessions/${phone.id}`, headers: h })).statusCode).toBe(404);
      expect(json(await app.inject({ url: "/api/v1/auth/sessions", headers: h })).data).toHaveLength(1);
    });
  });

  it("aplica límites de tasa propios en login cuando están activos", async () => {
    const limited = await makeApp({ AUTH_RATE_LIMIT_ENABLED: "true" });
    const codes: number[] = [];
    for (let i = 0; i < 12; i++) codes.push((await limited.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "x@test.local", password: "cualquiera" } })).statusCode);
    expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(codes.slice(10)).toEqual([429, 429]);
    await limited.close();
  });

  it("nunca devuelve el hash de contraseña en ninguna respuesta", async () => {
    const { body } = await register();
    const me = await app.inject({ url: "/api/v1/auth/me", headers: bearer(body.data.tokens.access_token) });
    for (const text of [JSON.stringify(body), me.body]) expect(text).not.toMatch(/argon2|password_hash/);
  });
});
