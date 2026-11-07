// Ficha de recinto (venue) con la disposición del editor de noticias: contenido, servicios, cómo llegar y galería
// a la izquierda; Publicar, Imagen, Tipo, Ubicación con mapa, Contacto y SEO a la derecha.
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MapPin, Plus, X } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { ImageField } from "./StagingCrudManager";
import { PhotoList } from "./ProvinceEditor";
import { Box } from "./NewsEditor";
import { VENUE_CATEGORY } from "./VenueList";

type Row = Record<string, unknown> & { id: string };
type Photo = { url: string; alt: string };
const SITE = "https://www.descubrerepdom.com";
const AMENITY_SUGGESTIONS = ["Estacionamiento", "Acceso para silla de ruedas", "Baños accesibles", "Climatizado", "Zona VIP", "Restaurantes", "Bares", "WiFi", "Seguridad", "Taquilla", "Guardarropa", "Primeros auxilios"];
const HOW_TO_GET = [["byCar", "En carro"], ["byBus", "En guagua / autobús"], ["byMetro", "En metro o teleférico"], ["taxi", "En taxi o Uber"], ["parking", "Estacionamiento"]] as const;
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const s = (v: unknown) => (v == null ? "" : String(v));
const parse = <T,>(v: unknown, empty: T): T => { try { return v ? (JSON.parse(String(v)) as T) : empty; } catch { return empty; } };

const TEXT = ["name", "slug", "category", "category_label", "short_description", "description", "image_url", "image_alt", "address", "city", "province",
  "latitude", "longitude", "map_url", "capacity", "year_built", "accessibility", "schedule", "phone", "email", "website", "seo_title", "seo_description", "status"] as const;
type Key = (typeof TEXT)[number];

function Field({ id, label, value, onChange, type = "text", placeholder, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type === "decimal" ? "text" : type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} inputMode={type === "decimal" ? "decimal" : undefined} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Lista de textos cortos como etiquetas (servicios, características). */
function Tags({ items, onChange, suggestions = [], placeholder }: { items: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => { const v = t.trim(); if (v && !items.includes(v)) onChange([...items, v]); setDraft(""); };
  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <li key={t} className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs">
            {t}<button type="button" aria-label={`Quitar ${t}`} onClick={() => onChange(items.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} aria-label={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); } }} />
        <Button type="button" variant="outline" size="icon" aria-label="Añadir" onClick={() => add(draft)}><Plus className="h-4 w-4" /></Button>
      </div>
      {suggestions.some((x) => !items.includes(x)) && (
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
          {suggestions.filter((x) => !items.includes(x)).map((x) => <button key={x} type="button" className="text-primary hover:underline" onClick={() => add(x)}>+ {x}</button>)}
        </p>
      )}
    </div>
  );
}

export function VenueEditor({ row, onClose, onNew }: { row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const qc = useQueryClient();
  const r: Record<string, unknown> = row === "new" ? {} : row;
  const [id, setId] = useState<string | null>(row === "new" ? null : row.id);
  const [f, setF] = useState(() => ({ ...Object.fromEntries(TEXT.map((k) => [k, s(r[k])])), category: s(r.category) || "otro", status: s(r.status) || "draft" }) as Record<Key, string>);
  const [gallery, setGallery] = useState<Photo[]>(() => parse<Photo[]>(r.gallery, []));
  const [amenities, setAmenities] = useState<string[]>(() => parse<string[]>(r.amenities, []));
  const [features, setFeatures] = useState<string[]>(() => parse<string[]>(r.features, []));
  const [how, setHow] = useState<Record<string, string>>(() => parse<Record<string, string>>(r.how_to_get, {}));
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const [locating, setLocating] = useState(false);
  const set = (k: Key, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));

  const lat = Number(f.latitude), lng = Number(f.longitude);
  const hasPoint = f.latitude !== "" && f.longitude !== "" && Number.isFinite(lat) && Number.isFinite(lng);

  /** Coordenadas a partir de la dirección (OpenStreetMap). Solo desde el panel y al pulsar el botón. */
  const locate = async () => {
    const q = [f.address, f.city, f.province, "República Dominicana"].filter(Boolean).join(", ");
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=do&q=${encodeURIComponent(q)}`, { headers: { "Accept-Language": "es" } });
      const [hit] = (await res.json()) as { lat: string; lon: string }[];
      if (!hit) { toast.error("No se encontró esa dirección; ajusta la dirección o escribe las coordenadas."); return; }
      setF((x) => ({ ...x, latitude: Number(hit.lat).toFixed(6), longitude: Number(hit.lon).toFixed(6) }));
      toast.success("Ubicación encontrada; comprueba el punto en el mapa.");
    } catch { toast.error("No se pudo consultar el mapa ahora."); } finally { setLocating(false); }
  };

  const save = useMutation({
    mutationFn: async (status: string) => {
      const n = (v: string) => (v.trim() === "" ? null : Number(v));
      const body = {
        ...Object.fromEntries(TEXT.map((k) => [k, f[k] || null])), status,
        latitude: n(f.latitude), longitude: n(f.longitude), capacity: n(f.capacity), year_built: n(f.year_built),
        gallery, amenities, features, how_to_get: how,
      };
      return (await fetchApi<{ data: Row }>(`/admin/venues${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      void qc.invalidateQueries({ queryKey: ["staging", "venues"] });
      toast.success(status === "published" ? "Recinto publicado" : "Borrador guardado", { action: { label: "Nuevo recinto", onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/venues/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Recinto eliminado"); void qc.invalidateQueries({ queryKey: ["staging", "venues"] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const busy = save.isPending || trash.isPending;
  const canSave = Boolean(f.name && f.slug);
  const d = 0.006; // medio lado del recuadro del mapa, en grados (~600 m)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1.5 h-4 w-4" />Todos los recintos</Button>
        <h2 className="text-xl font-semibold">{id ? "Editar recinto" : "Añadir nuevo recinto"}</h2>
        {id && <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>Añadir nuevo recinto</Button>}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre del recinto" aria-label="Nombre" className="h-12 text-xl font-semibold" />
          <p className="text-sm text-muted-foreground">
            Enlace permanente: {SITE}/recinto/
            <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", toSlug(e.target.value)); }} aria-label="Slug" className="rounded border border-input bg-background px-1 font-mono text-foreground" />
          </p>

          <ClassicEditor id="venue-body" value={f.description} onChange={(v) => set("description", v)} />

          <Box title="Resumen">
            <Textarea rows={3} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} aria-label="Resumen" />
            <p className="flex justify-between text-xs text-muted-foreground">
              <span>Sale en las tarjetas y bajo el nombre.</span>
              <span className={f.short_description.length > 160 ? "font-semibold text-amber-600" : ""}>{f.short_description.length}/160</span>
            </p>
          </Box>

          <Box title={`Servicios (${amenities.length})`}>
            <Tags items={amenities} onChange={setAmenities} suggestions={AMENITY_SUGGESTIONS} placeholder="Añadir servicio" />
          </Box>

          <Box title={`Datos destacados (${features.length})`}>
            <p className="text-xs text-muted-foreground">Equipos locales, hoyos y par de un campo de golf, número de salas… Una línea por dato.</p>
            <Tags items={features} onChange={setFeatures} placeholder="Añadir dato" />
          </Box>

          <Box title="Cómo llegar">
            {HOW_TO_GET.map(([k, label]) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={`how-${k}`}>{label}</Label>
                <Textarea id={`how-${k}`} rows={2} value={how[k] ?? ""} onChange={(e) => setHow((x) => ({ ...x, [k]: e.target.value }))} />
              </div>
            ))}
          </Box>

          <Box title="Accesibilidad y horario">
            <div className="space-y-1"><Label htmlFor="v-acc">Accesibilidad</Label>
              <Textarea id="v-acc" rows={2} value={f.accessibility} onChange={(e) => set("accessibility", e.target.value)} placeholder="Rampas, asientos reservados, baños adaptados…" /></div>
            <Field id="v-sched" label="Horario o apertura de puertas" value={f.schedule} onChange={(v) => set("schedule", v)} placeholder="Taquilla de 9:00 a 18:00; puertas 2 h antes" />
          </Box>

          <Box title={`Galería (${gallery.length})`}>
            <PhotoList items={gallery} onChange={setGallery} max={60} />
          </Box>

          <Box title="Buscadores (SEO)">
            {([["seo_title", "Título para buscadores", 60, "Si lo dejas vacío se usa el nombre."], ["seo_description", "Descripción para buscadores", 155, "Si la dejas vacía se usa el resumen."]] as const).map(([k, label, max, hint]) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={`vseo-${k}`}>{label}</Label>
                {k === "seo_title"
                  ? <Input id={`vseo-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} />
                  : <Textarea id={`vseo-${k}`} rows={2} value={f[k]} onChange={(e) => set(k, e.target.value)} />}
                <p className="flex justify-between text-xs text-muted-foreground"><span>{hint}</span><span className={f[k].length > max ? "font-semibold text-amber-600" : ""}>{f[k].length}/{max}</span></p>
              </div>
            ))}
          </Box>
        </div>

        <aside className="min-w-0 space-y-4">
          <Box title="Publicar">
            <p>Estado: <strong>{f.status === "published" ? "Publicado" : "Borrador"}</strong></p>
            <Button variant="outline" size="sm" disabled={busy || !canSave} onClick={() => save.mutate("draft")}>Guardar borrador</Button>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? <button type="button" className="text-sm text-destructive underline underline-offset-2" disabled={busy}
                onClick={() => { if (window.confirm("¿Eliminar este recinto? Los eventos enlazados quedarán sin recinto.")) trash.mutate(); }}>Eliminar</button> : <span />}
              <Button disabled={busy || !canSave} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{f.status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
          </Box>

          <Box title="Imagen destacada">
            <ImageField id="venue-cover" compact value={f.image_url} onChange={(v) => set("image_url", v)} />
            <Field id="v-alt" label="Texto alternativo" value={f.image_alt} onChange={(v) => set("image_alt", v)} placeholder="Describe la imagen" />
          </Box>

          <Box title="Tipo y aforo">
            <div className="space-y-1"><Label htmlFor="v-cat">Tipo</Label>
              <select id="v-cat" value={f.category} onChange={(e) => set("category", e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {Object.entries(VENUE_CATEGORY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <Field id="v-catl" label="Etiqueta visible" value={f.category_label} onChange={(v) => set("category_label", v)} placeholder="Estadio de béisbol" />
            <div className="grid grid-cols-2 gap-2">
              <Field id="v-cap" label="Capacidad" type="number" value={f.capacity} onChange={(v) => set("capacity", v)} />
              <Field id="v-year" label="Inaugurado" type="number" value={f.year_built} onChange={(v) => set("year_built", v)} />
            </div>
          </Box>

          <Box title="Ubicación">
            <Field id="v-addr" label="Dirección" value={f.address} onChange={(v) => set("address", v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field id="v-city" label="Ciudad o sector" value={f.city} onChange={(v) => set("city", v)} />
              <Field id="v-prov" label="Provincia" value={f.province} onChange={(v) => set("province", v)} />
            </div>
            <Button type="button" variant="outline" size="sm" disabled={locating || !(f.address || f.city)} onClick={() => void locate()}>
              {locating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <MapPin className="mr-1.5 h-4 w-4" />}Buscar en el mapa
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Field id="v-lat" label="Latitud" type="decimal" value={f.latitude} onChange={(v) => set("latitude", v)} />
              <Field id="v-lng" label="Longitud" type="decimal" value={f.longitude} onChange={(v) => set("longitude", v)} />
            </div>
            {hasPoint ? (
              <iframe title="Mapa del recinto" loading="lazy" className="h-48 w-full rounded border border-border"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`} />
            ) : <p className="text-xs text-muted-foreground">Con latitud y longitud se muestra aquí el mapa.</p>}
            <Field id="v-map" label="Enlace de Google Maps" type="url" value={f.map_url} onChange={(v) => set("map_url", v)} hint="Opcional: para el botón «Cómo llegar»." />
          </Box>

          <Box title="Contacto">
            <Field id="v-phone" label="Teléfono" value={f.phone} onChange={(v) => set("phone", v)} />
            <Field id="v-mail" label="Correo" type="email" value={f.email} onChange={(v) => set("email", v)} />
            <Field id="v-web" label="Sitio web" type="url" value={f.website} onChange={(v) => set("website", v)} />
          </Box>
        </aside>
      </div>
    </div>
  );
}
