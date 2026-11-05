import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Eye, EyeOff, FileText, ImageIcon, LayoutList, Loader2, Monitor, RotateCcw, Save, Search, Smartphone, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { contentDocumentsApi } from "@/lib/contentDocumentsApi";
import { displayImageUrl, uploadProductImage } from "@/lib/adminProductsApi";
import { fetchPageContent, invalidatePageContentIndex, pageDocKey, PREVIEW_MESSAGE, type PageContentDoc } from "@/lib/pageContent";

interface RegistryField { key: string; fallback: string | null; kind?: "data"; hint?: string; asset?: string; section?: string }
interface RegistryPage { page: string; name: string; shared?: boolean; routes: string[]; texts: RegistryField[]; images: RegistryField[] }
type Draft = Required<PageContentDoc>;
type SetField = (group: keyof Draft, key: string, value: string | undefined) => void;
interface Group { id: string; title: string; list: boolean; images: RegistryField[]; texts: RegistryField[] }

const TAG_LABELS: Record<string, string> = { h1: "Título principal", h2: "Título", h3: "Subtítulo", h4: "Subtítulo", h5: "Subtítulo", p: "Párrafo", span: "Texto", div: "Texto", strong: "Texto destacado", Button: "Botón", button: "Botón", Link: "Enlace", a: "Enlace", li: "Elemento de lista", Badge: "Etiqueta", label: "Etiqueta de campo", Label: "Etiqueta de campo", img: "Imagen", option: "Opción", th: "Encabezado de tabla", td: "Celda", CardTitle: "Título de tarjeta", CardDescription: "Descripción de tarjeta", TabsTrigger: "Pestaña" };
const ATTR_LABELS: Record<string, string> = { alt: "texto alternativo", title: "título", subtitle: "subtítulo", description: "descripción", placeholder: "texto de ayuda", "aria-label": "nombre accesible", label: "etiqueta", badge: "etiqueta", caption: "pie de foto" };
const titleCase = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
/**
 * Etiqueta de un campo, sin numeración: «Párrafo», «Botón», «Imagen · texto alternativo». Dentro de una lista,
 * el nombre del dato (`nombre`, `cargo`). La clave técnica queda en el `title` del campo.
 */
const fieldLabel = (f: RegistryField, inGroup?: string) => {
  const parts = f.key.split(".");
  if (f.kind === "data") {
    const rest = inGroup ? f.key.slice(inGroup.length + 1).split(".") : parts.slice(1);
    return rest.map((p) => (/^\d+$/.test(p) ? String(Number(p) + 1) : titleCase(p))).join(" › ") || titleCase(parts[0]!);
  }
  if (parts[0] === "asset") return "Imagen";
  const [tag, attr] = parts.slice(0, -1);
  if (tag === "SEOHead") return attr === "title" ? "Título en buscadores" : "Descripción en buscadores";
  if (attr === "src") return "Imagen";
  const base = /^h[12]$/.test(tag!) && !attr ? "Título de la sección" : TAG_LABELS[tag!] ?? titleCase(tag!);
  return attr ? `${base} · ${ATTR_LABELS[attr] ?? attr}` : base;
};
/** Los campos se agrupan por sección de la página y, las listas, por elemento (`equipo.0` → «Equipo › Nombre»). */
function groupFields(texts: RegistryField[], images: RegistryField[]): Group[] {
  const groups = new Map<string, Group>();
  const of = (f: RegistryField) => {
    const p = f.key.split(".");
    const data = f.kind === "data";
    const id = !data ? `§${f.section ?? "Página"}` : p.length > 2 && /^\d+$/.test(p[1]!) ? `${p[0]}.${p[1]}` : p[0]!;
    let g = groups.get(id);
    if (!g) {
      const title = !data ? f.section ?? "Página" : id.includes(".") ? `${titleCase(p[0]!)} › ${f.hint ?? Number(p[1]) + 1}` : titleCase(id);
      groups.set(id, (g = { id, title, list: data, images: [], texts: [] }));
    }
    return g;
  };
  // Primero las secciones de la página, en su orden; después las listas (tarjetas, equipo, pasos…).
  for (const t of texts) of(t).texts.push(t);
  for (const i of images) of(i).images.push(i);
  return [...groups.values()].sort((a, b) => Number(a.list) - Number(b.list));
}
const sameDraft = (a: Draft, b: Draft) => JSON.stringify(a) === JSON.stringify(b);

function ImageField({ field, group, draft, setField, resolveAsset }: { field: RegistryField; group?: string; draft: Draft; setField: SetField; resolveAsset?: (file: string) => string | undefined }) {
  const [uploading, setUploading] = useState(false);
  const edited = field.key in draft.images;
  const hidden = edited && draft.images[field.key] === "";
  const original = field.fallback ?? (field.asset ? resolveAsset?.(field.asset) : undefined);
  const cur = edited ? draft.images[field.key] : original;
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      setField("images", field.key, await uploadProductImage(file));
      toast.success("Imagen subida. Guarda la página para publicarla.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground" title={field.key}>{fieldLabel(field, group)}</p>
        {hidden ? <Badge variant="destructive">Oculta</Badge> : edited && <Badge variant="secondary">Editada</Badge>}
      </div>
      {hidden ? <div className="flex h-32 items-center justify-center rounded bg-muted text-xs text-muted-foreground"><EyeOff className="mr-2 h-4 w-4" />No se muestra en el portal</div>
        : cur ? <img src={/^(https?:|\/uploads|\/api)/.test(cur) ? displayImageUrl(cur) : cur} alt="" className="h-32 w-full rounded object-cover" />
        : <div className="flex h-32 items-center justify-center rounded bg-muted text-xs text-muted-foreground">Imagen original del sitio</div>}
      <div className="flex flex-wrap gap-1">
        <Button asChild variant="outline" size="sm" disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Subir
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </Button>
        {!hidden && <Button variant="ghost" size="sm" onClick={() => setField("images", field.key, "")}><EyeOff className="mr-1 h-4 w-4" />Ocultar</Button>}
        {edited && <Button variant="ghost" size="sm" onClick={() => setField("images", field.key, undefined)}><RotateCcw className="mr-1 h-4 w-4" />Restaurar</Button>}
      </div>
      <Input value={edited && !hidden ? draft.images[field.key] : ""} onChange={(e) => setField("images", field.key, e.target.value || undefined)} placeholder="…o pega la dirección de una imagen" className="text-xs" />
    </div>
  );
}

function TextField({ field, group, draft, setField }: { field: RegistryField; group?: string; draft: Draft; setField: SetField }) {
  const original = field.fallback ?? "";
  const edited = field.key in draft.texts;
  const val = edited ? draft.texts[field.key]! : original;
  const hidden = edited && !val.trim();
  const long = original.length > 80;
  // Volver a escribir el original equivale a no haberlo tocado.
  const set = (v: string) => setField("texts", field.key, v === original ? undefined : v);
  return (
    <div className={`space-y-1 ${long ? "col-span-full" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="truncate text-xs font-medium text-muted-foreground" title={field.key}>
          {fieldLabel(field, group)}
          {hidden ? <Badge variant="destructive" className="ml-2">Oculto en el portal</Badge> : edited && <Badge variant="secondary" className="ml-2">Editado</Badge>}
        </label>
        {edited && <button type="button" onClick={() => setField("texts", field.key, undefined)} className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><RotateCcw className="h-3 w-3" />Restaurar</button>}
      </div>
      {long
        ? <Textarea value={val} onChange={(e) => set(e.target.value)} rows={3} className={hidden ? "border-destructive/50" : ""} />
        : <Input value={val} onChange={(e) => set(e.target.value)} className={hidden ? "border-destructive/50" : ""} />}
      {edited && <p className="truncate text-xs text-muted-foreground" title={original}>Original: {original}</p>}
    </div>
  );
}

/**
 * La página real, en un marco a escala, mostrando el borrador sin guardar (ver PREVIEW_MESSAGE en pageContent.ts).
 * Se dibuja al ancho de un escritorio o de un móvil y se reduce para caber en el panel.
 */
function PreviewFrame({ page, route, draft }: { page: string; route: string; draft: Draft }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const send = () => frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, page, doc: draft }, window.location.origin);
  // Cada cambio del borrador se envía a la página, con una pequeña espera para no hacerlo en cada tecla.
  useEffect(() => { const t = setTimeout(send, 150); return () => clearTimeout(t); });
  const natural = device === "desktop" ? 1280 : 390;
  const scale = Math.min(1, width / natural);
  const height = 640;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold"><Eye className="h-4 w-4 text-muted-foreground" />Vista previa <span className="font-normal text-muted-foreground">(sin guardar)</span></p>
        <div className="flex gap-1">
          <Button variant={device === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}><Monitor className="mr-1 h-4 w-4" />Escritorio</Button>
          <Button variant={device === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}><Smartphone className="mr-1 h-4 w-4" />Móvil</Button>
        </div>
      </div>
      <div ref={box} className="overflow-hidden rounded-lg border bg-muted" style={{ height }}>
        <iframe
          ref={frame}
          key={route}
          src={route}
          title="Vista previa de la página"
          onLoad={() => { send(); setTimeout(send, 1500); }}
          style={{ width: natural, height: height / scale, transform: `scale(${scale})`, transformOrigin: "top left", border: 0, marginLeft: device === "mobile" ? Math.max(0, (width - natural * scale) / 2) : 0 }}
        />
      </div>
    </div>
  );
}

/**
 * Editor de los textos e imágenes de cada página y componente compartido del sitio. Cada campo empieza con el
 * contenido original: si se cambia, el sitio muestra el cambio; si se deja vacío, el texto se oculta del portal;
 * «Restaurar» vuelve al original. Se guarda en el documento `page-<página>`.
 */
export function AdminPageContentEditor() {
  const qc = useQueryClient();
  const { data: registry = [], isLoading: loadingRegistry } = useQuery({
    queryKey: ["page-content-registry"],
    queryFn: async () => (await import("@/generated/pageContentRegistry.json")).default as RegistryPage[],
    staleTime: Infinity,
  });
  // Vista previa de las imágenes empaquetadas con el sitio (por nombre de archivo).
  const { data: resolveAsset } = useQuery({ queryKey: ["page-content-assets"], queryFn: async () => (await import("@/services/catalogBrowser")).resolvePackagedAsset, staleTime: Infinity });
  const [pageFilter, setPageFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewRoute, setPreviewRoute] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const page = registry.find((p) => p.page === selected) ?? null;

  const { data: saved, isLoading: loadingDoc } = useQuery({ queryKey: ["page-content", selected], queryFn: () => fetchPageContent(selected!, true), enabled: !!selected });
  const savedDraft = useMemo<Draft>(() => ({ texts: { ...(saved?.texts ?? {}) }, images: { ...(saved?.images ?? {}) } }), [saved]);
  const [draft, setDraft] = useState<Draft>({ texts: {}, images: {} });
  useEffect(() => setDraft(savedDraft), [savedDraft, selected]);
  const dirty = !sameDraft(draft, savedDraft);

  const setField: SetField = (group, key, value) => setDraft((d) => {
    const next = { ...d[group] };
    if (value === undefined) delete next[key]; else next[key] = value;
    return { ...d, [group]: next };
  });
  const choose = (next: string | null) => {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Descartarlos?")) return;
    setSelected(next);
    // Las páginas de ficha (/hotel/:slug) necesitan una dirección concreta: se escribe a mano.
    const p = registry.find((x) => x.page === next);
    setPreviewRoute(p ? (p.shared ? "/" : p.routes.find((r) => !r.includes(":")) ?? "") : "");
    setFieldFilter("");
    setOnlyChanged(false);
  };

  const save = useMutation({
    // Se guarda lo que difiere del original; un valor vacío ("") significa «oculto en el portal».
    mutationFn: () => contentDocumentsApi.save(pageDocKey(selected!), { texts: draft.texts, images: draft.images }),
    onSuccess: () => {
      invalidatePageContentIndex();
      toast.success("Página guardada. Los cambios ya se ven en el sitio.");
      qc.invalidateQueries({ queryKey: ["page-content", selected] });
    },
    onError: (e: Error) => toast.error(e.message || "No se pudo guardar la página"),
  });

  const pages = useMemo(() => {
    const q = pageFilter.trim().toLowerCase();
    if (!q) return registry;
    // Primero las que coinciden por nombre o ruta; después las que sólo contienen el texto buscado.
    const byName = registry.filter((p) => titleCase(p.name).toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.routes.some((r) => r.includes(q)));
    const byText = registry.filter((p) => !byName.includes(p) && p.texts.some((t) => t.fallback?.toLowerCase().includes(q)));
    return [...byName, ...byText];
  }, [registry, pageFilter]);
  const groups = useMemo(() => {
    if (!page) return [];
    const q = fieldFilter.trim().toLowerCase();
    const texts = page.texts.filter((t) => (!onlyChanged || t.key in draft.texts) && (!q || t.fallback?.toLowerCase().includes(q) || t.hint?.toLowerCase().includes(q) || t.section?.toLowerCase().includes(q) || draft.texts[t.key]?.toLowerCase().includes(q)));
    const images = page.images.filter((i) => (!onlyChanged || i.key in draft.images) && (!q || i.hint?.toLowerCase().includes(q) || i.section?.toLowerCase().includes(q)));
    return groupFields(texts, images);
  }, [page, fieldFilter, onlyChanged, draft]);
  const changedCount = Object.keys(draft.texts).length + Object.keys(draft.images).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
      {/* En móvil, la lista deja paso al editor en cuanto se elige una página. */}
      <Card className={`lg:sticky lg:top-4 lg:block lg:self-start ${page ? "hidden" : ""}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Páginas del sitio</CardTitle>
          <CardDescription>{registry.length} páginas y componentes con contenido editable.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-[1.15rem] h-4 w-4 text-muted-foreground" />
            <Input value={pageFilter} onChange={(e) => setPageFilter(e.target.value)} placeholder="Buscar página, ruta o texto" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[65vh]">
            {loadingRegistry ? <p className="p-4 text-sm text-muted-foreground">Cargando…</p> : pages.map((p) => (
              <button
                key={p.page}
                type="button"
                onClick={() => choose(p.page)}
                className={`w-full border-b px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${selected === p.page ? "bg-muted font-medium" : ""}`}
              >
                <span className="flex items-center gap-2">{titleCase(p.name)}{p.shared && <Badge variant="outline" className="text-3xs">Compartido</Badge>}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.shared ? "Aparece en varias páginas" : p.routes[0] ?? "—"} · {p.texts.length} textos{p.images.length ? ` · ${p.images.length} imágenes` : ""}</span>
              </button>
            ))}
            {!loadingRegistry && pages.length === 0 && <p className="p-4 text-sm text-muted-foreground">Ninguna página coincide.</p>}
          </ScrollArea>
        </CardContent>
      </Card>

      {!page ? (
        <Card className="hidden items-center justify-center p-12 text-center text-muted-foreground lg:flex">
          <div><FileText className="mx-auto mb-3 h-8 w-8" />Elige una página para editar sus textos e imágenes.</div>
        </Card>
      ) : (
        <Card className="min-w-0">
          <CardHeader className="gap-3 border-b sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="-ml-2 lg:hidden" onClick={() => choose(null)}><ArrowLeft className="mr-1 h-4 w-4" />Páginas</Button>
              <CardTitle>{titleCase(page.name)}</CardTitle>
              <div className="flex flex-wrap items-center gap-1">
                {page.routes.filter((r) => !r.includes(":")).slice(0, 3).map((r) => (
                  <a key={r} href={r} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs hover:bg-muted">{r}<ExternalLink className="h-3 w-3" /></a>
                ))}
                {page.shared && <Badge variant="outline">Componente compartido</Badge>}
              </div>
              <CardDescription>Cambia un campo para editarlo. Si lo dejas <strong>vacío</strong>, ese texto se oculta del portal. «Restaurar» vuelve al original.</CardDescription>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {changedCount > 0 && <Badge variant="secondary">{changedCount} cambiados</Badge>}
              <Button variant="outline" className="hidden xl:inline-flex" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? <LayoutList className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{showPreview ? "Sólo campos" : "Vista previa"}
              </Button>
              <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
                {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar página
              </Button>
            </div>
          </CardHeader>
          <CardContent className={`pt-6 ${showPreview ? "xl:grid xl:grid-cols-2 xl:gap-6" : ""}`}>
            {loadingDoc ? <p className="text-sm text-muted-foreground">Cargando contenido guardado…</p> : (
              <>
                <div className="min-w-0 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} placeholder="Buscar un texto o una sección" className="h-9 max-w-xs" />
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />Sólo lo cambiado
                    </label>
                    <span className="text-xs text-muted-foreground">{page.texts.length} textos · {page.images.length} imágenes</span>
                  </div>
                  {groups.map((g) => (
                    <section key={g.id} className="rounded-lg border p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        {g.list ? <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{g.title}</span>
                      </h3>
                      <div className={g.images.length && g.texts.length ? "grid gap-4 md:grid-cols-[13rem_1fr]" : "space-y-4"}>
                        {g.images.length > 0 && (
                          <div className={g.texts.length ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
                            {g.images.map((im) => <ImageField key={im.key} field={im} group={g.list ? g.id : undefined} draft={draft} setField={setField} resolveAsset={resolveAsset} />)}
                          </div>
                        )}
                        {g.texts.length > 0 && (
                          <div className={`grid content-start gap-x-6 gap-y-4 ${showPreview ? "" : "xl:grid-cols-2"}`}>
                            {g.texts.map((t) => <TextField key={t.key} field={t} group={g.list ? g.id : undefined} draft={draft} setField={setField} />)}
                          </div>
                        )}
                      </div>
                    </section>
                  ))}
                  {groups.length === 0 && <p className="text-sm text-muted-foreground">Nada coincide con el filtro.</p>}
                </div>
                {showPreview && (
                  <div className="hidden min-w-0 xl:block">
                    <div className="sticky top-4 space-y-2">
                      {previewRoute
                        ? <PreviewFrame page={page.page} route={previewRoute} draft={draft} />
                        : <p className="rounded-lg border p-4 text-sm text-muted-foreground">Esta página es una ficha. Escribe abajo la dirección de una ficha concreta para verla.</p>}
                      <Input
                        value={previewRoute}
                        onChange={(e) => setPreviewRoute(e.target.value.startsWith("/") || !e.target.value ? e.target.value : `/${e.target.value}`)}
                        placeholder={page.routes[0] ?? "/"}
                        className="h-8 font-mono text-xs"
                        aria-label="Dirección de la vista previa"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
