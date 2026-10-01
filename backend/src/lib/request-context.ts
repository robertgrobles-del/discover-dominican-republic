import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage<{ requestId: string }>();

/** Asocia el resto del ciclo async actual (peticiones, trabajos manuales) a un request_id de trazabilidad. */
export function bindRequestId(requestId: string) {
  als.enterWith({ requestId });
}

/** request_id del contexto actual; `undefined` fuera de una petición (p. ej. trabajos del cron). */
export function currentRequestId(): string | undefined {
  return als.getStore()?.requestId;
}
