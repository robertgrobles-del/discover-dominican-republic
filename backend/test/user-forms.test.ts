import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unsubscribeToken, verifyUnsubscribeToken } from "../src/modules/forms/routes.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = (p = "u") => `${p}${Date.now().toString(36)}${n++}@test.local`;

describe("usuario y formularios", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await pool.end(); await app.close(); });

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Ana Perfil" } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };

  describe("perfil, preferencias y favoritos", () => {
    it("edita el perfil con validación estricta", async () => {
      const u = await signup();
      const ok = await call("PATCH", "/me/profile", { token: u.token, payload: { display_name: "Ana R", bio: "Viajera", travel_interests: ["playa", "playa", "cultura"], country: "do", birth_year: 1990, currency: "DOP", locale: "en" } });
      expect(ok.statusCode).toBe(200);
      expect(json(ok).data).toMatchObject({ display_name: "Ana R", travel_interests: ["playa", "cultura"], country: "DO", currency: "DOP", locale: "en", email: u.email });
      for (const bad of [{ avatar_url: "http://x.com/a.png" }, { birth_year: new Date().getUTCFullYear() }, { country: "DOM" }, { display_name: "" }, { currency: "EUR" }]) {
        expect((await call("PATCH", "/me/profile", { token: u.token, payload: bad })).statusCode, JSON.stringify(bad)).toBe(400);
      }
      expect((await call("GET", "/me/profile")).statusCode).toBe(401);
    });

    it("preferencias: valores por defecto, cambios parciales y consentimientos auditados", async () => {
      const u = await signup();
      const d = json(await call("GET", "/me/preferences", { token: u.token })).data;
      expect(d.consents).toEqual({ marketing: false, analytics: false });
      expect(d.notifications.email.booking).toBe(true);
      expect(d.notifications.email.promo).toBe(false);
      const up = json(await call("PUT", "/me/preferences", { token: u.token, payload: { consents: { marketing: true }, notifications: { email: { promo: true }, push: { social: false } }, currency: "DOP" } })).data;
      expect(up).toMatchObject({ currency: "DOP", consents: { marketing: true, analytics: false } });
      expect(up.notifications.email).toMatchObject({ promo: true, booking: true });
      expect(up.notifications.push.social).toBe(false);
      expect((await call("PUT", "/me/preferences", { token: u.token, payload: { notifications: { sms: { promo: true } } } })).statusCode).toBe(400);
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'user.consent_update' AND actor_id = $1", [u.id])).rowCount).toBe(1);
    });

    it("favoritos: idempotentes, con tipos válidos e ids de texto, y privados", async () => {
      const a = await signup(), b = await signup();
      expect((await call("PUT", "/me/favorites/beach/11111111-1111-4111-8111-111111111111", { token: a.token })).statusCode).toBe(204);
      expect((await call("PUT", "/me/favorites/beach/11111111-1111-4111-8111-111111111111", { token: a.token })).statusCode).toBe(204);
      expect((await call("PUT", "/me/favorites/operator_listing/lst_abc", { token: a.token })).statusCode).toBe(204);
      expect((await call("PUT", "/me/favorites/planet/x", { token: a.token })).statusCode).toBe(400);
      const all = json(await call("GET", "/me/favorites", { token: a.token }));
      expect(all.meta.total).toBe(2);
      expect(json(await call("GET", "/me/favorites?type=operator_listing", { token: a.token })).data).toHaveLength(1);
      expect(json(await call("GET", "/me/favorites", { token: b.token })).meta.total).toBe(0);
      expect((await call("DELETE", "/me/favorites/operator_listing/lst_abc", { token: a.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/me/favorites", { token: a.token })).meta.total).toBe(1);
    });

    it("notificaciones: bandeja, no leídas y aislamiento entre cuentas", async () => {
      const a = await signup(), b = await signup();
      for (const t of ["Uno", "Dos"]) await pool.query("INSERT INTO notifications (user_id, title, type) VALUES ($1, $2, 'info')", [a.id, t]);
      const list = json(await call("GET", "/me/notifications", { token: a.token }));
      expect(list.meta).toMatchObject({ total: 2, unread: 2 });
      const id = list.data[0].id;
      expect((await call("PATCH", `/me/notifications/${id}`, { token: b.token, payload: { is_read: true } })).statusCode).toBe(404);
      expect((await call("PATCH", `/me/notifications/${id}`, { token: a.token, payload: { is_read: true } })).statusCode).toBe(204);
      expect(json(await call("GET", "/me/notifications?unread=true", { token: a.token })).data).toHaveLength(1);
      expect((await call("POST", "/me/notifications/read-all", { token: a.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/me/notifications", { token: a.token })).meta.unread).toBe(0);
    });

    it("perfil público y seguidores", async () => {
      const a = await signup(), b = await signup();
      expect((await call("POST", `/users/${a.id}/follow`, { token: a.token })).statusCode).toBe(400);
      expect((await call("POST", `/users/${a.id}/follow`, { token: b.token })).statusCode).toBe(204);
      expect((await call("POST", `/users/${a.id}/follow`, { token: b.token })).statusCode).toBe(204); // idempotente
      const pub = json(await call("GET", `/users/${a.id}/public`)).data;
      expect(pub).toMatchObject({ display_name: "Ana Perfil", followers: 1, following: 0 });
      expect(pub.email).toBeUndefined();
      expect((await call("DELETE", `/users/${a.id}/follow`, { token: b.token })).statusCode).toBe(204);
      expect(json(await call("GET", `/users/${a.id}/public`)).data.followers).toBe(0);
      expect((await call("GET", "/users/11111111-1111-4111-8111-111111111111/public")).statusCode).toBe(404);
    });
  });

  describe("exportación y eliminación de cuenta", () => {
    it("exporta los datos propios y exige sesión", async () => {
      const u = await signup();
      await call("PUT", "/me/favorites/hotel/abc", { token: u.token });
      const res = await call("GET", "/me/export", { token: u.token });
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-disposition"]).toContain("attachment");
      const data = json(res);
      expect(data.account.email).toBe(u.email);
      expect(data.favorites).toHaveLength(1);
      expect(JSON.stringify(data)).not.toContain("password");
      expect((await call("GET", "/me/export")).statusCode).toBe(401);
    });

    it("eliminar: pide la contraseña, cierra sesiones, se puede cancelar y luego se anonimiza", async () => {
      const u = await signup();
      await call("PUT", "/me/favorites/hotel/abc", { token: u.token });
      expect((await call("DELETE", "/me", { token: u.token, payload: { password: "incorrecta-123" } })).statusCode).toBe(403);
      const del = await call("DELETE", "/me", { token: u.token, payload: { password: PW } });
      expect(del.statusCode).toBe(200);
      expect(json(del).data.grace_days).toBe(30);
      expect((await pool.query("SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [u.id])).rowCount).toBe(0);
      expect((await call("POST", "/me/deletion/cancel", { token: u.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/me/profile", { token: u.token })).data.deletion_requested_at).toBeNull();

      await call("DELETE", "/me", { token: u.token, payload: { password: PW } });
      await app.jobs.runNow("gdpr.process"); // aún dentro de la gracia: no toca nada
      expect((await pool.query("SELECT status FROM users WHERE id = $1", [u.id])).rows[0].status).toBe("active");
      await pool.query("UPDATE profiles SET deletion_requested_at = now() - interval '31 days' WHERE id = $1", [u.id]);
      await app.jobs.runNow("gdpr.process");
      const row = (await pool.query("SELECT u.email, u.status, p.display_name FROM users u JOIN profiles p ON p.id = u.id WHERE u.id = $1", [u.id])).rows[0];
      expect(row).toMatchObject({ status: "deleted", display_name: null });
      expect(row.email).toMatch(/^deleted-/);
      expect((await pool.query("SELECT 1 FROM favorites WHERE user_id = $1", [u.id])).rowCount).toBe(0);
      expect((await call("POST", "/auth/login", { payload: { email: u.email, password: PW } })).statusCode).toBe(401);
      expect((await call("GET", `/users/${u.id}/public`)).statusCode).toBe(404);
    });

    it("un propietario de organización no puede eliminarse sin transferirla", async () => {
      const u = await signup();
      await call("POST", "/orgs", { token: u.token, payload: { business_name: "Dueño SRL" } });
      const res = await call("DELETE", "/me", { token: u.token, payload: { password: PW } });
      expect(res.statusCode).toBe(422);
      expect(json(res).error.details.code).toBe("OWNS_ORG");
    });
  });

  describe("newsletter", () => {
    it("doble opt-in: no revela si el correo existe, confirma con token y no reenvía a quien ya está suscrito", async () => {
      const email = uniq("nl");
      const sub = () => call("POST", "/newsletter/subscribe", { payload: { email, name: "Lector", locale: "en" } });
      expect((await sub()).statusCode).toBe(202);
      await app.mailer.drain();
      const mail = app.mailer.last(email, "newsletter.confirm")!;
      expect(mail.subject).toContain("Confirm");
      expect((await pool.query("SELECT is_active FROM newsletter_subscribers WHERE email = $1", [email])).rows[0].is_active).toBe(false);
      const token = mail.text.match(/token=([\w-]+)/)![1]!;
      expect((await call("GET", "/newsletter/confirm?token=" + "x".repeat(20))).statusCode).toBe(404);
      expect((await call("GET", `/newsletter/confirm?token=${token}`)).statusCode).toBe(200);
      expect((await call("GET", `/newsletter/confirm?token=${token}`)).statusCode).toBe(404); // un solo uso
      expect((await pool.query("SELECT is_active, confirmed_at FROM newsletter_subscribers WHERE email = $1", [email])).rows[0]).toMatchObject({ is_active: true });
      const sent = app.mailer.outbox.length;
      const again = await sub();
      expect(again.statusCode).toBe(202);
      expect(json(again)).toEqual(json(await call("POST", "/newsletter/subscribe", { payload: { email: uniq("nl2") } }))); // misma respuesta exista o no
      await app.mailer.drain();
      expect(app.mailer.outbox.filter((m) => m.to === email).length).toBe(1);
      void sent;
    });

    it("baja con un clic por token firmado, y los bots (campo trampa) no crean filas", async () => {
      const email = uniq("nl");
      await call("POST", "/newsletter/subscribe", { payload: { email } });
      await pool.query("UPDATE newsletter_subscribers SET is_active = true, confirmed_at = now() WHERE email = $1", [email]);
      const token = unsubscribeToken(app.env.APP_SECRET!, email);
      expect(verifyUnsubscribeToken(app.env.APP_SECRET!, token)).toBe(email);
      expect(verifyUnsubscribeToken(app.env.APP_SECRET!, token.slice(0, -2) + "xx")).toBeNull();
      expect(verifyUnsubscribeToken("otro-secreto-de-al-menos-32-caracteres!!", token)).toBeNull();
      expect((await call("POST", "/newsletter/unsubscribe", { payload: { token: token.slice(0, -2) + "xx" } })).statusCode).toBe(404);
      expect((await call("POST", "/newsletter/unsubscribe", { payload: { token } })).statusCode).toBe(200);
      expect((await pool.query("SELECT is_active, unsubscribed_at FROM newsletter_subscribers WHERE email = $1", [email])).rows[0].is_active).toBe(false);
      const bot = uniq("bot");
      expect((await call("POST", "/newsletter/subscribe", { payload: { email: bot, website: "http://spam" } })).statusCode).toBe(202);
      expect((await pool.query("SELECT 1 FROM newsletter_subscribers WHERE email = $1", [bot])).rowCount).toBe(0);
    });
  });

  describe("contacto, soporte, leads y alta de establecimientos", () => {
    it("contacto crea un ticket con acuse y valida la entrada", async () => {
      const email = uniq("c");
      const res = await call("POST", "/contact", { payload: { name: "Carlos Prensa", email, category: "press", subject: "Entrevista", message: "Quisiéramos entrevistar al equipo." } });
      expect(res.statusCode).toBe(202);
      await app.mailer.drain();
      expect(app.mailer.last(email, "support.received")).toBeTruthy();
      expect((await pool.query("SELECT category, contact_email FROM support_tickets WHERE contact_email = $1", [email])).rows[0]).toMatchObject({ category: "press" });
      expect((await call("POST", "/contact", { payload: { name: "C", email: "x", subject: "a", message: "corto" } })).statusCode).toBe(400);
      expect((await call("POST", "/contact", { payload: { name: "Bot Bot", email: uniq("b"), subject: "hola hola", message: "mensaje de bot largo", website: "x" } })).statusCode).toBe(202);
    });

    it("tickets de soporte: sólo el dueño ve y responde; uno cerrado no admite mensajes", async () => {
      const a = await signup(), b = await signup();
      const created = await call("POST", "/support/tickets", { token: a.token, payload: { subject: "No puedo pagar", description: "El pago falla con mi tarjeta." } });
      expect(created.statusCode).toBe(201);
      const id = json(created).data.id;
      expect((await call("POST", "/support/tickets", { payload: { subject: "abc", description: "sin sesión no debe" } })).statusCode).toBe(401);
      expect((await call("GET", `/support/tickets/${id}`, { token: b.token })).statusCode).toBe(404);
      expect((await call("POST", `/support/tickets/${id}/messages`, { token: b.token, payload: { message: "intruso" } })).statusCode).toBe(404);
      expect((await call("POST", `/support/tickets/${id}/messages`, { token: a.token, payload: { message: "Adjunto captura." } })).statusCode).toBe(201);
      await pool.query("INSERT INTO support_messages (ticket_id, message, is_admin_reply) VALUES ($1, 'Estamos revisando', true)", [id]);
      const t = json(await call("GET", `/support/tickets/${id}`, { token: a.token })).data;
      expect(t.messages.map((m: { is_admin_reply: boolean }) => m.is_admin_reply)).toEqual([false, true]);
      expect(json(await call("GET", "/support/tickets", { token: a.token })).meta.total).toBe(1);
      await pool.query("UPDATE support_tickets SET status = 'closed' WHERE id = $1", [id]);
      expect((await call("POST", `/support/tickets/${id}/messages`, { token: a.token, payload: { message: "otra vez" } })).statusCode).toBe(422);
    });

    it("leads exigen consentimiento", async () => {
      const email = uniq("l");
      expect((await call("POST", "/leads", { payload: { name: "Lead Uno", email, consent: false } })).statusCode).toBe(400);
      expect((await call("POST", "/leads", { payload: { name: "Lead Uno", email, source: "afiliados", consent: true } })).statusCode).toBe(202);
      expect((await pool.query("SELECT consent, source FROM marketing_leads WHERE email = $1", [email])).rows[0]).toEqual({ consent: true, source: "afiliados" });
    });

    it("alta de establecimiento: queda pendiente y su estado sólo se consulta con el token", async () => {
      const email = uniq("e");
      const res = await call("POST", "/establishments/register", { payload: { type: "hotel", name: "Hotel Nuevo", contact_name: "Dueña Uno", email, phone: "8095551234", address: "Calle 1 #2", province: "Samaná", description: "Hotel frente al mar con 20 habitaciones." } });
      expect(res.statusCode).toBe(202);
      const { id, access_token } = json(res).data;
      await app.mailer.drain();
      expect(app.mailer.last(email, "establishment.received")).toBeTruthy();
      expect(json(await call("GET", `/establishments/registrations/${id}/status?token=${access_token}`)).data).toMatchObject({ name: "Hotel Nuevo", status: "pendiente" });
      expect((await call("GET", `/establishments/registrations/${id}/status?token=${"z".repeat(30)}`)).statusCode).toBe(404);
      expect((await call("POST", "/establishments/register", { payload: { type: "castillo", name: "X" } })).statusCode).toBe(400);
    });
  });
});
