import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";

/**
 * Cliente del reclamo de una reserva de invitado (Plan de accesos, punto 76).
 *
 * El invitado que reservó sin cuenta recibe un correo con un enlace de un solo
 * uso. Con ese enlace puede ver una vista previa sin datos personales
 * (`previewClaim`), pedir el enlace si lo perdió (`startClaim`) y, ya con sesión
 * iniciada, vincular la reserva a su cuenta (`completeClaim`).
 *
 * Contrato real del backend (`backend/src/modules/operators/routes.ts`), todo
 * bajo `/api/v1` y envuelto en `{ data: … }`:
 *   - `GET  /bookings/claim/:token`            → `{ data: ClaimPreview }`
 *   - `POST /bookings/:id/claim/start?token=…` → `202 { data: { sent, expires_at } }`
 *   - `POST /bookings/claim` (Bearer)          → `{ data: BookingClaimed }`
 *
 * Reglas que este módulo no rompe:
 *   - Nunca revela si un correo coincide con la reserva: `startClaim` devuelve
 *     siempre la misma forma, venga del servidor o de la demo.
 *   - La vista previa no trae datos personales más allá del correo enmascarado.
 *   - En modo simulado (`IS_MOCK_DATA`) no se llama a la red jamás: se devuelve
 *     una demo **marcada** (`isDemo: true`) para que la interfaz pueda etiquetarla.
 */

export type ClaimErrorKind =
  | "token_invalido"
  | "token_vencido"
  | "ya_reclamada"
  | "sin_sesion"
  | "datos_invalidos"
  | "red"
  | "desconocido";

export interface ClaimPreview {
  /** Nombre de la organización con la que se reservó. */
  organizer: string;
  /** Servicio reservado (habitación, tour…), si el backend lo expone. */
  service?: string;
  /** Fechas ya formateadas por el backend ("2026-03-04 → 2026-03-07" o "… 09:00"). */
  dates?: string;
  /** Estado de la reserva tal cual lo expone el backend. */
  status?: string;
  /** Correo enmascarado del titular de la reserva. */
  email_masked?: string;
  /** ISO-8601 en que el enlace deja de servir. */
  expires_at?: string;
}

export interface ClaimStartResult {
  /** Siempre `true`: el backend no distingue si el correo coincidió. */
  sent: boolean;
  /** ISO-8601 de cuándo vencería el enlace que, si procede, se acaba de enviar. */
  expires_at?: string;
}

/** Reserva ya vinculada a la cuenta que la reclamó. Se deja opaco a propósito:
 *  el contrató garantiza `{ data: <reserva> }` y esta pantalla solo confirma el éxito. */
export interface ClaimedBooking {
  id?: string;
  reference?: string;
  status?: string;
  [key: string]: unknown;
}

/** Opciones comunes. `isDemo` se puede forzar para probar el camino real. */
export interface ClaimRequestOptions {
  /** Por defecto `IS_MOCK_DATA`. Con `true` no se toca la red. */
  isDemo?: boolean;
  /** `AbortSignal` opcional para cancelar al desmontar. */
  signal?: AbortSignal;
}

/** Resultado de una llamada, con la marca de demostración explícita. */
export interface ClaimResult<T> {
  data: T;
  /** `true` cuando los datos son de ejemplo y no vienen del backend. */
  isDemo: boolean;
}

/** Texto único para etiquetar cualquier superficie en modo demostración. */
export const DEMO_NOTICE =
  "Datos de demostración: esta pantalla se está mostrando sin backend (VITE_DATA_SOURCE=mock), " +
  "así que lo que ves son ejemplos y no se ha vinculado ninguna reserva real.";

/**
 * Error del reclamo. `message` es siempre el del `HttpError` del transporte
 * (o de `Error`), sin inventar mensajes que el servidor no dijo.
 */
export class ClaimError extends Error {
  readonly kind: ClaimErrorKind;
  readonly status?: number;
  /** Código del backend cuando lo trae (`INVALID_TOKEN`, `CONFLICT`, …). */
  readonly code?: string;

  constructor(message: string, kind: ClaimErrorKind, status?: number, code?: string, name = "ClaimError") {
    super(message);
    this.name = name;
    this.kind = kind;
    this.status = status;
    this.code = code;
  }

  /** `true` cuando la petición se canceló (desmontaje, navegación): no es un error del visitante. */
  get isAbort(): boolean {
    return this.name === "AbortError";
  }
}

const PREVIEW_ENDPOINT = "/bookings/claim";
const START_ENDPOINT = "/bookings";
const COMPLETE_ENDPOINT = "/bookings/claim";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

/** Extrae `code` de las respuestas de error del backend, sin asumir forma. */
function errorCode(details: unknown): string | undefined {
  if (!isRecord(details)) return undefined;
  if (typeof details.code === "string") return details.code;
  const nested = details.details;
  if (isRecord(nested) && typeof nested.code === "string") return nested.code;
  const nestedError = details.error;
  if (isRecord(nestedError)) {
    if (typeof nestedError.code === "string") return nestedError.code;
    const inner = nestedError.details;
    if (isRecord(inner) && typeof inner.code === "string") return inner.code;
  }
  return undefined;
}

/**
 * Traduce un fallo del transporte a `ClaimError` conservando su mensaje.
 * El backend responde 400 `INVALID_TOKEN` para enlaces vencidos o usados y 409
 * `CONFLICT` cuando la reserva ya es de otra cuenta; ambos se reconocen.
 */
export function toClaimError(error: unknown): ClaimError {
  if (error instanceof ClaimError) return error;
  if (error instanceof HttpError) {
    const code = errorCode(error.details);
    return new ClaimError(error.message, classifyClaimError(error.status, code), error.status, code);
  }
  if (error instanceof Error) {
    const isNetwork = error.name === "TypeError";
    // Se conserva el nombre original para no confundir una cancelación
    // (`AbortError`) con un fallo real que deba pintarse en pantalla.
    return new ClaimError(error.message, isNetwork ? "red" : "desconocido", undefined, undefined, error.name);
  }
  return new ClaimError("No se pudo completar la operación.", "desconocido");
}

/** Clasifica el fallo para que la interfaz elija el siguiente paso. */
export function classifyClaimError(status?: number, code?: string): ClaimErrorKind {
  if (code === "CONFLICT") return "ya_reclamada";
  if (code === "INVALID_TOKEN") return status === 410 ? "token_vencido" : "token_invalido";
  if (status === 409) return "ya_reclamada";
  if (status === 410) return "token_vencido";
  if (status === 404) return "token_invalido";
  if (status === 400) return "token_invalido";
  if (status === 401 || status === 403) return "sin_sesion";
  if (status === 422) return "datos_invalidos";
  if (typeof status === "number" && status >= 500) return "red";
  return "desconocido";
}

/** `true` si conviene ofrecer "pedir un enlace nuevo" como siguiente paso. */
export function canRequestNewLink(kind: ClaimErrorKind): boolean {
  return kind === "token_invalido" || kind === "token_vencido";
}

/** Explicación del siguiente paso para cada tipo de fallo. */
export function claimErrorNextStep(kind: ClaimErrorKind): string {
  switch (kind) {
    case "token_invalido":
    case "token_vencido":
      return "Los enlaces de reclamo son de un solo uso y caducan en una hora. Pide uno nuevo con el identificador de tu reserva y el token del correo original.";
    case "ya_reclamada":
      return "Si crees que es un error, inicia sesión con la cuenta que ya tiene la reserva o escribe a soporte indicando la referencia.";
    case "sin_sesion":
      return "Inicia sesión de nuevo y repite la vinculación; el enlace no se habrá consumido.";
    case "datos_invalidos":
    case "desconocido":
      return "Revisa los datos del formulario y vuelve a intentarlo.";
    case "red":
      return "No pudimos contactar con el servidor. Comprueba tu conexión y vuelve a intentarlo en unos minutos.";
    default:
      return "Vuelve a intentarlo en unos minutos.";
  }
}

function withSignal(options?: ClaimRequestOptions): RequestInit | undefined {
  return options?.signal ? { signal: options.signal } : undefined;
}

/** Clave de demostración por token, para que dos tokens no compartan vista previa. */
function demoKey(seed: string): string {
  return `demo-${seed}`.replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "demo";
}

function isoInHours(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

/**
 * Vista previa del enlace de reclamo. No requiere sesión.
 *
 * `GET /api/v1/bookings/claim/:token` → `{ data: ClaimPreview }`.
 * 404 si el token no existe, venció o ya se usó.
 */
export async function previewClaim(
  token: string,
  options?: ClaimRequestOptions,
): Promise<ClaimResult<ClaimPreview>> {
  if ((options?.isDemo ?? IS_MOCK_DATA) === true) {
    return {
      isDemo: true,
      data: {
        organizer: "Operador de demostración, S.R.L.",
        service: "Habitación doble con desayuno (demo)",
        dates: "2026-03-04 → 2026-03-07 15:00",
        status: "confirmed",
        email_masked: "a•••@e•••.com",
        expires_at: isoInHours(1),
      },
    };
  }

  try {
    const payload = await fetchApi<unknown>(`${PREVIEW_ENDPOINT}/${encodeURIComponent(token)}`, withSignal(options));
    return { isDemo: false, data: (unwrapData(payload) ?? {}) as ClaimPreview };
  } catch (error) {
    throw toClaimError(error);
  }
}

/**
 * Pide el enlace de reclamo para una reserva de invitado.
 *
 * `POST /api/v1/bookings/:bookingId/claim/start?token=<tokenDeInvitado>` con
 * `{ email }` → **siempre 202** `{ data: { sent: true, expires_at } }`.
 * El backend solo envía el correo si el email coincide, pero responde igual:
 * el cliente nunca puede deducir si el dato era correcto.
 */
export async function startClaim(
  bookingId: string,
  guestToken: string,
  email: string,
  options?: ClaimRequestOptions,
): Promise<ClaimResult<ClaimStartResult>> {
  if ((options?.isDemo ?? IS_MOCK_DATA) === true) {
    return { isDemo: true, data: { sent: true, expires_at: isoInHours(1) } };
  }

  const query = new URLSearchParams({ token: guestToken });
  try {
    const payload = await fetchApi<unknown>(
      `${START_ENDPOINT}/${encodeURIComponent(bookingId)}/claim/start?${query.toString()}`,
      {
        method: "POST",
        body: JSON.stringify({ email }),
        ...withSignal(options),
      },
    );
    const data = unwrapData(payload);
    const sent = isRecord(data) && data.sent === true;
    const expires_at = isRecord(data) && typeof data.expires_at === "string" ? data.expires_at : undefined;
    return { isDemo: false, data: { sent, expires_at } };
  } catch (error) {
    throw toClaimError(error);
  }
}

/**
 * Vincula la reserva del enlace a la cuenta autenticada.
 *
 * `POST /api/v1/bookings/claim` con `{ token }` y
 * `Authorization: Bearer <access_token>` → `{ data: <reserva de la cuenta> }`.
 * 409 si la reserva ya es de otra cuenta; 400/404/410 si el enlace venció o se usó.
 */
export async function completeClaim(
  token: string,
  accessToken: string,
  options?: ClaimRequestOptions,
): Promise<ClaimResult<ClaimedBooking>> {
  if ((options?.isDemo ?? IS_MOCK_DATA) === true) {
    return {
      isDemo: true,
      data: { id: demoKey(token), reference: "DEMO-0001", status: "confirmed" },
    };
  }

  try {
    const payload = await fetchApi<unknown>(COMPLETE_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ token }),
      ...withSignal(options),
    });
    return { isDemo: false, data: (unwrapData(payload) ?? {}) as ClaimedBooking };
  } catch (error) {
    throw toClaimError(error);
  }
}
