import React from "react";
import { Check, Building2, Utensils, Music, Hotel, MapPin, Leaf, ShoppingBag } from "lucide-react";
import { Label } from "@/components/ui/label";

export type TipoEstablecimiento =
  | "general"
  | "restaurante"
  | "bar"
  | "hotel"
  | "airbnb"
  | "tour"
  | "spa"
  | "tienda";

export const tipoConfig: Record<TipoEstablecimiento, {
  label: string;
  icon: React.ElementType;
  color: string;
  descripcion: string;
}> = {
  general: {
    label: "Establecimiento Turístico",
    icon: Building2,
    color: "text-primary",
    descripcion: "Registra tu negocio turístico y llega a miles de viajeros que planifican su visita a República Dominicana.",
  },
  restaurante: {
    label: "Restaurante",
    icon: Utensils,
    color: "text-orange-500",
    descripcion: "Registra tu restaurante y llega a miles de viajeros que buscan experiencias gastronómicas únicas.",
  },
  bar: {
    label: "Bar / Vida Nocturna",
    icon: Music,
    color: "text-purple-500",
    descripcion: "Registra tu bar, club o lounge y destaca en la guía de vida nocturna de República Dominicana.",
  },
  hotel: {
    label: "Hotel / Resort",
    icon: Hotel,
    color: "text-blue-500",
    descripcion: "Registra tu hotel, resort o complejo turístico y conecta con huéspedes que buscan hospedaje corporativo o vacacional.",
  },
  airbnb: {
    label: "Airbnb / Vivienda Turística",
    icon: Hotel,
    color: "text-rose-500",
    descripcion: "Registra tu villa, apartamento, casa vacacional o glamping y capta reservas directas con turistas de todo el mundo.",
  },
  tour: {
    label: "Tour / Actividad",
    icon: MapPin,
    color: "text-green-500",
    descripcion: "Registra tu tour o actividad y conecta con viajeros en busca de aventuras únicas.",
  },
  spa: {
    label: "Spa / Wellness",
    icon: Leaf,
    color: "text-teal-500",
    descripcion: "Registra tu spa o centro de bienestar y aparece en la guía de wellness de RD.",
  },
  tienda: {
    label: "Tienda / Artesanía",
    icon: ShoppingBag,
    color: "text-amber-500",
    descripcion: "Registra tu tienda y muestra tus productos a los viajeros que buscan souvenirs y artesanías.",
  },
};

export const provincias = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte",
  "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal",
  "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez",
  "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia",
  "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan",
  "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez",
  "Santo Domingo", "Valverde",
];

export function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < step
                ? "bg-primary text-primary-foreground"
                : i === step
                ? "bg-primary/20 border-2 border-primary text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${i < step ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

export function FormField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
