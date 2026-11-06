// Edición de una noticia con la disposición del editor clásico de WordPress: título, enlace permanente y cuerpo a
// la izquierda; cajas de Publicar, Categorías, Imagen destacada y demás a la derecha. Pestañas por idioma: el español
// es la noticia; los demás idiomas se guardan como traducciones (api/index.ts → /admin/translations).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, Eye, Languages, Loader2, Pin, Sparkles, X } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { POST_TYPE_LABEL, type PostType } from "@/lib/stagingContent";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { NewsBody } from "./NewsBody";
import { ImageField } from "./StagingCrudManager";

type Row = Record<string, unknown> & { id: string };
const LANGS = [
  { code: "es", label: "Español" }, { code: "en", label: "English" }, { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" }, { code: "it", label: "Italiano" }, { code: "pt", label: "Português" },
] as const;
type Code = (typeof LANGS)[number]["code"];
type Tr = Exclude<Code, "es">;
/** Campos que cambian con el idioma; el resto (slug, categoría, portada, fecha…) es común. */
const TRANSLATABLE = ["title", "excerpt", "body", "seo_title", "seo_description", "image_alt", "image_credit"] as const;
type TrField = (typeof TRANSLATABLE)[number];
type Texts = Partial<Record<TrField, string>>;

const SITE = "https://www.descubrerepdom.com";
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
/** ISO ↔ valor de <input type="datetime-local"> en la hora local de quien edita. */
const toLocalInput = (iso: unknown) => {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card">
      <h3 className="border-b border-border px-4 py-2.5 text-sm font-semibold">{title}</h3>
      <div className="space-y-3 p-4 text-sm">{children}</div>
    </section>
  );
}

export function NewsEditor({ row, onClose, onNew }: { row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const qc = useQueryClient();
  const isNew = row === "new";
  const [id, setId] = useState<string | null>(isNew ? null : row.id);
  const [lang, setLang] = useState<Code>("es");
  const [base, setBase] = useState<Record<string, string>>(() => {
    const r: Record<string, unknown> = isNew ? {} : row;
    const get = (k: string) => (r[k] == null ? "" : String(r[k]));
    return {
      title: get("title"), slug: get("slug"), excerpt: get("excerpt"), body: get("body"), cover_url: get("cover_url"),
      image_alt: get("image_alt"), image_credit: get("image_credit"), category_id: get("category_id"), province_id: get("province_id"),
      author: get("author"), source_url: get("source_url"), post_type: get("post_type") || "noticia", sponsor: get("sponsor"), seo_title: get("seo_title"), seo_description: get("seo_description"),
      featured: r.featured === 1 || r.featured === true ? "1" : "", status: get("status") || "draft", published_at: toLocalInput(r.published_at),
    };
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [editingSlug, setEditingSlug] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [tr, setTr] = useState<Partial<Record<Tr, Texts>>>({});
  const [dirty, setDirty] = useState<Set<Tr>>(new Set());
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);
  const [newCat, setNewCat] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({ queryKey: ["staging", "news-categories"], queryFn: async () => (await fetchApi<{ data: Row[] }>("/admin/news-categories")).data });
  const { data: provinces = [] } = useQuery({ queryKey: ["staging", "provinces"], queryFn: async () => (await fetchApi<{ data: Row[] }>("/admin/provinces")).data });
  const { data: savedTr } = useQuery({
    queryKey: ["staging", "translations", "news", id], enabled: Boolean(id),
    queryFn: async () => (await fetchApi<{ data: Partial<Record<Tr, Texts>> }>(`/admin/translations/news/${id}`)).data,
  });
  useEffect(() => { if (savedTr) setTr((cur) => ({ ...savedTr, ...Object.fromEntries([...dirty].map((l) => [l, cur[l]])) })); }, [savedTr]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Texto de un campo traducible en la pestaña activa (en otro idioma, vacío = se mostrará el español). */
  const text = (f: TrField) => (lang === "es" ? base[f] ?? "" : tr[lang]?.[f] ?? "");
  const setText = (f: TrField, v: string) => {
    if (lang === "es") return setField(f, v);
    setTr((t) => ({ ...t, [lang]: { ...t[lang as Tr], [f]: v } }));
    setDirty((d) => new Set(d).add(lang as Tr));
  };
  const setField = (k: string, v: string) => setBase((b) => {
    const next = { ...b, [k]: v };
    if (k === "title" && !slugTouched) next.slug = toSlug(v);
    return next;
  });

  const save = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const body = {
        ...Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v || null])),
        featured: base.featured === "1", status, published_at: fromLocalInput(base.published_at),
      };
      const res = await fetchApi<{ data: Row }>(`/admin/news${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(body) });
      const newId = res.data.id;
      for (const l of dirty) {
        await fetchApi(`/admin/translations/news/${newId}/${l}`, { method: "PUT", body: JSON.stringify({ data: tr[l] ?? {} }) });
      }
      return { saved: res.data, status };
    },
    onSuccess: ({ saved, status }) => {
      setId(saved.id);
      setDirty(new Set());
      setBase((b) => ({ ...b, status, published_at: toLocalInput(saved.published_at) }));
      void qc.invalidateQueries({ queryKey: ["staging", "news"] });
      void qc.invalidateQueries({ queryKey: ["staging", "translations", "news", saved.id] });
      toast.success(status === "published" ? "Noticia publicada" : "Borrador guardado", { action: { label: "Nueva noticia", onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/news/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Noticia eliminada"); void qc.invalidateQueries({ queryKey: ["staging", "news"] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const translate = useMutation({
    mutationFn: async (targets: Tr[]) => {
      const fields = Object.fromEntries(TRANSLATABLE.map((f) => [f, base[f] ?? ""]).filter(([, v]) => v));
      return (await fetchApi<{ data: Partial<Record<Tr, Texts>> }>("/admin/translate", { method: "POST", body: JSON.stringify({ fields, to: targets }) })).data;
    },
    onSuccess: (result, targets) => {
      setTr((t) => ({ ...t, ...result }));
      setDirty((d) => new Set([...d, ...targets]));
      setLang(targets[0]);
      toast.success("Traducción lista: revísala y guarda para publicarla");
    },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const addCategory = useMutation({
    mutationFn: (name: string) => fetchApi<{ data: Row }>("/admin/news-categories", { method: "POST", body: JSON.stringify({ name, slug: toSlug(name), sort_order: 999 }) }),
    onSuccess: (r) => { setField("category_id", r.data.id); setNewCat(null); void qc.invalidateQueries({ queryKey: ["staging", "news-categories"] }); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const published = base.status === "published";
  const future = base.published_at && new Date(base.published_at) > new Date();
  const busy = save.isPending || trash.isPending;
  const missingLangs = useMemo(() => LANGS.slice(1).filter((l) => !tr[l.code as Tr]?.title).map((l) => l.code as Tr), [tr]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1.5 h-4 w-4" />Todas las noticias</Button>
        <h2 className="text-xl font-semibold">{isNew && !id ? "Añadir nueva noticia" : "Editar noticia"}</h2>
        {id && <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir nueva noticia</Button>}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Columna principal */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1 border-b border-border" role="tablist" aria-label="Idioma">
            {LANGS.map((l) => {
              const has = l.code === "es" ? true : Boolean(tr[l.code as Tr]?.title);
              return (
                <button key={l.code} type="button" role="tab" aria-selected={lang === l.code} onClick={() => setLang(l.code)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm ${lang === l.code ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {l.label}{l.code !== "es" && <span className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${has ? "bg-emerald-500" : "bg-muted-foreground/30"}`} aria-label={has ? "traducida" : "sin traducir"} />}
                  {dirty.has(l.code as Tr) && <span className="ml-1 text-amber-600" title="Cambios sin guardar">•</span>}
                </button>
              );
            })}
            <div className="ml-auto flex gap-2 pb-1.5">
              <Button size="sm" variant="outline" disabled={translate.isPending || !base.title}
                onClick={() => translate.mutate(lang === "es" ? (missingLangs.length ? missingLangs : LANGS.slice(1).map((l) => l.code as Tr)) : [lang as Tr])}>
                {translate.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                {lang === "es" ? (missingLangs.length ? `Traducir con IA (${missingLangs.length})` : "Retraducir todo con IA") : "Traducir esta pestaña con IA"}
              </Button>
            </div>
          </div>
          {lang !== "es" && (
            <p className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Languages className="h-4 w-4 shrink-0" />Lo que dejes vacío en este idioma se mostrará en español. La categoría, la portada y la fecha son comunes.
            </p>
          )}

          <Input value={text("title")} onChange={(e) => setText("title", e.target.value)} placeholder="Añade el título"
            aria-label="Título" className="h-14 text-2xl font-medium" />

          {lang === "es" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Enlace permanente:</span>
              {editingSlug ? (
                <>
                  <span className="text-muted-foreground">{SITE}/noticias/</span>
                  <Input value={base.slug} onChange={(e) => { setSlugTouched(true); setField("slug", toSlug(e.target.value) || e.target.value.toLowerCase()); }}
                    aria-label="Slug" className="h-8 w-60" />
                  <Button size="sm" variant="outline" onClick={() => setEditingSlug(false)}>Aceptar</Button>
                </>
              ) : (
                <>
                  <span className="break-all text-primary">{SITE}/noticias/<strong>{base.slug || "…"}</strong></span>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => setEditingSlug(true)}>Editar</Button>
                </>
              )}
              {published && slugTouched && !isNew && editingSlug && <span className="w-full text-xs text-amber-600">Cambiar el enlace de una noticia publicada rompe los enlaces ya compartidos.</span>}
            </div>
          )}

          <ClassicEditor id={`news-body-${lang}`} value={text("body")} onChange={(v) => setText("body", v)} />

          <Box title="Antetítulo (resumen)">
            <Textarea value={text("excerpt")} onChange={(e) => setText("excerpt", e.target.value)} rows={3} aria-label="Antetítulo (resumen)" />
            <p className="text-xs text-muted-foreground">Una o dos frases; aparece bajo el título y en las tarjetas de la portada.</p>
          </Box>

          <Box title="Buscadores (SEO)">
            {([["seo_title", "Título para buscadores", 60, "Si lo dejas vacío se usa el título."], ["seo_description", "Descripción para buscadores", 155, "Si la dejas vacía se usa el antetítulo."]] as const).map(([f, label, max, hint]) => (
              <div key={f} className="space-y-1">
                <Label htmlFor={`seo-${f}`}>{label}</Label>
                {f === "seo_title"
                  ? <Input id={`seo-${f}`} value={text(f)} onChange={(e) => setText(f, e.target.value)} />
                  : <Textarea id={`seo-${f}`} rows={2} value={text(f)} onChange={(e) => setText(f, e.target.value)} />}
                <p className="flex justify-between text-xs text-muted-foreground"><span>{hint}</span>
                  <span className={text(f).length > max ? "font-semibold text-amber-600" : ""}>{text(f).length}/{max}</span></p>
              </div>
            ))}
          </Box>
        </div>

        {/* Columna lateral */}
        <aside className="min-w-0 space-y-4">
          <Box title="Publicar">
            <div className="flex justify-between gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => save.mutate("draft")}>{published ? "Pasar a borrador" : "Guardar borrador"}</Button>
              <Button size="sm" variant="outline" onClick={() => setPreview(true)}><Eye className="mr-1.5 h-4 w-4" />Vista previa</Button>
            </div>
            <p className="flex items-center gap-2"><Pin className="h-4 w-4 text-muted-foreground" />Estado: <strong>{published ? (future ? "Programada" : "Publicada") : "Borrador"}</strong></p>
            <div>
              <p className="flex flex-wrap items-center gap-x-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />
                {base.published_at ? <>{future ? "Programada para" : "Publicada el"} <strong>{new Date(base.published_at).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" })}</strong></>
                  : <>Publicar <strong>inmediatamente</strong></>}
                <button type="button" className="text-primary underline underline-offset-2" onClick={() => setEditingDate((v) => !v)}>Editar</button>
              </p>
              {editingDate && (
                <div className="mt-2 space-y-1.5">
                  <Input type="datetime-local" aria-label="Fecha de publicación" value={base.published_at} onChange={(e) => setField("published_at", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Puede ser una fecha pasada. Si es futura, la noticia saldrá sola a esa hora.</p>
                  {base.published_at && <button type="button" className="text-xs text-primary underline" onClick={() => setField("published_at", "")}>Publicar inmediatamente</button>}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={base.featured === "1"} onChange={(e) => setField("featured", e.target.checked ? "1" : "")} className="h-4 w-4" />Destacada en la portada</label>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? (
                <button type="button" className="text-sm text-destructive underline underline-offset-2 disabled:opacity-50" disabled={busy}
                  onClick={() => { if (window.confirm("¿Mover esta noticia a la papelera? Se eliminará con sus traducciones.")) trash.mutate(); }}>Mover a la papelera</button>
              ) : <span />}
              <Button disabled={busy || !base.title || !base.slug} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{published ? "Actualizar" : future ? "Programar" : "Publicar"}
              </Button>
            </div>
          </Box>

          <Box title="Categorías">
            <div className="max-h-56 space-y-1.5 overflow-y-auto" role="radiogroup" aria-label="Categoría">
              {[{ id: "", name: "Sin categoría" }, ...categories].map((c) => (
                <label key={String(c.id)} className="flex items-center gap-2">
                  <input type="radio" name="news-category" checked={base.category_id === c.id} onChange={() => setField("category_id", String(c.id))} className="h-4 w-4" />
                  {String(c.name)}
                </label>
              ))}
            </div>
            {newCat === null ? (
              <button type="button" className="text-primary underline underline-offset-2" onClick={() => setNewCat("")}>+ Añadir nueva categoría</button>
            ) : (
              <div className="flex gap-2">
                <Input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nombre" aria-label="Nueva categoría" className="h-8" />
                <Button size="sm" disabled={!newCat.trim() || addCategory.isPending} onClick={() => addCategory.mutate(newCat.trim())}>Añadir</Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Cancelar" onClick={() => setNewCat(null)}><X className="h-4 w-4" /></Button>
              </div>
            )}
          </Box>

          <Box title="Imagen destacada">
            <ImageField id="news-cover" compact value={base.cover_url} onChange={(v) => setField("cover_url", v)} />
            <div className="space-y-1"><Label htmlFor="news-alt">Texto alternativo</Label>
              <Input id="news-alt" value={text("image_alt")} onChange={(e) => setText("image_alt", e.target.value)} placeholder="Describe la imagen" /></div>
            <div className="space-y-1"><Label htmlFor="news-credit">Crédito</Label>
              <Input id="news-credit" value={text("image_credit")} onChange={(e) => setText("image_credit", e.target.value)} placeholder="Foto: Ana Pérez" /></div>
          </Box>

          <Box title="Tipo de publicación">
            <div className="space-y-1.5" role="radiogroup" aria-label="Tipo de publicación">
              {(Object.keys(POST_TYPE_LABEL) as PostType[]).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="radio" name="news-type" checked={base.post_type === k} onChange={() => setField("post_type", k)} className="h-4 w-4" />
                  {POST_TYPE_LABEL[k]}
                </label>
              ))}
            </div>
            {base.post_type === "patrocinado" && (
              <div className="space-y-1"><Label htmlFor="news-sponsor">Patrocinador</Label>
                <Input id="news-sponsor" value={base.sponsor} onChange={(e) => setField("sponsor", e.target.value)} placeholder="Nombre de la marca" />
                <p className="text-xs text-muted-foreground">Sale en el espacio patrocinado de Últimas noticias, marcado como «Patrocinado».</p></div>
            )}
            {base.post_type === "invitado" && <p className="text-xs text-muted-foreground">Escribe el nombre del invitado en «Autor».</p>}
          </Box>

          <Box title="Detalles">
            <div className="space-y-1"><Label htmlFor="news-prov">Provincia</Label>
              <select id="news-prov" value={base.province_id} onChange={(e) => setField("province_id", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="">Ninguna</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{String(p.name)}</option>)}
              </select></div>
            <div className="space-y-1"><Label htmlFor="news-author">Autor</Label>
              <Input id="news-author" value={base.author} onChange={(e) => setField("author", e.target.value)} placeholder="Redacción Descubre RD" /></div>
            <div className="space-y-1"><Label htmlFor="news-source">Fuente (nota original)</Label>
              <Input id="news-source" type="url" value={base.source_url} onChange={(e) => setField("source_url", e.target.value)} placeholder="https://…" /></div>
          </Box>
        </aside>
      </div>

      {preview && (
        <div role="dialog" aria-modal="true" aria-label="Vista previa" className="fixed inset-0 z-50 overflow-y-auto p-4">
          <button type="button" aria-label="Cerrar vista previa" className="fixed inset-0 cursor-default bg-black/60" onClick={() => setPreview(false)} />
          <article className="relative mx-auto max-w-3xl rounded-2xl bg-background p-6 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa · {LANGS.find((l) => l.code === lang)?.label}</span>
              <Button size="icon" variant="ghost" aria-label="Cerrar" onClick={() => setPreview(false)}><X className="h-4 w-4" /></Button>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{String(categories.find((c) => c.id === base.category_id)?.name ?? "Noticias")}</p>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{text("title") || base.title}</h1>
            {(text("excerpt") || base.excerpt) && <p className="mt-3 text-lg text-muted-foreground">{text("excerpt") || base.excerpt}</p>}
            {base.cover_url && <img src={base.cover_url} alt={text("image_alt") || base.image_alt} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />}
            <div className="mt-6"><NewsBody markdown={text("body") || base.body} /></div>
          </article>
        </div>
      )}
    </div>
  );
}
