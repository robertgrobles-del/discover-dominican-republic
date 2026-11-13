/**
 * Sincroniza resultados de loterías desde enloteria.com (JSON-LD schema.org Event, un evento por sorteo).
 *   - Hoy:        https://enloteria.com/resultados-loterias-hoy
 *   - Otro día:   https://enloteria.com/resultados-loterias-AAAA-MM-DD
 * Nunca inventa resultados: lo que no se puede validar no se guarda.
 *
 * Validaciones por resultado descargado:
 *   1. La fecha del evento (startDate, hora local del sorteo) es la fecha pedida.
 *   2. El sorteo ya se celebró (startDate <= ahora). Los futuros vienen sin números o con datos de otro día.
 *   3. Se reconoce el sorteo: `lottery_draws.source_name` (nombre exacto en enloteria) o su `name`.
 *   4. Trae al menos `number_of_balls` números y todos están en [ball_range_min, ball_range_max].
 */
import type { InArgs } from "@libsql/client";

export interface ScrapedDrawResult {
  title: string;
  date: string; // AAAA-MM-DD (hora local del sorteo)
  startDate: string; // ISO con zona, tal cual viene de la fuente
  winningNumbers: number[];
  bonusNumber?: number | null;
  jackpotAmount?: string | null;
}

export interface SkippedResult { title: string; reason: string }

export interface LotterySyncReport {
  success: boolean;
  date: string;
  source: "enloteria_jsonld" | "html_payload" | "none";
  syncedCount: number;
  skipped: SkippedResult[];
  errors: string[];
}

type Db = { execute: (stmt: { sql: string; args?: InArgs } | string) => Promise<unknown> };
type Row = Record<string, unknown>;
const rowsOf = (r: unknown): Row[] => ((r as { rows?: Row[] })?.rows ?? []);

export function normalizeDrawTitle(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Fecha y hora en República Dominicana (UTC-4 todo el año, sin horario de verano). */
export function rdNow(now = new Date()): { date: string; minutes: number } {
  const local = new Date(now.getTime() - 4 * 3600_000).toISOString();
  return { date: local.slice(0, 10), minutes: Number(local.slice(11, 13)) * 60 + Number(local.slice(14, 16)) };
}

export const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

export function sourceUrl(date: string, now = new Date()): string {
  return date === rdNow(now).date
    ? "https://enloteria.com/resultados-loterias-hoy"
    : `https://enloteria.com/resultados-loterias-${date}`;
}

/** Eventos con números de la página de enloteria. Los sorteos aún sin celebrar vienen sin números y se descartan. */
export function parseEnLoteriaJsonLd(html: string): ScrapedDrawResult[] {
  const out: ScrapedDrawResult[] = [];
  if (!html) return out;
  for (const sm of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    let data: unknown;
    try { data = JSON.parse(sm[1]); } catch { continue; }
    const d = data as Row;
    const graph = Array.isArray(d["@graph"]) ? (d["@graph"] as Row[]) : Array.isArray(data) ? (data as Row[]) : [d];
    for (const item of graph) {
      if (!item || item["@type"] !== "Event") continue;
      const startDate = String(item.startDate ?? "");
      if (!/^\d{4}-\d{2}-\d{2}T/.test(startDate)) continue;
      const nums: number[] = [];
      for (const p of Array.isArray(item.additionalProperty) ? (item.additionalProperty as Row[]) : []) {
        if (/premio|bolo|numero|número/i.test(String(p.name ?? ""))) {
          const n = parseInt(String(p.value), 10);
          if (!Number.isNaN(n)) nums.push(n);
        }
      }
      if (!nums.length && typeof item.description === "string") {
        const m = item.description.match(/n[úu]meros ganadores son:?\s*([0-9,\s-]+)/i);
        if (m) nums.push(...m[1].split(/[\s,-]+/).map((n) => parseInt(n, 10)).filter((n) => !Number.isNaN(n)));
      }
      if (!nums.length) continue;
      out.push({ title: String(item.name ?? "").trim(), date: startDate.slice(0, 10), startDate, winningNumbers: nums });
    }
  }
  return out;
}

interface DrawRow { id: string; name: string; source_name: string | null; number_of_balls: number; ball_range_min: number; ball_range_max: number }

async function activeDraws(db: Db): Promise<DrawRow[]> {
  const r = await db.execute("SELECT id, name, source_name, number_of_balls, ball_range_min, ball_range_max FROM lottery_draws WHERE is_active = 1");
  return rowsOf(r).map((x) => ({
    id: String(x.id), name: String(x.name), source_name: x.source_name ? String(x.source_name) : null,
    number_of_balls: Number(x.number_of_balls), ball_range_min: Number(x.ball_range_min), ball_range_max: Number(x.ball_range_max),
  }));
}

/** Valida y guarda los resultados de `date`. Devuelve qué se guardó y por qué se descartó el resto. */
export async function syncResults(db: Db, parsed: ScrapedDrawResult[], date: string, now = new Date()): Promise<{ synced: number; skipped: SkippedResult[]; errors: string[] }> {
  const draws = await activeDraws(db);
  const byName = new Map<string, DrawRow>();
  for (const d of draws) {
    byName.set(normalizeDrawTitle(d.name), d);
    if (d.source_name) byName.set(normalizeDrawTitle(d.source_name), d); // el nombre de la fuente manda
  }
  let synced = 0;
  const skipped: SkippedResult[] = [];
  const errors: string[] = [];
  for (const res of parsed) {
    const draw = byName.get(normalizeDrawTitle(res.title));
    if (!draw) { skipped.push({ title: res.title, reason: "Sorteo no registrado (añádelo o pon su nombre de la fuente)" }); continue; }
    if (res.date !== date) { skipped.push({ title: res.title, reason: `Es del ${res.date}, no del ${date}` }); continue; }
    if (Date.parse(res.startDate) > now.getTime()) { skipped.push({ title: res.title, reason: "Aún no se ha celebrado" }); continue; }
    const nums = res.winningNumbers.slice(0, draw.number_of_balls);
    if (nums.length < draw.number_of_balls) { skipped.push({ title: res.title, reason: `Trae ${nums.length} números y el sorteo tiene ${draw.number_of_balls}` }); continue; }
    if (nums.some((n) => n < draw.ball_range_min || n > draw.ball_range_max)) { skipped.push({ title: res.title, reason: "Números fuera del rango del sorteo" }); continue; }
    try {
      await db.execute({
        sql: `INSERT INTO lottery_results (id, draw_id, draw_date, winning_numbers, bonus_number, jackpot_amount, is_active, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
              ON CONFLICT (draw_id, draw_date) DO UPDATE SET winning_numbers = excluded.winning_numbers,
                bonus_number = excluded.bonus_number, jackpot_amount = COALESCE(excluded.jackpot_amount, lottery_results.jackpot_amount),
                updated_at = excluded.updated_at`,
        args: [`res-${draw.id}-${date}`, draw.id, date, JSON.stringify(nums), res.bonusNumber ?? null, res.jackpotAmount ?? null],
      });
      synced++;
    } catch (e) {
      errors.push(`No se guardó ${res.title}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { synced, skipped, errors };
}

/** Descarga (o usa el HTML dado) y sincroniza un día. Sin resultados válidos no guarda nada. */
export async function scrapeAndSyncLotteries(db: Db, options: { htmlContent?: string; date?: string; now?: Date } = {}): Promise<LotterySyncReport> {
  const now = options.now ?? new Date();
  const date = options.date ?? rdNow(now).date;
  const errors: string[] = [];
  let html = options.htmlContent;
  let source: LotterySyncReport["source"] = html ? "html_payload" : "none";
  if (!html) {
    const url = sourceUrl(date, now);
    try {
      const r = await fetch(url, { headers: { "User-Agent": "DescubreRD-Loterias/1.0", Accept: "text/html" } });
      if (r.ok) { html = await r.text(); source = "enloteria_jsonld"; }
      else errors.push(`${url} respondió ${r.status}`);
    } catch (e) {
      errors.push(`No se pudo conectar con ${url}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const parsed = html ? parseEnLoteriaJsonLd(html) : [];
  const { synced, skipped, errors: dbErrors } = await syncResults(db, parsed, date, now);
  return { success: synced > 0, date, source, syncedCount: synced, skipped, errors: [...errors, ...dbErrors] };
}

/**
 * Sorteos que tocan ahora: celebrados hace 0–`windowMin` minutos (hora RD), que se juegan hoy y aún sin resultado.
 * El cron llama cada minuto; si no toca ninguno no se descarga nada.
 */
export async function dueDraws(db: Db, now = new Date(), windowMin = 5): Promise<string[]> {
  const { date, minutes } = rdNow(now);
  const day = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][new Date(`${date}T12:00:00Z`).getUTCDay()];
  const r = await db.execute({
    sql: `SELECT d.id, d.draw_time, d.draw_days FROM lottery_draws d
          WHERE d.is_active = 1 AND NOT EXISTS (SELECT 1 FROM lottery_results r WHERE r.draw_id = d.id AND r.draw_date = ?)`,
    args: [date],
  });
  return rowsOf(r).filter((x) => {
    const [h, m] = String(x.draw_time).split(":").map(Number);
    let days: string[] = [];
    try { days = JSON.parse(String(x.draw_days)); } catch { /* sin días: no toca */ }
    const since = minutes - (h * 60 + m);
    return days.includes(day) && since >= 0 && since <= windowMin;
  }).map((x) => String(x.id));
}
