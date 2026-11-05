import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";

/** Borrado de cuenta: sale de sus organizaciones; las reservas se conservan (contabilidad) sin ligarse a la cuenta y con el contacto enmascarado. */
export const eraseOperatorData: AccountErasureParticipant = async (c, userId) => {
  await c.query("DELETE FROM org_members WHERE user_id = $1", [userId]);
  // Correo y textos libres del cliente también se enmascaran (el correo es obligatorio: queda uno no entregable).
  await c.query(
    `UPDATE bookings SET user_id = NULL, contact_name = 'Cuenta eliminada', contact_phone = NULL,
            contact_email = 'borrado-' || id::text || '@deleted.invalid', notes = NULL, access_hash = NULL,
            cancel_reason = CASE WHEN cancelled_by = 'customer' THEN NULL ELSE cancel_reason END
      WHERE user_id = $1`, [userId]);
};
