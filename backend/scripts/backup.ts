/**
 * Respaldo y verificación de restauración de PostgreSQL (requiere `pg_dump`, `pg_restore` y `psql` en el PATH).
 *
 *   npm run db:backup                 # respaldo comprimido en BACKUP_DIR (por defecto ./backups) y rotación
 *   npm run db:backup -- --verify     # además lo restaura en una base temporal y compara conteos (prueba real de restauración)
 *   npm run db:backup -- --keep 14    # conserva los 14 más recientes (por defecto 14)
 *
 * El respaldo NO incluye los archivos subidos (MEDIA_DIR): cópialos aparte (o usa almacenamiento S3 con versionado).
 * Guarda los respaldos cifrados y fuera del servidor de la base de datos; una copia sin probar no es un respaldo.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("Falta DATABASE_URL"); process.exit(1); }
const dir = path.resolve(process.env.BACKUP_DIR ?? "backups");
const args = process.argv.slice(2);
const verify = args.includes("--verify");
const keep = Number(args[args.indexOf("--keep") + 1]) || 14;

const db = new URL(url);
const dbName = db.pathname.slice(1);
const conn = (name: string) => { const u = new URL(url); u.pathname = `/${name}`; return u.toString(); };
const run = (cmd: string, a: string[]) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"], env: { ...process.env, PGPASSWORD: decodeURIComponent(db.password) } }).toString();

mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = path.join(dir, `${dbName}-${stamp}.dump`);
console.log(`Respaldando ${dbName} → ${file}`);
run("pg_dump", ["--format=custom", "--compress=9", "--no-owner", "--no-privileges", "--file", file, conn(dbName)]);
console.log(`Listo (${(statSync(file).size / 1024 / 1024).toFixed(1)} MB)`);

// Rotación: se borran los más antiguos.
const all = readdirSync(dir).filter((f) => f.startsWith(`${dbName}-`) && f.endsWith(".dump")).sort();
for (const old of all.slice(0, Math.max(0, all.length - keep))) { rmSync(path.join(dir, old)); console.log(`Eliminado por rotación: ${old}`); }

if (verify) {
  const tmp = `${dbName}_restore_check`;
  const admin = new pg.Client({ connectionString: conn("postgres") });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${tmp}"`);
    await admin.query(`CREATE DATABASE "${tmp}"`);
    run("pg_restore", ["--no-owner", "--no-privileges", "--exit-on-error", "--dbname", conn(tmp), file]);
    const count = async (name: string) => {
      const c = new pg.Client({ connectionString: conn(name) });
      await c.connect();
      const t = (await c.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'")).rows[0].n;
      const u = (await c.query("SELECT count(*)::int AS n FROM users")).rows[0].n;
      const m = (await c.query("SELECT count(*)::int AS n FROM schema_migrations")).rows[0]?.n ?? 0;
      await c.end();
      return { tables: t, users: u, migrations: m };
    };
    const [a, b] = [await count(dbName), await count(tmp)];
    console.log("Origen:", a, "Restaurada:", b);
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error("La restauración no coincide con el origen");
    console.log("✔ Restauración verificada");
  } finally {
    await admin.query(`DROP DATABASE IF EXISTS "${tmp}"`).catch(() => undefined);
    await admin.end();
  }
}
