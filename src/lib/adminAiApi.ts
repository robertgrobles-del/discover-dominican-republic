import { fetchApi } from "@/lib/fastifyClient";

/**
 * Cliente de API para herramientas editoriales de IA (/api/v1/admin/ai/*)
 * Contrato estricto según backend/src/modules/ai/routes.ts y service.ts
 */

export type AiTone = "aventurero" | "elegante" | "familiar" | "informativo" | "romantico" | "divertido";

export interface AiGeneratePayload {
  prompt: string;
  tone?: AiTone;
  entity_type: string;
  locale?: string;
}

export interface AiUsageTotals {
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  errors: number;
}

export interface AiUsageKind {
  kind: string;
  requests: number;
  cost_usd: number;
}

export interface AiUsageUser {
  user_id: string;
  email: string | null;
  requests: number;
  cost_usd: number;
}

export interface AiUsageToday {
  spent_usd: number;
  budget_usd: number;
  date: string;
}

export interface AiUsageReport {
  month: string;
  provider: string;
  totals: AiUsageTotals;
  by_kind: AiUsageKind[];
  by_user: AiUsageUser[];
  today: AiUsageToday;
}

export const adminAiApi = {
  /** Genera borrador con IA a través de Fastify y Gemini */
  async generate(payload: AiGeneratePayload): Promise<string> {
    const res = await fetchApi<{ data: string | { text: string } }>("/admin/ai/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt: payload.prompt,
        tone: payload.tone || "informativo",
        entity_type: payload.entity_type,
        locale: payload.locale || "es",
      }),
    });
    if (typeof res.data === "string") return res.data;
    if (res.data && typeof res.data === "object" && "text" in res.data) return res.data.text;
    return String(res.data || "");
  },

  /** Consulta el consumo y gasto mensual de IA */
  async getUsage(month?: string): Promise<AiUsageReport> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    const res = await fetchApi<{ data: AiUsageReport }>(`/admin/ai/usage${query}`);
    return res.data;
  },
};
