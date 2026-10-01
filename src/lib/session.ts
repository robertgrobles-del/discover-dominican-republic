export interface SessionLike {
  /** Segundos desde epoch, como lo expone Supabase. */
  expires_at?: number;
}

export const SESSION_EXPIRED_EVENT = "dr:session-expired";

/**
 * Una sesión sin `expires_at` se considera vigente: el mock actual no siempre
 * lo incluye y el backend real es quien decide con su propio token.
 */
export function isSessionExpired(session: SessionLike | null | undefined, now = Date.now()): boolean {
  const expiresAt = session?.expires_at;
  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) return false;
  return expiresAt * 1000 <= now;
}

/**
 * Solo permite rutas internas. Rechaza `https://…`, `//dominio` y ``/\dominio``
 * (los navegadores normalizan la barra invertida a `//`), que serían un
 * open-redirect tras el inicio de sesión.
 */
export function safeReturnTo(target: string | null | undefined, fallback = "/"): string {
  const value = (target ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function dispatchSessionExpired(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
