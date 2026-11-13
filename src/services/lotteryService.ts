import { fetchApi } from "@/lib/fastifyClient";
import { LotteryResult, DEFAULT_LOTTERY_RESULTS, resolveDrawSlug } from "@/data/loteriasData";
import { LotteryResultRelational, LotteryCompanyWithDraws } from "@/types/lotteryRelational";

export interface DrawDetailResponse {
  lottery: {
    id: string;
    slug: string;
    name: string;
    country: string;
    logo_url: string | null;
    website_url?: string | null;
    description?: string | null;
    color_scheme?: string | null;
  };
  draw: {
    id: string;
    lottery_id: string;
    slug: string;
    name: string;
    draw_days: string[];
    draw_time: string;
    ball_range_min: number;
    ball_range_max: number;
    number_of_balls: number;
    tombolas_count: number;
    has_bonus: boolean;
    bonus_name?: string | null;
    description?: string | null;
    schedule_description?: string | null;
  };
  results: {
    id: string;
    draw_id: string;
    draw_date: string;
    winning_numbers: number[];
    bonus_number: number | null;
    jackpot_amount: string | null;
  }[];
  stats: {
    total_draws: number;
    hot_numbers: { number: string; count: number; percentage: number }[];
    cold_numbers: { number: string; count: number; percentage: number }[];
    latest_result: {
      id: string;
      draw_id: string;
      draw_date: string;
      winning_numbers: number[];
      bonus_number: number | null;
      jackpot_amount: string | null;
    } | null;
  };
  related_draws: {
    id: string;
    slug: string;
    name: string;
    draw_time: string;
  }[];
}

/**
 * Obtiene el listado completo de loterías con sus sorteos y resultados vigentes desde la API
 */
export async function fetchLotteries(date?: string): Promise<LotteryCompanyWithDraws[]> {
  try {
    const url = date ? `/api/v1/lotteries?date=${encodeURIComponent(date)}` : "/api/v1/lotteries";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn("Fallo fetchLotteries API, usando respaldo local:", err);
  }
  return [];
}

/**
 * Obtiene los resultados de lotería en formato relacional (filtrados por fecha o empresa)
 */
export async function fetchLotteryResults(date?: string, company?: string): Promise<LotteryResultRelational[]> {
  try {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (company && company !== "all") params.set("company", company);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/v1/lotteries/results${queryStr}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn("Fallo fetchLotteryResults API:", err);
  }
  return [];
}

/**
 * Obtiene la información detallada de una empresa de lotería por su slug
 */
export async function fetchLotteryDetail(slug: string): Promise<LotteryCompanyWithDraws | null> {
  try {
    const res = await fetch(`/api/v1/lotteries/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn(`Fallo fetchLotteryDetail para ${slug}:`, err);
    return null;
  }
}

/**
 * Obtiene el detalle y el histórico completo de un sorteo específico de una lotería
 */
export async function fetchDrawDetail(
  companySlug: string,
  drawSlug: string,
  query?: { year?: string; month?: string; number?: string; limit?: number }
): Promise<DrawDetailResponse | null> {
  try {
    const params = new URLSearchParams();
    if (query?.year) params.set("year", query.year);
    if (query?.month) params.set("month", query.month);
    if (query?.number) params.set("number", query.number);
    if (query?.limit) params.set("limit", String(query.limit));

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/v1/lotteries/${encodeURIComponent(companySlug)}/${encodeURIComponent(drawSlug)}${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data as DrawDetailResponse) || null;
  } catch (err) {
    console.warn(`Fallo fetchDrawDetail para ${companySlug}/${drawSlug}:`, err);
    return null;
  }
}

/**
 * Dispara la sincronización / scraping de resultados
 */
export async function triggerLotterySync(htmlPayload?: string): Promise<{ success: boolean; syncedCount: number; message: string }> {
  try {
    // Con la sesión del equipo (fetchApi añade el token): la ruta exige editor o administrador.
    const json = await fetchApi<{ data?: { success?: boolean; syncedCount?: number } }>("/admin/lotteries/sync", {
      method: "POST",
      body: JSON.stringify(htmlPayload ? { htmlContent: htmlPayload } : {}),
    });
    if (json.data?.success) {
      return { success: true, syncedCount: json.data.syncedCount ?? 0, message: `Sincronizados ${json.data.syncedCount ?? 0} sorteos.` };
    }
    return { success: false, syncedCount: 0, message: "Error al sincronizar sorteos" };
  } catch (err) {
    return { success: false, syncedCount: 0, message: err instanceof Error ? err.message : "Error de red" };
  }
}

/**
 * Convierte resultados relacionales o combina con DEFAULT_LOTTERY_RESULTS para la vista clásica
 */
export function adaptResultsForView(relational: LotteryResultRelational[], fallbackDate = "Hoy"): LotteryResult[] {
  if (!relational || relational.length === 0) {
    return DEFAULT_LOTTERY_RESULTS;
  }

  return relational.map((r) => {
    const draw = r.lottery_draws;
    const lot = draw?.lotteries;
    const slug = (lot?.slug || "leidsa") as LotteryResult["company"];
    const dName = draw?.name || "Sorteo";
    const dSlug = draw?.slug || resolveDrawSlug(slug, dName);

    return {
      id: r.id,
      company: slug,
      companyName: lot?.name || "Lotería",
      drawName: dName,
      drawSlug: dSlug,
      drawTime: draw?.draw_time ? draw.draw_time.substring(0, 5) : "Hoy",
      date: r.draw_date || fallbackDate,
      winningNumbers: (r.winning_numbers || []).map((n) => String(n).padStart(2, "0")),
      bonusNumber: r.bonus_number,
      jackpotOrExtra: r.jackpot_amount || undefined,
      colorScheme: lot?.color_scheme || "from-slate-700 to-slate-900",
      logo: lot?.logo_url ? "" : "🎰",
    };
  });
}

