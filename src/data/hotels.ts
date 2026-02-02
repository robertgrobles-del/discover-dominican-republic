// Datos estáticos de hoteles de República Dominicana
//
// === GUÍA PARA CREAR NUEVAS PÁGINAS DE HOTEL ===
//
// 1. AGREGAR DATOS: Añadir el objeto del hotel a este archivo (hotels array)
// 2. CREAR PÁGINA: Crear archivo en src/pages/alojamientos/NombreHotel.tsx
// 3. AGREGAR RUTA: Registrar la ruta en src/App.tsx como /alojamiento/slug
//
// Ejemplo de página de hotel:
// ```tsx
// import { StaticHotelPage } from "@/components/StaticHotelPage";
// import { getHotelBySlug } from "@/data/hotels";
//
// export default function HotelEjemplo() {
//   const hotel = getHotelBySlug('hotel-ejemplo');
//   if (!hotel) return <div>Hotel no encontrado</div>;
//   return <StaticHotelPage hotel={hotel} />;
// }
// ```
//
// === JERARQUÍA ===
// El hotel puede pertenecer a un destino, municipio y/o provincia
// - destinationId: ID del destino donde está (ej: 'punta-cana')
// - provinceId: ID de la provincia (ej: 'la-altagracia')
// - municipalityId: ID del municipio si aplica (opcional)

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  // Jerarquía geográfica
  destinationId: string;       // ID del destino
  destinationName: string;     // Nombre para mostrar
  province: string;            // Nombre de la provincia para mostrar
  provinceId?: string;         // ID de la provincia padre
  municipalityId?: string;     // ID del municipio padre (si aplica)
  category: 'resort' | 'boutique' | 'all-inclusive' | 'business' | 'eco-lodge';
  stars: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  amenities: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$' | '$$$$$';
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  isFeatured?: boolean;
}

export const hotels: Hotel[] = [
  // === PUNTA CANA ===
  {
    id: 'hard-rock-punta-cana',
    slug: 'hard-rock-punta-cana',
    name: 'Hard Rock Hotel & Casino Punta Cana',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    provinceId: 'la-altagracia',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'El resort todo incluido más grande del Caribe con casino y entretenimiento.',
    description: 'Hard Rock Hotel & Casino Punta Cana es un espectacular resort de 1,775 suites que redefine el concepto todo incluido. Con 13 piscinas, el casino más grande del Caribe, un spa de clase mundial y experiencias musicales únicas, ofrece entretenimiento sin igual.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Piscinas infinitas', 'Casino', 'Spa', 'Golf', 'Gimnasio', 'Kids Club', 'Restaurantes gourmet', 'Bares', 'Playa privada', 'Wifi gratuito'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 12500,
    address: 'Boulevard Turístico del Este, Punta Cana',
    phone: '+1 809-687-0000',
    website: 'https://www.hardrockhotelpuntacana.com',
    latitude: 18.5280,
    longitude: -68.3680,
    isFeatured: true
  },
  {
    id: 'barcelo-bavaro-palace',
    slug: 'barcelo-bavaro-palace',
    name: 'Barceló Bávaro Palace',
    destinationId: 'bavaro',
    destinationName: 'Bávaro',
    province: 'La Altagracia',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort icónico frente a la playa más famosa del Caribe.',
    description: 'Barceló Bávaro Palace es uno de los resorts más emblemáticos de Punta Cana, ubicado directamente en la famosa Playa Bávaro. Con arquitectura colonial, múltiples restaurantes y un ambiente familiar de lujo.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Playa privada', 'Múltiples piscinas', 'Spa', 'Teatro', 'Kids Club', 'Deportes acuáticos', '10 restaurantes', 'Discoteca'],
    priceRange: '$$$$',
    rating: 4.5,
    reviewCount: 8900,
    address: 'Playa Bávaro, Punta Cana',
    phone: '+1 809-686-5797',
    website: 'https://www.barcelo.com',
    latitude: 18.6750,
    longitude: -68.4380,
    isFeatured: true
  },
  {
    id: 'secrets-cap-cana',
    slug: 'secrets-cap-cana',
    name: 'Secrets Cap Cana Resort & Spa',
    destinationId: 'cap-cana',
    destinationName: 'Cap Cana',
    province: 'La Altagracia',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort exclusivo solo para adultos en el destino más lujoso del Caribe.',
    description: 'Secrets Cap Cana ofrece una experiencia todo incluido de lujo exclusivamente para adultos. Ubicado en Cap Cana, cuenta con suites elegantes, gastronomía excepcional y acceso a la espectacular Playa Juanillo.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Solo adultos', 'Playa Juanillo', 'Spa de lujo', 'Piscina infinita', '9 restaurantes', 'Room service 24h', 'Butler service'],
    priceRange: '$$$$$',
    rating: 4.8,
    reviewCount: 5600,
    address: 'Cap Cana, Punta Cana',
    phone: '+1 809-469-7444',
    website: 'https://www.secretsresorts.com',
    latitude: 18.4520,
    longitude: -68.4100,
    isFeatured: true
  },
  {
    id: 'excellence-punta-cana',
    slug: 'excellence-punta-cana',
    name: 'Excellence Punta Cana',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort romántico solo adultos con suites de lujo y gastronomía premium.',
    description: 'Excellence Punta Cana es un paraíso romántico exclusivo para adultos. Cada suite ofrece vistas espectaculares, jacuzzi privado y un servicio impecable. Perfecto para lunas de miel y escapadas románticas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Solo adultos', 'Suites con jacuzzi', 'Múltiples restaurantes', 'Spa', 'Piscinas', 'Deportes acuáticos', 'Lounge de cigarros'],
    priceRange: '$$$$$',
    rating: 4.7,
    reviewCount: 4200,
    address: 'Uvero Alto, Punta Cana',
    phone: '+1 809-685-9880',
    website: 'https://www.excellenceresorts.com',
    latitude: 18.7100,
    longitude: -68.5100,
    isFeatured: true
  },
  {
    id: 'breathless-punta-cana',
    slug: 'breathless-punta-cana',
    name: 'Breathless Punta Cana Resort & Spa',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort vibrante solo adultos con fiestas en piscina y ambiente social.',
    description: 'Breathless Punta Cana es el resort perfecto para viajeros jóvenes y sociales. Con un ambiente vibrante, fiestas en piscina, DJs y una experiencia todo incluido de alta energía.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Solo adultos', 'Pool parties', 'DJs residentes', 'Múltiples bares', 'Spa', 'Gimnasio', 'Deportes'],
    priceRange: '$$$$',
    rating: 4.4,
    reviewCount: 3800,
    address: 'Uvero Alto, Punta Cana',
    phone: '+1 809-468-0505',
    website: 'https://www.breathlessresorts.com',
    latitude: 18.7050,
    longitude: -68.5050,
    isFeatured: false
  },

  // === SANTO DOMINGO ===
  {
    id: 'hotel-billini',
    slug: 'hotel-billini',
    name: 'Billini Hotel',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    category: 'boutique',
    stars: 5,
    shortDescription: 'Hotel boutique de lujo en el corazón histórico de Santo Domingo.',
    description: 'Billini Hotel es un exclusivo hotel boutique ubicado en un edificio histórico del siglo XIX en la Zona Colonial. Combina la elegancia colonial con amenidades modernas, ofreciendo una experiencia única en el corazón de la primera ciudad de las Américas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Piscina rooftop', 'Restaurante gourmet', 'Spa', 'Gimnasio', 'Bar de coctelería', 'Wifi gratuito', 'Concierge'],
    priceRange: '$$$$',
    rating: 4.8,
    reviewCount: 1200,
    address: 'Calle Padre Billini, Zona Colonial, Santo Domingo',
    phone: '+1 809-338-4040',
    website: 'https://www.billinihotel.com',
    latitude: 18.4720,
    longitude: -69.8870,
    isFeatured: true
  },
  {
    id: 'jw-marriott-santo-domingo',
    slug: 'jw-marriott-santo-domingo',
    name: 'JW Marriott Hotel Santo Domingo',
    destinationId: 'santo-domingo',
    destinationName: 'Santo Domingo',
    province: 'Santo Domingo',
    category: 'business',
    stars: 5,
    shortDescription: 'Hotel de lujo con vistas al Malecón y servicio de clase mundial.',
    description: 'El JW Marriott Santo Domingo es el hotel de negocios más prestigioso de la capital. Ubicado en el corazón del distrito financiero con vistas al Malecón, ofrece habitaciones elegantes, múltiples restaurantes y instalaciones de primera clase.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Vista al mar', 'Spa de lujo', 'Piscina infinita', 'Centro de negocios', 'Gimnasio', 'Múltiples restaurantes', 'Salones de eventos'],
    priceRange: '$$$$',
    rating: 4.6,
    reviewCount: 2100,
    address: 'Av. Winston Churchill, Santo Domingo',
    phone: '+1 809-807-1717',
    website: 'https://www.marriott.com',
    latitude: 18.4630,
    longitude: -69.9230,
    isFeatured: true
  },
  {
    id: 'hodelpa-nicolas-de-ovando',
    slug: 'hodelpa-nicolas-de-ovando',
    name: 'Hodelpa Nicolas de Ovando',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    category: 'boutique',
    stars: 5,
    shortDescription: 'Palacio del siglo XVI convertido en hotel de lujo frente al río Ozama.',
    description: 'El Hodelpa Nicolas de Ovando ocupa la antigua residencia del primer gobernador de las Américas, Nicolás de Ovando. Este palacio del siglo XVI ha sido meticulosamente restaurado, combinando historia y lujo contemporáneo con vistas al río Ozama.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Edificio histórico', 'Piscina', 'Restaurante', 'Spa', 'Vista al río', 'Tours históricos', 'Concierge'],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 980,
    address: 'Calle Las Damas, Zona Colonial, Santo Domingo',
    phone: '+1 809-685-9955',
    website: 'https://www.hodelpa.com',
    latitude: 18.4745,
    longitude: -69.8810,
    isFeatured: true
  },

  // === SAMANÁ ===
  {
    id: 'bahia-principe-samana',
    slug: 'bahia-principe-samana',
    name: 'Bahia Principe Grand El Portillo',
    destinationId: 'samana',
    destinationName: 'Samaná',
    province: 'Samaná',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort todo incluido en la bahía de Samaná con playa privada.',
    description: 'Bahia Principe Grand El Portillo es un resort de lujo ubicado en la hermosa Bahía de Samaná. Con playa privada de arena dorada, múltiples piscinas y acceso privilegiado para el avistamiento de ballenas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Playa privada', 'Múltiples piscinas', 'Spa', 'Tours de ballenas', 'Restaurantes temáticos', 'Deportes acuáticos', 'Kids Club'],
    priceRange: '$$$',
    rating: 4.4,
    reviewCount: 3200,
    address: 'El Portillo, Samaná',
    phone: '+1 809-538-3232',
    website: 'https://www.bahia-principe.com',
    latitude: 19.2650,
    longitude: -69.4320,
    isFeatured: true
  },
  {
    id: 'sublime-samana',
    slug: 'sublime-samana',
    name: 'Sublime Samaná',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    province: 'Samaná',
    category: 'boutique',
    stars: 5,
    shortDescription: 'Hotel boutique de lujo con villas privadas y diseño contemporáneo.',
    description: 'Sublime Samaná es un exclusivo hotel boutique que ofrece villas y suites de diseño contemporáneo inmersas en la naturaleza. Con su playa privada y spa de clase mundial, es el refugio perfecto para viajeros exigentes.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Villas privadas', 'Piscinas infinity', 'Spa', 'Restaurante gourmet', 'Playa privada', 'Yoga', 'Tours personalizados'],
    priceRange: '$$$$$',
    rating: 4.9,
    reviewCount: 450,
    address: 'Las Terrenas, Samaná',
    phone: '+1 809-240-5555',
    website: 'https://www.sublimesamana.com',
    latitude: 19.3050,
    longitude: -69.5320,
    isFeatured: true
  },

  // === LA ROMANA ===
  {
    id: 'casa-de-campo',
    slug: 'casa-de-campo',
    name: 'Casa de Campo Resort & Villas',
    destinationId: 'la-romana',
    destinationName: 'La Romana',
    province: 'La Romana',
    category: 'resort',
    stars: 5,
    shortDescription: 'El resort más exclusivo del Caribe con golf de campeonato y Altos de Chavón.',
    description: 'Casa de Campo es el resort más prestigioso del Caribe, con 7,000 acres de lujo absoluto. Hogar de Teeth of the Dog (uno de los mejores campos de golf del mundo), la marina más grande del Caribe, y Altos de Chavón, una réplica de una villa mediterránea del siglo XVI.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['3 campos de golf', 'Marina', 'Altos de Chavón', 'Polo', 'Tiro al plato', 'Spa', 'Múltiples restaurantes', 'Playa Minitas'],
    priceRange: '$$$$$',
    rating: 4.8,
    reviewCount: 2800,
    address: 'La Romana',
    phone: '+1 809-523-3333',
    website: 'https://www.casadecampo.com.do',
    latitude: 18.4150,
    longitude: -68.9120,
    isFeatured: true
  },

  // === PUERTO PLATA ===
  {
    id: 'casa-colonial',
    slug: 'casa-colonial',
    name: 'Casa Colonial Beach & Spa',
    destinationId: 'puerto-plata',
    destinationName: 'Puerto Plata',
    province: 'Puerto Plata',
    category: 'boutique',
    stars: 5,
    shortDescription: 'Hotel boutique elegante con arquitectura colonial y spa de clase mundial.',
    description: 'Casa Colonial Beach & Spa es un hotel boutique que combina la elegancia colonial con el lujo moderno. Su spa ha sido reconocido entre los mejores del Caribe, y su ubicación frente a la playa ofrece una experiencia íntima y refinada.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Spa premiado', 'Playa privada', 'Restaurante gourmet', 'Piscina infinity', 'Golf cercano', 'Concierge'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 890,
    address: 'Playa Dorada, Puerto Plata',
    phone: '+1 809-320-3232',
    website: 'https://www.casacolonialhotel.com',
    latitude: 19.7780,
    longitude: -70.6320,
    isFeatured: true
  },
  {
    id: 'iberostar-costa-dorada',
    slug: 'iberostar-costa-dorada',
    name: 'Iberostar Costa Dorada',
    destinationId: 'puerto-plata',
    destinationName: 'Puerto Plata',
    province: 'Puerto Plata',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort todo incluido familiar con playa dorada y entretenimiento.',
    description: 'Iberostar Costa Dorada es un resort todo incluido de 5 estrellas ideal para familias. Ubicado en la famosa Playa Dorada, ofrece entretenimiento para todas las edades, múltiples piscinas y gastronomía internacional.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Playa Dorada', 'Múltiples piscinas', 'Star Camp (kids)', 'Spa', 'Restaurantes temáticos', 'Shows nocturnos', 'Deportes'],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 4500,
    address: 'Playa Dorada, Puerto Plata',
    phone: '+1 809-320-1000',
    website: 'https://www.iberostar.com',
    latitude: 19.7750,
    longitude: -70.6350,
    isFeatured: false
  },

  // === JARABACOA ===
  {
    id: 'aroma-de-la-montana',
    slug: 'aroma-de-la-montana',
    name: 'Aroma de la Montaña',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    category: 'eco-lodge',
    stars: 4,
    shortDescription: 'Eco-lodge de montaña con vistas espectaculares y aventura.',
    description: 'Aroma de la Montaña es un acogedor eco-lodge ubicado en las montañas de Jarabacoa. Ofrece cabañas rústicas con vistas panorámicas al valle, experiencias de café orgánico y acceso a actividades de aventura como rafting y senderismo.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Cabañas privadas', 'Restaurante orgánico', 'Tour de café', 'Piscina', 'Senderismo', 'Vistas al valle'],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 320,
    address: 'Jarabacoa, La Vega',
    phone: '+1 809-574-2882',
    latitude: 19.1180,
    longitude: -70.6350,
    isFeatured: true
  },
  {
    id: 'jarabacoa-river-club',
    slug: 'jarabacoa-river-club',
    name: 'Jarabacoa River Club',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    category: 'resort',
    stars: 4,
    shortDescription: 'Resort familiar junto al río con actividades de aventura.',
    description: 'Jarabacoa River Club es el resort más completo de la zona de montaña. Ubicado junto al río, ofrece cabañas confortables, restaurantes, piscinas y organiza las mejores excursiones de aventura de la región.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Junto al río', 'Piscinas', 'Restaurante', 'Rafting', 'Canyoning', 'Senderismo', 'Cabalgatas'],
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 580,
    address: 'La Confluencia, Jarabacoa',
    phone: '+1 809-574-4646',
    website: 'https://www.jarabacoariverclub.com',
    latitude: 19.1250,
    longitude: -70.6280,
    isFeatured: false
  },

  // === BAYAHÍBE ===
  {
    id: 'dreams-dominicus',
    slug: 'dreams-dominicus',
    name: 'Dreams Dominicus La Romana',
    destinationId: 'bayahibe',
    destinationName: 'Bayahíbe',
    province: 'La Romana',
    category: 'all-inclusive',
    stars: 5,
    shortDescription: 'Resort todo incluido frente a las aguas cristalinas de Dominicus.',
    description: 'Dreams Dominicus La Romana es un resort todo incluido ubicado en la espectacular Playa Dominicus. Ofrece acceso privilegiado a los mejores sitios de buceo del Caribe, Isla Saona e Isla Catalina.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    amenities: ['Playa Dominicus', 'Centro de buceo', 'Múltiples piscinas', 'Spa', 'Kids Club', 'Restaurantes', 'Shows'],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 3600,
    address: 'Playa Dominicus, Bayahíbe',
    phone: '+1 809-221-8880',
    website: 'https://www.dreamsresorts.com',
    latitude: 18.3620,
    longitude: -68.8280,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotels.find(h => h.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
  return hotels.find(h => h.id === id);
}

export function getHotelsByDestination(destinationId: string): Hotel[] {
  return hotels.filter(h => h.destinationId === destinationId);
}

export function getHotelsByProvince(province: string): Hotel[] {
  return hotels.filter(h => h.province.toLowerCase() === province.toLowerCase());
}

export function getHotelsByCategory(category: string): Hotel[] {
  return hotels.filter(h => h.category === category);
}

export function getFeaturedHotels(): Hotel[] {
  return hotels.filter(h => h.isFeatured);
}

export function getHotelsByStars(minStars: number): Hotel[] {
  return hotels.filter(h => h.stars >= minStars);
}

export function getHotelsByPriceRange(priceRange: string): Hotel[] {
  return hotels.filter(h => h.priceRange === priceRange);
}

export function searchHotels(query: string): Hotel[] {
  const lowerQuery = query.toLowerCase();
  return hotels.filter(h => 
    h.name.toLowerCase().includes(lowerQuery) ||
    h.destinationName.toLowerCase().includes(lowerQuery) ||
    h.province.toLowerCase().includes(lowerQuery)
  );
}
