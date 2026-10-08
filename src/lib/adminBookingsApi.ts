import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de `GET /api/v1/admin/bookings` (todas las reservas del sistema).
 * Contrato: `BookingDto` de backend/src/modules/operators/bookings.ts.
 */

export type AdminBookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type AdminBookingSource = "web" | "manual" | "marketplace";

export interface AdminBooking {
  id: string;
  reference: string;
  status: AdminBookingStatus;
  payment_status: string;
  source: AdminBookingSource;
  listing: { id: string; title: string; category: string };
  operator: { name: string; slug: string };
  date: string;
  check_out: string | null;
  guests: number;
  currency: string;
  total_price: number;
  amount_paid: number;
  balance_due: number;
  refund_amount: number;
  contact: { name: string; email: string; phone?: string };
  created_at: string;
}

export interface AdminBookingsMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface AdminBookingsFilters {
  status?: AdminBookingStatus;
  source?: AdminBookingSource;
  org_id?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const adminBookingsApi = {
  async list(filters: AdminBookingsFilters = {}): Promise<{ data: AdminBooking[]; meta: AdminBookingsMeta }> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    }
    const query = qs.toString();
    return fetchApi<{ data: AdminBooking[]; meta: AdminBookingsMeta }>(`/admin/bookings${query ? `?${query}` : ""}`);
  },
};
