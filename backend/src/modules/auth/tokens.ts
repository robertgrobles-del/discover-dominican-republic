import { createHash, randomBytes } from "node:crypto";
import {
  SignJWT, calculateJwkThumbprint, createLocalJWKSet, errors as joseErrors, exportJWK, exportPKCS8, exportSPKI, generateKeyPair,
  importPKCS8, importSPKI, jwtVerify, type CryptoKey, type JWK,
} from "jose";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export interface AccessClaims { sub: string; roles: string[]; locale: string; sid: string; mfa: boolean; /** Admin que abrió una sesión de soporte (sólo lectura) en esta cuenta. */ imp?: string }

const ALG = "RS256";
const ISSUER = "descubre-rd";
const AUDIENCE = "descubre-rd-api";
const MIN_MODULUS_BITS = 2048;
const pem = (v: string) => v.trim().replace(/\\n/g, "\n");

export interface SigningKeyPair { privateKeyPem: string; publicKeyPem: string; kid: string }

/** Par RS256 nuevo (para `npm run keys:generate`). El `kid` es la huella SHA-256 de la clave pública (RFC 7638). */
export async function generateSigningKeys(modulusLength = 3072): Promise<SigningKeyPair> {
  const { privateKey, publicKey } = await generateKeyPair(ALG, { modulusLength, extractable: true });
  return { privateKeyPem: await exportPKCS8(privateKey), publicKeyPem: await exportSPKI(publicKey), kid: await calculateJwkThumbprint(await exportJWK(publicKey)) };
}

async function publicJwk(publicKeyPem: string): Promise<JWK & { kid: string }> {
  const key = await importSPKI(publicKeyPem, ALG, { extractable: true });
  const jwk = await exportJWK(key);
  const bits = jwk.n ? Buffer.from(jwk.n, "base64url").length * 8 : 0;
  if (bits < MIN_MODULUS_BITS) throw new Error(`Configuración inválida: la clave JWT debe ser RSA de al menos ${MIN_MODULUS_BITS} bits (tiene ${bits})`);
  return { ...jwk, kid: await calculateJwkThumbprint(jwk), alg: ALG, use: "sig" };
}

/**
 * JWT de acceso (RS256, corto) y utilidades para tokens opacos (refresco, verificación, restablecimiento).
 * Rotación de claves: la clave actual firma; las claves públicas anteriores (`JWT_PREVIOUS_PUBLIC_KEYS`) siguen
 * validando los tokens ya emitidos hasta que vencen. Cada token lleva el `kid` de la clave que lo firmó.
 */
export async function createTokenService(env: Env, log: FastifyBaseLogger) {
  let privateKey: CryptoKey;
  let currentPublicPem: string;
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    privateKey = await importPKCS8(pem(env.JWT_PRIVATE_KEY), ALG);
    currentPublicPem = pem(env.JWT_PUBLIC_KEY);
  } else {
    // Desarrollo/pruebas: par efímero (los tokens dejan de valer al reiniciar). En producción loadEnv exige las claves.
    const g = await generateKeyPair(ALG, { modulusLength: 2048, extractable: true });
    privateKey = g.privateKey;
    currentPublicPem = await exportSPKI(g.publicKey);
    if (env.NODE_ENV !== "test") log.warn("JWT_PRIVATE_KEY/JWT_PUBLIC_KEY no configuradas: se generó un par efímero (los tokens se invalidan al reiniciar)");
  }
  const current = await publicJwk(currentPublicPem);

  // Comprobación al arrancar: la clave privada debe corresponder a la pública configurada.
  const probe = await new SignJWT({}).setProtectedHeader({ alg: ALG, kid: current.kid }).setExpirationTime("1m").sign(privateKey);
  try { await jwtVerify(probe, createLocalJWKSet({ keys: [current] })); }
  catch { throw new Error("Configuración inválida: JWT_PRIVATE_KEY y JWT_PUBLIC_KEY no son un par"); }

  const previous: (JWK & { kid: string })[] = [];
  for (const p of env.JWT_PREVIOUS_PUBLIC_KEYS) previous.push(await publicJwk(pem(p)));
  const keys = [current, ...previous.filter((k) => k.kid !== current.kid)];
  const jwks = createLocalJWKSet({ keys });

  return {
    kid: current.kid,
    accessTtl: env.JWT_ACCESS_TTL_SECONDS,
    /** Claves públicas (actual + anteriores) en formato JWKS, para que otros servicios verifiquen los tokens. */
    publicJwks: () => ({ keys }),

    async signAccess(claims: AccessClaims, ttlSeconds = env.JWT_ACCESS_TTL_SECONDS) {
      return new SignJWT({ roles: claims.roles, locale: claims.locale, sid: claims.sid, mfa: claims.mfa, ...(claims.imp ? { imp: claims.imp } : {}) })
        .setProtectedHeader({ alg: ALG, typ: "JWT", kid: current.kid })
        .setSubject(claims.sub)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .setJti(randomBytes(8).toString("hex"))
        .sign(privateKey);
    },

    /** Token efímero de un paso intermedio (p. ej. reto de 2FA): no sirve como acceso. */
    async signPurpose(purpose: string, sub: string, ttlSeconds: number, extra: Record<string, unknown> = {}) {
      return new SignJWT({ purpose, ...extra })
        .setProtectedHeader({ alg: ALG, typ: "JWT", kid: current.kid })
        .setSubject(sub).setIssuer(ISSUER).setAudience(`${AUDIENCE}:${purpose}`).setIssuedAt().setExpirationTime(`${ttlSeconds}s`).setJti(randomBytes(8).toString("hex"))
        .sign(privateKey);
    },
    async verifyPurpose(purpose: string, token: string): Promise<{ sub: string; claims: Record<string, unknown> }> {
      try {
        const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience: `${AUDIENCE}:${purpose}`, algorithms: [ALG] });
        if (!payload.sub || payload.purpose !== purpose) throw new Error("propósito");
        return { sub: payload.sub, claims: payload };
      } catch (e) {
        if (e instanceof joseErrors.JWTExpired) throw new AppError("TOKEN_EXPIRED", "El paso de verificación expiró; inicia sesión de nuevo");
        throw new AppError("INVALID_TOKEN", "Token de verificación inválido");
      }
    },

    async verifyAccess(token: string): Promise<AccessClaims> {
      try {
        const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience: AUDIENCE, algorithms: [ALG] });
        if (!payload.sub || typeof payload.sid !== "string") throw new AppError("UNAUTHENTICATED", "Token inválido");
        return { sub: payload.sub, roles: (payload.roles as string[]) ?? [], locale: (payload.locale as string) ?? "es", sid: payload.sid, mfa: payload.mfa === true, ...(typeof payload.imp === "string" ? { imp: payload.imp } : {}) };
      } catch (e) {
        if (e instanceof AppError) throw e;
        if (e instanceof joseErrors.JWTExpired) throw new AppError("TOKEN_EXPIRED", "La sesión expiró");
        throw new AppError("UNAUTHENTICATED", "Token inválido");
      }
    },
  };
}
export type TokenService = Awaited<ReturnType<typeof createTokenService>>;

/** Token opaco de alta entropía; sólo su hash SHA-256 se guarda en la base de datos. */
export const newOpaqueToken = () => randomBytes(32).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
