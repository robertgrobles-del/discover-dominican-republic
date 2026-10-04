/**
 * Respaldo y verificación de restauración de PostgreSQL (requiere `pg_dump`, `pg_restore` y `psql` en el PATH).
 *
 *   npm run db:backup                 # respaldo comprimido en BACKUP_DIR (por defecto ./backups) y rotación
 *   npm run db:backup -- --verify     # además lo restaura en una base temporal y compara conteos (prueba real de restauración)
 *   npm run db:backup -- --keep 14    # conserva los 14 más recientes (por defecto 14)
 *   npm run db:backup -- --upload     # además lo cifra y lo sube a un bucket externo (BACKUP_S3_*, BACKUP_ENCRYPTION_KEY)
 *   npm run db:backup -- --decrypt respaldo.dump.enc   # descifra una copia bajada del bucket (no necesita la base)
 *
 * El respaldo NO incluye los archivos subidos (MEDIA_DIR): cópialos aparte (o usa almacenamiento S3 con versionado).
 * Una copia en el mismo servidor que la base no protege de perderlo: `--upload` la saca cifrada (ver
 * `src/lib/backup-offsite.ts`). Y una copia sin probar no es un respaldo: usa `--verify`.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { decryptFile, encryptFile, offsiteConfigFromEnv, uploadEncrypted } from "../src/lib/backup-offsite.js";
import path from "node:path";
import pg from "pg";

const cli = process.argv.slice(2);
if (cli.includes("--decrypt")) {
  const source = cli[cli.indexOf("--decrypt") + 1];
  if (!source || !process.env.BACKUP_ENCRYPTION_KEY) { console.error("Uso: BACKUP_ENCRYPTION_KEY=… npm run db:backup -- --decrypt <archivo.dump.enc>"); process.exit(1); }
  const target = source.replace(/\.enc$/, "") === source ? `${source}.dump` : source.replace(/\.enc$/, "");
  decryptFile(source, target);
  console.log(`Descifrado en ${target}. Restaurar: pg_restore --no-owner --clean --if-exists --dbname <url> ${target}`);
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) { console.error("Falta DATABASE_URL"); process.exit(1); }
// Se valida antes de respaldar: una copia externa mal configurada debe fallar al principio, no después del volcado.
const offsite = cli.includes("--upload") ? offsiteConfigFromEnv() : null;
if (cli.includes("--upload") && !offsite) { console.error("--upload necesita BACKUP_S3_BUCKET, BACKUP_S3_ACCESS_KEY_ID, BACKUP_S3_SECRET_ACCESS_KEY y BACKUP_ENCRYPTION_KEY"); process.exit(1); }
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

if (offsite) {
  const encrypted = `${file}.enc`;
  try {
    encryptFile(file, encrypted);
    const up = await uploadEncrypted(offsite, encrypted);
    console.log(`✔ Copia externa cifrada: ${offsite.bucket}/${up.key} (${(up.bytes / 1024 / 1024).toFixed(1)} MB, sha256 ${up.sha256.slice(0, 16)}…)`);
  } finally {
    rmSync(encrypted, { force: true }); // la copia cifrada sólo existe para subirla
  }
}

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
