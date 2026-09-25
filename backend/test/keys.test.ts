import { generateKeyPairSync } from "node:crypto";
import { decodeProtectedHeader, importPKCS8, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { buildApp } from "../src/app.js";
import { generateSigningKeys, type SigningKeyPair } from "../src/modules/auth/tokens.js";
import { json, testEnv } from "./helpers.js";

const oneLine = (pem: string) => pem.trim().replace(/\r?\n/g, "\\n"); // formato de variable de entorno
const withKeys = (k: SigningKeyPair, previous: SigningKeyPair[] = []) => ({
  JWT_PRIVATE_KEY: oneLine(k.privateKeyPem), JWT_PUBLIC_KEY: oneLine(k.publicKeyPem),
  ...(previous.length ? { JWT_PREVIOUS_PUBLIC_KEYS: JSON.stringify(previous.map((p) => p.publicKeyPem)) } : {}),
});
let n = 0;
const register = async (app: Awaited<ReturnType<typeof buildApp>>) =>
  json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email: `keys${Date.now()}${n++}@test.local`, password: "Correcta-Clave-2026!", accept_terms: true } })).data.tokens.access_token as string;
const me = async (app: Awaited<ReturnType<typeof buildApp>>, token: string) => (await app.inject({ url: "/api/v1/auth/me", headers: { authorization: `Bearer ${token}` } })).statusCode;

describe("claves JWT y rotación", () => {
  it("genera un par RSA utilizable, con huella (kid) estable", async () => {
    const k = await generateSigningKeys(2048);
    expect(k.privateKeyPem).toContain("BEGIN PRIVATE KEY");
    expect(k.publicKeyPem).toContain("BEGIN PUBLIC KEY");
    expect(k.kid).toMatch(/^[\w-]{43}$/);
  });

  it("firma con las claves configuradas (formato de variable de entorno con \\n) y pone el kid en el token", async () => {
    const k = await generateSigningKeys(2048);
    const app = await buildApp({ env: testEnv(withKeys(k) as never) });
    await app.ready();
    const token = await register(app);
    expect(decodeProtectedHeader(token)).toMatchObject({ alg: "RS256", kid: k.kid });
    expect(await me(app, token)).toBe(200);
    await app.close();
  });

  it("JWKS público: sólo claves públicas, con kid, alg y uso de firma", async () => {
    const [k1, k2] = [await generateSigningKeys(2048), await generateSigningKeys(2048)] as [SigningKeyPair, SigningKeyPair];
    const app = await buildApp({ env: testEnv(withKeys(k2, [k1]) as never) });
    await app.ready();
    const res = await app.inject({ url: "/.well-known/jwks.json" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toContain("max-age=3600");
    const { keys } = json(res);
    expect(keys.map((x: { kid: string }) => x.kid)).toEqual([k2.kid, k1.kid]);
    for (const key of keys) {
      expect(key).toMatchObject({ kty: "RSA", alg: "RS256", use: "sig" });
      for (const secret of ["d", "p", "q", "dp", "dq", "qi"]) expect(key, secret).not.toHaveProperty(secret);
    }
    await app.close();
  });

  it("rotación sin cortar sesiones: los tokens de la clave anterior siguen válidos mientras se conserve su pública", async () => {
    const [k1, k2] = [await generateSigningKeys(2048), await generateSigningKeys(2048)] as [SigningKeyPair, SigningKeyPair];
    const before = await buildApp({ env: testEnv(withKeys(k1) as never) });
    await before.ready();
    const oldToken = await register(before);

    const after = await buildApp({ env: testEnv(withKeys(k2, [k1]) as never) }); // nueva clave actual + anterior
    await after.ready();
    expect(await me(after, oldToken)).toBe(200);
    const newToken = await register(after);
    expect(decodeProtectedHeader(newToken).kid).toBe(k2.kid);
    expect(await me(before, newToken)).toBe(401); // la instancia vieja no conoce la clave nueva

    const retired = await buildApp({ env: testEnv(withKeys(k2) as never) }); // anterior retirada
    await retired.ready();
    expect(await me(retired, oldToken)).toBe(401);
    expect(await me(retired, newToken)).toBe(200);
    await Promise.all([before.close(), after.close(), retired.close()]);
  });

  it("falla al arrancar si la clave privada y la pública no son un par", async () => {
    const [a, b] = [await generateSigningKeys(2048), await generateSigningKeys(2048)] as [SigningKeyPair, SigningKeyPair];
    await expect(buildApp({ env: testEnv({ JWT_PRIVATE_KEY: oneLine(a.privateKeyPem), JWT_PUBLIC_KEY: oneLine(b.publicKeyPem) } as never) })).rejects.toThrow(/no son un par/);
  });

  it("rechaza claves RSA débiles", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 1024 }); // jose se niega a generarlas; se crea con node:crypto
    const weak: SigningKeyPair = { privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(), publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(), kid: "debil" };
    await expect(buildApp({ env: testEnv(withKeys(weak) as never) })).rejects.toThrow(/al menos 2048 bits/);
  });

  it("valida la configuración: producción exige claves y las anteriores deben ser un arreglo JSON", () => {
    const prod = { NODE_ENV: "production", DATABASE_URL: "postgres://x:y@localhost:5432/z" } as NodeJS.ProcessEnv;
    expect(() => loadEnv(prod)).toThrow(/JWT_PRIVATE_KEY y JWT_PUBLIC_KEY son obligatorias/);
    expect(() => loadEnv({ ...prod, JWT_PRIVATE_KEY: "a", JWT_PUBLIC_KEY: "b", JWT_PREVIOUS_PUBLIC_KEYS: "no-es-json" })).toThrow(/arreglo JSON/);
    expect(loadEnv({ NODE_ENV: "test" } as NodeJS.ProcessEnv).JWT_PREVIOUS_PUBLIC_KEYS).toEqual([]);
  });

  it("rechaza tokens forjados: alg none, HS256 firmado con la clave pública y kid desconocido", async () => {
    const k = await generateSigningKeys(2048);
    const app = await buildApp({ env: testEnv(withKeys(k) as never) });
    await app.ready();
    const good = await register(app);
    const [, payload] = good.split(".") as [string, string];
    const none = `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${payload}.`;
    const hs = await new SignJWT({ roles: ["admin"], sid: "x" }).setProtectedHeader({ alg: "HS256", kid: k.kid }).setSubject("a0000000-0000-4000-8000-000000000001")
      .setIssuer("descubre-rd").setAudience("descubre-rd-api").setExpirationTime("5m").sign(new TextEncoder().encode(k.publicKeyPem));
    const other = await generateSigningKeys(2048);
    const foreign = await new SignJWT({ roles: ["admin"], sid: "x" }).setProtectedHeader({ alg: "RS256", kid: other.kid })
      .setSubject("a0000000-0000-4000-8000-000000000001").setIssuer("descubre-rd").setAudience("descubre-rd-api").setExpirationTime("5m")
      .sign(await importPKCS8(other.privateKeyPem, "RS256"));
    for (const t of [none, hs, foreign]) expect(await me(app, t)).toBe(401);
    expect(await me(app, good)).toBe(200);
    await app.close();
  });
});
