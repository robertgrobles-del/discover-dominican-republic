import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { MapPin, Cloud, Calendar, Heart, Share2, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { DestinationActivities } from "@/components/destination/DestinationActivities";
import { DestinationHotels } from "@/components/destination/DestinationHotels";
import { HowToGetThere } from "@/components/destination/HowToGetThere";

import samana from "@/assets/samana.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import adventure from "@/assets/adventure.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import diving from "@/assets/diving.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import merengue from "@/assets/merengue-dance.jpg";

// Destination data
const destinosData: Record<string, {
  nombre: string;
  subtitulo: string;
  descripcion: string;
  heroImage: string;
  clima: { temp: number; condicion: string };
  temporada: { meses: string; evento: string };
  galeria: { src: string; alt: string }[];
  actividades: { id: string; nombre: string; imagen: string; categoria: string; rating: number; duracion: string; precio: number }[];
  hoteles: { id: string; nombre: string; imagen: string; rating: number; reviews: number; precio: number; distancia: string; amenities: string[]; categoria: string }[];
  aeropuerto: { nombre: string; codigo: string; distancia: string };
  transporte: { tipo: "avion" | "carro" | "bus" | "barco"; desde: string; duracion: string; descripcion: string; precio?: string }[];
  rutaSugerida: { dia: number; titulo: string; lugar: string; desc: string }[];
}> = {
  samana: {
    nombre: "Samaná",
    subtitulo: "El Tesoro Escondido",
    descripcion: "Donde la selva abraza el mar. Descubre un paraíso virgen de playas infinitas, ballenas jorobadas y naturaleza exuberante.",
    heroImage: samana,
    clima: { temp: 28, condicion: "Soleado, cielo despejado" },
    temporada: { meses: "Ene - Mar", evento: "Avistamiento Ballenas" },
    galeria: [
      { src: samana, alt: "Vista panorámica de Samaná" },
      { src: whaleSamana, alt: "Ballenas jorobadas" },
      { src: heroBeach, alt: "Playa El Limón" },
      { src: adventure, alt: "Senderismo en Samaná" },
      { src: relaxBeach, alt: "Cayo Levantado" },
    ],
    actividades: [
      { id: "whale-watching", nombre: "Avistamiento de Ballenas", imagen: whaleSamana, categoria: "Naturaleza", rating: 4.9, duracion: "4 horas", precio: 85 },
      { id: "salto-limon", nombre: "Senderismo al Salto del Limón", imagen: adventure, categoria: "Aventura", rating: 4.8, duracion: "3 horas", precio: 45 },
      { id: "cayo-levantado", nombre: "Excursión a Cayo Levantado", imagen: heroBeach, categoria: "Playa", rating: 4.7, duracion: "6 horas", precio: 65 },
      { id: "kayak-manglares", nombre: "Kayak en Manglares", imagen: diving, categoria: "Aventura", rating: 4.6, duracion: "2 horas", precio: 35 },
    ],
    hoteles: [
      { id: "ecolodge-samana", nombre: "Samaná Eco-Lodge & Spa", imagen: hotelClareVerde, rating: 4.8, reviews: 328, precio: 350, distancia: "5 min", amenities: ["WiFi", "Spa", "Restaurante", "Playa Privada"], categoria: "Eco-Lodge" },
      { id: "villa-samana", nombre: "Villa Mar Boutique", imagen: heroBeach, rating: 4.6, reviews: 156, precio: 180, distancia: "10 min", amenities: ["WiFi", "Piscina", "Desayuno"], categoria: "Boutique" },
    ],
    aeropuerto: { nombre: "Aeropuerto Internacional El Catey", codigo: "AZS", distancia: "45 min" },
    transporte: [
      { tipo: "avion", desde: "Santo Domingo", duracion: "35 min", descripcion: "Vuelos directos diarios desde SDQ", precio: "$120" },
      { tipo: "carro", desde: "Santo Domingo", duracion: "2.5 horas", descripcion: "Por la autopista del Nordeste, ruta escénica", precio: "$80 (taxi)" },
      { tipo: "bus", desde: "Santo Domingo", duracion: "3 horas", descripcion: "Transporte Caribe Tours con salidas frecuentes", precio: "$8" },
      { tipo: "barco", desde: "Sabana de la Mar", duracion: "1 hora", descripcion: "Ferry panorámico con vista a la bahía", precio: "$5" },
    ],
    rutaSugerida: [
      { dia: 1, titulo: "AVENTURA MARINA", lugar: "Santuario de Ballenas & Cayo Levantado", desc: "Salida en bote para un encuentro mágico con las ballenas jorobadas y atardecer en Cayo Levantado." },
      { dia: 2, titulo: "SELVA ADENTRO", lugar: "Senderismo al Salto del Limón", desc: "Caminata por el bosque lluvioso hasta la impresionante cascada de 40 metros." },
      { dia: 3, titulo: "PLAYAS VÍRGENES", lugar: "Playa Rincón", desc: "Relájate en una de las 10 mejores playas del mundo." },
    ],
  },
  "punta-cana": {
    nombre: "Punta Cana",
    subtitulo: "El Paraíso del Caribe",
    descripcion: "Playas de arena blanca, resorts de clase mundial y deportes acuáticos. El destino más visitado del Caribe te espera.",
    heroImage: puntaCana,
    clima: { temp: 30, condicion: "Soleado con brisa marina" },
    temporada: { meses: "Todo el año", evento: "Temporada de Golf" },
    galeria: [
      { src: puntaCana, alt: "Playa Bávaro" },
      { src: relaxBeach, alt: "Resort frente al mar" },
      { src: diving, alt: "Buceo en arrecifes" },
      { src: hotelEdenRoc, alt: "Hoyo de golf" },
      { src: gastronomy, alt: "Gastronomía local" },
    ],
    actividades: [
      { id: "snorkel-punta", nombre: "Snorkel en Arrecifes", imagen: diving, categoria: "Acuático", rating: 4.8, duracion: "3 horas", precio: 55 },
      { id: "golf-punta", nombre: "Golf en La Cana", imagen: hotelEdenRoc, categoria: "Golf", rating: 4.9, duracion: "4 horas", precio: 195 },
      { id: "catamaran", nombre: "Tour en Catamarán", imagen: heroBeach, categoria: "Playa", rating: 4.7, duracion: "6 horas", precio: 89 },
      { id: "zipline", nombre: "Tirolesa en Anamuya", imagen: adventure, categoria: "Aventura", rating: 4.6, duracion: "2 horas", precio: 75 },
    ],
    hoteles: [
      { id: "eden-roc", nombre: "Eden Roc Cap Cana", imagen: hotelEdenRoc, rating: 4.9, reviews: 512, precio: 580, distancia: "En zona hotelera", amenities: ["WiFi", "Spa", "Golf", "Playa Privada"], categoria: "Lujo" },
      { id: "secrets-punta", nombre: "Secrets Royal Beach", imagen: relaxBeach, rating: 4.8, reviews: 389, precio: 420, distancia: "En Bávaro", amenities: ["Todo Incluido", "Spa", "8 Restaurantes"], categoria: "All-Inclusive" },
    ],
    aeropuerto: { nombre: "Aeropuerto Internacional de Punta Cana", codigo: "PUJ", distancia: "20 min" },
    transporte: [
      { tipo: "avion", desde: "Santo Domingo", duracion: "45 min", descripcion: "Vuelos directos desde SDQ", precio: "$150" },
      { tipo: "carro", desde: "Santo Domingo", duracion: "2 horas", descripcion: "Por la autopista del Este, muy bien señalizada", precio: "$120 (taxi)" },
      { tipo: "bus", desde: "Santo Domingo", duracion: "3 horas", descripcion: "Expreso Bávaro con salidas cada hora", precio: "$10" },
    ],
    rutaSugerida: [
      { dia: 1, titulo: "RELAX TOTAL", lugar: "Playa Bávaro & Spa", desc: "Día de playa y tratamientos de spa en tu resort." },
      { dia: 2, titulo: "AVENTURA ACUÁTICA", lugar: "Snorkel y Catamarán", desc: "Explora los arrecifes y navega por la costa." },
      { dia: 3, titulo: "GOLF & GASTRONOMÍA", lugar: "Campo de Golf & Cena Gourmet", desc: "18 hoyos y cena con vistas al mar." },
    ],
  },
  "santo-domingo": {
    nombre: "Santo Domingo",
    subtitulo: "La Cuna de América",
    descripcion: "500 años de historia, arquitectura colonial, vida nocturna vibrante y la mejor gastronomía del Caribe en la capital más antigua de América.",
    heroImage: santoDomingo,
    clima: { temp: 27, condicion: "Parcialmente nublado" },
    temporada: { meses: "Nov - Abr", evento: "Festival de Merengue" },
    galeria: [
      { src: santoDomingo, alt: "Zona Colonial" },
      { src: merengue, alt: "Baile de Merengue" },
      { src: gastronomy, alt: "Gastronomía dominicana" },
      { src: hotelClareVerde, alt: "Hotel Boutique Colonial" },
      { src: adventure, alt: "Paseo por el Malecón" },
    ],
    actividades: [
      { id: "colonial-tour", nombre: "Tour Zona Colonial", imagen: santoDomingo, categoria: "Cultura", rating: 4.9, duracion: "3 horas", precio: 35 },
      { id: "merengue-class", nombre: "Clase de Merengue", imagen: merengue, categoria: "Cultura", rating: 4.8, duracion: "2 horas", precio: 25 },
      { id: "food-tour", nombre: "Tour Gastronómico", imagen: gastronomy, categoria: "Gastronomía", rating: 4.7, duracion: "4 horas", precio: 65 },
      { id: "malecon-night", nombre: "Noche en el Malecón", imagen: adventure, categoria: "Vida Nocturna", rating: 4.5, duracion: "4 horas", precio: 45 },
    ],
    hoteles: [
      { id: "billini", nombre: "Billini Hotel", imagen: hotelClareVerde, rating: 4.9, reviews: 287, precio: 220, distancia: "En Zona Colonial", amenities: ["WiFi", "Piscina", "Restaurante", "Bar Rooftop"], categoria: "Boutique" },
      { id: "jw-marriott", nombre: "JW Marriott Santo Domingo", imagen: hotelEdenRoc, rating: 4.8, reviews: 445, precio: 280, distancia: "5 min de la Zona Colonial", amenities: ["WiFi", "Gym", "Spa", "Business Center"], categoria: "Lujo" },
    ],
    aeropuerto: { nombre: "Aeropuerto Internacional Las Américas", codigo: "SDQ", distancia: "30 min" },
    transporte: [
      { tipo: "avion", desde: "Miami", duracion: "2.5 horas", descripcion: "Vuelos directos desde principales ciudades de USA y Europa" },
      { tipo: "carro", desde: "Punta Cana", duracion: "2 horas", descripcion: "Por la autopista del Este" },
      { tipo: "bus", desde: "Puerto Plata", duracion: "4 horas", descripcion: "Caribe Tours y Metro", precio: "$12" },
    ],
    rutaSugerida: [
      { dia: 1, titulo: "HISTORIA VIVA", lugar: "Zona Colonial", desc: "Recorre las calles más antiguas de América y visita la Catedral Primada." },
      { dia: 2, titulo: "SABORES LOCALES", lugar: "Tour Gastronómico", desc: "Prueba la mejor comida dominicana en mercados y restaurantes locales." },
      { dia: 3, titulo: "CULTURA & BAILE", lugar: "Clase de Merengue & Vida Nocturna", desc: "Aprende a bailar merengue y disfruta de la noche capitalina." },
    ],
  },
  "puerto-plata": {
    nombre: "Puerto Plata",
    subtitulo: "La Costa del Ámbar",
    descripcion: "Playas doradas, la única montaña con teleférico del Caribe y la herencia del ámbar dominicano te esperan en la costa norte.",
    heroImage: puertoPlata,
    clima: { temp: 27, condicion: "Brisa tropical" },
    temporada: { meses: "Dic - Abr", evento: "Festival del Ámbar" },
    galeria: [
      { src: puertoPlata, alt: "Vista de Puerto Plata" },
      { src: adventure, alt: "Teleférico" },
      { src: relaxBeach, alt: "Playa Sosúa" },
      { src: diving, alt: "Buceo en arrecifes" },
      { src: gastronomy, alt: "Gastronomía local" },
    ],
    actividades: [
      { id: "teleferico", nombre: "Teleférico Isabel de Torres", imagen: adventure, categoria: "Aventura", rating: 4.8, duracion: "2 horas", precio: 20 },
      { id: "27-charcos", nombre: "27 Charcos de Damajagua", imagen: diving, categoria: "Aventura", rating: 4.9, duracion: "4 horas", precio: 55 },
      { id: "sosua-dive", nombre: "Buceo en Sosúa", imagen: diving, categoria: "Acuático", rating: 4.7, duracion: "3 horas", precio: 85 },
      { id: "ambar-museum", nombre: "Museo del Ámbar", imagen: santoDomingo, categoria: "Cultura", rating: 4.5, duracion: "1.5 horas", precio: 10 },
    ],
    hoteles: [
      { id: "casa-colonial", nombre: "Casa Colonial Beach & Spa", imagen: hotelEdenRoc, rating: 4.8, reviews: 234, precio: 320, distancia: "Playa Dorada", amenities: ["WiFi", "Spa", "Golf", "Playa Privada"], categoria: "Resort" },
      { id: "blue-bay", nombre: "Blue Bay Villas Doradas", imagen: relaxBeach, rating: 4.5, reviews: 412, precio: 180, distancia: "Playa Dorada", amenities: ["Todo Incluido", "Piscina", "Shows"], categoria: "All-Inclusive" },
    ],
    aeropuerto: { nombre: "Aeropuerto Internacional Gregorio Luperón", codigo: "POP", distancia: "15 min" },
    transporte: [
      { tipo: "avion", desde: "Santo Domingo", duracion: "35 min", descripcion: "Vuelos directos desde SDQ", precio: "$100" },
      { tipo: "carro", desde: "Santo Domingo", duracion: "3 horas", descripcion: "Por la autopista Duarte, paisajes montañosos", precio: "$150 (taxi)" },
      { tipo: "bus", desde: "Santo Domingo", duracion: "4 horas", descripcion: "Caribe Tours con salidas frecuentes", precio: "$10" },
    ],
    rutaSugerida: [
      { dia: 1, titulo: "ALTURA Y NATURALEZA", lugar: "Teleférico & Monte Isabel", desc: "Sube al único teleférico del Caribe y disfruta las vistas panorámicas." },
      { dia: 2, titulo: "AVENTURA EXTREMA", lugar: "27 Charcos de Damajagua", desc: "Salta y deslízate por cascadas naturales en la selva." },
      { dia: 3, titulo: "PLAYA & CULTURA", lugar: "Sosúa & Museo del Ámbar", desc: "Snorkel en aguas cristalinas y descubre el oro dominicano." },
    ],
  },
};

export default function DestinoDetalle() {
  const { id } = useParams();
  const [heroLoaded, setHeroLoaded] = useState(false);

  const destino = destinosData[id || "samana"] || destinosData.samana;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-end overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={destino.heroImage}
            alt={destino.nombre}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  DESTINO PREMIUM
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                  {destino.nombre}:<br />
                  <span className="text-gradient">{destino.subtitulo}</span>
                </h1>
                <p className="text-lg text-white/80 max-w-xl mb-6">
                  {destino.descripcion}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2">
                    <Play className="h-4 w-4" /> Ver Video Completo
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Heart className="h-4 w-4" /> Guardar Destino
                  </Button>
                </div>
              </div>

              {/* Weather & Season Info */}
              <div className="flex gap-4">
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Cloud className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Clima Actual</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{destino.clima.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{destino.clima.condicion}</p>
                </div>
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Temporada</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{destino.temporada.meses}</p>
                  <p className="text-sm text-muted-foreground">{destino.temporada.evento}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <DestinationGallery images={destino.galeria} />
          </div>
        </section>

        {/* Description */}
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Sobre {destino.nombre}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {destino.descripcion} Este destino ofrece una combinación única de naturaleza, cultura y aventura 
                que lo convierte en uno de los lugares más especiales de República Dominicana. Desde playas 
                vírgenes hasta experiencias gastronómicas auténticas, {destino.nombre} tiene algo para cada viajero.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" /> Región Este
                </Badge>
                <Badge variant="secondary">Mejor época: {destino.temporada.meses}</Badge>
                <Badge variant="secondary">{destino.temporada.evento}</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Activities */}
        <DestinationActivities activities={destino.actividades} destinoId={id || "samana"} />

        {/* Hotels */}
        <DestinationHotels hotels={destino.hoteles} destinoId={id || "samana"} />

        {/* How to Get There */}
        <HowToGetThere 
          aeropuertoCercano={destino.aeropuerto}
          opciones={destino.transporte}
        />

        {/* Suggested Route */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Ruta Sugerida: {destino.rutaSugerida.length} Días en {destino.nombre}
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-0">
                {destino.rutaSugerida.map((dia, index) => (
                  <div key={dia.dia} className="relative pl-8 pb-8 last:pb-0">
                    {index < destino.rutaSugerida.length - 1 && (
                      <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-24px)] bg-border" />
                    )}
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      index === 0 ? "border-primary bg-primary/20" : "border-border bg-background"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                    </div>
                    <div>
                      <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                        DÍA {dia.dia}: {dia.titulo}
                      </span>
                      <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">{dia.lugar}</h3>
                      <p className="text-sm text-muted-foreground">{dia.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={destino.galeria[1]?.src || destino.heroImage} 
                  alt="Ruta sugerida" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/herramientas">
                <Button size="lg" className="gap-2">
                  Crear mi Itinerario Personalizado <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
