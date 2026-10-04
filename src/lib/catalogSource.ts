import { DATA_SOURCE, type DataSource } from "@/lib/dataSource";

export type CatalogSource = "static" | "api";

/**
 * De dónde sale el catálogo público (playas, alojamientos, restaurantes, montañas, recetas, destinos…).
 *
 * Vacío sigue a `VITE_DATA_SOURCE`: un despliegue real (`api`) lee el catálogo del backend, que es la fuente de
 * verdad, y una demostración con datos simulados usa los archivos locales. Darle valor permite separarlos: por
 * ejemplo, leer el catálogo del backend mientras reservas, tienda y paneles siguen simulados. Un valor
 * desconocido falla de forma visible en lugar de degradar en silencio a los archivos locales.
 */
export function resolveCatalogSource(value: string | undefined, dataSource: DataSource = "mock"): CatalogSource {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "") return dataSource === "api" ? "api" : "static";
  if (normalized === "static" || normalized === "api") return normalized;
  throw new Error(`VITE_CATALOG_SOURCE inválido: "${value}". Valores permitidos: "static", "api" o vacío (sigue a VITE_DATA_SOURCE).`);
}

export const CATALOG_SOURCE: CatalogSource = resolveCatalogSource(import.meta.env.VITE_CATALOG_SOURCE, DATA_SOURCE);
