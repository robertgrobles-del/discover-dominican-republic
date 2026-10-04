import { createHash, randomUUID } from "node:crypto";
import { hostname } from "node:os";

/**
 * Monitoreo de errores: envía las excepciones no controladas a Sentry y avisa al canal del equipo
 * (Slack o Discord) por webhook.
 *
 * Sin SDK: Sentry acepta eventos por HTTP (un «envelope» por evento), y así la API no carga una dependencia
 * que instrumenta todo el proceso. Lo que se pierde frente al SDK —migas de pan automáticas, trazas de
 * rendimiento— no se usa aquí; las métricas ya salen por `/metrics`.
 *
 * Reglas:
 *  - Nunca rompe ni retrasa la petición: el envío es en segundo plano, con tope de tiempo, y sus fallos se
 *    registran y se olvidan.
 *  - Nunca envía datos personales: de la petición sólo viajan el método, la ruta declarada (`/users/:id`, no
 *    la URL real), el identificador de la petición y el id de la cuenta. Ni cuerpo, ni consulta, ni cabeceras.
 *  - No inunda el canal: el mismo error avisa una vez cada cinco minutos, y hay un tope global por minuto.
 *    A Sentry sí va cada ocurrencia (hasta su propio tope), porque es él quien las agrupa y cuenta.
 */

export interface ErrorContext {
  /** Dónde ocurrió, para quien lee el aviso: "petición", "tarea programada", "proceso"… */
  source?: string;
  requestId?: string;
  method?: string;
  /** Ruta tal como está declarada (con sus parámetros sin sustituir). */
  route?: string;
  userId?: string;
  /** `fatal` cuando el proceso va a terminar. */
  level?: "error" | "fatal";
  tags?: Record<string, string>;
}

export interface ErrorReporterOptions {
  dsn?: string;
  webhookUrl?: string;
  environment: string;
  release?: string;
  serverName?: string;
  fetch?: typeof fetch;
  now?: () => number;
  /** Registro de los fallos del propio envío. */
  log?: (message: string) => void;
}

export interface ErrorReporter {
  enabled: boolean;
  /** Reporta sin esperar. Devuelve la promesa del envío para quien necesite aguardarla (el cierre del proceso). */
  capture(err: unknown, ctx?: ErrorContext): Promise<void>;
}

interface Dsn { key: string; envelopeUrl: string; raw: string }

/** `https://<clave>@<host>/<proyecto>` → dónde se envía y con qué clave. `null` si no tiene esa forma. */
export function parseDsn(dsn: string | undefined): Dsn | null {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const project = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!url.username || !/^\d+$/.test(project.split("/").pop() ?? "")) return null;
    const prefix = project.includes("/") ? `/${project.slice(0, project.lastIndexOf("/"))}` : "";
    return { key: url.username, envelopeUrl: `${url.protocol}//${url.host}${prefix}/api/${project.split("/").pop()}/envelope/`, raw: dsn };
  } catch {
    return null;
  }
}

interface Frame { filename: string; function: string; lineno?: number; colno?: number; in_app: boolean }

/** Pila de V8 → marcos de Sentry (del más antiguo al más reciente, como los espera). */
export function parseStack(stack: string | undefined): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  for (const line of stack.split("\n").slice(1, 51)) {
    const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line);
    if (!m) continue;
    const filename = m[2]!.replace(/^file:\/\//, "");
    frames.push({ function: m[1] ?? "<anónimo>", filename, lineno: Number(m[3]), colno: Number(m[4]), in_app: !filename.includes("node_modules") && !filename.startsWith("node:") });
  }
  return frames.reverse();
}

const asError = (err: unknown): Error => (err instanceof Error ? err : new Error(typeof err === "string" ? err : `Valor lanzado que no es un Error: ${safeJson(err)}`));
function safeJson(value: unknown): string { try { return JSON.stringify(value)?.slice(0, 300) ?? String(value); } catch { return String(value); } }
const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

/** Huella estable de un error: su tipo, su mensaje sin números ni identificadores, y el primer marco propio. */
export function fingerprint(err: Error, ctx: ErrorContext): string {
  const own = parseStack(err.stack).reverse().find((f) => f.in_app);
  const message = err.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi, "<uuid>").replace(/\d+/g, "<n>");
  return createHash("sha1").update([err.name, message, own?.filename, own?.lineno, ctx.route].join("|")).digest("hex").slice(0, 16);
}

const ALERT_REPEAT_MS = 5 * 60_000, ALERTS_PER_MINUTE = 6, EVENTS_PER_MINUTE = 60, TIMEOUT_MS = 5_000;

export function createErrorReporter(options: ErrorReporterOptions): ErrorReporter {
  const dsn = parseDsn(options.dsn);
  const webhook = options.webhookUrl;
  const send = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const serverName = options.serverName ?? hostname();
  const lastAlert = new Map<string, { at: number; suppressed: number }>();
  const alertWindow = { start: 0, count: 0 }, eventWindow = { start: 0, count: 0 };

  /** Cuenta dentro de la ventana de un minuto; `false` cuando ya se alcanzó el tope. */
  const allow = (window: { start: number; count: number }, max: number, at: number) => {
    if (at - window.start >= 60_000) { window.start = at; window.count = 0; }
    return ++window.count <= max;
  };
  const post = async (url: string, body: string, headers: Record<string, string>) => {
    try {
      const res = await send(url, { method: "POST", headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) options.log?.(`El monitoreo respondió ${res.status} (${new URL(url).host})`);
    } catch (e) {
      options.log?.(`No se pudo enviar al monitoreo (${new URL(url).host}): ${(e as Error).message}`);
    }
  };

  function sentryEvent(error: Error, ctx: ErrorContext, eventId: string, at: number): string {
    const event = {
      event_id: eventId, timestamp: at / 1000, platform: "node", level: ctx.level ?? "error",
      environment: options.environment, release: options.release, server_name: serverName,
      exception: { values: [{ type: error.name, value: clip(error.message, 1000), stacktrace: { frames: parseStack(error.stack) } }] },
      tags: { ...(ctx.tags ?? {}), ...(ctx.source ? { source: ctx.source } : {}), ...(ctx.requestId ? { request_id: ctx.requestId } : {}), ...(ctx.route ? { route: ctx.route } : {}), ...(ctx.method ? { method: ctx.method } : {}) },
      ...(ctx.route ? { transaction: `${ctx.method ?? ""} ${ctx.route}`.trim() } : {}),
      ...(ctx.userId ? { user: { id: ctx.userId } } : {}),
      fingerprint: [fingerprint(error, ctx)],
    };
    const payload = JSON.stringify(event);
    return [JSON.stringify({ event_id: eventId, sent_at: new Date(at).toISOString(), dsn: dsn!.raw }), JSON.stringify({ type: "event", length: Buffer.byteLength(payload) }), payload].join("\n");
  }

  function alertBody(error: Error, ctx: ErrorContext, suppressed: number): string {
    const where = [ctx.method, ctx.route].filter(Boolean).join(" ");
    const lines = [
      `${ctx.level === "fatal" ? "🔴 La API se detuvo" : "⚠️ Error en la API"} · ${options.environment}${options.release ? ` · ${options.release}` : ""}`,
      `${error.name}: ${clip(error.message, 300)}`,
      [ctx.source, where, ctx.requestId ? `petición ${ctx.requestId}` : ""].filter(Boolean).join(" · "),
      suppressed > 0 ? `(${suppressed} repeticiones más desde el último aviso)` : "",
    ].filter(Boolean);
    const text = lines.join("\n");
    // Discord espera `content`; Slack y los compatibles (Mattermost, Teams con conector) esperan `text`.
    return JSON.stringify(/(^|\.)discord(app)?\.com$/.test(new URL(webhook!).hostname) ? { content: clip(text, 1900) } : { text });
  }

  return {
    enabled: !!dsn || !!webhook,
    async capture(err, ctx = {}) {
      if (!dsn && !webhook) return;
      try {
        const error = asError(err), at = now(), sends: Promise<void>[] = [];
        if (dsn && allow(eventWindow, EVENTS_PER_MINUTE, at)) {
          const eventId = randomUUID().replace(/-/g, "");
          sends.push(post(dsn.envelopeUrl, sentryEvent(error, ctx, eventId, at), { "content-type": "application/x-sentry-envelope", "x-sentry-auth": `Sentry sentry_version=7, sentry_client=descubre-rd/1.0, sentry_key=${dsn.key}` }));
        }
        if (webhook) {
          const key = fingerprint(error, ctx), previous = lastAlert.get(key);
          // Un error fatal siempre avisa: es el último mensaje del proceso.
          if (ctx.level !== "fatal" && previous && at - previous.at < ALERT_REPEAT_MS) previous.suppressed++;
          else if (ctx.level === "fatal" || allow(alertWindow, ALERTS_PER_MINUTE, at)) {
            lastAlert.set(key, { at, suppressed: 0 });
            if (lastAlert.size > 500) lastAlert.delete(lastAlert.keys().next().value!);
            sends.push(post(webhook, alertBody(error, ctx, previous?.suppressed ?? 0), { "content-type": "application/json" }));
          }
        }
        await Promise.all(sends);
      } catch (e) {
        options.log?.(`El reporte de errores falló: ${(e as Error).message}`);
      }
    },
  };
}
