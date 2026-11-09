// Ficha de provincia con la misma disposición que el editor de noticias (estilo WordPress): contenido a la izquierda,
// cajas de Publicar, Portada, Identidad y Ubicación a la derecha. Municipios, lugares y galería se guardan como JSON.
import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { ImageField } from "./StagingCrudManager";
import { MediaPicker } from "./MediaLibrary";
import { SeoAnalysisBox } from "./SeoAnalysisBox";
import { Box } from "./NewsEditor";

type Row = Record<string, unknown> & { id: string };
type Muni = { name: string; description: string };
type Place = { name: string; type: string; description: string; image: string; lat: string; lng: string };
type Photo = { url: string; alt: string };

const REGIONS = [["norte", "Norte (Cibao)"], ["sur", "Sur"], ["este", "Este"], ["santo-domingo", "Santo Domingo"]] as const;
const PLACE_TYPES = ["Playa", "Cascada", "Montaña", "Parque nacional", "Mirador", "Museo", "Monumento", "Pueblo", "Gastronomía", "Otro"];
const SITE = "https://descubrerepdom.com";
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const parse = <T,>(v: unknown): T[] => { try { const a = JSON.parse(String(v ?? "[]")); return Array.isArray(a) ? a : []; } catch { return []; } };
const s = (v: unknown) => (v == null ? "" : String(v));

/** Lista editable: añadir, quitar y reordenar elementos. */
export function Repeater<T>({ items, onChange, empty, add, render }: {
  items: T[]; onChange: (v: T[]) => void; empty: T; add: string; render: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, d: number) => { const a = [...items]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 rounded-md border border-border p-3">
          <div className="min-w-0 flex-1 space-y-2">{render(it, (p) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x))))}</div>
          <div className="flex shrink-0 flex-col gap-1">
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { ...empty }])}><Plus className="mr-1.5 h-4 w-4" />{add}</Button>
    </div>
  );
}

/** Varias fotos de la biblioteca (portada en slider o galería), con su texto alternativo. */
export function PhotoList({ items, onChange, max }: { items: Photo[]; onChange: (v: Photo[]) => void; max: number }) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="space-y-2">
      <ul className="grid grid-cols-3 gap-2">
        {items.map((p, i) => (
          <li key={`${p.url}-${i}`} className="space-y-1">
            <div className="relative">
              <img src={p.url} alt="" className="aspect-[4/3] w-full rounded object-cover" />
              <button type="button" aria-label="Quitar foto" onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white hover:bg-black/80"><Trash2 className="h-3 w-3" /></button>
            </div>
            <Input value={p.alt} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Texto alternativo" className="h-7 text-xs" aria-label={`Texto alternativo de la foto ${i + 1}`} />
          </li>
        ))}
      </ul>
      {items.length < max && <Button type="button" variant="outline" size="sm" onClick={() => setPicking(true)}><ImagePlus className="mr-1.5 h-4 w-4" />Añadir de la biblioteca</Button>}
      <MediaPicker open={picking} onClose={() => setPicking(false)} onSelect={(m) => { onChange([...items, { url: m.url, alt: m.alt ?? "" }]); setPicking(false); }} />
    </div>
  );
}

export function ProvinceEditor({ row, onClose, onNew }: { row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const qc = useQueryClient();
  const r: Record<string, unknown> = row === "new" ? {} : row;
  const [id, setId] = useState<string | null>(row === "new" ? null : row.id);
  const [f, setF] = useState(() => ({
    name: s(r.name), slug: s(r.slug), region: s(r.region) || "norte", capital: s(r.capital), short_description: s(r.short_description),
    description: s(r.description), image_url: s(r.image_url), image_alt: s(r.image_alt), latitude: s(r.latitude), longitude: s(r.longitude),
    status: s(r.status) || "draft", color_primary: s(r.color_primary) || "#0b7290", color_accent: s(r.color_accent) || "#f2b134",
    seo_title: s(r.seo_title), seo_description: s(r.seo_description), focus_keywords: s(r.focus_keywords),
  }));
  const [hero, setHero] = useState<Photo[]>(() => parse<string | Photo>(r.hero_images).map((h) => (typeof h === "string" ? { url: h, alt: "" } : h)));
  const [gallery, setGallery] = useState<Photo[]>(() => parse<Photo>(r.gallery));
  const [munis, setMunis] = useState<Muni[]>(() => parse<Muni>(r.municipalities));
  const [places, setPlaces] = useState<Place[]>(() => parse<Place>(r.places));
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));

  const save = useMutation({
    mutationFn: async (status: string) => {
      const num = (v: string) => (v.trim() === "" ? null : Number(v));
      const body = {
        ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || null])), status,
        latitude: num(f.latitude), longitude: num(f.longitude),
        hero_images: hero, gallery, municipalities: munis.filter((m) => m.name.trim()),
        places: places.filter((p) => p.name.trim()).map((p) => ({ ...p, lat: num(p.lat), lng: num(p.lng) })),
      };
      return (await fetchApi<{ data: Row }>(`/admin/provinces${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      void qc.invalidateQueries({ queryKey: ["staging", "provinces"] });
      toast.success(status === "published" ? "Provincia publicada" : "Borrador guardado", { action: { label: "Nueva provincia", onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/provinces/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Provincia eliminada"); void qc.invalidateQueries({ queryKey: ["staging", "provinces"] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const busy = save.isPending || trash.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1.5 h-4 w-4" />Todas las provincias</Button>
        <h2 className="text-xl font-semibold">{id ? "Editar provincia" : "Añadir nueva provincia"}</h2>
        {id && <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir nueva provincia</Button>}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre de la provincia" aria-label="Nombre" className="h-12 text-xl font-semibold" />
          <p className="text-sm text-muted-foreground">
            Enlace permanente: {SITE}/provincia/
            <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", toSlug(e.target.value)); }} aria-label="Slug" className="rounded border border-input bg-background px-1 font-mono text-foreground" />
          </p>

          <ClassicEditor id="province-body" value={f.description} onChange={(v) => set("description", v)} />

          <Box title="Resumen">
            <Textarea rows={3} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} aria-label="Resumen" />
            <p className="text-xs text-muted-foreground">Una o dos frases; sale en las tarjetas de destinos y bajo el título.</p>
          </Box>

          <Box title={`Municipios (${munis.length})`}>
            <Repeater items={munis} onChange={setMunis} empty={{ name: "", description: "" }} add="Añadir municipio" render={(m, p) => (
              <>
                <Input value={m.name} onChange={(e) => p({ name: e.target.value })} placeholder="Nombre del municipio" aria-label="Municipio" />
                <Textarea rows={2} value={m.description} onChange={(e) => p({ description: e.target.value })} placeholder="Qué lo distingue (opcional)" aria-label="Descripción del municipio" />
              </>
            )} />
          </Box>

          <Box title={`Lugares y atractivos (${places.length})`}>
            <Repeater items={places} onChange={setPlaces} empty={{ name: "", type: "Playa", description: "", image: "", lat: "", lng: "" }} add="Añadir lugar" render={(pl, p) => (
              <>
                <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
                  <Input value={pl.name} onChange={(e) => p({ name: e.target.value })} placeholder="Nombre (p. ej. Salto El Limón)" aria-label="Lugar" />
                  <select value={pl.type} onChange={(e) => p({ type: e.target.value })} aria-label="Tipo de lugar" className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                    {PLACE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <Textarea rows={2} value={pl.description} onChange={(e) => p({ description: e.target.value })} placeholder="Descripción breve" aria-label="Descripción del lugar" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={String(pl.lat ?? "")} onChange={(e) => p({ lat: e.target.value })} placeholder="Latitud (19.17)" aria-label="Latitud del lugar" inputMode="decimal" />
                  <Input value={String(pl.lng ?? "")} onChange={(e) => p({ lng: e.target.value })} placeholder="Longitud (-69.43)" aria-label="Longitud del lugar" inputMode="decimal" />
                </div>
                <ImageField id={`place-img-${pl.name}`} compact value={pl.image} onChange={(v) => p({ image: v })} />
              </>
            )} />
          </Box>

          <Box title={`Galería (${gallery.length})`}>
            <PhotoList items={gallery} onChange={setGallery} max={60} />
          </Box>

          <Box title="Buscadores (SEO)">
            {([["seo_title", "Título para buscadores", 60, "Si lo dejas vacío se usa el nombre."], ["seo_description", "Descripción para buscadores", 155, "Si la dejas vacía se usa el resumen."]] as const).map(([k, label, max, hint]) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={`pseo-${k}`}>{label}</Label>
                {k === "seo_title"
                  ? <Input id={`pseo-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} />
                  : <Textarea id={`pseo-${k}`} rows={2} value={f[k]} onChange={(e) => set(k, e.target.value)} />}
                <p className="flex justify-between text-xs text-muted-foreground"><span>{hint}</span><span className={f[k].length > max ? "font-semibold text-amber-600" : ""}>{f[k].length}/{max}</span></p>
              </div>
            ))}
          </Box>

          <SeoAnalysisBox value={f.focus_keywords} onChange={(v) => set("focus_keywords", v)}
            input={{ title: f.name, seoTitle: f.seo_title, seoDescription: f.seo_description, slug: f.slug, excerpt: f.short_description,
              body: f.description, imageAlt: f.image_alt, hasImage: Boolean(f.image_url) }} />
        </div>

        <aside className="min-w-0 space-y-4">
          <Box title="Publicar">
            <p>Estado: <strong>{f.status === "published" ? "Publicada" : "Borrador"}</strong></p>
            <Button variant="outline" size="sm" disabled={busy || !f.name || !f.slug} onClick={() => save.mutate("draft")}>Guardar borrador</Button>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? <button type="button" className="text-sm text-destructive underline underline-offset-2" disabled={busy}
                onClick={() => { if (window.confirm("¿Eliminar esta provincia? Las noticias que la usan quedarán sin provincia.")) trash.mutate(); }}>Eliminar</button> : <span />}
              <Button disabled={busy || !f.name || !f.slug} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{f.status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
          </Box>

          <Box title="Imagen de portada">
            <ImageField id="province-cover" compact value={f.image_url} onChange={(v) => set("image_url", v)} />
            <div className="space-y-1"><Label htmlFor="p-alt">Texto alternativo</Label>
              <Input id="p-alt" value={f.image_alt} onChange={(e) => set("image_alt", e.target.value)} placeholder="Describe la imagen" /></div>
          </Box>

          <Box title={`Slider de portada (${hero.length}/10)`}>
            <p className="text-xs text-muted-foreground">Si añades fotos aquí, la portada pasa a ser un slider; si no, se usa la imagen de portada.</p>
            <PhotoList items={hero} onChange={setHero} max={10} />
          </Box>

          <Box title="Identidad">
            <div className="space-y-1"><Label htmlFor="p-region">Región</Label>
              <select id="p-region" value={f.region} onChange={(e) => set("region", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <div className="space-y-1"><Label htmlFor="p-capital">Capital</Label><Input id="p-capital" value={f.capital} onChange={(e) => set("capital", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["color_primary", "Color principal"], ["color_accent", "Color de acento"]] as const).map(([k, l]) => (
                <label key={k} className="space-y-1 text-sm">
                  <span className="block">{l}</span>
                  <span className="flex items-center gap-2">
                    <input type="color" value={f[k]} onChange={(e) => set(k, e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-input" aria-label={l} />
                    <code className="text-xs">{f[k]}</code>
                  </span>
                </label>
              ))}
            </div>
            <div className="h-2 rounded" style={{ background: `linear-gradient(90deg, ${f.color_primary}, ${f.color_accent})` }} aria-hidden="true" />
          </Box>

          <Box title="Ubicación">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label htmlFor="p-lat">Latitud</Label><Input id="p-lat" inputMode="decimal" value={f.latitude} onChange={(e) => set("latitude", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="p-lng">Longitud</Label><Input id="p-lng" inputMode="decimal" value={f.longitude} onChange={(e) => set("longitude", e.target.value)} /></div>
            </div>
            <p className="text-xs text-muted-foreground">Centro del mapa de la provincia.</p>
          </Box>
        </aside>
      </div>
    </div>
  );
}
