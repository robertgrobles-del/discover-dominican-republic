import type { Pool, PoolClient } from "pg";

type Queryable = Pool | PoolClient;

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
  /** `suspended` no toca cuentas borradas; `active` sólo reactiva las suspendidas. */
  setAccountStatus(userId: string, status: "suspended" | "active", c?: Queryable): Promise<void>;
  setLocale(userId: string, locale: string): Promise<void>;
  setMarketingOptIn(userId: string, optIn: boolean): Promise<void>;
  /** Anonimiza la cuenta y cierra sus sesiones (Ley 172-13). */
  anonymizeAccount(userId: string, c: PoolClient): Promise<void>;
}
