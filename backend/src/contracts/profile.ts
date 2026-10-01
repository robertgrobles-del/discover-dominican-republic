import type { PoolClient } from "pg";

/** Escrituras sobre `profiles` que otros dominios piden a `me`, su dueño. */
export interface ProfileAdminPort {
  /** Marca o levanta la suspensión visible en el perfil; `reason` nulo la levanta. */
  setSuspension(userId: string, reason: string | null, c: PoolClient): Promise<void>;
  /** Crea el perfil de una cuenta recién registrada, dentro de la transacción del registro. */
  createProfile(profile: { id: string; displayName: string; avatarUrl?: string | null }, c: PoolClient): Promise<void>;
  saveNotificationPrefs(userId: string, prefs: Record<string, Record<string, boolean>>): Promise<void>;
}
