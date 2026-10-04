/**
 * Lo que la hidratación del catálogo necesita del empaquetador: el nombre con huella de cada imagen empaquetada
 * y el cargador de cada archivo de datos. Vive aparte para que el resto de la hidratación pueda ejecutarse
 * también fuera del navegador (el comprobador de paridad).
 */

const assetUrls = import.meta.glob("../assets/**/*.{jpg,jpeg,png,webp,avif,svg,gif}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const assetsByName = new Map(Object.entries(assetUrls).map(([path, url]) => [path.split("/").pop()!, url]));

/** Nombre con huella de una imagen de `src/assets`, por su nombre de archivo. */
export const resolvePackagedAsset = (fileName: string): string | undefined => assetsByName.get(fileName);

/** `comoLlegarData.ts` → `como-llegar-data`: la misma clave que usa `db:import-static` para el documento. */
export const datasetKey = (file: string) => file.replace(/\.tsx?$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();

const dataModules = import.meta.glob("../data/*.{ts,tsx}") as Record<string, () => Promise<Record<string, unknown>>>;

/** Cargador de cada archivo de datos por la clave de su documento: el mismo trozo que descargan las pantallas. */
export const datasetLoaders: Record<string, () => Promise<Record<string, unknown>>> = Object.fromEntries(
  Object.entries(dataModules).map(([path, load]) => [datasetKey(path.split("/").pop()!), load]),
);
