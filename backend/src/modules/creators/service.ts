import { createHash } from "node:crypto";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";

export interface CreatorProfileRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  tier: string;
  status: string;
  commission_rate: number;
  total_views: number;
  total_earnings: number;
  balance_available: number;
  balance_pending: number;
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

const slugify = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";

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

  /** Publicación de un video UGC con validación y slug único */
  async publishVideo(input: PublishVideoInput): Promise<CreatorVideoRow> {
    const baseSlug = slugify(input.title);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const ins = await this.db.query<CreatorVideoRow>(
      `INSERT INTO creator_videos (
        creator_id, title, description, slug, video_url, thumbnail_url, duration_seconds,
        file_size_bytes, resolution, aspect_ratio, destination_name, category, tags,
        linked_listing_id, linked_listing_type, license_available, license_fee, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'published')
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
