import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";
import { convertValue } from "../src/modules/cms/sync.js";
import { startFakeStrapi, webhook, type FakeStrapi } from "./fake-strapi.js";
import { json, makeApp } from "./helpers.js";

const SECRET = "secreto-del-webhook-de-pruebas";
const PW = "Correcta-Clave-2026!";
let seq = 0;
const doc = (p: string) => `${p}${Date.now().toString(36)}${seq++}`;

describe("sincronización con Strapi", () => {
  let app: FastifyInstance;      // con acceso al CMS (REST) y webhook
  let plain: FastifyInstance;    // sólo webhook: usa el cuerpo del evento
  let strapi: FakeStrapi;
  let pool: pg.Pool;

  beforeAll(async () => {
    strapi = await startFakeStrapi();
    const env = { CMS_WEBHOOK_SECRET: SECRET, CMS_PUBLIC_URL: "https://cms.descubre.test" };
    app = await makeApp({ ...env, CMS_URL: strapi.url, CMS_API_TOKEN: strapi.token });
    plain = await makeApp(env);
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => {
    // Deja la base como la encontraron las demás pruebas (que cuentan filas exactas).
    for (const t of ["beaches", "hotels", "destinations", "airports", "experiences"]) {
      await pool.query(`DELETE FROM entity_translations WHERE entity_type = $1 AND entity_id IN (SELECT id FROM ${t} WHERE slug LIKE 'cms-%')`, [t]);
      await pool.query(`DELETE FROM ${t} WHERE slug LIKE 'cms-%' OR slug LIKE 'nuevo-%'`);
    }
    await pool.query("DELETE FROM cms_entries; DELETE FROM cms_sync_log");
    await pool.end(); await app.close(); await plain.close(); await strapi.close();
  });

  const hook = (event: string, model: string, entry: Record<string, unknown>, a: FastifyInstance = app, secret: string | null = SECRET) =>
    a.inject({ method: "POST", url: "/api/v1/webhooks/cms", payload: webhook(event, model, entry), headers: secret ? { "x-webhook-secret": secret } : {} });
  const get = (url: string, a: FastifyInstance = app) => a.inject({ url: `/api/v1${url}` });
  const row = async (table: string, slug: string) => (await pool.query(`SELECT * FROM ${table} WHERE slug = $1`, [slug])).rows[0];

  const destino = (over: Record<string, unknown> = {}) => {
    const documentId = doc("dest");
    return { id: 1, documentId, locale: "es", nombre: "Destino Prueba", slug: `cms-${documentId}`, region: "este", descripcionCorta: "Corta", descripcionLarga: "## Larga\n\nTexto **rico**", mejorEpoca: "Diciembre a abril",
      temperaturaPromedio: "28 °C", rating: 4.6, latitud: 18.5, longitud: -69.9, imagenHero: { url: "/uploads/hero.jpg" }, galeria: [{ url: "/uploads/g1.jpg" }, { url: "https://cdn.example/g2.jpg" }],
      createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z", ...over };
  };

  describe("seguridad del webhook", () => {
    it("falla cerrado si el secreto no está configurado", async () => {
      const off = await makeApp();
      const res = await hook("entry.publish", "destino", destino(), off);
      expect(res.statusCode).toBe(503);
      await off.close();
    });

    it("exige el secreto compartido (sin él, o con uno distinto, 401)", async () => {
      expect((await hook("entry.publish", "destino", destino(), app, null)).statusCode).toBe(401);
      expect((await hook("entry.publish", "destino", destino(), app, "otro-secreto-cualquiera-largo")).statusCode).toBe(401);
      expect((await hook("entry.publish", "destino", destino(), app, "")).statusCode).toBe(401);
      expect((await pool.query("SELECT count(*)::int AS n FROM destinations WHERE slug LIKE 'cms-dest%'")).rows[0].n).toBe(0);
    });

    it("valida el cuerpo y el secreto mínimo de configuración", async () => {
      const bad = await app.inject({ method: "POST", url: "/api/v1/webhooks/cms", payload: { nada: true }, headers: { "x-webhook-secret": SECRET } });
      expect(bad.statusCode).toBe(400);
      const noDoc = await hook("entry.publish", "destino", { nombre: "x" });
      expect(noDoc.statusCode).toBe(400);
      expect(() => loadEnv({ NODE_ENV: "test", CMS_WEBHOOK_SECRET: "corto" } as NodeJS.ProcessEnv)).toThrow(/al menos 16/);
    });
  });

  describe("publicar", () => {
    it("crea el destino con todos los campos, resuelve URL de medios y lo publica en la API", async () => {
      const e = destino();
      strapi.put("destinos", e as never);
      const res = await hook("entry.publish", "destino", e);
      expect(res.statusCode).toBe(200);
      expect(json(res).data.outcome).toBe("applied");
      const r = await row("destinations", e.slug);
      expect(r).toMatchObject({ name: "Destino Prueba", region: "este", short_description: "Corta", best_time_to_visit: "Diciembre a abril", average_temperature: "28 °C", status: "published" });
      expect(Number(r.rating)).toBe(4.6);
      expect(Number(r.latitude)).toBe(18.5);
      expect(r.description).toContain("Texto **rico**");
      expect(r.image_url).toBe("https://cms.descubre.test/uploads/hero.jpg"); // relativa → absoluta con CMS_PUBLIC_URL
      expect(r.gallery).toEqual(["https://cms.descubre.test/uploads/g1.jpg", "https://cdn.example/g2.jpg"]);
      expect(r.published_at).not.toBeNull();
      const api = json(await get(`/destinations/${e.slug}`)).data;
      expect(api).toMatchObject({ name: "Destino Prueba", region: "este" });
      expect(json(await get("/destinations?filter[region]=este&q=prueba")).data.some((d: { slug: string }) => d.slug === e.slug)).toBe(true);
      const link = (await pool.query("SELECT * FROM cms_entries WHERE document_id = $1", [e.documentId])).rows[0];
      expect(link).toMatchObject({ cms_uid: "api::destino.destino", locale: "es", table_name: "destinations", entity_id: r.id });
    });

    it("sin acceso al CMS usa el cuerpo del webhook", async () => {
      const e = destino({ nombre: "Sólo payload" });
      const res = await hook("entry.publish", "destino", e, plain);
      expect(json(res).data.outcome).toBe("applied");
      expect((await row("destinations", e.slug)).name).toBe("Sólo payload");
      expect(strapi.calls.some((c) => c.includes(e.documentId))).toBe(false);
    });

    it("con Draft & Publish, crear o editar no cambia lo público; sólo publicar", async () => {
      const e = destino();
      strapi.put("destinos", e as never);
      for (const ev of ["entry.create", "entry.update"]) {
        const r = await hook(ev, "destino", { ...e, publishedAt: null });
        expect(json(r).data).toMatchObject({ outcome: "ignored" });
      }
      expect(await row("destinations", e.slug)).toBeUndefined();
      await hook("entry.publish", "destino", e);
      expect(await row("destinations", e.slug)).toBeDefined();
      // editar el borrador de algo ya publicado no toca la versión publicada
      const before = (await row("destinations", e.slug)).name;
      await hook("entry.update", "destino", { ...e, nombre: "Borrador nuevo", publishedAt: null });
      expect((await row("destinations", e.slug)).name).toBe(before);
    });

    it("convierte bloques de Strapi a Markdown y no pisa columnas cuyo atributo no viene", async () => {
      const e = destino({ descripcionLarga: [{ type: "heading", level: 2, children: [{ text: "Historia" }] }, { type: "paragraph", children: [{ text: "Primera ", bold: false }, { text: "clave", bold: true }] }, { type: "list", format: "unordered", children: [{ children: [{ text: "Uno" }] }, { children: [{ text: "Dos" }] }] }] });
      await hook("entry.publish", "destino", e, plain);
      expect((await row("destinations", e.slug)).description).toBe("## Historia\n\nPrimera **clave**\n\n- Uno\n- Dos");
      // un hotel con price_range cargado antes del CMS conserva ese dato si Strapi aún no maneja ese campo
      await pool.query("INSERT INTO hotels (name, slug, price_range, status) VALUES ('Hotel previo', 'cms-hotel-previo', '$$$', 'published')");
      await hook("entry.publish", "alojamiento", { documentId: doc("hot"), locale: "es", nombre: "Hotel previo", slug: "cms-hotel-previo", estrellas: 4, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, plain);
      const h = await row("hotels", "cms-hotel-previo");
      expect(h).toMatchObject({ price_range: "$$$", stars: 4 });
    });

    it("adopta una fila existente con el mismo slug en lugar de duplicarla", async () => {
      await pool.query("INSERT INTO destinations (id, name, slug, status, published_at) VALUES ('cc000000-0000-4000-8000-000000000001', 'Nombre viejo', 'cms-adoptado', 'published', now())");
      const e = destino({ nombre: "Nombre del CMS", slug: "cms-adoptado" });
      await hook("entry.publish", "destino", e, plain);
      const rows = (await pool.query("SELECT id, name FROM destinations WHERE slug = 'cms-adoptado'")).rows;
      expect(rows).toEqual([{ id: "cc000000-0000-4000-8000-000000000001", name: "Nombre del CMS" }]);
    });

    it("rechaza entradas sin slug o sin nombre y lo deja en la bitácora", async () => {
      const noSlug = await hook("entry.publish", "destino", destino({ slug: null }), plain);
      expect(noSlug.statusCode).toBe(400);
      const noName = await hook("entry.publish", "destino", destino({ nombre: "" }), plain);
      expect(noName.statusCode).toBe(400);
      const errs = (await pool.query("SELECT detail FROM cms_sync_log WHERE outcome = 'error' ORDER BY id DESC LIMIT 2")).rows.map((r) => r.detail as string);
      expect(errs.join(" ")).toMatch(/slug/);
      expect(errs.join(" ")).toMatch(/nombre/);
    });

    it("modelos sin mapeo y eventos desconocidos se ignoran sin error", async () => {
      expect(json(await hook("entry.publish", "articulo-inexistente", destino())).data.outcome).toBe("ignored");
      expect(json(await hook("media.create", "destino", destino())).data.outcome).toBe("ignored");
    });
  });

  describe("idiomas", () => {
    it("el idioma base va a las columnas y los demás a entity_translations", async () => {
      const es = destino({ nombre: "Samaná Prueba" });
      strapi.put("destinos", es as never);
      await hook("entry.publish", "destino", es);
      const en = { ...es, locale: "en", nombre: "Samana Test", descripcionCorta: "Short text", descripcionLarga: "Long **text**", mejorEpoca: "December to April", region: "este", updatedAt: "2026-09-11T10:00:00.000Z" };
      strapi.put("destinos", en as never);
      expect(json(await hook("entry.publish", "destino", en)).data.detail).toContain("traducción en");
      const r = await row("destinations", es.slug);
      expect(r.name).toBe("Samaná Prueba"); // no se pisa el base
      const tr = (await pool.query("SELECT field_name, translation_text FROM entity_translations WHERE entity_id = $1 AND language = 'en' ORDER BY field_name", [r.id])).rows;
      expect(tr).toEqual([
        { field_name: "best_time_to_visit", translation_text: "December to April" },
        { field_name: "description", translation_text: "Long **text**" },
        { field_name: "name", translation_text: "Samana Test" },
        { field_name: "short_description", translation_text: "Short text" },
      ]);
      const api = json(await get(`/destinations/${es.slug}?lang=en`)).data;
      expect(api).toMatchObject({ name: "Samana Test", short_description: "Short text" });
      expect(json(await get(`/destinations/${es.slug}`)).data.name).toBe("Samaná Prueba");
    });

    it("una traducción que llega antes que el base se recupera pidiéndolo al CMS; sin CMS espera", async () => {
      const es = destino({ nombre: "Base Tardío" });
      const fr = { ...es, locale: "fr", nombre: "Base Tardif", updatedAt: "2026-09-12T10:00:00.000Z" };
      strapi.put("destinos", es as never); strapi.put("destinos", fr as never);
      const waiting = await hook("entry.publish", "destino", fr, plain);
      expect(json(waiting).data).toMatchObject({ outcome: "ignored" });
      expect(json(waiting).data.detail).toContain("falta el idioma base");
      expect(await row("destinations", es.slug)).toBeUndefined();
      const recovered = await hook("entry.publish", "destino", fr);
      expect(json(recovered).data.outcome).toBe("applied");
      expect((await row("destinations", es.slug)).name).toBe("Base Tardío");
      expect((await pool.query("SELECT translation_text FROM entity_translations WHERE language = 'fr' AND field_name = 'name' AND entity_id = $1", [(await row("destinations", es.slug)).id])).rows[0].translation_text).toBe("Base Tardif");
    });

    it("despublicar o eliminar una traducción sólo retira ese idioma", async () => {
      const es = destino();
      const en = { ...es, locale: "en", nombre: "English name" };
      await hook("entry.publish", "destino", es, plain); await hook("entry.publish", "destino", en, plain);
      const id = (await row("destinations", es.slug)).id;
      expect(json(await hook("entry.unpublish", "destino", en, plain)).data.detail).toContain("traducción en retirada");
      expect((await pool.query("SELECT count(*)::int AS n FROM entity_translations WHERE entity_id = $1 AND language = 'en'", [id])).rows[0].n).toBe(0);
      expect((await row("destinations", es.slug)).status).toBe("published");
      await hook("entry.publish", "destino", en, plain);
      expect(json(await hook("entry.delete", "destino", en, plain)).data.detail).toContain("traducción en eliminada");
      expect((await row("destinations", es.slug)).deleted_at).toBeNull();
    });
  });

  describe("despublicar y eliminar", () => {
    it("unpublish oculta la ficha y republicar la devuelve", async () => {
      const e = destino();
      await hook("entry.publish", "destino", e, plain);
      expect((await get(`/destinations/${e.slug}`)).statusCode).toBe(200);
      const un = await hook("entry.unpublish", "destino", e, plain);
      expect(json(un).data.outcome).toBe("applied");
      expect((await get(`/destinations/${e.slug}`)).statusCode).toBe(404);
      expect((await row("destinations", e.slug)).status).toBe("draft");
      await hook("entry.publish", "destino", { ...e, updatedAt: "2026-09-20T10:00:00.000Z" }, plain);
      expect((await get(`/destinations/${e.slug}`)).statusCode).toBe(200);
    });

    it("delete hace borrado lógico: la fila queda archivada y deja de ser pública", async () => {
      const e = destino();
      await hook("entry.publish", "destino", e, plain);
      expect(json(await hook("entry.delete", "destino", e, plain)).data.outcome).toBe("applied");
      const r = await row("destinations", e.slug);
      expect(r).toMatchObject({ status: "archived" });
      expect(r.deleted_at).not.toBeNull();
      expect((await get(`/destinations/${e.slug}`)).statusCode).toBe(404);
      expect((await pool.query("SELECT 1 FROM cms_entries WHERE document_id = $1", [e.documentId])).rowCount).toBe(0);
      expect(json(await hook("entry.delete", "destino", e, plain)).data.outcome).toBe("ignored"); // repetir es inofensivo
    });
  });

  describe("consistencia", () => {
    it("un evento atrasado no pisa a uno más nuevo", async () => {
      const e = destino({ nombre: "Versión 2", updatedAt: "2026-09-15T10:00:00.000Z" });
      await hook("entry.publish", "destino", e, plain);
      const old = await hook("entry.publish", "destino", { ...e, nombre: "Versión 1", updatedAt: "2026-09-14T10:00:00.000Z" }, plain);
      expect(json(old).data).toMatchObject({ outcome: "ignored", detail: expect.stringContaining("más antiguo") });
      expect((await row("destinations", e.slug)).name).toBe("Versión 2");
    });

    it("al cambiar el slug, el anterior sigue resolviendo (SEO) a la ficha vigente", async () => {
      const e = destino();
      await hook("entry.publish", "destino", e, plain);
      const newSlug = `cms-renombrado-${e.documentId}`;
      await hook("entry.publish", "destino", { ...e, slug: newSlug, updatedAt: "2026-09-16T10:00:00.000Z" }, plain);
      const r = await row("destinations", newSlug);
      expect(r.slug_history).toEqual([e.slug]);
      const viaOld = json(await get(`/destinations/${e.slug}`)).data;
      expect(viaOld.slug).toBe(newSlug); // el cliente puede redirigir a la URL canónica
      expect((await get(`/destinations/${newSlug}`)).statusCode).toBe(200);
      expect((await pool.query("SELECT count(*)::int AS n FROM destinations WHERE slug IN ($1, $2)", [e.slug, newSlug])).rows[0].n).toBe(1);
    });

    it("si el CMS falla al consultar, responde 502 y no altera los datos", async () => {
      const e = destino({ nombre: "No debe crearse" });
      strapi.put("destinos", e as never);
      strapi.failNext(1);
      const res = await hook("entry.publish", "destino", e);
      expect(res.statusCode).toBe(502);
      expect(json(res).error.code).toBe("UPSTREAM_ERROR");
      expect(await row("destinations", e.slug)).toBeUndefined();
      expect((await pool.query("SELECT outcome FROM cms_sync_log ORDER BY id DESC LIMIT 1")).rows[0].outcome).toBe("error");
    });
  });

  describe("relaciones y otros tipos", () => {
    it("la playa enlaza su destino (ya sincronizado) y aparece con include", async () => {
      const d = destino({ nombre: "Destino de Playa" });
      strapi.put("destinos", d as never);
      await hook("entry.publish", "destino", d);
      const p = { documentId: doc("play"), locale: "es", nombre: "Playa CMS", slug: `cms-${doc("p")}`, descripcion: "Arena fina", tipoArena: "blanca", nivelOleaje: "tranquilo", latitud: 18.6, longitud: -68.4,
        imagenPrincipal: { url: "/uploads/p.jpg" }, servicios: { restaurantes: true, sombrillas: true, bano: false }, destino: { documentId: d.documentId }, updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z" };
      strapi.put("playas", p as never);
      await hook("entry.publish", "playa", p);
      const api = json(await get(`/beaches/${p.slug}?include=destination`)).data;
      expect(api).toMatchObject({ name: "Playa CMS", sand_type: "blanca", wave_intensity: "tranquilo", amenities: ["restaurantes", "sombrillas"], destination: { slug: d.slug, name: "Destino de Playa" } });
      expect(api.image_url).toBe("https://cms.descubre.test/uploads/p.jpg");
      expect(json(await get("/beaches?filter[sand_type]=blanca&q=cms")).data.map((x: { slug: string }) => x.slug)).toContain(p.slug);
    });

    it("si el destino aún no está sincronizado, se trae del CMS bajo demanda", async () => {
      const d = destino({ nombre: "Destino Pendiente" });
      strapi.put("destinos", d as never);
      const p = { documentId: doc("play"), locale: "es", nombre: "Playa Huérfana", slug: `cms-${doc("p")}`, destino: { documentId: d.documentId }, updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z" };
      await hook("entry.publish", "playa", p);
      expect((await row("destinations", d.slug)).name).toBe("Destino Pendiente");
      expect((await row("beaches", p.slug)).destination_id).toBe((await row("destinations", d.slug)).id);
      // sin acceso al CMS la relación queda vacía (con aviso), pero la playa se publica
      const p2 = { ...p, documentId: doc("play"), slug: `cms-${doc("q")}`, destino: { documentId: "desconocido" } };
      await hook("entry.publish", "playa", p2, plain);
      expect((await row("beaches", p2.slug)).destination_id).toBeNull();
    });

    it("alojamiento: estrellas, precio, enlace de reserva y primera imagen como principal", async () => {
      const h = { documentId: doc("hot"), locale: "es", nombre: "Hotel CMS", slug: `cms-${doc("h")}`, categoria: "eco-lodge", estrellas: 4, precioDesdeUSD: 120.5, descripcion: "Entre montañas", enlaceReserva: "https://reservas.example/hotel", imagenes: [{ url: "/uploads/h1.jpg" }, { url: "/uploads/h2.jpg" }], updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z" };
      await hook("entry.publish", "alojamiento", h, plain);
      const api = json(await get(`/hotels/${h.slug}`)).data;
      expect(api).toMatchObject({ name: "Hotel CMS", category: "eco-lodge", stars: 4, price_from_usd: 120.5, booking_url: "https://reservas.example/hotel", image_url: "https://cms.descubre.test/uploads/h1.jpg" });
      expect(api.gallery).toHaveLength(2);
      expect(json(await get("/hotels?filter[price_from_usd][lte]=150&filter[stars]=4&q=cms")).data.map((x: { slug: string }) => x.slug)).toContain(h.slug);
    });

    it("aeropuerto (tipo nuevo): se publica en /airports con sus listas", async () => {
      const a = { documentId: doc("air"), locale: "es", nombre: "Aeropuerto de Prueba", slug: `cms-${doc("a")}`, codigoIATA: "TST", tipo: "internacional", ciudad: "Punta Cana", descripcion: "Terminal", aerolineas: ["Avianca", "JetBlue"], servicios: ["WiFi"], transporte: ["Taxi"], imagenUrl: { url: "/uploads/a.jpg" }, updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z" };
      await hook("entry.publish", "aeropuerto", a, plain);
      const api = json(await get(`/airports/${a.slug}`)).data;
      expect(api).toMatchObject({ iata_code: "TST", airport_type: "internacional", city: "Punta Cana", airlines: ["Avianca", "JetBlue"], image_url: "https://cms.descubre.test/uploads/a.jpg" });
      expect(json(await get("/airports?filter[iata_code]=TST")).data).toHaveLength(1);
    });
  });

  describe("carga completa (backfill)", () => {
    const login = async () => {
      const email = `cmsadmin${Date.now()}${seq++}@test.local`;
      const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } })).data;
      const post = (role: string) => pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.user.id, role]);
      const token = async () => json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string;
      return { reg, post, token };
    };

    it("trae todo lo publicado de todos los idiomas, recorriendo páginas, con los destinos primero", async () => {
      const s = await startFakeStrapi("t2", 2); // páginas de 2 para forzar la paginación
      const bf = await makeApp({ CMS_URL: s.url, CMS_API_TOKEN: "t2", CMS_WEBHOOK_SECRET: SECRET });
      const ds = [1, 2, 3].map((i) => destino({ nombre: `Backfill ${i}`, slug: `cms-bf-${i}-${seq++}` }));
      for (const d of ds) { s.put("destinos", d as never); s.put("destinos", { ...d, locale: "en", nombre: `Backfill EN ${d.nombre}` } as never); }
      const ps = [1, 2].map((i) => ({ documentId: doc("bfp"), locale: "es", nombre: `Playa BF ${i}`, slug: `cms-bfp-${i}-${seq++}`, destino: { documentId: ds[0]!.documentId }, updatedAt: "2026-09-10T10:00:00.000Z", publishedAt: "2026-09-10T10:00:00.000Z" }));
      for (const p of ps) s.put("playas", p as never);

      const admin = await (async () => {
        const email = `bfadmin${Date.now()}${seq++}@test.local`;
        const reg = json(await bf.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } })).data;
        await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [reg.user.id]);
        return json(await bf.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string;
      })();
      const res = await bf.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: { models: ["destino", "playa"] }, headers: { authorization: `Bearer ${admin}` } });
      expect(res.statusCode).toBe(200);
      const summary = json(res).data as { model: string; locale: string; applied: number }[];
      expect(summary.find((x) => x.model === "destino" && x.locale === "es")!.applied).toBe(3);
      expect(summary.find((x) => x.model === "destino" && x.locale === "en")!.applied).toBe(3);
      expect(summary.find((x) => x.model === "playa" && x.locale === "es")!.applied).toBe(2);
      expect(summary.map((x) => x.model)[0]).toBe("destino"); // orden de dependencia
      for (const d of ds) expect((await row("destinations", d.slug)).name).toMatch(/^Backfill \d$/);
      for (const p of ps) expect((await row("beaches", p.slug)).destination_id).toBe((await row("destinations", ds[0]!.slug)).id);
      expect((await pool.query("SELECT count(*)::int AS n FROM entity_translations WHERE language = 'en' AND entity_id = ANY(SELECT id FROM destinations WHERE slug LIKE 'cms-bf-%')")).rows[0].n).toBeGreaterThanOrEqual(9);
      // ejecutarlo otra vez es inofensivo
      const again = await bf.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: { models: ["destino"] }, headers: { authorization: `Bearer ${admin}` } });
      expect(again.statusCode).toBe(200);
      expect((await pool.query("SELECT count(*)::int AS n FROM destinations WHERE slug LIKE 'cms-bf-%'")).rows[0].n).toBe(3);
      // tipos que aún no existen en Strapi (404) se saltan sin error
      const missing = await bf.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: { models: ["aeropuerto"] }, headers: { authorization: `Bearer ${admin}` } });
      expect(json(missing).data.every((x: { applied: number; errors: number }) => x.applied === 0 && x.errors === 0)).toBe(true);
      expect((await bf.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: { models: ["nadie"] }, headers: { authorization: `Bearer ${admin}` } })).statusCode).toBe(400);
      await bf.close(); await s.close();
    });

    it("las rutas de administración exigen rol: 401 sin sesión, 403 sin rol, backfill sólo admin", async () => {
      expect((await app.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: {} })).statusCode).toBe(401);
      expect((await app.inject({ url: "/api/v1/admin/cms/sync-log" })).statusCode).toBe(401);
      const u = await login();
      const plainToken = await u.token();
      expect((await app.inject({ url: "/api/v1/admin/cms/sync-log", headers: { authorization: `Bearer ${plainToken}` } })).statusCode).toBe(403);
      await u.post("editor");
      const editor = await u.token();
      expect((await app.inject({ url: "/api/v1/admin/cms/sync-log", headers: { authorization: `Bearer ${editor}` } })).statusCode).toBe(200); // editor puede ver
      expect((await app.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: {}, headers: { authorization: `Bearer ${editor}` } })).statusCode).toBe(403); // pero no lanzar la carga
    });

    it("sin CMS configurado el backfill responde 503", async () => {
      const email = `sincms${Date.now()}@test.local`;
      const reg = json(await plain.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } })).data;
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [reg.user.id]);
      const t = json(await plain.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token;
      const res = await plain.inject({ method: "POST", url: "/api/v1/admin/cms/backfill", payload: {}, headers: { authorization: `Bearer ${t}` } });
      expect(res.statusCode).toBe(503);
    });

    it("la bitácora y el mapeo son consultables", async () => {
      const email = `log${Date.now()}@test.local`;
      const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } })).data;
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [reg.user.id]);
      const t = json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token;
      const h = { authorization: `Bearer ${t}` };
      const log = json(await app.inject({ url: "/api/v1/admin/cms/sync-log?limit=5", headers: h })).data;
      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toHaveProperty("outcome");
      const errors = json(await app.inject({ url: "/api/v1/admin/cms/sync-log?outcome=error", headers: h })).data;
      expect(errors.every((x: { outcome: string }) => x.outcome === "error")).toBe(true);
      const map = json(await app.inject({ url: "/api/v1/admin/cms/mappings", headers: h }));
      expect(map.data.map((m: { model: string }) => m.model)).toEqual(["destino", "playa", "alojamiento", "experiencia", "aeropuerto"]);
      expect(map.meta).toEqual({ can_fetch: true, webhook_configured: true });
    });
  });

  describe("conversión de valores", () => {
    const abs = (u: string) => (/^https?:/.test(u) ? u : `https://x${u}`); // igual que el real: las absolutas no se tocan
    it("interpreta cada tipo de atributo de Strapi", () => {
      expect(convertValue("text", "  hola ", abs)).toBe("hola");
      expect(convertValue("text", "   ", abs)).toBeNull();
      expect(convertValue("number", "4.5", abs)).toBe(4.5);
      expect(convertValue("number", "abc", abs)).toBeNull();
      expect(convertValue("media", [{ url: "/a.jpg" }, { url: "/b.jpg" }], abs)).toBe("https://x/a.jpg");
      expect(convertValue("media", null, abs)).toBeNull();
      expect(convertValue("medias", [{ url: "/a.jpg" }, { url: "https://y/b.jpg" }], abs)).toEqual(["https://x/a.jpg", "https://y/b.jpg"]);
      expect(convertValue("medias", undefined, abs)).toEqual([]);
      expect(convertValue("list", { a: true, b: false, c: true }, abs)).toEqual(["a", "c"]);
      expect(convertValue("list", ["x"], abs)).toEqual(["x"]);
      expect(convertValue("bool", "true", abs)).toBe(true);
    });
  });
});
