import { createHash } from "node:crypto";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { auditInsert } from "../operators/team.js";
import {
  CATEGORIES, LANGUAGES, SEALS, reputationScore, sealFor,
  type ReputationResult, type ReputationStats, type SealDefinition,
} from "./reputation.js";

export interface CreatorProfileRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  tier: string;
  status: string;
  // Punto 14: ciclo de vida del perfil (draft → pending → approved/rejected, approved ⇄ suspended).
  status_reason: string | null;
  status_changed_at: string | null;
  reviewed_by: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  commission_rate: number;
  total_views: number;
  total_earnings: number;
  balance_available: number;
  balance_pending: number;
  // Punto 41: identidad pública y reputación.
  categories: string[];
  languages: string[];
  audience_verified: boolean;
  audience_verified_at: string | null;
  audience_metrics: Record<string, unknown>;
  public_profile: boolean;
  reputation_score: number;
}

// ───────────────────────── Punto 14: aprobación del perfil ─────────────────────────

/** Estados del flujo de aprobación del perfil de creador (punto 14 del plan). */
export const CREATOR_STATUSES = ["draft", "pending", "approved", "rejected", "suspended"] as const;
export type CreatorStatus = (typeof CREATOR_STATUSES)[number];

/** Decisiones que puede tomar quien revisa (moderador o administrador). */
export type CreatorReviewDecision = "approved" | "rejected" | "suspended";

/**
 * Transiciones que una decisión de revisión puede provocar. El envío a revisión
 * (`draft`/`rejected` → `pending`) lo gobierna `submitForReview` y no aparece aquí
 * porque no es una decisión de tercero.
 */
export const CREATOR_REVIEW_TRANSITIONS: Record<CreatorStatus, readonly CreatorReviewDecision[]> = {
  draft: [],
  pending: ["approved", "rejected"],
  approved: ["suspended"],
  rejected: [],
  suspended: ["approved"],
};

/** Requisitos mínimos de un perfil completo: se publican para que el creador sepa qué falta. */
export const CREATOR_APPROVAL_FIELDS = ["handle", "display_name", "bio", "categories", "languages"] as const;
export type CreatorApprovalField = (typeof CREATOR_APPROVAL_FIELDS)[number];

/** Estado de aprobación tal como lo ve su dueño en `GET /creators/me/approval`. */
export interface CreatorApproval {
  id: string;
  handle: string;
  display_name: string;
  status: CreatorStatus;
  status_reason: string | null;
  status_changed_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  public_profile: boolean;
  /** Requisitos del catálogo que aún no cumple (`handle`, `display_name`, `bio`, `categories`, `languages`). */
  missing: CreatorApprovalField[];
  /** El dueño puede enviar su propio perfil a revisión ahora mismo. */
  can_submit: boolean;
}

/** Fila de la cola de revisión: datos mínimos para decidir, sin saldos ni datos de pago. */
export interface PendingCreatorRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  categories: string[];
  languages: string[];
  social_channels: Record<string, unknown>;
  audience_verified: boolean;
  submitted_at: string | null;
  created_at: string;
  missing: CreatorApprovalField[];
}

export interface CreatorVideoRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  slug: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  file_size_bytes: number;
  resolution: string | null;
  aspect_ratio: string;
  destination_name: string | null;
  category: string | null;
  tags: string[];
  linked_listing_id: string | null;
  linked_listing_type: string | null;
  license_available: boolean;
  license_fee: number;
  views_count: number;
  likes_count: number;
  shares_count: number;
  status: string;
  review_notes: string | null;
  moderation_rule: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  created_at: string;
  creator_handle?: string;
  creator_name?: string;
  creator_avatar?: string | null;
}

export interface PublishVideoInput {
  creator_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  file_size_bytes: number;
  resolution?: string;
  aspect_ratio?: "9:16" | "16:9" | "1:1";
  destination_name?: string;
  category?: string;
  tags?: string[];
  linked_listing_id?: string;
  linked_listing_type?: "marketplace_product" | "operator_listing";
  license_available?: boolean;
  license_fee?: number;
}

export interface VideoEventInput {
  video_id: string;
  event_type: "view_start" | "view_complete" | "like" | "share" | "conversion";
  watch_time_seconds?: number;
  session_id?: string;
  user_id?: string | null;
  ip?: string;
}

/** Sello otorgado, ya unido a su definición publicada (punto 41). */
export interface CreatorSealRow {
  id: string;
  creator_id: string;
  seal_key: string;
  awarded_at: string;
  expires_at: string | null;
  evidence: Record<string, unknown>;
}

export interface CreatorSealView extends CreatorSealRow, Partial<SealDefinition> {}

/** Apelación de una publicación de creador (punto 44). */
export interface CreatorAppealRow {
  id: string;
  video_id: string;
  creator_id: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  rule_code: string | null;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface CreatorIdentityStats extends ReputationStats {
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_conversions: number;
  open_appeals: number;
  rejected_appeals: number;
}

/** Identidad completa del creador tal como la ve su dueño. */
export interface CreatorIdentity {
  profile: CreatorProfileRow;
  seals: CreatorSealView[];
  catalog: readonly SealDefinition[];
  /** Listas blancas publicadas, para que el cliente ofrezca sólo lo permitido. */
  category_catalog: readonly string[];
  language_catalog: readonly string[];
  reputation: ReputationResult;
  stats: CreatorIdentityStats;
  audience: { verified: boolean; verified_at: string | null; metrics: Record<string, unknown> };
  /** Punto 14: estado de aprobación y requisitos que faltan (el resto de campos vive en `profile`). */
  approval: { status: CreatorStatus; missing: CreatorApprovalField[]; can_submit: boolean };
}

/** Identidad pública de un creador (sin evidencia interna de sellos ni datos privados). */
export interface PublicCreatorIdentity {
  profile: Pick<CreatorProfileRow, "id" | "handle" | "display_name" | "bio" | "avatar_url" | "cover_url" | "tier" | "status" | "categories" | "languages" | "audience_verified" | "reputation_score" | "total_views">;
  seals: (SealDefinition & { awarded_at: string; expires_at: string | null })[];
  categories: string[];
  languages: string[];
  audience_verified: boolean;
  audience_metrics: Record<string, unknown>;
  reputation: ReputationResult;
  stats: CreatorIdentityStats;
}

/** Cambios aceptados por `PATCH /creators/me/identity`. */
export interface CreatorIdentityPatch {
  categories?: string[];
  languages?: string[];
  public_profile?: boolean;
  bio?: string;
  avatar_url?: string;
}

const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";
const OPEN_APPEAL_STATUSES = ["rejected", "pending_review", "archived"];

/** Servicio de Creadores UGC y Monetización en 3 Capas (Docs §Fase 3B) */
export class CreatorService {
  constructor(private readonly db: Db) {}

  /** Registro / onboarding de nuevo creador */
  async registerCreator(userId: string, data: { handle: string; display_name: string; bio?: string; avatar_url?: string; social_channels?: Record<string, string> }): Promise<CreatorProfileRow> {
    const handle = data.handle.trim().toLowerCase().replace(/^@+/, "");
    const exists = (await this.db.query("SELECT 1 FROM creator_profiles WHERE handle = $1 OR id = $2", [handle, userId])).rowCount;
    if (exists) throw AppError.validation("El usuario o handle ya se encuentra registrado como creador");

    const ins = await this.db.query<CreatorProfileRow>(
      `INSERT INTO creator_profiles (id, handle, display_name, bio, avatar_url, social_channels, tier, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'emerging', 'active')
       RETURNING *`,
      [userId, handle, data.display_name, data.bio ?? null, data.avatar_url ?? null, JSON.stringify(data.social_channels ?? {})],
    );
    return ins.rows[0]!;
  }

  /** Consulta el perfil público de un creador */
  async getProfile(handleOrId: string): Promise<CreatorProfileRow | null> {
    const isUuid = /^[0-9a-f-]{36}$/i.test(handleOrId);
    const { rows } = await this.db.query<CreatorProfileRow>(
      `SELECT * FROM creator_profiles WHERE ${isUuid ? "id = $1" : "lower(handle) = lower($1)"} AND status = 'active'`,
      [handleOrId],
    );
    return rows[0] ?? null;
  }

  /** Publicación de un video UGC con validación y slug único.
   *  Punto 44: entra en `pending_review`; nada llega al feed público sin pasar por moderación. */
  async publishVideo(input: PublishVideoInput): Promise<CreatorVideoRow> {
    const baseSlug = slugify(input.title);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const ins = await this.db.query<CreatorVideoRow>(
      `INSERT INTO creator_videos (
        creator_id, title, description, slug, video_url, thumbnail_url, duration_seconds,
        file_size_bytes, resolution, aspect_ratio, destination_name, category, tags,
        linked_listing_id, linked_listing_type, license_available, license_fee, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending_review')
       RETURNING *`,
      [
        input.creator_id, input.title, input.description ?? null, slug, input.video_url, input.thumbnail_url ?? null,
        input.duration_seconds, input.file_size_bytes, input.resolution ?? "1080p", input.aspect_ratio ?? "9:16",
        input.destination_name ?? null, input.category ?? null, input.tags ?? [], input.linked_listing_id ?? null,
        input.linked_listing_type ?? null, input.license_available ?? true, input.license_fee ?? 0,
      ],
    );
    return ins.rows[0]!;
  }

  /** Feed público de videos cortos con datos del creador */
  async listFeed(query: { category?: string; destination?: string; page: number; per_page: number }): Promise<{ rows: CreatorVideoRow[]; total: number }> {
    const params: unknown[] = [];
    const where = ["v.status = 'published'"];
    if (query.category) { params.push(query.category); where.push(`v.category = $${params.length}`); }
    if (query.destination) { params.push(`%${query.destination}%`); where.push(`v.destination_name ILIKE $${params.length}`); }

    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM creator_videos v WHERE ${where.join(" AND ")}`, params)).rows[0]!.n;

    const { rows } = await this.db.query<CreatorVideoRow>(
      `SELECT v.*, c.handle AS creator_handle, c.display_name AS creator_name, c.avatar_url AS creator_avatar
         FROM creator_videos v
         JOIN creator_profiles c ON c.id = v.creator_id
        WHERE ${where.join(" AND ")}
        ORDER BY v.created_at DESC
        LIMIT ${query.per_page} OFFSET ${(query.page - 1) * query.per_page}`,
      params,
    );
    return { rows, total };
  }

  // ───────────────────────────── Punto 41: identidad y reputación ─────────────────────────────

  /** Métricas agregadas que alimentan la reputación (producción, engagement y apelaciones). */
  async statsOf(creatorId: string): Promise<CreatorIdentityStats> {
    const videos = (await this.db.query<Omit<CreatorIdentityStats, "open_appeals" | "rejected_appeals" | "total_conversions">>(
      `SELECT count(*) FILTER (WHERE status = 'published')::int AS published_videos,
              count(*) FILTER (WHERE status = 'pending_review')::int AS pending_review,
              count(*) FILTER (WHERE status = 'rejected')::int AS rejected_videos,
              count(*) FILTER (WHERE status = 'archived')::int AS archived_videos,
              coalesce(sum(views_count), 0)::int AS total_views,
              coalesce(sum(likes_count), 0)::int AS total_likes,
              coalesce(sum(shares_count), 0)::int AS total_shares
         FROM creator_videos WHERE creator_id = $1`,
      [creatorId],
    )).rows[0]!;
    const appeals = (await this.db.query<{ open_appeals: number; rejected_appeals: number }>(
      `SELECT count(*) FILTER (WHERE status = 'pending')::int AS open_appeals,
              count(*) FILTER (WHERE status = 'rejected')::int AS rejected_appeals
         FROM creator_video_appeals WHERE creator_id = $1`,
      [creatorId],
    )).rows[0]!;
    const conversions = (await this.db.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM creator_video_events WHERE creator_id = $1 AND event_type = 'conversion'`,
      [creatorId],
    )).rows[0]!.n;
    return { ...videos, ...appeals, total_conversions: conversions };
  }

  /** Sellos otorgados, unidos a su definición publicada. */
  async sealsOf(creatorId: string): Promise<CreatorSealView[]> {
    const { rows } = await this.db.query<CreatorSealRow>("SELECT * FROM creator_seals WHERE creator_id = $1 ORDER BY awarded_at DESC", [creatorId]);
    return rows.map((s) => ({ ...s, ...(sealFor(s.seal_key) ?? {}) }));
  }

  /** Recalcula y persiste `reputation_score` a partir de la identidad y las métricas actuales. */
  async recomputeReputation(creatorId: string): Promise<ReputationResult> {
    const profile = await this.getProfile(creatorId);
    if (!profile) throw AppError.notFound("Perfil de creador no configurado");
    const [seals, stats] = await Promise.all([this.sealsOf(creatorId), this.statsOf(creatorId)]);
    const reputation = reputationScore({ ...profile, sealKeys: seals.map((s) => s.seal_key) }, stats);
    await this.db.query("UPDATE creator_profiles SET reputation_score = $2, updated_at = now() WHERE id = $1", [creatorId, reputation.score]);
    return reputation;
  }

  /** Centro de identidad del creador: perfil, sellos con criterios, reputación y audiencia. */
  async identity(userId: string): Promise<CreatorIdentity> {
    const profile = await this.getProfile(userId);
    if (!profile) throw AppError.notFound("Perfil de creador no configurado");
    const [seals, stats] = await Promise.all([this.sealsOf(userId), this.statsOf(userId)]);
    const reputation = reputationScore({ ...profile, sealKeys: seals.map((s) => s.seal_key) }, stats);
    return {
      profile: { ...profile, reputation_score: reputation.score },
      seals,
      catalog: SEALS,
      category_catalog: CATEGORIES,
      language_catalog: LANGUAGES,
      reputation,
      stats,
      audience: { verified: profile.audience_verified, verified_at: profile.audience_verified_at, metrics: profile.audience_metrics ?? {} },
    };
  }

  /** Identidad pública del creador; `null` si no existe, no está activo o su perfil es privado. */
  async publicIdentity(handleOrId: string): Promise<PublicCreatorIdentity | null> {
    const profile = await this.getProfile(handleOrId);
    if (!profile || !profile.public_profile) return null;
    const [seals, stats] = await Promise.all([this.sealsOf(profile.id), this.statsOf(profile.id)]);
    const reputation = reputationScore({ ...profile, sealKeys: seals.map((s) => s.seal_key) }, stats);
    return {
      profile: {
        id: profile.id, handle: profile.handle, display_name: profile.display_name, bio: profile.bio,
        avatar_url: profile.avatar_url, cover_url: profile.cover_url, tier: profile.tier, status: profile.status,
        categories: profile.categories, languages: profile.languages, audience_verified: profile.audience_verified,
        reputation_score: reputation.score, total_views: profile.total_views,
      },
      // Público: criterio y fecha, nunca la evidencia interna del sello.
      seals: seals.map((s) => ({ key: s.seal_key, label: s.label!, purpose: s.purpose!, criteria: s.criteria!, awarded_at: s.awarded_at, expires_at: s.expires_at })),
      categories: profile.categories ?? [],
      languages: profile.languages ?? [],
      audience_verified: profile.audience_verified,
      audience_metrics: profile.audience_metrics ?? {},
      reputation,
      stats,
    };
  }

  /** Actualiza la identidad declarada del creador validando las listas blancas publicadas. */
  async updateIdentity(userId: string, patch: CreatorIdentityPatch): Promise<CreatorProfileRow> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (patch.categories !== undefined) {
      const allowed = CATEGORIES as readonly string[];
      const bad = patch.categories.filter((c) => !allowed.includes(c));
      if (bad.length) throw AppError.validation(`Categoría no permitida: ${bad.join(", ")}`, { field: "categories", allowed: CATEGORIES });
      params.push([...new Set(patch.categories)]); sets.push(`categories = $${params.length}`);
    }
    if (patch.languages !== undefined) {
      const allowed = LANGUAGES as readonly string[];
      const bad = patch.languages.filter((l) => !allowed.includes(l));
      if (bad.length) throw AppError.validation(`Idioma no permitido: ${bad.join(", ")}`, { field: "languages", allowed: LANGUAGES });
      params.push([...new Set(patch.languages)]); sets.push(`languages = $${params.length}`);
    }
    if (patch.public_profile !== undefined) { params.push(patch.public_profile); sets.push(`public_profile = $${params.length}`); }
    if (patch.bio !== undefined) { params.push(patch.bio); sets.push(`bio = $${params.length}`); }
    if (patch.avatar_url !== undefined) { params.push(patch.avatar_url); sets.push(`avatar_url = $${params.length}`); }
    if (!sets.length) throw AppError.validation("No hay cambios de identidad que aplicar", { field: "body" });

    sets.push("updated_at = now()");
    params.push(userId);
    const { rows } = await this.db.query<CreatorProfileRow>(
      `UPDATE creator_profiles SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params,
    );
    if (!rows[0]) throw AppError.notFound("Perfil de creador no configurado");
    return rows[0];
  }

  /** Otorga un sello del catálogo (idempotente) y recalcula la reputación. */
  async awardSeal(creatorId: string, sealKey: string, evidence: Record<string, unknown> = {}): Promise<{ seal: CreatorSealView; reputation: ReputationResult }> {
    const definition = sealFor(sealKey);
    if (!definition) throw AppError.validation(`Sello desconocido: ${sealKey}`, { field: "seal_key", allowed: SEALS.map((s) => s.key) });
    const exists = (await this.db.query("SELECT 1 FROM creator_profiles WHERE id = $1", [creatorId])).rowCount;
    if (!exists) throw AppError.notFound("Perfil de creador");

    const ins = await this.db.query<CreatorSealRow>(
      `INSERT INTO creator_seals (creator_id, seal_key, evidence)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (creator_id, seal_key) DO UPDATE SET evidence = EXCLUDED.evidence
       RETURNING *`,
      [creatorId, sealKey, JSON.stringify(evidence)],
    );
    if (sealKey === "audience_verified") {
      await this.db.query(
        `UPDATE creator_profiles
            SET audience_verified = true, audience_verified_at = coalesce(audience_verified_at, now()), updated_at = now()
          WHERE id = $1`,
        [creatorId],
      );
    }
    const reputation = await this.recomputeReputation(creatorId);
    return { seal: { ...ins.rows[0]!, ...definition }, reputation };
  }

  // ───────────────────────────── Punto 44: apelación de contenido ─────────────────────────────

  /** El dueño apela una publicación rechazada, retirada o en revisión. Una sola apelación abierta. */
  async appealVideo(creatorId: string, videoId: string, reason: string): Promise<CreatorAppealRow & { review_notes: string | null; video_status: string; video_title: string }> {
    const video = (await this.db.query<CreatorVideoRow>("SELECT * FROM creator_videos WHERE id = $1", [videoId])).rows[0];
    if (!video) throw AppError.notFound("Publicación");
    if (video.creator_id !== creatorId) throw new AppError("FORBIDDEN", "Solo el creador dueño de la publicación puede apelarla", { code: "NOT_THE_OWNER" });
    if (!OPEN_APPEAL_STATUSES.includes(video.status)) {
      throw new AppError("BUSINESS_RULE", "Solo se pueden apelar publicaciones rechazadas, retiradas o en revisión", { code: "APPEAL_NOT_ALLOWED", status: video.status });
    }
    const open = (await this.db.query("SELECT 1 FROM creator_video_appeals WHERE video_id = $1 AND status = 'pending'", [videoId])).rowCount;
    if (open) throw new AppError("BUSINESS_RULE", "Ya existe una apelación abierta para esta publicación", { code: "APPEAL_ALREADY_OPEN" });

    try {
      const ins = await this.db.query<CreatorAppealRow>(
        `INSERT INTO creator_video_appeals (video_id, creator_id, reason, rule_code)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [videoId, creatorId, reason, video.moderation_rule ?? null],
      );
      return { ...ins.rows[0]!, review_notes: video.review_notes ?? null, video_status: video.status, video_title: video.title };
    } catch (e) {
      // El índice único parcial `uq_creator_appeal_open` cierra la carrera de dos apelaciones simultáneas.
      if (/uq_creator_appeal_open/.test((e as Error).message)) throw new AppError("BUSINESS_RULE", "Ya existe una apelación abierta para esta publicación", { code: "APPEAL_ALREADY_OPEN" });
      throw e;
    }
  }

  /** Apelaciones del creador, con el contexto de la publicación apelada. */
  async listAppeals(creatorId: string, query: { page?: number; per_page?: number } = {}): Promise<{ rows: (CreatorAppealRow & { video_title: string | null; video_status: string | null })[]; total: number }> {
    const page = query.page ?? 1, perPage = query.per_page ?? 20;
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM creator_video_appeals WHERE creator_id = $1", [creatorId])).rows[0]!.n;
    const { rows } = await this.db.query<CreatorAppealRow & { video_title: string | null; video_status: string | null }>(
      `SELECT a.*, v.title AS video_title, v.status AS video_status
         FROM creator_video_appeals a
         LEFT JOIN creator_videos v ON v.id = a.video_id
        WHERE a.creator_id = $1
        ORDER BY a.created_at DESC
        LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
      [creatorId],
    );
    return { rows, total };
  }

  /** Resuelve una apelación en una transacción y deja la entrada de auditoría dentro de ella.
   *  `accepted` devuelve la publicación a revisión; `rejected` conserva el estado. En ambos casos
   *  la resolución queda anotada en `review_notes` y el video pasa por moderación de nuevo si vuelve. */
  async resolveAppeal(moderatorId: string, appealId: string, status: "accepted" | "rejected", note: string, ip?: string): Promise<{ appeal: CreatorAppealRow; video: CreatorVideoRow | null }> {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const appeal = (await c.query<CreatorAppealRow>("SELECT * FROM creator_video_appeals WHERE id = $1 FOR UPDATE", [appealId])).rows[0];
      if (!appeal) throw AppError.notFound("Apelación");
      if (appeal.status !== "pending") throw new AppError("BUSINESS_RULE", "Esta apelación ya fue resuelta", { code: "APPEAL_ALREADY_RESOLVED", status: appeal.status });

      const updated = (await c.query<CreatorAppealRow>(
        `UPDATE creator_video_appeals
            SET status = $2, resolution_note = $3, resolved_by = $4, resolved_at = now()
          WHERE id = $1 RETURNING *`,
        [appealId, status, note, moderatorId],
      )).rows[0]!;

      const stamp = `Apelación ${status === "accepted" ? "aceptada" : "rechazada"}: ${note}`;
      const video = (await c.query<CreatorVideoRow>(
        `UPDATE creator_videos
            SET status = CASE WHEN $2 = 'accepted' AND status IN ('rejected', 'archived') THEN 'pending_review' ELSE status END,
                review_notes = left(coalesce(review_notes || E'\n', '') || $3, 2000),
                updated_at = now()
          WHERE id = $1 RETURNING *`,
        [appeal.video_id, status, stamp],
      )).rows[0] ?? null;

      await auditInsert(c, {
        actor: moderatorId,
        action: "creator.appeal_resolve",
        entity: "creator_video_appeal",
        id: appealId,
        meta: { status, note, video_id: appeal.video_id, video_status: video?.status ?? null },
        ip,
      });
      await c.query("COMMIT");
      return { appeal: updated, video };
    } catch (e) {
      await c.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      c.release();
    }
  }

  /** Telemetría de video (vistas, likes, conversiones) y acumulación de métricas */
  async trackVideoEvent(input: VideoEventInput): Promise<{ recorded: boolean }> {
    const ipHash = input.ip ? createHash("sha256").update(input.ip).digest("hex").slice(0, 16) : null;
    const v = (await this.db.query<{ creator_id: string }>("SELECT creator_id FROM creator_videos WHERE id = $1", [input.video_id])).rows[0];
    if (!v) throw AppError.notFound("Video");

    await this.db.query("BEGIN");
    try {
      await this.db.query(
        `INSERT INTO creator_video_events (video_id, creator_id, event_type, watch_time_seconds, session_id, user_id, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [input.video_id, v.creator_id, input.event_type, input.watch_time_seconds ?? 0, input.session_id ?? null, input.user_id ?? null, ipHash],
      );

      if (input.event_type === "view_complete" || input.event_type === "view_start") {
        await this.db.query("UPDATE creator_videos SET views_count = views_count + 1 WHERE id = $1", [input.video_id]);
        await this.db.query("UPDATE creator_profiles SET total_views = total_views + 1 WHERE id = $1", [v.creator_id]);
      } else if (input.event_type === "like") {
        await this.db.query("UPDATE creator_videos SET likes_count = likes_count + 1 WHERE id = $1", [input.video_id]);
      } else if (input.event_type === "share") {
        await this.db.query("UPDATE creator_videos SET shares_count = shares_count + 1 WHERE id = $1", [input.video_id]);
      }

      await this.db.query("COMMIT");
      return { recorded: true };
    } catch (e) {
      await this.db.query("ROLLBACK");
      throw e;
    }
  }

  /** Atribución de comisión a creador por venta originada en su video */
  async attributeConversion(videoId: string, orderTotal: number, source: string): Promise<void> {
    const v = (await this.db.query<{ creator_id: string; commission_rate: number }>(
      `SELECT v.creator_id, c.commission_rate
         FROM creator_videos v
         JOIN creator_profiles c ON c.id = v.creator_id
        WHERE v.id = $1`,
      [videoId],
    )).rows[0];

    if (!v) return;
    const rate = Number(v.commission_rate ?? 8) / 100;
    const commission = Math.round(orderTotal * rate * 100) / 100;

    if (commission > 0) {
      await this.db.query(
        `UPDATE creator_profiles
            SET balance_pending = balance_pending + $1, total_earnings = total_earnings + $1, updated_at = now()
          WHERE id = $2`,
        [commission, v.creator_id],
      );
      await this.db.query(
        `INSERT INTO creator_payouts (creator_id, amount, payout_source, status, notes)
         VALUES ($1, $2, 'affiliate_commission', 'pending', $3)`,
        [v.creator_id, commission, `Comisión venta atribuida al video ${videoId} (${source})`],
      );
    }
  }
}
