// Secciones editoriales de identidad provincial (datos en src/data/provinceIdentity.ts).
// Se reutilizan entre provincias: cada una solo cambia sus datos y su color (.dest-theme).
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, Landmark, MapPin, Route, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ATLANTIC_ROUTE, type ProvinceIdentity } from "@/data/provinceIdentity";

const AtlanticRouteMap = lazy(() => import("./AtlanticRouteMap"));

function Eyebrow({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}

export function ProvinceIdentityIntro({ name, identity }: { name: string; identity: ProvinceIdentity }) {
  return (
    <section className="py-14 bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <Eyebrow icon={Sparkles}>{name}</Eyebrow>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{identity.tagline}</h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{identity.intro}</p>
      </div>
    </section>
  );
}

export function ProvinceThemes({ identity }: { identity: ProvinceIdentity }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 space-y-10">
        {identity.themes.map((t, i) => (
          <article id={t.id} key={t.id} className={`scroll-mt-20 grid gap-8 items-center ${t.image ? "lg:grid-cols-2" : ""}`}>
            {t.image && (
              <img src={t.image} alt={t.title} loading="lazy" className={`aspect-[16/10] w-full rounded-3xl object-cover border border-border shadow-lg ${i % 2 ? "lg:order-2" : ""}`} />
            )}
            <div className={t.image ? "" : "rounded-3xl border border-primary/20 bg-primary/5 p-8 md:p-10"}>
              <Eyebrow icon={Landmark}>{t.eyebrow}</Eyebrow>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{t.text}</p>
              {t.facts && (
                <ul className="space-y-2">
                  {t.facts.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-foreground"><Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProvinceMunicipalities({ name, identity }: { name: string; identity: ProvinceIdentity }) {
  return (
    <section id="municipios" className="py-16 bg-muted/25 border-y border-border/60 scroll-mt-20">
      <div className="container mx-auto px-4">
        <Eyebrow icon={MapPin}>Municipios</Eyebrow>
        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-8">Qué identifica a cada rincón de {name}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {identity.municipalities.map((m) => (
            <article key={m.name} className="bg-card rounded-2xl p-6 border border-border/70 hover:border-primary/40 transition-all flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-xl font-bold text-foreground">{m.name}</h3>
                {m.role && <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{m.role}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.identity}</p>
              <ul className="space-y-1.5 mb-4">
                {m.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-foreground"><Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{h}</li>
                ))}
              </ul>
              {m.slug && (
                <Link to={`/destino/${m.slug}`} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Explorar {m.name} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProvinceTravelerFilter({ identity }: { identity: ProvinceIdentity }) {
  const [active, setActive] = useState(0);
  const tag = identity.travelerTags[active];
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Eyebrow icon={Compass}>Según tu estilo de viaje</Eyebrow>
        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-6">¿Qué tipo de viajero eres?</h2>
        <div role="tablist" aria-label="Tipo de viajero" className="flex flex-wrap gap-2 mb-6">
          {identity.travelerTags.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${i === active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ul role="tabpanel" className="grid sm:grid-cols-3 gap-4">
          {tag.places.map((p) => (
            <li key={p} className="rounded-2xl border border-border/70 bg-card p-5 font-semibold text-foreground">{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AtlanticRoute({ currentProvince }: { currentProvince: string }) {
  return (
    <section id="ruta-atlantico" className="py-16 bg-muted/25 border-y border-border/60 scroll-mt-20">
      <div className="container mx-auto px-4">
        <Eyebrow icon={Route}>Bulevar Turístico del Atlántico</Eyebrow>
        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">De Río San Juan a Las Galeras por carretera</h2>
        <p className="text-muted-foreground mb-8 max-w-3xl">María Trinidad Sánchez y Samaná se recorren de forma fluida por la costa. El Aeropuerto Internacional El Catey (AZS) es la puerta de entrada directa a la zona.</p>
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] items-start">
        <Suspense fallback={<div className="h-[420px] rounded-3xl bg-muted animate-pulse" />}>
          <AtlanticRouteMap currentProvince={currentProvince} />
        </Suspense>
        <ol className="relative border-s-2 border-primary/30 ms-3 space-y-5">
          {ATLANTIC_ROUTE.map((stop, i) => {
            const here = stop.province === currentProvince;
            return (
              <li key={stop.name} className="ms-6">
                <span className={`absolute -start-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-background ${here ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <p className={`font-display font-bold ${here ? "text-foreground" : "text-muted-foreground"}`}>{i + 1}. {stop.name}</p>
                <p className="text-sm text-muted-foreground">{stop.note}</p>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </section>
  );
}

export function PhotoCredits({ credits }: { credits: string[] }) {
  if (!credits.length) return null;
  return (
    <p className="container mx-auto px-4 py-6 text-xs text-muted-foreground">
      Fotos vía Wikimedia Commons: {credits.join(" · ")}.
    </p>
  );
}
