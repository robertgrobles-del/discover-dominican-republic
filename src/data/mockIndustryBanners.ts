export interface IndustryBannerDemo {
  id: string;
  industry: 
    | "hotels" 
    | "restaurants" 
    | "bars" 
    | "banks" 
    | "alcohol" 
    | "rentcar" 
    | "airlines" 
    | "airports" 
    | "government" 
    | "presidente";
  industryLabel: string;
  sponsor: string;
  sponsorTag: string;
  headline: string;
  subtext: string;
  ctaText: string;
  targetUrl: string;
  imageUrl: string;
  badgeColor?: string;
  bgGradient?: string;
}

export const INDUSTRY_BANNERS_DEMO: IndustryBannerDemo[] = [
  // 1. HOTELES
  {
    id: "demo-hotel-hardrock",
    industry: "hotels",
    industryLabel: "Hoteles & Resorts",
    sponsor: "Hard Rock Hotel & Casino Punta Cana",
    sponsorTag: "Resort 5 Estrellas Todo Incluido",
    headline: "Vive la Experiencia Legendaria Todo Incluido en Punta Cana",
    subtext: "13 piscinas de ensueño, 9 restaurantes de especialidad, campo de golf Nicklaus y acceso al casino más vibrante del Caribe.",
    ctaText: "Reservar con 35% OFF",
    targetUrl: "/alojamientos",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "demo-hotel-casadecampo",
    industry: "hotels",
    industryLabel: "Hoteles & Resorts",
    sponsor: "Casa de Campo Resort & Villas",
    sponsorTag: "Lujo Exclusivo La Romana",
    headline: "El Destino Más Exclusivo del Caribe: Golf PGA & Altos de Chavón",
    subtext: "Villas privadas con chef personal, marina deportiva internacional y la famosa cancha Teeth of the Dog.",
    ctaText: "Ver Tarifas Especiales",
    targetUrl: "/alojamientos",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },

  // 2. RESTAURANTES
  {
    id: "demo-rest-morisonando",
    industry: "restaurants",
    industryLabel: "Restaurantes & Alta Cocina",
    sponsor: "Restaurante Morisoñando by Chef Tita",
    sponsorTag: "Nueva Cocina Dominicana",
    headline: "Sabores Autóctonos de Quisqueya Elevados a la Alta Cocina",
    subtext: "Prueba nuestro chivo liniero confitado, risotto de sancocho y mariscos frescos de Samaná en un ambiente de vanguardia.",
    ctaText: "Reservar Mesa Online",
    targetUrl: "/guia-gastronomica",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  },
  {
    id: "demo-rest-patepalo",
    industry: "restaurants",
    industryLabel: "Restaurantes & Alta Cocina",
    sponsor: "Pat'e Palo European Brasserie",
    sponsorTag: "Primera Taberna de América • 1505",
    headline: "Cena Frente al Alcázar de Colón con Más de 500 Años de Historia",
    subtext: "Maridajes con vinos de reserva internacional, cortes importados y pescados frescos frente a la Plaza España.",
    ctaText: "Ver Menú & Carta",
    targetUrl: "/guia-gastronomica",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30"
  },

  // 3. BARES & VIDA NOCTURNA
  {
    id: "demo-bar-onnos",
    industry: "bars",
    industryLabel: "Bares & Vida Nocturna",
    sponsor: "Onno's Bar & Beach Club Bávaro",
    sponsorTag: "Coctelería & Fiesta en la Playa",
    headline: "Coctelería Tropical, Música en Vivo y la Mejor Vibra de Punta Cana",
    subtext: "Disfruta de nuestros mojitos de chinola, tapas caribeñas y noches de DJ frente al mar turquesa.",
    ctaText: "Ver Agenda de Eventos",
    targetUrl: "/vida-nocturna",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },

  // 4. BANCOS
  {
    id: "demo-bank-popular",
    industry: "banks",
    industryLabel: "Banca & Finanzas",
    sponsor: "Banco Popular Dominicano",
    sponsorTag: "El Banco del Turismo Dominicano",
    headline: "Paga tu Próxima Escapada y Acumula el Doble de Millas Popular",
    subtext: "Financiamiento hasta 24 meses sin intereses en hoteles, vuelos de Arajet y paquetes turísticos de República Dominicana.",
    ctaText: "Solicitar Tarjeta",
    targetUrl: "https://popularenlinea.com",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "demo-bank-banreservas",
    industry: "banks",
    industryLabel: "Banca & Finanzas",
    sponsor: "Banreservas",
    sponsorTag: "El Banco de Todos los Dominicanos",
    headline: "Vacaciones Felices Banreservas: Tasas Preferenciales y Cuotas Cómodas",
    subtext: "Respaldo financiero para tus aventuras en las 32 provincias y descuentos exclusivos con tus tarjetas Banreservas.",
    ctaText: "Calcular Cuotas",
    targetUrl: "https://banreservas.com",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
  },

  // 5. BEBIDAS ALCOHÓLICAS
  {
    id: "demo-alcohol-barcelo",
    industry: "alcohol",
    industryLabel: "Destilerías & Ron",
    sponsor: "Ron Barceló Imperial",
    sponsorTag: "Ron Dominicano Premium",
    headline: "El Arte del Ron Dominicano: Crianza en Barricas de Roble",
    subtext: "Visita el Centro Histórico Ron Barceló en San Pedro de Macorís y degusta el ron más exportado de Quisqueya.",
    ctaText: "Reservar Tour en Cava",
    targetUrl: "/bebidas-rd",
    imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-amber-600/20 text-amber-300 border-amber-600/30"
  },
  {
    id: "demo-alcohol-brugal",
    industry: "alcohol",
    industryLabel: "Destilerías & Ron",
    sponsor: "Casa Brugal Puerto Plata",
    sponsorTag: "Pasión Dominicana desde 1888",
    headline: "Brugal 1888: La Excelencia del Doble Envejecimiento",
    subtext: "Descubre cómo maestros roneros crean el blend perfecto en la cuna del ron en la Costa Norte.",
    ctaText: "Ver Experiencias",
    targetUrl: "/bebidas-rd",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-amber-700/20 text-amber-200 border-amber-700/30"
  },

  // 6. RENT A CAR
  {
    id: "demo-rentcar-national",
    industry: "rentcar",
    industryLabel: "Alquiler de Vehículos",
    sponsor: "National Car Rental RD",
    sponsorTag: "Flota Moderna SUV & 4x4",
    headline: "Conquista las 32 Provincias con Kilometraje Ilimitado",
    subtext: "Recogida express en los aeropuertos de Santo Domingo, Punta Cana y Santiago. Seguro total y asistencia en carretera 24/7.",
    ctaText: "Cotizar Auto Ahora",
    targetUrl: "/info/transporte",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  },

  // 7. LÍNEAS AÉREAS
  {
    id: "demo-airline-arajet",
    industry: "airlines",
    industryLabel: "Líneas Aéreas",
    sponsor: "Arajet Airlines",
    sponsorTag: "La Aerolínea Bandera de RD",
    headline: "Vuela Directo al Paraíso desde Más de 23 Destinos de América",
    subtext: "Flota de Boeing 737 MAX de última generación con las tarifas más accesibles y conexiones directas a Santo Domingo y Punta Cana.",
    ctaText: "Buscar Vuelos desde $1 USD + Imp.",
    targetUrl: "https://arajet.com",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30"
  },

  // 8. AEROPUERTOS INTERNACIONALES
  {
    id: "demo-airport-puj",
    industry: "airports",
    industryLabel: "Aeropuertos Internacionales",
    sponsor: "Aeropuerto Internacional de Punta Cana (PUJ)",
    sponsorTag: "Terminal Ecológica & VIP Lounge",
    headline: "Tu Puerta de Entrada al Caribe: Piscina Infinita en Terminal VIP",
    subtext: "Servicio Fast Track, migración biométrica y conexión directa con las principales capitales del mundo.",
    ctaText: "Servicios VIP en Aeropuerto",
    targetUrl: "/como-llegar",
    imageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
  },
  {
    id: "demo-airport-aerodom",
    industry: "airports",
    industryLabel: "Aeropuertos Internacionales",
    sponsor: "AERODOM • VINCI Airports (AILA)",
    sponsorTag: "Aeropuerto Internacional Las Américas",
    headline: "Conectando a la República Dominicana con el Mundo",
    subtext: "Instalaciones modernizadas, tiendas libres de impuestos, zonas gastronómicas y ubicación estratégica a 20 minutos de la capital.",
    ctaText: "Ver Estado de Vuelos",
    targetUrl: "/como-llegar",
    imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-blue-600/20 text-blue-300 border-blue-600/30"
  },

  // 9. GOBIERNO DE LA REPÚBLICA DOMINICANA / MITUR
  {
    id: "demo-gov-mitur",
    industry: "government",
    industryLabel: "Institucional & Gobierno",
    sponsor: "Ministerio de Turismo de la República Dominicana (MITUR)",
    sponsorTag: "República Dominicana Lo Tiene Todo",
    headline: "Cuidemos Nuestros Tesoros Naturales y Seamos Embajadores del País",
    subtext: "Promovemos un turismo sostenible, seguro y hospitalario. Conoce las normativas oficiales y áreas protegidas de Quisqueya.",
    ctaText: "Portal Oficial MITUR",
    targetUrl: "https://mitur.gob.do",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30"
  },

  // 10. CERVEZA PRESIDENTE (SPECIAL DEMO)
  {
    id: "demo-presidente-special",
    industry: "presidente",
    industryLabel: "Orgullo Nacional",
    sponsor: "Cerveza Presidente • Cervecería Nacional Dominicana",
    sponsorTag: "Festival Presidente 2026",
    headline: "Festival Presidente 2026: Venta General Disponible en TuBoleta.com.do 🇩🇴🍺",
    subtext: "El evento musical más esperado del Caribe regresa en diciembre. Vive la fiesta oficial de la Cerveza Presidente.",
    ctaText: "Visitar presidente.com.do",
    targetUrl: "https://www.presidente.com.do/",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&auto=format&fit=crop&q=80",
    badgeColor: "bg-emerald-600/25 text-emerald-300 border-emerald-500/40"
  }
];
