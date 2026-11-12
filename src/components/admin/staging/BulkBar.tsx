// Acciones en lote de las listas del panel (como en WordPress): marcar filas, elegir qué cambiar y aplicar.
// El servidor (POST /admin/<recurso>/bulk) valida cada ficha igual que al guardarla sola y devuelve las que fallaron.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";
import { Button } from "@/components/ui/button";

type Option = [value: string, label: string];
/** Una acción: un cambio fijo (publicar…) o un campo con opciones a elegir (cambiar provincia a…). */
export type BulkAction = { key: string; label: string; patch?: Record<string, unknown>; field?: string; options?: Option[] };
export type BulkResource = "provinces" | "news" | "events" | "venues" | "municipalities" | "destinations" | "beaches";

export const STATUS_ACTIONS: BulkAction[] = [
  { key: "publish", label: "Publicar", patch: { status: "published" } },
  { key: "draft", label: "Pasar a borrador", patch: { status: "draft" } },
];

/** Selección de filas con «marcar todas» sobre lo que se está viendo. */
export function useChecked(visible: { id: string }[]) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const all = visible.length > 0 && visible.every((r) => checked.has(r.id));
  return {
    checked, all,
    toggle: (id: string) => setChecked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }),
    toggleAll: () => setChecked(all ? new Set() : new Set(visible.map((r) => r.id))),
    clear: () => setChecked(new Set()),
  };
}

const select = "h-9 rounded border border-input bg-background px-2 text-sm";

export function BulkBar({ resource, ids, actions, onDelete, onDone, busy }: {
  resource: BulkResource; ids: string[]; actions: BulkAction[]; onDelete: (ids: string[]) => void; onDone: () => void; busy?: boolean;
}) {
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const action = actions.find((a) => a.key === key);

  const apply = async () => {
    if (key === "delete") {
      if (window.confirm(`¿Eliminar ${ids.length} ficha${ids.length === 1 ? "" : "s"}? No se puede deshacer.`)) { onDelete(ids); onDone(); setKey(""); }
      return;
    }
    if (!action) return;
    const patch = action.patch ?? { [action.field!]: value === "" ? null : value };
    setSaving(true);
    try {
      const r = (await fetchApi<{ data: { updated: number; errors: { name: string; message: string }[] } }>(`/admin/${resource}/bulk`,
        { method: "POST", body: JSON.stringify({ ids, patch }) })).data;
      void qc.invalidateQueries({ queryKey: ["staging", resource] });
      if (r.updated) toast.success(`${r.updated} ficha${r.updated === 1 ? " actualizada" : "s actualizadas"}`);
      if (r.errors.length) toast.error(`${r.errors.length} sin cambiar: ${r.errors.slice(0, 3).map((e) => `${e.name} (${e.message})`).join("; ")}${r.errors.length > 3 ? "…" : ""}`);
      onDone(); setKey(""); setValue("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo aplicar");
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Acciones en lote" className={select} value={key} onChange={(e) => { setKey(e.target.value); setValue(""); }}>
        <option value="">Acciones en lote</option>
        {actions.map((a) => <option key={a.key} value={a.key}>{a.options ? `${a.label}…` : a.label}</option>)}
        <option value="delete">Eliminar</option>
      </select>
      {action?.options && (
        <select aria-label={action.label} className={select} value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">— Elige —</option>
          {action.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      )}
      <Button size="sm" variant="outline" className="h-9 border-primary text-primary"
        disabled={!key || !ids.length || busy || saving || Boolean(action?.options && !value)} onClick={() => void apply()}>
        Aplicar{ids.length ? ` a ${ids.length}` : ""}
      </Button>
    </div>
  );
}
