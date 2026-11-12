import { useMemo, useState } from "react";
import { Eye, Plus, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkBar, type BulkAction } from "./BulkBar";
import { useTerritory } from "./LocationPicker";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));

export const BEACH_TYPE_LABELS: Record<string, string> = {
  "arena-blanca": "Arena blanca",
  "arena-dorada": "Arena dorada",
  virgen: "Playa virgen",
  bahia: "Bahía",
  deportiva: "Deportiva (surf/kite)",
  urbana: "Urbana",
};

export const WAVE_LABELS: Record<string, string> = {
  calma: "Oleaje calmo",
  moderada: "Oleaje moderado",
  fuerte: "Oleaje fuerte",
};

export const CROWD_LABELS: Record<string, string> = {
  baja: "Poca gente",
  media: "Concurrencia media",
  alta: "Muy concurrida",
};

export const ACCESS_LABELS: Record<string, string> = {
  publico: "Acceso público",
  "semi-privado": "Semi-privado",
  privado: "Privado",
};

const selectCls = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export function BeachList({ rows, onNew, onEdit, onDelete, busy }: {
  rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const { provinces, destinations } = useTerritory();
  const [q, setQ] = useState("");
  const [beachType, setBeachType] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [view, setView] = useState<"all" | "published" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const provById = useMemo(() => new Map(provinces.map((p) => [s(p.id), s(p.name)])), [provinces]);
  const destById = useMemo(() => new Map(destinations.map((d) => [s(d.id), s(d.name)])), [destinations]);

  const list = useMemo(() => rows
    .filter((r) => (view === "all" ? true : r.status === view))
    .filter((r) => (!beachType ? true : s(r.beach_type) === beachType))
    .filter((r) => (!provinceFilter ? true : s(r.province_id) === provinceFilter))
    .filter((r) => !q.trim() || `${s(r.name)} ${s(r.slug)} ${s(r.short_description)} ${provById.get(s(r.province_id)) ?? ""} ${destById.get(s(r.destination_id)) ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  [rows, view, beachType, provinceFilter, q, provById, destById]);

  const pub = rows.filter((r) => r.status === "published").length;
  const drf = rows.length - pub;
  const visibleIds = list.map((r) => r.id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(visibleIds));
  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const bulkActions = useMemo<BulkAction[]>(() => [
    { key: "publish", label: "Publicar", patch: { status: "published" } },
    { key: "draft", label: "Pasar a borrador", patch: { status: "draft" } },
    { key: "feature", label: "Marcar destacada", patch: { is_featured: 1 } },
    { key: "unfeature", label: "Quitar destacada", patch: { is_featured: 0 } },
    { key: "popular", label: "Marcar popular", patch: { is_popular: 1 } },
    { key: "type", label: "Cambiar tipo…", field: "beach_type", options: Object.entries(BEACH_TYPE_LABELS) },
    { key: "wave", label: "Cambiar oleaje…", field: "wave_intensity", options: Object.entries(WAVE_LABELS) },
    { key: "province", label: "Mover a provincia…", field: "province_id", options: provinces.map((p): [string, string] => [s(p.id), s(p.name)]) },
  ], [provinces]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Playas</h2>
        <Button onClick={onNew} size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Añadir nueva</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm">
        <div className="flex flex-wrap gap-1">
          {([["all", "Todas", rows.length], ["published", "Publicadas", pub], ["draft", "Borradores", drf]] as const).map(([k, l, n]) => (
            <button
              key={k}
              type="button"
              onClick={() => { setView(k); setSelected(new Set()); }}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {l} <span className="opacity-75">({n})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Filtrar por tipo de playa" value={beachType} onChange={(e) => setBeachType(e.target.value)} className={selectCls}>
            <option value="">Todos los tipos</option>
            {Object.entries(BEACH_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select aria-label="Filtrar por provincia" value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)} className={selectCls}>
            <option value="">Todas las provincias</option>
            {provinces.map((p) => <option key={s(p.id)} value={s(p.id)}>{s(p.name)}</option>)}
          </select>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar playa o destino…" className="h-9 pl-8" />
          </div>
        </div>
      </div>

      <BulkBar
        resource="beaches"
        ids={[...selected]}
        actions={bulkActions}
        onDelete={(ids) => { onDelete(ids); setSelected(new Set()); }}
        onDone={() => setSelected(new Set())}
        busy={busy}
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-9 px-3 py-2.5"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Seleccionar todas" /></th>
              <th className="px-3 py-2.5">Playa</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Tipo / Mar</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Ubicación</th>
              <th className="hidden px-3 py-2.5 lg:table-cell">Valoración</th>
              <th className="px-3 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => {
              const provName = provById.get(s(r.province_id));
              const destName = destById.get(s(r.destination_id));
              return (
                <tr key={r.id} className="group hover:bg-muted/30">
                  <td className="px-3 py-2.5 align-top">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Seleccionar ${s(r.name)}`} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-start gap-3">
                      {s(r.image_url) ? (
                        <img src={s(r.image_url)} alt="" className="mt-0.5 h-10 w-14 shrink-0 rounded object-cover" loading="lazy" />
                      ) : (
                        <div className="mt-0.5 h-10 w-14 shrink-0 rounded bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button type="button" onClick={() => onEdit(r)} className="font-semibold text-foreground hover:text-primary hover:underline text-left">
                            {s(r.name) || "(sin nombre)"}
                          </button>
                          {Boolean(r.is_featured) && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">Destacada</span>}
                          {Boolean(r.is_popular) && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">Popular</span>}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground opacity-80 group-hover:opacity-100">
                          <button type="button" onClick={() => onEdit(r)} className="hover:text-foreground hover:underline">Editar</button>
                          {r.status === "published" && s(r.slug) && (
                            <>
                              <span>·</span>
                              <a href={`/playa/${s(r.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground hover:underline">
                                <Eye className="h-3 w-3" /> Ver
                              </a>
                            </>
                          )}
                          <span>·</span>
                          <button type="button" disabled={busy} onClick={() => onDelete([r.id])} className="inline-flex items-center gap-1 text-destructive hover:underline disabled:opacity-50">
                            <Trash2 className="h-3 w-3" /> Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-xs md:table-cell">
                    <div className="font-medium text-foreground">{BEACH_TYPE_LABELS[s(r.beach_type)] ?? s(r.beach_type)}</div>
                    <div className="text-muted-foreground">{WAVE_LABELS[s(r.wave_intensity)] ?? s(r.wave_intensity)}</div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-xs sm:table-cell">
                    <div className="text-foreground">{provName || "—"}</div>
                    {destName && <div className="text-muted-foreground">{destName}</div>}
                  </td>
                  <td className="hidden px-3 py-2.5 text-xs lg:table-cell">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r.rating != null ? Number(r.rating).toFixed(1) : "4.5"}
                    </span>
                    <div className="text-muted-foreground">{ACCESS_LABELS[s(r.access_type)] ?? s(r.access_type)}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.status === "published" ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {r.status === "published" ? "Publicada" : "Borrador"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No hay playas que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
