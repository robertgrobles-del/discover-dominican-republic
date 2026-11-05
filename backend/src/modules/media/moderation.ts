import type { MediaReviewPort, ModerationDecision } from "../../contracts/moderation.js";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { deleteFiles, type MediaStorage } from "./routes.js";

/** Decisión de moderación sobre una imagen subida: aprobar la publica; rechazar borra los archivos y deja el motivo. */
export function mediaModeration(db: Db, storage: MediaStorage): ModerationDecision {
  return async (id, action, reason) => {
    const m = (await db.query<{ owner_id: string | null; status: string; storage_key: string | null; variants: unknown }>("SELECT owner_id, status, storage_key, variants FROM media_assets WHERE id = $1", [id])).rows[0];
    if (!m) throw AppError.notFound("Archivo");
    if (action === "approve") {
      if (m.status !== "in_review") throw new AppError("BUSINESS_RULE", "Sólo se aprueban las imágenes en revisión", { code: "ACTION_NOT_APPLICABLE" });
      await db.query("UPDATE media_assets SET status = 'ready', moderation_note = NULL WHERE id = $1", [id]);
    } else {
      // Rechazar sólo lo que está en revisión; retirar, además, lo ya publicado de los propósitos moderados (fotos de usuarios).
      // Nunca imágenes del CMS, de fichas ni de otros propósitos: borrar sus archivos no tiene vuelta atrás.
      const done = (await db.query(
        `UPDATE media_assets SET status = 'rejected', moderation_note = $2 WHERE id = $1
           AND (status = 'in_review' OR ($3 AND status = 'ready' AND purpose IN ('review_photo', 'ugc')))`,
        [id, reason ?? null, action === "remove"],
      )).rowCount;
      if (!done) throw new AppError("BUSINESS_RULE", "Esta imagen no está en revisión", { code: "ACTION_NOT_APPLICABLE" });
      await deleteFiles(storage, m.storage_key, m.variants);
    }
    return { authorId: m.owner_id, label: "tu foto" };
  };
}

export const mediaReview: MediaReviewPort = {
  async markReady(mediaId, c) {
    await c.query("UPDATE media_assets SET status = 'ready' WHERE id = $1 AND status = 'in_review'", [mediaId]);
  },
};
