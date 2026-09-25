import { createHash, randomBytes } from "node:crypto";
import { SignJWT, exportSPKI, generateKeyPair, importPKCS8, importSPKI, jwtVerify, errors as joseErrors, type CryptoKey } from "jose";
import type { FastifyBaseLogger } from "fastify";
import type { Env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export interface AccessClaims { sub: string; roles: string[]; locale: string; sid: string }

const ALG = "RS256";
const ISSUER = "descubre-rd";
const AUDIENCE = "descubre-rd-api";
const pem = (v: string) => v.replace(/\\n/g, "\n");

/** JWT de acceso (RS256, corto) y utilidades para tokens opacos (refresco, verificación, restablecimiento). */
export async function createTokenService(env: Env, log: FastifyBaseLogger) {
  let privateKey: CryptoKey;
  let publicKey: CryptoKey;
  let publicPem: string;
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    privateKey = await importPKCS8(pem(env.JWT_PRIVATE_KEY), ALG);
    publicKey = await importSPKI(pem(env.JWT_PUBLIC_KEY), ALG);
    publicPem = pem(env.JWT_PUBLIC_KEY);
  } else {
    // Desarrollo/pruebas: par efímero (los tokens dejan de valer al reiniciar). En producción loadEnv exige las claves.
    const pair = await generateKeyPair(ALG, { modulusLength: 2048 });
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;
    publicPem = await exportSPKI(pair.publicKey);
    if (env.NODE_ENV !== "test") log.warn("JWT_PRIVATE_KEY/JWT_PUBLIC_KEY no configuradas: se generó un par efímero (los tokens se invalidan al reiniciar)");
  }

  return {
    publicPem,
    accessTtl: env.JWT_ACCESS_TTL_SECONDS,

    async signAccess(claims: AccessClaims, ttlSeconds = env.JWT_ACCESS_TTL_SECONDS) {
      return new SignJWT({ roles: claims.roles, locale: claims.locale, sid: claims.sid })
        .setProtectedHeader({ alg: ALG, typ: "JWT" })
        .setSubject(claims.sub)
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .setJti(randomBytes(8).toString("hex"))
        .sign(privateKey);
    },

    async verifyAccess(token: string): Promise<AccessClaims> {
      try {
        const { payload } = await jwtVerify(token, publicKey, { issuer: ISSUER, audience: AUDIENCE, algorithms: [ALG] });
        if (!payload.sub || typeof payload.sid !== "string") throw new AppError("UNAUTHENTICATED", "Token inválido");
        return { sub: payload.sub, roles: (payload.roles as string[]) ?? [], locale: (payload.locale as string) ?? "es", sid: payload.sid };
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
