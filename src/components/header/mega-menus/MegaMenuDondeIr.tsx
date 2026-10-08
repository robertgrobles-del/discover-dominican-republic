import React from "react";
import { Link } from "react-router-dom";
import { Globe, MapPin, ChevronRight } from "lucide-react";

interface MegaMenuDondeIrProps {
  onClose: () => void;
  destinos: Array<{ name: string; desc: string; image: string; href: string; tag: string }>;
  regiones: Array<{ name: string; desc: string; href: string; tag: string; image: string }>;
  samanaImg: string;
  t: (key: string) => string;
}

export function MegaMenuDondeIr({
  onClose,
  destinos,
  regiones,
  samanaImg,
  t,
}: MegaMenuDondeIrProps) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Col 1: Destinos Principales (4 cols) */}
        <div className="lg:col-span-4 border-r border-border/60 pr-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display uppercase tracking-wider text-xs font-bold text-foreground">
                {t("destinations.popular")}
              </h3>
            </div>
            <Link 
              to="/destinos" 
              onClick={onClose} 
              className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5"
            >
              {t("destinations.viewAll")} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {destinos.map((item) => (
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
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs truncate">{item.name}</p>
                    <span className="text-[9px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-semibold">{item.tag}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Col 2: Macro Regiones Dominicanas con Tarjetas (5 cols) */}
        <div className="lg:col-span-5 border-r border-border/60 pr-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs uppercase tracking-wider text-foreground font-bold font-display">Macro-Regiones Turísticas</h4>
            </div>
            <Link to="/provincias" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground font-medium">
              31 Provincias + D.N. →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {regiones.map((region) => (
              <Link 
                key={region.href} 
                to={region.href} 
                onClick={onClose} 
                className="group p-3 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors block mb-1">
                    {region.name.split(' (')[0]}
                  </span>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{region.desc}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-primary">
                    ✦ {region.tag}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: Destino del Mes Destacado (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3 justify-between">
          <Link to="/destino/bahia-de-las-aguilas" onClick={onClose} className="block group relative rounded-2xl overflow-hidden h-40 shadow-md">
            <img src={samanaImg} alt="Bahía de las Águilas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black mb-1.5 shadow">
                ★ {t("header.destinationOfMonth")}
              </span>
              <h4 className="font-display text-sm font-bold text-white leading-tight">Bahía de las Águilas</h4>
              <p className="text-white/85 text-xs line-clamp-1">{t("header.mostBeautifulBeach")}</p>
            </div>
          </Link>

          <Link 
            to="/gamificacion-turistica" 
            onClick={onClose}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-transparent border border-amber-500/30 flex items-center justify-between group hover:border-amber-500 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm">
                🇩🇴
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Pasaporte de 32 Provincias</p>
                <p className="text-[10px] text-muted-foreground">Sellos digitales y ranking de exploradores</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
