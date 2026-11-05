import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handle, hashPassword, type ApiRequest } from "./_core";

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

describe("provincias y noticias", () => {
  it("crea, edita, lista y borra; valida y detecta slugs repetidos", async () => {
    const auth = bearer(await login("admin@x.do", "clave-segura-123"));
    const p = await call("POST", "/admin/provinces", { slug: "samana", name: "Samaná", region: "norte", latitude: 19.2 }, auth);
    expect(p.status).toBe(201);
    const id = data(p).id as string;

    expect((await call("POST", "/admin/provinces", { slug: "samana", name: "Otra", region: "norte" }, auth)).status).toBe(409);
    expect((await call("POST", "/admin/provinces", { slug: "Mal Slug", name: "X", region: "norte" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/provinces", { slug: "x", name: "X", region: "oeste" }, auth)).status).toBe(422);
    expect((await call("POST", "/admin/provinces", { slug: "x", name: "X", region: "sur", image_url: "javascript:alert(1)" }, auth)).status).toBe(422);

    const upd = await call("PUT", `/admin/provinces/${id}`, { slug: "samana", name: "Samaná", region: "norte", status: "published" }, auth);
    expect(data(upd).status).toBe("published");

    const n = await call("POST", "/admin/news", { slug: "ballenas-2027", title: "Llegan las ballenas", province_id: id, status: "published" }, auth);
    expect(n.status).toBe(201);
    expect(data(n).published_at).toBeTruthy();
    expect((await call("POST", "/admin/news", { slug: "otra", title: "X", province_id: "no-existe" }, auth)).status).toBe(422);

    expect(data<unknown[]>(await call("GET", "/admin/news", undefined, auth))).toHaveLength(1);
    expect((await call("DELETE", `/admin/provinces/${id}`, undefined, auth)).status).toBe(204);
    expect((await call("GET", `/admin/provinces/${id}`, undefined, auth)).status).toBe(404);
  });
});
