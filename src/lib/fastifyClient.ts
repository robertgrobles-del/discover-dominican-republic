import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Error de API (${response.status})`);
  }

  return response.json();
}

/** Método helper para calcular carritos e impuestos (ITBIS 18%) aislados en Fastify */
export async function calculateCartTotal(items: Array<{ id: string; quantity: number; price: number }>) {
  return fetchApi<{ subtotal: number; itbis: number; total: number }>(`/cart/calculate`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
