export interface ParqueAtraccion {
  nombre: string;
  descripcion: string;
  incluido: boolean;
}

export interface ParqueItem {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  coordenadas: { lat: number; lng: number };
  imagen: string;
  galeria: string[];
  descripcion: string;
  descripcionLarga: string;
  precioAdulto: number;
  precioNino: number;
  precioSenior?: number;
  rating: number;
  reviews: number;
  atracciones: ParqueAtraccion[];
  servicios: string[];
  horario: string;
  diasOperacion: string;
  duracion: string;
  incluye: string[];
  noIncluye: string[];
  queLlevar: string[];
  restricciones: string[];
  telefono: string;
  website: string;
  comoLlegar: string;
}

export const parquesData: Record<string, ParqueItem> = {
  "scape-park": {
    id: "scape-park",
    nombre: "Scape Park at Cap Cana",
    tipo: "Parque de Aventuras",
    ubicacion: "Cap Cana, Punta Cana",
    coordenadas: { lat: 18.4567, lng: -68.3789 },
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    descripcion: "Un parque eco-aventura que ofrece experiencias únicas en cenotes, tirolesas y cuevas naturales.",
    descripcionLarga: "Scape Park es un destino eco-aventura de primer nivel ubicado en el exclusivo desarrollo de Cap Cana. Este parque único ofrece una combinación perfecta de belleza natural, aventura y cultura, permitiendo a los visitantes explorar cenotes de aguas cristalinas, descender en tirolesa sobre paisajes impresionantes y descubrir cuevas con historia taína. El Hoyo Azul, un cenote natural de 14 metros de profundidad con aguas turquesas, es la atracción estrella del parque.",
    precioAdulto: 149,
    precioNino: 99,
    precioSenior: 129,
    rating: 4.8,
    reviews: 2450,
    atracciones: [
      { nombre: "Hoyo Azul", descripcion: "Cenote natural de 14m con aguas cristalinas turquesas", incluido: true },
      { nombre: "Cenote Las Ondas", descripcion: "Piscina natural rodeada de vegetación tropical", incluido: true },
      { nombre: "Tirolesa sobre cenotes", descripcion: "8 líneas de zipline con vistas espectaculares", incluido: true },
      { nombre: "Cueva Taína", descripcion: "Exploración de cuevas con petroglifos ancestrales", incluido: true },
      { nombre: "Playa Juanillo", descripcion: "Acceso a una de las playas más bellas del Caribe", incluido: true },
      { nombre: "Buggies por la selva", descripcion: "Recorrido en vehículos todo terreno", incluido: false },
      { nombre: "Paseo a caballo", descripcion: "Cabalgata por senderos naturales", incluido: false }
    ],
    servicios: ["Estacionamiento gratuito", "Casilleros", "Restaurante", "Tienda de souvenirs", "Duchas", "WiFi", "Guías bilingües", "Equipos incluidos"],
    horario: "8:00 AM - 5:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "4-6 horas",
    incluye: ["Acceso a todas las atracciones básicas", "Equipos de seguridad", "Guía profesional", "Almuerzo buffet", "Snacks y bebidas", "Transporte en el parque"],
    noIncluye: ["Transporte desde hoteles", "Fotos profesionales", "Propinas", "Actividades premium"],
    queLlevar: ["Traje de baño", "Zapatos acuáticos", "Protector solar biodegradable", "Repelente de insectos", "Toalla", "Ropa de cambio", "Cámara resistente al agua"],
    restricciones: ["Niños menores de 4 años gratis", "Peso máximo para tirolesa: 120 kg", "No recomendado para embarazadas", "Restricciones de salud para actividades extremas"],
    telefono: "+1 809-469-7484",
    website: "https://scapepark.com",
    comoLlegar: "Ubicado a 15 minutos del aeropuerto de Punta Cana y a 20 minutos de la zona hotelera de Bávaro. Transporte disponible desde la mayoría de hoteles."
  },
  "ocean-world": {
    id: "ocean-world",
    nombre: "Ocean World Adventure Park",
    tipo: "Parque Acuático",
    ubicacion: "Puerto Plata",
    coordenadas: { lat: 19.7871, lng: -70.6826 },
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800"
    ],
    descripcion: "Interactúa con delfines, leones marinos y tiburones en este parque marino de clase mundial.",
    descripcionLarga: "Ocean World Adventure Park es el parque marino más grande del Caribe, ofreciendo encuentros inolvidables con la vida marina. Los visitantes pueden nadar con delfines, interactuar con leones marinos, alimentar tiburones y explorar un arrecife tropical. El parque combina entretenimiento con educación sobre conservación marina.",
    precioAdulto: 89,
    precioNino: 69,
    rating: 4.6,
    reviews: 1890,
    atracciones: [
      { nombre: "Nado con delfines", descripcion: "Experiencia interactiva de 30 minutos", incluido: false },
      { nombre: "Encuentro con tiburones", descripcion: "Alimenta y observa tiburones de cerca", incluido: true },
      { nombre: "Show de leones marinos", descripcion: "Espectáculo educativo y divertido", incluido: true },
      { nombre: "Snorkeling tropical", descripcion: "Explora el arrecife artificial", incluido: true },
      { nombre: "Playa privada", descripcion: "Acceso exclusivo a playa caribeña", incluido: true }
    ],
    servicios: ["Estacionamiento", "Casilleros", "Restaurantes", "Tiendas", "Duchas", "Fotografía profesional"],
    horario: "9:00 AM - 6:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "3-5 horas",
    incluye: ["Acceso general al parque", "Shows y exhibiciones", "Snorkeling básico", "Acceso a playa"],
    noIncluye: ["Nado con delfines (cargo extra)", "Fotos", "Almuerzo"],
    queLlevar: ["Traje de baño", "Protector solar", "Toalla", "Dinero en efectivo"],
    restricciones: ["Altura mínima para algunas actividades", "Reservar encuentros con anticipación"],
    telefono: "+1 809-291-1000",
    website: "https://oceanworld.net",
    comoLlegar: "Ubicado en Cofresí, a 10 minutos del centro de Puerto Plata. Transporte disponible desde hoteles de la zona."
  },
  "manati-park": {
    id: "manati-park",
    nombre: "Manatí Park Bavaro",
    tipo: "Parque Temático",
    ubicacion: "Bávaro, Punta Cana",
    coordenadas: { lat: 18.7123, lng: -68.4567 },
    imagen: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800",
      "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800"
    ],
    descripcion: "Parque que combina naturaleza, cultura taína y espectáculos con animales exóticos.",
    descripcionLarga: "Manatí Park es un parque temático único que fusiona la naturaleza tropical con la rica herencia cultural taína de República Dominicana. Los visitantes disfrutan de shows con delfines y leones marinos, exploran una recreación de una villa taína, observan caballos de paso fino dominicano y descubren una variedad de fauna tropical.",
    precioAdulto: 45,
    precioNino: 35,
    rating: 4.4,
    reviews: 1560,
    atracciones: [
      { nombre: "Show de delfines", descripcion: "Espectáculo acrobático y educativo", incluido: true },
      { nombre: "Villa Taína", descripcion: "Recreación histórica de aldea indígena", incluido: true },
      { nombre: "Serpentario", descripcion: "Exhibición de reptiles caribeños", incluido: true },
      { nombre: "Caballos dominicanos", descripcion: "Show de caballos de paso fino", incluido: true },
      { nombre: "Piscina natural", descripcion: "Área de nado y descanso", incluido: true }
    ],
    servicios: ["Estacionamiento", "Restaurante buffet", "Tiendas", "Baños"],
    horario: "9:00 AM - 5:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "3-4 horas",
    incluye: ["Entrada general", "Todos los shows", "Acceso a exhibiciones"],
    noIncluye: ["Almuerzo", "Fotos con animales", "Nado con delfines"],
    queLlevar: ["Ropa cómoda", "Cámara", "Protector solar"],
    restricciones: ["Nado con delfines requiere reserva previa"],
    telefono: "+1 809-221-9444",
    website: "https://manatipark.com",
    comoLlegar: "Ubicado en la carretera Bávaro-El Cortecito, a 5 minutos de la mayoría de hoteles de la zona."
  }
};
