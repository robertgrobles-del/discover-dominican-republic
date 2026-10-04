import { slugify } from "../../src/lib/slug.js";
import manifestJson from "../../src/contracts/content-manifest.json" with { type: "json" };
import { DATASETS, type Ctx, type Dataset, type Row } from "./mappers.js";
import { loadStatic } from "./loader.js";

type Manifest = Record<string, Record<string, { type: string; nullable: boolean }>>;
const manifest = manifestJson as Manifest;
interface Queryable { query(sql: string, params?: unknown[]): Promise<{ rows: any[]; rowCount: number | null }> }

export interface DatasetResult { key: string; table: string; source: number; inserted: number; existing: number; skipped: number; errors: string[] }

const norm = (s: string) => slugify(s);
/** Valor de JS → parámetro de PostgreSQL según el tipo de la columna. */
export function coerce(type: string, v: unknown): unknown {
  if (v === undefined || v === null) return null;
  switch (type) {
    case "jsonb": return JSON.stringify(v);
    case "array": return Array.isArray(v) ? v.map(String) : [String(v)];
    case "integer": { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : null; }
    case "numeric": { const n = Number(v); return Number.isFinite(n) ? n : null; }
    case "boolean": return !!v;
    case "uuid": case "date": case "timestamp": return v;
    default: return Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  }
}

/** Copia apta para JSON: sin funciones ni componentes (los íconos que algunos archivos guardan junto a los datos). */
export function sanitize(v: unknown): unknown {
  if (typeof v === "function" || typeof v === "symbol" || v === undefined) return undefined;
  if (Array.isArray(v)) return v.map((x) => sanitize(x) ?? null);
  if (v && typeof v === "object") {
    if ("$$typeof" in v) return undefined;
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sanitize(x)] as const).filter(([, x]) => x !== undefined));
  }
  return v;
}

/** Convierte un elemento en la fila lista para insertar (quita lo indefinido y valida las columnas contra el manifiesto). */
export function prepare(ds: Dataset, row: Row): { columns: string[]; values: unknown[] } {
  const cols = manifest[ds.table];
  if (!cols) throw new Error(`La tabla ${ds.table} no está en el manifiesto`);
  const full: Row = { ...row };
  if (cols.status && full.status === undefined) full.status = "published";
  if (cols.published_at && full.published_at === undefined) full.published_at = new Date().toISOString();
  const columns: string[] = [], values: unknown[] = [];
  for (const [k, v] of Object.entries(full)) {
    if (v === undefined) continue;
    if (!cols[k]) throw new Error(`${ds.table}.${k}: la columna no existe`);
    columns.push(k); values.push(coerce(cols[k]!.type, v));
  }
  return { columns, values };
}

async function buildCtx(db: Queryable): Promise<Ctx> {
  const provs = (await db.query("SELECT id, name, slug FROM provinces")).rows as { id: string; name: string; slug: string | null }[];
  const byProv = new Map<string, string>();
  for (const p of provs) { byProv.set(norm(p.name), p.id); if (p.slug) byProv.set(p.slug, p.id); }
  const alias: Record<string, string> = { "distrito-nacional": "santo-domingo-de-guzman", "santo-domingo": "santo-domingo" };
  const dests = (await db.query("SELECT id, slug FROM destinations WHERE slug IS NOT NULL")).rows as { id: string; slug: string }[];
  const byDest = new Map(dests.map((d) => [d.slug, d.id]));
  return {
    prov: (x) => (x ? byProv.get(norm(x)) ?? byProv.get(alias[norm(x)] ?? "") ?? null : null),
    dest: (x) => (x ? byDest.get(x) ?? null : null),
  };
}

/**
 * Carga los datasets indicados. No abre ni cierra transacciones: quien llama decide (la simulación envuelve todo en un BEGIN/ROLLBACK).
 * Cada fila se inserta con ON CONFLICT DO NOTHING: lo que ya existe (o lo que editó el equipo después de una carga anterior) no se pisa.
 */
export async function runImport(db: Queryable, opts: { only?: string[]; log?: (m: string) => void } = {}): Promise<DatasetResult[]> {
  const modules = new Map<string, Record<string, unknown>>();
  const out: DatasetResult[] = [];
  for (const ds of DATASETS) {
    if (opts.only?.length && !opts.only.includes(ds.key)) continue;
    const res: DatasetResult = { key: ds.key, table: ds.table, source: 0, inserted: 0, existing: 0, skipped: 0, errors: [] };
    try {
      if (!modules.has(ds.file)) modules.set(ds.file, await loadStatic(ds.file));
      const items = ds.items(modules.get(ds.file)!);
      res.source = items.length;
      const ctx = await buildCtx(db);       // se recalcula: los destinos recién cargados sirven a las colecciones siguientes
      const seenSlugs = new Set<string>();
      for (const item of items) {
        let row: Row | null;
        try { row = ds.map(item, ctx); } catch (e) { res.errors.push(`map: ${(e as Error).message}`); continue; }
        if (!row) { res.skipped++; continue; }
        // La ficha completa viaja en `extras`: lo que no tiene columna propia no se pierde.
        if (manifest[ds.table]?.extras && row.extras === undefined) row.extras = sanitize(item);
        // Dos elementos del archivo con el mismo slug: el segundo se descarta (el slug es único en la tabla).
        if (typeof row.slug === "string") { if (seenSlugs.has(row.slug)) { res.skipped++; continue; } seenSlugs.add(row.slug); }
        try {
          const { columns, values } = prepare(ds, row);
          await db.query("SAVEPOINT r");
          const r = await db.query(`INSERT INTO "${ds.table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")}) ON CONFLICT DO NOTHING`, values);
          // Una fila cargada antes de que existiera `extras` lo recibe ahora; si el equipo ya lo editó, no se toca.
          if (!r.rowCount && row.extras !== undefined && row.id) await db.query(`UPDATE "${ds.table}" SET extras = $1 WHERE id = $2 AND extras = '{}'::jsonb`, [JSON.stringify(row.extras), row.id]);
          await db.query("RELEASE SAVEPOINT r");
          r.rowCount ? res.inserted++ : res.existing++;
        } catch (e) {
          await db.query("ROLLBACK TO SAVEPOINT r").catch(() => undefined);
          res.errors.push(`${(row.name ?? row.title ?? row.id) as string}: ${(e as Error).message.slice(0, 160)}`);
        }
      }
    } catch (e) { res.errors.push(`carga: ${(e as Error).message.slice(0, 200)}`); }
    opts.log?.(`${ds.key.padEnd(18)} → ${ds.table.padEnd(18)} origen ${String(res.source).padStart(3)}  nuevas ${String(res.inserted).padStart(3)}  ya existían ${String(res.existing).padStart(3)}  omitidas ${res.skipped}${res.errors.length ? `  ERRORES ${res.errors.length}` : ""}`);
    out.push(res);
  }
  return out;
}

// ---------- Documentos de contenido ----------

/** Archivos cuyo contenido pertenece a otro módulo del backend (publicidad, tienda, recompensas, creadores, paneles): no son contenido editorial. */
export const NOT_EDITORIAL = new Set(["partnerDashboardData", "creatorsData", "socialData", "mockIndustryBanners", "officialBanners", "marketplaceData", "rewardsData", "pricingPlansData", "fallbackAccommodations"]);
/** Exportaciones que ya se cargan como filas de una colección: su ficha completa va en `extras`, no en un documento. */
export const IN_COLLECTIONS = new Set(["destinations", "beaches", "mountains", "rivers", "rios", "reservas", "hotels", "restaurants", "bars", "shoppingMalls", "centrosSalud", "experiences", "parquesData.parquesData", "cruisePorts", "marinasList", "eventosEstaticosCompletos", "criolloRecipes", "recipesData", "airports", "blogPosts", "historyArticles", "offsetProjects", "RUTAS_SABOR_DATA"]);

const baseName = (file: string) => file.replace(/\.tsx?$/, "");
/** `comoLlegarData.ts` → `como-llegar-data`: la clave del documento. */
export const datasetKey = (file: string) => baseName(file).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();

/** Documento de un archivo de datos: sus exportaciones que son datos, sin las que ya viven en una colección. */
export function datasetOf(file: string, mod: Record<string, unknown>): Record<string, unknown> {
  const doc: Record<string, unknown> = {};
  const seen = new Set<unknown>();
  for (const [key, value] of Object.entries(mod)) {
    if (value === null || typeof value !== "object") continue;
    if (IN_COLLECTIONS.has(key) || IN_COLLECTIONS.has(`${baseName(file)}.${key}`) || seen.has(value)) continue; // un alias de otra exportación no se guarda dos veces
    seen.add(value);
    const clean = sanitize(value);
    if (clean !== undefined && Object.keys(clean as object).length > 0) doc[key] = clean;
  }
  return doc;
}

export interface DocumentResult { key: string; file: string; exports: number; bytes: number; state: "nuevo" | "actualizado" | "sin cambios" | "editado en el CMS" | "vacío"; error?: string }

/**
 * Carga un documento por archivo de datos. Un documento que nadie ha editado (`revision = 0`) se refresca con
 * el archivo; uno editado desde el CMS no se toca.
 */
export async function runDatasetImport(db: Queryable, files: string[], opts: { log?: (m: string) => void } = {}): Promise<DocumentResult[]> {
  const out: DocumentResult[] = [];
  for (const file of files) {
    if (NOT_EDITORIAL.has(baseName(file))) continue;
    const key = datasetKey(file);
    const res: DocumentResult = { key, file, exports: 0, bytes: 0, state: "vacío" };
    try {
      const doc = datasetOf(file, await loadStatic(file));
      const json = JSON.stringify(doc);
      res.exports = Object.keys(doc).length; res.bytes = json.length;
      if (res.exports > 0) {
        const prev = (await db.query("SELECT revision, value = $2::jsonb AS same FROM content_datasets WHERE key = $1", [key, json])).rows[0] as { revision: number; same: boolean } | undefined;
        if (!prev) { await db.query("INSERT INTO content_datasets (key, value, description) VALUES ($1, $2, $3)", [key, json, `Contenido de src/data/${file}`]); res.state = "nuevo"; }
        else if (prev.revision > 0) res.state = "editado en el CMS";
        else if (prev.same) res.state = "sin cambios";
        else { await db.query("UPDATE content_datasets SET value = $2, updated_at = now() WHERE key = $1 AND revision = 0", [key, json]); res.state = "actualizado"; }
      }
    } catch (e) { res.error = (e as Error).message.slice(0, 200); }
    opts.log?.(`${key.padEnd(30)} ${String(res.exports).padStart(2)} bloques ${String(res.bytes).padStart(6)} bytes  ${res.error ? `ERROR ${res.error}` : res.state}`);
    out.push(res);
  }
  return out;
}
