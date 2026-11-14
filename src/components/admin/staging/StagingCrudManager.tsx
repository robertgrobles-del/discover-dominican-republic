// Alta, edición y borrado de una tabla del mini backend de staging (api/index.ts): provincias, noticias y categorías.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Images, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/stagingMedia";
import { MarkdownEditor } from "./MarkdownEditor";
import { NewsEditor } from "./NewsEditor";
import { NewsList } from "./NewsList";
import { ProvinceEditor } from "./ProvinceEditor";
import { ProvinceList } from "./ProvinceList";
import { EventEditor } from "./EventEditor";
import { EventList } from "./EventList";
import { VenueEditor } from "./VenueEditor";
import { VenueList } from "./VenueList";
import { PlaceEditor } from "./PlaceEditor";
import { PlaceList, PLACE_NOUN, type PlaceKind } from "./PlaceList";
import { BeachEditor } from "./BeachEditor";
import { BeachList } from "./BeachList";
import { MediaPicker } from "./MediaLibrary";
import { confirmAction } from "./confirmAction";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url" | "select" | "markdown" | "image" | "checkbox" | "date" | "time";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  /** Longitud recomendada: muestra un contador (en ámbar si se pasa). */
  recommended?: number;
};

type Row = Record<string, unknown> & { id: string };

const toSlug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");

export function StagingCrudManager({ resource, title, titleKey, fields, noun, renderEditor, renderList }: {
  resource: "provinces" | "news" | "news-categories" | "events" | "venues" | "municipalities" | "destinations" | "beaches";
  title: string;
  titleKey: string;           // campo que se muestra en la lista y del que sale el slug
  fields: FieldDef[];
  noun: string;               // "provincia", "noticia", "categoría" (femenino: "Nueva …", "guardada")
  /** Editor propio en lugar del formulario genérico (las noticias usan el estilo WordPress). */
  renderEditor?: (row: Row | "new", close: () => void, openNew: () => void) => ReactNode;
  /** Lista propia (las noticias usan la tabla de entradas de WordPress). */
  renderList?: (p: { rows: Row[]; onNew: () => void; onEdit: (r: Row) => void; onDelete: (ids: string[]) => void; busy: boolean }) => ReactNode;
}) {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = useMemo(() => ["staging", resource], [resource]);
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${resource}`)).data,
  });
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  const open = useCallback((row: Row | "new") => {
    setEditing(row);
    setSlugTouched(row !== "new");
    setForm(Object.fromEntries(fields.map((f) => {
      if (row === "new") return [f.key, f.options?.[0]?.value ?? ""];
      const v = row[f.key];
      return [f.key, f.type === "checkbox" ? (v === 1 || v === true ? "1" : "") : String(v ?? "")];
    })));
  }, [fields]);

  const clearEditQuery = useCallback(() => {
    if (!searchParams.has("nuevo") && !searchParams.has("editar")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("nuevo");
    next.delete("editar");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const closeEditor = useCallback(() => {
    setEditing(null);
    clearEditQuery();
    void qc.invalidateQueries({ queryKey });
  }, [clearEditQuery, qc, queryKey]);

  // Permite abrir un editor directo desde el Escritorio (?nuevo=1 o ?editar=<id|new>)
  const nuevoParam = searchParams.get("nuevo");
  const editarParam = searchParams.get("editar");
  useEffect(() => {
    if (nuevoParam === "1" || editarParam === "new") {
      if (editing !== "new") open("new");
      return;
    }
    if (editarParam && rows.length > 0) {
      const target = rows.find((r) => r.id === editarParam);
      if (target && (editing === null || editing === "new" || editing.id !== target.id)) {
        open(target);
      }
    }
  }, [nuevoParam, editarParam, rows, editing, open]);

  const save = useMutation({
    mutationFn: async () => {
      const body = Object.fromEntries(fields.map((f) => [f.key,
        f.type === "checkbox" ? form[f.key] === "1" : f.type === "number" && form[f.key] !== "" ? Number(form[f.key]) : form[f.key] || null]));
      const isNew = editing === "new";
      return fetchApi(`/admin/${resource}${isNew ? "" : `/${(editing as Row).id}`}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast.success(`${noun[0].toUpperCase()}${noun.slice(1)} guardada`); setEditing(null); clearEditQuery(); void qc.invalidateQueries({ queryKey }); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Eliminada"); void qc.invalidateQueries({ queryKey }); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const set = (key: string, value: string) => setForm((f) => {
    const next = { ...f, [key]: value };
    if (key === titleKey && !slugTouched) next.slug = toSlug(value);
    if (key === "slug") setSlugTouched(true);
    return next;
  });

  const submit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };

  // La clave cambia en cada «nueva» para que el editor empiece vacío aunque ya estuviera en una nueva.
  if (editing && renderEditor) {
    return <Fragment key={editorKey}>{renderEditor(editing, closeEditor,
      () => { clearEditQuery(); setEditing("new"); setEditorKey((k) => k + 1); })}</Fragment>;
  }
  if (editing) {
    return (
      <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{editing === "new" ? `Nueva ${noun}` : `Editar ${noun}`}</h2>
        {fields.map((f) => {
          const id = `f-${resource}-${f.key}`;
          const common = { id, required: f.required, value: form[f.key] ?? "", placeholder: f.placeholder };
          return (
            <div key={f.key} className="space-y-1.5">
              {f.type === "checkbox" ? (
                <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
                  <input id={id} type="checkbox" checked={form[f.key] === "1"} onChange={(e) => set(f.key, e.target.checked ? "1" : "")} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  {f.label}
                </label>
              ) : (
                <Label htmlFor={id}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
              )}
              {f.type === "checkbox" ? null : f.type === "markdown" ? (
                <MarkdownEditor id={id} value={form[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
              ) : f.type === "image" ? (
                <ImageField id={id} value={form[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
              ) : f.type === "textarea" ? (
                <Textarea {...common} rows={6} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === "select" ? (
                <select {...common} onChange={(e) => set(f.key, e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <Input {...common} type={f.type === "url" || f.type === "number" || f.type === "date" || f.type === "time" ? f.type : "text"} step={f.type === "number" ? "any" : undefined} onChange={(e) => set(f.key, e.target.value)} />
              )}
              {(f.hint || f.recommended) && (
                <p className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>{f.hint}</span>
                  {f.recommended && <span className={(form[f.key] ?? "").length > f.recommended ? "font-semibold text-amber-600" : ""}>{(form[f.key] ?? "").length}/{f.recommended}</span>}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex gap-3">
          <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
          <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
        </div>
      </form>
    );
  }

  if (renderList && !isLoading && !error) {
    return <>{renderList({
      rows, onNew: () => open("new"), onEdit: open, busy: remove.isPending,
      onDelete: (ids) => { void Promise.all(ids.map((id) => remove.mutateAsync(id).catch(() => undefined))); },
    })}</>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button onClick={() => open("new")}><Plus className="mr-2 h-4 w-4" />Nueva {noun}</Button>
      </div>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Todavía no hay registros. Crea la primera {noun}.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{String(r[titleKey] ?? "")}</p>
                <p className="truncate text-xs text-muted-foreground">/{String(r.slug ?? "")}</p>
              </div>
              {"status" in r && <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status === "published" ? "Publicada" : "Borrador"}</Badge>}
              <Button size="icon" variant="ghost" aria-label={`Editar ${String(r[titleKey])}`} onClick={() => open(r)}><Pencil className="h-4 w-4" /></Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Eliminar ${String(r[titleKey])}`}
                disabled={remove.isPending}
                onClick={async () => { if (await confirmAction(`¿Eliminar «${String(r[titleKey])}»? No se puede deshacer.`)) remove.mutate(r.id); }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Imagen: se sube como archivo (convertida a WebP), se elige de la biblioteca o se pega una URL.
 * `compact` para columnas estrechas (la caja «Imagen destacada» del editor): todo apilado, sin desbordar.
 */
export function ImageField({ id, value, onChange, compact = false }: { id: string; value: string; onChange: (v: string) => void; compact?: boolean }) {
  const [library, setLibrary] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Las imágenes de la biblioteca no muestran su ruta interna (/api/v1/media/…): solo se pega URL para las externas.
  const internal = value.startsWith("/api/v1/media/");
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadImage(file)); toast.success("Imagen subida (WebP)"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  const preview = (
    <div className={`flex items-center justify-center overflow-hidden rounded-lg border border-border bg-muted ${compact ? "aspect-video w-full" : "h-24 w-36 shrink-0"}`}>
      {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />}
    </div>
  );
  const buttons = (
    <div className={compact ? "grid gap-2" : "flex flex-wrap gap-2"}>
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} className={compact ? "w-full" : ""}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}Subir imagen
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setLibrary(true)} className={compact ? "w-full" : ""}>
        <Images className="mr-2 h-4 w-4" />Elegir de la biblioteca
      </Button>
      {compact && value && (
        <button type="button" onClick={() => onChange("")} className="justify-self-start text-xs text-destructive underline underline-offset-2">Quitar imagen destacada</button>
      )}
    </div>
  );
  const extras = (
    <>
      <MediaPicker open={library} onClose={() => setLibrary(false)} onSelect={(m) => onChange(m.url)} title="Imagen destacada" />
      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
    </>
  );

  if (compact) {
    return (
      <div className="min-w-0 space-y-2">
        {preview}
        {buttons}
        {!internal && <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…o pega una URL https://" className="h-8 min-w-0 text-xs" />}
        {extras}
      </div>
    );
  }
  return (
    // flex-wrap: en una columna estrecha (barra lateral) los botones bajan bajo la vista previa en vez de desbordarse.
    <div className="flex flex-wrap items-start gap-3">
      {preview}
      <div className="min-w-[12rem] flex-1 space-y-2">
        {buttons}
        {internal
          ? <button type="button" onClick={() => onChange("")} className="text-xs text-destructive underline underline-offset-2">Quitar imagen</button>
          : <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…o pega una URL https://" />}
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF o AVIF: se convierte a WebP y se reduce antes de subir (máx. 2 MB).</p>
        {extras}
      </div>
    </div>
  );
}

const STATUS = { key: "status", label: "Estado", type: "select" as const, options: [{ value: "draft", label: "Borrador" }, { value: "published", label: "Publicada" }] };

export function StagingProvincesManager() {
  return (
    <StagingCrudManager
      resource="provinces"
      title="Provincias"
      titleKey="name"
      noun="provincia"
      fields={[]}
      renderEditor={(row, close, openNew) => <ProvinceEditor row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <ProvinceList {...p} />}
    />
  );
}

export function StagingNewsManager() {
  return (
    <StagingCrudManager
      resource="news"
      title="Noticias"
      titleKey="title"
      noun="noticia"
      fields={[]}
      renderEditor={(row, close, openNew) => <NewsEditor row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <NewsList {...p} />}
    />
  );
}

export function StagingNewsCategoriesManager() {
  return (
    <StagingCrudManager
      resource="news-categories"
      title="Categorías de noticias"
      titleKey="name"
      noun="categoría"
      fields={[
        { key: "name", label: "Nombre", required: true },
        { key: "slug", label: "Slug (URL)", required: true, hint: "Se genera del nombre; solo minúsculas, números y guiones." },
        { key: "sort_order", label: "Orden", type: "number", hint: "Las categorías se listan de menor a mayor." },
      ]}
    />
  );
}

export function StagingEventsManager() {
  return (
    <StagingCrudManager
      resource="events"
      title="Eventos"
      titleKey="name"
      noun="evento"
      fields={[]}
      renderEditor={(row, close, openNew) => <EventEditor row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <EventList {...p} />}
    />
  );
}

export function StagingVenuesManager() {
  return (
    <StagingCrudManager
      resource="venues"
      title="Recintos"
      titleKey="name"
      noun="recinto"
      fields={[]}
      renderEditor={(row, close, openNew) => <VenueEditor row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <VenueList {...p} />}
    />
  );
}

export function StagingBeachesManager() {
  return (
    <StagingCrudManager
      resource="beaches"
      title="Playas"
      titleKey="name"
      noun="playa"
      fields={[]}
      renderEditor={(row, close, openNew) => <BeachEditor row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <BeachList {...p} />}
    />
  );
}

/** Municipios o destinos: la misma lista y el mismo editor para los dos. */
export function StagingPlacesManager({ kind }: { kind: PlaceKind }) {
  return (
    <StagingCrudManager
      resource={kind}
      title={PLACE_NOUN[kind].many}
      titleKey="name"
      noun={PLACE_NOUN[kind].one}
      fields={[]}
      renderEditor={(row, close, openNew) => <PlaceEditor kind={kind} row={row} onClose={close} onNew={openNew} />}
      renderList={(p) => <PlaceList kind={kind} {...p} />}
    />
  );
}
