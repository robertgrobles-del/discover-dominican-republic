import { QueryClient } from "@tanstack/react-query";
import { requestJson } from "@/lib/httpClient";
import { HttpError } from "@/lib/httpClient";
import { API_BASE_URL } from "@/lib/apiBase";
import { reportError } from "@/lib/errorReporter";
import { dispatchSessionExpired } from "@/lib/session";

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

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  try {
    return await requestJson<T>(url, options);
  } catch (error) {
    // La telemetría de fallos vive aquí, no en httpClient: el transporte se
    // mantiene puro y sin dependencias del reportero (evita ciclos).
    const isAnalytics = endpoint.includes("/analytics/");
    const isAuthEndpoint = endpoint.startsWith("/auth/");
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
