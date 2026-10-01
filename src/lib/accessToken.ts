import { API_BASE_URL } from "@/lib/apiBase";

/**
 * Token de acceso sólo en memoria: nunca se escribe en localStorage ni sessionStorage, donde cualquier script
 * de la página podría leerlo. Al recargar se pierde y se recupera con la cookie HttpOnly de refresco que emite
 * el backend en modo web (`x-refresh-transport: cookie`).
 */
let token: string | null = null;
let expiresAt = 0;
let inFlight: Promise<string | null> | null = null;

/** Marca no sensible: indica que este navegador inició sesión, para no pedir un refresco a visitantes anónimos. */
const SESSION_HINT = "dr:has-session";
/** Margen para no enviar un token a punto de vencer. */
const EXPIRY_SKEW_MS = 10_000;

export const REFRESH_TRANSPORT_HEADER = "x-refresh-transport";

const hint = {
  set() { try { localStorage.setItem(SESSION_HINT, "1"); } catch { /* almacenamiento no disponible */ } },
  clear() { try { localStorage.removeItem(SESSION_HINT); } catch { /* almacenamiento no disponible */ } },
  has() { try { return localStorage.getItem(SESSION_HINT) === "1"; } catch { return false; } },
};

export function setAccessToken(value: string, expiresInSeconds: number): void {
  token = value;
  expiresAt = Date.now() + expiresInSeconds * 1000;
  hint.set();
}

export function clearAccessToken(): void {
  token = null;
  expiresAt = 0;
  hint.clear();
}

/** Token vigente en memoria, o null si no hay o está por vencer. */
export function getAccessToken(now = Date.now()): string | null {
  return token && now < expiresAt - EXPIRY_SKEW_MS ? token : null;
}

export const hasSessionHint = (): boolean => hint.has();

/** Guarda los tokens de una respuesta de `/auth/*` si los trae. */
export function captureTokens(payload: unknown): void {
  const tokens = (payload as { data?: { tokens?: { access_token?: unknown; expires_in?: unknown } } } | null)?.data?.tokens;
  if (typeof tokens?.access_token === "string" && typeof tokens.expires_in === "number") setAccessToken(tokens.access_token, tokens.expires_in);
}

/**
 * Pide un token de acceso nuevo con la cookie de refresco. Las llamadas simultáneas comparten una sola
 * petición: el token de refresco es de un solo uso y presentarlo dos veces revoca la sesión.
 */
export function refreshAccessToken(): Promise<string | null> {
  inFlight ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", [REFRESH_TRANSPORT_HEADER]: "cookie" },
      });
      if (!response.ok) {
        // Sólo un rechazo explícito cierra la sesión; un 5xx o un corte de red no deben desloguear a nadie.
        if (response.status === 401 || response.status === 403) clearAccessToken();
        return null;
      }
      captureTokens(await response.json().catch(() => null));
      return getAccessToken();
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
