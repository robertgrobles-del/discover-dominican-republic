// Lista de eventos con el aspecto de la de entradas: filtro por estado (incluidos los enviados por el público
// y los ya terminados), búsqueda y acciones por fila.
import { useMemo, useState } from "react";
import { BulkBar, STATUS_ACTIONS, useChecked } from "./BulkBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = Record<string, unknown> & { id: string };
const s = (v: unknown) => (v == null ? "" : String(v));

/** Mismo criterio que EVENT_LIVE en api/index.ts: termina en su fecha y hora de fin (hora de RD). */
export function eventEnded(r: Row, now = Date.now()) {
  const day = s(r.end_date) || s(r.start_date);
  if (!day) return false;
  return new Date(`${day}T${s(r.end_time) || "23:59"}:00-04:00`).getTime() <= now;
}

const fecha = (d: string) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" }) : "Sin fecha");

type View = "all" | "published" | "draft" | "submitted" | "ended";
const LABEL: Record<View, string> = { all: "Todos", published: "Publicados", draft: "Borradores", submitted: "Enviados por el público", ended: "Terminados" };
const match: Record<View, (r: Row) => boolean> = {
  all: () => true,
  published: (r) => r.status === "published" && !eventEnded(r),
  draft: (r) => r.status !== "published",
  submitted: (r) => r.status !== "published" && Boolean(r.submitter_email),
  ended: (r) => eventEnded(r),
};

export function EventList({ rows, onNew, onEdit, onDelete, busy }: {
  rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean;
}) {
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("all");
  const list = useMemo(() => rows
    .filter((r) => match[view](r) && s(r.name).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => s(b.start_date).localeCompare(s(a.start_date))),
  [rows, q, view]);

  const sel = useChecked(list);
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-normal">Eventos</h2>
        <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir evento</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BulkBar resource="events" ids={[...sel.checked]} onDelete={onDelete} onDone={sel.clear} busy={busy} actions={[...STATUS_ACTIONS,
          { key: "feat", label: "Destacar", patch: { is_featured: true } }, { key: "unfeat", label: "Quitar de destacados", patch: { is_featured: false } }]} />
        <nav aria-label="Filtrar por estado" className="text-sm">
          {(Object.keys(LABEL) as View[]).map((v, i) => (
            <span key={v}>
              {i > 0 && <span className="mx-1.5 text-muted-foreground">|</span>}
              <button type="button" aria-current={view === v ? "page" : undefined} className={view === v ? "font-semibold" : "text-primary hover:underline"} onClick={() => setView(v)}>{LABEL[v]}</button>
              <span className="text-muted-foreground"> ({rows.filter(match[v]).length})</span>
            </span>
          ))}
        </nav>
        <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar eventos" placeholder="Buscar" className="h-9 w-48" />
      </div>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="admin-table w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="w-10 p-3"><input type="checkbox" aria-label="Seleccionar todos" className="h-4 w-4" checked={sel.all} onChange={sel.toggleAll} /></th><th className="p-3 font-normal">Evento</th><th className="p-3 font-normal">Tipo</th><th className="p-3 font-normal">Fecha</th>
              <th className="p-3 font-normal">Lugar</th><th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-6 text-muted-foreground">No hay eventos que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3"><input type="checkbox" aria-label={`Seleccionar ${String(r.name ?? "")}`} className="h-4 w-4" checked={sel.checked.has(r.id)} onChange={() => sel.toggle(r.id)} /></td>
                <td className="p-3">
                  <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name)}</button>
                  {r.is_featured ? <span className="ml-1.5 text-xs text-muted-foreground">— Destacado</span> : null}
                  {r.submitter_email ? <span className="block text-xs text-muted-foreground">Enviado por {s(r.submitter_email)}</span> : null}
                  <div className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-destructive hover:underline" disabled={busy}
                      onClick={() => { if (window.confirm(`¿Eliminar «${s(r.name)}»?`)) onDelete([r.id]); }}>Eliminar</button>
                    {r.status === "published" && !eventEnded(r) && <>
                      <span className="text-muted-foreground">|</span>
                      <a className="text-primary hover:underline" href={`/evento/${s(r.slug)}`} target="_blank" rel="noreferrer">Ver</a>
                    </>}
                  </div>
                </td>
                <td className="p-3">{s(r.event_type) || "—"}</td>
                <td className="p-3">{fecha(s(r.start_date))}{r.start_time ? <span className="block text-xs text-muted-foreground">{s(r.start_time)}{r.end_time ? ` – ${s(r.end_time)}` : ""}</span> : null}</td>
                <td className="p-3">{s(r.venue) || s(r.address) || "—"}{r.province ? <span className="block text-xs text-muted-foreground">{s(r.province)}</span> : null}</td>
                <td className="p-3">{eventEnded(r) ? "Terminado" : r.status === "published" ? "Publicado" : r.submitter_email ? "Pendiente de revisión" : "Borrador"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
