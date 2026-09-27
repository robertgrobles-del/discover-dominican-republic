import { Clock, Camera, Compass, Heart, Users, Mountain } from "lucide-react";
import relaxBeach from "@/assets/relax-beach.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import samana from "@/assets/samana.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import adventureImg from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";

export type Itinerario = {
  id: string;
  titulo: string;
  duracion: string;
  perfil: string;
  presupuesto: string;
  imagen: string;
  icon: React.ElementType;
  color: string;
  descripcion: string;
  destinos: string[];
  dias: { dia: number; titulo: string; actividades: string[]; noche: string }[];
  incluye: string[];
  tips: string[];
};

export const itinerarios: Itinerario[] = [
  {
    id: "3-dias-express",
    titulo: "Escapada Express",
    duracion: "3 días",
    perfil: "Parejas / Weekend",
    presupuesto: "US$300-600",
    imagen: relaxBeach,
    icon: Clock,
    color: "text-sky-500",
    descripcion: "Perfecto para un fin de semana largo. Lo mejor de Punta Cana en poco tiempo.",
    destinos: ["Punta Cana", "Bávaro"],
    dias: [
      { dia: 1, titulo: "Llegada y Playa", actividades: ["Check-in en resort", "Playa Bávaro por la tarde", "Cena de bienvenida en el hotel"], noche: "Resort Punta Cana" },
      { dia: 2, titulo: "Aventura", actividades: ["Excursión Isla Saona en catamarán", "Snorkel en piscina natural", "Cena en restaurante local"], noche: "Resort Punta Cana" },
      { dia: 3, titulo: "Relax y Despedida", actividades: ["Spa por la mañana", "Compras de souvenirs", "Vuelo de regreso"], noche: "—" },
    ],
    incluye: ["Transfer aeropuerto", "2 noches all-inclusive", "Tour Isla Saona"],
    tips: ["Reserva el tour Saona con anticipación", "Lleva protector solar waterproof"],
  },
  {
    id: "5-dias-cultura",
    titulo: "Cultura y Playa",
    duracion: "5 días",
    perfil: "Cultural / Historia",
    presupuesto: "US$500-1,000",
    imagen: santoDomingo,
    icon: Camera,
    color: "text-amber-500",
    descripcion: "Combina la historia de Santo Domingo con las playas del este. Lo mejor de dos mundos.",
    destinos: ["Santo Domingo", "Zona Colonial", "Punta Cana"],
    dias: [
      { dia: 1, titulo: "Santo Domingo Colonial", actividades: ["Zona Colonial a pie", "Alcázar de Colón", "Catedral Primada", "Calle El Conde"], noche: "Hotel boutique Zona Colonial" },
      { dia: 2, titulo: "Capital Moderna", actividades: ["Malecón al amanecer", "Museo del Hombre Dominicano", "Mercado Modelo", "Vida nocturna Zona Colonial"], noche: "Hotel boutique Zona Colonial" },
      { dia: 3, titulo: "Rumbo al Este", actividades: ["Ruta a Punta Cana (3h)", "Check-in resort", "Playa por la tarde"], noche: "Resort Punta Cana" },
      { dia: 4, titulo: "Aventura Acuática", actividades: ["Snorkel en arrecifes", "Hoyo Azul o cenote", "Cena romántica frente al mar"], noche: "Resort Punta Cana" },
      { dia: 5, titulo: "Último Día", actividades: ["Desayuno temprano", "Compras en Palma Real", "Aeropuerto PUJ"], noche: "—" },
    ],
    incluye: ["Transfer privado", "2 noches boutique", "2 noches all-inclusive", "Tour colonial guiado"],
    tips: ["Usa zapatos cómodos para la Zona Colonial", "Los domingos hay actividades culturales gratis"],
  },
  {
    id: "7-dias-completo",
    titulo: "RD Completo",
    duracion: "7 días",
    perfil: "Explorador",
    presupuesto: "US$800-1,800",
    imagen: samana,
    icon: Compass,
    color: "text-emerald-500",
    descripcion: "La experiencia definitiva: capital, montañas, ballenas y playas paradisíacas.",
    destinos: ["Santo Domingo", "Jarabacoa", "Samaná", "Punta Cana"],
    dias: [
      { dia: 1, titulo: "Bienvenida en la Capital", actividades: ["Zona Colonial", "Gastronomía local", "Noche en el Malecón"], noche: "Santo Domingo" },
      { dia: 2, titulo: "Montañas de Jarabacoa", actividades: ["Ruta a Jarabacoa (2.5h)", "Rafting Río Yaque del Norte", "Salto de Jimenoa"], noche: "Eco-lodge Jarabacoa" },
      { dia: 3, titulo: "Naturaleza y Aventura", actividades: ["Senderismo Pico Duarte (ruta corta)", "Parapente", "Café de montaña"], noche: "Eco-lodge Jarabacoa" },
      { dia: 4, titulo: "Rumbo a Samaná", actividades: ["Ruta escénica a Samaná (4h)", "Playa Rincón al atardecer", "Cena de mariscos"], noche: "Hotel Las Terrenas" },
      { dia: 5, titulo: "Samaná Espectacular", actividades: ["Parque Nacional Los Haitises", "Cayo Levantado", "Avistamiento de ballenas (ene-mar)"], noche: "Hotel Las Terrenas" },
      { dia: 6, titulo: "Punta Cana", actividades: ["Vuelo interno o ruta terrestre", "Playa Bávaro", "Spa y relax"], noche: "Resort Punta Cana" },
      { dia: 7, titulo: "Último Día", actividades: ["Compras y souvenirs", "Brunch en la playa", "Aeropuerto PUJ"], noche: "—" },
    ],
    incluye: ["Transfers", "Mix de alojamientos", "Tours guiados", "Vuelo interno opcional"],
    tips: ["Ballenas jorobadas solo de enero a marzo", "Jarabacoa es más fresco — lleva una chaqueta ligera"],
  },
  {
    id: "7-dias-lujo",
    titulo: "Lujo & Romance",
    duracion: "7 días",
    perfil: "Luna de Miel / Lujo",
    presupuesto: "US$3,000-8,000",
    imagen: puntaCana,
    icon: Heart,
    color: "text-rose-500",
    descripcion: "La experiencia más exclusiva de República Dominicana para parejas y viajeros premium.",
    destinos: ["Cap Cana", "Samaná", "Casa de Campo"],
    dias: [
      { dia: 1, titulo: "Llegada VIP", actividades: ["Transfer privado en limusina", "Check-in suite premium Cap Cana", "Cena privada en la playa"], noche: "Cap Cana Resort" },
      { dia: 2, titulo: "Golf & Spa", actividades: ["Golf en Punta Espada", "Couples spa", "Cena degustación"], noche: "Cap Cana Resort" },
      { dia: 3, titulo: "Yate Privado", actividades: ["Paseo en yate por la costa", "Snorkel privado", "Almuerzo en el mar"], noche: "Cap Cana Resort" },
      { dia: 4, titulo: "Samaná Exclusivo", actividades: ["Helicóptero a Samaná", "Playa Rincón privada", "Sunset cocktails"], noche: "Boutique hotel Samaná" },
      { dia: 5, titulo: "Naturaleza Premium", actividades: ["Los Haitises en lancha privada", "Almuerzo gourmet local", "Masaje en la playa"], noche: "Boutique hotel Samaná" },
      { dia: 6, titulo: "Casa de Campo", actividades: ["Vuelo a La Romana", "Altos de Chavón", "Cena en restaurante italiano con vista al río"], noche: "Casa de Campo" },
      { dia: 7, titulo: "Despedida", actividades: ["Desayuno en la villa", "Shopping en Marina", "Transfer al aeropuerto"], noche: "—" },
    ],
    incluye: ["Transfers VIP", "Suites premium", "Chef privado", "Experiencias exclusivas"],
    tips: ["Reserva con 3+ meses de anticipación", "Solicita amenities especiales para luna de miel"],
  },
  {
    id: "7-dias-familia",
    titulo: "Aventura en Familia",
    duracion: "7 días",
    perfil: "Familia con Niños",
    presupuesto: "US$1,200-3,000",
    imagen: adventureImg,
    icon: Users,
    color: "text-blue-500",
    descripcion: "Vacaciones perfectas para toda la familia con actividades para todas las edades.",
    destinos: ["Punta Cana", "Bávaro", "Santo Domingo"],
    dias: [
      { dia: 1, titulo: "Llegada al Paraíso", actividades: ["Check-in resort familiar", "Kids club", "Playa en familia"], noche: "Resort familiar Punta Cana" },
      { dia: 2, titulo: "Parque Acuático", actividades: ["Sirenis Aquagames o similar", "Piscina del resort", "Show nocturno"], noche: "Resort familiar Punta Cana" },
      { dia: 3, titulo: "Naturaleza", actividades: ["Manatí Park o Dolphin Explorer", "Interacción con animales", "Mini golf"], noche: "Resort familiar Punta Cana" },
      { dia: 4, titulo: "Aventura Suave", actividades: ["Tour en buggy por la campiña", "Visita a escuela local", "Playa privada"], noche: "Resort familiar Punta Cana" },
      { dia: 5, titulo: "Día Cultural", actividades: ["Excursión a Santo Domingo", "Museo Infantil Trampolín", "Zona Colonial adaptada"], noche: "Resort familiar Punta Cana" },
      { dia: 6, titulo: "Relax Total", actividades: ["Día libre en el resort", "Spa para padres / kids club", "Cena de despedida"], noche: "Resort familiar Punta Cana" },
      { dia: 7, titulo: "Regreso", actividades: ["Desayuno", "Compras de último minuto", "Aeropuerto PUJ"], noche: "—" },
    ],
    incluye: ["Resort all-inclusive familiar", "Actividades para niños", "Transfers"],
    tips: ["Elige resorts con kids club incluido", "Lleva medicinas pediátricas básicas"],
  },
  {
    id: "14-dias-total",
    titulo: "Gran Tour RD",
    duracion: "14 días",
    perfil: "Aventurero Total",
    presupuesto: "US$1,500-4,000",
    imagen: gastronomy,
    icon: Mountain,
    color: "text-purple-500",
    descripcion: "Recorre la isla completa. Cada región, cada sabor, cada aventura.",
    destinos: ["Santo Domingo", "Jarabacoa", "Constanza", "Samaná", "Puerto Plata", "Cabarete", "Punta Cana", "Barahona"],
    dias: [
      { dia: 1, titulo: "Capital", actividades: ["Zona Colonial, Malecón, gastronomía"], noche: "Santo Domingo" },
      { dia: 2, titulo: "Capital II", actividades: ["Museos, Mercado Modelo, vida nocturna"], noche: "Santo Domingo" },
      { dia: 3, titulo: "Montañas", actividades: ["Ruta a Jarabacoa, rafting, cascadas"], noche: "Jarabacoa" },
      { dia: 4, titulo: "Constanza", actividades: ["Valle de Constanza, agricultura, fresas"], noche: "Constanza" },
      { dia: 5, titulo: "Samaná", actividades: ["Ruta a Samaná, Playa Rincón"], noche: "Las Terrenas" },
      { dia: 6, titulo: "Los Haitises", actividades: ["Parque Nacional, manglares, cuevas"], noche: "Las Terrenas" },
      { dia: 7, titulo: "Cayo Levantado", actividades: ["Isla, snorkel, relax"], noche: "Samaná" },
      { dia: 8, titulo: "Costa Norte", actividades: ["Ruta a Puerto Plata, teleférico, ámbar"], noche: "Puerto Plata" },
      { dia: 9, titulo: "Cabarete", actividades: ["Kitesurf, surf, vida nocturna"], noche: "Cabarete" },
      { dia: 10, titulo: "Sosúa", actividades: ["Playa Sosúa, buceo, pueblo"], noche: "Cabarete" },
      { dia: 11, titulo: "Punta Cana", actividades: ["Vuelo a Punta Cana, resort, playa"], noche: "Punta Cana" },
      { dia: 12, titulo: "Isla Saona", actividades: ["Tour catamarán, piscina natural"], noche: "Punta Cana" },
      { dia: 13, titulo: "Sur: Barahona", actividades: ["Bahía de las Águilas, Larimar mines"], noche: "Barahona" },
      { dia: 14, titulo: "Regreso", actividades: ["Última playa, compras, aeropuerto"], noche: "—" },
    ],
    incluye: ["Mix alojamientos", "Transfers entre destinos", "Tours principales"],
    tips: ["Necesitas vuelos internos o un vehículo rentado", "La ruta sur (Barahona) requiere 4x4 para algunas playas"],
  },
];
