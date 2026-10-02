import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { z } from "zod";
import type { JobRegistrar } from "../../contracts/jobs.js";
import type { NotifyFn } from "../../contracts/notifications.js";
import type { Db } from "../../db/pool.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";

/**
 * Campañas con creadores, derechos por pieza, libro de ingresos y disputas (plan de accesos, puntos 87 a 93).
 *
 * Reglas de negocio (supuestos revisables; ver PLAN_ACCESOS_Y_PANELES_POR_PERFIL.md):
 *  - Los términos de una campaña se guardan por versiones inmutables y el creador acepta una versión concreta.
 *  - El autor es siempre el titular de su pieza; la plataforma o la campaña reciben una licencia acotada.
 *  - Una comisión nace "estimada" y pasa a "confirmada" al cumplirse su ventana sin reverso.
 *  - Un reverso no borra nada: es un movimiento negativo con su razón, enlazado al original.
 *  - Una disputa se abre dentro de un plazo, con evidencia, y sólo la ven el creador y el personal.
 */
export const ATTRIBUTION_WINDOW_DAYS = 30;
export const DISPUTE_WINDOW_DAYS = 30;
export const DISPUTE_RESPONSE_DAYS = 10;
export const RIGHTS_EXPIRY_NOTICE_DAYS = 14;

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const campaignTerms = z.object({
  brief: z.string().trim().min(20).max(4000),
  deliverables: z.array(z.object({ type: z.enum(["video", "foto", "publicacion", "historia"]), quantity: z.number().int().min(1).max(50), due_date: date.optional() })).min(1).max(20),
  schedule: z.object({ starts_on: date, ends_on: date }),
  compensation: z.discriminatedUnion("type", [
    z.object({ type: z.literal("fixed"), amount: z.number().positive().max(10_000_000), currency: z.enum(["DOP", "USD"]) }),
    z.object({ type: z.literal("commission"), commission_pct: z.number().positive().max(50) }),
    z.object({ type: z.literal("none") }),
  ]),
  /** Cómo debe identificarse el contenido como publicidad (p. ej. "#publicidad" visible en los primeros segundos). */
  disclosure: z.string().trim().min(3).max(300),
  metrics: z.array(z.string().trim().min(2).max(60)).max(15).default([]),
  rights: z.object({
    media: z.array(z.string().trim().min(2).max(40)).min(1).max(15),
    territory: z.string().trim().min(2).max(60),
    /** Sin licencias perpetuas: el plazo es obligatorio. */
    duration_days: z.number().int().min(1).max(3650),
    exclusive: z.boolean(),
    approved_uses: z.array(z.string().trim().min(2).max(60)).min(1).max(15),
  }),
}).strict().refine((t) => t.schedule.ends_on >= t.schedule.starts_on, { message: "La campaña no puede terminar antes de empezar", path: ["schedule", "ends_on"] });
export type CampaignTerms = z.infer<typeof campaignTerms>;

/** Texto canónico (claves ordenadas) para que la misma versión dé siempre la misma huella. */
const canonical = (value: unknown): string =>
  value === null || typeof value !== "object" ? JSON.stringify(value)
    : Array.isArray(value) ? `[${value.map(canonical).join(",")}]`
      : `{${Object.keys(value as object).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(",")}}`;
export const termsHash = (terms: unknown) => createHash("sha256").update(canonical(terms)).digest("hex");

type LedgerSource = "affiliate_commission" | "content_payment" | "creator_fund" | "bonus" | "tip" | "reversal" | "adjustment";
export const SOURCE_LABEL: Record<LedgerSource, string> = {
  affiliate_commission: "Comisiones por ventas atribuidas",
  content_payment: "Pagos por contenido de campañas",
  creator_fund: "Fondo de creadores",
  bonus: "Bonificaciones",
  tip: "Propinas",
  reversal: "Reversos",
  adjustment: "Ajustes",
};

export class CreatorCampaignService {
  constructor(private readonly db: Db, private readonly notify: NotifyFn) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  /** Sólo un perfil de creador aprobado participa en campañas. */
  private async assertCreator(userId: string) {
    const p = (await this.db.query<{ status: string }>("SELECT status FROM creator_profiles WHERE id = $1", [userId])).rows[0];
    if (!p) throw AppError.notFound("Perfil de creador");
    if (p.status !== "approved") throw new AppError("FORBIDDEN", "Tu perfil de creador no está aprobado", { code: "CREATOR_NOT_APPROVED" });
  }

  // ───────────── 87: campañas y términos versionados ─────────────

  async createCampaign(actorId: string, input: { title: string; sponsor?: string; terms: CampaignTerms }, ip: string) {
    return this.tx(async (c) => {
      const id = (await c.query<{ id: string }>("INSERT INTO creator_campaigns (title, sponsor, created_by) VALUES ($1,$2,$3) RETURNING id", [input.title, input.sponsor ?? null, actorId])).rows[0]!.id;
      await c.query("INSERT INTO creator_campaign_terms (campaign_id, version, terms, terms_hash, created_by) VALUES ($1, 1, $2, $3, $4)", [id, JSON.stringify(input.terms), termsHash(input.terms), actorId]);
      await auditInsert(c, { actor: actorId, action: "creator_campaign.created", entity: "creator_campaign", id, meta: { title: input.title }, ip });
      return { id, version: 1 };
    });
  }

  /** Cambiar los términos crea una versión nueva; las aceptaciones anteriores quedan como evidencia pero ya no habilitan a entregar. */
  async reviseTerms(actorId: string, campaignId: string, terms: CampaignTerms, ip: string) {
    return this.tx(async (c) => {
      const cur = (await c.query<{ status: string; current_version: number }>("SELECT status, current_version FROM creator_campaigns WHERE id = $1 FOR UPDATE", [campaignId])).rows[0];
      if (!cur) throw AppError.notFound("Campaña");
      if (cur.status === "closed") throw new AppError("BUSINESS_RULE", "Una campaña cerrada no admite cambios de términos", { code: "INVALID_STATE" });
      const hash = termsHash(terms);
      const same = (await c.query("SELECT 1 FROM creator_campaign_terms WHERE campaign_id = $1 AND version = $2 AND terms_hash = $3", [campaignId, cur.current_version, hash])).rowCount;
      if (same) throw new AppError("BUSINESS_RULE", "Los términos no cambiaron", { code: "TERMS_UNCHANGED" });
      const version = cur.current_version + 1;
      await c.query("INSERT INTO creator_campaign_terms (campaign_id, version, terms, terms_hash, created_by) VALUES ($1,$2,$3,$4,$5)", [campaignId, version, JSON.stringify(terms), hash, actorId]);
      await c.query("UPDATE creator_campaigns SET current_version = $2 WHERE id = $1", [campaignId, version]);
      await auditInsert(c, { actor: actorId, action: "creator_campaign.terms_revised", entity: "creator_campaign", id: campaignId, meta: { version }, ip });
      const accepted = (await c.query<{ creator_id: string }>("SELECT DISTINCT creator_id FROM creator_campaign_acceptances WHERE campaign_id = $1", [campaignId])).rows;
      return { version, notify: accepted.map((a) => a.creator_id) };
    }).then(async ({ version, notify }) => {
      for (const creatorId of notify) await this.notify(creatorId, { type: "system", title: "Cambiaron los términos de una campaña que aceptaste", message: "Revisa la nueva versión y acéptala para seguir entregando.", link: "/programa-creadores", data: { campaign_id: campaignId, version } });
      return { id: campaignId, version };
    });
  }

  async setStatus(actorId: string, campaignId: string, status: "open" | "closed", ip: string) {
    const res = await this.db.query("UPDATE creator_campaigns SET status = $2, closed_at = CASE WHEN $2 = 'closed' THEN now() ELSE NULL END WHERE id = $1 AND status <> 'closed' AND status <> $2", [campaignId, status]);
    if (!res.rowCount) throw new AppError("BUSINESS_RULE", "La campaña no existe o no admite ese cambio de estado", { code: "INVALID_STATE" });
    await audit(this.db, { actor: actorId, action: `creator_campaign.${status}`, entity: "creator_campaign", id: campaignId, ip });
  }

  async listForAdmin() {
    return (await this.db.query(
      `SELECT c.id, c.title, c.sponsor, c.status, c.current_version, c.created_at, c.closed_at,
              (SELECT count(DISTINCT a.creator_id)::int FROM creator_campaign_acceptances a WHERE a.campaign_id = c.id AND a.version = c.current_version) AS accepted_current,
              (SELECT count(*)::int FROM creator_campaign_deliverables d WHERE d.campaign_id = c.id AND d.status = 'submitted') AS deliverables_pending
         FROM creator_campaigns c ORDER BY c.created_at DESC LIMIT 100`,
    )).rows;
  }

  /** Campañas abiertas con sus términos vigentes y lo que el creador ya aceptó. */
  async listOpen(creatorId: string) {
    await this.assertCreator(creatorId);
    return (await this.db.query(
      `SELECT c.id, c.title, c.sponsor, c.current_version AS version, t.terms, t.terms_hash,
              (SELECT max(a.version) FROM creator_campaign_acceptances a WHERE a.campaign_id = c.id AND a.creator_id = $1) AS accepted_version
         FROM creator_campaigns c JOIN creator_campaign_terms t ON t.campaign_id = c.id AND t.version = c.current_version
        WHERE c.status = 'open' ORDER BY c.created_at DESC`, [creatorId],
    )).rows.map((r) => ({ ...r, needs_acceptance: r.accepted_version !== r.version }));
  }

  // ───────────── 88: aceptación versionada ─────────────

  async accept(creatorId: string, campaignId: string, version: number, ip: string) {
    await this.assertCreator(creatorId);
    const cur = (await this.db.query<{ status: string; current_version: number; terms_hash: string }>(
      "SELECT c.status, c.current_version, t.terms_hash FROM creator_campaigns c JOIN creator_campaign_terms t ON t.campaign_id = c.id AND t.version = c.current_version WHERE c.id = $1", [campaignId],
    )).rows[0];
    if (!cur) throw AppError.notFound("Campaña");
    if (cur.status !== "open") throw new AppError("BUSINESS_RULE", "La campaña no está abierta", { code: "INVALID_STATE" });
    // Se acepta lo que se leyó: si entre tanto cambió la versión, hay que volver a leer.
    if (version !== cur.current_version) throw new AppError("CONFLICT", "Los términos cambiaron; revisa la versión vigente antes de aceptar", { reason: "TERMS_VERSION_MISMATCH", current_version: cur.current_version });
    const ins = await this.db.query("INSERT INTO creator_campaign_acceptances (campaign_id, version, creator_id, terms_hash, ip) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING", [campaignId, version, creatorId, cur.terms_hash, ip]);
    if (ins.rowCount) await audit(this.db, { actor: creatorId, action: "creator_campaign.accepted", entity: "creator_campaign", id: campaignId, meta: { version, terms_hash: cur.terms_hash }, ip });
    return { campaign_id: campaignId, version, terms_hash: cur.terms_hash, already_accepted: !ins.rowCount };
  }

  /** Evidencia de aceptación: todas las versiones que aceptó cada creador, con el texto de cada una. */
  async acceptances(campaignId: string) {
    return (await this.db.query(
      `SELECT a.creator_id, p.handle, a.version, a.terms_hash, a.accepted_at, a.ip, t.terms
         FROM creator_campaign_acceptances a JOIN creator_profiles p ON p.id = a.creator_id
         JOIN creator_campaign_terms t ON t.campaign_id = a.campaign_id AND t.version = a.version
        WHERE a.campaign_id = $1 ORDER BY a.accepted_at`, [campaignId],
    )).rows;
  }

  // ───────────── Entregables ─────────────

  async submitDeliverable(creatorId: string, campaignId: string, videoId: string, ip: string) {
    await this.assertCreator(creatorId);
    const cur = (await this.db.query<{ status: string; current_version: number }>("SELECT status, current_version FROM creator_campaigns WHERE id = $1", [campaignId])).rows[0];
    if (!cur) throw AppError.notFound("Campaña");
    if (cur.status !== "open") throw new AppError("BUSINESS_RULE", "La campaña no está abierta", { code: "INVALID_STATE" });
    const accepted = (await this.db.query("SELECT 1 FROM creator_campaign_acceptances WHERE campaign_id = $1 AND creator_id = $2 AND version = $3", [campaignId, creatorId, cur.current_version])).rowCount;
    if (!accepted) throw new AppError("FORBIDDEN", "Acepta los términos vigentes de la campaña antes de entregar", { code: "TERMS_NOT_ACCEPTED", current_version: cur.current_version });
    if (!(await this.db.query("SELECT 1 FROM creator_videos WHERE id = $1 AND creator_id = $2", [videoId, creatorId])).rowCount) throw AppError.notFound("Pieza propia");
    try {
      const id = (await this.db.query<{ id: string }>("INSERT INTO creator_campaign_deliverables (campaign_id, creator_id, video_id, accepted_version) VALUES ($1,$2,$3,$4) RETURNING id", [campaignId, creatorId, videoId, cur.current_version])).rows[0]!.id;
      await audit(this.db, { actor: creatorId, action: "creator_campaign.deliverable_submitted", entity: "creator_campaign", id: campaignId, meta: { deliverable_id: id, video_id: videoId }, ip });
      return { id, status: "submitted" };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Esa pieza ya fue entregada a esta campaña", { reason: "ALREADY_SUBMITTED" });
      throw e;
    }
  }

  /** Entregas de una campaña para que el personal las revise. */
  async deliverables(campaignId: string) {
    return (await this.db.query(
      `SELECT d.id, d.creator_id, p.handle, d.video_id, v.title AS video_title, v.video_url, d.accepted_version, d.status, d.review_note, d.reviewed_at, d.created_at
         FROM creator_campaign_deliverables d JOIN creator_profiles p ON p.id = d.creator_id JOIN creator_videos v ON v.id = d.video_id
        WHERE d.campaign_id = $1 ORDER BY (d.status = 'submitted') DESC, d.created_at DESC`, [campaignId],
    )).rows;
  }

  /** Aprobar una entrega registra la licencia de la pieza y, si la compensación es fija, el pago en el libro. */
  async reviewDeliverable(actorId: string, deliverableId: string, decision: "approved" | "rejected", note: string | undefined, ip: string) {
    const result = await this.tx(async (c) => {
      const d = (await c.query<{ campaign_id: string; creator_id: string; video_id: string; accepted_version: number; status: string; title: string }>(
        "SELECT d.campaign_id, d.creator_id, d.video_id, d.accepted_version, d.status, c.title FROM creator_campaign_deliverables d JOIN creator_campaigns c ON c.id = d.campaign_id WHERE d.id = $1 FOR UPDATE OF d", [deliverableId],
      )).rows[0];
      if (!d) throw AppError.notFound("Entrega");
      if (d.status !== "submitted") throw new AppError("BUSINESS_RULE", "La entrega ya fue revisada", { code: "INVALID_STATE" });
      await c.query("UPDATE creator_campaign_deliverables SET status = $2, review_note = $3, reviewed_by = $4, reviewed_at = now() WHERE id = $1", [deliverableId, decision, note ?? null, actorId]);
      let rightsId: string | null = null, ledgerId: string | null = null;
      if (decision === "approved") {
        // Los derechos y el pago salen de la versión que el creador aceptó, no de la vigente hoy.
        const terms = (await c.query<{ terms: CampaignTerms }>("SELECT terms FROM creator_campaign_terms WHERE campaign_id = $1 AND version = $2", [d.campaign_id, d.accepted_version])).rows[0]!.terms;
        rightsId = (await c.query<{ id: string }>(
          `INSERT INTO content_rights (video_id, holder_creator_id, campaign_id, license_type, media, territory, exclusive, approved_uses, expires_at)
           VALUES ($1,$2,$3,'campaign',$4,$5,$6,$7, now() + make_interval(days => $8)) RETURNING id`,
          [d.video_id, d.creator_id, d.campaign_id, terms.rights.media, terms.rights.territory, terms.rights.exclusive, terms.rights.approved_uses, terms.rights.duration_days],
        )).rows[0]!.id;
        if (terms.compensation.type === "fixed") {
          ledgerId = (await c.query<{ id: string }>(
            "INSERT INTO creator_ledger (creator_id, source, amount, currency, status, origin, campaign_id, video_id, created_by, confirmed_at) VALUES ($1,'content_payment',$2,$3,'confirmed',$4,$5,$6,$7, now()) RETURNING id",
            [d.creator_id, terms.compensation.amount, terms.compensation.currency, `Campaña «${d.title}» (términos v${d.accepted_version})`, d.campaign_id, d.video_id, actorId],
          )).rows[0]!.id;
        }
      }
      await auditInsert(c, { actor: actorId, action: `creator_campaign.deliverable_${decision}`, entity: "creator_campaign", id: d.campaign_id, meta: { deliverable_id: deliverableId, rights_id: rightsId, ledger_id: ledgerId, note: note ?? null }, ip });
      return { creator_id: d.creator_id, campaign_id: d.campaign_id, title: d.title, rights_id: rightsId, ledger_id: ledgerId };
    });
    await this.notify(result.creator_id, { type: "system", title: decision === "approved" ? `Aprobaron tu entrega para «${result.title}»` : `No aprobaron tu entrega para «${result.title}»`, message: note ?? null, link: "/programa-creadores", data: { campaign_id: result.campaign_id, deliverable_id: deliverableId } });
    return { id: deliverableId, status: decision, rights_id: result.rights_id, ledger_id: result.ledger_id };
  }

  // ───────────── 89 y 93: derechos por pieza ─────────────

  /** Licencia general de la plataforma sobre una pieza publicada (difusión dentro del portal). El creador puede retirarla. */
  async grantPlatformLicense(creatorId: string, videoId: string) {
    await this.assertCreator(creatorId);
    if (!(await this.db.query("SELECT 1 FROM creator_videos WHERE id = $1 AND creator_id = $2", [videoId, creatorId])).rowCount) throw AppError.notFound("Pieza propia");
    if ((await this.db.query("SELECT 1 FROM content_rights WHERE video_id = $1 AND license_type = 'platform' AND status = 'active'", [videoId])).rowCount) throw new AppError("CONFLICT", "La pieza ya tiene una licencia de plataforma vigente", { reason: "LICENSE_ALREADY_ACTIVE" });
    const { rows } = await this.db.query("INSERT INTO content_rights (video_id, holder_creator_id, license_type, media, territory, approved_uses, expires_at) VALUES ($1,$2,'platform','{portal,app}','DO','{feed,ficha}', now() + interval '365 days') RETURNING id, expires_at", [videoId, creatorId]);
    return rows[0];
  }

  /** Lo ven el autor y el personal autorizado; nadie más. */
  async rightsOf(videoId: string, viewer: { id: string; staff: boolean }) {
    await this.expireRights();
    const v = (await this.db.query<{ creator_id: string }>("SELECT creator_id FROM creator_videos WHERE id = $1", [videoId])).rows[0];
    if (!v || (!viewer.staff && v.creator_id !== viewer.id)) throw AppError.notFound("Pieza");
    const { rows } = await this.db.query(
      `SELECT r.id, r.license_type, r.campaign_id, c.title AS campaign_title, r.media, r.territory, r.exclusive, r.approved_uses, r.starts_at, r.expires_at, r.status, r.revoked_at, r.revoked_reason
         FROM content_rights r LEFT JOIN creator_campaigns c ON c.id = r.campaign_id WHERE r.video_id = $1 ORDER BY r.created_at DESC`, [videoId],
    );
    return { video_id: videoId, holder_creator_id: v.creator_id, licenses: rows };
  }

  /** ¿Se puede dar hoy un uso nuevo a esta pieza? Sólo con una licencia vigente que cubra ese uso. */
  async canUse(videoId: string, use: string): Promise<boolean> {
    await this.expireRights();
    return !!(await this.db.query("SELECT 1 FROM content_rights WHERE video_id = $1 AND status = 'active' AND (expires_at IS NULL OR expires_at > now()) AND $2 = ANY(approved_uses)", [videoId, use])).rowCount;
  }

  /**
   * El autor retira la licencia de plataforma cuando quiera. Una licencia de campaña es un compromiso aceptado:
   * sólo la revoca el personal (por ejemplo, al resolver una disputa).
   */
  async revokeRight(rightId: string, actor: { id: string; staff: boolean }, reason: string, ip: string) {
    const r = (await this.db.query<{ holder_creator_id: string; license_type: string; status: string; video_id: string }>("SELECT holder_creator_id, license_type, status, video_id FROM content_rights WHERE id = $1", [rightId])).rows[0];
    if (!r || (!actor.staff && r.holder_creator_id !== actor.id)) throw AppError.notFound("Licencia");
    if (r.status !== "active") throw new AppError("BUSINESS_RULE", "La licencia ya no está vigente", { code: "INVALID_STATE" });
    if (!actor.staff && r.license_type === "campaign") throw new AppError("FORBIDDEN", "Una licencia de campaña sólo se revoca con el equipo; abre una disputa", { code: "CAMPAIGN_LICENSE" });
    await this.db.query("UPDATE content_rights SET status = 'revoked', revoked_at = now(), revoked_by = $2, revoked_reason = $3 WHERE id = $1", [rightId, actor.id, reason]);
    await audit(this.db, { actor: actor.id, action: "content_rights.revoked", entity: "content_rights", id: rightId, meta: { video_id: r.video_id, reason }, ip });
    if (actor.staff) await this.notify(r.holder_creator_id, { type: "system", title: "Se revocó una licencia sobre tu contenido", message: reason, link: "/programa-creadores", data: { rights_id: rightId, video_id: r.video_id } });
  }

  private async expireRights() {
    await this.db.query("UPDATE content_rights SET status = 'expired' WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= now()");
  }

  /** Marca las vencidas y avisa, una sola vez, de las que vencen pronto. */
  async sweepRights() {
    const expired = (await this.db.query("UPDATE content_rights SET status = 'expired' WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= now()")).rowCount ?? 0;
    const soon = (await this.db.query<{ id: string; holder_creator_id: string; video_id: string; expires_at: Date }>(
      `UPDATE content_rights SET expiry_notified_at = now()
        WHERE status = 'active' AND expiry_notified_at IS NULL AND expires_at IS NOT NULL AND expires_at > now() AND expires_at <= now() + make_interval(days => $1)
        RETURNING id, holder_creator_id, video_id, expires_at`, [RIGHTS_EXPIRY_NOTICE_DAYS],
    )).rows;
    for (const r of soon) await this.notify(r.holder_creator_id, { type: "system", title: "Una licencia sobre tu contenido está por vencer", message: `Vence el ${r.expires_at.toISOString().slice(0, 10)}. Después no se le podrá dar usos nuevos.`, link: "/programa-creadores", data: { rights_id: r.id, video_id: r.video_id } });
    return { expired, notified: soon.length };
  }

  // ───────────── 90 y 91: libro de ingresos ─────────────

  /** Anota una comisión estimada; se confirma sola al cumplirse la ventana de atribución. */
  async recordCommission(input: { creatorId: string; videoId: string; amount: number; origin: string }, c: Db | PoolClient = this.db) {
    if (input.amount <= 0) return null;
    return (await c.query<{ id: string }>(
      "INSERT INTO creator_ledger (creator_id, source, amount, status, origin, video_id, attribution_window_days) VALUES ($1,'affiliate_commission',$2,'estimated',$3,$4,$5) RETURNING id",
      [input.creatorId, input.amount, input.origin, input.videoId, ATTRIBUTION_WINDOW_DAYS],
    )).rows[0]!.id;
  }

  async confirmDueEntries() {
    return (await this.db.query("UPDATE creator_ledger SET status = 'confirmed', confirmed_at = now() WHERE status = 'estimated' AND created_at <= now() - make_interval(days => attribution_window_days)")).rowCount ?? 0;
  }

  /** Bonificación o ajuste manual del personal, siempre con motivo. */
  async addManualEntry(actorId: string, input: { creatorId: string; source: "bonus" | "adjustment" | "creator_fund" | "tip"; amount: number; currency: string; reason: string }, ip: string) {
    if (!(await this.db.query("SELECT 1 FROM creator_profiles WHERE id = $1", [input.creatorId])).rowCount) throw AppError.notFound("Creador");
    const id = (await this.db.query<{ id: string }>(
      "INSERT INTO creator_ledger (creator_id, source, amount, currency, status, origin, reason, created_by, confirmed_at) VALUES ($1,$2,$3,$4,'confirmed',$5,$6,$7, now()) RETURNING id",
      [input.creatorId, input.source, input.amount, input.currency, "Registro manual del equipo", input.reason, actorId],
    )).rows[0]!.id;
    await audit(this.db, { actor: actorId, action: "creator_ledger.manual_entry", entity: "creator_ledger", id, meta: { creator_id: input.creatorId, source: input.source, amount: input.amount, reason: input.reason }, ip });
    return { id };
  }

  /** Revierte un movimiento: el original queda marcado y se añade uno negativo con la razón. */
  async reverse(actorId: string, entryId: string, reason: string, ip: string) {
    const out = await this.tx(async (c) => {
      const e = (await c.query<{ creator_id: string; amount: number; currency: string; status: string; source: string; origin: string }>("SELECT creator_id, amount, currency, status, source, origin FROM creator_ledger WHERE id = $1 FOR UPDATE", [entryId])).rows[0];
      if (!e) throw AppError.notFound("Movimiento");
      if (e.status === "reversed" || e.source === "reversal") throw new AppError("BUSINESS_RULE", "Ese movimiento no se puede revertir", { code: "INVALID_STATE" });
      await c.query("UPDATE creator_ledger SET status = 'reversed' WHERE id = $1", [entryId]);
      const id = (await c.query<{ id: string }>(
        "INSERT INTO creator_ledger (creator_id, source, amount, currency, status, origin, reverses_entry_id, reason, created_by, confirmed_at) VALUES ($1,'reversal',$2,$3,'confirmed',$4,$5,$6,$7, now()) RETURNING id",
        [e.creator_id, -Number(e.amount), e.currency, e.origin, entryId, reason, actorId],
      )).rows[0]!.id;
      await auditInsert(c, { actor: actorId, action: "creator_ledger.reversed", entity: "creator_ledger", id: entryId, meta: { reversal_id: id, reason }, ip });
      return { id, creator_id: e.creator_id };
    });
    await this.notify(out.creator_id, { type: "system", title: "Se revirtió un ingreso de tu cuenta", message: reason, link: "/programa-creadores", data: { ledger_id: entryId, reversal_id: out.id } });
    return { reversal_id: out.id };
  }

  /** Ingresos del creador separados por concepto, con lo estimado aparte de lo confirmado. */
  async earnings(creatorId: string) {
    await this.confirmDueEntries();
    const entries = (await this.db.query<{ source: LedgerSource; amount: number; currency: string; status: string }>(
      `SELECT id, source, amount, currency, status, origin, campaign_id, video_id, attribution_window_days, reverses_entry_id, reason, created_at, confirmed_at,
              CASE WHEN status = 'estimated' THEN created_at + make_interval(days => attribution_window_days) END AS confirms_at
         FROM creator_ledger WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 200`, [creatorId],
    )).rows;
    const by = new Map<string, { source: LedgerSource; label: string; currency: string; estimated: number; confirmed: number }>();
    for (const e of entries) {
      const key = `${e.source}|${e.currency}`;
      const row = by.get(key) ?? { source: e.source, label: SOURCE_LABEL[e.source], currency: e.currency, estimated: 0, confirmed: 0 };
      // Un movimiento revertido deja de contar; su reverso lleva el importe negativo que lo compensa.
      if (e.status === "estimated") row.estimated += Number(e.amount);
      else if (e.status === "confirmed" || e.status === "reversed") row.confirmed += Number(e.amount);
      by.set(key, row);
    }
    const round = (n: number) => Math.round(n * 100) / 100;
    return {
      by_source: [...by.values()].map((r) => ({ ...r, estimated: round(r.estimated), confirmed: round(r.confirmed) })),
      entries,
      notes: {
        attribution_window_days: ATTRIBUTION_WINDOW_DAYS,
        estimated: "Una comisión estimada todavía puede revertirse (devolución o cancelación de la venta). No es un ingreso asegurado hasta confirmarse.",
        dispute_window_days: DISPUTE_WINDOW_DAYS,
      },
    };
  }

  // ───────────── 92: disputas ─────────────

  async openDispute(creatorId: string, input: { subjectType: "campaign" | "ledger_entry"; subjectId: string; reason: string; evidence: { label: string; url?: string; text?: string }[] }, ip: string) {
    await this.assertCreator(creatorId);
    // El caso debe ser del propio creador y estar dentro del plazo.
    const subject = input.subjectType === "ledger_entry"
      ? (await this.db.query<{ at: Date }>("SELECT created_at AS at FROM creator_ledger WHERE id = $1 AND creator_id = $2", [input.subjectId, creatorId])).rows[0]
      : (await this.db.query<{ at: Date }>("SELECT coalesce(c.closed_at, now()) AS at FROM creator_campaigns c WHERE c.id = $1 AND EXISTS (SELECT 1 FROM creator_campaign_acceptances a WHERE a.campaign_id = c.id AND a.creator_id = $2)", [input.subjectId, creatorId])).rows[0];
    if (!subject) throw AppError.notFound(input.subjectType === "ledger_entry" ? "Movimiento propio" : "Campaña en la que participas");
    if (subject.at.getTime() < Date.now() - DISPUTE_WINDOW_DAYS * 86_400_000) throw new AppError("BUSINESS_RULE", `El plazo para disputar (${DISPUTE_WINDOW_DAYS} días) ya venció`, { code: "DISPUTE_WINDOW_CLOSED" });
    try {
      const row = (await this.db.query<{ id: string; due_at: Date }>(
        "INSERT INTO creator_disputes (creator_id, subject_type, subject_id, reason, evidence, due_at) VALUES ($1,$2,$3,$4,$5, now() + make_interval(days => $6)) RETURNING id, due_at",
        [creatorId, input.subjectType, input.subjectId, input.reason, JSON.stringify(input.evidence), DISPUTE_RESPONSE_DAYS],
      )).rows[0]!;
      await audit(this.db, { actor: creatorId, action: "creator_dispute.opened", entity: "creator_dispute", id: row.id, meta: { subject_type: input.subjectType, subject_id: input.subjectId }, ip });
      return { id: row.id, status: "open", due_at: row.due_at };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya tienes una disputa abierta sobre ese caso", { reason: "DISPUTE_ALREADY_OPEN" });
      throw e;
    }
  }

  async myDisputes(creatorId: string) {
    return (await this.db.query("SELECT id, subject_type, subject_id, reason, evidence, status, due_at, resolved_at, resolution_note, created_at FROM creator_disputes WHERE creator_id = $1 ORDER BY created_at DESC LIMIT 50", [creatorId])).rows;
  }

  async disputesForStaff(status: string) {
    return (await this.db.query(
      `SELECT d.id, d.creator_id, p.handle, d.subject_type, d.subject_id, d.reason, d.evidence, d.status, d.due_at, (d.status = 'open' AND d.due_at < now()) AS overdue, d.resolved_at, d.resolution_note, d.created_at
         FROM creator_disputes d JOIN creator_profiles p ON p.id = d.creator_id WHERE d.status = $1 ORDER BY d.due_at LIMIT 100`, [status],
    )).rows;
  }

  async resolveDispute(actorId: string, disputeId: string, decision: "resolved_accepted" | "resolved_rejected", note: string, ip: string) {
    const d = (await this.db.query<{ creator_id: string }>("UPDATE creator_disputes SET status = $2, resolved_by = $3, resolved_at = now(), resolution_note = $4 WHERE id = $1 AND status = 'open' RETURNING creator_id", [disputeId, decision, actorId, note])).rows[0];
    if (!d) throw AppError.notFound("Disputa abierta");
    await audit(this.db, { actor: actorId, action: `creator_dispute.${decision}`, entity: "creator_dispute", id: disputeId, meta: { note }, ip });
    await this.notify(d.creator_id, { type: "system", title: decision === "resolved_accepted" ? "Resolvimos tu disputa a tu favor" : "Resolvimos tu disputa", message: note, link: "/programa-creadores", data: { dispute_id: disputeId } });
  }

  async withdrawDispute(creatorId: string, disputeId: string) {
    const res = await this.db.query("UPDATE creator_disputes SET status = 'withdrawn', resolved_at = now() WHERE id = $1 AND creator_id = $2 AND status = 'open'", [disputeId, creatorId]);
    if (!res.rowCount) throw AppError.notFound("Disputa abierta propia");
  }
}

declare module "fastify" {
  interface FastifyInstance { creatorCampaigns: CreatorCampaignService }
}

export function registerCreatorCampaignJobs(d: { runner: JobRegistrar; campaigns: CreatorCampaignService }) {
  d.runner.register({ name: "creators.ledger.confirm", description: `Confirma comisiones estimadas al cumplirse su ventana de ${ATTRIBUTION_WINDOW_DAYS} días`, everySeconds: 3600, run: async () => ({ confirmed: await d.campaigns.confirmDueEntries() }) });
  d.runner.register({ name: "content.rights.sweep", description: "Marca licencias de contenido vencidas y avisa de las que vencen pronto", everySeconds: 3600, run: async () => d.campaigns.sweepRights() });
}
