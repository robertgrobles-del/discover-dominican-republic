import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { FastifyBaseLogger } from "fastify";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { traceHeaders } from "../../lib/http.js";
import { addDays, isIsoDate } from "./domain/dates.js";

export type Fetcher = (url: string) => Promise<string>;
const MAX_BYTES = 1_000_000;
const MAX_EVENTS = 2000;

/** True si la IP es de una red privada, loopback, enlace local o reservada (no debe consultarse desde el servidor). */
export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const l = ip.toLowerCase();
    if (l === "::1" || l === "::" || l.startsWith("fe80") || l.startsWith("fc") || l.startsWith("fd")) return true;
    const m = l.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return m ? isPrivateIp(m[1]!) : false;
  }
  const [a, b] = ip.split(".").map(Number) as [number, number];
  return a === 10 || a === 127 || a === 0 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

/** Evita SSRF: sólo https hacia hosts públicos (se resuelve el DNS y se revisan todas las direcciones). */
export async function assertPublicUrl(raw: string) {
  let u: URL;
  try { u = new URL(raw); } catch { throw AppError.validation("La URL del calendario no es válida"); }
  if (u.protocol !== "https:") throw AppError.validation("El calendario debe usar https");
  if (u.username || u.password) throw AppError.validation("La URL no puede incluir credenciales");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw AppError.validation("Esa dirección no está permitida");
  const addrs = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => { throw AppError.validation("No se pudo resolver el dominio del calendario"); })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateIp)) throw AppError.validation("Esa dirección no está permitida");
}

const defaultFetcher: Fetcher = async (url) => {
  await assertPublicUrl(url);
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: traceHeaders({ accept: "text/calendar" }) });
  if (!res.ok) throw new Error(`El calendario respondió ${res.status}`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error("El calendario es demasiado grande");
  return text;
};

const ymd = (v: string) => { const m = v.match(/(\d{4})(\d{2})(\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };

/** Lee los eventos de un .ics: cada VEVENT con DTSTART y DTEND (exclusivo) → noches bloqueadas [from, to]. */
export function parseIcs(text: string): { from: string; to: string; reason: string }[] {
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const out: { from: string; to: string; reason: string }[] = [];
  let ev: { s?: string; e?: string; summary?: string; cancelled?: boolean } | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") ev = {};
    else if (line === "END:VEVENT") {
      if (ev?.s && !ev.cancelled) {
        const to = ev.e && ev.e > ev.s ? addDays(ev.e, -1) : ev.s;
        if (isIsoDate(ev.s) && isIsoDate(to)) out.push({ from: ev.s, to, reason: (ev.summary ?? "Calendario externo").slice(0, 120) });
      }
      ev = null;
      if (out.length >= MAX_EVENTS) break;
    } else if (ev) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const name = line.slice(0, i).split(";")[0]!.toUpperCase(), val = line.slice(i + 1);
      if (name === "DTSTART") ev.s = ymd(val) ?? undefined;
      else if (name === "DTEND") ev.e = ymd(val) ?? undefined;
      else if (name === "SUMMARY") ev.summary = val.replace(/\\,/g, ",");
      else if (name === "STATUS" && val.toUpperCase() === "CANCELLED") ev.cancelled = true;
    }
  }
  return out;
}

/** Calendarios iCal de las habitaciones: exportación pública por token e importación de calendarios externos (Airbnb, Booking…). */
export class IcalService {
  constructor(private readonly db: Db, private readonly log: FastifyBaseLogger, public fetcher?: Fetcher) {}

  private async roomOf(orgId: string, roomId: string) {
    const { rows } = await this.db.query<{ name: string; ical_token: string }>("SELECT r.name, r.ical_token FROM operator_rooms r JOIN operator_listings l ON l.id = r.listing_id WHERE r.id = $1 AND l.org_id = $2", [roomId, orgId]);
    if (!rows[0]) throw AppError.notFound("Habitación");
    return rows[0];
  }

  /** Feed para que otras plataformas bloqueen nuestras fechas. No incluye datos personales ni los bloqueos importados (evita bucles). */
  async exportFeed(token: string): Promise<string> {
    const room = (await this.db.query<{ id: string; name: string }>("SELECT id, name FROM operator_rooms WHERE ical_token = $1", [token])).rows[0];
    if (!room) throw AppError.notFound("Calendario");
    const bk = await this.db.query<{ id: string; date: string; check_out: string }>("SELECT id, date::text AS date, check_out::text AS check_out FROM bookings WHERE room_id = $1 AND status <> 'cancelled' AND check_out >= current_date - 30", [room.id]);
    const bl = await this.db.query<{ id: string; f: string; t: string }>("SELECT id, from_date::text AS f, to_date::text AS t FROM room_blocks WHERE room_id = $1 AND link_id IS NULL AND to_date >= current_date - 30", [room.id]);
    const d = (s: string) => s.replace(/-/g, "");
    const ev = (uid: string, s: string, e: string, summary: string) => ["BEGIN:VEVENT", `UID:${uid}@descubrerd`, `DTSTART;VALUE=DATE:${d(s)}`, `DTEND;VALUE=DATE:${d(e)}`, `SUMMARY:${summary}`, "END:VEVENT"];
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Descubre RD//Operadores//ES", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${room.name.replace(/[\r\n,;]/g, " ")}`,
      ...bk.rows.flatMap((b) => ev(b.id, b.date, b.check_out, "Reservado")), ...bl.rows.flatMap((b) => ev(b.id, b.f, addDays(b.t, 1), "Bloqueado")), "END:VCALENDAR"].join("\r\n") + "\r\n";
  }

  async feedInfo(orgId: string, roomId: string) {
    const r = await this.roomOf(orgId, roomId);
    const links = await this.db.query("SELECT id, name, url, last_synced_at, last_error FROM room_calendar_links WHERE room_id = $1 ORDER BY created_at", [roomId]);
    return { ical_token: r.ical_token, export_path: `/api/v1/ical/${r.ical_token}.ics`, links: links.rows };
  }

  async addLink(orgId: string, roomId: string, input: { name: string; url: string }) {
    await this.roomOf(orgId, roomId);
    if (!this.fetcher) await assertPublicUrl(input.url);
    const n = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM room_calendar_links WHERE room_id = $1", [roomId])).rows[0]!.n;
    if (n >= 5) throw new AppError("BUSINESS_RULE", "Máximo 5 calendarios por habitación", { code: "TOO_MANY_LINKS" });
    const { rows } = await this.db.query("INSERT INTO room_calendar_links (room_id, name, url) VALUES ($1,$2,$3) RETURNING id", [roomId, input.name.trim(), input.url]);
    return this.sync(orgId, rows[0].id);
  }

  async removeLink(orgId: string, linkId: string) {
    const r = await this.db.query("DELETE FROM room_calendar_links WHERE id = $1 AND room_id IN (SELECT r.id FROM operator_rooms r JOIN operator_listings l ON l.id = r.listing_id WHERE l.org_id = $2)", [linkId, orgId]);
    if (!r.rowCount) throw AppError.notFound("Calendario");
  }

  /** Descarga el calendario y reemplaza los bloqueos importados de ese enlace. Un fallo no borra lo ya importado. */
  async sync(orgId: string | null, linkId: string) {
    const { rows } = await this.db.query<{ id: string; room_id: string; url: string }>(
      `SELECT k.id, k.room_id, k.url FROM room_calendar_links k JOIN operator_rooms r ON r.id = k.room_id JOIN operator_listings l ON l.id = r.listing_id WHERE k.id = $1 AND ($2::uuid IS NULL OR l.org_id = $2)`, [linkId, orgId],
    );
    const link = rows[0];
    if (!link) throw AppError.notFound("Calendario");
    try {
      const events = parseIcs(await (this.fetcher ?? defaultFetcher)(link.url));
      const c = await this.db.connect();
      try {
        await c.query("BEGIN");
        await c.query("DELETE FROM room_blocks WHERE link_id = $1", [link.id]);
        for (const e of events) await c.query("INSERT INTO room_blocks (room_id, from_date, to_date, reason, link_id) VALUES ($1,$2,$3,$4,$5)", [link.room_id, e.from, e.to, e.reason, link.id]);
        await c.query("UPDATE room_calendar_links SET last_synced_at = now(), last_error = NULL WHERE id = $1", [link.id]);
        await c.query("COMMIT");
      } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
      return { id: link.id, imported: events.length, error: null as string | null };
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 200) : "Error desconocido";
      this.log.warn({ err, linkId }, "No se pudo sincronizar el calendario externo");
      await this.db.query("UPDATE room_calendar_links SET last_error = $2, last_synced_at = now() WHERE id = $1", [linkId, msg]);
      return { id: link.id, imported: 0, error: msg };
    }
  }

  /** Enlaces que llevan más de `olderThanMinutes` sin sincronizar (los usa el trabajador programado). */
  async syncDue(olderThanMinutes = 60, limit = 50) {
    const { rows } = await this.db.query<{ id: string }>("SELECT id FROM room_calendar_links WHERE last_synced_at IS NULL OR last_synced_at < now() - make_interval(mins => $1) ORDER BY last_synced_at NULLS FIRST LIMIT $2", [olderThanMinutes, limit]);
    for (const r of rows) await this.sync(null, r.id);
    return rows.length;
  }
}
