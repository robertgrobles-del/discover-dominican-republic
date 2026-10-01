import type { Pool, PoolClient } from "pg";

export type ModerationAction = "approve" | "reject" | "remove";
/** A quién avisar de la decisión y cómo nombrar lo moderado en el aviso ("tu reseña"). */
export interface ModerationOutcome { authorId: string | null; label: string }
/** Aplica la decisión sobre un contenido en el dominio que lo posee, con sus reglas propias (XP, calificaciones, archivos). */
export type ModerationDecision = (id: string, action: ModerationAction, reason: string | undefined, actor: string) => Promise<ModerationOutcome>;

/** Tipos de la cola unificada cuya decisión se delega al dominio dueño. */
export type DelegatedModerationType = "review" | "post" | "comment" | "media" | "ugc_media" | "report" | "creator_video";

/** Lo que la cola unificada de moderación necesita de los dominios dueños del contenido moderado. */
export interface ModerationPorts {
  /** Motivos automáticos por los que un texto merece revisión (enlaces, contacto, gritos…). */
  screenReview(text: string): string[];
  decide: Record<DelegatedModerationType, ModerationDecision>;
  /** Cierra un reporte; devuelve a quién avisar o null si el reporte no existe. */
  closeReport(id: string, status: "revisado" | "ignorado"): Promise<{ user_id: string | null } | null>;
}

/** Lo que el juego pide al dueño de los medios cuando una foto de reto supera la moderación. */
export interface MediaReviewPort {
  markReady(mediaId: string, c: Pool | PoolClient): Promise<void>;
}

/** Banderas de cuenta para revisión de seguridad; las administra `admin` y otros dominios sólo las levantan. */
export interface UserFlagsPort {
  /** Suma 1 al contador de la bandera (la crea en 1) y devuelve el valor resultante. */
  increment(userId: string, flagName: string, c?: Pool | PoolClient): Promise<number>;
  set(userId: string, flagName: string, value: string): Promise<void>;
}
