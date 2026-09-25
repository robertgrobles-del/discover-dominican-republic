import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import { AppError } from "../lib/errors.js";

/** Envoltorio de errores único (docs §3.3): { error: { code, message, details?, request_id } }. */
export function registerErrorHandling(app: FastifyInstance) {
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ error: { code: "NOT_FOUND", message: `Ruta no encontrada: ${req.method} ${req.url.split("?")[0]}`, request_id: req.id } });
  });

  app.setErrorHandler((err, req, reply) => {
    const request_id = req.id;
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR", message: "Solicitud inválida", request_id,
          details: err.validation.map((v) => ({
            field: v.instancePath.replace(/^\//, "").replace(/\//g, ".") || undefined,
            issue: v.message,
          })),
        },
      });
    }
    if (isResponseSerializationError(err)) {
      req.log.error({ err }, "La respuesta no cumple su esquema");
      return reply.code(500).send({ error: { code: "INTERNAL", message: "Error interno", request_id } });
    }
    if (err instanceof AppError) {
      return reply.code(err.status).send({ error: { code: err.code, message: err.message, details: err.details, request_id } });
    }
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 429) {
      return reply.code(429).send({ error: { code: "RATE_LIMITED", message: "Demasiadas solicitudes. Intenta de nuevo en un momento.", request_id } });
    }
    if (status && status >= 400 && status < 500) {
      return reply.code(status).send({ error: { code: status === 404 ? "NOT_FOUND" : "VALIDATION_ERROR", message: (err as Error).message, request_id } });
    }
    req.log.error({ err }, "Error no controlado");
    return reply.code(500).send({ error: { code: "INTERNAL", message: "Error interno", request_id } });
  });
}
