// Lista de provincias con el mismo aspecto que la de entradas: búsqueda, filtro por región y estado, acciones por fila.
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeSeo, splitKeywords } from "@/lib/seoAnalysis";
import { SeoScore } from "./SeoAnalysisBox";
import { BulkBar, STATUS_ACTIONS, useChecked } from "./BulkBar";
import { INTRO_LAYOUTS } from "@/components/province/ProvinceIntroSection";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));
const REGION: Record<string, string> = { norte: "Norte", sur: "Sur", este: "Este", "santo-domingo": "Santo Domingo" };
const count = (v: unknown) => { try { const a = JSON.parse(s(v) || "[]"); return Array.isArray(a) ? a.length : 0; } catch { return 0; } };

export function ProvinceList({ rows, onNew, onEdit, onDelete, busy }: {
  rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [view, setView] = useState<"all" | "published" | "draft">("all");
  const list = useMemo(() => rows
    .filter((r) => (view === "all" || (view === "published") === (r.status === "published"))
      && (!region || r.region === region) && s(r.name).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => s(a.name).localeCompare(s(b.name), "es")), [rows, q, region, view]);
  const sel = useChecked(list);
  const n = { all: rows.length, published: rows.filter((r) => r.status === "published").length, draft: rows.filter((r) => r.status !== "published").length };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">Provincias</h2>
        <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir provincia</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrar por estado" className="text-sm">
          {(["all", "published", "draft"] as const).map((v, i) => (
            <span key={v}>
              {i > 0 && <span className="mx-1.5 text-muted-foreground">|</span>}
              <button type="button" aria-current={view === v ? "page" : undefined} className={view === v ? "font-semibold" : "text-primary hover:underline"} onClick={() => setView(v)}>
                {{ all: "Todas", published: "Publicadas", draft: "Borradores" }[v]}</button>
              <span className="text-muted-foreground"> ({n[v]})</span>
            </span>
          ))}
        </nav>
        <BulkBar resource="provinces" ids={[...sel.checked]} onDelete={onDelete} onDone={sel.clear} busy={busy} actions={[...STATUS_ACTIONS,
          { key: "region", label: "Cambiar región", field: "region", options: Object.entries(REGION) },
          { key: "layout", label: "Cambiar composición de la presentación", field: "intro_layout", options: INTRO_LAYOUTS }]} />
        <div className="flex gap-2">
          <select aria-label="Filtrar por región" value={region} onChange={(e) => setRegion(e.target.value)} className="h-9 rounded border border-input bg-background px-2 text-sm">
            <option value="">Todas las regiones</option>
            {Object.entries(REGION).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar provincias" placeholder="Buscar" className="h-9 w-48" />
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todas" className="h-4 w-4" checked={sel.all} onChange={sel.toggleAll} /></th>
              <th className="p-3 font-normal">Nombre</th><th className="p-3 font-normal">Región</th><th className="p-3 font-normal">Contenido</th>
              <th className="p-3 font-normal">Estado</th><th className="p-3 font-normal">SEO</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-6 text-muted-foreground">No hay provincias que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${s(r.name)}`} className="h-4 w-4" checked={sel.checked.has(r.id)} onChange={() => sel.toggle(r.id)} /></td>
                <td className="p-3">
                  <span className="flex items-center gap-2">
                    {r.color_primary ? <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: s(r.color_primary) }} aria-hidden="true" /> : null}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name)}</button>
                  </span>
                  <div className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-destructive hover:underline" disabled={busy}
                      onClick={() => { if (window.confirm(`¿Eliminar «${s(r.name)}»?`)) onDelete([r.id]); }}>Eliminar</button>
                  </div>
                </td>
                <td className="p-3">{REGION[s(r.region)] ?? s(r.region)}{r.capital ? <span className="block text-xs text-muted-foreground">Capital: {s(r.capital)}</span> : null}</td>
                <td className="p-3 text-xs text-muted-foreground">{count(r.municipalities)} municipios · {count(r.places)} lugares · {count(r.gallery)} fotos</td>
                <td className="p-3">{r.status === "published" ? "Publicada" : "Borrador"}</td>
                <td className="p-3"><SeoScore score={analyzeSeo({
                  keywords: splitKeywords(s(r.focus_keywords)), title: s(r.name), seoTitle: s(r.seo_title), seoDescription: s(r.seo_description),
                  slug: s(r.slug), excerpt: s(r.short_description), body: s(r.description), imageAlt: s(r.image_alt), hasImage: Boolean(r.image_url),
                }).score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
