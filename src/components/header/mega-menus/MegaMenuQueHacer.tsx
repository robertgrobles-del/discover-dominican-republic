import React from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles, ChevronRight, Ticket, Trophy } from "lucide-react";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";

interface MegaMenuQueHacerProps {
  onClose: () => void;
  experienciasTop: Array<{ name: string; desc: string; image: string; href: string }>;
  categorias: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }>;
  adAdventureImg: string;
}

export function MegaMenuQueHacer({
  onClose,
  experienciasTop,
  categorias,
  adAdventureImg,
}: MegaMenuQueHacerProps) {
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Col 1: Experiencias Estrella (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">Experiencias Destacadas</h3>
          </div>
          <Link to="/actividades" onClick={onClose} className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5">
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {experienciasTop.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 relative shadow-xs">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate leading-tight">{item.name}</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Col 2: Categorías de Interés (4 cols) */}
      <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h4 className="text-xs uppercase tracking-wider text-foreground font-bold font-display">Categorías de Interés</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categorias.map((item) => (
            <Link 
              key={item.href} 
              to={item.href} 
              onClick={onClose} 
              className="flex items-center gap-2 text-xs text-foreground hover:text-primary p-2.5 bg-card border border-border/60 rounded-xl hover:border-primary/50 transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-xs truncate">{item.name}</span>
            </Link>
          ))}
        </div>

        <Link 
          to="/tours" 
          onClick={onClose} 
          className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/30 group hover:border-primary transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Ticket className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Directorio de Excursiones Oficiales</p>
              <p className="text-[10px] text-muted-foreground">Reservas verificadas con operadores locales</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Col 3: Contenido Patrocinado & Gamificación (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
        <Link to="/tour/buggies-cenote-hoyo-azul" onClick={onClose} className="block group relative rounded-2xl overflow-hidden h-36 shadow-md">
          <img src={adAdventureImg} alt="Excursiones Extremas & Buggies en Punta Cana" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <SponsoredBadge sponsor="Caribbean Buggies" className="mb-1 text-[10px]" />
            <h4 className="font-display text-sm font-bold text-white leading-tight">Buggies & Cenote Hoyo Azul</h4>
            <p className="text-white/85 text-xs">Aventura 4x4 con traslado desde tu hotel</p>
          </div>
        </Link>

        <Link 
          to="/gamificacion-turistica/retos" 
          onClick={onClose} 
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary/10 to-transparent border border-purple-500/30 flex items-center justify-between group hover:border-purple-500 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Misiones Diarias & Retos</p>
              <p className="text-[10px] text-muted-foreground">Gana monedas canjeables por day passes</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
