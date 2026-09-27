import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { evaluate, ipInCidr, normalizeIp, type IpRule } from "../src/plugins/ip-rules.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `ap${Date.now().toString(36)}${n++}@test.local`;
const BEACH = "b1000000-0000-4000-8000-000000000001";

describe("reglas de IP (lógica)", () => {
  it("reconoce IPs sueltas, rangos IPv4/IPv6 y direcciones IPv4 dentro de IPv6", () => {
    expect(ipInCidr("10.1.2.3", "10.0.0.0/8")).toBe(true);
    expect(ipInCidr("11.1.2.3", "10.0.0.0/8")).toBe(false);
    expect(ipInCidr("192.168.1.5", "192.168.1.5")).toBe(true);
    expect(ipInCidr("192.168.1.6", "192.168.1.5")).toBe(false);
    expect(ipInCidr("2001:db8::1", "2001:db8::/32")).toBe(true);
    expect(ipInCidr("2001:db9::1", "2001:db8::/32")).toBe(false);
    expect(ipInCidr("10.1.2.3", "2001:db8::/32")).toBe(false);          // familias distintas no se mezclan
    expect(ipInCidr("::ffff:10.1.2.3", "10.0.0.0/8")).toBe(true);
    expect(normalizeIp("::ffff:1.2.3.4")).toBe("1.2.3.4");
    expect(ipInCidr("no-es-ip", "10.0.0.0/8")).toBe(false);
  });

  it("deny bloquea; una lista de permitidos del panel restringe sólo /admin", () => {
    const r = (action: "allow" | "deny", cidr: string, scope: "all" | "admin" = "all"): IpRule => ({ id: cidr, action, cidr, scope });
    expect(evaluate([], "1.1.1.1", true)).toBe("ok");
    expect(evaluate([r("deny", "1.1.1.0/24")], "1.1.1.9", false)).toBe("denied");
    expect(evaluate([r("deny", "1.1.1.0/24", "admin")], "1.1.1.9", false)).toBe("ok");         // el bloqueo sólo del panel no afecta al sitio
    expect(evaluate([r("deny", "1.1.1.0/24", "admin")], "1.1.1.9", true)).toBe("denied");
    const allow = [r("allow", "203.0.113.0/24", "admin")];
    expect(evaluate(allow, "203.0.113.7", true)).toBe("ok");
    expect(evaluate(allow, "198.51.100.1", true)).toBe("admin_not_allowed");
    expect(evaluate(allow, "198.51.100.1", false)).toBe("ok");                                   // el resto del API sigue abierto
    expect(evaluate([...allow, r("deny", "203.0.113.66")], "203.0.113.66", true)).toBe("denied"); // deny gana a allow
  });
});

describe("administración del portal", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string; email: string }, moderator: { token: string; id: string; email: string }, editor: { token: string; id: string; email: string };
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; ip?: string } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, remoteAddress: opts.ip, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona Panel" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string, email };
  };
  const createdReviews: string[] = [];
  let beachesBefore: { id: string; rating: string | null; review_count: number | null }[] = [];
  const inbox = async (token: string) => json(await call("GET", "/me/notifications?per_page=100", { token })).data as { title: string; message: string | null; type: string }[];

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); moderator = await account("moderator"); editor = await account("editor");
    await pool.query("DELETE FROM ip_rules");
    beachesBefore = (await pool.query("SELECT id, rating, review_count FROM beaches WHERE id IN ('b1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002')")).rows;
  });
  afterAll(async () => {
    if (createdReviews.length) await pool.query("DELETE FROM reviews WHERE id = ANY($1)", [createdReviews]);
    for (const b of beachesBefore) await pool.query("UPDATE beaches SET rating = $2, review_count = $3 WHERE id = $1", [b.id, b.rating, b.review_count]);
    await pool.query("DELETE FROM ip_rules");
    await pool.query("UPDATE feature_flags SET enabled = true WHERE key IN ('registration_enabled', 'checkout_enabled', 'marketplace_orders_enabled', 'ai_chat_enabled', 'ai_planner_enabled')");
    await pool.end(); await app.close();
  });

  describe("banderas de funciones", () => {
    const set = (flags: { key: string; enabled: boolean }[], token = admin.token) => call("PUT", "/admin/system/feature-flags", { token, payload: { flags } });

    it("sólo el admin las administra; se pueden crear nuevas y las públicas se publican", async () => {
      expect((await call("GET", "/admin/system/feature-flags")).statusCode).toBe(401);
      expect((await call("GET", "/admin/system/feature-flags", { token: editor.token })).statusCode).toBe(403);
      expect((await set([{ key: "checkout_enabled", enabled: true }], moderator.token)).statusCode).toBe(403);
      const list = json(await call("GET", "/admin/system/feature-flags", { token: admin.token })).data as { key: string; enabled: boolean }[];
      expect(list.map((f) => f.key)).toEqual(expect.arrayContaining(["registration_enabled", "checkout_enabled", "marketplace_orders_enabled", "ai_chat_enabled", "ai_planner_enabled"]));
      expect((await set([{ key: "Mala Clave", enabled: true }])).statusCode).toBe(400);
      const created = json(await call("PUT", "/admin/system/feature-flags", { token: admin.token, payload: { flags: [{ key: `nueva_${tag}`, enabled: false, description: "Prueba", is_public: true }] } })).data;
      expect(created.find((f: { key: string }) => f.key === `nueva_${tag}`)).toMatchObject({ enabled: false, is_public: true, description: "Prueba" });
      const pub = json(await call("GET", "/feature-flags")).data;
      expect(pub[`nueva_${tag}`]).toBe(false);
      expect(pub.checkout_enabled).toBe(true);
      await pool.query("DELETE FROM feature_flags WHERE key = $1", [`nueva_${tag}`]);
      app.flags.clear();
    });

    it("apagar una bandera detiene esa función y encenderla la devuelve", async () => {
      try {
        await set([{ key: "registration_enabled", enabled: false }]);
        const reg = await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } });
        expect(reg.statusCode).toBe(503);
        expect(json(reg).error.details).toMatchObject({ code: "FEATURE_DISABLED", flag: "registration_enabled" });
        expect((await call("POST", "/auth/login", { payload: { email: admin.email, password: PW } })).statusCode).toBe(200);     // iniciar sesión sigue funcionando
        await set([{ key: "registration_enabled", enabled: true }]);
        expect((await call("POST", "/auth/register", { payload: { email: uniq(), password: PW, accept_terms: true } })).statusCode).toBe(201);

        await set([{ key: "checkout_enabled", enabled: false }]);
        for (const url of ["/orders", "/marketplace/orders", "/bookings"]) {
          const res = await call("POST", url, { payload: {} });
          expect(res.statusCode, url).toBe(503);
          expect(json(res).error.details.flag).toBe("checkout_enabled");
        }
        expect((await call("GET", "/store/products")).statusCode).toBe(200);                                                   // el catálogo sigue visible
        await set([{ key: "checkout_enabled", enabled: true }, { key: "marketplace_orders_enabled", enabled: false }]);
        expect(json(await call("POST", "/marketplace/orders", { payload: {} })).error.details.flag).toBe("marketplace_orders_enabled");
        expect((await call("POST", "/orders", { payload: {} })).statusCode).toBe(400);                                          // la tienda ya no está en pausa (falla por cuerpo vacío)
        await set([{ key: "marketplace_orders_enabled", enabled: true }, { key: "ai_chat_enabled", enabled: false }, { key: "ai_planner_enabled", enabled: false }]);
        expect(json(await call("POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "hola" }] } })).error.details.flag).toBe("ai_chat_enabled");
        expect(json(await call("POST", "/ai/itinerary", { payload: { days: 1 } })).error.details.flag).toBe("ai_planner_enabled");
        expect((await call("POST", "/ai/recommendations", { token: admin.token, payload: {} })).statusCode).toBe(503);
      } finally {
        await set([{ key: "registration_enabled", enabled: true }, { key: "checkout_enabled", enabled: true }, { key: "marketplace_orders_enabled", enabled: true }, { key: "ai_chat_enabled", enabled: true }, { key: "ai_planner_enabled", enabled: true }]);
      }
      expect((await call("POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "hola" }] } })).statusCode).toBe(200);
    });
  });

  describe("reglas de IP (API)", () => {
    const add = (payload: object, token = admin.token, ip?: string) => call("POST", "/admin/ip-rules", { token, payload, ip });
    const clean = async () => { await pool.query("DELETE FROM ip_rules"); app.ipRules.clear(); };

    it("bloquea una IP en todo el API, salvo la salud del servicio, y la regla se puede quitar", async () => {
      await clean();
      expect((await call("GET", "/admin/ip-rules")).statusCode).toBe(401);
      expect((await call("GET", "/admin/ip-rules", { token: moderator.token })).statusCode).toBe(403);
      expect((await add({ cidr: "10.9.9.0/24", action: "deny" }, moderator.token)).statusCode).toBe(403);
      for (const bad of [{ cidr: "no-es-ip", action: "deny" }, { cidr: "10.0.0.0/40", action: "deny" }, { cidr: "10.0.0.1", action: "allow", scope: "all" }, { cidr: "10.0.0.1", action: "deny", expires_at: "2020-01-01T00:00:00Z" }]) expect((await add(bad)).statusCode, JSON.stringify(bad)).toBe(400);
      const rule = json(await add({ cidr: "10.9.9.0/24", action: "deny", note: "Abuso detectado" })).data;
      expect(rule).toMatchObject({ cidr: "10.9.9.0/24", action: "deny", scope: "all" });
      const blocked = await call("GET", "/destinations", { ip: "10.9.9.5" });
      expect(blocked.statusCode).toBe(403);
      expect(json(blocked).error.details.code).toBe("IP_BLOCKED");
      expect((await call("GET", "/destinations", { ip: "10.9.8.5" })).statusCode).toBe(200);          // otro rango
      expect((await call("GET", "/destinations")).statusCode).toBe(200);                              // la de las pruebas
      expect((await app.inject({ method: "GET", url: "/health", remoteAddress: "10.9.9.5" })).statusCode).toBe(200);
      expect(json(await call("GET", "/admin/ip-rules", { token: admin.token })).data).toMatchObject({ your_ip: "127.0.0.1", rules: [{ cidr: "10.9.9.0/24" }] });
      expect((await call("DELETE", `/admin/ip-rules/${rule.id}`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("DELETE", `/admin/ip-rules/${rule.id}`, { token: admin.token })).statusCode).toBe(404);
      expect((await call("GET", "/destinations", { ip: "10.9.9.5" })).statusCode).toBe(200);          // rige al instante
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action IN ('security.ip_rule_added', 'security.ip_rule_removed') AND meta->>'cidr' = '10.9.9.0/24'")).rows[0].n).toBe(2);
    });

    it("una regla vencida deja de aplicar", async () => {
      await clean();
      await pool.query("INSERT INTO ip_rules (cidr, action, scope, expires_at) VALUES ('10.7.7.0/24', 'deny', 'all', now() - interval '1 minute')");
      app.ipRules.clear();
      expect((await call("GET", "/destinations", { ip: "10.7.7.7" })).statusCode).toBe(200);
      await pool.query("UPDATE ip_rules SET expires_at = now() + interval '1 hour'");
      app.ipRules.clear();
      expect((await call("GET", "/destinations", { ip: "10.7.7.7" })).statusCode).toBe(403);
      await clean();
    });

    it("no permite reglas que dejen fuera a quien las crea", async () => {
      await clean();
      const self = await add({ cidr: "127.0.0.0/8", action: "deny" });
      expect(self.statusCode).toBe(422);
      expect(json(self).error.details).toMatchObject({ code: "SELF_LOCKOUT", your_ip: "127.0.0.1" });
      expect((await add({ cidr: "127.0.0.1", action: "deny", scope: "admin" })).statusCode).toBe(422);
      expect((await add({ cidr: "192.0.2.0/24", action: "allow", scope: "admin" })).statusCode).toBe(422);   // lista de permitidos sin tu IP
      expect((await pool.query("SELECT count(*)::int AS n FROM ip_rules")).rows[0].n).toBe(0);
      await clean();
    });

    it("la lista de permitidos del panel bloquea /admin desde otras direcciones pero no el resto del sitio", async () => {
      await clean();
      const mine = json(await add({ cidr: "127.0.0.1", action: "allow", scope: "admin", note: "Oficina" })).data;
      expect((await call("GET", "/admin/system/feature-flags", { token: admin.token })).statusCode).toBe(200);
      const out = await call("GET", "/admin/system/feature-flags", { token: admin.token, ip: "198.51.100.20" });
      expect(out.statusCode).toBe(403);
      expect(json(out).error.details.code).toBe("ADMIN_IP_NOT_ALLOWED");
      expect((await call("GET", "/destinations", { ip: "198.51.100.20" })).statusCode).toBe(200);
      expect((await call("GET", "/auth/me", { token: admin.token, ip: "198.51.100.20" })).statusCode).toBe(200);
      // Añadir otra dirección no lo afecta; quitar la propia lo dejaría fuera.
      const other = json(await add({ cidr: "203.0.113.0/24", action: "allow", scope: "admin" })).data;
      const lock = await call("DELETE", `/admin/ip-rules/${mine.id}`, { token: admin.token });
      expect(lock.statusCode).toBe(422);
      expect(json(lock).error.details.code).toBe("SELF_LOCKOUT");
      expect((await call("DELETE", `/admin/ip-rules/${other.id}`, { token: admin.token })).statusCode).toBe(204);
      expect((await call("DELETE", `/admin/ip-rules/${mine.id}`, { token: admin.token })).statusCode).toBe(204);       // sin más permitidos, ya no hay restricción
      expect((await call("GET", "/admin/system/feature-flags", { token: admin.token, ip: "198.51.100.20" })).statusCode).toBe(200);
      await clean();
    });
  });

  describe("banderas de usuario", () => {
    it("la moderación las crea, actualiza, filtra y quita; un usuario común no", async () => {
      const u = await account(), plain = await account();
      expect((await call("GET", "/admin/user-flags", { token: plain.token })).statusCode).toBe(403);
      expect((await call("GET", "/admin/user-flags")).statusCode).toBe(401);
      const body = { user_id: u.id, flag_name: "xp_farming", value: "sospechoso", note: "Muchos check-ins seguidos" };
      expect((await call("POST", "/admin/user-flags", { token: moderator.token, payload: { ...body, flag_name: "Mala Bandera" } })).statusCode).toBe(400);
      expect((await call("POST", "/admin/user-flags", { token: moderator.token, payload: { ...body, user_id: "99999999-9999-4999-8999-999999999999" } })).statusCode).toBe(404);
      const a = json(await call("POST", "/admin/user-flags", { token: moderator.token, payload: body })).data;
      const again = json(await call("POST", "/admin/user-flags", { token: moderator.token, payload: { ...body, value: "confirmado" } })).data;
      expect(again.id).toBe(a.id);                                                              // la misma bandera se actualiza, no se duplica
      expect(again.value).toBe("confirmado");
      await call("POST", "/admin/user-flags", { token: admin.token, payload: { user_id: u.id, flag_name: "gps_suspect" } });
      const list = json(await call("GET", `/admin/user-flags?user_id=${u.id}`, { token: moderator.token })).data;
      expect(list.map((f: { flag_name: string }) => f.flag_name).sort()).toEqual(["gps_suspect", "xp_farming"]);
      expect(list[0]).toMatchObject({ email: u.email, display_name: "Persona Panel" });
      expect(json(await call("GET", `/admin/user-flags?flag_name=xp_farming&user_id=${u.id}`, { token: moderator.token })).data).toHaveLength(1);
      expect(json(await call("PATCH", `/admin/user-flags/${a.id}`, { token: moderator.token, payload: { note: "Revisado" } })).data.note).toBe("Revisado");
      expect((await call("PATCH", `/admin/user-flags/${a.id}`, { token: moderator.token, payload: {} })).statusCode).toBe(400);
      expect((await call("DELETE", `/admin/user-flags/${a.id}`, { token: moderator.token })).statusCode).toBe(204);
      expect((await call("DELETE", `/admin/user-flags/${a.id}`, { token: moderator.token })).statusCode).toBe(404);
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity_id = $1 AND action LIKE 'user.flag_%'", [u.id])).rows[0].n).toBeGreaterThanOrEqual(4);
    });
  });

  describe("soporte", () => {
    const open = async (u: { token: string }, subject = `Duda ${tag}`) => json(await call("POST", "/support/tickets", { token: u.token, payload: { subject, description: "No puedo ver mi reserva confirmada." } })).data.id as string;

    it("bandeja, asignación, respuesta al usuario (aviso y correo), notas internas y estados", async () => {
      const u = await account(), other = await account();
      const id = await open(u);
      const urgent = await open(other, `Urgente ${tag}`);
      await call("PATCH", `/admin/support/tickets/${urgent}`, { token: moderator.token, payload: { priority: "urgent" } });
      expect((await call("GET", "/admin/support/tickets", { token: u.token })).statusCode).toBe(403);
      expect((await call("GET", "/admin/support/tickets")).statusCode).toBe(401);

      const list = json(await call("GET", `/admin/support/tickets?status=open&q=${tag}`, { token: moderator.token }));
      expect(list.data.map((t: { id: string }) => t.id)).toEqual([urgent, id]);                       // lo urgente primero
      expect(list.data[1]).toMatchObject({ email: u.email, status: "open", messages: 0, reference: id.slice(0, 8).toUpperCase() });
      expect(json(await call("GET", `/admin/support/tickets?unassigned=true&status=open&q=${tag}`, { token: moderator.token })).data).toHaveLength(2);

      // Asignar: sólo personal de soporte.
      expect((await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: { assigned_to: u.id } })).statusCode).toBe(400);
      expect(json(await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: { assigned_to: moderator.id } })).data.assigned_to).toBe(moderator.id);
      expect((await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: {} })).statusCode).toBe(400);
      expect((await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: { status: "inventado" } })).statusCode).toBe(400);

      // Nota interna: el usuario no la ve y no cuenta como respuesta.
      await call("POST", `/admin/support/tickets/${id}/messages`, { token: moderator.token, payload: { message: "Revisar con reservas", internal: true } });
      expect(json(await call("GET", `/support/tickets/${id}`, { token: u.token })).data.messages).toHaveLength(0);
      expect((await pool.query("SELECT first_response_at FROM support_tickets WHERE id = $1", [id])).rows[0].first_response_at).toBeNull();
      expect(await inbox(u.token)).toHaveLength(0);

      // Respuesta: mensaje visible, estado, aviso en la bandeja y correo.
      const sent = await call("POST", `/admin/support/tickets/${id}/messages`, { token: moderator.token, payload: { message: "Ya revisamos: tu reserva está confirmada." } });
      expect(sent.statusCode).toBe(201);
      const seen = json(await call("GET", `/support/tickets/${id}`, { token: u.token })).data;
      expect(seen.status).toBe("in_progress");
      expect(seen.messages).toEqual([expect.objectContaining({ message: "Ya revisamos: tu reserva está confirmada.", is_admin_reply: true })]);
      expect((await inbox(u.token))[0]).toMatchObject({ title: `Respuesta a tu ticket: Duda ${tag}`, message: "Ya revisamos: tu reserva está confirmada.", type: "system" });
      await app.mailer.drain();
      expect(app.mailer.last(u.email, "support.reply")!.text).toContain("tu reserva está confirmada");
      const detail = json(await call("GET", `/admin/support/tickets/${id}`, { token: moderator.token })).data;
      expect(detail.messages.map((m: { internal: boolean }) => m.internal)).toEqual([true, false]);       // el panel ve las dos
      expect((await pool.query("SELECT first_response_at FROM support_tickets WHERE id = $1", [id])).rows[0].first_response_at).toBeTruthy();

      // Resolver avisa; cerrar impide responder.
      await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: { status: "resolved" } });
      expect((await inbox(u.token)).some((x) => x.title === "Resolvimos tu ticket")).toBe(true);
      expect((await pool.query("SELECT resolved_at FROM support_tickets WHERE id = $1", [id])).rows[0].resolved_at).toBeTruthy();
      await call("PATCH", `/admin/support/tickets/${id}`, { token: moderator.token, payload: { status: "closed" } });
      const closed = await call("POST", `/admin/support/tickets/${id}/messages`, { token: moderator.token, payload: { message: "Otra cosa" } });
      expect(closed.statusCode).toBe(422);
      expect(json(closed).error.details.code).toBe("TICKET_CLOSED");
      expect((await call("GET", `/admin/support/tickets/99999999-9999-4999-8999-999999999999`, { token: moderator.token })).statusCode).toBe(404);
    });

    it("las estadísticas resumen pendientes, sin asignar y tiempos de respuesta", async () => {
      const u = await account();
      await open(u, `Stats ${tag}`);
      const s = json(await call("GET", "/admin/support/stats", { token: moderator.token })).data;
      expect(s.by_status.open).toBeGreaterThanOrEqual(1);
      expect(s.unassigned).toBeGreaterThanOrEqual(1);
      expect(s.oldest_hours).toBeGreaterThanOrEqual(0);
      expect(s.avg_first_response_hours).not.toBeUndefined();
      expect(s.open_by_priority.medium).toBeGreaterThanOrEqual(1);
      expect((await call("GET", "/admin/support/stats", { token: u.token })).statusCode).toBe(403);
    });
  });

  describe("moderación unificada", () => {
    const act = (type: string, id: string, action: string, token = moderator.token, reason?: string) => call("POST", `/admin/moderation/${type}/${id}/${action}`, { token, payload: reason ? { reason } : undefined });
    const review = async (user: string, comment: string, entity = BEACH) => {
      const id = (await pool.query("INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, comment, status, is_approved) VALUES (gen_random_uuid(), $1, 'beach', $2, 4, $3, 'pending', false) RETURNING id", [user, entity, comment])).rows[0].id as string;
      createdReviews.push(id);
      return id;
    };
    const post = async (user: string, reports = 2) => (await pool.query("INSERT INTO social_posts (id, user_id, content, is_active, report_count) VALUES (gen_random_uuid(), $1, $2, true, $3) RETURNING id", [user, `Publicación ${tag}`, reports])).rows[0].id as string;

    it("la cola junta lo pendiente de cada tipo con sus alertas automáticas y sus totales", async () => {
      const u = await account();
      const rev = await review(u.id, "Visítenos en www.spam-turismo.com o escriba a promo@spam.com");
      const p = await post(u.id, 3);
      await pool.query("INSERT INTO ugc_media (user_id, media_url, media_type, associated_entity_type, associated_entity_id) VALUES ($1, 'https://x.test/a.jpg', 'photo', 'beach', $2)", [u.id, BEACH]);
      expect((await call("GET", "/admin/moderation/queue", { token: u.token })).statusCode).toBe(403);
      expect((await call("GET", "/admin/moderation/queue")).statusCode).toBe(401);
      const all = json(await call("GET", "/admin/moderation/queue", { token: moderator.token }));
      expect(all.meta.totals).toMatchObject({ review: expect.any(Number), post: expect.any(Number), media: expect.any(Number), ugc_media: expect.any(Number), photo_submission: expect.any(Number), report: expect.any(Number) });
      expect(all.meta.total).toBeGreaterThanOrEqual(3);
      const onlyReviews = json(await call("GET", "/admin/moderation/queue?type=review&per_page=100", { token: moderator.token }));
      const item = onlyReviews.data.find((x: { id: string }) => x.id === rev);
      expect(item).toMatchObject({ type: "review", author_id: u.id, author_name: "Persona Panel" });
      expect(item.auto_flags).toEqual(expect.arrayContaining(["contains_link", "contains_contact"]));
      expect(json(await call("GET", "/admin/moderation/queue?type=post&per_page=100", { token: moderator.token })).data.find((x: { id: string }) => x.id === p)).toMatchObject({ reports: 3 });
      expect((await call("GET", "/admin/moderation/queue?type=comentario", { token: moderator.token })).statusCode).toBe(400);
    });

    it("aprobar o rechazar una reseña actualiza su estado y la calificación, y avisa a su autor", async () => {
      const u = await account();
      const good = await review(u.id, "Una playa muy tranquila, volvería con la familia.");
      const bad = await review(u.id, "Visiten www.otra-web.com ahora mismo", "b1000000-0000-4000-8000-000000000002");
      const ok = await act("review", good, "approve");
      expect(ok.statusCode).toBe(200);
      expect(json(ok).data).toMatchObject({ type: "review", action: "approve", notified: true });
      expect((await pool.query("SELECT status, is_approved FROM reviews WHERE id = $1", [good])).rows[0]).toEqual({ status: "approved", is_approved: true });
      expect((await inbox(u.token)).some((x) => x.title === "Aprobamos tu reseña")).toBe(true);
      expect((await act("review", bad, "reject")).statusCode).toBe(400);
      expect((await act("review", bad, "reject", moderator.token, "Contiene publicidad")).statusCode).toBe(200);
      expect((await pool.query("SELECT status, moderation_note FROM reviews WHERE id = $1", [bad])).rows[0]).toEqual({ status: "rejected", moderation_note: "Contiene publicidad" });
      expect((await inbox(u.token)).find((x) => x.title === "No pudimos aprobar tu reseña")).toMatchObject({ message: "Contiene publicidad" });
      expect((await act("review", "99999999-9999-4999-8999-999999999999", "approve")).statusCode).toBe(404);
      expect((await act("review", good, "approve", u.token)).statusCode).toBe(403);
    });

    it("publicaciones, comentarios, medios y reportes: cada uno con su regla", async () => {
      const u = await account(), reporter = await account();
      // Publicación reportada: retirar la oculta; aprobarla la restaura y limpia los reportes.
      const p = await post(u.id);
      expect((await act("post", p, "remove", moderator.token, "Contenido ofensivo")).statusCode).toBe(200);
      expect((await pool.query("SELECT is_active FROM social_posts WHERE id = $1", [p])).rows[0].is_active).toBe(false);
      expect((await inbox(u.token)).some((x) => x.title === "Retiramos tu publicación")).toBe(true);
      await act("post", p, "approve");
      expect((await pool.query("SELECT is_active, report_count FROM social_posts WHERE id = $1", [p])).rows[0]).toEqual({ is_active: true, report_count: 0 });
      // Comentario: sólo se retira, y el contador de la publicación baja.
      const c = (await pool.query("INSERT INTO social_comments (id, user_id, post_id, content) VALUES (gen_random_uuid(), $1, $2, 'Comentario grosero') RETURNING id", [u.id, p])).rows[0].id;
      await pool.query("UPDATE social_posts SET comments_count = 1 WHERE id = $1", [p]);
      const noApprove = await act("comment", c, "approve");
      expect(noApprove.statusCode).toBe(422);
      expect(json(noApprove).error.details.code).toBe("ACTION_NOT_APPLICABLE");
      expect((await act("comment", c, "remove", moderator.token, "Lenguaje ofensivo")).statusCode).toBe(200);
      expect((await pool.query("SELECT comments_count FROM social_posts WHERE id = $1", [p])).rows[0].comments_count).toBe(0);
      expect((await pool.query("SELECT 1 FROM social_comments WHERE id = $1", [c])).rowCount).toBe(0);
      // Imagen en revisión: aprobar la publica; rechazar la deja rechazada con el motivo.
      const m1 = (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'in_review') RETURNING id", [u.id])).rows[0].id;
      const m2 = (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'in_review') RETURNING id", [u.id])).rows[0].id;
      await act("media", m1, "approve");
      await act("media", m2, "reject", moderator.token, "No es del lugar");
      expect((await pool.query("SELECT status FROM media_assets WHERE id = ANY($1) ORDER BY status", [[m1, m2]])).rows.map((x) => x.status)).toEqual(["ready", "rejected"]);
      expect((await act("media", m1, "approve")).statusCode).toBe(422);                                       // ya no está en revisión
      // Medio de la comunidad.
      const um = (await pool.query("INSERT INTO ugc_media (user_id, media_url, media_type, associated_entity_type, associated_entity_id) VALUES ($1, 'https://x.test/b.jpg', 'photo', 'beach', $2) RETURNING id", [u.id, BEACH])).rows[0].id;
      await act("ugc_media", um, "reject", moderator.token, "Borrosa");
      expect((await pool.query("SELECT status FROM ugc_media WHERE id = $1", [um])).rows[0].status).toBe("rejected");
      // Reporte: se cierra y quien reportó recibe las gracias.
      const rp = (await pool.query("INSERT INTO ugc_reports (id, user_id, target_type, target_id, reason) VALUES (gen_random_uuid(), $1, 'post', $2, 'Spam') RETURNING id", [reporter.id, p])).rows[0].id;
      const reports = json(await call("GET", "/admin/moderation/reports", { token: moderator.token })).data;
      expect(reports.find((x: { id: string }) => x.id === rp)).toMatchObject({ target_type: "post", reason: "Spam", excerpt: `Publicación ${tag}`, status: "pendiente" });
      const closed = await call("PATCH", `/admin/moderation/reports/${rp}`, { token: moderator.token, payload: { status: "revisado", note: "Se retiró el contenido" } });
      expect(closed.statusCode).toBe(200);
      expect((await inbox(reporter.token)).some((x) => x.title === "Revisamos tu reporte")).toBe(true);
      expect((await call("PATCH", `/admin/moderation/reports/99999999-9999-4999-8999-999999999999`, { token: moderator.token, payload: { status: "ignorado" } })).statusCode).toBe(404);
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action LIKE 'moderation.%' AND created_at > now() - interval '1 minute'")).rows[0].n).toBeGreaterThanOrEqual(6);
    });

    it("prueba los filtros automáticos con un texto (sólo admin)", async () => {
      expect(json(await call("POST", "/admin/moderation/rules/test", { token: admin.token, payload: { text: "Escríbeme a ventas@promo.com" } })).data).toMatchObject({ would_publish: false, reasons: expect.arrayContaining(["contains_contact"]) });
      expect(json(await call("POST", "/admin/moderation/rules/test", { token: admin.token, payload: { text: "Qué lugar tan bonito" } })).data).toMatchObject({ would_publish: true, reasons: [] });
      expect((await call("POST", "/admin/moderation/rules/test", { token: moderator.token, payload: { text: "x" } })).statusCode).toBe(403);
    });
  });

  describe("XP y monedas", () => {
    it("otorga, descuenta sin bajar de cero, recalcula el nivel y deja la bitácora; sólo admin", async () => {
      const u = await account();
      const award = (payload: object, token = admin.token) => call("POST", `/admin/users/${u.id}/award-xp`, { token, payload });
      expect((await award({ xp: 50, reason: "Premio manual" }, moderator.token)).statusCode).toBe(403);
      expect((await award({ xp: 50, reason: "x" })).statusCode).toBe(400);                        // motivo corto
      expect((await award({ xp: 0, coins: 0, reason: "Nada que ajustar" })).statusCode).toBe(400);
      expect((await award({ xp: -10, reason: "Debe usar ajuste" })).statusCode).toBe(400);
      expect((await call("POST", "/admin/users/99999999-9999-4999-8999-999999999999/award-xp", { token: admin.token, payload: { xp: 5, reason: "Sin usuario" } })).statusCode).toBe(404);
      const up = json(await award({ xp: 350, coins: 40, reason: "Concurso de fotos" })).data;
      expect(up.total_xp).toBeGreaterThanOrEqual(350);                                          // (un logro que se desbloquee puede sumar un poco más)
      expect(up.level).toBeGreaterThanOrEqual(3);
      const adj = (payload: object) => call("POST", `/admin/gamification/users/${u.id}/adjust`, { token: admin.token, payload });
      const down = json(await adj({ xp: -(up.total_xp - 50), coins: -10, reason: "Corrección por abuso" })).data;
      expect(down).toMatchObject({ total_xp: 50, coins: up.coins - 10, level: 1 });               // baja de nivel
      const floor = json(await adj({ xp: -9999, coins: -9999, reason: "Reinicio de la cuenta" })).data;
      expect(floor).toMatchObject({ total_xp: 0, coins: 0, level: 1 });                          // nunca por debajo de cero
      const me = json(await call("GET", "/gamification/me", { token: u.token })).data;
      expect(me).toMatchObject({ xp: 0, coins: 0 });
      const tx = (await pool.query("SELECT xp_amount, coin_amount, description FROM gamification_transactions WHERE user_id = $1 AND source_type = 'admin' ORDER BY created_at", [u.id])).rows;
      expect(tx.map((t) => [t.xp_amount, t.coin_amount])).toEqual([[-(up.total_xp - 50), -10], [-50, -(up.coins - 10)]]);
      expect(tx[0].description).toBe("Ajuste: Corrección por abuso");
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity_id = $1 AND action LIKE 'gamification.%'", [u.id])).rows[0].n).toBe(3);
    });
  });
});
