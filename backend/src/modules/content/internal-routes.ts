import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ContentReaderPort } from "../../contracts/content-reader.js";
import { AppError } from "../../lib/errors.js";
import { CONTENT_READER_RPC, CONTENT_READER_RPC_PREFIX, isContentReaderMethod } from "./reader-rpc.js";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Lecturas de `ContentReaderPort` para otros servicios. Sólo lectura: basta un secreto compartido, sin nonce. */
export function contentInternalRoutes(app: FastifyInstance, reader: ContentReaderPort, token: string) {
  const expected = digest(token);
  app.post<{ Params: { method: string }; Body: { args?: unknown } }>(`${CONTENT_READER_RPC_PREFIX}/:method`, async (req) => {
    const presented = /^Bearer (.+)$/.exec(req.headers.authorization ?? "")?.[1];
    if (!presented || !timingSafeEqual(digest(presented), expected)) throw new AppError("UNAUTHENTICATED", "Credencial de servicio inválida");
    const { method } = req.params;
    if (!isContentReaderMethod(method)) throw AppError.notFound("Lectura de contenido");
    // JSON no transporta `undefined`: los argumentos opcionales omitidos llegan como null.
    const raw = Array.isArray(req.body?.args) ? req.body.args.map((arg) => arg ?? undefined) : [];
    const parsed = CONTENT_READER_RPC[method].safeParse(raw);
    if (!parsed.success) throw AppError.validation("Argumentos inválidos", parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })));
    const call = reader[method] as (...args: unknown[]) => Promise<unknown>;
    return { data: (await call.apply(reader, parsed.data)) ?? null };
  });
}
