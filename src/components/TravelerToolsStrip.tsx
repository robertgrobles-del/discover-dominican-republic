import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useI18n";
import {
  Calculator, Backpack, ArrowLeftRight, Languages, Sparkles,
  MapPinned, Hotel, Cloud, Plane, ArrowUpRight
} from "lucide-react";

const tools = [
  { 
    icon: Sparkles, 
    labelKey: "tools.tripPlanner", 
    desc: "Crea tu ruta personalizada en segundos con Inteligencia Artificial según tus gustos, presupuesto y días de estancia.", 
    href: "/itinerario-ia",
    badge: "IA Generativa",
    accent: "from-primary/15 via-amber-500/10 to-transparent",
    border: "border-primary/30 hover:border-primary/60",
    cta: "Generar mi itinerario",
    featured: true
  },
  { 
    icon: Plane, 
    labelKey: "travelerTools.requirements", 
    desc: "Formulario oficial de entrada y salida (E-Ticket), visados por nacionalidad, aduanas y vacunas para entrar al país.", 
    href: "/requisitos-viaje",
    badge: "Requisito Oficial",
    accent: "from-emerald-500/15 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    cta: "Ver requisitos de entrada",
    featured: true
  },
  { 
    icon: ArrowLeftRight, 
    labelKey: "tools.currencyConverter", 
    desc: "Tasas DOP, USD, EUR en tiempo real", 
    href: "/conversor-moneda",
  },
  { 
    icon: Cloud, 
    labelKey: "tools.weatherChecker", 
    desc: "Pronóstico del tiempo y temporadas", 
    href: "/clima",
  },
  { 
    icon: Calculator, 
    labelKey: "tools.budgetCalc", 
    desc: "Estima tus gastos por destino", 
    href: "/costos-viaje#calculadora",
  },
  { 
    icon: Languages, 
    labelKey: "tools.translator", 
    desc: "Diccionario y frases locales", 
    href: "/espanol-viajero#traductor",
  },
  { 
    icon: Backpack, 
    labelKey: "tools.packingList", 
    desc: "Checklist inteligente de viaje", 
    href: "/lista-empaque",
  },
  { 
    icon: Hotel, 
    labelKey: "tools.hotelComparer", 
    desc: "Compara tarifas y amenidades", 
    href: "/comparador-hoteles",
  },
  { 
    icon: MapPinned, 
    labelKey: "tools.destinationComparer", 
    desc: "Enfrenta dos destinos cara a cara", 
    href: "/comparador",
  },
];

export function TravelerToolsStrip() {
  const { t } = useTranslation();
  const featured = tools.filter((x) => x.featured);
  const rest = tools.filter((x) => !x.featured);

  // Sección de uso: las dos herramientas clave en grande a la izquierda y el resto en lista a la derecha.
  return (
    <section className="bg-muted/40 py-14 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">{t("travelerTools.title")}</h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">{t("travelerTools.subtitle")}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="grid gap-4">
            {featured.map((tool) => (
              <Link key={tool.labelKey} to={tool.href}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <tool.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                  {tool.badge ? <span className="text-xs font-medium text-muted-foreground">{tool.badge}</span> : null}
                </div>
                <div className="mt-6">
                  <h3 className="font-display text-xl font-bold text-foreground">{t(tool.labelKey)}</h3>
                  <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{tool.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {tool.cta}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {rest.map((tool) => (
              <li key={tool.labelKey}>
                <Link to={tool.href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                  <tool.icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{t(tool.labelKey)}</span>
                    <span className="block truncate text-xs text-muted-foreground">{tool.desc}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
