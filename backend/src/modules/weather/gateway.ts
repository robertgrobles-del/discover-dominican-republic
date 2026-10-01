import type { FastifyBaseLogger } from "fastify";
import { AppError, type ErrorCode } from "../../lib/errors.js";
import { signWeatherInternalRequest } from "./internal-auth.js";

export class WeatherServiceGateway {
  constructor(private readonly baseUrl: string, private readonly token: string, private readonly log: FastifyBaseLogger) {}

  weather(slug?: string) { return this.request("GET", `/live/weather${slug ? `?province=${encodeURIComponent(slug)}` : ""}`); }
  forecast(slug: string, days: number) { return this.request("GET", `/live/weather/forecast?province=${encodeURIComponent(slug)}&days=${days}`); }
  adminList(page: number, perPage: number, actor: string) { return this.request("GET", `/internal/admin/weather_snapshots?page=${page}&per_page=${perPage}`, undefined, actor); }
  adminCreate(body: unknown, actor: string) { return this.request("POST", "/internal/admin/weather_snapshots", body, actor); }
  adminUpdate(id: string, body: unknown, actor: string) { return this.request("PATCH", `/internal/admin/weather_snapshots/${id}`, body, actor); }
  adminDelete(id: string, actor: string) { return this.request("DELETE", `/internal/admin/weather_snapshots/${id}`, undefined, actor); }
  refresh(actor: string) { return this.request("POST", "/internal/admin/weather_refresh", undefined, actor, 120_000); }

  private async request(method: string, path: string, body?: unknown, actor = "00000000-0000-4000-8000-000000000000", timeoutMs = 5000): Promise<any> {
    const target = new URL(path, this.baseUrl);
    const requestPath = target.pathname + target.search;
    const jwt = await signWeatherInternalRequest(this.token, actor, method, requestPath, body);
    try {
      const response = await fetch(target, {
        method, headers: { authorization: `Bearer ${jwt}`, ...(body === undefined ? {} : { "content-type": "application/json" }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 204) return null;
      const result = await response.json() as { data?: unknown; error?: { code?: string; message?: string; details?: unknown } };
      if (!response.ok) {
        const known = new Set<ErrorCode>(["VALIDATION_ERROR", "UNAUTHENTICATED", "TOKEN_EXPIRED", "FORBIDDEN", "ACCOUNT_SUSPENDED", "NOT_FOUND", "CONFLICT", "INVALID_TOKEN", "MFA_REQUIRED", "PAYMENT_FAILED", "BUSINESS_RULE", "RATE_LIMITED", "INTERNAL", "UPSTREAM_ERROR", "SERVICE_UNAVAILABLE"]);
        const code = known.has(result.error?.code as ErrorCode) ? result.error!.code as ErrorCode : "SERVICE_UNAVAILABLE";
        throw new AppError(code, result.error?.message ?? "Error del servicio meteorológico", result.error?.details, response.status);
      }
      return result.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      this.log.warn({ err: error }, "Servicio meteorológico no disponible");
      throw new AppError("SERVICE_UNAVAILABLE", "Servicio meteorológico no disponible");
    }
  }
}
