import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
const ns = `t${tag}`;
let n = 0;
const uniq = () => `i1${Date.now().toString(36)}${n++}@test.local`;

describe("traducciones", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string, editorEmail: string;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role: string) => {
    const email = uniq();
    if (role === "editor") editorEmail = email;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  const put = (locale: string, strings: object, extra: object = {}, token = admin) => call("PUT", `/admin/i18n/dictionary/${locale}`, { token, payload: { strings, ...extra } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor");
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("diccionario de la interfaz", () => {
    it("sólo el admin edita; el editor y los anónimos no", async () => {
      expect((await put("es", { [ns]: { a: "x" } }, {}, editor)).statusCode).toBe(403);
      expect((await call("PUT", "/admin/i18n/dictionary/es", { payload: { strings: {} } })).statusCode).toBe(401);
    });

    it("sirve el idioma pedido con respaldo en español, filtra por espacio y admite ETag", async () => {
      expect((await put("es", { [ns]: { hola: "Hola", adios: "Adiós", solo_es: "Sólo en español" }, [`${ns}b`]: { otro: "Otro" } })).statusCode).toBe(200);
      expect((await put("en", { [ns]: { hola: "Hello", adios: "Goodbye" } })).statusCode).toBe(200);
      const en = json(await call("GET", `/i18n/dictionary/en?ns=${ns}`)).data;
      expect(en).toMatchObject({ locale: "en", namespace: ns, strings: { [ns]: { hola: "Hello", adios: "Goodbye", solo_es: "Sólo en español" } } });
      expect(Object.keys(en.strings)).toEqual([ns]);
      const strict = json(await call("GET", `/i18n/dictionary/en?ns=${ns}&fallback=false`)).data.strings[ns];
      expect(strict).toEqual({ hola: "Hello", adios: "Goodbye" });
      expect(json(await call("GET", `/i18n/dictionary/fr?ns=${ns}`)).data.strings[ns].hola).toBe("Hola"); // sin francés: cae al español
      const res = await call("GET", `/i18n/dictionary/en?ns=${ns}`);
      expect(res.headers["content-language"]).toBe("en");
      const etag = res.headers.etag as string;
      expect(etag).toBeTruthy();
      expect((await call("GET", `/i18n/dictionary/en?ns=${ns}`, { headers: { "if-none-match": etag } })).statusCode).toBe(304);
      expect((await call("GET", "/i18n/dictionary/xx")).statusCode).toBe(400);
      expect((await call("GET", "/i18n/dictionary/en?ns=Mal%20Espacio")).statusCode).toBe(400);
    });

    it("actualiza, borra y rechaza texto con código", async () => {
      await put("en", { [ns]: { hola: "Hi there" } }, { delete: [{ ns, key: "adios" }] });
      const en = json(await call("GET", `/i18n/dictionary/en?ns=${ns}&fallback=false`)).data.strings[ns];
      expect(en).toEqual({ hola: "Hi there" });
      for (const bad of ["<script>alert(1)</script>", "x <iframe src=y>", "javascript:alert(1)", '<a onclick="x">']) {
        const res = await put("en", { [ns]: { malo: bad } });
        expect(res.statusCode, bad).toBe(400);
      }
      expect(json(await call("GET", `/i18n/dictionary/en?ns=${ns}&fallback=false`)).data.strings[ns].malo).toBeUndefined();
      expect((await put("en", { "Mal Espacio": { a: "x" } })).statusCode).toBe(400);
      expect((await put("en", { [ns]: { a: "x".repeat(2001) } })).statusCode).toBe(400);
      expect((await put("zz", { [ns]: { a: "x" } })).statusCode).toBe(400);
    });

    it("una llamada con errores no deja cambios a medias", async () => {
      const before = json(await call("GET", `/i18n/dictionary/en?ns=${ns}&fallback=false`)).data.strings[ns];
      await put("en", { [ns]: { bueno: "Good", malo: "<script>x</script>" } });
      expect(json(await call("GET", `/i18n/dictionary/en?ns=${ns}&fallback=false`)).data.strings[ns]).toEqual(before);
    });

    it("la lista de idiomas informa la cobertura de la interfaz", async () => {
      const list = json(await call("GET", "/i18n/locales")).data as { code: string; default: boolean; ui_strings: number; ui_coverage: number }[];
      expect(list.map((l) => l.code)).toEqual(["es", "en", "fr", "de", "pt", "it"]);
      expect(list.find((l) => l.code === "es")).toMatchObject({ default: true, ui_coverage: 100 });
      expect(list.find((l) => l.code === "en")!.ui_strings).toBeGreaterThanOrEqual(1);
      expect(list.find((l) => l.code === "it")!.ui_coverage).toBe(0);
      expect(list.find((l) => l.code === "en")!.ui_coverage).toBeLessThanOrEqual(100);
    });
  });

  describe("traducciones de contenido", () => {
    let cave: { id: string; slug: string };
    beforeAll(async () => {
      cave = json(await call("POST", "/admin/caves", { token: editor, payload: { name: `Cueva ${tag}`, short_description: "Una cueva profunda", description: "Descripción larga" } })).data;
      await call("POST", `/admin/caves/${cave.id}/publish`, { token: admin });
    });
    afterAll(async () => { await call("POST", `/admin/caves/${cave.id}/unpublish`, { token: admin }); });

    it("el editor guarda campos traducidos y la API pública los usa con ?lang=", async () => {
      const put1 = await call("PUT", `/admin/translations/caves/${cave.id}/en`, { token: editor, payload: { fields: { name: `Cave ${tag}`, short_description: "A deep cave" } } });
      expect(put1.statusCode).toBe(200);
      expect(json(put1).data).toEqual({ saved: 2, removed: 0 });
      const en = json(await call("GET", `/caves/${cave.slug}?lang=en`)).data;
      expect(en.name).toBe(`Cave ${tag}`);
      expect(en.short_description).toBe("A deep cave");
      expect(json(await call("GET", `/caves/${cave.slug}?lang=fr`)).data.name).toBe(`Cueva ${tag}`); // sin traducción: cae al español
      const list = json(await call("GET", "/admin/translations?entity_type=caves&locale=en&per_page=200", { token: editor }));
      expect(list.data.filter((x: { entity_id: string }) => x.entity_id === cave.id)).toHaveLength(2);
      expect(list.data.every((x: { status: string }) => x.status === "human")).toBe(true);
    });

    it("valida el tipo, los campos, el idioma y la existencia", async () => {
      const bad = (path: string, payload: object) => call("PUT", `/admin/translations/${path}`, { token: editor, payload });
      expect((await bad(`caves/${cave.id}/en`, { fields: { precio_secreto: "x" } })).statusCode).toBe(400);
      expect((await bad(`caves/${cave.id}/es`, { fields: { name: "x" } })).statusCode).toBe(400); // el español es el idioma base
      expect((await bad(`caves/${cave.id}/en`, { fields: {} })).statusCode).toBe(400);
      expect((await bad(`planetas/${cave.id}/en`, { fields: { name: "x" } })).statusCode).toBe(400);
      expect((await bad("caves/99999999-9999-4999-8999-999999999999/en", { fields: { name: "x" } })).statusCode).toBe(404);
      expect((await call("PUT", `/admin/translations/caves/${cave.id}/en`, { payload: { fields: { name: "x" } } })).statusCode).toBe(401);
    });

    it("un texto vacío borra la traducción y una edición posterior reemplaza la anterior", async () => {
      await call("PUT", `/admin/translations/caves/${cave.id}/de`, { token: editor, payload: { fields: { name: "Höhle" } } });
      await call("PUT", `/admin/translations/caves/${cave.id}/de`, { token: editor, payload: { fields: { name: "Große Höhle" } } });
      expect(json(await call("GET", `/caves/${cave.slug}?lang=de`)).data.name).toBe("Große Höhle");
      const res = await call("PUT", `/admin/translations/caves/${cave.id}/de`, { token: editor, payload: { fields: { name: "  " } } });
      expect(json(res).data).toEqual({ saved: 0, removed: 1 });
      expect(json(await call("GET", `/caves/${cave.slug}?lang=de`)).data.name).toBe(`Cueva ${tag}`);
    });

    it("las traducciones automáticas quedan pendientes hasta que un editor las revisa", async () => {
      await pool.query("INSERT INTO entity_translations (entity_type, entity_id, language, field_name, translation_text, status) VALUES ('caves', $1, 'pt', 'name', 'Caverna automática', 'machine'), ('caves', $1, 'pt', 'short_description', 'Uma caverna', 'machine')", [cave.id]);
      const pending = json(await call("GET", "/admin/translations?status=machine&locale=pt&entity_type=caves&per_page=200", { token: editor })).data.filter((x: { entity_id: string }) => x.entity_id === cave.id);
      expect(pending).toHaveLength(2);
      expect(json(await call("POST", `/admin/translations/caves/${cave.id}/pt/review`, { token: editor })).data.reviewed).toBe(2);
      expect((await pool.query("SELECT DISTINCT status FROM entity_translations WHERE entity_id = $1 AND language = 'pt'", [cave.id])).rows.map((r) => r.status)).toEqual(["reviewed"]);
    });

    it("la traducción automática con IA nunca pisa lo humano, deja lo nuevo como `machine` y usa la caché", async () => {
      await call("PUT", `/admin/translations/caves/${cave.id}/de`, { token: editor, payload: { fields: { name: "Große Höhle" } } });
      const auto = json(await call("POST", `/admin/translations/caves/${cave.id}/auto`, { token: editor, payload: { locales: ["fr", "de", "pt"], fields: ["name"] } })).data;
      expect(auto).toMatchObject({ translated: 1, skipped_human: 2, skipped_existing: 0, stopped_reason: null });   // sólo fr; de (humana) y pt (revisada) intactas
      const fr = (await pool.query("SELECT translation_text, status FROM entity_translations WHERE entity_id = $1 AND language = 'fr' AND field_name = 'name'", [cave.id])).rows[0];
      expect(fr).toEqual({ translation_text: `[fr] Cueva ${tag}`, status: "machine" });
      expect(json(await call("GET", `/caves/${cave.slug}?lang=de`)).data.name).toBe("Große Höhle");
      const again = json(await call("POST", `/admin/translations/caves/${cave.id}/auto`, { token: editor, payload: { locales: ["fr"], fields: ["name"] } })).data;
      expect(again).toMatchObject({ translated: 0, skipped_existing: 1 });
      const forced = json(await call("POST", `/admin/translations/caves/${cave.id}/auto`, { token: editor, payload: { locales: ["fr"], fields: ["name"], overwrite: true } })).data;
      expect(forced).toMatchObject({ translated: 1, cached: 1 });   // el texto no cambió: sale de la caché de IA, sin costo
      expect(json(await call("GET", "/admin/translations?status=machine&locale=fr&entity_type=caves&per_page=200", { token: editor })).data.some((x: { entity_id: string }) => x.entity_id === cave.id)).toBe(true);
      expect((await call("POST", `/admin/translations/caves/${cave.id}/auto`, { payload: {} })).statusCode).toBe(401);
      expect((await call("POST", `/admin/translations/caves/${cave.id}/auto`, { token: editor, payload: { locales: ["es"] } })).statusCode).toBe(400);
      expect((await call("POST", `/admin/translations/planetas/${cave.id}/auto`, { token: editor })).statusCode).toBeGreaterThanOrEqual(400);
    });

    it("el lote traduce los registros publicados que aún no tienen el idioma", async () => {
      const done = json(await call("POST", "/admin/translations/auto-batch", { token: editor, payload: { collection: "caves", locale: "it", limit: 5 } })).data;
      expect(done.records).toBeGreaterThanOrEqual(1);
      expect(done.translated).toBeGreaterThanOrEqual(1);
      expect((await pool.query("SELECT 1 FROM entity_translations WHERE entity_id = $1 AND language = 'it' AND status = 'machine'", [cave.id])).rowCount).toBeGreaterThan(0);
      // Sin proveedor de IA el lote no puede trabajar.
      const none = await makeApp({ AI_PROVIDER: "none" });
      try {
        const tok = json(await none.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: editorEmail, password: PW } })).data.tokens.access_token;
        const res = await none.inject({ method: "POST", url: "/api/v1/admin/translations/auto-batch", payload: { collection: "caves", locale: "en", limit: 1 }, headers: { authorization: `Bearer ${tok}` } });
        expect([503, 200]).toContain(res.statusCode);
        const single = await none.inject({ method: "POST", url: `/api/v1/admin/translations/caves/${cave.id}/auto`, payload: { locales: ["en"], fields: ["short_description"], overwrite: true }, headers: { authorization: `Bearer ${tok}` } });
        expect(single.statusCode).toBe(503);
        expect(json(single).error.details.code).toBe("AI_DISABLED");
      } finally { await none.close(); }
    });

    it("la cobertura por colección e idioma guía el plan de traducción", async () => {
      const cov = json(await call("GET", "/admin/translations/coverage", { token: editor })).data;
      const caves = cov.collections.find((c: { collection: string }) => c.collection === "caves");
      expect(caves.records).toBeGreaterThanOrEqual(1);
      expect(caves.locales.en).toBeGreaterThan(0);
      expect(Object.keys(caves.locales)).toEqual(["en", "fr", "de", "pt", "it"]);
      for (const v of Object.values(caves.locales) as number[]) expect(v).toBeLessThanOrEqual(100);
      expect(typeof cov.pending_review).toBe("number");
      expect((await call("GET", "/admin/translations/coverage")).statusCode).toBe(401);
    });
  });
});
