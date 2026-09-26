import type { Env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export type AiKind = "chat" | "itinerary" | "recommendations" | "translate" | "generate";
export interface AiMessage { role: "user" | "assistant"; content: string }
export interface AiRequest {
  kind: AiKind; system: string; messages: AiMessage[]; maxTokens: number; model: string; temperature?: number;
  /** Datos estructurados que sólo usa el simulador para responder algo verosímil; ningún proveedor real los recibe. */
  meta?: Record<string, unknown>;
}
export interface AiUsage { inputTokens: number; outputTokens: number }
export interface AiResult extends AiUsage { text: string }

export interface AiProvider {
  readonly name: "none" | "fake" | "anthropic";
  complete(req: AiRequest): Promise<AiResult>;
  /** Emite el texto por partes; el uso real se informa al terminar en `onUsage`. */
  stream(req: AiRequest, onUsage: (u: AiUsage) => void): AsyncIterable<string>;
}

/** USD por millón de tokens (estimación para cuotas y para el panel de consumo). */
const PRICES: { match: RegExp; in: number; out: number }[] = [
  { match: /haiku/i, in: 1, out: 5 },
  { match: /./, in: 3, out: 15 },
];
export function costUsd(model: string, u: AiUsage): number {
  const p = PRICES.find((x) => x.match.test(model))!;
  return Math.round(((u.inputTokens * p.in + u.outputTokens * p.out) / 1_000_000) * 1e6) / 1e6;
}
export const estimateTokens = (t: string) => Math.ceil(t.length / 4);

// ---------- Sin proveedor ----------
class NoneProvider implements AiProvider {
  readonly name = "none" as const;
  private off(): never { throw new AppError("SERVICE_UNAVAILABLE", "El asistente de IA no está disponible por ahora", { code: "AI_DISABLED" }); }
  async complete(): Promise<AiResult> { return this.off(); }
  // eslint-disable-next-line require-yield
  async *stream(): AsyncIterable<string> { this.off(); }
}

// ---------- Simulador (desarrollo y pruebas) ----------
type Cand = { type: string; ref: string; name: string };
class FakeProvider implements AiProvider {
  readonly name = "fake" as const;
  private text(req: AiRequest): string {
    const last = req.messages[req.messages.length - 1]?.content ?? "";
    const cands = (req.meta?.candidates as Cand[] | undefined) ?? [];
    switch (req.kind) {
      case "chat": return `Hola, soy Guía RD (modo simulado). ${cands.length ? `Te sugiero: ${cands.slice(0, 3).map((c) => c.name).join(", ")}.` : "No encontré lugares concretos para eso."} Preguntaste: ${last.slice(0, 80)}`;
      case "itinerary": {
        const days = Number(req.meta?.days ?? 1);
        const out = Array.from({ length: days }, (_, d) => ({ title: `Día ${d + 1}`, items: [0, 1].map((k) => cands[(d * 2 + k) % Math.max(cands.length, 1)]).filter(Boolean).map((c, k) => ({ type: c!.type, ref: c!.ref, time: k === 0 ? "09:00" : "14:00", notes: `Visita a ${c!.name}` })) }));
        if (req.meta?.inject) out[0]?.items.push(req.meta.inject as never);
        return JSON.stringify({ days: out });
      }
      case "recommendations": return JSON.stringify({ items: cands.slice(0, Number(req.meta?.limit ?? 5)).map((c) => ({ type: c.type, ref: c.ref, reason: `Encaja con tus intereses: ${c.name}` })) });
      case "translate": return `[${req.meta?.to ?? "en"}] ${last}`;
      case "generate": return JSON.stringify({ text: `Texto simulado (${req.meta?.tone ?? "neutral"}): ${last.slice(0, 120)}`, highlights: ["Simulado", String(req.meta?.entity_type ?? "contenido")] });
    }
  }
  async complete(req: AiRequest): Promise<AiResult> {
    const text = this.text(req);
    return { text, inputTokens: estimateTokens(req.system + req.messages.map((m) => m.content).join("")), outputTokens: estimateTokens(text) };
  }
  async *stream(req: AiRequest, onUsage: (u: AiUsage) => void): AsyncIterable<string> {
    const text = this.text(req);
    for (const w of text.split(/(?<=\s)/)) yield w;
    onUsage({ inputTokens: estimateTokens(req.system + req.messages.map((m) => m.content).join("")), outputTokens: estimateTokens(text) });
  }
}

// ---------- Anthropic ----------
class AnthropicProvider implements AiProvider {
  readonly name = "anthropic" as const;
  constructor(private readonly key: string) {}
  private body(req: AiRequest, stream: boolean) {
    return JSON.stringify({ model: req.model, max_tokens: req.maxTokens, temperature: req.temperature ?? 0.7, system: req.system, messages: req.messages, stream });
  }
  private async call(req: AiRequest, stream: boolean) {
    let res: Response;
    try { res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": this.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: this.body(req, stream), signal: AbortSignal.timeout(60_000) }); }
    catch { throw new AppError("UPSTREAM_ERROR", "El asistente de IA no respondió; intenta de nuevo", { code: "AI_UPSTREAM" }); }
    if (res.status === 429 || res.status === 529) throw new AppError("SERVICE_UNAVAILABLE", "El asistente de IA está saturado; intenta en unos minutos", { code: "AI_BUSY" });
    if (!res.ok) throw new AppError("UPSTREAM_ERROR", "El asistente de IA no pudo responder", { code: "AI_UPSTREAM", status: res.status });
    return res;
  }
  async complete(req: AiRequest): Promise<AiResult> {
    const res = await this.call(req, false);
    const j = (await res.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } };
    const text = (j.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
    return { text, inputTokens: j.usage?.input_tokens ?? 0, outputTokens: j.usage?.output_tokens ?? 0 };
  }
  async *stream(req: AiRequest, onUsage: (u: AiUsage) => void): AsyncIterable<string> {
    const res = await this.call(req, true);
    if (!res.body) throw new AppError("UPSTREAM_ERROR", "El asistente de IA no pudo responder", { code: "AI_UPSTREAM" });
    const usage: AiUsage = { inputTokens: 0, outputTokens: 0 };
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          let ev: { type?: string; delta?: { type?: string; text?: string }; message?: { usage?: { input_tokens?: number } }; usage?: { output_tokens?: number } };
          try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (ev.type === "message_start") usage.inputTokens = ev.message?.usage?.input_tokens ?? 0;
          else if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) yield ev.delta.text;
          else if (ev.type === "message_delta") usage.outputTokens = ev.usage?.output_tokens ?? usage.outputTokens;
        }
      }
    } finally { onUsage(usage); }
  }
}

export function createAiProvider(env: Env): AiProvider {
  if (env.AI_PROVIDER === "anthropic") return new AnthropicProvider(env.ANTHROPIC_API_KEY!);
  if (env.AI_PROVIDER === "fake") return new FakeProvider();
  return new NoneProvider();
}
