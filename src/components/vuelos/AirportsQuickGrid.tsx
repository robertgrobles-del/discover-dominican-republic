import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { airports } from "@/data/airports";

export function AirportsQuickGrid() {
  return (
    <section className="border-y border-border/60 bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Puertas de Entrada (Aeropuertos Internacionales)
          </h3>
          <Link to="/aeropuerto" className="text-xs text-primary font-semibold hover:underline">
            Ver vuelos en tiempo real →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {airports.slice(0, 4).map((ap) => (
            <Link
              key={ap.id}
              to={`/aeropuerto/${ap.slug}`}
              className="p-3 bg-card rounded-xl border border-border/60 hover:border-primary/50 transition-all group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm group-hover:text-primary">
                  <span>{ap.code}</span>
                  <span className="text-xs text-muted-foreground font-normal">• {ap.city}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{ap.name}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
