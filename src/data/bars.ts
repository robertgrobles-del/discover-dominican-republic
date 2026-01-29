// Datos estáticos de bares y discotecas de República Dominicana

export interface Bar {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  destinationName: string;
  province: string;
  barType: 'cocktail-bar' | 'lounge' | 'nightclub' | 'beach-bar' | 'rooftop' | 'sports-bar' | 'pub';
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  musicStyle: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  website?: string;
  openingHours: string;
  minimumAge: number;
  dressCode?: string;
  services: string[];
  latitude?: number;
  longitude?: number;
  isFeatured?: boolean;
}

export const bars: Bar[] = [
  // === ZONA COLONIAL ===
  {
    id: 'lulu-tasting-bar',
    slug: 'lulu-tasting-bar',
    name: 'Lulú Tasting Bar',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    barType: 'cocktail-bar',
    shortDescription: 'Bar de autor con cócteles inspirados en la historia dominicana.',
    description: 'Lulú Tasting Bar es un bar de coctelería de autor ubicado en un edificio histórico de la Zona Colonial. Sus bartenders crean cócteles innovadores inspirados en ingredientes y historias dominicanas, en un ambiente íntimo y sofisticado.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Jazz', 'Lounge', 'Latin'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 620,
    address: 'Calle El Conde, Zona Colonial',
    phone: '+1 809-688-5858',
    openingHours: 'Mar-Dom 18:00-02:00',
    minimumAge: 18,
    dressCode: 'Smart Casual',
    services: ['Coctelería de autor', 'Maridaje', 'Eventos privados', 'Música en vivo'],
    latitude: 18.4718,
    longitude: -69.8885,
    isFeatured: true
  },
  {
    id: 'onno-s',
    slug: 'onno-s',
    name: "Onno's",
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    barType: 'lounge',
    shortDescription: 'Lounge bar con terraza y vistas a la Plaza España.',
    description: "Onno's es un elegante lounge bar con una de las mejores terrazas de la Zona Colonial. Con vistas a la Plaza España, ofrece cócteles clásicos, tapas gourmet y un ambiente perfecto para comenzar o terminar la noche.",
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['House', 'Lounge', 'R&B'],
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 890,
    address: 'Plaza España, Zona Colonial',
    phone: '+1 809-686-6669',
    openingHours: 'Lun-Dom 17:00-02:00',
    minimumAge: 18,
    dressCode: 'Smart Casual',
    services: ['Terraza', 'DJ', 'Tapas', 'Happy Hour', 'Hookah'],
    latitude: 18.4750,
    longitude: -69.8838,
    isFeatured: true
  },
  {
    id: 'la-zona-colonial-pub',
    slug: 'la-zona-colonial-pub',
    name: 'The Pub',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    barType: 'pub',
    shortDescription: 'Pub irlandés con cervezas artesanales y deportes en vivo.',
    description: 'The Pub es un auténtico pub irlandés en plena Zona Colonial. Con una amplia selección de cervezas importadas y locales, múltiples pantallas para deportes y un ambiente casual, es el favorito de expatriados y locales.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Rock', 'Pop', 'Alternative'],
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 560,
    address: 'Calle Hostos, Zona Colonial',
    phone: '+1 809-685-2626',
    openingHours: 'Lun-Dom 16:00-02:00',
    minimumAge: 18,
    services: ['Deportes en vivo', 'Cervezas artesanales', 'Comida de pub', 'Dardos', 'Pool'],
    latitude: 18.4725,
    longitude: -69.8870,
    isFeatured: false
  },

  // === PUNTA CANA ===
  {
    id: 'coco-bongo-punta-cana',
    slug: 'coco-bongo-punta-cana',
    name: 'Coco Bongo',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    barType: 'nightclub',
    shortDescription: 'La discoteca más espectacular del Caribe con shows de clase mundial.',
    description: 'Coco Bongo es una experiencia de entretenimiento única que combina discoteca, teatro y circo. Sus shows de acróbatas, artistas y tributos musicales son famosos en todo el Caribe, con efectos especiales dignos de Las Vegas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Pop', 'Reggaeton', 'Electronic', 'Latin'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 3200,
    address: 'Downtown Punta Cana, Bávaro',
    phone: '+1 809-466-1111',
    website: 'https://www.cocobongo.com.do',
    openingHours: 'Jue-Dom 22:00-04:00',
    minimumAge: 18,
    dressCode: 'Casual Elegante',
    services: ['Shows en vivo', 'Barra libre', 'VIP sections', 'Acróbatas', 'Reservaciones'],
    latitude: 18.6745,
    longitude: -68.4528,
    isFeatured: true
  },
  {
    id: 'oro-nightclub',
    slug: 'oro-nightclub',
    name: 'Oro Nightclub',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    barType: 'nightclub',
    shortDescription: 'Discoteca de lujo en Hard Rock Hotel con DJs internacionales.',
    description: 'Oro Nightclub es la discoteca del Hard Rock Hotel & Casino Punta Cana. Con un diseño espectacular, sistema de sonido de última generación y DJs internacionales, es el epicentro de la vida nocturna de lujo.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['EDM', 'House', 'Hip Hop', 'Reggaeton'],
    priceRange: '$$$$',
    rating: 4.5,
    reviewCount: 1850,
    address: 'Hard Rock Hotel, Punta Cana',
    phone: '+1 809-687-0000',
    openingHours: 'Vie-Dom 23:00-05:00',
    minimumAge: 21,
    dressCode: 'Elegante - No shorts, no chanclas',
    services: ['DJs internacionales', 'VIP tables', 'Bottle service', 'LED show'],
    latitude: 18.5285,
    longitude: -68.3685,
    isFeatured: true
  },
  {
    id: 'pearl-beach-club',
    slug: 'pearl-beach-club',
    name: 'Pearl Beach Club',
    destinationId: 'bavaro',
    destinationName: 'Bávaro',
    province: 'La Altagracia',
    barType: 'beach-bar',
    shortDescription: 'Beach club exclusivo con piscina infinity y fiestas al atardecer.',
    description: 'Pearl Beach Club es el beach club más exclusivo de Punta Cana. Con piscina infinity, camas balinesas, y las mejores sunset parties del Caribe, ofrece una experiencia de día y noche incomparable.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Deep House', 'Tropical House', 'Chill'],
    priceRange: '$$$$',
    rating: 4.6,
    reviewCount: 980,
    address: 'Playa Bávaro',
    phone: '+1 809-552-1111',
    openingHours: 'Lun-Dom 10:00-02:00',
    minimumAge: 18,
    dressCode: 'Beach Chic',
    services: ['Piscina infinity', 'Camas balinesas', 'DJ sets', 'Gastronomía', 'Sunset parties'],
    latitude: 18.6820,
    longitude: -68.4485,
    isFeatured: true
  },

  // === CAP CANA ===
  {
    id: 'blue-marlin',
    slug: 'blue-marlin',
    name: 'Blue Marlin',
    destinationId: 'cap-cana',
    destinationName: 'Cap Cana',
    province: 'La Altagracia',
    barType: 'lounge',
    shortDescription: 'Lounge bar elegante en la marina de Cap Cana.',
    description: 'Blue Marlin es el lounge bar más sofisticado de Cap Cana, ubicado en la marina con vistas a los yates de lujo. Perfecto para cócteles al atardecer y noches elegantes.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Lounge', 'Jazz', 'Chill'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 520,
    address: 'Marina Cap Cana',
    phone: '+1 809-469-7575',
    openingHours: 'Mar-Dom 17:00-01:00',
    minimumAge: 18,
    dressCode: 'Smart Casual',
    services: ['Vista a marina', 'Coctelería premium', 'Tapas', 'Música en vivo'],
    latitude: 18.4508,
    longitude: -68.4092,
    isFeatured: true
  },

  // === CABARETE ===
  {
    id: 'lax-ojo',
    slug: 'lax-ojo',
    name: 'LAX Ojo',
    destinationId: 'cabarete',
    destinationName: 'Cabarete',
    province: 'Puerto Plata',
    barType: 'beach-bar',
    shortDescription: 'Beach bar legendario con fiestas épicas en la playa de Cabarete.',
    description: 'LAX Ojo es el beach bar más famoso de Cabarete, conocido por sus fiestas legendarias en la playa. Los kitesurfers y amantes de la vida nocturna se reúnen aquí para bailar bajo las estrellas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Electronic', 'Reggaeton', 'Latin'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 1250,
    address: 'Playa Cabarete',
    phone: '+1 809-571-0461',
    openingHours: 'Lun-Dom 10:00-04:00',
    minimumAge: 18,
    services: ['En la playa', 'Fiestas temáticas', 'DJ sets', 'Tragos especiales'],
    latitude: 19.7582,
    longitude: -70.4168,
    isFeatured: true
  },
  {
    id: 'ojo-bar',
    slug: 'ojo-bar',
    name: 'OJO Bar',
    destinationId: 'cabarete',
    destinationName: 'Cabarete',
    province: 'Puerto Plata',
    barType: 'nightclub',
    shortDescription: 'Discoteca vibrante con la mejor fiesta de la costa norte.',
    description: 'OJO Bar es la discoteca principal de Cabarete, donde la comunidad internacional de kitesurfers y turistas se reúne para bailar. Sus noches temáticas son legendarias.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Reggaeton', 'Latin', 'Electronic', 'Hip Hop'],
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 890,
    address: 'Calle Principal, Cabarete',
    phone: '+1 809-571-0780',
    openingHours: 'Jue-Dom 22:00-05:00',
    minimumAge: 18,
    services: ['Pista de baile', 'DJ residentes', 'Noches temáticas', 'Happy Hour'],
    latitude: 19.7575,
    longitude: -70.4160,
    isFeatured: false
  },

  // === SOSÚA ===
  {
    id: 'classico-sosua',
    slug: 'classico-sosua',
    name: 'Classico',
    destinationId: 'sosua',
    destinationName: 'Sosúa',
    province: 'Puerto Plata',
    barType: 'nightclub',
    shortDescription: 'El club más popular de Sosúa con ambiente diverso.',
    description: 'Classico es el club nocturno más conocido de Sosúa, ofreciendo un ambiente energético con múltiples áreas de baile, música variada y un público internacional diverso.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Merengue', 'Bachata', 'Reggaeton', 'Pop'],
    priceRange: '$$',
    rating: 4.2,
    reviewCount: 680,
    address: 'Pedro Clisante, Sosúa',
    phone: '+1 809-571-2121',
    openingHours: 'Jue-Dom 21:00-04:00',
    minimumAge: 18,
    services: ['Múltiples ambientes', 'Shows', 'VIP area'],
    latitude: 19.7542,
    longitude: -70.5188,
    isFeatured: false
  },

  // === LAS TERRENAS ===
  {
    id: 'el-mosquito',
    slug: 'el-mosquito',
    name: 'El Mosquito Art Bar',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    province: 'Samaná',
    barType: 'cocktail-bar',
    shortDescription: 'Bar artístico bohemio con cócteles creativos y arte local.',
    description: 'El Mosquito Art Bar es un espacio único que combina coctelería artesanal con exposiciones de arte local. Su ambiente bohemio y sus cócteles creativos lo hacen el favorito de la comunidad artística de Las Terrenas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['Jazz', 'Bossa Nova', 'Lounge'],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 380,
    address: 'Pueblo de los Pescadores, Las Terrenas',
    phone: '+1 809-240-6585',
    openingHours: 'Mar-Dom 18:00-01:00',
    minimumAge: 18,
    services: ['Arte local', 'Cócteles artesanales', 'Música en vivo', 'Exposiciones'],
    latitude: 19.3118,
    longitude: -69.5428,
    isFeatured: true
  },

  // === SANTO DOMINGO MODERNO ===
  {
    id: 'sky-bar-jw',
    slug: 'sky-bar-jw',
    name: 'Sky Bar JW',
    destinationId: 'santo-domingo',
    destinationName: 'Santo Domingo',
    province: 'Santo Domingo',
    barType: 'rooftop',
    shortDescription: 'Rooftop bar de lujo con vistas panorámicas al Malecón.',
    description: 'Sky Bar en el JW Marriott ofrece las mejores vistas de Santo Domingo desde su terraza en lo alto. Con coctelería premium, tapas gourmet y atardeceres espectaculares sobre el Malecón.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    musicStyle: ['House', 'Lounge', 'Latin'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 920,
    address: 'JW Marriott, Av. Winston Churchill',
    phone: '+1 809-807-1717',
    openingHours: 'Mar-Dom 17:00-01:00',
    minimumAge: 21,
    dressCode: 'Smart Casual / Elegante',
    services: ['Vista panorámica', 'Coctelería premium', 'DJ', 'Eventos privados'],
    latitude: 18.4632,
    longitude: -69.9235,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getBarBySlug(slug: string): Bar | undefined {
  return bars.find(b => b.slug === slug);
}

export function getBarById(id: string): Bar | undefined {
  return bars.find(b => b.id === id);
}

export function getBarsByDestination(destinationId: string): Bar[] {
  return bars.filter(b => b.destinationId === destinationId);
}

export function getBarsByProvince(province: string): Bar[] {
  return bars.filter(b => b.province.toLowerCase() === province.toLowerCase());
}

export function getBarsByType(barType: string): Bar[] {
  return bars.filter(b => b.barType === barType);
}

export function getFeaturedBars(): Bar[] {
  return bars.filter(b => b.isFeatured);
}

export function getBarsByMusicStyle(musicStyle: string): Bar[] {
  return bars.filter(b => 
    b.musicStyle.some(m => m.toLowerCase().includes(musicStyle.toLowerCase()))
  );
}

export function getNightclubs(): Bar[] {
  return bars.filter(b => b.barType === 'nightclub');
}

export function getBeachBars(): Bar[] {
  return bars.filter(b => b.barType === 'beach-bar');
}

export function searchBars(query: string): Bar[] {
  const lowerQuery = query.toLowerCase();
  return bars.filter(b => 
    b.name.toLowerCase().includes(lowerQuery) ||
    b.destinationName.toLowerCase().includes(lowerQuery) ||
    b.musicStyle.some(m => m.toLowerCase().includes(lowerQuery))
  );
}
