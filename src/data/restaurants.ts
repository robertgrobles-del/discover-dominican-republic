// Datos estáticos de restaurantes de República Dominicana

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  destinationName: string;
  province: string;
  cuisineType: string[];
  category: 'fine-dining' | 'casual' | 'local' | 'seafood' | 'international' | 'fusion';
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  signatureDishes: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours: string;
  services: string[];
  latitude?: number;
  longitude?: number;
  isFeatured?: boolean;
}

export const restaurants: Restaurant[] = [
  // === ZONA COLONIAL ===
  {
    id: 'pat-e-palo',
    slug: 'pat-e-palo',
    name: "Pat'e Palo European Brasserie",
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    cuisineType: ['Europea', 'Mediterránea'],
    category: 'fine-dining',
    shortDescription: 'Brasserie europea en una casa colonial del siglo XVI.',
    description: "Pat'e Palo es uno de los restaurantes más emblemáticos de la Zona Colonial. Ubicado en una casona del siglo XVI con vista a la Plaza España, ofrece cocina europea de autor con toques caribeños en un ambiente histórico y romántico.",
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Pulpo a la gallega', 'Risotto de mariscos', 'Rack de cordero', 'Tiramisú de la casa'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 1850,
    address: 'Plaza España, Calle La Atarazana, Zona Colonial',
    phone: '+1 809-687-8089',
    openingHours: 'Lun-Dom 12:00-23:00',
    services: ['Reservaciones', 'Terraza', 'Bar', 'WiFi', 'Eventos privados'],
    latitude: 18.4752,
    longitude: -69.8835,
    isFeatured: true
  },
  {
    id: 'la-cassina',
    slug: 'la-cassina',
    name: 'La Cassina',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    cuisineType: ['Italiana', 'Mediterránea'],
    category: 'fine-dining',
    shortDescription: 'Auténtica cocina italiana en el corazón colonial.',
    description: 'La Cassina ofrece una experiencia gastronómica italiana auténtica en un hermoso patio colonial. Sus pastas frescas hechas en casa y sus pizzas de horno de leña son las favoritas de locales y visitantes.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Pasta fresca artesanal', 'Pizza napolitana', 'Ossobuco', 'Cannoli siciliano'],
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 1420,
    address: 'Calle Arzobispo Meriño, Zona Colonial',
    phone: '+1 809-685-7171',
    openingHours: 'Mar-Dom 12:00-22:30',
    services: ['Reservaciones', 'Patio interior', 'Bar de vinos', 'Delivery'],
    latitude: 18.4738,
    longitude: -69.8862,
    isFeatured: true
  },
  {
    id: 'meson-de-bari',
    slug: 'meson-de-bari',
    name: 'Mesón de Bari',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    cuisineType: ['Dominicana', 'Criolla'],
    category: 'local',
    shortDescription: 'Cocina criolla dominicana en ambiente tradicional.',
    description: 'Mesón de Bari es el lugar ideal para probar la auténtica cocina criolla dominicana. Fundado hace décadas, sirve platos tradicionales como sancocho, mofongo y la famosa Bandera Dominicana en un ambiente acogedor.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['La Bandera Dominicana', 'Sancocho de 7 carnes', 'Mofongo relleno', 'Habichuelas con dulce'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 980,
    address: 'Calle Hostos, Zona Colonial',
    phone: '+1 809-687-4091',
    openingHours: 'Lun-Dom 11:00-23:00',
    services: ['Ambiente familiar', 'Música en vivo', 'Grupos grandes'],
    latitude: 18.4722,
    longitude: -69.8875,
    isFeatured: true
  },
  {
    id: 'buche-perico',
    slug: 'buche-perico',
    name: 'Buche Perico',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    cuisineType: ['Dominicana', 'Contemporánea'],
    category: 'fusion',
    shortDescription: 'Gastronomía dominicana contemporánea con ingredientes locales.',
    description: 'Buche Perico reinventa la cocina dominicana con técnicas modernas y presentaciones artísticas. Usando ingredientes locales de pequeños productores, crea platos que honran la tradición con un toque vanguardista.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Ceviche de lambí', 'Chivo braseado', 'Locrio de camarones', 'Flan de coco'],
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 620,
    address: 'Calle El Conde, Zona Colonial',
    phone: '+1 809-333-4455',
    openingHours: 'Mar-Dom 18:00-23:00',
    services: ['Reservaciones', 'Bar de coctelería', 'Menú degustación'],
    latitude: 18.4715,
    longitude: -69.8890,
    isFeatured: true
  },

  // === PUNTA CANA ===
  {
    id: 'jellyfish-punta-cana',
    slug: 'jellyfish-punta-cana',
    name: 'Jellyfish Restaurant',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    cuisineType: ['Mediterránea', 'Mariscos'],
    category: 'fine-dining',
    shortDescription: 'Restaurante icónico con los pies en la arena de Playa Bávaro.',
    description: 'Jellyfish es el restaurante de playa más famoso de Punta Cana. Con mesas directamente en la arena y vistas al mar turquesa, ofrece cocina mediterránea de mariscos en un ambiente mágico.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Langosta thermidor', 'Paella de mariscos', 'Ceviche tropical', 'Carpaccio de pulpo'],
    priceRange: '$$$$',
    rating: 4.6,
    reviewCount: 2340,
    address: 'Playa Bávaro, Punta Cana',
    phone: '+1 809-455-1748',
    openingHours: 'Lun-Dom 11:00-22:00',
    services: ['Frente al mar', 'Camas de playa', 'Bar', 'Eventos', 'Atardecer'],
    latitude: 18.6752,
    longitude: -68.4438,
    isFeatured: true
  },
  {
    id: 'la-yola-cap-cana',
    slug: 'la-yola-cap-cana',
    name: 'La Yola',
    destinationId: 'cap-cana',
    destinationName: 'Cap Cana',
    province: 'La Altagracia',
    cuisineType: ['Mariscos', 'Mediterránea'],
    category: 'fine-dining',
    shortDescription: 'Restaurante de mariscos con vista a la marina de Cap Cana.',
    description: 'La Yola es un elegante restaurante de mariscos ubicado en la Marina de Cap Cana. Con vistas espectaculares a los yates y el mar, ofrece los mariscos más frescos del Caribe en un ambiente sofisticado.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Torre de mariscos', 'Langosta entera', 'Arroz con mariscos', 'Pulpo a la brasa'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 1560,
    address: 'Marina Cap Cana',
    phone: '+1 809-469-7414',
    openingHours: 'Lun-Dom 12:00-23:00',
    services: ['Vista a marina', 'Terraza', 'Bar', 'Reservaciones', 'Valet parking'],
    latitude: 18.4505,
    longitude: -68.4088,
    isFeatured: true
  },
  {
    id: 'captain-cook',
    slug: 'captain-cook',
    name: 'Captain Cook',
    destinationId: 'bavaro',
    destinationName: 'Bávaro',
    province: 'La Altagracia',
    cuisineType: ['Mariscos', 'Caribeña'],
    category: 'seafood',
    shortDescription: 'Mariscos frescos en ambiente relajado de playa.',
    description: 'Captain Cook es un restaurante de mariscos con ambiente casual y relajado. Ubicado cerca de la playa, ofrece pescado fresco del día y mariscos preparados al estilo caribeño a precios razonables.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Pescado frito entero', 'Langosta al ajillo', 'Camarones al coco', 'Ceviche de pescado'],
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 1120,
    address: 'Los Corales, Bávaro',
    phone: '+1 809-552-0645',
    openingHours: 'Lun-Dom 11:00-22:00',
    services: ['Ambiente casual', 'Mariscos frescos', 'Grupos'],
    latitude: 18.6820,
    longitude: -68.4520,
    isFeatured: false
  },

  // === LAS TERRENAS ===
  {
    id: 'el-lugar',
    slug: 'el-lugar',
    name: 'El Lugar',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    province: 'Samaná',
    cuisineType: ['Francesa', 'Caribeña', 'Fusión'],
    category: 'fusion',
    shortDescription: 'Fusión franco-caribeña en ambiente bohemio.',
    description: 'El Lugar es un restaurante bohemio que fusiona la cocina francesa con ingredientes caribeños. Su chef francés crea platos únicos en un ambiente artístico y relajado, favorito de la comunidad expatriada.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Tartare de atún', 'Pato confitado', 'Risotto de mariscos', 'Crème brûlée tropical'],
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 680,
    address: 'Pueblo de los Pescadores, Las Terrenas',
    phone: '+1 809-240-6375',
    openingHours: 'Mar-Dom 18:00-23:00',
    services: ['Reservaciones', 'Vinos franceses', 'Ambiente íntimo'],
    latitude: 19.3115,
    longitude: -69.5425,
    isFeatured: true
  },
  {
    id: 'le-tre-caravelle',
    slug: 'le-tre-caravelle',
    name: 'Le Tre Caravelle',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    province: 'Samaná',
    cuisineType: ['Italiana'],
    category: 'casual',
    shortDescription: 'Auténtica trattoria italiana con pastas frescas.',
    description: 'Le Tre Caravelle es una encantadora trattoria italiana que sirve pastas frescas hechas a mano y pizzas del horno de leña. Con dueños italianos, ofrece una experiencia gastronómica auténtica.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Pasta fresca del día', 'Pizza margherita', 'Lasaña casera', 'Tiramisú'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 520,
    address: 'Centro de Las Terrenas',
    phone: '+1 809-240-6180',
    openingHours: 'Lun-Dom 12:00-22:30',
    services: ['Familiar', 'Pizza para llevar', 'Vinos italianos'],
    latitude: 19.3108,
    longitude: -69.5410,
    isFeatured: false
  },

  // === PUERTO PLATA ===
  {
    id: 'lucia',
    slug: 'lucia',
    name: 'Lucía',
    destinationId: 'puerto-plata',
    destinationName: 'Puerto Plata',
    province: 'Puerto Plata',
    cuisineType: ['Internacional', 'Fusión'],
    category: 'fine-dining',
    shortDescription: 'Alta cocina con vistas al océano Atlántico.',
    description: 'Lucía es el restaurante más elegante de Puerto Plata, ubicado en Casa Colonial Hotel. Con vistas panorámicas al océano, ofrece una experiencia gastronómica refinada con ingredientes locales e internacionales.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Atún sellado', 'Filete de res premium', 'Langosta local', 'Dessert degustación'],
    priceRange: '$$$$',
    rating: 4.8,
    reviewCount: 420,
    address: 'Casa Colonial Hotel, Playa Dorada',
    phone: '+1 809-320-3232',
    openingHours: 'Mar-Dom 18:00-22:30',
    services: ['Vista al mar', 'Reservaciones', 'Dress code', 'Carta de vinos'],
    latitude: 19.7778,
    longitude: -70.6325,
    isFeatured: true
  },
  {
    id: 'mares',
    slug: 'mares',
    name: 'Mares Restaurant & Lounge',
    destinationId: 'sosua',
    destinationName: 'Sosúa',
    province: 'Puerto Plata',
    cuisineType: ['Mariscos', 'Caribeña'],
    category: 'seafood',
    shortDescription: 'Mariscos frente a la bahía de Sosúa.',
    description: 'Mares ofrece los mejores mariscos de la costa norte con vistas espectaculares a la bahía de Sosúa. Su ambiente relajado y su menú variado lo convierten en el favorito de locales y turistas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Mariscada especial', 'Pescado en salsa de coco', 'Camarones al ajillo', 'Mojitos'],
    priceRange: '$$$',
    rating: 4.5,
    reviewCount: 680,
    address: 'Calle Dr. Rosen, Sosúa',
    phone: '+1 809-571-2725',
    openingHours: 'Lun-Dom 11:00-23:00',
    services: ['Vista al mar', 'Happy Hour', 'Música en vivo', 'Delivery'],
    latitude: 19.7545,
    longitude: -70.5192,
    isFeatured: false
  },

  // === CABARETE ===
  {
    id: 'bliss',
    slug: 'bliss',
    name: 'Bliss Restaurant',
    destinationId: 'cabarete',
    destinationName: 'Cabarete',
    province: 'Puerto Plata',
    cuisineType: ['Saludable', 'Fusión'],
    category: 'casual',
    shortDescription: 'Cocina saludable y bowls para la comunidad surfista.',
    description: 'Bliss es el restaurante favorito de la comunidad surfista y fitness de Cabarete. Especializado en bowls nutritivos, smoothies y cocina saludable sin sacrificar el sabor.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Acai bowls', 'Buddha bowls', 'Smoothies', 'Wraps saludables'],
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 890,
    address: 'Calle Principal, Cabarete',
    phone: '+1 809-571-0614',
    openingHours: 'Lun-Dom 07:00-22:00',
    services: ['Desayuno', 'Opciones veganas', 'WiFi', 'Para llevar'],
    latitude: 19.7578,
    longitude: -70.4165,
    isFeatured: true
  },

  // === JARABACOA ===
  {
    id: 'aroma-jarabacoa',
    slug: 'aroma-jarabacoa',
    name: 'Aroma de la Montaña Restaurant',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    cuisineType: ['Dominicana', 'De montaña'],
    category: 'local',
    shortDescription: 'Cocina de montaña con ingredientes orgánicos locales.',
    description: 'El restaurante de Aroma de la Montaña ofrece cocina criolla de montaña con ingredientes cultivados en su propia finca. Las vistas al valle y el café orgánico complementan una experiencia única.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Chivo al horno', 'Trucha de montaña', 'Sancocho cibaeño', 'Café orgánico'],
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 340,
    address: 'Jarabacoa, La Vega',
    phone: '+1 809-574-2882',
    openingHours: 'Lun-Dom 08:00-21:00',
    services: ['Vista panorámica', 'Tour de café', 'Productos orgánicos'],
    latitude: 19.1178,
    longitude: -70.6352,
    isFeatured: true
  },

  // === LA ROMANA ===
  {
    id: 'la-piazzetta',
    slug: 'la-piazzetta',
    name: 'La Piazzetta',
    destinationId: 'la-romana',
    destinationName: 'La Romana',
    province: 'La Romana',
    cuisineType: ['Italiana'],
    category: 'fine-dining',
    shortDescription: 'Restaurante italiano en el escenario mágico de Altos de Chavón.',
    description: 'La Piazzetta está ubicado en la plaza central de Altos de Chavón, ofreciendo cocina italiana refinada en uno de los escenarios más románticos del Caribe. La arquitectura mediterránea del siglo XVI completa la experiencia.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    signatureDishes: ['Carpaccio', 'Pasta truffle', 'Ossobuco', 'Panna cotta'],
    priceRange: '$$$$',
    rating: 4.7,
    reviewCount: 920,
    address: 'Altos de Chavón, Casa de Campo',
    phone: '+1 809-523-3333',
    openingHours: 'Lun-Dom 18:00-23:00',
    services: ['Reservaciones', 'Ambiente romántico', 'Carta de vinos', 'Vistas'],
    latitude: 18.4320,
    longitude: -68.9350,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find(r => r.slug === slug);
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.find(r => r.id === id);
}

export function getRestaurantsByDestination(destinationId: string): Restaurant[] {
  return restaurants.filter(r => r.destinationId === destinationId);
}

export function getRestaurantsByProvince(province: string): Restaurant[] {
  return restaurants.filter(r => r.province.toLowerCase() === province.toLowerCase());
}

export function getRestaurantsByCategory(category: string): Restaurant[] {
  return restaurants.filter(r => r.category === category);
}

export function getRestaurantsByCuisine(cuisineType: string): Restaurant[] {
  return restaurants.filter(r => 
    r.cuisineType.some(c => c.toLowerCase().includes(cuisineType.toLowerCase()))
  );
}

export function getFeaturedRestaurants(): Restaurant[] {
  return restaurants.filter(r => r.isFeatured);
}

export function getRestaurantsByPriceRange(priceRange: string): Restaurant[] {
  return restaurants.filter(r => r.priceRange === priceRange);
}

export function searchRestaurants(query: string): Restaurant[] {
  const lowerQuery = query.toLowerCase();
  return restaurants.filter(r => 
    r.name.toLowerCase().includes(lowerQuery) ||
    r.destinationName.toLowerCase().includes(lowerQuery) ||
    r.cuisineType.some(c => c.toLowerCase().includes(lowerQuery))
  );
}
