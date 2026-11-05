// Editor del cuerpo de la noticia: barra de formatos que escribe Markdown por quien edita, subida de imágenes
// (convertidas a WebP) y vista previa con el mismo aspecto que tendrá publicada.
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Minus, Quote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { IMAGE_ACCEPT, uploadImage } from "@/lib/stagingMedia";
import { NewsBody } from "./NewsBody";

type Edit = { wrap?: [string, string]; line?: string; insert?: string; placeholder: string };

const TOOLS: { label: string; icon: typeof Bold; edit: Edit }[] = [
  { label: "Negrita", icon: Bold, edit: { wrap: ["**", "**"], placeholder: "texto en negrita" } },
  { label: "Cursiva", icon: Italic, edit: { wrap: ["_", "_"], placeholder: "texto en cursiva" } },
  { label: "Subtítulo", icon: Heading2, edit: { line: "## ", placeholder: "Subtítulo" } },
  { label: "Subtítulo menor", icon: Heading3, edit: { line: "### ", placeholder: "Subtítulo menor" } },
  { label: "Lista", icon: List, edit: { line: "- ", placeholder: "elemento" } },
  { label: "Lista numerada", icon: ListOrdered, edit: { line: "1. ", placeholder: "paso" } },
  { label: "Cita", icon: Quote, edit: { line: "> ", placeholder: "cita" } },
  { label: "Separador", icon: Minus, edit: { insert: "\n\n---\n\n", placeholder: "" } },
];

export function MarkdownEditor({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);

  /** Aplica un formato a la selección (o a un texto de ejemplo) y deja el cursor donde corresponde. */
  const apply = (edit: Edit) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: a, selectionEnd: b } = ta;
    const selected = value.slice(a, b) || edit.placeholder;
    let text: string;
    if (edit.wrap) text = `${edit.wrap[0]}${selected}${edit.wrap[1]}`;
    else if (edit.line) {
      const atLineStart = a === 0 || value[a - 1] === "\n";
      text = (atLineStart ? "" : "\n") + selected.split("\n").map((l) => edit.line + l).join("\n");
    } else text = edit.insert ?? "";
    const next = value.slice(0, a) + text + value.slice(b);
    onChange(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(a + text.length, a + text.length); });
  };

  const addLink = () => {
    const url = window.prompt("Dirección del enlace (https://…):");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return void toast.error("El enlace debe empezar por http:// o https://");
    const ta = ref.current!;
    const label = value.slice(ta.selectionStart, ta.selectionEnd) || "texto del enlace";
    apply({ insert: `[${label}](${url})`, placeholder: "" });
  };

  const addImage = async (file: File | undefined) => {
    if (!file) return;
    const alt = window.prompt("Describe la imagen (texto alternativo, para accesibilidad):", "") ?? "";
    const caption = window.prompt("Pie de foto (opcional, p. ej. «Foto: Ana Pérez»):", "") ?? "";
    setUploading(true);
    try {
      const url = await uploadImage(file, alt);
      const title = caption.trim() ? ` "${caption.replace(/"/g, "'")}"` : "";
      apply({ insert: `\n\n![${alt.replace(/[[\]]/g, "")}](${url}${title})\n\n`, placeholder: "" });
      toast.success("Imagen añadida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const btn = "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40";
  return (
    <div className="overflow-hidden rounded-md border border-input">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1">
        <div role="toolbar" aria-label="Formato del texto" className="flex flex-wrap gap-0.5">
          {TOOLS.map(({ label, icon: Icon, edit }) => (
            <button key={label} type="button" title={label} aria-label={label} className={btn} disabled={tab === "preview"} onClick={() => apply(edit)}><Icon className="h-4 w-4" /></button>
          ))}
          <button type="button" title="Enlace" aria-label="Enlace" className={btn} disabled={tab === "preview"} onClick={addLink}><Link2 className="h-4 w-4" /></button>
          <button type="button" title="Imagen" aria-label="Insertar imagen" className={btn} disabled={tab === "preview" || uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </button>
          <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => void addImage(e.target.files?.[0])} />
        </div>
        <div className="ml-auto flex rounded-md bg-background p-0.5 text-xs" role="tablist" aria-label="Modo">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`rounded px-2.5 py-1 font-medium ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "write" ? "Escribir" : "Vista previa"}
            </button>
          ))}
        </div>
      </div>
      {tab === "write" ? (
        <Textarea id={id} ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={14}
          className="rounded-none border-0 font-mono text-sm focus-visible:ring-0"
          placeholder="Escribe la noticia. Selecciona texto y usa la barra para darle formato." />
      ) : (
        <div className="min-h-[20rem] bg-background p-5">{value.trim() ? <NewsBody markdown={value} /> : <p className="text-sm text-muted-foreground">Nada que mostrar todavía.</p>}</div>
      )}
    </div>
  );
}
