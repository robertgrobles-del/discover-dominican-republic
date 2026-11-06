import { QueryClient } from "@tanstack/react-query";
import { requestJson } from "@/lib/httpClient";
import { HttpError } from "@/lib/httpClient";
import { API_BASE_URL } from "@/lib/apiBase";
import { reportError } from "@/lib/errorReporter";
import { dispatchSessionExpired } from "@/lib/session";
import { REFRESH_TRANSPORT_HEADER, captureTokens, clearAccessToken, getAccessToken, hasSessionHint, refreshAccessToken } from "@/lib/accessToken";

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError) return error.status >= 500 && failureCount < 2;
  if (error instanceof Error && error.name === "AbortError") return false;
  return error instanceof TypeError && failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 15,
      retry: shouldRetryQuery,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: { retry: false },
  },
});

/**
 * Rama staging (solo con VITE_STAGING_API=true): el mini backend (api/index.ts) solo tiene estas rutas. Las demás se rechazan sin salir a la red,
 * como un 404: cada pantalla ya trata ese fallo usando su contenido local, y la landing se ahorra ~12 peticiones
 * en la cadena crítica (datasets, clima, gamificación, favoritos, carrito…).
 */
const STAGING_API = /^\/(auth\/|public\/|admin\/(provinces|news|news-categories|events|users|media|leads|establishment-requests|contact-messages)\b|ads\/catalog\b|media\/|leads$|contact$|establishments\/register$|events\/submissions$)/;
const FORM_POST = /^\/(leads|contact|establishments\/register|events\/submissions)$/;

/** Copia el campo trampa de la página (ver components/forms/Honeypot) en el envío de un formulario público. */
function withHoneypot(endpoint: string, options?: RequestInit): RequestInit | undefined {
  if (options?.method !== "POST" || typeof options.body !== "string" || !FORM_POST.test(endpoint) || typeof document === "undefined") return options;
  const hp = [...document.querySelectorAll<HTMLInputElement>('input[name="hp_website"]')].map((i) => i.value).find(Boolean);
  if (!hp) return options;
  try { return { ...options, body: JSON.stringify({ ...JSON.parse(options.body), hp_website: hp }) }; } catch { return options; }
}

export async function fetchApi<T>(endpoint: string, rawOptions?: RequestInit): Promise<T> {
  const options = withHoneypot(endpoint, rawOptions);
  if (import.meta.env.VITE_STAGING_API === "true" && !endpoint.startsWith("http") && !STAGING_API.test(endpoint.startsWith("/") ? endpoint : `/${endpoint}`)) {
    throw new HttpError("Ruta no disponible en staging", 404);
  }
  const url =endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const isAnalytics = endpoint.includes("/analytics/");
  const isAuthEndpoint = endpoint.startsWith("/auth/");
  const callerSetAuth = new Headers(options?.headers).has("Authorization");

  const send = (token: string | null) => {
    const headers = new Headers(options?.headers);
    if (token && !callerSetAuth) headers.set("Authorization", `Bearer ${token}`);
    // Las rutas de sesión usan la cookie HttpOnly de refresco: el token de refresco nunca llega al JavaScript.
    if (isAuthEndpoint) headers.set(REFRESH_TRANSPORT_HEADER, "cookie");
    return requestJson<T>(url, { ...options, headers, ...(isAuthEndpoint ? { credentials: "include" as const } : {}) });
  };

  try {
    // El token vive sólo en memoria: tras recargar se recupera con la cookie de refresco, y sólo si este
    // navegador había iniciado sesión (los visitantes anónimos no generan peticiones extra).
    let token = callerSetAuth ? null : getAccessToken();
    if (!token && !isAuthEndpoint && !callerSetAuth && hasSessionHint()) token = await refreshAccessToken();

    let payload: T;
    try {
      payload = await send(token);
    } catch (error) {
      // Un 401 con token puede ser sólo que venció: se renueva una vez y se reintenta.
      const retry = error instanceof HttpError && error.status === 401 && !isAuthEndpoint && !callerSetAuth && hasSessionHint()
        ? await refreshAccessToken()
        : null;
      if (!retry) throw error;
      payload = await send(retry);
    }
    if (isAuthEndpoint) {
      if (endpoint.startsWith("/auth/logout")) clearAccessToken();
      else captureTokens(payload);
    }
    return payload;
  } catch (error) {
    // La telemetría de fallos vive aquí, no en httpClient: el transporte se
    // mantiene puro y sin dependencias del reportero (evita ciclos).
    if (error instanceof HttpError) {
      if (error.status === 401 && !isAuthEndpoint) dispatchSessionExpired();
      // 5xx y caídas de red: fallos que el visitante no puede resolver. Los 4xx
      // (validación, permisos) son comportamiento esperado y no se reportan.
      if (error.status >= 500 && !isAnalytics) {
        reportError(error, { source: "api", status: error.status, endpoint: endpoint.split("?")[0] });
      }
    } else if (error instanceof Error && error.name !== "AbortError" && !isAnalytics) {
      reportError(error, { source: "api", endpoint: endpoint.split("?")[0] });
    }
    throw error;
  }
}

/** Método helper para calcular carritos e impuestos (ITBIS 18%) aislados en Fastify */
export async function calculateCartTotal(items: Array<{ id: string; quantity: number; price: number }>) {
  return fetchApi<{ subtotal: number; itbis: number; total: number }>(`/cart/calculate`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export function apiMessage(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.length > 0) return error;
  return fallback;
}
