import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";

export const PUBLIC_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";
export const PRIVATE_NO_STORE = "private, no-store";

/**
 * Clases de caché estandarizadas (docs §3.5): un GET/HEAD 200 o declara `cache-control`
 * público (y entonces recibe ETag débil + 304), o por defecto queda `private, no-store`
 * para que datos autenticados jamás queden en cachés compartidas.
 */
export function registerEtag(app: FastifyInstance) {
  app.addHook("onSend", async (req, reply, payload) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || reply.statusCode !== 200 || typeof payload !== "string") return payload;
    const cc = reply.getHeader("cache-control");
    if (typeof cc !== "string" || cc.length === 0) {
      reply.header("cache-control", PRIVATE_NO_STORE);
      return payload;
    }
    if (!cc.includes("public")) return payload;
    const etag = `W/"${createHash("sha1").update(payload).digest("base64url").slice(0, 27)}"`;
    reply.header("etag", etag);
    if (req.headers["if-none-match"] === etag) {
      reply.code(304);
      return "";
    }
    return payload;
  });
}
