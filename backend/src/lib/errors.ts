export type ErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHENTICATED" | "TOKEN_EXPIRED" | "FORBIDDEN" | "ACCOUNT_SUSPENDED"
  | "NOT_FOUND" | "CONFLICT" | "INVALID_TOKEN" | "MFA_REQUIRED" | "BUSINESS_RULE" | "RATE_LIMITED" | "INTERNAL" | "UPSTREAM_ERROR" | "SERVICE_UNAVAILABLE";

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400, UNAUTHENTICATED: 401, TOKEN_EXPIRED: 401, FORBIDDEN: 403, ACCOUNT_SUSPENDED: 403,
  NOT_FOUND: 404, CONFLICT: 409, INVALID_TOKEN: 400, MFA_REQUIRED: 403, BUSINESS_RULE: 422, RATE_LIMITED: 429, INTERNAL: 500, UPSTREAM_ERROR: 502, SERVICE_UNAVAILABLE: 503,
};

/** Error de dominio: se traduce al envoltorio `{ error: { code, message, details, request_id } }` (docs §3.3). */
export class AppError extends Error {
  readonly status: number;
  constructor(readonly code: ErrorCode, message: string, readonly details?: unknown, status?: number) {
    super(message);
    this.name = "AppError";
    this.status = status ?? STATUS[code];
  }
  static notFound(what = "Recurso") { return new AppError("NOT_FOUND", `${what} no encontrado`); }
  static validation(message: string, details?: unknown) { return new AppError("VALIDATION_ERROR", message, details); }
}
