// Biblioteca de medios del panel (como la de WordPress): todas las imágenes subidas, en cuadrícula, para elegir una
// al publicar o para gestionarlas (texto alternativo, borrar las que no se usan). Subir aquí también las convierte a WebP.
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ImagePlus, Loader2, Search, Trash2, X } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/stagingMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MediaItem { id: string; url: string; alt: string | null; width: number | null; height: number | null; size: number; created_at: string }

const queryKey = ["staging", "media"];
const apiMessage = (e: unknown) => (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "Error");
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** Cuadrícula de la biblioteca. Con `onSelect` funciona como selector; sin él, como pantalla de gestión. */
export function MediaLibrary({ onSelect }: { onSelect?: (item: MediaItem) => void }) {
  const qc = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({ queryKey, queryFn: async () => (await fetchApi<{ data: MediaItem[] }>("/admin/media")).data });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setAlt(selected?.alt ?? ""), [selected]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((m) => (m.alt ?? "").toLowerCase().includes(t)) : items;
  }, [items, q]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(files.length);
    let last: string | null = null;
    for (const file of Array.from(files)) {
      try { last = await uploadImage(file, file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")); }
      catch (e) { toast.error(`${file.name}: ${e instanceof Error ? e.message : "no se pudo subir"}`); }
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
    const fresh = (await qc.fetchQuery({ queryKey, queryFn: async () => (await fetchApi<{ data: MediaItem[] }>("/admin/media")).data }));
    if (last) setSelected(fresh.find((m) => m.url === last) ?? null);
  };

  const saveAlt = useMutation({
    mutationFn: () => fetchApi(`/admin/media/${selected!.id}`, { method: "PATCH", body: JSON.stringify({ alt }) }),
    onSuccess: () => { toast.success("Texto alternativo guardado"); void qc.invalidateQueries({ queryKey }); },
    onError: (e) => toast.error(apiMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/media/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Imagen eliminada"); setSelected(null); void qc.invalidateQueries({ queryKey }); },
    onError: (e) => toast.error(apiMessage(e)),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
            {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1.5 h-4 w-4" />}
            {uploading ? `Subiendo (${uploading})…` : "Subir imágenes"}
          </Button>
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descripción" aria-label="Buscar imágenes" className="h-9 w-56 pl-8" />
          </div>
        </div>
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : error ? (
          <p role="alert" className="text-sm text-destructive">No se pudo cargar: {apiMessage(error)}</p>
        ) : !shown.length ? (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {items.length ? "Ninguna imagen coincide con la búsqueda." : "Todavía no hay imágenes. Sube la primera."}
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" aria-label="Imágenes">
            {shown.map((m) => {
              const isSel = selected?.id === m.id;
              return (
                <li key={m.id}>
                  <button type="button" onClick={() => setSelected(m)} aria-pressed={isSel} title={m.alt ?? "Sin descripción"}
                    className={`relative block aspect-square w-full overflow-hidden rounded-md border-2 ${isSel ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}>
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover" />
                    {isSel && <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="space-y-3 rounded-md border border-border bg-muted/30 p-4 text-sm">
        {selected ? (
          <>
            <img src={selected.url} alt="" className="w-full rounded-md border border-border" />
            <p className="text-xs text-muted-foreground">
              {selected.width && selected.height ? `${selected.width} × ${selected.height} px · ` : ""}{kb(selected.size)} · WebP<br />
              {new Date(selected.created_at).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <div className="space-y-1">
              <label htmlFor="media-alt" className="text-xs font-medium">Texto alternativo</label>
              <Input id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe la imagen" />
              <Button size="sm" variant="outline" disabled={saveAlt.isPending || alt === (selected.alt ?? "")} onClick={() => saveAlt.mutate()}>Guardar descripción</Button>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <button type="button" className="inline-flex items-center gap-1 text-xs text-destructive underline underline-offset-2 disabled:opacity-50" disabled={remove.isPending}
                onClick={() => { if (window.confirm("¿Eliminar esta imagen de forma permanente?")) remove.mutate(selected.id); }}>
                <Trash2 className="h-3.5 w-3.5" />Eliminar
              </button>
              {onSelect && <Button size="sm" onClick={() => onSelect({ ...selected, alt: alt || selected.alt })}>Usar esta imagen</Button>}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Elige una imagen para ver sus detalles{onSelect ? " y usarla" : ""}.</p>
        )}
      </aside>
    </div>
  );
}

/** La biblioteca en una ventana, para elegir una imagen desde un formulario. */
export function MediaPicker({ open, onClose, onSelect, title = "Biblioteca de medios" }: { open: boolean; onClose: () => void; onSelect: (item: MediaItem) => void; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 overflow-y-auto p-4">
      <button type="button" aria-label="Cerrar biblioteca" className="fixed inset-0 cursor-default bg-black/60" onClick={onClose} />
      <div className="relative mx-auto max-w-5xl rounded-xl bg-background p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button size="icon" variant="ghost" aria-label="Cerrar" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <MediaLibrary onSelect={(m) => { onSelect(m); onClose(); }} />
      </div>
    </div>
  );
}
