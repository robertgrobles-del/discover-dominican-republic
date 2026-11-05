import type { FastifyBaseLogger } from "fastify";
import { AppError, type ErrorCode } from "../../lib/errors.js";
import { signWeatherInternalRequest } from "./internal-auth.js";

/** Vigencia de la copia local de las lecturas públicas; coincide con el `max-age` que ya se anuncia al navegador. */
const PUBLIC_TTL_MS = 300_000;

export class WeatherServiceGateway {
  /** Las lecturas públicas se guardan y se comparten entre peticiones simultáneas: el servicio de clima limita por
   *  dirección y todo el tráfico del facade llega desde la misma, así que reenviar cada visita agotaría ese cupo. */
  private readonly cache = new Map<string, { at: number; value: Promise<any> }>();

  constructor(private readonly baseUrl: string, private readonly token: string, private readonly log: FastifyBaseLogger, private readonly now: () => number = Date.now) {}

  weather(slug?: string) { return this.cachedGet(`/live/weather${slug ? `?province=${encodeURIComponent(slug)}` : ""}`); }
  forecast(slug: string, days: number) { return this.cachedGet(`/live/weather/forecast?province=${encodeURIComponent(slug)}&days=${days}`); }

  private cachedGet(path: string): Promise<any> {
    const hit = this.cache.get(path);
    if (hit && this.now() - hit.at < PUBLIC_TTL_MS) return hit.value;
    const value = this.request("GET", path);
    this.cache.set(path, { at: this.now(), value });
    // Un fallo no se queda guardado: la siguiente visita vuelve a intentarlo.
    value.catch(() => { if (this.cache.get(path)?.value === value) this.cache.delete(path); });
    return value;
  }
  adminList(page: number, perPage: number, actor: string) { return this.request("GET", `/internal/admin/weather_snapshots?page=${page}&per_page=${perPage}`, undefined, actor); }
  adminCreate(body: unknown, actor: string) { this.cache.clear(); return this.request("POST", "/internal/admin/weather_snapshots", body, actor); }
  adminUpdate(id: string, body: unknown, actor: string) { this.cache.clear(); return this.request("PATCH", `/internal/admin/weather_snapshots/${id}`, body, actor); }
  adminDelete(id: string, actor: string) { this.cache.clear(); return this.request("DELETE", `/internal/admin/weather_snapshots/${id}`, undefined, actor); }
  refresh(actor: string) { this.cache.clear(); return this.request("POST", "/internal/admin/weather_refresh", undefined, actor, 120_000); }

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
