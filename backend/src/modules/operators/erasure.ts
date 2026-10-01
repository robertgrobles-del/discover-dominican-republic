import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";

/** Borrado de cuenta: sale de sus organizaciones; las reservas se conservan (contabilidad) sin ligarse a la cuenta y con el contacto enmascarado. */
export const eraseOperatorData: AccountErasureParticipant = async (c, userId) => {
  await c.query("DELETE FROM org_members WHERE user_id = $1", [userId]);
  await c.query("UPDATE bookings SET user_id = NULL, contact_name = 'Cuenta eliminada', contact_phone = NULL WHERE user_id = $1", [userId]);
};
