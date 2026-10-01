import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { auditChainVerify } from "../lib/audit.js";
import { rateLimitStoreErrorCount } from "./rate-limit-store.js";

const BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

/**
 * Métricas en formato Prometheus (`GET /metrics`, protegido con `METRICS_TOKEN`; sin token configurado la ruta no existe).
 * Las etiquetas usan el patrón de la ruta (`/orders/:id`), nunca la URL real, para no crear series infinitas ni filtrar identificadores.
 */
export function registerMetrics(app: FastifyInstance) {
  const token = app.env.METRICS_TOKEN;
  const requests = new Map<string, number>();                                 // método|ruta|clase de estado
  const latency = new Map<string, { buckets: number[]; sum: number; count: number }>(); // método|ruta
  let inFlight = 0;

  app.addHook("onRequest", async () => { inFlight++; });
  app.addHook("onResponse", async (req, reply) => {
    inFlight = Math.max(0, inFlight - 1);
    const route = req.routeOptions?.url ?? "(sin ruta)";
    if (route === "/metrics") return;
    const rk = `${req.method}|${route}|${Math.floor(reply.statusCode / 100)}xx`;
    requests.set(rk, (requests.get(rk) ?? 0) + 1);
    const lk = `${req.method}|${route}`;
    const h = latency.get(lk) ?? { buckets: BUCKETS.map(() => 0), sum: 0, count: 0 };
    const sec = reply.elapsedTime / 1000;
    BUCKETS.forEach((b, i) => { if (sec <= b) h.buckets[i]!++; });
    h.sum += sec; h.count++;
    latency.set(lk, h);
  });

  if (!token) return;
  app.get("/metrics", { config: { rateLimit: false }, schema: { hide: true } }, async (req, reply) => {
    const got = Buffer.from((req.headers.authorization ?? "").replace(/^Bearer /, ""));
    const want = Buffer.from(token);
    if (got.length !== want.length || !timingSafeEqual(got, want)) return reply.code(401).header("www-authenticate", "Bearer").send({ error: { code: "UNAUTHENTICATED", message: "Token inválido", request_id: req.id } });
    const out: string[] = [];
    const metric = (name: string, help: string, type: string) => out.push(`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`);

    metric("http_requests_total", "Solicitudes por método, ruta y clase de estado", "counter");
    for (const [k, v] of requests) { const [m, r, s] = k.split("|"); out.push(`http_requests_total{method="${m}",route="${esc(r!)}",status="${s}"} ${v}`); }
    metric("http_request_duration_seconds", "Duración de las solicitudes", "histogram");
    for (const [k, h] of latency) {
      const [m, r] = k.split("|");
      const l = `method="${m}",route="${esc(r!)}"`;
      BUCKETS.forEach((b, i) => out.push(`http_request_duration_seconds_bucket{${l},le="${b}"} ${h.buckets[i]}`));
      out.push(`http_request_duration_seconds_bucket{${l},le="+Inf"} ${h.count}`, `http_request_duration_seconds_sum{${l}} ${h.sum.toFixed(6)}`, `http_request_duration_seconds_count{${l}} ${h.count}`);
    }
    metric("http_requests_in_flight", "Solicitudes en curso", "gauge");
    out.push(`http_requests_in_flight ${inFlight}`);

    const mem = process.memoryUsage();
    metric("process_resident_memory_bytes", "Memoria residente", "gauge"); out.push(`process_resident_memory_bytes ${mem.rss}`);
    metric("process_heap_used_bytes", "Heap usado", "gauge"); out.push(`process_heap_used_bytes ${mem.heapUsed}`);
    metric("process_uptime_seconds", "Tiempo en marcha", "gauge"); out.push(`process_uptime_seconds ${Math.round(process.uptime())}`);
    metric("db_pool_connections", "Conexiones del pool de la base de datos", "gauge");
    out.push(`db_pool_connections{state="total"} ${app.db.totalCount}`, `db_pool_connections{state="idle"} ${app.db.idleCount}`, `db_pool_connections{state="waiting"} ${app.db.waitingCount}`);
    // Fallos del store de rate-limit desde el arranque del proceso: si sube, los límites dejaron de compartirse (fail-open).
    metric("app_rate_limit_store_errors_total", "Fallos del almacén de límites de tasa desde el arranque", "counter");
    out.push(`app_rate_limit_store_errors_total ${rateLimitStoreErrorCount()}`);

    // Estado del negocio: lo que hay que vigilar y alertar (trabajos caídos, cola de correo atascada, pagos por liquidar).
    try {
      const q = async (sql: string) => Number((await app.db.query<{ n: string }>(sql)).rows[0]!.n);
      metric("app_jobs_failed", "Trabajos programados en estado fallido", "gauge"); out.push(`app_jobs_failed ${await q("SELECT count(*) AS n FROM system_cron_jobs WHERE status = 'failed'")}`);
      metric("app_jobs_stale", "Trabajos activos que no corren desde hace más del triple de su frecuencia", "gauge");
      out.push(`app_jobs_stale ${await q("SELECT count(*) AS n FROM system_cron_jobs WHERE enabled AND last_run_at IS NOT NULL AND last_run_at < now() - make_interval(secs => interval_seconds * 3)")}`);
      metric("app_mail_queue_depth", "Correos en cola", "gauge"); out.push(`app_mail_queue_depth ${await q("SELECT count(*) AS n FROM email_log WHERE status = 'queued'")}`);
      metric("app_mail_oldest_queued_seconds", "Antigüedad del correo más viejo en cola", "gauge"); out.push(`app_mail_oldest_queued_seconds ${await q("SELECT coalesce(extract(epoch FROM now() - min(created_at)), 0)::int AS n FROM email_log WHERE status = 'queued'")}`);
      metric("app_mail_failed_24h", "Correos fallidos en las últimas 24 h", "gauge"); out.push(`app_mail_failed_24h ${await q("SELECT count(*) AS n FROM email_log WHERE status = 'failed' AND created_at > now() - interval '24 hours'")}`);
      metric("app_payment_events_unprocessed", "Eventos de pago recibidos y no procesados (reintentos pendientes)", "gauge"); out.push(`app_payment_events_unprocessed ${await q("SELECT count(*) AS n FROM payment_events WHERE processed_at IS NULL")}`);
      metric("app_payouts_pending", "Liquidaciones pendientes de pago", "gauge"); out.push(`app_payouts_pending ${await q("SELECT count(*) AS n FROM payouts WHERE status = 'pending'")}`);
      metric("app_bookings_pending_unpaid", "Reservas con pago en línea sin cobrar (candidatas a vencer)", "gauge"); out.push(`app_bookings_pending_unpaid ${await q("SELECT count(*) AS n FROM bookings WHERE status = 'pending' AND payment_status = 'unpaid' AND payment_mode IN ('pay_now', 'deposit')")}`);
      // Ventana reciente de la cadena de auditoría: si algún eslabón no cuadra, alguien tocó la bitácora.
      const tailId = await q("SELECT coalesce(max(id), 0)::bigint AS n FROM audit_log");
      const chain = await auditChainVerify(app.db, { afterId: Math.max(0, tailId - 2000) });
      metric("app_audit_chain_broken", "Eslabones rotos en la cadena de hash de la auditoría (ventana reciente)", "gauge"); out.push(`app_audit_chain_broken ${chain.broken.length}`);
      metric("app_db_up", "1 si la base de datos responde", "gauge"); out.push("app_db_up 1");
    } catch {
      metric("app_db_up", "1 si la base de datos responde", "gauge"); out.push("app_db_up 0");
    }
    return reply.header("content-type", "text/plain; version=0.0.4; charset=utf-8").send(out.join("\n") + "\n");
  });
}
