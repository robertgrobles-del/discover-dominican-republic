// Lista de recintos con el aspecto de la de entradas: filtro por estado y tipo, búsqueda y acciones por fila.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkBar, STATUS_ACTIONS, useChecked } from "./BulkBar";
import { useTerritory } from "./LocationPicker";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));

export const VENUE_CATEGORY: Record<string, string> = {
  estadio: "Estadio", arena: "Arena / coliseo", teatro: "Teatro", anfiteatro: "Anfiteatro", centro_convenciones: "Centro de convenciones",
  golf: "Campo de golf", mall: "Centro comercial", discoteca: "Discoteca / club", parque: "Parque / explanada", museo: "Museo",
  playa: "Playa", plaza: "Plaza o calle", carretera: "Carretera o ruta", montana: "Montaña o sendero", rio: "Río, lago o cascada",
  hotel: "Hotel o resort", restaurante: "Restaurante", otro: "Otro",
};

export function VenueList({ rows, onNew, onEdit, onDelete, busy }: {
  rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [view, setView] = useState<"all" | "published" | "draft">("all");
  const list = useMemo(() => rows
    .filter((r) => (view === "all" || (view === "published") === (r.status === "published"))
      && (!cat || r.category === cat) && `${s(r.name)} ${s(r.city)} ${s(r.province)}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q, cat, view]);
  const sel = useChecked(list);
  const t = useTerritory();
  const n = { all: rows.length, published: rows.filter((r) => r.status === "published").length, draft: rows.filter((r) => r.status !== "published").length };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">Recintos</h2>
        <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir recinto</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrar por estado" className="text-sm">
          {(["all", "published", "draft"] as const).map((v, i) => (
            <span key={v}>
              {i > 0 && <span className="mx-1.5 text-muted-foreground">|</span>}
              <button type="button" aria-current={view === v ? "page" : undefined} className={view === v ? "font-semibold" : "text-primary hover:underline"} onClick={() => setView(v)}>
                {{ all: "Todos", published: "Publicados", draft: "Borradores" }[v]}</button>
              <span className="text-muted-foreground"> ({n[v]})</span>
            </span>
          ))}
        </nav>
        <BulkBar resource="venues" ids={[...sel.checked]} onDelete={onDelete} onDone={sel.clear} busy={busy} actions={[...STATUS_ACTIONS,
          { key: "cat", label: "Cambiar tipo", field: "category", options: Object.entries(VENUE_CATEGORY) },
          { key: "prov", label: "Mover a la provincia", field: "province_id", options: t.provinces.map((p) => [p.id, s(p.name)] as [string, string]) }]} />
        <div className="flex gap-2">
          <select aria-label="Filtrar por tipo" value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 rounded border border-input bg-background px-2 text-sm">
            <option value="">Todos los tipos</option>
            {Object.entries(VENUE_CATEGORY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar recintos" placeholder="Buscar" className="h-9 w-48" />
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todas" className="h-4 w-4" checked={sel.all} onChange={sel.toggleAll} /></th><th className="p-3 font-normal">Recinto</th><th className="p-3 font-normal">Tipo</th><th className="p-3 font-normal">Ubicación</th>
              <th className="p-3 font-normal">Capacidad</th><th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-6 text-muted-foreground">No hay recintos que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${s(r.name)}`} className="h-4 w-4" checked={sel.checked.has(r.id)} onChange={() => sel.toggle(r.id)} /></td>
                <td className="p-3">
                  <span className="flex items-center gap-3">
                    {r.image_url ? <img src={s(r.image_url)} alt="" className="h-10 w-14 shrink-0 rounded object-cover" loading="lazy" /> : null}
                    <span>
                      <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name)}</button>
                      <span className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                        <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                        <span className="text-muted-foreground">|</span>
                        <button type="button" className="text-destructive hover:underline" disabled={busy}
                          onClick={() => { if (window.confirm(`¿Eliminar «${s(r.name)}»? Los eventos enlazados quedarán sin recinto.`)) onDelete([r.id]); }}>Eliminar</button>
                      </span>
                    </span>
                  </span>
                </td>
                <td className="p-3">{s(r.category_label) || VENUE_CATEGORY[s(r.category)] || "—"}</td>
                <td className="p-3">{s(r.city) || "—"}{r.province ? <span className="block text-xs text-muted-foreground">{s(r.province)}</span> : null}
                  {r.latitude == null ? <span className="block text-xs text-amber-600">Sin ubicación en el mapa</span> : null}</td>
                <td className="p-3 tabular-nums">{r.capacity ? Number(r.capacity).toLocaleString("es-DO") : "—"}</td>
                <td className="p-3">{r.status === "published" ? "Publicado" : "Borrador"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
