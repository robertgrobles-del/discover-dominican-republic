/**
 * Imágenes empaquetadas con el sitio. La base las guarda como `/assets/<archivo>` (así las ve la carga de
 * `db:import-static`), pero en el sitio compilado cada una tiene un nombre con huella. Quien arranca la
 * hidratación registra aquí cómo traducir una cosa en la otra; sin traductor, esas rutas no se pueden usar.
 *
 * Módulo sin dependencias del empaquetador: lo importan también los scripts que corren fuera del navegador.
 */

type Resolver = (fileName: string) => string | undefined;
let resolver: Resolver = () => undefined;

export function setAssetResolver(next: Resolver): void {
  resolver = next;
}

const PREFIX = "/assets/";
export const isPackagedAsset = (value: unknown): value is string => typeof value === "string" && value.startsWith(PREFIX);

/** Ruta utilizable de una imagen: la propia si no es empaquetada, su nombre con huella si lo es, o `undefined`. */
export function resolveAsset(value: string): string | undefined {
  return isPackagedAsset(value) ? resolver(value.slice(PREFIX.length)) : value;
}

/**
 * Copia de un valor con todas sus imágenes empaquetadas traducidas. `ok` es falso si alguna no se pudo
 * traducir: ese valor no debe sustituir al local, que sí tiene su imagen.
 */
export function resolveAssetsDeep(value: unknown): { value: unknown; ok: boolean } {
  if (typeof value === "string") { const url = resolveAsset(value); return { value: url ?? value, ok: url !== undefined }; }
  if (Array.isArray(value)) { const items = value.map(resolveAssetsDeep); return { value: items.map((item) => item.value), ok: items.every((item) => item.ok) }; }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).map(([key, item]) => [key, resolveAssetsDeep(item)] as const);
    return { value: Object.fromEntries(entries.map(([key, item]) => [key, item.value])), ok: entries.every(([, item]) => item.ok) };
  }
  return { value, ok: true };
}
