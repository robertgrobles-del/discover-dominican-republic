import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente del contenido que el equipo edita como JSON: los documentos (lo que no es una colección de fichas) y
 * la ficha completa de cada registro del catálogo (`extras`: los campos que no tienen columna propia).
 */

export interface ContentDocumentSummary { key: string; revision: number; description: string | null; updated_at: string }
export interface ContentDocument extends ContentDocumentSummary { value: Record<string, unknown> }
export interface CatalogRecord { id: string; name?: string; title?: string; slug?: string | null; version?: number; extras?: Record<string, unknown> | null }

/** Colecciones cuyas filas guardan su ficha completa en `extras`. */
export const EXTRAS_COLLECTIONS = [
  { path: "destinations", label: "Destinos" }, { path: "beaches", label: "Playas" }, { path: "mountains", label: "Montañas" },
  { path: "rivers", label: "Ríos" }, { path: "protected-areas", label: "Áreas protegidas" }, { path: "hotels", label: "Alojamientos" },
  { path: "restaurants", label: "Restaurantes" }, { path: "bars", label: "Bares" }, { path: "experiences", label: "Experiencias" },
  { path: "theme-parks", label: "Parques temáticos" }, { path: "stadiums", label: "Estadios" }, { path: "golf-courses", label: "Campos de golf" },
  { path: "ports", label: "Puertos y marinas" }, { path: "shopping-centers", label: "Centros comerciales" }, { path: "clinics", label: "Clínicas" },
  { path: "events", label: "Eventos" }, { path: "recipes", label: "Recetas" }, { path: "airports", label: "Aeropuertos" },
  { path: "articles", label: "Artículos" }, { path: "offset-projects", label: "Proyectos de compensación" }, { path: "routes", label: "Rutas" },
] as const;

/** Texto JSON → objeto, o el motivo por el que no vale. El backend sólo acepta objetos. */
export function parseJsonObject(text: string): { value: Record<string, unknown> } | { error: string } {
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return { error: "Debe ser un objeto JSON (entre llaves)." };
    return { value: value as Record<string, unknown> };
  } catch (err) {
    return { error: `JSON no válido: ${err instanceof Error ? err.message : "revisa comas y comillas"}` };
  }
}

const json = (body: unknown, method: string) => ({ method, body: JSON.stringify(body) });

export const contentDocumentsApi = {
  list: () => fetchApi<{ data: ContentDocumentSummary[] }>("/datasets"),
  get: (key: string) => fetchApi<{ data: ContentDocument }>(`/datasets/${key}`),
  save: (key: string, value: Record<string, unknown>) => fetchApi<{ data: ContentDocument }>(`/admin/datasets/${key}`, json({ value }, "PUT")),
  /** Borra el documento: el sitio vuelve a mostrar el contenido con el que se compiló. */
  remove: (key: string) => fetchApi<null>(`/admin/datasets/${key}`, { method: "DELETE" }),

  records: (path: string, q = "") => fetchApi<{ data: CatalogRecord[] }>(`/admin/${path}?per_page=100${q ? `&q=${encodeURIComponent(q)}` : ""}`),
  record: (path: string, id: string) => fetchApi<{ data: CatalogRecord }>(`/admin/${path}/${id}`),
  saveExtras: (path: string, record: CatalogRecord, extras: Record<string, unknown>) =>
    fetchApi<{ data: CatalogRecord }>(`/admin/${path}/${record.id}`, json({ extras, ...(record.version !== undefined ? { version: record.version } : {}) }, "PATCH")),
};
