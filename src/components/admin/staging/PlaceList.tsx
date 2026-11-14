// Lista de municipios o destinos con el aspecto de la de entradas: estado, provincia, búsqueda y acciones por fila.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTerritory } from "./LocationPicker";
import { BulkBar, STATUS_ACTIONS, useChecked, type BulkAction } from "./BulkBar";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));
export type PlaceKind = "municipalities" | "destinations";
export const PLACE_NOUN: Record<PlaceKind, { one: string; many: string; add: string }> = {
  municipalities: { one: "municipio", many: "Municipios", add: "Añadir municipio" },
  destinations: { one: "destino", many: "Destinos", add: "Añadir destino" },
};

export function PlaceList({ kind, rows, onNew, onEdit, onDelete, busy }: {
  kind: PlaceKind; rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const t = useTerritory();
  const [q, setQ] = useState("");
  const [prov, setProv] = useState("");
  const [view, setView] = useState<"all" | "published" | "draft">("all");
  const provName = (id: unknown) => s(t.provinces.find((p) => p.id === id)?.name);
  const muniName = (id: unknown) => s(t.municipalities.find((m) => m.id === id)?.name);
  const list = rows
    .filter((r) => (view === "all" || (view === "published") === (r.status === "published")) && (!prov || r.province_id === prov)
      && `${s(r.name)} ${provName(r.province_id)}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => s(a.name).localeCompare(s(b.name), "es"));
  const sel = useChecked(list);
  const provinceOptions = t.provinces.map((p) => [p.id, s(p.name)] as [string, string]);
  const actions: BulkAction[] = kind === "municipalities"
    ? [...STATUS_ACTIONS, { key: "prov", label: "Mover a la provincia", field: "province_id", options: provinceOptions },
      { key: "kind", label: "Cambiar tipo", field: "kind", options: [["municipio", "Municipio"], ["distrito_municipal", "Distrito municipal"]] }]
    : [...STATUS_ACTIONS, { key: "prov", label: "Mover a la provincia", field: "province_id", options: provinceOptions },
      { key: "popular", label: "Marcar como zona popular", patch: { is_popular: true } }, { key: "unpopular", label: "Quitar de zona popular", patch: { is_popular: false } },
      { key: "kind", label: "Cambiar tipo", field: "kind", options: [["zona_turistica", "Zona turística"], ["ciudad", "Ciudad"], ["pueblo", "Pueblo"], ["sector", "Sector o barrio"], ["isla", "Isla o cayo"]] }];
  const n = { all: rows.length, published: rows.filter((r) => r.status === "published").length, draft: rows.filter((r) => r.status !== "published").length };
  const noun = PLACE_NOUN[kind];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">{noun.many}</h2>
        <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>{noun.add}</Button>
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
        <BulkBar resource={kind} ids={[...sel.checked]} actions={actions} onDelete={onDelete} onDone={sel.clear} busy={busy} />
        <div className="flex gap-2">
          <select aria-label="Filtrar por provincia" value={prov} onChange={(e) => setProv(e.target.value)} className="h-9 rounded border border-input bg-background px-2 text-sm">
            <option value="">Todas las provincias</option>
            {t.provinces.map((p) => <option key={p.id} value={p.id}>{s(p.name)}</option>)}
          </select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Buscar ${noun.many.toLowerCase()}`} placeholder="Buscar" className="h-9 w-48" />
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="admin-table w-full min-w-[680px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todas" className="h-4 w-4" checked={sel.all} onChange={sel.toggleAll} /></th>
              <th className="p-3 font-normal">Nombre</th><th className="p-3 font-normal">Provincia</th>
              {kind === "destinations" && <th className="p-3 font-normal">Municipio</th>}
              <th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={5} className="p-6 text-muted-foreground">No hay {noun.many.toLowerCase()} que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${s(r.name)}`} className="h-4 w-4" checked={sel.checked.has(r.id)} onChange={() => sel.toggle(r.id)} /></td>
                <td className="p-3">
                  <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name)}</button>
                  {r.is_capital ? <span className="ml-2 text-xs text-muted-foreground">— cabecera</span> : null}
                  <span className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-destructive hover:underline" disabled={busy}
                      onClick={() => { if (window.confirm(`¿Eliminar «${s(r.name)}»? El contenido ubicado aquí se queda solo con la provincia.`)) onDelete([r.id]); }}>Eliminar</button>
                  </span>
                </td>
                <td className="p-3">{provName(r.province_id) || "—"}</td>
                {kind === "destinations" && <td className="p-3">{muniName(r.municipality_id) || "—"}</td>}
                <td className="p-3">{r.status === "published" ? "Publicado" : "Borrador"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
