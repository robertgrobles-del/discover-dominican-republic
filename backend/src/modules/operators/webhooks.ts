import { randomBytes } from "node:crypto";
import type { Db } from "../../db/pool.js";
import { audit } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";
import { assertPublicUrl } from "../../lib/public-url.js";
import { signWebhook } from "../../lib/webhook-signature.js";

export const WEBHOOK_EVENTS = ["booking.created", "booking.cancelled"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

const MAX_PER_ORG = 5;
const TIMEOUT_MS = 5_000;
/** Espera antes de cada reintento; agotada la lista, la entrega queda como fallida. */
const BACKOFF_SECONDS = [60, 300, 1_800, 7_200, 21_600];
/** Tras tantas entregas fallidas seguidas el webhook se desactiva solo, para no golpear un destino caído. */
const DISABLE_AFTER_FAILURES = 20;
const LOOKBACK_MINUTES = 5;
const PUBLIC_COLUMNS = "id, url, events, active, consecutive_failures, disabled_reason, last_delivery_at, created_at";

type Http = (url: string, init: RequestInit) => Promise<{ status: number }>;
interface Due { id: string; webhook_id: string; event: string; payload: unknown; attempts: number; url: string; secret: string }

const safeUrl = async (url: string) => {
  try { await assertPublicUrl(url); } catch { throw AppError.validation("La URL del webhook debe ser https y apuntar a un servidor público"); }
};

/**
 * Webhooks salientes del operador (plan de 150 mejoras, punto 139). Cada entrega va firmada con `X-Signature`
 * (HMAC-SHA256 con marca de tiempo). El cuerpo no lleva datos de contacto del viajero: quien lo recibe consulta
 * la reserva en su panel, con sus permisos.
 */
export class WebhookService {
  constructor(private readonly db: Db, private readonly http: Http = (url, init) => fetch(url, init)) {}

  async list(orgId: string) {
    return (await this.db.query(`SELECT ${PUBLIC_COLUMNS} FROM org_webhooks WHERE org_id = $1 ORDER BY created_at`, [orgId])).rows;
  }

  /** El secreto sólo se devuelve aquí, una vez. */
  async create(orgId: string, actorId: string, input: { url: string; events: WebhookEvent[] }) {
    await safeUrl(input.url);
    const count = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM org_webhooks WHERE org_id = $1", [orgId])).rows[0]!.n;
    if (count >= MAX_PER_ORG) throw new AppError("BUSINESS_RULE", `Una organización admite hasta ${MAX_PER_ORG} webhooks`);
    const secret = `whsec_${randomBytes(32).toString("base64url")}`;
    const row = (await this.db.query(`INSERT INTO org_webhooks (org_id, url, secret, events, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING ${PUBLIC_COLUMNS}`, [orgId, input.url, secret, [...new Set(input.events)], actorId])).rows[0];
    await audit(this.db, { actor: actorId, action: "org.webhook_create", entity: "org_webhook", id: row.id, org: orgId, meta: { host: new URL(input.url).hostname, events: input.events } });
    return { ...row, secret };
  }

  async remove(orgId: string, actorId: string, id: string) {
    const del = await this.db.query("DELETE FROM org_webhooks WHERE id = $1 AND org_id = $2", [id, orgId]);
    if (!del.rowCount) throw AppError.notFound("Webhook");
    await audit(this.db, { actor: actorId, action: "org.webhook_delete", entity: "org_webhook", id, org: orgId });
  }

  /** Reactiva un webhook desactivado por fallos; los eventos ocurridos mientras estuvo apagado no se envían. */
  async enable(orgId: string, id: string) {
    const upd = await this.db.query(`UPDATE org_webhooks SET active = true, consecutive_failures = 0, disabled_reason = NULL, cursor_at = now() WHERE id = $1 AND org_id = $2 RETURNING ${PUBLIC_COLUMNS}`, [id, orgId]);
    if (!upd.rows[0]) throw AppError.notFound("Webhook");
    return upd.rows[0];
  }

  async deliveries(orgId: string, id: string) {
    return (await this.db.query(
      `SELECT d.id, d.event, d.status, d.attempts, d.response_status, d.created_at, d.delivered_at, d.next_attempt_at
         FROM org_webhook_deliveries d JOIN org_webhooks w ON w.id = d.webhook_id WHERE w.id = $1 AND w.org_id = $2 ORDER BY d.created_at DESC LIMIT 50`, [id, orgId],
    )).rows;
  }

  /** Encola un evento de prueba para comprobar la firma y la conexión desde el sistema del operador. */
  async sendTest(orgId: string, id: string) {
    const ins = await this.db.query(
      `INSERT INTO org_webhook_deliveries (webhook_id, event, subject_id, payload)
       SELECT w.id, 'webhook.test', 'test', jsonb_build_object('message', 'Entrega de prueba de Descubre RD') FROM org_webhooks w WHERE w.id = $1 AND w.org_id = $2 RETURNING id`, [id, orgId],
    );
    if (!ins.rows[0]) throw AppError.notFound("Webhook");
    return { delivery_id: ins.rows[0].id as string };
  }

  /**
   * Recoge reservas nuevas y canceladas desde la última pasada de cada webhook activo. El índice único por
   * webhook, evento y reserva hace que repetir la pasada (o correrla en dos instancias) no duplique entregas.
   * Cada pasada vuelve a mirar unos minutos atrás: una reserva cuya transacción se confirmó después de la pasada
   * anterior lleva una fecha previa al cursor y, sin ese margen, se perdería.
   */
  async collect(now = new Date()): Promise<number> {
    const body = `jsonb_build_object('booking_id', b.id, 'reference', b.reference, 'listing_id', b.listing_id, 'listing_title', b.listing_title, 'date', b.date::text,
                  'guests', b.guests, 'total_price', b.total_price, 'currency', b.currency, 'status', b.status, 'source', b.source)`;
    const queue = (event: WebhookEvent, column: string) => this.db.query(
      `INSERT INTO org_webhook_deliveries (webhook_id, event, subject_id, payload)
       SELECT w.id, $1, b.id::text, ${body} FROM org_webhooks w JOIN bookings b ON b.org_id = w.org_id
        WHERE w.active AND $1 = ANY(w.events) AND b.${column} > greatest(w.cursor_at - make_interval(mins => ${LOOKBACK_MINUTES}), w.created_at) AND b.${column} <= $2
       ON CONFLICT DO NOTHING`, [event, now],
    );
    const created = await queue("booking.created", "created_at");
    const cancelled = await queue("booking.cancelled", "cancelled_at");
    await this.db.query("UPDATE org_webhooks SET cursor_at = $1 WHERE active AND cursor_at < $1", [now]);
    return (created.rowCount ?? 0) + (cancelled.rowCount ?? 0);
  }

  /** Entrega lo pendiente. Cada fila se reclama con bloqueo, así dos instancias no envían la misma. */
  async deliverDue(now = new Date(), limit = 50): Promise<{ delivered: number; retried: number; failed: number }> {
    const out = { delivered: 0, retried: 0, failed: 0 };
    for (let i = 0; i < limit; i++) {
      const c = await this.db.connect();
      try {
        await c.query("BEGIN");
        const d = (await c.query<Due>(
          `SELECT d.id, d.webhook_id, d.event, d.payload, d.attempts, w.url, w.secret FROM org_webhook_deliveries d JOIN org_webhooks w ON w.id = d.webhook_id
            WHERE d.status = 'pending' AND d.next_attempt_at <= $1 AND w.active ORDER BY d.next_attempt_at LIMIT 1 FOR UPDATE OF d SKIP LOCKED`, [now],
        )).rows[0];
        if (!d) { await c.query("COMMIT"); break; }
        const status = await this.post(d, now);
        const ok = status !== null && status >= 200 && status < 300;
        if (ok) {
          await c.query("UPDATE org_webhook_deliveries SET status = 'delivered', attempts = attempts + 1, response_status = $2, delivered_at = $3 WHERE id = $1", [d.id, status, now]);
          await c.query("UPDATE org_webhooks SET consecutive_failures = 0, last_delivery_at = $2 WHERE id = $1", [d.webhook_id, now]);
          out.delivered++;
        } else {
          const wait = BACKOFF_SECONDS[d.attempts];
          await c.query(
            "UPDATE org_webhook_deliveries SET status = $2, attempts = attempts + 1, response_status = $3, next_attempt_at = $4 WHERE id = $1",
            [d.id, wait === undefined ? "failed" : "pending", status, new Date(now.getTime() + (wait ?? 0) * 1000)],
          );
          await c.query(
            `UPDATE org_webhooks SET consecutive_failures = consecutive_failures + 1,
                    active = consecutive_failures + 1 < $2, disabled_reason = CASE WHEN consecutive_failures + 1 >= $2 THEN 'Desactivado tras fallos repetidos de entrega' ELSE disabled_reason END
              WHERE id = $1`, [d.webhook_id, DISABLE_AFTER_FAILURES],
          );
          if (wait === undefined) out.failed++; else out.retried++;
        }
        await c.query("COMMIT");
      } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
    }
    return out;
  }

  /** Código de respuesta, o null si no hubo respuesta o el destino dejó de ser público. Nunca sigue redirecciones. */
  private async post(d: Due, now: Date): Promise<number | null> {
    const body = JSON.stringify({ id: d.id, event: d.event, created_at: now.toISOString(), data: d.payload });
    try {
      await assertPublicUrl(d.url); // el DNS pudo cambiar desde que se registró
      const res = await this.http(d.url, {
        method: "POST", body, redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "content-type": "application/json", "user-agent": "DescubreRD-Webhooks/1", "x-webhook-id": d.id, "x-webhook-event": d.event, "x-signature": signWebhook(d.secret, body, Math.floor(now.getTime() / 1000)) },
      });
      return res.status;
    } catch { return null; }
  }
}
