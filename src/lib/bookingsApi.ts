import { fetchApi } from "@/lib/fastifyClient";

/**
 * Reservas del viajero en el backend (`/me/bookings`). El servidor decide precio, estado y reembolsos; aquí sólo
 * se leen y se pide la cancelación.
 */

interface ApiBooking {
  id: string; reference: string; status: string; payment_status: string; listing: { id: string; title: string; category: string }; operator: { name: string; slug: string };
  date: string; check_out: string | null; guests: number; currency: string; total_price: number; balance_due: number; refund_amount: number;
}

/** Reserva con la forma que pinta la página "Mis reservas". */
export interface TravelerBooking {
  id: string; reference: string; status: string; item_name: string; item_type: string; item_image: string | null;
  check_in: string; check_out: string | null; guests: number; total_price: number; currency: string; operator: string;
}

const toBooking = (b: ApiBooking): TravelerBooking => ({
  id: b.id, reference: b.reference,
  // "En curso" se muestra junto a las confirmadas: la página sólo distingue activas de pasadas.
  status: b.status === "in_progress" ? "confirmed" : b.status,
  item_name: b.listing.title, item_type: b.listing.category, item_image: null,
  check_in: b.date, check_out: b.check_out, guests: b.guests, total_price: b.total_price, currency: b.currency, operator: b.operator.name,
});

export const bookingsApi = {
  async mine(): Promise<TravelerBooking[]> {
    return (await fetchApi<{ data: ApiBooking[] }>("/me/bookings?per_page=50")).data.map(toBooking);
  },
  /** Cancela según la política de la reserva. Devuelve lo que el servidor reembolsa. */
  async cancel(id: string): Promise<{ refund_amount: number; currency: string }> {
    const { data } = await fetchApi<{ data: ApiBooking }>(`/bookings/${id}/cancel`, { method: "POST", body: JSON.stringify({}) });
    return { refund_amount: data.refund_amount ?? 0, currency: data.currency };
  },
};
