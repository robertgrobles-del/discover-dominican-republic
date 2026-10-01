import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import pg from "pg";
import webpush from "web-push";
import type { Env } from "../../config/env.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { CHANNELS, insertNotification, NOTIFICATION_TYPES, type CreatedNotification, type NotificationInput } from "./insert.js";
import type { ProfileAdminPort } from "../../contracts/profile.js";

const TICKET_TTL_SECONDS = 60;
const MAX_STREAMS_PER_USER = 5;
const MAX_BROADCAST = 100_000;

export interface PushSub { id: string; endpoint: string; p256dh: string; auth: string }
export interface PushSender { readonly enabled: boolean; send(sub: PushSub, payload: string): Promise<"ok" | "gone" | "error"> }

/** Web Push estándar (VAPID). Sin claves configuradas no hace nada. */
export class WebPushSender implements PushSender {
  readonly enabled: boolean;
  constructor(env: Pick<Env, "VAPID_PUBLIC_KEY" | "VAPID_PRIVATE_KEY" | "VAPID_SUBJECT">) {
    this.enabled = !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
    if (this.enabled) webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
  }
  async send(sub: PushSub, payload: string) {
    try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 3600, timeout: 5000 }); return "ok" as const; }
    catch (e) { const s = (e as { statusCode?: number }).statusCode; return s === 404 || s === 410 ? "gone" as const : "error" as const; }
  }
}

export interface Segment { roles?: string[]; locales?: string[]; min_level?: number; marketing_opt_in?: boolean }
type Listener = (n: CreatedNotification) => void;

/**
 * Centro de notificaciones (docs §5.13): bandeja, tiempo real por SSE (entre instancias mediante LISTEN/NOTIFY de PostgreSQL),
 * Web Push y difusiones segmentadas del equipo. La bandeja respeta las preferencias de cada persona.
 */
export class NotificationService {
  pushSender: PushSender;
  private readonly listeners = new Map<string, Set<Listener>>();
  private listener: pg.Client | null = null;
  private connecting = false;
  private closed = false;
  private retry: NodeJS.Timeout | null = null;

  constructor(private readonly db: Db, private readonly env: Env, private readonly log: FastifyBaseLogger, private readonly profiles: Pick<ProfileAdminPort, "saveNotificationPrefs">, pushSender?: PushSender) {
    this.pushSender = pushSender ?? new WebPushSender(env);
  }

  // ---------- Crear ----------
  /** Notifica a una persona: bandeja (según sus preferencias) y push (si lo activó y tiene dispositivos). Nunca lanza: una notificación fallida no debe romper la acción que la originó. */
  async notify(userId: string | null | undefined, n: NotificationInput): Promise<void> {
    if (!userId) return;
    try {
      const row = await insertNotification(this.db, userId, n);
      if (row) void this.push(userId, n, row.id);
    } catch (err) { this.log.warn({ err, userId, type: n.type }, "No se pudo crear la notificación"); }
  }

  private async push(userId: string, n: NotificationInput, id: string) {
    if (!this.pushSender.enabled) return;
    try {
      const pref = (await this.db.query<{ on: boolean | null }>("SELECT (notification_prefs -> 'push' ->> $2)::boolean AS on FROM profiles WHERE id = $1", [userId, n.type])).rows[0]?.on;
      if (pref === false || (pref === null || pref === undefined) && n.type === "promo") return;
      const subs = (await this.db.query<PushSub>("SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1 AND failures < 5", [userId])).rows;
      const payload = JSON.stringify({ id, title: n.title, body: n.message ?? "", link: n.link ?? null, type: n.type });
      await Promise.all(subs.map(async (s) => {
        const res = await this.pushSender.send(s, payload);
        if (res === "gone") await this.db.query("DELETE FROM push_subscriptions WHERE id = $1", [s.id]);
        else if (res === "ok") await this.db.query("UPDATE push_subscriptions SET last_success_at = now(), failures = 0 WHERE id = $1", [s.id]);
        else await this.db.query("UPDATE push_subscriptions SET failures = failures + 1 WHERE id = $1", [s.id]);
      }));
    } catch (err) { this.log.warn({ err, userId }, "No se pudo enviar el push"); }
  }

  // ---------- Preferencias ----------
  async preferences(userId: string) {
    const saved = ((await this.db.query("SELECT notification_prefs FROM profiles WHERE id = $1", [userId])).rows[0]?.notification_prefs ?? {}) as Record<string, Record<string, boolean>>;
    // Lo no guardado se toma como activado, salvo las promociones (requieren aceptación expresa).
    return Object.fromEntries(CHANNELS.map((c) => [c, Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t, saved[c]?.[t] ?? (t !== "promo")]))]));
  }
  async setPreferences(userId: string, changes: Partial<Record<(typeof CHANNELS)[number], Partial<Record<(typeof NOTIFICATION_TYPES)[number], boolean>>>>) {
    const cur = ((await this.db.query("SELECT notification_prefs FROM profiles WHERE id = $1", [userId])).rows[0]?.notification_prefs ?? {}) as Record<string, Record<string, boolean>>;
    for (const [c, types] of Object.entries(changes)) cur[c] = { ...(cur[c] ?? {}), ...types };
    await this.profiles.saveNotificationPrefs(userId, cur);
    return this.preferences(userId);
  }

  // ---------- Push: dispositivos ----------
  async addPush(userId: string, s: { endpoint: string; keys: { p256dh: string; auth: string }; user_agent?: string }) {
    if (!this.pushSender.enabled) throw new AppError("SERVICE_UNAVAILABLE", "Las notificaciones push no están habilitadas", { code: "PUSH_DISABLED" });
    if (!/^https:\/\//.test(s.endpoint)) throw AppError.validation("El endpoint debe ser https", { field: "endpoint" });
    if ((await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM push_subscriptions WHERE user_id = $1", [userId])).rows[0]!.n >= 10) throw new AppError("BUSINESS_RULE", "Máximo 10 dispositivos", { code: "PUSH_LIMIT" });
    // El mismo dispositivo (endpoint) pasa a la cuenta que lo registra: si alguien más inicia sesión en ese navegador, deja de recibir lo de la cuenta anterior.
    const row = (await this.db.query<{ id: string }>(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, user_agent = EXCLUDED.user_agent, failures = 0 RETURNING id`,
      [userId, s.endpoint, s.keys.p256dh, s.keys.auth, s.user_agent?.slice(0, 200) ?? null],
    )).rows[0]!;
    return { id: row.id };
  }
  async listPush(userId: string) { return (await this.db.query("SELECT id, user_agent, last_success_at, created_at FROM push_subscriptions WHERE user_id = $1 ORDER BY created_at DESC", [userId])).rows; }
  async removePush(userId: string, id: string) {
    if (!(await this.db.query("DELETE FROM push_subscriptions WHERE id = $1 AND user_id = $2", [id, userId])).rowCount) throw AppError.notFound("Dispositivo");
  }

  // ---------- Tiempo real (SSE) ----------
  /** Un EventSource del navegador no puede enviar el encabezado Authorization: se canjea la sesión por un ticket de un solo minuto. */
  createTicket(userId: string) {
    const exp = Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS;
    const body = Buffer.from(`${userId}.${exp}`).toString("base64url");
    const sig = createHmac("sha256", this.env.APP_SECRET!).update(`stream:${body}`).digest("base64url");
    return { ticket: `${body}.${sig}`, expires_in: TICKET_TTL_SECONDS };
  }
  verifyTicket(ticket: string): string | null {
    const [body, sig] = ticket.split(".");
    if (!body || !sig) return null;
    const good = Buffer.from(createHmac("sha256", this.env.APP_SECRET!).update(`stream:${body}`).digest("base64url")), got = Buffer.from(sig);
    if (good.length !== got.length || !timingSafeEqual(good, got)) return null;
    const [userId, exp] = Buffer.from(body, "base64url").toString().split(".");
    return userId && Number(exp) > Date.now() / 1000 ? userId : null;
  }

  /** Registra una conexión abierta. Devuelve la función para cerrarla. Cada persona tiene como máximo 5 a la vez (se cierra la más antigua). */
  subscribe(userId: string, fn: Listener, onEvict: () => void): () => void {
    const set = this.listeners.get(userId) ?? new Set<Listener & { evict?: () => void }>();
    const wrapped = Object.assign((n: CreatedNotification) => fn(n), { evict: onEvict });
    if (set.size >= MAX_STREAMS_PER_USER) { const oldest = set.values().next().value as (Listener & { evict?: () => void }) | undefined; if (oldest) { set.delete(oldest); oldest.evict?.(); } }
    set.add(wrapped);
    this.listeners.set(userId, set);
    return () => { set.delete(wrapped); if (!set.size) this.listeners.delete(userId); };
  }
  get connections() { return [...this.listeners.values()].reduce((s, x) => s + x.size, 0); }

  /** Espera a que la conexión de avisos esté escuchando (si la base no responde, sigue sin bloquear: se reintenta en segundo plano). */
  async ensureListening() {
    if (this.listener || this.connecting || this.closed) return;
    this.connecting = true;
    const client = new pg.Client({ connectionString: this.env.DATABASE_URL });
    try {
      await client.connect();
      client.on("notification", (m) => {
        if (m.channel !== "notif" || !m.payload) return;
        try { const n = JSON.parse(m.payload) as CreatedNotification; for (const fn of this.listeners.get(n.user_id) ?? []) fn(n); } catch { /* aviso mal formado: se ignora */ }
      });
      client.on("error", (err) => { this.log.warn({ err }, "Se perdió la conexión de avisos; se reintentará"); this.drop(client); });
      client.on("end", () => this.drop(client));
      await client.query("LISTEN notif");
      this.listener = client;
    } catch (err) {
      this.log.warn({ err }, "No se pudo abrir la conexión de avisos");
      await client.end().catch(() => undefined);
      this.scheduleRetry();
    } finally { this.connecting = false; }
  }
  private drop(client: pg.Client) {
    if (this.listener !== client) return;
    this.listener = null;
    client.removeAllListeners();
    client.end().catch(() => undefined);
    if (!this.closed && this.listeners.size) this.scheduleRetry();
  }
  private scheduleRetry() { if (this.retry || this.closed) return; this.retry = setTimeout(() => { this.retry = null; void this.ensureListening(); }, 5000); this.retry.unref(); }

  /** Cierra todos los flujos abiertos (antes de apagar el servidor: una conexión SSE nunca termina sola). */
  closeStreams() {
    for (const set of this.listeners.values()) for (const l of [...set] as (Listener & { evict?: () => void })[]) l.evict?.();
    this.listeners.clear();
  }

  async close() {
    this.closed = true;
    this.closeStreams();
    if (this.retry) clearTimeout(this.retry);
    this.listeners.clear();
    const l = this.listener;
    this.listener = null;
    if (l) { l.removeAllListeners(); await l.end().catch(() => undefined); }
  }

  // ---------- Difusión ----------
  private segmentWhere(seg: Segment, params: unknown[]) {
    const w = ["u.status = 'active'"];
    const bind = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (seg.roles?.length) w.push(`EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role::text = ANY(${bind(seg.roles)}::text[]))`);
    if (seg.locales?.length) w.push(`u.locale = ANY(${bind(seg.locales)}::text[])`);
    if (seg.min_level) w.push(`coalesce((SELECT current_level FROM user_gamification g WHERE g.user_id = u.id), 1) >= ${bind(seg.min_level)}`);
    if (seg.marketing_opt_in !== undefined) w.push(`coalesce(u.marketing_opt_in, false) = ${bind(seg.marketing_opt_in)}`);
    return w.join(" AND ");
  }

  /** Cuántas personas alcanza el segmento (la difusión real respeta además las preferencias de cada una). */
  async audience(seg: Segment) {
    const params: unknown[] = [];
    return (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM users u WHERE ${this.segmentWhere(seg, params)}`, params)).rows[0]!.n;
  }

  async broadcast(adminId: string, input: NotificationInput & { segment: Segment }) {
    const size = await this.audience(input.segment);
    if (size > MAX_BROADCAST) throw new AppError("BUSINESS_RULE", `El segmento tiene ${size} personas; el máximo por difusión es ${MAX_BROADCAST}`, { code: "SEGMENT_TOO_LARGE", size });
    const params: unknown[] = [input.title.slice(0, 200), input.message?.slice(0, 1000) ?? null, input.type, input.link ?? null];
    const where = this.segmentWhere(input.segment, params);
    // Un solo INSERT ... SELECT: respeta las preferencias en la propia consulta y avisa (NOTIFY) a las conexiones abiertas al confirmar.
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const ins = await c.query<CreatedNotification>(
        `INSERT INTO notifications (user_id, title, message, type, link)
         SELECT u.id, $1, $2, $3, $4 FROM users u LEFT JOIN profiles p ON p.id = u.id
          WHERE ${where} AND coalesce((p.notification_prefs -> 'in_app' ->> $3)::boolean, $3 <> 'promo')
         RETURNING id, user_id, type, title, message, link, created_at`, params,
      );
      for (const row of ins.rows) await c.query("SELECT pg_notify('notif', $1)", [JSON.stringify({ ...row, message: row.message?.slice(0, 500) ?? null })]);
      const b = (await c.query<{ id: string }>("INSERT INTO notification_broadcasts (title, message, link, type, segment, recipients, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id", [input.title, input.message ?? null, input.link ?? null, input.type, JSON.stringify(input.segment), ins.rowCount ?? 0, adminId])).rows[0]!;
      await c.query("COMMIT");
      if (this.pushSender.enabled) for (const row of ins.rows.slice(0, 5000)) void this.push(row.user_id, input, row.id);
      return { id: b.id, audience: size, delivered: ins.rowCount ?? 0, skipped_by_preferences: size - (ins.rowCount ?? 0) };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  /** Marca una notificación propia como leída o no; false si no existe o no es de esa persona. */
  async markRead(userId: string, id: string, isRead: boolean) {
    return !!(await this.db.query("UPDATE notifications SET is_read = $3 WHERE id = $1 AND user_id = $2", [id, userId, isRead])).rowCount;
  }
  async markAllRead(userId: string) {
    await this.db.query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND NOT is_read", [userId]);
  }

  async broadcasts() { return (await this.db.query("SELECT id, title, message, link, type, segment, recipients, created_at FROM notification_broadcasts ORDER BY created_at DESC LIMIT 100")).rows; }
}
