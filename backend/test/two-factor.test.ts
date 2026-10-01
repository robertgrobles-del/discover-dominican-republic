import type { FastifyInstance } from "fastify";
import { decodeJwt } from "jose";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import {
  base32Decode, base32Encode, createSecretBox, generateRecoveryCodes, hashRecovery, hotp, otpauthUri, totp, totpStep, verifyTotp,
} from "../src/modules/auth/totp.js";
import { json, makeApp, testEnv } from "./helpers.js";

describe("TOTP: primitivas (RFC 6238)", () => {
  const secret = Buffer.from("12345678901234567890"); // secreto de los vectores de prueba del RFC

  it("coincide con los vectores oficiales (últimos 6 dígitos)", () => {
    const vectors: [number, string][] = [[59, "287082"], [1111111109, "081804"], [1111111111, "050471"], [1234567890, "005924"], [2000000000, "279037"]];
    for (const [t, code] of vectors) expect(totp(secret, t * 1000), `t=${t}`).toBe(code);
    expect(hotp(secret, 0)).toBe("755224"); // vector de HOTP (RFC 4226)
  });

  it("acepta ±1 paso de desfase de reloj y rechaza más", () => {
    const now = 1_700_000_000_000;
    const step = totpStep(now);
    for (const d of [-1, 0, 1]) expect(verifyTotp(secret, hotp(secret, step + d), now)).toBe(step + d);
    for (const d of [-2, 2, 10]) expect(verifyTotp(secret, hotp(secret, step + d), now)).toBeNull();
    for (const bad of ["", "12345", "1234567", "abcdef", "12 3456"]) expect(verifyTotp(secret, bad, now)).toBeNull();
  });

  it("base32 va y vuelve, y la URI otpauth lleva emisor y cuenta", () => {
    const s = Buffer.from("secreto de prueba!");
    expect(base32Decode(base32Encode(s)).equals(s)).toBe(true);
    expect(base32Encode(Buffer.from("foobar"))).toBe("MZXW6YTBOI"); // vector RFC 4648
    expect(() => base32Decode("1!")).toThrow();
    const uri = otpauthUri({ secret, account: "ana@test.local", issuer: "Descubre RD" });
    expect(uri).toMatch(/^otpauth:\/\/totp\/Descubre%20RD%3Aana%40test\.local\?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&issuer=Descubre%20RD&algorithm=SHA1&digits=6&period=30$/);
  });

  it("el secreto se cifra con AES-GCM: ida y vuelta, aleatorio y a prueba de manipulación", () => {
    const box = createSecretBox(Buffer.alloc(32, 7));
    const enc1 = box.encrypt(secret), enc2 = box.encrypt(secret);
    expect(enc1).not.toBe(enc2); // IV distinto cada vez
    expect(enc1.startsWith("v1.")).toBe(true);
    expect(box.decrypt(enc1).equals(secret)).toBe(true);
    const parts = enc1.split(".");
    parts[3] = Buffer.from("manipulado").toString("base64url");
    expect(() => box.decrypt(parts.join("."))).toThrow();
    expect(() => createSecretBox(Buffer.alloc(16))).toThrow(/32 bytes/);
    expect(() => createSecretBox(Buffer.alloc(32, 8)).decrypt(enc1)).toThrow(); // otra clave
  });

  it("los códigos de recuperación son únicos, legibles y se guardan como hash", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    for (const c of codes) expect(c).toMatch(/^[a-z2-9]{5}-[a-z2-9]{5}$/);
    expect(hashRecovery(codes[0]!.toUpperCase())).toBe(hashRecovery(codes[0]!.replace("-", " "))); // se normaliza al canjear
    expect(hashRecovery(codes[0]!)).not.toContain(codes[0]!.replace("-", ""));
  });
});

describe("verificación en dos pasos (integración)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp({ LOGIN_MAX_FAILURES: "3" }); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  const PW = "Correcta-Clave-2026!";
  let n = 0;
  const post = (url: string, payload: unknown, token?: string, a: FastifyInstance = app) =>
    a.inject({ method: "POST", url: `/api/v1${url}`, payload: payload as object, headers: token ? { authorization: `Bearer ${token}` } : {} });
  const register = async (a: FastifyInstance = app) => {
    const email = `dosfa${Date.now()}${n++}@test.local`;
    const body = json(await post("/auth/register", { email, password: PW, accept_terms: true }, undefined, a));
    return { email, id: body.data.user.id as string, token: body.data.tokens.access_token as string, refresh: body.data.tokens.refresh_token as string };
  };
  /** Código válido "ahora"; borra el último paso usado para poder pedir varios códigos seguidos en una prueba. */
  const code = async (secret: string, id: string, offsetSteps = 0) => {
    await pool.query("UPDATE users SET totp_last_step = NULL WHERE id = $1", [id]);
    return totp(base32Decode(secret), Date.now() + offsetSteps * 30_000);
  };
  const enable = async (u: { id: string; token: string }, a: FastifyInstance = app) => {
    const setup = json(await post("/auth/2fa/setup", {}, u.token, a)).data;
    const res = await post("/auth/2fa/enable", { code: await code(setup.secret, u.id) }, u.token, a);
    return { setup, res, body: json(res) };
  };
  const login = (email: string, a: FastifyInstance = app) => post("/auth/login", { email, password: PW }, undefined, a);

  it("setup → enable: activa el 2FA, guarda el secreto cifrado y entrega 10 códigos de recuperación una sola vez", async () => {
    const u = await register();
    const { setup, res, body } = await enable(u);
    expect(setup.otpauth_uri).toContain(`secret=${setup.secret}`);
    expect(setup.account).toBe(u.email);
    expect(res.statusCode).toBe(200);
    expect(body.data.recovery_codes).toHaveLength(10);
    const row = (await pool.query("SELECT totp_secret_enc, totp_enabled_at, totp_recovery_hashes FROM users WHERE id = $1", [u.id])).rows[0];
    expect(row.totp_enabled_at).not.toBeNull();
    expect(row.totp_secret_enc).toMatch(/^v1\./);
    expect(row.totp_secret_enc).not.toContain(setup.secret);
    expect(row.totp_recovery_hashes).toHaveLength(10);
    expect(row.totp_recovery_hashes).not.toContain(body.data.recovery_codes[0]);
    expect(decodeJwt(body.data.access_token).mfa).toBe(true); // la sesión actual ya cuenta como verificada
    expect((await post("/auth/2fa/setup", {}, u.token)).statusCode).toBe(409); // ya activo
    const me = json(await app.inject({ url: "/api/v1/auth/me", headers: { authorization: `Bearer ${body.data.access_token}` } })).data;
    expect(me.two_factor).toEqual({ enabled: true, recovery_codes_left: 10, required: false });
  });

  it("enable exige el paso previo y un código correcto", async () => {
    const u = await register();
    expect((await post("/auth/2fa/enable", { code: "123456" }, u.token)).statusCode).toBe(422); // sin setup
    const setup = json(await post("/auth/2fa/setup", {}, u.token)).data;
    const wrong = await post("/auth/2fa/enable", { code: "000000" }, u.token);
    expect(wrong.statusCode).toBe(401);
    expect((await post("/auth/2fa/enable", { code: "abc" }, u.token)).statusCode).toBe(400);
    expect((await post("/auth/2fa/enable", { code: await code(setup.secret, u.id) })).statusCode).toBe(401); // sin token
    expect((await pool.query("SELECT totp_enabled_at FROM users WHERE id = $1", [u.id])).rows[0].totp_enabled_at).toBeNull();
    // pedir setup de nuevo reemplaza el secreto pendiente
    const again = json(await post("/auth/2fa/setup", {}, u.token)).data;
    expect(again.secret).not.toBe(setup.secret);
  });

  it("con 2FA, el login sólo entrega un reto; el código lo canjea por la sesión (mfa = true)", async () => {
    const u = await register();
    const { setup } = await enable(u);
    const res = await login(u.email);
    expect(res.statusCode).toBe(200);
    const body = json(res);
    expect(body.data).toMatchObject({ two_factor_required: true });
    expect(body.data.tokens).toBeUndefined();
    expect(body.data.user).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("refresh_token");

    const verify = await post("/auth/2fa/verify", { challenge_token: body.data.challenge_token, code: await code(setup.secret, u.id) });
    expect(verify.statusCode).toBe(200);
    const v = json(verify).data;
    expect(v).toMatchObject({ used_recovery_code: false, user: { email: u.email } });
    expect(decodeJwt(v.tokens.access_token).mfa).toBe(true);
    // el refresco conserva el segundo factor
    const refreshed = json(await post("/auth/refresh", { refresh_token: v.tokens.refresh_token })).data.tokens;
    expect(decodeJwt(refreshed.access_token).mfa).toBe(true);
    // un login sin 2FA no tiene mfa
    const plain = await register();
    expect(decodeJwt(json(await login(plain.email)).data.tokens.access_token).mfa).toBe(false);
  });

  it("un código TOTP no sirve dos veces (protección contra repetición)", async () => {
    const u = await register();
    const { setup } = await enable(u);
    const c1 = json(await login(u.email)).data.challenge_token as string;
    const good = await code(setup.secret, u.id);
    expect((await post("/auth/2fa/verify", { challenge_token: c1, code: good })).statusCode).toBe(200);
    const c2 = json(await login(u.email)).data.challenge_token as string;
    expect((await post("/auth/2fa/verify", { challenge_token: c2, code: good })).statusCode).toBe(401); // mismo código
    const next = totp(base32Decode(setup.secret), Date.now() + 30_000); // paso siguiente
    expect((await post("/auth/2fa/verify", { challenge_token: c2, code: next })).statusCode).toBe(200);
  });

  it("los fallos suman al bloqueo de la cuenta; acertar antes de bloquear reinicia el contador", async () => {
    const u = await register();
    const { setup } = await enable(u);
    const c = json(await login(u.email)).data.challenge_token as string;
    for (let i = 0; i < 3; i++) expect((await post("/auth/2fa/verify", { challenge_token: c, code: "000000" })).statusCode).toBe(401);
    const locked = await post("/auth/2fa/verify", { challenge_token: c, code: await code(setup.secret, u.id) });
    expect(locked.statusCode).toBe(429); // ni con el código correcto mientras dure el bloqueo
    expect(json(locked).error.details.retry_after_seconds).toBeGreaterThan(0);
    expect((await login(u.email)).statusCode).toBe(429);
    await pool.query("UPDATE users SET locked_until = NULL WHERE id = $1", [u.id]);
    const c2 = json(await login(u.email)).data.challenge_token as string;
    expect((await post("/auth/2fa/verify", { challenge_token: c2, code: await code(setup.secret, u.id) })).statusCode).toBe(200);
    expect((await pool.query("SELECT failed_login_count FROM users WHERE id = $1", [u.id])).rows[0].failed_login_count).toBe(0);
  });

  it("el código de recuperación entra una sola vez y se descuenta", async () => {
    const u = await register();
    const { body } = await enable(u);
    const [first, second] = body.data.recovery_codes as string[];
    const c1 = json(await login(u.email)).data.challenge_token as string;
    const ok = await post("/auth/2fa/verify", { challenge_token: c1, recovery_code: first!.toUpperCase() });
    expect(ok.statusCode).toBe(200);
    expect(json(ok).data.used_recovery_code).toBe(true);
    const me = json(await app.inject({ url: "/api/v1/auth/me", headers: { authorization: `Bearer ${json(ok).data.tokens.access_token}` } })).data;
    expect(me.two_factor.recovery_codes_left).toBe(9);
    const c2 = json(await login(u.email)).data.challenge_token as string;
    expect((await post("/auth/2fa/verify", { challenge_token: c2, recovery_code: first })).statusCode).toBe(401); // ya usado
    expect((await post("/auth/2fa/verify", { challenge_token: c2, recovery_code: second })).statusCode).toBe(200);
  });

  it("valida el reto: basura, vencido, y un token de acceso no sirve (ni al revés)", async () => {
    const u = await register();
    const { setup } = await enable(u);
    const c = await code(setup.secret, u.id);
    expect((await post("/auth/2fa/verify", { challenge_token: "x".repeat(40), code: c })).statusCode).toBe(400);
    expect(json(await post("/auth/2fa/verify", { challenge_token: u.token, code: c })).error.code).toBe("INVALID_TOKEN"); // acceso ≠ reto
    const short = await app.tokens.signPurpose("mfa", u.id, 1);
    await new Promise((r) => setTimeout(r, 1500));
    const expired = await post("/auth/2fa/verify", { challenge_token: short, code: c });
    expect(json(expired).error.code).toBe("TOKEN_EXPIRED");
    const challenge = json(await login(u.email)).data.challenge_token as string;
    const asBearer = await app.inject({ url: "/api/v1/auth/me", headers: { authorization: `Bearer ${challenge}` } });
    expect(asBearer.statusCode).toBe(401); // un reto no abre sesión
    expect((await post("/auth/2fa/verify", { challenge_token: challenge })).statusCode).toBe(400); // falta el código
    expect((await post("/auth/2fa/verify", { challenge_token: challenge, code: c, recovery_code: "aaaaa-bbbbb" })).statusCode).toBe(400); // ambos
  });

  it("un reto no permite entrar a una cuenta sin 2FA ni a una suspendida", async () => {
    const plain = await register();
    const forged = await app.tokens.signPurpose("mfa", plain.id, 60);
    expect(json(await post("/auth/2fa/verify", { challenge_token: forged, code: "123456" })).error.code).toBe("INVALID_TOKEN");
    const u = await register();
    const { setup } = await enable(u);
    const c = json(await login(u.email)).data.challenge_token as string;
    await pool.query("UPDATE profiles SET is_suspended = true WHERE id = $1", [u.id]);
    expect(json(await post("/auth/2fa/verify", { challenge_token: c, code: await code(setup.secret, u.id) })).error.code).toBe("ACCOUNT_SUSPENDED");
  });

  it("desactivar exige contraseña y código, cierra las demás sesiones y borra los secretos", async () => {
    const u = await register();
    const { setup, body } = await enable(u);
    const other = json(await post("/auth/2fa/verify", { challenge_token: json(await login(u.email)).data.challenge_token, code: await code(setup.secret, u.id, 1) })).data.tokens;
    const at = body.data.access_token as string;
    expect((await post("/auth/2fa/disable", { password: "mal", code: await code(setup.secret, u.id) }, at)).statusCode).toBe(403);
    expect((await post("/auth/2fa/disable", { password: PW, code: "000000" }, at)).statusCode).toBe(401);
    expect((await post("/auth/2fa/disable", { password: PW, code: await code(setup.secret, u.id) }, at)).statusCode).toBe(204);
    const row = (await pool.query("SELECT totp_secret_enc, totp_enabled_at, totp_recovery_hashes FROM users WHERE id = $1", [u.id])).rows[0];
    expect(row).toMatchObject({ totp_secret_enc: null, totp_enabled_at: null, totp_recovery_hashes: [] });
    expect((await post("/auth/refresh", { refresh_token: other.refresh_token })).statusCode).toBe(401); // sesión ajena cerrada
    expect(json(await login(u.email)).data.tokens.access_token).toBeTruthy(); // vuelve el login directo
    expect((await post("/auth/2fa/disable", { password: PW, code: "123456" }, at)).statusCode).toBe(422); // ya no está activo
  });

  it("regenerar códigos de recuperación invalida los anteriores", async () => {
    const u = await register();
    const { setup, body } = await enable(u);
    const old = body.data.recovery_codes as string[];
    const fresh = await post("/auth/2fa/recovery-codes", { code: await code(setup.secret, u.id) }, body.data.access_token);
    expect(fresh.statusCode).toBe(200);
    const codes = json(fresh).data.recovery_codes as string[];
    expect(codes).toHaveLength(10);
    expect(codes.some((c) => old.includes(c))).toBe(false);
    const c = json(await login(u.email)).data.challenge_token as string;
    expect((await post("/auth/2fa/verify", { challenge_token: c, recovery_code: old[0] })).statusCode).toBe(401);
    expect((await post("/auth/2fa/verify", { challenge_token: c, recovery_code: codes[0] })).statusCode).toBe(200);
  });

  it("nunca devuelve el secreto ni los hashes salvo en el setup", async () => {
    const u = await register();
    const { setup, body } = await enable(u);
    const me = await app.inject({ url: "/api/v1/auth/me", headers: { authorization: `Bearer ${body.data.access_token}` } });
    const sessions = await app.inject({ url: "/api/v1/auth/sessions", headers: { authorization: `Bearer ${body.data.access_token}` } });
    for (const text of [me.body, sessions.body, (await login(u.email)).body]) {
      expect(text).not.toContain(setup.secret);
      expect(text).not.toMatch(/totp_secret|recovery_hashes|v1\./);
    }
  });

  describe("política para el personal (REQUIRE_2FA_FOR_STAFF)", () => {
    let strict: FastifyInstance;
    beforeAll(async () => {
      strict = await buildApp({ env: testEnv({ REQUIRE_2FA_FOR_STAFF: "true", LOGIN_MAX_FAILURES: "3" } as never) });
      strict.get("/api/v1/_staff", { preHandler: strict.requireRole("admin", "editor") }, async () => ({ ok: true }));
      strict.get("/api/v1/_partner", { preHandler: strict.requireRole("partner") }, async () => ({ ok: true }));
      await strict.ready();
    });
    afterAll(async () => { await strict.close(); });

    const asRole = async (role: string) => {
      const u = await register(strict);
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [u.id, role]);
      const relogin = json(await login(u.email, strict)).data.tokens.access_token as string; // el rol viaja en el token: se vuelve a entrar
      return { ...u, token: relogin };
    };
    const get = (url: string, token: string) => strict.inject({ url: `/api/v1${url}`, headers: { authorization: `Bearer ${token}` } });

    it("un administrador sin 2FA recibe MFA_REQUIRED con instrucciones; con 2FA verificado entra", async () => {
      const admin = await asRole("admin");
      const denied = await get("/_staff", admin.token);
      expect(denied.statusCode).toBe(403);
      expect(json(denied).error).toMatchObject({ code: "MFA_REQUIRED", details: { setup: "/api/v1/auth/2fa/setup" } });
      const me = json(await get("/auth/me", admin.token)).data;
      expect(me.two_factor).toMatchObject({ enabled: false, required: true });

      const { body } = await enable(admin, strict);
      expect((await get("/_staff", body.data.access_token)).statusCode).toBe(200); // la sesión subió a mfa
      // otra sesión (sólo contraseña) sigue sin acceso hasta completar el reto
      const challenge = json(await login(admin.email, strict)).data;
      expect(challenge.two_factor_required).toBe(true);
    });

    it("no se puede desactivar el 2FA con un rol de personal", async () => {
      const editor = await asRole("editor");
      const { setup, body } = await enable(editor, strict);
      const res = await post("/auth/2fa/disable", { password: PW, code: await code(setup.secret, editor.id) }, body.data.access_token, strict);
      expect(res.statusCode).toBe(403);
      expect(json(res).error.message).toContain("exige");
    });

    it("no afecta a rutas de otros roles ni a usuarios comunes", async () => {
      const partner = await asRole("partner");
      expect((await get("/_partner", partner.token)).statusCode).toBe(200);
      const plain = await register(strict);
      expect((await get("/_staff", plain.token)).statusCode).toBe(403); // sin rol: 403 FORBIDDEN, no MFA_REQUIRED
      expect(json(await get("/_staff", plain.token)).error.code).toBe("FORBIDDEN");
    });
  });

  it("configuración: la clave de cifrado debe ser de 32 bytes y es obligatoria en producción", () => {
    expect(() => loadEnv({ NODE_ENV: "test", TOTP_ENCRYPTION_KEY: Buffer.alloc(16).toString("base64") } as NodeJS.ProcessEnv)).toThrow(/32 bytes/);
    const prod = { NODE_ENV: "production", JWT_PRIVATE_KEY: "a", JWT_PUBLIC_KEY: "b", APP_SECRET: "s".repeat(40), CORS_ORIGINS: "https://portal.example.com", DATABASE_URL: "postgres://app:clave-real@db.example.com:5432/rd", MAIL_TRANSPORT: "smtp" } as NodeJS.ProcessEnv;
    expect(() => loadEnv(prod)).toThrow(/TOTP_ENCRYPTION_KEY es obligatoria/);
    const ok = loadEnv({ ...prod, TOTP_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64") });
    expect(ok.REQUIRE_2FA_FOR_STAFF).toBe(true); // por defecto en producción
    expect(loadEnv({ NODE_ENV: "development" } as NodeJS.ProcessEnv).REQUIRE_2FA_FOR_STAFF).toBe(false);
  });
});
