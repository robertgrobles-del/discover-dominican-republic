// Paso «Fotos y menú» del registro de negocios: cada archivo se sube al elegirlo (POST /establishments/files)
// y el formulario solo envía sus ids. Fotos a WebP en el navegador; el menú en PDF tal cual.
import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { IMAGE_ACCEPT, toBase64, toWebp } from "@/lib/stagingMedia";

export interface Archivo { id: string; url: string; nombre: string }
export const MAX_FOTOS = 8;
const MAX_MENU_BYTES = 2.5 * 1024 * 1024; // mismo límite que el servidor (MAX_MENU_BYTES en api/index.ts)

const mensaje = (e: unknown) =>
  (e instanceof HttpError ? (e.details as { error?: { message?: string } } | null)?.error?.message : null) ?? (e instanceof Error ? e.message : "No se pudo subir el archivo");

async function subir(kind: "photo" | "menu", blob: Blob, nombre: string): Promise<Archivo> {
  const res = await fetchApi<{ data: { id: string; url: string } }>("/establishments/files", {
    method: "POST",
    body: JSON.stringify({ kind, data: await toBase64(blob) }),
  });
  return { ...res.data, nombre };
}

interface Props {
  fotos: Archivo[];
  onFotos: (f: Archivo[]) => void;
  menu: Archivo | null;
  onMenu: (m: Archivo | null) => void;
  /** Restaurantes, bares y cafés pueden adjuntar su menú. */
  conMenu: boolean;
}

export function ArchivosNegocio({ fotos, onFotos, menu, onMenu, conMenu }: Props) {
  const [subiendo, setSubiendo] = useState<"photo" | "menu" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fotosRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLInputElement>(null);

  const agregarFotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setSubiendo("photo");
    const nuevas = [...fotos];
    try {
      for (const file of Array.from(files).slice(0, MAX_FOTOS - fotos.length)) {
        const { blob } = await toWebp(file);
        nuevas.push(await subir("photo", blob, file.name));
        onFotos([...nuevas]);
      }
      if (files.length > MAX_FOTOS - fotos.length) setError(`Puedes subir hasta ${MAX_FOTOS} fotos.`);
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setSubiendo(null);
    }
  };

  const agregarMenu = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.type !== "application/pdf") return setError("El menú debe ser un archivo PDF.");
    if (file.size > MAX_MENU_BYTES) return setError("El menú supera los 2,5 MB. Comprímelo o exporta el PDF con menos resolución.");
    setSubiendo("menu");
    try {
      onMenu(await subir("menu", file, file.name));
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setSubiendo(null);
    }
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="fotos-h">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="fotos-h" className="text-base font-semibold">Fotos del negocio</h3>
          <p className="text-sm text-muted-foreground">{fotos.length} de {MAX_FOTOS} · la primera será la portada</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Fachada, interior, platos, habitaciones o actividades. JPG, PNG o WebP; las reducimos automáticamente.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fotos.map((f, i) => (
            <li key={f.id} className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
              <img src={f.url} alt={`Foto ${i + 1}: ${f.nombre}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 bg-foreground px-1.5 py-0.5 text-xs font-medium text-background">Portada</span>}
              <button type="button" onClick={() => onFotos(fotos.filter((x) => x.id !== f.id))} aria-label={`Quitar ${f.nombre}`}
                className="absolute right-1.5 top-1.5 bg-background/90 p-1 text-foreground hover:bg-background">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {fotos.length < MAX_FOTOS && (
            <li>
              <button type="button" onClick={() => fotosRef.current?.click()} disabled={subiendo !== null}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-60">
                {subiendo === "photo" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-5 w-5" aria-hidden="true" />}
                {subiendo === "photo" ? "Subiendo…" : "Añadir fotos"}
              </button>
            </li>
          )}
        </ul>
        <input ref={fotosRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden"
          onChange={(e) => { void agregarFotos(e.target.files); e.target.value = ""; }} />
      </section>

      {conMenu && (
        <section aria-labelledby="menu-h">
          <h3 id="menu-h" className="text-base font-semibold">Menú o carta (PDF)</h3>
          <p className="mt-1 text-sm text-muted-foreground">Los visitantes podrán abrirlo desde su ficha. Máximo 2,5 MB.</p>
          {menu ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border p-3">
              <a href={menu.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-sm font-medium hover:underline">
                <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{menu.nombre}</span>
              </a>
              <Button type="button" variant="ghost" size="sm" onClick={() => onMenu(null)}>Quitar</Button>
            </div>
          ) : (
            <Button type="button" variant="outline" className="mt-3 gap-2" onClick={() => menuRef.current?.click()} disabled={subiendo !== null}>
              {subiendo === "menu" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
              {subiendo === "menu" ? "Subiendo…" : "Subir menú en PDF"}
            </Button>
          )}
          <input ref={menuRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { void agregarMenu(e.target.files?.[0]); e.target.value = ""; }} />
        </section>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Las fotos y el menú son opcionales, pero las fichas con fotos reciben muchas más visitas. Solo sube imágenes propias o con permiso para usarlas.</p>
    </div>
  );
}
