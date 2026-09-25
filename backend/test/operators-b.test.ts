import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, startsAt, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { assertPublicUrl, isPrivateIp, parseIcs } from "../src/modules/operators/ical.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `opb${Date.now().toString(36)}${n++}@test.local`;
const day = (k: number) => addDays(todayInSantoDomingo(), 60 + k);

describe("iCal: utilidades", () => {
  it("lee eventos con fin exclusivo, plegado de líneas y cancelados", () => {
    const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20300110", "DTEND;VALUE=DATE:20300113", "SUMMARY:Airbnb (Not", "  available)", "END:VEVENT",
      "BEGIN:VEVENT", "DTSTART:20300120T150000Z", "DTEND:20300121T110000Z", "END:VEVENT", "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20300201", "STATUS:CANCELLED", "END:VEVENT", "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20301301", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    expect(parseIcs(ics)).toEqual([{ from: "2030-01-10", to: "2030-01-12", reason: "Airbnb (Not available)" }, { from: "2030-01-20", to: "2030-01-20", reason: "Calendario externo" }]);
  });
  it("bloquea direcciones privadas y esquemas no https (SSRF)", async () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.5", "172.20.0.1", "169.254.169.254", "::1", "fd00::1", "::ffff:10.0.0.1"]) expect(isPrivateIp(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "172.32.0.1", "2606:4700::1111"]) expect(isPrivateIp(ip), ip).toBe(false);
    for (const url of ["http://example.com/a.ics", "https://127.0.0.1/a.ics", "https://localhost/a.ics", "https://[::1]/a.ics", "https://user:pw@8.8.8.8/a.ics", "https://169.254.169.254/latest", "file:///etc/passwd", "nope"]) {
      await expect(assertPublicUrl(url), url).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    }
    await expect(assertPublicUrl("https://8.8.8.8/a.ics")).resolves.toBeUndefined();
  });
});

describe("Operadores RD fase B", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string; email: string };
  let orgId: string;
  let tour: string, stay: string, room: string;
  let key = 0;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const book = (over: Record<string, unknown> = {}, listing = tour) =>
    call("POST", "/bookings", { headers: { "idempotency-key": `b-key-${Date.now()}-${key++}` }, payload: { request: { listing_id: listing, date: day(0), time: "09:00", adults: 2, ...over }, contact: { name: "Rosa Viajera", email: "rosa@test.local" }, payment_mode: "pay_later" } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: "Equipo Fase B" } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    const mk = async (payload: object) => json(await call("POST", "/org/listings", { token: owner.token, payload })).data.id as string;
    tour = await mk({ category: "experiencia", title: "Tour B", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 20, time_slots: ["09:00", "00:30"], images: ["a.jpg"] });
    stay = await mk({ category: "alojamiento", title: "Hotel B", summary: "s", description: "d", destination: "Samaná", images: ["a.jpg"] });
    room = json(await call("POST", `/org/listings/${stay}/rooms`, { token: owner.token, payload: { name: "Suite", price: 80, guests: 2, quantity: 1 } })).data.id;
    for (const l of [tour, stay]) await call("PUT", `/org/listings/${l}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("equipo: invitación, aceptación con el correo correcto y alcance por servicio del guía", async () => {
    const guide = await signup();
    const inv = await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: guide.email.toUpperCase(), role: "guia", listing_ids: [tour] } });
    expect(inv.statusCode).toBe(201);
    const token = json(inv).data.token as string;
    expect((await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: guide.email, role: "guia", listing_ids: [tour] } })).statusCode).toBe(409);
    expect((await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: uniq(), role: "guia" } })).statusCode).toBe(400); // guía sin servicios
    expect(json(await call("GET", `/team-invitations/${token}`)).data).toMatchObject({ role: "guia", business_name: "Equipo Fase B" });
    await app.mailer.drain();
    expect(app.mailer.last(guide.email, "org.invitation")).toBeTruthy();

    const stranger = await signup();
    const wrong = await call("POST", `/team-invitations/${token}/accept`, { token: stranger.token });
    expect(wrong.statusCode).toBe(403);
    expect(json(wrong).error.details.reason).toBe("EMAIL_MISMATCH");
    expect((await call("POST", `/team-invitations/${token}/accept`, { token: guide.token })).statusCode).toBe(200);
    expect((await call("POST", `/team-invitations/${token}/accept`, { token: guide.token })).statusCode).toBe(404); // ya usada

    await book({ date: day(1) });
    const stayB = await call("POST", "/org/bookings", { token: owner.token, payload: { request: { listing_id: stay, room_id: room, date: day(1), check_out: day(2), adults: 1 }, contact: { name: "Otro", email: "o@test.local" } } });
    expect(stayB.statusCode).toBe(201);
    const seen = json(await call("GET", "/org/bookings?per_page=100", { token: guide.token })).data as { listing: { id: string } }[];
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((b) => b.listing.id === tour)).toBe(true);
    expect((await call("GET", `/org/bookings/${json(stayB).data.id}`, { token: guide.token })).statusCode).toBe(404);
    expect((await call("GET", "/org/income", { token: guide.token })).statusCode).toBe(403);
    expect((await call("POST", "/org/team/invitations", { token: guide.token, payload: { email: uniq(), role: "guia", listing_ids: [tour] } })).statusCode).toBe(403);

    const admin = await signup();
    const invA = json(await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: admin.email, role: "admin" } })).data.token;
    await call("POST", `/team-invitations/${invA}/accept`, { token: admin.token });
    const denied = await call("POST", "/org/team/invitations", { token: admin.token, payload: { email: uniq(), role: "admin" } });
    expect(denied.statusCode).toBe(403); // un admin no crea admins
    expect((await call("PATCH", `/org/team/members/${guide.id}`, { token: admin.token, payload: { role: "admin" } })).statusCode).toBe(403);
    const team = json(await call("GET", "/org/team", { token: owner.token })).data;
    expect(team.members.map((m: { role: string }) => m.role).sort()).toEqual(["admin", "guia", "owner"]);
    expect((await call("DELETE", `/org/team/members/${owner.id}`, { token: admin.token })).statusCode).toBe(403);
    expect((await call("DELETE", `/org/team/members/${guide.id}`, { token: admin.token })).statusCode).toBe(204);
    expect((await call("GET", "/org/bookings", { token: guide.token })).statusCode).toBe(403);
  });

  it("mensajes: la reserva abre una conversación y el operador responde", async () => {
    const b = json(await book({ date: day(3) })).data;
    const threads = json(await call("GET", "/org/messages?unread=true", { token: owner.token })).data as { thread_id: string; unread: number }[];
    const t = threads.find((x) => x.thread_id === `web-${b.booking.id}`)!;
    expect(t.unread).toBe(1);
    expect((await call("POST", `/bookings/${b.booking.id}/messages?token=${b.access_token}`, { payload: { body: "¿Hay parqueo?" } })).statusCode).toBe(201);
    expect((await call("POST", `/bookings/${b.booking.id}/messages`, { payload: { body: "hola" } })).statusCode).toBe(404);
    expect((await call("POST", `/org/messages/${t.thread_id}`, { token: owner.token, payload: { body: "Sí, gratis." } })).statusCode).toBe(201);
    const msgs = json(await call("GET", `/org/messages/${t.thread_id}`, { token: owner.token })).data as { sender: string }[];
    expect(msgs.map((m) => m.sender)).toEqual(["traveler", "traveler", "operator"]);
    const after = json(await call("GET", "/org/messages?unread=true", { token: owner.token })).data as { thread_id: string }[];
    expect(after.find((x) => x.thread_id === t.thread_id)).toBeUndefined();
  });

  it("reseñas verificadas: sólo tras completar, una por reserva, con calificación y respuesta", async () => {
    const b = json(await book({ date: day(4) })).data;
    const rv = (payload: object) => call("POST", `/bookings/${b.booking.id}/review?token=${b.access_token}`, { payload });
    expect((await rv({ rating: 5 })).statusCode).toBe(422);
    await call("PUT", `/org/bookings/${b.booking.id}/status`, { token: owner.token, payload: { status: "confirmed" } });
    await call("PUT", `/org/bookings/${b.booking.id}/status`, { token: owner.token, payload: { status: "completed" } });
    expect((await rv({ rating: 9 })).statusCode).toBe(400);
    expect((await rv({ rating: 4, comment: "Muy bien" })).statusCode).toBe(201);
    expect((await rv({ rating: 5 })).statusCode).toBe(409);
    const pub = json(await call("GET", `/listings/${tour}/reviews`));
    expect(pub.data[0]).toMatchObject({ author: "Rosa", rating: 4, comment: "Muy bien" });
    expect(Number((await pool.query("SELECT rating FROM operator_listings WHERE id = $1", [tour])).rows[0].rating)).toBe(4);
    const mine = json(await call("GET", "/org/reviews?unanswered=true", { token: owner.token })).data as { id: string }[];
    expect((await call("PUT", `/org/reviews/${mine[0]!.id}/reply`, { token: owner.token, payload: { reply: "¡Gracias!" } })).statusCode).toBe(204);
    expect(json(await call("GET", `/listings/${tour}/reviews`)).data[0].reply).toBe("¡Gracias!");
  });

  it("iCal: exporta reservas, importa bloqueos externos y conserva lo importado si falla", async () => {
    const b = await call("POST", "/org/bookings", { token: owner.token, payload: { request: { listing_id: stay, room_id: room, date: day(10), check_out: day(12), adults: 1 }, contact: { name: "Cal", email: "cal@test.local" } } });
    expect(b.statusCode).toBe(201);
    const info = json(await call("GET", `/org/rooms/${room}/calendar`, { token: owner.token })).data;
    const feed = await app.inject({ url: info.export_path });
    expect(feed.statusCode).toBe(200);
    expect(feed.headers["content-type"]).toContain("text/calendar");
    expect(feed.body).toContain(`DTSTART;VALUE=DATE:${day(10).replace(/-/g, "")}`);
    expect(feed.body).not.toContain("Cal");
    expect((await app.inject({ url: `/api/v1/ical/${"a".repeat(36)}.ics` })).statusCode).toBe(404);

    const ext = (from: string, to: string) => ["BEGIN:VCALENDAR", "BEGIN:VEVENT", `DTSTART;VALUE=DATE:${from.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${to.replace(/-/g, "")}`, "SUMMARY:Reserved", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    app.ical.fetcher = async () => ext(day(20), day(23));
    const added = await call("POST", `/org/rooms/${room}/calendar-links`, { token: owner.token, payload: { name: "Airbnb", url: "https://example.com/a.ics" } });
    expect(added.statusCode).toBe(201);
    expect(json(added).data).toMatchObject({ imported: 1, error: null });
    const q = json(await call("POST", "/bookings/quote", { payload: { listing_id: stay, room_id: room, date: day(21), check_out: day(22), adults: 1 } })).data;
    expect(q.issues.map((i: { code: string }) => i.code)).toContain("DATE_BLOCKED");
    const open = json(await call("POST", "/bookings/quote", { payload: { listing_id: stay, room_id: room, date: day(23), check_out: day(24), adults: 1 } })).data;
    expect(open.issues.map((i: { code: string }) => i.code)).not.toContain("DATE_BLOCKED");
    // Las importadas no se reexportan (evita bucles entre plataformas).
    expect((await app.inject({ url: info.export_path })).body).not.toContain(day(20).replace(/-/g, ""));

    const linkId = json(added).data.id;
    app.ical.fetcher = async () => { throw new Error("caído"); };
    const failed = json(await call("POST", `/org/calendar-links/${linkId}/sync`, { token: owner.token })).data;
    expect(failed.error).toBe("caído");
    expect((await pool.query("SELECT 1 FROM room_blocks WHERE link_id = $1", [linkId])).rowCount).toBe(1);
    expect((await call("DELETE", `/org/calendar-links/${linkId}`, { token: owner.token })).statusCode).toBe(204);
    expect((await pool.query("SELECT 1 FROM room_blocks WHERE link_id = $1", [linkId])).rowCount).toBe(0);
    app.ical.fetcher = undefined;
    const bad = await call("POST", `/org/rooms/${room}/calendar-links`, { token: owner.token, payload: { name: "x", url: "https://127.0.0.1/a.ics" } });
    expect(bad.statusCode).toBe(400);
  });

  it("automatizaciones: un recordatorio y una solicitud de reseña por reserva, sin duplicar", async () => {
    const tomorrow = addDays(todayInSantoDomingo(), 1);
    const b = json(await book({ date: tomorrow, time: "00:30" })).data;
    await call("PUT", `/org/bookings/${b.booking.id}/status`, { token: owner.token, payload: { status: "confirmed" } });
    const now = new Date(startsAt(tomorrow, "00:30").getTime() - 3 * 3_600_000);
    const first = await app.automations.run(now);
    expect(first.skipped).toBe(false);
    expect(first.reminders).toBeGreaterThanOrEqual(1);
    await app.mailer.drain();
    expect(app.mailer.outbox.filter((m) => m.to === "rosa@test.local" && m.subject.includes("Recordatorio")).length).toBeGreaterThanOrEqual(1);
    const sentBefore = app.mailer.outbox.length;
    const second = await app.automations.run(now);
    expect(second.reminders).toBe(0);
    await app.mailer.drain();
    expect(app.mailer.outbox.length).toBe(sentBefore);

    await call("PUT", `/org/bookings/${b.booking.id}/status`, { token: owner.token, payload: { status: "completed" } });
    expect((await app.automations.run()).review_requests).toBeGreaterThanOrEqual(1);
    await app.mailer.drain();
    const mail = app.mailer.outbox.filter((m) => m.to === "rosa@test.local" && m.text.includes("resena?token=")).at(-1)!;
    const tk = mail.text.match(/token=([\w-]+)/)![1]!;
    expect((await call("POST", `/bookings/${b.booking.id}/review?token=${tk}`, { payload: { rating: 5 } })).statusCode).toBe(201);
    expect((await call("GET", `/bookings/${b.booking.id}?token=${b.access_token}`)).statusCode).toBe(404); // el token anterior se reemplazó
  });

  it("reportes: totales, servicios y canales del rango", async () => {
    const rep = json(await call("GET", `/org/reports/summary?from=${todayInSantoDomingo()}&to=${day(30)}`, { token: owner.token })).data;
    expect(rep.totals.bookings).toBeGreaterThan(3);
    expect(rep.totals.booked_value).toBeGreaterThan(0);
    expect(rep.by_listing.find((l: { listing_id: string }) => l.listing_id === tour)).toBeTruthy();
    expect(rep.by_source.map((s: { source: string }) => s.source)).toContain("manual");
    expect((await call("GET", `/org/reports/summary?from=${day(30)}&to=${todayInSantoDomingo()}`, { token: owner.token })).statusCode).toBe(400);
  });

  it("admin: restablece el 2FA de otra cuenta, cierra sus sesiones y deja auditoría", async () => {
    const admin = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [admin.id]);
    const adminToken = await login(admin.email);
    const victim = await signup();
    await pool.query("UPDATE users SET totp_enabled_at = now(), totp_secret_enc = 'x', totp_recovery_hashes = ARRAY['h'] WHERE id = $1", [victim.id]);
    const reset = (id: string, tok: string, reason = "Perdió su teléfono") => call("POST", `/admin/users/${id}/2fa/reset`, { token: tok, payload: { reason } });
    expect((await reset(victim.id, victim.token)).statusCode).toBe(403);
    expect((await reset(admin.id, adminToken)).statusCode).toBe(403);
    expect((await reset(victim.id, adminToken, "x")).statusCode).toBe(400);
    expect((await reset(victim.id, adminToken)).statusCode).toBe(204);
    const row = (await pool.query("SELECT totp_enabled_at FROM users WHERE id = $1", [victim.id])).rows[0];
    expect(row.totp_enabled_at).toBeNull();
    expect((await pool.query("SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL", [victim.id])).rowCount).toBe(0);
    expect((await reset(victim.id, adminToken)).statusCode).toBe(422); // ya no tiene 2FA
    await app.mailer.drain();
    expect(app.mailer.last(victim.email, "auth.two_factor_reset")).toBeTruthy();
    const log = json(await call("GET", `/admin/audit?action=user.2fa_reset&entity_id=${victim.id}`, { token: adminToken })).data;
    expect(log[0]).toMatchObject({ actor_id: admin.id, meta: { reason: "Perdió su teléfono" } });
    expect((await call("GET", "/admin/audit", { token: victim.token })).statusCode).toBe(401); // sus sesiones se cerraron con el reset
  });
});
