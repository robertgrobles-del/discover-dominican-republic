// Panel de loterías: sorteos y loterías (lista + editor de dos columnas, como Noticias) y sincronización de resultados
// por fecha o rango de fechas (histórico). Los datos viven en la base de indicadores (api/index.ts → lotteryAdmin).
import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Box } from "./NewsEditor";

type Row = Record<string, unknown> & { id: string };
type Kind = "lottery-draws" | "lotteries" | "lottery-hero";
const s = (v: unknown) => (v == null ? "" : String(v));
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const DAYS = [["lunes", "Lun"], ["martes", "Mar"], ["miercoles", "Mié"], ["jueves", "Jue"], ["viernes", "Vie"], ["sabado", "Sáb"], ["domingo", "Dom"]] as const;
const parseDays = (v: unknown): string[] => { try { const a = JSON.parse(s(v)); return Array.isArray(a) ? a.map(String) : []; } catch { return []; } };

function useRows(kind: Kind) {
  return useQuery({ queryKey: ["staging", kind], queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${kind}`)).data });
}

// Cada pestaña y cada ficha tienen su URL: /admin/loterias/<pestaña>[/<id>|/nuevo].
const TABS = [["sorteos", "Sorteos", "lottery-draws"], ["loterias", "Loterías", "lotteries"], ["carrusel", "Carrusel del hero", "lottery-hero"],
  ["resultados", "Resultados y premios", null], ["sincronizar", "Sincronizar", null]] as const;
type TabSlug = (typeof TABS)[number][0];

export function StagingLotteriesManager() {
  const { sub, id } = useParams();
  const navigate = useNavigate();
  const tab = (TABS.find(([v]) => v === sub) ?? TABS[0])[0] as TabSlug;
  const listKind = TABS.find(([v]) => v === tab)?.[2] ?? null;
  const base = `/admin/loterias/${tab}`;
  const { data: rows = [], isLoading } = useRows(listKind ?? "lottery-draws");
  if (listKind && id) {
    const close = () => navigate(base);
    const row = id === "nuevo" ? "new" as const : rows.find((r) => r.id === id);
    if (!row) return isLoading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando…</p>
      : <p className="text-sm text-muted-foreground">No existe ese registro. <Link to={base} className="text-primary underline">Volver a la lista</Link></p>;
    return listKind === "lotteries" ? <LotteryEditor key={id} row={row} onClose={close} />
      : listKind === "lottery-hero" ? <HeroEditor key={id} row={row} onClose={close} />
      : <DrawEditor key={id} row={row} onClose={close} />;
  }
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Loterías</h2>
          <p className="text-sm text-muted-foreground">Todas las horas son de República Dominicana, también las de loterías de otros países.</p>
        </div>
      </header>
      <Summary />
      <nav aria-label="Secciones de loterías" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1 text-sm">
        {TABS.map(([v, l]) => (
          <Link key={v} to={`/admin/loterias/${v}`} aria-current={tab === v ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 transition-colors ${tab === v ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</Link>
        ))}
      </nav>
      {tab === "sincronizar" ? <SyncPanel /> : tab === "resultados" ? <PrizePanel />
        : listKind ? <ListView key={listKind} kind={listKind} onEdit={(row) => navigate(`${base}/${row === "new" ? "nuevo" : encodeURIComponent(row.id)}`)} /> : null}
    </section>
  );
}

/** Resumen de un vistazo: qué hay activo, qué se carga a mano y qué sorteos ya tienen el resultado de hoy. */
function Summary() {
  const { data: draws = [] } = useRows("lottery-draws");
  const { data: lotteries = [] } = useRows("lotteries");
  const today = rdToday();
  const active = draws.filter((d) => Number(d.is_active) === 1);
  const manual = active.filter((d) => !d.source_name && !d.source_path).length;
  const withToday = active.filter((d) => s(d.last_result).startsWith(today)).length;
  const items = [
    ["Loterías activas", lotteries.filter((l) => Number(l.is_active) === 1).length, `${lotteries.length} en total`],
    ["Sorteos activos", active.length, `${manual} se cargan a mano`],
    ["Con resultado de hoy", withToday, `de ${active.length} sorteos`],
  ] as const;
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {items.map(([label, n, sub]) => (
        <div key={label} className="rounded-lg border border-border bg-card p-4">
          <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{n}</dd>
          <dd className="text-xs text-muted-foreground">{sub}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListView({ kind, onEdit }: { kind: Kind; onEdit: (row: Row | "new") => void }) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading, error } = useRows(kind);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"all" | "on" | "off">("all");
  const [lot, setLot] = useState("");
  const isDraw = kind === "lottery-draws";
  const isHero = kind === "lottery-hero";
  const lotteryNames = useMemo(() => [...new Set(rows.map((r) => s(r.lottery_name)).filter(Boolean))].sort(), [rows]);
  const list = useMemo(() => rows.filter((r) => (view === "all" || (view === "on") === (Number(r.is_active) === 1)) && (!lot || s(r.lottery_name) === lot)
    && `${s(r.name)} ${s(r.title)} ${s(r.lottery_name)} ${s(r.source_name)}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q, view, lot]);
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
          <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => onEdit("new")}>{isDraw ? "Añadir sorteo" : isHero ? "Añadir diapositiva" : "Añadir lotería"}</Button>
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
        <div className="flex flex-wrap gap-2">
          {isDraw ? (
            <select aria-label="Filtrar por lotería" value={lot} onChange={(e) => setLot(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">Todas las loterías</option>
              {lotteryNames.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          ) : null}
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" placeholder="Buscar" className="h-9 w-56" />
        </div>
      </div>
      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left">
            <tr>
              <th className="p-3 font-normal">{isDraw ? "Sorteo" : isHero ? "Diapositiva" : "Lotería"}</th>
              {isHero ? <><th className="p-3 font-normal">Premio</th><th className="p-3 font-normal">Sorteo</th><th className="p-3 font-normal">Orden</th></> : isDraw ? <><th className="p-3 font-normal">Lotería</th><th className="p-3 font-normal">Hora (RD)</th><th className="p-3 font-normal">Nombre en la fuente</th><th className="p-3 font-normal">Último resultado</th></>
                : <><th className="p-3 font-normal">País</th><th className="p-3 font-normal">Sorteos</th></>}
              <th className="p-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-6 text-muted-foreground">No hay registros que coincidan.</td></tr> : list.map((r, i) => (
              <tr key={r.id} className={`group align-top ${i % 2 ? "" : "bg-muted/40"}`}>
                <td className="p-3">
                  <span className="flex items-center gap-2">
                    {r.logo_url || r.lottery_logo_url ? <img src={s(r.logo_url) || s(r.lottery_logo_url)} alt="" className="h-7 w-7 shrink-0 rounded object-contain" loading="lazy" /> : null}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => onEdit(r)}>{s(r.name) || s(r.title)}</button>
                  </span>
                  <span className="mt-1 flex gap-2 text-xs opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <button type="button" className="text-primary hover:underline" onClick={() => onEdit(r)}>Editar</button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" className="text-destructive hover:underline" disabled={del.isPending}
                      onClick={() => { if (window.confirm(isDraw ? `¿Eliminar «${s(r.name)}» y todos sus resultados?` : `¿Eliminar «${s(r.name) || s(r.title)}»?`)) del.mutate(r.id); }}>Eliminar</button>
                  </span>
                </td>
                {isHero ? <>
                  <td className="p-3">{s(r.prize) || "—"}</td>
                  <td className="p-3">{s(r.draw_name) || "—"}</td>
                  <td className="p-3 tabular-nums">{s(r.sort_order)}</td>
                </> : isDraw ? <>
                  <td className="p-3">{s(r.lottery_name)}</td>
                  <td className="p-3 tabular-nums">{s(r.draw_time)}{r.sunday_time ? ` · dom ${s(r.sunday_time)}` : ""}<span className="block text-xs text-muted-foreground">{parseDays(r.draw_days).length === 7 ? "Todos los días" : parseDays(r.draw_days).join(", ")}</span></td>
                  <td className="p-3">{s(r.source_name) || <span className="text-amber-600">Manual: resultados en «Resultados y premios»</span>}</td>
                  <td className="p-3 tabular-nums">{s(r.last_result) || "—"}</td>
                </> : <>
                  <td className="p-3">{s(r.country)}</td>
                  <td className="p-3 tabular-nums">{s(r.draws_count)}</td>
                </>}
                <td className="p-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${Number(r.is_active) === 1 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{Number(r.is_active) === 1 ? "Activo" : "Inactivo"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", hint, required, max }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string; required?: boolean; max?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}{required ? " *" : ""}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} max={max} />
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
  const [f, setF] = useState({ name: init("name"), slug: init("slug"), country: init("country") || "República Dominicana", website_url: init("website_url"), logo_url: init("logo_url"), description: init("description"), color_scheme: init("color_scheme"),
    slogan: init("slogan"), founded: init("founded"), phone: init("phone"), address: init("address"), tv_channels: init("tv_channels") });
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
      <Box title="Información de la lotería (sale en su página)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="lot-slogan" label="Lema" value={f.slogan} onChange={set("slogan")} />
          <Field id="lot-founded" label="Fundación" value={f.founded} onChange={set("founded")} hint="Ej.: 30 de julio de 2009" />
          <Field id="lot-phone" label="Teléfono" value={f.phone} onChange={set("phone")} />
          <Field id="lot-tv" label="Dónde ver los sorteos" value={f.tv_channels} onChange={set("tv_channels")} hint="Canales de TV o radio" />
        </div>
        <Field id="lot-address" label="Dirección" value={f.address} onChange={set("address")} />
      </Box>
    </EditorShell>
  );
}

function DrawEditor({ row, onClose }: { row: Row | "new"; onClose: () => void }) {
  const { data: lotteries = [] } = useRows("lotteries");
  const init = (k: string, d = "") => (row === "new" ? d : s(row[k]) || d);
  const [f, setF] = useState({
    lottery_id: init("lottery_id"), name: init("name"), slug: init("slug"), source_name: init("source_name"), source_path: init("source_path"), draw_time: init("draw_time", "20:00"), sunday_time: init("sunday_time"),
    ball_range_min: init("ball_range_min", "0"), ball_range_max: init("ball_range_max", "99"), number_of_balls: init("number_of_balls", "3"),
    tombolas_count: init("tombolas_count", "1"), bonus_name: init("bonus_name"), description: init("description"), schedule_description: init("schedule_description"), how_to_play: init("how_to_play"), logo_url: init("logo_url"),
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
        <Box title="Logo del sorteo">
          <Field id="draw-logo" label="URL del logo" value={f.logo_url} onChange={set("logo_url")} hint="Opcional. Si lo dejas vacío se usa el logo de la lotería." />
          {f.logo_url ? <img src={f.logo_url} alt="" className="h-16 w-16 rounded object-contain" /> : null}
        </Box>
        <Box title="Horario (hora de RD)">
          <p className="text-xs text-muted-foreground">Escribe siempre la hora a la que sale en República Dominicana, aunque la lotería sea de otro país.</p>
          <Field id="draw-time" label="Hora del sorteo" type="time" value={f.draw_time} onChange={set("draw_time")} required hint="El sincronizador automático lo busca 3, 5 y 10 minutos después de esta hora (cada intento solo si el anterior no lo encontró)." />
          <Field id="draw-sunday" label="Hora del domingo (si cambia)" type="time" value={f.sunday_time} onChange={set("sunday_time")} hint="Déjala vacía si el domingo se sortea a la misma hora." />
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
      <Box title="Cómo se gana">
        <Label htmlFor="draw-rules" className="sr-only">Cómo se gana</Label>
        <Textarea id="draw-rules" rows={4} value={f.how_to_play} onChange={(e) => set("how_to_play")(e.target.value)} placeholder="Qué se elige, cuántos números salen y con cuántos aciertos se gana." />
      </Box>
      <Box title="Bolos">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field id="draw-balls" label="Números que salen (exactos)" type="number" value={f.number_of_balls} onChange={set("number_of_balls")} required />
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
    if (from > today) return toast.error("No hay resultados de días futuros: elige hoy o una fecha pasada");
    const last = to > today ? today : to; // los días futuros aún no tienen sorteos
    const dates: string[] = [];
    for (let d = from; d <= last && dates.length < 92; d = addDay(d)) dates.push(d);
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
          <Field id="sync-from" label="Desde" type="date" value={from} onChange={setFrom} max={today} />
          <Field id="sync-to" label="Hasta" type="date" value={to} onChange={setTo} max={today} hint="Hasta 92 días por tanda. Para un solo día, pon la misma fecha." />
          <Button type="button" className="w-full" disabled={running} onClick={() => void run()}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {running ? `Sincronizando ${reports.length + 1}…` : "Sincronizar"}</Button>
          {reports.length > 0 && !running ? <p className="text-xs text-muted-foreground">{total} resultados guardados en {reports.length} día{reports.length === 1 ? "" : "s"}.</p> : null}
        </Box>
      </aside>
    </div>
  );
}

type Prize = { date: string; jackpot_amount: string | null; has_result: boolean; winning_numbers: number[]; bonus_number: number | null };

/** Resultados y premios a mano por sorteo y fecha: para los sorteos que la fuente no publica y para los premios. */
function PrizePanel() {
  const { data: draws = [] } = useRows("lottery-draws");
  const [drawId, setDrawId] = useState("");
  const [date, setDate] = useState(rdToday());
  const [amount, setAmount] = useState("");
  const [numbers, setNumbers] = useState("");
  const [bonus, setBonus] = useState("");
  const draw = draws.find((d) => d.id === drawId);
  const prizes = useQuery({
    queryKey: ["staging", "lottery-prizes", drawId], enabled: !!drawId,
    queryFn: async () => (await fetchApi<{ data: Prize[] }>(`/admin/lotteries/prizes/${drawId}`)).data,
  });
  const save = useMutation({
    mutationFn: (jackpot_amount: string) => fetchApi("/admin/lotteries/prize", { method: "POST", body: JSON.stringify({ draw_id: drawId, date, jackpot_amount }) }),
    onSuccess: (_r, v) => { toast.success(v ? "Premio guardado" : "Premio borrado"); void prizes.refetch(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const saveResult = useMutation({
    mutationFn: () => fetchApi("/admin/lotteries/result", { method: "POST", body: JSON.stringify({
      draw_id: drawId, date, numbers: numbers.split(/[\s,;-]+/).filter(Boolean).map(Number), bonus_number: bonus.trim() === "" ? null : Number(bonus),
    }) }),
    onSuccess: () => { toast.success("Resultado publicado"); void prizes.refetch(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const pick = (p: Prize) => { setDate(p.date); setAmount(p.jackpot_amount ?? ""); setNumbers(p.winning_numbers.join(" ")); setBonus(p.bonus_number === null ? "" : String(p.bonus_number)); };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        {!drawId ? <p className="text-sm text-muted-foreground">Elige un sorteo para ver y cargar sus resultados y premios por fecha.</p>
          : prizes.isLoading ? <Loader2 className="h-5 w-5 animate-spin" />
          : !prizes.data?.length ? <p className="text-sm text-muted-foreground">Este sorteo aún no tiene resultados ni premios.</p>
          : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Fecha</th><th>Números</th><th>Premio</th><th>Estado</th></tr></thead>
              <tbody>{prizes.data.map((p) => (
                <tr key={p.date} className="cursor-pointer border-b border-border hover:bg-muted" onClick={() => pick(p)}>
                  <td className="py-2 tabular-nums">{p.date}</td>
                  <td className="font-mono">{p.winning_numbers.map((n) => String(n).padStart(2, "0")).join(" ")}{p.bonus_number !== null ? ` + ${p.bonus_number}` : ""}</td>
                  <td>{p.jackpot_amount ?? "—"}</td>
                  <td className="text-muted-foreground">{p.has_result ? "Publicado" : "Esperando números"}</td>
                </tr>))}</tbody>
            </table>
          )}
      </div>
      <aside className="space-y-4">
        <Box title="Sorteo y fecha">
          <div className="space-y-1.5">
            <Label htmlFor="prize-draw">Sorteo</Label>
            <select id="prize-draw" value={drawId} onChange={(e) => setDrawId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Elige un sorteo…</option>
              {draws.map((d) => <option key={d.id} value={d.id}>{s(d.lottery_name)} · {s(d.name)}{d.source_name || d.source_path ? "" : " (manual)"}</option>)}
            </select>
          </div>
          <Field id="prize-date" label="Fecha del sorteo" type="date" value={date} onChange={setDate} />
        </Box>
        <Box title="Resultado (números)">
          <Field id="result-numbers" label="Números ganadores" value={numbers} onChange={setNumbers}
            hint={draw ? `Separados por espacios. Este sorteo saca ${s(draw.number_of_balls)} del ${s(draw.ball_range_min)} al ${s(draw.ball_range_max)}.` : "Separados por espacios."} />
          {draw && Number(draw.has_bonus) === 1 ? <Field id="result-bonus" label={s(draw.bonus_name) || "Bolo adicional"} value={bonus} onChange={setBonus} /> : null}
          <Button type="button" className="w-full" disabled={!drawId || !date || !numbers.trim() || saveResult.isPending} onClick={() => saveResult.mutate()}>Publicar resultado</Button>
          <p className="text-xs text-muted-foreground">Se valida como los sincronizados: fecha no futura, cantidad exacta y rango. Si ya había resultado ese día, se sustituye.</p>
        </Box>
        <Box title="Premio">
          <Field id="prize-amount" label="Premio" value={amount} onChange={setAmount} hint="Texto libre, ej.: RD$ 120 millones. Sale junto al resultado de ese día; si aún no hay números, se publica cuando lleguen." />
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled={!drawId || !date || !amount.trim() || save.isPending} onClick={() => save.mutate(amount.trim())}>Guardar</Button>
            <Button type="button" variant="outline" disabled={!drawId || !date || save.isPending} onClick={() => { setAmount(""); save.mutate(""); }}>Borrar</Button>
          </div>
        </Box>
      </aside>
    </div>
  );
}

function HeroEditor({ row, onClose }: { row: Row | "new"; onClose: () => void }) {
  const { data: draws = [] } = useRows("lottery-draws");
  const init = (k: string, d = "") => (row === "new" ? d : s(row[k]) || d);
  const [f, setF] = useState({ title: init("title"), prize: init("prize"), caption: init("caption"), draw_id: init("draw_id"), link_url: init("link_url"), sort_order: init("sort_order", "0") });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <EditorShell title={row === "new" ? "Nueva diapositiva" : `Editar: ${s((row as Row).title)}`} kind="lottery-hero" row={row} form={{ ...f, sort_order: Number(f.sort_order) || 0 }} onClose={onClose}
      aside={<Box title="Orden"><Field id="hero-order" label="Posición" type="number" value={f.sort_order} onChange={set("sort_order")} hint="Las de número menor salen primero." /></Box>}>
      <Box title="Diapositiva del hero de /loterias">
        <Field id="hero-title" label="Título" value={f.title} onChange={set("title")} required hint="Ej.: Loto Leidsa o Mega Millions" />
        <Field id="hero-prize" label="Premio" value={f.prize} onChange={set("prize")} hint="Texto libre, ej.: RD$ 150 millones. Pon solo la cifra oficial anunciada." />
        <Field id="hero-caption" label="Texto corto" value={f.caption} onChange={set("caption")} hint="Ej.: Próximo sorteo: sábado 8:55 PM" />
        <div className="space-y-1">
          <Label htmlFor="hero-draw">Sorteo (opcional: enlaza a su página)</Label>
          <select id="hero-draw" value={f.draw_id} onChange={(e) => set("draw_id")(e.target.value)} className="h-9 w-full rounded border border-input bg-background px-2 text-sm">
            <option value="">Sin sorteo</option>
            {draws.map((d) => <option key={d.id} value={d.id}>{s(d.lottery_name)} · {s(d.name)}</option>)}
          </select>
        </div>
        <Field id="hero-link" label="Enlace (opcional)" value={f.link_url} onChange={set("link_url")} hint="Sustituye al del sorteo. Ruta del sitio (/loterias/como-se-gana) o https://..." />
      </Box>
    </EditorShell>
  );
}
