import { AlertTriangle, CheckCircle2, Cloud, CloudOff, History, Loader2, RotateCcw, Save, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AUTOSAVE_INTERVAL_OPTIONS,
  formatCountdownEs,
  formatRelativeTimeEs,
  type LocalDraftRecord,
  type useDraftAutosave,
} from "./useDraftAutosave";

interface DraftAutosaveBarProps {
  isDirty: boolean;
  isOnline: boolean;
  canAutoSaveServer: boolean;
  serverBlocker: string | null;
  isSavingAuto: boolean;
  pendingSync: boolean;
  remainingMs: number | null;
  intervalMs: number;
  setIntervalMs: (ms: number) => void;
  lastLocalSavedAt: number | null;
  lastServerSavedAt: number | null;
  lastAutoError: string | null;
  recoveryDraft: LocalDraftRecord<unknown> | null;
  onRestoreRecovery: () => void;
  onDiscardRecovery: () => void;
  onSaveDraftNow: () => void;
  itemLabel?: string;
}

export function DraftAutosaveBar({
  isDirty,
  isOnline,
  canAutoSaveServer,
  serverBlocker,
  isSavingAuto,
  pendingSync,
  remainingMs,
  intervalMs,
  setIntervalMs,
  lastLocalSavedAt,
  lastServerSavedAt,
  lastAutoError,
  recoveryDraft,
  onRestoreRecovery,
  onDiscardRecovery,
  onSaveDraftNow,
  itemLabel = "este contenido",
}: DraftAutosaveBarProps) {
  return (
    <div className="space-y-2.5">
      {recoveryDraft && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-foreground">
                Se recuperó un borrador guardado en este equipo para {itemLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Último respaldo local {formatRelativeTimeEs(recoveryDraft.updatedAt)}
                {recoveryDraft.title ? ` · «${recoveryDraft.title}»` : ""}
                {recoveryDraft.pendingSync ? " · Pendiente de sincronizar con el servidor" : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="default" onClick={onRestoreRecovery}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Restaurar borrador
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={onDiscardRecovery}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Descartar
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card/80 px-3.5 py-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {!isOnline ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
              <WifiOff className="h-3.5 w-3.5" />
              Sin internet · protegido en este equipo
            </span>
          ) : isSavingAuto ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando borrador automático…
            </span>
          ) : pendingSync ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
              <CloudOff className="h-3.5 w-3.5" />
              Pendiente de subir al servidor
            </span>
          ) : isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Cloud className="h-3.5 w-3.5 text-primary" />
              Cambios respaldados localmente
              {lastLocalSavedAt ? ` (${formatRelativeTimeEs(lastLocalSavedAt)})` : ""}
            </span>
          ) : lastServerSavedAt ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Borrador al día en el servidor ({formatRelativeTimeEs(lastServerSavedAt)})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
              Respaldo continuo ante cortes de luz, cierre o desconexión
            </span>
          )}

          {canAutoSaveServer && serverBlocker && isDirty && (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              {serverBlocker}
            </span>
          )}

          {!canAutoSaveServer && isDirty && (
            <span>
              Publicado en vivo: protegido en este equipo hasta que pulses Actualizar
            </span>
          )}

          {lastAutoError && isOnline && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {lastAutoError}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canAutoSaveServer && remainingMs !== null && isDirty && (
            <span className="tabular-nums rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
              Auto-borrador en {formatCountdownEs(remainingMs)}
            </span>
          )}

          <label className="inline-flex items-center gap-1 text-[11px]">
            <span className="hidden sm:inline">Cada</span>
            <select
              aria-label="Frecuencia de autoguardado como borrador"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="rounded border border-input bg-background px-1.5 py-0.5 text-[11px] font-medium text-foreground"
            >
              {AUTOSAVE_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.ms} value={opt.ms}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {canAutoSaveServer && isDirty && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSavingAuto || Boolean(serverBlocker)}
              onClick={onSaveDraftNow}
              className="h-7 px-2.5 text-xs"
            >
              <Save className="mr-1 h-3 w-3" />
              Guardar borrador ahora
            </Button>
          )}

          <span className="hidden text-[11px] text-muted-foreground md:inline">Ctrl+S</span>
        </div>
      </div>
    </div>
  );
}

export function EditorAutosaveStrip<T>({
  autosave,
  itemLabel,
}: {
  autosave: ReturnType<typeof useDraftAutosave<T>>;
  itemLabel?: string;
}) {
  return (
    <DraftAutosaveBar
      isDirty={autosave.isDirty}
      isOnline={autosave.isOnline}
      canAutoSaveServer={autosave.canAutoSaveServer}
      serverBlocker={autosave.serverBlocker}
      isSavingAuto={autosave.isSavingAuto}
      pendingSync={autosave.pendingSync}
      remainingMs={autosave.remainingMs}
      intervalMs={autosave.intervalMs}
      setIntervalMs={autosave.setIntervalMs}
      lastLocalSavedAt={autosave.lastLocalSavedAt}
      lastServerSavedAt={autosave.lastServerSavedAt}
      lastAutoError={autosave.lastAutoError}
      recoveryDraft={autosave.recoveryDraft as LocalDraftRecord<unknown> | null}
      onRestoreRecovery={autosave.restoreRecovery}
      onDiscardRecovery={autosave.discardRecovery}
      onSaveDraftNow={() => void autosave.triggerServerDraftSave()}
      itemLabel={itemLabel}
    />
  );
}
