import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `tr${Date.now().toString(36)}${n++}@test.local`;
const HOTEL = "a1000000-0000-4000-8000-000000000001";   // Hotel Caribe (fixture)
const BEACH = "b1000000-0000-4000-8000-000000000001";   // Playa Bávaro (fixture)
const HIDDEN = "b1000000-0000-4000-8000-000000000004";  // inactiva
const today = todayInSantoDomingo();

describe("mi viaje", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Viajero Prueba" } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string, email };
  };
  const mkTrip = async (u: { token: string }, over: object = {}) => json(await call("POST", "/me/trips", { token: u.token, payload: { title: `Viaje ${tag}`, start_date: addDays(today, 10), end_date: addDays(today, 13), party_size: 2, budget: 1000, currency: "USD", ...over } })).data as { id: string };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("viajes y actividades", () => {
    it("crea, lista, edita y borra; valida fechas y sólo el dueño lo ve", async () => {
      const u = await account(), other = await account();
      expect((await call("POST", "/me/trips", { payload: { title: "Sin sesión" } })).statusCode).toBe(401);
      expect((await call("POST", "/me/trips", { token: u.token, payload: { title: "Mal", start_date: "2026-05-10", end_date: "2026-05-01" } })).statusCode).toBe(400);
      const t = await mkTrip(u);
      expect(json(await call("GET", "/me/trips", { token: u.token })).data[0]).toMatchObject({ id: t.id, role: "owner", items: 0, budget: 1000, currency: "USD" });
      expect(json(await call("GET", "/me/trips", { token: other.token })).data).toHaveLength(0);
      expect((await call("GET", `/me/trips/${t.id}`, { token: other.token })).statusCode).toBe(404);
      expect((await call("PATCH", `/me/trips/${t.id}`, { token: other.token, payload: { title: "Robado" } })).statusCode).toBe(404);
      const upd = json(await call("PATCH", `/me/trips/${t.id}`, { token: u.token, payload: { title: "Mi gran viaje", party_size: 4 } })).data;
      expect(upd).toMatchObject({ title: "Mi gran viaje", party_size: 4 });
      expect((await call("PATCH", `/me/trips/${t.id}`, { token: u.token, payload: { end_date: addDays(today, 1) } })).statusCode).toBe(400);
      expect((await call("DELETE", `/me/trips/${t.id}`, { token: other.token })).statusCode).toBe(404);
      expect((await call("DELETE", `/me/trips/${t.id}`, { token: u.token })).statusCode).toBe(204);
      expect((await call("GET", `/me/trips/${t.id}`, { token: u.token })).statusCode).toBe(404);
    });

    it("agrega lugares del catálogo (con instantánea) o texto libre, agrupa por día, mueve y reordena", async () => {
      const u = await account();
      const t = await mkTrip(u);
      const add = (payload: object) => call("POST", `/me/trips/${t.id}/items`, { token: u.token, payload });
      const hotel = json(await add({ day: 1, entity_type: "hotel", entity_id: HOTEL, time: "15:00", cost: 300 })).data;
      expect(hotel).toMatchObject({ day: 1, position: 0, entity_type: "hotel", title: "Hotel Caribe", cost: 300, time: "15:00" });
      expect(hotel.lat).toBeTruthy();
      const beach = json(await add({ day: 1, entity_type: "beach", entity_id: BEACH, cost: 0 })).data;
      expect(beach.position).toBe(1);
      const free = json(await add({ day: 2, title: "Cena con amigos", notes: "Reservar", cost: 80 })).data;
      expect((await add({ day: 1 })).statusCode).toBe(400);                                              // sin lugar ni título
      expect((await add({ day: 1, entity_type: "hotel" })).statusCode).toBe(400);                        // tipo sin id
      expect((await add({ day: 1, entity_type: "planeta", entity_id: HOTEL })).statusCode).toBe(400);
      expect((await add({ day: 1, entity_type: "beach", entity_id: HIDDEN })).statusCode).toBe(404);     // no publicado
      expect((await add({ day: 9, title: "Fuera del viaje" })).statusCode).toBe(400);                    // el viaje dura 4 días
      expect((await add({ day: 1, title: "x", time: "25:99" })).statusCode).toBe(400);

      let d = json(await call("GET", `/me/trips/${t.id}`, { token: u.token })).data;
      expect(d.days.map((x: { day: number; items: unknown[] }) => [x.day, x.items.length])).toEqual([[1, 2], [2, 1]]);
      expect(d.days[0].date).toBe(addDays(today, 10));
      const moved = await call("PATCH", `/me/trips/${t.id}/items/${free.id}`, { token: u.token, payload: { day: 3, cost: 90 } });
      expect(json(moved).data).toMatchObject({ day: 3, cost: 90 });
      const re = await call("POST", `/me/trips/${t.id}/reorder`, { token: u.token, payload: { items: [{ id: beach.id, day: 1, position: 0 }, { id: hotel.id, day: 1, position: 1 }] } });
      expect(json(re).data.days[0].items.map((i: { id: string }) => i.id)).toEqual([beach.id, hotel.id]);
      expect((await call("POST", `/me/trips/${t.id}/reorder`, { token: u.token, payload: { items: [{ id: "99999999-9999-4999-8999-999999999999", day: 1, position: 0 }] } })).statusCode).toBe(400);
      expect((await call("DELETE", `/me/trips/${t.id}/items/${free.id}`, { token: u.token })).statusCode).toBe(204);
      d = json(await call("GET", `/me/trips/${t.id}`, { token: u.token })).data;
      expect(d.days).toHaveLength(1);
    });

    it("el resumen suma costos, compara con el presupuesto y arma el mapa y las reservas del periodo", async () => {
      const u = await account();
      const t = await mkTrip(u, { budget: 350, party_size: 2 });
      await call("POST", `/me/trips/${t.id}/items`, { token: u.token, payload: { day: 1, entity_type: "hotel", entity_id: HOTEL, cost: 300 } });
      await call("POST", `/me/trips/${t.id}/items`, { token: u.token, payload: { day: 2, title: "Excursión", cost: 100 } });
      const s = json(await call("GET", `/me/trips/${t.id}/summary`, { token: u.token })).data;
      expect(s).toMatchObject({ estimated_cost: 400, per_person: 200, budget: 350, remaining: -50, over_budget: true, currency: "USD" });
      expect(s.per_day).toEqual([{ day: 1, cost: 300 }, { day: 2, cost: 100 }]);
      expect(s.map.features).toHaveLength(1);                     // sólo el lugar con coordenadas
      expect(s.map.features[0].geometry.coordinates).toHaveLength(2);
    });

    it("copia un itinerario: los lugares reales se enlazan y lo demás queda como texto libre", async () => {
      const u = await account();
      const t = await mkTrip(u);
      const res = await call("POST", `/me/trips/${t.id}/from-itinerary`, { token: u.token, payload: { days: [
        { title: "Llegada", items: [{ type: "hotel", ref: HOTEL, time: "14:00" }, { type: "restaurant", ref: "99999999-9999-4999-8999-999999999999", title: "Cena típica" }] },
        { items: [{ title: "Día libre", cost: 20 }] },
      ] } });
      expect(res.statusCode).toBe(201);
      expect(json(res).data).toMatchObject({ added: 3, linked: 1, free_text: 2 });
      const d = json(res).data.trip;
      expect(d.days.map((x: { items: unknown[] }) => x.items.length)).toEqual([2, 1]);
      expect((await call("POST", `/me/trips/${t.id}/from-itinerary`, { token: u.token, payload: { days: Array.from({ length: 6 }, () => ({ items: [{ title: "x" }] })) } })).statusCode).toBe(400); // más días de los del viaje
    });
  });

  describe("compartir y planificar en grupo", () => {
    it("el enlace público no muestra costos ni datos privados y se puede revocar", async () => {
      const u = await account();
      const t = await mkTrip(u);
      await call("POST", `/me/trips/${t.id}/items`, { token: u.token, payload: { day: 1, title: "Playa privada", notes: "clave secreta", cost: 500 } });
      await call("POST", `/me/trips/${t.id}/diary`, { token: u.token, payload: { entry_date: addDays(today, 10), title: "Público", body: "Qué lindo", is_public: true } });
      await call("POST", `/me/trips/${t.id}/diary`, { token: u.token, payload: { entry_date: addDays(today, 10), title: "Privado", body: "Sólo mío" } });
      const { token } = json(await call("POST", `/me/trips/${t.id}/share`, { token: u.token })).data;
      const shared = json(await call("GET", `/trips/shared/${token}`)).data;
      expect(shared).toMatchObject({ title: `Viaje ${tag}`, author: "Viajero Prueba" });
      expect(shared.days[0].items[0]).toMatchObject({ title: "Playa privada" });
      expect(JSON.stringify(shared)).not.toMatch(/clave secreta|500|budget|Sólo mío/);
      expect(shared.diary).toHaveLength(1);
      expect((await pool.query("SELECT share_hash FROM trips WHERE id = $1", [t.id])).rows[0].share_hash).not.toBe(token);
      expect((await call("GET", `/trips/shared/${token}x`)).statusCode).toBe(404);
      const again = json(await call("POST", `/me/trips/${t.id}/share`, { token: u.token })).data.token;
      expect((await call("GET", `/trips/shared/${token}`)).statusCode).toBe(404);   // el enlace anterior dejó de servir
      expect((await call("GET", `/trips/shared/${again}`)).statusCode).toBe(200);
      expect((await call("DELETE", `/me/trips/${t.id}/share`, { token: u.token })).statusCode).toBe(204);
      expect((await call("GET", `/trips/shared/${again}`)).statusCode).toBe(404);
    });

    it("invitación por enlace con rol, votos del grupo y permisos de sólo lectura", async () => {
      const owner = await account(), editor = await account(), viewer = await account(), stranger = await account();
      const t = await mkTrip(owner);
      const item = json(await call("POST", `/me/trips/${t.id}/items`, { token: owner.token, payload: { day: 1, title: "Buceo" } })).data;
      expect((await call("POST", `/me/trips/${t.id}/members`, { token: stranger.token, payload: { role: "editor" } })).statusCode).toBe(404);
      const invE = json(await call("POST", `/me/trips/${t.id}/members`, { token: owner.token, payload: { role: "editor" } })).data;
      const invV = json(await call("POST", `/me/trips/${t.id}/members`, { token: owner.token, payload: { role: "viewer" } })).data;
      expect((await call("POST", "/trips/join", { token: editor.token, payload: { token: "x".repeat(30) } })).statusCode).toBe(422);
      expect(json(await call("POST", "/trips/join", { token: editor.token, payload: { token: invE.token } })).data).toMatchObject({ trip_id: t.id, role: "editor" });
      expect((await call("POST", "/trips/join", { token: editor.token, payload: { token: invE.token } })).statusCode).toBe(409);
      expect((await call("POST", "/trips/join", { token: owner.token, payload: { token: invV.token } })).statusCode).toBe(409);   // el dueño no se une
      await call("POST", "/trips/join", { token: viewer.token, payload: { token: invV.token } });

      expect(json(await call("GET", "/me/trips", { token: editor.token })).data[0]).toMatchObject({ id: t.id, role: "editor" });
      // El editor agrega; el lector no; ninguno de los dos administra el viaje.
      expect((await call("POST", `/me/trips/${t.id}/items`, { token: editor.token, payload: { day: 2, title: "Cena" } })).statusCode).toBe(201);
      const ro = await call("POST", `/me/trips/${t.id}/items`, { token: viewer.token, payload: { day: 2, title: "Intento" } });
      expect(ro.statusCode).toBe(403);
      expect(json(ro).error.details.code).toBe("READ_ONLY");
      expect((await call("PATCH", `/me/trips/${t.id}`, { token: editor.token, payload: { title: "Mío" } })).statusCode).toBe(403);
      expect((await call("POST", `/me/trips/${t.id}/share`, { token: editor.token })).statusCode).toBe(403);
      expect((await call("GET", `/me/trips/${t.id}/diary`, { token: editor.token })).statusCode).toBe(403);

      // Votos: cualquier miembro, uno por persona, cambiables y retirables.
      const vote = (u: { token: string }, value: number) => call("POST", `/me/trips/${t.id}/items/${item.id}/vote`, { token: u.token, payload: { value } });
      expect(json(await vote(editor, 1)).data.votes).toBe(1);
      expect(json(await vote(viewer, 1)).data.votes).toBe(2);
      expect(json(await vote(viewer, -1)).data.votes).toBe(0);
      expect(json(await vote(owner, 1)).data.votes).toBe(1);
      expect((await vote(stranger, 1)).statusCode).toBe(404);
      const d = json(await call("GET", `/me/trips/${t.id}`, { token: viewer.token })).data;
      expect(d.days[0].items[0]).toMatchObject({ votes: 1, my_vote: -1 });
      expect(d.members.map((m: { role: string }) => m.role).sort()).toEqual(["editor", "viewer"]);
      expect((await vote(viewer, 0)).statusCode).toBe(200);

      // Salir del viaje o ser retirado.
      expect((await call("DELETE", `/me/trips/${t.id}/members/${editor.id}`, { token: viewer.token })).statusCode).toBe(403);
      expect((await call("DELETE", `/me/trips/${t.id}/members/${viewer.id}`, { token: viewer.token })).statusCode).toBe(204);
      expect((await call("GET", `/me/trips/${t.id}`, { token: viewer.token })).statusCode).toBe(404);
      expect((await call("DELETE", `/me/trips/${t.id}/members/${editor.id}`, { token: owner.token })).statusCode).toBe(204);
      // Invitación vencida o agotada.
      await pool.query("UPDATE trip_invites SET expires_at = now() - interval '1 minute' WHERE trip_id = $1", [t.id]);
      expect(json(await call("POST", "/trips/join", { token: stranger.token, payload: { token: invE.token } })).error.details.code).toBe("INVITE_INVALID");
    });
  });

  describe("diario, lista de empaque y check-in", () => {
    it("diario y lista de empaque del dueño", async () => {
      const u = await account(), other = await account();
      const t = await mkTrip(u);
      const e = json(await call("POST", `/me/trips/${t.id}/diary`, { token: u.token, payload: { entry_date: addDays(today, 10), title: "Día 1", body: "Llegamos", location: "Punta Cana", photos: ["https://cdn.test/a.jpg"] } })).data;
      expect(e).toMatchObject({ title: "Día 1", is_public: false, photos: ["https://cdn.test/a.jpg"] });
      expect((await call("POST", `/me/trips/${t.id}/diary`, { token: u.token, payload: { entry_date: "mañana", title: "x" } })).statusCode).toBe(400);
      expect(json(await call("PATCH", `/me/trips/${t.id}/diary/${e.id}`, { token: u.token, payload: { is_public: true, body: "Llegamos tarde" } })).data).toMatchObject({ is_public: true, body: "Llegamos tarde" });
      expect((await call("PATCH", `/me/trips/${t.id}/diary/${e.id}`, { token: other.token, payload: { title: "x" } })).statusCode).toBe(404);
      expect(json(await call("GET", `/me/trips/${t.id}/diary`, { token: u.token })).data).toHaveLength(1);
      expect((await call("DELETE", `/me/trips/${t.id}/diary/${e.id}`, { token: u.token })).statusCode).toBe(204);

      expect(json(await call("GET", `/me/trips/${t.id}/packing-list`, { token: u.token })).data).toEqual([]);
      const items = [{ id: "pasaporte", label: "Pasaporte", checked: true, category: "documentos" }, { id: "bloqueador", label: "Bloqueador solar", checked: false }];
      expect(json(await call("PUT", `/me/trips/${t.id}/packing-list`, { token: u.token, payload: { items } })).data).toHaveLength(2);
      expect(json(await call("GET", `/me/trips/${t.id}/packing-list`, { token: u.token })).data[0]).toMatchObject({ id: "pasaporte", checked: true });
      expect((await call("PUT", `/me/trips/${t.id}/packing-list`, { token: u.token, payload: { items: [items[0], items[0]] } })).statusCode).toBe(400);
    });

    it("check-in de una reserva propia: ventana de fechas, una sola vez y XP", async () => {
      const u = await account(), other = await account();
      const t = await mkTrip(u);
      const org = json(await call("POST", "/orgs", { token: u.token, payload: { business_name: `Check-in SRL ${tag}` } })).data.id;
      const listing = json(await call("POST", "/org/listings", { token: u.token, payload: { category: "experiencia", title: "Tour check-in", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 10, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
      const mk = async (date: string, status = "confirmed") => (await pool.query("INSERT INTO bookings (reference, org_id, listing_id, user_id, contact_name, contact_email, listing_title, category, date, guests, currency, subtotal, total_price, status) VALUES ($1,$2,$3,$4,'X','x@test.local','Tour check-in','experiencia',$5,2,'USD',100,100,$6) RETURNING id", [`CI-${tag}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(), org, listing, u.id, date, status])).rows[0].id as string;
      const go = (id: string, token = u.token) => call("POST", `/me/trips/${t.id}/check-in`, { token, payload: { booking_id: id } });
      const now = await mk(today), future = await mk(addDays(today, 5)), pending = await mk(today, "pending");
      expect(json(await go(future)).error.details.code).toBe("OUTSIDE_WINDOW");
      expect(json(await go(pending)).error.details.code).toBe("BOOKING_NOT_CONFIRMED");
      expect((await go(now, other.token)).statusCode).toBe(404);
      const ok = await go(now);
      expect(ok.statusCode).toBe(200);
      expect(json(ok).data.granted).toMatchObject({ xp: 30, coins: 5 });
      expect(json(await go(now)).error.details.reason).toBe("ALREADY_CHECKED_IN");
      // El resumen liga las reservas dentro del periodo del viaje.
      const t2 = await mkTrip(u, { start_date: addDays(today, 4), end_date: addDays(today, 7) });
      expect(json(await call("GET", `/me/trips/${t2.id}/summary`, { token: u.token })).data.bookings.map((b: { date: string }) => String(b.date).slice(0, 10))).toEqual([addDays(today, 5)]);
    });
  });

  describe("e-tickets", () => {
    it("lista tickets de eventos y vouchers; el personal valida y el ticket se usa una sola vez", async () => {
      const u = await account(), other = await account();
      const evId = "e1000000-0000-4000-8000-000000000001";
      const ev = (await pool.query("SELECT id, title FROM events WHERE id = $1", [evId])).rows[0];
      expect(ev).toBeTruthy();
      const r = (await pool.query("INSERT INTO reservations (id, user_id, partner_id, entity_type, entity_id, start_date, contact_name) VALUES (gen_random_uuid(), $1, $1, 'event', $2, $3, 'X') RETURNING id", [u.id, evId, today])).rows[0];
      const code = `TKT-${tag}-A`.toUpperCase(), cancelled = `TKT-${tag}-B`.toUpperCase();
      const t1 = (await pool.query("INSERT INTO event_tickets (id, reservation_id, ticket_code) VALUES (gen_random_uuid(), $1, $2) RETURNING id", [r.id, code])).rows[0].id;
      await pool.query("INSERT INTO event_tickets (id, reservation_id, ticket_code, status) VALUES (gen_random_uuid(), $1, $2, 'cancelled')", [r.id, cancelled]);
      const list = json(await call("GET", "/me/tickets", { token: u.token })).data as { id: string; code: string; status: string; kind: string; title: string }[];
      expect(list.find((x) => x.id === t1)).toMatchObject({ code, status: "valid", kind: "event", title: ev.title });
      expect(json(await call("GET", `/me/tickets/${t1}`, { token: u.token })).data.code).toBe(code);
      expect((await call("GET", `/me/tickets/${t1}`, { token: other.token })).statusCode).toBe(404);
      expect(json(await call("GET", "/me/tickets", { token: other.token })).data).toHaveLength(0);

      expect((await call("POST", "/tickets/verify", { token: u.token, payload: { code } })).statusCode).toBe(403);   // un viajero no valida tickets
      expect((await call("POST", "/tickets/verify", { payload: { code } })).statusCode).toBe(401);
      expect(json(await call("POST", "/tickets/verify", { token: admin, payload: { code } })).data).toMatchObject({ valid: true, kind: "event", title: ev.title });
      const again = await call("POST", "/tickets/verify", { token: admin, payload: { code } });
      expect(again.statusCode).toBe(409);
      expect(json(again).error.details.reason).toBe("ALREADY_SCANNED");
      expect(json(await call("POST", "/tickets/verify", { token: admin, payload: { code: cancelled } })).error.details.code).toBe("TICKET_CANCELLED");
      expect((await call("POST", "/tickets/verify", { token: admin, payload: { code: "NO-EXISTE-123" } })).statusCode).toBe(404);
      expect(json(await call("GET", `/me/tickets/${t1}`, { token: u.token })).data.status).toBe("scanned");
    });

    it("el personal del operador consulta la reserva por su referencia; otros operadores no", async () => {
      const owner = await account(), rival = await account(), traveler = await account();
      const org = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Escáner SRL ${tag}` } })).data.id;
      await call("POST", "/orgs", { token: rival.token, payload: { business_name: `Rival SRL ${tag}` } });
      const listing = json(await call("POST", "/org/listings", { token: owner.token, payload: { category: "experiencia", title: "Tour escáner", summary: "s", description: "d", destination: "Samaná", price: 100, capacity: 10, time_slots: ["09:00"], images: ["a.jpg"] } })).data.id;
      const ref = `ESC-${tag}`.toUpperCase();
      await pool.query("INSERT INTO bookings (reference, org_id, listing_id, user_id, contact_name, contact_email, listing_title, category, date, guests, currency, subtotal, total_price, status) VALUES ($1,$2,$3,$4,'Ana','a@test.local','Tour escáner','experiencia',$5,3,'USD',100,100,'confirmed')", [ref, org, listing, traveler.id, today]);
      expect(json(await call("GET", "/me/tickets", { token: traveler.token })).data[0]).toMatchObject({ code: ref, kind: "booking", status: "valid" });
      expect(json(await call("POST", "/tickets/verify", { token: owner.token, payload: { code: ref.toLowerCase() } })).data).toMatchObject({ valid: true, kind: "booking", guests: 3, guest_name: "Ana" });
      expect((await call("POST", "/tickets/verify", { token: rival.token, payload: { code: ref } })).statusCode).toBe(403);
      expect((await call("POST", "/tickets/verify", { token: traveler.token, payload: { code: ref } })).statusCode).toBe(403);
    });
  });

  describe("reto Top 100", () => {
    it("marca visitados y deseados; los hitos dan premios una sola vez y el límite es 100", async () => {
      const u = await account();
      const spot = (i: number) => `lugar-${tag}-${i}`;
      expect((await call("PUT", "/me/spots/LUGAR%20MALO", { token: u.token })).statusCode).toBe(400);
      expect(json(await call("PUT", `/me/wishlist/${spot(1)}`, { token: u.token })).data.status).toBe("wishlist");
      expect(json(await call("GET", "/me/spots", { token: u.token })).data.totals).toMatchObject({ visited: 0, wishlist: 1, goal: 100 });
      const first = json(await call("PUT", `/me/spots/${spot(1)}`, { token: u.token, payload: { notes: "Increíble" } })).data;
      expect(first).toMatchObject({ visited: 1, rewards: [] });
      expect(json(await call("GET", "/me/spots", { token: u.token })).data.totals).toMatchObject({ visited: 1, wishlist: 0 });   // pasó de deseado a visitado
      expect((await call("PUT", `/me/wishlist/${spot(1)}`, { token: u.token })).statusCode).toBe(409);
      expect(json(await call("PUT", `/me/spots/${spot(1)}`, { token: u.token })).data.visited).toBe(1);                          // idempotente
      let last: { visited: number; rewards: { milestone: number; xp: number }[] } | undefined;
      for (let i = 2; i <= 10; i++) last = json(await call("PUT", `/me/spots/${spot(i)}`, { token: u.token })).data;
      expect(last).toMatchObject({ visited: 10, rewards: [{ milestone: 10, xp: 100, coins: 20 }] });
      const xp = json(await call("GET", "/gamification/me", { token: u.token })).data.xp;
      expect(xp).toBeGreaterThanOrEqual(100);
      // Quitar y volver a marcar no repite el premio.
      expect((await call("DELETE", `/me/spots/${spot(10)}`, { token: u.token })).statusCode).toBe(204);
      expect(json(await call("PUT", `/me/spots/${spot(10)}`, { token: u.token })).data.rewards).toEqual([]);
      expect(json(await call("GET", "/me/spots", { token: u.token })).data.next_milestone).toEqual({ at: 25, remaining: 15 });
      expect((await call("DELETE", `/me/wishlist/${spot(99)}`, { token: u.token })).statusCode).toBe(404);
      expect((await call("GET", "/me/spots")).statusCode).toBe(401);
    });
  });
});
