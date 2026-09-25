import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";

export const PUBLIC_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

/** ETag débil + 304 para respuestas GET públicas cacheables (docs §3.5). */
export function registerEtag(app: FastifyInstance) {
  app.addHook("onSend", async (req, reply, payload) => {
    if (req.method !== "GET" || reply.statusCode !== 200 || typeof payload !== "string") return payload;
    const cc = reply.getHeader("cache-control");
    if (typeof cc !== "string" || !cc.includes("public")) return payload;
    const etag = `W/"${createHash("sha1").update(payload).digest("base64url").slice(0, 27)}"`;
    reply.header("etag", etag);
    if (req.headers["if-none-match"] === etag) {
      reply.code(304);
      return "";
    }
    return payload;
  });
}
