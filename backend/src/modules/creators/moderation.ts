import type { ModerationDecision } from "../../contracts/moderation.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";

/**
 * Punto 44: aprobar publica, rechazar deja el motivo y retirar archiva. La regla que motivó la
 * decisión y quién/cuándo la tomó quedan en la publicación para que el creador pueda apelarla.
 */
export function creatorVideoModeration(db: Db): ModerationDecision {
  return async (id, action, reason, actor) => {
    const v = (await db.query<{ creator_id: string; status: string }>("SELECT creator_id, status FROM creator_videos WHERE id = $1", [id])).rows[0];
    if (!v) throw AppError.notFound("Publicación de creador");
    const status = action === "approve" ? "published" : action === "reject" ? "rejected" : "archived";
    const rule = `manual_${action}`;
    await db.query(
      `UPDATE creator_videos
          SET status = $2,
              review_notes = CASE WHEN $2 = 'published' THEN NULL WHEN $3::text IS NOT NULL THEN $3 ELSE review_notes END,
              moderation_rule = $4, moderated_at = now(), moderated_by = $5, updated_at = now()
        WHERE id = $1`,
      [id, status, reason ?? null, rule, actor],
    );
    return { authorId: v.creator_id, label: "tu video" };
  };
}
