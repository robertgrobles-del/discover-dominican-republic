/**
 * Reads and parses a JSON value from localStorage. A previous session that
 * stored malformed data (or a key shared with an older app version) must
 * never crash the caller - callers of this app-wide state depend on it
 * mounting even when local storage is stale or unavailable.
 */
export function getStoredJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
