// Lista de entradas al estilo de WordPress: filtros por estado, fecha, categoría y tipo, búsqueda,
// acciones en lote, acciones por fila al pasar el ratón y paginación.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fastifyClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_TYPE_LABEL, type PostType } from "@/lib/stagingContent";

type Row = Record<string, unknown> & { id: string };
type View = "all" | "published" | "scheduled" | "draft";
const PER_PAGE = 20;

const now = () => new Date().toISOString();
const viewOf = (r: Row): View =>
  r.status !== "published" ? "draft" : typeof r.published_at === "string" && r.published_at > now() ? "scheduled" : "published";
const VIEW_LABEL: Record<View, string> = { all: "Todo", published: "Publicados", scheduled: "Programados", draft: "Borradores" };
const STATE_LABEL: Record<Exclude<View, "all">, string> = { published: "Publicada", scheduled: "Programada", draft: "Última modificación" };

const fmt = (iso: unknown) => {
  if (typeof iso !== "string" || !iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit", year: "numeric" })} a las ${d.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
};
const monthKey = (iso: unknown) => (typeof iso === "string" ? iso.slice(0, 7) : "");
const select = "h-9 rounded border border-input bg-background px-2 text-sm";

export function NewsList({ rows, onNew, onEdit, onDelete, busy }: {
  rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const { data: categories = [] } = useQuery({
    queryKey: ["staging", "news-categories"],
    queryFn: async () => (await fetchApi<{ data: Row[] }>("/admin/news-categories")).data,
  });
  const catName = useMemo(() => new Map(categories.map((c) => [String(c.id), String(c.name)])), [categories]);

  const [view, setView] = useState<View>("all");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({ month: "", cat: "", type: "" });
  const [filter, setFilter] = useState(draft);
  const [sort, setSort] = useState<{ key: "title" | "date"; asc: boolean }>({ key: "date", asc: false });
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState("");

  const dateOf = (r: Row) => String(r.published_at ?? r.updated_at ?? r.created_at ?? "");
  const months = useMemo(() => [...new Set(rows.map((r) => monthKey(dateOf(r))).filter(Boolean))].sort().reverse(), [rows]);
  const counts = useMemo(() => {
    const c: Record<View, number> = { all: rows.length, published: 0, scheduled: 0, draft: 0 };
    rows.forEach((r) => { c[viewOf(r)]++; });
    return c;
  }, [rows]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter((r) =>
      (view === "all" || viewOf(r) === view) &&
      (!needle || String(r.title ?? "").toLowerCase().includes(needle)) &&
      (!filter.month || monthKey(dateOf(r)) === filter.month) &&
      (!filter.cat || (filter.cat === "none" ? !r.category_id : r.category_id === filter.cat)) &&
      (!filter.type || (r.post_type ?? "noticia") === filter.type));
    out.sort((a, b) => {
      const [x, y] = sort.key === "title" ? [String(a.title ?? ""), String(b.title ?? "")] : [dateOf(a), dateOf(b)];
      return (sort.asc ? 1 : -1) * x.localeCompare(y, "es");
    });
    return out;
  }, [rows, view, q, filter, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const allChecked = shown.length > 0 && shown.every((r) => checked.has(r.id));
  const toggle = (id: string) => setChecked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const remove = (ids: string[]) => {
    if (!ids.length || !window.confirm(`¿Mover ${ids.length === 1 ? "esta entrada" : `${ids.length} entradas`} a la papelera? Se eliminarán con sus traducciones.`)) return;
    onDelete(ids);
    setChecked(new Set());
  };
  const sortBtn = (key: "title" | "date", label: string) => (
    <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline"
      onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : key === "title" }))}>
      {label}<span aria-hidden="true" className="text-xs text-muted-foreground">{sort.key === key ? (sort.asc ? "▲" : "▼") : "⇅"}</span>
    </button>
  );
  const pager = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{list.length} elemento{list.length === 1 ? "" : "s"}</span>
      {pages > 1 && <>
        <Button size="sm" variant="outline" className="h-8 px-2" disabled={cur === 1} onClick={() => setPage(1)} aria-label="Primera página">«</Button>
        <Button size="sm" variant="outline" className="h-8 px-2" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Página anterior">‹</Button>
        <span>{cur} de {pages}</span>
        <Button size="sm" variant="outline" className="h-8 px-2" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Página siguiente">›</Button>
        <Button size="sm" variant="outline" className="h-8 px-2" disabled={cur === pages} onClick={() => setPage(pages)} aria-label="Última página">»</Button>
      </>}
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">Entradas</h2>
        <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir entrada</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrar por estado" className="text-sm">
          {(Object.keys(VIEW_LABEL) as View[]).filter((v) => v === "all" || counts[v] > 0).map((v, i) => (
            <span key={v}>
              {i > 0 && <span className="mx-1.5 text-muted-foreground">|</span>}
              <button type="button" aria-current={view === v ? "page" : undefined}
                className={view === v ? "font-semibold text-foreground" : "text-primary hover:underline"}
                onClick={() => { setView(v); setPage(1); }}>{VIEW_LABEL[v]}</button>
              <span className="text-muted-foreground"> ({counts[v]})</span>
            </span>
          ))}
        </nav>
        <form role="search" className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); }}>
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Buscar entradas" className="h-9 w-56" />
          <Button size="sm" variant="outline" className="h-9 border-primary text-primary" type="submit">Buscar entradas</Button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Acciones en lote" className={select} value={bulk} onChange={(e) => setBulk(e.target.value)}>
            <option value="">Acciones en lote</option>
            <option value="trash">Mover a la papelera</option>
          </select>
          <Button size="sm" variant="outline" className="h-9 border-primary text-primary" disabled={!bulk || !checked.size || busy}
            onClick={() => remove([...checked])}>Aplicar</Button>
          <select aria-label="Filtrar por fecha" className={select} value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })}>
            <option value="">Todas las fechas</option>
            {months.map((m) => <option key={m} value={m}>{new Date(`${m}-15T12:00:00`).toLocaleDateString("es-DO", { month: "long", year: "numeric" })}</option>)}
          </select>
          <select aria-label="Filtrar por categoría" className={select} value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })}>
            <option value="">Todas las categorías</option>
            <option value="none">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{String(c.name)}</option>)}
          </select>
          <select aria-label="Filtrar por tipo" className={select} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option value="">Todos los tipos</option>
            {(Object.keys(POST_TYPE_LABEL) as PostType[]).map((k) => <option key={k} value={k}>{POST_TYPE_LABEL[k]}</option>)}
          </select>
          <Button size="sm" variant="outline" className="h-9 border-primary text-primary" onClick={() => { setFilter(draft); setPage(1); }}>Filtrar</Button>
        </div>
        {pager}
      </div>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todas" className="h-4 w-4" checked={allChecked}
                onChange={() => setChecked(allChecked ? new Set() : new Set(shown.map((r) => r.id)))} /></th>
              <th className="p-3 font-normal">{sortBtn("title", "Título")}</th>
              <th className="p-3 font-normal">Autor</th>
              <th className="p-3 font-normal">Categorías</th>
              <th className="p-3 font-normal">Tipo</th>
              <th className="p-3 font-normal">{sortBtn("date", "Fecha")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-muted-foreground">No se encontraron entradas.</td></tr>
            ) : shown.map((r, i) => {
              const state = viewOf(r);
              const type = (r.post_type ?? "noticia") as PostType;
              return (
                <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                  <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${String(r.title)}`} className="h-4 w-4" checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className="max-w-md p-3">
                    <button type="button" className="text-left font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{String(r.title ?? "(sin título)")}</button>
                    {state !== "published" && <span className="font-semibold text-muted-foreground"> — {state === "draft" ? "Borrador" : "Programada"}</span>}
                    <div className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                      <span className="text-muted-foreground">|</span>
                      <button type="button" className="text-destructive hover:underline" disabled={busy} onClick={() => remove([r.id])}>Papelera</button>
                      {state === "published" && <>
                        <span className="text-muted-foreground">|</span>
                        <a href={`/noticias/${String(r.slug)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver</a>
                      </>}
                    </div>
                  </td>
                  <td className="p-3 text-primary">{String(r.author || "Redacción Descubre RD")}</td>
                  <td className="p-3 text-primary">{r.category_id ? catName.get(String(r.category_id)) ?? "—" : "Sin categoría"}</td>
                  <td className="p-3">{POST_TYPE_LABEL[type] ?? type}{type === "patrocinado" && r.sponsor ? <span className="block text-xs text-muted-foreground">{String(r.sponsor)}</span> : null}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">
                    <span className="block text-foreground">{STATE_LABEL[state]}</span>
                    {fmt(state === "draft" ? r.updated_at ?? r.created_at : r.published_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">{pager}</div>
    </section>
  );
}
