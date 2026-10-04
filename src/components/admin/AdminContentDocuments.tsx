import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileJson } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { EXTRAS_COLLECTIONS, contentDocumentsApi as api, parseJsonObject, type CatalogRecord } from "@/lib/contentDocumentsApi";

/**
 * Contenido que el equipo edita como JSON: los documentos (transporte, itinerarios, tasas de referencia…) y la
 * ficha completa de cada registro del catálogo. El sitio lo lee del backend; los archivos con los que se
 * compiló son sólo el respaldo.
 */

const message = (err: unknown) => (err instanceof Error ? err.message : "No se pudo guardar");

/** Editor de un objeto JSON con validación antes de guardar. */
function JsonEditor({ label, initial, saving, onSave, children }: {
  label: string; initial: Record<string, unknown>; saving: boolean; onSave: (value: Record<string, unknown>) => void; children?: React.ReactNode;
}) {
  const [text, setText] = useState(() => JSON.stringify(initial, null, 2));
  useEffect(() => setText(JSON.stringify(initial, null, 2)), [initial]);
  const parsed = parseJsonObject(text);
  const error = "error" in parsed ? parsed.error : null;
  const dirty = text !== JSON.stringify(initial, null, 2);
  return (
    <div className="space-y-2">
      <Textarea aria-label={label} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="min-h-[420px] font-mono text-xs" aria-invalid={!!error} />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!!error || !dirty || saving} onClick={() => { if ("value" in parsed) onSave(parsed.value); }}>{saving ? "Guardando…" : "Guardar"}</Button>
        <Button size="sm" variant="outline" disabled={!dirty || saving} onClick={() => setText(JSON.stringify(initial, null, 2))}>Descartar cambios</Button>
        {children}
      </div>
    </div>
  );
}

function DocumentsSection() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const list = useQuery({ queryKey: ["content-documents"], queryFn: api.list });
  const doc = useQuery({ queryKey: ["content-documents", selected], enabled: !!selected, queryFn: () => api.get(selected!) });
  const refresh = () => qc.invalidateQueries({ queryKey: ["content-documents"] });
  const save = useMutation({
    mutationFn: (value: Record<string, unknown>) => api.save(selected!, value),
    onSuccess: () => { toast.success("Documento guardado. El sitio lo mostrará en la próxima carga."); void refresh(); },
    onError: (err) => toast.error(message(err)),
  });
  const remove = useMutation({
    mutationFn: () => api.remove(selected!),
    onSuccess: () => { toast.success("Documento eliminado: el sitio vuelve a mostrar el contenido compilado."); setSelected(null); void refresh(); },
    onError: (err) => toast.error(message(err)),
  });

  if (list.isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (list.isError || !list.data) return <PanelEmptyState icon={FileJson} title="No pudimos cargar los documentos" description="Puede que el servicio no responda. Inténtalo de nuevo en unos minutos." />;
  if (list.data.data.length === 0) return <PanelEmptyState icon={FileJson} title="Aún no hay documentos" description="Se crean al cargar el contenido del sitio en la base (npm run db:import-static)." />;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <ul className="max-h-[560px] space-y-1 overflow-y-auto rounded-xl border border-border p-2" aria-label="Documentos">
        {list.data.data.map((d) => (
          <li key={d.key}>
            <button type="button" aria-pressed={selected === d.key} onClick={() => setSelected(d.key)} className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${selected === d.key ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>
              <span className="truncate">{d.key}</span>
              {d.revision > 0 ? <Badge variant="secondary">Editado</Badge> : <Badge variant="outline">Original</Badge>}
            </button>
          </li>
        ))}
      </ul>
      <div>
        {!selected && <p className="text-sm text-muted-foreground">Elige un documento para editarlo. Cada uno reúne los datos de una sección del sitio.</p>}
        {selected && doc.isLoading && <Skeleton className="h-72 w-full rounded-2xl" />}
        {selected && doc.data && (
          <JsonEditor label={`Contenido de ${selected}`} initial={doc.data.data.value} saving={save.isPending} onSave={(value) => save.mutate(value)}>
            <Button size="sm" variant="ghost" className="text-destructive" disabled={remove.isPending} onClick={() => { if (window.confirm(`¿Eliminar "${selected}"? El sitio volverá a mostrar el contenido con el que se compiló.`)) remove.mutate(); }}>
              Eliminar documento
            </Button>
            <span className="text-xs text-muted-foreground">{doc.data.data.description}</span>
          </JsonEditor>
        )}
      </div>
    </div>
  );
}

function RecordsSection() {
  const qc = useQueryClient();
  const [path, setPath] = useState<string>(EXTRAS_COLLECTIONS[0].path);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const records = useQuery({ queryKey: ["content-records", path, search], queryFn: () => api.records(path, search) });
  const record = useQuery({ queryKey: ["content-records", path, "one", selected], enabled: !!selected, queryFn: () => api.record(path, selected!) });
  const save = useMutation({
    mutationFn: (extras: Record<string, unknown>) => api.saveExtras(path, record.data!.data, extras),
    onSuccess: () => { toast.success("Ficha guardada."); void qc.invalidateQueries({ queryKey: ["content-records", path] }); },
    onError: (err) => toast.error(message(err)),
  });
  const nameOf = (r: CatalogRecord) => r.name ?? r.title ?? r.slug ?? r.id;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-2">
        <Select value={path} onValueChange={(next) => { setPath(next); setSelected(null); }}>
          <SelectTrigger aria-label="Colección"><SelectValue /></SelectTrigger>
          <SelectContent>{EXTRAS_COLLECTIONS.map((c) => <SelectItem key={c.path} value={c.path}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input aria-label="Buscar registro" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {records.isLoading && <Skeleton className="h-40 w-full rounded-xl" />}
        {records.isError && <p className="text-sm text-destructive">No se pudo cargar la colección. Puede que tu rol no tenga acceso.</p>}
        {records.data && (
          <ul className="max-h-[460px] space-y-1 overflow-y-auto rounded-xl border border-border p-2" aria-label="Registros">
            {records.data.data.length === 0 && <li className="px-2 py-1 text-sm text-muted-foreground">Sin resultados.</li>}
            {records.data.data.map((r) => (
              <li key={r.id}>
                <button type="button" aria-pressed={selected === r.id} onClick={() => setSelected(r.id)} className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-sm ${selected === r.id ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}>{nameOf(r)}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        {!selected && <p className="text-sm text-muted-foreground">Elige un registro. Aquí se editan los campos de su ficha que no tienen casilla propia en el formulario de la colección (consejos, bloques de texto, especificaciones…).</p>}
        {selected && record.isLoading && <Skeleton className="h-72 w-full rounded-2xl" />}
        {selected && record.data && <JsonEditor label={`Ficha completa de ${nameOf(record.data.data)}`} initial={record.data.data.extras ?? {}} saving={save.isPending} onSave={(value) => save.mutate(value)} />}
      </div>
    </div>
  );
}

export function AdminContentDocuments() {
  if (!HAS_BACKEND_SESSION) return <PanelEmptyState icon={FileJson} title="El contenido se edita en el backend" description="Con datos simulados el sitio muestra los archivos con los que se compiló. Inicia sesión contra el backend para editar su contenido." />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido del sitio</CardTitle>
        <CardDescription>Lo que se guarda aquí sustituye al contenido con el que se compiló el sitio. Un valor sólo se aplica si es del mismo tipo que el original (un texto no reemplaza a una lista).</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documentos">
          <TabsList>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="fichas">Fichas del catálogo</TabsTrigger>
          </TabsList>
          <TabsContent value="documentos"><DocumentsSection /></TabsContent>
          <TabsContent value="fichas"><RecordsSection /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
