import { fetchApi } from "@/lib/fastifyClient";

/**
 * Reservas del viajero en el backend (`/me/bookings`, `/bookings`). El servidor decide precio, estado y reembolsos;
 * aquí se cotizan, se crean, se leen y se pide la cancelación o cambio de fecha.
 */

export interface ApiBooking {
  id: string;
  reference: string;
  status: string;
  payment_status: string;
  listing: { id: string; title: string; category: string };
  operator: { name: string; slug: string };
  date: string;
  check_out: string | null;
  guests: number;
  currency: string;
  total_price: number;
  balance_due: number;
  refund_amount: number;
  notes?: string | null;
  created_at?: string;
}

/** Reserva con la forma que pinta la página "Mis reservas". */
export interface TravelerBooking {
  id: string;
  reference: string;
  status: string;
  item_name: string;
  item_type: string;
  item_image: string | null;
  check_in: string;
  check_out: string | null;
  guests: number;
  total_price: number;
  currency: string;
  operator: string;
}

export interface CreateBookingPayload {
  request: {
    listing_id: string;
    room_id?: string;
    date: string;
    check_out?: string;
    time?: string;
    adults: number;
    children?: number;
    infants?: number;
    extras?: string[];
    promo_code?: string;
  };
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  payment_mode: "pay_now" | "deposit" | "pay_later";
  payment_method_token?: string;
  locale?: "es" | "en";
}

export interface QuoteBookingRequest {
  listing_id: string;
  room_id?: string;
  date: string;
  check_out?: string;
  time?: string;
  adults: number;
  children?: number;
  infants?: number;
  extras?: string[];
  promo_code?: string;
}

export interface BookingQuoteResult {
  available: boolean;
  base_price: number;
  extras_price: number;
  discount: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  deposit_required: number;
  cancellation_policy: string;
  reasons?: string[];
}

const toBooking = (b: ApiBooking): TravelerBooking => ({
  id: b.id,
  reference: b.reference,
  // "En curso" se muestra junto a las confirmadas: la página sólo distingue activas de pasadas.
  status: b.status === "in_progress" ? "confirmed" : b.status,
  item_name: b.listing?.title || "Servicio Turístico",
  item_type: b.listing?.category || "Experiencia",
  item_image: null,
  check_in: b.date,
  check_out: b.check_out,
  guests: b.guests,
  total_price: b.total_price,
  currency: b.currency || "USD",
  operator: b.operator?.name || "Operador Certificado",
});

function randomIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `booking-${crypto.randomUUID()}`;
  }
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const bookingsApi = {
  /** Cotiza una reserva en el servidor obteniendo disponibilidad y precios reales */
  async quote(req: QuoteBookingRequest): Promise<BookingQuoteResult> {
    const res = await fetchApi<{ data: BookingQuoteResult }>("/bookings/quote", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  /** Crea una nueva reserva con Idempotency-Key obligatoria */
  async create(payload: CreateBookingPayload): Promise<{ booking: ApiBooking; access_token?: string; replayed: boolean }> {
    const res = await fetchApi<{ data: { booking: ApiBooking; access_token?: string; replayed: boolean } }>("/bookings", {
      method: "POST",
      headers: {
        "Idempotency-Key": randomIdempotencyKey(),
      },
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /** Obtiene las reservas del usuario autenticado */
  async mine(): Promise<TravelerBooking[]> {
    return (await fetchApi<{ data: ApiBooking[] }>("/me/bookings?per_page=50")).data.map(toBooking);
  },

  /** Obtiene los detalles de una reserva específica */
  async get(id: string, token?: string): Promise<ApiBooking> {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const res = await fetchApi<{ data: ApiBooking }>(`/bookings/${id}${query}`);
    return res.data;
  },

  /** Cancela según la política de la reserva. Devuelve lo que el servidor reembolsa. */
  async cancel(id: string, reason?: string, token?: string): Promise<{ refund_amount: number; currency: string }> {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const { data } = await fetchApi<{ data: ApiBooking }>(`/bookings/${id}/cancel${query}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return { refund_amount: data.refund_amount ?? 0, currency: data.currency };
  },

  /** Cambia la fecha de una reserva */
  async changeDate(
    id: string,
    params: { date: string; check_out?: string; time?: string; dry_run?: boolean },
    token?: string
  ): Promise<any> {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const res = await fetchApi<{ data: any }>(`/bookings/${id}/change-date${query}`, {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  },

  /** Paga el saldo pendiente de una reserva */
  async payBalance(id: string, paymentMethodToken: string, token?: string): Promise<{ booking: ApiBooking }> {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const res = await fetchApi<{ data: { booking: ApiBooking } }>(`/bookings/${id}/pay-balance${query}`, {
      method: "POST",
      body: JSON.stringify({ payment_method_token: paymentMethodToken }),
    });
    return res.data;
  },
};
