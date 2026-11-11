// Presentación de la provincia bajo la portada, en la línea de «Un viaje más allá de lo ordinario» de la portada del
// sitio. Tres composiciones para que cada provincia no se vea igual: abanico (texto y tarjetas en abanico), espejo (al
// revés) y mosaico (texto arriba en dos columnas y una foto grande con dos menores). Se elige en el panel o sale del slug.
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";

export type IntroLayout = "abanico" | "espejo" | "mosaico";
export const INTRO_LAYOUTS: [IntroLayout, string][] = [["abanico", "Texto y tarjetas en abanico"], ["espejo", "Tarjetas y texto (al revés)"], ["mosaico", "Texto arriba y mosaico de fotos"]];
export interface IntroCard { image: string; title: string; location?: string; tag?: string }

/** Composición estable por provincia cuando el panel no elige una. */
export const layoutFor = (slug: string, chosen?: string | null): IntroLayout => {
  if (chosen && INTRO_LAYOUTS.some(([k]) => k === chosen)) return chosen as IntroLayout;
  const h = [...slug].reduce((n, c) => n + c.charCodeAt(0), 0);
  return INTRO_LAYOUTS[h % INTRO_LAYOUTS.length][0];
};

function Card({ c, className, big }: { c: IntroCard; className: string; big?: boolean }) {
  return (
    <figure className={`group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl ${className}`}>
      <img src={c.image} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
      <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4">
        {c.tag && <span className={big ? "mb-2 w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground" : "text-xs font-semibold text-amber-200"}>{c.tag}</span>}
        <span className={`font-display font-bold leading-tight text-white ${big ? "text-base sm:text-lg" : "text-sm"}`}>{c.title}</span>
        {c.location && <span className="mt-0.5 flex items-center gap-1 text-xs text-white/80"><MapPin className="h-3 w-3" aria-hidden="true" />{c.location}</span>}
      </figcaption>
    </figure>
  );
}

export function ProvinceIntroSection({ name, tagline, lead, paragraphs, cards, layout }: {
  name: string; tagline?: string; lead?: string; paragraphs: string[]; cards: IntroCard[]; layout: IntroLayout;
}) {
  const reduce = useReducedMotion();
  if (!lead && !paragraphs.length) return null;
  const [a, b, c] = cards;
  // Un solo momento de movimiento: el bloque entra una vez al aparecer.
  const enter = reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6 } };

  const text = (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:text-5xl [text-wrap:balance]">
        {tagline ? `${tagline}: ` : "Descubre "}
        <span className="bg-gradient-to-r from-primary via-emerald-600 to-amber-500 bg-clip-text text-transparent dark:via-cyan-400 dark:to-amber-300">{name}</span>
      </h2>
      {lead && <p className="max-w-[65ch] text-base font-medium leading-relaxed text-foreground/90 sm:text-lg">{lead}</p>}
      {paragraphs.length > 0 && (
        <div className={`space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base ${layout === "mosaico" ? "md:columns-2 md:gap-10 md:space-y-0 [&>p]:mb-4 [&>p]:break-inside-avoid" : "max-w-[65ch]"}`}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  );

  const fan = a && (
    <div className="relative mx-auto h-[400px] w-full max-w-[520px] sm:h-[460px]" aria-label={`Lugares de ${name}`} role="group">
      {b && <div className="absolute left-0 top-8 z-10 h-[260px] w-[46%] -rotate-6 sm:h-[310px]"><Card c={b} className="relative h-full" /></div>}
      <div className="absolute left-1/2 top-0 z-20 h-[340px] w-[52%] -translate-x-1/2 sm:h-[400px]"><Card c={a} big className="relative h-full border-2 border-primary/50 shadow-2xl shadow-primary/10" /></div>
      {c && <div className="absolute bottom-0 right-0 z-30 h-[260px] w-[46%] rotate-6 sm:h-[310px]"><Card c={c} className="relative h-full" /></div>}
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-background py-16 text-foreground lg:py-24" aria-labelledby="provincia-intro">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" aria-hidden="true" />
      <motion.div {...enter} className="container relative z-10 mx-auto px-4 lg:px-8" id="provincia-intro">
        {layout === "mosaico" ? (
          <div className="space-y-12">
            {text}
            {a && (
              <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2" role="group" aria-label={`Lugares de ${name}`}>
                <Card c={a} big className="relative h-64 sm:col-span-2 sm:row-span-2 sm:h-[440px]" />
                {b && <Card c={b} className="relative h-52 sm:h-auto" />}
                {c && <Card c={c} className="relative h-52 sm:h-auto" />}
              </div>
            )}
          </div>
        ) : (
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className={`lg:col-span-6 ${layout === "espejo" ? "lg:order-2" : ""}`}>{text}</div>
            <div className={`lg:col-span-6 ${layout === "espejo" ? "lg:order-1" : ""}`}>{fan}</div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
