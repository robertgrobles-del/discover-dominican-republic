import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";

/** Borrado de cuenta: los tickets de soporte se conservan (estado, prioridad, fechas) sin datos de contacto ni texto libre. */
export const eraseSupportData: AccountErasureParticipant = async (c, userId) => {
  // Asunto y descripción son texto escrito por la persona y suelen traer datos personales: se reemplazan.
  await c.query("UPDATE support_tickets SET user_id = NULL, contact_name = NULL, contact_email = NULL, subject = '[eliminado]', description = '[eliminado]' WHERE user_id = $1", [userId]);
};
