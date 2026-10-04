import type { FastifyInstance, FastifyRequest } from "fastify";
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from "fastify-type-provider-zod";
import { AppError } from "../lib/errors.js";
import type { ErrorReporter } from "../lib/error-reporter.js";

// Declarado aquí y no en `app.ts`: los servicios autónomos (weather, content) usan este manejador sin la
// aplicación principal y pueden no tener monitoreo.
declare module "fastify" { interface FastifyInstance { errorReporter?: ErrorReporter } }

/** Envoltorio de errores único (docs §3.3): { error: { code, message, details?, request_id } }. */
export function registerErrorHandling(app: FastifyInstance) {
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ error: { code: "NOT_FOUND", message: `Ruta no encontrada: ${req.method} ${req.url.split("?")[0]}`, request_id: req.id } });
  });

  // Sólo lo inesperado llega al monitoreo: los errores de validación y de negocio son respuestas normales.
  // De la petición viaja la ruta declarada, nunca la URL real, el cuerpo ni las cabeceras.
  const report = (err: unknown, req: FastifyRequest) => {
    void app.errorReporter?.capture(err, { source: "petición", requestId: req.id, method: req.method, route: req.routeOptions?.url, userId: (req as { user?: { id?: string } }).user?.id });
  };

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
      report(err, req);
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
    report(err, req);
    return reply.code(500).send({ error: { code: "INTERNAL", message: "Error interno", request_id } });
  });
}
