import { fetchApi } from "./fastifyClient";

export { fetchApi };

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestInit): Promise<{ data: T }> =>
    fetchApi<{ data: T }>(endpoint, { method: "GET", ...options }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T }> =>
    fetchApi<{ data: T }>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T }> =>
    fetchApi<{ data: T }>(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit): Promise<{ data: T }> =>
    fetchApi<{ data: T }>(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestInit): Promise<{ data: T }> =>
    fetchApi<{ data: T }>(endpoint, { method: "DELETE", ...options }),
};
