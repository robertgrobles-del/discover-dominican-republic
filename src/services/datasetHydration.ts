import { resolveAsset } from "./assetPaths";

/**
 * Documentos de contenido: lo que no es una colección de fichas (transporte, itinerarios, náutica, loterías,
 * tasas de referencia…). El backend guarda un documento JSON por archivo de `src/data`, con una entrada por
 * cada exportación de datos, y el CMS permite editarlo. Aquí se vuelca sobre los datos locales, en su sitio.
 *
 * Sólo se descargan los documentos editados (`revision > 0`): los demás son copia de lo que el sitio ya trae,
 * y pedirlos obligaría a bajar archivos de datos de páginas que quizá nadie visite.
 */

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === "object" && v !== null && !Array.isArray(v);
/** Funciones y componentes (los íconos que algunos archivos guardan junto a los datos): el backend no los tiene y no se tocan. */
const isOpaque = (v: unknown) => typeof v === "function" || typeof v === "symbol" || (isPlain(v) && "$$typeof" in v);
const KEY_CANDIDATES = ["id", "slug", "key", "code"] as const;

function sameScalar(a: unknown, b: unknown): boolean {
  return typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 : a === b;
}

/** Clave con la que emparejar los elementos de dos listas, si todos la tienen y no se repite. */
function sharedKey(local: unknown[], remote: unknown[]): string | undefined {
  return KEY_CANDIDATES.find((key) => [local, remote].every((list) => {
    const values = list.map((item) => (isPlain(item) && !isOpaque(item) ? item[key] : undefined));
    return values.length > 0 && values.every((v) => typeof v === "string" || typeof v === "number") && new Set(values).size === values.length;
  }));
}

/** Valor remoto listo para colocarse: con sus imágenes empaquetadas traducidas, o `undefined` si alguna no existe. */
function ready(remote: unknown): unknown {
  if (typeof remote === "string") return resolveAsset(remote);
  if (Array.isArray(remote)) { const items = remote.map(ready); return items.some((item) => item === undefined) ? undefined : items; }
  if (isPlain(remote)) {
    const entries = Object.entries(remote).map(([key, value]) => [key, ready(value)] as const);
    return entries.some(([, value]) => value === undefined) ? undefined : Object.fromEntries(entries);
  }
  return remote;
}

/**
 * Deja `local` con el contenido de `remote`, modificándolo en su sitio para que quien ya lo importó vea el
 * cambio. Conserva lo que el backend no puede guardar (íconos, funciones) y no cambia el tipo de un campo.
 * Devuelve cuántos cambios hizo; con `apply = false` sólo los cuenta.
 */
export function mergeInPlace(local: unknown, remote: unknown, apply = true): number {
  if (Array.isArray(local) && Array.isArray(remote)) return mergeList(local, remote, apply);
  if (isPlain(local) && isPlain(remote) && !isOpaque(local)) return mergeObject(local, remote, apply);
  return 0;
}

/** Cambios al colocar `remote` donde está `current`; `put` lo coloca. */
function mergeSlot(current: unknown, remote: unknown, apply: boolean, put: (value: unknown) => void): number {
  if (isOpaque(current)) return 0;
  if ((Array.isArray(current) && Array.isArray(remote)) || (isPlain(current) && isPlain(remote))) return mergeInPlace(current, remote, apply);
  if (current !== undefined && current !== null && remote !== null && (typeof current !== typeof remote || Array.isArray(current) !== Array.isArray(remote))) return 0;
  const next = ready(remote);
  if (next === undefined || sameScalar(current, next)) return 0;
  if (apply) put(next);
  return 1;
}

function mergeObject(local: Plain, remote: Plain, apply: boolean): number {
  let changes = 0;
  for (const [key, value] of Object.entries(remote)) changes += mergeSlot(local[key], value, apply, (next) => { local[key] = next; });
  for (const key of Object.keys(local)) {
    if (key in remote || local[key] === undefined || isOpaque(local[key])) continue;
    changes++;
    if (apply) delete local[key];
  }
  return changes;
}

function mergeList(local: unknown[], remote: unknown[], apply: boolean): number {
  let changes = 0;
  const key = sharedKey(local, remote);
  if (key) {
    const byKey = new Map(local.map((item) => [(item as Plain)[key], item]));
    const next = remote.map((item) => {
      const current = byKey.get((item as Plain)[key]);
      if (current) { changes += mergeInPlace(current, item, apply); return current; }
      const fresh = ready(item);
      if (fresh === undefined) return undefined;
      changes++;
      return fresh;
    }).filter((item) => item !== undefined);
    // Orden distinto o elementos de menos: también es un cambio.
    if (next.length !== local.length || next.some((item, i) => item !== local[i])) { changes++; if (apply) local.splice(0, local.length, ...next); }
    return changes;
  }
  remote.forEach((item, i) => {
    if (i < local.length) changes += mergeSlot(local[i], item, apply, (next) => { local[i] = next; });
    else { const fresh = ready(item); if (fresh !== undefined) { changes++; if (apply) local.push(fresh); } }
  });
  if (local.length > remote.length) { changes++; if (apply) local.length = remote.length; }
  return changes;
}

export interface DatasetIndexEntry { key: string; revision: number }
export interface DatasetSource {
  index(): Promise<DatasetIndexEntry[]>;
  get(key: string): Promise<Plain>;
}

/**
 * Vuelca sobre los datos locales los documentos editados en el CMS. Cada documento falla por separado.
 * Devuelve las claves de los documentos que cambiaron algo.
 */
export async function hydrateDatasets(source: DatasetSource, loaders: Record<string, () => Promise<Plain>>, opts: { all?: boolean } = {}): Promise<string[]> {
  const index = await source.index().catch(() => [] as DatasetIndexEntry[]);
  const wanted = index.filter((entry) => (opts.all || entry.revision > 0) && loaders[entry.key]);
  const changed = await Promise.all(wanted.map(async ({ key }) => {
    try {
      const [doc, mod] = await Promise.all([source.get(key), loaders[key]!()]);
      let changes = 0;
      for (const [name, value] of Object.entries(doc)) changes += mergeInPlace(mod[name], value);
      return changes > 0 ? key : null;
    } catch {
      return null; // sin este documento, sus datos siguen como los trae el sitio
    }
  }));
  return changed.filter((key): key is string => key !== null);
}
