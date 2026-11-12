// Ficha de provincia con la misma disposición que el editor de noticias (estilo WordPress): contenido a la izquierda,
// cajas de Publicar, Portada, Identidad y Ubicación a la derecha. Municipios, lugares y galería se guardan como JSON.
import { useMemo, useState, type ReactNode } from "react";
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
import { useTerritory } from "./LocationPicker";
import { INTRO_LAYOUTS } from "@/components/province/ProvinceIntroSection";
import { EditorAutosaveStrip } from "./DraftAutosaveBar";
import { buildAutoDraftSlug, useDraftAutosave } from "./useDraftAutosave";

// Secciones de la página de provincia, en el orden por defecto. Los catálogos (monumentos, parques, hoteles…) se
// rellenan solos: aquí solo se decide si salen y en qué orden.
const BLOCKS: [string, string][] = [
  ["hero", "Portada (slider)"], ["introduccion", "Presentación de la provincia"], ["identidad", "Identidad e introducción"], ["ficha", "Ficha técnica"], ["distancias", "Distancias"],
  ["anuncio", "Anuncio"], ["acerca", "Acerca de (historia, geografía…)"], ["temas", "Temas"], ["municipios", "Municipios"],
  ["viajero", "Según el viajero"], ["actividades", "Actividades"], ["destinos", "Destinos"], ["itinerario", "Itinerario"],
  ["como-llegar", "Cómo llegar"], ["monumentos", "Monumentos (automático)"], ["anuncio-2", "Anuncio 2"], ["parques", "Parques (automático)"],
  ["hoteles", "Hoteles (automático)"], ["gastronomia", "Restaurantes (automático)"], ["vida-nocturna", "Vida nocturna (automático)"],
  ["panorama", "Banner panorámico"], ["blog", "Noticias relacionadas"], ["galeria", "Galería"], ["zonas", "Zonas"],
  ["pasaporte", "Pasaporte"], ["creditos", "Créditos de fotos"], ["comentarios", "Comentarios"],
];
const DEFAULT_ON = ["hero", "introduccion", "ficha", "distancias", "anuncio", "acerca", "actividades", "destinos", "itinerario", "como-llegar", "monumentos",
  "anuncio-2", "parques", "hoteles", "gastronomia", "vida-nocturna", "panorama", "blog", "galeria", "comentarios"];
const CATEGORIES = ["playa", "montaña", "ecoturismo", "cultura", "aventura", "rios", "ciudad", "lujo"];
const ABOUT: [string, string][] = [["history", "Historia"], ["geography", "Geografía"], ["artAndCulture", "Arte y cultura"],
  ["politicalDivision", "División política"], ["economy", "Economía"], ["demographics", "Población"], ["location", "Ubicación"]];
const TRANSPORT = [["carro", "Carro"], ["bus", "Autobús"], ["avion", "Avión"], ["barco", "Barco"]] as const;
type Slide = { image: string; tag: string; title: string; subtitle: string; description: string; ctaText: string; ctaLink: string };
type Theme = { eyebrow: string; title: string; text: string; facts: string[]; image: string };
type Tag = { label: string; places: string[] };
type Day = { titulo: string; lugar: string; desc: string };
type Trip = { tipo: string; desde: string; duracion: string; descripcion: string; precio: string };
const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);
const obj = <T,>(v: unknown, fb: T): T => { try { const o = JSON.parse(String(v ?? "")); return o && typeof o === "object" ? o : fb; } catch { return fb; } };

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
    tagline: s(r.tagline), intro: s(r.intro), population: s(r.population), area_km2: s(r.area_km2), best_time: s(r.best_time),
    weather_info: s(r.weather_info), how_to_get_there: s(r.how_to_get_there), intro_layout: s(r.intro_layout),
  }));
  const [cards, setCards] = useState<{ image: string; title: string; location: string; tag: string }[]>(() => parse(r.intro_cards));
  const [highlights, setHighlights] = useState(() => parse<string>(r.highlights).join("\n"));
  const [dishes, setDishes] = useState(() => parse<string>(r.typical_dishes).join("\n"));
  const [credits, setCredits] = useState(() => parse<string>(r.photo_credits).join("\n"));
  const [cats, setCats] = useState<string[]>(() => parse<string>(r.categories));
  const [slides, setSlides] = useState<Slide[]>(() => parse<Slide>(r.slides));
  const [about, setAbout] = useState<Record<string, string>>(() => obj(r.about, {}));
  const [themes, setThemes] = useState<(Omit<Theme, "facts"> & { facts: string })[]>(() => parse<Theme>(r.themes).map((t) => ({ ...t, facts: (t.facts ?? []).join("\n") })));
  const [tags, setTags] = useState<(Omit<Tag, "places"> & { places: string })[]>(() => parse<Tag>(r.traveler_tags).map((t) => ({ ...t, places: (t.places ?? []).join("\n") })));
  const [days, setDays] = useState<Day[]>(() => parse<Day>(r.itinerary));
  const [airport, setAirport] = useState<Record<string, string>>(() => obj(r.airport, {}));
  const [trips, setTrips] = useState<Trip[]>(() => parse<Trip>(r.transport));
  const [blocks, setBlocks] = useState<string[]>(() => { const b = parse<string>(r.blocks); return b.length ? b : DEFAULT_ON; });
  const territory = useTerritory();
  const ownMunis = id ? territory.municipalities.filter((m) => m.province_id === id) : [];
  const ownDests = id ? territory.destinations.filter((d) => d.province_id === id) : [];
  // Qué tiene rellenado la ficha: un índice en la barra lateral para saltar a lo que falta.
  const [hero, setHero] = useState<Photo[]>(() => parse<string | Photo>(r.hero_images).map((h) => (typeof h === "string" ? { url: h, alt: "" } : h)));
  const [gallery, setGallery] = useState<Photo[]>(() => parse<Photo>(r.gallery));
  const checks: [string, string, boolean][] = [
    ["pe-resumen", "Resumen", Boolean(f.short_description.trim())],
    ["pe-portada", "Imagen de portada", Boolean(f.image_url)],
    ["pe-fotos", "Fotos del slider", hero.length > 0 || slides.length > 0],
    ["pe-lema", "Lema e introducción", Boolean(f.tagline.trim() && f.intro.trim())],
    ["pe-presentacion", "Presentación", cards.length > 0 || Boolean(f.intro.trim())],
    ["pe-ficha", "Ficha técnica", Boolean(f.population && f.best_time && f.weather_info)],
    ["pe-acerca", "Acerca de", Object.values(about).filter((v) => v?.trim()).length >= 2],
    ["pe-temas", "Temas", themes.length > 0],
    ["pe-viajero", "Según el viajero", tags.length > 0],
    ["pe-itinerario", "Itinerario", days.length > 0],
    ["pe-llegar", "Cómo llegar", Boolean(airport.nombre) || trips.length > 0],
    ["pe-territorio", "Municipios publicados", ownMunis.some((m) => m.status === "published")],
    ["pe-galeria", "Galería", gallery.length >= 4],
    ["pe-seo", "Buscadores (SEO)", Boolean(f.seo_title.trim() && f.seo_description.trim())],
  ];
  const done = checks.filter(([, , ok]) => ok).length;
  const goTo = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el instanceof HTMLDetailsElement) el.open = true;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.querySelector<HTMLElement>("summary, input, textarea, select")?.focus({ preventScroll: true });
  };
  const moveBlock = (k: string, d: number) => setBlocks((b) => { const i = b.indexOf(k); const j = i + d; if (i < 0 || j < 0 || j >= b.length) return b; const a = [...b]; [a[i], a[j]] = [a[j], a[i]]; return a; });
  // Listas antiguas (antes de las tablas municipalities y del catálogo automático): se conservan al guardar.
  const [munis] = useState<Muni[]>(() => parse<Muni>(r.municipalities));
  const [places] = useState<Place[]>(() => parse<Place>(r.places));
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));

  const provinceSnapshot = useMemo(
    () => ({
      f, cards, highlights, dishes, credits, cats, slides, about,
      themes, tags, days, airport, trips, blocks, hero, gallery, slugTouched,
    }),
    [f, cards, highlights, dishes, credits, cats, slides, about, themes, tags, days, airport, trips, blocks, hero, gallery, slugTouched],
  );

  const buildPayload = (snap: typeof provinceSnapshot, status: string, fallback = false) => {
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const safeName = fallback ? snap.f.name.trim() || "Provincia borrador" : snap.f.name;
    const safeSlug = fallback ? buildAutoDraftSlug(safeName, snap.f.slug, "provincia") : snap.f.slug;
    return {
      ...Object.fromEntries(Object.entries(snap.f).map(([k, v]) => [k, v || null])),
      name: safeName || null,
      slug: safeSlug || null,
      status,
      latitude: num(snap.f.latitude), longitude: num(snap.f.longitude),
      population: num(snap.f.population), area_km2: num(snap.f.area_km2),
      highlights: lines(snap.highlights), typical_dishes: lines(snap.dishes),
      photo_credits: lines(snap.credits), categories: snap.cats,
      slides: snap.slides.filter((x) => x.title.trim()), about: snap.about,
      airport: snap.airport, blocks: snap.blocks,
      intro_cards: snap.cards.filter((x) => x.image && x.title.trim()),
      themes: snap.themes.filter((x) => x.title.trim()).map((x) => ({ ...x, facts: lines(x.facts) })),
      traveler_tags: snap.tags.filter((x) => x.label.trim()).map((x) => ({ ...x, places: lines(x.places) })),
      itinerary: snap.days.filter((x) => x.titulo.trim() || x.lugar.trim()).map((x, i) => ({ ...x, dia: i + 1 })),
      transport: snap.trips.filter((x) => x.desde.trim()),
      hero_images: snap.hero, gallery: snap.gallery,
      municipalities: munis.filter((m) => m.name.trim()),
      places: places.filter((p) => p.name.trim()).map((p) => ({ ...p, lat: num(p.lat), lng: num(p.lng) })),
    };
  };

  const autosave = useDraftAutosave({
    resource: "provinces",
    itemId: id,
    status: f.status,
    snapshot: provinceSnapshot,
    title: f.name,
    serverUpdatedAt: row === "new" ? null : (row.updated_at as string | null),
    onRestore: (snap) => {
      setF(snap.f); setCards(snap.cards); setHighlights(snap.highlights); setDishes(snap.dishes);
      setCredits(snap.credits); setCats(snap.cats); setSlides(snap.slides); setAbout(snap.about);
      setThemes(snap.themes); setTags(snap.tags); setDays(snap.days); setAirport(snap.airport);
      setTrips(snap.trips); setBlocks(snap.blocks); setHero(snap.hero); setGallery(snap.gallery);
      setSlugTouched(snap.slugTouched);
    },
    onPromoted: (saved) => {
      setId(saved.id);
      setSlugTouched(true);
      setF((x) => ({ ...x, name: x.name.trim() || "Provincia borrador", slug: x.slug.trim() || saved.slug || x.slug, status: "draft" }));
      void qc.invalidateQueries({ queryKey: ["staging", "provinces"] });
    },
    onServerAutoDraft: async (snap, effectiveId) => {
      const targetId = effectiveId ?? id;
      const body = buildPayload(snap, "draft", true);
      const saved = (await fetchApi<{ data: Row }>(`/admin/provinces${targetId ? `/${targetId}` : ""}`, {
        method: targetId ? "PUT" : "POST",
        body: JSON.stringify(body),
      })).data;
      setId(saved.id);
      setF((x) => ({
        ...x,
        name: x.name.trim() || String(body.name ?? ""),
        slug: x.slug.trim() || String(saved.slug ?? body.slug ?? ""),
        status: "draft",
      }));
      void qc.invalidateQueries({ queryKey: ["staging", "provinces"] });
      return { id: saved.id, slug: String(saved.slug ?? ""), updated_at: saved.updated_at as string | undefined };
    },
    onManualSave: () => {
      if (!save.isPending && !trash.isPending) save.mutate(f.status === "published" ? "published" : "draft");
    },
  });

  const save = useMutation({
    mutationFn: async (status: string) => {
      const targetId = autosave.effectiveId ?? id;
      const body = buildPayload(provinceSnapshot, status);
      return (await fetchApi<{ data: Row }>(`/admin/provinces${targetId ? `/${targetId}` : ""}`, { method: targetId ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      autosave.markSavedClean(saved.id);
      void qc.invalidateQueries({ queryKey: ["staging", "provinces"] });
      toast.success(status === "published" ? "Provincia publicada" : "Borrador guardado", { action: { label: "Nueva provincia", onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/provinces/${autosave.effectiveId ?? id}`, { method: "DELETE" }),
    onSuccess: () => { autosave.markSavedClean(id); toast.success("Provincia eliminada"); void qc.invalidateQueries({ queryKey: ["staging", "provinces"] }); onClose(); },
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

      <EditorAutosaveStrip autosave={autosave} itemLabel="esta provincia" />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre de la provincia" aria-label="Nombre" className="h-12 text-xl font-semibold" />
          <p className="text-sm text-muted-foreground">
            Enlace permanente: {SITE}/provincia/
            <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", toSlug(e.target.value)); }} aria-label="Slug" className="rounded border border-input bg-background px-1 font-mono text-foreground" />
          </p>

          <ClassicEditor id="province-body" value={f.description} onChange={(v) => set("description", v)} />

          <Box id="pe-resumen" title="Resumen">
            <Textarea rows={3} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} aria-label="Resumen" />
            <p className="text-xs text-muted-foreground">Una o dos frases; sale en las tarjetas de destinos y bajo el título.</p>
          </Box>

          <Box id="pe-lema" collapsible open title="Lema e introducción">
            <div className="space-y-1"><Label htmlFor="p-tag">Lema</Label>
              <Input id="p-tag" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="La península verde y marina" /></div>
            <div className="space-y-1"><Label htmlFor="p-intro">Introducción (bloque «Identidad»)</Label>
              <Textarea id="p-intro" rows={4} value={f.intro} onChange={(e) => set("intro", e.target.value)} /></div>
          </Box>

          <Box id="pe-presentacion" collapsible title="Presentación (bajo la portada)">
            <p className="text-xs text-muted-foreground">Usa el lema como título, el resumen como entrada y la introducción como texto (un párrafo por línea).</p>
            <div className="space-y-1"><Label htmlFor="p-layout">Composición</Label>
              <select id="p-layout" value={f.intro_layout} onChange={(e) => set("intro_layout", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="">Automática (cambia según la provincia)</option>
                {INTRO_LAYOUTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <p className="text-sm font-medium">Tarjetas con foto ({cards.length}/3)</p>
            <p className="text-xs text-muted-foreground">Si no pones ninguna, salen los destinos con foto y la galería.</p>
              <Repeater items={cards} onChange={(v) => setCards(v.slice(0, 3))} empty={{ image: "", title: "", location: "", tag: "" }} add="Añadir tarjeta" render={(x, p) => (
                <>
                  <ImageField id={`card-${x.title}`} compact value={x.image} onChange={(v) => p({ image: v })} />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input value={x.title} onChange={(e) => p({ title: e.target.value })} placeholder="Título (Cayo Levantado)" aria-label="Título de la tarjeta" />
                    <Input value={x.location} onChange={(e) => p({ location: e.target.value })} placeholder="Lugar (Santa Bárbara)" aria-label="Lugar de la tarjeta" />
                    <Input value={x.tag} onChange={(e) => p({ tag: e.target.value })} placeholder="Etiqueta (Isla de postal)" aria-label="Etiqueta de la tarjeta" />
                  </div>
                </>
              )} />
          </Box>

          <Box id="pe-fotos" collapsible title={`Slider de portada (${hero.length}/10)`}>
            <p className="text-xs text-muted-foreground">Si añades fotos aquí, la portada pasa a ser un slider; si no, se usa la imagen de portada.</p>
            <PhotoList items={hero} onChange={setHero} max={10} />
          </Box>

          <Box id="pe-slider" collapsible title={`Slider de portada: textos (${slides.length}/10)`}>
            <p className="text-xs text-muted-foreground">Cada diapositiva con su foto y su texto. Si no hay ninguna, se usan las fotos del «Slider de portada» de la derecha.</p>
            <Repeater items={slides} onChange={setSlides} empty={{ image: "", tag: "", title: "", subtitle: "", description: "", ctaText: "", ctaLink: "" }} add="Añadir diapositiva" render={(x, p) => (
              <>
                <ImageField id={`slide-${x.title}`} compact value={x.image} onChange={(v) => p({ image: v })} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={x.tag} onChange={(e) => p({ tag: e.target.value })} placeholder="Etiqueta (p. ej. Temporada de ballenas)" aria-label="Etiqueta" />
                  <Input value={x.title} onChange={(e) => p({ title: e.target.value })} placeholder="Título" aria-label="Título de la diapositiva" />
                </div>
                <Input value={x.subtitle} onChange={(e) => p({ subtitle: e.target.value })} placeholder="Subtítulo" aria-label="Subtítulo" />
                <Textarea rows={2} value={x.description} onChange={(e) => p({ description: e.target.value })} placeholder="Descripción" aria-label="Descripción de la diapositiva" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={x.ctaText} onChange={(e) => p({ ctaText: e.target.value })} placeholder="Texto del botón" aria-label="Texto del botón" />
                  <Input value={x.ctaLink} onChange={(e) => p({ ctaLink: e.target.value })} placeholder="Enlace del botón (/eventos…)" aria-label="Enlace del botón" />
                </div>
              </>
            )} />
          </Box>

          <Box id="pe-ficha" collapsible title="Ficha técnica">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1"><Label htmlFor="p-pop">Población</Label><Input id="p-pop" inputMode="numeric" value={f.population} onChange={(e) => set("population", e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="p-area">Superficie (km²)</Label><Input id="p-area" inputMode="decimal" value={f.area_km2} onChange={(e) => set("area_km2", e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label htmlFor="p-best">Mejor época para visitar</Label><Input id="p-best" value={f.best_time} onChange={(e) => set("best_time", e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="p-weather">Clima</Label><Textarea id="p-weather" rows={2} value={f.weather_info} onChange={(e) => set("weather_info", e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="p-how">Cómo llegar (resumen)</Label><Textarea id="p-how" rows={2} value={f.how_to_get_there} onChange={(e) => set("how_to_get_there", e.target.value)} /></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1"><Label htmlFor="p-hl">Lo más destacado (uno por línea)</Label><Textarea id="p-hl" rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="p-dish">Platos típicos (uno por línea)</Label><Textarea id="p-dish" rows={4} value={dishes} onChange={(e) => setDishes(e.target.value)} /></div>
            </div>
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium">Tipo de turismo (activa las actividades)</legend>
              <div className="flex flex-wrap gap-3 text-sm">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={cats.includes(c)} onChange={(e) => setCats((x) => (e.target.checked ? [...x, c] : x.filter((y) => y !== c)))} />{c}
                  </label>
                ))}
              </div>
            </fieldset>
          </Box>

          <Box id="pe-acerca" collapsible title="Acerca de">
            {ABOUT.map(([k, l]) => (
              <div key={k} className="space-y-1"><Label htmlFor={`about-${k}`}>{l}</Label>
                <Textarea id={`about-${k}`} rows={3} value={about[k] ?? ""} onChange={(e) => setAbout((x) => ({ ...x, [k]: e.target.value }))} /></div>
            ))}
          </Box>

          <Box id="pe-temas" collapsible title={`Temas (${themes.length})`}>
            <Repeater items={themes} onChange={setThemes} empty={{ eyebrow: "", title: "", text: "", facts: "", image: "" }} add="Añadir tema" render={(x, p) => (
              <>
                <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                  <Input value={x.eyebrow} onChange={(e) => p({ eyebrow: e.target.value })} placeholder="Antetítulo" aria-label="Antetítulo" />
                  <Input value={x.title} onChange={(e) => p({ title: e.target.value })} placeholder="Título del tema" aria-label="Título del tema" />
                </div>
                <Textarea rows={3} value={x.text} onChange={(e) => p({ text: e.target.value })} placeholder="Texto" aria-label="Texto del tema" />
                <Textarea rows={2} value={x.facts} onChange={(e) => p({ facts: e.target.value })} placeholder="Datos (uno por línea)" aria-label="Datos del tema" />
                <ImageField id={`theme-${x.title}`} compact value={x.image} onChange={(v) => p({ image: v })} />
              </>
            )} />
          </Box>

          <Box id="pe-viajero" collapsible title={`Según el viajero (${tags.length})`}>
            <Repeater items={tags} onChange={setTags} empty={{ label: "", places: "" }} add="Añadir perfil" render={(x, p) => (
              <>
                <Input value={x.label} onChange={(e) => p({ label: e.target.value })} placeholder="Perfil (Familias, Aventura…)" aria-label="Perfil de viajero" />
                <Textarea rows={2} value={x.places} onChange={(e) => p({ places: e.target.value })} placeholder="Lugares recomendados (uno por línea)" aria-label="Lugares recomendados" />
              </>
            )} />
          </Box>

          <Box id="pe-itinerario" collapsible title={`Itinerario (${days.length} días)`}>
            <Repeater items={days} onChange={setDays} empty={{ titulo: "", lugar: "", desc: "" }} add="Añadir día" render={(x, p) => (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={x.titulo} onChange={(e) => p({ titulo: e.target.value })} placeholder="Título del día" aria-label="Título del día" />
                  <Input value={x.lugar} onChange={(e) => p({ lugar: e.target.value })} placeholder="Lugar" aria-label="Lugar del día" />
                </div>
                <Textarea rows={2} value={x.desc} onChange={(e) => p({ desc: e.target.value })} placeholder="Qué hacer" aria-label="Descripción del día" />
              </>
            )} />
          </Box>

          <Box id="pe-llegar" collapsible title="Cómo llegar">
            <div className="grid gap-2 sm:grid-cols-[1fr_90px_120px]">
              <Input value={airport.nombre ?? ""} onChange={(e) => setAirport((x) => ({ ...x, nombre: e.target.value }))} placeholder="Aeropuerto más cercano" aria-label="Aeropuerto" />
              <Input value={airport.codigo ?? ""} onChange={(e) => setAirport((x) => ({ ...x, codigo: e.target.value }))} placeholder="Código" aria-label="Código del aeropuerto" />
              <Input value={airport.distancia ?? ""} onChange={(e) => setAirport((x) => ({ ...x, distancia: e.target.value }))} placeholder="Distancia" aria-label="Distancia al aeropuerto" />
            </div>
            <Repeater items={trips} onChange={setTrips} empty={{ tipo: "carro", desde: "", duracion: "", descripcion: "", precio: "" }} add="Añadir forma de llegar" render={(x, p) => (
              <>
                <div className="grid gap-2 sm:grid-cols-[120px_1fr_120px]">
                  <select value={x.tipo} onChange={(e) => p({ tipo: e.target.value })} aria-label="Medio" className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                    {TRANSPORT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <Input value={x.desde} onChange={(e) => p({ desde: e.target.value })} placeholder="Desde" aria-label="Desde" />
                  <Input value={x.duracion} onChange={(e) => p({ duracion: e.target.value })} placeholder="Duración" aria-label="Duración" />
                </div>
                <Textarea rows={2} value={x.descripcion} onChange={(e) => p({ descripcion: e.target.value })} placeholder="Detalles" aria-label="Detalles" />
                <Input value={x.precio} onChange={(e) => p({ precio: e.target.value })} placeholder="Precio aproximado" aria-label="Precio" />
              </>
            )} />
          </Box>

          <Box id="pe-territorio" collapsible title={`Municipios y destinos (${ownMunis.length} y ${ownDests.length})`}>
            {id ? (
              <>
                <p className="text-xs text-muted-foreground">Se editan en las secciones Municipios y Destinos del panel. Solo salen en la página los publicados.</p>
                <ul className="columns-2 text-sm">{ownMunis.map((m) => <li key={m.id}>{s(m.name)}{m.status === "published" ? "" : " (borrador)"}</li>)}</ul>
                {ownDests.length > 0 && <p className="text-sm"><strong>Destinos:</strong> {ownDests.map((d) => s(d.name)).join(", ")}</p>}
              </>
            ) : <p className="text-xs text-muted-foreground">Guarda la provincia para poder asignarle municipios y destinos.</p>}
          </Box>

          <Box id="pe-secciones" collapsible title="Secciones de la página">
            <p className="text-xs text-muted-foreground">Marca las que salen y ordénalas. Las marcadas «automático» se rellenan solas con el catálogo de la provincia.</p>
            <ul className="space-y-1 text-sm">
              {[...blocks.map((k) => BLOCKS.find(([b]) => b === k)).filter(Boolean) as [string, string][], ...BLOCKS.filter(([k]) => !blocks.includes(k))].map(([k, l]) => {
                const on = blocks.includes(k);
                return (
                  <li key={k} className="flex items-center gap-2">
                    <input type="checkbox" id={`blk-${k}`} checked={on} onChange={(e) => setBlocks((b) => (e.target.checked ? [...b, k] : b.filter((x) => x !== k)))} />
                    <label htmlFor={`blk-${k}`} className={`flex-1 ${on ? "" : "text-muted-foreground"}`}>{l}</label>
                    {on && <>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label={`Subir ${l}`} onClick={() => moveBlock(k, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label={`Bajar ${l}`} onClick={() => moveBlock(k, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    </>}
                  </li>
                );
              })}
            </ul>
          </Box>

          <Box id="pe-galeria" collapsible title={`Galería (${gallery.length})`}>
            <PhotoList items={gallery} onChange={setGallery} max={60} />
            <div className="space-y-1"><Label htmlFor="p-credits">Créditos de las fotos (uno por línea)</Label>
              <Textarea id="p-credits" rows={2} value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="Autor (licencia)" /></div>
          </Box>

          <Box id="pe-seo" collapsible title="Buscadores (SEO)">
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

        {/* La barra lateral se queda fija y se desplaza por dentro: no crece más que la pantalla. */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <Box title={`Ficha completa: ${done} de ${checks.length}`}>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={done} aria-label="Ficha completa">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${(done / checks.length) * 100}%` }} />
            </div>
            <ul className="space-y-1">
              {checks.map(([anchor, label, ok]) => (
                <li key={anchor}>
                  <button type="button" onClick={() => goTo(anchor)} className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted">
                    <span aria-hidden="true" className={ok ? "text-primary" : "text-muted-foreground"}>{ok ? "✓" : "○"}</span>
                    <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
                    <span className="sr-only">{ok ? "(completo)" : "(falta)"}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">Lo que falte se rellena con los datos locales del sitio.</p>
          </Box>

          <Box title="Publicar">
            <p>Estado: <strong>{f.status === "published" ? "Publicada" : "Borrador"}</strong></p>
            {id && f.slug && (
              <a href={`/provincia/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-primary underline underline-offset-2">
                {f.status === "published" ? "Ver la página" : "Vista previa"}<span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            )}
            <Button variant="outline" size="sm" disabled={busy || !f.name || !f.slug} onClick={() => save.mutate("draft")}>Guardar borrador</Button>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? <button type="button" className="text-sm text-destructive underline underline-offset-2" disabled={busy}
                onClick={() => { if (window.confirm("¿Eliminar esta provincia? Las noticias que la usan quedarán sin provincia.")) trash.mutate(); }}>Eliminar</button> : <span />}
              <Button disabled={busy || !f.name || !f.slug} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{f.status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
          </Box>

          <Box id="pe-portada" title="Imagen de portada">
            <ImageField id="province-cover" compact value={f.image_url} onChange={(v) => set("image_url", v)} />
            <div className="space-y-1"><Label htmlFor="p-alt">Texto alternativo</Label>
              <Input id="p-alt" value={f.image_alt} onChange={(e) => set("image_alt", e.target.value)} placeholder="Describe la imagen" /></div>
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
