import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "../src/db/migrator.js";

describe("esquema y migraciones", () => {
  let pool: pg.Pool;
  beforeAll(() => { pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); });

  it("es idempotente: una segunda ejecución no aplica nada", async () => {
    const r = await migrate(pool);
    expect(r.applied).toEqual([]);
    expect(r.skipped.length).toBeGreaterThanOrEqual(6);
  });

  it("crea el catálogo completo de tablas del portal", async () => {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
    expect(rows[0].n).toBeGreaterThanOrEqual(138);
    for (const t of ["users", "user_roles", "provinces", "destinations", "reservations", "operator_listings", "store_products", "admin_activity_logs"]) {
      const r = await pool.query("SELECT to_regclass($1) AS t", [t]);
      expect(r.rows[0].t, t).not.toBeNull();
    }
  });

  it("el enum de roles incluye los roles de la matriz de permisos", async () => {
    const { rows } = await pool.query("SELECT unnest(enum_range(NULL::app_role))::text AS r");
    expect(rows.map((x) => x.r)).toEqual(["admin", "editor", "moderator", "partner", "ambassador", "user"]);
  });

  it("has_role funciona sobre user_roles", async () => {
    await pool.query("INSERT INTO users (id, email, password_hash) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'rol@test.local', 'x')");
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'editor')");
    const yes = await pool.query("SELECT has_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'editor') AS v");
    const no = await pool.query("SELECT has_role('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin') AS v");
    expect([yes.rows[0].v, no.rows[0].v]).toEqual([true, false]);
    await pool.query("DELETE FROM users WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'");
  });

  it("las tablas de contenido tienen gobierno CMS (estado, versión, borrado lógico, SEO)", async () => {
    const { rows } = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'beaches'");
    const cols = rows.map((r) => r.column_name);
    for (const c of ["status", "published_at", "version", "deleted_at", "seo_title", "slug_history", "created_by"]) expect(cols, c).toContain(c);
  });

  it("updated_at se actualiza solo", async () => {
    await pool.query("INSERT INTO provinces (id, name, slug, status) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Temporal', 'temporal', 'draft')");
    const before = (await pool.query("SELECT updated_at FROM provinces WHERE slug = 'temporal'")).rows[0].updated_at as Date;
    await new Promise((r) => setTimeout(r, 20));
    await pool.query("UPDATE provinces SET region = 'X' WHERE slug = 'temporal'");
    const after = (await pool.query("SELECT updated_at FROM provinces WHERE slug = 'temporal'")).rows[0].updated_at as Date;
    expect(after.getTime()).toBeGreaterThan(before.getTime());
    await pool.query("DELETE FROM provinces WHERE slug = 'temporal'");
  });

  it("la auditoría registra insert, update y delete en tablas sensibles", async () => {
    const uid = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    await pool.query("INSERT INTO users (id, email, password_hash) VALUES ($1, 'audit@test.local', 'x')", [uid]);
    await pool.query("DELETE FROM admin_activity_logs WHERE entity_name = 'ambassadors'");
    await pool.query("INSERT INTO ambassadors (id, referral_code) VALUES ($1, 'AUDIT1')", [uid]);
    await pool.query("UPDATE ambassadors SET sales_count = 3 WHERE id = $1", [uid]);
    await pool.query("DELETE FROM ambassadors WHERE id = $1", [uid]);
    const { rows } = await pool.query("SELECT action_type FROM admin_activity_logs WHERE entity_name = 'ambassadors' ORDER BY id");
    expect(rows.map((r) => r.action_type)).toEqual(["INSERT", "UPDATE", "DELETE"]);
    await pool.query("DELETE FROM users WHERE id = $1", [uid]);
  });

  it("rechaza una migración ya aplicada cuya contenido cambió (checksum)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mig-"));
    writeFileSync(join(dir, "0001_x.sql"), "CREATE TABLE IF NOT EXISTS _t1 (id int);");
    const scratch = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    try {
      await scratch.query("DELETE FROM schema_migrations WHERE name = '0001_x.sql'");
      await migrate(scratch, { dir });
      writeFileSync(join(dir, "0001_x.sql"), "CREATE TABLE IF NOT EXISTS _t1 (id int, extra int);");
      await expect(migrate(scratch, { dir })).rejects.toThrow(/contenido cambió/);
    } finally {
      await scratch.query("DROP TABLE IF EXISTS _t1");
      await scratch.query("DELETE FROM schema_migrations WHERE name = '0001_x.sql'");
      await scratch.end();
    }
  });
});
