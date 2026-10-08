import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente para envíos de premios físicos (/api/v1/admin/gamification/shipments)
 */

export interface AdminRewardShipment {
  id: string;
  user_id: string;
  status: "pending" | "packed" | "shipped" | "delivered";
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  courier_name?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  created_at: string;
  prize?: string | null;
}

export const adminShipmentsApi = {
  /** Lista envíos de premios físicos con filtro opcional de estado */
  async listShipments(status?: string): Promise<AdminRewardShipment[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await fetchApi<{ data: AdminRewardShipment[] }>(`/admin/gamification/shipments${query}`);
    return res.data;
  },

  /** Actualiza el estado y datos de guía de un envío */
  async updateShipment(
    id: string,
    payload: {
      status: "packed" | "shipped" | "delivered";
      courier_name?: string;
      tracking_number?: string;
    }
  ): Promise<void> {
    await fetchApi(`/admin/gamification/shipments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
