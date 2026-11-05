import React from "react";
import { Link } from "react-router-dom";
import { MegaMenuAdCard } from "./MegaMenuAdCard";
import { 
  Building2, Layers, MapPin, Trophy, Camera, TrendingUp, 
  Calendar, DollarSign, ShieldCheck, Briefcase, ChevronRight, Heart 
} from "lucide-react";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";

interface MegaMenuEmpresasProps {
  onClose: () => void;
  adLuxuryHotelImg: string;
}

export function MegaMenuEmpresas({ onClose, adLuxuryHotelImg }: MegaMenuEmpresasProps) {
  const operatorLinks = [
    { name: "Panel de Operador", desc: "Métricas, reservas y perfil comercial", href: "/operadores/panel", icon: Layers },
    { name: "Directorio de Empresas", desc: "Catálogo verificado de proveedores", href: "/operadores/directorio", icon: MapPin },
    { name: "Retos & Recompensas", desc: "Patrocina misiones para turistas", href: "/operadores/panel/recompensas", icon: Trophy },
    { name: "Estancias para Creadores", desc: "Colabora con influencers de viajes", href: "/operadores/panel/estancias", icon: Camera },
  ];

  const growthLinks = [
    { name: "Publicidad en el Portal", desc: "Destaca tu oferta a nivel global", href: "/anunciate", icon: TrendingUp },
    { name: "Congresos y MICE", desc: "Convenciones y viajes de incentivo", href: "/mice", icon: Calendar },
    { name: "Bodas de destino", desc: "Sedes y servicios para casarse en RD", href: "/bodas", icon: Heart },
    { name: "Inversión Turística", desc: "Oportunidades de inversión en RD", href: "/inversion", icon: DollarSign },
    { name: "Sello de Calidad Oficial", desc: "Certificación y buenas prácticas", href: "/sello-calidad", icon: ShieldCheck },
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Col 1: Operadores & Gestión (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">Operadores & Negocios</h3>
          </div>
          <Link to="/para-empresas" onClick={onClose} className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5">
            Portal B2B <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-1.5">
          {operatorLinks.map((item) => (
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

      {/* Col 2: Crecimiento & B2B (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-xs uppercase tracking-wider text-foreground font-bold font-display">Crecimiento & Alianzas</h4>
          </div>
          <Link to="/mice" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-medium">
            Congresos y MICE →
          </Link>
        </div>

        <div className="space-y-1.5">
          {growthLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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

      {/* Col 3: Publicidad & Panel CTA (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
        <MegaMenuAdCard section="megamenu-empresas" onClose={onClose} fallback={{ to: "/anunciate", img: adLuxuryHotelImg, alt: "Promoción para Empresas", sponsor: "Portal Oficial B2B", title: "Posiciona tu Negocio en RD", text: "Capta reservas directas de millones de turistas" }} />

        <Link 
          to="/operadores/panel" 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-transparent border border-blue-500/30 flex items-center justify-between group hover:border-blue-500 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-sm">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Ingresar al Panel de Negocios</p>
              <p className="text-3xs text-muted-foreground">Acceso verificado para operadores y hoteles</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
