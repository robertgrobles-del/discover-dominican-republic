import type { GameGrantPort, GrantInput, GrantResult } from "../../contracts/game.js";
import type { ModerationDecision, ModerationPorts } from "../../contracts/moderation.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { refreshEntityRating } from "./reviews.js";

type Log = { warn: (o: object, m: string) => void };
type Grants = GameGrantPort & { safeGrant(input: GrantInput, log: Log): Promise<GrantResult | null> };
const notApplicable = (message: string): never => { throw new AppError("BUSINESS_RULE", message, { code: "ACTION_NOT_APPLICABLE" }); };

/** Decisiones de moderación sobre el contenido de la comunidad: reseñas, publicaciones, comentarios, medios y reportes. */
export function communityModeration(db: Db, game: Grants, log: Log): Pick<ModerationPorts["decide"], "review" | "post" | "comment" | "ugc_media" | "report"> & Pick<ModerationPorts, "closeReport"> {
  const review: ModerationDecision = async (id, action, reason) => {
    const rev = (await db.query<{ user_id: string; entity_type: string; entity_id: string }>("SELECT user_id, entity_type, entity_id FROM reviews WHERE id = $1", [id])).rows[0];
    if (!rev) throw AppError.notFound("Reseña");
    const approve = action === "approve";
    await db.query("UPDATE reviews SET status = $2, is_approved = $3, moderation_note = $4, report_count = CASE WHEN $3 THEN 0 ELSE report_count END WHERE id = $1", [id, approve ? "approved" : "rejected", approve, approve ? null : reason ?? null]);
    if (approve) await db.query("DELETE FROM review_reports WHERE review_id = $1", [id]);
    await refreshEntityRating(db, rev.entity_type, rev.entity_id);
    if (approve) await game.safeGrant({ userId: rev.user_id, action: "review_created", ref: id, description: "Reseña aprobada" }, log);
    return { authorId: rev.user_id, label: "tu reseña" };
  };

  const post: ModerationDecision = async (id, action) => {
    const row = (await db.query<{ user_id: string }>("SELECT user_id FROM social_posts WHERE id = $1 AND deleted_at IS NULL", [id])).rows[0];
    if (!row) throw AppError.notFound("Publicación");
    const approve = action === "approve";
    await db.query("UPDATE social_posts SET is_active = $2, report_count = CASE WHEN $2 THEN 0 ELSE report_count END WHERE id = $1", [id, approve]);
    return { authorId: row.user_id, label: "tu publicación" };
  };

  const comment: ModerationDecision = async (id, action) => {
    if (action === "approve") notApplicable("Un comentario sólo se puede retirar");
    const c = (await db.query<{ user_id: string; post_id: string }>("DELETE FROM social_comments WHERE id = $1 RETURNING user_id, post_id", [id])).rows[0];
    if (!c) throw AppError.notFound("Comentario");
    await db.query("UPDATE social_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [c.post_id]);
    return { authorId: c.user_id, label: "tu comentario" };
  };

  const ugcMedia: ModerationDecision = async (id, action) => {
    const m = (await db.query<{ user_id: string }>("UPDATE ugc_media SET status = $2 WHERE id = $1 RETURNING user_id", [id, action === "approve" ? "approved" : "rejected"])).rows[0];
    if (!m) throw AppError.notFound("Medio");
    return { authorId: m.user_id, label: "tu contenido" };
  };

  const closeReport: ModerationPorts["closeReport"] = async (id, status) =>
    (await db.query<{ user_id: string | null }>("UPDATE ugc_reports SET status = $2 WHERE id = $1 RETURNING user_id", [id, status])).rows[0] ?? null;

  const report: ModerationDecision = async (id, action) => {
    const rp = await closeReport(id, action === "reject" ? "ignorado" : "revisado");
    if (!rp) throw AppError.notFound("Reporte");
    return { authorId: rp.user_id, label: "tu reporte" };
  };

  return { review, post, comment, ugc_media: ugcMedia, report, closeReport };
}
