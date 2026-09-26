import { Link } from "react-router-dom";
import { Car, Clock, Plane, FileCheck, Shield, MapPin, Download, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CityRoute {
  name: string;
  distance: string;
  duration: string;
  label?: string;
}

interface DestinationArrivalGuideProps {
  destinationName: string;
  provinceName?: string;
  airportInfo?: string;
  weatherSummary?: string;
  routes?: CityRoute[];
}

const DEFAULT_PUNTA_CANA_ROUTES: CityRoute[] = [
  { name: "Santo Domingo", distance: "205 km", duration: "2h 20 min", label: "Capital del país" },
  { name: "La Romana", distance: "88 km", duration: "55 min", label: "Casa de Campo" },
  { name: "Higüey", distance: "48 km", duration: "40 min", label: "Basílica de Altagracia" },
  { name: "Samaná", distance: "167 km", duration: "2h 45 min", label: "Bahía de Ballenas" },
  { name: "Santiago", distance: "356 km", duration: "4h 30 min", label: "Ciudad Corazón" },
  { name: "Puerto Plata", distance: "377 km", duration: "5h 00 min", label: "Costa del Ámbar" },
];

export function DestinationArrivalGuide({
  destinationName,
  provinceName = "La Altagracia",
  airportInfo,
  weatherSummary,
  routes = DEFAULT_PUNTA_CANA_ROUTES,
}: DestinationArrivalGuideProps) {
  return (
    <section className="py-16 bg-muted/20 border-y border-border/60">
      <div className="container mx-auto px-4">
        {/* Header section matching editorial mockup */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2 inline-block">
            Conectividad &amp; Rutas Terrestres
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Planifica tu Llegada a {destinationName}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            La moderna red de autopistas (Autovía del Coral y Corredor del Este) conecta con las principales capitales culturales y polos turísticos del país mediante vías seguras y vigiladas.
          </p>
        </div>

        {/* 6 Grid Distance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {routes.map((route, idx) => (
            <div
              key={idx}
              className="bg-card hover:bg-card/80 border border-border/80 hover:border-primary/40 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block truncate">
                  Desde {route.name}
                </span>
                <p className="text-lg md:text-xl font-black text-primary mt-1">
                  {route.distance}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground/80" />
                <span>{route.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3 Practical Service Badges: E-Ticket, Traslados, POLITUR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: E-Ticket */}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground mb-1">
                Formulario E-Ticket Obligatorio
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Recuerda completar el e-ticket aduanal gratuito antes de abordar hacia o desde los aeropuertos de RD (eticket.migracion.gob.do).
              </p>
            </div>
          </div>

          {/* Card 2: Traslados Oficiales */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground mb-1">
                Traslados Oficiales y Verificados
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utiliza taxis turísticos autorizados con tarifas fijas visibles o traslados concertados previamente con tu resort.
              </p>
            </div>
          </div>

          {/* Card 3: POLITUR */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground mb-1">
                Asistencia al Turista (POLITUR)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cuerpo especializado de seguridad turística bilingüe disponible las 24 horas en todas las playas, autopistas y zonas públicas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info & PDF Guide */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            * Distancias y tiempos aproximados por carretera según condiciones usuales de tráfico.
          </p>
          <a
            href="/guia-oficial-rd.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Descargar Guía Oficial en PDF
            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground border border-border">Actualizado 2025</span>
          </a>
        </div>
      </div>
    </section>
  );
}
