/**
 * Plan #68 — Tareas por persona (integración real contra el Postgres de pruebas).
 *
 * Un bloque por perfil. Cada prueba es independiente: crea sus propias cuentas con correos únicos,
 * no depende del orden ni de datos de otras suites, y demuestra la tarea completa junto con su límite
 * (lo que ese rol NO puede hacer), con aserciones sobre códigos de estado y sobre el contenido.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/modules/operators/domain/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = (tag: string) => `tpp-${tag}-${Date.now().toString(36)}-${n++}@test.local`;
/** Fechas siempre futuras y apartadas de los fixtures (±60 días) para no chocar con otros tests. */
const day = (k: number) => addDays(todayInSantoDomingo(), 60 + k);

type Acct = { id: string; email: string; token: string };

describe("plan #68: tareas por persona", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });

  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;

  /** Registra una cuenta verificada y, si se pide, le añade un rol global (que viaja en el token: hay que volver a entrar). */
  const signup = async (tag: string, o: { role?: string } = {}): Promise<Acct> => {
    const email = uniq(tag);
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Persona TPP" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (o.role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, o.role]);
    const token = (o.role ? await login(email) : reg.data.tokens.access_token) as string;
    return { id, email, token };
  };

  /** Organización de operador verificada (para poder publicar servicios). */
  const makeOrg = async (owner: Acct, name: string) => {
    const res = await call("POST", "/orgs", { token: owner.token, payload: { business_name: `${name} ${Date.now().toString(36)}` } });
    expect(res.statusCode, res.body).toBe(201);
    const orgId = json(res).data.id as string;
    await pool.query("UPDATE partner_profiles SET verification = 'verified', website_enabled = true WHERE id = $1", [orgId]);
    return orgId;
  };

  const makeListing = async (owner: Acct, title: string, category = "experiencia") => {
    const res = await call("POST", "/org/listings", { token: owner.token, payload: { category, title, summary: "Servicio de prueba", description: "Descripción de prueba", price: 100, capacity: 10, time_slots: ["09:00"], destination: "Samaná" } });
    expect(res.statusCode, res.body).toBe(201);
    const id = json(res).data.id as string;
    const published = await call("PUT", `/org/listings/${id}/status`, { token: owner.token, payload: { status: "published" } });
    expect(published.statusCode, published.body).toBe(200);
    return id;
  };

  const bookManual = async (token: string, listing_id: string, date: string) => {
    const res = await call("POST", "/org/bookings", { token, payload: { request: { listing_id, date, time: "09:00", adults: 2 }, contact: { name: "Cliente TPP", email: uniq("cliente") } } });
    expect(res.statusCode, res.body).toBe(201);
    return json(res).data.id as string;
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Empresa: el propietario invita a una recepción y el mostrador opera con límites", () => {
    it("invita por correo, la invitación se ve antes de aceptar, otra cuenta no puede aceptarla, la invitada queda como recepción y no toca equipo ni finanzas", async () => {
      const owner = await signup("emp-owner");
      const reception = await signup("emp-recepcion");
      const stranger = await signup("emp-ajeno");

      const orgId = await makeOrg(owner, "Operador Empresa");
      const tour = await makeListing(owner, `Tour Empresa ${Date.now().toString(36)}`);
      const bookingId = await bookManual(owner.token, tour, day(1));

      const created = await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: reception.email, role: "recepcion" } });
      expect(created.statusCode).toBe(201);
      const invite = json(created).data;
      expect(invite).toMatchObject({ email: reception.email, role: "recepcion" });
      const inviteToken = invite.token as string;
      expect(typeof inviteToken).toBe("string");

      // La invitación se ve en el panel antes de aceptarla.
      const team = json(await call("GET", "/org/team", { token: owner.token })).data;
      expect((team.invitations as { email: string }[]).map((i) => i.email)).toContain(reception.email);

      // Vista previa pública: quien tiene el enlace sabe a qué equipo y con qué rol se une.
      const preview = await call("GET", `/team-invitations/${inviteToken}`);
      expect(preview.statusCode).toBe(200);
      expect(json(preview).data).toMatchObject({ email: reception.email, role: "recepcion" });
      // Aceptar exige sesión.
      expect((await call("POST", `/team-invitations/${inviteToken}/accept`)).statusCode).toBe(401);

      // Una cuenta distinta no puede aceptar la invitación de otro correo.
      const wrong = await call("POST", `/team-invitations/${inviteToken}/accept`, { token: stranger.token });
      expect(wrong.statusCode).toBe(403);
      expect(json(wrong).error.details.reason).toBe("EMAIL_MISMATCH");

      const accepted = await call("POST", `/team-invitations/${inviteToken}/accept`, { token: reception.token });
      expect(accepted.statusCode).toBe(200);
      expect(json(accepted).data).toMatchObject({ org_id: orgId, role: "recepcion" });
      // El enlace es de un solo uso.
      expect((await call("POST", `/team-invitations/${inviteToken}/accept`, { token: reception.token })).statusCode).toBe(404);

      // Queda como miembro de la organización con el rol pedido.
      expect(json(await call("GET", "/orgs/me", { token: reception.token })).data).toMatchObject({ role: "recepcion" });
      const members = json(await call("GET", "/org/team", { token: owner.token })).data.members as { user_id: string; role: string }[];
      expect(members.map((m) => [m.user_id, m.role])).toContainEqual([reception.id, "recepcion"]);

      // Tarea: ve las reservas y la agenda de su organización, y puede registrar una reserva de mostrador.
      const seen = json(await call("GET", "/org/bookings?per_page=100", { token: reception.token })).data as { id: string }[];
      expect(seen.map((b) => b.id)).toContain(bookingId);
      const cal = json(await call("GET", `/org/calendar?from=${day(0)}&to=${day(5)}`, { token: reception.token })).data;
      expect((cal.bookings as { id: string }[]).map((b) => b.id)).toContain(bookingId);
      expect((await call("POST", "/org/bookings", { token: reception.token, payload: { request: { listing_id: tour, date: day(2), time: "09:00", adults: 1 }, contact: { name: "Mostrador", email: uniq("mostrador") } } })).statusCode).toBe(201);

      // Límite: ni equipo…
      expect((await call("GET", "/org/team", { token: reception.token })).statusCode).toBe(403);
      expect((await call("POST", "/org/team/invitations", { token: reception.token, payload: { email: uniq("nadie"), role: "recepcion" } })).statusCode).toBe(403);
      expect((await call("POST", "/org/team/invitations", { token: reception.token, payload: { email: uniq("nadie"), role: "guia", listing_ids: [tour] } })).statusCode).toBe(403);
      expect((await call("PATCH", `/org/team/members/${owner.id}`, { token: reception.token, payload: { role: "admin" } })).statusCode).toBe(403);
      // …ni finanzas ni el catálogo.
      expect((await call("GET", "/org/income", { token: reception.token })).statusCode).toBe(403);
      expect((await call("GET", "/org/payouts", { token: reception.token })).statusCode).toBe(403);
      expect((await call("PATCH", `/org/listings/${tour}`, { token: reception.token, payload: { price: 999 } })).statusCode).toBe(403);
      expect((await call("POST", "/org/listings", { token: reception.token, payload: { category: "experiencia", title: "Servicio ajeno" } })).statusCode).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Guía: agenda por asignación", () => {
    it("ve su agenda y sólo los servicios asignados, un guía sin asignación no ve nada y no cambia precios ni gestiona el equipo", async () => {
      const owner = await signup("guia-owner");
      const guide = await signup("guia-asignado");
      const unassigned = await signup("guia-sin-asignacion");

      const orgId = await makeOrg(owner, "Operador Guías");
      const assigned = await makeListing(owner, `Tour Asignado ${Date.now().toString(36)}`);
      const other = await makeListing(owner, `Tour No Asignado ${Date.now().toString(36)}`);
      const assignedBooking = await bookManual(owner.token, assigned, day(1));
      const otherBooking = await bookManual(owner.token, other, day(1));

      // El producto no deja invitar a un guía sin al menos un servicio asignado.
      const noScope = await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: uniq("guia-sin-ids"), role: "guia" } });
      expect(noScope.statusCode).toBe(400);

      const created = await call("POST", "/org/team/invitations", { token: owner.token, payload: { email: guide.email, role: "guia", listing_ids: [assigned] } });
      expect(created.statusCode).toBe(201);
      const inviteToken = json(created).data.token as string;
      expect((await call("POST", `/team-invitations/${inviteToken}/accept`, { token: guide.token })).statusCode).toBe(200);
      expect(json(await call("GET", "/orgs/me", { token: guide.token })).data).toMatchObject({ role: "guia", listing_ids: [assigned] });

      // Guía sin asignación: el alcance vacío no ve ninguna reserva (la API no permite crearlo, se inserta como miembro existente).
      await pool.query("INSERT INTO org_members (org_id, user_id, role, listing_ids) VALUES ($1, $2, 'guia', '{}')", [orgId, unassigned.id]);

      const seen = json(await call("GET", "/org/bookings?per_page=100", { token: guide.token })).data as { id: string; listing: { id: string } }[];
      expect(seen.map((b) => b.id)).toContain(assignedBooking);
      expect(seen.map((b) => b.id)).not.toContain(otherBooking);
      expect(seen.every((b) => b.listing.id === assigned)).toBe(true);

      const cal = json(await call("GET", `/org/calendar?from=${day(0)}&to=${day(5)}`, { token: guide.token })).data;
      const agenda = (cal.bookings as { id: string; listing: { id: string } }[]);
      expect(agenda.map((b) => b.id)).toContain(assignedBooking);
      expect(agenda.map((b) => b.id)).not.toContain(otherBooking);
      expect(agenda.every((b) => b.listing.id === assigned)).toBe(true);

      // Fuera de su alcance: 404 (no se revela la reserva ajena).
      expect((await call("GET", `/org/bookings/${otherBooking}`, { token: guide.token })).statusCode).toBe(404);

      // Sin asignación: ni reservas ni agenda.
      expect(json(await call("GET", "/org/bookings?per_page=100", { token: unassigned.token })).data).toEqual([]);
      expect((json(await call("GET", `/org/calendar?from=${day(0)}&to=${day(5)}`, { token: unassigned.token })).data.bookings as unknown[])).toEqual([]);

      // Límite: no cambia precios ni publica/pausa servicios, ni gestiona el equipo o las finanzas.
      expect((await call("PATCH", `/org/listings/${assigned}`, { token: guide.token, payload: { price: 1 } })).statusCode).toBe(403);
      expect((await call("PUT", `/org/listings/${assigned}/status`, { token: guide.token, payload: { status: "paused" } })).statusCode).toBe(403);
      expect((await call("GET", "/org/team", { token: guide.token })).statusCode).toBe(403);
      expect((await call("POST", "/org/team/invitations", { token: guide.token, payload: { email: uniq("x"), role: "recepcion" } })).statusCode).toBe(403);
      expect((await call("PATCH", `/org/team/members/${guide.id}`, { token: guide.token, payload: { role: "admin" } })).statusCode).toBe(403);
      expect((await call("GET", "/org/income", { token: guide.token })).statusCode).toBe(403);
      // Pero sí puede mover su reserva asignada a "en curso".
      expect((await call("PUT", `/org/bookings/${assignedBooking}/status`, { token: guide.token, payload: { status: "in_progress" } })).statusCode).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Creador: onboarding, envío a revisión y métricas propias", () => {
    it("completa el onboarding, somete una pieza que queda pendiente de revisión (fuera del feed) y no puede publicarla ni ver métricas de otro creador", async () => {
      const creator = await signup("creador");
      const other = await signup("creador-otro");
      const handle = `tpp${Date.now().toString(36)}${n++}`.slice(0, 30).toLowerCase();
      const piece = (title: string) => ({ title, description: "Pieza de prueba", video_url: "https://cdn.example.com/tpp-pieza.mp4", duration_seconds: 30, file_size_bytes: 1_048_576, destination_name: "Samaná", category: "naturaleza", tags: ["prueba"] });

      // Sin onboarding no hay publicación.
      expect((await call("POST", "/creators/videos", { token: creator.token, payload: piece("Sin onboarding") })).statusCode).toBe(404);

      const onboarded = await call("POST", "/creators/onboarding", { token: creator.token, payload: { handle, display_name: "Creador TPP" } });
      expect(onboarded.statusCode).toBe(201);
      expect(json(onboarded).data).toMatchObject({ handle, status: "active", tier: "emerging" });
      // Un mismo usuario no se registra dos veces.
      expect((await call("POST", "/creators/onboarding", { token: creator.token, payload: { handle: `${handle}x`, display_name: "Duplicado" } })).statusCode).toBe(400);

      const submitted = await call("POST", "/creators/videos", { token: creator.token, payload: piece(`Pieza TPP ${Date.now().toString(36)}`) });
      expect(submitted.statusCode).toBe(201);
      const video = json(submitted).data;
      expect(video.status).toBe("pending_review");
      expect(video.creator_id).toBe(creator.id);
      expect(video.slug).toBeTruthy();

      // Lo pendiente de revisión no es público.
      const feed = json(await call("GET", "/creators/feed?per_page=100")).data as { id: string }[];
      expect(feed.map((v) => v.id)).not.toContain(video.id);
      expect((await call("GET", `/creators/profile/${handle}`)).statusCode).toBe(200);

      // Límite: no puede aprobar/publicar su propia pieza ni usar herramientas editoriales o de pagos.
      expect((await call("POST", `/admin/moderation/creator_video/${video.id}/approve`, { token: creator.token })).statusCode).toBe(403);
      expect((await call("GET", "/admin/caves", { token: creator.token })).statusCode).toBe(403);
      expect((await call("POST", `/admin/creators/${randomUUID()}/payout`, { token: creator.token, payload: { amount: 500, payout_source: "tip", bank_reference: "TPP-1" } })).statusCode).toBe(403);

      // Tarea: su panel trae su pieza y sus métricas…
      const mine = json(await call("GET", "/creators/me", { token: creator.token })).data;
      expect(mine.profile.id).toBe(creator.id);
      expect((mine.videos as { id: string }[]).map((v) => v.id)).toContain(video.id);

      // …y no las de otro creador.
      expect((await call("POST", "/creators/onboarding", { token: other.token, payload: { handle: `${handle}b`, display_name: "Otro Creador" } })).statusCode).toBe(201);
      const theirs = json(await call("GET", "/creators/me", { token: other.token })).data;
      expect(theirs.profile.id).toBe(other.id);
      expect(theirs.videos).toEqual([]);
      expect((theirs.videos as { id: string }[]).map((v) => v.id)).not.toContain(video.id);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Editor: borradores y envío a revisión, sin poder publicar", () => {
    it("crea y edita un borrador, lo envía a revisión y recibe 403 al publicar o al tocar cuentas y pagos", async () => {
      const editor = await signup("editor", { role: "editor" });

      const created = await call("POST", "/admin/caves", { token: editor.token, payload: { name: `Cueva TPP ${Date.now().toString(36)}`, short_description: "Borrador del editor" } });
      expect(created.statusCode).toBe(201);
      const row = json(created).data;
      expect(row).toMatchObject({ status: "draft", version: 1, created_by: editor.id });
      // Un borrador no es público.
      expect((await call("GET", `/caves/${row.slug}`)).statusCode).toBe(404);

      const edited = await call("PATCH", `/admin/caves/${row.id}`, { token: editor.token, payload: { version: 1, short_description: "Editado por el editor" } });
      expect(edited.statusCode).toBe(200);
      expect(json(edited).data).toMatchObject({ version: 2, status: "draft", short_description: "Editado por el editor" });

      const review = await call("POST", `/admin/caves/${row.id}/submit-review`, { token: editor.token });
      expect(review.statusCode).toBe(200);
      expect(json(review).data.status).toBe("in_review");
      // Sigue sin ser público mientras espera al admin.
      expect((await call("GET", `/caves/${row.slug}`)).statusCode).toBe(404);

      // Límite: publicar, despublicar y archivar son de un administrador.
      expect((await call("POST", `/admin/caves/${row.id}/publish`, { token: editor.token })).statusCode).toBe(403);
      expect((await call("POST", `/admin/caves/${row.id}/unpublish`, { token: editor.token })).statusCode).toBe(403);
      expect((await call("POST", `/admin/caves/${row.id}/archive`, { token: editor.token })).statusCode).toBe(403);

      // Límite: cuentas, suspensión, 2FA y pagos.
      expect((await call("GET", "/admin/users", { token: editor.token })).statusCode).toBe(403);
      expect((await call("PUT", `/admin/users/${editor.id}/roles`, { token: editor.token, payload: { roles: ["admin"] } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/users/${editor.id}/suspend`, { token: editor.token, payload: { reason: "Intento del editor" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/users/${editor.id}/2fa/reset`, { token: editor.token, payload: { reason: "Intento del editor" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/creators/${randomUUID()}/payout`, { token: editor.token, payload: { amount: 500, payout_source: "tip", bank_reference: "TPP-ED" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/moderation/creator_video/${randomUUID()}/approve`, { token: editor.token })).statusCode).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Moderador: cola, reportes y límites administrativos", () => {
    it("ve la cola con contexto limitado, resuelve un reporte con motivo obligatorio y no administra cuentas ni configuración", async () => {
      const moderator = await signup("moderador", { role: "moderator" });
      const author = await signup("mod-autor");
      const reporter = await signup("mod-reportante");

      const post = await call("POST", "/social/posts", { token: author.token, payload: { content: `Publicación TPP ${Date.now().toString(36)}` } });
      expect(post.statusCode).toBe(201);
      const postId = json(post).data.id as string;
      expect((await call("POST", "/ugc/reports", { token: reporter.token, payload: { target_type: "post", target_id: postId, reason: "spam", detail: "Reporte de prueba TPP" } })).statusCode).toBe(204);

      // El reporte es visible para quien modera, con extracto acotado (no el contenido completo).
      const reports = json(await call("GET", "/admin/moderation/reports?status=pendiente&per_page=100", { token: moderator.token })).data as { id: string; target_id: string; reason: string; excerpt: string | null }[];
      const mine = reports.find((r) => r.target_id === postId);
      expect(mine).toBeTruthy();
      expect(mine!.reason).toBe("spam");
      const reportId = mine!.id;
      expect((mine!.excerpt ?? "").length).toBeLessThanOrEqual(300);

      // La cola unificada lo incluye con el contexto limitado del reporte.
      const queue = json(await call("GET", "/admin/moderation/queue?type=report&per_page=100", { token: moderator.token })).data as { id: string; type: string; excerpt: string | null; reports: number; auto_flags: string[] }[];
      const queued = queue.find((x) => x.id === reportId);
      expect(queued).toMatchObject({ type: "report", excerpt: "post: spam", auto_flags: [] });
      expect(queue.every((x) => (x.excerpt ?? "").length <= 300)).toBe(true);

      // Resolver exige motivo: sin él, 400.
      expect((await call("POST", `/admin/moderation/report/${reportId}/reject`, { token: moderator.token })).statusCode).toBe(400);
      const resolved = await call("POST", `/admin/moderation/report/${reportId}/reject`, { token: moderator.token, payload: { reason: "Spam confirmado por moderación" } });
      expect(resolved.statusCode).toBe(200);
      expect(json(resolved).data).toMatchObject({ type: "report", id: reportId, action: "reject", notified: true });
      expect((await pool.query("SELECT status FROM ugc_reports WHERE id = $1", [reportId])).rows[0].status).toBe("ignorado");
      // La decisión queda auditada con su actor.
      expect((await pool.query("SELECT actor_id FROM audit_log WHERE action = 'moderation.reject' AND entity_id = $1", [reportId])).rows[0].actor_id).toBe(moderator.id);

      // Tarea de moderación real: aprobar una pieza de creador la publica en el feed.
      const creator = await signup("mod-creador");
      expect((await call("POST", "/creators/onboarding", { token: creator.token, payload: { handle: `mod${Date.now().toString(36)}${n++}`.slice(0, 30).toLowerCase(), display_name: "Creador Moderado" } })).statusCode).toBe(201);
      const piece = await call("POST", "/creators/videos", { token: creator.token, payload: { title: `Video TPP ${n}`, video_url: "https://cdn.example.com/mod.mp4", duration_seconds: 20, file_size_bytes: 2048 } });
      expect(piece.statusCode).toBe(201);
      const videoId = json(piece).data.id as string;
      const videoQueue = json(await call("GET", "/admin/moderation/queue?type=creator_video&per_page=100", { token: moderator.token })).data as { id: string; type: string }[];
      expect(videoQueue.find((x) => x.id === videoId)).toMatchObject({ type: "creator_video" });
      expect((await call("POST", `/admin/moderation/creator_video/${videoId}/remove`, { token: moderator.token })).statusCode).toBe(400); // sin motivo
      expect((await call("POST", `/admin/moderation/creator_video/${videoId}/approve`, { token: moderator.token })).statusCode).toBe(200);
      expect((json(await call("GET", "/creators/feed?per_page=100")).data as { id: string }[]).map((v) => v.id)).toContain(videoId);

      // Límite: no administra cuentas, ni configuración, ni reglas de administrador.
      expect((await call("GET", "/admin/users", { token: moderator.token })).statusCode).toBe(403);
      expect((await call("PUT", `/admin/users/${author.id}/roles`, { token: moderator.token, payload: { roles: ["admin"] } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/users/${author.id}/suspend`, { token: moderator.token, payload: { reason: "Intento del moderador" } })).statusCode).toBe(403);
      expect((await call("GET", "/admin/settings", { token: moderator.token })).statusCode).toBe(403);
      expect((await call("POST", "/admin/moderation/rules/test", { token: moderator.token, payload: { text: "hola" } })).statusCode).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("Admin: roles, salvaguardas y control dual", () => {
    it("cambia el rol de otra cuenta dejando rastro, no puede cambiarse sus roles ni suspenderse, y no suspende a otro admin", async () => {
      const admin = await signup("admin-uno", { role: "admin" });
      const target = await signup("admin-objetivo");
      const otherAdmin = await signup("admin-dos", { role: "admin" });
      const victim = await signup("admin-victima");

      const changed = await call("PUT", `/admin/users/${target.id}/roles`, { token: admin.token, payload: { roles: ["editor"] } });
      expect(changed.statusCode).toBe(200);
      expect(json(changed).data.roles).toEqual(["editor"]);

      // El cambio cierra las sesiones y el rol nuevo aplica al volver a entrar.
      expect((await call("GET", "/admin/caves", { token: target.token })).statusCode).toBe(401);
      const targetToken = await login(target.email);
      expect((await call("GET", "/admin/caves", { token: targetToken })).statusCode).toBe(200);
      expect((await call("GET", "/admin/users", { token: targetToken })).statusCode).toBe(403);

      // Rastro en la auditoría: actor, antes y después.
      const trail = json(await call("GET", `/admin/audit?action=user.roles_changed&entity_id=${target.id}`, { token: admin.token })).data as { actor_id: string; meta: { before: string[]; after: string[] } }[];
      expect(trail[0]).toMatchObject({ actor_id: admin.id, meta: { before: ["user"], after: ["editor"] } });

      // Salvaguardas: no puede quitarse a sí mismo el rol (sería el último si fuera el único) ni autosuspenderse.
      expect((await call("PUT", `/admin/users/${admin.id}/roles`, { token: admin.token, payload: { roles: ["user"] } })).statusCode).toBe(403);
      expect(json(await call("PUT", `/admin/users/${admin.id}/roles`, { token: admin.token, payload: { roles: ["user"] } })).error.message).toContain("tus propios roles");
      expect((await call("POST", `/admin/users/${admin.id}/suspend`, { token: admin.token, payload: { reason: "Autosuspensión de prueba" } })).statusCode).toBe(403);
      // Tampoco puede suspender a otra cuenta administradora sin quitarle antes el rol.
      expect((await call("POST", `/admin/users/${otherAdmin.id}/suspend`, { token: admin.token, payload: { reason: "Suspensión de un admin" } })).statusCode).toBe(403);
      // Y sí suspende a una cuenta sin privilegios.
      expect((await call("POST", `/admin/users/${victim.id}/suspend`, { token: admin.token, payload: { reason: "Suspensión legítima TPP" } })).statusCode).toBe(204);
      expect((await pool.query("SELECT suspended_by FROM user_suspensions WHERE user_id = $1", [victim.id])).rows[0].suspended_by).toBe(admin.id);
    });

    it("control dual: dos administradores ejecutan operaciones distintas y ambas quedan firmadas en la bitácora", async () => {
      const adminA = await signup("dual-a", { role: "admin" });
      const adminB = await signup("dual-b", { role: "admin" });
      const victimA = await signup("dual-victima-a");
      const victimB = await signup("dual-victima-b");
      await pool.query("UPDATE users SET totp_enabled_at = now(), totp_secret_enc = 'x', totp_recovery_hashes = ARRAY['h'] WHERE id = $1", [victimB.id]);

      // Dos operaciones sensibles distintas, cada una por un actor distinto.
      expect((await call("POST", `/admin/users/${victimA.id}/suspend`, { token: adminA.token, payload: { reason: "Suspensión acordada A" } })).statusCode).toBe(204);
      expect((await call("POST", `/admin/users/${victimB.id}/2fa/reset`, { token: adminB.token, payload: { reason: "Restablecimiento acordado B" } })).statusCode).toBe(204);

      // Cada operación queda atribuida a su actor y es legible por el otro administrador (traza compartida).
      const susp = json(await call("GET", `/admin/audit?action=user.suspended&entity_id=${victimA.id}`, { token: adminB.token })).data as { actor_id: string; meta: { reason: string } }[];
      expect(susp[0]).toMatchObject({ actor_id: adminA.id, meta: { reason: "Suspensión acordada A" } });
      const tfa = json(await call("GET", `/admin/audit?action=user.2fa_reset&entity_id=${victimB.id}`, { token: adminA.token })).data as { actor_id: string; meta: { reason: string } }[];
      expect(tfa[0]).toMatchObject({ actor_id: adminB.id, meta: { reason: "Restablecimiento acordado B" } });
      expect(adminA.id).not.toBe(adminB.id);
      expect(json(await call("GET", `/admin/audit?action=user.suspended&entity_id=${victimA.id}`, { token: adminA.token })).data[0].actor_id).toBe(adminA.id);
      // Ambas operaciones viven en la misma bitácora: cada administrador lee la del otro.
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action IN ('user.suspended','user.2fa_reset') AND entity_id = ANY($1)", [[victimA.id, victimB.id]])).rows[0].n).toBe(2);
    });
  });
});
