export type CatalogSource = "static" | "api";

/**
 * De dónde sale el catálogo público (playas, alojamientos, restaurantes, bares, experiencias y destinos).
 *
 * Es independiente de `VITE_DATA_SOURCE` y de `VITE_AUTH_SOURCE`: permite leer el catálogo del backend mientras
 * reservas, tienda y paneles siguen con datos simulados. Un valor desconocido falla de forma visible en lugar
 * de degradar en silencio a los archivos locales.
 */
export function resolveCatalogSource(value: string | undefined): CatalogSource {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "" || normalized === "static") return "static";
  if (normalized === "api") return "api";
  throw new Error(`VITE_CATALOG_SOURCE inválido: "${value}". Valores permitidos: "static" (por defecto) o "api".`);
}

export const CATALOG_SOURCE: CatalogSource = resolveCatalogSource(import.meta.env.VITE_CATALOG_SOURCE);
