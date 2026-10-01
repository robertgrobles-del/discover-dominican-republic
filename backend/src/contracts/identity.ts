import type { Pool, PoolClient } from "pg";

type Queryable = Pool | PoolClient;

export interface TemporaryRole { user_id: string; role: string; expires_at: Date }

/**
 * Escrituras sobre cuentas, roles y sesiones que otros dominios piden a `auth`, único dueño de
 * `users`, `user_roles` y `refresh_tokens`. Con `c` la operación participa en la transacción del llamador.
 */
export interface IdentityAdminPort {
  /** Cuentas activas con un rol global (para avisos al personal). */
  userIdsWithRole(role: string): Promise<string[]>;
  revokeSessions(userId: string, c?: Queryable): Promise<void>;
  revokeSessionFamily(familyId: string, c?: Queryable): Promise<void>;
  /** Sesión de soporte: vive junto a las demás para que `authenticate` la compruebe, sin token de refresco entregable. */
  createSupportSession(input: { userId: string; familyId: string; adminId: string; ip: string; expiresAt: Date }): Promise<void>;
  resetTwoFactor(userId: string, c?: Queryable): Promise<void>;
  replaceRoles(userId: string, roles: string[], c: PoolClient): Promise<void>;
  grantRole(userId: string, role: string, c?: Queryable): Promise<void>;
  revokeRole(userId: string, role: string, c?: Queryable): Promise<void>;
  /**
   * Concede un rol por tiempo limitado, con motivo y responsable. Devuelve false si la persona ya tiene
   * ese rol de forma permanente (no se convierte en temporal por accidente).
   */
  grantTemporaryRole(input: { userId: string; role: string; expiresAt: Date; reason: string; grantedBy: string }, c?: Queryable): Promise<boolean>;
  /** Roles temporales que vencen dentro de `withinHours` y aún no se han avisado; los marca como avisados. */
  claimExpiringRoleNotices(withinHours: number): Promise<TemporaryRole[]>;
  /** Retira los roles vencidos, cierra las sesiones de esas cuentas y lo deja auditado. */
  expireTemporaryRoles(): Promise<TemporaryRole[]>;
  /** Roles vigentes de una cuenta con su vencimiento (null si es permanente). */
  rolesWithExpiry(userId: string): Promise<{ role: string; expires_at: Date | null; grant_reason: string | null; granted_by: string | null }[]>;
  /** Fecha de la última sesión iniciada por cada cuenta (ausente si nunca inició). */
  lastSessionAt(userIds: string[]): Promise<Map<string, Date>>;
  /** `suspended` no toca cuentas borradas; `active` sólo reactiva las suspendidas. */
  setAccountStatus(userId: string, status: "suspended" | "active", c?: Queryable): Promise<void>;
  setLocale(userId: string, locale: string): Promise<void>;
  setMarketingOptIn(userId: string, optIn: boolean): Promise<void>;
  /** Anonimiza la cuenta y cierra sus sesiones (Ley 172-13). */
  anonymizeAccount(userId: string, c: PoolClient): Promise<void>;
}
