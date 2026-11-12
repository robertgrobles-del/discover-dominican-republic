import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eticketPage, handle, hashPassword, w3cDate, type ApiRequest } from "./index";

const SECRET = "x".repeat(40);
const dir = mkdtempSync(join(tmpdir(), "staging-api-"));
let db: Client;

const call = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
  handle({ method, path: `/api/v1${path}`, headers, body } as ApiRequest, db, SECRET, false);
const login = async (email: string, password: string) => call("POST", "/auth/login", { email, password });
type Res = Awaited<ReturnType<typeof call>>;
type Session = { user: unknown; tokens: { access_token: string; expires_in: number } };
const data = <T = Record<string, unknown>>(r: Res) => (r.body as { data: T }).data;
const bearer = (r: Res) => ({ authorization: `Bearer ${data<Session>(r).tokens.access_token}` });

beforeAll(async () => {
  db = createClient({ url: `file:${join(dir, "t.sqlite")}` });
  await db.executeMultiple(readFileSync(join(__dirname, "../staging/schema.sql"), "utf8"));
  // Las mismas migraciones que se aplican en Turso con `node staging/db.mjs migrate`.
  const migrations = join(__dirname, "../staging/migrations");
  for (const f of readdirSync(migrations).sort()) await db.executeMultiple(readFileSync(join(migrations, f), "utf8"));
  await db.execute({ sql: "INSERT INTO users (id, email, password_hash, roles) VALUES ('u1', 'admin@x.do', ?, '[\"admin\"]')", args: [hashPassword("clave-segura-123")] });
  await db.execute({ sql: "INSERT INTO users (id, email, password_hash, roles) VALUES ('u2', 'turista@x.do', ?, '[]')", args: [hashPassword("clave-segura-123")] });
});
// En Windows el archivo puede seguir bloqueado tras cerrar: la carpeta temporal se deja si no se puede borrar.
afterAll(() => { db.close(); try { rmSync(dir, { recursive: true, force: true }); } catch { /* EBUSY */ } });

describe("auth", () => {
  it("inicia sesión con el contrato del backend completo y deja la cookie de refresco", async () => {
    const r = await login("ADMIN@x.do", "clave-segura-123");
    expect(r.status).toBe(200);
    expect(data<Session>(r).user).toMatchObject({ email: "admin@x.do", roles: ["admin"] });
    expect(data<Session>(r).tokens.expires_in).toBe(900);
    expect(r.headers?.["Set-Cookie"]).toMatch(/HttpOnly; SameSite=Strict/);

    const cookie = r.headers!["Set-Cookie"].split(";")[0];
    const refreshed = await call("POST", "/auth/refresh", undefined, { cookie });
    expect(refreshed.status).toBe(200);
    expect((await call("GET", "/auth/me", undefined, bearer(r))).status).toBe(200);
  });

  it("rechaza credenciales malas y frena la fuerza bruta", async () => {
    expect((await login("admin@x.do", "mala")).status).toBe(401);
    expect((await login("nadie@x.do", "mala")).status).toBe(401);
    for (let i = 0; i < 8; i++) await login("bruta@x.do", "mala");
    expect((await login("bruta@x.do", "mala")).status).toBe(429);
  });

  it("no acepta un token de refresco como token de acceso ni uno manipulado", async () => {
    const r = await login("admin@x.do", "clave-segura-123");
    const refresh = r.headers!["Set-Cookie"].split(";")[0].split("=")[1];
    expect((await call("GET", "/auth/me", undefined, { authorization: `Bearer ${refresh}` })).status).toBe(401);
    const token = data<Session>(r).tokens.access_token;
    expect((await call("GET", "/auth/me", undefined, { authorization: `Bearer ${token.slice(0, -2)}xx` })).status).toBe(401);
  });

  it("niega el panel a quien no es admin ni editor", async () => {
    const r = await login("turista@x.do", "clave-segura-123");
    expect((await call("GET", "/admin/provinces", undefined, bearer(r))).status).toBe(403);
    expect((await call("GET", "/admin/provinces")).status).toBe(401);
  });
});

describe("usuarios", () => {
  it("solo un admin gestiona usuarios; nunca expone el hash", async () => {
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    const c = await call("POST", "/admin/users", { email: "Editora@X.do", password: "otra-clave-larga", role: "editor", display_name: "Ana" }, admin);
    expect(c.status).toBe(201);
    expect(data(c)).toMatchObject({ email: "editora@x.do", roles: ["editor"], display_name: "Ana" });
    expect(JSON.stringify((await call("GET", "/admin/users", undefined, admin)).body)).not.toContain("scrypt");

    expect((await call("POST", "/admin/users", { email: "editora@x.do", password: "otra-clave-larga" }, admin)).status).toBe(409);
    expect((await call("POST", "/admin/users", { email: "corta@x.do", password: "corta" }, admin)).status).toBe(422);
    expect((await call("POST", "/admin/users", { email: "rol@x.do", password: "otra-clave-larga", role: "dios" }, admin)).status).toBe(422);

    const editor = bearer(await login("editora@x.do", "otra-clave-larga"));
    expect((await call("GET", "/admin/users", undefined, editor)).status).toBe(403);
    expect((await call("GET", "/admin/news", undefined, editor)).status).toBe(200);

    const id = data(c).id as string;
    await call("PATCH", `/admin/users/${id}`, { password: "clave-nueva-larga" }, admin);
    expect((await login("editora@x.do", "clave-nueva-larga")).status).toBe(200);
    expect((await call("DELETE", `/admin/users/${id}`, undefined, admin)).status).toBe(204);
  });

  it("no deja borrarse a sí mismo ni quedarse sin administradores", async () => {
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    expect((await call("DELETE", "/admin/users/u1", undefined, admin)).status).toBe(422);
    expect((await call("PATCH", "/admin/users/u1", { role: "editor" }, admin)).status).toBe(422);
  });
});

describe("contenido público", () => {
  it("la landing ve solo lo publicado y sin sesión", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    await call("POST", "/admin/provinces", { slug: "publica", name: "Pública", region: "sur", status: "published" }, auth);
    await call("POST", "/admin/provinces", { slug: "borrador", name: "Borrador", region: "sur" }, auth);
    await call("POST", "/admin/news", { slug: "nota-publica", title: "Nota", status: "published" }, auth);
    await call("POST", "/admin/news", { slug: "nota-borrador", title: "Borrador" }, auth);

    const p = await call("GET", "/public/provinces");
    expect(p.headers?.["Cache-Control"]).toContain("s-maxage");
    expect(data<{ slug: string }[]>(p).map((r) => r.slug)).toEqual(["publica"]);
    expect(data<{ name: string }>(await call("GET", "/public/provinces/publica")).name).toBe("Pública");
    expect((await call("GET", "/public/provinces/borrador")).status).toBe(404);
    expect(data<{ slug: string }[]>(await call("GET", "/public/news")).map((r) => r.slug)).toEqual(["nota-publica"]);
  });

  it("guarda el tipo de publicación y rechaza tipos desconocidos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    expect((await call("POST", "/admin/news", { slug: "x", title: "X", post_type: "otro" }, auth)).status).toBe(422);
    await call("POST", "/admin/news", { slug: "promo", title: "Promo", post_type: "patrocinado", sponsor: "Marca", status: "published" }, auth);
    const [n] = data<{ post_type: string; sponsor: string }[]>(await call("GET", "/public/news"));
    expect([n.post_type, n.sponsor]).toEqual(["patrocinado", "Marca"]);
  });
});

describe("territorio: provincias, municipios y destinos", () => {
  it("la semilla carga las 32 provincias y sus municipios como borrador, sin publicar nada", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const provs = data<{ slug: string; status: string }[]>(await call("GET", "/admin/provinces", undefined, auth));
    expect(provs.filter((p) => p.status === "draft").length).toBeGreaterThanOrEqual(32);
    const munis = data<{ slug: string; province_id: string }[]>(await call("GET", "/admin/municipalities", undefined, auth));
    expect(munis.length).toBeGreaterThan(150);
    expect(data<{ slug: string }[]>(await call("GET", "/public/provinces")).map((p) => p.slug)).not.toContain("santo-domingo");
  });

  it("elegir el municipio completa la provincia y rechaza combinaciones que no encajan", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const provs = data<{ id: string; slug: string }[]>(await call("GET", "/admin/provinces", undefined, auth));
    const sd = provs.find((p) => p.slug === "santo-domingo")!.id;
    const samana = provs.find((p) => p.slug === "samana")!.id;

    const v = await call("POST", "/admin/venues", { slug: "playa-boca-chica-prueba", name: "Playa de Boca Chica", municipality_id: "boca-chica" }, auth);
    expect(v.status).toBe(201);
    expect(data(v).province_id).toBe(sd);
    expect((await call("POST", "/admin/venues", { slug: "mal-sitio", name: "X", province_id: samana, municipality_id: "boca-chica" }, auth)).status).toBe(422);

    const d = await call("POST", "/admin/destinations", { slug: "destino-prueba", name: "Destino", municipality_id: "boca-chica" }, auth);
    expect(d.status).toBe(201);
    expect(data(d).province_id).toBe(sd);
    const e = await call("POST", "/admin/events", { slug: "evento-ubicado", name: "Fiesta", destination_id: data(d).id }, auth);
    expect(data(e).municipality_id).toBe("boca-chica");
    expect(data(e).province_id).toBe(sd);

    // Una provincia con municipios no se borra; un municipio borrado deja el contenido solo con la provincia.
    expect((await call("DELETE", `/admin/provinces/${sd}`, undefined, auth)).status).toBe(409);
    await call("PUT", `/admin/provinces/${sd}`, { slug: "santo-domingo", name: "Santo Domingo", region: "santo-domingo", status: "published", tagline: "La capital", highlights: ["Zona Colonial"] }, auth);
    await call("PUT", "/admin/municipalities/boca-chica", { slug: "boca-chica", name: "Boca Chica", province_id: sd, status: "published" }, auth);
    const pub = data<{ tagline: string; territory: { municipalities: { slug: string }[] } }>(await call("GET", "/public/provinces/santo-domingo"));
    expect(pub.tagline).toBe("La capital");
    expect(pub.territory.municipalities.map((m) => m.slug)).toEqual(["boca-chica"]);
    expect((await call("DELETE", `/admin/destinations/${data(d).id}`, undefined, auth)).status).toBe(204);
    expect(data(await call("GET", `/admin/events/${data(e).id}`, undefined, auth)).destination_id).toBeNull();
  });
});

describe("fechas del sitemap", () => {
  it("pasa las fechas de SQLite a W3C y descarta las no válidas", () => {
    expect(w3cDate("2026-11-11 22:48:38")).toBe("2026-11-11T22:48:38.000Z");
    expect(w3cDate("2026-11-10T08:00:00.123Z")).toBe("2026-11-10T08:00:00.123Z");
    expect(w3cDate("ayer")).toBeNull();
    expect(w3cDate(null)).toBeNull();
  });
});

describe("edición en lote", () => {
  it("cambia varias fichas a la vez, valida cada una y rechaza campos no permitidos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const munis = data<{ id: string; slug: string; province_id: string }[]>(await call("GET", "/admin/municipalities", undefined, auth));
    const ids = munis.filter((m) => ["boca-chica", "guerra"].includes(m.slug)).map((m) => m.id);
    const r = await call("POST", "/admin/municipalities/bulk", { ids, patch: { status: "published" } }, auth);
    expect(data<{ updated: number }>(r).updated).toBe(ids.length);
    const after = data<{ id: string; status: string }[]>(await call("GET", "/admin/municipalities", undefined, auth)).filter((m) => ids.includes(m.id));
    expect(after.every((m) => m.status === "published")).toBe(true);

    expect((await call("POST", "/admin/municipalities/bulk", { ids, patch: { name: "X" } }, auth)).status).toBe(422);
    const wrong = await call("POST", "/admin/municipalities/bulk", { ids, patch: { province_id: "no-existe" } }, auth);
    expect(data<{ updated: number; errors: unknown[] }>(wrong)).toMatchObject({ updated: 0 });
    expect(data<{ errors: unknown[] }>(wrong).errors).toHaveLength(ids.length);
    const tourist = bearer(await login("turista@x.do", "clave-segura-123"));
    expect((await call("POST", "/admin/municipalities/bulk", { ids, patch: { status: "draft" } }, tourist)).status).toBe(403);
  });
});

describe("provincias y noticias", () => {
  it("crea, edita, lista y borra; valida y detecta slugs repetidos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const p = await call("POST", "/admin/provinces", { slug: "samana-prueba", name: "Samaná", region: "norte", latitude: 19.2 }, auth);
    expect(p.status).toBe(201);
    const id = data(p).id as string;

    expect((await call("POST", "/admin/provinces", { slug: "samana-prueba", name: "Otra", region: "norte" }, auth)).status).toBe(409);
    expect((await call("POST", "/admin/provinces", { slug: "Mal Slug", name: "X", region: "norte" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/provinces", { slug: "x", name: "X", region: "oeste" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/provinces", { slug: "x", name: "X", region: "sur", image_url: "javascript:alert(1)" }, auth)).status).toBe(422);

    const upd = await call("PUT", `/admin/provinces/${id}`, { slug: "samana-prueba", name: "Samaná", region: "norte", status: "published" }, auth);
    expect(data(upd).status).toBe("published");

    const n = await call("POST", "/admin/news", { slug: "ballenas-2027", title: "Llegan las ballenas", province_id: id, status: "published" }, auth);
    expect(n.status).toBe(201);
    expect(data(n).published_at).toBeTruthy();
    expect((await call("POST", "/admin/news", { slug: "otra", title: "X", province_id: "no-existe" }, auth)).status).toBe(422);

    expect(data<{ slug: string }[]>(await call("GET", "/admin/news", undefined, auth)).map((r) => r.slug)).toContain("ballenas-2027");
    expect((await call("DELETE", `/admin/provinces/${id}`, undefined, auth)).status).toBe(204);
    expect((await call("GET", `/admin/provinces/${id}`, undefined, auth)).status).toBe(404);
  });
});

describe("categorías, campos editoriales e imágenes", () => {
  it("mantiene categorías y no deja borrar una en uso", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    expect(data<unknown[]>(await call("GET", "/admin/news-categories", undefined, auth))).toHaveLength(7);
    const c = await call("POST", "/admin/news-categories", { slug: "deportes", name: "Deportes", sort_order: 80 }, auth);
    expect(c.status).toBe(201);
    expect((await call("POST", "/admin/news-categories", { slug: "deportes", name: "Otra" }, auth)).status).toBe(409);

    const n = await call("POST", "/admin/news", { slug: "con-categoria", title: "Con categoría", category_id: data(c).id }, auth);
    expect(n.status).toBe(201);
    expect((await call("DELETE", `/admin/news-categories/${data(c).id as string}`, undefined, auth)).status).toBe(409);
    expect((await call("POST", "/admin/news", { slug: "cat-falsa", title: "X", category_id: "no-existe" }, auth)).status).toBe(422);
  });

  it("guarda los campos editoriales, conserva la fecha al editar y la landing ve la categoría", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const fields = { slug: "con-todo", title: "Con todo", category_id: "cat-cultura", image_alt: "Malecón", image_credit: "Ana", author: "Ana", source_url: "https://mitur.gob.do", featured: true, status: "published" };
    const n = await call("POST", "/admin/news", fields, auth);
    expect(data(n)).toMatchObject({ featured: 1, author: "Ana" });
    const first = data(n).published_at;
    await new Promise((r) => setTimeout(r, 15));
    const edited = await call("PUT", `/admin/news/${data(n).id as string}`, { ...fields, title: "Editada" }, auth);
    expect(data(edited).published_at).toBe(first);

    const pub = data<{ slug: string; category_name: string }[]>(await call("GET", "/public/news"));
    expect(pub[0]).toMatchObject({ slug: "con-todo", category_name: "Cultura" }); // las destacadas, primero
  });

  it("acepta solo WebP, lo sirve con caché larga y exige sesión para subir", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(16)]);
    const up = await call("POST", "/admin/media", { data: webp.toString("base64"), width: 800, height: 600 }, auth);
    expect(up.status).toBe(201);
    const url = data(up).url as string;

    const got = await call("GET", url.replace("/api/v1", ""));
    expect(got.headers?.["Content-Type"]).toBe("image/webp");
    expect(got.headers?.["Cache-Control"]).toContain("immutable");
    expect(Buffer.from(got.raw!).equals(webp)).toBe(true);

    const png = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
    expect((await call("POST", "/admin/media", { data: png.toString("base64") }, auth)).status).toBe(415);
    expect((await call("POST", "/admin/media", { data: webp.toString("base64") })).status).toBe(401);
    expect((await call("GET", "/media/no-es-un-id.webp")).status).toBe(404);
  });
});

describe("SEO de noticias", () => {
  const SHELL = `<!doctype html><html><head><title>Genérico</title><meta name="description" content="landing" />
    <meta property="og:title" content="landing" /><link rel="canonical" href="https://otro.com" />
    <script type="application/ld+json">{"@type":"WebSite"}</script></head><body><div id="root"></div></body></html>`;
  const render = (path: string) =>
    handle({ method: "GET", path: `/api/v1${path}`, headers: { host: "x.test" }, body: undefined } as ApiRequest, db, SECRET, false, async () => SHELL);
  const html = (r: Res) => Buffer.from(r.raw!).toString("utf8");

  it("sirve la noticia con metadatos propios, datos estructurados y texto escapado", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    await call("POST", "/admin/news", {
      slug: "ballenas-seo", title: "Ballenas <script>alert(1)</script> en Samaná", excerpt: "Llegan en enero.",
      body: "## Temporada\n\nLas **ballenas** jorobadas llegan a la bahía. ![foto](https://x.do/a.webp)",
      category_id: "cat-naturaleza", seo_description: "Guía de la temporada de ballenas en Samaná.", status: "published",
    }, auth);

    const r = await render("/render/noticias/ballenas-seo");
    expect(r.status).toBe(200);
    expect(r.headers?.["Content-Type"]).toContain("text/html");
    const page = html(r);
    expect(page).not.toContain("<script>alert(1)</script>");
    expect(page).toContain("&lt;script&gt;");
    expect(page).toContain('<link rel="canonical" href="https://descubrerepdom.com/noticias/ballenas-seo" />');
    expect(page).toContain('content="Guía de la temporada de ballenas en Samaná."');
    expect(page).toContain('"@type":"NewsArticle"');
    expect(page).toContain('"articleSection":"Naturaleza"');
    expect(page).toContain('"@type":"WebSite"');           // los JSON-LD del sitio se conservan
    expect(page).not.toContain("https://otro.com");         // la canónica genérica se sustituye
    expect(page.match(/<title>/g)).toHaveLength(1);
    expect(page).toContain("Las ballenas jorobadas llegan a la bahía."); // resumen sin Markdown en #root
  });

  it("404 con noindex, listado, sitemap, RSS y detalle en JSON", async () => {
    const miss = await render("/render/noticias/no-existe");
    expect(miss.status).toBe(404);
    expect(html(miss)).toContain('content="noindex, follow"');

    expect(html(await render("/render/noticias"))).toContain('href="/noticias/ballenas-seo"');
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const fest = data(await call("POST", "/admin/events", { slug: "festival-sitemap", name: "Festival del sitemap", start_date: "2099-01-10", status: "published" }, auth)).id;
    const hidden = data(await call("POST", "/admin/events", { slug: "evento-oculto", name: "Oculto", start_date: "2099-01-10" }, auth)).id;
    const map = html(await render("/sitemap.xml"));
    expect(map).toContain("<loc>https://descubrerepdom.com/evento/festival-sitemap</loc>");
    expect(map).not.toContain("evento-oculto");
    expect(map).toContain("<loc>https://descubrerepdom.com/provincia/santo-domingo</loc>"); // publicada en la prueba de territorio
    expect(map).not.toContain("/provincia/pedernales"); // borrador
    expect(html(await render("/llms.txt"))).toContain("[Festival del sitemap](https://descubrerepdom.com/evento/festival-sitemap)");
    for (const id of [fest, hidden]) await call("DELETE", `/admin/events/${id}`, undefined, auth); // la base es compartida
    expect(map).toContain("<loc>https://descubrerepdom.com/noticias/ballenas-seo</loc>");
    expect(map).not.toContain("nota-borrador");
    expect(map).toContain("<loc>https://descubrerepdom.com/marina/cap-cana</loc>");
    expect(map).toContain("<loc>https://descubrerepdom.com/puerto/amber-cove</loc>");
    expect(html(await render("/rss.xml"))).toContain("<category>Naturaleza</category>");

    expect(data(await call("GET", "/public/news/ballenas-seo"))).toMatchObject({ slug: "ballenas-seo", category_name: "Naturaleza" });
    expect((await call("GET", "/public/news/nota-borrador")).status).toBe(404);
  });

  it("agentes de IA: llms.txt, Markdown de cada noticia con URLs absolutas y enlace alternativo", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const img = "/api/v1/media/11111111-2222-3333-4444-555555555555.webp";
    await call("POST", "/admin/news", { slug: "para-ia", title: "Para IA", excerpt: "Resumen.", body: "Texto ![a](" + img + ")", status: "published" }, auth);

    const llms = html(await render("/llms.txt"));
    expect(llms.startsWith("# Descubre RD\n\n> ")).toBe(true);
    expect(llms).toContain("](https://descubrerepdom.com/noticias/para-ia.md): Resumen.");
    expect(llms).not.toContain("nota-borrador");

    const md = await render("/md/noticias/para-ia");
    expect(md.headers?.["Content-Type"]).toContain("text/markdown");
    expect(html(md)).toContain("](https://descubrerepdom.com" + img + ")");
    expect(html(md)).toContain("- URL: https://descubrerepdom.com/noticias/para-ia");
    expect(html(await render("/llms-full.txt"))).toContain("# Para IA");
    expect(html(await render("/render/noticias/para-ia"))).toContain('type="text/markdown" href="https://descubrerepdom.com/noticias/para-ia.md"');
    expect((await render("/md/noticias/no-existe")).status).toBe(404);
  });
});

describe("formularios públicos", () => {
  const post = (path: string, body: unknown, ip: string) =>
    handle({ method: "POST", path: `/api/v1${path}`, headers: {}, body, ip } as ApiRequest, db, SECRET, false);
  const lead = { name: "Ana", email: "Ana@x.do", interest: "Sorteo Lector - general", source: "sorteo_lector", consent: true };
  const negocio = { type: "restaurante", name: "La Casa", contact_name: "Ana", email: "casa@x.do", phone: "+1 809 555 0000", province: "Samaná", details: { cocina: "criolla" } };

  it("registra el sorteo una vez por correo y exige consentimiento y datos válidos", async () => {
    expect((await post("/leads", lead, "1.1.1.1")).status).toBe(201);
    const again = await post("/leads", { ...lead, email: "ana@x.do" }, "1.1.1.1");
    expect(again.status).toBe(200);
    expect(data(again)).toMatchObject({ duplicate: true });
    expect((await post("/leads", { ...lead, consent: false }, "1.1.1.1")).status).toBe(422);
    expect((await post("/leads", { ...lead, email: "no-es-correo" }, "1.1.1.1")).status).toBe(422);
  });

  it("registra negocios pendientes y valida teléfono y web", async () => {
    const r = await post("/establishments/register", negocio, "2.2.2.2");
    expect(r.status).toBe(201);
    expect(data(r)).toMatchObject({ status: "pending" });
    expect((await post("/establishments/register", { ...negocio, phone: "abc" }, "2.2.2.2")).status).toBe(422);
    expect((await post("/establishments/register", { ...negocio, website: "javascript:alert(1)" }, "2.2.2.2")).status).toBe(422);
  });

  it("frena los envíos masivos desde una misma IP", async () => {
    for (let i = 0; i < 10; i++) await post("/leads", { ...lead, email: `spam${i}@x.do` }, "9.9.9.9");
    expect((await post("/leads", { ...lead, email: "spam-final@x.do" }, "9.9.9.9")).status).toBe(429);
    expect((await post("/leads", { ...lead, email: "otra-ip@x.do" }, "8.8.8.8")).status).toBe(201);
  });

  it("solo un admin ve y gestiona los datos, sin la huella de IP", async () => {
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    const list = await call("GET", "/admin/leads", undefined, admin);
    expect(list.status).toBe(200);
    expect(JSON.stringify(list.body)).not.toContain("ip_hash");
    const req = data<{ id: string; details: string }[]>(await call("GET", "/admin/establishment-requests", undefined, admin))[0];
    expect(JSON.parse(req.details)).toEqual({ cocina: "criolla" });
    expect(data(await call("PATCH", `/admin/establishment-requests/${req.id}`, { status: "approved" }, admin))).toMatchObject({ status: "approved" });

    await call("POST", "/admin/users", { email: "ed-forms@x.do", password: "clave-editor-123", role: "editor" }, admin);
    const editor = bearer(await login("ed-forms@x.do", "clave-editor-123"));
    expect((await call("GET", "/admin/leads", undefined, editor)).status).toBe(403);
  });

  it("sube fotos WebP y un menú PDF, los liga a la solicitud y no deja reutilizarlos", async () => {
    const webp = Buffer.concat([Buffer.from("RIFF\0\0\0\0WEBPVP8 "), Buffer.alloc(20)]).toString("base64");
    const pdf = Buffer.from("%PDF-1.4\n%%EOF").toString("base64");
    const photo = data<{ id: string; url: string }>(await post("/establishments/files", { kind: "photo", data: webp }, "3.3.3.3"));
    const menu = data<{ id: string; url: string }>(await post("/establishments/files", { kind: "menu", data: pdf }, "3.3.3.3"));
    expect(menu.url).toMatch(/\.pdf$/);
    expect((await post("/establishments/files", { kind: "menu", data: webp }, "3.3.3.3")).status).toBe(415);
    expect((await post("/establishments/files", { kind: "photo", data: pdf }, "3.3.3.3")).status).toBe(415);
    // Un menú no vale como foto.
    expect((await post("/establishments/register", { ...negocio, photo_ids: [menu.id] }, "3.3.3.3")).status).toBe(422);
    expect((await post("/establishments/register", { ...negocio, photo_ids: [photo.id], menu_id: menu.id }, "3.3.3.3")).status).toBe(201);
    expect((await post("/establishments/register", { ...negocio, photo_ids: [photo.id] }, "3.3.3.3")).status).toBe(422);

    const served = await handle({ method: "GET", path: `${menu.url}`, headers: {} } as ApiRequest, db, SECRET, false);
    expect(served.headers?.["Content-Type"]).toBe("application/pdf");
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    const req = data<{ id: string; photo_url: string; files: string }[]>(await call("GET", "/admin/establishment-requests", undefined, admin))[0];
    expect(req.photo_url).toBe(photo.url);
    expect(req.files.split(" ").sort()).toEqual([menu.url, photo.url].sort());
    expect((await call("DELETE", `/admin/establishment-requests/${req.id}`, undefined, admin)).status).toBe(204);
    expect((await handle({ method: "GET", path: photo.url, headers: {} } as ApiRequest, db, SECRET, false)).status).toBe(404);
  });
});

describe("fecha de publicación", () => {
  it("acepta fechas pasadas y oculta las programadas hasta su hora", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const past = await call("POST", "/admin/news", { slug: "pasada", title: "Pasada", status: "published", published_at: "2024-03-15T10:00:00Z" }, auth);
    expect(data(past).published_at).toBe("2024-03-15T10:00:00.000Z");
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await call("POST", "/admin/news", { slug: "programada", title: "Programada", status: "published", published_at: future }, auth);

    const pub = data<{ slug: string }[]>(await call("GET", "/public/news")).map((n) => n.slug);
    expect(pub).toContain("pasada");
    expect(pub).not.toContain("programada");
    expect((await call("GET", "/public/news/programada")).status).toBe(404);
    expect((await call("POST", "/admin/news", { slug: "mala", title: "X", published_at: "ayer" }, auth)).status).toBe(422);
  });
});

describe("traducciones del CMS", () => {
  const req = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}, lang?: string) =>
    ({ method, path: `/api/v1${path}`, headers, body, lang }) as ApiRequest;
  const shell = async () => '<!doctype html><html lang="es"><head><title>x</title></head><body><div id="root"></div></body></html>';

  it("guarda solo campos permitidos y la API pública los sirve en el idioma pedido", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const n = await call("POST", "/admin/news", { slug: "multi", title: "Ballenas", excerpt: "Llegan.", category_id: "cat-naturaleza", status: "published" }, auth);
    const id = data(n).id as string;
    const put = await call("PUT", `/admin/translations/news/${id}/en`, { data: { title: "Whales", excerpt: "", hack: "x" } }, auth);
    expect(data(put)).toEqual({ title: "Whales" });
    await call("PUT", "/admin/translations/news_categories/cat-naturaleza/en", { data: { name: "Nature" } }, auth);
    expect((await call("PUT", `/admin/translations/news/${id}/xx`, { data: { title: "?" } }, auth)).status).toBe(422);
    expect(data(await call("GET", `/admin/translations/news/${id}`, undefined, auth))).toMatchObject({ en: { title: "Whales" } });

    const en = data(await handle(req("GET", "/public/news/multi", undefined, {}, "en"), db, SECRET, false));
    expect(en).toMatchObject({ title: "Whales", excerpt: "Llegan.", category_name: "Nature" }); // lo no traducido, en español
    expect(data(await call("GET", "/public/news/multi"))).toMatchObject({ title: "Ballenas" });

    const page = Buffer.from((await handle(req("GET", "/render/noticias/multi", undefined, { host: "x" }, "en"), db, SECRET, false, shell)).raw!).toString();
    expect(page).toContain('<html lang="en"');
    expect(page).toContain('hreflang="en" href="https://descubrerepdom.com/noticias/multi?lang=en"');
    expect(page).toContain('hreflang="x-default"');
    expect(page).toContain("<title>Whales | Descubre RD</title>");
    // Un idioma sin traducción sirve la versión española (canónica sin ?lang)
    const fr = Buffer.from((await handle(req("GET", "/render/noticias/multi", undefined, { host: "x" }, "fr"), db, SECRET, false, shell)).raw!).toString();
    expect(fr).toContain('<link rel="canonical" href="https://descubrerepdom.com/noticias/multi" />');
  });

  it("traduce con el proveedor configurado y avisa si falta la clave", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const fake = async (fields: Record<string, string>, to: string[]) => Object.fromEntries(to.map((l) => [l, Object.fromEntries(Object.keys(fields).map((k) => [k, `${l}:${fields[k]}`]))]));
    const r = await handle(req("POST", "/admin/translate", { fields: { title: "Hola", body: "" }, to: ["en", "xx"] }, auth), db, SECRET, false, shell, fake);
    expect(data(r)).toEqual({ en: { title: "en:Hola" } });
    expect((await handle(req("POST", "/admin/translate", { fields: {} }, auth), db, SECRET, false, shell, fake)).status).toBe(422);

    const saved = { g: process.env.GEMINI_API_KEY, a: process.env.ANTHROPIC_API_KEY, p: process.env.TRANSLATION_PROVIDER };
    delete process.env.GEMINI_API_KEY; delete process.env.ANTHROPIC_API_KEY; delete process.env.TRANSLATION_PROVIDER;
    const missing = await call("POST", "/admin/translate", { fields: { title: "Hola" } }, auth);
    expect(missing.status).toBe(503);
    expect(JSON.stringify(missing.body)).toContain("GEMINI_API_KEY");
    Object.assign(process.env, Object.fromEntries(Object.entries({ GEMINI_API_KEY: saved.g, ANTHROPIC_API_KEY: saved.a, TRANSLATION_PROVIDER: saved.p }).filter(([, v]) => v)));
  });
});

describe("biblioteca de medios", () => {
  it("lista sin bytes, edita el texto alternativo y no borra una imagen en uso", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(16)]).toString("base64");
    const libre = data(await call("POST", "/admin/media", { data: webp, alt: "Playa" }, auth));
    const usada = data(await call("POST", "/admin/media", { data: webp }, auth));

    const list = data<{ id: string; url: string; alt: string | null; bytes?: unknown }[]>(await call("GET", "/admin/media", undefined, auth));
    const item = list.find((x) => x.id === libre.id)!;
    expect(item).toMatchObject({ alt: "Playa", url: `/api/v1/media/${libre.id as string}.webp` });
    expect(item.bytes).toBeUndefined();

    expect(data(await call("PATCH", `/admin/media/${libre.id as string}`, { alt: "Playa Rincón" }, auth))).toMatchObject({ alt: "Playa Rincón" });

    await call("POST", "/admin/news", { slug: "con-foto", title: "Con foto", cover_url: usada.url }, auth);
    expect((await call("DELETE", `/admin/media/${usada.id as string}`, undefined, auth)).status).toBe(409);
    expect((await call("DELETE", `/admin/media/${libre.id as string}`, undefined, auth)).status).toBe(204);
    expect((await call("GET", "/admin/media")).status).toBe(401);
  });
});

describe("boletín", () => {
  it("se suscribe solo con el correo y no duplica", async () => {
    const post = (body: unknown) => handle({ method: "POST", path: "/api/v1/leads", headers: {}, body, ip: "7.7.7.7" } as ApiRequest, db, SECRET, false);
    expect((await post({ email: "lector@x.do", source: "newsletter", consent: true })).status).toBe(201);
    expect(data(await post({ email: "LECTOR@x.do", source: "newsletter", consent: true }))).toMatchObject({ duplicate: true });
    expect((await post({ email: "sin-nombre@x.do", source: "sorteo_lector", consent: true })).status).toBe(422); // el sorteo sí pide nombre
  });
});

describe("guía del e-Ticket", () => {
  it("saca de public/e-ticket.md las preguntas y los pasos para los datos estructurados", () => {
    const page = eticketPage(readFileSync(join(__dirname, "..", "public", "e-ticket.md"), "utf8"));
    const [faq, howTo] = page.jsonLd as { mainEntity?: unknown[]; step?: unknown[] }[];
    expect(faq.mainEntity).toHaveLength(7);
    expect(howTo.step).toHaveLength(5);
    expect(page.body).toContain("¿Tiene algún costo?");
  });
});

describe("roles al estilo WordPress", () => {
  it("autor y colaborador solo tocan sus noticias; el colaborador no publica", async () => {
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    for (const role of ["autor", "colaborador"]) {
      await call("POST", "/admin/users", { email: `${role}@x.do`, password: "clave-larga-rol", role }, admin);
    }
    const autor = bearer(await login("autor@x.do", "clave-larga-rol"));
    const colab = bearer(await login("colaborador@x.do", "clave-larga-rol"));
    const ajena = data(await call("POST", "/admin/news", { slug: "ajena", title: "Ajena" }, admin)).id as string;

    expect((await call("POST", "/admin/provinces", { slug: "p-rol", name: "P", region: "sur" }, autor)).status).toBe(403);
    expect((await call("PUT", `/admin/news/${ajena}`, { slug: "ajena", title: "Cambio" }, autor)).status).toBe(403);
    const mia = await call("POST", "/admin/news", { slug: "del-autor", title: "Mía", status: "published" }, autor);
    expect(mia.status).toBe(201);

    expect((await call("POST", "/admin/news", { slug: "c-pub", title: "X", status: "published" }, colab)).status).toBe(403);
    const borrador = data(await call("POST", "/admin/news", { slug: "c-borr", title: "Borrador" }, colab)).id as string;
    expect((await call("PUT", `/admin/news/${borrador}`, { slug: "c-borr", title: "Editado" }, colab)).status).toBe(200);
    expect((await call("DELETE", `/admin/news/${data(mia).id}`, undefined, colab)).status).toBe(403);
    expect((await call("POST", "/admin/media", { data: "" }, colab)).status).toBe(403);
    expect((await call("GET", "/admin/news", undefined, colab)).status).toBe(200);
  });
});

describe("ficha de provincia", () => {
  it("guarda listas JSON y colores, y rechaza formatos inválidos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const ok = await call("POST", "/admin/provinces", {
      slug: "ficha", name: "Ficha", region: "este", color_primary: "#0b7290",
      municipalities: [{ name: "Higüey", description: "Capital" }], places: [], hero_images: "[\"https://x.do/a.jpg\"]",
    }, auth);
    expect(ok.status).toBe(201);
    expect(JSON.parse(String(data(ok).municipalities))[0].name).toBe("Higüey");
    expect(data(ok).places).toBeNull();
    expect((await call("POST", "/admin/provinces", { slug: "f2", name: "F", region: "este", color_accent: "rojo" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/provinces", { slug: "f3", name: "F", region: "este", gallery: "{no" }, auth)).status).toBe(422);
  });
});

describe("formulario de contacto", () => {
  it("guarda cada mensaje y solo el admin los ve", async () => {
    const msg = { name: "Ana", email: "ana@x.do", subject: "Hola", message: "Quiero anunciar mi hotel" };
    expect((await call("POST", "/contact", msg)).status).toBe(201);
    expect((await call("POST", "/contact", msg)).status).toBe(201);
    expect((await call("POST", "/contact", { ...msg, message: "corto" })).status).toBe(422);
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    expect(data<unknown[]>(await call("GET", "/admin/contact-messages", undefined, admin))).toHaveLength(2);
  });
});

describe("eventos", () => {
  it("valida fechas y la API pública solo sirve los publicados", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    expect((await call("POST", "/admin/events", { slug: "e1", name: "E", start_date: "5 oct" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/events", { slug: "borrador", name: "Borrador" }, auth)).status).toBe(201);
    const ok = await call("POST", "/admin/events", { slug: "carnaval", name: "Carnaval", start_date: "2027-02-07", start_time: "14:00", status: "published" }, auth);
    expect(ok.status).toBe(201);
    expect(data<unknown[]>(await call("GET", "/public/events"))).toHaveLength(1);
    expect((await call("GET", "/public/events/carnaval")).status).toBe(200);
    expect((await call("GET", "/public/events/borrador")).status).toBe(404);
  });
});

describe("formularios protegidos y eventos del público", () => {
  it("descarta el campo trampa, rechaza otros orígenes y deja el evento en borrador", async () => {
    const ev = { title: "Festival del Merengue", start_date: "2099-07-20", location: "Malecón, Santo Domingo", description: "Tres noches de merengue en vivo frente al mar.", organizer_name: "Ana", organizer_email: "ana@x.do" };
    expect((await call("POST", "/events/submissions", { ...ev, hp_website: "spam" })).status).toBe(201);
    expect((await call("POST", "/contact", { name: "A", email: "a@x.do", message: "Hola, esto es spam" }, { origin: "https://malo.com", host: "descubre.do" })).status).toBe(403);
    expect((await call("POST", "/events/submissions", ev)).status).toBe(201);
    const admin = bearer(await login("admin@x.do", "clave-segura-123"));
    const rows = data<{ status: string; submitter_email: string | null }[]>(await call("GET", "/admin/events", undefined, admin)).filter((r) => r.submitter_email);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "draft", submitter_email: "ana@x.do" });
  });

  it("un evento terminado deja de salir en lo público", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    await call("POST", "/admin/events", { slug: "pasado", name: "Pasado", start_date: "2020-01-01", end_date: "2020-01-02", end_time: "18:00", status: "published" }, auth);
    expect((await call("GET", "/public/events/pasado")).status).toBe(404);
    expect(data<{ slug: string }[]>(await call("GET", "/public/events")).map((e) => e.slug)).not.toContain("pasado");
  });
});

describe("recintos", () => {
  it("trae los del código como borrador, valida campos y se enlaza con eventos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const seeded = data<{ slug: string; status: string; amenities: string | null }[]>(await call("GET", "/admin/venues", undefined, auth));
    expect(seeded.length).toBeGreaterThanOrEqual(14);
    expect(seeded.every((v) => v.status === "draft")).toBe(true);
    expect(JSON.parse(String(seeded.find((v) => v.slug === "estadio-quisqueya")?.amenities)).length).toBeGreaterThan(0);
    expect((await call("POST", "/admin/venues", { slug: "malo", name: "M", category: "nave" }, auth)).status).toBe(422);
    const v = await call("POST", "/admin/venues", { slug: "sala-x", name: "Sala X", category: "teatro", latitude: 18.47, longitude: -69.9, capacity: 800,
      how_to_get: { byCar: "Por la 27", otro: "se ignora" } }, auth);
    expect(v.status).toBe(201);
    expect(JSON.parse(String(data(v).how_to_get))).toEqual({ byCar: "Por la 27" });
    expect((await call("POST", "/admin/events", { slug: "ev-x", name: "Ev", venue_id: "no-existe" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/events", { slug: "ev-y", name: "Ev", venue_type: "luna" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/events", { slug: "ev-playa", name: "Ev", venue: "Playa Macao", venue_type: "playa", venue_room: "Zona norte" }, auth)).status).toBe(201);
    const ev = await call("POST", "/admin/events", { slug: "ev-x", name: "Ev", venue_id: data(v).id }, auth);
    expect(ev.status).toBe(201);
    await call("DELETE", `/admin/venues/${data(v).id}`, undefined, auth);
    expect(data(await call("GET", `/admin/events/${data(ev).id}`, undefined, auth)).venue_id).toBeNull();
  });
});

describe("playas", () => {
  it("trae las 15 playas publicadas, valida ubicación/enums, soporta lote y filtra borradores de sitemap/llms", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const seeded = data<{ id: string; slug: string; status: string }[]>(await call("GET", "/admin/beaches", undefined, auth));
    expect(seeded.length).toBeGreaterThanOrEqual(15);
    expect(seeded.every((b) => b.status === "published")).toBe(true);

    const pubList = data<{ slug: string; province_name: string | null }[]>(await call("GET", "/public/beaches"));
    expect(pubList.some((b) => b.slug === "playa-bavaro" && b.province_name === "La Altagracia")).toBe(true);
    expect((await call("GET", "/public/beaches/playa-bavaro")).status).toBe(200);

    // Enums y LocationPicker
    expect((await call("POST", "/admin/beaches", { slug: "bad-type", name: "Mala", beach_type: "desierto" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/beaches", { slug: "bad-loc", name: "Mala", province_id: "samana", destination_id: "bavaro" }, auth)).status).toBe(422);

    // Borrador: no sale en público, sitemap ni llms.txt
    const draftRes = await call("POST", "/admin/beaches", {
      slug: "playa-borrador",
      name: "Playa Borrador",
      province_id: "barahona",
      municipality_id: "paraiso",
      beach_type: "virgen",
      wave_intensity: "calma",
      crowd_level: "baja",
      access_type: "publico",
      sand_type: "Arena blanca",
      water_color: "Turquesa",
      parking_available: 1,
      lifeguard_on_duty: 0,
      activities: ["Snorkel", "Natación"],
      amenities: ["Estacionamiento"],
      gallery: [{ url: "https://example.com/p.jpg", alt: "Playa Borrador" }],
      latitude: 18.1,
      longitude: -71.05,
      rating: 4.8,
      is_featured: 1,
      status: "draft",
    }, auth);
    expect(draftRes.status).toBe(201);
    const draftId = data(draftRes).id as string;

    expect((await call("GET", "/public/beaches/playa-borrador")).status).toBe(404);
    expect(data<{ slug: string }[]>(await call("GET", "/public/beaches")).map((b) => b.slug)).not.toContain("playa-borrador");

    const smBefore = new TextDecoder().decode((await call("GET", "/sitemap.xml")).raw);
    const llmsBefore = new TextDecoder().decode((await call("GET", "/llms.txt")).raw);
    expect(smBefore).toContain("/playas</loc>");
    expect(smBefore).not.toContain("/estado-playas</loc>"); // en vista previa del equipo
    expect(smBefore).toContain("/playa/playa-bavaro</loc>");
    expect(smBefore).not.toContain("/playa/playa-borrador</loc>");
    expect(llmsBefore).toContain("/playa/playa-bavaro):");
    expect(llmsBefore).not.toContain("playa-borrador");

    // Publicar en lote → aparece en público, sitemap y llms.txt
    const bulkRes = await call("POST", "/admin/beaches/bulk", { ids: [draftId], patch: { status: "published" } }, auth);
    expect(bulkRes.status).toBe(200);
    expect((await call("GET", "/public/beaches/playa-borrador")).status).toBe(200);

    const smAfter = new TextDecoder().decode((await call("GET", "/sitemap.xml")).raw);
    const llmsAfter = new TextDecoder().decode((await call("GET", "/llms.txt")).raw);
    expect(smAfter).toContain("/playa/playa-borrador</loc>");
    expect(llmsAfter).toContain("/playa/playa-borrador):");

    expect((await call("DELETE", `/admin/beaches/${draftId}`, undefined, auth)).status).toBe(204);
  });
});
