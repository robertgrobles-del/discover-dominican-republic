// Cuerpo de una noticia escrito en Markdown. Solo los formatos de la barra del editor tienen estilo;
// skipHtml descarta cualquier HTML pegado, así nadie mete scripts ni estilos sueltos.
import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => <h2 className="mt-8 mb-3 font-display text-2xl font-bold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 font-display text-xl font-semibold text-foreground">{children}</h3>,
  p: ({ children }) => <p className="my-4 leading-relaxed text-foreground/90">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6">{children}</ol>,
  blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-primary bg-primary/5 py-2 pl-4 italic text-foreground/80">{children}</blockquote>,
  // Externos en otra pestaña; los del propio sitio, en la misma.
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href ?? "") && !(href ?? "").includes("descubrerepdom.com");
    return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="font-medium text-primary underline underline-offset-4">{children}</a>;
  },
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  hr: () => <hr className="my-8 border-border" />,
  // La imagen con título ("…") lleva pie de foto; el texto alternativo describe la imagen.
  img: ({ src, alt, title }) => (
    <figure className="my-6">
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="w-full rounded-2xl border border-border object-cover" />
      {title && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{title}</figcaption>}
    </figure>
  ),
};

export function NewsBody({ markdown }: { markdown: string }) {
  return <div className="max-w-none text-base"><ReactMarkdown skipHtml components={components}>{markdown}</ReactMarkdown></div>;
}
