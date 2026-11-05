import React from "react";
import { Link } from "react-router-dom";
import { MegaMenuAdCard } from "./MegaMenuAdCard";
import { 
  Route, MapPin, DollarSign, Ticket, ShieldCheck, 
  FileText, Plane, Car, HeartPulse, ChevronRight 
} from "lucide-react";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";

interface MegaMenuPlanificarProps {
  onClose: () => void;
  adBeachResortImg: string;
}

export function MegaMenuPlanificar({ onClose, adBeachResortImg }: MegaMenuPlanificarProps) {
  const tools = [
    { name: "Planificador con IA", desc: "Itinerarios y rutas personalizadas", href: "/mi-viaje", icon: Route },
    { name: "Circuitos & Rutas", desc: "Guías de 3, 5 y 7 días por región", href: "/itinerarios", icon: MapPin },
    { name: "Calculadora de Gastos", desc: "Estima vuelos, hotel y traslados", href: "/costos-viaje#calculadora", icon: DollarSign },
    { name: "Ofertas & Descuentos", desc: "Promociones verificadas y cupones", href: "/ofertas", icon: Ticket },
  ];

  const arrivalTools = [
    { name: "E-Ticket Migratorio", desc: "Formulario oficial de entrada y salida", href: "/e-ticket", icon: FileText },
    { name: "Vuelos & Aeropuertos", desc: "Terminales internacionales de RD", href: "/como-llegar", icon: Plane },
    { name: "Transporte Urbano", desc: "Autobuses, taxis y rent a car", href: "/transporte-urbano", icon: Car },
    { name: "Salud & Asistencia 911", desc: "Hospitales y farmacias de turno 24h", href: "/info/seguridad#salud", icon: HeartPulse },
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Col 1: Herramientas & Itinerarios (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Route className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">Herramientas de Viaje</h3>
          </div>
          <Link to="/planifica" onClick={onClose} className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5">
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-1.5">
          {tools.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate leading-tight">{item.name}</p>
                <p className="text-2xs text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Col 2: Llegada & Trámites (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-xs uppercase tracking-wider text-foreground font-bold font-display">Llegada & Asistencia</h4>
          </div>
          <Link to="/requisitos-viaje#guia-practica" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-medium">
            Guía práctica →
          </Link>
        </div>

        <div className="space-y-1.5">
          {arrivalTools.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate leading-tight">{item.name}</p>
                <p className="text-2xs text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Col 3: Publicidad & Acción Rápida (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
        <MegaMenuAdCard section="megamenu-planificar" onClose={onClose} fallback={{ to: "/conectividad#esim", img: adBeachResortImg, alt: "eSIM Dominicana 5G", sponsor: "eSIM Dominicana 5G", title: "Conéctate al Instante en 5G", text: "Datos móviles prepago sin roaming al aterrizar" }} />

        <Link 
          to="/e-ticket" 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/30 flex items-center justify-between group hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">E-Ticket Migratorio Oficial</p>
              <p className="text-3xs text-muted-foreground">Formulario digital gratuito y obligatorio</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
