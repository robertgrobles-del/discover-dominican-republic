import carnival from "@/assets/carnival.jpg";
import jazzFestival from "@/assets/jazz-festival.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";

export interface EventoItem {
  id: string;
  titulo: string;
  fecha: string;
  categoria: string;
  imagen: string;
  descripcion: string;
  ubicacion: string;
  provincia?: string;
  startsAt?: string;
}

export interface FestivalMusicalItem {
  id: string;
  nombre: string;
  genero: string;
  fecha: string;
  ubicacion: string;
  precio: string;
  imagen: string;
  descripcion: string;
}

export const categoriasEventos = ["Todo", "Culturales", "Regionales", "Ferias", "Exposiciones", "Música"];

export const generosMusicales = ["Todos", "Jazz", "Merengue", "Electrónica", "Bachata"];

export const staticEventos: EventoItem[] = [
  {
    id: "1",
    titulo: "Carnaval de La Vega",
    fecha: "5 OCT - 10:00 AM",
    categoria: "Cultural",
    imagen: carnival,
    descripcion: "La manifestación cultural más vibrante del Caribe...",
    ubicacion: "La Vega"
  },
  {
    id: "2",
    titulo: "DR Jazz Festival",
    fecha: "12 OCT - 6:00 PM",
    categoria: "Música",
    imagen: jazzFestival,
    descripcion: "Noches de jazz bajo las estrellas con artistas...",
    ubicacion: "Cabarete"
  },
  {
    id: "3",
    titulo: "Feria Gastronómica",
    fecha: "15 OCT - 9:00 AM",
    categoria: "Feria",
    imagen: gastronomy,
    descripcion: "Sabores auténticos de nuestra tierra...",
    ubicacion: "Santo Domingo"
  }
];

export const eventoDestacado = {
  titulo: "Carnaval de La Vega 2024",
  fechas: "5 de Octubre - 28 de Febrero",
  ubicacion: "La Vega, RD",
  countdown: { dias: 12, horas: 4, minutos: 20 },
  descripcion: `El Carnaval de La Vega es uno de los carnavales más antiguos y famosos de República Dominicana. Cada domingo de febrero, las calles se llenan de los tradicionales "Diablos Cojuelos", personajes con disfraces elaborados y máscaras impresionantes que son verdaderas obras de arte.

Este año contaremos con zonas VIP, conciertos al cierre de cada desfile y una exposición especial sobre la historia de las máscaras veganas. No te pierdas la oportunidad de vivir la cultura dominicana en su máxima expresión.`,
  agenda: [
    { hora: "10:00 AM", titulo: "Desfile de Comparsas Infantiles", desc: "Apertura con los grupos juveniles y escolares de la región." },
    { hora: "2:00 PM", titulo: "Salida de los Diablos Cojuelos", desc: "El evento principal. Desfile tradicional por la Calle Padre Adolfo." },
    { hora: "6:00 PM", titulo: "Gran Concierto de Cierre", desc: "Música en vivo con artistas nacionales en el Parque de las Flores." }
  ]
};

export const festivalesMusicales: FestivalMusicalItem[] = [
  {
    id: "jazz-festival",
    nombre: "Dominican Republic Jazz Festival",
    genero: "Jazz",
    fecha: "Nov 10-12",
    ubicacion: "Playa Cabarete, Puerto Plata",
    precio: "RD$ 2,500",
    imagen: jazzFestival,
    descripcion: "El festival de jazz más importante del Caribe con artistas internacionales."
  },
  {
    id: "festival-merengue",
    nombre: "Festival del Merengue Santo Domingo",
    genero: "Merengue",
    fecha: "Dic 05",
    ubicacion: "Malecón, Santo Domingo",
    precio: "Gratis",
    imagen: merengue,
    descripcion: "Celebración del ritmo nacional con los mejores exponentes del merengue."
  },
  {
    id: "electric-paradise",
    nombre: "Electric Paradise: New Year",
    genero: "Electrónica",
    fecha: "Dic 31",
    ubicacion: "Cap Cana, Punta Cana",
    precio: "US$ 150",
    imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop",
    descripcion: "La fiesta de fin de año más exclusiva con DJs internacionales."
  }
];

export interface EventDetailType {
  id: string;
  name: string;
  slug: string;
  event_type: string;
  description: string;
  short_description?: string;
  image_url: string;
  gallery?: string[];
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  address?: string;
  province?: string;
  price_range?: string;
  ticket_url?: string | null;
  organizer?: string;
  expected_attendees?: string;
  is_featured?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  coordinates?: { lat: number; lng: number };
  tips?: {
    dressCode?: string;
    parking?: string;
    familyFriendly?: string;
    gastronomy?: string;
  };
  agenda?: {
    hora: string;
    titulo: string;
    desc: string;
  }[];
}

export const eventosEstaticosCompletos: EventDetailType[] = [
  {
    id: "carnaval-la-vega",
    name: "Carnaval Dominicano de La Vega",
    slug: "carnaval-dominicano",
    event_type: "Carnaval Cultural",
    short_description: "La fiesta folclórica y expresión cultural más emblemática y colorida de República Dominicana.",
    description: `El Carnaval de La Vega es el evento cultural más antiguo, famoso e impactante del Caribe. Durante los domingos de febrero y celebraciones patrias, las avenidas de La Vega vibran al ritmo de la música, disfraces monumentales y los legendarios Diablos Cojuelos con sus vejigas tradicionales.

Decenas de comparsas procedentes de todo el país compiten con carrozas, vestimentas bordadas con lentejuelas y caretas moldeadas por maestros artesanos veganos. El evento incluye conciertos masivos con orquestas nacionales e internacionales, zonas de hospitalidad VIP, ferias de gastronomía típica y recorridos temáticos guiados.`,
    image_url: carnival,
    gallery: [
      carnival,
      merengue,
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&fit=crop&q=80"
    ],
    start_date: "2026-10-15",
    end_date: "2026-10-18",
    start_time: "14:00",
    end_time: "23:00",
    venue: "Parque de las Flores & Avenida de los Flamboyanes",
    address: "Calle Padre Adolfo esq. Av. Las Flores",
    province: "La Vega",
    price_range: "Entrada Libre / Gradas VIP disponibles",
    organizer: "UCAVE & Ministerio de Turismo (MITUR)",
    expected_attendees: "Más de 150,000 personas",
    is_featured: true,
    coordinates: { lat: 19.222, lng: -70.529 },
    tips: {
      dressCode: "Ropa ligera, calzado cómodo o tenis resistentes, gorra y protección solar durante el día.",
      parking: "Estacionamientos vigilados en los accesos norte y sur de la ciudad con servicio de shuttles.",
      familyFriendly: "Las mañanas (10:00 AM - 1:00 PM) son ideales para familias y desfiles infantiles protegidos.",
      gastronomy: "Puestos de lechón asado, chicharrón de La Vega, batatas asadas y refrescantes aguas de coco."
    },
    agenda: [
      { hora: "10:00 AM", titulo: "Apertura y Desfile Infantil", desc: "Comparsas juveniles y escolares por el bulevar central." },
      { hora: "02:30 PM", titulo: "Salida Oficial de Diablos Cojuelos", desc: "El momento cumbre: cientos de personajes tradicionales invaden la calle principal." },
      { hora: "06:00 PM", titulo: "Desfile de Carrozas Fantasía", desc: "Presentación de las reinas de belleza y carrozas monumentales iluminadas." },
      { hora: "08:30 PM", titulo: "Mega Concierto de Cierre", desc: "Artistas de merengue, bachata y música urbana en la tarima Presidente." }
    ]
  },
  {
    id: "dr-jazz-festival",
    name: "Dominican Republic Jazz Festival",
    slug: "dr-jazz-festival",
    event_type: "Festival Internacional de Música",
    short_description: "Noches mágicas de jazz bajo las palmeras en la costa norte dominicana.",
    description: "Reúne a renombrados virtuosos del jazz latino, fusión y contemporáneo en escenarios al aire libre sobre la playa de Cabarete y Puerto Plata. Incluye clínicas gratuitas de educación musical para niños impartidas por profesores de Berklee College of Music.",
    image_url: jazzFestival,
    gallery: [
      jazzFestival,
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&fit=crop&q=80"
    ],
    start_date: "2026-11-10",
    end_date: "2026-11-12",
    start_time: "18:30",
    end_time: "00:00",
    venue: "Playa Cabarete",
    address: "Bulevar de la Bahía de Cabarete",
    province: "Puerto Plata",
    price_range: "Entrada Gratuita al Público / Zona Benefactores",
    organizer: "Fundación Educativa FEDUJAZZ & MITUR",
    expected_attendees: "15,000 asistentes",
    is_featured: true,
    coordinates: { lat: 19.752, lng: -70.408 },
    tips: {
      dressCode: "Tropical Chic / Elegante relajado frente al mar.",
      parking: "Áreas señalizadas en el centro de Cabarete a poca distancia caminando de la playa.",
      familyFriendly: "Ambiente muy seguro y cultural, ideal para todas las edades.",
      gastronomy: "Bares y restaurantes costeros con cocina internacional y cócteles de autor."
    },
    agenda: [
      { hora: "05:00 PM", titulo: "Talleres y Jam Sessions Juveniles", desc: "Clases magistrales frente a la orilla." },
      { hora: "07:00 PM", titulo: "Apertura Cuarteto Dominicano", desc: "Jazz con influencia de ritmos autóctonos como la mangulina y el carabiné." },
      { hora: "09:00 PM", titulo: "Concierto Estelar Internacional", desc: "Artistas ganadores de Grammy en el escenario principal." }
    ]
  },
  {
    id: "festival-merengue",
    name: "Festival del Merengue & Ritmos Caribeños",
    slug: "festival-merengue",
    event_type: "Música & Danza Popular",
    short_description: "La mayor fiesta bailable de nuestro ritmo patrimonio inmaterial de la UNESCO.",
    description: "Cada año, el Malecón de Santo Domingo se convierte en la pista de baile más grande del mundo para celebrar el Merengue y la Bachata con orquestas en vivo, parejas de baile folclórico y exhibición gastronómica criolla.",
    image_url: merengue,
    gallery: [merengue],
    start_date: "2026-12-05",
    end_date: "2026-12-06",
    start_time: "19:00",
    end_time: "02:00",
    venue: "Malecón de Santo Domingo",
    address: "Av. George Washington frente al Obelisco Macho",
    province: "Santo Domingo",
    price_range: "Acceso Libre",
    organizer: "Alcaldía del Distrito Nacional & MITUR",
    expected_attendees: "50,000 personas",
    is_featured: true,
    coordinates: { lat: 18.468, lng: -69.896 }
  }
];
