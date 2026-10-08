import React from "react";
import { Link } from "react-router-dom";
import { 
  Heart, Building2, Newspaper, BookOpen, Utensils, 
  Coffee, Leaf, HeartPulse, ChevronRight 
} from "lucide-react";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";

interface MegaMenuGuiasProps {
  onClose: () => void;
  gastronomyImg: string;
}

export function MegaMenuGuias({ onClose, gastronomyImg }: MegaMenuGuiasProps) {
  const cultureLinks = [
    { name: "Cultura Dominicana", desc: "Música, merengue, bachata y carnaval", href: "/cultura", icon: Heart },
    { name: "Monumentos & Museos", desc: "Zona Colonial y patrimonio histórico", href: "/museos-monumentos", icon: Building2 },
    { name: "Revista Descubre RD", desc: "Historias, reportajes y artículos", href: "/revista", icon: Newspaper },
    { name: "Historia de la República", desc: "Legado taíno, colonial y moderno", href: "/historia", icon: BookOpen },
  ];

  const flavorLinks = [
    { name: "Rutas Gastronómicas", desc: "Cacao, café, tabaco, ron y cocina local", href: "/rutas-sabor", icon: Utensils },
    { name: "Guía de Restaurantes", desc: "Platos típicos, chefs y alta cocina", href: "/guia-gastronomica", icon: Coffee },
    { name: "Turismo Sostenible", desc: "Reservas de biósfera y ecoturismo", href: "/sostenible", icon: Leaf },
    { name: "Spas & Bienestar", desc: "Relajación y centros de bienestar", href: "/spas-wellness", icon: HeartPulse },
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Col 1: Cultura & Patrimonio (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">Cultura & Patrimonio</h3>
          </div>
          <Link to="/cultura" onClick={onClose} className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5">
            Explorar <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-1.5">
          {cultureLinks.map((item) => (
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
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Col 2: Sabores & Ecoturismo (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-xs uppercase tracking-wider text-foreground font-bold font-display">Sabores & Naturaleza</h4>
          </div>
          <Link to="/guia-gastronomica" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-medium">
            Gastronomía →
          </Link>
        </div>

        <div className="space-y-1.5">
          {flavorLinks.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate leading-tight">{item.name}</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Col 3: Publicidad & Revista (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
        <Link to="/rutas-sabor" onClick={onClose} className="block group relative rounded-2xl overflow-hidden h-36 shadow-md">
          <img src={gastronomyImg} alt="Rutas del Cacao & Ron" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <SponsoredBadge sponsor="Ruta del Cacao & Ron" className="mb-1 text-[10px]" />
            <h4 className="font-display text-sm font-bold text-white leading-tight">Experiencia Cacao & Ron Añejo</h4>
            <p className="text-white/85 text-xs">Catas guiadas y talleres artesanales premium</p>
          </div>
        </Link>

        <Link 
          to="/revista" 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-transparent border border-amber-500/30 flex items-center justify-between group hover:border-amber-500 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Edición Especial Revista RD</p>
              <p className="text-[10px] text-muted-foreground">10 joyas ocultas por descubrir este mes</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
