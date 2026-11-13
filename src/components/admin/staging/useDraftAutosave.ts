import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const AUTOSAVE_PREFIX = "drd:admin:autosave:";
export const AUTOSAVE_INTERVAL_KEY = "drd:admin:autosave-interval-ms";
export const AUTOSAVE_EVENT = "drd:autosave-change";

/** Opciones dentro de la ventana solicitada de 5 a 10 minutos (5 min por defecto). */
export const AUTOSAVE_INTERVAL_OPTIONS = [
  { label: "5 min", ms: 5 * 60_000 },
  { label: "8 min", ms: 8 * 60_000 },
  { label: "10 min", ms: 10 * 60_000 },
] as const;

export const DEFAULT_AUTOSAVE_INTERVAL_MS = 5 * 60_000;

export const RESOURCE_TO_TAB: Record<string, string> = {
  news: "noticias",
  provinces: "provincias",
  municipalities: "municipios",
  destinations: "destinos",
  events: "eventos",
  venues: "recintos",
  beaches: "playas",
};

export const RESOURCE_LABELS: Record<string, string> = {
  news: "Noticia",
  provinces: "Provincia",
  municipalities: "Municipio",
  destinations: "Destino",
  events: "Evento",
  venues: "Recinto",
  beaches: "Playa",
};

export interface LocalDraftRecord<T = unknown> {
  version: 1;
  resource: string;
  itemId: string;
  title: string;
  snapshot: T;
  serialized: string;
  updatedAt: number;
  dirtySince: number;
  serverSyncedAt?: number;
  pendingSync?: boolean;
  lastError?: string | null;
}

export function draftStorageKey(resource: string, itemId: string | null | undefined): string {
  return `${AUTOSAVE_PREFIX}${resource}:${itemId || "new"}`;
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function notifyAutosaveChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTOSAVE_EVENT));
  }
}

export function getAutosaveIntervalMs(): number {
  const ls = safeStorage();
  if (!ls) return DEFAULT_AUTOSAVE_INTERVAL_MS;
  const raw = Number(ls.getItem(AUTOSAVE_INTERVAL_KEY));
  return AUTOSAVE_INTERVAL_OPTIONS.some((o) => o.ms === raw) ? raw : DEFAULT_AUTOSAVE_INTERVAL_MS;
}

export function setAutosaveIntervalMs(ms: number): void {
  if (!AUTOSAVE_INTERVAL_OPTIONS.some((o) => o.ms === ms)) return;
  const ls = safeStorage();
  if (!ls) return;
  try {
    ls.setItem(AUTOSAVE_INTERVAL_KEY, String(ms));
    notifyAutosaveChange();
  } catch {
    // ignore storage quota errors
  }
}

export function saveLocalDraftRecord<T>(record: LocalDraftRecord<T>): boolean {
  const ls = safeStorage();
  if (!ls) return false;
  try {
    ls.setItem(draftStorageKey(record.resource, record.itemId), JSON.stringify(record));
    notifyAutosaveChange();
    return true;
  } catch {
    return false;
  }
}

export function readLocalDraftRecord<T = unknown>(
  resource: string,
  itemId: string | null | undefined,
): LocalDraftRecord<T> | null {
  const ls = safeStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(draftStorageKey(resource, itemId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraftRecord<T>;
    if (!parsed || parsed.version !== 1 || !parsed.resource) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function discardLocalDraftRecord(resource: string, itemId: string | null | undefined): void {
  const ls = safeStorage();
  if (!ls) return;
  try {
    ls.removeItem(draftStorageKey(resource, itemId));
    notifyAutosaveChange();
  } catch {
    // ignore
  }
}

export function listLocalDrafts(): LocalDraftRecord[] {
  const ls = safeStorage();
  if (!ls) return [];
  const list: LocalDraftRecord[] = [];
  for (let i = 0; i < ls.length; i += 1) {
    const key = ls.key(i);
    if (!key || !key.startsWith(AUTOSAVE_PREFIX)) continue;
    try {
      const raw = ls.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LocalDraftRecord;
      if (parsed?.version === 1 && parsed.resource) list.push(parsed);
    } catch {
      // ignore corrupted draft slot
    }
  }
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function isRecoverableDraft(
  record: LocalDraftRecord | null,
  currentSerialized: string,
  serverUpdatedAt?: string | null,
): boolean {
  if (!record) return false;
  if (record.serialized === currentSerialized) return false;
  if (record.itemId === "new" || record.pendingSync) return true;
  if (!serverUpdatedAt) return true;
  const serverMs = Date.parse(serverUpdatedAt);
  if (!Number.isFinite(serverMs)) return true;
  return record.updatedAt > serverMs;
}

export function formatRelativeTimeEs(ms: number, now = Date.now()): string {
  const diff = Math.max(0, Math.round((now - ms) / 1000));
  if (diff < 60) return "hace unos segundos";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

const toSlug = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function buildAutoDraftSlug(nameOrTitle: string, currentSlug: string, prefix = "borrador"): string {
  const clean = currentSlug.trim() || toSlug(nameOrTitle);
  if (clean) return clean;
  return `${prefix}-${Date.now().toString(36)}`;
}

export function formatCountdownEs(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface ServerAutoSaveResult {
  id: string;
  slug?: string;
  updated_at?: string;
}

export interface UseDraftAutosaveOptions<T> {
  resource: string;
  /** ID inicial del registro (`null` o `undefined` si es nuevo). */
  itemId: string | null | undefined;
  /** Estado actual del contenido (`"draft"`, `"published"`, etc.). */
  status: string;
  /** Estado serializable completo del editor. */
  snapshot: T;
  /** Título legible para mostrar en recuperación y escritorio. */
  title: string;
  /** Timestamp `updated_at` que vino del servidor al abrir el registro. */
  serverUpdatedAt?: string | null;
  /** Restaura los estados del editor desde un snapshot recuperado. */
  onRestore: (snapshot: T) => void;
  /** Se llama cuando un borrador nuevo recibe ID en servidor para evitar duplicados. */
  onPromoted?: (saved: ServerAutoSaveResult) => void;
  /** Devuelve motivo legible si aún falta un campo obligatorio para crear el borrador en el servidor. */
  getServerDraftBlocker?: (snapshot: T) => string | null;
  /** Guarda el contenido como `draft` en la API sin cerrar el editor. */
  onServerAutoDraft: (snapshot: T, effectiveId: string | null) => Promise<ServerAutoSaveResult | void>;
  /** Callback opcional de guardado manual para atajo `Ctrl+S` / `Cmd+S`. */
  onManualSave?: () => void;
  /** Desactivar temporalmente (por ejemplo en pruebas o submodos). */
  disabled?: boolean;
}

export function useDraftAutosave<T>({
  resource,
  itemId,
  status,
  snapshot,
  title,
  serverUpdatedAt,
  onRestore,
  onPromoted,
  getServerDraftBlocker,
  onServerAutoDraft,
  onManualSave,
  disabled = false,
}: UseDraftAutosaveOptions<T>) {
  const initialId = itemId || null;
  const [promotedId, setPromotedId] = useState<string | null>(initialId);
  const effectiveId = promotedId ?? initialId;
  const storageId = effectiveId ?? "new";

  const serialized = useMemo(() => JSON.stringify(snapshot), [snapshot]);
  const [baselineSerialized, setBaselineSerialized] = useState<string>(() => serialized);
  const isDirty = !disabled && serialized !== baselineSerialized;

  const [intervalMs, setIntervalMsState] = useState<number>(() => getAutosaveIntervalMs());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine !== false : true,
  );
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [dirtySince, setDirtySince] = useState<number | null>(null);
  const [lastLocalSavedAt, setLastLocalSavedAt] = useState<number | null>(null);
  const [lastServerSavedAt, setLastServerSavedAt] = useState<number | null>(null);
  const [pendingSync, setPendingSync] = useState<boolean>(false);
  const [isSavingAuto, setIsSavingAuto] = useState<boolean>(false);
  const [lastAutoError, setLastAutoError] = useState<string | null>(null);

  const [recoveryDraft, setRecoveryDraft] = useState<LocalDraftRecord<T> | null>(() => {
    if (disabled) return null;
    const found = readLocalDraftRecord<T>(resource, initialId ?? "new");
    return isRecoverableDraft(found, serialized, serverUpdatedAt) ? found : null;
  });

  // Referencias para flush síncrono ante cierre inesperado / corte de luz / offline
  const latestRef = useRef({
    disabled,
    resource,
    storageId,
    effectiveId,
    status,
    snapshot,
    serialized,
    baselineSerialized,
    isDirty,
    title,
    dirtySince,
    pendingSync,
    isOnline,
    isSavingAuto,
    intervalMs,
  });
  latestRef.current = {
    disabled,
    resource,
    storageId,
    effectiveId,
    status,
    snapshot,
    serialized,
    baselineSerialized,
    isDirty,
    title,
    dirtySince,
    pendingSync,
    isOnline,
    isSavingAuto,
    intervalMs,
  };

  const callbacksRef = useRef({ onRestore, onPromoted, getServerDraftBlocker, onServerAutoDraft, onManualSave });
  callbacksRef.current = { onRestore, onPromoted, getServerDraftBlocker, onServerAutoDraft, onManualSave };

  // Si cambia la fila que se está editando, reiniciar el estado del hook
  const prevInitialKeyRef = useRef(`${resource}:${initialId ?? "new"}`);
  useEffect(() => {
    const nextKey = `${resource}:${initialId ?? "new"}`;
    if (prevInitialKeyRef.current !== nextKey) {
      prevInitialKeyRef.current = nextKey;
      setPromotedId(initialId);
      setBaselineSerialized(serialized);
      setDirtySince(null);
      setPendingSync(false);
      setLastAutoError(null);
      const found = readLocalDraftRecord<T>(resource, initialId ?? "new");
      setRecoveryDraft(isRecoverableDraft(found, serialized, serverUpdatedAt) ? found : null);
    }
  }, [resource, initialId, serialized, serverUpdatedAt]);

  // Solo auto-guardamos en el servidor si es un post nuevo o un borrador existente (nunca pisar un post ya publicado en vivo sin confirmación)
  const canAutoSaveServer = !effectiveId || status !== "published";
  const serverBlocker = useMemo(
    () => (canAutoSaveServer ? callbacksRef.current.getServerDraftBlocker?.(snapshot) ?? null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canAutoSaveServer, serialized],
  );

  // Marca dirtySince apenas haya un cambio sin guardar
  useEffect(() => {
    if (isDirty) {
      setDirtySince((prev) => prev ?? Date.now());
    } else {
      setDirtySince(null);
      setPendingSync(false);
      setLastAutoError(null);
    }
  }, [isDirty]);

  const flushLocalNow = useCallback((overridePending?: boolean, errorMsg?: string | null) => {
    const cur = latestRef.current;
    if (cur.disabled || cur.serialized === cur.baselineSerialized) return false;
    const now = Date.now();
    const ok = saveLocalDraftRecord<T>({
      version: 1,
      resource: cur.resource,
      itemId: cur.storageId,
      title: cur.title.trim() || "Borrador sin título",
      snapshot: cur.snapshot,
      serialized: cur.serialized,
      updatedAt: now,
      dirtySince: cur.dirtySince ?? now,
      pendingSync: overridePending ?? cur.pendingSync,
      lastError: errorMsg !== undefined ? errorMsg : null,
    });
    if (ok) setLastLocalSavedAt(now);
    return ok;
  }, []);

  // Respaldo local con debounce de 700 ms cada vez que cambia el contenido
  useEffect(() => {
    if (!isDirty || disabled) return;
    const timer = window.setTimeout(() => {
      flushLocalNow();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isDirty, serialized, disabled, flushLocalNow]);

  // Flush inmediato antes de cerrar pestaña, suspender el equipo o cambiar de visibilidad
  useEffect(() => {
    if (disabled) return;
    const flush = () => { flushLocalNow(); };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disabled, flushLocalNow]);

  // Ejecución de autoguardado al servidor como borrador
  const syncInFlightRef = useRef(false);
  const syncPromiseRef = useRef<Promise<boolean> | null>(null);
  const syncDraftToServer = useCallback(async (force = false): Promise<boolean> => {
    const cur = latestRef.current;
    if (cur.disabled || syncInFlightRef.current) return false;
    if (cur.effectiveId && cur.status === "published") return false;
    if (!force && cur.serialized === cur.baselineSerialized && !cur.pendingSync) return false;

    const blocker = callbacksRef.current.getServerDraftBlocker?.(cur.snapshot) ?? null;
    if (blocker) {
      flushLocalNow(false, blocker);
      return false;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setIsOnline(false);
      setPendingSync(true);
      setLastAutoError("Sin conexión: guardado en este equipo para subir al volver internet.");
      flushLocalNow(true, "Sin conexión");
      return false;
    }

    syncInFlightRef.current = true;
    let done!: (v: boolean) => void;
    syncPromiseRef.current = new Promise<boolean>((r) => { done = r; });
    let ok = false;
    setIsSavingAuto(true);
    setLastAutoError(null);
    const snapshotSerializedAtStart = cur.serialized;

    try {
      const saved = await callbacksRef.current.onServerAutoDraft(cur.snapshot, cur.effectiveId);
      const savedObj = saved && typeof saved === "object" ? saved : undefined;
      const savedId = savedObj?.id ?? cur.effectiveId;
      const now = Date.now();
      setLastServerSavedAt(now);
      setPendingSync(false);
      setLastAutoError(null);

      // Si era nuevo, migrar / limpiar la clave "new" y adoptar el ID real para nunca duplicar
      if (!cur.effectiveId && savedId) {
        discardLocalDraftRecord(cur.resource, "new");
        latestRef.current.effectiveId = savedId;
        latestRef.current.storageId = savedId;
        setPromotedId(savedId);
        callbacksRef.current.onPromoted?.({ id: savedId, slug: savedObj?.slug, updated_at: savedObj?.updated_at });
      }

      latestRef.current.pendingSync = false;
      if (latestRef.current.serialized === snapshotSerializedAtStart) {
        latestRef.current.baselineSerialized = snapshotSerializedAtStart;
        latestRef.current.isDirty = false;
        latestRef.current.dirtySince = null;
        setBaselineSerialized(snapshotSerializedAtStart);
        setDirtySince(null);
        discardLocalDraftRecord(cur.resource, savedId ?? cur.storageId);
      } else {
        // Siguieron editando durante el request: reiniciar el reloj desde aquí
        latestRef.current.dirtySince = now;
        setDirtySince(now);
        flushLocalNow(false, null);
      }
      ok = true;
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo sincronizar el borrador";
      setPendingSync(true);
      setLastAutoError(msg);
      flushLocalNow(true, msg);
      return false;
    } finally {
      syncInFlightRef.current = false;
      syncPromiseRef.current = null;
      done(ok);
      setIsSavingAuto(false);
    }
  }, [flushLocalNow]);

  // Listeners de red (offline / online -> reintentar pendientes inmediatamente al recuperar internet)
  useEffect(() => {
    if (disabled) return;
    const onOffline = () => {
      setIsOnline(false);
      if (latestRef.current.isDirty) {
        setPendingSync(true);
        flushLocalNow(true, "Sin conexión");
      }
    };
    const onOnline = () => {
      setIsOnline(true);
      const cur = latestRef.current;
      const age = cur.dirtySince ? Date.now() - cur.dirtySince : 0;
      if (cur.pendingSync || (cur.isDirty && age >= cur.intervalMs)) {
        void syncDraftToServer(true);
      }
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [disabled, flushLocalNow, syncDraftToServer]);

  // Reloj periódico: actualiza la cuenta regresiva y dispara el guardado como borrador a los 5-10 min
  useEffect(() => {
    if (disabled) return;
    const tick = window.setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      const cur = latestRef.current;
      if (!cur.isDirty || !cur.dirtySince) return;
      if (cur.effectiveId && cur.status === "published") return;
      if (now - cur.dirtySince >= cur.intervalMs) {
        void syncDraftToServer(false);
      }
    }, 15_000);
    return () => window.clearInterval(tick);
  }, [disabled, syncDraftToServer]);

  // Atajo global de guardado Ctrl+S / Cmd+S dentro del editor
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (callbacksRef.current.onManualSave) {
          callbacksRef.current.onManualSave();
        } else {
          void syncDraftToServer(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, syncDraftToServer]);

  const setIntervalMs = useCallback((ms: number) => {
    setAutosaveIntervalMs(ms);
    setIntervalMsState(ms);
  }, []);

  const restoreRecovery = useCallback(() => {
    if (!recoveryDraft) return;
    callbacksRef.current.onRestore(recoveryDraft.snapshot);
    setDirtySince(recoveryDraft.dirtySince || Date.now());
    setPendingSync(Boolean(recoveryDraft.pendingSync));
    setLastLocalSavedAt(recoveryDraft.updatedAt);
    setRecoveryDraft(null);
  }, [recoveryDraft]);

  const discardRecovery = useCallback(() => {
    discardLocalDraftRecord(resource, initialId ?? "new");
    setRecoveryDraft(null);
  }, [resource, initialId]);

  /**
   * ID con el que guardar a mano: espera al autoguardado en curso. Si no, «Publicar» mientras se creaba el borrador
   * hacía un POST nuevo y el borrador quedaba suelto en la lista.
   */
  const settledId = useCallback(async () => {
    if (syncPromiseRef.current) await syncPromiseRef.current;
    return latestRef.current.effectiveId;
  }, []);

  // Tras guardar a mano, el editor cambia su estado (p. ej. status → published) en el mismo render que markSavedClean.
  // Ese estado ya está guardado: se adopta como base para que no reaparezca como borrador local.
  const adoptCleanRef = useRef(false);
  useEffect(() => {
    if (!adoptCleanRef.current) return;
    adoptCleanRef.current = false;
    setBaselineSerialized(serialized);
    discardLocalDraftRecord(resource, storageId);
    // Sin dependencias a propósito: debe correr tras el render siguiente aunque el contenido no cambie, o la
    // bandera quedaría puesta y se tragaría la próxima edición. La bandera impide el bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  /** Llamar tras guardar o enviar a la papelera manualmente desde el editor. */
  const markSavedClean = useCallback(
    (savedId?: string | null) => {
      adoptCleanRef.current = true;
      discardLocalDraftRecord(resource, "new");
      if (savedId) discardLocalDraftRecord(resource, savedId);
      if (effectiveId) discardLocalDraftRecord(resource, effectiveId);
      if (savedId && !promotedId) setPromotedId(savedId);
      setBaselineSerialized(latestRef.current.serialized);
      setDirtySince(null);
      setPendingSync(false);
      setLastAutoError(null);
      setLastServerSavedAt(Date.now());
      setRecoveryDraft(null);
    },
    [resource, effectiveId, promotedId],
  );

  const remainingMs =
    isDirty && dirtySince && canAutoSaveServer && !serverBlocker
      ? Math.max(0, intervalMs - (nowTick - dirtySince))
      : null;

  return {
    effectiveId,
    isDirty,
    isOnline,
    canAutoSaveServer,
    serverBlocker,
    isSavingAuto,
    pendingSync,
    dirtySince,
    remainingMs,
    intervalMs,
    setIntervalMs,
    lastLocalSavedAt,
    lastServerSavedAt,
    lastAutoError,
    recoveryDraft,
    restoreRecovery,
    discardRecovery,
    triggerServerDraftSave: () => syncDraftToServer(true),
    settledId,
    markSavedClean,
  };
}

