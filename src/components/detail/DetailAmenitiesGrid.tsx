import React from "react";
import {
  Wifi, Car, Utensils, Waves, Sun, Sparkles,
  ShieldCheck, Accessibility, PawPrint, Coffee,
  Tv, Wind, Bath, Flame, Umbrella, Check
} from "lucide-react";

export interface AmenityItem {
  name: string;
  category?: string;
  iconName?: string;
}

interface DetailAmenitiesGridProps {
  amenities: string[] | AmenityItem[];
  title?: string;
  columns?: 2 | 3 | 4;
}

const getAmenityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="h-4 w-4 text-blue-500" />;
  if (lower.includes("parqueo") || lower.includes("estacionamiento") || lower.includes("parking")) return <Car className="h-4 w-4 text-emerald-500" />;
  if (lower.includes("comida") || lower.includes("restaurante") || lower.includes("almuerzo") || lower.includes("buffet") || lower.includes("desayuno")) return <Utensils className="h-4 w-4 text-amber-500" />;
  if (lower.includes("piscina") || lower.includes("playa") || lower.includes("mar") || lower.includes("kayak") || lower.includes("agua")) return <Waves className="h-4 w-4 text-cyan-500" />;
  if (lower.includes("aire") || lower.includes("clima") || lower.includes("ac")) return <Wind className="h-4 w-4 text-sky-500" />;
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("bar")) return <Coffee className="h-4 w-4 text-amber-700" />;
  if (lower.includes("pet") || lower.includes("mascota")) return <PawPrint className="h-4 w-4 text-orange-500" />;
  if (lower.includes("accesib") || lower.includes("silla")) return <Accessibility className="h-4 w-4 text-purple-500" />;
  if (lower.includes("segur") || lower.includes("vigil")) return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
  if (lower.includes("sombrilla") || lower.includes("camastro")) return <Umbrella className="h-4 w-4 text-pink-500" />;
  if (lower.includes("fogata") || lower.includes("leña")) return <Flame className="h-4 w-4 text-red-500" />;
  return <Check className="h-4 w-4 text-primary" />;
};

export const DetailAmenitiesGrid: React.FC<DetailAmenitiesGridProps> = ({
  amenities,
  title = "Servicios y Comodidades",
  columns = 3,
}) => {
  if (!amenities || amenities.length === 0) return null;

  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
      <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> {title}
      </h3>

      <div className={`grid ${colClasses} gap-3`}>
        {amenities.map((item, idx) => {
          const name = typeof item === "string" ? item : item.name;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/60 transition-colors text-xs font-medium text-foreground"
            >
              <div className="p-1.5 rounded-xl bg-background border border-border shrink-0 shadow-2xs">
                {getAmenityIcon(name)}
              </div>
              <span className="truncate">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
