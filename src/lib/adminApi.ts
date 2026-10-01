import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/**
 * Capa de datos de administración contra Fastify (Plan de accesos, punto 3).
 *
 * Sustituye la invocación de la función simulada `admin-entities` por los endpoints reales
 * `/api/v1/admin/<colección>` (las fábricas `backend/src/modules/admin/tables.ts` y `cms.ts` exponen
 * exactamente el mismo contrato para listar, ver, crear, editar y borrar).
 *
 * El transporte y el manejo de errores son los de la app (`fetchApi`): aquí solo se decide la ruta, el
 * método y cómo se traducen los filtros y los fallos del servidor. La autorización es del servidor: esta
 * capa añade el token de sesión, nunca decide permisos.
 */

export type AdminEntityAction = "list" | "get" | "create" | "update" | "delete";

/** Filtros que maneja la interfaz de administración. */
export interface AdminEntityFilters {
  destination_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminListResult<T> {
  data: T;
  total: number;
}

export type AdminApiErrorKind = "unauthorized" | "forbidden" | "not_exposed" | "validation" | "conflict" | "unknown";

export class AdminApiError extends Error {
  constructor(message: string, readonly status: number, readonly kind: AdminApiErrorKind) {
    super(message);
    this.name = "AdminApiError";
  }
}

/**
 * De dónde sale el token de sesión. El portal todavía autentica con el cliente simulado
 * (`localStorage`), que es el único que existe hasta cerrar la migración D-01/D-02; cuando llegue la
 * autenticación real contra Fastify basta con reemplazar este proveedor desde un único punto
 * (`setAdminAccessTokenProvider`).
 */
let accessTokenProvider: () => string | null = () => {
  try {
    return localStorage.getItem("sb-token");
  } catch {
    return null;
  }
};

export function setAdminAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider;
}

/**
 * Traduce los filtros de la interfaz al vocabulario del servidor.
 *
 * `search`/`limit`/`offset` son comunes a todos los listados (`page`/`per_page`/`q`). El resto
 * (`destination_id`, `is_active`, `is_featured`) no lo entienden todas las colecciones: se devuelven en
 * `unsupported` para que la pantalla lo diga en lugar de aparentar que filtró.
 */
export function translateFilters(filters: AdminEntityFilters = {}): { query: Record<string, string>; unsupported: string[] } {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const page = filters.offset && filters.offset > 0 ? Math.floor(filters.offset / limit) + 1 : 1;
  const query: Record<string, string> = { page: String(page), per_page: String(limit) };
  if (filters.search) query.q = filters.search;
  const unsupported = (["destination_id", "is_active", "is_featured"] as const).filter((key) => filters[key] !== undefined);
  return { query, unsupported };
}

function toAdminApiError(error: unknown, entity: string): AdminApiError {
  if (error instanceof HttpError) {
    const payload = error.details as { error?: { code?: string } } | undefined;
    const code = payload?.error?.code;
    if (error.status === 401) return new AdminApiError("La sesión no es válida o venció.", 401, "unauthorized");
    if (error.status === 403) return new AdminApiError("Tu cuenta no tiene la capacidad necesaria para esta colección.", 403, "forbidden");
    if (error.status === 404) {
      return new AdminApiError(`La colección "${entity}" no está expuesta por la API de administración.`, 404, "not_exposed");
    }
    if (error.status === 409) return new AdminApiError(error.message, 409, "conflict");
    if (error.status === 400 || code === "VALIDATION_ERROR") return new AdminApiError(error.message, error.status, "validation");
    return new AdminApiError(error.message, error.status, "unknown");
  }
  return new AdminApiError(error instanceof Error ? error.message : "Error desconocido", 0, "unknown");
}

async function request<T>(
  entity: string,
  action: AdminEntityAction,
  options: { id?: string; data?: Record<string, unknown>; filters?: AdminEntityFilters } = {},
): Promise<AdminListResult<T>> {
  const token = accessTokenProvider();
  if (!token) throw new AdminApiError("No hay sesión activa.", 401, "unauthorized");

  const base = `/admin/${entity}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  let url = base;
  let method = "GET";
  let body: string | undefined;

  switch (action) {
    case "list": {
      const { query } = translateFilters(options.filters);
      url = `${base}?${new URLSearchParams(query).toString()}`;
      break;
    }
    case "get":
      url = `${base}/${options.id}`;
      break;
    case "create":
      method = "POST";
      body = JSON.stringify(options.data ?? {});
      break;
    case "update":
      method = "PATCH";
      url = `${base}/${options.id}`;
      body = JSON.stringify(options.data ?? {});
      break;
    case "delete":
      method = "DELETE";
      url = `${base}/${options.id}`;
      break;
  }

  try {
    const response = await fetchApi<{ data?: T; meta?: { total?: number } }>(url, { method, headers, body });
    return { data: (response?.data ?? null) as T, total: response?.meta?.total ?? 0 };
  } catch (error) {
    throw toAdminApiError(error, entity);
  }
}

export const adminListEntities = <T>(entity: string, filters?: AdminEntityFilters) =>
  request<T[]>(entity, "list", { filters });

export const adminGetEntity = <T>(entity: string, id: string) => request<T>(entity, "get", { id });

export const adminCreateEntity = <T>(entity: string, data: Record<string, unknown>) => request<T>(entity, "create", { data });

export const adminUpdateEntity = <T>(entity: string, id: string, data: Record<string, unknown>) =>
  request<T>(entity, "update", { id, data });

export const adminDeleteEntity = (entity: string, id: string) => request<null>(entity, "delete", { id });
