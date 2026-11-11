// Lista de entradas al estilo de WordPress: filtros por estado, fecha, categoría y tipo, búsqueda,
// acciones en lote, acciones por fila al pasar el ratón y paginación.
import { useMemo, useState } from "react";
import { BulkBar, STATUS_ACTIONS } from "./BulkBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpError } from "@/lib/httpClient";
import { fetchApi } from "@/lib/fastifyClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_TYPE_LABEL, type PostType } from "@/lib/stagingContent";
import { analyzeSeo, splitKeywords } from "@/lib/seoAnalysis";
import { SeoScore } from "./SeoAnalysisBox";

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
const s = (v: unknown) => (v == null ? "" : String(v));
const seoOf = (r: Row) => analyzeSeo({
  keywords: splitKeywords(s(r.focus_keywords)), title: s(r.title), seoTitle: s(r.seo_title), seoDescription: s(r.seo_description),
  slug: s(r.slug), excerpt: s(r.excerpt), body: s(r.body), imageAlt: s(r.image_alt), hasImage: Boolean(r.cover_url),
}).score;
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
  const [quick, setQuick] = useState<string | null>(null);

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
          <BulkBar resource="news" ids={[...checked]} onDelete={remove} onDone={() => setChecked(new Set())} busy={busy} actions={[...STATUS_ACTIONS,
            { key: "cat", label: "Cambiar categoría", field: "category_id", options: categories.map((c) => [String(c.id), String(c.name)] as [string, string]) },
            { key: "feat", label: "Destacar en la portada", patch: { featured: true } }, { key: "unfeat", label: "Quitar de destacadas", patch: { featured: false } }]} />
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
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todas" className="h-4 w-4" checked={allChecked}
                onChange={() => setChecked(allChecked ? new Set() : new Set(shown.map((r) => r.id)))} /></th>
              <th className="p-3 font-normal">{sortBtn("title", "Título")}</th>
              <th className="p-3 font-normal">Autor</th>
              <th className="p-3 font-normal">Categorías</th>
              <th className="p-3 font-normal">Tipo</th>
              <th className="p-3 font-normal">{sortBtn("date", "Fecha")}</th>
              <th className="p-3 font-normal">SEO</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-muted-foreground">No se encontraron entradas.</td></tr>
            ) : shown.map((r, i) => {
              const state = viewOf(r);
              const type = (r.post_type ?? "noticia") as PostType;
              if (quick === r.id) {
                return <tr key={r.id}><td colSpan={7} className="border-y border-primary/40 bg-card p-0"><QuickEdit row={r} categories={categories} onDone={() => setQuick(null)} /></td></tr>;
              }
              return (
                <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                  <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${String(r.title)}`} className="h-4 w-4" checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className="max-w-md p-3">
                    <button type="button" className="text-left font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{String(r.title ?? "(sin título)")}</button>
                    {state !== "published" && <span className="font-semibold text-muted-foreground"> — {state === "draft" ? "Borrador" : "Programada"}</span>}
                    <div className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                      <span className="text-muted-foreground">|</span>
                      <button type="button" className="text-primary hover:underline" onClick={() => setQuick(r.id)}>Edición rápida</button>
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
                  <td className="p-3"><SeoScore score={seoOf(r)} /></td>
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

const toLocal = (iso: unknown) => {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
const label = "w-20 shrink-0 text-sm text-muted-foreground";
const field = "h-9 w-full rounded border border-input bg-background px-2 text-sm";

/** Edición rápida al estilo WordPress: cambia los datos de la entrada sin abrir el editor. */
function QuickEdit({ row, categories, onDone }: { row: Row; categories: Row[]; onDone: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    title: s(row.title), slug: s(row.slug), published_at: toLocal(row.published_at), author: s(row.author),
    category_id: s(row.category_id), post_type: s(row.post_type) || "noticia", sponsor: s(row.sponsor),
    status: s(row.status) || "draft", featured: row.featured === 1 || row.featured === true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  // PUT reemplaza la fila entera: se envía todo lo que ya tenía más los cambios.
  const save = useMutation({
    mutationFn: () => fetchApi(`/admin/news/${row.id}`, { method: "PUT", body: JSON.stringify({
      ...row, ...f, category_id: f.category_id || null, sponsor: f.sponsor || null, author: f.author || null,
      published_at: f.published_at ? new Date(f.published_at).toISOString() : null,
    }) }),
    onSuccess: () => { toast.success("Entrada actualizada"); void qc.invalidateQueries({ queryKey: ["staging", "news"] }); onDone(); },
    onError: (e) => toast.error((e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? "No se pudo guardar"),
  });

  return (
    <form className="grid gap-6 p-4 lg:grid-cols-[1.4fr_1fr_1fr]" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <fieldset className="space-y-2.5">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Edición rápida</legend>
        <label className="flex items-center gap-3"><span className={label}>Título</span><input autoFocus className={field} value={f.title} onChange={(e) => set("title", e.target.value)} required /></label>
        <label className="flex items-center gap-3"><span className={label}>Slug</span><input className={field} value={f.slug} onChange={(e) => set("slug", e.target.value)} required pattern="[a-z0-9-]+" /></label>
        <label className="flex items-center gap-3"><span className={label}>Fecha</span><input type="datetime-local" className={field} value={f.published_at} onChange={(e) => set("published_at", e.target.value)} /></label>
        <label className="flex items-center gap-3"><span className={label}>Autor</span><input className={field} value={f.author} onChange={(e) => set("author", e.target.value)} placeholder="Redacción Descubre RD" /></label>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm text-muted-foreground">Categoría</legend>
        <div className="max-h-44 space-y-1.5 overflow-y-auto rounded border border-border p-2 text-sm">
          {[{ id: "", name: "Sin categoría" }, ...categories].map((c) => (
            <label key={String(c.id)} className="flex items-center gap-2">
              <input type="radio" name={`qe-cat-${row.id}`} checked={f.category_id === String(c.id)} onChange={() => set("category_id", String(c.id))} className="h-4 w-4" />{String(c.name)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2.5">
        <legend className="sr-only">Publicación</legend>
        <label className="flex items-center gap-3"><span className={label}>Estado</span>
          <select className={field} value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option value="published">Publicada</option><option value="draft">Borrador</option>
          </select></label>
        <label className="flex items-center gap-3"><span className={label}>Tipo</span>
          <select className={field} value={f.post_type} onChange={(e) => set("post_type", e.target.value)}>
            {(Object.keys(POST_TYPE_LABEL) as PostType[]).map((k) => <option key={k} value={k}>{POST_TYPE_LABEL[k]}</option>)}
          </select></label>
        {f.post_type === "patrocinado" && <label className="flex items-center gap-3"><span className={label}>Patrocina</span><input className={field} value={f.sponsor} onChange={(e) => set("sponsor", e.target.value)} /></label>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />Destacada en la portada (fija)</label>
      </fieldset>
      <div className="flex justify-between gap-3 border-t border-border pt-3 lg:col-span-3">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={save.isPending}>Actualizar</Button>
      </div>
    </form>
  );
}
