import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `ml${Date.now().toString(36)}${n++}@test.local`;
const image = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: { r: 11, g: 92, b: 171 } } }).jpeg().toBuffer();

describe("licenciamiento de imágenes del banco oficial", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let dir: string;
  let admin: { token: string; id: string }, buyer: { token: string; id: string }, other: { token: string; id: string };
  let assetId: string, offerId: string, orderId: string;

  const call = (method: "GET" | "POST" | "PUT" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: url.startsWith("/api") ? url : `/api/v1${url}`, payload: opts.payload as never, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const upload = async (file: Buffer, purpose: string) => {
    const u = json(await call("POST", "/media/upload-url", { token: admin.token, payload: { mime: "image/jpeg", size: file.length, purpose } })).data;
    await call("PUT", u.upload.url, { payload: file, headers: { "content-type": "image/jpeg" } });
    expect((await call("POST", `/media/${u.asset_id}/complete`, { token: admin.token })).statusCode).toBe(200);
    return u.asset_id as string;
  };
  const original = (token?: string) => call("GET", `/media/files/${assetId}`, { token });
  const offerBody = () => ({ asset_id: assetId, title: "Bahía de las Águilas al amanecer", price_editorial: 1500, price_commercial: 9000 });

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "rd-lic-"));
    app = await makeApp({ MEDIA_DIR: dir });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); buyer = await account(); other = await account();
    assetId = await upload(await image(1600, 1200), "cms");
  });
  afterAll(async () => {
    await pool.query("DELETE FROM media_license_orders WHERE asset_id = $1", [assetId]);
    await pool.query("DELETE FROM media_license_offers WHERE asset_id = $1", [assetId]);
    await pool.end(); await app.close(); rmSync(dir, { recursive: true, force: true });
  });

  it("sólo administración oferta, y sólo imágenes editoriales con vista previa propia", async () => {
    expect((await original()).statusCode).toBe(200); // antes de ofertarla el original es público
    expect((await call("POST", "/admin/media/licenses/offers", { token: buyer.token, payload: offerBody() })).statusCode).toBe(403);
    const avatar = await upload(await image(1600, 1200), "avatar");
    expect((await call("POST", "/admin/media/licenses/offers", { token: admin.token, payload: { ...offerBody(), asset_id: avatar } })).statusCode).toBe(422);
    const created = await call("POST", "/admin/media/licenses/offers", { token: admin.token, payload: offerBody() });
    expect(created.statusCode).toBe(201);
    offerId = json(created).data.id;
  });

  it("al ofertarla el original deja de ser público, pero la vista previa sigue disponible y en el catálogo", async () => {
    const anonymous = await original();
    expect(anonymous.statusCode).toBe(403);
    expect(json(anonymous).error.details.code).toBe("LICENSE_REQUIRED");
    expect((await original(buyer.token)).statusCode).toBe(403);
    expect((await original(admin.token)).statusCode).toBe(200);
    const preview = await call("GET", `/media/files/${assetId}?variant=medium`);
    expect(preview.statusCode).toBe(200);
    expect(preview.headers["cache-control"]).toContain("public");
    const item = (json(await call("GET", "/media/licenses/catalog?per_page=100")).data as { id: string; preview_url: string; price_commercial: number }[]).find((o) => o.id === offerId)!;
    expect(item).toMatchObject({ price_editorial: 1500, price_commercial: 9000 });
    expect(item.preview_url).toContain(`${assetId}?variant=medium`);
  });

  it("la solicitud guarda el precio del tipo de licencia pedido y no se duplica mientras esté en revisión", async () => {
    const payload = { offer_id: offerId, license_type: "commercial", licensee_name: "Agencia Caribe SRL", intended_use: "Campaña impresa de temporada alta 2027" };
    expect((await call("POST", "/media/licenses/requests", { payload })).statusCode).toBe(401);
    expect((await call("POST", "/media/licenses/requests", { token: buyer.token, payload: { ...payload, intended_use: "corto" } })).statusCode).toBe(400);
    const created = await call("POST", "/media/licenses/requests", { token: buyer.token, payload });
    expect(created.statusCode).toBe(201);
    expect(json(created).data).toMatchObject({ price: 9000, currency: "DOP", status: "requested" });
    orderId = json(created).data.id;
    expect((await call("POST", "/media/licenses/requests", { token: buyer.token, payload })).statusCode).toBe(409);
    expect(json(await call("GET", "/media/licenses/mine", { token: buyer.token })).data[0]).toMatchObject({ status: "requested", download_url: null });
    expect((await original(buyer.token)).statusCode).toBe(403);
  });

  it("aprobar exige el comprobante del pago, da acceso al original sólo a quien compró y queda auditado", async () => {
    expect((await call("POST", `/admin/media/licenses/requests/${orderId}/decide`, { token: buyer.token, payload: { approve: true, payment_reference: "TRF-1" } })).statusCode).toBe(403);
    expect((await call("POST", `/admin/media/licenses/requests/${orderId}/decide`, { token: admin.token, payload: { approve: true } })).statusCode).toBe(400);
    expect(json(await call("POST", `/admin/media/licenses/requests/${orderId}/decide`, { token: admin.token, payload: { approve: true, payment_reference: "TRF-2027-001" } })).data.status).toBe("approved");
    expect((await call("POST", `/admin/media/licenses/requests/${orderId}/decide`, { token: admin.token, payload: { approve: false } })).statusCode).toBe(409);
    const licensed = await original(buyer.token);
    expect(licensed.statusCode).toBe(200);
    expect(licensed.headers["cache-control"]).toBe("private, no-store");
    expect((await original(other.token)).statusCode).toBe(403);
    const mine = json(await call("GET", "/media/licenses/mine", { token: buyer.token })).data[0];
    expect(mine.download_url).toContain(`/media/files/${assetId}`);
    expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'media.license_approve' AND entity_id = $1", [orderId])).rows[0].n).toBe(1);
  });

  it("una licencia vencida deja de dar acceso, y retirar la oferta no libera el original", async () => {
    await pool.query("UPDATE media_license_orders SET expires_at = now() - interval '1 day' WHERE id = $1", [orderId]);
    expect((await original(buyer.token)).statusCode).toBe(403);
    expect(json(await call("GET", "/media/licenses/mine", { token: buyer.token })).data[0].download_url).toBeNull();
    expect((await call("DELETE", `/admin/media/licenses/offers/${offerId}`, { token: admin.token })).statusCode).toBe(204);
    expect((json(await call("GET", "/media/licenses/catalog?per_page=100")).data as { id: string }[]).some((o) => o.id === offerId)).toBe(false);
    expect((await original()).statusCode).toBe(403);
  });
});
