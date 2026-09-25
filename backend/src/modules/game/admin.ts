import type { FastifyInstance } from "fastify";
import { AppError } from "../../lib/errors.js";
import { tableAdminRoutes, type TableCfg } from "../admin/tables.js";

const CONFIGS: TableCfg[] = [
  { table: "achievements", pk: "id", readonly: ["id", "created_at", "updated_at", "total_unlocked"], order: "display_order, name", label: "Logros" },
  { table: "gamification_levels", pk: "id", readonly: ["id", "created_at"], order: "level_number", label: "Niveles" },
  { table: "gamification_missions", pk: "id", readonly: ["id", "created_at"], order: "mission_type, name", label: "Misiones" },
  { table: "gamification_prizes", pk: "id", readonly: ["id", "created_at", "updated_at", "quantity_redeemed"], order: "coin_cost", label: "Premios" },
  { table: "gamification_rules", pk: "action", readonly: ["updated_at"], order: "action", label: "Reglas de puntos" },
  {
    table: "trivia_questions", pk: "id", readonly: ["id", "created_at", "updated_at", "times_answered", "times_correct"], order: "created_at DESC", label: "Preguntas de trivia",
    check: (data, existing) => {
      const options = (data.options ?? existing?.options) as unknown[] | undefined, idx = (data.correct_index ?? existing?.correct_index) as number | undefined;
      if (options !== undefined && (!Array.isArray(options) || options.length < 2 || options.length > 6 || options.some((o) => typeof o !== "string"))) throw AppError.validation("La pregunta necesita de 2 a 6 opciones de texto");
      if (options && idx !== undefined && (idx < 0 || idx >= options.length)) throw AppError.validation("correct_index no corresponde a ninguna opción");
    },
  },
  { table: "xp_milestones", pk: "id", readonly: ["id"], order: "xp_threshold", label: "Hitos de XP" },
  {
    table: "gamification_seasons", pk: "id", readonly: ["id", "created_at", "is_active"], order: "number DESC", label: "Temporadas",
    check: (data) => { if (data.starts_at && data.ends_at && String(data.ends_at) <= String(data.starts_at)) throw AppError.validation("La temporada debe terminar después de empezar"); },
  },
  { table: "gamification_leagues", pk: "id", readonly: ["id", "created_at"], order: "display_order", label: "Ligas" },
];

/** Configuración del juego (docs §5.17): logros, misiones, premios, niveles, reglas, trivia, hitos, temporadas y ligas. */
export const gameAdminRoutes = (app: FastifyInstance) => tableAdminRoutes(app, CONFIGS);
