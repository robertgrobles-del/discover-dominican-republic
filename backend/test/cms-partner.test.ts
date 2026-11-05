import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BY_TABLE } from "../src/contracts/content-collections.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("CMS: propietarios ('partner') y sus establecimientos", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const hotels = `/api/v1/admin/${BY_TABLE.get("hotels")!.path}`;
  const events = BY_TABLE.get("events") ? `/api/v1/admin/${BY_TABLE.get("events")!.path}` : null;
  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, token: string, payload?: object) =>
    app.inject({ method, url, payload, headers: { authorization: `Bearer ${token}` } });
  const account = async (role?: string) => {
    const email = `cp${tag}${n++}@test.local`;
    const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } }));
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2)", [reg.data.user.id, role]);
    return json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  let p1: string, p2: string, admin: string, staffHotel: string;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    [p1, p2, admin] = [await account("partner"), await account("partner"), await account("admin")];
    const res = await call("POST", hotels, admin, { name: `Hotel del personal ${tag}` });
    expect(res.statusCode).toBe(201);
    staffHotel = json(res).data.id;
    // Un registro cargado sin autor (importado o de la carga inicial).
    await pool.query("UPDATE hotels SET created_by = NULL WHERE id = $1", [staffHotel]);
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("registra su establecimiento en borrador, lo ve, lo edita y lo envía a revisión, pero no lo publica", async () => {
    const created = await call("POST", hotels, p1, { name: `Hotel propio ${tag}` });
    expect(created.statusCode).toBe(201);
    const row = json(created).data;
    expect(row.status).toBe("draft");
    const list = json(await call("GET", `${hotels}?per_page=100`, p1)).data as { id: string }[];
    expect(list.map((x) => x.id)).toEqual([row.id]);
    expect((await call("PATCH", `${hotels}/${row.id}`, p1, { name: `Hotel propio editado ${tag}`, version: row.version })).statusCode).toBe(200);
    expect((await call("POST", `${hotels}/${row.id}/publish`, p1)).statusCode).toBe(403);
    expect(json(await call("POST", `${hotels}/${row.id}/submit-review`, p1)).data.status).toBe("in_review");
  });

  it("no ve ni toca los de otro propietario ni los registros sin autor", async () => {
    const other = json(await call("POST", hotels, p2, { name: `Hotel ajeno ${tag}` })).data;
    for (const id of [other.id, staffHotel]) {
      expect((await call("GET", `${hotels}/${id}`, p1)).statusCode).toBe(403);
      expect((await call("PATCH", `${hotels}/${id}`, p1, { name: "Intruso", version: 1 })).statusCode).toBe(403);
      expect((await call("DELETE", `${hotels}/${id}`, p1)).statusCode).toBe(403);
    }
    const list = json(await call("GET", `${hotels}?per_page=100`, p1)).data as { id: string }[];
    expect(list.some((x) => x.id === other.id || x.id === staffHotel)).toBe(false);
  });

  it("cada tipo de establecimiento se crea con los campos de su plantilla (migración 0090)", async () => {
    const cases: [string, Record<string, unknown>][] = [
      ["spas_wellness", { name: `Spa ${tag}`, spa_type: "termal", short_description: "Aguas termales", treatments: ["Masaje"], amenities: ["Sauna"], price_range: "$$", is_featured: true }],
      ["clinics", { name: `Clínica ${tag}`, clinic_type: "dental", description: "Odontología", emergency_phone: "809-000-0000", insurance_accepted: ["ARS Humano"], languages: ["es", "en"], is_24_hours: true }],
      ["shopping_centers", { name: `Plaza ${tag}`, mall_type: "mall", floors: 3, store_count: 120, brands: ["Zara"], has_cinema: true, has_food_court: true, parking: "Gratis" }],
      ["bars", { name: `Bar ${tag}`, cover_price: 500, instagram: "https://instagram.com/bar", features: ["Terraza"] }],
      ["hotels", { name: `Hotel plantilla ${tag}`, check_in_time: "15:00", check_out_time: "12:00", policies: [{ title: "Mascotas", text: "No" }], pools: [{ name: "Principal" }], faqs: [{ q: "¿Wifi?", a: "Sí" }] }],
    ];
    for (const [table, payload] of cases) {
      const res = await call("POST", `/api/v1/admin/${BY_TABLE.get(table)!.path}`, p1, payload);
      expect(res.statusCode, `${table}: ${res.body}`).toBe(201);
      expect(json(res).data).toMatchObject({ ...payload, status: "draft" });
    }
  });

  it("fuera de las tablas de establecimientos el rol partner no entra", async () => {
    if (!events) return;
    expect((await call("GET", events, p1)).statusCode).toBe(403);
    expect((await call("GET", `${hotels}/export`, p1)).statusCode).toBe(403);
  });
});
