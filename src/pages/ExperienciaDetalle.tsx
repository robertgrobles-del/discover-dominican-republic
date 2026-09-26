import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { 
  MapPin, Star, Clock, Users, ChevronRight, Heart, Share2, Play, Instagram, Check, 
  Sparkles, Calendar, DollarSign, Backpack, ShieldCheck, AlertCircle, Compass, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { DetailPageSidebarAd, MobileStickyFooterAd, BetweenSectionsAd } from "@/components/promo";
import { SectionWithSideAds } from "@/components/SectionWithSideAds";
import { ExperienceHeroSlider } from "@/components/experience/ExperienceHeroSlider";
import { getHotelsByDestination } from "@/data/hotels";
import { getRestaurantsByDestination } from "@/data/restaurants";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";

import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import samana from "@/assets/samana.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";

// Checklist de equipamiento recomendado por categoría
const EQUIPAMIENTO_CHECKLIST: Record<string, string[]> = {
  ecoturismo: [
    "Protector solar biodegradable (reef-safe)",
    "Repelente de mosquitos ecológico",
    "Calzado de senderismo impermeable o escarpines",
    "Botella de agua reutilizable térmica",
    "Binoculares para observación de aves/ballenas",
    "Cámara con funda impermeable o bolsa seca"
  ],
  aventura: [
    "Zapatillas deportivas con excelente agarre para roca mojada",
    "Ropa de secado rápido (dry-fit)",
    "Bolsa estanca (dry bag) para celular y documentos",
    "Gafas de sol con sujetador deportivo",
    "Toalla de microfibra compacta",
    "Muda de ropa seca para el regreso"
  ],
  acuaticos: [
    "Licra UV con protección solar UPF 50+",
    "Escarpines de neopreno o agua",
    "Máscara y tubo de snorkel propio (opcional)",
    "Funda sumergible para smartphone",
    "Toalla de playa grande",
    "Gorra o sombrero con ajuste"
  ],
  default: [
    "Documento de identidad / Pasaporte",
    "Efectivo en pesos dominicanos (DOP) para propinas locales",
    "Protector solar y sombrero",
    "Lentes de sol con protección UV",
    "Batería externa portátil para smartphone",
    "Cámara fotográfica para capturar paisajes"
  ]
};

// Experiences data
const experienciasData: Record<string, {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  heroImage: string;
  galeria: string[];
  highlights: string[];
  basePricePerPerson: number;
  lugares: { nombre: string; region: string; imagen: string; link: string }[];
  rutasInfluencers: { nombre: string; handle: string; avatar: string; ruta: string; descripcion: string }[];
  recomendaciones: string[];
  actividadesRelacionadas: { nombre: string; precio: number; duracion: string; imagen: string; rating: number }[];
}> = {
  ecoturismo: {
    id: "ecoturismo",
    nombre: "Ecoturismo",
    subtitulo: "Conecta con la Naturaleza",
    descripcion: "Descubre la biodiversidad única de República Dominicana a través de experiencias sostenibles que respetan y protegen nuestros ecosistemas naturales.",
    heroImage: whaleSamana,
    galeria: [whaleSamana, adventure, samana, diving],
    highlights: ["Parques nacionales protegidos", "Observación de ballenas", "Reservas de biosfera", "Turismo comunitario"],
    basePricePerPerson: 65,
    lugares: [
      { nombre: "Parque Nacional Los Haitises", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Bahía de las Águilas", region: "Pedernales", imagen: heroBeach, link: "/destino/pedernales" },
      { nombre: "Reserva Científica Valle Nuevo", region: "Constanza", imagen: adventure, link: "/destino/constanza" },
      { nombre: "Laguna Oviedo", region: "Barahona", imagen: diving, link: "/destino/barahona" },
    ],
    rutasInfluencers: [
      { nombre: "María Fernández", handle: "@viajera_eco", avatar: relaxBeach, ruta: "5 días eco en Samaná", descripcion: "Avistamiento de ballenas, kayak en manglares y senderismo al Salto del Limón." },
      { nombre: "Carlos Verde", handle: "@naturaleza_rd", avatar: adventure, ruta: "Ruta Sur Profundo", descripcion: "Bahía de las Águilas, Laguna Oviedo y Hoyo de Pelempito en 4 días." },
    ],
    recomendaciones: ["Lleva ropa cómoda y biodegradable", "Respeta los senderos marcados", "No alimentes a la fauna silvestre", "Contrata guías locales certificados"],
    actividadesRelacionadas: [
      { nombre: "Avistamiento de Ballenas", precio: 85, duracion: "4 horas", imagen: whaleSamana, rating: 4.9 },
      { nombre: "Kayak en Manglares", precio: 45, duracion: "3 horas", imagen: diving, rating: 4.7 },
      { nombre: "Senderismo Los Haitises", precio: 65, duracion: "5 horas", imagen: samana, rating: 4.8 },
    ],
  },
  aventura: {
    id: "aventura",
    nombre: "Aventura",
    subtitulo: "Adrenalina en el Paraíso",
    descripcion: "Desde los 27 charcos de Damajagua hasta el rafting en Jarabacoa, República Dominicana es el destino perfecto para los amantes de la aventura.",
    heroImage: adventure,
    galeria: [adventure, diving, samana, whaleSamana],
    highlights: ["Rafting y canyoning", "Tirolesas extremas", "Parapente", "Escalada y rappel"],
    basePricePerPerson: 75,
    lugares: [
      { nombre: "27 Charcos de Damajagua", region: "Puerto Plata", imagen: adventure, link: "/destino/puerto-plata" },
      { nombre: "Jarabacoa", region: "La Vega", imagen: samana, link: "/destino/jarabacoa" },
      { nombre: "Pico Duarte", region: "La Vega", imagen: adventure, link: "/destino/pico-duarte" },
      { nombre: "Cueva Fun Fun", region: "Hato Mayor", imagen: diving, link: "/destino/hato-mayor" },
    ],
    rutasInfluencers: [
      { nombre: "Pedro Aventurero", handle: "@extreme_rd", avatar: adventure, ruta: "Semana de Adrenalina", descripcion: "27 Charcos, rafting en Jarabacoa, y subida al Pico Duarte en 7 días épicos." },
      { nombre: "Ana Montaña", handle: "@alturas_rd", avatar: samana, ruta: "Conquista el Pico", descripcion: "Preparación y ascenso al punto más alto del Caribe en 3 días." },
    ],
    recomendaciones: ["Entrena previamente para actividades de alta intensidad", "Usa calzado apropiado y resistente al agua", "Contrata operadores certificados", "Lleva protección solar reef-safe"],
    actividadesRelacionadas: [
      { nombre: "27 Charcos de Damajagua", precio: 55, duracion: "4 horas", imagen: adventure, rating: 4.9 },
      { nombre: "Rafting Río Yaque", precio: 75, duracion: "3 horas", imagen: diving, rating: 4.8 },
      { nombre: "Tirolesa Anamuya", precio: 89, duracion: "2 horas", imagen: samana, rating: 4.7 },
    ],
  },
  cultura: {
    id: "cultura",
    nombre: "Cultura",
    subtitulo: "500 Años de Historia",
    descripcion: "La primera ciudad del Nuevo Mundo, ritmos de merengue y bachata, y tradiciones que definen la identidad dominicana.",
    heroImage: santoDomingo,
    galeria: [santoDomingo, merengue, gastronomy, samana],
    highlights: ["Zona Colonial UNESCO", "Música y baile", "Artesanías", "Festivales tradicionales"],
    basePricePerPerson: 45,
    lugares: [
      { nombre: "Zona Colonial", region: "Santo Domingo", imagen: santoDomingo, link: "/destino/santo-domingo" },
      { nombre: "Altos de Chavón", region: "La Romana", imagen: hotelEdenRoc, link: "/destino/la-romana" },
      { nombre: "Santiago de los Caballeros", region: "Santiago", imagen: adventure, link: "/destino/santiago" },
      { nombre: "La Vega (Carnaval)", region: "La Vega", imagen: merengue, link: "/destino/la-vega" },
    ],
    rutasInfluencers: [
      { nombre: "Lucía Historia", handle: "@patrimonio_rd", avatar: santoDomingo, ruta: "Ruta Colonial Completa", descripcion: "Zona Colonial, Alcázar de Colón, y los mejores museos en 3 días culturales." },
      { nombre: "Juan Música", handle: "@ritmos_rd", avatar: merengue, ruta: "Merengue y Bachata Tour", descripcion: "Clases de baile, colmadones y conciertos en vivo." },
    ],
    recomendaciones: ["Visita los museos temprano para evitar multitudes", "Reserva clases de baile con anticipación", "Prueba la gastronomía local en cada destino", "Respeta los espacios religiosos"],
    actividadesRelacionadas: [
      { nombre: "Tour Zona Colonial", precio: 35, duracion: "3 horas", imagen: santoDomingo, rating: 4.9 },
      { nombre: "Clase de Merengue", precio: 25, duracion: "2 horas", imagen: merengue, rating: 4.8 },
      { nombre: "Tour Gastronómico", precio: 65, duracion: "4 horas", imagen: gastronomy, rating: 4.7 },
    ],
  },
  romance: {
    id: "romance",
    nombre: "Romance",
    subtitulo: "Amor en el Paraíso",
    descripcion: "Bodas de ensueño, lunas de miel inolvidables y escapadas románticas en los destinos más bellos del Caribe.",
    heroImage: relaxBeach,
    galeria: [relaxBeach, heroBeach, hotelEdenRoc, samana],
    highlights: ["Bodas en la playa", "Spas de parejas", "Cenas privadas al atardecer", "Suites de luna de miel"],
    basePricePerPerson: 120,
    lugares: [
      { nombre: "Cap Cana", region: "Punta Cana", imagen: hotelEdenRoc, link: "/destino/punta-cana" },
      { nombre: "Samaná", region: "Samaná", imagen: samana, link: "/destino/samana" },
      { nombre: "Casa de Campo", region: "La Romana", imagen: relaxBeach, link: "/destino/la-romana" },
      { nombre: "Playa Rincón", region: "Samaná", imagen: heroBeach, link: "/destino/samana" },
    ],
    rutasInfluencers: [
      { nombre: "Carolina & Luis", handle: "@love_caribbean", avatar: relaxBeach, ruta: "Luna de Miel Perfecta", descripcion: "7 días entre spas, playas privadas y cenas románticas." },
    ],
    recomendaciones: ["Reserva con 6-12 meses de anticipación para bodas", "Pide paquetes románticos en tu hotel", "Los atardeceres en Samaná son mágicos"],
    actividadesRelacionadas: [
      { nombre: "Cena Privada en la Playa", precio: 250, duracion: "3 horas", imagen: relaxBeach, rating: 4.9 },
      { nombre: "Spa de Parejas", precio: 180, duracion: "2 horas", imagen: hotelEdenRoc, rating: 4.8 },
    ],
  },
  golf: {
    id: "golf",
    nombre: "Golf",
    subtitulo: "Campos de Clase Mundial",
    descripcion: "República Dominicana cuenta con más campos de golf que cualquier otro destino del Caribe, diseñados por leyendas como Pete Dye, Jack Nicklaus y Tom Fazio.",
    heroImage: hotelEdenRoc,
    galeria: [hotelEdenRoc, puntaCana, relaxBeach, adventure],
    highlights: ["30+ campos de golf", "Diseñadores legendarios", "Torneos internacionales", "Resorts especializados"],
    basePricePerPerson: 250,
    lugares: [
      { nombre: "Punta Espada (Cap Cana)", region: "Punta Cana", imagen: hotelEdenRoc, link: "/destino/punta-cana" },
      { nombre: "Teeth of the Dog", region: "La Romana", imagen: relaxBeach, link: "/destino/la-romana" },
    ],
    rutasInfluencers: [
      { nombre: "Pro Golfer", handle: "@fairway_rd", avatar: puntaCana, ruta: "Ruta Pete Dye", descripcion: "Todos los campos diseñados por el maestro en RD." },
    ],
    recomendaciones: ["Reserva tee times con anticipación en temporada alta", "Aprovecha los paquetes stay & play", "Juega temprano para evitar el calor"],
    actividadesRelacionadas: [
      { nombre: "Green Fee Punta Espada", precio: 395, duracion: "5 horas", imagen: hotelEdenRoc, rating: 4.9 },
      { nombre: "Green Fee Teeth of the Dog", precio: 325, duracion: "5 horas", imagen: relaxBeach, rating: 4.9 },
    ],
  },
  gastronomia: {
    id: "gastronomia",
    nombre: "Gastronomía",
    subtitulo: "Sabores del Caribe",
    descripcion: "Desde la tradicional Bandera Dominicana hasta la alta cocina caribeña, descubre los sabores que definen nuestra identidad culinaria.",
    heroImage: gastronomy,
    galeria: [gastronomy, merengue, santoDomingo, samana],
    highlights: ["Cocina tradicional", "Alta gastronomía", "Tours gastronómicos", "Clases de cocina"],
    basePricePerPerson: 50,
    lugares: [
      { nombre: "Zona Colonial (Restaurantes)", region: "Santo Domingo", imagen: santoDomingo, link: "/destino/santo-domingo" },
      { nombre: "Las Terrenas", region: "Samaná", imagen: samana, link: "/destino/samana" },
    ],
    rutasInfluencers: [
      { nombre: "Chef María", handle: "@sabores_rd", avatar: gastronomy, ruta: "Ruta del Sabor", descripcion: "Los mejores restaurantes y comedores del país en 5 días deliciosos." },
    ],
    recomendaciones: ["Prueba la Bandera Dominicana tradicional", "Los mariscos en Samaná son fresquísimos"],
    actividadesRelacionadas: [
      { nombre: "Tour Gastronómico Colonial", precio: 65, duracion: "4 horas", imagen: santoDomingo, rating: 4.8 },
      { nombre: "Clase de Cocina Dominicana", precio: 85, duracion: "3 horas", imagen: gastronomy, rating: 4.9 },
    ],
  },
  acuaticos: {
    id: "acuaticos",
    nombre: "Deportes Acuáticos",
    subtitulo: "Aventura en el Mar",
    descripcion: "Buceo, snorkel, kitesurfing, wakeboard y más en las aguas cristalinas del Caribe dominicano.",
    heroImage: diving,
    galeria: [diving, heroBeach, puntaCana, samana],
    highlights: ["Buceo certificado", "Kitesurfing", "Snorkel en arrecifes", "Pesca deportiva"],
    basePricePerPerson: 80,
    lugares: [
      { nombre: "Cabarete", region: "Puerto Plata", imagen: diving, link: "/destino/cabarete" },
      { nombre: "Sosúa", region: "Puerto Plata", imagen: heroBeach, link: "/destino/sosua" },
      { nombre: "Bayahíbe", region: "La Romana", imagen: puntaCana, link: "/destino/bayahibe" },
    ],
    rutasInfluencers: [
      { nombre: "Diver Pro", handle: "@deep_rd", avatar: diving, ruta: "Los Mejores Dives", descripcion: "Top 10 sitios de buceo en República Dominicana." },
    ],
    recomendaciones: ["Cabarete es la capital del kitesurf", "Buceo PADI disponible en todos los destinos"],
    actividadesRelacionadas: [
      { nombre: "Buceo Certificado (2 tanques)", precio: 120, duracion: "4 horas", imagen: diving, rating: 4.9 },
      { nombre: "Kitesurf Clase", precio: 150, duracion: "3 horas", imagen: heroBeach, rating: 4.8 },
    ],
  },
};

export default function ExperienciaDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const [saved, setSaved] = useState(false);
  const [numPersonas, setNumPersonas] = useState<number>(2);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const experiencia = experienciasData[id || "ecoturismo"] || experienciasData.ecoturismo;

  const checklist = EQUIPAMIENTO_CHECKLIST[experiencia.id] || EQUIPAMIENTO_CHECKLIST.default;

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const estimatedTotal = (experiencia.basePricePerPerson || 60) * numPersonas;

  const primaryDestinationId = experiencia.lugares[0]?.link?.startsWith("/destino/")
    ? experiencia.lugares[0].link.replace("/destino/", "")
    : undefined;
  const primaryDestinationName = experiencia.lugares[0]?.region;

  const nearbyHotels = useMemo(
    () => (primaryDestinationId ? getHotelsByDestination(primaryDestinationId) : []),
    [primaryDestinationId]
  );
  const nearbyRestaurants = useMemo(
    () => (primaryDestinationId ? getRestaurantsByDestination(primaryDestinationId) : []),
    [primaryDestinationId]
  );

  return (
    <PageTransition>
      <SEOHead
        title={`${experiencia.nombre} - ${experiencia.subtitulo} | Descubre RD`}
        description={experiencia.descripcion}
        image={experiencia.heroImage}
        keywords={`${experiencia.nombre}, ${experiencia.highlights.join(", ")}, república dominicana, turismo, tours`}
      />
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">
        <Header hasHero />

        {/* Hero Slider */}
        <ExperienceHeroSlider
          images={experiencia.galeria}
          name={experiencia.nombre}
          subtitle={experiencia.subtitulo}
          favoriteId={experiencia.id}
          destinationName={primaryDestinationName}
          hotels={nearbyHotels}
          restaurants={nearbyRestaurants}
        />

        {/* Main Content & Cotizador Section */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              
              {/* Columna Izquierda: Descripción y Highlights */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-border">
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span>EXPERIENCIA CURADA POR EXPERTOS</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    {experiencia.nombre}: {experiencia.subtitulo}
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                    {experiencia.descripcion}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`gap-2 ${saved ? 'bg-primary/20 border-primary text-primary' : ''}`}
                      onClick={() => {
                        setSaved(!saved);
                        toast.success(saved ? "Eliminado de guardados" : "¡Guardado en tus favoritos!");
                      }}
                    >
                      <Heart className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} /> 
                      {saved ? 'Guardado' : 'Guardar Experiencia'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: experiencia.nombre, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Enlace copiado al portapapeles");
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" /> Compartir
                    </Button>
                  </div>
                </div>

                {/* Highlights Bento */}
                <div className="bg-card rounded-3xl p-8 border border-border">
                  <h3 className="font-display text-xl font-bold mb-4">Lo más destacado</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {experiencia.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist interactivo para la mochila */}
                <div className="bg-card rounded-3xl p-8 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Backpack className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">Qué llevar en tu mochila</h3>
                      <p className="text-xs text-muted-foreground">Marca los artículos que vas empacando para tu viaje</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5 mt-6">
                    {checklist.map((item, idx) => {
                      const isDone = !!checkedItems[item];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleCheck(item)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${
                            isDone 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 line-through" 
                              : "bg-background border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                            isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/40"
                          }`}>
                            {isDone && <Check className="h-3 w-3" />}
                          </div>
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Cotizador Rápido y CTA */}
              <div className="sticky top-20 bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl space-y-6">
                <div className="border-b border-border pb-4">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 mb-2">
                    Operador Certificado MITUR
                  </Badge>
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      ${experiencia.basePricePerPerson || 60}
                    </span>
                    <span className="text-xs text-muted-foreground">USD / persona</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      Número de Viajeros
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 4, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setNumPersonas(num)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            numPersonas === num
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                              : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {num} {num === 1 ? "Persona" : "Personas"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-2xl p-4 space-y-2 border border-border/60">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tarifa base ({numPersonas}x ${experiencia.basePricePerPerson || 60})</span>
                      <span>${estimatedTotal} USD</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Seguro y Guía Certificado</span>
                      <span className="text-emerald-500 font-semibold">Incluido</span>
                    </div>
                    <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-sm text-foreground">
                      <span>Total Estimado</span>
                      <span className="text-lg text-primary">${estimatedTotal} USD</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 rounded-xl text-base shadow-lg shadow-primary/25">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reservar Experiencia
                </Button>

                <div className="space-y-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Cancelación gratuita hasta 24 horas antes
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-primary shrink-0" />
                    Transporte y degustación típica incluida
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Galería Fotográfica al final de la experiencia */}
        {experiencia.galeria && experiencia.galeria.length > 1 && (
          <section className="py-12 border-t border-border/60">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Galería de Momentos: {experiencia.nombre}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Capturas reales de las rutas, aventuras y paisajes de esta experiencia.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {experiencia.galeria.map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted group">
                    <img 
                      src={img} 
                      alt={`${experiencia.nombre} foto ${i + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lugares donde vivirla */}
        <section className="py-16 bg-card/40 border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <h3 className="font-display text-2xl font-bold text-foreground mb-8">
              Lugares Clave Donde Vivirla
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiencia.lugares.map((lugar) => (
                <Link key={lugar.nombre} to={lugar.link} className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={lugar.imagen} 
                      alt={lugar.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                      {lugar.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-primary" /> {lugar.region}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Ad antes del footer */}
        <BetweenSectionsAd position="experiencia-footer" />

        <Footer />
      </div>
    </PageTransition>
  );
}
