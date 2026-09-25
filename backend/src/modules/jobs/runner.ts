import type { FastifyBaseLogger } from "fastify";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";

export interface JobDef {
  name: string;
  description: string;
  /** Frecuencia por defecto; el panel puede cambiarla (queda en `system_cron_jobs.interval_seconds`). */
  everySeconds: number;
  run: (ctx: { now: Date; log: FastifyBaseLogger }) => Promise<Record<string, unknown> | void>;
}

const STALE_MINUTES = 60;

/**
 * Ejecutor de trabajos programados (docs §9). El estado vive en `system_cron_jobs`, así que es visible y controlable desde el panel
 * y seguro con varias instancias: cada ciclo "reclama" un trabajo vencido con un UPDATE atómico y sólo quien lo reclama lo ejecuta.
 * Un trabajo que quedó "running" más de una hora (proceso caído) se considera huérfano y se reclama de nuevo.
 */
export class JobRunner {
  private readonly jobs = new Map<string, JobDef>();
  private timer: NodeJS.Timeout | null = null;
  private ticking: Promise<void> | null = null;

  constructor(private readonly db: Db, private readonly log: FastifyBaseLogger) {}

  register(job: JobDef) { this.jobs.set(job.name, job); }
  get names() { return [...this.jobs.keys()]; }

  /** Crea la fila de cada trabajo registrado (sin pisar la frecuencia ni el estado "activo" que el panel haya cambiado). */
  async sync() {
    for (const j of this.jobs.values()) {
      await this.db.query(
        `INSERT INTO system_cron_jobs (job_name, schedule_cron, description, interval_seconds, status) VALUES ($1, $2, $3, $4, 'idle')
         ON CONFLICT (job_name) DO UPDATE SET description = EXCLUDED.description`,
        [j.name, `every ${j.everySeconds}s`, j.description, j.everySeconds],
      );
    }
  }

  start(tickMs = 30_000) {
    if (this.timer) return;
    void this.sync().catch((err) => this.log.error({ err }, "No se pudieron registrar los trabajos"));
    this.timer = setInterval(() => { void this.tick().catch((err) => this.log.error({ err }, "Falló el ciclo de trabajos")); }, tickMs);
    this.timer.unref();
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.ticking?.catch(() => undefined);
  }

  /** Ejecuta todos los trabajos vencidos (uno tras otro). Devuelve los nombres ejecutados. */
  async tick(now = new Date()): Promise<string[]> {
    if (this.ticking) { await this.ticking; return []; }
    await this.sync();
    const ran: string[] = [];
    this.ticking = (async () => {
      for (const name of this.jobs.keys()) if (await this.execute(name, { now, onlyIfDue: true })) ran.push(name);
    })();
    try { await this.ticking; } finally { this.ticking = null; }
    return ran;
  }

  /** Ejecución manual desde el panel (ignora la frecuencia, pero no corre si ya está corriendo). */
  async runNow(name: string) {
    if (!this.jobs.has(name)) throw AppError.notFound("Trabajo");
    await this.sync();
    const result = await this.execute(name, { now: new Date(), onlyIfDue: false });
    if (!result) throw new AppError("CONFLICT", "El trabajo ya se está ejecutando", { reason: "JOB_RUNNING" });
    return result;
  }

  private async execute(name: string, o: { now: Date; onlyIfDue: boolean }): Promise<{ status: "success" | "failed"; result?: unknown; error?: string } | null> {
    const job = this.jobs.get(name)!;
    const claim = await this.db.query(
      `UPDATE system_cron_jobs SET status = 'running', started_at = now()
        WHERE job_name = $1
          AND (status IS DISTINCT FROM 'running' OR started_at < now() - make_interval(mins => $2))
          AND (NOT $3::boolean OR (enabled AND (next_run_at IS NULL OR next_run_at <= now())))
        RETURNING id`, [name, STALE_MINUTES, o.onlyIfDue],
    );
    if (!claim.rowCount) return null;
    const t0 = Date.now();
    let outcome: { status: "success" | "failed"; result?: unknown; error?: string };
    try {
      const result = (await job.run({ now: o.now, log: this.log })) ?? {};
      outcome = { status: "success", result };
    } catch (err) {
      this.log.error({ err, job: name }, "Falló un trabajo programado");
      outcome = { status: "failed", error: err instanceof Error ? err.message.slice(0, 500) : "Error desconocido" };
    }
    await this.db.query(
      `UPDATE system_cron_jobs SET status = $2, last_run_at = now(), last_duration_ms = $3, last_result = $4, error_log = $5,
              next_run_at = now() + make_interval(secs => interval_seconds) WHERE job_name = $1`,
      [name, outcome.status, Date.now() - t0, JSON.stringify(outcome.result ?? null), outcome.error ?? null],
    );
    return outcome;
  }

  async list() {
    await this.sync();
    const { rows } = await this.db.query("SELECT job_name AS name, description, interval_seconds, enabled, status, last_run_at, next_run_at, last_duration_ms, last_result, error_log FROM system_cron_jobs ORDER BY job_name");
    return rows.filter((r) => this.jobs.has(r.name));
  }

  async update(name: string, patch: { enabled?: boolean; interval_seconds?: number }) {
    if (!this.jobs.has(name)) throw AppError.notFound("Trabajo");
    await this.sync();
    await this.db.query("UPDATE system_cron_jobs SET enabled = coalesce($2, enabled), interval_seconds = coalesce($3, interval_seconds) WHERE job_name = $1", [name, patch.enabled ?? null, patch.interval_seconds ?? null]);
  }
}
