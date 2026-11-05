// Herramientas de la base de staging.
//
//   node staging/db.mjs build
//       Genera staging/descubre-staging.sqlite con las tablas de schema.sql (para importarla en Turso).
//
//   node staging/db.mjs admin <correo> <contraseña> [admin|editor]
//       Crea o actualiza un usuario del panel. Con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en el entorno lo
//       escribe directo en Turso; sin ellas, lo escribe en el archivo .sqlite local.
import { readFileSync, rmSync } from "node:fs";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const here = (f) => fileURLToPath(new URL(f, import.meta.url));
const SQLITE = here("./descubre-staging.sqlite");
const schema = readFileSync(here("./schema.sql"), "utf8");

// Mismo formato que hashPassword() en api/_core.ts.
const hashPassword = (pw, salt = randomBytes(16)) => `scrypt$${salt.toString("hex")}$${scryptSync(pw, salt, 64).toString("hex")}`;

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "build") {
  rmSync(SQLITE, { force: true });
  const db = createClient({ url: `file:${SQLITE}` });
  // Turso solo acepta subir bases en modo WAL; el modo queda grabado en la cabecera del archivo.
  await db.execute("PRAGMA journal_mode = WAL");
  await db.executeMultiple(schema);
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)"); // todo dentro del .sqlite, sin depender del -wal
  const tables = (await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")).rows.map((r) => r.name);
  db.close();
  console.log(`Creado ${SQLITE}\nTablas: ${tables.join(", ")}`);
} else if (cmd === "admin") {
  const [email, password, role = "admin"] = args;
  if (!email?.includes("@") || !password || password.length < 12 || !["admin", "editor"].includes(role)) {
    console.error("Uso: node staging/db.mjs admin <correo> <contraseña de 12+ caracteres> [admin|editor]");
    process.exit(1);
  }
  const remote = process.env.TURSO_DATABASE_URL;
  const db = createClient(remote ? { url: remote, authToken: process.env.TURSO_AUTH_TOKEN } : { url: `file:${SQLITE}` });
  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, roles) VALUES (?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, roles = excluded.roles`,
    args: [randomUUID(), email.trim().toLowerCase(), hashPassword(password), JSON.stringify([role])],
  });
  db.close();
  console.log(`Usuario ${email} (${role}) guardado en ${remote ? "Turso" : SQLITE}`);
} else {
  console.error("Comandos: build | admin <correo> <contraseña> [admin|editor]");
  process.exit(1);
}
