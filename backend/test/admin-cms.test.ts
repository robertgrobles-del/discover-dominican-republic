import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `adm${Date.now().toString(36)}${n++}@test.local`;
const tag = Date.now().toString(36);

describe("administración: CMS, usuarios y sitio", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string; email: string };
  let editor: { token: string; id: string; email: string };
  let plain: { token: string; id: string; email: string };

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async (role?: string) => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Admin" } }));
    const id = res.data.user.id as string;
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    const token = role ? json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token : res.data.tokens.access_token;
    return { token: token as string, id, email };
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await signup("admin");
    editor = await signup("editor");
    plain = await signup();
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("CMS genérico", () => {
    let id: string;
    it("exige rol de editor, expone el esquema y crea siempre en borrador", async () => {
      expect((await call("GET", "/admin/caves")).statusCode).toBe(401);
      expect((await call("GET", "/admin/caves", { token: plain.token })).statusCode).toBe(403);
      const schema = json(await call("GET", "/admin/caves/schema", { token: editor.token })).data;
      expect(schema).toMatchObject({ entity: "caves", has_workflow: true, title_field: "name" });
      const f = (n: string) => schema.fields.find((x: { name: string }) => x.name === n);
      expect(f("name")).toMatchObject({ writable: true, type: "text" });
      expect(f("status").writable).toBe(false);
      expect(f("version").writable).toBe(false);

      const res = await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Cueva ${tag}`, short_description: "Una cueva", price_adult: 12.5, highlights: ["estalactitas"] } });
      expect(res.statusCode).toBe(201);
      const row = json(res).data;
      id = row.id;
      expect(row).toMatchObject({ status: "draft", version: 1, slug: `cueva-${tag}`, created_by: editor.id });
      // Un borrador no es público.
      expect((await call("GET", `/caves/${row.slug}`)).statusCode).toBe(404);
    });

    it("valida estrictamente: campos desconocidos, gestionados por el sistema, tipos y obligatorios", async () => {
      for (const bad of [{ name: "x", nope: 1 }, { name: "x", status: "published" }, { name: "x", version: 9 }, { name: "x", price_adult: "caro" }, { name: "x", latitude: "1" }, { name: "x", destination_id: "no-uuid" }]) {
        expect((await call("POST", "/admin/caves", { token: editor.token, payload: bad })).statusCode, JSON.stringify(bad)).toBe(400);
      }
      const noName = await call("POST", "/admin/caves", { token: editor.token, payload: { short_description: "sin nombre" } });
      expect(noName.statusCode).toBe(400);
      expect(json(noName).error.details.field).toBe("name");
      const fk = await call("POST", "/admin/caves", { token: editor.token, payload: { name: `FK ${tag}`, destination_id: "99999999-9999-4999-8999-999999999999" } });
      expect(fk.statusCode).toBe(400);
    });

    it("genera slugs únicos y guarda el historial al cambiarlos", async () => {
      const dup = json(await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Cueva ${tag}` } })).data;
      expect(dup.slug).toBe(`cueva-${tag}-2`);
      const upd = json(await call("PATCH", `/admin/caves/${id}`, { token: editor.token, payload: { version: 1, slug: `Cueva Nueva ${tag}` } })).data;
      expect(upd).toMatchObject({ slug: `cueva-nueva-${tag}`, slug_history: [`cueva-${tag}`], version: 2 });
    });

    it("concurrencia optimista: una edición con versión vieja se rechaza con la versión actual", async () => {
      const ok = await call("PATCH", `/admin/caves/${id}`, { token: editor.token, payload: { version: 2, short_description: "Editada" } });
      expect(ok.statusCode).toBe(200);
      const stale = await call("PATCH", `/admin/caves/${id}`, { token: editor.token, payload: { version: 2, short_description: "Vieja" } });
      expect(stale.statusCode).toBe(409);
      expect(json(stale).error.details).toMatchObject({ reason: "VERSION_CONFLICT", current_version: 3 });
      expect((await call("PATCH", `/admin/caves/${id}`, { token: editor.token, payload: { short_description: "sin versión" } })).statusCode).toBe(400);
      expect((await call("PATCH", "/admin/caves/99999999-9999-4999-8999-999999999999", { token: editor.token, payload: { version: 1, name: "x" } })).statusCode).toBe(404);
    });

    it("flujo editorial: el editor envía a revisión, sólo el admin publica, y lo publicado se ve; despublicar lo oculta", async () => {
      const slug = `cueva-nueva-${tag}`;
      expect((await call("POST", `/admin/caves/${id}/publish`, { token: editor.token })).statusCode).toBe(403);
      expect(json(await call("POST", `/admin/caves/${id}/submit-review`, { token: editor.token })).data.status).toBe("in_review");
      expect((await call("POST", `/admin/caves/${id}/submit-review`, { token: editor.token })).statusCode).toBe(422); // transición inválida
      const pub = json(await call("POST", `/admin/caves/${id}/publish`, { token: admin.token })).data;
      expect(pub).toMatchObject({ status: "published", reviewed_by: admin.id });
      expect(pub.published_at).toBeTruthy();
      expect((await call("GET", `/caves/${slug}`)).statusCode).toBe(200);
      expect((await call("GET", `/caves/cueva-${tag}`)).statusCode).toBeLessThan(500); // el slug viejo no rompe la API
      await call("POST", `/admin/caves/${id}/unpublish`, { token: admin.token });
      expect((await call("GET", `/caves/${slug}`)).statusCode).toBe(404);
      // Publicar con fecha futura no lo hace visible todavía.
      const future = new Date(Date.now() + 5 * 86_400_000).toISOString();
      await call("POST", `/admin/caves/${id}/publish`, { token: admin.token, payload: { publish_at: future } });
      expect((await call("GET", `/caves/${slug}`)).statusCode).toBe(404);
      await call("POST", `/admin/caves/${id}/archive`, { token: admin.token });
      expect((await pool.query("SELECT status FROM caves WHERE id = $1", [id])).rows[0].status).toBe("archived");
    });

    it("publicar por el CMS vacía la caché pública: la búsqueda refleja el cambio al instante", async () => {
      const name = `Cueva Cache B7 ${tag}`;
      const row = json(await call("POST", "/admin/caves", { token: editor.token, payload: { name, short_description: "Para probar la invalidación" } })).data;
      const q = `/search?q=${encodeURIComponent(`cache b7 ${tag}`)}&limit=5`;
      expect(json(await call("GET", q)).data.length).toBe(0); // de borrador no sale (y la respuesta vacía queda cacheada)
      await call("POST", `/admin/caves/${row.id}/publish`, { token: admin.token });
      const found = json(await call("GET", q)).data;
      expect(found.length).toBeGreaterThanOrEqual(1); // sin invalidación seguiría saliendo la respuesta vacía durante 30 s
      expect(found.some((h: { title: string }) => h.title === name)).toBe(true);
      await call("POST", `/admin/caves/${row.id}/unpublish`, { token: admin.token });
      expect(json(await call("GET", q)).data.length).toBe(0);
    });

    it("no publica registros incompletos", async () => {
      const row = json(await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Otra ${tag}` } })).data;
      await pool.query("UPDATE caves SET name = '   ' WHERE id = $1", [row.id]);
      const res = await call("POST", `/admin/caves/${row.id}/publish`, { token: admin.token });
      expect(res.statusCode).toBe(422);
      expect(json(res).error.details.code).toBe("INCOMPLETE");
    });

    it("revisiones: cada cambio deja una versión y se puede restaurar", async () => {
      const revs = json(await call("GET", `/admin/caves/${id}/revisions`, { token: editor.token })).data as { version: number; action: string }[];
      expect(revs[0]!.version).toBeGreaterThanOrEqual(6);
      expect(revs.map((x) => x.action)).toEqual(expect.arrayContaining(["create", "update", "submit_review", "publish", "unpublish", "archive"]));
      const restored = await call("POST", `/admin/caves/${id}/restore/1`, { token: editor.token });
      expect(restored.statusCode).toBe(200);
      const row = json(restored).data;
      expect(row.short_description).toBe("Una cueva"); // el valor de la versión 1
      expect(row.version).toBeGreaterThan(revs[0]!.version);
      expect((await call("POST", `/admin/caves/${id}/restore/999`, { token: editor.token })).statusCode).toBe(404);
    });

    it("lista con filtros, búsqueda, estado y borrado lógico; el borrado definitivo es del admin", async () => {
      const list = json(await call("GET", `/admin/caves?q=${encodeURIComponent(`cueva-${tag}`.replace("-", " "))}&per_page=50`, { token: editor.token }));
      expect(list.meta.total).toBeGreaterThanOrEqual(1);
      expect(json(await call("GET", "/admin/caves?status=in_review", { token: editor.token })).data.every((x: { status: string }) => x.status === "in_review")).toBe(true);
      expect((await call("GET", "/admin/caves?filter[nope]=1", { token: editor.token })).statusCode).toBe(400);
      expect((await call("GET", "/admin/caves?sort=-created_at,-name", { token: editor.token })).statusCode).toBe(200);
      expect((await call("GET", "/admin/caves?sort=password", { token: editor.token })).statusCode).toBe(400);

      const tmp = json(await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Borrar ${tag}` } })).data;
      expect((await call("DELETE", `/admin/caves/${tmp.id}`, { token: editor.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/admin/caves?deleted=true&per_page=100", { token: editor.token })).data.some((x: { id: string }) => x.id === tmp.id)).toBe(true);
      expect(json(await call("GET", "/admin/caves?per_page=100", { token: editor.token })).data.some((x: { id: string }) => x.id === tmp.id)).toBe(false);
      expect((await call("DELETE", `/admin/caves/${tmp.id}?hard=true`, { token: editor.token })).statusCode).toBe(403);
      expect((await call("DELETE", `/admin/caves/${tmp.id}?hard=true`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("GET", `/admin/caves/${tmp.id}`, { token: admin.token })).statusCode).toBe(404);
    });

    it("acciones masivas: informa qué se aplicó y qué falló", async () => {
      const ids = [] as string[];
      for (let i = 0; i < 3; i++) ids.push(json(await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Lote ${i} ${tag}` } })).data.id);
      const bad = "99999999-9999-4999-8999-999999999999";
      expect((await call("POST", "/admin/caves/bulk", { token: editor.token, payload: { ids, action: "publish" } })).statusCode).toBe(403);
      const res = json(await call("POST", "/admin/caves/bulk", { token: admin.token, payload: { ids: [...ids, bad], action: "publish" } })).data;
      expect(res.ok).toHaveLength(3);
      expect(res.failed).toEqual([{ id: bad, reason: expect.any(String) }]);
      const setf = json(await call("POST", "/admin/caves/bulk", { token: editor.token, payload: { ids, action: "set_field", field: "is_featured", value: true } })).data;
      expect(setf.ok).toHaveLength(3);
      expect((await call("POST", "/admin/caves/bulk", { token: editor.token, payload: { ids, action: "set_field", field: "status", value: "published" } })).statusCode).toBe(400);
      expect((await pool.query("SELECT bool_and(is_featured) AS f FROM caves WHERE id = ANY($1)", [ids])).rows[0].f).toBe(true);
    });

    it("importa por slug: dry-run valida sin escribir, aplica todo o nada y actualiza existentes", async () => {
      const rows = [{ name: `Imp A ${tag}`, slug: `imp-a-${tag}`, short_description: "A" }, { name: `Imp B ${tag}`, slug: `imp-b-${tag}` }];
      const count = async () => (await pool.query("SELECT count(*)::int AS n FROM caves WHERE slug LIKE $1", [`imp-%-${tag}`])).rows[0].n;
      const dry = json(await call("POST", "/admin/caves/import", { token: editor.token, payload: { rows } })).data;
      expect(dry).toEqual({ dry_run: true, inserted: 2, updated: 0 });
      expect(await count()).toBe(0);
      const broken = await call("POST", "/admin/caves/import?dry_run=false", { token: editor.token, payload: { rows: [...rows, { name: "x", rating: "mal" }] } });
      expect(broken.statusCode).toBe(422);
      expect(json(broken).error.details[0].row).toBe(3);
      expect(await count()).toBe(0);
      expect(json(await call("POST", "/admin/caves/import?dry_run=false", { token: editor.token, payload: { rows } })).data).toEqual({ dry_run: false, inserted: 2, updated: 0 });
      const again = json(await call("POST", "/admin/caves/import?dry_run=false", { token: editor.token, payload: { rows: [{ name: `Imp A ${tag}`, slug: `imp-a-${tag}`, short_description: "A2" }] } })).data;
      expect(again).toMatchObject({ inserted: 0, updated: 1 });
      expect((await pool.query("SELECT short_description FROM caves WHERE slug = $1", [`imp-a-${tag}`])).rows[0].short_description).toBe("A2");
    });

    it("exporta JSON y CSV neutralizando fórmulas", async () => {
      await call("POST", "/admin/caves", { token: editor.token, payload: { name: `=HYPERLINK("x") ${tag}`, short_description: 'con "comillas", y coma' } });
      const csv = await call("GET", "/admin/caves/export?format=csv", { token: editor.token });
      expect(csv.headers["content-type"]).toContain("text/csv");
      expect(csv.body.split("\r\n")[0]).toContain("name");
      expect(csv.body).toContain(`'=HYPERLINK`);
      expect(csv.body).toContain('"con ""comillas"", y coma"');
      expect(json(await call("GET", "/admin/caves/export?status=draft", { token: editor.token })).data.length).toBeGreaterThan(0);
    });

    it("las acciones de contenido quedan en la auditoría", async () => {
      const log = json(await call("GET", `/admin/audit-logs?entity=caves&action=cms.publish&actor=${admin.id}`, { token: admin.token })).data;
      expect(log.length).toBeGreaterThan(0);
      const csv = await call("GET", "/admin/audit-logs?format=csv&entity=caves", { token: admin.token });
      expect(csv.body.split("\r\n")[0]).toBe("id,created_at,actor_id,action,entity_type,entity_id,org_id,ip,meta");
      expect((await call("GET", "/admin/audit-logs", { token: editor.token })).statusCode).toBe(403);
    });
  });

  describe("usuarios", () => {
    it("lista con filtros y muestra el detalle (sólo admin)", async () => {
      expect((await call("GET", "/admin/users", { token: editor.token })).statusCode).toBe(403);
      const byRole = json(await call("GET", "/admin/users?role=editor&per_page=100", { token: admin.token }));
      expect(byRole.data.some((u: { id: string; roles: string[] }) => u.id === editor.id && u.roles.includes("editor"))).toBe(true);
      const q = json(await call("GET", `/admin/users?q=${encodeURIComponent(plain.email)}`, { token: admin.token }));
      expect(q.data).toHaveLength(1);
      const detail = json(await call("GET", `/admin/users/${plain.id}`, { token: admin.token })).data;
      expect(detail).toMatchObject({ email: plain.email, bookings: 0, reviews: 0 });
      expect(detail.password_hash).toBeUndefined();
      expect((await call("GET", "/admin/users/99999999-9999-4999-8999-999999999999", { token: admin.token })).statusCode).toBe(404);
    });

    it("roles: no cambia los propios ni quita al último admin, y cierra sesiones al cambiar", async () => {
      expect((await call("PUT", `/admin/users/${admin.id}/roles`, { token: admin.token, payload: { roles: ["user"] } })).statusCode).toBe(403);
      const target = await signup("editor");
      expect((await call("PUT", `/admin/users/${target.id}/roles`, { token: admin.token, payload: { roles: ["moderator", "editor"] } })).statusCode).toBe(200);
      expect((await pool.query("SELECT role::text FROM user_roles WHERE user_id = $1 ORDER BY 1", [target.id])).rows.map((x) => x.role)).toEqual(["editor", "moderator"]);
      expect((await pool.query("SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [target.id])).rowCount).toBe(0);
      expect((await call("PUT", `/admin/users/${target.id}/roles`, { token: admin.token, payload: { roles: ["jefe"] } })).statusCode).toBe(400);
      // Con un solo admin activo no se le puede quitar el rol.
      await pool.query("UPDATE users SET status = 'suspended' WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'admin') AND id <> $1", [admin.id]);
      const other = await signup("admin");
      await pool.query("UPDATE users SET status = 'suspended' WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'admin') AND id NOT IN ($1, $2)", [admin.id, other.id]);
      expect((await call("PUT", `/admin/users/${other.id}/roles`, { token: admin.token, payload: { roles: ["user"] } })).statusCode).toBe(200); // quedan 1: el propio admin
      const last = await signup("admin");
      await pool.query("UPDATE users SET status = 'suspended' WHERE id = $1", [admin.id]);
      const res = await call("PUT", `/admin/users/${admin.id}/roles`, { token: last.token, payload: { roles: ["user"] } });
      expect(res.statusCode).toBe(422);
      expect(json(res).error.details.code).toBe("LAST_ADMIN");
      await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [admin.id]);
    });

    it("suspender cierra sesiones, bloquea el acceso y se puede revertir; no aplica a uno mismo ni a admins", async () => {
      const victim = await signup();
      expect((await call("POST", `/admin/users/${admin.id}/suspend`, { token: admin.token, payload: { reason: "prueba de admin" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/users/${victim.id}/suspend`, { token: admin.token, payload: { reason: "x" } })).statusCode).toBe(400);
      expect((await call("POST", `/admin/users/${victim.id}/suspend`, { token: admin.token, payload: { reason: "Actividad fraudulenta" } })).statusCode).toBe(204);
      expect((await call("POST", "/auth/login", { payload: { email: victim.email, password: PW } })).statusCode).toBe(403);
      expect((await call("GET", "/me/profile", { token: victim.token })).statusCode).toBeGreaterThanOrEqual(401);
      const detail = json(await call("GET", `/admin/users/${victim.id}`, { token: admin.token })).data;
      expect(detail).toMatchObject({ is_suspended: true, suspension_reason: "Actividad fraudulenta" });
      expect(detail.suspensions).toHaveLength(1);
      expect((await call("POST", `/admin/users/${victim.id}/unsuspend`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("POST", "/auth/login", { payload: { email: victim.email, password: PW } })).statusCode).toBe(200);
      const anotherAdmin = await signup("admin");
      expect((await call("POST", `/admin/users/${anotherAdmin.id}/suspend`, { token: admin.token, payload: { reason: "no debería" } })).statusCode).toBe(403);
    });

    it("envía un enlace de restablecimiento de contraseña", async () => {
      const u = await signup();
      expect((await call("POST", `/admin/users/${u.id}/reset-password`, { token: admin.token })).statusCode).toBe(204);
      await app.mailer.drain();
      expect(app.mailer.last(u.email, "auth.reset_password")).toBeTruthy();
    });
  });

  describe("ajustes, redirecciones, panel y salud", () => {
    it("ajustes: sólo los públicos salen en /site/settings; el resto es del admin", async () => {
      const k = `contacto.${tag}`, priv = `interno.${tag}`;
      expect((await call("PUT", `/admin/settings/${k}`, { token: editor.token, payload: { value: {} } })).statusCode).toBe(403);
      expect((await call("PUT", `/admin/settings/${k}`, { token: admin.token, payload: { value: { email: "info@descubre.do", redes: ["ig"] }, is_public: true } })).statusCode).toBe(200);
      expect((await call("PUT", `/admin/settings/${priv}`, { token: admin.token, payload: { value: { comision: 8 } } })).statusCode).toBe(200);
      expect((await call("PUT", "/admin/settings/Mala Clave", { token: admin.token, payload: { value: 1 } })).statusCode).toBe(400);
      const pub = json(await call("GET", "/site/settings")).data;
      expect(pub[k]).toEqual({ email: "info@descubre.do", redes: ["ig"] });
      expect(pub[priv]).toBeUndefined();
      expect(json(await call("GET", `/admin/settings/${priv}`, { token: admin.token })).data.value).toEqual({ comision: 8 });
      expect((await call("DELETE", `/admin/settings/${priv}`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("GET", `/admin/settings/${priv}`, { token: admin.token })).statusCode).toBe(404);
    });

    it("documentos de contenido: los edita el equipo editorial, se leen sin sesión y cada edición sube la revisión", async () => {
      const k = `transporte-${tag}`.toLowerCase();
      expect((await call("PUT", `/admin/datasets/${k}`, { payload: { value: { rutas: [] } } })).statusCode).toBe(401);
      expect((await call("PUT", `/admin/datasets/${k}`, { token: plain.token, payload: { value: { rutas: [] } } })).statusCode).toBe(403);
      expect((await call("PUT", `/admin/datasets/${k}`, { token: editor.token, payload: { value: ["no", "es", "objeto"] } })).statusCode).toBe(400);
      expect((await call("PUT", "/admin/datasets/Mala_Clave", { token: editor.token, payload: { value: {} } })).statusCode).toBe(400);
      const created = json(await call("PUT", `/admin/datasets/${k}`, { token: editor.token, payload: { value: { rutas: [{ id: "sdq-puj", precio: 450 }] } } })).data;
      expect(created.revision).toBe(1);
      const updated = json(await call("PUT", `/admin/datasets/${k}`, { token: editor.token, payload: { value: { rutas: [{ id: "sdq-puj", precio: 500 }] } } })).data;
      expect(updated.revision).toBe(2);
      expect(json(await call("GET", `/datasets/${k}`)).data.value).toEqual({ rutas: [{ id: "sdq-puj", precio: 500 }] });
      expect(json(await call("GET", "/datasets")).data.find((d: { key: string }) => d.key === k)).toMatchObject({ key: k, revision: 2 });
      expect((await call("DELETE", `/admin/datasets/${k}`, { token: editor.token })).statusCode).toBe(403);
      expect((await call("DELETE", `/admin/datasets/${k}`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("GET", `/datasets/${k}`)).statusCode).toBe(404);
    });

    it("redirecciones: validan rutas, evitan bucles y se publican las activas", async () => {
      const a = `/viejo-${tag}`, b = `/nuevo-${tag}`;
      const create = (payload: object) => call("POST", "/admin/seo_redirections", { token: admin.token, payload });
      expect((await create({ source_path: "sin-barra", target_path: b })).statusCode).toBe(400);
      expect((await create({ source_path: a, target_path: a })).statusCode).toBe(400);
      expect((await create({ source_path: a, target_path: "http://inseguro.com" })).statusCode).toBe(400);
      const ok = await create({ source_path: a, target_path: b, redirect_type: 301 });
      expect(ok.statusCode).toBe(201);
      expect((await create({ source_path: a, target_path: "/otro" })).statusCode).toBe(409);
      expect((await create({ source_path: b, target_path: a })).statusCode).toBe(400); // bucle
      expect(json(await call("GET", "/redirects")).data).toContainEqual({ from: a, to: b, status: 301 });
      const id = json(ok).data.id;
      await call("PATCH", `/admin/seo_redirections/${id}`, { token: admin.token, payload: { is_active: false } });
      expect(json(await call("GET", "/redirects")).data.some((x: { from: string }) => x.from === a)).toBe(false);
      expect((await call("DELETE", `/admin/seo_redirections/${id}`, { token: admin.token })).statusCode).toBe(204);
    });

    it("el panel resume pendientes y contenido por estado, y la salud informa base, correo y trabajos", async () => {
      expect((await call("GET", "/admin/dashboard", { token: plain.token })).statusCode).toBe(403);
      const d = json(await call("GET", "/admin/dashboard", { token: editor.token })).data;
      expect(d.users.active).toBeGreaterThan(0);
      expect(d.pending).toHaveProperty("reviews");
      expect(d.content.caves.published).toBeGreaterThanOrEqual(0);
      expect((await call("GET", "/admin/system/health", { token: editor.token })).statusCode).toBe(403);
      const h = json(await call("GET", "/admin/system/health", { token: admin.token })).data;
      expect(h.database.ok).toBe(true);
      expect(h.payments.provider).toBe("fake");
      expect(Array.isArray(h.jobs)).toBe(true);
    });
  });
});
