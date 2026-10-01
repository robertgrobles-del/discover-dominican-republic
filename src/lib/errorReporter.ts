import { sendAnalyticsEvent } from "@/lib/analytics-core";
import { isAnalyticsAllowed } from "@/lib/privacy-consent";

export type ErrorSource = "window" | "unhandledrejection" | "render" | "api";

interface ErrorOrigin {
  source: ErrorSource;
  /** Código HTTP cuando el error viene del transporte. */
  status?: number;
  /** Ruta del API que falló (sin query string); se limpia antes de viajar. */
  endpoint?: string;
}

export interface NormalizedError {
  name: string;
  message: string;
  stack?: string;
}

const MAX_MESSAGE = 90;
const MAX_FRAME = 60;
const DEDUPE_WINDOW_MS = 60_000;
const MAX_EVENTS_PER_SESSION = 10;
/** Caracteres que el limpiador de analítica (cliente y servidor) descarta: el reporte se normaliza para sobrevivir. */
const CHARS_DROPPED_BY_ANALYTICS = /[@:/?\\]/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const JWT = /\beyJ[\w-]{8,}\.[\w-]{8,}(?:\.[\w-]{8,})?/g;
const URL_WITH_QUERY = /(https?:\/\/[^\s"'<>?]+)\?[^\s"'<>]*/g;
const LONG_TOKEN = /\b[A-Za-z0-9_-]{24,}\b/g;

/** Quita del texto todo lo que pueda identificar a una persona o autorizar una sesión. */
export function redactErrorText(text: string): string {
  return text
    .replace(EMAIL, "[correo]")
    .replace(JWT, "[token]")
    .replace(URL_WITH_QUERY, "$1")
    .replace(LONG_TOKEN, "[token]");
}

function toAnalyticsSafeText(text: string, max: number): string {
  return redactErrorText(text).replace(CHARS_DROPPED_BY_ANALYTICS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function fingerprint(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** Primer fotograma útil del stack, reducido a archivo y línea (sin rutas completas). */
function topFrame(stack?: string): string | undefined {
  if (!stack) return undefined;
  for (const line of stack.split("\n")) {
    const file = line.match(/([\w.@$/-]+\.(?:tsx|ts|jsx|js)):(\d+)/);
    if (file) {
      const base = file[1].split("/").pop()!.replace(CHARS_DROPPED_BY_ANALYTICS, " ").trim();
      return `${base}(${file[2]})`;
    }
  }
  return undefined;
}

function normalizeError(error: unknown): NormalizedError {
  if (error === undefined || error === null) return { name: "Error", message: "" };
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack };
  if (typeof error === "string") return { name: "Error", message: error };
  if (error && typeof error === "object") {
    const candidate = error as { name?: unknown; message?: unknown; stack?: unknown };
    return {
      name: typeof candidate.name === "string" ? candidate.name : "Error",
      message: typeof candidate.message === "string" ? candidate.message : String(error),
      stack: typeof candidate.stack === "string" ? candidate.stack : undefined,
    };
  }
  return { name: "Error", message: String(error) };
}

const lastSentAt = new Map<string, number>();
let sentThisSession = 0;

/**
 * Reporta un error de forma anónima y con redacción de datos sensibles (correos, tokens, URLs con parámetros).
 * Nunca lanza, nunca bloquea y respeta el consentimiento: si la analítica está desactivada sólo queda en consola.
 * Las rutas privadas (pago, sesión, paneles) quedan fuera por la política compartida de analítica.
 */
export function reportError(error: unknown, origin: ErrorOrigin = { source: "window" }): void {
  try {
    if (typeof window === "undefined" || !isAnalyticsAllowed()) return;
    const { name, message, stack } = normalizeError(error);
    if (!message || message === "Script error.") return;

    const frame = topFrame(stack);
    const signature = fingerprint(`${name}|${message}|${frame ?? ""}`);
    const now = Date.now();
    const previous = lastSentAt.get(signature);
    if (previous !== undefined && now - previous < DEDUPE_WINDOW_MS) return;
    if (sentThisSession >= MAX_EVENTS_PER_SESSION) return;
    if (lastSentAt.size > 200) lastSentAt.clear();

    const props: Record<string, unknown> = {
      sig: signature,
      kind: toAnalyticsSafeText(name, 40) || "Error",
      src: origin.source,
      msg: toAnalyticsSafeText(message, MAX_MESSAGE),
    };
    if (frame) props.at = toAnalyticsSafeText(frame, MAX_FRAME);
    if (typeof origin.status === "number") props.st = origin.status;
    if (origin.endpoint) props.ep = toAnalyticsSafeText(origin.endpoint, 60);

    lastSentAt.set(signature, now);
    sentThisSession += 1;
    sendAnalyticsEvent("error", window.location.pathname, props);
  } catch {
    // La telemetría jamás debe romper la aplicación.
  }
}
