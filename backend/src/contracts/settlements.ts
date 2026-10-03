export interface UnsettledBooking { id: string; reference: string; currency: string; amount_paid: number }

/** Lectura que `operators`, dueño de reservas y liquidaciones, ofrece a finanzas para la conciliación. */
export interface SettlementReaderPort {
  /** Reservas completadas y cobradas, con fecha de servicio en el rango, que aún no entran en ninguna liquidación. */
  unsettledBookings(from: string, to: string, limit: number): Promise<UnsettledBooking[]>;
}
