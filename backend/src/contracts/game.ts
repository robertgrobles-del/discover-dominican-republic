import type { PoolClient } from "pg";

export type DenyReason = "no_rule" | "inactive" | "daily_cap" | "cooldown" | "duplicate";
export interface GrantInput {
  userId: string;
  action: string;
  /** Referencia única de lo que originó la acción (id de reseña, de publicación…); con `unique_per_ref` impide repetir. */
  ref?: string | null;
  description?: string;
  /** Usa estas cifras en lugar de las de la regla (recompensas de misiones, trivia, ajustes). Nunca vienen del cliente. */
  xp?: number;
  coins?: number;
  /** No aplica topes diarios, enfriamiento ni unicidad (recompensas ya validadas por su propio módulo). */
  skipLimits?: boolean;
  /** Evita cascadas: al otorgar la recompensa de una misión o logro no se vuelven a evaluar misiones. */
  noMissions?: boolean;
  noAchievements?: boolean;
}
export interface GrantResult {
  granted: { xp: number; coins: number };
  reason?: DenyReason;
  total_xp: number;
  coins: number;
  level: number;
  level_up: { from: number; to: number; title: string } | null;
  missions_completed: { id: string; name: string; xp: number; coins: number }[];
  achievements_unlocked: { id: string; name: string; icon: string }[];
  milestones_reached: { id: string; name: string; coins: number }[];
}

/** Única puerta de concesión de XP y monedas para otros dominios. Con `client` participa en la transacción del llamador. */
export interface GameGrantPort {
  grant(input: GrantInput, client?: PoolClient): Promise<GrantResult>;
}
