import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0, k = 0;
const uniq = () => `claim${Date.now().toString(36)}${n++}@test.local`;
const hash = (t: string) => createHash("sha256").update(t).digest("hex");
/** Token opaco de prueba (≥ 20 caracteres, como los reales). */
const opaque = () => `claim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-token`;
const BASE = addDays(todayInSantoDomingo(), 60);
const day = (i: number) => addDays(BASE, i);

describe("reclamo de una reserva de invitado", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let owner: { token: string; id: string };
  let orgId: string, tour: string;
  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async () => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Viajero Reclamo" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  /** Crea una reserva (de invitado salvo que se pase sesión) y devuelve su id, referencia y token de invitado. */
  const book = async (request: Record<string, unknown>, o: { token?: string; email?: string } = {}) => {
    const res = await app.inject({
      method: "POST", url: "/api/v1/bookings", headers: { "idempotency-key": `claim-key-${Date.now()}-${k++}`, ...(o.token ? { authorization: `Bearer ${o.token}` } : {}) },
      payload: { request: { listing_id: tour, adults: 1, ...request }, contact: { name: "Luis Invitado", email: o.email ?? uniq() }, payment_mode: "pay_later" },
    });
    expect(res.statusCode, res.body).toBe(201);
    const d = json(res).data;
    return { id: d.booking.id as string, reference: d.booking.reference as string, access: d.access_token as string };
  };
  const start = (id: string, email: string, access?: string) =>
    call("POST", `/bookings/${id}/claim/start${access ? `?token=${encodeURIComponent(access)}` : ""}`, { payload: { email } });
  const preview = (token: string) => call("GET", `/bookings/claim/${encodeURIComponent(token)}`);
  const claim = (token: string, session: string) => call("POST", "/bookings/claim", { token: session, payload: { token } });
  const mailCount = async (email: string) => (await pool.query("SELECT count(*)::int AS n FROM email_log WHERE to_email = $1 AND template = 'booking.claim'", [email.toLowerCase()])).rows[0].n as number;
  const tokenRows = async (id: string) => (await pool.query("SELECT email, used_at, expires_at, claimed_by FROM booking_claim_tokens WHERE booking_id = $1 ORDER BY created_at", [id])).rows;
  /** El token en claro sólo viaja en el enlace del correo: se recupera del payload encolado. */
  const tokenFromMail = async (email: string) => {
    const row = (await pool.query("SELECT payload FROM email_log WHERE to_email = $1 AND template = 'booking.claim' ORDER BY created_at DESC LIMIT 1", [email.toLowerCase()])).rows[0];
    expect(row, "el correo con el enlace quedó encolado").toBeTruthy();
    const url = (row.payload as { data: { url: string } }).data.url;
    return { token: new URL(url).searchParams.get("token")!, url };
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    owner = await signup();
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Reclamos SRL ${Date.now().toString(36)}` } })).data.id;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    tour = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour de reclamos", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 10, time_slots: ["09:00"], cancellation_policy: "flexible", images: ["a.jpg"] } })).data.id;
    await call("PUT", `/org/listings/${tour}/status`, { token: owner.token, payload: { status: "published" } });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("emite el enlace sólo si el correo coincide; si no, responde 202 sin encolar ni guardar token", async () => {
    const guest = uniq();
    const b = await book({ date: day(0), time: "09:00" }, { email: guest });
    const other = uniq();

    // Correo distinto: misma respuesta (202) y ninguna huella.
    const wrong = await start(b.id, other, b.access);
    expect(wrong.statusCode, wrong.body).toBe(202);
    expect(json(wrong).data).toMatchObject({ sent: true });
    expect(typeof json(wrong).data.expires_at).toBe("string");
    expect(await mailCount(other)).toBe(0);
    expect(await tokenRows(b.id)).toHaveLength(0);

    // Quien no tiene el token de invitado ni es el titular no obtiene nada (404).
    expect((await start(b.id, guest)).statusCode).toBe(404);

    // Correo correcto: encola el enlace y guarda sólo el hash.
    const res = await start(b.id, guest, b.access);
    expect(res.statusCode, res.body).toBe(202);
    expect(await mailCount(guest)).toBe(1);
    const rows = await tokenRows(b.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: guest, used_at: null, claimed_by: null });
    expect(rows[0].expires_at.getTime()).toBeGreaterThan(Date.now());
    const { token, url } = await tokenFromMail(guest);
    expect(url).toContain("/reservas/reclamar?token=");
    const stored = (await pool.query("SELECT token_hash FROM booking_claim_tokens WHERE booking_id = $1", [b.id])).rows[0].token_hash as string;
    expect(stored).toBe(hash(token));           // en claro nunca se guarda
    expect(stored).not.toBe(token);
  });

  it("la vista previa no expone datos personales (correo enmascarado)", async () => {
    const guest = uniq();
    const b = await book({ date: day(2), time: "09:00" }, { email: guest });
    await start(b.id, guest, b.access);
    const { token } = await tokenFromMail(guest);

    const res = await preview(token);
    expect(res.statusCode, res.body).toBe(200);
    const d = json(res).data as Record<string, unknown>;
    expect(d).toMatchObject({ organizer: expect.any(String), service: "Tour de reclamos", status: "pending", dates: `${day(2)} 09:00` });
    expect(String(d.email)).toMatch(/^.\*\*\*@test\.local$/);
    expect(JSON.stringify(d)).not.toContain(guest);
    expect(JSON.stringify(d)).not.toContain(guest.split("@")[0]);

    expect((await preview("claim-token-inexistente-000000000000")).statusCode).toBe(404);
  });

  it("el token es de un solo uso: vincula la reserva, aparece en /me/bookings y queda auditado", async () => {
    const u = await signup();
    const guest = uniq();
    const b = await book({ date: day(4), time: "09:00" }, { email: guest });
    await start(b.id, guest, b.access);
    const { token } = await tokenFromMail(guest);

    expect((await call("POST", "/bookings/claim", { payload: { token } })).statusCode).toBe(401);   // exige sesión

    const res = await claim(token, u.token);
    expect(res.statusCode, res.body).toBe(200);
    expect(json(res).data).toMatchObject({ id: b.id, contact: { email: guest } });

    // Segundo intento: el token ya se usó.
    const again = await claim(token, u.token);
    expect(again.statusCode).toBe(400);
    expect(json(again).error.code).toBe("INVALID_TOKEN");
    expect((await preview(token)).statusCode).toBe(404);

    const row = (await pool.query("SELECT user_id, claimed_at FROM bookings WHERE id = $1", [b.id])).rows[0];
    expect(row.user_id).toBe(u.id);
    expect(row.claimed_at).not.toBeNull();
    expect((await tokenRows(b.id))[0]).toMatchObject({ claimed_by: u.id });

    const mine = json(await call("GET", "/me/bookings", { token: u.token })).data as { id: string }[];
    expect(mine.some((x) => x.id === b.id)).toBe(true);

    const auditRow = (await pool.query("SELECT actor_id, meta FROM audit_log WHERE action = 'booking.claim' AND entity_id = $1", [b.id])).rows[0];
    expect(auditRow).toBeTruthy();
    expect(auditRow.actor_id).toBe(u.id);
    expect(auditRow.meta).toMatchObject({ reference: b.reference });
    expect(JSON.stringify(auditRow.meta)).not.toContain(guest);   // el correo va enmascarado
  });

  it("un token vencido se rechaza (vista previa 404 y canje 400)", async () => {
    const u = await signup();
    const guest = uniq();
    const b = await book({ date: day(6), time: "09:00" }, { email: guest });
    await start(b.id, guest, b.access);
    const { token } = await tokenFromMail(guest);
    // Se envejece el token respetando la restricción de la tabla (`expires_at > created_at`): se mueven
    // ambas marcas al pasado, como quedaría un enlace emitido hace dos horas y caducado hace una.
    await pool.query("UPDATE booking_claim_tokens SET created_at = now() - interval '2 hours', expires_at = now() - interval '1 minute' WHERE token_hash = $1", [hash(token)]);

    expect((await preview(token)).statusCode).toBe(404);
    const res = await claim(token, u.token);
    expect(res.statusCode).toBe(400);
    expect(json(res).error.code).toBe("INVALID_TOKEN");
    expect((await pool.query("SELECT user_id FROM bookings WHERE id = $1", [b.id])).rows[0].user_id).toBeNull();
  });

  it("no se puede reclamar una reserva que ya pertenece a otra cuenta", async () => {
    const u1 = await signup(), u2 = await signup();
    const b = await book({ date: day(8), time: "09:00" }, { token: u1.token, email: u1.email });
    expect((await pool.query("SELECT user_id FROM bookings WHERE id = $1", [b.id])).rows[0].user_id).toBe(u1.id);

    // Enlace emitido antes de que la reserva tuviera dueño: sigue vivo, pero ya no puede vincularla a otra cuenta.
    const token = opaque();
    await pool.query("INSERT INTO booking_claim_tokens (booking_id, email, token_hash, expires_at) VALUES ($1, $2, $3, now() + interval '1 hour')", [b.id, u1.email, hash(token)]);
    const res = await claim(token, u2.token);
    expect(res.statusCode).toBe(409);
    expect(json(res).error.details.reason).toBe("ALREADY_CLAIMED");
    expect((await pool.query("SELECT user_id FROM bookings WHERE id = $1", [b.id])).rows[0].user_id).toBe(u1.id);

    // Y tampoco se emite un enlace nuevo para una cuenta ajena.
    const before = await mailCount(u1.email);
    const startRes = await start(b.id, u1.email, b.access);
    expect(startRes.statusCode).toBe(202);
    expect(await mailCount(u1.email)).toBe(before);
    expect(await tokenRows(b.id)).toHaveLength(1);
  });
});
