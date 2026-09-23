export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location: string;
  niche: "Hotelería & Lujo" | "Aventura & Ecoturismo" | "Gastronomía" | "Cultura & Historia" | "Lifestyle & Playas";
  followersCount: string;
  engagementRate: string;
  rating: number;
  completedStays: number;
  badge: "Top Creator" | "Verificado" | "Embajador";
  bio: string;
  platforms: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export interface SponsoredOpportunity {
  id: string;
  hotelName: string;
  destination: string; // ej: "Puerto Plata (POP)", "Samaná", "Punta Cana"
  coverImage: string;
  stayDetails: string; // ej: "3 Días / 2 Noches Todo Incluido"
  deliverablesRequired: string[]; // ej: ["1 Reel en Instagram", "3 Stories diarias", "1 Artículo en Blog"]
  perks: string[]; // ej: ["Hospedaje All-Inclusive", "Transporte / Vuelo local", "$300 USD Fee de Producción"]
  status: "Abierta" | "Asignada" | "Completada";
  assignedCreatorId?: string;
  deadline: string;
}

export interface AffiliateOffer {
  id: string;
  title: string;
  partner: string;
  category: "Hoteles" | "Tours" | "Vuelos" | "Seguros de Viaje";
  commissionRate: string;
  epc: string; // Earnings per click
  affiliateUrl: string;
}

export const creatorsPool: Creator[] = [
  {
    id: "c1",
    name: "Carlos Medina",
    handle: "@carlosviajero",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Santo Domingo, RD",
    niche: "Aventura & Ecoturismo",
    followersCount: "145K",
    engagementRate: "5.8%",
    rating: 4.9,
    completedStays: 12,
    badge: "Top Creator",
    bio: "Creador de contenido visual enfocado en senderismo, cascadas secretas y turismo comunitario en Quisqueya.",
    platforms: { instagram: "@carlosviajero", tiktok: "@carlos.rd", youtube: "CarlosMedinaRD" }
  },
  {
    id: "c2",
    name: "Gabriela Santana",
    handle: "@gabi.luxurytravel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    location: "Santiago / Puerto Plata",
    niche: "Hotelería & Lujo",
    followersCount: "280K",
    engagementRate: "6.2%",
    rating: 5.0,
    completedStays: 18,
    badge: "Top Creator",
    bio: "Especialista en resorts 5 estrellas, experiencias gastronómicas de autor y spas en la Costa Norte y Este.",
    platforms: { instagram: "@gabi.luxurytravel", tiktok: "@gabriela_rd" }
  },
  {
    id: "c3",
    name: "Marcos & Elena",
    handle: "@dosrumboard",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    location: "Las Terrenas, Samaná",
    niche: "Lifestyle & Playas",
    followersCount: "92K",
    engagementRate: "4.9%",
    rating: 4.8,
    completedStays: 9,
    badge: "Verificado",
    bio: "Pareja viajera documentando las mejores playas, atardeceres y deportes acuáticos en República Dominicana.",
    platforms: { instagram: "@dosrumboard", youtube: "DosRumboRD" }
  },
  {
    id: "c4",
    name: "Chef Domingo Pérez",
    handle: "@saboresdominicanos",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "Santo Domingo",
    niche: "Gastronomía",
    followersCount: "115K",
    engagementRate: "7.1%",
    rating: 4.9,
    completedStays: 14,
    badge: "Embajador",
    bio: "Cocinero profesional y divulgador de la gastronomía criolla y rutas culinarias en todo el país.",
    platforms: { instagram: "@saboresdominicanos", tiktok: "@domingochef" }
  },
  {
    id: "c5",
    name: "Valerie Gómez",
    handle: "@valerierd",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    location: "Punta Cana",
    niche: "Cultura & Historia",
    followersCount: "68K",
    engagementRate: "5.2%",
    rating: 4.7,
    completedStays: 7,
    badge: "Verificado",
    bio: "Historiadora y fotógrafa documentando el patrimonio colonial, festividades folclóricas y arquitectura.",
    platforms: { instagram: "@valerierd" }
  }
];

export const initialSponsoredOpportunities: SponsoredOpportunity[] = [
  {
    id: "opp1",
    hotelName: "Grand Paradise Playa Dorada",
    destination: "Puerto Plata (POP)",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    stayDetails: "3 Días / 2 Noches Todo Incluido en Suite Frente al Mar",
    deliverablesRequired: [
      "1 Reel / TikTok de alta calidad mostrando amenidades y playa",
      "3 Stories diarias etiquetando al hotel y portal",
      "1 Artículo reseña en el Blog de Experiencias"
    ],
    perks: [
      "Estadía 100% Gratis Todo Incluido para 2 personas",
      "Pase VIP para deportes acuáticos y cena en restaurante temático",
      "$250 USD compensación por producción de contenido"
    ],
    status: "Abierta",
    deadline: "2026-10-15"
  },
  {
    id: "opp2",
    hotelName: "Viva Wyndham V Samaná (Adults Only)",
    destination: "Las Terrenas, Samaná",
    coverImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    stayDetails: "4 Días / 3 Noches Todo Incluido Ecoturístico",
    deliverablesRequired: [
      "2 Reels mostrando excursión a cascada + gastronomía del resort",
      "Cobertura completa en Stories",
      "Sesión de 10 fotografías de alta resolución para uso del hotel"
    ],
    perks: [
      "Hospedaje All-Inclusive con Spa incluido",
      "Transporte privado ida y vuelta",
      "$400 USD compensación directa"
    ],
    status: "Abierta",
    deadline: "2026-10-20"
  },
  {
    id: "opp3",
    hotelName: "Boutique Hotel Casas del XVI",
    destination: "Ciudad Colonial, Santo Domingo",
    coverImage: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=800&auto=format&fit=crop&q=80",
    stayDetails: "Weekend Histórico & Cena Degustación de 5 Tiempos",
    deliverablesRequired: [
      "1 Reel estético sobre la arquitectura del siglo XVI",
      "1 Blog post en sección de Experiencias",
      "Mención de enlace de afiliado de reserva"
    ],
    perks: [
      "Estadía de Lujo en Casa Colonial privada",
      "Desayuno gourmet a la carta",
      "$300 USD compensación"
    ],
    status: "Asignada",
    assignedCreatorId: "c2",
    deadline: "2026-09-30"
  }
];

export const affiliateOffers: AffiliateOffer[] = [
  {
    id: "aff1",
    title: "Reserva de Hoteles en Puerto Plata & Samaná",
    partner: "Descubre RD Booking Network",
    category: "Hoteles",
    commissionRate: "8.5% por reserva completada",
    epc: "$1.45 USD",
    affiliateUrl: "https://descubrerd.com/r/hoteles-pop?ref="
  },
  {
    id: "aff2",
    title: "Excursiones & Tours de Aventura (Buggies, Ballenas, Saltos)",
    partner: "Quisqueya Adventures",
    category: "Tours",
    commissionRate: "12% del ticket",
    epc: "$2.10 USD",
    affiliateUrl: "https://descubrerd.com/r/tours?ref="
  },
  {
    id: "aff3",
    title: "Seguro de Asistencia al Viajero Internacional",
    partner: "Assist Card / Seguros RD",
    category: "Seguros de Viaje",
    commissionRate: "$15 USD fijos por póliza",
    epc: "$0.95 USD",
    affiliateUrl: "https://descubrerd.com/r/seguro-viaje?ref="
  }
];
