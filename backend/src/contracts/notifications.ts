import type { Pool, PoolClient } from "pg";

export const NOTIFICATION_TYPES = ["booking", "promo", "social", "system", "gamification"] as const;
export const CHANNELS = ["email", "push", "in_app"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export interface NotificationInput { type: NotificationType; title: string; message?: string | null; link?: string | null; data?: Record<string, unknown> | null }
export interface CreatedNotification { id: string; user_id: string; type: string; title: string; message: string | null; link: string | null; created_at: string }

/** Función que otros módulos reciben para avisar a alguien sin conocer el servicio de notificaciones (nunca lanza). */
export type NotifyFn = (userId: string | null | undefined, n: NotificationInput) => Promise<void>;

/**
 * Deja la notificación dentro de la transacción del llamador: sólo se entrega si esa transacción se confirma.
 * Mientras la bandeja comparta base con el dominio que avisa es un INSERT; al separarla pasa a ser su outbox.
 */
export type NotifyInTransaction = (c: Pool | PoolClient, userId: string, n: NotificationInput) => Promise<CreatedNotification | null>;
