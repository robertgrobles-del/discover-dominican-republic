import { AppError } from "../../lib/errors.js";
import { MAX_PER_PAGE, type SortSpec } from "../../lib/pagination.js";
import type { CollectionDef, FilterKind } from "./collections.js";
import type { ColType, Manifest } from "./manifest-reader.js";
import manifestJson from "./manifest.json" with { type: "json" };

export const manifest = manifestJson as Manifest;

/** Columnas de gobierno del CMS que nunca se exponen tal cual (salvo `seo`, que se agrupa). */
const GOVERNANCE = new Set(["status", "unpublished_at", "slug_history", "seo_title", "seo_description", "og_image_url", "canonical_url", "noindex", "locale_default", "created_by", "updated_by", "reviewed_by", "version", "deleted_at"]);
const SEO = { title: "seo_title", description: "seo_description", og_image: "og_image_url", canonical_url: "canonical_url", noindex: "noindex" } as const;

const q = (name: string) => `"${name}"`;
export const cols = (table: string) => manifest[table] ?? {};
export const hasCol = (table: string, c: string) => c in cols(table);
export const colType = (table: string, c: string): ColType => cols(table)[c]!.type;

/** Columnas públicas de una colección (detalle) y de su listado. */
export const publicColumns = (d: CollectionDef) => Object.keys(cols(d.table)).filter((c) => !GOVERNANCE.has(c) && !d.exclude.includes(c));
export const listColumns = (d: CollectionDef) => publicColumns(d).filter((c) => !d.listExclude.includes(c));

/** Condición SQL de visibilidad pública (docs §4.1). */
export function visibility(d: CollectionDef): string {
  const t = d.table;
  const parts: string[] = [];
  if (hasCol(t, "status")) parts.push("status = 'published'");
  if (hasCol(t, "deleted_at")) parts.push("deleted_at IS NULL");
  if (hasCol(t, "published_at")) parts.push("(published_at IS NULL OR published_at <= now())");
  if (hasCol(t, "is_active")) parts.push("COALESCE(is_active, true)");
  if (d.visible) parts.push(d.visible);
  return parts.length ? parts.join(" AND ") : "true";
}

// ---------- Parámetros ----------
export const BASE_KEYS = new Set(["page", "per_page", "q", "sort", "lang", "include", "fields", "near", "radius", "limit"]);
const FILTER_RE = /^filter\[([a-z_0-9]+)\](?:\[(gte|lte|gt|lt|ne)\])?$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPS = { gte: ">=", lte: "<=", gt: ">", lt: "<", ne: "<>" } as const;
const PG_TYPE: Record<ColType, string> = { uuid: "uuid", text: "text", integer: "numeric", numeric: "numeric", boolean: "boolean", jsonb: "jsonb", array: "text[]", timestamp: "timestamptz", date: "date" };

export interface ParsedFilter { column: string; op: "eq" | keyof typeof OPS | "contains"; values: string[]; type: ColType; kind: FilterKind }
export interface ParsedQuery {
  page: number; perPage: number; q?: string; sort?: string; lang?: string; include: string[]; fields?: string[];
  filters: ParsedFilter[]; near?: { lat: number; lng: number; radius: number };
}

function coerceValue(type: ColType, column: string, v: string): string {
  const bad = (why: string) => AppError.validation(`Valor inválido para filter[${column}]: ${why}`, { field: `filter[${column}]` });
  switch (type) {
    case "uuid": if (!UUID.test(v)) throw bad("se esperaba un uuid"); return v.toLowerCase();
    case "integer": case "numeric": if (v.trim() === "" || !Number.isFinite(Number(v))) throw bad("se esperaba un número"); return String(Number(v));
    case "boolean": if (!["true", "false", "1", "0"].includes(v)) throw bad("se esperaba true o false"); return v === "true" || v === "1" ? "true" : "false";
    case "date": if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) throw bad("se esperaba una fecha YYYY-MM-DD"); return v;
    case "timestamp": if (Number.isNaN(Date.parse(v))) throw bad("se esperaba una fecha ISO-8601"); return new Date(v).toISOString();
    default: return v.slice(0, 120);
  }
}

/** Valida y normaliza los parámetros de listado contra la definición de la colección (lista blanca estricta). */
export function parseQuery(d: CollectionDef, raw: Record<string, unknown>): ParsedQuery {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  const page = Number(str("page") ?? 1);
  const perPage = Number(str("per_page") ?? 24);
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > MAX_PER_PAGE) throw AppError.validation(`per_page debe estar entre 1 y ${MAX_PER_PAGE}`);
  if (!Number.isInteger(page) || page < 1) throw AppError.validation("page debe ser un entero positivo");

  const filters: ParsedFilter[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (BASE_KEYS.has(key)) continue;
    const m = key.match(FILTER_RE);
    if (!m) throw AppError.validation(`Parámetro desconocido: ${key}`, { allowed: [...BASE_KEYS, ...Object.keys(d.filters).map((f) => `filter[${f}]`)] });
    const [, column, opRaw] = m as unknown as [string, string, keyof typeof OPS | undefined];
    const kind = d.filters[column];
    if (!kind) throw AppError.validation(`No se puede filtrar por "${column}"`, { allowed: Object.keys(d.filters) });
    if (opRaw && kind !== "range" && opRaw !== "ne") throw AppError.validation(`filter[${column}] no admite el operador ${opRaw}`);
    if (typeof value !== "string") throw AppError.validation(`filter[${column}] debe indicarse una sola vez`);
    const type = colType(d.table, column);
    // Sin operador, los valores separados por coma significan "cualquiera de" (excepto booleanos); con operador, un solo valor.
    const multi = !opRaw && type !== "boolean";
    const parts = (multi ? value.split(",") : [value]).map((s) => s.trim()).filter((s) => s !== "").slice(0, 20);
    if (parts.length === 0) throw AppError.validation(`filter[${column}] está vacío`);
    filters.push({ column, op: kind === "contains" ? "contains" : (opRaw ?? "eq"), values: kind === "contains" ? parts : parts.map((p) => coerceValue(type, column, p)), type, kind });
  }

  let near: ParsedQuery["near"];
  const nearRaw = str("near");
  if (nearRaw !== undefined) {
    if (!d.geo) throw AppError.validation(`La colección ${d.path} no tiene coordenadas`);
    const m = nearRaw.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
    const lat = m ? Number(m[1]) : NaN, lng = m ? Number(m[2]) : NaN;
    if (!m || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw AppError.validation("near debe ser lat,lng (por ejemplo 18.48,-69.93)");
    const radius = Number(str("radius") ?? 5000);
    if (!Number.isFinite(radius) || radius < 1 || radius > 200_000) throw AppError.validation("radius debe estar entre 1 y 200000 metros");
    near = { lat, lng, radius };
  } else if (raw.radius !== undefined) throw AppError.validation("radius requiere near");

  const include = (str("include") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const i of include) if (!d.relations[i]) throw AppError.validation(`include no válido: ${i}`, { allowed: Object.keys(d.relations) });
  const fields = str("fields")?.split(",").map((s) => s.trim()).filter(Boolean);
  if (fields) {
    const allowed = new Set([...publicColumns(d), "seo"]);
    for (const f of fields) if (!allowed.has(f)) throw AppError.validation(`fields no válido: ${f}`, { allowed: [...allowed] });
  }
  return { page, perPage, q: str("q")?.trim().slice(0, 100) || undefined, sort: str("sort"), lang: str("lang"), include, fields, filters, near };
}

// ---------- SQL ----------
const distanceExpr = (d: CollectionDef, latP: string, lngP: string) => {
  const lat = `${q(d.geo!.lat)}::float8`, lng = `${q(d.geo!.lng)}::float8`;
  return `(6371000 * 2 * asin(sqrt(least(1, power(sin(radians(${lat} - ${latP}) / 2), 2) + cos(radians(${latP})) * cos(radians(${lat})) * power(sin(radians(${lng} - ${lngP}) / 2), 2)))))`;
};

export interface Built { where: string; params: unknown[]; nearPh?: { lat: string; lng: string } }

/** WHERE completo (visibilidad + búsqueda + filtros + cercanía). `skip` omite el filtro de una columna (facetas). */
export function buildWhere(d: CollectionDef, p: ParsedQuery, opts: { skip?: string; extra?: string; extraParams?: unknown[] } = {}): Built {
  const params: unknown[] = [...(opts.extraParams ?? [])];
  const push = (v: unknown) => { params.push(v); return `$${params.length}`; };
  const where: string[] = [visibility(d)];
  if (opts.extra) where.push(opts.extra);

  if (p.q) {
    const pat = push(`%${p.q.replace(/[\\%_]/g, "\\$&")}%`);
    const textCols = d.search.filter((c) => hasCol(d.table, c) && colType(d.table, c) === "text");
    if (textCols.length) where.push(`(${textCols.map((c) => `lower(f_unaccent(${q(c)})) LIKE lower(f_unaccent(${pat})) ESCAPE '\\'`).join(" OR ")})`);
  }
  for (const f of p.filters) {
    if (f.column === opts.skip) continue;
    const c = q(f.column);
    if (f.op === "contains") {
      const ph = push(f.values);
      where.push(f.type === "array" ? `${c} && ${ph}::text[]` : `${c} ?| ${ph}::text[]`);
    } else if (f.op === "eq") {
      if (f.values.length > 1 || f.type === "text") {
        const ph = push(f.values);
        where.push(f.type === "text" ? `lower(f_unaccent(${c})) = ANY (SELECT lower(f_unaccent(x)) FROM unnest(${ph}::text[]) x)` : `${c} = ANY (${ph}::${PG_TYPE[f.type]}[])`);
      } else where.push(`${c} = ${push(f.values[0])}::${PG_TYPE[f.type]}`);
    } else {
      where.push(`${c} ${OPS[f.op]} ${push(f.values[0])}::${PG_TYPE[f.type]}`);
    }
  }
  let nearPh: Built["nearPh"];
  if (p.near) {
    const lat = `${push(p.near.lat)}::float8`, lng = `${push(p.near.lng)}::float8`, rad = push(p.near.radius);
    nearPh = { lat, lng };
    where.push(`${q(d.geo!.lat)} IS NOT NULL AND ${q(d.geo!.lng)} IS NOT NULL AND ${distanceExpr(d, lat, lng)} <= ${rad}::float8`);
  }
  return { where: where.join(" AND "), params, nearPh };
}

export function buildOrder(d: CollectionDef, p: ParsedQuery): string {
  const allowed = new Set([...d.sort, ...(p.near ? ["distance"] : [])]);
  let specs: SortSpec[] = d.defaultSort;
  if (p.near && !p.sort) specs = [{ column: "distance", dir: "ASC" }];
  if (p.sort) {
    specs = [];
    for (const part of p.sort.split(",").map((s) => s.trim()).filter(Boolean)) {
      const column = part.replace(/^[-+]/, "");
      if (!allowed.has(column)) throw AppError.validation(`No se puede ordenar por "${column}"`, { allowed: [...allowed] });
      specs.push({ column, dir: part.startsWith("-") ? "DESC" : "ASC" });
    }
  }
  const sql = specs.map((s) => (s.column === "distance" ? `distance_m ${s.dir}` : `${q(s.column)} ${s.dir}${s.dir === "DESC" ? " NULLS LAST" : ""}`));
  return `${sql.join(", ")}${sql.length ? ", " : ""}${q("id")}`;
}

/** Lista de columnas a seleccionar (más `distance_m` si hay `near`). */
export function buildSelect(d: CollectionDef, p: ParsedQuery, detail: boolean, nearParams?: { lat: string; lng: string }): { select: string; fields: string[]; wantSeo: boolean } {
  const base = detail ? publicColumns(d) : listColumns(d);
  const requested = p.fields ? p.fields.filter((f) => f !== "seo") : base;
  const fields = [...new Set(["id", ...requested])];
  const wantSeo = p.fields ? p.fields.includes("seo") : true;
  const list = fields.map(q);
  if (wantSeo) for (const c of Object.values(SEO)) if (hasCol(d.table, c)) list.push(q(c));
  if (nearParams && d.geo) list.push(`${distanceExpr(d, nearParams.lat, nearParams.lng)} AS distance_m`);
  return { select: list.join(", "), fields, wantSeo };
}

// ---------- Salida ----------
export function mapRow(d: CollectionDef, row: Record<string, unknown>, sel: { fields: string[]; wantSeo: boolean }): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of sel.fields) out[f] = row[f] instanceof Date ? (row[f] as Date).toISOString() : row[f];
  if (sel.wantSeo) {
    out.seo = {
      title: row[SEO.title] ?? null, description: row[SEO.description] ?? null, og_image: row[SEO.og_image] ?? null,
      canonical_url: row[SEO.canonical_url] ?? null, noindex: row[SEO.noindex] ?? false,
    };
  }
  if (typeof row.distance_m === "number") out.distance_m = Math.round(row.distance_m);
  return out;
}
