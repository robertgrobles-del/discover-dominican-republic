import { toast } from "sonner";
import { logger } from "./logger";

export interface QueuedAction {
  id: string;
  type: "claim_lead" | "analytics" | "review" | "passport_stamp";
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

const STORAGE_KEY = "descubre_rd_offline_queue";

function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    logger.warn("No se pudo guardar la cola offline en localStorage", { error: e });
  }
}

export function enqueueOfflineAction(type: QueuedAction["type"], payload: Record<string, unknown>) {
  const queue = getQueue();
  const newAction: QueuedAction = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  queue.push(newAction);
  saveQueue(queue);
  logger.info(`Acción offline encolada: [${type}]`, { id: newAction.id });
}

export async function flushOfflineQueue(processor?: (action: QueuedAction) => Promise<boolean>) {
  const queue = getQueue();
  if (queue.length === 0) return;

  logger.info(`Sincronizando ${queue.length} acciones pendientes de la cola offline...`);
  const remaining: QueuedAction[] = [];
  let syncedCount = 0;

  for (const action of queue) {
    try {
      let success = true;
      if (processor) {
        success = await processor(action);
      }
      if (success) {
        syncedCount++;
      } else {
        action.retries++;
        if (action.retries < 3) remaining.push(action);
      }
    } catch {
      action.retries++;
      if (action.retries < 3) remaining.push(action);
    }
  }

  saveQueue(remaining);

  if (syncedCount > 0) {
    toast.success(`Se sincronizaron ${syncedCount} cambios guardados offline.`);
    logger.info(`Sincronización offline completada: ${syncedCount} elementos procesados.`);
  }
}

// Auto-register online listener
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    logger.info("Conexión restaurada. Iniciando vaciado de cola offline.");
    flushOfflineQueue();
  });
}
