import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { GameService } from "./service.js";

const short = (n: string | null) => { const [a = "", b = ""] = (n ?? "").trim().split(/\s+/); return a ? `${a}${b ? ` ${b[0]!.toUpperCase()}.` : ""}` : "Explorador"; };
const MIN_LEVEL_TO_CREATE_GUILD = 3;

/** Coleccionables, retos de foto y gremios (docs §5.11). */
export class CommunityGame {
  constructor(private readonly db: Db, private readonly game: GameService) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  // ---------- Coleccionables ----------
  async collectibles(userId: string | null) {
    const { rows } = await this.db.query(
      `SELECT c.id, c.name, c.slug, c.short_description, c.collectible_type AS type, c.rarity, c.image_url, c.thumbnail_url, c.unlock_condition, c.total_supply, c.current_supply, c.xp_value, c.coin_value, c.season, c.is_tradeable, (u.id IS NOT NULL) AS owned
         FROM digital_collectibles c LEFT JOIN user_collectibles u ON u.collectible_id = c.id AND u.user_id = $1 WHERE c.is_active ORDER BY c.rarity DESC, c.name`, [userId],
    );
    return rows.map((c) => ({ ...c, remaining: c.total_supply === null ? null : Math.max(0, c.total_supply - c.current_supply), current_supply: undefined }));
  }
  async myCollectibles(userId: string) {
    return (await this.db.query("SELECT u.id AS ownership_id, c.id, c.name, c.rarity, c.image_url, c.collectible_type AS type, u.acquired_at, u.acquisition_method, u.is_favorite, u.display_order FROM user_collectibles u JOIN digital_collectibles c ON c.id = u.collectible_id WHERE u.user_id = $1 ORDER BY u.is_favorite DESC, u.display_order NULLS LAST, u.acquired_at DESC", [userId])).rows;
  }
  async updateMine(userId: string, collectibleId: string, patch: { is_favorite?: boolean; display_order?: number | null }) {
    const sets: string[] = [], vals: unknown[] = [userId, collectibleId];
    if (patch.is_favorite !== undefined) { vals.push(patch.is_favorite); sets.push(`is_favorite = $${vals.length}`); }
    if (patch.display_order !== undefined) { vals.push(patch.display_order); sets.push(`display_order = $${vals.length}`); }
    if (!sets.length) throw AppError.validation("No hay cambios que guardar");
    if (!(await this.db.query(`UPDATE user_collectibles SET ${sets.join(", ")} WHERE user_id = $1 AND collectible_id = $2`, vals)).rowCount) throw AppError.notFound("Coleccionable");
  }
  async removeMine(userId: string, collectibleId: string) {
    if (!(await this.db.query("DELETE FROM user_collectibles WHERE user_id = $1 AND collectible_id = $2", [userId, collectibleId])).rowCount) throw AppError.notFound("Coleccionable");
  }

  /** Reclamo verificado en el servidor: la condición se evalúa aquí y el suministro limitado se descuenta de forma atómica. */
  async claim(userId: string, collectibleId: string) {
    return this.tx(async (c) => {
      const col = (await c.query<{ id: string; name: string; unlock_condition: string | null; total_supply: number | null; xp_value: number; coin_value: number }>("SELECT id, name, unlock_condition, total_supply, coalesce(xp_value, 0) AS xp_value, coalesce(coin_value, 0) AS coin_value FROM digital_collectibles WHERE id = $1 AND is_active FOR UPDATE", [collectibleId])).rows[0];
      if (!col) throw AppError.notFound("Coleccionable");
      if (!col.unlock_condition) throw new AppError("BUSINESS_RULE", "Este coleccionable se entrega en eventos o de forma especial", { code: "NOT_CLAIMABLE" });
      if ((await c.query("SELECT 1 FROM user_collectibles WHERE user_id = $1 AND collectible_id = $2", [userId, collectibleId])).rowCount) throw new AppError("CONFLICT", "Ya lo tienes", { reason: "ALREADY_OWNED" });
      if (!(await this.game.meets(userId, col.unlock_condition, c))) throw new AppError("BUSINESS_RULE", "Todavía no cumples la condición", { code: "CONDITION_NOT_MET", condition: col.unlock_condition });
      const supply = await c.query("UPDATE digital_collectibles SET current_supply = current_supply + 1, updated_at = now() WHERE id = $1 AND (total_supply IS NULL OR current_supply < total_supply)", [collectibleId]);
      if (!supply.rowCount) throw new AppError("BUSINESS_RULE", "Se agotó el suministro", { code: "SOLD_OUT" });
      await c.query("INSERT INTO user_collectibles (user_id, collectible_id, acquisition_method) VALUES ($1,$2,'claim')", [userId, collectibleId]);
      const g = await this.game.grant({ userId, action: "collectible_claimed", ref: collectibleId, xp: col.xp_value, coins: col.coin_value, description: `Coleccionable: ${col.name}`, skipLimits: true }, c);
      return { collectible: col.name, granted: g.granted, level_up: g.level_up };
    });
  }

  // ---------- Retos de foto ----------
  private open = "is_active AND closed_at IS NULL AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())";
  async challenges() {
    return (await this.db.query(`SELECT id, title, description, theme, destination, starts_at, ends_at, xp_reward, coin_reward, (${this.open}) AS open, (SELECT count(*)::int FROM photo_submissions s WHERE s.challenge_id = photo_challenges.id AND s.is_approved) AS submissions FROM photo_challenges WHERE is_active ORDER BY created_at DESC LIMIT 50`)).rows;
  }
  async submissions(challengeId: string, viewer: string | null, page: number, perPage: number) {
    if (!(await this.db.query("SELECT 1 FROM photo_challenges WHERE id = $1 AND is_active", [challengeId])).rowCount) throw AppError.notFound("Reto");
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM photo_submissions WHERE challenge_id = $1 AND is_approved", [challengeId])).rows[0]!.n;
    const { rows } = await this.db.query(
      `SELECT s.id, s.user_id, s.image_url, s.caption, s.votes, s.is_winner, s.created_at, p.display_name, p.avatar_url, EXISTS (SELECT 1 FROM photo_votes v WHERE v.submission_id = s.id AND v.user_id = $2) AS voted_by_me
         FROM photo_submissions s LEFT JOIN profiles p ON p.id = s.user_id WHERE s.challenge_id = $1 AND s.is_approved ORDER BY s.is_winner DESC, s.votes DESC, s.created_at LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`, [challengeId, viewer],
    );
    return { rows: rows.map((x) => ({ id: x.id, image_url: x.image_url, caption: x.caption, votes: x.votes, is_winner: x.is_winner, voted_by_me: x.voted_by_me, author: { id: x.user_id, name: short(x.display_name), avatar_url: x.avatar_url }, created_at: x.created_at })), total };
  }
  async submit(userId: string, challengeId: string, input: { media_id: string; caption?: string }) {
    if (!(await this.db.query("SELECT 1 FROM users WHERE id = $1 AND email_verified_at IS NOT NULL", [userId])).rowCount) throw new AppError("FORBIDDEN", "Verifica tu correo para participar", { code: "EMAIL_NOT_VERIFIED" });
    const ch = (await this.db.query(`SELECT id FROM photo_challenges WHERE id = $1 AND ${this.open}`, [challengeId])).rows[0];
    if (!ch) throw new AppError("BUSINESS_RULE", "El reto no está abierto", { code: "CHALLENGE_CLOSED" });
    const m = (await this.db.query<{ id: string }>("SELECT id FROM media_assets WHERE id = $1 AND owner_id = $2 AND status IN ('ready', 'in_review')", [input.media_id, userId])).rows[0];
    if (!m) throw AppError.validation("La foto no existe o no es tuya; súbela primero con /media/upload-url");
    try {
      const row = (await this.db.query<{ id: string }>("INSERT INTO photo_submissions (challenge_id, user_id, image_url, caption, media_id) VALUES ($1,$2,$3,$4,$5) RETURNING id", [challengeId, userId, `/api/v1/media/files/${m.id}`, input.caption ?? null, m.id])).rows[0]!;
      return { id: row.id, status: "pending_review" };
    } catch (e) { if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya enviaste una foto a este reto", { reason: "ALREADY_SUBMITTED" }); throw e; }
  }
  async vote(userId: string, submissionId: string) {
    if (!(await this.db.query("SELECT 1 FROM users WHERE id = $1 AND email_verified_at IS NOT NULL", [userId])).rowCount) throw new AppError("FORBIDDEN", "Verifica tu correo para votar", { code: "EMAIL_NOT_VERIFIED" });
    return this.tx(async (c) => {
      const s = (await c.query<{ user_id: string; challenge_id: string }>("SELECT s.user_id, s.challenge_id FROM photo_submissions s JOIN photo_challenges ch ON ch.id = s.challenge_id WHERE s.id = $1 AND s.is_approved AND ch.is_active AND ch.closed_at IS NULL AND (ch.ends_at IS NULL OR ch.ends_at > now()) FOR UPDATE OF s", [submissionId])).rows[0];
      if (!s) throw AppError.notFound("Foto");
      if (s.user_id === userId) throw AppError.validation("No puedes votar tu propia foto");
      const ins = await c.query("INSERT INTO photo_votes (submission_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [submissionId, userId]);
      if (!ins.rowCount) throw new AppError("CONFLICT", "Ya votaste esta foto", { reason: "ALREADY_VOTED" });
      const votes = (await c.query<{ votes: number }>("UPDATE photo_submissions SET votes = votes + 1 WHERE id = $1 RETURNING votes", [submissionId])).rows[0]!.votes;
      return { votes };
    });
  }
  async moderate(submissionId: string, action: "approve" | "reject", note?: string) {
    return this.tx(async (c) => {
      const s = (await c.query<{ user_id: string; is_approved: boolean; media_id: string | null }>("SELECT user_id, is_approved, media_id FROM photo_submissions WHERE id = $1 FOR UPDATE", [submissionId])).rows[0];
      if (!s) throw AppError.notFound("Foto");
      if (action === "reject") { await c.query("DELETE FROM photo_submissions WHERE id = $1", [submissionId]); return { status: "rejected" as const, granted: { xp: 0, coins: 0 } }; }
      if (s.is_approved) throw new AppError("BUSINESS_RULE", "La foto ya está aprobada", { code: "INVALID_STATE" });
      await c.query("UPDATE photo_submissions SET is_approved = true, moderation_note = $2 WHERE id = $1", [submissionId, note ?? null]);
      if (s.media_id) await c.query("UPDATE media_assets SET status = 'ready' WHERE id = $1 AND status = 'in_review'", [s.media_id]); // la foto ya pasó la moderación: se puede mostrar
      const g = await this.game.grant({ userId: s.user_id, action: "photo_approved", ref: submissionId, description: "Foto de un reto aprobada" }, c);
      return { status: "approved" as const, granted: g.granted };
    });
  }
  /** Cierra el reto: gana la foto más votada (empate: la más antigua) y recibe la recompensa del reto. */
  async closeChallenge(challengeId: string) {
    return this.tx(async (c) => {
      const ch = (await c.query<{ closed_at: Date | null; xp_reward: number; coin_reward: number; title: string }>("SELECT closed_at, xp_reward, coin_reward, title FROM photo_challenges WHERE id = $1 FOR UPDATE", [challengeId])).rows[0];
      if (!ch) throw AppError.notFound("Reto");
      if (ch.closed_at) throw new AppError("BUSINESS_RULE", "El reto ya está cerrado", { code: "ALREADY_CLOSED" });
      const w = (await c.query<{ id: string; user_id: string; votes: number }>("SELECT id, user_id, votes FROM photo_submissions WHERE challenge_id = $1 AND is_approved ORDER BY votes DESC, created_at LIMIT 1", [challengeId])).rows[0];
      await c.query("UPDATE photo_challenges SET closed_at = now(), is_active = true WHERE id = $1", [challengeId]);
      if (!w) return { winner: null };
      await c.query("UPDATE photo_submissions SET is_winner = true WHERE id = $1", [w.id]);
      const g = await this.game.grant({ userId: w.user_id, action: "photo_challenge_win", ref: challengeId, xp: ch.xp_reward, coins: ch.coin_reward, description: `Ganador del reto: ${ch.title}`, skipLimits: true }, c);
      return { winner: { submission_id: w.id, user_id: w.user_id, votes: w.votes }, granted: g.granted };
    });
  }

  // ---------- Gremios ----------
  async guilds(userId: string | null) {
    const mine = userId ? (await this.db.query<{ guild_id: string; role: string }>("SELECT guild_id, role FROM guild_members WHERE user_id = $1", [userId])).rows[0] : undefined;
    const rows = (await this.db.query("SELECT id, name, slug, description, icon, region, member_count, total_xp, is_official, max_members FROM explorer_guilds ORDER BY is_official DESC, total_xp DESC, name LIMIT 100")).rows;
    return { guilds: rows.map((g) => ({ ...g, is_member: mine?.guild_id === g.id, my_role: mine?.guild_id === g.id ? (mine?.role ?? null) : null, full: g.member_count >= g.max_members })), my_guild: mine?.guild_id ?? null };
  }
  async createGuild(userId: string, input: { name: string; description?: string; icon?: string; region: string }) {
    const level = Number((await this.db.query<{ l: number }>("SELECT coalesce((SELECT current_level FROM user_gamification WHERE user_id = $1), 1) AS l", [userId])).rows[0]!.l);
    if (level < MIN_LEVEL_TO_CREATE_GUILD) throw new AppError("BUSINESS_RULE", `Necesitas el nivel ${MIN_LEVEL_TO_CREATE_GUILD} para crear un gremio`, { code: "LEVEL_TOO_LOW" });
    const slug = input.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    if (!slug) throw AppError.validation("El nombre no es válido");
    return this.tx(async (c) => {
      if ((await c.query("SELECT 1 FROM guild_members WHERE user_id = $1", [userId])).rowCount) throw new AppError("CONFLICT", "Ya perteneces a un gremio; sal de él primero", { reason: "ALREADY_IN_GUILD" });
      try {
        const g = (await c.query<{ id: string }>("INSERT INTO explorer_guilds (name, slug, description, icon, region, member_count, created_by) VALUES ($1,$2,$3,coalesce($4, '🏴'),$5,1,$6) RETURNING id", [input.name.trim(), slug, input.description ?? null, input.icon ?? null, input.region, userId])).rows[0]!;
        await c.query("INSERT INTO guild_members (guild_id, user_id, role) VALUES ($1,$2,'leader')", [g.id, userId]);
        return { id: g.id, slug };
      } catch (e) { if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe un gremio con ese nombre", { reason: "NAME_TAKEN" }); throw e; }
    });
  }
  async join(userId: string, guildId: string) {
    return this.tx(async (c) => {
      const g = (await c.query<{ member_count: number; max_members: number }>("SELECT member_count, max_members FROM explorer_guilds WHERE id = $1 FOR UPDATE", [guildId])).rows[0];
      if (!g) throw AppError.notFound("Gremio");
      if ((await c.query("SELECT 1 FROM guild_members WHERE user_id = $1", [userId])).rowCount) throw new AppError("CONFLICT", "Ya perteneces a un gremio", { reason: "ALREADY_IN_GUILD" });
      if (g.member_count >= g.max_members) throw new AppError("BUSINESS_RULE", "El gremio está lleno", { code: "GUILD_FULL" });
      await c.query("INSERT INTO guild_members (guild_id, user_id) VALUES ($1,$2)", [guildId, userId]);
      await c.query("UPDATE explorer_guilds SET member_count = member_count + 1 WHERE id = $1", [guildId]);
    });
  }
  /** Sale del gremio; el líder no puede irse dejando a otros sin líder: transfiere el mando al miembro más antiguo o, si queda solo, el gremio se disuelve. */
  async leave(userId: string, guildId: string) {
    return this.tx(async (c) => {
      const m = (await c.query<{ role: string }>("SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2 FOR UPDATE", [guildId, userId])).rows[0];
      if (!m) throw AppError.notFound("Membresía");
      await c.query("DELETE FROM guild_members WHERE guild_id = $1 AND user_id = $2", [guildId, userId]);
      const left = (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM guild_members WHERE guild_id = $1", [guildId])).rows[0]!.n;
      if (!left) { await c.query("DELETE FROM explorer_guilds WHERE id = $1 AND NOT is_official", [guildId]); await c.query("UPDATE explorer_guilds SET member_count = 0 WHERE id = $1", [guildId]); return { disbanded: true }; }
      await c.query("UPDATE explorer_guilds SET member_count = $2 WHERE id = $1", [guildId, left]);
      if (m.role === "leader") await c.query("UPDATE guild_members SET role = 'leader' WHERE id = (SELECT id FROM guild_members WHERE guild_id = $1 ORDER BY joined_at LIMIT 1)", [guildId]);
      return { disbanded: false };
    });
  }
}
