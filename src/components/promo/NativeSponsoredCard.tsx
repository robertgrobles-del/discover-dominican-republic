import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { safeAdUrl, trackAd, type NativeCreative } from "@/lib/sponsorshipApi";

/**
 * Anuncio nativo: ocupa el lugar de una tarjeta del listado y se parece a ellas, pero siempre lleva a la
 * vista la etiqueta de patrocinio. La impresión se cuenta una vez, cuando la tarjeta entra en pantalla.
 */
export function NativeSponsoredCard({ creative, page }: { creative: NativeCreative; page: string }) {
  const ref = useRef<HTMLElement>(null);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || counted.current) return;
    const count = () => { if (!counted.current) { counted.current = true; trackAd(creative, "impression", page); } };
    if (typeof IntersectionObserver === "undefined") { count(); return; }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { count(); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [creative, page]);

  const href = safeAdUrl(creative.target_url);
  if (!href) return null;
  const body = (
    <>
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {creative.image_url && <img src={creative.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
      </div>
      <div className="space-y-1 p-4">
        <span className="inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: "hsl(var(--sponsored-bg))", color: "hsl(var(--sponsored-fg))", borderColor: "hsl(var(--sponsored-border))" }}>{creative.badge_label || "Patrocinado"}</span>
        <h3 className="font-display text-lg font-bold leading-snug">{creative.headline || creative.title}</h3>
        {creative.body_text && <p className="line-clamp-2 text-sm text-muted-foreground">{creative.body_text}</p>}
      </div>
    </>
  );
  const className = "group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md";
  const onClick = () => trackAd(creative, "click", page);
  return (
    <article ref={ref} aria-label={`Contenido patrocinado: ${creative.title}`}>
      {href.startsWith("/")
        ? <Link to={href} className={className} onClick={onClick}>{body}</Link>
        : <a href={href} target="_blank" rel="sponsored noopener noreferrer" className={className} onClick={onClick}>{body}</a>}
    </article>
  );
}
