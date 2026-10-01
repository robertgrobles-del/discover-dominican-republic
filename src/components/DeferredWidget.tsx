import { useEffect, useState, type ReactNode } from "react";

/** Mounts non-critical global UI after the browser has had time for first paint. */
export function DeferredWidget({ children, delayMs = 1200 }: { children: ReactNode; delayMs?: number }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const reveal = () => setReady(true);
    // El booleano evita que TypeScript restrinja el tipo de `window` y deje la rama
    // del temporizador como `never` (lib.dom ya declara requestIdleCallback).
    const supportsIdleCallback = typeof window.requestIdleCallback === "function";
    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(reveal, { timeout: delayMs });
    } else {
      timeoutId = window.setTimeout(reveal, delayMs);
    }
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
  }, [delayMs]);

  return ready ? <>{children}</> : null;
}
