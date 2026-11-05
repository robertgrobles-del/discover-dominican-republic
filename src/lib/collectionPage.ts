import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/**
 * Páginas cuyos datos vivían en el propio componente y ahora salen de su colección del backend (lo que el panel
 * edita). El arreglo local queda como respaldo y como base de los campos que la tabla no guarda (colores, iconos,
 * imágenes empaquetadas): `fromRow` recibe la fila y, si existe, el elemento local con la misma clave.
 *
 * - Backend disponible: se muestra exactamente lo publicado (lo que se borra o despublica en el panel desaparece).
 * - Backend caído o cargando: se muestra lo local.
 */
export type Row = Record<string, unknown>;

export function useCollectionList<L>(path: string, local: L[], keyOf: (item: L) => string, fromRow: (row: Row, base: L | undefined) => L): L[] {
  const { data } = useQuery({
    queryKey: ["collection-page", path],
    queryFn: async () => (await fetchApi<{ data: Row[] }>(`/${path}?per_page=100`)).data,
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (!data) return local;
  const byKey = new Map(local.map((l) => [keyOf(l), l]));
  return data.map((row) => fromRow(row, byKey.get(String(row.slug ?? ""))));
}

/** Ficha de detalle por slug. `undefined` = no existe (o se despublicó). */
export function useCollectionRecord<L>(path: string, slug: string | undefined, local: L | undefined, fromRow: (row: Row, base: L | undefined) => L) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["collection-page", path, slug],
    queryFn: async () => (await fetchApi<{ data: Row }>(`/${path}/${encodeURIComponent(slug!)}`)).data,
    enabled: !!slug,
    staleTime: 5 * 60_000,
    retry: false,
  });
  if (data) return { item: fromRow(data, local), loading: false };
  const notFound = isError && error instanceof HttpError && error.status === 404;
  return { item: notFound ? undefined : local, loading: isLoading && !local };
}

// ---------- Conversión de valores del backend ----------
export const str = (v: unknown, fallback?: string): string => (typeof v === "string" && v ? v : fallback ?? "");
export const numOr = (v: unknown, fallback?: number): number => { const n = Number(v); return v !== null && v !== undefined && v !== "" && Number.isFinite(n) ? n : fallback ?? 0; };
export const list = (v: unknown, fallback?: string[]): string[] => (Array.isArray(v) && v.length ? v.map(String) : fallback ?? []);
export const extras = (row: Row): Record<string, unknown> => (row.extras && typeof row.extras === "object" ? (row.extras as Record<string, unknown>) : {});
