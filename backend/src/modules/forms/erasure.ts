import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";

/** Borrado de cuenta: los tickets de soporte se conservan sin datos de contacto. */
export const eraseSupportData: AccountErasureParticipant = async (c, userId) => {
  await c.query("UPDATE support_tickets SET user_id = NULL, contact_name = NULL, contact_email = NULL WHERE user_id = $1", [userId]);
};
