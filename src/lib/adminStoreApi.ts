import { fetchApi } from "@/lib/fastifyClient";

/**
 * Pedidos de la tienda, cuentas bancarias para depósitos y eventos propuestos, contra el backend
 * (`/admin/store/orders…`, `/admin/store_bank_accounts…`, `/admin/events…`). Los tipos copian la respuesta real.
 */

export type StoreOrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "return_requested";

export interface AdminStoreOrderItem { product_id: string | null; name: string; size: string | null; color: string | null; unit_price: number; quantity: number; line_total: number }

export interface AdminStoreOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string | null;
  address: string;
  city: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  status: StoreOrderStatus;
  payment_status: "unpaid" | "paid" | "partial" | "refunded";
  payment_method: "card" | "transfer";
  amount_paid: number;
  transfer_expires_at: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  created_at: string;
  items: AdminStoreOrderItem[];
}

export interface PageMeta { page: number; per_page: number; total: number; total_pages: number }

export async function listStoreOrders(params: { status?: StoreOrderStatus; q?: string; page?: number }): Promise<{ data: AdminStoreOrder[]; meta: PageMeta }> {
  const query = new URLSearchParams({ per_page: "25", page: String(params.page ?? 1) });
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  return fetchApi<{ data: AdminStoreOrder[]; meta: PageMeta }>(`/admin/store/orders?${query}`);
}

/** Confirma que el depósito llegó: registra el pago y el pedido pasa a pagado. */
export async function confirmOrderTransfer(orderId: string, input: { reference: string; amount?: number }): Promise<AdminStoreOrder> {
  return (await fetchApi<{ data: AdminStoreOrder }>(`/admin/store/orders/${orderId}/confirm-transfer`, { method: "POST", body: JSON.stringify(input) })).data;
}

export async function setStoreOrderStatus(orderId: string, input: { status: "processing" | "shipped" | "delivered" | "cancelled"; courier_name?: string; tracking_number?: string; reason?: string }): Promise<AdminStoreOrder> {
  return (await fetchApi<{ data: AdminStoreOrder }>(`/admin/store/orders/${orderId}`, { method: "PATCH", body: JSON.stringify(input) })).data;
}

// ---------- Cuentas bancarias ----------

export interface StoreBankAccount {
  id: string;
  bank_name: string;
  account_type: "corriente" | "ahorros";
  account_number: string;
  holder_name: string;
  holder_document: string | null;
  currency: string;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
}

export type StoreBankAccountInput = Omit<StoreBankAccount, "id">;

export async function listBankAccounts(): Promise<StoreBankAccount[]> {
  return (await fetchApi<{ data: StoreBankAccount[] }>("/admin/store_bank_accounts?per_page=100")).data;
}

export async function saveBankAccount(id: string | null, input: Partial<StoreBankAccountInput>): Promise<StoreBankAccount> {
  const res = await fetchApi<{ data: StoreBankAccount }>(id ? `/admin/store_bank_accounts/${id}` : "/admin/store_bank_accounts", { method: id ? "PATCH" : "POST", body: JSON.stringify(input) });
  return res.data;
}

export async function deleteBankAccount(id: string): Promise<void> {
  await fetchApi(`/admin/store_bank_accounts/${id}`, { method: "DELETE" });
}

/** Cuentas activas, tal como las ve quien compra. */
export async function listPublicBankAccounts(): Promise<Omit<StoreBankAccount, "is_active" | "sort_order">[]> {
  return (await fetchApi<{ data: Omit<StoreBankAccount, "is_active" | "sort_order">[] }>("/store/bank-accounts")).data;
}

// ---------- Eventos propuestos ----------

export interface EventSubmissionInfo {
  organizer_name: string;
  organizer_phone: string | null;
  ticket_mode: "none" | "free_pass" | "external";
  ticket_url: string | null;
  start_time: string | null;
  price_info: string | null;
}

export interface PendingEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  status: "draft" | "in_review" | "published" | "archived";
  created_at: string;
  extras: { submission?: EventSubmissionInfo } | null;
}

export async function listEventsByStatus(status: PendingEvent["status"]): Promise<PendingEvent[]> {
  return (await fetchApi<{ data: PendingEvent[] }>(`/admin/events?status=${status}&per_page=100`)).data;
}

/** `publish` lo hace público; `archive` lo descarta sin borrarlo. */
export async function reviewEvent(id: string, action: "publish" | "archive"): Promise<void> {
  await fetchApi(`/admin/events/${id}/${action}`, { method: "POST" });
}
