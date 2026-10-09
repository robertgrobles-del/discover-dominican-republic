import { fetchApi } from "@/lib/fastifyClient";

export interface PageMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ==========================================
// 1. TICKETS DE SOPORTE (/admin/support/...)
// ==========================================
export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicketItem {
  id: string;
  reference: string;
  subject: string;
  description?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
  display_name: string | null;
  messages: number;
  first_response_at: string | null;
}

export interface SupportMessage {
  id: string;
  message: string;
  is_admin_reply: boolean;
  internal: boolean;
  sender_id: string;
  sender_name: string | null;
  created_at: string;
}

export interface SupportTicketDetail extends SupportTicketItem {
  messages: any;
  messages_list?: SupportMessage[];
}

export interface SupportStats {
  unassigned: number;
  oldest_hours: number | null;
  avg_first_response_hours: number | null;
  resolved_30d: number;
  by_status?: Record<string, number>;
  by_priority?: Record<string, number>;
}

export async function getAdminSupportTickets(params: {
  page?: number;
  per_page?: number;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  assigned_to?: string;
  unassigned?: boolean;
  q?: string;
}): Promise<{ data: SupportTicketItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 30),
  });
  if (params.status) query.set("status", params.status);
  if (params.priority) query.set("priority", params.priority);
  if (params.assigned_to) query.set("assigned_to", params.assigned_to);
  if (params.unassigned) query.set("unassigned", "true");
  if (params.q) query.set("q", params.q);

  return fetchApi<{ data: SupportTicketItem[]; meta: PageMeta }>(`/admin/support/tickets?${query}`);
}

export async function getAdminSupportTicket(id: string): Promise<SupportTicketDetail> {
  const res = await fetchApi<{ data: any }>(`/admin/support/tickets/${id}`);
  return res.data;
}

export async function updateAdminSupportTicket(
  id: string,
  data: { status?: SupportTicketStatus; priority?: SupportTicketPriority; assigned_to?: string | null }
): Promise<SupportTicketDetail> {
  const res = await fetchApi<{ data: SupportTicketDetail }>(`/admin/support/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function sendAdminSupportMessage(
  id: string,
  message: string,
  internal = false
): Promise<{ id: string; internal: boolean }> {
  const res = await fetchApi<{ data: { id: string; internal: boolean } }>(`/admin/support/tickets/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message, internal }),
  });
  return res.data;
}

export async function getAdminSupportStats(): Promise<SupportStats> {
  const res = await fetchApi<{ data: SupportStats }>(`/admin/support/stats`);
  return res.data;
}

// ==========================================
// 2. CONCURSOS Y SORTEOS (/admin/contests...)
// ==========================================
export interface AdminContest {
  slug: string;
  title: string;
  description?: string | null;
  rules?: string | null;
  prize?: string | null;
  image_url?: string | null;
  starts_at: string;
  ends_at: string;
  status: "draft" | "published" | "closed";
  max_entries?: number | null;
  min_age?: number | null;
  open?: boolean;
}

export interface ContestRegistration {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  age: string | null;
  created_at: string;
}

export async function getAdminContests(include: "current" | "past" = "current"): Promise<AdminContest[]> {
  const res = await fetchApi<{ data: AdminContest[] }>(`/contests?include=${include}`);
  return res.data;
}

export async function createAdminContest(data: {
  slug: string;
  title: string;
  description?: string;
  rules?: string;
  prize?: string;
  image_url?: string;
  starts_at: string;
  ends_at: string;
  status: "draft" | "published";
  max_entries?: number;
  min_age?: number;
}): Promise<{ slug: string }> {
  const res = await fetchApi<{ data: { slug: string } }>("/admin/contests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getAdminContestRegistrations(
  slug: string,
  page = 1,
  per_page = 50
): Promise<{ data: ContestRegistration[]; meta: PageMeta }> {
  return fetchApi<{ data: ContestRegistration[]; meta: PageMeta }>(
    `/admin/contests/${slug}/registrations?page=${page}&per_page=${per_page}`
  );
}

export async function drawAdminContestWinners(
  slug: string,
  winnersCount = 1
): Promise<{ winners: string[] }> {
  const res = await fetchApi<{ data: { winners: string[] } }>(`/admin/contests/${slug}/draw`, {
    method: "POST",
    body: JSON.stringify({ winners: winnersCount }),
  });
  return res.data;
}

// ==========================================
// 3. ENCUESTAS (/admin/surveys...)
// ==========================================
export interface SurveyQuestion {
  id: string;
  text: string;
  type: "rating" | "choice" | "multi" | "text" | "nps";
  options?: string[];
  required?: boolean;
}

export interface AdminSurvey {
  id: string;
  slug: string;
  title: string;
  kind: "general" | "post_trip" | "nps";
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
}

export interface SurveyResults {
  responses: number;
  nps: {
    score: number;
    promoters: number;
    detractors: number;
    passives: number;
    count: number;
  } | null;
  questions: Array<{
    id: string;
    type: string;
    answers: number;
    average?: number | null;
    distribution?: Record<string, number>;
  }>;
}

export async function getPublicSurveys(): Promise<AdminSurvey[]> {
  const res = await fetchApi<{ data: AdminSurvey[] }>("/surveys");
  return res.data;
}

export async function createAdminSurvey(data: {
  slug: string;
  title: string;
  kind: "general" | "post_trip" | "nps";
  questions: SurveyQuestion[];
  is_active?: boolean;
}): Promise<{ id: string; slug: string }> {
  const res = await fetchApi<{ data: { id: string; slug: string } }>("/admin/surveys", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAdminSurvey(
  slug: string,
  data: { title?: string; is_active?: boolean }
): Promise<void> {
  await fetchApi(`/admin/surveys/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getAdminSurveyResults(slug: string): Promise<SurveyResults> {
  const res = await fetchApi<{ data: SurveyResults }>(`/admin/surveys/${slug}/results`);
  return res.data;
}

// ==========================================
// 4. AJUSTES DEL SITIO (/admin/settings...)
// ==========================================
export interface SiteSettingItem {
  key: string;
  value: any;
  description: string | null;
  is_public: boolean;
  updated_at: string;
}

export async function getAdminSiteSettings(): Promise<SiteSettingItem[]> {
  const res = await fetchApi<{ data: SiteSettingItem[] }>("/admin/settings");
  return res.data;
}

export async function saveAdminSiteSetting(
  key: string,
  data: { value: any; is_public?: boolean; description?: string }
): Promise<SiteSettingItem> {
  const res = await fetchApi<{ data: SiteSettingItem }>(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAdminSiteSetting(key: string): Promise<void> {
  await fetchApi(`/admin/settings/${key}`, { method: "DELETE" });
}

// ==========================================
// 5. BIBLIOTECA DE MEDIOS (/admin/media...)
// ==========================================
export interface MediaAssetItem {
  id: string;
  owner_id: string;
  purpose: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  alt: string | null;
  credit: string | null;
  source_url: string | null;
  status: "pending" | "uploaded" | "ready" | "in_review" | "rejected";
  moderation_note: string | null;
  created_at: string;
  url?: string;
}

export async function getAdminMediaList(params: {
  q?: string;
  purpose?: string;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: MediaAssetItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 48),
  });
  if (params.q) query.set("q", params.q);
  if (params.purpose) query.set("purpose", params.purpose);
  if (params.status) query.set("status", params.status);

  return fetchApi<{ data: MediaAssetItem[]; meta: PageMeta }>(`/admin/media?${query}`);
}

export async function moderateAdminMedia(
  id: string,
  action: "approve" | "reject",
  reason?: string
): Promise<MediaAssetItem> {
  const res = await fetchApi<{ data: MediaAssetItem }>(`/admin/media/${id}/moderate`, {
    method: "POST",
    body: JSON.stringify({ action, reason }),
  });
  return res.data;
}

export async function importAdminMediaUrl(data: {
  url: string;
  alt?: string;
  credit?: string;
}): Promise<MediaAssetItem> {
  const res = await fetchApi<{ data: MediaAssetItem }>("/admin/media/import-url", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ==========================================
// 6. EMBAJADORES (/admin/ambassadors...)
// ==========================================
export type AmbassadorStatus = "pending" | "approved" | "rejected" | "suspended";

export interface AmbassadorItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  referral_code: string;
  status: AmbassadorStatus;
  commission_override: number | null;
  total_earnings: number;
  pending_balance: number;
  note: string | null;
  created_at: string;
}

export interface AmbassadorPayoutItem {
  id: string;
  ambassador_id: string;
  ambassador_name?: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  reference: string | null;
  note: string | null;
  created_at: string;
  settled_at: string | null;
}

export async function getAdminAmbassadors(params: {
  status?: AmbassadorStatus;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: AmbassadorItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 25),
  });
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);

  return fetchApi<{ data: AmbassadorItem[]; meta: PageMeta }>(`/admin/ambassadors?${query}`);
}

export async function updateAdminAmbassador(
  id: string,
  data: { status?: AmbassadorStatus; commission_override?: number | null; note?: string }
): Promise<AmbassadorItem> {
  const res = await fetchApi<{ data: AmbassadorItem }>(`/admin/ambassadors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getAdminAmbassadorPayouts(params: {
  status?: "pending" | "paid" | "failed";
  page?: number;
  per_page?: number;
}): Promise<{ data: AmbassadorPayoutItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 25),
  });
  if (params.status) query.set("status", params.status);

  return fetchApi<{ data: AmbassadorPayoutItem[]; meta: PageMeta }>(`/admin/ambassadors/payouts?${query}`);
}

export async function settleAdminAmbassadorPayout(
  id: string,
  data: { status: "paid" | "failed"; reference?: string; note?: string }
): Promise<AmbassadorPayoutItem> {
  const res = await fetchApi<{ data: AmbassadorPayoutItem }>(`/admin/ambassadors/payouts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ==========================================
// 7. MARKETING & LEADS (/admin/marketing/...)
// ==========================================
export type MarketingLeadStatus = "nuevo" | "contactado" | "calificado" | "perdido";

export interface MarketingLeadItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string | null;
  interest: string | null;
  status: MarketingLeadStatus;
  consent: boolean;
  created_at: string;
}

export async function getAdminMarketingLeads(params: {
  status?: MarketingLeadStatus;
  source?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: MarketingLeadItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 50),
  });
  if (params.status) query.set("status", params.status);
  if (params.source) query.set("source", params.source);

  return fetchApi<{ data: MarketingLeadItem[]; meta: PageMeta }>(`/admin/marketing/leads?${query}`);
}

export async function updateAdminMarketingLeadStatus(
  id: string,
  status: MarketingLeadStatus
): Promise<void> {
  await fetchApi(`/admin/marketing/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ==========================================
// 8. TRADUCCIONES I18N (/admin/translations...)
// ==========================================
export interface TranslationItem {
  entity_type: string;
  entity_id: string;
  locale: string;
  field_name: string;
  text: string;
  status: "machine" | "human" | "reviewed";
  updated_at: string;
}

export async function getAdminTranslations(params: {
  entity_type?: string;
  entity_id?: string;
  locale?: string;
  status?: "machine" | "human" | "reviewed";
  page?: number;
  per_page?: number;
}): Promise<{ data: TranslationItem[]; meta: PageMeta }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 50),
  });
  if (params.entity_type) query.set("entity_type", params.entity_type);
  if (params.entity_id) query.set("entity_id", params.entity_id);
  if (params.locale) query.set("locale", params.locale);
  if (params.status) query.set("status", params.status);

  return fetchApi<{ data: TranslationItem[]; meta: PageMeta }>(`/admin/translations?${query}`);
}

export async function saveAdminTranslation(
  entity_type: string,
  entity_id: string,
  locale: string,
  fields: Record<string, string | null>,
  reviewed = false
): Promise<{ saved: number; removed: number }> {
  const res = await fetchApi<{ data: { saved: number; removed: number } }>(
    `/admin/translations/${entity_type}/${entity_id}/${locale}`,
    {
      method: "PUT",
      body: JSON.stringify({ fields, reviewed }),
    }
  );
  return res.data;
}
