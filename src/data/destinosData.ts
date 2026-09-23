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

export const destinosData: Record<string, {
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

export const provinceToDestinationMap: Record<string, string> = {
  "samana": "samana",
  "puerto-plata": "puerto-plata", 
  "distrito-nacional": "santo-domingo",
  "la-altagracia": "punta-cana",
};
