/**
 * Sincroniza resultados de loterías desde enloteria.com (JSON-LD schema.org Event, un evento por sorteo).
 *   - Hoy:        https://enloteria.com/resultados-loterias-hoy
 *   - Otro día:   https://enloteria.com/resultados-loterias-AAAA-MM-DD
 *   - Sorteos que no salen en la página general (Loto, Super Kino TV, Loto Real, MegaChance): su página propia,
 *     `lottery_draws.source_path` (hoy: /resultados-loto; otro día: /resultados-loto-AAAA-MM-DD).
 * Nunca inventa resultados: lo que no se puede validar no se guarda.
 *
 * Validaciones por resultado descargado:
 *   1. La fecha del evento (startDate, hora local del sorteo) es la fecha pedida.
 *   2. El sorteo ya se celebró (startDate <= ahora). Los futuros vienen sin números o con datos de otro día.
 *   3. Se reconoce el sorteo: `lottery_draws.source_name` (nombre exacto en enloteria) o su `name`.
 *   4. Trae exactamente `number_of_balls` números y todos están en [ball_range_min, ball_range_max].
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
// shortcut: el cron solo usa draw_time; los sorteos con otra hora el domingo se recuperan con «Sincronizar» del panel.

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
  const otherDates = new Map<string, string[]>();
  const unknown = new Set<string>(); // sorteos de la fuente que no están en el panel: una sola línea en el informe
  for (const res of parsed) {
    const draw = byName.get(normalizeDrawTitle(res.title));
    if (!draw) { unknown.add(res.title); continue; }
    if (res.date !== date) { otherDates.set(res.title, [...(otherDates.get(res.title) ?? []), res.date]); continue; }
    if (Date.parse(res.startDate) > now.getTime()) { skipped.push({ title: res.title, reason: "Aún no se ha celebrado" }); continue; }
    // Regla fija: un sorteo saca exactamente `number_of_balls` números; ni más ni menos.
    const nums = res.winningNumbers;
    if (nums.length !== draw.number_of_balls) { skipped.push({ title: res.title, reason: `Trae ${nums.length} números y el sorteo saca ${draw.number_of_balls}` }); continue; }
    if (nums.some((n) => n < draw.ball_range_min || n > draw.ball_range_max)) { skipped.push({ title: res.title, reason: "Números fuera del rango del sorteo" }); continue; }
    try {
      await db.execute({
        sql: `INSERT INTO lottery_results (id, draw_id, draw_date, winning_numbers, bonus_number, jackpot_amount, is_active, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
              ON CONFLICT (draw_id, draw_date) DO UPDATE SET winning_numbers = excluded.winning_numbers,
                bonus_number = excluded.bonus_number, is_active = 1, jackpot_amount = COALESCE(excluded.jackpot_amount, lottery_results.jackpot_amount),
                updated_at = excluded.updated_at`,
        args: [`res-${draw.id}-${date}`, draw.id, date, JSON.stringify(nums), res.bonusNumber ?? null, res.jackpotAmount ?? null],
      });
      synced++;
    } catch (e) {
      errors.push(`No se guardó ${res.title}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  // Las páginas propias traen el histórico: se resume en una línea por sorteo en vez de una por fecha.
  for (const [title, dates] of otherDates) {
    skipped.push({ title, reason: dates.length === 1 ? `Es del ${dates[0]}, no del ${date}` : `${dates.length} resultados de otras fechas (${dates[dates.length - 1]} a ${dates[0]})` });
  }
  if (unknown.size) skipped.push({ title: `${unknown.size} sorteos no registrados`, reason: `${[...unknown].join(", ")}. No se guardan: añádelos en Sorteos si los quieres.` });
  return { synced, skipped, errors };
}

/** Descarga (o usa el HTML dado) y sincroniza un día. Sin resultados válidos no guarda nada. */
/** Página propia de un sorteo en enloteria (`source_path` sin barra): la de hoy o la de una fecha. */
export function drawPageUrl(path: string, date: string, now = new Date()): string {
  return date === rdNow(now).date ? `https://enloteria.com/${path}` : `https://enloteria.com/${path}-${date}`;
}

/** `drawIds`: sólo descarga las páginas de esos sorteos (el cron, con los que tocan); sin él, todas. */
export async function scrapeAndSyncLotteries(db: Db, options: { htmlContent?: string; date?: string; now?: Date; drawIds?: string[] } = {}): Promise<LotterySyncReport> {
  const now = options.now ?? new Date();
  const date = options.date ?? rdNow(now).date;
  const errors: string[] = [];
  const missing: string[] = [];
  const pages: string[] = [];
  let source: LotterySyncReport["source"] = "none";
  if (options.htmlContent) {
    pages.push(options.htmlContent);
    source = "html_payload";
  } else {
    const rows = rowsOf(await db.execute("SELECT id, source_path FROM lottery_draws WHERE is_active = 1"))
      .filter((r) => !options.drawIds || options.drawIds.includes(String(r.id)));
    const paths = [...new Set(rows.map((r) => String(r.source_path ?? "")).filter((p) => /^[a-z0-9-]+$/.test(p)))];
    const needsGeneral = rows.some((r) => !r.source_path); // los que salen en la página general
    const urls = [...(needsGeneral ? [sourceUrl(date, now)] : []), ...paths.map((p) => drawPageUrl(p, date, now))];
    const got = await Promise.all(urls.map(async (url) => {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "DescubreRD-Loterias/1.0", Accept: "text/html" } });
        if (r.ok) return await r.text();
        // 404: la fuente no tiene ese sorteo ese día (aún no existía o no se celebró); no es un fallo.
        if (r.status === 404) missing.push(url.replace("https://enloteria.com/", ""));
        else errors.push(`${url} respondió ${r.status}`);
      } catch (e) {
        errors.push(`No se pudo conectar con ${url}: ${e instanceof Error ? e.message : String(e)}`);
      }
      return null;
    }));
    for (const h of got) if (h) pages.push(h);
    if (pages.length) source = "enloteria_jsonld";
  }
  // Un sorteo puede venir en dos páginas: se queda una vez por nombre y fecha.
  const seen = new Set<string>();
  const parsed = pages.flatMap(parseEnLoteriaJsonLd).filter((p) => {
    const k = `${normalizeDrawTitle(p.title)}|${p.date}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const { synced: scraped, skipped, errors: dbErrors } = await syncResults(db, parsed, date, now);
  const synced = scraped + (await deriveSuperPale(db, date));
  if (missing.length) skipped.push({ title: "Sin datos en la fuente para esta fecha", reason: missing.join(", ") });
  return { success: synced > 0, date, source, syncedCount: synced, skipped, errors: [...errors, ...dbErrors] };
}

/** Minutos tras la hora del sorteo en que el cron lo busca. Cada intento sólo ocurre si el anterior no trajo el resultado. */
export const RETRY_MINUTES = [3, 5, 10];

/**
 * Sorteos que tocan ahora: hoy es su día, han pasado justo 3, 5 o 10 minutos desde su hora (RD) y aún no tienen
 * resultado de hoy. El cron llama cada minuto; si no toca ninguno no se descarga nada.
 */
export async function dueDraws(db: Db, now = new Date(), retries = RETRY_MINUTES): Promise<string[]> {
  const { date, minutes } = rdNow(now);
  const day = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][new Date(`${date}T12:00:00Z`).getUTCDay()];
  const r = await db.execute({
    sql: `SELECT d.id, d.draw_time, d.sunday_time, d.draw_days FROM lottery_draws d
          WHERE d.is_active = 1 AND NOT EXISTS (SELECT 1 FROM lottery_results r WHERE r.draw_id = d.id AND r.draw_date = ? AND r.is_active = 1)`,
    args: [date],
  });
  return rowsOf(r).filter((x) => {
    const [h, m] = String(day === "domingo" && x.sunday_time ? x.sunday_time : x.draw_time).split(":").map(Number);
    let days: string[] = [];
    try { days = JSON.parse(String(x.draw_days)); } catch { /* sin días: no toca */ }
    const since = minutes - (h * 60 + m);
    return days.includes(day) && retries.includes(since);
  }).map((x) => String(x.id));
}

/** Super Palé: primer premio de Leidsa + primer premio de la Lotería Nacional (noche) del mismo día. Devuelve 1 si lo guarda. */
export async function deriveSuperPale(db: Db, date: string): Promise<number> {
  const r = rowsOf(await db.execute({
    sql: `SELECT draw_id, winning_numbers FROM lottery_results
          WHERE draw_date = ? AND is_active = 1 AND draw_id IN ('draw-lei-quiniela', 'draw-nac-noche')`,
    args: [date],
  }));
  const first = (id: string) => {
    try { const n = JSON.parse(String(r.find((x) => x.draw_id === id)?.winning_numbers ?? "[]")); return Number.isInteger(n[0]) ? (n[0] as number) : null; } catch { return null; }
  };
  const lei = first("draw-lei-quiniela"), nac = first("draw-nac-noche");
  if (lei === null || nac === null) return 0;
  const exists = rowsOf(await db.execute({ sql: "SELECT 1 FROM lottery_draws WHERE id = 'draw-lei-superpale' AND is_active = 1", args: [] }));
  if (!exists.length) return 0;
  await db.execute({
    sql: `INSERT INTO lottery_results (id, draw_id, draw_date, winning_numbers, is_active, updated_at)
          VALUES (?, 'draw-lei-superpale', ?, ?, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
          ON CONFLICT (draw_id, draw_date) DO UPDATE SET winning_numbers = excluded.winning_numbers, is_active = 1, updated_at = excluded.updated_at`,
    args: [`res-draw-lei-superpale-${date}`, date, JSON.stringify([lei, nac])],
  });
  return 1;
}
