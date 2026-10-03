/**
 * Respuesta háptica breve en acciones clave (mejora 97 del plan de arquitectura). Sólo actúa donde el
 * navegador lo permite (Android; iOS Safari no expone la vibración) y nunca si la persona pidió menos movimiento.
 */

export type HapticKind = "light" | "success" | "warning";

const PATTERNS: Record<HapticKind, number | number[]> = { light: 10, success: [12, 40, 18], warning: [30, 50, 30] };

export function haptic(kind: HapticKind = "light"): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    // Un navegador que bloquea la vibración (sin gesto del usuario, política del sitio) no debe romper la acción.
  }
}
