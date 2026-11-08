// Editor del cuerpo al estilo del editor clásico de WordPress: «Añadir medios», pestañas Visual/Texto, selector de
// párrafo y barra de formatos. Visual es TipTap (se escribe viendo el formato); Texto es el Markdown que se guarda.
// Solo hay formatos que el Markdown conserva: sin colores ni alineaciones, para que todas las noticias se vean igual.
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { toast } from "sonner";
import { Bold, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Undo2, Unlink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker, type MediaItem } from "./MediaLibrary";
import { ContentLinkDialog } from "./ContentLinkDialog";

const getMarkdown = (editor: Editor) => (editor.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();

export function ClassicEditor({ id, value, onChange }: { id: string; value: string; onChange: (markdown: string) => void }) {
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const [library, setLibrary] = useState(false);
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; url: string; text: string }>({
    open: false,
    url: "",
    text: "",
  });
  const last = useRef(value); // último Markdown emitido, para no reescribir el editor con su propio cambio

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        validate: (href) => Boolean(href && /^(\/|https?:\/\/|mailto:|tel:)/i.test(href)),
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Escribe la noticia…" }),
      Markdown.configure({ html: false, linkify: true, breaks: false, transformPastedText: true }),
    ],
    content: value,
    editorProps: { attributes: { id, "aria-label": "Cuerpo de la noticia", class: "text-base" } },
    onUpdate: ({ editor: e }) => { last.current = getMarkdown(e); onChange(last.current); },
  });

  // Cambio desde fuera (otra pestaña de idioma, traducción con IA, pestaña Texto): se carga en el visual.
  useEffect(() => {
    if (editor && value !== last.current) { last.current = value; editor.commands.setContent(value, false); }
  }, [editor, value]);

  /** Imagen elegida (o subida) en la biblioteca: se inserta donde está el cursor, con su texto alternativo. */
  const insertMedia = (item: MediaItem) => {
    const alt = item.alt ?? "";
    const caption = window.prompt("Pie de foto (opcional, p. ej. «Foto: Ana Pérez»):", "") ?? "";
    if (mode === "visual" && editor) editor.chain().focus().setImage({ src: item.url, alt, title: caption || undefined }).run();
    else onChange(`${value}\n\n![${alt.replace(/[[\]]/g, "")}](${item.url}${caption ? ` "${caption.replace(/"/g, "'")}"` : ""})\n`);
  };

  const setLink = () => {
    if (mode === "visual" && editor) {
      const prev = (editor.getAttributes("link").href as string) || "";
      const { from, to } = editor.state.selection;
      const selected = editor.state.doc.textBetween(from, to, " ") || "";
      setLinkDialog({ open: true, url: prev, text: selected });
    } else {
      setLinkDialog({ open: true, url: "", text: "" });
    }
  };

  const handleLinkConfirm = ({ url: targetUrl, text: label, openInNewTab }: { url: string; text?: string; openInNewTab?: boolean }) => {
    if (mode === "visual" && editor) {
      const chain = editor.chain().focus();
      if (label && editor.state.selection.empty) {
        chain.insertContent(`<a href="${targetUrl}"${openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`);
      } else {
        chain.extendMarkRange("link").setLink({
          href: targetUrl,
          target: openInNewTab ? "_blank" : undefined,
        });
      }
      chain.run();
    } else {
      const linkMarkdown = `[${label || "enlace"}](${targetUrl})`;
      onChange(`${value}\n${linkMarkdown}\n`);
    }
  };

  const block = !editor ? "p" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p";
  const setBlock = (v: string) => {
    if (!editor) return;
    const c = editor.chain().focus();
    (v === "p" ? c.setParagraph() : c.toggleHeading({ level: v === "h2" ? 2 : 3 })).run();
  };

  const btn = (active = false) =>
    `inline-flex h-8 w-8 items-center justify-center rounded border text-foreground/80 hover:bg-muted disabled:opacity-40 ${active ? "border-border bg-muted text-foreground" : "border-transparent"}`;
  const tools: { label: string; icon: typeof Bold; run: () => void; active?: boolean }[] = editor ? [
    { label: "Negrita (Ctrl+B)", icon: Bold, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { label: "Cursiva (Ctrl+I)", icon: Italic, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "Lista", icon: List, run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "Lista numerada", icon: ListOrdered, run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "Cita", icon: Quote, run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { label: "Insertar o editar enlace", icon: Link2, run: setLink, active: editor.isActive("link") },
    { label: "Quitar enlace", icon: Unlink, run: () => editor.chain().focus().unsetLink().run() },
    { label: "Separador", icon: Minus, run: () => editor.chain().focus().setHorizontalRule().run() },
    { label: "Deshacer (Ctrl+Z)", icon: Undo2, run: () => editor.chain().focus().undo().run() },
    { label: "Rehacer", icon: Redo2, run: () => editor.chain().focus().redo().run() },
  ] : [];

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <button type="button" onClick={() => setLibrary(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/60 bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5">
          <ImagePlus className="h-4 w-4" />Añadir medios
        </button>
        <MediaPicker open={library} onClose={() => setLibrary(false)} onSelect={insertMedia} title="Añadir medios" />
        <ContentLinkDialog
          open={linkDialog.open}
          onClose={() => setLinkDialog((prev) => ({ ...prev, open: false }))}
          onSelect={handleLinkConfirm}
          initialUrl={linkDialog.url}
          initialText={linkDialog.text}
        />
        <div role="tablist" aria-label="Modo de edición" className="flex">
          {(["visual", "text"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className={`-mb-px rounded-t-md border px-3 py-1.5 text-sm ${mode === m ? "border-border border-b-background bg-background font-medium" : "border-transparent bg-muted/60 text-muted-foreground hover:text-foreground"}`}>
              {m === "visual" ? "Visual" : "Texto"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        {mode === "visual" ? (
          <>
            <div role="toolbar" aria-label="Formato" className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
              <select aria-label="Tipo de bloque" value={block} onChange={(e) => setBlock(e.target.value)}
                className="h-8 rounded border border-border bg-background px-2 text-sm">
                <option value="p">Párrafo</option><option value="h2">Encabezado 2</option><option value="h3">Encabezado 3</option>
              </select>
              {tools.map(({ label, icon: Icon, run, active }) => (
                <button key={label} type="button" title={label} aria-label={label} aria-pressed={active} className={btn(active)} onClick={run}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="wp-visual"><EditorContent editor={editor} /></div>
          </>
        ) : (
          <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={18}
            className="rounded-none border-0 font-mono text-sm focus-visible:ring-0" aria-label="Cuerpo de la noticia (Markdown)" />
        )}
      </div>
    </div>
  );
}
