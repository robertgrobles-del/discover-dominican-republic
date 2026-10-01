import { createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { AppError } from "../../lib/errors.js";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value as object).filter((key) => (value as Record<string, unknown>)[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
}
const bodyHash = (body: unknown) => createHash("sha256").update(canonical(body ?? null)).digest("hex");
const keyBytes = (secret: string) => new TextEncoder().encode(secret);

export async function signWeatherInternalRequest(secret: string, actor: string, method: string, path: string, body: unknown) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ method: method.toUpperCase(), path, body_hash: bodyHash(body) })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuer("descubre-rd-api").setAudience("weather-service")
    .setSubject(actor).setIssuedAt(now).setExpirationTime(now + 30).setJti(randomUUID()).sign(keyBytes(secret));
}

export async function verifyWeatherInternalRequest(secret: string, token: string, method: string, path: string, body: unknown) {
  try {
    const { payload } = await jwtVerify(token, keyBytes(secret), { algorithms: ["HS256"], issuer: "descubre-rd-api", audience: "weather-service", maxTokenAge: "30s" });
    if (!payload.sub || !payload.jti || payload.method !== method.toUpperCase() || payload.path !== path || payload.body_hash !== bodyHash(body)) throw new Error("request binding mismatch");
    return { actor: payload.sub, jti: payload.jti, expiresAt: new Date(Number(payload.exp) * 1000) };
  } catch { throw new AppError("UNAUTHENTICATED", "Solicitud interna no autorizada"); }
}
