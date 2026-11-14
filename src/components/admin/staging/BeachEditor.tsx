import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Eye, Loader2, MapPin, Plus, Waves, X } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { LocationPicker, type Location } from "./LocationPicker";
import { Box } from "./NewsEditor";
import { PhotoList } from "./ProvinceEditor";
import { ImageField } from "./StagingCrudManager";
import { ACCESS_LABELS, BEACH_TYPE_LABELS, CROWD_LABELS, WAVE_LABELS } from "./BeachList";
import { EditorAutosaveStrip } from "./DraftAutosaveBar";
import { buildAutoDraftSlug, useDraftAutosave } from "./useDraftAutosave";
import { confirmAction } from "./confirmAction";

type Row = Record<string, unknown> & { id: string };
type Photo = { url: string; alt: string };

const SITE = "https://descubrerepdom.com";
const ACTIVITY_SUGGESTIONS = ["Snorkel", "Buceo", "Surf", "Kitesurf", "Windsurf", "Paddleboard", "Kayak", "Natación", "Catamarán", "Fotografía", "Caminatas", "Observación de estrellas de mar"];
const AMENITY_SUGGESTIONS = ["Sillas y sombrillas", "Restaurantes", "Bares de playa", "Duchas", "Baños", "Estacionamiento", "Beach clubs", "Alquiler de equipos", "Deportes acuáticos", "WiFi", "Seguridad"];

const s = (v: unknown) => (v == null ? "" : String(v));
const toSlug = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const parseArr = (v: unknown): unknown[] => { try { const a = JSON.parse(String(v ?? "[]")); return Array.isArray(a) ? a : []; } catch { return []; } };
const parsePhotos = (v: unknown): Photo[] => parseArr(v).map((item) => (
  typeof item === "string" ? { url: item, alt: "" } : { url: s((item as Photo)?.url), alt: s((item as Photo)?.alt) }
)).filter((p) => p.url);
const parseStrings = (v: unknown): string[] => parseArr(v).map((item) => String(item)).filter(Boolean);
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");

const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm";

function ChipListEditor({ items, onChange, placeholder, suggestions }: {
  items: string[]; onChange: (v: string[]) => void; placeholder: string; suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (value: string) => {
    const t = value.trim();
    if (!t || items.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...items, t]);
  };
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive" aria-label={`Quitar ${item}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); setDraft(""); } }}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => { add(draft); setDraft(""); }} className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" /> Añadir
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {suggestions.filter((sg) => !items.includes(sg)).slice(0, 8).map((sg) => (
          <button key={sg} type="button" onClick={() => add(sg)} className="rounded border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground">
            + {sg}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BeachEditor({ row, onClose, onNew }: { row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const isNew = row === "new";
  const initial = useMemo(() => (isNew ? ({} as Partial<Row>) : row), [isNew, row]);
  const qc = useQueryClient();

  const [id, setId] = useState(() => (isNew ? "" : row.id));
  const [name, setName] = useState(() => s(initial.name));
  const [slug, setSlug] = useState(() => s(initial.slug));
  const [slugManual, setSlugManual] = useState(() => !isNew && !!s(initial.slug));
  const [location, setLocation] = useState<Location>(() => ({
    province_id: s(initial.province_id),
    municipality_id: s(initial.municipality_id),
    destination_id: s(initial.destination_id),
  }));
  const [beachType, setBeachType] = useState(() => s(initial.beach_type) || "arena-blanca");
  const [shortDesc, setShortDesc] = useState(() => s(initial.short_description));
  const [description, setDescription] = useState(() => s(initial.description));
  const [imageUrl, setImageUrl] = useState(() => s(initial.image_url));
  const [imageAlt, setImageAlt] = useState(() => s(initial.image_alt));
  const [gallery, setGallery] = useState<Photo[]>(() => parsePhotos(initial.gallery));
  const [activities, setActivities] = useState<string[]>(() => parseStrings(initial.activities));
  const [amenities, setAmenities] = useState<string[]>(() => parseStrings(initial.amenities));
  const [waterColor, setWaterColor] = useState(() => s(initial.water_color));
  const [sandType, setSandType] = useState(() => s(initial.sand_type));
  const [waveIntensity, setWaveIntensity] = useState(() => s(initial.wave_intensity) || "calma");
  const [crowdLevel, setCrowdLevel] = useState(() => s(initial.crowd_level) || "media");
  const [accessType, setAccessType] = useState(() => s(initial.access_type) || "publico");
  const [parkingAvailable, setParkingAvailable] = useState(() => Boolean(initial.parking_available));
  const [lifeguardOnDuty, setLifeguardOnDuty] = useState(() => Boolean(initial.lifeguard_on_duty));
  const [howToGetThere, setHowToGetThere] = useState(() => s(initial.how_to_get_there));
  const [bestTimeToVisit, setBestTimeToVisit] = useState(() => s(initial.best_time_to_visit));
  const [latitude, setLatitude] = useState(() => s(initial.latitude));
  const [longitude, setLongitude] = useState(() => s(initial.longitude));
  const [rating, setRating] = useState(() => (initial.rating != null ? String(initial.rating) : "4.5"));
  const [isPopular, setIsPopular] = useState(() => Boolean(initial.is_popular));
  const [isFeatured, setIsFeatured] = useState(() => Boolean(initial.is_featured));
  const [seoTitle, setSeoTitle] = useState(() => s(initial.seo_title));
  const [seoDesc, setSeoDesc] = useState(() => s(initial.seo_description));
  const [status, setStatus] = useState(() => s(initial.status) || "draft");
  const [deleting, setDeleting] = useState(false);

  const lat = Number(latitude), lon = Number(longitude);
  const hasCoords = latitude.trim() !== "" && longitude.trim() !== "" && Number.isFinite(lat) && Number.isFinite(lon);

  const beachSnapshot = useMemo(
    () => ({
      name, slug, slugManual, location, beachType, shortDesc, description,
      imageUrl, imageAlt, gallery, activities, amenities, waterColor, sandType,
      waveIntensity, crowdLevel, accessType, parkingAvailable, lifeguardOnDuty,
      howToGetThere, bestTimeToVisit, latitude, longitude, rating, isPopular,
      isFeatured, seoTitle, seoDesc, status,
    }),
    [
      name, slug, slugManual, location, beachType, shortDesc, description,
      imageUrl, imageAlt, gallery, activities, amenities, waterColor, sandType,
      waveIntensity, crowdLevel, accessType, parkingAvailable, lifeguardOnDuty,
      howToGetThere, bestTimeToVisit, latitude, longitude, rating, isPopular,
      isFeatured, seoTitle, seoDesc, status,
    ],
  );

  const buildPayload = (snap: typeof beachSnapshot, targetStatus: string, fallback = false) => {
    const safeName = fallback ? snap.name.trim() || "Playa borrador" : snap.name.trim();
    const safeSlug = fallback
      ? buildAutoDraftSlug(safeName, snap.slug, "playa").slice(0, 120)
      : (snap.slug.trim() || toSlug(safeName)).slice(0, 120);
    return {
      name: safeName,
      slug: safeSlug,
      province_id: snap.location.province_id || null,
      municipality_id: snap.location.municipality_id || null,
      destination_id: snap.location.destination_id || null,
      beach_type: snap.beachType,
      short_description: snap.shortDesc.trim() || null,
      description: snap.description.trim() || null,
      image_url: snap.imageUrl.trim() || null,
      image_alt: snap.imageAlt.trim() || null,
      gallery: snap.gallery.filter((p) => p.url.trim()).map((p) => ({ url: p.url.trim(), alt: p.alt.trim() })),
      activities: snap.activities,
      amenities: snap.amenities,
      water_color: snap.waterColor.trim() || null,
      sand_type: snap.sandType.trim() || null,
      wave_intensity: snap.waveIntensity,
      crowd_level: snap.crowdLevel,
      access_type: snap.accessType,
      parking_available: snap.parkingAvailable ? 1 : 0,
      lifeguard_on_duty: snap.lifeguardOnDuty ? 1 : 0,
      how_to_get_there: snap.howToGetThere.trim() || null,
      best_time_to_visit: snap.bestTimeToVisit.trim() || null,
      latitude: snap.latitude.trim() === "" ? null : Number(snap.latitude),
      longitude: snap.longitude.trim() === "" ? null : Number(snap.longitude),
      rating: snap.rating.trim() === "" ? 4.5 : Number(snap.rating),
      is_popular: snap.isPopular ? 1 : 0,
      is_featured: snap.isFeatured ? 1 : 0,
      seo_title: snap.seoTitle.trim() || null,
      seo_description: snap.seoDesc.trim() || null,
      status: targetStatus,
    };
  };

  const autosave = useDraftAutosave({
    resource: "beaches",
    itemId: id || null,
    status,
    snapshot: beachSnapshot,
    title: name,
    serverUpdatedAt: isNew ? null : (initial.updated_at as string | null),
    onRestore: (snap) => {
      setName(snap.name); setSlug(snap.slug); setSlugManual(snap.slugManual);
      setLocation(snap.location); setBeachType(snap.beachType); setShortDesc(snap.shortDesc);
      setDescription(snap.description); setImageUrl(snap.imageUrl); setImageAlt(snap.imageAlt);
      setGallery(snap.gallery); setActivities(snap.activities); setAmenities(snap.amenities);
      setWaterColor(snap.waterColor); setSandType(snap.sandType); setWaveIntensity(snap.waveIntensity);
      setCrowdLevel(snap.crowdLevel); setAccessType(snap.accessType);
      setParkingAvailable(snap.parkingAvailable); setLifeguardOnDuty(snap.lifeguardOnDuty);
      setHowToGetThere(snap.howToGetThere); setBestTimeToVisit(snap.bestTimeToVisit);
      setLatitude(snap.latitude); setLongitude(snap.longitude); setRating(snap.rating);
      setIsPopular(snap.isPopular); setIsFeatured(snap.isFeatured);
      setSeoTitle(snap.seoTitle); setSeoDesc(snap.seoDesc); setStatus(snap.status);
    },
    onPromoted: (saved) => {
      setId(saved.id);
      setSlugManual(true);
      if (!name.trim()) setName("Playa borrador");
      if (!slug.trim() && saved.slug) setSlug(saved.slug);
      setStatus("draft");
      void qc.invalidateQueries({ queryKey: ["staging", "beaches"] });
    },
    onServerAutoDraft: async (snap, effectiveId) => {
      const targetId = effectiveId ?? (id || null);
      const body = buildPayload(snap, "draft", true);
      const saved = (await fetchApi<{ data: Row }>(targetId ? `/admin/beaches/${targetId}` : "/admin/beaches", {
        method: targetId ? "PUT" : "POST",
        body: JSON.stringify(body),
      })).data;
      setId(saved.id);
      if (!name.trim()) setName(body.name);
      if (!slug.trim()) setSlug(s(saved.slug) || body.slug);
      setStatus("draft");
      void qc.invalidateQueries({ queryKey: ["staging", "beaches"] });
      return { id: saved.id, slug: s(saved.slug) || body.slug, updated_at: saved.updated_at as string | undefined };
    },
    onManualSave: () => {
      if (!save.isPending && !deleting && name.trim()) save.mutate(status === "published" ? "published" : "draft");
    },
  });

  const save = useMutation({
    mutationFn: async (nextStatus?: string) => {
      const targetId = (await autosave.settledId()) ?? (id || null);
      const body = buildPayload(beachSnapshot, nextStatus ?? status);
      const saved = await fetchApi<{ data: Row }>(targetId ? `/admin/beaches/${targetId}` : "/admin/beaches", {
        method: targetId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      return saved.data;
    },
    onSuccess: (saved) => {
      setId(saved.id);
      setSlug(s(saved.slug));
      setStatus(s(saved.status));
      autosave.markSavedClean(saved.id);
      void qc.invalidateQueries({ queryKey: ["staging", "beaches"] });
      toast.success(saved.status === "published" ? "Playa publicada" : "Borrador guardado", {
        action: { label: "Nueva playa", onClick: onNew },
      });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });

  const remove = async () => {
    const targetId = (await autosave.settledId()) ?? (id || null);
    if (!targetId || !(await confirmAction(`¿Eliminar definitivamente "${name || "esta playa"}"?`))) return;
    setDeleting(true);
    try {
      await fetchApi(`/admin/beaches/${targetId}`, { method: "DELETE" });
      autosave.markSavedClean(targetId);
      void qc.invalidateQueries({ queryKey: ["staging", "beaches"] });
      toast.success("Playa eliminada");
      onClose();
    } catch (e) {
      toast.error(apiMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Todas las playas
          </Button>
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Waves className="h-4 w-4" /> {id ? "Editar playa" : "Nueva playa"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onNew}>Añadir nueva</Button>
      </div>

      <EditorAutosaveStrip autosave={autosave} itemLabel="esta playa" />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); if (!slugManual) setSlug(toSlug(e.target.value)); }}
              placeholder="Nombre de la playa (ej. Playa Bávaro)"
              className="h-12 text-lg font-semibold"
              aria-label="Nombre de la playa"
            />
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>Enlace permanente:</span>
              <span>{SITE}/playa/</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                onBlur={() => setSlug(toSlug(slug) || toSlug(name))}
                aria-label="Slug"
                className="min-w-[180px] rounded border border-border bg-background px-1.5 py-0.5 text-foreground"
              />
            </div>
          </div>

          <Box title="Descripción general">
            <ClassicEditor id="beach-desc" value={description} onChange={setDescription} />
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="beach-short">Resumen corto ({shortDesc.length}/300)</Label>
              <Textarea
                id="beach-short"
                rows={2}
                maxLength={300}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Frase breve para tarjetas del directorio y buscadores."
              />
            </div>
          </Box>

          <Box title="Condiciones y características del mar" collapsible open>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="beach-type">Tipo de playa</Label>
                <select id="beach-type" value={beachType} onChange={(e) => setBeachType(e.target.value)} className={selectCls}>
                  {Object.entries(BEACH_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-wave">Intensidad de oleaje</Label>
                <select id="beach-wave" value={waveIntensity} onChange={(e) => setWaveIntensity(e.target.value)} className={selectCls}>
                  {Object.entries(WAVE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-crowd">Afluencia</Label>
                <select id="beach-crowd" value={crowdLevel} onChange={(e) => setCrowdLevel(e.target.value)} className={selectCls}>
                  {Object.entries(CROWD_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-sand">Tipo de arena</Label>
                <Input id="beach-sand" value={sandType} onChange={(e) => setSandType(e.target.value)} placeholder="Arena blanca fina" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-water">Color del agua</Label>
                <Input id="beach-water" value={waterColor} onChange={(e) => setWaterColor(e.target.value)} placeholder="Turquesa cristalino" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-rating">Valoración (0 - 5)</Label>
                <Input id="beach-rating" type="number" min={0} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} />
              </div>
            </div>
          </Box>

          <Box title="Acceso, seguridad y logística" collapsible open>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="beach-access">Tipo de acceso</Label>
                <select id="beach-access" value={accessType} onChange={(e) => setAccessType(e.target.value)} className={selectCls}>
                  {Object.entries(ACCESS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-best-time">Mejor época para visitar</Label>
                <Input id="beach-best-time" value={bestTimeToVisit} onChange={(e) => setBestTimeToVisit(e.target.value)} placeholder="Todo el año, especialmente diciembre a abril" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={parkingAvailable} onChange={(e) => setParkingAvailable(e.target.checked)} />
                Estacionamiento disponible
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={lifeguardOnDuty} onChange={(e) => setLifeguardOnDuty(e.target.checked)} />
                Salvavidas / guardavidas en servicio
              </label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="beach-how">Cómo llegar</Label>
              <Textarea id="beach-how" rows={2} value={howToGetThere} onChange={(e) => setHowToGetThere(e.target.value)} placeholder="Indicaciones desde el aeropuerto o ciudad más cercana…" />
            </div>
          </Box>

          <Box title={`Actividades (${activities.length})`} collapsible open>
            <ChipListEditor items={activities} onChange={setActivities} placeholder="Añadir actividad (Enter)…" suggestions={ACTIVITY_SUGGESTIONS} />
          </Box>

          <Box title={`Servicios y amenidades (${amenities.length})`} collapsible open>
            <ChipListEditor items={amenities} onChange={setAmenities} placeholder="Añadir servicio (Enter)…" suggestions={AMENITY_SUGGESTIONS} />
          </Box>

          <Box title={`Galería de fotos (${gallery.length})`} collapsible open>
            <PhotoList items={gallery} onChange={setGallery} max={60} />
          </Box>

          <Box title="SEO" collapsible>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="beach-seo-title">Título SEO ({seoTitle.length}/90)</Label>
                <Input id="beach-seo-title" maxLength={90} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={`${name || "Nombre de la playa"} | Playas de República Dominicana`} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-seo-desc">Descripción SEO ({seoDesc.length}/200)</Label>
                <Textarea id="beach-seo-desc" rows={2} maxLength={200} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder={shortDesc || "Descripción para resultados de búsqueda"} />
              </div>
            </div>
          </Box>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <Box title="Publicar">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>Estado: <strong className="text-foreground">{status === "published" ? "Publicada" : "Borrador"}</strong></div>
              {status === "published" && slug && (
                <a href={`/playa/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Eye className="h-3.5 w-3.5" /> Ver ficha pública
                </a>
              )}
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Destacada en portada
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} /> Playa popular
              </label>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              <Button type="button" variant="outline" size="sm" disabled={save.isPending || !name.trim()} onClick={() => save.mutate("draft")}>
                Guardar borrador
              </Button>
              <Button type="button" size="sm" disabled={save.isPending || !name.trim()} onClick={() => save.mutate("published")} className="ml-auto gap-1.5">
                {save.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
            {id && (
              <button type="button" disabled={deleting} onClick={remove} className="mt-1 text-xs text-destructive hover:underline disabled:opacity-50">
                {deleting ? "Eliminando…" : "Mover a la papelera"}
              </button>
            )}
          </Box>

          <Box title="Imagen principal">
            <div className="space-y-1">
              <Label htmlFor="beach-img">Imagen de portada</Label>
              <ImageField id="beach-img" compact value={imageUrl} onChange={setImageUrl} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="beach-img-alt">Texto alternativo (alt)</Label>
              <Input id="beach-img-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder={name || "Vista aérea de la playa"} />
            </div>
          </Box>

          <Box title="Ubicación territorial">
            <LocationPicker value={location} onChange={setLocation} idPrefix="beach-loc" />
          </Box>

          <Box title="Coordenadas y mapa">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="beach-lat">Latitud</Label>
                <Input id="beach-lat" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="18.687" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="beach-lon">Longitud</Label>
                <Input id="beach-lon" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-68.4514" />
              </div>
            </div>
            {hasCoords ? (
              <iframe
                title={`Mapa de ${name || "la playa"}`}
                className="h-36 w-full rounded border border-border"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.03}%2C${lon + 0.03}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`}
              />
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Ingresa latitud y longitud para previsualizar el mapa.
              </p>
            )}
          </Box>
        </aside>
      </div>
    </div>
  );
}

