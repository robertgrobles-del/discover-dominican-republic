import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";

/** Borrado de cuenta: la bandeja de notificaciones se elimina. */
export const eraseNotifications: AccountErasureParticipant = async (c, userId) => {
  await c.query("DELETE FROM notifications WHERE user_id = $1", [userId]);
};
