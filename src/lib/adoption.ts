import { useEffect, useRef } from "react";
import { sendAnalyticsEvent, type AnalyticsEventType } from "@/lib/analytics-core";

/**
 * Instrumentación de adopción por perfil (Plan de accesos y paneles por perfil, punto 67).
 *
 * Mide si la gente completa el onboarding, empieza y termina tareas, abandona o se topa con errores, por
 * tipo de panel. Dos reglas que no se negocian:
 *   1. **Sin PII.** Solo viajan las claves de la lista blanca; cualquier otra cosa se descarta antes de
 *      enviarse, y ninguna clave puede describir a una persona, un recurso concreto ni un texto libre.
 *   2. **Con consentimiento.** Se usa el mismo canal que el resto de la analítica (`isAnalyticsAllowed`),
 *      así que si la persona no aceptó analítica o tiene Do Not Track, no se envía absolutamente nada.
 */

export type PanelKey = "viajero" | "empresa" | "creador" | "embajador" | "editorial" | "moderacion" | "admin";

export type AdoptionStep =
  | "panel_open"
  | "onboarding_started"
  | "onboarding_completed"
  | "task_started"
  | "task_completed"
  | "task_abandoned"
  | "task_error";

export type AdoptionTask =
  | "invitar_equipo"
  | "atender_reserva"
  | "publicar_contenido"
  | "resolver_moderacion"
  | "editar_borrador"
  | "cambiar_rol"
  | "reclamar_reserva"
  | "onboarding";

/** Lista blanca de propiedades: nada que identifique a una persona ni a un recurso concreto. */
const ALLOWED_PROPS = new Set(["panel", "step", "task", "role", "space", "result", "duration_ms", "seats", "count"]);

/** Convierte cualquier metadato en algo publicable: descarta claves no permitidas y valores no simples. */
export function sanitizeAdoptionProps(props: Record<string, unknown> = {}): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) clean[key] = Math.round(value);
    else if (typeof value === "boolean" || value === null) clean[key] = value;
    else if (typeof value === "string" && value.length <= 40 && !["@", "/", "?", ":", "\\", " "].some((c) => value.includes(c))) clean[key] = value;
  }
  return clean;
}

/** Traduce el paso de adopción al tipo de evento que ya entiende el servidor. */
function eventType(step: AdoptionStep): AnalyticsEventType {
  return step === "task_error" ? "error" : "click";
}

/** Registra un paso de adopción de un panel. Nunca lanza: la analítica no puede romper la interfaz. */
export function trackPanelAdoption(
  panel: PanelKey,
  step: AdoptionStep,
  props: Record<string, unknown> = {},
): void {
  try {
    sendAnalyticsEvent(eventType(step), "/", { panel, step, ...sanitizeAdoptionProps(props) }, { internalPanel: panel });
  } catch {
    // La medición es accesoria: si falla, la tarea de la persona sigue igual.
  }
}

/** Marca la apertura del panel una sola vez por montaje. */
export function usePanelAdoption(panel: PanelKey, props: Record<string, unknown> = {}): void {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackPanelAdoption(panel, "panel_open", props);
    // Solo la primera apertura del panel importa para la métrica.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);
}
