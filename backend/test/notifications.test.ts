import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PushSender, PushSub } from "../src/modules/notifications/service.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `nt${Date.now().toString(36)}${n++}@test.local`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lector mínimo de un flujo SSE: junta los eventos y deja esperar a que llegue uno. */
async function openStream(url: string, headers: Record<string, string> = {}) {
  const ctl = new AbortController();
  const res = await fetch(url, { headers, signal: ctl.signal });
  const events: { event: string; data: any }[] = [];
  let closed = false;
  const reader = res.body?.getReader();
  const dec = new TextDecoder();
  let buf = "";
  const pump = (async () => {
    if (!reader) return;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, i); buf = buf.slice(i + 2);
          const ev = /^event: (.+)$/m.exec(block)?.[1], data = /^data: (.+)$/m.exec(block)?.[1];
          if (ev && data) events.push({ event: ev, data: JSON.parse(data) });
        }
      }
    } catch { /* abortado */ }
    closed = true;
  })();
  const waitFor = async (pred: (e: { event: string; data: any }) => boolean, ms = 4000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const hit = events.find(pred); if (hit) return hit; await sleep(25); }
    return undefined;
  };
  return { status: res.status, events, waitFor, get closed() { return closed; }, close: () => { ctl.abort(); return pump; } };
}

describe("notificaciones", () => {
  let app: FastifyInstance, app2: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  let base: string, base2: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Aviso" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const inbox = async (token: string) => json(await call("GET", "/me/notifications?per_page=100", { token })).data as { title: string; type: string; message: string | null; link: string | null; data: any }[];
  const ticket = async (token: string) => json(await call("POST", "/notifications/stream-ticket", { token })).data.ticket as string;

  beforeAll(async () => {
    app = await makeApp();
    app2 = await makeApp();          // segunda instancia: prueba que los avisos cruzan de una a otra
    await app.listen({ port: 0, host: "127.0.0.1" });
    await app2.listen({ port: 0, host: "127.0.0.1" });
    base = `http://127.0.0.1:${(app.server.address() as { port: number }).port}/api/v1`;
    base2 = `http://127.0.0.1:${(app2.server.address() as { port: number }).port}/api/v1`;
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token;
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), app2.close()]); });

  describe("preferencias y bandeja", () => {
    it("matriz tipo × canal: lo no guardado está activo salvo las promociones; sólo cambia lo enviado", async () => {
      const u = await account();
      expect((await call("GET", "/me/notification-preferences")).statusCode).toBe(401);
      const def = json(await call("GET", "/me/notification-preferences", { token: u.token })).data;
      expect(def.in_app).toMatchObject({ booking: true, social: true, system: true, gamification: true, promo: false });
      expect(Object.keys(def).sort()).toEqual(["email", "in_app", "push"]);
      const upd = json(await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { gamification: false, promo: true }, push: { social: false } } })).data;
      expect(upd.in_app).toMatchObject({ gamification: false, promo: true, booking: true });
      expect(upd.push.social).toBe(false);
      expect(upd.email.promo).toBe(false);
      expect((await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { inventado: true } } })).statusCode).toBe(400);
      expect((await call("PUT", "/me/notification-preferences", { token: u.token, payload: { whatsapp: { system: true } } })).statusCode).toBe(400);
      // Es la misma matriz que ve /me/preferences.
      expect(json(await call("GET", "/me/preferences", { token: u.token })).data.notifications.in_app.gamification).toBe(false);
    });

    it("la bandeja respeta las preferencias: lo desactivado no llega y lo demás sí", async () => {
      const u = await account();
      await app.notifications.notify(u.id, { type: "system", title: "Aviso uno", message: "Cuerpo", link: "/x", data: { k: 1 } });
      await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { system: false } } });
      await app.notifications.notify(u.id, { type: "system", title: "Aviso dos" });
      await app.notifications.notify(u.id, { type: "promo", title: "Promo sin aceptar" });
      await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { promo: true } } });
      await app.notifications.notify(u.id, { type: "promo", title: "Promo aceptada" });
      const list = await inbox(u.token);
      expect(list.map((x) => x.title).sort()).toEqual(["Aviso uno", "Promo aceptada"]);
      expect(list.find((x) => x.title === "Aviso uno")).toMatchObject({ type: "system", message: "Cuerpo", link: "/x", data: { k: 1 } });
      await app.notifications.notify(null, { type: "system", title: "Sin destinatario" });         // no falla
      await app.notifications.notify("99999999-9999-4999-8999-999999999999", { type: "system", title: "Usuario inexistente" });   // tampoco
    });

    it("subir de nivel y unirse a tu viaje generan avisos en la bandeja", async () => {
      const u = await account();
      const g = await app.game.grant({ userId: u.id, action: "prueba_nivel", xp: 150 });
      expect(g.level_up).toMatchObject({ to: 2 });
      const lvl = (await inbox(u.token)).find((x) => x.title.startsWith("¡Subiste al nivel 2"));
      expect(lvl).toMatchObject({ type: "gamification", link: "/perfil/juego", data: { level: 2 } });
      // Con la categoría desactivada, el siguiente ascenso no avisa.
      await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { gamification: false } } });
      await app.game.grant({ userId: u.id, action: "prueba_nivel", xp: 200 });
      expect((await inbox(u.token)).filter((x) => x.title.startsWith("¡Subiste al nivel")).length).toBe(1);

      const owner = await account(), guest = await account();
      const trip = json(await call("POST", "/me/trips", { token: owner.token, payload: { title: "Viaje de aviso" } })).data;
      const inv = json(await call("POST", `/me/trips/${trip.id}/members`, { token: owner.token, payload: { role: "viewer" } })).data;
      await call("POST", "/trips/join", { token: guest.token, payload: { token: inv.token } });
      expect((await inbox(owner.token)).find((x) => x.title === "Persona Aviso se unió a tu viaje")).toMatchObject({ type: "social", message: "Viaje de aviso" });
    });

    it("la aprobación de una persona embajadora avisa en la bandeja", async () => {
      const u = await account();
      await call("POST", "/ambassadors/apply", { token: u.token, payload: { motivation: "Quiero compartir la isla con mi comunidad de viajeros." } });
      await call("PATCH", `/admin/ambassadors/${u.id}`, { token: admin, payload: { status: "approved" } });
      expect((await inbox(u.token)).find((x) => x.title === "¡Ya eres embajador!")).toMatchObject({ type: "system", link: "/embajadores" });
    });
  });

  describe("tiempo real (SSE)", () => {
    it("el ticket es de un solo uso corto, firmado y de la persona que lo pidió", async () => {
      const u = await account();
      expect((await call("POST", "/notifications/stream-ticket")).statusCode).toBe(401);
      const t = await ticket(u.token);
      expect(app.notifications.verifyTicket(t)).toBe(u.id);
      expect(app.notifications.verifyTicket(t.slice(0, -2) + "xx")).toBeNull();
      expect(app.notifications.verifyTicket("basura")).toBeNull();
      const [body, sig] = t.split(".");
      const forged = Buffer.from(`${(await account()).id}.${Math.floor(Date.now() / 1000) + 60}`).toString("base64url");
      expect(app.notifications.verifyTicket(`${forged}.${sig}`)).toBeNull();       // la firma no cubre otro contenido
      const expired = Buffer.from(`${u.id}.${Math.floor(Date.now() / 1000) - 5}`).toString("base64url");
      expect(app.notifications.verifyTicket(`${expired}.${sig}`)).toBeNull();
      void body;
      expect((await fetch(`${base}/notifications/stream?ticket=${t.slice(0, -2)}xx`)).status).toBe(401);
      expect((await fetch(`${base}/notifications/stream`)).status).toBe(401);
    });

    it("entrega los avisos al instante, con ticket o con encabezado, y sólo a su dueño", async () => {
      const u = await account(), other = await account();
      await app.notifications.notify(u.id, { type: "system", title: "Ya estaba" });
      const s = await openStream(`${base}/notifications/stream?ticket=${await ticket(u.token)}`);
      const t = await openStream(`${base}/notifications/stream`, { authorization: `Bearer ${u.token}` });
      const o = await openStream(`${base}/notifications/stream?ticket=${await ticket(other.token)}`);
      expect(s.status).toBe(200);
      const ready = await s.waitFor((e) => e.event === "ready");
      expect(ready!.data).toEqual({ unread: 1 });
      await app.notifications.notify(u.id, { type: "booking", title: "Reserva confirmada", message: "Tour", link: "/reservas/X" });
      const got = await s.waitFor((e) => e.event === "notification");
      expect(got!.data).toMatchObject({ user_id: u.id, type: "booking", title: "Reserva confirmada", link: "/reservas/X" });
      expect(await t.waitFor((e) => e.event === "notification")).toBeDefined();
      await sleep(150);
      expect(o.events.filter((e) => e.event === "notification")).toHaveLength(0);       // el otro no ve lo ajeno
      // Con la preferencia apagada no se emite nada.
      await call("PUT", "/me/notification-preferences", { token: u.token, payload: { in_app: { social: false } } });
      await app.notifications.notify(u.id, { type: "social", title: "No debe llegar" });
      await sleep(200);
      expect(s.events.some((e) => e.data.title === "No debe llegar")).toBe(false);
      await Promise.all([s.close(), t.close(), o.close()]);
    });

    it("un aviso creado en otra instancia llega igual (LISTEN/NOTIFY) y un cambio revertido no avisa", async () => {
      const u = await account();
      const s = await openStream(`${base2}/notifications/stream?ticket=${await ticket(u.token)}`);   // conectado a la instancia 2
      await s.waitFor((e) => e.event === "ready");
      await app.notifications.notify(u.id, { type: "system", title: "Desde la instancia 1" });      // creado en la 1
      expect(await s.waitFor((e) => e.data.title === "Desde la instancia 1")).toBeDefined();
      // NOTIFY dentro de una transacción sólo sale si se confirma.
      const { insertNotification } = await import("../src/modules/notifications/insert.js");
      const c = await pool.connect();
      await c.query("BEGIN");
      await insertNotification(c, u.id, { type: "system", title: "Revertido" });
      await c.query("ROLLBACK");
      c.release();
      await sleep(250);
      expect(s.events.some((e) => e.data.title === "Revertido")).toBe(false);
      expect((await inbox(u.token)).some((x) => x.title === "Revertido")).toBe(false);
      await s.close();
    });

    it("cada persona tiene como máximo 5 conexiones: la más antigua se cierra", async () => {
      const u = await account();
      const streams = [];
      for (let i = 0; i < 6; i++) { const s = await openStream(`${base}/notifications/stream?ticket=${await ticket(u.token)}`); await s.waitFor((e) => e.event === "ready"); streams.push(s); }
      const t0 = Date.now();
      while (!streams[0]!.closed && Date.now() - t0 < 3000) await sleep(25);
      expect(streams[0]!.closed).toBe(true);
      expect(streams.slice(1).every((s) => !s.closed)).toBe(true);
      expect(app.notifications.connections).toBeGreaterThanOrEqual(5);
      await Promise.all(streams.map((s) => s.close()));
    });

    it("al cerrar la conexión se libera", async () => {
      const u = await account();
      const before = app.notifications.connections;
      const s = await openStream(`${base}/notifications/stream?ticket=${await ticket(u.token)}`);
      await s.waitFor((e) => e.event === "ready");
      expect(app.notifications.connections).toBe(before + 1);
      await s.close();
      const t0 = Date.now();
      while (app.notifications.connections !== before && Date.now() - t0 < 3000) await sleep(25);
      expect(app.notifications.connections).toBe(before);
    });
  });

  describe("push", () => {
    const sent: { sub: PushSub; payload: any }[] = [];
    let result: "ok" | "gone" | "error" = "ok";
    const fake: PushSender = { enabled: true, send: async (sub, payload) => { sent.push({ sub, payload: JSON.parse(payload) }); return result; } };
    const dev = (i: number) => ({ endpoint: `https://push.example.test/${tag}/${i}`, keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM", auth: "tBHItJI5svbpez7KI4CCXg" }, user_agent: "Prueba" });

    it("sin claves VAPID está apagado; con un enviador registra dispositivos, valida y limita", async () => {
      const u = await account(), other = await account();
      expect((await call("POST", "/me/push-subscriptions", { token: u.token, payload: dev(1) })).statusCode).toBe(503);
      expect(json(await call("GET", "/me/push-subscriptions", { token: u.token })).data).toMatchObject({ enabled: false, public_key: null, devices: [] });
      app.notifications.pushSender = fake;
      try {
        expect((await call("POST", "/me/push-subscriptions", { payload: dev(1) })).statusCode).toBe(401);
        expect((await call("POST", "/me/push-subscriptions", { token: u.token, payload: { ...dev(1), endpoint: "http://inseguro.test/x" } })).statusCode).toBe(400);
        expect((await call("POST", "/me/push-subscriptions", { token: u.token, payload: { endpoint: "https://x.test/y" } })).statusCode).toBe(400);
        const a = json(await call("POST", "/me/push-subscriptions", { token: u.token, payload: dev(1) })).data;
        expect(json(await call("GET", "/me/push-subscriptions", { token: u.token })).data.devices).toHaveLength(1);
        expect(JSON.stringify(json(await call("GET", "/me/push-subscriptions", { token: u.token })).data)).not.toContain("BNcRdre");   // las claves no se devuelven
        // El mismo dispositivo en otra cuenta pasa a esa cuenta.
        await call("POST", "/me/push-subscriptions", { token: other.token, payload: dev(1) });
        expect(json(await call("GET", "/me/push-subscriptions", { token: u.token })).data.devices).toHaveLength(0);
        expect(json(await call("GET", "/me/push-subscriptions", { token: other.token })).data.devices).toHaveLength(1);
        expect((await call("DELETE", `/me/push-subscriptions/${a.id}`, { token: u.token })).statusCode).toBe(404);     // ya no es suyo
        expect((await call("DELETE", `/me/push-subscriptions/${a.id}`, { token: other.token })).statusCode).toBe(204);
        for (let i = 10; i < 20; i++) expect((await call("POST", "/me/push-subscriptions", { token: u.token, payload: dev(i) })).statusCode).toBe(201);
        expect(json(await call("POST", "/me/push-subscriptions", { token: u.token, payload: dev(99) })).error.details.code).toBe("PUSH_LIMIT");
      } finally { app.notifications.pushSender = { enabled: false, send: async () => "error" }; }
    });

    it("envía el push al notificar, respeta la preferencia de push y retira dispositivos caducados", async () => {
      const u = await account();
      app.notifications.pushSender = fake;
      try {
        await call("POST", "/me/push-subscriptions", { token: u.token, payload: dev(101) });
        sent.length = 0; result = "ok";
        await app.notifications.notify(u.id, { type: "booking", title: "Reserva lista", message: "Cuerpo", link: "/reservas/1" });
        await sleep(200);
        expect(sent).toHaveLength(1);
        expect(sent[0]!.payload).toMatchObject({ title: "Reserva lista", body: "Cuerpo", link: "/reservas/1", type: "booking" });
        expect((await pool.query("SELECT last_success_at FROM push_subscriptions WHERE endpoint = $1", [dev(101).endpoint])).rows[0].last_success_at).toBeTruthy();
        await call("PUT", "/me/notification-preferences", { token: u.token, payload: { push: { booking: false } } });
        await app.notifications.notify(u.id, { type: "booking", title: "Sin push" });
        await sleep(150);
        expect(sent).toHaveLength(1);                                                   // sin push, pero sí en la bandeja
        expect((await inbox(u.token)).some((x) => x.title === "Sin push")).toBe(true);
        await call("PUT", "/me/notification-preferences", { token: u.token, payload: { push: { booking: true } } });
        result = "error";
        await app.notifications.notify(u.id, { type: "booking", title: "Falla" });
        await sleep(200);
        expect((await pool.query("SELECT failures FROM push_subscriptions WHERE endpoint = $1", [dev(101).endpoint])).rows[0].failures).toBe(1);
        result = "gone";
        await app.notifications.notify(u.id, { type: "booking", title: "Caducado" });
        await sleep(200);
        expect((await pool.query("SELECT 1 FROM push_subscriptions WHERE endpoint = $1", [dev(101).endpoint])).rowCount).toBe(0);
      } finally { result = "ok"; app.notifications.pushSender = { enabled: false, send: async () => "error" }; }
    });
  });

  describe("difusiones del equipo", () => {
    it("sólo el admin; valida el enlace; cuenta con dry_run y respeta las preferencias de cada persona", async () => {
      const [a, b, c] = [await account("moderator"), await account("moderator"), await account("moderator")];
      await call("PUT", "/me/notification-preferences", { token: c.token, payload: { in_app: { system: false } } });
      const body = { title: `Mantenimiento ${tag}`, message: "Habrá una pausa breve el domingo.", link: "/aviso", segment: { roles: ["moderator"] } };
      expect((await call("POST", "/admin/notifications/broadcast", { token: a.token, payload: body })).statusCode).toBe(403);
      expect((await call("POST", "/admin/notifications/broadcast", { payload: body })).statusCode).toBe(401);
      expect((await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { ...body, link: "javascript:alert(1)" } })).statusCode).toBe(400);
      expect((await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { ...body, title: "x" } })).statusCode).toBe(400);
      const dry = json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { ...body, dry_run: true } })).data;
      expect(dry.dry_run).toBe(true);
      expect(dry.audience).toBeGreaterThanOrEqual(3);
      expect((await pool.query("SELECT count(*)::int AS n FROM notifications WHERE title = $1", [body.title])).rows[0].n).toBe(0);      // dry_run no crea nada

      const s = await openStream(`${base}/notifications/stream?ticket=${await ticket(a.token)}`);
      await s.waitFor((e) => e.event === "ready");
      const res = json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: body })).data;
      expect(res.audience).toBe(dry.audience);
      expect(res.delivered).toBe(res.audience - res.skipped_by_preferences);
      expect(res.skipped_by_preferences).toBeGreaterThanOrEqual(1);
      expect((await inbox(a.token)).find((x) => x.title === body.title)).toMatchObject({ type: "system", link: "/aviso" });
      expect((await inbox(b.token)).some((x) => x.title === body.title)).toBe(true);
      expect((await inbox(c.token)).some((x) => x.title === body.title)).toBe(false);          // desactivó los avisos del sistema
      expect(await s.waitFor((e) => e.data.title === body.title)).toBeDefined();               // y quien está conectado lo recibe al instante
      await s.close();
      expect(json(await call("GET", "/admin/notifications/broadcasts", { token: admin })).data[0]).toMatchObject({ title: body.title, recipients: res.delivered, type: "system" });
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'notifications.broadcast' AND entity_id = $1", [res.id])).rowCount).toBe(1);
    });

    it("una promoción sólo llega a quien la aceptó; el segmento filtra por nivel", async () => {
      const opted = await account("moderator"), plain = await account("moderator");
      await call("PUT", "/me/notification-preferences", { token: opted.token, payload: { in_app: { promo: true } } });
      const res = json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { title: `Oferta ${tag}`, type: "promo", segment: { roles: ["moderator"] } } })).data;
      expect(res.delivered).toBeGreaterThanOrEqual(1);
      expect((await inbox(opted.token)).some((x) => x.title === `Oferta ${tag}`)).toBe(true);
      expect((await inbox(plain.token)).some((x) => x.title === `Oferta ${tag}`)).toBe(false);
      await app.game.grant({ userId: opted.id, action: "prueba_nivel", xp: 700 });          // nivel 4
      expect(json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { title: "Solo nivel alto", segment: { roles: ["moderator"], min_level: 4 }, dry_run: true } })).data.audience).toBeGreaterThanOrEqual(1);
      const high = json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { title: `Alto ${tag}`, segment: { roles: ["moderator"], min_level: 4 } } })).data;
      expect((await inbox(opted.token)).some((x) => x.title === `Alto ${tag}`)).toBe(true);
      expect((await inbox(plain.token)).some((x) => x.title === `Alto ${tag}`)).toBe(false);
      expect(high.audience).toBeLessThan(json(await call("POST", "/admin/notifications/broadcast", { token: admin, payload: { title: "Todos", segment: { roles: ["moderator"] }, dry_run: true } })).data.audience);
    });
  });
});
