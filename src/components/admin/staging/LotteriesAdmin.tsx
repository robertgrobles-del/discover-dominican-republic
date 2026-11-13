// Panel de loterías: sorteos y loterías (lista + editor de dos columnas, como Noticias) y sincronización de resultados
// por fecha o rango de fechas (histórico). Los datos viven en la base de indicadores (api/index.ts → lotteryAdmin).
import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Box } from "./NewsEditor";

type Row = Record<string, unknown> & { id: string };
type Kind = "lottery-draws" | "lotteries";
const s = (v: unknown) => (v == null ? "" : String(v));
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const DAYS = [["lunes", "Lun"], ["martes", "Mar"], ["miercoles", "Mié"], ["jueves", "Jue"], ["viernes", "Vie"], ["sabado", "Sáb"], ["domingo", "Dom"]] as const;
const parseDays = (v: unknown): string[] => { try { const a = JSON.parse(s(v)); return Array.isArray(a) ? a.map(String) : []; } catch { return []; } };

function useRows(kind: Kind) {
  return useQuery({ queryKey: ["staging", kind], queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${kind}`)).data });
}

export function StagingLotteriesManager() {
  const [tab, setTab] = useState<"draws" | "lotteries" | "sync">("draws");
  const [editing, setEditing] = useState<{ kind: Kind; row: Row | "new" } | null>(null);
  if (editing) {
    const close = () => setEditing(null);
    return editing.kind === "lotteries"
      ? <LotteryEditor row={editing.row} onClose={close} />
      : <DrawEditor row={editing.row} onClose={close} />;
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-normal">Loterías</h2>
        <nav aria-label="Secciones de loterías" className="flex gap-1 rounded-md border border-border p-1 text-sm">
          {([["draws", "Sorteos"], ["lotteries", "Loterías"], ["sync", "Sincronizar resultados"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-current={tab === v ? "page" : undefined} onClick={() => setTab(v)}
              className={`rounded px-3 py-1.5 ${tab === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{l}</button>
          ))}
        </nav>
      </div>
      {tab === "sync" ? <SyncPanel /> : <ListView kind={tab === "draws" ? "lottery-draws" : "lotteries"} onEdit={(row) => setEditing({ kind: tab === "draws" ? "lottery-draws" : "lotteries", row })} />}
    </section>
  );
}

function ListView({ kind, onEdit }: { kind: Kind; onEdit: (row: Row | "new") => void }) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, error } = useRows(kind);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"all" | "on" | "off">("all");
  const isDraw = kind === "lottery-draws";
  const list = useMemo(() => rows.filter((r) => (view === "all" || (view === "on") === (Number(r.is_active) === 1))
    && `${s(r.name)} ${s(r.lottery_name)} ${s(r.source_name)}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q, view]);
  const n = { all: rows.length, on: rows.filter((r) => Number(r.is_active) === 1).length, off: rows.filter((r) => Number(r.is_active) !== 1).length };
  const del = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/${kind}/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Eliminado"); void qc.invalidateQueries({ queryKey: ["staging", kind] }); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  if (isLoading) return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando…</p>;
  if (error) return <p className="text-sm text-destructive">{apiMessage(error)}</p>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => onEdit("new")}>{isDraw ? "Añadir sorteo" : "Añadir lotería"}</Button>
          <nav aria-label="Filtrar por estado" className="text-sm">
            {(["all", "on", "off"] as const).map((v, i) => (
              <span key={v}>
                {i > 0 && <span className="mx-1.5 text-muted-foreground">|</span>}
                <button type="button" aria-current={view === v ? "page" : undefined} className={view === v ? "font-semibold" : "text-primary hover:underline"} onClick={() => setView(v)}>
                  {{ all: "Todos", on: "Activos", off: "Inactivos" }[v]}</button>
                <span className="text-muted-foreground"> ({n[v]})</span>
              </span>
            ))}
          </nav>
        </div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" placeholder="Buscar" className="h-9 w-56" />
      </div>
      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="p-3 font-normal">{isDraw ? "Sorteo" : "Lotería"}</th>
              {isDraw ? <><th className="p-3 font-normal">Lotería</th><th className="p-3 font-normal">Hora (RD)</th><th className="p-3 font-normal">Nombre en la fuente</th><th className="p-3 font-normal">Último resultado</th></>
                : <><th className="p-3 font-normal">País</th><th className="p-3 font-normal">Sorteos</th></>}
              <th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-6 text-muted-foreground">No hay registros que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3">
                  <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name)}</button>
                  <span className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-destructive hover:underline" disabled={del.isPending}
                      onClick={() => { if (window.confirm(isDraw ? `¿Eliminar «${s(r.name)}» y todos sus resultados?` : `¿Eliminar la lotería «${s(r.name)}»?`)) del.mutate(r.id); }}>Eliminar</button>
                  </span>
                </td>
                {isDraw ? <>
                  <td className="p-3">{s(r.lottery_name)}</td>
                  <td className="p-3 tabular-nums">{s(r.draw_time)}<span className="block text-xs text-muted-foreground">{parseDays(r.draw_days).length === 7 ? "Todos los días" : parseDays(r.draw_days).join(", ")}</span></td>
                  <td className="p-3">{s(r.source_name) || <span className="text-amber-600">Sin nombre: no se sincroniza</span>}</td>
                  <td className="p-3 tabular-nums">{s(r.last_result) || "—"}</td>
                </> : <>
                  <td className="p-3">{s(r.country)}</td>
                  <td className="p-3 tabular-nums">{s(r.draws_count)}</td>
                </>}
                <td className="p-3">{Number(r.is_active) === 1 ? "Activo" : "Inactivo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", hint, required }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required ? " *" : ""}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Esqueleto común: contenido a la izquierda; «Publicar» (activo, guardar) y lo demás a la derecha. */
function EditorShell({ title, kind, row, form, onClose, children, aside }: {
  title: string; kind: Kind; row: Row | "new"; form: Record<string, unknown>; onClose: () => void; children: ReactNode; aside?: ReactNode;
}) {
  const qc = useQueryClient();
  const [active, setActive] = useState(row === "new" ? true : Number(row.is_active) === 1);
  const save = useMutation({
    mutationFn: () => fetchApi(`/admin/${kind}${row === "new" ? "" : `/${row.id}`}`, { method: row === "new" ? "POST" : "PUT", body: JSON.stringify({ ...form, is_active: active }) }),
    onSuccess: () => { toast.success("Guardado"); void qc.invalidateQueries({ queryKey: ["staging", kind] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1 h-4 w-4" />Volver</Button>
        <h2 className="text-2xl font-normal">{title}</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">{children}</div>
        <aside className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto">
          <Box title="Publicar">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={active} onChange={(e) => setActive(e.target.checked)} />Activo (se muestra y se sincroniza)</label>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{row === "new" ? "Crear" : "Guardar cambios"}</Button>
          </Box>
          {aside}
        </aside>
      </div>
    </form>
  );
}

function LotteryEditor({ row, onClose }: { row: Row | "new"; onClose: () => void }) {
  const init = (k: string) => (row === "new" ? "" : s(row[k]));
  const [f, setF] = useState({ name: init("name"), slug: init("slug"), country: init("country") || "República Dominicana", website_url: init("website_url"), logo_url: init("logo_url"), description: init("description"), color_scheme: init("color_scheme") });
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));
  return (
    <EditorShell title={row === "new" ? "Nueva lotería" : `Editar: ${s((row as Row).name)}`} kind="lotteries" row={row} form={f} onClose={onClose}
      aside={<Box title="Logo"><Field id="lot-logo" label="URL del logo" value={f.logo_url} onChange={set("logo_url")} hint="El logo oficial; mejor subido a la biblioteca de medios." />
        {f.logo_url ? <img src={f.logo_url} alt="" className="h-16 w-16 rounded object-contain" /> : null}</Box>}>
      <Box title="Datos">
        <Field id="lot-name" label="Nombre" value={f.name} onChange={set("name")} required />
        <Field id="lot-slug" label="Slug (URL: /loteria/…)" value={f.slug} onChange={(v) => { setSlugTouched(true); set("slug")(toSlug(v)); }} required />
        <Field id="lot-country" label="País" value={f.country} onChange={set("country")} />
        <Field id="lot-web" label="Web oficial" type="url" value={f.website_url} onChange={set("website_url")} />
        <div className="space-y-1"><Label htmlFor="lot-desc">Descripción</Label><Textarea id="lot-desc" rows={4} value={f.description} onChange={(e) => set("description")(e.target.value)} /></div>
      </Box>
    </EditorShell>
  );
}

function DrawEditor({ row, onClose }: { row: Row | "new"; onClose: () => void }) {
  const { data: lotteries = [] } = useRows("lotteries");
  const init = (k: string, d = "") => (row === "new" ? d : s(row[k]) || d);
  const [f, setF] = useState({
    lottery_id: init("lottery_id"), name: init("name"), slug: init("slug"), source_name: init("source_name"), source_path: init("source_path"), draw_time: init("draw_time", "20:00"),
    ball_range_min: init("ball_range_min", "0"), ball_range_max: init("ball_range_max", "99"), number_of_balls: init("number_of_balls", "3"),
    tombolas_count: init("tombolas_count", "1"), bonus_name: init("bonus_name"), description: init("description"), schedule_description: init("schedule_description"),
  });
  const [days, setDays] = useState<string[]>(row === "new" ? DAYS.map(([d]) => d) : parseDays(row.draw_days));
  const [bonus, setBonus] = useState(row !== "new" && Number(row.has_bonus) === 1);
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));
  const body = { ...f, draw_days: days, has_bonus: bonus, ball_range_min: Number(f.ball_range_min), ball_range_max: Number(f.ball_range_max), number_of_balls: Number(f.number_of_balls), tombolas_count: Number(f.tombolas_count) };
  return (
    <EditorShell title={row === "new" ? "Nuevo sorteo" : `Editar: ${s((row as Row).name)}`} kind="lottery-draws" row={row} form={body} onClose={onClose}
      aside={<>
        <Box title="Lotería">
          <Label htmlFor="draw-lot" className="sr-only">Lotería</Label>
          <select id="draw-lot" required value={f.lottery_id} onChange={(e) => set("lottery_id")(e.target.value)} className="h-9 w-full rounded border border-input bg-background px-2 text-sm">
            <option value="">Elige la lotería…</option>
            {lotteries.map((l) => <option key={l.id} value={l.id}>{s(l.name)}</option>)}
          </select>
        </Box>
        <Box title="Horario (hora de RD)">
          <Field id="draw-time" label="Hora del sorteo" type="time" value={f.draw_time} onChange={set("draw_time")} required hint="El sincronizador automático lo busca 3, 5 y 10 minutos después de esta hora (cada intento solo si el anterior no lo encontró)." />
          <fieldset><legend className="mb-1 text-sm font-medium">Días</legend>
            <div className="flex flex-wrap gap-1.5">{DAYS.map(([d, l]) => (
              <label key={d} className={`cursor-pointer rounded border px-2 py-1 text-xs ${days.includes(d) ? "border-primary bg-primary/10" : "border-border"}`}>
                <input type="checkbox" className="sr-only" checked={days.includes(d)} onChange={() => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]))} />{l}</label>
            ))}</div>
          </fieldset>
          <Field id="draw-sched" label="Horario en texto" value={f.schedule_description} onChange={set("schedule_description")} hint="Ej.: Lunes a sábado 8:55 PM / Domingos 3:55 PM" />
        </Box>
      </>}>
      <Box title="Sorteo">
        <Field id="draw-name" label="Nombre" value={f.name} onChange={set("name")} required />
        <Field id="draw-slug" label="Slug (URL: /loteria/<lotería>/…)" value={f.slug} onChange={(v) => { setSlugTouched(true); set("slug")(toSlug(v)); }} required />
        <Field id="draw-source" label="Nombre en la fuente (enloteria.com)" value={f.source_name} onChange={set("source_name")}
          hint="Exactamente como aparece en enloteria.com (ej.: «Nacional Noche», «Anguilla 6PM»). Sin él no se sincroniza." />
        <Field id="draw-path" label="Página propia en enloteria.com (opcional)" value={f.source_path} onChange={(v) => set("source_path")(toSlug(v))}
          hint="Solo si el sorteo no sale en la página general: la parte final de su dirección, ej.: «resultados-loto»." />
        <div className="space-y-1"><Label htmlFor="draw-desc">Descripción</Label><Textarea id="draw-desc" rows={3} value={f.description} onChange={(e) => set("description")(e.target.value)} /></div>
      </Box>
      <Box title="Bolos">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field id="draw-balls" label="Números premiados" type="number" value={f.number_of_balls} onChange={set("number_of_balls")} required />
          <Field id="draw-min" label="Mínimo" type="number" value={f.ball_range_min} onChange={set("ball_range_min")} />
          <Field id="draw-max" label="Máximo" type="number" value={f.ball_range_max} onChange={set("ball_range_max")} />
          <Field id="draw-tomb" label="Tómbolas" type="number" value={f.tombolas_count} onChange={set("tombolas_count")} />
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={bonus} onChange={(e) => setBonus(e.target.checked)} />Tiene bolo adicional</label>
        {bonus ? <Field id="draw-bonus" label="Nombre del bolo adicional" value={f.bonus_name} onChange={set("bonus_name")} /> : null}
      </Box>
    </EditorShell>
  );
}

type Report = { date: string; syncedCount: number; skipped: { title: string; reason: string }[]; errors: string[] };
const rdToday = () => new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);
const addDay = (d: string) => new Date(Date.parse(`${d}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

function SyncPanel() {
  const qc = useQueryClient();
  const today = rdToday();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [running, setRunning] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const run = async () => {
    if (from > to) return toast.error("La fecha inicial debe ser anterior a la final");
    const dates: string[] = [];
    for (let d = from; d <= to && dates.length < 92; d = addDay(d)) dates.push(d);
    setRunning(true);
    setReports([]);
    for (const date of dates) { // de uno en uno: cada día es una descarga y la función tiene tiempo limitado
      try {
        const r = (await fetchApi<{ data: Report }>("/admin/lotteries/sync", { method: "POST", body: JSON.stringify({ date }) })).data;
        setReports((p) => [...p, r]);
      } catch (e) {
        setReports((p) => [...p, { date, syncedCount: 0, skipped: [], errors: [apiMessage(e)] }]);
      }
    }
    setRunning(false);
    void qc.invalidateQueries({ queryKey: ["staging", "lottery-draws"] });
  };
  const total = reports.reduce((n, r) => n + r.syncedCount, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-3">
        {reports.length === 0 && !running ? <p className="text-sm text-muted-foreground">Elige un día o un rango y pulsa «Sincronizar». Cada resultado se valida (fecha, sorteo ya celebrado, cantidad y rango de números) antes de guardarse; nunca se guardan números inventados.</p> : null}
        {reports.map((r) => (
          <details key={r.date} className="rounded border border-border bg-card">
            <summary className="cursor-pointer px-4 py-2 text-sm">
              <span className="font-semibold tabular-nums">{r.date}</span> · {r.syncedCount} guardados
              {r.skipped.length ? <span className="text-muted-foreground"> · {r.skipped.length} descartados</span> : null}
              {r.errors.length ? <span className="text-destructive"> · {r.errors.length} errores</span> : null}
            </summary>
            <ul className="space-y-1 border-t border-border px-4 py-2 text-xs">
              {r.errors.map((e, i) => <li key={`e${i}`} className="text-destructive">{e}</li>)}
              {r.skipped.map((x, i) => <li key={`s${i}`}><span className="font-medium">{x.title}</span>: {x.reason}</li>)}
              {!r.errors.length && !r.skipped.length ? <li className="text-muted-foreground">Sin incidencias.</li> : null}
            </ul>
          </details>
        ))}
      </div>
      <aside className="space-y-4">
        <Box title="Sincronizar resultados">
          <Field id="sync-from" label="Desde" type="date" value={from} onChange={setFrom} />
          <Field id="sync-to" label="Hasta" type="date" value={to} onChange={setTo} hint="Hasta 92 días por tanda. Para un solo día, pon la misma fecha." />
          <Button type="button" className="w-full" disabled={running} onClick={() => void run()}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {running ? `Sincronizando ${reports.length + 1}…` : "Sincronizar"}</Button>
          {reports.length > 0 && !running ? <p className="text-xs text-muted-foreground">{total} resultados guardados en {reports.length} día{reports.length === 1 ? "" : "s"}.</p> : null}
        </Box>
      </aside>
    </div>
  );
}
