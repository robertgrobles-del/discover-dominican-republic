import { fetchApi } from "@/lib/fastifyClient";

/**
 * Consola de usuarios contra el backend (`/admin/users…` y `/admin/gamification/users…`). La usa
 * `AdminUsuarios` cuando la sesión es real; con la sesión simulada sigue con el cliente de demostración.
 */

export interface AdminUserRow {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  is_suspended: boolean;
  suspension_reason: string | null;
  avatar_url: string | null;
  created_at: string;
  total_xp: number;
  coins: number;
  current_level: number;
  streak_days: number;
  total_missions_completed: number;
  total_referrals: number;
}

export interface AdminUserTransaction {
  id: string;
  transaction_type: string;
  xp_amount: number | null;
  coin_amount: number | null;
  description: string | null;
  source_type: string | null;
  created_at: string;
}

interface ApiUser { id: string; email: string; status: string; created_at: string; display_name: string | null; suspended: boolean; roles: string[] }
interface ApiProgress { user_id: string; total_xp: number; coins: number; current_level: number; streak_days: number; total_missions_completed: number; total_referrals: number }

/** La consola muestra un rol por cuenta: el de más privilegio que tenga. */
const ROLE_RANK = ["admin", "editor", "moderator", "partner", "ambassador", "user"];
const mainRole = (roles: string[]) => ROLE_RANK.find((r) => roles.includes(r)) ?? "user";

const PER_PAGE = 100;
const MAX_PAGES = 20;

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const users: ApiUser[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchApi<{ data: ApiUser[]; meta?: { total?: number } }>(`/admin/users?page=${page}&per_page=${PER_PAGE}`);
    users.push(...res.data);
    if (res.data.length < PER_PAGE || users.length >= (res.meta?.total ?? 0)) break;
  }

  const progress = new Map<string, ApiProgress>();
  for (let i = 0; i < users.length; i += PER_PAGE) {
    const ids = users.slice(i, i + PER_PAGE).map((u) => u.id).join(",");
    if (!ids) continue;
    const res = await fetchApi<{ data: ApiProgress[] }>(`/admin/gamification/users?ids=${ids}`);
    for (const p of res.data) progress.set(p.user_id, p);
  }

  return users.map((u) => {
    const p = progress.get(u.id);
    return {
      id: u.id, display_name: u.display_name, email: u.email, role: mainRole(u.roles),
      is_suspended: u.suspended || u.status === "suspended", suspension_reason: null, avatar_url: null, created_at: u.created_at,
      total_xp: p?.total_xp ?? 0, coins: p?.coins ?? 0, current_level: p?.current_level ?? 1, streak_days: p?.streak_days ?? 0,
      total_missions_completed: p?.total_missions_completed ?? 0, total_referrals: p?.total_referrals ?? 0,
    };
  });
}

export async function listAdminUserTransactions(userId: string): Promise<AdminUserTransaction[]> {
  return (await fetchApi<{ data: AdminUserTransaction[] }>(`/admin/gamification/users/${userId}/transactions?limit=30`)).data;
}

/** Sustituye los roles de la cuenta por el elegido. El servidor impide tocar los propios y quitar al último admin. */
export async function setAdminUserRole(userId: string, role: string): Promise<void> {
  await fetchApi(`/admin/users/${userId}/roles`, { method: "PUT", body: JSON.stringify({ roles: [role] }) });
}

/** El servidor exige un motivo de al menos 5 caracteres para suspender. */
export async function setAdminUserSuspended(userId: string, suspended: boolean, reason?: string): Promise<void> {
  if (suspended) {
    await fetchApi(`/admin/users/${userId}/suspend`, { method: "POST", body: JSON.stringify({ reason: (reason ?? "").trim() || "Suspensión desde la consola de administración" }) });
  } else {
    await fetchApi(`/admin/users/${userId}/unsuspend`, { method: "POST" });
  }
}

/** Ajuste de XP y monedas (también negativo). Queda auditado con su motivo. */
export async function adjustAdminUserXp(userId: string, xp: number, coins: number, reason: string): Promise<void> {
  await fetchApi(`/admin/gamification/users/${userId}/adjust`, {
    method: "POST",
    body: JSON.stringify({ xp, coins, reason: reason.trim().length >= 5 ? reason.trim() : "Ajuste manual del administrador" }),
  });
}
