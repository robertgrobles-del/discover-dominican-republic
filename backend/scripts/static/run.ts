import { slugify } from "../../src/lib/slug.js";
import manifestJson from "../../src/modules/content/manifest.json" with { type: "json" };
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
        // Dos elementos del archivo con el mismo slug: el segundo se descarta (el slug es único en la tabla).
        if (typeof row.slug === "string") { if (seenSlugs.has(row.slug)) { res.skipped++; continue; } seenSlugs.add(row.slug); }
        try {
          const { columns, values } = prepare(ds, row);
          await db.query("SAVEPOINT r");
          const r = await db.query(`INSERT INTO "${ds.table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")}) ON CONFLICT DO NOTHING`, values);
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
