// Ficha de municipio o destino, con la disposición del editor de noticias: contenido a la izquierda; Publicar, Imagen,
// Ubicación y Coordenadas a la derecha. El destino se ubica con LocationPicker (provincia > municipio).
import { useMemo, useState } from "react";
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
import { EditorAutosaveStrip } from "./DraftAutosaveBar";
import { buildAutoDraftSlug, useDraftAutosave } from "./useDraftAutosave";
import { confirmAction } from "./confirmAction";

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

  const placeSnapshot = useMemo(
    () => ({ f, flag, loc, highlights, gallery, slugTouched }),
    [f, flag, loc, highlights, gallery, slugTouched],
  );

  const buildPayload = (snap: typeof placeSnapshot, status: string, fallback = false) => {
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const safeName = fallback ? snap.f.name.trim() || `${noun.one} borrador` : snap.f.name;
    const safeSlug = fallback ? buildAutoDraftSlug(safeName, snap.f.slug, noun.one.toLowerCase()) : snap.f.slug;
    const derivedProv =
      snap.loc.province_id ||
      (snap.loc.municipality_id ? s(t.municipalities.find((m) => m.id === snap.loc.municipality_id)?.province_id) : "");
    return {
      ...Object.fromEntries(Object.entries(snap.f).map(([k, v]) => [k, v || null])),
      name: safeName || null,
      slug: safeSlug || null,
      status,
      latitude: num(snap.f.latitude), longitude: num(snap.f.longitude),
      highlights: snap.highlights.split("\n").map((x) => x.trim()).filter(Boolean),
      gallery: snap.gallery,
      province_id: derivedProv || null,
      ...(kind === "municipalities"
        ? { is_capital: snap.flag, population: num(snap.f.population) }
        : { is_popular: snap.flag, municipality_id: snap.loc.municipality_id || null }),
    };
  };

  const autosave = useDraftAutosave({
    resource: kind,
    itemId: id,
    status: f.status,
    snapshot: placeSnapshot,
    title: f.name,
    serverUpdatedAt: row === "new" ? null : (row.updated_at as string | null),
    onRestore: (snap) => {
      setF(snap.f); setFlag(snap.flag); setLoc(snap.loc);
      setHighlights(snap.highlights); setGallery(snap.gallery); setSlugTouched(snap.slugTouched);
    },
    onPromoted: (saved) => {
      setId(saved.id);
      setSlugTouched(true);
      setF((x) => ({ ...x, name: x.name.trim() || `${noun.one} borrador`, slug: x.slug.trim() || saved.slug || x.slug, status: "draft" }));
      void qc.invalidateQueries({ queryKey: ["staging", kind] });
    },
    getServerDraftBlocker: (snap) =>
      snap.loc.province_id || snap.loc.municipality_id ? null : "Elige una provincia para guardar el auto-borrador en el servidor.",
    onServerAutoDraft: async (snap, effectiveId) => {
      const targetId = effectiveId ?? id;
      const body = buildPayload(snap, "draft", true);
      const saved = (await fetchApi<{ data: Row }>(`/admin/${kind}${targetId ? `/${targetId}` : ""}`, {
        method: targetId ? "PUT" : "POST",
        body: JSON.stringify(body),
      })).data;
      setId(saved.id);
      setF((x) => ({ ...x, name: x.name.trim() || String(body.name ?? ""), slug: x.slug.trim() || String(saved.slug ?? body.slug ?? ""), status: "draft" }));
      void qc.invalidateQueries({ queryKey: ["staging", kind] });
      return { id: saved.id, slug: String(saved.slug ?? ""), updated_at: saved.updated_at as string | undefined };
    },
    onManualSave: () => {
      if (!save.isPending && !trash.isPending && ready) save.mutate(f.status === "published" ? "published" : "draft");
    },
  });

  const save = useMutation({
    mutationFn: async (status: string) => {
      const targetId = (await autosave.settledId()) ?? id;
      const body = buildPayload(placeSnapshot, status);
      return (await fetchApi<{ data: Row }>(`/admin/${kind}${targetId ? `/${targetId}` : ""}`, { method: targetId ? "PUT" : "POST", body: JSON.stringify(body) })).data;
    },
    onSuccess: (saved, status) => {
      setId(saved.id); setF((x) => ({ ...x, status }));
      autosave.markSavedClean(saved.id);
      void qc.invalidateQueries({ queryKey: ["staging", kind] });
      toast.success(status === "published" ? `${noun.one[0].toUpperCase()}${noun.one.slice(1)} publicado` : "Borrador guardado", { action: { label: noun.add, onClick: onNew } });
    },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const trash = useMutation({
    mutationFn: () => fetchApi(`/admin/${kind}/${autosave.effectiveId ?? id}`, { method: "DELETE" }),
    onSuccess: () => { autosave.markSavedClean(id); toast.success("Eliminado"); void qc.invalidateQueries({ queryKey: ["staging", kind] }); onClose(); },
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

      <EditorAutosaveStrip autosave={autosave} itemLabel={`este ${noun.one}`} />

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
                onClick={async () => { if (await confirmAction(`¿Eliminar este ${noun.one}?`)) trash.mutate(); }}>Eliminar</button> : <span />}
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
