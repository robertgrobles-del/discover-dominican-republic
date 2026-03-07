import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Calendar, MapPin, DollarSign, Users, Heart, Compass,
  Palmtree, Mountain, UtensilsCrossed, Camera, Star,
  Clock, ChevronRight, Plane, Hotel, Sun, Ship
} from "lucide-react";
import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import adventureImg from "@/assets/adventure.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";

type Itinerario = {
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

const itinerarios: Itinerario[] = [
  {
    id: "3-dias-express", titulo: "Escapada Express", duracion: "3 días", perfil: "Parejas / Weekend", presupuesto: "US$300-600",
    imagen: relaxBeach, icon: Clock, color: "text-sky-500",
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
    id: "5-dias-cultura", titulo: "Cultura y Playa", duracion: "5 días", perfil: "Cultural / Historia", presupuesto: "US$500-1,000",
    imagen: santoDomingo, icon: Camera, color: "text-amber-500",
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
    id: "7-dias-completo", titulo: "RD Completo", duracion: "7 días", perfil: "Explorador", presupuesto: "US$800-1,800",
    imagen: samana, icon: Compass, color: "text-emerald-500",
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
    id: "7-dias-lujo", titulo: "Lujo & Romance", duracion: "7 días", perfil: "Luna de Miel / Lujo", presupuesto: "US$3,000-8,000",
    imagen: puntaCana, icon: Heart, color: "text-rose-500",
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
    id: "7-dias-familia", titulo: "Aventura en Familia", duracion: "7 días", perfil: "Familia con Niños", presupuesto: "US$1,200-3,000",
    imagen: adventureImg, icon: Users, color: "text-blue-500",
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
    id: "14-dias-total", titulo: "Gran Tour RD", duracion: "14 días", perfil: "Aventurero Total", presupuesto: "US$1,500-4,000",
    imagen: gastronomy, icon: Mountain, color: "text-purple-500",
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

export default function ItinerariosRecomendados() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const itinerarioActivo = itinerarios.find(i => i.id === seleccionado);

  return (
    <PageTransition>
      <SEOHead
        title="Itinerarios de Viaje a República Dominicana - 3, 5, 7 y 14 Días"
        description="Itinerarios prediseñados para tu viaje a RD: escapada de 3 días, ruta cultural de 5 días, tour completo de 7 días o gran aventura de 14 días."
        keywords="itinerario viaje dominicana, plan viaje RD, ruta 7 días dominicana, que hacer en dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" /> Planifica tu Aventura
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Itinerarios <span className="text-primary">Recomendados</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige tu duración y estilo de viaje. Cada itinerario incluye día a día, presupuesto y consejos prácticos.
            </p>
          </div>
        </section>

        {/* Grid de itinerarios */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {itinerarios.map(it => (
                <Card
                  key={it.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${seleccionado === it.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSeleccionado(seleccionado === it.id ? null : it.id)}
                >
                  <div className="relative h-40">
                    <img src={it.imagen} alt={it.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-1">
                        <Clock className="h-3 w-3 mr-1" /> {it.duracion}
                      </Badge>
                      <h3 className="font-display text-lg font-bold text-white">{it.titulo}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {it.perfil}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {it.presupuesto}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{it.descripcion}</p>
                    <div className="flex flex-wrap gap-1">
                      {it.destinos.map(d => (
                        <Badge key={d} variant="outline" className="text-[10px]">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" /> {d}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Detalle del itinerario seleccionado */}
        {itinerarioActivo && (
          <section className="py-12 bg-card/50 border-t border-border">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                📋 {itinerarioActivo.titulo} — Día a Día
              </h2>

              <div className="space-y-4">
                {itinerarioActivo.dias.map(dia => (
                  <div key={dia.dia} className="bg-background rounded-xl p-5 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                        {dia.dia}
                      </div>
                      <h3 className="font-semibold text-foreground">{dia.titulo}</h3>
                    </div>
                    <ul className="space-y-1 ml-11">
                      {dia.actividades.map(act => (
                        <li key={act} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-3 w-3 text-primary shrink-0" /> {act}
                        </li>
                      ))}
                    </ul>
                    {dia.noche !== "—" && (
                      <p className="ml-11 mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Hotel className="h-3 w-3" /> Noche en: {dia.noche}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-background rounded-xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">✅ Incluye</h4>
                  <ul className="space-y-1">
                    {itinerarioActivo.incluye.map(i => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Star className="h-3 w-3 text-primary" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-background rounded-xl p-5 border border-border">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">💡 Tips</h4>
                  <ul className="space-y-1">
                    {itinerarioActivo.tips.map(t => (
                      <li key={t} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Sun className="h-3 w-3 text-amber-500" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
