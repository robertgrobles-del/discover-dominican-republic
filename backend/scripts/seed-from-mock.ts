// Carga los datos de desarrollo desde src/integrations/supabase/mockDb.json (snapshot de los datos reales del portal).
// NO toca src/data/*.ts (contenido estático del frontend): eso se migrará por colección más adelante.
// Uso: npm run db:seed   (o `npm run db:reset` para recrear el esquema y sembrar).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { v5 as uuidv5, validate as isUuid } from "uuid";
import { hashPassword } from "../src/modules/auth/password.js";

const MOCK = fileURLToPath(new URL("../../src/integrations/supabase/mockDb.json", import.meta.url));
const NS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // namespace fijo → mapeo determinista de ids no-UUID
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd";

interface ColInfo { data_type: string; udt_name: string; is_nullable: "YES" | "NO"; column_default: string | null }

const mock = JSON.parse(readFileSync(MOCK, "utf8")) as Record<string, unknown>;
const pool = new pg.Pool({ connectionString: url, max: 1 });
const client = await pool.connect();

const remapped = new Map<string, number>();
const stats: { table: string; rows: number; inserted: number; skipped: number; firstError?: string }[] = [];
const uuidOf = (table: string, v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v);
  if (isUuid(s)) return s;
  remapped.set(table, (remapped.get(table) ?? 0) + 1);
  return uuidv5(s, NS);
};

function coerce(table: string, col: ColInfo, v: unknown): unknown {
  if (v === undefined) return undefined;
  if (v === null) return null;
  switch (col.data_type) {
    case "uuid": return uuidOf(table, v);
    case "jsonb": case "json": return JSON.stringify(v);
    case "ARRAY": return Array.isArray(v) ? v : typeof v === "string" ? (v.startsWith("[") ? safeJson(v) : [v]) : [v];
    case "boolean": return v === 1 || v === "1" || v === true || v === "true";
    case "integer": case "smallint": case "bigint": case "numeric": case "double precision": case "real": {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : null;
    }
    case "date": case "timestamp with time zone": case "timestamp without time zone": {
      const t = Date.parse(String(v));
      return Number.isNaN(t) ? null : String(v);
    }
    default: return typeof v === "object" ? JSON.stringify(v) : String(v);
  }
}
const safeJson = (s: string): unknown[] => { try { const x = JSON.parse(s); return Array.isArray(x) ? x : [x]; } catch { return [s]; } };

try {
  const colsRes = await client.query<ColInfo & { table_name: string; column_name: string }>(
    `SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
       FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`,
  );
  const schema = new Map<string, Map<string, ColInfo>>();
  for (const r of colsRes.rows) {
    if (!schema.has(r.table_name)) schema.set(r.table_name, new Map());
    schema.get(r.table_name)!.set(r.column_name, r);
  }

  // Las FKs y triggers (updated_at, auditoría) se desactivan sólo durante la carga; la integridad se verifica al final.
  await client.query("SET session_replication_role = replica");
  await client.query("BEGIN");

  for (const [table, rowsRaw] of Object.entries(mock)) {
    if (!Array.isArray(rowsRaw) || rowsRaw.length === 0 || typeof rowsRaw[0] !== "object") continue;
    const cols = schema.get(table);
    if (!cols) { stats.push({ table, rows: rowsRaw.length, inserted: 0, skipped: rowsRaw.length, firstError: "tabla inexistente en el esquema" }); continue; }
    const s = { table, rows: rowsRaw.length, inserted: 0, skipped: 0, firstError: undefined as string | undefined };
    for (const raw of rowsRaw as Record<string, unknown>[]) {
      // Un valor nulo en una columna con DEFAULT se omite para que el default aplique (p. ej. filas del mock sin id)
      const names = Object.keys(raw).filter((k) => cols.has(k) && !((raw[k] === null || raw[k] === "") && cols.get(k)!.column_default !== null));
      const values = names.map((k) => coerce(table, cols.get(k)!, raw[k]));
      // NOT NULL sin valor ni default → se omite la fila
      const missing = [...cols].find(([n, c]) => c.is_nullable === "NO" && c.column_default === null && (!names.includes(n) || values[names.indexOf(n)] === null));
      if (missing) { s.skipped++; s.firstError ??= `falta ${missing[0]} (NOT NULL)`; continue; }
      await client.query("SAVEPOINT r");
      try {
        await client.query(`INSERT INTO ${JSON.stringify(table)} (${names.map((n) => JSON.stringify(n)).join(",")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(",")}) ON CONFLICT DO NOTHING`, values);
        s.inserted++;
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT r");
        s.skipped++; s.firstError ??= (e as Error).message.slice(0, 120);
      }
      await client.query("RELEASE SAVEPOINT r");
    }
    stats.push(s);
  }

  // Cuentas de autenticación de marcador para perfiles sembrados (sin contraseña utilizable: no pueden iniciar sesión).
  const orphan = await client.query(`
    INSERT INTO users (id, email, password_hash)
    SELECT p.id, p.id || '@seed.invalid', '!' FROM profiles p
    WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.id)
    ON CONFLICT DO NOTHING`);
  // Administrador de desarrollo (sólo fuera de producción) para probar el panel y los endpoints protegidos.
  if (process.env.NODE_ENV !== "production") {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@descubre.local";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin-Descubre-2026!";
    const adminId = uuidv5("admin@descubre.local", NS);
    await client.query(
      `INSERT INTO users (id, email, password_hash, email_verified_at, terms_accepted_at) VALUES ($1, $2, $3, now(), now())
       ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`, [adminId, adminEmail, await hashPassword(adminPassword)]);
    await client.query("INSERT INTO profiles (id, display_name, role) VALUES ($1, 'Administrador', 'admin') ON CONFLICT (id) DO NOTHING", [adminId]);
    for (const role of ["admin", "editor", "user"]) await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role) ON CONFLICT DO NOTHING", [adminId, role]);
    console.log(`  administrador de desarrollo: ${adminEmail} (contraseña en SEED_ADMIN_PASSWORD o la de ejemplo del README)`);
  }
  await client.query("COMMIT");
  await client.query("SET session_replication_role = DEFAULT");

  // Verificación de integridad referencial
  const fks = await client.query<{ conname: string; tbl: string; ref: string; cols: string[]; refcols: string[] }>(`
    SELECT c.conname, c.conrelid::regclass::text AS tbl, c.confrelid::regclass::text AS ref,
           ARRAY(SELECT attname FROM pg_attribute WHERE attrelid = c.conrelid AND attnum = ANY(c.conkey)) AS cols,
           ARRAY(SELECT attname FROM pg_attribute WHERE attrelid = c.confrelid AND attnum = ANY(c.confkey)) AS refcols
      FROM pg_constraint c WHERE c.contype = 'f'`);
  const orphans: string[] = [];
  for (const f of fks.rows) {
    if (f.cols.length !== 1) continue;
    const r = await client.query(`SELECT count(*)::int AS n FROM ${f.tbl} t WHERE t.${JSON.stringify(f.cols[0])} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ${f.ref} r WHERE r.${JSON.stringify(f.refcols[0])} = t.${JSON.stringify(f.cols[0])})`);
    if (r.rows[0].n > 0) orphans.push(`${f.tbl}.${f.cols[0]} → ${f.ref}: ${r.rows[0].n} huérfanas`);
  }

  const ok = stats.filter((s) => s.inserted > 0);
  console.log(`Sembrado: ${ok.length} tablas con datos, ${ok.reduce((n, s) => n + s.inserted, 0)} filas.`);
  for (const s of stats.filter((x) => x.skipped > 0)) console.log(`  ⚠ ${s.table}: ${s.skipped}/${s.rows} omitidas (${s.firstError})`);
  if (remapped.size) console.log(`  ids no-UUID convertidos (uuid v5): ${[...remapped].map(([t, n]) => `${t}=${n}`).join(", ")}`);
  console.log(`  cuentas de marcador creadas: ${orphan.rowCount}`);
  if (orphans.length) console.log("  ⚠ referencias huérfanas (datos del mock):\n    " + orphans.slice(0, 15).join("\n    "));
} catch (e) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("Error sembrando:", (e as Error).message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
