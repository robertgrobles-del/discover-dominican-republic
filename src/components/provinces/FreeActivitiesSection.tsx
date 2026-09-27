import React, { useState } from "react";
import { Sparkles, MapPin, Gift, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FreeSpot {
  provincia: string;
  region: "Este" | "Cibao / Norte" | "Sur" | "Santo Domingo";
  lugar: string;
  tipo: string;
  descripcion: string;
  consejoAcceso: string;
  horario: string;
}

export function FreeActivitiesSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("todos");

  const freeSpots: FreeSpot[] = [
    {
      provincia: "Distrito Nacional",
      region: "Santo Domingo",
      lugar: "Parque Mirador del Sur & Farallón",
      tipo: "Parque Urbano & Deporte",
      descripcion: "Más de 6 km de vía libre arbolada para caminar, patinar, correr y descansar con vista al Mar Caribe.",
      consejoAcceso: "Acceso libre 24/7; la avenida se hace peatonal de 5 a 9 AM y de 4 a 8 PM.",
      horario: "Abierto todos los días"
    },
    {
      provincia: "Distrito Nacional",
      region: "Santo Domingo",
      lugar: "Calles Peatonales de la Ciudad Colonial (UNESCO)",
      tipo: "Patrimonio & Arquitectura",
      descripcion: "Recorrido a pie por la Calle Las Damas, Parque Colón, Plaza España y las ruinas coloniales sin costo.",
      consejoAcceso: "Zona 100% transitable a pie. Los domingos por la tarde hay conciertos de son en vivo en las Ruinas de San Francisco.",
      horario: "Libre acceso peatonal"
    },
    {
      provincia: "La Altagracia",
      region: "Este",
      lugar: "Playa Macao (Punta Cana)",
      tipo: "Playa Pública Monumental",
      descripcion: "Una de las pocas playas 100% públicas y vírgenes del Este, con arena dorada y oleaje para surfistas.",
      consejoAcceso: "Entrada pública con estacionamiento libre al final de la carretera pavimentada.",
      horario: "Sol a sol"
    },
    {
      provincia: "Puerto Plata",
      region: "Cibao / Norte",
      lugar: "Paseo de Doña Blanca & Calle de las Sombrillas",
      tipo: "Paseo Fotográfico & Urbano",
      descripcion: "Pintoresco callejón colonial teñido de magenta victoriano y techo de sombrillas multicolores en el centro histórico.",
      consejoAcceso: "Acceso peatonal libre a cualquier hora; mejor luz fotográfica entre 9:00 AM y 11:30 AM.",
      horario: "24/7"
    },
    {
      provincia: "Barahona",
      region: "Sur",
      lugar: "Playa San Rafael & Cascada Natural",
      tipo: "Río & Mar",
      descripcion: "El río de agua dulce y fresca baja directamente de la montaña hasta desembocar en la playa de piedras pulidas.",
      consejoAcceso: "Acceso sin costo; los pescadores locales ofrecen asientos en enramadas a cambio de consumir o dejar propina.",
      horario: "08:00 AM - 06:00 PM"
    },
    {
      provincia: "La Vega (Jarabacoa)",
      region: "Cibao / Norte",
      lugar: "Confluencia de los Ríos Yaque del Norte y Jimenoa",
      tipo: "Balneario de Montaña",
      descripcion: "Punto natural donde se unen dos de los ríos más caudalosos del país bajo pinos y eucaliptos.",
      consejoAcceso: "Entrada peatonal libre con área de picnic comunitaria; respeta no dejar basura ni envases de vidrio.",
      horario: "08:00 AM - 06:00 PM"
    },
    {
      provincia: "Samaná",
      region: "Este",
      lugar: "Pueblo de los Pescadores & Malecón de Las Terrenas",
      tipo: "Paseo Marítimo & Atardecer",
      descripcion: "Paseo costero peatonal frente a palmeras, barcas de madera de colores y los atardeceres dorados de la península.",
      consejoAcceso: "Acceso público abierto frente al mar.",
      horario: "Libre 24 horas"
    },
    {
      provincia: "Peravia (Baní)",
      region: "Sur",
      lugar: "Mirador de las Salinas & Bahía de Calderas",
      tipo: "Paisaje Costero Único",
      descripcion: "Contempla las montañas de sal marina rosada y las bandadas de flamencos y aves playeras migratorias.",
      consejoAcceso: "La vista y el sendero panorámico exterior son completamente libres; respeta las áreas de desove.",
      horario: "Horas de luz diurna"
    }
  ];

  const filtered = selectedRegion === "todos" 
    ? freeSpots 
    : freeSpots.filter(s => s.region.toLowerCase().includes(selectedRegion.toLowerCase()));

  return (
    <section className="py-12 bg-card/40 border-t border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                <Gift className="w-3.5 h-3.5 mr-1" /> Mejora 624 · Presupuesto Inteligente
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              "Gratis en RD": Lugares y Actividades sin Costo de Entrada
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Descubre parques públicos, playas abiertas, monumentos al aire libre y paseos históricos por provincia para disfrutar del país con presupuesto cero.
            </p>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
            {["todos", "Santo Domingo", "Este", "Cibao / Norte", "Sur"].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedRegion === reg
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {reg === "todos" ? "Todas las Regiones" : reg}
              </button>
            ))}
          </div>
        </div>

        {/* Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((spot, i) => (
            <div
              key={i}
              className="bg-card border border-border/80 rounded-2xl p-5 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Entrada Libre
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {spot.provincia}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  {spot.lugar}
                </h3>
                <span className="text-xs text-primary font-medium block mb-2">
                  {spot.tipo}
                </span>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {spot.descripcion}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] space-y-1 bg-muted/20 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <p className="text-foreground/90 font-medium">
                  💡 <span className="text-muted-foreground">{spot.consejoAcceso}</span>
                </p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  ⏱️ {spot.horario}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
