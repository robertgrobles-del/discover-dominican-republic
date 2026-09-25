import pg from "pg";
import { migrate } from "../src/db/migrator.js";

const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5434/descubre_rd";
const pool = new pg.Pool({ connectionString: url });
try {
  const reset = process.argv.includes("--reset");
  if (reset && /prod/i.test(process.env.NODE_ENV ?? "")) throw new Error("--reset está prohibido en producción");
  const r = await migrate(pool, { reset, log: (m) => console.log(m) });
  console.log(`Migraciones aplicadas: ${r.applied.length}, ya existentes: ${r.skipped.length}`);
} catch (e) {
  console.error((e as Error).message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
