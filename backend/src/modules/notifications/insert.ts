import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";

export const NOTIFICATION_TYPES = ["booking", "promo", "social", "system", "gamification"] as const;
export const CHANNELS = ["email", "push", "in_app"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export interface NotificationInput { type: NotificationType; title: string; message?: string | null; link?: string | null; data?: Record<string, unknown> | null }
export interface CreatedNotification { id: string; user_id: string; type: string; title: string; message: string | null; link: string | null; created_at: string }

/**
 * Crea la notificación en la bandeja si la persona no la desactivó (lo no configurado está activado, salvo las promociones) y avisa a las
 * conexiones abiertas con NOTIFY. Con un `client` de transacción, el aviso sólo sale si la transacción se confirma (NOTIFY es transaccional),
 * así se puede llamar desde dentro de otros procesos (p. ej. al subir de nivel) sin riesgo de avisar de algo que se revirtió.
 */
export async function insertNotification(c: Db | PoolClient, userId: string, n: NotificationInput): Promise<CreatedNotification | null> {
  const r = await c.query<CreatedNotification>(
    `INSERT INTO notifications (user_id, title, message, type, link, data)
     SELECT $1, $2, $3, $4, $5, $6 WHERE coalesce((SELECT (notification_prefs -> 'in_app' ->> $4)::boolean FROM profiles WHERE id = $1), $4 <> 'promo')
     RETURNING id, user_id, type, title, message, link, created_at`,
    [userId, n.title.slice(0, 200), n.message?.slice(0, 1000) ?? null, n.type, n.link ?? null, n.data ? JSON.stringify(n.data) : null],
  );
  const row = r.rows[0];
  if (!row) return null;
  // El aviso lleva lo justo (el límite de NOTIFY es de 8 000 bytes); el cliente puede pedir la bandeja para el detalle.
  await c.query("SELECT pg_notify('notif', $1)", [JSON.stringify({ ...row, message: row.message?.slice(0, 500) ?? null })]);
  return row;
}

/** Función que otros módulos reciben para avisar a alguien sin conocer el servicio de notificaciones (nunca lanza). */
export type NotifyFn = (userId: string | null | undefined, n: NotificationInput) => Promise<void>;
