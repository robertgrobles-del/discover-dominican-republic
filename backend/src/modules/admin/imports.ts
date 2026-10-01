import type { FastifyBaseLogger, FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Db } from "../../db/pool.js";
import { detectDelimiter, parseDelimited, type Delimiter } from "../../lib/delimited.js";
import { AppError } from "../../lib/errors.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import { audit } from "../../lib/audit.js";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 100_000;
const BATCH = 500;
const MAX_NOTES = 200;

// ---------- Establecimientos ----------
const COLUMNS = ["subsector", "actividad", "rut", "numero_identificacion", "nombre", "sector_zona", "provincia", "estatus_proceso", "estatus_licencia", "estatus_establecimiento", "fecha_vencimiento", "telefono", "correo"] as const;
type Col = (typeof COLUMNS)[number];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
/** Encabezados aceptados (sin acentos ni mayúsculas) por columna. */
const ALIASES: Record<string, Col> = {
  subsector: "subsector", categoria: "subsector", actividad: "actividad", rut: "rut", rnc: "rut", numero_identificacion: "numero_identificacion", identificacion: "numero_identificacion", no_identificacion: "numero_identificacion", numero_de_identificacion: "numero_identificacion", no_de_identificacion: "numero_identificacion", n_identificacion: "numero_identificacion", cedula_rnc: "rut",
  nombre: "nombre", establecimiento: "nombre", nombre_establecimiento: "nombre", nombre_comercial: "nombre", razon_social: "nombre", sector_zona: "sector_zona", sector: "sector_zona", zona: "sector_zona", provincia: "provincia",
  estatus_proceso: "estatus_proceso", estatus_licencia: "estatus_licencia", estatus_establecimiento: "estatus_establecimiento", estatus: "estatus_establecimiento",
  fecha_vencimiento: "fecha_vencimiento", fecha_de_vencimiento: "fecha_vencimiento", vencimiento: "fecha_vencimiento", telefono: "telefono", correo: "correo", email: "correo", correo_electronico: "correo",
};

interface Parsed { row: number; values: Record<Col, string | null>; key: string }
interface Note { row: number; reason: string }

/** `2027-03-05` o `05/03/2027` (día/mes/año, como se escribe en RD) → ISO; null si no es una fecha real. */
function toIsoDate(raw: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw) ?? (() => { const d = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(raw); return d ? [raw, d[3]!, d[2]!.padStart(2, "0"), d[1]!.padStart(2, "0")] : null; })();
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}`, t = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === iso ? iso : null;
}

/** Llave para no duplicar al repetir la importación: identificación, luego RUT, luego nombre + provincia + zona. */
const keyOf = (v: Record<Col, string | null>) => v.numero_identificacion ? `id:${norm(v.numero_identificacion)}` : v.rut ? `rut:${norm(v.rut)}` : `n:${norm(v.nombre ?? "")}|${norm(v.provincia ?? "")}|${norm(v.sector_zona ?? "")}`;

export function parseEstablecimientos(text: string, delimiter: Delimiter): { records: Parsed[]; errors: Note[]; warnings: Note[]; total: number; duplicates: number } {
  const { rows, lines } = parseDelimited(text, delimiter);
  if (rows.length < 2) throw new AppError("VALIDATION_ERROR", "El archivo no tiene filas de datos (falta el encabezado o está vacío)");
  const header = rows[0]!.map((h) => ALIASES[norm(h)]);
  // Con encabezados reconocibles se usan por nombre; si no, por posición (formato original del archivo oficial).
  const byName = header.filter(Boolean).length >= 3;
  const index = (c: Col) => (byName ? header.indexOf(c) : COLUMNS.indexOf(c));
  if (byName && !header.includes("nombre")) throw new AppError("VALIDATION_ERROR", "El encabezado no incluye la columna del nombre del establecimiento");
  const errors: Note[] = [], warnings: Note[] = [];
  const map = new Map<string, Parsed>();
  let duplicates = 0;
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i]!, row = lines[i]!;
    const get = (c: Col) => { const ix = index(c); const v = ix >= 0 ? (cols[ix] ?? "").trim() : ""; return v === "" ? null : v; };
    const v = Object.fromEntries(COLUMNS.map((c) => [c, get(c)])) as Record<Col, string | null>;
    if (!v.nombre) { if (errors.length < MAX_NOTES) errors.push({ row, reason: "Falta el nombre del establecimiento" }); continue; }
    if (v.nombre.length > 250) { errors.push({ row, reason: "El nombre supera los 250 caracteres" }); continue; }
    v.subsector ??= "Sin categoría";
    if (v.fecha_vencimiento) { const d = toIsoDate(v.fecha_vencimiento); if (!d && warnings.length < MAX_NOTES) warnings.push({ row, reason: `Fecha de vencimiento inválida («${v.fecha_vencimiento.slice(0, 30)}»): se guardó vacía` }); v.fecha_vencimiento = d; }
    if (v.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) { if (warnings.length < MAX_NOTES) warnings.push({ row, reason: `Correo inválido («${v.correo.slice(0, 40)}»): se guardó vacío` }); v.correo = null; }
    if (v.telefono && v.telefono.length > 40) { v.telefono = v.telefono.slice(0, 40); }
    const key = keyOf(v);
    if (map.has(key)) duplicates++;
    map.set(key, { row, values: v, key });      // en un mismo archivo, la última fila con la misma llave gana
  }
  return { records: [...map.values()], errors, warnings, total: rows.length - 1, duplicates };
}

export interface JobRow { id: string; kind: string; status: string; dry_run: boolean; file_name: string | null; delimiter: string | null; total: number; processed: number; inserted: number; updated: number; skipped: number; errors: Note[]; warnings: Note[]; error: string | null; created_at: Date; started_at: Date | null; finished_at: Date | null }

/** Importaciones masivas del panel (docs §5.17): se aceptan al instante y se procesan en segundo plano; el estado se consulta por `job_id`. */
export class ImportService {
  private readonly running = new Set<string>();
  constructor(private readonly db: Db, private readonly log: FastifyBaseLogger) {}

  async create(kind: "establecimientos", text: string, opts: { userId: string; dryRun: boolean; fileName?: string }) {
    if (Buffer.byteLength(text) > MAX_BYTES) throw AppError.validation("El archivo supera los 10 MB");
    if ((await this.db.query("SELECT 1 FROM import_jobs WHERE kind = $1 AND status IN ('queued', 'running') AND updated_at > now() - interval '15 minutes' AND NOT dry_run", [kind])).rowCount && !opts.dryRun) {
      throw new AppError("CONFLICT", "Ya hay una importación en curso; espera a que termine", { reason: "IMPORT_RUNNING" });
    }
    const delimiter = detectDelimiter(text);
    // Se valida el archivo completo antes de aceptar el trabajo: un archivo ilegible falla ya, no en segundo plano.
    let parsed;
    try { parsed = parseEstablecimientos(text, delimiter); } catch (e) { throw e instanceof AppError ? e : AppError.validation((e as Error).message); }
    if (parsed.total > MAX_ROWS) throw AppError.validation(`El archivo tiene ${parsed.total} filas; el máximo es ${MAX_ROWS}`);
    const job = (await this.db.query<{ id: string }>("INSERT INTO import_jobs (kind, dry_run, file_name, delimiter, payload, total, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id", [kind, opts.dryRun, opts.fileName ?? null, delimiter === "\t" ? "tab" : delimiter, text, parsed.total, opts.userId])).rows[0]!;
    this.spawn(job.id);
    return { job_id: job.id, total: parsed.total, delimiter: delimiter === "\t" ? "tab" : delimiter, dry_run: opts.dryRun };
  }

  spawn(id: string) {
    if (this.running.has(id)) return;
    this.running.add(id);
    setImmediate(() => { this.run(id).catch((err) => this.log.error({ err, id }, "Falló la importación")).finally(() => this.running.delete(id)); });
  }
  /** Espera a que termine un trabajo (pruebas). */
  async wait(id: string, ms = 20_000) {
    const t0 = Date.now();
    for (;;) { const j = await this.get(id); if (["done", "failed"].includes(j.status) || Date.now() - t0 > ms) return j; await new Promise((r) => setTimeout(r, 25)); }
  }

  private async run(id: string) {
    const job = (await this.db.query<{ payload: string | null; dry_run: boolean; delimiter: string | null }>("UPDATE import_jobs SET status = 'running', started_at = now(), updated_at = now() WHERE id = $1 AND status = 'queued' RETURNING payload, dry_run, delimiter", [id])).rows[0];
    if (!job) return;
    try {
      const delim = (job.delimiter === "tab" ? "\t" : job.delimiter ?? ",") as Delimiter;
      const p = parseEstablecimientos(job.payload ?? "", delim);
      let inserted = 0, updated = 0, processed = 0;
      for (let i = 0; i < p.records.length; i += BATCH) {
        const batch = p.records.slice(i, i + BATCH);
        if (job.dry_run) {
          const found = new Set((await this.db.query<{ import_key: string }>("SELECT import_key FROM establecimientos WHERE import_key = ANY($1)", [batch.map((b) => b.key)])).rows.map((r) => r.import_key));
          for (const b of batch) found.has(b.key) ? updated++ : inserted++;
        } else {
          const c = await this.db.connect();
          try {
            await c.query("BEGIN");
            for (const b of batch) {
              const v = b.values;
              const r = await c.query<{ inserted: boolean }>(
                `INSERT INTO establecimientos (import_key, subsector, actividad, rut, numero_identificacion, nombre, sector_zona, provincia, estatus_proceso, estatus_licencia, estatus_establecimiento, fecha_vencimiento, telefono, correo, is_active)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)
                 ON CONFLICT (import_key) WHERE import_key IS NOT NULL DO UPDATE SET subsector = EXCLUDED.subsector, actividad = EXCLUDED.actividad, rut = EXCLUDED.rut, numero_identificacion = EXCLUDED.numero_identificacion, nombre = EXCLUDED.nombre, sector_zona = EXCLUDED.sector_zona, provincia = EXCLUDED.provincia,
                   estatus_proceso = EXCLUDED.estatus_proceso, estatus_licencia = EXCLUDED.estatus_licencia, estatus_establecimiento = EXCLUDED.estatus_establecimiento, fecha_vencimiento = EXCLUDED.fecha_vencimiento, telefono = EXCLUDED.telefono, correo = EXCLUDED.correo, is_active = true, updated_at = now()
                 RETURNING (xmax = 0) AS inserted`,
                [b.key, v.subsector, v.actividad, v.rut, v.numero_identificacion, v.nombre, v.sector_zona, v.provincia, v.estatus_proceso, v.estatus_licencia, v.estatus_establecimiento, v.fecha_vencimiento, v.telefono, v.correo],
              );
              r.rows[0]!.inserted ? inserted++ : updated++;
            }
            await c.query("COMMIT");
          } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
        }
        processed += batch.length;
        await this.db.query("UPDATE import_jobs SET processed = $2, inserted = $3, updated = $4, updated_at = now() WHERE id = $1", [id, processed, inserted, updated]);
      }
      const skipped = p.total - p.records.length;
      await this.db.query("UPDATE import_jobs SET status = 'done', processed = $2, inserted = $3, updated = $4, skipped = $5, errors = $6, warnings = $7, payload = NULL, finished_at = now(), updated_at = now() WHERE id = $1", [id, p.records.length, inserted, updated, skipped, JSON.stringify(p.errors), JSON.stringify(p.warnings)]);
    } catch (err) {
      await this.db.query("UPDATE import_jobs SET status = 'failed', error = $2, payload = NULL, finished_at = now(), updated_at = now() WHERE id = $1", [id, (err as Error).message.slice(0, 300)]);
      throw err;
    }
  }

  async get(id: string): Promise<JobRow> {
    const j = (await this.db.query<JobRow>("SELECT id, kind, status, dry_run, file_name, delimiter, total, processed, inserted, updated, skipped, errors, warnings, error, created_at, started_at, finished_at FROM import_jobs WHERE id = $1", [id])).rows[0];
    if (!j) throw AppError.notFound("Importación");
    return j;
  }
  async list(limit = 30) { return (await this.db.query("SELECT id, kind, status, dry_run, file_name, total, inserted, updated, skipped, created_by, created_at, finished_at FROM import_jobs ORDER BY created_at DESC LIMIT $1", [limit])).rows; }

  /** Trabajos abandonados por un reinicio se marcan como fallidos; los archivos ya no se conservan y el historial se poda a los 90 días. */
  async cleanup() {
    const stuck = (await this.db.query("UPDATE import_jobs SET status = 'failed', error = 'Interrumpida (el servidor se reinició); vuelve a subir el archivo', payload = NULL, finished_at = now() WHERE status IN ('queued', 'running') AND updated_at < now() - interval '15 minutes'")).rowCount ?? 0;
    const purged = (await this.db.query("DELETE FROM import_jobs WHERE finished_at < now() - interval '90 days'")).rowCount ?? 0;
    return { interrupted: stuck, purged };
  }
}

declare module "fastify" { interface FastifyInstance { imports: ImportService } }

export async function adminImportRoutes(app: FastifyInstance) {
  const svc = app.imports;
  const r = app.withTypeProvider<ZodTypeProvider>();
  const admin = app.requireRole("admin");
  const bearer = [{ bearerAuth: [] }];
  const tag = ["admin", "importaciones"];
  const ok = z.object({ data: z.any() });

  r.post("/admin/imports/establecimientos", {
    onRequest: admin, bodyLimit: 12 * 1024 * 1024, config: { rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max: 20, timeWindow: "1 hour" } : { max: 1_000_000, timeWindow: "1 minute" } },
    schema: {
      tags: tag, summary: "Importa el directorio oficial de establecimientos desde un CSV/TXT (delimitador detectado: tabulador, `|`, `;` o coma; encabezados por nombre o, si no, por posición). Repetir el archivo actualiza en vez de duplicar. Devuelve `job_id`",
      security: bearer, body: z.object({ csv_text: z.string().min(10), file_name: z.string().max(200).optional(), dry_run: z.boolean().default(false) }), response: { 202: ok },
    },
  }, async (req, reply) => {
    const data = await svc.create("establecimientos", req.body.csv_text, { userId: req.user!.id, dryRun: req.body.dry_run, fileName: req.body.file_name });
    await audit(app.db, { actor: req.user!.id, action: "import.started", entity: "import_job", id: data.job_id, meta: { kind: "establecimientos", total: data.total, dry_run: data.dry_run }, ip: req.ip });
    reply.code(202);
    return { data };
  });
  r.get("/admin/imports/:jobId", { onRequest: admin, schema: { tags: tag, summary: "Estado de una importación: avance, insertadas, actualizadas, omitidas, errores y avisos por fila", security: bearer, params: z.object({ jobId: z.string().uuid() }), response: { 200: ok } } }, async (req) => {
    const j = await svc.get(req.params.jobId);
    return { data: { ...j, progress: j.total ? Math.round((j.processed / Math.max(1, j.total - j.skipped)) * 100) : 100 } };
  });
  r.get("/admin/imports", { onRequest: admin, schema: { tags: tag, summary: "Importaciones recientes", security: bearer, response: { 200: ok } } }, async () => ({ data: await svc.list() }));
}

export function registerImportJobs(runner: JobRegistrar, svc: ImportService) {
  runner.register({ name: "imports.cleanup", description: "Cierra importaciones interrumpidas y poda el historial de más de 90 días", everySeconds: 3600, run: async () => svc.cleanup() });
}
