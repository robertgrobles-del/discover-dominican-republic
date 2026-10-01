import { reportError } from "@/lib/errorReporter";

let installed = false;

/**
 * Escucha los errores que no pasan por ningún error boundary: excepciones sueltas
 * ("error"), promesas rechazadas sin catch ("unhandledrejection"). Sin esto, esos
 * errores sólo viven en la consola del visitante y nunca llegan a la telemetría.
 * Idempotente y devuelve una función para desinstalar (útil en pruebas).
 */
export function installGlobalErrorHandlers(): () => void {
  if (installed || typeof window === "undefined") return () => {};
  installed = true;

  const onError = (event: ErrorEvent) => {
    // Los fallos de carga de recursos (imágenes, scripts) llegan sin mensaje:
    // no aportan información y llenarían la telemetría de ruido.
    if (!event.message) return;
    reportError(event.error ?? new Error(event.message), { source: "window" });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportError(event.reason, { source: "unhandledrejection" });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    installed = false;
  };
}
