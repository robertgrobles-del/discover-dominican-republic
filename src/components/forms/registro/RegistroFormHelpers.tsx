import React from "react";
import { Check, Building2, Utensils, Music, Hotel, MapPin, Leaf, ShoppingBag, Coffee, Briefcase, UserRound, Car, Ship, Stethoscope, Palette, Home, Store } from "lucide-react";
import { Label } from "@/components/ui/label";

export type TipoEstablecimiento =
  | "general"
  | "restaurante"
  | "bar"
  | "hotel"
  | "airbnb"
  | "tour"
  | "spa"
  | "tienda"
  | "cafe"
  | "agencia"
  | "guia"
  | "transporte"
  | "nautica"
  | "salud"
  | "taller"
  | "otro";

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
    icon: Home,
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
  cafe: {
    label: "Café / Experiencia de café",
    icon: Coffee,
    color: "text-amber-600",
    descripcion: "Registra tu cafetería de especialidad, tostador o finca con recorridos y degustaciones.",
  },
  agencia: {
    label: "Agencia de viajes / Operador",
    icon: Briefcase,
    color: "text-sky-500",
    descripcion: "Registra tu agencia u operadora y ofrece tus paquetes y excursiones a quienes planifican su viaje.",
  },
  guia: {
    label: "Guía turístico",
    icon: UserRound,
    color: "text-emerald-500",
    descripcion: "Registra tus servicios como guía y conecta con viajeros que buscan recorridos con un experto local.",
  },
  transporte: {
    label: "Transporte / Alquiler de vehículos",
    icon: Car,
    color: "text-indigo-500",
    descripcion: "Registra tu empresa de traslados, taxis turísticos o alquiler de vehículos.",
  },
  nautica: {
    label: "Náutica / Excursiones marinas",
    icon: Ship,
    color: "text-cyan-500",
    descripcion: "Registra tu marina, chárter, catamarán o centro de buceo.",
  },
  salud: {
    label: "Clínica / Turismo de salud",
    icon: Stethoscope,
    color: "text-red-500",
    descripcion: "Registra tu clínica o centro médico y atiende a pacientes y viajeros que buscan atención de calidad.",
  },
  taller: {
    label: "Taller artesanal",
    icon: Palette,
    color: "text-fuchsia-500",
    descripcion: "Registra tu taller y ofrece clases y experiencias de artesanía dominicana.",
  },
  otro: {
    label: "Otro negocio turístico",
    icon: Store,
    color: "text-primary",
    descripcion: "Si tu negocio no encaja en las categorías anteriores, cuéntanos qué ofreces.",
  },
};

/** Tipos que se ofrecen al elegir, en orden. «general» significa «aún sin elegir» y no se ofrece. */
export const TIPOS_SELECCIONABLES: TipoEstablecimiento[] = ["hotel", "airbnb", "restaurante", "bar", "cafe", "tour", "agencia", "guia", "transporte", "nautica", "spa", "salud", "tienda", "taller", "otro"];

export const provincias = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte",
  "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal",
  "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez",
  "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia",
  "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan",
  "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez",
  "Santo Domingo", "Valverde",
];

/** Pasos del registro: columnas iguales, número centrado, nombre debajo y línea de progreso por detrás. */
export function StepIndicator({ step, total, labels }: { step: number; total: number; labels?: string[] }) {
  return (
    <ol className="mb-8 flex" aria-label="Pasos del registro">
      {Array.from({ length: total }).map((_, i) => (
        <li key={i} className="relative flex flex-1 flex-col items-center" aria-current={i === step ? "step" : undefined}>
          {i > 0 && (
            <span aria-hidden="true" className={`absolute right-1/2 top-[18px] h-0.5 w-full -translate-y-1/2 transition-colors duration-300 ${i <= step ? "bg-primary" : "bg-muted"}`} />
          )}
          <span
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
              i < step
                ? "bg-primary text-primary-foreground"
                : i === step
                ? "bg-background text-primary ring-2 ring-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
          </span>
          {labels?.[i] && (
            <span className={`mt-2 hidden px-1 text-center text-xs leading-tight sm:block ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {labels[i]}
            </span>
          )}
        </li>
      ))}
    </ol>
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
