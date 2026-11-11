// Ficha de municipio o destino, con la disposición del editor de noticias: contenido a la izquierda; Publicar, Imagen,
// Ubicación y Coordenadas a la derecha. El destino se ubica con LocationPicker (provincia > municipio).
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClassicEditor } from "./ClassicEditor";
import { ImageField } from "./StagingCrudManager";
import { Box } from "./NewsEditor";
import { PhotoList } from "./ProvinceEditor";
import { LocationPicker, useTerritory, type Location } from "./LocationPicker";
import { PLACE_NOUN, type PlaceKind } from "./PlaceList";

type Row = Record<string, unknown> & { id: string };
type Photo = { url: string; alt: string };
const SITE = "https://descubrerepdom.com";
const s = (v: unknown) => (v == null ? "" : String(v));
const toSlug = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const parse = <T,>(v: unknown): T[] => { try { const a = JSON.parse(String(v ?? "[]")); return Array.isArray(a) ? a : []; } catch { return []; } };
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const select = "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const KINDS: Record<PlaceKind, [string, string][]> = {
  municipalities: [["municipio", "Municipio"], ["distrito_municipal", "Distrito municipal"]],
  destinations: [["zona_turistica", "Zona turística"], ["ciudad", "Ciudad"], ["pueblo", "Pueblo"], ["sector", "Sector o barrio"], ["isla", "Isla o cayo"]],
};

export function PlaceEditor({ kind, row, onClose, onNew }: { kind: PlaceKind; row: Row | "new"; onClose: () => void; onNew: () => void }) {
  const qc = useQueryClient();
  const t = useTerritory();
  const noun = PLACE_NOUN[kind];
  const r: Record<string, unknown> = row === "new" ? {} : row;
  const [id, setId] = useState<string | null>(row === "new" ? null : row.id);
  const [f, setF] = useState(() => ({
    name: s(r.name), slug: s(r.slug), kind: s(r.kind) || KINDS[kind][0][0], short_description: s(r.short_description), description: s(r.description),
    image_url: s(r.image_url), image_alt: s(r.image_alt), latitude: s(r.latitude), longitude: s(r.longitude), population: s(r.population),
    seo_title: s(r.seo_title), seo_description: s(r.seo_description), status: s(r.status) || "draft",
  }));
  const [flag, setFlag] = useState(Boolean(kind === "municipalities" ? r.is_capital : r.is_popular));
  const [loc, setLoc] = useState<Location>({ province_id: s(r.province_id), municipality_id: s(r.municipality_id), destination_id: "" });
  const [highlights, setHighlights] = useState(() => parse<string>(r.highlights).join("\n"));
  const [gallery, setGallery] = useState<Photo[]>(() => parse<Photo>(r.gallery));
  const [slugTouched, setSlugTouched] = useState(row !== "new");
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v, ...(k === "name" && !slugTouched ? { slug: toSlug(v) } : {}) }));
  const provSlug = s(t.provinces.find((p) => p.id === loc.province_id)?.slug) || "<provincia>";

  const save = useMutation({
    mutationFn: async (status: string) => {
      const num = (v: string) => (v.trim() === "" ? null : Number(v));
      const body: Record<string, unknown> = {
        ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || null])), status,
        latitude: num(f.latitude), longitude: num(f.longitude), highlights: highlights.split("\n").map((x) => x.trim()).filter(Boolean), gallery,
        province_id: loc.province_id || null,
        ...(kind === "municipalities"
          ? { is_capital: flag, population: num(f.population) }
          : { is_popular: flag, municipality_id: loc.municipality_id || null }),
      };
      return (await fetchApi<{ data: Row }>(`/admin/${kind}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      void qc.invalidateQueries({ queryKey: ["staging", kind] });
      toast.success(status === "published" ? `${noun.one[0].toUpperCase()}${noun.one.slice(1)} publicado` : "Borrador guardado");
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/${kind}/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Eliminado"); void qc.invalidateQueries({ queryKey: ["staging", kind] }); onClose(); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const busy = save.isPending || trash.isPending;
  const ready = Boolean(f.name && f.slug && (loc.province_id || loc.municipality_id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft className="mr-1.5 h-4 w-4" />Todos los {noun.many.toLowerCase()}</Button>
        <h2 className="text-xl font-semibold">{id ? `Editar ${noun.one}` : noun.add}</h2>
        {id && <Button size="sm" variant="outline" className="border-primary text-primary" onClick={onNew}>{noun.add}</Button>}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={`Nombre del ${noun.one}`} aria-label="Nombre" className="h-12 text-xl font-semibold" />
          <p className="text-sm text-muted-foreground">
            Enlace permanente: {SITE}/{kind === "municipalities" ? `provincia/${provSlug}/` : "destino/"}
            <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", toSlug(e.target.value)); }} aria-label="Slug" className="rounded border border-input bg-background px-1 font-mono text-foreground" />
          </p>
          <ClassicEditor id={`${kind}-body`} value={f.description} onChange={(v) => set("description", v)} />
          <Box title="Resumen">
            <Textarea rows={3} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} aria-label="Resumen" />
            <p className="text-xs text-muted-foreground">Qué lo identifica, en una o dos frases. Sale en las tarjetas.</p>
          </Box>
          <Box title="Qué resaltar">
            <Textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} aria-label="Qué resaltar" placeholder={"Un punto por línea\nPlaya de arena blanca\nFiestas patronales en agosto"} />
          </Box>
          <Box title={`Galería (${gallery.length})`}><PhotoList items={gallery} onChange={setGallery} max={60} /></Box>
          <Box title="Buscadores (SEO)">
            <div className="space-y-1"><Label htmlFor="pl-seo-t">Título para buscadores</Label><Input id="pl-seo-t" value={f.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="pl-seo-d">Descripción para buscadores</Label><Textarea id="pl-seo-d" rows={2} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div>
          </Box>
        </div>

        {/* La barra lateral se queda fija y se desplaza por dentro: no crece más que la pantalla. */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <Box title="Publicar">
            <p>Estado: <strong>{f.status === "published" ? "Publicado" : "Borrador"}</strong></p>
            <Button variant="outline" size="sm" disabled={busy || !ready} onClick={() => save.mutate("draft")}>Guardar borrador</Button>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {id ? <button type="button" className="text-sm text-destructive underline underline-offset-2" disabled={busy}
                onClick={() => { if (window.confirm(`¿Eliminar este ${noun.one}?`)) trash.mutate(); }}>Eliminar</button> : <span />}
              <Button disabled={busy || !ready} onClick={() => save.mutate("published")}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}{f.status === "published" ? "Actualizar" : "Publicar"}
              </Button>
            </div>
          </Box>
          <Box title="Ubicación">
            {kind === "municipalities" ? (
              <div className="space-y-1"><Label htmlFor="pl-prov">Provincia</Label>
                <select id="pl-prov" className={select} value={loc.province_id} onChange={(e) => setLoc({ ...loc, province_id: e.target.value })}>
                  <option value="">— Elige la provincia —</option>
                  {t.provinces.map((p) => <option key={p.id} value={p.id}>{s(p.name)}</option>)}
                </select></div>
            ) : (
              // Un destino no está dentro de otro: el selector de destino no se usa aquí.
              <LocationPicker idPrefix="pl" value={loc} onChange={(v) => setLoc({ ...v, destination_id: "" })} />
            )}
          </Box>
          <Box title="Tipo">
            <select aria-label="Tipo" className={select} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
              {KINDS[kind].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
              {kind === "municipalities" ? "Cabecera de la provincia" : "Zona popular (sale primero)"}
            </label>
            {kind === "municipalities" && <div className="space-y-1"><Label htmlFor="pl-pop">Población</Label><Input id="pl-pop" inputMode="numeric" value={f.population} onChange={(e) => set("population", e.target.value)} /></div>}
          </Box>
          <Box title="Imagen destacada">
            <ImageField id={`${kind}-cover`} compact value={f.image_url} onChange={(v) => set("image_url", v)} />
            <Input value={f.image_alt} onChange={(e) => set("image_alt", e.target.value)} placeholder="Texto alternativo" aria-label="Texto alternativo" />
          </Box>
          <Box title="Coordenadas">
            <div className="grid grid-cols-2 gap-2">
              <Input inputMode="decimal" value={f.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Latitud" aria-label="Latitud" />
              <Input inputMode="decimal" value={f.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Longitud" aria-label="Longitud" />
            </div>
          </Box>
        </aside>
      </div>
    </div>
  );
}
