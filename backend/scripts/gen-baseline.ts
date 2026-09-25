// Genera migrations/0001_baseline.sql y 0002_cms_governance.sql a partir de las fuentes existentes:
//   1. mysql/schema.sql            (superset de tablas y columnas; se traduce a PostgreSQL)
//   2. supabase/migrations/*.sql   (tablas sólo-Postgres y ALTER TABLE ... ADD COLUMN posteriores)
//   3. src/integrations/supabase/mockDb.json (columnas "de facto" que usa el frontend y no están en el SQL)
// La salida se versiona; este script sólo se vuelve a ejecutar si cambian las fuentes.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = fileURLToPath(new URL("../migrations/", import.meta.url));

interface Col { name: string; def: string; source: "mysql" | "pg" | "mock" }
interface Fk { table: string; cols: string[]; refTable: string; refCols: string[]; onDelete?: string; onUpdate?: string }
interface Tbl { name: string; cols: Col[]; tableConstraints: string[]; indexes: string[]; fks: Fk[]; source: string; raw?: string }

const q = (s: string) => `"${s.replace(/"/g, "")}"`;
const stripComments = (s: string) => s.replace(/--.*$/gm, "");

// ---------- utilidades de parseo ----------
function balancedBody(sql: string, start: number): { body: string; end: number } {
  let depth = 1, i = start, inStr: string | null = null;
  while (i < sql.length && depth > 0) {
    const ch = sql[i]!;
    if (inStr) { if (ch === inStr) inStr = null; }
    else if (ch === "'" || ch === '"') inStr = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    i++;
  }
  return { body: sql.slice(start, i - 1), end: i };
}
function splitTop(body: string): string[] {
  const parts: string[] = []; let d = 0, cur = "", inStr: string | null = null;
  for (const ch of body) {
    if (inStr) { cur += ch; if (ch === inStr) inStr = null; continue; }
    if (ch === "'" || ch === '"') { inStr = ch; cur += ch; continue; }
    if (ch === "(") d++;
    if (ch === ")") d--;
    if (ch === "," && d === 0) { parts.push(cur); cur = ""; } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}
const ident = (s: string) => s.replace(/[`"]/g, "").trim();
const identList = (s: string) => s.split(",").map(ident);

// ---------- MySQL → PostgreSQL ----------
function mapMysqlType(raw: string, args: string | undefined, colName: string): { type: string; check?: string } {
  const t = raw.toUpperCase();
  const a = args?.replace(/\s+/g, "");
  if ((t === "VARCHAR" || t === "CHAR") && a === "36") return { type: "uuid" };
  if (t === "VARCHAR" || t === "CHAR" || /TEXT$/.test(t)) return { type: "text" };
  if (t === "JSON") return { type: "jsonb" };
  if (t === "BOOLEAN" || t === "BOOL" || (t === "TINYINT" && a === "1")) return { type: "boolean" };
  if (t === "TINYINT" || t === "SMALLINT") return { type: "smallint" };
  if (t === "INT" || t === "INTEGER" || t === "MEDIUMINT") return { type: "integer" };
  if (t === "BIGINT") return { type: "bigint" };
  if (t === "DECIMAL" || t === "NUMERIC") return { type: a ? `numeric(${a})` : "numeric" };
  if (t === "FLOAT") return { type: "real" };
  if (t === "DOUBLE") return { type: "double precision" };
  if (t === "DATE") return { type: "date" };
  if (t === "DATETIME" || t === "TIMESTAMP") return { type: "timestamptz" };
  if (t === "TIME") return { type: "time" };
  if (t === "YEAR") return { type: "integer" };
  if (t === "BLOB" || /BLOB$/.test(t)) return { type: "bytea" };
  if (t === "ENUM") {
    const vals = args!.trim();
    return { type: "text", check: `CHECK (${q(colName)} IN (${vals}))` };
  }
  throw new Error(`Tipo MySQL sin mapeo: ${raw}(${args ?? ""}) en columna ${colName}`);
}

function convertMysqlColumn(table: string, def: string, fks: Fk[]): Col {
  const m = def.match(/^[`"]?([a-zA-Z_0-9]+)[`"]?\s+([A-Za-z]+)\s*(?:\(((?:[^()]|\([^)]*\))*)\))?\s*(.*)$/s);
  if (!m) throw new Error(`No se pudo leer la columna: ${def}`);
  const [, name, rawType, args, restRaw] = m as unknown as [string, string, string, string | undefined, string];
  let rest = restRaw ?? "";
  const { type, check } = mapMysqlType(rawType, args, name);
  const mods: string[] = [];
  rest = rest.replace(/\bUNSIGNED\b/gi, "").replace(/\bCHARACTER SET \w+/gi, "").replace(/\bCOLLATE \w+/gi, "").replace(/COMMENT\s+'[^']*'/gi, "");
  rest = rest.replace(/ON UPDATE CURRENT_TIMESTAMP(\(\d*\))?/gi, "");
  let identity = false;
  if (/\bAUTO_INCREMENT\b/i.test(rest)) { identity = true; rest = rest.replace(/\bAUTO_INCREMENT\b/gi, ""); }
  // FK inline
  const ref = rest.match(/REFERENCES\s+[`"]?(\w+)[`"]?\s*\(([^)]*)\)(?:\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?(?:\s+ON UPDATE (CASCADE|SET NULL|RESTRICT|NO ACTION))?/i);
  if (ref) { fks.push({ table, cols: [name], refTable: ref[1]!, refCols: identList(ref[2]!), onDelete: ref[3], onUpdate: ref[4] }); rest = rest.replace(ref[0], ""); }
  // CHECK inline
  const checks: string[] = [];
  rest = rest.replace(/CHECK\s*\(((?:[^()]|\([^)]*\))*)\)/gi, (_x, c: string) => { checks.push(`CHECK (${c.replace(/`/g, '"')})`); return ""; });
  // DEFAULT
  let dflt = "";
  rest = rest.replace(/DEFAULT\s+(\((?:[^()]|\([^()]*\))*\)|'(?:[^']|'')*'|[A-Za-z_0-9.+-]+(?:\(\d*\))?)/i, (_x, v: string) => {
    let val = v.trim();
    if (/^\(UUID\(\)\)$/i.test(val)) val = "gen_random_uuid()";
    else if (/^\(JSON_ARRAY\(\)\)$/i.test(val)) val = "'[]'::jsonb";
    else if (/^\(JSON_OBJECT\(\)\)$/i.test(val)) val = "'{}'::jsonb";
    else if (/^(CURRENT_TIMESTAMP|NOW)(\(\d*\))?$/i.test(val)) val = "now()";
    else if (/^\(.*\)$/.test(val)) val = val.slice(1, -1).trim().replace(/`/g, '"');
    else if (type === "jsonb" && /^'/.test(val)) val = `${val}::jsonb`;
    else if (type === "boolean" && /^[01]$/.test(val)) val = val === "1" ? "TRUE" : "FALSE";
    dflt = `DEFAULT ${val}`;
    return "";
  });
  if (/\bPRIMARY KEY\b/i.test(rest)) mods.push("PRIMARY KEY");
  if (/\bNOT NULL\b/i.test(rest)) mods.push("NOT NULL");
  if (/\bUNIQUE\b/i.test(rest)) mods.push("UNIQUE");
  const finalType = identity ? `${type} GENERATED BY DEFAULT AS IDENTITY` : type;
  const parts = [q(name), finalType, ...mods, dflt, ...(check ? [check] : []), ...checks].filter(Boolean);
  return { name, def: parts.join(" "), source: "mysql" };
}

function parseMysql(sql: string): Map<string, Tbl> {
  const tables = new Map<string, Tbl>();
  const s = sql.replace(/\/\*.*?\*\//gs, "");
  const re = /CREATE TABLE IF NOT EXISTS\s+[`"]?(\w+)[`"]?\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const name = m[1]!;
    const { body } = balancedBody(s, re.lastIndex);
    const t: Tbl = { name, cols: [], tableConstraints: [], indexes: [], fks: [], source: "mysql/schema.sql" };
    for (const p0 of splitTop(stripComments(body))) {
      const p = p0.trim();
      let mm: RegExpMatchArray | null;
      if ((mm = p.match(/^(?:CONSTRAINT\s+\S+\s+)?FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(([^)]*)\)(?:\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?(?:\s+ON UPDATE (CASCADE|SET NULL|RESTRICT|NO ACTION))?/i))) {
        t.fks.push({ table: name, cols: identList(mm[1]!), refTable: mm[2]!, refCols: identList(mm[3]!), onDelete: mm[4], onUpdate: mm[5] });
      } else if ((mm = p.match(/^UNIQUE(?:\s+KEY|\s+INDEX)?(?:\s+[`"]?\w+[`"]?)?\s*\(([^)]*)\)/i))) {
        t.tableConstraints.push(`UNIQUE (${identList(mm[1]!).map(q).join(", ")})`);
      } else if ((mm = p.match(/^PRIMARY KEY\s*\(([^)]*)\)/i))) {
        t.tableConstraints.push(`PRIMARY KEY (${identList(mm[1]!).map(q).join(", ")})`);
      } else if ((mm = p.match(/^(?:KEY|INDEX)\s+[`"]?(\w+)[`"]?\s*\(([^)]*)\)/i))) {
        t.indexes.push(`CREATE INDEX IF NOT EXISTS ${q(mm[1]!)} ON ${q(name)} (${identList(mm[2]!).map(q).join(", ")});`);
      } else if (/^CHECK\s*\(/i.test(p)) {
        t.tableConstraints.push(p.replace(/`/g, '"'));
      } else {
        t.cols.push(convertMysqlColumn(name, p, t.fks));
      }
    }
    tables.set(name, t);
  }
  // índices sueltos
  for (const im of s.matchAll(/CREATE (UNIQUE )?INDEX\s+[`"]?(\w+)[`"]?\s+ON\s+[`"]?(\w+)[`"]?\s*\(([^)]*)\)\s*;/gi)) {
    const t = tables.get(im[3]!);
    if (t) t.indexes.push(`CREATE ${im[1] ?? ""}INDEX IF NOT EXISTS ${q(im[2]!)} ON ${q(t.name)} (${identList(im[4]!).map(q).join(", ")});`);
  }
  return tables;
}

// ---------- PostgreSQL (migraciones de Supabase) ----------
const fixPg = (s: string) => s.replace(/\bpublic\./g, "").replace(/\bauth\.users\b/g, "users");

function parsePgMigrations(dir: string) {
  const created = new Map<string, { raw: string; source: string }>();
  const addCols = new Map<string, Col[]>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
    const sql = stripComments(readFileSync(join(dir, f), "utf8"));
    const re = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?["]?(\w+)["]?\s*\(/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql))) {
      const { body } = balancedBody(sql, re.lastIndex);
      if (!created.has(m[1]!)) created.set(m[1]!, { raw: body, source: `supabase/migrations/${f.slice(0, 8)}` });
    }
    for (const am of sql.matchAll(/ALTER TABLE\s+(?:IF EXISTS\s+)?(?:ONLY\s+)?(?:public\.)?["]?(\w+)["]?\s+([^;]*);/gi)) {
      const tname = am[1]!;
      for (const part of splitTop(am[2]!)) {
        const cm = part.match(/^ADD COLUMN\s+(?:IF NOT EXISTS\s+)?["]?(\w+)["]?\s+(.*)$/is);
        if (!cm) continue;
        const list = addCols.get(tname) ?? [];
        if (!list.some((c) => c.name === cm[1])) list.push({ name: cm[1]!, def: `${q(cm[1]!)} ${fixPg(cm[2]!).replace(/\s+/g, " ")}`, source: "pg" });
        addCols.set(tname, list);
      }
    }
  }
  return { created, addCols };
}

function pgRawToTbl(name: string, raw: string, source: string): Tbl {
  const t: Tbl = { name, cols: [], tableConstraints: [], indexes: [], fks: [], source };
  for (const p0 of splitTop(fixPg(raw))) {
    const p = p0.trim();
    let mm: RegExpMatchArray | null;
    if ((mm = p.match(/^(?:CONSTRAINT\s+\S+\s+)?FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES\s+["]?(\w+)["]?\s*\(([^)]*)\)(?:\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?/i))) {
      t.fks.push({ table: name, cols: identList(mm[1]!), refTable: mm[2]!, refCols: identList(mm[3]!), onDelete: mm[4] });
    } else if (/^(CONSTRAINT|PRIMARY KEY|UNIQUE|CHECK)\b/i.test(p)) {
      t.tableConstraints.push(p);
    } else {
      const cm = p.match(/^["]?(\w+)["]?\s+(.*)$/s);
      if (!cm) throw new Error(`Columna PG ilegible en ${name}: ${p}`);
      let def = cm[2]!.replace(/\s+/g, " ");
      const ref = def.match(/\s*REFERENCES\s+["]?(\w+)["]?\s*\(([^)]*)\)(?:\s+ON DELETE (CASCADE|SET NULL|RESTRICT|NO ACTION))?/i);
      if (ref) { t.fks.push({ table: name, cols: [cm[1]!], refTable: ref[1]!, refCols: identList(ref[2]!), onDelete: ref[3] }); def = def.replace(ref[0], ""); }
      t.cols.push({ name: cm[1]!, def: `${q(cm[1]!)} ${def}`.trim(), source: "pg" });
    }
  }
  return t;
}

// ---------- columnas inferidas del mock ----------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function inferType(values: unknown[], colName: string): string {
  const v = values.filter((x) => x !== null && x !== undefined && x !== "");
  if (v.length === 0) return "text";
  if (v.every((x) => typeof x === "boolean")) return "boolean";
  if (v.every((x) => typeof x === "number")) return v.every((x) => Number.isInteger(x) && Math.abs(x as number) < 2_000_000_000) ? "integer" : "numeric";
  if (v.every((x) => typeof x === "object")) return "jsonb";
  if (v.every((x) => typeof x === "string")) {
    if (v.every((x) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x as string))) return "timestamptz";
    if (v.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x as string))) return "date";
    if (colName === "id" || colName.endsWith("_id")) if (v.every((x) => UUID_RE.test(x as string))) return "uuid";
  }
  return "text";
}

// ---------- generación ----------
function build() {
  const mysql = parseMysql(readFileSync(join(ROOT, "mysql/schema.sql"), "utf8"));
  const { created, addCols } = parsePgMigrations(join(ROOT, "supabase/migrations"));
  const pgSchema = parsePgMigrationsFile(join(ROOT, "supabase/schema.sql"));
  for (const [k, v] of pgSchema) if (!created.has(k)) created.set(k, v);
  const tables = new Map<string, Tbl>(mysql);

  // tablas sólo-Postgres
  for (const [name, { raw, source }] of created) if (!tables.has(name)) tables.set(name, pgRawToTbl(name, raw, source));
  // columnas añadidas por migraciones posteriores
  for (const [tname, cols] of addCols) {
    const t = tables.get(tname); if (!t) continue;
    for (const c of cols) if (!t.cols.some((x) => x.name === c.name)) t.cols.push(c);
  }
  // el hub de operadores usa ids de texto legibles (org-seed-…); el esquema base los declara uuid: se respeta el de la migración
  const mock = JSON.parse(readFileSync(join(ROOT, "src/integrations/supabase/mockDb.json"), "utf8")) as Record<string, Record<string, unknown>[]>;
  let inferred = 0, inferredTables = 0;
  for (const [tname, rows] of Object.entries(mock)) {
    if (!Array.isArray(rows) || rows.length === 0 || typeof rows[0] !== "object") continue;
    let t = tables.get(tname);
    const keys = new Set<string>(); rows.forEach((r) => Object.keys(r).forEach((k) => keys.add(k)));
    if (!t) { t = { name: tname, cols: [], tableConstraints: [], indexes: [], fks: [], source: "mockDb.json (inferida)" }; tables.set(tname, t); inferredTables++; }
    for (const k of keys) {
      if (t.cols.some((c) => c.name === k)) continue;
      const type = inferType(rows.map((r) => r[k]), k);
      const pk = k === "id" && t.cols.length === 0 ? " PRIMARY KEY" : "";
      t.cols.push({ name: k, def: `${q(k)} ${type}${pk}`, source: "mock" });
      inferred++;
    }
  }
  return { tables, inferred, inferredTables, mysqlCount: mysql.size };
}

function parsePgMigrationsFile(file: string) {
  const sql = stripComments(readFileSync(file, "utf8"));
  const out = new Map<string, { raw: string; source: string }>();
  const re = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:public\.)?["]?(\w+)["]?\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) { const { body } = balancedBody(sql, re.lastIndex); if (!out.has(m[1]!)) out.set(m[1]!, { raw: body, source: "supabase/schema.sql" }); }
  return out;
}

const { tables, inferred, inferredTables, mysqlCount } = build();

// orden topológico por FKs (las FKs se emiten al final; el orden sólo importa para legibilidad)
const names = [...tables.keys()].sort();
const lines: string[] = [];
lines.push(`-- GENERADO por scripts/gen-baseline.ts — no editar a mano. Ver backend/README.md.
-- Fuentes: mysql/schema.sql (${mysqlCount} tablas), supabase/migrations + supabase/schema.sql, y columnas inferidas de src/integrations/supabase/mockDb.json.
-- Total: ${tables.size} tablas (${inferredTables} inferidas sólo del mock; ${inferred} columnas añadidas desde el mock).

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`);

for (const name of names) {
  const t = tables.get(name)!;
  const hasPk = t.cols.some((c) => /PRIMARY KEY/i.test(c.def)) || t.tableConstraints.some((c) => /^PRIMARY KEY/i.test(c));
  const items = [
    ...t.cols.map((c) => ({ text: c.def, note: c.source === "mock" ? "  -- inferida de mockDb.json" : "" })),
    ...t.tableConstraints.map((c) => ({ text: c, note: "" })),
  ];
  const body = items.map((it, i) => `  ${it.text}${i < items.length - 1 ? "," : ""}${it.note}`).join("\n");
  lines.push(`-- ${name}  (${t.source})${hasPk ? "" : "  -- ¡sin clave primaria!"}\nCREATE TABLE IF NOT EXISTS ${q(name)} (\n${body}\n);\n`);
}
lines.push("-- ===== Índices =====");
for (const name of names) for (const ix of tables.get(name)!.indexes) lines.push(ix);
lines.push("\n-- ===== Claves foráneas =====");
const seenFk = new Set<string>();
const fkSkipped: string[] = [];
for (const name of names) {
  const t = tables.get(name)!;
  for (const fk of t.fks) {
    const ref = tables.get(fk.refTable);
    if (!ref) { fkSkipped.push(`${name}.${fk.cols.join(",")} → ${fk.refTable}`); continue; }
    const key = `${name}:${fk.cols.join(",")}:${fk.refTable}`;
    if (seenFk.has(key)) continue; seenFk.add(key);
    const cname = `fk_${name}_${fk.cols.join("_")}`.slice(0, 60);
    lines.push(`DO $$ BEGIN ALTER TABLE ${q(name)} ADD CONSTRAINT ${q(cname)} FOREIGN KEY (${fk.cols.map(q).join(", ")}) REFERENCES ${q(fk.refTable)} (${fk.refCols.map(q).join(", ")})${fk.onDelete ? ` ON DELETE ${fk.onDelete}` : ""}${fk.onUpdate ? ` ON UPDATE ${fk.onUpdate}` : ""}; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
  }
}
if (fkSkipped.length) lines.push(`\n-- FKs omitidas por referenciar tablas inexistentes:\n${fkSkipped.map((s) => `--   ${s}`).join("\n")}`);
lines.push(`
-- ===== updated_at automático =====
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.columns
           WHERE table_schema = 'public' AND column_name = 'updated_at'
             AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I', r.table_name);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', r.table_name);
  END LOOP;
END $$;
`);
writeFileSync(join(OUT, "0001_baseline.sql"), lines.join("\n"));

// ---------- 0002: gobierno CMS ----------
const CMS = "provinces municipalities destinations beaches rivers parks protected_areas caves hot_springs monuments bird_species offset_projects toll_routes hotels airbnb_listings restaurants bars spas_wellness experiences tour_packages events clinics ports_marinas stadiums theme_parks golf_courses shopping_centers souvenirs artisanal_workshops coffee_experiences tour_guides travel_agencies tour_operators establecimientos historical_figures historical_events articles blog_posts routes audio_guides job_vacancies emergency_contacts offers ad_banners".split(" ");
const gov: string[] = [`-- GENERADO por scripts/gen-baseline.ts — gobierno del CMS (docs/BACKEND_API.md §4.1).
-- Todas las filas existentes quedan como 'published' para no ocultar el contenido actual.
`];
for (const name of CMS) {
  const t = tables.get(name);
  if (!t) { gov.push(`-- (omitida: ${name} no existe)`); continue; }
  const has = (c: string) => t.cols.some((x) => x.name === c);
  const adds = [
    `ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','in_review','published','archived'))`,
    `ADD COLUMN IF NOT EXISTS published_at timestamptz`,
    `ADD COLUMN IF NOT EXISTS unpublished_at timestamptz`,
    ...(has("slug") ? [] : [`ADD COLUMN IF NOT EXISTS slug text`]),
    `ADD COLUMN IF NOT EXISTS slug_history text[] NOT NULL DEFAULT '{}'`,
    `ADD COLUMN IF NOT EXISTS seo_title text`,
    `ADD COLUMN IF NOT EXISTS seo_description text`,
    `ADD COLUMN IF NOT EXISTS og_image_url text`,
    `ADD COLUMN IF NOT EXISTS canonical_url text`,
    `ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false`,
    `ADD COLUMN IF NOT EXISTS locale_default text NOT NULL DEFAULT 'es'`,
    `ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL`,
    `ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id) ON DELETE SET NULL`,
    `ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL`,
    `ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1`,
    `ADD COLUMN IF NOT EXISTS deleted_at timestamptz`,
  ];
  gov.push(`ALTER TABLE ${q(name)}\n  ${adds.join(",\n  ")};`);
  gov.push(`UPDATE ${q(name)} SET published_at = COALESCE(published_at, ${has("created_at") ? "created_at" : "now()"}) WHERE status = 'published' AND published_at IS NULL;`);
  gov.push(`CREATE INDEX IF NOT EXISTS ${q(`idx_${name}_status`)} ON ${q(name)} (status) WHERE deleted_at IS NULL;`);
  gov.push(`CREATE INDEX IF NOT EXISTS ${q(`idx_${name}_slug`)} ON ${q(name)} (slug);\n`);
}
writeFileSync(join(OUT, "0002_cms_governance.sql"), gov.join("\n"));

console.log(`0001_baseline.sql: ${tables.size} tablas (${mysqlCount} de MySQL, ${inferredTables} inferidas del mock, ${inferred} columnas del mock)`);
console.log(`FKs omitidas: ${fkSkipped.length}`, fkSkipped.slice(0, 10));
const noPk = names.filter((n) => { const t = tables.get(n)!; return !t.cols.some((c) => /PRIMARY KEY/i.test(c.def)) && !t.tableConstraints.some((c) => /^PRIMARY KEY/i.test(c)); });
console.log("Sin PK:", noPk.join(", ") || "ninguna");
