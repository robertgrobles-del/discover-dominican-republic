import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Compass,
  Map,
  MapPin,
  ShieldCheck,
  Waves,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent } from "@/lib/pageContent";

const seasonalIdeas = [
  {
    period: "Enero – marzo",
    title: "Naturaleza en la costa norte",
    description: "Explora Samaná y otros destinos de la región norte.",
    href: "/destinos/region/norte",
    icon: Wind,
  },
  {
    period: "Abril – junio",
    title: "Ríos y montaña",
    description: "Encuentra ideas de ecoturismo y actividades al aire libre.",
    href: "/ecoturismo",
    icon: Compass,
  },
  {
    period: "Julio – septiembre",
    title: "Escapadas de playa",
    description: "Revisa playas y consulta sus condiciones antes de salir.",
    href: "/playas",
    icon: Waves,
  },
  {
    period: "Octubre – diciembre",
    title: "Cultura y sabores locales",
    description: "Planea un recorrido entre patrimonio y gastronomía.",
    href: "/cultura",
    icon: CalendarDays,
  },
];

const regions = [
  { name: "Norte y Cibao", slug: "norte", detail: "Montaña, costa atlántica y naturaleza" },
  { name: "Región Este", slug: "este", detail: "Playas, islas y experiencias costeras" },
  { name: "Región Sur", slug: "sur", detail: "Paisajes y comunidades del Caribe sur" },
];

const preparationLinks = [
  { label: "Clima y temporadas", href: "/clima", icon: Wind },
  { label: "Estado de las playas", href: "/estado-playas", icon: Waves },
  { label: "Requisitos de viaje", href: "/requisitos-viaje", icon: ShieldCheck },
  { label: "Transporte y movilidad", href: "/transporte-urbano#recorre", icon: BusFront },
];

export function HomeDiscoveryHub() {
  const pc = usePageContent("home-discovery-hub");
  const seasonalIdeas = pc.data("seasonalIdeas", __pcData.seasonalIdeas);
  const regions = pc.data("regions", __pcData.regions);
  const preparationLinks = pc.data("preparationLinks", __pcData.preparationLinks);
  const monthIndex = new Date().getMonth();
  const currentSeason = monthIndex < 3 ? 0 : monthIndex < 6 ? 1 : monthIndex < 9 ? 2 : 3;

  return (
    <section className="container mx-auto space-y-10 px-4 py-12 lg:px-8" aria-label={pc.t("section.aria-label.1", "Explora y planifica tu viaje")}>
      <nav aria-label={pc.t("nav.aria-label.1", "Atajos de planificación")} className="flex flex-wrap gap-2">
        {[
          { label: "Inspiración", href: "#inspiracion" },
          { label: "Regiones", href: "#regiones" },
          { label: "Preparar el viaje", href: "#preparacion" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-border bg-surface-editorial px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {item.label}
          </a>
        ))}
        <Link
          to="/mapa-interactivo"
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Map className="h-4 w-4" aria-hidden="true" />{pc.tx("Link.1", "Abrir mapa")}</Link>
      </nav>

      <div id="inspiracion" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{pc.tx("p.1", "Colecciones por temporada")}</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{pc.tx("h2.1", "El mejor momento para cada rincón")}</h2>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">{pc.tx("p.2", "Recomendaciones basadas en clima, temporadas de fauna marina y festivales culturales tradicionales.")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {seasonalIdeas.map(({ period, title, description, href, icon: Icon }, index) => (
            <Link
              key={period}
              to={href}
              className={`group card-taste p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                index === currentSeason
                  ? "border-primary/50 bg-surface-elevated ring-1 ring-primary/20"
                  : "bg-surface-editorial"
              }`}
              aria-current={index === currentSeason ? "true" : undefined}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                {index === currentSeason && <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-2xs font-bold text-primary">{pc.tx("span.1", "Temporada Actual")}</span>}
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{period}</span>
              <span className="mt-1 block font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">{title}</span>
              <span className="mt-2 block text-xs md:text-sm leading-relaxed text-muted-foreground/90">{description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div id="regiones" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{pc.tx("p.3", "Macro-regiones turísticas")}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{pc.tx("h2.2", "Descubre Quisqueya por zonas")}</h2>
          </div>
          <div className="grid gap-3">
            {regions.map((region) => (
              <Link
                key={region.slug}
                to={`/destinos/region/${region.slug}`}
                className="group card-taste flex items-center gap-3.5 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors">{region.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{region.detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div id="preparacion" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{pc.tx("p.4", "Herramientas útiles")}</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{pc.tx("h2.3", "Prepara tu viaje con datos reales")}</h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{pc.tx("p.5", "Información actualizada sobre clima, sargazo, transporte interurbano y documentación.")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {preparationLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="group card-taste flex min-h-20 items-center gap-3.5 p-4 text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="font-display font-medium text-xs md:text-sm">{label}</span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Link to="/mapa-interactivo" className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            <Map className="h-4 w-4" aria-hidden="true" />{pc.tx("Link.2", "Ver todos los destinos en el mapa interactivo satelital")}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { seasonalIdeas, regions, preparationLinks };
