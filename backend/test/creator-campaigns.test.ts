import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { termsHash } from "../src/modules/creators/campaigns.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

const TERMS = {
  brief: "Mostrar la experiencia de un fin de semana en Samaná con la marca",
  deliverables: [{ type: "video", quantity: 2, due_date: "2026-12-01" }],
  schedule: { starts_on: "2026-11-01", ends_on: "2026-12-15" },
  compensation: { type: "fixed", amount: 15000, currency: "DOP" },
  disclosure: "#publicidad visible en los primeros 3 segundos",
  metrics: ["reproducciones", "clics al enlace"],
  rights: { media: ["portal", "instagram"], territory: "República Dominicana", duration_days: 180, exclusive: false, approved_uses: ["feed", "anuncio"] },
};

describe("campañas con creadores, derechos, ingresos y disputas (plan de accesos, puntos 87 a 93)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let admin: Account, creator: Account, other: Account;

  const call = (method: "GET" | "POST" | "PUT", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (role?: string): Promise<Account> => {
    const email = `cc${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Campaña Prueba" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, email, token: role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const makeCreator = async () => {
    const a = await account();
    await pool.query("INSERT INTO creator_profiles (id, handle, display_name, status, approved_at) VALUES ($1, $2, 'Creadora', 'approved', now())", [a.id, `cc${tag}${n++}`]);
    return a;
  };
  const video = async (creatorId: string) =>
    (await pool.query<{ id: string }>("INSERT INTO creator_videos (creator_id, title, slug, video_url, duration_seconds, file_size_bytes, status) VALUES ($1, 'Pieza de prueba', $2, 'https://cdn.example.com/v.mp4', 30, 1048576, 'published') RETURNING id", [creatorId, `pieza-${tag}-${n++}`])).rows[0]!.id;
  const campaign = async (terms: object = TERMS, open = true) => {
    const id = json(await call("POST", "/admin/creator-campaigns", { token: admin.token, payload: { title: `Campaña ${tag} ${n++}`, sponsor: "Marca X", terms } })).data.id as string;
    if (open) await call("POST", `/admin/creator-campaigns/${id}/status`, { token: admin.token, payload: { status: "open" } });
    return id;
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin");
    creator = await makeCreator();
    other = await makeCreator();
  });
  afterAll(async () => {
    await pool.query("DELETE FROM creator_campaigns WHERE title LIKE $1", [`Campaña ${tag}%`]);
    await pool.end();
    await app.close();
  });

  it("los términos exigen brief, entregables, calendario, compensación, divulgación y derechos con plazo (87)", async () => {
    const bad = (terms: object) => call("POST", "/admin/creator-campaigns", { token: admin.token, payload: { title: `Campaña ${tag} inválida`, terms } });
    expect((await bad({ ...TERMS, disclosure: "" })).statusCode).toBe(400);
    expect((await bad({ ...TERMS, deliverables: [] })).statusCode).toBe(400);
    expect((await bad({ ...TERMS, rights: { ...TERMS.rights, duration_days: undefined } })).statusCode).toBe(400); // sin licencias perpetuas
    expect((await bad({ ...TERMS, schedule: { starts_on: "2026-12-15", ends_on: "2026-11-01" } })).statusCode).toBe(400);
    expect((await bad({ ...TERMS, compensation: { type: "fixed", currency: "DOP" } })).statusCode).toBe(400);
    expect((await call("POST", "/admin/creator-campaigns", { token: creator.token, payload: { title: "No soy admin", terms: TERMS } })).statusCode).toBe(403);

    const id = await campaign(TERMS, false);
    // En borrador no se ofrece a los creadores.
    expect(json(await call("GET", "/creators/campaigns", { token: creator.token })).data.some((c: { id: string }) => c.id === id)).toBe(false);
    await call("POST", `/admin/creator-campaigns/${id}/status`, { token: admin.token, payload: { status: "open" } });
    const seen = json(await call("GET", "/creators/campaigns", { token: creator.token })).data.find((c: { id: string }) => c.id === id);
    expect(seen).toMatchObject({ version: 1, needs_acceptance: true, sponsor: "Marca X" });
    expect(seen.terms).toMatchObject({ disclosure: TERMS.disclosure, rights: { duration_days: 180 } });
    expect(seen.terms_hash).toBe(termsHash(seen.terms));
  });

  it("la aceptación queda ligada a una versión; si los términos cambian hay que aceptar de nuevo y la evidencia se conserva (88)", async () => {
    const id = await campaign();
    const piece = await video(creator.id);
    // Sin aceptar no se entrega.
    expect(json(await call("POST", `/creators/campaigns/${id}/deliverables`, { token: creator.token, payload: { video_id: piece } })).error.details.code).toBe("TERMS_NOT_ACCEPTED");

    const accepted = await call("POST", `/creators/campaigns/${id}/accept`, { token: creator.token, payload: { version: 1 } });
    expect(accepted.statusCode).toBe(200);
    expect(json(accepted).data).toMatchObject({ version: 1, already_accepted: false });
    expect(json(await call("POST", `/creators/campaigns/${id}/accept`, { token: creator.token, payload: { version: 1 } })).data.already_accepted).toBe(true);

    // El personal publica otra versión: la anterior no se toca y el creador recibe aviso.
    const revised = await call("PUT", `/admin/creator-campaigns/${id}/terms`, { token: admin.token, payload: { terms: { ...TERMS, compensation: { type: "fixed", amount: 20000, currency: "DOP" } } } });
    expect(json(revised).data.version).toBe(2);
    expect((await call("PUT", `/admin/creator-campaigns/${id}/terms`, { token: admin.token, payload: { terms: { ...TERMS, compensation: { type: "fixed", amount: 20000, currency: "DOP" } } } })).statusCode).toBe(422); // sin cambios
    await expect(pool.query("UPDATE creator_campaign_terms SET terms = '{}' WHERE campaign_id = $1 AND version = 1", [id])).rejects.toThrow(/inmutable/);
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'campaign_id' = $2", [creator.id, id])).rowCount).toBe(1);

    expect(json(await call("GET", "/creators/campaigns", { token: creator.token })).data.find((c: { id: string }) => c.id === id)).toMatchObject({ version: 2, accepted_version: 1, needs_acceptance: true });
    expect(json(await call("POST", `/creators/campaigns/${id}/deliverables`, { token: creator.token, payload: { video_id: piece } })).error.details.code).toBe("TERMS_NOT_ACCEPTED");
    // No se acepta a ciegas una versión que ya no es la vigente.
    const stale = await call("POST", `/creators/campaigns/${id}/accept`, { token: creator.token, payload: { version: 1 } });
    expect(stale.statusCode).toBe(409);
    expect(json(stale).error.details).toMatchObject({ reason: "TERMS_VERSION_MISMATCH", current_version: 2 });
    expect((await call("POST", `/creators/campaigns/${id}/accept`, { token: creator.token, payload: { version: 2 } })).statusCode).toBe(200);

    const evidence = json(await call("GET", `/admin/creator-campaigns/${id}/acceptances`, { token: admin.token })).data as { version: number; terms: { compensation: { amount: number } }; terms_hash: string; accepted_at: string }[];
    expect(evidence.map((e) => [e.version, e.terms.compensation.amount])).toEqual([[1, 15000], [2, 20000]]);
    expect(evidence[0]!.terms_hash).not.toBe(evidence[1]!.terms_hash);
    expect((await call("GET", `/admin/creator-campaigns/${id}/acceptances`, { token: creator.token })).statusCode).toBe(403);
  });

  it("aprobar una entrega registra la licencia de la pieza y el pago por contenido; el autor sigue siendo el titular (89 y 90)", async () => {
    const id = await campaign();
    const piece = await video(creator.id), foreign = await video(other.id);
    await call("POST", `/creators/campaigns/${id}/accept`, { token: creator.token, payload: { version: 1 } });
    expect((await call("POST", `/creators/campaigns/${id}/deliverables`, { token: creator.token, payload: { video_id: foreign } })).statusCode).toBe(404); // pieza ajena
    const delivered = await call("POST", `/creators/campaigns/${id}/deliverables`, { token: creator.token, payload: { video_id: piece } });
    expect(delivered.statusCode).toBe(201);
    expect((await call("POST", `/creators/campaigns/${id}/deliverables`, { token: creator.token, payload: { video_id: piece } })).statusCode).toBe(409);

    const review = await call("POST", `/admin/creator-deliverables/${json(delivered).data.id}/review`, { token: admin.token, payload: { decision: "approved", note: "Cumple el brief" } });
    expect(review.statusCode).toBe(200);
    expect(json(review).data.rights_id).toBeTruthy();
    expect(json(review).data.ledger_id).toBeTruthy();
    expect((await call("POST", `/admin/creator-deliverables/${json(delivered).data.id}/review`, { token: admin.token, payload: { decision: "rejected" } })).statusCode).toBe(422);

    const rights = json(await call("GET", `/creators/videos/${piece}/rights`, { token: creator.token })).data;
    expect(rights.holder_creator_id).toBe(creator.id);
    expect(rights.licenses[0]).toMatchObject({ license_type: "campaign", campaign_id: id, territory: "República Dominicana", exclusive: false, status: "active", media: ["portal", "instagram"], approved_uses: ["feed", "anuncio"] });
    const days = (new Date(rights.licenses[0].expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(179);
    expect(days).toBeLessThan(181);
    // Otro creador no ve los derechos de una pieza ajena; el personal sí.
    expect((await call("GET", `/creators/videos/${piece}/rights`, { token: other.token })).statusCode).toBe(404);
    expect((await call("GET", `/creators/videos/${piece}/rights`, { token: admin.token })).statusCode).toBe(200);

    const earnings = json(await call("GET", "/creators/me/earnings", { token: creator.token })).data;
    expect(earnings.by_source.find((s: { source: string }) => s.source === "content_payment")).toMatchObject({ confirmed: 15000, estimated: 0, currency: "DOP", label: "Pagos por contenido de campañas" });
  });

  it("los ingresos se separan por concepto; lo estimado no cuenta como confirmado y un reverso explica su razón (90 y 91)", async () => {
    const c = await makeCreator();
    const piece = await video(c.id);
    await app.creators.attributeConversion(piece, 1000, "pedido web");                // comisión estimada del 8 %
    const bonus = json(await call("POST", "/admin/creator-ledger", { token: admin.token, payload: { creator_id: c.id, source: "bonus", amount: 500, reason: "Bono por campaña de temporada alta" } })).data.id as string;
    expect((await call("POST", "/admin/creator-ledger", { token: admin.token, payload: { creator_id: c.id, source: "bonus", amount: 500, reason: "corto" } })).statusCode).toBe(400);

    let e = json(await call("GET", "/creators/me/earnings", { token: c.token })).data;
    const commission = e.by_source.find((s: { source: string }) => s.source === "affiliate_commission");
    expect(commission).toMatchObject({ estimated: 80, confirmed: 0 });
    expect(e.by_source.find((s: { source: string }) => s.source === "bonus")).toMatchObject({ confirmed: 500 });
    const entry = e.entries.find((x: { source: string }) => x.source === "affiliate_commission");
    expect(entry).toMatchObject({ status: "estimated", attribution_window_days: 30, origin: "Venta atribuida al video (pedido web)" });
    expect(new Date(entry.confirms_at).getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);
    expect(e.notes.estimated).toMatch(/No es un ingreso asegurado/);

    // Al cumplirse la ventana, la estimación pasa a confirmada.
    await pool.query("UPDATE creator_ledger SET created_at = now() - interval '31 days' WHERE id = $1", [entry.id]);
    expect((await app.jobs.runNow("creators.ledger.confirm")).result).toMatchObject({ confirmed: expect.any(Number) });
    e = json(await call("GET", "/creators/me/earnings", { token: c.token })).data;
    expect(e.by_source.find((s: { source: string }) => s.source === "affiliate_commission")).toMatchObject({ estimated: 0, confirmed: 80 });

    // Reverso: no borra el movimiento, añade uno negativo con la razón a la vista.
    const reversed = await call("POST", `/admin/creator-ledger/${bonus}/reverse`, { token: admin.token, payload: { reason: "El bono se registró por duplicado" } });
    expect(reversed.statusCode).toBe(200);
    expect((await call("POST", `/admin/creator-ledger/${bonus}/reverse`, { token: admin.token, payload: { reason: "Segundo intento de reverso" } })).statusCode).toBe(422);
    e = json(await call("GET", "/creators/me/earnings", { token: c.token })).data;
    expect(e.by_source.find((s: { source: string }) => s.source === "bonus")).toMatchObject({ confirmed: 500 });
    expect(e.by_source.find((s: { source: string }) => s.source === "reversal")).toMatchObject({ confirmed: -500, label: "Reversos" });
    expect(e.entries.find((x: { source: string }) => x.source === "reversal")).toMatchObject({ reason: "El bono se registró por duplicado", reverses_entry_id: bonus, amount: -500 });
    expect(e.entries.find((x: { id: string }) => x.id === bonus).status).toBe("reversed");
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND title LIKE 'Se revirtió%'", [c.id])).rowCount).toBe(1);
  });

  it("una licencia vencida o revocada no admite usos nuevos; se avisa antes de vencer (93)", async () => {
    const c = await makeCreator();
    const piece = await video(c.id);
    expect(await app.creatorCampaigns.canUse(piece, "feed")).toBe(false); // sin licencia no hay uso
    const license = json(await call("POST", `/creators/videos/${piece}/platform-license`, { token: c.token })).data;
    expect((await call("POST", `/creators/videos/${piece}/platform-license`, { token: c.token })).statusCode).toBe(409);
    expect(await app.creatorCampaigns.canUse(piece, "feed")).toBe(true);
    expect(await app.creatorCampaigns.canUse(piece, "anuncio")).toBe(false); // uso no aprobado

    await pool.query("UPDATE content_rights SET expires_at = now() + interval '5 days' WHERE id = $1", [license.id]);
    expect((await app.jobs.runNow("content.rights.sweep")).result).toMatchObject({ notified: expect.any(Number) });
    await app.jobs.runNow("content.rights.sweep");
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'rights_id' = $2", [c.id, license.id])).rowCount).toBe(1); // una sola vez

    await pool.query("UPDATE content_rights SET expires_at = now() - interval '1 minute' WHERE id = $1", [license.id]);
    expect(await app.creatorCampaigns.canUse(piece, "feed")).toBe(false);
    expect(json(await call("GET", `/creators/videos/${piece}/rights`, { token: c.token })).data.licenses[0].status).toBe("expired");

    // El autor retira la licencia de plataforma; una de campaña sólo la revoca el personal.
    const second = json(await call("POST", `/creators/videos/${piece}/platform-license`, { token: c.token })).data;
    expect((await call("POST", `/creators/rights/${second.id}/revoke`, { token: other.token, payload: { reason: "Intento de un tercero" } })).statusCode).toBe(404);
    expect((await call("POST", `/creators/rights/${second.id}/revoke`, { token: c.token, payload: { reason: "Ya no quiero que se difunda" } })).statusCode).toBe(204);
    expect(await app.creatorCampaigns.canUse(piece, "feed")).toBe(false);

    const id = await campaign();
    await call("POST", `/creators/campaigns/${id}/accept`, { token: c.token, payload: { version: 1 } });
    const d = json(await call("POST", `/creators/campaigns/${id}/deliverables`, { token: c.token, payload: { video_id: piece } })).data.id;
    const rightsId = json(await call("POST", `/admin/creator-deliverables/${d}/review`, { token: admin.token, payload: { decision: "approved" } })).data.rights_id;
    const denied = await call("POST", `/creators/rights/${rightsId}/revoke`, { token: c.token, payload: { reason: "Quiero retirar la pieza" } });
    expect(denied.statusCode).toBe(403);
    expect(json(denied).error.details.code).toBe("CAMPAIGN_LICENSE");
    expect((await call("POST", `/creators/rights/${rightsId}/revoke`, { token: admin.token, payload: { reason: "Acuerdo tras la disputa" } })).statusCode).toBe(204);
    expect(await app.creatorCampaigns.canUse(piece, "anuncio")).toBe(false);
  });

  it("las disputas llevan evidencia y plazo, y sólo las ven el creador y el personal (92)", async () => {
    const c = await makeCreator();
    const entry = json(await call("POST", "/admin/creator-ledger", { token: admin.token, payload: { creator_id: c.id, source: "adjustment", amount: -200, reason: "Descuento por entrega tardía" } })).data.id as string;
    const open = (token: string, body: object) => call("POST", "/creators/disputes", { token, payload: body });

    expect((await open(c.token, { subject_type: "ledger_entry", subject_id: entry, reason: "corto" })).statusCode).toBe(400);
    expect((await open(c.token, { subject_type: "ledger_entry", subject_id: entry, reason: "La entrega fue a tiempo", evidence: [{ label: "sin contenido" }] })).statusCode).toBe(400);
    expect((await open(other.token, { subject_type: "ledger_entry", subject_id: entry, reason: "Disputo un movimiento ajeno" })).statusCode).toBe(404);

    const res = await open(c.token, { subject_type: "ledger_entry", subject_id: entry, reason: "La entrega se hizo dentro del plazo acordado", evidence: [{ label: "Captura de la entrega", url: "https://cdn.example.com/prueba.png" }] });
    expect(res.statusCode).toBe(201);
    const id = json(res).data.id as string;
    const due = (new Date(json(res).data.due_at).getTime() - Date.now()) / 86_400_000;
    expect(due).toBeGreaterThan(9);
    expect(due).toBeLessThan(11);
    expect((await open(c.token, { subject_type: "ledger_entry", subject_id: entry, reason: "Segunda disputa del mismo caso" })).statusCode).toBe(409);

    expect(json(await call("GET", "/creators/me/disputes", { token: c.token })).data[0]).toMatchObject({ id, status: "open" });
    expect(json(await call("GET", "/creators/me/disputes", { token: other.token })).data.some((d: { id: string }) => d.id === id)).toBe(false);
    expect((await call("GET", "/admin/creator-disputes", { token: c.token })).statusCode).toBe(403);
    expect(json(await call("GET", "/admin/creator-disputes", { token: admin.token })).data.find((d: { id: string }) => d.id === id)).toMatchObject({ overdue: false, evidence: [{ label: "Captura de la entrega" }] });

    expect((await call("POST", `/admin/creator-disputes/${id}/resolve`, { token: admin.token, payload: { decision: "resolved_accepted", note: "no" } })).statusCode).toBe(400);
    expect((await call("POST", `/admin/creator-disputes/${id}/resolve`, { token: admin.token, payload: { decision: "resolved_accepted", note: "Confirmamos que la entrega fue a tiempo" } })).statusCode).toBe(204);
    expect(json(await call("GET", "/creators/me/disputes", { token: c.token })).data[0]).toMatchObject({ status: "resolved_accepted", resolution_note: "Confirmamos que la entrega fue a tiempo" });
    expect((await call("POST", `/admin/creator-disputes/${id}/resolve`, { token: admin.token, payload: { decision: "resolved_rejected", note: "Segundo intento de resolución" } })).statusCode).toBe(404);

    // Fuera del plazo ya no se admite.
    const old = json(await call("POST", "/admin/creator-ledger", { token: admin.token, payload: { creator_id: c.id, source: "bonus", amount: 100, reason: "Bono antiguo de prueba" } })).data.id as string;
    await pool.query("UPDATE creator_ledger SET created_at = now() - interval '45 days' WHERE id = $1", [old]);
    expect(json(await open(c.token, { subject_type: "ledger_entry", subject_id: old, reason: "Reclamo fuera de plazo" })).error.details.code).toBe("DISPUTE_WINDOW_CLOSED");
  });

  it("un perfil de creador sin aprobar no participa", async () => {
    const u = await account();
    expect((await call("GET", "/creators/campaigns", { token: u.token })).statusCode).toBe(404);
    await pool.query("INSERT INTO creator_profiles (id, handle, display_name, status) VALUES ($1, $2, 'Pendiente', 'pending')", [u.id, `cc${tag}pend`]);
    expect(json(await call("GET", "/creators/campaigns", { token: u.token })).error.details.code).toBe("CREATOR_NOT_APPROVED");
  });
});
