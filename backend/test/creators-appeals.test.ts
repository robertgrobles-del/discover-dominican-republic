/**
 * Puntos 41 (centro de identidad y reputación del creador) y 44 (moderación y apelación de
 * contenido) del plan. Prueba de integración contra la base real de pruebas.
 *
 * Cubre: la publicación queda en `pending_review` y no llega al feed público, sólo el dueño
 * apela, una sola apelación abierta por publicación, la resolución del moderador (aceptar
 * devuelve a revisión, rechazar conserva el estado y anota el motivo), el catálogo publicado de
 * sellos con sus criterios, la reputación, la validación de listas blancas de la identidad,
 * `public_profile = false` y la auditoría de cada mutación.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CATEGORIES, LANGUAGES, SEALS, reputationScore } from "../src/modules/creators/reputation.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `ca${Date.now().toString(36)}${n++}@test.local`;
const handleFor = () => `cr${Date.now().toString(36)}${n++}`;

describe("creadores: identidad, reputación y apelaciones", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, moderator: string;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });

  const account = async (o: { role?: string } = {}) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Creador Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (o.role) {
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, o.role]);
      token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token;
    }
    return { token, id: reg.data.user.id as string, email };
  };

  /** Crea una cuenta y la registra como creador con el endpoint real de onboarding. */
  const creator = async () => {
    const u = await account();
    const handle = handleFor();
    const profile = json(await call("POST", "/creators/onboarding", { token: u.token, payload: { handle, display_name: `Creador ${handle}` } })).data;
    return { ...u, handle, profile };
  };

  const publish = (token: string, title: string) =>
    call("POST", "/creators/videos", {
      token,
      payload: {
        title,
        description: "Contenido de prueba para la suite de apelaciones",
        video_url: "https://cdn.example.com/video.mp4",
        duration_seconds: 30,
        file_size_bytes: 1_500_000,
        aspect_ratio: "9:16",
        category: "playas",
      },
    });

  const moderate = (token: string, id: string, action: "approve" | "reject" | "remove", reason?: string) =>
    call("POST", `/admin/moderation/creator_video/${id}/${action}`, { token, payload: reason ? { reason } : {} });

  const appeal = (token: string, videoId: string, reason = "El contenido sí cumple las normas de la comunidad") =>
    call("POST", `/creators/videos/${videoId}/appeal`, { token, payload: { reason } });

  const video = async (id: string) => (await pool.query("SELECT * FROM creator_videos WHERE id = $1", [id])).rows[0];
  const auditActions = async (entityId: string) =>
    (await pool.query<{ action: string }>("SELECT action FROM audit_log WHERE entity_id = $1", [entityId])).rows.map((r) => r.action);

  /** Publica una pieza, la rechaza un moderador y la apela su dueño. Devuelve el id del video y la apelación. */
  const rejectedAndAppealed = async (title: string) => {
    const c = await creator();
    const v = json(await publish(c.token, title)).data as { id: string };
    const rejected = await moderate(moderator, v.id, "reject", "Contenido fuera de las normas");
    expect(rejected.statusCode, rejected.body).toBe(200);
    const ap = json(await appeal(c.token, v.id)).data as { id: string };
    return { c, videoId: v.id, appealId: ap.id };
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account({ role: "admin" })).token;
    moderator = (await account({ role: "moderator" })).token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("catálogo de reputación (función pura)", () => {
    it("publica al menos cinco sellos con criterios y calcula 0-100 con desglose", () => {
      expect(SEALS.length).toBeGreaterThanOrEqual(5);
      for (const s of SEALS) {
        expect(s.key).toMatch(/^[a-z][a-z0-9_]+$/);
        expect(s.label.length).toBeGreaterThan(3);
        expect(s.purpose.length).toBeGreaterThan(10);
        expect(s.criteria.length).toBeGreaterThan(30);
      }
      expect(CATEGORIES).toContain("playas");
      expect(LANGUAGES).toEqual(["es", "en", "fr", "de", "pt", "it"]);

      const empty = reputationScore({ sealKeys: [] }, {});
      expect(empty.score).toBe(10); // sin incidencias el cumplimiento parte con sus 10 puntos
      expect(empty.breakdown.reduce((s, c) => s + c.max, 0)).toBe(100);

      const full = reputationScore(
        { categories: [...CATEGORIES], languages: [...LANGUAGES], audience_verified: true, sealKeys: SEALS.map((s) => s.key) },
        { published_videos: 50, total_views: 1_000_000, total_likes: 10_000, total_shares: 10_000 },
      );
      expect(full.score).toBe(100);

      const penalized = reputationScore({ sealKeys: [] }, { rejected_videos: 4, rejected_appeals: 3, open_appeals: 2 });
      expect(penalized.score).toBe(0);
      expect(penalized.breakdown.find((c) => c.key === "compliance")!.points).toBe(0);
    });
  });

  describe("moderación de publicaciones de creador", () => {
    it("publicar deja la pieza en revisión, no aparece en el feed público y sí en la cola", async () => {
      const c = await creator();
      const created = await publish(c.token, "Atardecer en Samaná");
      expect(created.statusCode, created.body).toBe(201);
      const v = json(created).data as { id: string; status: string };
      expect(v.status).toBe("pending_review");
      expect((await video(v.id)).status).toBe("pending_review");

      const feed = json(await call("GET", "/creators/feed?per_page=100")).data as { id: string }[];
      expect(feed.some((x) => x.id === v.id)).toBe(false);

      const queue = json(await call("GET", "/admin/moderation/queue?type=creator_video&per_page=100", { token: moderator })).data as { type: string; id: string; excerpt: string }[];
      expect(queue.find((x) => x.id === v.id)).toMatchObject({ type: "creator_video", excerpt: "Atardecer en Samaná" });

      // Aprobar la publica y recién entonces llega al feed público.
      expect((await moderate(moderator, v.id, "approve")).statusCode).toBe(200);
      expect((await video(v.id)).status).toBe("published");
      const after = json(await call("GET", "/creators/feed?per_page=100")).data as { id: string }[];
      expect(after.some((x) => x.id === v.id)).toBe(true);

      expect(await auditActions(v.id)).toContain("creator.video_publish");
    });

    it("rechazar y retirar exigen motivo y dejan la regla y el moderador en la pieza", async () => {
      const c = await creator();
      const v = json(await publish(c.token, "Video retirado")).data as { id: string };
      expect((await call("POST", `/admin/moderation/creator_video/${v.id}/reject`, { token: moderator, payload: {} })).statusCode).toBe(400);
      expect((await moderate(moderator, v.id, "reject", "Contenido duplicado")).statusCode).toBe(200);
      const row = await video(v.id);
      expect(row.status).toBe("rejected");
      expect(row.review_notes).toBe("Contenido duplicado");
      expect(row.moderation_rule).toBe("manual_reject");
      expect(row.moderated_at).not.toBeNull();
      expect(row.moderated_by).not.toBeNull();

      expect((await moderate(moderator, v.id, "remove", "Retirado por reclamo de derechos")).statusCode).toBe(200);
      expect((await video(v.id)).status).toBe("archived");
    });

    it("sólo el dueño apela y no se admiten dos apelaciones abiertas", async () => {
      const c = await creator(), other = await creator();
      const v = json(await publish(c.token, "Video apelable")).data as { id: string };
      await moderate(moderator, v.id, "reject", "Fuera de las normas");

      const foreign = await appeal(other.token, v.id);
      expect(foreign.statusCode, foreign.body).toBe(403);

      const mine = await appeal(c.token, v.id);
      expect(mine.statusCode, mine.body).toBe(201);
      const ap = json(mine).data;
      expect(ap).toMatchObject({ video_id: v.id, status: "pending", rule_code: "manual_reject", review_notes: "Fuera de las normas" });

      const twice = await appeal(c.token, v.id);
      expect(twice.statusCode, twice.body).toBe(422);
      expect(json(twice).error.details.code).toBe("APPEAL_ALREADY_OPEN");

      // El motivo es obligatorio y tiene un rango: fuera de él es un 400.
      expect((await appeal(c.token, v.id, "corto")).statusCode).toBe(400);
      expect((await call("POST", `/creators/videos/${randomUUID()}/appeal`, { token: c.token, payload: { reason: "No existe esta publicación" } })).statusCode).toBe(404);

      expect(await auditActions(ap.id)).toContain("creator.appeal_create");
    });

    it("el moderador rechaza la apelación con motivo y la pieza conserva su estado", async () => {
      const { appealId, videoId } = await rejectedAndAppealed("Video con apelación rechazada");
      const pending = json(await call("GET", "/admin/moderation/appeals?per_page=100", { token: moderator })).data as { id: string }[];
      expect(pending.some((x) => x.id === appealId)).toBe(true);

      const res = await call("POST", `/admin/moderation/appeals/${appealId}/resolve`, { token: moderator, payload: { status: "rejected", note: "El material sigue incumpliendo las normas" } });
      expect(res.statusCode, res.body).toBe(200);
      expect(json(res).data).toMatchObject({ video_status: "rejected" });

      const ap = (await pool.query("SELECT * FROM creator_video_appeals WHERE id = $1", [appealId])).rows[0];
      expect(ap.status).toBe("rejected");
      expect(ap.resolution_note).toBe("El material sigue incumpliendo las normas");
      expect(ap.resolved_at).not.toBeNull();
      expect(ap.resolved_by).not.toBeNull();

      const row = await video(videoId);
      expect(row.status).toBe("rejected");
      expect(row.review_notes).toContain("El material sigue incumpliendo las normas");

      // Una apelación ya resuelta no se vuelve a resolver.
      const again = await call("POST", `/admin/moderation/appeals/${appealId}/resolve`, { token: moderator, payload: { status: "accepted", note: "Cambio de criterio" } });
      expect(again.statusCode, again.body).toBe(422);
      expect(json(again).error.details.code).toBe("APPEAL_ALREADY_RESOLVED");

      expect(await auditActions(appealId)).toContain("creator.appeal_resolve");
    });

    it("el moderador acepta la apelación y la pieza vuelve a revisión", async () => {
      const { appealId, videoId } = await rejectedAndAppealed("Video con apelación aceptada");
      const res = await call("POST", `/admin/moderation/appeals/${appealId}/resolve`, { token: moderator, payload: { status: "accepted", note: "Revisado: el contenido sí cumple" } });
      expect(res.statusCode, res.body).toBe(200);
      expect(json(res).data).toMatchObject({ video_status: "pending_review" });

      const row = await video(videoId);
      expect(row.status).toBe("pending_review");
      expect(row.review_notes).toContain("Revisado: el contenido sí cumple");
      // Vuelve a la cola de moderación.
      const queue = json(await call("GET", "/admin/moderation/queue?type=creator_video&per_page=100", { token: moderator })).data as { id: string }[];
      expect(queue.some((x) => x.id === videoId)).toBe(true);
    });

    it("la cola de apelaciones no expone correo ni datos de pago", async () => {
      const { c, appealId } = await rejectedAndAppealed("Video con contexto limitado");
      const res = await call("GET", "/admin/moderation/appeals?per_page=100", { token: moderator });
      const row = (json(res).data as Record<string, unknown>[]).find((x) => x.id === appealId)!;
      expect(row).toBeTruthy();
      expect(Object.keys(row).sort()).toEqual(["created_at", "creator_handle", "creator_id", "creator_name", "id", "reason", "rule_code", "status", "video_id", "video_status", "video_title", "review_notes"].sort());
      expect(JSON.stringify(row)).not.toContain(c.email);
      expect(JSON.stringify(row)).not.toContain("payout");
    });
  });

  describe("centro de identidad y reputación", () => {
    it("devuelve catálogo de sellos con criterios, reputación, audiencia y estadísticas", async () => {
      const c = await creator();
      const res = await call("GET", "/creators/me/identity", { token: c.token });
      expect(res.statusCode, res.body).toBe(200);
      const d = json(res).data;
      expect(d.catalog.length).toBeGreaterThanOrEqual(5);
      for (const s of d.catalog) expect(s).toMatchObject({ key: expect.any(String), label: expect.any(String), purpose: expect.any(String), criteria: expect.any(String) });
      expect(d.seals).toEqual([]);
      expect(d.reputation.score).toBeGreaterThanOrEqual(0);
      expect(d.reputation.score).toBeLessThanOrEqual(100);
      expect(d.reputation.breakdown.reduce((s: number, x: { max: number }) => s + x.max, 0)).toBe(100);
      expect(d.audience).toMatchObject({ verified: false, metrics: {} });
      expect(d.profile.public_profile).toBe(true);
      expect(d.category_catalog).toEqual(CATEGORIES);
      expect(d.language_catalog).toEqual(LANGUAGES);

      // Un sello otorgado aparece con su criterio publicado y recalcula la reputación y la audiencia.
      const before = d.reputation.score;
      const awarded = await app.creators.awardSeal(c.id, "audience_verified", { source: "prueba" });
      expect(awarded.seal).toMatchObject({ seal_key: "audience_verified", label: "Audiencia verificada" });
      expect(awarded.reputation.score).toBeGreaterThan(before);
      await expect(app.creators.awardSeal(c.id, "sello-inventado")).rejects.toThrow();

      // Idempotente: otorgarlo de nuevo no duplica la fila.
      await app.creators.awardSeal(c.id, "audience_verified", { source: "prueba-2" });
      const seals = (await pool.query("SELECT * FROM creator_seals WHERE creator_id = $1", [c.id])).rows;
      expect(seals).toHaveLength(1);

      const again = json(await call("GET", "/creators/me/identity", { token: c.token })).data;
      expect(again.seals).toHaveLength(1);
      expect(again.seals[0].criteria).toBe(SEALS.find((s) => s.key === "audience_verified")!.criteria);
      expect(again.audience.verified).toBe(true);
      expect((await pool.query("SELECT audience_verified, reputation_score FROM creator_profiles WHERE id = $1", [c.id])).rows[0].audience_verified).toBe(true);
    });

    it("valida las listas blancas y public_profile=false oculta el perfil público", async () => {
      const c = await creator();

      // Antes de configurarla, la identidad pública existe y publica sellos con criterio y reputación.
      const pub = await call("GET", `/creators/profile/${c.handle}`);
      expect(pub.statusCode, pub.body).toBe(200);
      expect(json(pub).data).toMatchObject({ categories: [], languages: [], audience_verified: false });
      expect(typeof json(pub).data.reputation.score).toBe("number");

      const badCategory = await call("PATCH", "/creators/me/identity", { token: c.token, payload: { categories: ["categoria-inventada"] } });
      expect(badCategory.statusCode, badCategory.body).toBe(400);
      expect(json(badCategory).error.code).toBe("VALIDATION_ERROR");
      // Un idioma inexistente pero compatible con el esquema de la ruta (máx. 5 caracteres): así la
      // validación que se prueba es la lista blanca publicada del servicio, no el esquema del cuerpo.
      const badLanguage = await call("PATCH", "/creators/me/identity", { token: c.token, payload: { languages: ["xx"] } });
      expect(badLanguage.statusCode, badLanguage.body).toBe(400);
      expect(json(badLanguage).error.details.allowed).toEqual(LANGUAGES);

      const ok = await call("PATCH", "/creators/me/identity", { token: c.token, payload: { categories: ["playas", "gastronomia"], languages: ["es", "en"], bio: "Playas y gastronomía dominicanas" } });
      expect(ok.statusCode, ok.body).toBe(200);
      expect(json(ok).data).toMatchObject({ categories: ["playas", "gastronomia"], languages: ["es", "en"] });
      expect((await call("GET", "/creators/me/identity", { token: c.token })).statusCode).toBe(200);
      expect(json(await call("GET", `/creators/profile/${c.handle}`)).data).toMatchObject({ categories: ["playas", "gastronomia"], languages: ["es", "en"] });

      // Sin sesión no se ve la identidad privada; el perfil público sí es público.
      expect((await call("GET", "/creators/me/identity")).statusCode).toBe(401);
      expect((await call("GET", "/creators/me/appeals")).statusCode).toBe(401);

      const hidden = await call("PATCH", "/creators/me/identity", { token: c.token, payload: { public_profile: false } });
      expect(hidden.statusCode, hidden.body).toBe(200);
      expect((await call("GET", `/creators/profile/${c.handle}`)).statusCode).toBe(404);

      expect(await auditActions(c.id)).toEqual(expect.arrayContaining(["creator.register", "creator.identity_update"]));
    });

    it("lista mis apelaciones con paginación y su resolución", async () => {
      const { c, appealId } = await rejectedAndAppealed("Video listado en mis apelaciones");
      const res = await call("GET", "/creators/me/appeals?per_page=5", { token: c.token });
      expect(res.statusCode, res.body).toBe(200);
      const body = json(res);
      expect(body.meta).toMatchObject({ page: 1, per_page: 5 });
      expect(body.data.find((x: { id: string }) => x.id === appealId)).toMatchObject({ video_title: "Video listado en mis apelaciones", status: "pending" });
    });
  });
});
