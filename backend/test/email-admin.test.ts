import { createHmac } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const SECRET = "secreto-de-webhook-de-correo-1234";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `em${Date.now().toString(36)}${n++}@test.local`;

describe("administración del correo", () => {
  let app: FastifyInstance, hook: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string;
  const call = (a: FastifyInstance, method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    a.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const c = (method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) => call(app, method, url, opts);
  const account = async (role: string) => {
    const email = uniq();
    const reg = json(await c("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await c("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  const send = async (to: string, template: "auth.welcome" | "marketing.campaign" = "auth.welcome", locale: "es" | "fr" | "en" = "es", name = "Ana") => {
    await app.mailer.send(template === "auth.welcome"
      ? { to, template, locale, data: { name, url: "https://descubre.example/inicio" } }
      : { to, template: "marketing.campaign", locale, data: { subject: "Ofertas", body: "Hola", unsubscribe_url: "https://x.test/baja" } });
    await app.mailer.drain();
  };
  const logRow = async (to: string, template = "auth.welcome") => (await pool.query("SELECT * FROM email_log WHERE to_email = $1 AND template = $2 ORDER BY created_at DESC LIMIT 1", [to, template])).rows[0];
  const custom = { subject: "¡Hola {{name}}, bienvenido!", title: "Bienvenido, {{name}}", body_html: "<p>Tu cuenta está lista, <b>{{name}}</b>.</p><p>Empieza aquí.</p>", cta_label: "Entrar", cta_var: "url" };
  const sign = (raw: string, secret = SECRET) => `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  const webhook = (events: object[], signature?: string) => {
    const raw = JSON.stringify({ events });
    return hook.inject({ method: "POST", url: "/api/v1/webhooks/email/generic", payload: raw, headers: { "content-type": "application/json", "x-email-signature": signature ?? sign(raw) } });
  };

  beforeAll(async () => {
    app = await makeApp();
    hook = await makeApp({ EMAIL_WEBHOOK_SECRET: SECRET });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor");
    await pool.query("DELETE FROM email_templates WHERE key IN ('auth.welcome', 'store.order_update')");
  });
  afterAll(async () => { await pool.query("DELETE FROM email_templates"); await pool.end(); await Promise.all([app.close(), hook.close()]); });

  describe("plantillas", () => {
    it("sólo el admin las ve; lista variables, idiomas personalizados y datos de ejemplo", async () => {
      expect((await c("GET", "/admin/email/templates")).statusCode).toBe(401);
      expect((await c("GET", "/admin/email/templates", { token: editor })).statusCode).toBe(403);
      const list = json(await c("GET", "/admin/email/templates", { token: admin })).data as { key: string; variables: string[]; editable: boolean }[];
      expect(list.find((t) => t.key === "auth.welcome")).toMatchObject({ variables: ["name", "url"], editable: true });
      expect(list.find((t) => t.key === "marketing.campaign")!.editable).toBe(false);
      const d = json(await c("GET", "/admin/email/templates/booking.confirmation", { token: admin })).data;
      expect(d.variables).toContain("balance");
      expect(d.sample.reference).toBe("RD-4F7K2");
      expect(d.defaults.fr.subject).toContain("Réservation confirmée");
      expect(d.custom).toEqual({});
      expect((await c("GET", "/admin/email/templates/no.existe", { token: admin })).statusCode).toBe(400);
    });

    it("valida variables y botón; limpia el HTML peligroso; versiona, restaura y vuelve al original", async () => {
      const put = (locale: string, body: object) => c("PUT", `/admin/email/templates/auth.welcome/${locale}`, { token: admin, payload: body });
      const bad = await put("fr", { ...custom, subject: "Hola {{nombre_inventado}}" });
      expect(bad.statusCode).toBe(400);
      expect(JSON.stringify(json(bad).error.details.errors)).toContain("nombre_inventado");
      expect((await put("fr", { ...custom, cta_var: null })).statusCode).toBe(400);             // botón con texto pero sin enlace
      expect((await c("PUT", "/admin/email/templates/marketing.campaign/es", { token: admin, payload: custom })).statusCode).toBe(422);
      expect((await c("PUT", "/admin/email/templates/auth.welcome/fr", { token: editor, payload: custom })).statusCode).toBe(403);

      const v1 = json(await put("fr", { ...custom, body_html: `<p onclick="x()">Hola {{name}}</p><script>alert(1)</script><a href="javascript:alert(2)">malo</a><a href="https://ok.example/x" style="color:red">ok</a><iframe src="//evil"></iframe>` })).data;
      expect(v1.version).toBe(1);
      const preview = json(await c("POST", "/admin/email/templates/auth.welcome/preview", { token: admin, payload: { locale: "fr" } })).data;
      expect(preview.source).toBe("custom");
      expect(preview.html).not.toMatch(/<script|onclick|javascript:|<iframe|style="color/);
      expect(preview.html).toContain('href="https://ok.example/x"');
      expect(preview.subject).toBe("¡Hola Ana, bienvenido!");
      expect(preview.text).toContain("Entrar: https://descubre.example");

      expect(json(await put("fr", { ...custom, subject: "Versión 2 {{name}}" })).data.version).toBe(2);
      expect(json(await c("GET", "/admin/email/templates/auth.welcome/versions?locale=fr", { token: admin })).data.map((v: { version: number }) => v.version)).toEqual([2, 1]);
      const back = json(await c("POST", "/admin/email/templates/auth.welcome/fr/restore", { token: admin, payload: { version: 1 } })).data;
      expect(back).toMatchObject({ version: 3, restored_from: 1 });
      expect(json(await c("GET", "/admin/email/templates/auth.welcome", { token: admin })).data.custom.fr).toMatchObject({ version: 3, subject: "¡Hola {{name}}, bienvenido!" });
      expect((await c("POST", "/admin/email/templates/auth.welcome/fr/restore", { token: admin, payload: { version: 99 } })).statusCode).toBe(404);
      expect(json(await c("GET", "/admin/email/templates", { token: admin })).data.find((t: { key: string }) => t.key === "auth.welcome").customized.fr.version).toBe(3);

      expect((await c("DELETE", "/admin/email/templates/auth.welcome/fr", { token: admin })).statusCode).toBe(204);
      expect((await c("DELETE", "/admin/email/templates/auth.welcome/fr", { token: admin })).statusCode).toBe(404);
      expect(json(await c("POST", "/admin/email/templates/auth.welcome/preview", { token: admin, payload: { locale: "fr" } })).data.source).toBe("default");
    });

    it("la vista previa acepta un borrador sin guardarlo y rechaza uno con errores", async () => {
      const draft = json(await c("POST", "/admin/email/templates/auth.welcome/preview", { token: admin, payload: { locale: "es", data: { name: "Borrador" }, override: custom } })).data;
      expect(draft).toMatchObject({ source: "draft", subject: "¡Hola Borrador, bienvenido!" });
      expect((await pool.query("SELECT 1 FROM email_templates WHERE key = 'auth.welcome' AND locale = 'es'")).rowCount).toBe(0);
      expect((await c("POST", "/admin/email/templates/auth.welcome/preview", { token: admin, payload: { locale: "es", override: { ...custom, title: "{{x}}" } } })).statusCode).toBe(400);
    });

    it("los correos reales usan la plantilla editada de su idioma, con variables escapadas, y el cambio rige al instante", async () => {
      const to = uniq();
      await send(to, "auth.welcome", "es");
      expect(app.mailer.last(to)!.subject).toBe("¡Bienvenido a Descubre RD!");                  // sin personalización: la del código
      await c("PUT", "/admin/email/templates/auth.welcome/es", { token: admin, payload: custom });
      const to2 = uniq();
      await send(to2, "auth.welcome", "es", "<img src=x onerror=alert(1)>Ana");
      const m = app.mailer.last(to2)!;
      expect(m.subject).toContain("Hola <img src=x onerror=alert(1)>Ana");                       // el asunto es texto plano
      expect(m.html).not.toContain("<img src=x");                                                // en el HTML, el dato va escapado
      expect(m.html).toContain("&lt;img src=x onerror=alert(1)&gt;Ana");
      expect(m.text).toContain("Entrar: https://descubre.example/inicio");
      const to3 = uniq();
      await send(to3, "auth.welcome", "en");
      expect(app.mailer.last(to3)!.subject).toBe("Welcome to Descubre RD!");                     // otro idioma: no se afecta
      await c("PUT", "/admin/email/templates/auth.welcome/es", { token: admin, payload: { ...custom, subject: "Segunda {{name}}" } });
      const to4 = uniq();
      await send(to4);
      expect(app.mailer.last(to4)!.subject).toBe("Segunda Ana");
      await c("DELETE", "/admin/email/templates/auth.welcome/es", { token: admin });
      const to5 = uniq();
      await send(to5);
      expect(app.mailer.last(to5)!.subject).toBe("¡Bienvenido a Descubre RD!");
    });

    it("el correo de prueba usa el borrador, lleva «[PRUEBA]» y respeta la supresión", async () => {
      const to = uniq();
      const res = await c("POST", "/admin/email/templates/auth.welcome/test", { token: admin, payload: { locale: "es", to, override: custom } });
      expect(res.statusCode).toBe(202);
      await app.mailer.drain();
      expect(app.mailer.last(to)!.subject).toBe("[PRUEBA] ¡Hola Ana, bienvenido!");
      expect((await c("POST", "/admin/email/templates/auth.welcome/test", { token: editor, payload: { locale: "es", to } })).statusCode).toBe(403);
      await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: to } });
      const blocked = await c("POST", "/admin/email/templates/auth.welcome/test", { token: admin, payload: { locale: "es", to } });
      expect(blocked.statusCode).toBe(422);
      expect(json(blocked).error.details.code).toBe("SUPPRESSED");
    });
  });

  describe("supresiones y bitácora", () => {
    it("un correo suprimido no sale y queda registrado; la baja sólo frena el marketing", async () => {
      const to = uniq();
      const add = await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: to.toUpperCase(), reason: "hard_bounce", note: "Buzón inexistente" } });
      expect(add.statusCode).toBe(201);
      await send(to);
      expect(app.mailer.last(to)).toBeUndefined();
      expect(await logRow(to)).toMatchObject({ status: "suppressed", error: "suppressed:hard_bounce" });
      expect((await logRow(to)).payload).toBeNull();
      const sup = json(await c("GET", `/admin/email/suppressions?q=${to.slice(0, 8)}`, { token: admin })).data;
      expect(sup[0]).toMatchObject({ email: to, reason: "hard_bounce", note: "Buzón inexistente" });
      expect((await c("GET", "/admin/email/suppressions", { token: editor })).statusCode).toBe(403);
      expect((await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: "no-es-correo" } })).statusCode).toBe(400);

      expect((await c("DELETE", `/admin/email/suppressions?email=${encodeURIComponent(to)}`, { token: admin })).statusCode).toBe(204);
      expect((await c("DELETE", `/admin/email/suppressions?email=${encodeURIComponent(to)}`, { token: admin })).statusCode).toBe(404);
      await send(to);
      expect(app.mailer.last(to)).toBeDefined();

      const unsub = uniq();
      await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: unsub, reason: "unsubscribe" } });
      await send(unsub, "auth.welcome");
      expect(app.mailer.last(unsub, "auth.welcome")).toBeDefined();                              // lo transaccional sigue
      await send(unsub, "marketing.campaign");
      expect(app.mailer.last(unsub, "marketing.campaign")).toBeUndefined();                      // el marketing no
      expect((await logRow(unsub, "marketing.campaign")).status).toBe("suppressed");
    });

    it("una supresión posterior al encolado también detiene el envío", async () => {
      const to = uniq();
      await pool.query("INSERT INTO email_log (to_email, template, locale, subject, payload, status, next_attempt_at) VALUES ($1,'auth.welcome','es','x', $2, 'queued', now())", [to, JSON.stringify({ data: { name: "Ana", url: "https://x.test" } })]);
      await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: to, reason: "complaint" } });
      await app.mailer.drain();
      expect(app.mailer.last(to)).toBeUndefined();
      expect((await logRow(to)).status).toBe("suppressed");
    });

    it("la bitácora filtra, no expone el contenido y permite reenviar (salvo suprimidos)", async () => {
      const to = uniq();
      await send(to);
      const list = json(await c("GET", `/admin/email/log?to=${encodeURIComponent(to.slice(0, 10))}&template=auth.welcome&status=sent`, { token: admin }));
      expect(list.data).toHaveLength(1);
      expect(list.data[0]).toMatchObject({ to_email: to, template: "auth.welcome", status: "sent", can_resend: true });
      expect(JSON.stringify(list.data[0])).not.toContain("descubre.example");                    // sin payload: no hay enlaces ni datos del mensaje
      expect(list.meta.total).toBe(1);
      expect(json(await c("GET", `/admin/email/log?to=${encodeURIComponent(to)}&status=failed`, { token: admin })).data).toHaveLength(0);
      expect((await c("GET", "/admin/email/log?status=raro", { token: admin })).statusCode).toBe(400);
      expect((await c("GET", "/admin/email/log", { token: editor })).statusCode).toBe(403);

      const id = list.data[0].id;
      const re = await c("POST", `/admin/email/log/${id}/resend`, { token: admin });
      expect(re.statusCode).toBe(202);
      await app.mailer.drain();
      expect(app.mailer.outbox.filter((m) => m.to === to)).toHaveLength(2);
      expect((await pool.query("SELECT resent_from FROM email_log WHERE id = $1", [json(re).data.id])).rows[0].resent_from).toBe(id);
      // Suprimida: hay que quitarla antes.
      await c("POST", "/admin/email/suppressions", { token: admin, payload: { email: to } });
      const blocked = await c("POST", `/admin/email/log/${id}/resend`, { token: admin });
      expect(blocked.statusCode).toBe(422);
      expect(json(blocked).error.details.code).toBe("SUPPRESSED");
      // Sin contenido guardado no se puede reenviar.
      await pool.query("UPDATE email_log SET payload = NULL WHERE id = $1", [id]);
      await c("DELETE", `/admin/email/suppressions?email=${encodeURIComponent(to)}`, { token: admin });
      expect(json(await c("POST", `/admin/email/log/${id}/resend`, { token: admin })).error.details.code).toBe("NO_PAYLOAD");
      expect((await c("POST", "/admin/email/log/99999999-9999-4999-8999-999999999999/resend", { token: admin })).statusCode).toBe(404);
    });

    it("resume los correos por estado", async () => {
      const s = json(await c("GET", "/admin/email/stats", { token: admin })).data;
      expect(s.last_24h.sent).toBeGreaterThan(0);
      expect(s.last_24h.suppressed).toBeGreaterThan(0);
      expect(s.suppressions).toBeGreaterThan(0);
    });
  });

  describe("webhook del proveedor", () => {
    const sent = async (to: string, providerId: string) => { await send(to); await pool.query("UPDATE email_log SET provider_id = $2 WHERE id = $1", [(await logRow(to)).id, providerId]); };

    it("sin secreto configurado está apagado; con firma inválida se rechaza", async () => {
      const raw = JSON.stringify({ events: [] });
      expect((await app.inject({ method: "POST", url: "/api/v1/webhooks/email/generic", payload: raw, headers: { "content-type": "application/json", "x-email-signature": sign(raw) } })).statusCode).toBe(404);
      expect((await webhook([], "sha256=" + "0".repeat(64))).statusCode).toBe(401);
      expect((await webhook([], "sin-firma")).statusCode).toBe(401);
      expect((await webhook([], sign(JSON.stringify({ events: [] }), "otro-secreto-de-16-caracteres"))).statusCode).toBe(401);
      const bad = JSON.stringify({ events: [{ type: "inventado" }] });
      expect((await hook.inject({ method: "POST", url: "/api/v1/webhooks/email/generic", payload: bad, headers: { "content-type": "application/json", "x-email-signature": sign(bad) } })).statusCode).toBe(400);
      expect((await hook.inject({ method: "POST", url: "/api/v1/webhooks/email/otro", payload: raw, headers: { "content-type": "application/json", "x-email-signature": sign(raw) } })).statusCode).toBe(400);
    });

    it("entrega, apertura, rebote duro y queja actualizan la bitácora y suprimen; el rebote blando no", async () => {
      const [a, b, s, q] = [uniq(), uniq(), uniq(), uniq()];
      await sent(a, `pid-a-${tag}`); await sent(b, `pid-b-${tag}`); await sent(s, `pid-s-${tag}`); await sent(q, `pid-q-${tag}`);
      const res = await webhook([
        { type: "delivered", provider_id: `pid-a-${tag}` }, { type: "open", provider_id: `pid-a-${tag}` },
        { type: "bounce", provider_id: `pid-b-${tag}`, bounce_type: "hard" }, { type: "bounce", provider_id: `pid-s-${tag}`, bounce_type: "soft" },
        { type: "complaint", provider_id: `pid-q-${tag}` }, { type: "delivered", provider_id: "no-existe" }, { type: "bounce", email: "fantasma@test.local" },
      ]);
      expect(res.statusCode).toBe(200);
      expect(json(res)).toMatchObject({ received: true, delivered: 0 + 1, bounced: 2, soft_bounces: 1, complained: 1, opened: 1, suppressed: 3 });
      expect(await logRow(a)).toMatchObject({ status: "delivered" });
      expect((await logRow(a)).delivered_at).toBeTruthy();
      expect((await logRow(a)).opened_at).toBeTruthy();
      expect(await logRow(b)).toMatchObject({ status: "bounced", bounce_type: "hard" });
      expect(await logRow(s)).toMatchObject({ status: "sent", bounce_type: "soft" });
      expect(await logRow(q)).toMatchObject({ status: "complained" });
      const reasons = Object.fromEntries((await pool.query("SELECT email, reason FROM email_suppressions WHERE email = ANY($1)", [[a, b, s, q, "fantasma@test.local"]])).rows.map((r) => [r.email, r.reason]));
      expect(reasons).toEqual({ [b]: "hard_bounce", [q]: "complaint", "fantasma@test.local": "hard_bounce" });
      // A partir de ahora no se les escribe.
      await send(b);
      expect((await pool.query("SELECT status FROM email_log WHERE to_email = $1 ORDER BY created_at DESC LIMIT 1", [b])).rows[0].status).toBe("suppressed");
      // Repetir el evento es inocuo y una entrega tardía no revierte un rebote.
      const again = await webhook([{ type: "bounce", provider_id: `pid-b-${tag}`, bounce_type: "hard" }, { type: "delivered", provider_id: `pid-b-${tag}` }]);
      expect(json(again)).toMatchObject({ delivered: 0, suppressed: 0 });
      expect((await pool.query("SELECT status FROM email_log WHERE provider_id = $1", [`pid-b-${tag}`])).rows[0].status).toBe("bounced");
    });
  });
});
