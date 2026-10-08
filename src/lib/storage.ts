/**
 * Unified Safe Storage Layer (Descubre RD)
 * Con soporte de namespaces, TTL (tiempo de vida), parsing seguro y degradación en memoria.
 * Cumple con las políticas de privacidad y ciclo de vida de docs/ALMACENAMIENTO_LOCAL.md
 */

export interface StorageItem<T> {
  value: T;
  expiresAt?: number; // timestamp en ms
  version?: number;
  createdAt: number;
}

export interface SetStorageOptions {
  ttlMs?: number; // Tiempo de vida en milisegundos
  version?: number;
}

const STORAGE_PREFIX = "dr_";
const inMemoryFallback = new Map<string, string>();

function getPrefixedKey(key: string): string {
  if (key.startsWith(STORAGE_PREFIX) || key.startsWith("theme") || key.startsWith("app-locale")) {
    return key;
  }
  return `${STORAGE_PREFIX}${key}`;
}

function isStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
  try {
    const storage = window[type];
    const testKey = "__dr_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = typeof window !== "undefined" && isStorageAvailable("localStorage");
const hasSessionStorage = typeof window !== "undefined" && isStorageAvailable("sessionStorage");

export const AppStorage = {
  /**
   * Guarda un valor en localStorage de forma segura con opción de TTL
   */
  set<T>(key: string, value: T, options?: SetStorageOptions): boolean {
    const fullKey = getPrefixedKey(key);
    const item: StorageItem<T> = {
      value,
      version: options?.version ?? 1,
      createdAt: Date.now(),
      expiresAt: options?.ttlMs ? Date.now() + options.ttlMs : undefined,
    };

    try {
      const serialized = JSON.stringify(item);
      if (hasLocalStorage) {
        localStorage.setItem(fullKey, serialized);
      } else {
        inMemoryFallback.set(fullKey, serialized);
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene un valor de localStorage validando su expiración
   */
  get<T>(key: string, fallback: T): T {
    const fullKey = getPrefixedKey(key);
    try {
      let raw: string | null = null;
      if (hasLocalStorage) {
        raw = localStorage.getItem(fullKey);
      } else {
        raw = inMemoryFallback.get(fullKey) ?? null;
      }

      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      // Soporte para estructura con StorageItem o valores legacy planos
      if (parsed && typeof parsed === "object" && "value" in parsed && "createdAt" in parsed) {
        const item = parsed as StorageItem<T>;
        if (item.expiresAt && Date.now() > item.expiresAt) {
          AppStorage.remove(key);
          return fallback;
        }
        return item.value;
      }

      return parsed as T;
    } catch {
      return fallback;
    }
  },

  /**
   * Elimina un elemento de localStorage
   */
  remove(key: string): void {
    const fullKey = getPrefixedKey(key);
    try {
      if (hasLocalStorage) {
        localStorage.removeItem(fullKey);
      }
      inMemoryFallback.delete(fullKey);
    } catch {
      // Ignorar errores en navegadores restrictivos
    }
  },

  /**
   * Guarda un valor en sessionStorage de forma segura
   */
  setSession<T>(key: string, value: T): boolean {
    const fullKey = getPrefixedKey(key);
    try {
      const serialized = JSON.stringify(value);
      if (hasSessionStorage) {
        sessionStorage.setItem(fullKey, serialized);
      } else {
        inMemoryFallback.set(`session:${fullKey}`, serialized);
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene un valor de sessionStorage
   */
  getSession<T>(key: string, fallback: T): T {
    const fullKey = getPrefixedKey(key);
    try {
      let raw: string | null = null;
      if (hasSessionStorage) {
        raw = sessionStorage.getItem(fullKey);
      } else {
        raw = inMemoryFallback.get(`session:${fullKey}`) ?? null;
      }

      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  /**
   * Elimina un valor de sessionStorage
   */
  removeSession(key: string): void {
    const fullKey = getPrefixedKey(key);
    try {
      if (hasSessionStorage) {
        sessionStorage.removeItem(fullKey);
      }
      inMemoryFallback.delete(`session:${fullKey}`);
    } catch {
      // Ignorar
    }
  },

  /**
   * Limpia datos de demostración o temporales respetando configuraciones del usuario
   */
  clearDemoData(): void {
    try {
      if (hasLocalStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith("dr_mock_") || k.startsWith("mockdb:") || k.startsWith("dr_demo_"))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch {
      // Ignorar
    }
  },
};
