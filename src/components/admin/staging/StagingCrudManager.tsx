// Alta, edición y borrado de una tabla del mini backend de staging (api/index.ts). Lo usan provincias y noticias.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
};

type Row = Record<string, unknown> & { id: string };

const toSlug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");

export function StagingCrudManager({ resource, title, titleKey, fields, noun }: {
  resource: "provinces" | "news";
  title: string;
  titleKey: string;           // campo que se muestra en la lista y del que sale el slug
  fields: FieldDef[];
  noun: string;               // "provincia", "noticia"
}) {
  const qc = useQueryClient();
  const queryKey = ["staging", resource];
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => (await fetchApi<{ data: Row[] }>(`/admin/${resource}`)).data,
  });
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  const open = (row: Row | "new") => {
    setEditing(row);
    setSlugTouched(row !== "new");
    setForm(Object.fromEntries(fields.map((f) => [f.key, row === "new" ? (f.options?.[0]?.value ?? "") : String(row[f.key] ?? "")])));
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = Object.fromEntries(fields.map((f) => [f.key, f.type === "number" && form[f.key] !== "" ? Number(form[f.key]) : form[f.key] || null]));
      const isNew = editing === "new";
      return fetchApi(`/admin/${resource}${isNew ? "" : `/${(editing as Row).id}`}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
    },
    onSuccess: () => { toast.success(`${noun[0].toUpperCase()}${noun.slice(1)} guardada`); setEditing(null); void qc.invalidateQueries({ queryKey }); },
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

  if (editing) {
    return (
      <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">{editing === "new" ? `Nueva ${noun}` : `Editar ${noun}`}</h2>
        {fields.map((f) => {
          const id = `f-${resource}-${f.key}`;
          const common = { id, required: f.required, value: form[f.key] ?? "", placeholder: f.placeholder };
          return (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={id}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
              {f.type === "textarea" ? (
                <Textarea {...common} rows={6} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === "select" ? (
                <select {...common} onChange={(e) => set(f.key, e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <Input {...common} type={f.type === "url" ? "url" : f.type === "number" ? "number" : "text"} step={f.type === "number" ? "any" : undefined} onChange={(e) => set(f.key, e.target.value)} />
              )}
              {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
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
              <Badge variant={r.status === "published" ? "default" : "secondary"}>{r.status === "published" ? "Publicada" : "Borrador"}</Badge>
              <Button size="icon" variant="ghost" aria-label={`Editar ${String(r[titleKey])}`} onClick={() => open(r)}><Pencil className="h-4 w-4" /></Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Eliminar ${String(r[titleKey])}`}
                disabled={remove.isPending}
                onClick={() => { if (window.confirm(`¿Eliminar «${String(r[titleKey])}»? No se puede deshacer.`)) remove.mutate(r.id); }}
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

const STATUS = { key: "status", label: "Estado", type: "select" as const, options: [{ value: "draft", label: "Borrador" }, { value: "published", label: "Publicada" }] };

export function StagingProvincesManager() {
  return (
    <StagingCrudManager
      resource="provinces"
      title="Provincias"
      titleKey="name"
      noun="provincia"
      fields={[
        { key: "name", label: "Nombre", required: true, placeholder: "Samaná" },
        { key: "slug", label: "Slug (URL)", required: true, hint: "Se genera del nombre; solo minúsculas, números y guiones." },
        { key: "region", label: "Región", type: "select", required: true, options: [{ value: "norte", label: "Norte" }, { value: "sur", label: "Sur" }, { value: "este", label: "Este" }, { value: "santo-domingo", label: "Santo Domingo" }] },
        { key: "capital", label: "Capital" },
        { key: "short_description", label: "Descripción corta" },
        { key: "description", label: "Descripción", type: "textarea" },
        { key: "image_url", label: "Imagen principal (URL)", type: "url", placeholder: "https://…" },
        { key: "latitude", label: "Latitud", type: "number" },
        { key: "longitude", label: "Longitud", type: "number" },
        STATUS,
      ]}
    />
  );
}

export function StagingNewsManager() {
  const { data: provinces = [] } = useQuery({
    queryKey: ["staging", "provinces"],
    queryFn: async () => (await fetchApi<{ data: Row[] }>("/admin/provinces")).data,
  });
  return (
    <StagingCrudManager
      resource="news"
      title="Noticias"
      titleKey="title"
      noun="noticia"
      fields={[
        { key: "title", label: "Título", required: true },
        { key: "slug", label: "Slug (URL)", required: true, hint: "Se genera del título; solo minúsculas, números y guiones." },
        { key: "excerpt", label: "Resumen" },
        { key: "body", label: "Contenido", type: "textarea" },
        { key: "cover_url", label: "Imagen de portada (URL)", type: "url", placeholder: "https://…" },
        { key: "province_id", label: "Provincia", type: "select", options: [{ value: "", label: "Ninguna" }, ...provinces.map((p) => ({ value: p.id, label: String(p.name) }))] },
        STATUS,
      ]}
    />
  );
}
