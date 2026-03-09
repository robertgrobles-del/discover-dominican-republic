import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Cloud, Calendar, Play, ChevronRight, Users, Map, ArrowLeft, Bed, Utensils, GlassWater, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead, generateDestinationSchema } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

import { DestinationGallery } from "@/components/destination/DestinationGallery";
import { DestinationActivities } from "@/components/destination/DestinationActivities";
import { DestinationHotels } from "@/components/destination/DestinationHotels";
import { DestinationRestaurants } from "@/components/destination/DestinationRestaurants";
import { DestinationNightlife } from "@/components/destination/DestinationNightlife";
import { HowToGetThere } from "@/components/destination/HowToGetThere";
import { SubDestinationsSection } from "@/components/destinations/SubDestinationsSection";

// Static fallback data for rich destinations
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

// Static destination data with rich content
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
  restaurantes: { id: string; nombre: string; imagen: string; tipo: string; rating: number; precio: string; especialidad: string }[];
  vidaNocturna: { id: string; nombre: string; tipo: string; horario: string; ambiente: string }[];
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
    restaurantes: [
      { id: "el-cabito", nombre: "El Cabito", imagen: gastronomy, tipo: "Mariscos", rating: 4.7, precio: "$$", especialidad: "Pescado fresco con vista al mar" },
      { id: "xamana", nombre: "Xamaná Restaurant", imagen: gastronomy, tipo: "Fusión Caribeña", rating: 4.6, precio: "$$$", especialidad: "Cocina gourmet local" },
      { id: "la-mata", nombre: "La Mata Rosada", imagen: gastronomy, tipo: "Dominicano", rating: 4.5, precio: "$", especialidad: "Comida criolla auténtica" },
    ],
    vidaNocturna: [
      { id: "town-cafe", nombre: "Town Café", tipo: "Bar Lounge", horario: "18:00 - 02:00", ambiente: "Relajado" },
      { id: "malecon-bar", nombre: "Malecón Beach Bar", tipo: "Bar de Playa", horario: "10:00 - 00:00", ambiente: "Tropical" },
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
      { id: "paradisus", nombre: "Paradisus Palma Real", imagen: puntaCana, rating: 4.7, reviews: 623, precio: 380, distancia: "Bávaro", amenities: ["Todo Incluido", "Spa", "Casino"], categoria: "All-Inclusive" },
    ],
    restaurantes: [
      { id: "la-yola", nombre: "La Yola", imagen: gastronomy, tipo: "Mariscos", rating: 4.9, precio: "$$$$", especialidad: "Restaurante flotante con pescados frescos" },
      { id: "jellyfish", nombre: "Jellyfish Restaurant", imagen: gastronomy, tipo: "Mediterráneo", rating: 4.8, precio: "$$$", especialidad: "Cenas románticas frente al mar" },
      { id: "passion", nombre: "Passion by Martín Berasategui", imagen: gastronomy, tipo: "Alta Cocina", rating: 4.9, precio: "$$$$", especialidad: "Cocina de autor con estrella Michelin" },
      { id: "captain-cook", nombre: "Captain Cook", imagen: gastronomy, tipo: "Seafood", rating: 4.6, precio: "$$", especialidad: "Mariscos en ambiente casual" },
    ],
    vidaNocturna: [
      { id: "coco-bongo", nombre: "Coco Bongo", tipo: "Discoteca", horario: "22:00 - 04:00", ambiente: "Fiesta total con shows" },
      { id: "imagine", nombre: "Imagine Disco", tipo: "Club en Cueva", horario: "23:00 - 04:00", ambiente: "Club único en cuevas naturales" },
      { id: "oro-lounge", nombre: "ORO Nightclub", tipo: "Discoteca VIP", horario: "23:00 - 05:00", ambiente: "Premium y exclusivo" },
      { id: "pearl-beach", nombre: "Pearl Beach Club", tipo: "Beach Club", horario: "11:00 - 02:00", ambiente: "Pool parties y música en vivo" },
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
    restaurantes: [
      { id: "pat-e-palo", nombre: "Pat'e Palo", imagen: gastronomy, tipo: "Europeo", rating: 4.9, precio: "$$$", especialidad: "Cocina europea en edificio del siglo XVI" },
      { id: "meson-bari", nombre: "Mesón de Barí", imagen: gastronomy, tipo: "Dominicano", rating: 4.7, precio: "$$", especialidad: "Comida criolla tradicional" },
      { id: "la-cassina", nombre: "La Cassina", imagen: gastronomy, tipo: "Italiano", rating: 4.6, precio: "$$", especialidad: "Pastas artesanales" },
      { id: "adrian-tropical", nombre: "Adrián Tropical", imagen: gastronomy, tipo: "Dominicano", rating: 4.5, precio: "$", especialidad: "Mariscos con vista al Malecón" },
    ],
    vidaNocturna: [
      { id: "jet-set", nombre: "Jet Set", tipo: "Club VIP", horario: "23:00 - 06:00", ambiente: "Exclusivo y elegante" },
      { id: "mamma-lounge", nombre: "Mamma Lounge", tipo: "Rooftop Bar", horario: "18:00 - 02:00", ambiente: "Cócteles con vista panorámica" },
      { id: "casa-teatro", nombre: "Casa de Teatro", tipo: "Bar Cultural", horario: "20:00 - 02:00", ambiente: "Jazz y arte alternativo" },
      { id: "parada-77", nombre: "Parada 77", tipo: "Bar Bohemio", horario: "19:00 - 03:00", ambiente: "Música en vivo" },
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
      { id: "iberostar", nombre: "Iberostar Costa Dorada", imagen: puertoPlata, rating: 4.6, reviews: 567, precio: 220, distancia: "Costa Dorada", amenities: ["Todo Incluido", "Spa", "Actividades"], categoria: "All-Inclusive" },
    ],
    restaurantes: [
      { id: "mares", nombre: "Mares Restaurant", imagen: gastronomy, tipo: "Mariscos", rating: 4.7, precio: "$$$", especialidad: "Langosta y pescados frescos" },
      { id: "chris-ocean", nombre: "Chris & Madi's", imagen: gastronomy, tipo: "Internacional", rating: 4.6, precio: "$$", especialidad: "Cocina casual frente al mar" },
      { id: "lucia", nombre: "Lucia Restaurant", imagen: gastronomy, tipo: "Italiano", rating: 4.5, precio: "$$", especialidad: "Pizzas artesanales" },
    ],
    vidaNocturna: [
      { id: "lax", nombre: "LAX Ristopub", tipo: "Bar Lounge", horario: "18:00 - 02:00", ambiente: "Casual y animado" },
      { id: "bambu", nombre: "Bambu Club", tipo: "Discoteca", horario: "22:00 - 04:00", ambiente: "Música latina" },
      { id: "sosua-bay", nombre: "Sosúa Bay Beach Club", tipo: "Beach Club", horario: "10:00 - 23:00", ambiente: "Pool party diurna" },
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

// Map province slugs to destination slugs for unified routing
const provinceToDestinationMap: Record<string, string> = {
  "samana": "samana",
  "puerto-plata": "puerto-plata", 
  "distrito-nacional": "santo-domingo",
  "la-altagracia": "punta-cana",
};

export default function DestinoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Check for static data first - this allows immediate render
  const staticDestino = destinosData[id || ""] || (id ? destinosData[provinceToDestinationMap[id] || ""] : null);

  // Check if id is a valid UUID format
  const isUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

  // Only query DB if no static data exists
  const shouldQueryDb = !staticDestino;

  // First try to find in database (destinations table)
  const { data: dbDestination, isLoading: loadingDestination } = useQuery({
    queryKey: ["destination-detail", id],
    queryFn: async () => {
      let query = supabase.from("destinations").select(`
        *,
        province:provinces(id, name, slug, region, capital, population, area_km2, highlights, image_url)
      `);
      
      if (isUUID) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && shouldQueryDb,
  });

  // Also check if this is a province (only if not a destination and querying DB)
  const { data: dbProvince, isLoading: loadingProvince } = useQuery({
    queryKey: ["province-as-destination", id],
    queryFn: async () => {
      let query = supabase.from("provinces").select("*");
      
      if (isUUID) {
        query = query.or(`slug.eq.${id},id.eq.${id}`);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && shouldQueryDb && !loadingDestination && !dbDestination,
  });

  // Get related data for province view
  const provinceId = dbProvince?.id || dbDestination?.province_id;
  const destinationIds = dbDestination ? [dbDestination.id] : [];

  const { data: destinations } = useQuery({
    queryKey: ["province-destinations", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("province_id", provinceId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!provinceId && !!dbProvince,
  });

  const { data: municipalities } = useQuery({
    queryKey: ["province-municipalities", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const { data, error } = await supabase
        .from("municipalities")
        .select("*")
        .eq("province_id", provinceId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!provinceId && !!dbProvince,
  });

  const allDestinationIds = dbProvince && destinations ? destinations.map(d => d.id) : destinationIds;

  const { data: hotels } = useQuery({
    queryKey: ["destination-hotels", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: restaurants } = useQuery({
    queryKey: ["destination-restaurants", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: bars } = useQuery({
    queryKey: ["destination-bars", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  const { data: experiences } = useQuery({
    queryKey: ["destination-experiences", allDestinationIds],
    queryFn: async () => {
      if (allDestinationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .in("destination_id", allDestinationIds)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
    enabled: allDestinationIds.length > 0,
  });

  // Determine which view to show
  const isProvinceView = !!dbProvince && !dbDestination;
  const hasDbData = !!dbDestination || !!dbProvince;

  // Show loading only if we don't have static data AND we're still loading
  const showLoading = !staticDestino && (loadingDestination || loadingProvince);

  // Loading state (only when no static data available)
  if (showLoading) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <Skeleton className="h-[50vh] rounded-xl mb-8" />
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // 404 state - only if both static and DB data are missing (and not loading)
  if (!staticDestino && !hasDbData && !loadingDestination && !loadingProvince) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Destino no encontrado</h1>
            <Link to="/destinos">
              <Button>Ver todos los destinos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // Build display data
  const displayData = staticDestino ? {
    name: staticDestino.nombre,
    subtitle: staticDestino.subtitulo,
    description: staticDestino.descripcion,
    image: staticDestino.heroImage,
    region: "República Dominicana",
    clima: staticDestino.clima,
    temporada: staticDestino.temporada,
    galeria: staticDestino.galeria,
    highlights: [] as string[],
    population: null as number | null,
    area: null as number | null,
    capital: null as string | null,
  } : {
    name: dbProvince?.name || dbDestination?.name || "",
    subtitle: isProvinceView ? (dbProvince?.region || "Provincia") : "Destino Turístico",
    description: dbProvince?.description || dbDestination?.description || "",
    image: dbProvince?.image_url || dbDestination?.image_url || "/placeholder.svg",
    region: dbProvince?.region || dbDestination?.province?.region || "República Dominicana",
    clima: { temp: 28, condicion: "Tropical" },
    temporada: { meses: "Todo el año", evento: "Turismo" },
    galeria: (dbDestination?.gallery || []).map((src: string) => ({ src, alt: dbDestination?.name || "" })),
    highlights: dbProvince?.highlights || dbDestination?.highlights || [],
    population: dbProvince?.population || null,
    area: dbProvince?.area_km2 || null,
    capital: dbProvince?.capital || null,
  };

  const municipios = municipalities?.filter(m => m.municipality_type === 'municipio') || [];
  const distritos = municipalities?.filter(m => m.municipality_type === 'distrito_municipal') || [];

  return (
    <PageTransition>
      <SEOHead
        title={`${displayData.name} - ${displayData.subtitle}`}
        description={displayData.description}
        keywords={`${displayData.name}, República Dominicana, turismo, vacaciones, playas, hoteles`}
        image={displayData.image}
        jsonLd={generateDestinationSchema({
          name: displayData.name,
          description: displayData.description,
          image: displayData.image,
          url: `https://descubrerd.com/destino/${id}`,
        })}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={displayData.image}
            alt={displayData.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Link to={isProvinceView ? "/provincias" : "/destinos"} className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isProvinceView ? "Volver a Provincias" : "Volver a Destinos"}
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  {isProvinceView ? displayData.region : "DESTINO PREMIUM"}
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                  {displayData.name}
                  {displayData.subtitle && (
                    <>
                      <br />
                      <span className="text-gradient">{displayData.subtitle}</span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-white/80 max-w-xl mb-6">
                  {displayData.description}
                </p>
                
                {/* Province stats */}
                {isProvinceView && (
                  <div className="flex flex-wrap gap-4 text-white/90 mb-6">
                    {displayData.capital && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Capital: {displayData.capital}
                      </span>
                    )}
                    {displayData.population && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {displayData.population.toLocaleString()} habitantes
                      </span>
                    )}
                    {displayData.area && (
                      <span className="flex items-center gap-1">
                        <Map className="h-4 w-4" />
                        {displayData.area.toLocaleString()} km²
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2">
                    <Play className="h-4 w-4" /> Ver Video
                  </Button>
                  <FavoriteButton
                    id={id || ""}
                    type={isProvinceView ? "provincia" : "destino"}
                    name={displayData.name}
                    image={displayData.image}
                    location={displayData.region}
                    variant="button"
                    size="lg"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  />
                </div>
              </div>

              {/* Weather & Season Info */}
              <div className="flex gap-4">
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Cloud className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Clima</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{displayData.clima.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{displayData.clima.condicion}</p>
                </div>
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Temporada</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{displayData.temporada.meses}</p>
                  <p className="text-sm text-muted-foreground">{displayData.temporada.evento}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        {displayData.highlights && displayData.highlights.length > 0 && (
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2">
                {displayData.highlights.map((highlight: string, i: number) => (
                  <Badge key={i} variant="secondary">{highlight}</Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Static destination rich content */}
        {staticDestino && (
          <>
            {/* Gallery */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <DestinationGallery images={staticDestino.galeria} />
              </div>
            </section>

            {/* Description */}
            <section className="py-12 bg-card/30">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Sobre {staticDestino.nombre}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {staticDestino.descripcion} Este destino ofrece una combinación única de naturaleza, cultura y aventura 
                    que lo convierte en uno de los lugares más especiales de República Dominicana.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" /> {displayData.region}
                    </Badge>
                    <Badge variant="secondary">Mejor época: {staticDestino.temporada.meses}</Badge>
                    <Badge variant="secondary">{staticDestino.temporada.evento}</Badge>
                  </div>
                </div>
              </div>
            </section>

            {/* Activities */}
            <DestinationActivities activities={staticDestino.actividades} destinoId={id || ""} />

            {/* Hotels */}
            <DestinationHotels hotels={staticDestino.hoteles} destinoId={id || ""} />

            {/* Restaurants */}
            <DestinationRestaurants restaurantes={staticDestino.restaurantes} destinoId={id || ""} />

            {/* Nightlife */}
            <DestinationNightlife venues={staticDestino.vidaNocturna} destinoNombre={staticDestino.nombre} />

            {/* How to Get There */}
            <HowToGetThere 
              aeropuertoCercano={staticDestino.aeropuerto}
              opciones={staticDestino.transporte}
            />

            {/* Suggested Route */}
            <section className="py-16 bg-card/30">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                  Ruta Sugerida: {staticDestino.rutaSugerida.length} Días en {staticDestino.nombre}
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-0">
                    {staticDestino.rutaSugerida.map((dia, index) => (
                      <div key={dia.dia} className="relative pl-8 pb-8 last:pb-0">
                        {index < staticDestino.rutaSugerida.length - 1 && (
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
                      src={staticDestino.galeria[1]?.src || staticDestino.heroImage} 
                      alt="Ruta sugerida" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Link to="/mi-viaje">
                    <Button size="lg" className="gap-2">
                      Crear mi Itinerario Personalizado <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Dynamic database content with tabs */}
        {hasDbData && !staticDestino && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue={isProvinceView ? "destinos" : "hoteles"} className="space-y-8">
                <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0">
                  {isProvinceView && (
                    <TabsTrigger value="destinos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Destinos ({destinations?.length || 0})
                    </TabsTrigger>
                  )}
                  {isProvinceView && (
                    <TabsTrigger value="municipios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      Municipios ({municipios.length})
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="hoteles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Bed className="h-4 w-4 mr-2" />
                    Hoteles ({hotels?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="restaurantes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Utensils className="h-4 w-4 mr-2" />
                    Restaurantes ({restaurants?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="bares" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <GlassWater className="h-4 w-4 mr-2" />
                    Bares ({bars?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="actividades" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Actividades ({experiences?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Destinos Tab */}
                {isProvinceView && (
                  <TabsContent value="destinos">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {destinations?.map((destination) => (
                        <Link
                          key={destination.id}
                          to={`/destino/${destination.slug || destination.id}`}
                          className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={destination.image_url || "/placeholder.svg"}
                              alt={destination.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                              {destination.name}
                            </h3>
                            {destination.short_description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {destination.short_description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                      {(!destinations || destinations.length === 0) && (
                        <p className="text-muted-foreground col-span-full text-center py-12">
                          No hay destinos registrados.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Municipios Tab */}
                {isProvinceView && (
                  <TabsContent value="municipios">
                    <div className="space-y-8">
                      {municipios.length > 0 && (
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-4">
                            Municipios ({municipios.length})
                          </h3>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {municipios.map((municipio) => (
                              <div
                                key={municipio.id}
                                className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                              >
                                <h4 className="font-semibold text-foreground">{municipio.name}</h4>
                                {municipio.population && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {municipio.population.toLocaleString()} hab.
                                  </p>
                                )}
                                {municipio.is_tourist_destination && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    Destino Turístico
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {distritos.length > 0 && (
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-4">
                            Distritos Municipales ({distritos.length})
                          </h3>
                          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {distritos.map((distrito) => (
                              <div key={distrito.id} className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm font-medium text-foreground">{distrito.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {municipios.length === 0 && distritos.length === 0 && (
                        <p className="text-muted-foreground text-center py-12">
                          No hay municipios registrados.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Hoteles Tab */}
                <TabsContent value="hoteles">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hotels?.map((hotel) => (
                      <Link
                        key={hotel.id}
                        to={`/alojamiento/${hotel.slug || hotel.id}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={hotel.image_url || "/placeholder.svg"}
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {hotel.stars && (
                            <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                              {"★".repeat(hotel.stars)}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {hotel.name}
                          </h3>
                          {hotel.price_range && (
                            <p className="text-sm text-primary font-medium mt-1">{hotel.price_range}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                    {(!hotels || hotels.length === 0) && (
                      <p className="text-muted-foreground col-span-full text-center py-12">
                        No hay hoteles registrados.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Restaurantes Tab */}
                <TabsContent value="restaurantes">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {restaurants?.map((restaurant) => (
                      <Link
                        key={restaurant.id}
                        to={`/restaurante/${restaurant.slug || restaurant.id}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={restaurant.image_url || "/placeholder.svg"}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {restaurant.cuisine_type && (
                            <Badge className="absolute top-3 left-3 bg-primary/90">
                              {restaurant.cuisine_type}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {restaurant.name}
                          </h3>
                          {restaurant.price_range && (
                            <p className="text-sm text-muted-foreground mt-1">{restaurant.price_range}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                    {(!restaurants || restaurants.length === 0) && (
                      <p className="text-muted-foreground col-span-full text-center py-12">
                        No hay restaurantes registrados.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Bares Tab */}
                <TabsContent value="bares">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bars?.map((bar) => (
                      <Link
                        key={bar.id}
                        to={`/bar/${bar.slug || bar.id}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={bar.image_url || "/placeholder.svg"}
                            alt={bar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {bar.bar_type && (
                            <Badge className="absolute top-3 left-3 bg-primary/90">
                              {bar.bar_type}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {bar.name}
                          </h3>
                          {bar.music_style && (
                            <p className="text-sm text-muted-foreground mt-1">{bar.music_style}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                    {(!bars || bars.length === 0) && (
                      <p className="text-muted-foreground col-span-full text-center py-12">
                        No hay bares registrados.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Actividades Tab */}
                <TabsContent value="actividades">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {experiences?.map((exp) => (
                      <Link
                        key={exp.id}
                        to={`/experiencia/${exp.slug || exp.id}`}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={exp.image_url || "/placeholder.svg"}
                            alt={exp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {exp.category && (
                            <Badge className="absolute top-3 left-3 bg-primary/90">
                              {exp.category}
                            </Badge>
                          )}
                          {exp.difficulty && (
                            <Badge className="absolute top-3 right-3 bg-card/90 text-foreground">
                              {exp.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {exp.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {exp.duration && (
                              <span className="text-xs text-muted-foreground">{exp.duration}</span>
                            )}
                            {exp.price_range && (
                              <span className="text-xs text-primary font-medium">{exp.price_range}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {(!experiences || experiences.length === 0) && (
                      <p className="text-muted-foreground col-span-full text-center py-12">
                        No hay actividades registradas.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}

        {/* Sub-destinations for provinces */}
        {isProvinceView && destinations && destinations.length > 0 && (
          <SubDestinationsSection
            parentName={displayData.name}
            destinations={destinations}
            municipalities={municipalities || []}
          />
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}