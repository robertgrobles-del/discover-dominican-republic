import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { base32Decode, totp } from "../src/modules/auth/totp.js";
import { startFakeOidc, type FakeIdentity, type FakeOidc, type Overrides } from "./fake-oidc.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `${Date.now().toString(36)}${n++}`;

describe("inicio de sesión social (OIDC)", () => {
  let app: FastifyInstance;
  let idp: FakeOidc;
  let pool: pg.Pool;

  beforeAll(async () => {
    idp = await startFakeOidc();
    app = await makeApp({ OAUTH_GOOGLE_CLIENT_ID: idp.clientId, OAUTH_GOOGLE_CLIENT_SECRET: idp.clientSecret, OAUTH_GOOGLE_ISSUER: idp.issuer, LOGIN_MAX_FAILURES: "3" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => { await pool.end(); await app.close(); await idp.close(); });

  const post = (url: string, payload?: unknown, token?: string) =>
    app.inject({ method: "POST", url: `/api/v1${url}`, payload: payload as object, headers: token ? { authorization: `Bearer ${token}` } : {} });
  const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

  interface Flow { start: Awaited<ReturnType<typeof post>>; cookie: string; authorizeUrl: string }
  const start = async (body: Record<string, unknown> = {}, token?: string): Promise<Flow> => {
    const res = await post("/auth/oauth/google/start", body, token);
    const cookie = res.cookies.find((c) => c.name === "oauth_state")?.value ?? "";
    return { start: res, cookie, authorizeUrl: res.statusCode === 200 ? json(res).data.authorize_url : "" };
  };
  /** Recorre el flujo hasta el retorno del proveedor y devuelve la redirección final al frontend. */
  const callback = async (flow: Flow, identity: FakeIdentity, overrides: Overrides = {}, opts: { cookie?: string | null; stateOverride?: string } = {}) => {
    const back = new URL(idp.approve(flow.authorizeUrl, identity, overrides));
    if (opts.stateOverride) back.searchParams.set("state", opts.stateOverride);
    const cookie = opts.cookie === undefined ? flow.cookie : opts.cookie;
    const res = await app.inject({ url: back.pathname + back.search, cookies: cookie ? { oauth_state: cookie } : {} });
    const loc = new URL(res.headers.location as string);
    return { res, loc, params: Object.fromEntries(loc.searchParams) };
  };
  const exchange = (code: string) => post("/auth/oauth/exchange", { code });
  const fullLogin = async (identity: FakeIdentity) => {
    const flow = await start();
    const { params } = await callback(flow, identity);
    return { flow, params, res: await exchange(params.oauth_code!) };
  };
  const identity = (over: Partial<FakeIdentity> = {}): FakeIdentity => ({ sub: `g-${uniq()}`, email: `social${uniq()}@test.local`, email_verified: true, name: "Carlos Social", picture: "https://example.com/c.png", locale: "es-419", ...over });

  describe("inicio del flujo", () => {
    it("lista los proveedores configurados", async () => {
      const res = await app.inject({ url: "/api/v1/auth/oauth/providers" });
      expect(json(res).data).toEqual([{ id: "google", name: "Google" }]);
      const off = await makeApp();
      expect(json(await off.inject({ url: "/api/v1/auth/oauth/providers" })).data).toEqual([]);
      expect((await off.inject({ method: "POST", url: "/api/v1/auth/oauth/google/start", payload: {} })).statusCode).toBe(404);
      await off.close();
    });

    it("arma la URL con PKCE S256, state, nonce y redirect_uri exacto, y ata el state al navegador con una cookie", async () => {
      const { start: res, cookie, authorizeUrl } = await start();
      expect(res.statusCode).toBe(200);
      const u = new URL(authorizeUrl);
      expect(u.origin + u.pathname).toBe(`${idp.issuer}/authorize`);
      const p = u.searchParams;
      expect(Object.fromEntries(p)).toMatchObject({ response_type: "code", client_id: idp.clientId, scope: "openid email profile", code_challenge_method: "S256", redirect_uri: "http://localhost:3000/api/v1/auth/oauth/google/callback" });
      expect(p.get("state")).toBe(cookie);
      expect(p.get("state")!.length).toBeGreaterThanOrEqual(40);
      expect(p.get("nonce")!.length).toBeGreaterThanOrEqual(30);
      expect(p.get("code_challenge")!.length).toBe(43);
      const c = res.cookies.find((x) => x.name === "oauth_state")!;
      expect(c).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/api/v1/auth/oauth" });
      expect(res.headers["cache-control"]).toBe("no-store");
      const row = (await pool.query("SELECT state_hash FROM oauth_states")).rows.map((r) => r.state_hash as string);
      expect(row).not.toContain(cookie); // sólo se guarda el hash
    });

    it("variante por redirección 302 para botones simples", async () => {
      const res = await app.inject({ url: "/api/v1/auth/oauth/google" });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain(`${idp.issuer}/authorize`);
      expect(res.cookies.some((c) => c.name === "oauth_state")).toBe(true);
    });

    it("sólo acepta destinos de retorno de la lista blanca (sin redirecciones abiertas)", async () => {
      for (const evil of ["https://evil.example/robo", "javascript:alert(1)", "//evil.example", "ftp://localhost:8080/x", "no es url"]) {
        const res = await post("/auth/oauth/google/start", { redirect_to: evil });
        expect(res.statusCode, evil).toBe(400);
      }
      const ok = await start({ redirect_to: "http://localhost:8080/perfil/conexiones" });
      expect(ok.start.statusCode).toBe(200);
      expect((await app.inject({ url: "/api/v1/auth/oauth/google?redirect_to=https://evil.example" })).statusCode).toBe(400);
    });
  });

  describe("crear cuenta e iniciar sesión", () => {
    it("primer ingreso: crea la cuenta verificada y sin contraseña, con perfil y bienvenida", async () => {
      const id = identity();
      const flow = await start({ redirect_to: "http://localhost:8080/login/oauth" });
      const { res, loc, params } = await callback(flow, id);
      expect(res.statusCode).toBe(302);
      expect(loc.origin + loc.pathname).toBe("http://localhost:8080/login/oauth");
      expect(params.provider).toBe("google");
      expect(params.oauth_code!.length).toBeGreaterThanOrEqual(40);
      expect(res.headers["cache-control"]).toBe("no-store");
      expect(res.headers["referrer-policy"]).toBe("no-referrer");
      expect(res.cookies.find((c) => c.name === "oauth_state")?.value).toBe(""); // la cookie de estado se borra
      expect(idp.requests.at(-1)!.body).toMatchObject({ grant_type: "authorization_code", client_id: idp.clientId, client_secret: idp.clientSecret });

      const ex = await exchange(params.oauth_code!);
      expect(ex.statusCode).toBe(200);
      const body = json(ex).data;
      expect(body.user).toMatchObject({ email: id.email, email_verified: true, display_name: "Carlos Social", locale: "es", roles: ["user"] });
      const row = (await pool.query("SELECT password_set, email_verified_at, terms_accepted_at, password_hash FROM users WHERE email = $1", [id.email])).rows[0];
      expect(row.password_set).toBe(false);
      expect(row.email_verified_at).not.toBeNull();
      expect(row.password_hash.startsWith("!oauth:")).toBe(true);
      expect((await pool.query("SELECT avatar_url FROM profiles WHERE id = $1", [body.user.id])).rows[0].avatar_url).toBe("https://example.com/c.png");
      const me = await app.inject({ url: "/api/v1/auth/me", headers: bearer(body.tokens.access_token) });
      expect(me.statusCode).toBe(200);
      await app.mailer.drain();
      expect(app.mailer.last(id.email!, "auth.welcome")).toBeDefined();
    });

    it("la cuenta creada con Google no admite inicio con contraseña", async () => {
      const id = identity();
      await fullLogin(id);
      const res = await post("/auth/login", { email: id.email, password: "!oauth:cualquiera" });
      expect(res.statusCode).toBe(401);
      expect((await post("/auth/login", { email: id.email, password: PW })).statusCode).toBe(401);
    });

    it("el segundo ingreso reutiliza la misma cuenta", async () => {
      const id = identity();
      const first = json((await fullLogin(id)).res).data.user.id;
      const second = json((await fullLogin(id)).res).data.user.id;
      expect(second).toBe(first);
      expect((await pool.query("SELECT count(*)::int AS n FROM oauth_identities WHERE subject = $1", [id.sub])).rows[0].n).toBe(1);
    });

    it("vincula con una cuenta existente de correo verificado (mismo correo) sin duplicarla", async () => {
      const email = `existente${uniq()}@test.local`;
      const reg = json(await post("/auth/register", { email, password: PW, accept_terms: true })).data;
      await app.mailer.drain();
      const token = decodeURIComponent(app.mailer.last(email, "auth.verify_email")!.text.match(/token=([\w%-]+)/)![1]!);
      await post("/auth/verify-email", { token });
      const { res } = await fullLogin(identity({ email }));
      expect(json(res).data.user.id).toBe(reg.user.id);
      // la contraseña sigue funcionando: era una cuenta verificada
      expect((await post("/auth/login", { email, password: PW })).statusCode).toBe(200);
    });

    it("anti pre-secuestro: al vincular una cuenta con correo SIN verificar se anula la contraseña del creador y sus sesiones", async () => {
      const email = `victima${uniq()}@test.local`;
      const attacker = json(await post("/auth/register", { email, password: PW, accept_terms: true })).data; // alguien registra el correo de otra persona
      const { res } = await fullLogin(identity({ email })); // la dueña real entra con Google
      expect(res.statusCode).toBe(200);
      expect((await post("/auth/login", { email, password: PW })).statusCode).toBe(401); // la contraseña del atacante ya no sirve
      expect((await post("/auth/refresh", { refresh_token: attacker.tokens.refresh_token })).statusCode).toBe(401); // ni su sesión abierta
      expect((await pool.query("SELECT email_verified_at, password_set FROM users WHERE email = $1", [email])).rows[0]).toMatchObject({ password_set: false });
    });

    it("rechaza correos no verificados por el proveedor o ausentes", async () => {
      for (const id of [identity({ email_verified: false }), identity({ email_verified: "false" }), identity({ email: undefined })]) {
        const flow = await start();
        const { params } = await callback(flow, id);
        expect(params, JSON.stringify(id)).toEqual({ error: "email_not_verified" });
      }
      expect((await pool.query("SELECT 1 FROM users WHERE email LIKE 'social%' AND email_verified_at IS NULL")).rowCount).toBe(0);
      const ok = identity({ email_verified: "true" }); // Google a veces envía "true" como texto
      expect((await fullLogin(ok)).res.statusCode).toBe(200);
    });

    it("una cuenta suspendida no entra", async () => {
      const id = identity();
      const u = json((await fullLogin(id)).res).data.user;
      await pool.query("UPDATE profiles SET is_suspended = true WHERE id = $1", [u.id]);
      const flow = await start();
      const { params } = await callback(flow, id);
      expect(params).toEqual({ error: "account_suspended" });
    });
  });

  describe("seguridad del flujo", () => {
    it("state: exige la cookie, que coincida, y es de un solo uso", async () => {
      const id = identity();
      const noCookie = await callback(await start(), id, {}, { cookie: null });
      expect(noCookie.params).toEqual({ error: "invalid_state" });
      expect(noCookie.loc.origin + noCookie.loc.pathname).toBe("http://localhost:8080/login/oauth"); // destino por defecto: el state no probó nada

      const wrong = await callback(await start(), id, {}, { cookie: "otro-valor-cualquiera" });
      expect(wrong.params).toEqual({ error: "invalid_state" });
      const forged = await callback(await start(), id, {}, { stateOverride: "inventado", cookie: "inventado" });
      expect(forged.params).toEqual({ error: "invalid_state" });

      const flow = await start();
      const back = idp.approve(flow.authorizeUrl, id);
      const first = await app.inject({ url: new URL(back).pathname + new URL(back).search, cookies: { oauth_state: flow.cookie } });
      expect(new URL(first.headers.location as string).searchParams.get("oauth_code")).toBeTruthy();
      const replay = await app.inject({ url: new URL(back).pathname + new URL(back).search, cookies: { oauth_state: flow.cookie } });
      expect(new URL(replay.headers.location as string).searchParams.get("error")).toBe("invalid_state");
    });

    it("state vencido", async () => {
      const flow = await start();
      await pool.query("UPDATE oauth_states SET expires_at = now() - interval '1 second'");
      expect((await callback(flow, identity())).params).toEqual({ error: "invalid_state" });
    });

    it("valida el id_token: nonce, audiencia, emisor, expiración y firma", async () => {
      const cases: [string, Overrides][] = [
        ["nonce ajeno", { nonce: "otro-nonce" }], ["audiencia ajena", { aud: "otro-cliente" }], ["emisor ajeno", { iss: "https://evil.example" }],
        ["vencido", { expired: true }], ["firmado con otra clave", { wrongKey: true }],
      ];
      for (const [why, o] of cases) {
        const { params } = await callback(await start(), identity(), o);
        expect(params, why).toEqual({ error: "invalid_id_token" });
      }
      expect((await callback(await start(), identity(), { noIdToken: true })).params).toEqual({ error: "token_exchange_failed" });
      expect((await callback(await start(), identity(), { tokenStatus: 500 })).params).toEqual({ error: "token_exchange_failed" });
    });

    it("el usuario que cancela en el proveedor vuelve con access_denied", async () => {
      const flow = await start();
      const res = await app.inject({ url: `/api/v1/auth/oauth/google/callback?error=access_denied&state=${flow.cookie}`, cookies: { oauth_state: flow.cookie } });
      expect(new URL(res.headers.location as string).searchParams.get("error")).toBe("access_denied");
    });

    it("el código de canje vale una vez, vence a los 60 s y no es adivinable", async () => {
      const flow = await start();
      const { params } = await callback(flow, identity());
      expect((await exchange(params.oauth_code!)).statusCode).toBe(200);
      const again = await exchange(params.oauth_code!);
      expect(again.statusCode).toBe(400);
      expect(json(again).error.code).toBe("INVALID_TOKEN");
      const { params: p2 } = await callback(await start(), identity());
      await pool.query("UPDATE oauth_login_codes SET expires_at = now() - interval '1 second'");
      expect((await exchange(p2.oauth_code!)).statusCode).toBe(400);
      expect((await exchange("x".repeat(43))).statusCode).toBe(400);
      expect((await pool.query("SELECT code_hash FROM oauth_login_codes LIMIT 1")).rows[0].code_hash).toMatch(/^[0-9a-f]{64}$/); // sólo hash
    });

    it("no expone tokens ni códigos de sesión en la URL de retorno", async () => {
      const { loc } = await callback(await start(), identity());
      expect(loc.toString()).not.toMatch(/access_token|refresh_token|id_token/);
    });
  });

  describe("con 2FA", () => {
    it("una cuenta con 2FA recibe el reto en lugar de la sesión", async () => {
      const id = identity();
      const first = json((await fullLogin(id)).res).data;
      const setup = json(await post("/auth/2fa/setup", {}, first.tokens.access_token)).data;
      await post("/auth/2fa/enable", { code: totp(base32Decode(setup.secret)) }, first.tokens.access_token);
      const second = await fullLogin(id);
      expect(json(second.res).data).toMatchObject({ two_factor_required: true });
      expect(json(second.res).data.tokens).toBeUndefined();
      await pool.query("UPDATE users SET totp_last_step = NULL WHERE id = $1", [first.user.id]);
      const verify = await post("/auth/2fa/verify", { challenge_token: json(second.res).data.challenge_token, code: totp(base32Decode(setup.secret)) });
      expect(verify.statusCode).toBe(200);
    });
  });

  describe("vincular y desvincular", () => {
    it("vincular exige sesión y asocia el proveedor a la cuenta actual (aunque el correo sea otro)", async () => {
      expect((await post("/auth/oauth/google/start", { mode: "link" })).statusCode).toBe(401);
      const email = `vinc${uniq()}@test.local`;
      const reg = json(await post("/auth/register", { email, password: PW, accept_terms: true })).data;
      const flow = await start({ mode: "link" }, reg.tokens.access_token);
      expect(flow.start.statusCode).toBe(200);
      const g = identity({ email: `otro${uniq()}@gmail.test` });
      const { params } = await callback(flow, g);
      expect(params).toEqual({ linked: "google" });
      const list = json(await app.inject({ url: "/api/v1/auth/identities", headers: bearer(reg.tokens.access_token) })).data;
      expect(list.password_set).toBe(true);
      expect(list.identities).toHaveLength(1);
      expect(list.identities[0]).toMatchObject({ provider: "google", email: g.email });
      // y ahora esa identidad inicia sesión en ESTA cuenta
      expect(json((await fullLogin(g)).res).data.user.id).toBe(reg.user.id);
    });

    it("una identidad ya usada por otra cuenta no se puede vincular; un segundo Google tampoco", async () => {
      const g = identity();
      await fullLogin(g); // pertenece a una cuenta nueva
      const email = `vinc${uniq()}@test.local`;
      const reg = json(await post("/auth/register", { email, password: PW, accept_terms: true })).data;
      const inUse = await callback(await start({ mode: "link" }, reg.tokens.access_token), g);
      expect(inUse.params).toEqual({ error: "identity_in_use" });
      const ok = await callback(await start({ mode: "link" }, reg.tokens.access_token), identity());
      expect(ok.params).toEqual({ linked: "google" });
      const twice = await callback(await start({ mode: "link" }, reg.tokens.access_token), identity());
      expect(twice.params).toEqual({ error: "provider_already_linked" });
    });

    it("desvincular: no si es el único método de acceso; sí cuando hay contraseña", async () => {
      const g = identity();
      const social = json((await fullLogin(g)).res).data;
      const at = social.tokens.access_token as string;
      const blocked = await app.inject({ method: "DELETE", url: "/api/v1/auth/identities/google", headers: bearer(at) });
      expect(blocked.statusCode).toBe(422);
      expect(json(blocked).error.message).toContain("único método");
      // crea contraseña por "olvidé mi contraseña" y ya se puede desvincular
      await post("/auth/forgot-password", { email: g.email });
      await app.mailer.drain();
      const token = decodeURIComponent(app.mailer.last(g.email!, "auth.reset_password")!.text.match(/token=([\w%-]+)/)![1]!);
      expect((await post("/auth/reset-password", { token, password: "Nueva-Clave-Segura-77!" })).statusCode).toBe(204);
      const relog = json(await post("/auth/login", { email: g.email, password: "Nueva-Clave-Segura-77!" })).data.tokens.access_token as string;
      expect((await app.inject({ method: "DELETE", url: "/api/v1/auth/identities/google", headers: bearer(relog) })).statusCode).toBe(204);
      expect(json(await app.inject({ url: "/api/v1/auth/identities", headers: bearer(relog) })).data.identities).toEqual([]);
      expect((await app.inject({ method: "DELETE", url: "/api/v1/auth/identities/google", headers: bearer(relog) })).statusCode).toBe(404);
    });

    it("las rutas de identidades exigen sesión", async () => {
      expect((await app.inject({ url: "/api/v1/auth/identities" })).statusCode).toBe(401);
      expect((await app.inject({ method: "DELETE", url: "/api/v1/auth/identities/google" })).statusCode).toBe(401);
    });
  });

  it("si el proveedor no responde, /start devuelve 502 sin filtrar detalles", async () => {
    const broken = await makeApp({ OAUTH_GOOGLE_CLIENT_ID: "x", OAUTH_GOOGLE_CLIENT_SECRET: "y", OAUTH_GOOGLE_ISSUER: "http://127.0.0.1:1" });
    const res = await broken.inject({ method: "POST", url: "/api/v1/auth/oauth/google/start", payload: {} });
    expect(res.statusCode).toBe(502);
    expect(json(res).error.code).toBe("UPSTREAM_ERROR");
    expect(res.body).not.toContain("127.0.0.1");
    await broken.close();
  });
});
